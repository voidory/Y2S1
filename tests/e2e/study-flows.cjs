/*
 * Interaction checks for the study flow on a phone-size screen: step switching keeps typed answers, grading moves to
 * Result, Next resets to Question, the written-answer/rubric flow completes, sheets close, tabs navigate, and the
 * bank search keeps focus. Needs a browser:  npx playwright install chromium  &&  npm run test:flows
 * If unpkg is unreachable, set DEXIE_FILE to a local copy of dexie@4.0.10/dist/dexie.mjs.
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
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const p = await ctx.newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
  await p.goto(url);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  const open = (id) => p.evaluate(async (nodeId) => {
    const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState;
    a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId };
    UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 200));
  }, id);
  const step = () => p.evaluate(() => document.getElementById('studyView')?.dataset.step);
  const vis = (sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; }, sel);

  // 1. typed answer survives step switching, then grades and lands on Result
  // the node has two variants (short answer, written answer) and one is drawn at random: redraw until the short one comes up
  for (let i = 0; i < 25; i++) {
    await open('bk-c2-ice');
    if (await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current?.inst.variant.inputSlot.type) === 'typed_short') break;
  }
  ok(await step() === 'question', 'a new question starts on the Question step');
  ok(!(await vis('.pane-a')), 'the answer pane is hidden on the Question step');
  await p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]').click());
  ok(await step() === 'answer' && await vis('.pane-a') && !(await vis('.pane-q')), 'tapping Answer shows the answer pane only');
  const inputSel = (await p.$('#shortAnsInput')) ? '#shortAnsInput' : null;
  if (inputSel) {
    await p.fill(inputSel, '7.5');
    await p.evaluate(() => document.querySelector('.seg [data-step-go="question"]').click());
    await p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]').click());
    ok((await p.inputValue(inputSel)) === '7.5', 'typed text survives switching Question <-> Answer');
  } else console.log('skip  (this variant has no short input)');
  ok(await vis('#btnSubmitAnswer'), 'Submit & Grade is visible on the Answer step');
  await p.evaluate(() => document.querySelector('#btnSubmitAnswer').click());
  await p.waitForTimeout(250);
  ok(await step() === 'result', 'grading moves to the Result step automatically');
  ok(await vis('#btnNextQuestion'), 'Next Priority Question is visible on the Result step');
  ok(!(await p.$eval('.seg [data-step-go="result"]', (e) => e.disabled)), 'the Result tab is enabled after grading');
  await p.evaluate(() => document.querySelector('#btnNextQuestion').click());
  await p.waitForTimeout(300);
  ok(await step() === 'question', 'Next starts the next question on the Question step');

  // 2. choice question
  await open('bk-c1-vsepr-tut1');
  await p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]').click());
  ok(await vis('#btnSubmitAnswer'), 'mapped-fields question: Submit visible on Answer step');

  // 3. synthesis (rubric) flow
  // the node has several variants and one is drawn at random: reload until the written-answer variant comes up
  let area = null;
  for (let i = 0; i < 25 && !area; i++) {
    await open('bk-c1-resonance-count');
    await p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]').click());
    area = await p.$('textarea');
  }
  ok(!!area, 'written-answer question shows a text area on the Answer step');
  if (area) {
    await area.fill('Ozone has two resonance forms with formal charges +1 and -1; perchlorate has an expanded octet; nitrate has N with formal charge +1 and three forms.');
    ok(await vis('#btnUnlockRubric'), 'Unlock rubric button is visible');
    await p.evaluate(() => { const b = document.querySelector('#btnUnlockRubric'); if (b && !b.disabled) b.click(); });
    await p.waitForTimeout(250);
    ok(!!(await p.$('#rubricSection')), 'rubric appears after unlocking');
    ok(await step() === 'answer', 'the rubric stays on the Answer step');
    await p.evaluate(() => document.querySelectorAll('#rubricSection input[type=checkbox]').forEach((c) => c.click()));
    await p.waitForTimeout(150);
    await p.evaluate(() => document.querySelector('#btnFinalizeRubric')?.click());
    await p.waitForTimeout(350);
    ok(await step() === 'result', 'finalising the rubric lands on the Result step');
  }

  // 4. sheets
  await open('bk-c4-clo2');
  await p.evaluate(() => document.querySelector('[data-open-sheet="queue"]').click());
  ok(await vis('[data-sheet-backdrop]'), 'the Queue sheet opens');
  const jump = await p.$('[data-jump-node]');
  const target = jump ? await jump.getAttribute('data-jump-node') : null;
  await p.evaluate(() => document.querySelectorAll('[data-jump-node]')[1]?.click());
  await p.waitForTimeout(300);
  ok(!(await vis('[data-sheet-backdrop]')), 'jumping to a queued question closes the sheet');
  await p.evaluate(() => document.querySelector('[data-open-sheet="filters"]').click());
  await p.evaluate(() => { const s = document.querySelector('#studyTierFilter'); s.value = 'atomic'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(300);
  ok(!(await vis('[data-sheet-backdrop]')), 'changing a filter closes the sheet and loads a question');
  ok(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.filters.tier) === 'atomic', 'the tier filter was applied');

  // 5. navigation
  for (const [nav, probe] of [['mock', '#btnStartMockPaper'], ['readiness', '[data-seg-ready]'], ['bank', '#bankSearchInput'], ['settings', '[data-seg-settings]'], ['study', '#studyView']]) {
    await p.evaluate((n) => document.querySelector(`.nav-link[data-nav="${n}"]`).click(), nav);
    await p.waitForTimeout(250);
    ok(!!(await p.$(probe)), `bottom tab "${nav}" opens its screen`);
  }
  ok(await p.evaluate(() => document.querySelector('.nav-link[data-variant="tab"][aria-current="page"]')?.dataset.nav) === 'study', 'the active tab is marked');

  // 6. bank search keeps focus while typing
  await p.evaluate(() => document.querySelector('.nav-link[data-nav="bank"]').click());
  await p.waitForTimeout(250);
  await p.click('#bankSearchInput');
  await p.keyboard.type('vsepr', { delay: 40 });
  await p.waitForTimeout(200);
  ok(await p.inputValue('#bankSearchInput') === 'vsepr', 'bank search: all typed characters are kept (focus no longer lost per keystroke)');
  ok(await p.evaluate(() => document.activeElement?.id) === 'bankSearchInput', 'bank search keeps keyboard focus');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall flows ok');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
