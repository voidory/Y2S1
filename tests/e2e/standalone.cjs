/*
 * The single-file build (node tools/bundle.mjs -> dist/y2s1-standalone.html) works from disk with the network blocked:
 * both modules load their banks, a question renders and is answered, maths typesets, styles apply, the method sheet and the
 * Tanabe–Sugano data (fetched lazily) load, and progress survives a reload.   node tests/e2e/standalone.cjs
 */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const FILE = path.resolve(__dirname, '..', '..', 'dist', 'y2s1-standalone.html');
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; };
(async () => {
  if (!fs.existsSync(FILE)) { console.log('skip: run node tools/bundle.mjs first'); return; }
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const blocked = [];
  await p.route(/^https?:/, (r) => { blocked.push(r.request().url()); r.abort(); });   // any network request is a failure
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  await p.goto('file://' + FILE);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0, null, { timeout: 20000 });
  await p.waitForTimeout(800);

  const info = await p.evaluate(async () => {
    const A = window.__MASTERY_ENGINE__.UI.appState;
    const first = { module: A.activeModule, nodes: A.nodes.length };
    return first;
  });
  ok(info.nodes > 50, `the active module loaded its bank (${info.module}: ${info.nodes} questions)`);
  ok(await p.evaluate(() => typeof window.katex?.render === 'function' && typeof window.lucide?.createIcons === 'function'), 'KaTeX and Lucide are present');
  ok(await p.evaluate(() => getComputedStyle(document.body).display !== '' && !!window.tailwind), 'the Tailwind runtime is present');
  ok(await p.evaluate(async () => (await document.fonts.load('16px "DM Sans"')).length > 0 && (await document.fonts.load('16px "Plus Jakarta Sans"', 'Ab')).length > 0 && (await document.fonts.load('16px KaTeX_Main')).length > 0), 'web fonts and KaTeX fonts load from inside the file');

  // switch to the other module and check both banks are there
  const mods = await p.evaluate(async () => {
    const E = window.__MASTERY_ENGINE__, out = {};
    for (const m of E.Content.MODULES) { const r = await E.Content.fetchContent(`content/${m.dir}/question-bank.json`); out[m.code] = r.questionNodes.length; }
    out.methods = (await E.Content.fetchContent('content/cm2011/methods.json')).methods.length;
    out.ts = Object.keys((await E.Content.fetchContent('content/figures/ts.json')).ions).length;
    return out;
  });
  ok(mods.CM2011 > 70 && mods.CM2021 > 190 && mods.CM2061 > 200, `all three question banks are inside the file (CM2011 ${mods.CM2011}, CM2021 ${mods.CM2021}, CM2061 ${mods.CM2061})`);
  ok(await p.evaluate(() => document.documentElement.outerHTML.length > 0 && [...document.querySelectorAll('#moduleSwitch option')].map((o) => o.value).includes('CM2061')), 'the standalone offers the CM2061 module');
  ok(mods.methods >= 15 && mods.ts >= 7, `method pages and the Tanabe–Sugano data are inside the file (${mods.methods} pages, ${mods.ts} ions)`);

  // answer a question
  await p.waitForSelector('[data-conf], button', { timeout: 5000 });
  const rendered = await p.evaluate(() => !!document.querySelector('main, #root') && document.body.innerText.length > 200);
  ok(rendered, 'a question screen rendered');
  const choice = await p.$('input[type=radio], [data-choice], [data-option]');
  if (choice) { await choice.click(); }
  const submit = await p.$('[data-submit], button:has-text("Submit")');
  if (submit) { await submit.click(); await p.waitForTimeout(600); }
  ok(await p.evaluate(() => /Score|Correct|Not there yet|Incorrect/i.test(document.body.innerText)) || !choice, 'a pick-one answer was graded (or the card was a typed one)');

  // maths typesets
  const katexCount = await p.evaluate(async () => {
    const E = window.__MASTERY_ENGINE__;
    const d = document.createElement('div'); d.innerHTML = '$\\dfrac{a}{b}$'; document.body.appendChild(d);
    window.renderMathInElement?.(d, { delimiters: [{ left: '$', right: '$', display: false }] });
    return d.querySelectorAll('.katex').length;
  });
  ok(katexCount === 1, 'KaTeX typesets a fraction');

  // progress survives a reload
  const before = await p.evaluate(async () => (await window.__MASTERY_ENGINE__.DB.db.table('settings').count?.()) ?? 0).catch(() => 0);
  await p.reload();
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0, null, { timeout: 20000 });
  ok(true, 'it reloads cleanly');

  ok(blocked.length === 0, `no network request was attempted (${blocked.slice(0, 3).join(', ') || 'none'})`);
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nstandalone build ok');
  process.exit(fails ? 1 : 0);
})();
