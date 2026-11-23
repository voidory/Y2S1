/* Draw-and-label formal charge items show the reference structure (an SVG) once you commit your drawing, at phone and laptop size, without page scroll. */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../..');
const dexie = fs.readFileSync(process.env.DEXIE_FILE, 'utf8');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.json') ? 'application/json' : f.endsWith('.html') ? 'text/html' : 'text/plain' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(); let fails = 0; const shots = process.env.SHOTS;
  for (const [name, vp] of [['phone', { width: 360, height: 640 }], ['laptop', { width: 1280, height: 800 }]]) {
    const p = await (await b.newContext({ viewport: vp, hasTouch: name === 'phone' })).newPage();
    await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
    await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(500);
    await p.selectOption('#moduleSwitch', 'CM2021'); await p.waitForTimeout(800);
    const seen = new Set();
    for (let k = 0; k < 14 && seen.size < 6; k++) {
      await p.evaluate(async () => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: 'bk-c1-fc-draw' }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 150)); });
      const id = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current.inst.variant.variantId);
      if (seen.has(id)) continue; seen.add(id);
      const before = await p.locator('[data-reference-compare]').count();
      const go = p.locator('[data-step-go="answer"]:visible'); if (await go.count()) await go.first().click();
      await p.click('#btnUnlockRubric'); await p.waitForTimeout(250);
      const svg = await p.locator('[data-reference-compare] svg').count();
      const m = await p.evaluate(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
      const ok = before === 0 && svg === 1 && m.sw <= m.iw + 1;
      if (!ok) { fails++; console.log('FAIL', name, id, { before, svg, m }); }
      if (shots && id.endsWith('-2')) await p.screenshot({ path: `${shots}/fc-draw-${name}.png` });
    }
    if (errs.length) { fails++; console.log('page errors', errs.slice(0, 2)); }
    console.log(name, 'variants checked', seen.size);
    await p.context().close();
  }
  await b.close(); srv.close(); console.log(fails ? 'fc-draw FAILED' : 'fc-draw ok'); process.exit(fails ? 1 : 0);
})();
