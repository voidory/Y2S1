/* A graded mock paper opens on a Diagnosis tab: marks lost by skill, and a Repair button that starts a playlist. node tests/e2e/diagnosis.cjs */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..');
const dexie = process.env.DEXIE_FILE ? fs.readFileSync(process.env.DEXIE_FILE, 'utf8') : null;
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.json') ? 'application/json' : f.endsWith('.html') ? 'text/html' : 'text/plain' }); fs.createReadStream(f).pipe(r); });
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch();
  for (const [name, vp] of [['phone', { width: 390, height: 844 }], ['laptop', { width: 1280, height: 800 }]]) {
    const p = await (await b.newContext({ viewport: vp, hasTouch: name === 'phone' })).newPage();
    if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
    const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
    await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
    await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(500);
    await p.selectOption('#moduleSwitch', 'CM2021'); await p.waitForTimeout(700);
    await p.click(name === 'phone' ? '.tabbar [data-nav="mock"]' : '[data-nav="mock"][data-variant="side"]').catch(() => p.evaluate(() => document.querySelector('[data-nav="mock"]').click())); await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelector('#btnStartFinalPaper')?.click()); await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelector('#btnSubmitMockPaper')?.click()); await p.waitForTimeout(600);
    if (await p.$('#btnFinalizeMockPaper')) { await p.evaluate(() => document.querySelector('#btnFinalizeMockPaper').click()); await p.waitForTimeout(900); }
    const d = await p.evaluate(() => ({ tab: document.querySelector('[data-seg-mock][aria-selected="true"]')?.dataset.segMock, rows: document.querySelectorAll('[data-diagnosis-row]').length, btn: document.querySelector('#btnRepairFromPaper')?.textContent.trim(), sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(d.tab === 'diagnosis', `${name}: a graded paper opens on the Diagnosis tab`);
    ok(d.rows >= 3, `${name}: ${d.rows} skills listed (a blank paper loses marks everywhere)`);
    ok(/Repair: \d+ question/.test(d.btn || ''), `${name}: repair button says "${d.btn}"`);
    ok(d.sh <= d.ih + 1 && d.sw <= d.iw + 1, `${name}: the page does not scroll`);
    await p.evaluate(() => document.querySelector('#btnRepairFromPaper').click()); await p.waitForTimeout(700);
    const pl = await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { on: a.playlist?.on, n: a.playlist?.ids.length, label: a.playlist?.label, route: a.route, strip: Boolean(document.querySelector('[data-playlist-strip]')) }; });
    ok(pl.on && pl.n > 2 && pl.route === 'study' && pl.strip, `${name}: Repair starts a ${pl.n}-question playlist ("${pl.label}")`);
    ok(errs.length === 0, `${name}: no page errors` + (errs.length ? ': ' + errs.join(' | ') : ''));
    await p.context().close();
  }
  await b.close(); srv.close(); console.log(fails ? `\n${fails} FAILED` : '\ndiagnosis ok'); process.exit(fails ? 1 : 0);
})();
