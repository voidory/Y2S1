/*
 * Cram mode: the Plan tab shows an honest meter (secure / seen / blind) and a time budget, "Unseen first" serves only unseen questions
 * (one topic at a time, strip shows what is left), "Fix misses" opens the topic's method sheet once and serves the failed questions,
 * the toolbar button turns it on and off, and nothing scrolls the page at phone size.   node tests/e2e/cram.cjs   (DEXIE_FILE as in the other suites)
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
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  const boot = async () => { await p.goto(url); await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(600); };
  const noScroll = async (label) => {
    const m = await p.evaluate(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${label}: the page does not scroll (${m.sw}x${m.sh} in ${m.iw}x${m.ih})`);
  };
  const openPlan = async () => { await p.click('.tabbar [data-nav="readiness"]'); await p.waitForTimeout(350); };
  await boot();
  await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(900);

  // 1. the meter on a fresh install: everything blind
  await openPlan();
  const meter = await p.evaluate(() => { const m = document.querySelector('[data-cram-meter="CM2011"]'); return m ? m.textContent.replace(/\s+/g, ' ') : null; });
  ok(meter && /0% of marks secure/.test(meter) && /100% still blind/.test(meter), `the Plan tab shows the meter (${meter && meter.slice(0, 80)})`);
  ok(await p.evaluate(() => /unseen question/.test(document.querySelector('[data-cram-meter="CM2011"]').parentElement.textContent)), 'it also shows the time budget line');

  // 2. unseen first: only unseen questions, strip shows what is left
  await p.click('[data-cram-start="CM2011|cover"]'); await p.waitForTimeout(500);
  ok(await p.$('[data-cram-strip]') !== null, 'the cram strip appears on the study screen');
  await noScroll('study with the cram strip');
  const seen = new Set(); let allUnseen = true, firstChunk = null, leftBefore = null;
  for (let i = 0; i < 6; i++) {
    const s = await p.evaluate(async () => {
      const E = window.__MASTERY_ENGINE__, a = E.UI.appState, db = await E.DB.init();
      const logs = await db.attemptLogs.toArray();
      return { id: a.current.node.id, wasSeen: logs.some((l) => l.nodeId === a.current.node.id), chunk: E.Weakness.chunksOf(a.skillMap, a.current.node.id)[0], strip: document.querySelector('[data-cram-strip]')?.textContent.replace(/\s+/g, ' '), left: a.cram.left?.unseen };
    });
    if (i === 0) { firstChunk = s.chunk; leftBefore = s.left; }
    if (s.wasSeen) allUnseen = false;
    seen.add(s.id);
    await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(350);   // a blank answer is a miss and still counts as seen
    await p.click('#btnSkipNode'); await p.waitForTimeout(300);
  }
  ok(allUnseen, 'every card served in the cover pass was a question never tried before');
  ok(seen.size >= 5, `no question was served twice (${seen.size} different in 6 cards)`);
  ok(firstChunk === 'x-calc', `the biggest marks-per-minute topic comes first (${firstChunk})`);
  const leftAfter = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.cram.left.unseen);
  ok(leftAfter < leftBefore, `the unseen count falls as cards are answered (${leftBefore} to ${leftAfter})`);

  // 3. the toolbar button turns it off
  await p.evaluate(() => document.querySelector('[data-open-sheet="filters"]').click()); await p.waitForTimeout(200); await p.click('#btnCram'); await p.waitForTimeout(250);
  ok(await p.$('[data-cram-strip]') === null && await p.evaluate(() => !window.__MASTERY_ENGINE__.UI.appState.cram.on), 'the Cram button turns it off');

  // 4. fix pass: seed failures in extraction and passes elsewhere, reload, start "Fix misses"
  await p.evaluate(async () => {
    const E = window.__MASTERY_ENGINE__, a = E.UI.appState, db = await E.DB.init();
    await db.attemptLogs.clear();
    let t = Date.now() - 1e6;
    const rows = a.nodes.map((n, i) => ({ id: `seed-${i}`, nodeId: n.id, variantId: n.variants[0].variantId, timestamp: (t += 1000), durationMs: 1000, normalizedGrade: E.Weakness.chunksOf(a.skillMap, n.id)[0] === 'x-calc' ? 0.2 : 1, userInput: {}, errorTags: [], missedSkillTags: [] }));
    await db.attemptLogs.bulkPut(rows);
  });
  await boot(); await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(800);
  await openPlan();
  const m2 = await p.evaluate(() => document.querySelector('[data-cram-meter="CM2011"]').textContent.replace(/\s+/g, ' '));
  ok(/0% still blind/.test(m2), `after seeding, nothing is blind (${m2.slice(0, 90)})`);
  ok(await p.evaluate(() => document.querySelector('[data-cram-start="CM2011|cover"]').disabled), '"Unseen first" is disabled when nothing is unseen');
  await p.click('[data-cram-start="CM2011|fix"]'); await p.waitForTimeout(700);
  ok(await p.$('#methodOverlay') !== null, 'the topic method sheet opens once before the first fix card');
  await p.click('#methodOverlay [data-method-close]'); await p.waitForTimeout(250);
  const f = await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { chunk: window.__MASTERY_ENGINE__.Weakness.chunksOf(a.skillMap, a.current.node.id)[0], pass: a.cram.passNow, strip: document.querySelector('[data-cram-strip]').textContent.replace(/\s+/g, ' ') }; });
  ok(f.pass === 'fix' && f.chunk === 'x-calc', `the first fix card is from the failed topic (${f.chunk}); strip: ${f.strip}`);
  await noScroll('study in the fix pass');
  await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(400);
  await p.click('#btnSkipNode'); await p.waitForTimeout(300);
  ok(await p.$('#methodOverlay') === null, 'the method sheet does not open again for the same topic');

  // 5. "done a harder one, skip the easier one": seed two passes on the overall-PSI question, nothing else
  await p.evaluate(async () => {
    const E = window.__MASTERY_ENGINE__, db = await E.DB.init();
    await db.attemptLogs.clear();
    for (const [i, k] of [[0, 'seed-sup-1'], [1, 'seed-sup-2']]) await db.attemptLogs.put({ id: k, nodeId: 'bk-m11-a-overall', variantId: 'psi-overall', timestamp: Date.now() - 6000 + i * 1000, durationMs: 1000, normalizedGrade: 1, userInput: {}, errorTags: [], missedSkillTags: [] });
  });
  await boot(); await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.retired.nodes.has('bk-m11-a-sub')), 'two passes on the overall PSI question retire the single sub-index question');
  await openPlan();
  const note = await p.evaluate(() => document.querySelector('[data-retired-note]')?.textContent.replace(/\s+/g, ' '));
  ok(note && /1 easier question is skipped/.test(note), `the Plan tab says so (${note})`);
  await p.click('.tabbar [data-nav="study"]'); await p.waitForTimeout(400);
  const served = new Set();
  for (let i = 0; i < 25; i++) {
    served.add(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current?.node.id));
    await p.evaluate(() => { (document.querySelector('#btnSubmitAnswer'))?.click(); });
    await p.waitForTimeout(200);
    await p.evaluate(() => { (document.querySelector('#btnSkipNode') || document.querySelector('#btnNextQuestion'))?.click(); });
    await p.waitForTimeout(200);
  }
  ok(!served.has('bk-m11-a-sub') && served.size > 10, `25 cards later the easier question never came up (${served.size} different cards)`);

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\ncram ok');
  process.exit(fails ? 1 : 0);
})();
