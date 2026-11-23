/*
 * Control over the session: Back returns to the previous card, a card you leave unanswered goes on a Skipped list (and is not offered
 * again by itself), a star stays until you remove it, and one "Lists" sheet shows Up next / Skipped / Starred / Done.
 * node tests/e2e/lists.cjs   (DEXIE_FILE as in the other suites)
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
  const cur = () => A(() => window.__MASTERY_ENGINE__.UI.appState.current?.node.id);
  const click = async (sel) => { await A((s) => document.querySelector(s)?.click(), sel); await p.waitForTimeout(250); };
  const noScroll = async (label) => {
    const m = await A(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${label}: the page does not scroll (${m.sw}x${m.sh} in ${m.iw}x${m.ih})`);
  };
  const toolbarFits = async (label) => {
    const r = await A(() => [...document.querySelectorAll('#studyView button#btnBack, #studyView #btnSkipNode, #studyView [data-lists-btn], #studyView [data-modes-btn], #studyView [data-plan-btn]')].map((x) => { const b = x.getBoundingClientRect(); return b.left >= -0.5 && b.right <= innerWidth + 0.5; }));
    ok(r.length === 5 && r.every(Boolean), `${label}: every toolbar button is inside the screen`);
  };

  // 1. Back is off on the first card; skipping adds to the Skipped list
  const id1 = await cur();
  ok(await A(() => document.querySelector('#btnBack').disabled), 'Back is disabled on the first card');
  await toolbarFits('phone toolbar');
  await click('#btnSkipNode');
  const id2 = await cur();
  ok(id2 && id2 !== id1, 'Skip serves a different card');
  ok(!(await A(() => document.querySelector('#btnBack').disabled)), 'Back is enabled after one card');
  ok(/1 skipped/.test(await A(() => document.querySelector('[data-lists-btn]').textContent)), 'the Lists button counts the skipped card');
  await toolbarFits('phone toolbar with the count');

  // 2. Back returns to the skipped card; the card left by Back is not marked skipped
  await click('#btnBack');
  ok(await cur() === id1, 'Back returns to the card you skipped');
  const sk = await A(() => Object.keys(window.__MASTERY_ENGINE__.UI.appState.session.state).filter((k) => window.__MASTERY_ENGINE__.UI.appState.session.state[k] === 'skipped'));
  ok(sk.length === 1 && sk[0] === id1, 'going Back does not mark the card you left as skipped');
  ok(await A(() => document.querySelector('#btnBack').disabled), 'and Back is disabled again at the start');

  // 3. skipped cards are not offered again by themselves
  const seen = [id1];
  for (let i = 0; i < 8; i++) { await click('#btnSkipNode'); seen.push(await cur()); }
  ok(new Set(seen).size === seen.length, `nine skips give nine different cards (${new Set(seen).size} distinct)`);

  // 4. the Lists sheet: Skipped tab lists them all and each row opens the card
  await click('[data-open-sheet="queue"]');
  await noScroll('lists sheet open');
  await click('[data-list-tab="skipped"]');
  const rows = await A(() => [...document.querySelectorAll('[data-jump-node]')].map((x) => x.dataset.jumpNode));
  ok(rows.length === 8 && rows.includes(id1), `Skipped tab lists the 8 cards you left (${rows.length})`);
  await A((id) => document.querySelector(`[data-jump-node="${id}"]`).click(), id1); await p.waitForTimeout(300);
  ok(await cur() === id1, 'tapping a skipped row opens that question');
  ok(await A(() => !document.querySelector('[data-sheet-backdrop]')), 'and closes the sheet');

  // 5. a star stays: toggle from the card, find it in Lists, remove it there
  await click('#btnSaveLater');
  ok(/Starred/.test(await A(() => document.querySelector('#btnSaveLater').textContent)), 'the card button reads Starred');
  await click('[data-open-sheet="queue"]'); await click('[data-list-tab="starred"]');
  ok(await A((id) => !!document.querySelector(`[data-jump-node="${id}"]`), id1), 'the starred card is on the Starred tab');
  await noScroll('starred tab');
  await click('[data-unstar]');
  ok(await A(() => window.__MASTERY_ENGINE__.UI.appState.saved.length) === 0, 'the ✕ on a row removes the star');
  await click('[data-close-sheet]');

  // 6. Done tab: answer a card, it appears there and leaves Skipped
  await A((id) => { const a = window.__MASTERY_ENGINE__.UI.appState; a.filters.forceNodeId = id; window.__MASTERY_ENGINE__.UI.loadNextQuestion(); }, 'bk-c1-vsepr-ex1');
  await p.waitForTimeout(300);
  await click('.seg [data-step-go="answer"]');
  await p.fill('#mf_a', 'bent'); await p.fill('#mf_b', 'T-shaped'); await p.fill('#mf_c', 'square pyramidal');
  await click('#btnSubmitAnswer'); await p.waitForTimeout(300);
  const st = await A(() => window.__MASTERY_ENGINE__.UI.appState.session.state['bk-c1-vsepr-ex1']);
  ok(st === 'passed', `a graded pass is recorded for the session (${st})`);
  await click('[data-open-sheet="queue"]'); await click('[data-list-tab="done"]');
  ok(await A(() => !!document.querySelector('[data-jump-node="bk-c1-vsepr-ex1"]')), 'the Done tab shows it, ready to retry');
  await click('[data-close-sheet]');

  // 7. laptop width: toolbar and sheet fit
  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(300);
  await toolbarFits('laptop toolbar');
  await click('[data-open-sheet="queue"]'); await noScroll('laptop lists sheet');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nlists ok');
  process.exit(fails ? 1 : 0);
})();
