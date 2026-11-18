/*
 * Plain-language guard on a phone-size screen: walk the screens a student reads and fail if internal wording comes back
 * (scheduler numbers, "Zero-Step Veto", "node", raw exam-style codes ...). Also checks the pieces that replaced them:
 * the topic breadcrumb, "you'll see this again ...", queue reason tags, the collapsed hook box, the Overview's
 * "Where to start", and the content check living in Settings.
 * Needs a browser:  npx playwright install chromium  &&  npm run test:copy
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

const BANNED = [
  [/Stability S/i, 'scheduler "Stability S"'], [/Zero-Step|Veto/i, '"Zero-Step Veto"'], [/Canonical Derivation/i, '"Canonical Derivation"'],
  [/Fault Isolation/i, '"Fault Isolation"'], [/Mapped Response/i, '"Mapped Response Fields"'], [/Uncued/i, '"Uncued"'],
  [/Retention projection/i, '"Retention projection"'], [/Nodes attempted|Never attempted/i, 'node counts'], [/\bnodes?\b/i, 'the word "node"'],
  [/No built-in hook/i, '"No built-in hook"'], [/mcq_1mark|short_2to3|construct_4to6/, 'raw exam-style codes'], [/mock-\d{6,}/, 'a raw mock id'],
  [/Map-weighted/i, '"Map-weighted"'], [/Needs Review/, '"Needs Review"'], [/Next Priority/, '"Next Priority"'], [/≥\s?0\.7/, '"≥ 0.7"'],
];

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  await p.waitForTimeout(500);

  const guard = async (name) => {
    const text = await p.evaluate(() => document.body.innerText);
    const hits = BANNED.filter(([re]) => new RegExp(re.source, 'i').test(text)).map(([, label]) => label);
    ok(hits.length === 0, `${name}: no internal wording${hits.length ? ' (found ' + hits.join(', ') + ')' : ''}`);
  };
  const open = async (id, label) => {
    for (let i = 0; i < 40; i++) {
      await p.evaluate(async (nodeId) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 120)); }, id);
      if (!label || (await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current?.inst.variant.perspectiveLabel)) === label) return true;
    }
    return false;
  };
  const answerStep = () => p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
  const submit = async () => { await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(350); };
  const nav = async (n) => { await p.evaluate((x) => document.querySelector(`.nav-link[data-nav="${x}"]`).click(), n); await p.waitForTimeout(250); };

  // study: question, answer step, result
  ok(await open('bk-c1-vsepr-ex1'), 'opened a VSEPR question');
  await guard('question screen');
  const crumb = await p.evaluate(() => document.querySelector('#studyView .min-w-0.truncate, #studyView > div > div')?.textContent.replace(/\s+/g, ' ').trim());
  ok(/Shape & polarity \(VSEPR\)/.test(crumb) && /Quick drill/.test(crumb) && !/CM2021|W\d/.test(crumb), 'the header names the topic, not "CM2021 · W1 · Atomic": ' + crumb);
  await answerStep(); await guard('answer step');
  await p.fill('#mf_a', 'linear'); await p.fill('#mf_b', 'T-shaped'); await p.fill('#mf_c', 'square pyramidal'); await submit();
  await guard('result screen');
  const resText = await p.evaluate(() => document.querySelector('#studyView').innerText);
  ok(/Due for review (soon|in a few hours|tomorrow|in \d+ (days|weeks|months))/.test(resText), 'the result says when the question is due again, in words');
  ok(/Not there yet/i.test(resText) && /\bExplanation\b/i.test(resText), 'plain verdict and an "Explanation" heading');
  ok(!!(await p.$('details[data-add-hook]')) && !(await p.evaluate(() => document.querySelector('details[data-add-hook]').open)), 'with no built-in hook the hook box is one collapsed line, "＋ Add my hook"');
  await p.evaluate(() => document.querySelector('details[data-add-hook] summary').click()); await p.waitForTimeout(150);
  await p.fill('#myHookInput', 'two bonds and a lone pair bend it');
  await p.evaluate(() => document.querySelector('#myHookInput').blur()); await p.waitForTimeout(200);
  ok(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.myHooks['bk-c1-vsepr-ex1'] === 'two bonds and a lone pair bend it'), 'the hook can still be written and is saved');
  ok(await open('bk-c4-haber', 'Recall'), 'opened a question that has a built-in hook');
  await answerStep(); await p.fill('#equationAnsInput', 'N2 + H2 -> NH3'); await submit();
  ok(!!(await p.$('[data-memory-hook-block]')) && !(await p.$('details[data-add-hook]')), 'a question with a built-in hook still shows the full hook card');

  // written answer: the capped-score wording and the answer-step labels
  ok(await open('bk-c4-inert-pair', 'Recall'), 'opened a written-answer question');
  await answerStep();
  const answerText = await p.evaluate(() => document.querySelector('#studyView').innerText);
  ok(/Your answer \(write it from memory\)/i.test(answerText) && /marking points/i.test(answerText), 'the written-answer step is worded plainly');
  await p.fill('textarea', 'The s electrons stay on the atom and do not take part in bonding, so lower oxidation states are favoured down the group.');
  await p.evaluate(() => document.querySelector('#btnUnlockRubric')?.click()); await p.waitForTimeout(250);
  await guard('self-marking step');
  await p.evaluate(() => { const c = document.querySelectorAll('#rubricSection input[type=checkbox]'); if (c[0]) c[0].click(); });
  await p.evaluate(() => document.querySelector('#btnFinalizeRubric')?.click()); await p.waitForTimeout(400);
  await guard('written-answer result');
  ok(/Capped at 45%/.test(await p.evaluate(() => document.querySelector('#studyView').innerText)), 'a capped score says "Capped at 45%"');

  // queue sheet: reasons, not scores
  await open('bk-c1-vsepr-ex1');
  await p.evaluate(() => document.querySelector('[data-open-sheet="queue"]').click()); await p.waitForTimeout(250);
  const reasons = await p.evaluate(() => [...document.querySelectorAll('[data-queue-reason]')].map((e) => e.textContent.trim()));
  ok(reasons.length >= 3 && reasons.every((t) => /^(New|Weak spot|Due now|Overdue \d+d|Review soon)$/.test(t)), 'the queue shows a reason for each question: ' + [...new Set(reasons)].join(', '));
  const sheetText = await p.evaluate(() => document.querySelector('[data-queue-reason]').closest('.space-y-4').innerText);
  ok(!/\b\d+\.\d\b/.test(sheetText), 'no raw priority scores in the queue');
  await guard('queue sheet');
  await p.evaluate(() => document.querySelector('[data-close-sheet]')?.click());

  // a second VSEPR attempt so that topic has enough answers to be ranked
  await open('bk-c1-vsepr-ex1'); await answerStep();
  await p.fill('#mf_a', 'linear'); await p.fill('#mf_b', 'seesaw'); await p.fill('#mf_c', 'octahedral'); await submit();

  // progress
  await nav('readiness'); await guard('overview (with history)');
  const ov = await p.evaluate(() => document.querySelector('#appRoot').innerText);
  ok(/Where to start/.test(ov) && /Your weakest topic/.test(ov) && /Exam readiness/.test(ov) && /Questions tried/.test(ov) && /Answered well/.test(ov), 'the Overview leads with where to start, then plain readiness numbers');
  ok(!!(await p.$('details summary')) && /About these numbers/.test(ov), 'the model-based figure sits behind "About these numbers"');
  ok(!/Content gaps|coverage/i.test(ov), 'content-maintenance numbers are gone from the Overview');
  await p.evaluate(() => document.querySelector('[data-seg-jump="weak"]')?.click()); await p.waitForTimeout(250);
  ok(await p.evaluate(() => /Weakest topics/.test(document.querySelector('#appRoot').innerText)), '"See weak spots" jumps to that tab');
  for (const tab of ['chapters', 'skills', 'weak']) { await p.evaluate((t) => document.querySelector(`[data-seg-ready="${t}"]`).click(), tab); await p.waitForTimeout(250); await guard('progress · ' + tab); }
  await p.evaluate(() => document.querySelector('[data-seg-ready="chapters"]').click()); await p.waitForTimeout(250);
  ok(/% tried/.test(await p.evaluate(() => document.querySelector('#appRoot').innerText)), 'chapters speak of "tried" and "answered well"');

  // bank, mock, settings
  await nav('bank'); await guard('bank');
  ok(/questions/.test(await p.evaluate(() => document.querySelector('#appRoot').innerText)) && !/\bW\d+\b/.test(await p.evaluate(() => document.querySelector('#appRoot').innerText)), 'the bank counts questions and shows topics, not week codes');
  await nav('mock'); await guard('mock setup');
  await p.evaluate(() => document.querySelector('#btnStartMockPaper').click()); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('#btnSubmitMockPaper')?.click()); await p.waitForTimeout(600);
  if (await p.$('#btnFinalizeMockPaper')) { await p.evaluate(() => document.querySelector('#btnFinalizeMockPaper').click()); await p.waitForTimeout(700); }
  await guard('mock results'); await p.evaluate(() => document.querySelectorAll('#appRoot .seg > button')[1]?.click()); await p.waitForTimeout(300); await guard('mock question review');
  await nav('settings'); await p.evaluate(() => document.querySelector('[data-seg-settings="data"]')?.click()); await p.waitForTimeout(250);
  const data = await p.evaluate(() => document.querySelector('#appRoot').innerText);
  ok(/Content check/.test(data) && /Questions present/.test(data), 'the content check now lives in Settings, under Data');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall plain-language checks ok');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
