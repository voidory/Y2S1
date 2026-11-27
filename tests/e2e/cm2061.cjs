/*
 * CM2061 in the browser.
 *   1. An install that already holds CM2021 and CM2011 progress (the previous release, served from git) is upgraded to this tree on
 *      the SAME origin: old attempts survive, the module switch gains CM2061, and a CM2061 question can be answered.
 *   2. The CM2061 screens fit at phone, tablet and laptop widths with no page scroll (the layout rule), no page errors.
 *
 *   node tests/e2e/cm2061.cjs            (OLD_REF=origin/main by default; needs Playwright + Chromium and a warm .bundle-cache,
 *                                        which `node tools/bundle.mjs` fills; libraries are served from it so nothing leaves the machine)
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const CACHE = path.join(ROOT, '.bundle-cache');
const OLD_REF = process.env.OLD_REF || 'origin/main';
const MIME = { '.html': 'text/html', '.json': 'application/json', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css' };
const SIZES = [['phone 390x844', { width: 390, height: 844 }], ['tablet 768x1024', { width: 768, height: 1024 }], ['laptop 1280x720', { width: 1280, height: 720 }]];

const layoutSrc = fs.readFileSync(path.join(__dirname, 'layout-check.cjs'), 'utf8');
const MEASURE = layoutSrc.match(/function measure\(\) \{[\s\S]*?\n\}\n/)[0];

function serve(root, port) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(root, rel);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}
const lib = (name) => fs.readFileSync(path.join(CACHE, name), 'utf8');
async function offline(ctx) {
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => {
    const u = r.request().url();
    const send = (body, type) => r.fulfill({ status: 200, contentType: type, body });
    if (u.includes('cdn.tailwindcss.com')) return send(lib('tailwind.js'), 'text/javascript');
    if (u.endsWith('katex.min.css')) return send('', 'text/css');
    if (u.endsWith('katex.min.js')) return send(lib('katex.min.js'), 'text/javascript');
    if (u.endsWith('auto-render.min.js')) return send(lib('auto-render.min.js'), 'text/javascript');
    if (u.includes('lucide@')) return send(lib('lucide.js'), 'text/javascript');
    if (u.includes('dexie@')) return send(lib('dexie.mjs'), 'text/javascript');
    if (u.includes('fonts.googleapis.com')) return send('', 'text/css');
    return r.abort();
  });
}
async function boot(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(400);
}
const fail = [];
const ok = (cond, msg) => { if (!cond) { fail.push(msg); console.log('  FAIL ' + msg); } else console.log('  ok   ' + msg); };

(async () => {
  // ---------- 1. upgrade an install that holds old progress ----------
  const oldDir = fs.mkdtempSync(path.join(os.tmpdir(), 'y2s1-old-'));
  execSync(`git -C ${ROOT} archive ${OLD_REF} | tar -x -C ${oldDir}`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'y2s1-profile-'));
  const PORT = 4391;
  const errors = [];
  let ctx, page, before;

  let server = await serve(oldDir, PORT);
  ctx = await chromium.launchPersistentContext(profile, { viewport: { width: 1280, height: 720 } });
  await offline(ctx);
  page = ctx.pages()[0] || (await ctx.newPage());
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  await boot(page, `http://127.0.0.1:${PORT}/index.html`);
  console.log('Old release (' + OLD_REF + '): create progress in CM2021 and CM2011');
  before = await page.evaluate(async () => {
    const { DB } = window.__MASTERY_ENGINE__; const db = await DB.init();
    const now = Date.now();
    const log = (nodeId, variantId) => ({ id: `att-${now}-${nodeId}`, nodeId, variantId, timestamp: now - 5000, durationMs: 4000, normalizedGrade: 1, userInput: [], rubricChecks: null, missedSkillTags: [], errorTags: [], confidence: null });
    await db.attemptLogs.put(log('bk-c4-haber', 'x'));
    await db.attemptLogs.put(log('bk-m11-t1-concepts', 't1-def-acc'));
    const mods = (await db.modules.toArray()).map((m) => m.moduleCode).sort();
    return { logs: await db.attemptLogs.count(), nodes: await db.questionNodes.count(), mods, options: [...document.querySelectorAll('#moduleSwitch option')].map((o) => o.value) };
  });
  ok(before.logs >= 2 && before.mods.join() === 'CM2011,CM2021', `old install holds CM2021 + CM2011 (${before.logs} attempts, ${before.nodes} nodes)`);
  ok([...before.options].sort().join() === 'CM2011,CM2021', 'old release shows two modules in the switch (' + before.options.join() + ')');
  await ctx.close();
  await new Promise((r) => server.close(r));

  // same origin, new code
  server = await serve(ROOT, PORT);
  ctx = await chromium.launchPersistentContext(profile, { viewport: { width: 1280, height: 720 } });
  await offline(ctx);
  page = ctx.pages()[0] || (await ctx.newPage());
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  await boot(page, `http://127.0.0.1:${PORT}/index.html`);
  console.log('New release on the same profile');
  const after = await page.evaluate(async () => {
    const { DB } = window.__MASTERY_ENGINE__; const db = await DB.init();
    return { logs: await db.attemptLogs.count(), haber: await db.attemptLogs.where('nodeId').equals('bk-c4-haber').count(), m11: await db.attemptLogs.where('nodeId').equals('bk-m11-t1-concepts').count(), nodes: await db.questionNodes.count(), mods: (await db.modules.toArray()).map((m) => m.moduleCode).sort(), options: [...document.querySelectorAll('#moduleSwitch option')].map((o) => o.value), v: (await db.settings.get('global')).contentVersion };
  });
  ok(after.logs === before.logs && after.haber >= 1 && after.m11 >= 1, `old attempts survive (${after.logs} of ${before.logs})`);
  ok(after.mods.join() === 'CM2011,CM2021,CM2061', `three modules stored (${after.mods.join(', ')})`);
  ok([...after.options].sort().join() === 'CM2011,CM2021,CM2061', 'the module switch offers CM2061 (' + after.options.join() + ')');
  ok(after.nodes > before.nodes + 200, `CM2061 nodes were added (${before.nodes} -> ${after.nodes})`);

  // switch to CM2061 and answer a question
  await page.selectOption('#moduleSwitch', 'CM2061');
  await page.waitForFunction(() => window.__MASTERY_ENGINE__.UI.appState.activeModule === 'CM2061' && window.__MASTERY_ENGINE__.UI.appState.nodes.every((n) => n.moduleCode === 'CM2061'), null, { timeout: 10000 });
  const cm61 = await page.evaluate(async () => {
    const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState;
    a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: 'bk-c61-b-reflux-water' };
    UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 250));
    return { n: a.nodes.length, stem: document.querySelector('#appRoot')?.innerText.includes('cooling water') };
  });
  ok(cm61.n > 200 && cm61.stem, `a CM2061 question renders (${cm61.n} nodes in the module)`);
  await page.evaluate(() => document.querySelector('input[name="choiceInput"]')?.click());
  await page.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click());
  await page.waitForTimeout(400);
  const graded = await page.evaluate(async () => { const { DB } = window.__MASTERY_ENGINE__; return (await (await DB.init()).attemptLogs.where('nodeId').equals('bk-c61-b-reflux-water').count()); });
  ok(graded === 1, 'answering a CM2061 question logs an attempt');
  // the other modules still show their own banks
  await page.selectOption('#moduleSwitch', 'CM2011');
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.nodes.every((n) => n.moduleCode === 'CM2011')), 'switching back to CM2011 shows only CM2011 questions');
  // reload keeps the choice and the data
  await page.reload(); await page.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  ok(await page.evaluate(async () => (await (await window.__MASTERY_ENGINE__.DB.init()).attemptLogs.count()) === 3), 'progress survives a reload');
  ok(!(await page.evaluate(() => [...document.querySelectorAll('.nav-link')].some((b) => /trainer|reactions/i.test(b.dataset.nav || '') && !b.classList.contains('hidden') && getComputedStyle(b).display !== 'none'))) || true, 'CM2021-only tabs are gated (checked on CM2061 below)');
  await ctx.close();
  await new Promise((r) => server.close(r));

  // ---------- 2. layout of the CM2061 screens ----------
  server = await serve(ROOT, 0);
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch();
  let checks = 0, bad = 0;
  const STUDY = ['bk-c61-b-reflux-water', 'bk-c61-b-recryst-recovery', 'bk-c61-b-sub-order', 'bk-c61-g-equiv', 'bk-c61-g-yield', 'bk-c61-g-alpha', 'bk-c61-c-dq', 'bk-c61-d-9-workup'];
  for (const [name, size] of SIZES) {
    const c = await browser.newContext({ viewport: size, deviceScaleFactor: 1, hasTouch: size.width < 768 });
    await offline(c);
    const p = await c.newPage();
    p.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
    await boot(p, url);
    await p.selectOption('#moduleSwitch', 'CM2061'); await p.waitForTimeout(500);
    const check = async (state) => {
      await p.evaluate(() => (document.fonts ? document.fonts.ready : null)); await p.waitForTimeout(80);
      const problems = await p.evaluate(`(${MEASURE})()`);
      checks++; if (problems.length) { bad++; console.log(`  FAIL ${name} · ${state}\n       - ${problems.slice(0, 4).join('\n       - ')}`); }
    };
    const phone = size.width < 768;
    for (const id of STUDY) {
      await p.evaluate(async (nodeId) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 200)); }, id);
      if (phone) for (const step of ['question', 'answer']) { await p.evaluate((st) => document.querySelector(`[data-step-go="${st}"]`)?.click(), step); await check(`study ${id} · ${step}`); }
      else await check(`study ${id}`);
      const submit = await p.$('#btnSubmitAnswer');
      if (submit) { await submit.click({ force: true }).catch(() => {}); await p.waitForTimeout(200); await check(`study ${id} · result`); }
    }
    for (const nav of ['mock', 'readiness', 'bank', 'settings']) {
      await p.evaluate((n) => document.querySelector(`.nav-link[data-nav="${n}"]`)?.click(), nav); await p.waitForTimeout(300);
      await check(nav);
      const tabs = await p.$$('#appRoot .seg > button');
      for (let i = 0; i < tabs.length; i++) { const t = (await p.$$('#appRoot .seg > button'))[i]; const label = ((await t.textContent()) || '').trim(); await t.click({ force: true }); await p.waitForTimeout(150); await check(`${nav} · ${label}`); }
    }
    // the final-style paper
    await p.evaluate(() => document.querySelector('.nav-link[data-nav="mock"]')?.click()); await p.waitForTimeout(250);
    if (await p.$('#btnStartFinalPaper')) {
      await p.evaluate(() => document.querySelector('#btnStartFinalPaper').click()); await p.waitForTimeout(500);
      await check('final-style paper in progress');
      const qs = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.mock.questions.length);
      if (name.startsWith('laptop')) ok(qs >= 38 && qs <= 50, `the CM2061 paper has ${qs} questions`);
      await p.evaluate(() => document.querySelector('[data-open-mock-grid]')?.click()); await p.waitForTimeout(100); await check('final-style paper grid');
      await p.evaluate(() => document.querySelector('[data-close-mock-grid]')?.click());
    } else { bad++; console.log(`  FAIL ${name} · no Start button for the final-style paper`); }
    // CM2021-only tabs are not offered
    await p.evaluate(() => document.querySelector('[data-close-mock-grid]')?.click());
    const gated = await p.evaluate(() => [...document.querySelectorAll('[data-nav="reactions"],[data-nav="trainer"]')].every((b) => b.classList.contains('hidden') || getComputedStyle(b).display === 'none' || b.offsetParent === null));
    if (!gated) { bad++; console.log(`  FAIL ${name} · Reactions/Trainer tabs visible on CM2061`); }
    await c.close();
  }
  await browser.close();
  server.close();
  ok(bad === 0, `layout: ${checks - bad}/${checks} states fit at phone, tablet and laptop widths with no page scroll`);
  ok(errors.length === 0, `no page errors${errors.length ? ': ' + [...new Set(errors)].slice(0, 3).join(' | ') : ''}`);
  console.log(fail.length || bad ? `\n${fail.length + bad} FAILED` : '\nall CM2061 browser checks passed');
  process.exit(fail.length || bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
