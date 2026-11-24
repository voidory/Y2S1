/*
 * Answer-review checks on a phone-size screen: submit a wrong answer of each type and confirm the result screen shows
 * what is wrong: the written-answer checklist, the option states, the equation atom table, the set chips, the drawn
 * VSEPR shapes, and the mock review filter. Needs a browser:  npx playwright install chromium  &&  npm run test:review
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
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  await p.waitForTimeout(500);

  // open a node on the variant we want (the scheduler prefers unseen variants, so retry a few times)
  const open = async (id, wantLabel) => {
    for (let i = 0; i < 40; i++) {
      await p.evaluate(async (nodeId) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 150)); }, id);
      if (!wantLabel || (await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current?.inst.variant.perspectiveLabel)) === wantLabel) return true;
    }
    return false;
  };
  const answerStep = () => p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
  const submit = async () => { await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(400); };
  const kind = (k) => p.$(`[data-answer-review][data-review-kind="${k}"]`);

  // 1. equation: unbalanced
  ok(await open('bk-c4-haber', 'Recall'), 'opened the Haber equation question');
  await answerStep();
  ok(!(await p.$('[data-answer-review]')), 'no review card before answering');
  await p.fill('#equationAnsInput', 'N2 + H2 -> NH3');
  await submit();
  ok(!!(await kind('equation')), 'equation: review card shown');
  const eq = await p.evaluate(() => { const c = document.querySelector('[data-review-kind="equation"]'); return { text: c.textContent.replace(/\s+/g, ' '), bad: c.querySelectorAll('tbody tr.bg-rose-50').length }; });
  ok(eq.bad === 2 && /Not balanced: H \(2 vs 3\), N \(2 vs 1\)/.test(eq.text), 'equation: the atom table marks exactly H and N as wrong');
  ok(/Balanced reference/.test(eq.text) && /N₂ \+ 3H₂ → 2NH₃/.test(eq.text), 'equation: the balanced reference is shown, with subscripts');

  // 2. written answer: criteria met / missed
  ok(await open('bk-c4-inert-pair', 'Recall'), 'opened the written-answer question');
  await answerStep();
  await p.fill('textarea', 'The s electrons stay on the atom and do not take part in bonding, so lower oxidation states are favoured down the group.');
  await p.evaluate(() => document.querySelector('#btnUnlockRubric')?.click()); await p.waitForTimeout(250);
  await p.evaluate(() => { const c = document.querySelectorAll('#rubricSection input[type=checkbox]'); if (c[0]) c[0].click(); });
  await p.evaluate(() => document.querySelector('#btnFinalizeRubric')?.click()); await p.waitForTimeout(400);
  const rub = await p.evaluate(() => { const c = document.querySelector('[data-review-kind="rubric"]'); return c ? { met: [...c.querySelectorAll('[data-rubric-item]')].map((e) => e.dataset.met).join(''), text: c.textContent.replace(/\s+/g, ' ') } : null; });
  ok(rub && rub.met === '100', 'written answer: three criteria listed, only the first met (' + (rub && rub.met) + ')');
  ok(rub && /critical step/.test(rub.text) && /capped at 45%/.test(rub.text) && /do not take part in bonding/.test(rub.text), 'written answer: critical steps flagged, the cap explained in plain words, and your own text echoed');

  // 3. multiple choice: option states
  ok(await open('bk-c3-mo-principles', 'Conditions'), 'opened the select-all question');
  await answerStep();
  await p.evaluate(() => {
    const c = window.__MASTERY_ENGINE__.UI.appState.current; const v = c.inst.variant;
    const wrongIdx = v.inputSlot.options.findIndex((o) => !v.evaluator.targetIds.includes(o.id));
    document.querySelectorAll('#studyView input[type=checkbox], #studyView input[type=radio]')[wrongIdx]?.click();
  });
  await submit();
  const ch = await p.evaluate(() => [...document.querySelectorAll('[data-review-kind="choice"] [data-option-state]')].map((e) => e.dataset.optionState));
  ok(ch.includes('wrong') && ch.includes('missed'), 'choice: the wrong pick and the missed correct options are marked (' + ch.join(',') + ')');

  // 4. set: chips and companion fields
  ok(await open('lf-inv-M_H2O_6_3plus-unpaired-1'), 'opened a metal-ID question');
  await answerStep();
  await p.fill('#setTokenInput', 'Fe'); await p.click('#btnAddSetToken');
  await p.fill('#sf_name', 'hexaaquairon(III)');
  await submit();
  const set = await p.evaluate(() => { const c = document.querySelector('[data-review-kind="set"]'); return c ? c.textContent.replace(/\s+/g, ' ') : ''; });
  ok(/Not expected/.test(set) && /Fe/.test(set) && /You missed/.test(set) && /Ti/.test(set), 'set: Fe shown as not expected and Ti as missed');
  ok(/hexaaquairon\(III\)/.test(set), 'set: what you typed in the name field is shown (not blank)');

  // 5. drawn VSEPR shapes
  ok(await open('bk-c1-vsepr-ex1'), 'opened the VSEPR question');
  await answerStep();
  await p.fill('#mf_a', 'linear'); await p.fill('#mf_b', 'seesaw'); await p.fill('#mf_c', 'square pyramidal');
  await submit();
  const vs = await p.evaluate(() => [...document.querySelectorAll('[data-review-row]')].map((r) => ({ svgs: r.querySelectorAll('svg').length, text: r.textContent.replace(/\s+/g, ' ') })));
  ok(vs.length === 3 && vs[0].svgs === 2 && vs[2].svgs === 1 && /missed 1 lone pair/.test(vs[0].text), 'VSEPR: your shape drawn beside the right one, with the diagnosis');

  // 6. mock review: same card, a marks-lost filter, no raw ids
  await p.evaluate(() => document.querySelector('.nav-link[data-nav="mock"]').click()); await p.waitForTimeout(250);
  await p.evaluate(() => document.querySelector('#btnStartMockPaper').click()); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('#btnSubmitMockPaper')?.click()); await p.waitForTimeout(600);
  if (await p.$('#btnFinalizeMockPaper')) { await p.evaluate(() => document.querySelector('#btnFinalizeMockPaper').click()); await p.waitForTimeout(700); }
  await p.evaluate(() => document.querySelector('[data-seg-mock="questions"]')?.click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!document.querySelector('[data-review-filter="missed"]')) && !(await p.textContent('#appRoot')).includes('mock-1'), 'mock review: filter chips present and no raw mock id');
  ok(await p.evaluate(() => document.querySelectorAll('[data-mock-review-q] [data-answer-review]').length > 0), 'mock review: questions show the same answer-review card');
  const before = await p.evaluate(() => document.querySelectorAll('[data-mock-review-q]').length);
  const chipCount = await p.evaluate(() => Number(document.querySelector('[data-review-filter="missed"]').textContent.match(/\((\d+)\)/)[1]));
  await p.evaluate(() => document.querySelector('[data-review-filter="missed"]').click()); await p.waitForTimeout(300);
  const after = await p.evaluate(() => document.querySelectorAll('[data-mock-review-q]').length);
  const noPassed = await p.evaluate(() => [...document.querySelectorAll('[data-mock-review-q]')].every((e) => !e.querySelector('.text-emerald-700.font-semibold')));
  ok(after === chipCount && after <= before && noPassed, `mock review: "Marks lost" shows exactly the ${chipCount} missed question(s) (${before} -> ${after})`);

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall answer-review checks ok');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
