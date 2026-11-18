/*
 * CM2011 in the real app, on a phone-size screen: the module switch, calculation questions answered by typing numbers,
 * a wrong route being named, pick-one decision fields, progress and bank for the active module only, the mock
 * paper, and the module choice surviving a reload.
 * Needs a browser:  npm install  &&  npx playwright install chromium  &&  node tests/e2e/cm2011-flows.cjs
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
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  const boot = async () => { await p.goto(url); await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(500); };
  await boot();

  // 1. the switch
  const sw = await p.evaluate(() => { const s = document.querySelector('#moduleSwitch'); const r = s.getBoundingClientRect(); return { hidden: s.classList.contains('hidden'), opts: [...s.options].map((o) => o.value).join(), right: Math.round(r.right), w: innerWidth, val: s.value }; });
  ok(!sw.hidden && sw.opts === 'CM2011,CM2021' && sw.val === 'CM2021', `the header has a module switch (${sw.opts}, showing ${sw.val})`);
  ok(sw.right <= sw.w - 4, `the switch fits inside the phone header (right edge ${sw.right} of ${sw.w})`);
  const before = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.nodes.length);
  ok(before > 150 && await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.nodes.every((n) => n.moduleCode === 'CM2021')), `starts on CM2021 with only its questions (${before})`);

  await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(900);
  const st = await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { m: a.activeModule, n: a.nodes.length, all: a.nodes.every((x) => x.moduleCode === 'CM2011'), map: a.skillMap?.module, cur: a.current?.node.moduleCode }; });
  ok(st.m === 'CM2011' && st.all && st.n >= 30 && st.map === 'CM2011', `switching shows only CM2011 questions and its skill map (${st.n} questions)`);
  ok(st.cur === 'CM2011', 'the next question served is a CM2011 one');

  // 2. a calculation answered with the exact numbers
  const open = async (id, wantLabel) => {
    for (let i = 0; i < 40; i++) {
      await p.evaluate(async (nodeId) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 150)); }, id);
      if (!wantLabel || (await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current?.inst.variant.perspectiveLabel)) === wantLabel) return true;
    }
    return false;
  };
  const answerStep = () => p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
  const submit = async () => { await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(500); };
  const exact = () => p.evaluate(() => {
    const { Expr, UI } = window.__MASTERY_ENGINE__; const c = UI.appState.current;
    const out = {};
    for (const [k, s] of Object.entries(c.inst.variant.evaluator.targets)) out[k] = s.type === 'numeric' ? String(Number(Expr.evaluate(s.targetExpr, c.inst.scope)).toPrecision(5)) : String(Expr.evaluate(s.expectedExpr, c.inst.scope));
    return out;
  });
  const fillAll = async (vals) => { for (const [k, v] of Object.entries(vals)) { const sel = await p.$(`select#mf_${k}`); if (sel) await p.selectOption(`select#mf_${k}`, v); else await p.fill(`#mf_${k}`, v); } };

  ok(await open('bk-m11-t1-meansd'), 'opened the mean / s / %RSD question');
  await answerStep();
  ok(await p.evaluate(() => !!document.querySelector('#mf_m') && !!document.querySelector('#mf_s') && !!document.querySelector('#mf_rsd')), 'the three answer boxes are there');
  ok(await p.evaluate(() => !!document.querySelector('#studyView table th, #appRoot table th')), 'the replicate data is drawn as a table');
  await fillAll(await exact()); await submit();
  const g1 = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current.evalResult);
  ok(g1 && g1.normalizedGrade === 1 && g1.passed, 'the exact numbers earn full marks');

  // 3. a wrong route is named
  ok(await open('bk-m11-t1-ci', 't1-ci-n5'.replace('t1-ci-n5', 'n = 5')), 'opened the confidence-interval question (n = 5)');
  await answerStep();
  const ex = await exact();
  const hwWrong = await p.evaluate(() => { const { Expr, UI } = window.__MASTERY_ENGINE__; const c = UI.appState.current; return String((1.96 * Expr.evaluate('s', c.inst.scope) / Math.sqrt(5)).toPrecision(5)); });
  await fillAll({ ...ex, hw: hwWrong }); await submit();
  const note = await p.evaluate(() => [...document.querySelectorAll('[data-review-note]')].map((e) => e.textContent.trim()).join(' | '));
  ok(/Student’s t/.test(note), 'using z = 1.96 is named: ' + note.slice(0, 80));
  const tags = await p.evaluate(async () => { const db = await window.__MASTERY_ENGINE__.DB.init(); const l = await db.attemptLogs.orderBy('timestamp').reverse().first(); return l.errorTags || []; });
  ok(tags.some((t) => t.startsWith('calc:')), 'and recorded as a recurring-slip tag (' + tags.join(',') + ')');

  // 4. a pick-one decision field
  ok(await open('bk-m11-t1-qtest', 'n = 6'), 'opened the Q-test question (n = 6)');
  await answerStep();
  ok(await p.evaluate(() => !!document.querySelector('select#mf_dec')), 'the reject / keep decision is a drop-down');
  const exq = await exact();
  await fillAll({ ...exq, dec: exq.dec === 'reject' ? 'keep' : 'reject' }); await submit();
  const g3 = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current.evalResult);
  ok(g3 && !g3.fieldResults.dec.passed && g3.fieldResults.suspect.passed && g3.fieldResults.Q.passed, 'only the wrong decision is marked wrong');

  // 4b. weak spots: the topic by name, and the calculation slip in "recurring slips" once it has happened twice
  ok(await open('bk-m11-t1-ci'), 'opened another confidence-interval question');
  await answerStep();
  const ex2 = await exact();
  const hw2 = await p.evaluate(() => { const { Expr, UI } = window.__MASTERY_ENGINE__; const c = UI.appState.current; const n = Number(/n(\d)$/.exec(c.inst.variant.variantId)[1]); return String((1.96 * Expr.evaluate('s', c.inst.scope) / Math.sqrt(n)).toPrecision(5)); });
  await fillAll({ ...ex2, hw: hw2 }); await submit();
  await p.evaluate(() => { document.querySelector('.nav-link[data-nav="readiness"]').click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('[data-seg-ready="weak"]')?.click()); await p.waitForTimeout(400);
  const weak = await p.evaluate(() => document.querySelector('#appRoot').innerText);
  ok(/Statistics and uncertainty/.test(weak), 'weak spots names the CM2011 topic');
  ok(/used z = 1\.96/i.test(weak), 'recurring slips lists "You used z = 1.96…" after it happens twice');

  // 5. progress and bank only show the active module
  await p.evaluate(() => document.querySelector('.nav-link[data-nav="readiness"]').click()); await p.waitForTimeout(400);
  const prog = await p.evaluate(() => document.querySelector('#appRoot').innerText);
  await p.evaluate(() => document.querySelector('[data-seg-ready="skills"]')?.click()); await p.waitForTimeout(300);
  ok(/Ionic strength and activity|Slope, calibration and readings/.test(await p.evaluate(() => document.querySelector('#appRoot').innerText)), 'the skills tab lists CM2011 topics');
  await p.evaluate(() => document.querySelector('.nav-link[data-nav="bank"]').click()); await p.waitForTimeout(400);
  const bank = await p.evaluate(() => document.querySelector('#appRoot').innerText);
  ok(/\b3\d questions/.test(bank) && !/VSEPR/.test(bank), 'the bank lists only CM2011 questions');

  // 6. mock paper from CM2011
  await p.evaluate(() => document.querySelector('.nav-link[data-nav="mock"]').click()); await p.waitForTimeout(400);
  const mockTxt = await p.evaluate(() => document.querySelector('#appRoot').innerText);
  ok(/Topic 3b/.test(mockTxt) && !/Coordination: stability/.test(mockTxt), 'the mock setup lists CM2011 topics, not CM2021 chapters');
  ok(!/Metal-ID set/.test(mockTxt) && /Final-style paper/.test(mockTxt), 'the metal-ID card is gone and the final-style paper card is offered');
  await p.evaluate(() => document.querySelector('#btnStartMockPaper')?.click()); await p.waitForTimeout(700);
  const mock = await p.evaluate(() => { const m = window.__MASTERY_ENGINE__.UI.appState.mock; return { phase: m.phase, n: m.questions.length, mods: [...new Set(m.questions.map((q) => q.node.moduleCode))].join() }; });
  ok(mock.phase === 'in_progress' && mock.n > 0 && mock.mods === 'CM2011', `a mock paper is built from CM2011 only (${mock.n} questions)`);
  await p.evaluate(() => { const { UI } = window.__MASTERY_ENGINE__; UI.appState.mock.phase = 'setup'; UI.render(); }); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('#btnStartFinalPaper')?.click()); await p.waitForTimeout(700);
  const fin = await p.evaluate(() => { const m = window.__MASTERY_ENGINE__.UI.appState.mock; return { phase: m.phase, n: m.questions.length, secs: [...new Set(m.questions.map((q) => q.section))].length, label: /question 1 · errors/i.test(document.querySelector('#appRoot').innerText), marks: m.totalMarks }; });
  ok(fin.phase === 'in_progress' && fin.secs === 4 && fin.n >= 14 && fin.label, `the final-style paper has 4 sections and ${fin.n} parts (${fin.marks} marks), labelled on screen`);
  // answer every calculation in that paper with the exact numbers and submit it: they must all score in full
  const scored = await p.evaluate(async () => {
    const { UI, Expr } = window.__MASTERY_ENGINE__; const m = UI.appState.mock;
    let calcs = 0;
    for (const q of m.questions) {
      const v = q.inst.variant; if (v.evaluator.type !== 'mapped_fields_match' || !v.variables) continue;
      const a = {}; for (const [k, sp] of Object.entries(v.evaluator.targets)) a[k] = sp.type === 'numeric' ? String(Expr.evaluate(sp.targetExpr, q.inst.scope)) : String(Expr.evaluate(sp.expectedExpr, q.inst.scope));
      q.userInput = a; calcs++;
    }
    await UI.finalizeMockPaper();
    const done = UI.appState.mock.questions.filter((q) => q.inst.variant.variables);
    return { calcs, full: done.filter((q) => q.earnedMarks === q.inst.variant.marks).length, total: done.length, phase: UI.appState.mock.phase };
  });
  ok(scored.calcs > 5 && scored.full === scored.total, `exact answers earn full marks on every calculation in the paper (${scored.full}/${scored.total}), phase ${scored.phase}`);
  await p.evaluate(() => { const { UI } = window.__MASTERY_ENGINE__; UI.appState.mock.phase = 'setup'; UI.render(); });

  // 7. the choice survives a reload, and switching back restores CM2021
  await boot();
  ok(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.activeModule === 'CM2011' && document.querySelector('#moduleSwitch').value === 'CM2011'), 'after a reload the app is still on CM2011');
  await p.selectOption('#moduleSwitch', 'CM2021'); await p.waitForTimeout(900);
  const back = await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { m: a.activeModule, n: a.nodes.length, only: a.nodes.every((x) => x.moduleCode === 'CM2021'), map: a.skillMap?.module }; });
  ok(back.m === 'CM2021' && back.only && back.n === before && back.map === 'CM2021', `switching back restores the CM2021 question set (${back.n})`);
  // an install that predates CM2011 (no module row, no CM2011 content record) picks the module up on the next load
  await p.evaluate(async () => { const db = await window.__MASTERY_ENGINE__.DB.init(); await db.modules.delete('CM2011'); await db.settings.delete('bundledBank:CM2011'); await db.settings.delete('activeModule'); const ids = (await db.questionNodes.where('moduleCode').equals('CM2011').primaryKeys()); await db.questionNodes.bulkDelete(ids); });
  await boot();
  const up = await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { mods: a.modules.map((m) => m.moduleCode).sort().join(), active: a.activeModule, sw: [...document.querySelector('#moduleSwitch').options].length, c11: a.allNodes.filter((n) => n.moduleCode === 'CM2011').length }; });
  ok(up.mods === 'CM2011,CM2021' && up.active === 'CM2021' && up.sw === 2 && up.c11 >= 30, `an older install gains the CM2011 module and its questions (${up.mods}, ${up.c11} questions, still on ${up.active})`);
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall CM2011 flows ok');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
