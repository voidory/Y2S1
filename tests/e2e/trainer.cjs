/*
 * Terms trainer: the nav tab (CM2021 only), every drill answered right through the real inputs, a wrong answer, the chained questions,
 * stats saved, and no page scroll on phone and laptop.
 *   node tests/e2e/trainer.cjs   (DEXIE_FILE as in the other suites)
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

/* runs in the page: fill the current card with the answers its own check() says are right, optionally spoil one, then press Check */
const answerCard = (spoil) => {
  const { UI } = window.__MASTERY_ENGINE__, s = UI.appState.tr.sess, c = s.card, want = c.check({}).want;
  const setVal = (el, v) => { el.value = v; };
  if (c.chips) {
    const keys = Object.keys(want).sort();
    keys.forEach((k, i) => { const b = [...document.querySelectorAll('[data-tr-chip]')].find((x) => !x.disabled && x.textContent.trim() === want[k]); if (b) b.click(); });
  }
  document.querySelectorAll('[data-tr-f]').forEach((el) => setVal(el, want[el.dataset.trF] ?? ''));
  for (const f of c.fields) if (f.type === 'pick') { const r = document.querySelector(`input[data-tr-pick="${f.key}"][value="${want[f.key] === 'high spin' ? 'hs' : 'ls'}"]`); if (r) r.checked = true; }
  if (spoil) { const el = document.querySelector('[data-tr-f]'); if (el) el.value = '9999'; }
  document.getElementById('trCheck').click();
};

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${srv.address().port}/index.html`;
  const b = await chromium.launch();
  for (const [name, vp] of [['laptop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]]) {
    const p = await (await b.newContext({ viewport: vp, hasTouch: name === 'phone' })).newPage();
    if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
    const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
    await p.goto(url);
    await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(500);
    const vis = () => p.evaluate(() => [...document.querySelectorAll('[data-nav="trainer"]')].some((b) => b.offsetParent !== null));
    await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(800);
    ok(!(await vis()), `${name}: no Terms tab in CM2011`);
    await p.selectOption('#moduleSwitch', 'CM2021'); await p.waitForTimeout(800);
    ok(await vis(), `${name}: the Terms tab shows for CM2021`);
    const noScroll = async (label) => { const m = await p.evaluate(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth })); ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${name}: ${label}: the page does not scroll (${m.sw}x${m.sh} in ${m.iw}x${m.ih})`); };
    await p.evaluate(() => [...document.querySelectorAll('[data-nav="trainer"]')].find((x) => x.offsetParent !== null).click()); await p.waitForTimeout(500);
    await noScroll('home');
    const kinds = await p.evaluate(() => Object.keys(window.__MASTERY_ENGINE__.Trainer.KINDS));
    ok(kinds.length === 16 && (await p.locator('[data-tr-start]').count()) === 16, `${name}: a drill button for each of the ${kinds.length} steps`);

    // every drill, answered right through the inputs
    const only = name === 'phone' ? ['table', 'tsbands', 'tsread', 'tsratio'] : kinds;
    for (const k of only) {
      await p.evaluate((kk) => document.querySelector(`[data-tr-start="${kk}"]`).click(), k); await p.waitForTimeout(500);
      let n = 0, allRight = true;
      while (await p.evaluate(() => !!document.querySelector('[data-tr-card]')) && n < 14) {
        await p.evaluate(answerCard, false); await p.waitForTimeout(60);
        const verdict = await p.evaluate(() => document.querySelector('[data-tr-verdict]')?.textContent || '');
        if (!/Correct/.test(verdict)) { allRight = false; console.log('   not correct on', k, n, verdict); }
        if (n === 0 && (k === 'tsbands' || k === 'table' || k === 'tsratio')) await noScroll(`${k} card (graded)`);
        await p.evaluate(() => document.getElementById('trNext').click()); await p.waitForTimeout(60); n++;
      }
      const sum = await p.evaluate(() => document.querySelector('h2')?.textContent || '');
      ok(allRight && /steps right/.test(sum) && new RegExp(`${n} of ${n} steps`).test(sum), `${name}: ${k}: ${n} cards, all right (${sum.replace(/\s+/g, ' ').slice(0, 50)})`);
      await p.evaluate(() => document.getElementById('trHome').click()); await p.waitForTimeout(100);
    }
    const st = await p.evaluate(async () => { const db = await window.__MASTERY_ENGINE__.DB.init(); return (await db.settings.get('trainerStats'))?.stats || null; });
    ok(st && st.count && st.count.seen >= 1 || name === 'phone', `${name}: stats are saved (${st ? Object.keys(st).length + ' steps' : 'none'})`);

    // a wrong answer is marked wrong and shows the right one
    await p.evaluate(() => document.querySelector('[data-tr-start="count"]').click()); await p.waitForTimeout(300);
    await p.evaluate(answerCard, true); await p.waitForTimeout(80);
    ok(await p.evaluate(() => /Not quite/.test(document.querySelector('[data-tr-verdict]').textContent) && /Answer:/.test(document.querySelector('[data-tr-card]').textContent)), `${name}: a wrong count is marked wrong and the answer is shown`);
    const before = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.trStats.count);
    ok(before.seen >= 1 && before.right < before.seen, `${name}: the miss is counted (${before.right}/${before.seen})`);
    await p.evaluate(() => document.getElementById('trEnd').click()); await p.waitForTimeout(100);

    // chains
    await p.evaluate(() => document.querySelector('[data-tr-tab="chain"]').click()); await p.waitForTimeout(150);
    for (const id of ['micro', 'ts', 'bands']) {
      await p.evaluate((i) => document.querySelector(`[data-tr-chain="${i}"]`).click(), id); await p.waitForTimeout(600);
      let n = 0, right = true;
      while (await p.evaluate(() => !!document.querySelector('[data-tr-card]')) && n < 30) {
        await p.evaluate(answerCard, false); await p.waitForTimeout(40);
        if (!/Correct/.test(await p.evaluate(() => document.querySelector('[data-tr-verdict]')?.textContent || ''))) right = false;
        await p.evaluate(() => document.getElementById('trNext').click()); await p.waitForTimeout(40); n++;
      }
      ok(right && n >= 2, `${name}: chain ${id}: ${n} steps, all right`);
      ok(await p.evaluate(() => /steps right/.test(document.querySelector('h2').textContent) && !!document.getElementById('trAgain')), `${name}: chain ${id}: summary with Again`);
      await p.evaluate(() => document.getElementById('trHome').click()); await p.waitForTimeout(100);
      await p.evaluate(() => document.querySelector('[data-tr-tab="chain"]').click()); await p.waitForTimeout(100);
    }
    ok(errs.length === 0, `${name}: no page errors` + (errs.length ? ': ' + errs.join(' | ') : ''));
    await p.context().close();
  }
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\ntrainer ok'); process.exit(fails ? 1 : 0);
})();
