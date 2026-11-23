/*
 * Plan a session: pick a source and a size, see exactly which questions it would give, untick some, start them as a playlist.
 * node tests/e2e/session-plan.cjs   (DEXIE_FILE as in the other suites)
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
  await p.goto(url);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  await p.waitForTimeout(500);
  const A = (fn, arg) => p.evaluate(fn, arg);
  const click = async (sel) => { await A((s) => document.querySelector(s)?.click(), sel); await p.waitForTimeout(250); };
  const rows = () => A(() => [...document.querySelectorAll('[data-plan-id]')].map((x) => x.dataset.planId));
  const noScroll = async (label) => {
    const m = await A(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${label}: the page does not scroll`);
  };

  await click('[data-plan-btn]');
  ok(await A(() => !!document.querySelector('[data-plan]')), 'Plan session opens a sheet');
  await noScroll('plan sheet (phone)');
  let r = await rows();
  ok(r.length === 10 && new Set(r).size === 10, `the queue source lists 10 distinct questions (${r.length})`);
  ok(/10 questions/.test(await A(() => document.querySelector('[data-plan-total]').textContent)) && /Start 10 questions/.test(await A(() => document.querySelector('#btnPlanStart').textContent)), 'the total and Start button say 10');

  // size
  await click('[data-plan-n="5"]');
  ok((await rows()).length === 5, 'choosing 5 shows 5');
  await click('[data-plan-n="10"]');

  // untick two, start: the playlist serves exactly the ticked ones, in order
  r = await rows();
  await A(() => { const c = [...document.querySelectorAll('[data-plan-id]')]; c[1].click(); c[4].click(); });
  await p.waitForTimeout(150);
  ok(/Start 8 questions/.test(await A(() => document.querySelector('#btnPlanStart').textContent)), 'unticking two makes it 8 (no jump)');
  const want = r.filter((_, i) => i !== 1 && i !== 4);
  await click('#btnPlanStart');
  ok(await A(() => !!document.querySelector('[data-playlist-strip]')), 'Start opens a playlist strip');
  const served = [];
  for (let i = 0; i < 8; i++) { served.push(await A(() => window.__MASTERY_ENGINE__.UI.appState.current?.node.id)); await click('#btnSkipNode'); }
  ok(JSON.stringify(served) === JSON.stringify(want), 'it served the 8 ticked questions in the order shown');
  await click('#btnPlaylistOff');

  // other sources
  await click('[data-plan-btn]');
  await A(() => { const s = document.querySelector('#planSrc'); s.value = 'missed'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(250);
  ok((await rows()).length === 0 && /Nothing in that list/.test(await A(() => document.querySelector('[data-plan]').textContent)) && await A(() => document.querySelector('#btnPlanStart').disabled), 'Missed is empty on a fresh install and Start is off');
  await A(() => { const s = document.querySelector('#planSrc'); s.value = 'unseen'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(250);
  ok((await rows()).length === 10, 'Never tried gives a full page');
  const topic = await A(() => [...document.querySelectorAll('#planSrc optgroup[label="One topic"] option')][0].value);
  await A((v) => { const s = document.querySelector('#planSrc'); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, topic); await p.waitForTimeout(250);
  const inTopic = await A((v) => { const { UI, Content } = window.__MASTERY_ENGINE__; return new Set(Content.chunkNodeIds(UI.appState.skillMap, v.slice(6))); }, topic).catch(() => null);
  const tr = await rows();
  ok(tr.length > 0, `a topic gives its questions (${tr.length})`);
  // a draw-only focus set serves draw variants only
  await A(() => { const s = document.querySelector('#planSrc'); s.value = 'set:draw'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(250);
  ok((await rows()).length > 0, 'the draw focus set lists questions');
  await click('#btnPlanStart');
  ok(await A(() => { const v = window.__MASTERY_ENGINE__.UI.appState.current.inst.variant; return Boolean(v.drawOnPaperThenCompare); }), 'a draw set starts on a draw-on-paper variant');
  await click('#btnPlaylistOff');

  // starred
  await click('#btnSaveLater');
  await click('[data-plan-btn]');
  await A(() => { const s = document.querySelector('#planSrc'); s.value = 'starred'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(250);
  ok((await rows()).length === 1, 'Starred lists the starred question');

  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(300);
  await noScroll('plan sheet (laptop)');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nsession plan ok');
  process.exit(fails ? 1 : 0);
})();
