/*
 * Layout check: the app must never scroll the page, never scroll sideways, and never silently clip content.
 *
 *   npx playwright install chromium   (once, if you have no browser)
 *   npm run test:layout
 *
 * It serves the repo root itself and drives the real UI at phone / small-phone / tablet / laptop sizes.
 * Only elements marked .view-scroll or .pane may scroll (bounded regions); everything else must fit.
 * If unpkg is unreachable, set DEXIE_FILE to a local copy of dexie@4.0.10/dist/dexie.mjs.
 * Exit code 1 if any state fails. Not part of `npm test` (needs a browser and is slower).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const SIZES = [
  ['phone 390x844', { width: 390, height: 844 }],
  ['small phone 360x640', { width: 360, height: 640 }],
  ['tablet 768x1024', { width: 768, height: 1024 }],
  ['laptop 1280x720', { width: 1280, height: 720 }],
];
const STUDY_NODES = ['bk-c1-vsepr-tut1', 'bk-c1-resonance-count', 'bk-c4-clo2', 'bk-c7-identify-p1', 'bk-c6-name-tut4', 'bk-c8-terms-d8', 'bk-c4-aqua-regia', 'bk-c3-lgo-oh'];
const MIME = { '.html': 'text/html', '.json': 'application/json', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css' };

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Runs in the page: returns the problems for the current state.
function measure() {
  const root = document.getElementById('appRoot');
  const problems = [];
  const de = document.documentElement;
  if (de.scrollHeight > innerHeight + 1) problems.push(`page scrolls (${de.scrollHeight}px > ${innerHeight}px)`);
  if (de.scrollWidth > innerWidth + 1) problems.push(`page scrolls sideways (${de.scrollWidth}px > ${innerWidth}px)`);
  // Clipping: no visible element may extend past the main region unless it lives inside a bounded scroll region.
  // (scrollHeight is not used: KaTeX's invisible accessibility text inflates it without being content.)
  const rr = root.getBoundingClientRect();
  const SCROLLER = '.view-scroll, .pane, [data-bounded-scroll]';
  for (const el of root.querySelectorAll('*')) {
    if (el.closest('.katex-mathml') || el.parentElement?.closest(SCROLLER)) continue;
    const r = el.getBoundingClientRect();
    // fixed overlays (bottom sheets) are positioned against the viewport on purpose
    let inFixed = false;
    for (let n = el; n && n !== root; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') { inFixed = true; break; }
    if (r.width <= 1 || r.height <= 1 || inFixed) continue;
    if (r.bottom > rr.bottom + 1 || r.right > rr.right + 1) { problems.push(`content clipped by the main region: <${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}> ends ${Math.round(Math.max(r.bottom - rr.bottom, r.right - rr.right))}px past the edge`); break; }
  }
  for (const sc of root.querySelectorAll(SCROLLER)) {
    if (sc.scrollWidth > sc.clientWidth + 1) { problems.push(`bounded region scrolls sideways (${sc.scrollWidth}px > ${sc.clientWidth}px): ${String(sc.className).split(' ').slice(0, 2).join('.')}`); break; }
  }
  // any scroll container that is not an allowed bounded region
  for (const el of root.querySelectorAll('*')) {
    const st = getComputedStyle(el);
    const scrolls = (st.overflowY === 'auto' || st.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1;
    if (scrolls && !el.matches('.view-scroll, .pane, [data-bounded-scroll]')) problems.push(`unmarked scroll region: ${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className).split(' ').slice(0, 3).join('.')}`);
  }
  // text must stay readable
  for (const el of root.querySelectorAll('button, a, input, select, label, p, h1, h2, h3, span, div')) {
    // KaTeX lays math out with tiny zero-width spacer elements; they are not text anyone reads.
    if (!el.childElementCount && el.textContent.replace(/[​\s]/g, '') && !el.closest('.katex')) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 10) { problems.push(`text smaller than 10px: "${el.textContent.trim().slice(0, 24)}" (${fs}px)`); break; }
    }
  }
  // tap targets on touch-size screens
  if (innerWidth < 768) {
    for (const el of document.querySelectorAll('#appRoot button, nav button, #topQuickAction')) {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && Math.min(r.width, r.height) < 28) { problems.push(`tiny tap target: "${(el.textContent || '').trim().slice(0, 20)}" (${Math.round(r.width)}x${Math.round(r.height)})`); break; }
    }
  }
  return problems;
}

async function boot(browser, url, size) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, hasTouch: size.width < 768 });
  const page = await ctx.newPage();
  if (process.env.DEXIE_FILE) {
    const body = fs.readFileSync(process.env.DEXIE_FILE, 'utf8');
    await page.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body }));
  }
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 140)));
  await page.goto(url);
  await page.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0, null, { timeout: 20000 });
  await page.waitForTimeout(300);
  return { ctx, page, errors };
}

async function openStudy(page, id) {
  await page.evaluate(async (nodeId) => {
    const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState;
    a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId };
    UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 150));
  }, id);
}

(async () => {
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch();
  let failures = 0, checks = 0;
  const report = (size, state, problems) => {
    checks++;
    if (problems.length) { failures++; console.log(`  FAIL ${size} · ${state}\n       - ${problems.slice(0, 4).join('\n       - ')}`); }
  };

  for (const [sizeName, size] of SIZES) {
    const { ctx, page, errors } = await boot(browser, url, size);
    const check = async (state) => {
      await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); // web fonts change text metrics
      await page.waitForTimeout(80);
      report(sizeName, state, await page.evaluate(measure));
    };
    const phone = size.width < 768;

    // Study: every step on phones, plus the answered state
    for (const id of STUDY_NODES) {
      await openStudy(page, id);
      if (phone) {
        for (const step of ['question', 'answer']) {
          await page.evaluate((st) => document.querySelector(`[data-step-go="${st}"]`)?.click(), step);
          await check(`study ${id} · step ${step}`);
        }
      } else {
        await check(`study ${id}`);
      }
      const submit = await page.$('#btnSubmitAnswer');
      if (submit) {
        await submit.click({ force: true }).catch(() => {});
        await page.waitForTimeout(150);
        await check(`study ${id} · result`);
      }
    }
    // Study sheets
    await openStudy(page, STUDY_NODES[0]);
    for (const sheet of ['queue', 'filters']) {
      await page.evaluate((s) => document.querySelector(`[data-open-sheet="${s}"]`)?.click(), sheet);
      await page.waitForTimeout(100);
      await check(`study sheet ${sheet}`);
      await page.evaluate(() => document.querySelector('[data-close-sheet]')?.click());
    }

    // Other views, every segmented tab in each
    for (const nav of ['mock', 'readiness', 'bank', 'settings']) {
      await page.evaluate((n) => document.querySelector(`.nav-link[data-nav="${n}"]`)?.click(), nav);
      await page.waitForTimeout(250);
      await check(nav);
      const tabs = await page.$$('#appRoot .seg > button');
      for (let i = 0; i < tabs.length; i++) {
        const t = (await page.$$('#appRoot .seg > button'))[i];
        const label = ((await t.textContent()) || '').trim();
        await t.click({ force: true }); await page.waitForTimeout(150);
        await check(`${nav} · tab ${label}`);
      }
    }
    // Mock in progress
    await page.evaluate(() => document.querySelector('.nav-link[data-nav="mock"]')?.click());
    await page.waitForTimeout(150);
    if (await page.$('#btnStartMockPaper')) {
      await page.evaluate(() => document.querySelector('#btnStartMockPaper').click()); await page.waitForTimeout(400);
      await check('mock in progress');
      await page.evaluate(() => document.querySelector('[data-open-mock-grid]')?.click()); await page.waitForTimeout(100);
      await check('mock question grid');
      await page.evaluate(() => document.querySelector('[data-close-mock-grid]')?.click()); await page.waitForTimeout(100);
      await page.evaluate(() => document.querySelector('#btnSubmitMockPaper')?.click()); await page.waitForTimeout(500);
      if (await page.$('#btnFinalizeMockPaper')) {
        await check('mock self-marking');
        await page.evaluate(() => document.querySelector('#btnFinalizeMockPaper').click()); await page.waitForTimeout(500);
      }
      if (await page.$('#btnNewMockPaper')) {
        await check('mock results');
        const count = (await page.$$('#appRoot .seg > button')).length;
        for (let i = 0; i < count; i++) {
          const t = (await page.$$('#appRoot .seg > button'))[i];
          const label = ((await t.textContent()) || '').trim();
          await t.click({ force: true }); await page.waitForTimeout(150);
          await check(`mock results · tab ${label}`);
        }
      } else {
        report(sizeName, 'mock results', ['results screen not reached after submitting the paper']);
      }
    }

    if (errors.length) { failures++; console.log(`  FAIL ${sizeName} · page errors: ${errors.slice(0, 3).join(' | ')}`); }
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`\n${checks} states checked; ${failures} with problems`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
