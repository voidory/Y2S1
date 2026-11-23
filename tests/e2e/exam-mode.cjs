/*
 * Exam mode on the study screen: the toggle persists, hints are hidden until the answer is submitted, cards that only offer
 * options are never served, and a pace line appears after grading.   node tests/e2e/exam-mode.cjs  (DEXIE_FILE as in the other suites)
 */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..');
const dexie = process.env.DEXIE_FILE ? fs.readFileSync(process.env.DEXIE_FILE, 'utf8') : null;
const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': f.endsWith('.json') ? 'application/json' : f.endsWith('.html') ? 'text/html' : 'text/plain' });
  fs.createReadStream(f).pipe(r);
});
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; };
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${srv.address().port}/index.html`;
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  const boot = async () => { await p.goto(url); await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(600); };
  await boot();
  await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(900);
  const A = () => p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { exam: a.examMode, type: a.current?.inst?.variant?.inputSlot?.type, hasHint: !!a.current?.inst?.resolvedHint, hintBtn: !!document.querySelector('#btnToggleHint') }; });

  const openModes = async () => { await p.evaluate(() => document.querySelector('[data-open-sheet="filters"]').click()); await p.waitForTimeout(200); };
  await openModes();
  ok(await p.$('#btnExamMode') !== null, 'the Modes sheet has an Exam mode switch');
  await p.click('#btnExamMode'); await p.waitForTimeout(400);
  ok((await A()).exam === true && await p.evaluate(() => /Exam/.test(document.querySelector('[data-modes-btn]').textContent)), 'the switch turns exam mode on and the Modes button says so');

  // 30 cards: never an options-only card, hint button never shown while answering
  let choice = 0, hintShown = 0;
  for (let i = 0; i < 30; i++) {
    const s = await A();
    if (s.type === 'choice') choice++;
    if (s.hintBtn) hintShown++;
    await p.click('#btnSkipNode'); await p.waitForTimeout(120);
  }
  ok(choice === 0, `30 cards in exam mode, none a pick-one card (${choice})`);
  ok(hintShown === 0, `no hint button while answering (${hintShown} of 30 cards showed one)`);

  // grade a card: pace line shows
  await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click());
  await p.waitForTimeout(700);
  const pace = await p.evaluate(() => document.querySelector('[data-pace]')?.textContent || '');
  ok(/exam pace for/.test(pace), `a pace line follows grading (${pace.slice(0, 70)})`);

  // persists over a reload, and turns off again
  await boot();
  ok((await A()).exam === true, 'exam mode survives a reload');
  await openModes(); await p.click('#btnExamMode'); await p.waitForTimeout(300);
  ok((await A()).exam === false, 'the button turns it off again');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nexam mode ok');
  process.exit(fails ? 1 : 0);
})();
