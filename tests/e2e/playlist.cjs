/*
 * "Save for later" and the unseen list: the Bank has All / Unseen / Saved tabs, a star on every row and on the study screen,
 * Save all / Play on any list, and a played list serves its questions in order. A saved question drops off once it is passed.
 * node tests/e2e/playlist.cjs   (DEXIE_FILE as in the other suites)
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
  const boot = async () => { await p.goto(url); await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(500); };
  const A = (fn) => p.evaluate(fn);
  const bank = async () => { await A(() => document.querySelector('.nav-link[data-nav="bank"]').click()); await p.waitForTimeout(250); };
  const chips = () => A(() => [...document.querySelectorAll('[data-bank-show]')].map((b) => b.textContent.replace(/\s+/g, ' ').trim()));
  const noScroll = async (label) => {
    const m = await A(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${label}: the page does not scroll (${m.sw}x${m.sh} in ${m.iw}x${m.ih})`);
  };
  await boot();
  const total = await A(() => window.__MASTERY_ENGINE__.UI.appState.nodes.length);

  // 1. the three tabs on a fresh install
  await bank();
  let c = await chips();
  ok(c.length === 3 && c[0] === `All ${total}` && c[1] === `Unseen ${total}` && c[2] === '★ Saved 0', `the Bank has All / Unseen / Saved tabs (${c.join(' | ')})`);
  await noScroll('bank with the new tabs');

  // 2. star a row; it persists across a reload
  const firstId = await A(() => document.querySelector('[data-save-node]').dataset.saveNode);
  await A(() => document.querySelector('[data-save-node]').click()); await p.waitForTimeout(150);
  c = await chips();
  ok(c[2] === '★ Saved 1', 'the star on a row saves it');
  await boot(); await bank();
  c = await chips();
  ok(c[2] === '★ Saved 1', 'and it is still saved after a reload');
  await A(() => document.querySelector('[data-bank-show="saved"]').click()); await p.waitForTimeout(150);
  ok(await A(() => document.querySelectorAll('[data-launch-node]').length) === 1, 'the Saved tab lists just that question');

  // 3. study screen: star toggles in place; passing the question takes it off the list
  const open = async (id) => { await A(async () => { }); await p.evaluate(async (nodeId) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 150)); }, id); };
  await open('bk-c1-vsepr-ex1');
  ok(await A(() => document.querySelector('#btnSaveLater')?.getAttribute('aria-pressed')) === 'false', 'the study screen has a Save for later button');
  await noScroll('study with the save button');
  await A(() => document.querySelector('#btnSaveLater').click()); await p.waitForTimeout(150);
  ok(await A(() => document.querySelector('#btnSaveLater').getAttribute('aria-pressed')) === 'true' && await A(() => window.__MASTERY_ENGINE__.UI.appState.saved.includes('bk-c1-vsepr-ex1')), 'saving from the study screen works');
  await A(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
  await p.fill('#mf_a', 'bent'); await p.fill('#mf_b', 'T-shaped'); await p.fill('#mf_c', 'square pyramidal');
  await A(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(400);
  ok(await A(() => !window.__MASTERY_ENGINE__.UI.appState.saved.includes('bk-c1-vsepr-ex1')), 'a pass takes the question off the Saved list');
  ok(await A(() => window.__MASTERY_ENGINE__.UI.appState.saved.length) === 1, 'the other saved question stays (a miss would not remove it either)');

  // 4. Unseen: one fewer now, the tried one is gone from it
  await bank(); await A(() => document.querySelector('[data-bank-show="unseen"]').click()); await p.waitForTimeout(150);
  c = await chips();
  ok(c[1] === `Unseen ${total - 1}`, `the tried question left the Unseen count (${c[1]})`);
  const listed = await A(() => [...document.querySelectorAll('[data-launch-node]')].map((x) => x.dataset.launchNode));
  ok(!listed.includes('bk-c1-vsepr-ex1') && listed.length === Math.min(60, total - 1), `the Unseen tab lists only untried questions (${listed.length} shown, first page)`);
  ok(await A(() => /not tried yet/.test(document.querySelector('#appRoot').textContent)), 'rows say "not tried yet"');

  // 5. Save all and Play: served in the order listed, with a strip, and End closes it
  await A(() => document.querySelector('#bankSaveAll').click()); await p.waitForTimeout(250);
  c = await chips();
  ok(c[2] === `★ Saved ${total - 1}` || c[2] === `★ Saved ${total - 1}`, `Save all puts the whole Unseen list on Saved (${c[2]})`);
  const order = await A(() => window.__MASTERY_ENGINE__.UI.appState.nodes.filter((n) => !window.__MASTERY_ENGINE__.UI.appState.masteryLogs.some((l) => l.nodeId === n.id)).map((n) => n.id));
  await A(() => document.querySelector('#bankPlayAll').click()); await p.waitForTimeout(500);
  ok(await p.$('[data-playlist-strip]') !== null, 'Play opens the study screen with a playlist strip');
  await noScroll('study with the playlist strip');
  const served = [];
  for (let i = 0; i < 3; i++) {
    served.push(await A(() => window.__MASTERY_ENGINE__.UI.appState.current.node.id));
    await A(() => document.querySelector('#btnSkipNode').click()); await p.waitForTimeout(300);
  }
  ok(JSON.stringify(served) === JSON.stringify(order.slice(0, 3)), `it served the list in order (${served.join(', ')})`);
  ok(/3 of|4 of/.test(await A(() => document.querySelector('[data-playlist-strip]').textContent)), 'the strip counts how far through you are');
  await A(() => document.querySelector('#btnPlaylistOff').click()); await p.waitForTimeout(200);
  ok(await p.$('[data-playlist-strip]') === null, 'End closes the playlist');

  // 6. reorder and clear on the Saved tab
  await bank(); await A(() => document.querySelector('[data-bank-show="saved"]').click()); await p.waitForTimeout(150);
  const before = await A(() => [...document.querySelectorAll('[data-launch-node]')].slice(0, 2).map((x) => x.dataset.launchNode));
  await A(() => document.querySelector('[data-save-move^="down|"]').click()); await p.waitForTimeout(150);
  const after = await A(() => [...document.querySelectorAll('[data-launch-node]')].slice(0, 2).map((x) => x.dataset.launchNode));
  ok(after[0] === before[1] && after[1] === before[0], 'the down arrow moves a saved question one place later');
  await A(() => document.querySelector('#bankClearSaved').click()); await p.waitForTimeout(100);
  ok(await A(() => window.__MASTERY_ENGINE__.UI.appState.saved.length) > 0, 'Clear needs a second tap');
  await A(() => document.querySelector('#bankClearSaved').click()); await p.waitForTimeout(200);
  c = await chips();
  ok(c[2] === '★ Saved 0', 'and the second tap empties the list');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nplaylist ok');
  process.exit(fails ? 1 : 0);
})();
