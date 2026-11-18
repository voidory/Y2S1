/*
 * Data-safety checks: importing a bundle brings your hooks and removed skills into the running app (and the next save
 * does not overwrite them), an install from an older content version reseeds the generated questions and keeps your
 * progress, a filter that matches nothing says so, and the toast clears the phone tab bar.
 * Needs a browser:  npm install  &&  npx playwright install chromium  &&  npm run test:data
 * If unpkg is unreachable, set DEXIE_FILE to a local copy of dexie@4.0.10/dist/dexie.mjs.
 */
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
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
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  const boot = async () => { await p.goto(url); await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(500); };
  await boot();

  // 1. import
  const bundle = await p.evaluate(async () => {
    const b = await window.__MASTERY_ENGINE__.DB.exportBundle();
    b.settings = b.settings.filter((s) => s.key !== 'myHooks' && s.key !== 'skillMastery');
    b.settings.push({ key: 'myHooks', hooks: { 'bk-c1-vsepr-ex1': 'imported hook', 'bk-c4-haber': 'a second imported hook' } });
    b.settings.push({ key: 'skillMastery', removed: { 'c7.cfse': true }, resetAt: {} });
    return b;
  });
  const file = path.join(os.tmpdir(), `bundle-${process.pid}.json`);
  fs.writeFileSync(file, JSON.stringify(bundle));
  await p.evaluate(() => document.querySelector('.nav-link[data-nav="settings"]').click()); await p.waitForTimeout(250);
  await p.evaluate(() => document.querySelector('[data-seg-settings="data"]').click()); await p.waitForTimeout(250);
  await p.setInputFiles('#bundleFileInput', file); await p.waitForTimeout(1200);
  const st = await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { hook: a.myHooks['bk-c1-vsepr-ex1'], removed: a.masteryPrefs.removed['c7.cfse'] }; });
  ok(st.hook === 'imported hook' && st.removed === true, 'after an import the running app has the imported hook and removed skill');
  await p.evaluate(async () => { const a = window.__MASTERY_ENGINE__.UI.appState; a.myHooks['bk-x'] = 'typed later'; });
  await p.evaluate(() => { document.querySelector('.nav-link[data-nav="study"]').click(); });
  await p.evaluate(async () => {
    // a normal save path: write a hook through the UI's own save
    const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: 'bk-c1-vsepr-ex1' }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 200));
    const c = a.current; c.evalResult = { normalizedGrade: 1, passed: true, feedback: 'ok', missedSkillTags: [] }; c.phase = 'graded'; UI.render();
  });
  await p.waitForTimeout(200);
  await p.evaluate(() => { const t = document.querySelector('#myHookInput'); const d = document.querySelector('details[data-add-hook]'); if (d) d.open = true; });
  await p.fill('#myHookInput', 'edited after import'); await p.evaluate(() => document.querySelector('#myHookInput').blur()); await p.waitForTimeout(300);
  const stored = await p.evaluate(async () => (await (await window.__MASTERY_ENGINE__.DB.init()).settings.get('myHooks')).hooks);
  ok(stored['bk-c1-vsepr-ex1'] === 'edited after import' && stored['bk-c4-haber'] === 'a second imported hook', 'saving one hook after the import keeps the other imported hook (' + Object.keys(stored).join(', ') + ')');
  const removedStored = await p.evaluate(async () => (await (await window.__MASTERY_ENGINE__.DB.init()).settings.get('skillMastery')).removed);
  ok(removedStored['c7.cfse'] === true, 'the imported removed skill is still stored');

  // 1b. the toast clears the tab bar
  const geo = await p.evaluate(() => {
    const t = document.querySelector('#toastBanner'); t.classList.remove('hidden'); t.textContent = 'Mastered: Compute CFSE. It will come up rarely now.';
    const tr = t.getBoundingClientRect(); const nr = document.querySelector('nav[aria-label="Primary (mobile)"]').getBoundingClientRect();
    return { toastBottom: Math.round(tr.bottom), tabTop: Math.round(nr.top) };
  });
  ok(geo.tabTop > 0 && geo.toastBottom <= geo.tabTop, `the toast sits above the tab bar (toast bottom ${geo.toastBottom}, tab bar top ${geo.tabTop})`);

  // 2. upgrade from an older content version
  await p.evaluate(async () => {
    const db = await window.__MASTERY_ENGINE__.DB.init();
    await db.reviewStates.put({ nodeId: 'bk-c1-vsepr-ex1', moduleCode: 'CM2021', reps: 3, S: 5, D: 5, lapses: 0, dueMs: Date.now() + 1e8, lastReviewMs: Date.now(), variantStats: {} });
    await db.attemptLogs.put({ id: 'upgrade-probe', nodeId: 'bk-c1-vsepr-ex1', variantId: 'c1-vsepr-ex1-v1', timestamp: Date.now(), normalizedGrade: 1 });
    const g = await db.settings.get('global'); await db.settings.put({ ...g, contentVersion: 5 });
    await db.questionNodes.bulkDelete((await db.questionNodes.toArray()).filter((n) => n.metadata?.composerOnly).map((n) => n.id));
  });
  await boot();
  const up = await p.evaluate(async () => { const db = await window.__MASTERY_ENGINE__.DB.init(); const g = await db.settings.get('global'); return { version: g.contentVersion, composer: window.__MASTERY_ENGINE__.UI.appState.composerNodes.length, rs: !!(await db.reviewStates.get('bk-c1-vsepr-ex1')), log: !!(await db.attemptLogs.get('upgrade-probe')), hooks: !!(await db.settings.get('myHooks')) }; });
  ok(up.version === 7 && up.composer >= 100, `an older install reseeds the generated questions (version ${up.version}, ${up.composer} composer questions)`);
  ok(up.rs && up.log && up.hooks, 'and keeps your review states, attempts and hooks');

  // 3. a filter that matches nothing
  await p.evaluate(async () => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: 'no-such-tag', forceNodeId: null }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 200)); });
  ok(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current === null && /No Matching Questions/i.test(document.querySelector('#appRoot').innerText)), 'a filter that matches nothing shows "No matching questions" (not unrelated ones)');
  await p.evaluate(() => document.querySelector('#btnResetStudyFilters').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!window.__MASTERY_ENGINE__.UI.appState.current), 'Reset filters brings questions back');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall data-safety checks ok');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
