/*
 * Laptop (1280x800) ergonomics: after grading the question and your answers sit left and the long review gets the right column with Next
 * in view; Map and Patterns use two columns; the study screen can be driven from the keyboard.
 *   node tests/e2e/laptop.cjs   (DEXIE_FILE as in the other suites)
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
  await p.goto(url);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  await p.waitForTimeout(600);
  const A = (fn, arg) => p.evaluate(fn, arg);
  const cur = () => A(() => window.__MASTERY_ENGINE__.UI.appState.current?.node.id);
  const noScroll = async (label) => {
    const m = await A(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${label}: the page does not scroll`);
  };
  const rect = (sel) => A((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; }, sel);

  // 1. keyboard: S skips, B goes back, L opens Lists, Esc closes it
  const id1 = await cur();
  ok(await A(() => !!document.querySelector('[data-key-legend]') && getComputedStyle(document.querySelector('[data-key-legend]')).display !== 'none'), 'the key legend shows at laptop width');
  await p.keyboard.press('s'); await p.waitForTimeout(250);
  const id2 = await cur();
  ok(id2 !== id1, 'S skips to another card');
  await p.keyboard.press('b'); await p.waitForTimeout(250);
  ok(await cur() === id1, 'B goes back');
  await p.keyboard.press('l'); await p.waitForTimeout(200);
  ok(await A(() => !!document.querySelector('[data-sheet-backdrop]')), 'L opens Lists');
  await p.keyboard.press('s'); await p.waitForTimeout(150);
  ok(await cur() === id1, 'other keys are ignored while a sheet is open');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(await A(() => !document.querySelector('[data-sheet-backdrop]')), 'Esc closes it');
  await p.keyboard.press('m'); await p.waitForTimeout(200);
  ok(await A(() => !!document.querySelector('#btnCram')), 'M opens Modes');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);

  // 2. graded layout: answers left under the question, review right, Next in view, nothing scrolls the page
  await A(() => { const a = window.__MASTERY_ENGINE__.UI.appState; a.filters.forceNodeId = 'bk-c1-vsepr-ex1'; window.__MASTERY_ENGINE__.UI.loadNextQuestion(); });
  await p.waitForTimeout(350);
  await p.fill('#mf_a', 'bent'); await p.fill('#mf_b', 'x'); await p.fill('#mf_c', 'y');
  await p.keyboard.press('Tab'); // leave the field, then submit with the button
  await A(() => document.querySelector('#btnSubmitAnswer').click()); await p.waitForTimeout(400);
  const q = await rect('.pane-q'), ans = await rect('.blk-answer'), res = await rect('.blk-result'), nxt = await rect('#btnNextQuestion');
  ok(q && ans && res && ans.t >= q.b - 1 && Math.abs(ans.l - q.l) < 4, 'the answers sit under the question on the left');
  ok(res.l > q.r - 4 && res.t <= q.t + 4 && res.b >= ans.b - 4, 'the review takes the right column, full height');
  ok(nxt && nxt.b <= 800 && nxt.t >= 0, 'the Next button is on screen without scrolling');
  await noScroll('graded study');
  await p.keyboard.press('n'); await p.waitForTimeout(350);
  ok(await cur() !== 'bk-c1-vsepr-ex1', 'N moves to the next card once graded');

  // 3. two columns on the Reactions Map and Patterns
  await A(() => document.querySelector('.nav-link[data-nav="reactions"]').click()); await p.waitForTimeout(300);
  await A(() => document.querySelector('[data-rx-tab="patterns"]').click()); await p.waitForTimeout(250);
  const cols = await A(() => { const x = [...document.querySelectorAll('[data-rx-pattern]')].slice(0, 2).map((e) => e.getBoundingClientRect()); return x; });
  ok(cols.length === 2 && cols[1].left > cols[0].right - 4 && Math.abs(cols[0].top - cols[1].top) < 4, 'Patterns shows two cards side by side');
  await A(() => document.querySelector('[data-rx-tab="map"]').click()); await p.waitForTimeout(250);
  const g = await A(() => { const x = [...document.querySelectorAll('[data-rx-group]')].slice(0, 2).map((e) => e.getBoundingClientRect()); return x; });
  ok(g.length === 2 && g[1].left > g[0].right - 4, 'Map shows two chunks side by side');
  await noScroll('Map');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nlaptop ok');
  process.exit(fails ? 1 : 0);
})();
