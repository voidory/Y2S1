/*
 * Every figure has an Enlarge button (and non-ruler figures open on a tap): a full-screen copy, with the ruler on Tanabe-Sugano diagrams.
 *   node tests/e2e/zoom.cjs   (DEXIE_FILE as in the other suites; SHOTS=dir saves screenshots)
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
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${srv.address().port}/index.html`;
  const b = await chromium.launch();
  for (const [name, vp] of [['phone', { width: 390, height: 844 }], ['laptop', { width: 1280, height: 800 }]]) {
    const p = await (await b.newContext({ viewport: vp, hasTouch: name === 'phone' })).newPage();
    if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
    const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
    await p.goto(url);
    await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(500);
    await p.selectOption('#moduleSwitch', 'CM2021'); await p.waitForTimeout(800);
    const force = async (id) => { await p.evaluate(async (NODE_ID) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: NODE_ID }; UI.loadNextQuestion ? await UI.loadNextQuestion() : null; }, id); await p.waitForTimeout(700); };
    await force('bk-c8-tsg-read');
    const go = p.locator('[data-step-go="question"]:visible'); if (await go.count()) await go.first().click();
    const small = await p.evaluate(() => document.querySelector('[data-visual-asset] svg[data-ruler]')?.getBoundingClientRect().width || 0);
    ok(await p.evaluate(() => !!document.querySelector('[data-visual-asset] [data-fig-zoom]')), `${name}: the Tanabe-Sugano figure has an Enlarge button`);
    await p.evaluate(() => document.querySelector('[data-visual-asset] [data-fig-zoom]').click()); await p.waitForTimeout(300);
    const big = await p.evaluate(() => { const s = document.querySelector('#figZoom svg'); return s ? { w: s.getBoundingClientRect().width, ruler: !!document.querySelector('#figZoom [data-ruler-mode="ruler"]') } : null; });
    ok(big && big.w > small * 1.2 && big.w >= (vp.width < 600 ? 880 : 900), `${name}: the enlarged diagram is wider (${Math.round(small)} -> ${big && Math.round(big.w)} px)`);
    ok(big && big.ruler, `${name}: the ruler works on the enlarged copy`);
    if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/zoom-ts-${name}.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => !document.getElementById('figZoom')), `${name}: Escape closes it`);
    // a plain svg figure (crown ether reference) opens on a tap of the figure itself
    await force('bk-c4-crown-draw');
    const go2 = p.locator('[data-step-go="answer"]:visible'); if (await go2.count()) await go2.first().click();
    await p.click('#btnUnlockRubric'); await p.waitForTimeout(250);
    const smallC = await p.evaluate(() => document.querySelector('[data-reference-compare] svg').getBoundingClientRect().width);
    await p.evaluate(() => document.querySelector('[data-reference-compare] figure svg').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await p.waitForTimeout(250);
    const bigC = await p.evaluate(() => document.querySelector('#figZoom svg')?.getBoundingClientRect().width || 0);
    ok(bigC >= smallC * (vp.width < 600 ? 1.0 : 1.2), `${name}: tapping a figure enlarges it (${Math.round(smallC)} -> ${Math.round(bigC)} px)`);
    await p.evaluate(() => document.getElementById('figZoomClose').click());
    ok(await p.evaluate(() => !document.getElementById('figZoom')), `${name}: Close removes it`);
    ok(errs.length === 0, `${name}: no page errors` + (errs.length ? ': ' + errs.join(' | ') : ''));
    await p.context().close();
  }
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nzoom ok'); process.exit(fails ? 1 : 0);
})();
