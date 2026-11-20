/*
 * Plan tab: both modules' exam dates, hours and split persist, blocks and the topic grid render for both modules,
 * rating a never-tried topic is stored, and Start switches module and opens a topic drill.
 * Needs a browser:  node tests/e2e/plan.cjs   (set DEXIE_FILE to a local dexie@4.0.10/dist/dexie.mjs if unpkg is blocked)
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
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  const load = async () => {
    await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
    await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
    await p.waitForTimeout(500);
  };
  await load();
  await p.evaluate(() => document.querySelector('.nav-link[data-nav="readiness"]').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelector('[data-seg-ready="plan"]')?.getAttribute('aria-selected') === 'true'), 'Progress opens on the Plan tab');
  ok((await p.$$('[data-plan-exam]')).length === 2, 'both modules have an exam date field');
  const rows = await p.evaluate(() => [...document.querySelectorAll('[data-plan-row]')].map((r) => r.dataset.planRow.split(':')[0]));
  ok(rows.includes('CM2011') && rows.includes('CM2021'), 'the topic grid lists both modules');
  ok((await p.$$('[data-plan-block]')).length === 9, 'six hours make nine 40-minute blocks');

  await p.fill('[data-plan-exam="CM2011"]', '2026-11-23T09:00'); await p.dispatchEvent('[data-plan-exam="CM2011"]', 'change'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => { const m = window.__MASTERY_ENGINE__.UI.appState.modules.find((x) => x.moduleCode === 'CM2011'); return m.examTimestamp != null && new Date(m.examTimestamp).getDate() === 23; }), 'an exam date is saved on the module');
  await p.fill('[data-plan-hours]', '4'); await p.dispatchEvent('[data-plan-hours]', 'change'); await p.waitForTimeout(300);
  ok((await p.$$('[data-plan-block]')).length === 6, 'four hours make six blocks');
  await p.fill('[data-plan-split]', '75'); await p.dispatchEvent('[data-plan-split]', 'change'); await p.waitForTimeout(300);
  const mix = await p.evaluate(() => [...document.querySelectorAll('[data-plan-start]')].map((x) => x.dataset.planStart.split('|')[0]));
  const n11 = mix.filter((m) => m === 'CM2011').length, n21 = mix.filter((m) => m === 'CM2021').length;
  ok(n11 > n21, `a 75% split puts more blocks on the first module (${n11} against ${n21})`);

  const key = await p.evaluate(() => document.querySelector('[data-plan-rate]')?.dataset.planRate);
  ok(!!key, 'a never-tried topic offers a self-rating');
  await p.selectOption(`[data-plan-rate="${key}"]`, '3'); await p.waitForTimeout(300);
  ok(await p.evaluate((k) => window.__MASTERY_ENGINE__.UI.appState.plan.ratings[k] === 3, key), 'the self-rating is stored');

  const target = await p.evaluate(() => document.querySelector('[data-plan-start]').dataset.planStart);
  await p.evaluate(() => document.querySelector('[data-plan-start]').click()); await p.waitForTimeout(900);
  const st = await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { route: a.route, mod: a.activeModule, chunk: a.filters.chunkId, inChunk: !!a.filters.chunkNodeIds?.includes(a.current?.node.id) }; });
  ok(st.route === 'study' && st.mod === target.split('|')[0] && st.chunk === target.split('|')[1] && st.inChunk, `Start opens a ${target} drill`);

  await load();
  ok(await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return a.plan.hoursPerDay === 4 && a.plan.split === 75; }), 'hours and split survive a reload');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nall plan checks ok');
  await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})();
