import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent, diskFetch, fakeDb } from './helpers/load-engine.mjs';

const E = loadEngine();
const { Content, Scheduler, Evaluators, Expr, DB, Mastery } = E;
const bank = readContent('question-bank.json', 'cm2011');
const map = readContent('skill-map.json', 'cm2011');
const byId = Object.fromEntries(bank.questionNodes.map((n) => [n.id, n]));
const variantOf = (nodeId, variantId) => byId[nodeId].variants.find((v) => v.variantId === variantId);

/** Scope for a variant with chosen sampled values (the same derived loop the app runs). */
function scopeWith(variant, sampled) {
  const scope = { ...sampled };
  for (const [k, expr] of Object.entries(variant.variables?.derived || {})) scope[k] = Expr.evaluate(expr, scope);
  return scope;
}
const none = (a, msg) => assert.equal(JSON.stringify(Array.from(a)), '[]', msg);
const close = (a, b, rel = 0.005) => Math.abs(a - b) <= Math.abs(b) * rel + 1e-12;
const target = (spec, scope) => Number(Expr.evaluate(spec.targetExpr, scope));

test('bundle: every node validates, ids are unique and none collide with built-in namespaces', () => {
  const plan = Content.planBankSync(bank, null, new Set());
  none(plan.rejected, JSON.stringify(plan.rejected));
  assert.equal(plan.valid.length, bank.questionNodes.length);
  assert.ok(bank.questionNodes.every((n) => n.moduleCode === 'CM2011'));
});

test('skill map: valid, consistent with the bank, and every question belongs to a skill and a topic', () => {
  assert.equal(Content.validateSkillMap(map).valid, true, Content.validateSkillMap(map).errors.join('; '));
  const a = Content.analyzeSkillMap(map, new Set(bank.questionNodes.map((n) => n.id)));
  none(a.missingIds);
  none(a.inconsistent);
  none(a.unknownSkillRefs);
  none(a.orphanSkills);
  assert.ok(Math.abs(a.weightSum - 1) < 0.01, `weights sum to ${a.weightSum}`);
  for (const n of bank.questionNodes) assert.ok(map.nodeSkills[n.id]?.length, `${n.id} has a skill`);
  for (const c of map.chunks) assert.ok(Content.chunkNodeIds(map, c.id).length > 0, `${c.id} has questions`);
});

test('fuzz: every calculation instantiates cleanly, and the exact answer always scores full marks', () => {
  const problems = [];
  for (const n of bank.questionNodes) {
    for (const v of n.variants) {
      if (!v.variables) continue;
      for (let seed = 1; seed <= 150; seed++) {
        const inst = Scheduler.instantiateVariant(v, seed * 7919);
        const text = inst.resolvedStem + inst.resolvedExplanation + inst.resolvedHint;
        if (/\{\{|NaN|Infinity|undefined|\[object/.test(text)) { problems.push(`${v.variantId}#${seed}: bad text ${text.match(/\{\{[^}]*|NaN|Infinity|undefined/)?.[0]}`); break; }
        const bad = Object.entries(inst.scope).filter(([, x]) => typeof x === 'number' && !Number.isFinite(x));
        if (bad.length) { problems.push(`${v.variantId}#${seed}: non-finite ${bad.map((b) => b[0]).join(',')}`); break; }
        const input = {};
        for (const [k, spec] of Object.entries(v.evaluator.targets)) {
          if (spec.type === 'numeric') input[k] = String(target(spec, inst.scope));
          else if (spec.type === 'keyword') input[k] = String(Expr.evaluate(spec.expectedExpr, inst.scope));
        }
        const res = Evaluators.evaluate(v, input, inst.scope, {}, n);
        if (res.normalizedGrade !== 1) { problems.push(`${v.variantId}#${seed}: exact answer scored ${res.normalizedGrade} ${JSON.stringify(Object.entries(res.fieldResults).filter(([, r]) => !r.passed).map(([k, r]) => [k, r.feedback]))}`); break; }
      }
    }
  }
  assert.deepEqual(problems.slice(0, 8), []);
});

test('fuzz: a deliberately wrong number fails, and the listed wrong routes are named when hit', () => {
  const problems = [];
  let named = 0, checked = 0;
  for (const n of bank.questionNodes) {
    for (const v of n.variants) {
      if (!v.variables) continue;
      for (let seed = 1; seed <= 40; seed++) {
        const inst = Scheduler.instantiateVariant(v, seed * 104729);
        for (const [k, spec] of Object.entries(v.evaluator.targets)) {
          if (spec.type !== 'numeric') continue;
          const t = target(spec, inst.scope);
          // a clear miss: 40% off
          const miss = Evaluators.evaluate(v, { [k]: String(t * 1.4 + 0.3) }, inst.scope, {}, n).fieldResults[k];
          if (miss.passed) problems.push(`${v.variantId}/${k}: 40% off still passes`);
          for (const p of spec.paths || []) {
            const pv = Number(Expr.evaluate(p.expr, inst.scope));
            if (!Number.isFinite(pv)) { problems.push(`${v.variantId}/${k}: path "${p.label.slice(0, 30)}" is not finite`); continue; }
            const tol = Math.max(spec.relTol ?? 0, 0.02);
            const same = Math.abs(pv - t) <= Math.abs(t) * tol + (spec.tolerance ?? 0);
            if (same) continue;              // this seed's wrong route happens to equal the right answer: nothing to name
            checked++;
            const r = Evaluators.evaluate(v, { [k]: String(pv) }, inst.scope, {}, n).fieldResults[k];
            if (r.passed) problems.push(`${v.variantId}/${k}: the wrong route "${p.label.slice(0, 30)}" scores as correct`);
            else if (r.note) named++;
          }
        }
      }
    }
  }
  assert.deepEqual([...new Set(problems)].slice(0, 8), []);
  assert.ok(checked > 200 && named / checked > 0.8, `wrong routes named ${named}/${checked}`);
});

/* ---------- golden checks against the printed answers in the sample papers ---------- */

test('golden: Q-test on the 2011-12 final data (AAS 0.704, ICP 0.630 against Q_crit 0.56)', () => {
  const v = variantOf('bk-m11-t1-qtest', 't1-q-n6');
  const aas = scopeWith(v, { v1: 0.1145, v2: 0.1135, v3: 0.1165, v4: 0.1123, v5: 0.1137, vs: 0.1023 });
  assert.ok(close(aas.Q, 0.704, 0.002), `AAS Q ${aas.Q}`);
  assert.equal(aas.dec, 'reject');
  assert.equal(aas.suspect, 0.1023);
  const icp = scopeWith(v, { v1: 0.1210, v2: 0.1195, v3: 0.1189, v4: 0.1173, v5: 0.1199, vs: 0.1110 });
  assert.ok(close(icp.Q, 0.630, 0.002), `ICP Q ${icp.Q}`);
  assert.equal(icp.dec, 'reject');
  // a keep case from the 2010/11 key's n = 8 value (Q_crit 0.468 → the paper's 0.47)
  assert.equal(variantOf('bk-m11-t1-qtest', 't1-q-n8').stem.includes('0.468'), true);
});

test('golden: pooled t-test on the 2011-12 data (s_pooled 1.463e-3, t_calc 5.6, different at 95%)', () => {
  const v = variantOf('bk-m11-t1-ttest2', 't1-t2-5v5');
  const s = scopeWith(v, { a1: 0.1145, a2: 0.1135, a3: 0.1165, a4: 0.1123, a5: 0.1137, b1: 0.1210, b2: 0.1195, b3: 0.1189, b4: 0.1173, b5: 0.1199, sh: 0 });
  assert.ok(close(s.m1, 0.1141, 0.0005) && close(s.m2, 0.1193, 0.0005));
  assert.ok(close(s.sp, 1.46343e-3, 0.01), `s_pooled ${s.sp}`);
  assert.ok(close(s.tc, 5.6, 0.01), `t ${s.tc}`);
  assert.equal(s.dec, 'different');
});

test('golden: Zn | Fe cell with activities (E_LHS −0.8242, E_RHS +0.6998, E_cell +1.524 V, spontaneous)', () => {
  const v = variantOf('bk-m11-e-cell', 'e-cell-znfe');
  const s = scopeWith(v, { c1: 0.02, c3: 0.00167, c2: 0.01333 });
  assert.ok(Math.abs(s.El + 0.8242) < 0.002, `E_LHS ${s.El}`);
  assert.ok(Math.abs(s.Er - 0.6998) < 0.002, `E_RHS ${s.Er}`);
  assert.ok(Math.abs(s.Ec - 1.524) < 0.003, `E_cell ${s.Ec}`);
  assert.equal(s.sp, 'yes');
  assert.ok(Math.abs(s.gz - 0.427) < 0.003 && Math.abs(s.g3 - 0.24) < 0.005 && Math.abs(s.g2 - 0.48) < 0.005, 'activity coefficients match the key (0.427, 0.24, 0.48)');
});

test('golden: E° of Al(OH)3 from Ksp (−0.6611 V then −2.323 V)', () => {
  const v = variantOf('bk-m11-e-ksp', 'e-ksp-al');
  const s = scopeWith(v, { km: 3 });
  assert.ok(Math.abs(s.E1 + 0.6611) < 0.001, `E1 ${s.E1}`);
  assert.ok(Math.abs(s.Et + 2.323) < 0.002, `E° ${s.Et}`);
  // a second, textbook check: AgCl / Ag has E° = +0.222 V
  const ag = scopeWith(variantOf('bk-m11-e-ksp', 'e-ksp-agcl'), { km: 1.8 });
  assert.ok(Math.abs(ag.Et - 0.222) < 0.002, `AgCl E° ${ag.Et}`);
});

test('golden: melamine in milk powder (27,500 ppm for 0.01580 g N, 50%, 0.4312 g)', () => {
  const v = variantOf('bk-m11-q-kjeldahl', 'q-kj-mel');
  const s = scopeWith(v, { w: 0.4312, mN: 0.0158, pc: 50 });
  assert.ok(close(s.ppm, 27500, 0.003), `ppm ${s.ppm}`);
});

test('golden: selectivity coefficient, lecture Example 6 (Ca²⁺ / Na⁺: K = 6.9 × 10⁻²)', () => {
  const v = variantOf('bk-m11-p-sel', 'p-sel-ca-na');
  const s = scopeWith(v, { E1: -20.11, Kt: 0.05 });
  assert.ok(close(s.I2, 0.103, 0.001) && close(s.ai, 7.9e-4, 0.01) && close(s.aip, 4.0e-4, 0.02) && close(s.aj, 7.7e-2, 0.01), 'activities match the worked example');
  // with the lecture's potentials the formula gives the lecture's answer
  const k = Expr.evaluate('(ai * 10^((E2 - E1) / 29.6) - aip) / aj^(2 / 1)', { ...s, E1: -20.11, E2: -19.8 });
  assert.ok(close(k, 0.069, 0.04), `K ${k}`);
});

test('golden: slopes by charge (59.2, 29.6, 19.7 mV per decade)', () => {
  const s = scopeWith(variantOf('bk-m11-p-slope', 'p-slope-Caxx'), { f: 10 });
  assert.ok(close(s.s, 29.58, 0.002));
  assert.ok(close(scopeWith(variantOf('bk-m11-p-slope', 'p-slope-Alxx'), { f: 10 }).s, 19.72, 0.002));
  assert.ok(close(scopeWith(variantOf('bk-m11-p-slope', 'p-slope-Fx'), { f: 10 }).s, -59.16, 0.002));
  assert.ok(close(scopeWith(variantOf('bk-m11-p-ag2s', 'p-ag2s-s2'), {}).s, -29.58, 0.002), 'Ag₂S: −29.6 mV per decade of sulfide');
});

test('answer feedback: a wrong route is named, a sign slip is named, and a carried-forward value earns part credit', () => {
  const n = byId['bk-m11-t1-ci'], v = n.variants.find((x) => x.variantId === 't1-ci-n5');
  const inst = Scheduler.instantiateVariant(v, 4242);
  const sc = inst.scope;
  const z = Evaluators.evaluate(v, { m: sc.m, s: sc.s, hw: 1.96 * sc.s / Math.sqrt(5), inside: sc.inside }, sc, {}, n);
  assert.match(z.fieldResults.hw.note, /Student’s t/);
  // the half-width computed correctly from the student's own (wrong) s earns part credit
  const wrongS = sc.s * 1.5;
  const f = Evaluators.evaluate(v, { m: sc.m, s: wrongS, hw: 2.776 * wrongS / Math.sqrt(5), inside: sc.inside }, sc, {}, n);
  assert.equal(f.fieldResults.s.passed, false);
  assert.equal(f.fieldResults.hw.normalizedGrade, 0.5);
  assert.equal(f.fieldResults.hw.noteCode, 'carried-forward');
  // sign and power-of-ten slips
  const d = byId['bk-m11-e-thermo'].variants[0];
  const di = Scheduler.instantiateVariant(d, 77);
  const dg = di.scope.dG;
  const sl = byId['bk-m11-p-slope'].variants.find((x) => x.variantId === 'p-slope-Fx');
  const si = Scheduler.instantiateVariant(sl, 5);
  assert.equal(Evaluators.evaluate(sl, { s: 59.16, dE: si.scope.dE }, si.scope).fieldResults.s.noteCode, 'sign');
  assert.equal(Evaluators.evaluate(d, { dG: dg * 1000, lk: di.scope.lk }, di.scope).fieldResults.dG.noteCode, 'power-of-ten');
});

test('a decision field accepts the usual words and rejects the opposite', () => {
  const n = byId['bk-m11-t1-qtest'], v = n.variants[1];
  const spec = v.evaluator.targets.dec;
  const g = (word, expected) => Evaluators.evaluate({ ...v, evaluator: { type: 'mapped_fields_match', targets: { dec: { ...spec, expectedExpr: `'${expected}'` } } } }, { dec: word }, {}).passed;
  assert.equal(g('reject', 'reject'), true);
  assert.equal(g('Discard it', 'reject'), true);
  assert.equal(g('keep', 'reject'), false);
  assert.equal(g('retain', 'keep'), true);
  assert.equal(g('', 'keep'), false);
});

test('Expr helpers: mean, sd, nth, sum, fix and sci', () => {
  assert.equal(Expr.evaluate('mean(1,2,3,4)', {}), 2.5);
  assert.ok(Math.abs(Expr.evaluate('sd(2,4,4,4,5,5,7,9)', {}) - 2.13809) < 1e-4);
  assert.equal(Expr.evaluate('nth(2, 9, 3, 7)', {}), 7);
  assert.equal(Expr.evaluate('sum(1,2,3)', {}), 6);
  assert.equal(Expr.evaluate('fix(3.14159, 2)', {}), '3.14');
  assert.equal(Expr.evaluate('sci(3e-34, 1)', {}), '3.0\\times10^{-34}');
  assert.equal(Expr.evaluate('sci(9.996e5, 2)', {}), '1.00\\times10^{6}');
});

test('numeric grading: relative tolerance, absolute tolerance and unit-bearing display', () => {
  const g = (t, u, extra = {}) => Evaluators.evaluate({ evaluator: { type: 'numeric_match', targetExpr: String(t), ...extra } }, u, {});
  assert.equal(g(100, '100.9', { relTol: 0.01 }).passed, true);
  assert.equal(g(100, '102', { relTol: 0.01 }).passed, false);
  assert.equal(g(0, '0.004', { tolerance: 0.005 }).passed, true);
  assert.equal(g(4, '4.2').passed, false, 'the old default stays an absolute 0.01');
  assert.equal(g(1234.5678, '1', { relTol: 0.01, sig: 3, unit: 'mV' }).expectedDisplay, '1230 mV');
  assert.equal(g(0.000123456, '0', { relTol: 0.01, sig: 3 }).expectedDisplay, '1.23 × 10^-4');
});

/* ---------- multi-module plumbing ---------- */

test('syncAllBanks: loads both modules, keeps separate records, and is idempotent', async () => {
  const db = fakeDb();
  const r1 = await Content.syncAllBanks(db, diskFetch());
  assert.equal(r1.state, 'synced', JSON.stringify(r1.error));
  none(r1.rejected);
  const mods = new Set([...db.nodes.values()].map((n) => n.moduleCode));
  assert.equal([...mods].sort().join(), 'CM2011,CM2021');
  assert.ok(db.rows.get('bundledBank') && db.rows.get('bundledBank:CM2011'));
  assert.equal(db.rows.get('bundledBank:CM2011').ids.length, bank.questionNodes.length);
  const r2 = await Content.syncAllBanks(db, diskFetch());
  assert.equal(r2.state, 'up-to-date');
  // dropping a CM2011 node from the bundle removes only that node, never a CM2021 one
  const before21 = [...db.nodes.values()].filter((n) => n.moduleCode === 'CM2021').length;
  const trimmed = { ...bank, exportedAt: 'x', questionNodes: bank.questionNodes.slice(1) };
  const f = async (url) => (String(url).includes('cm2011/question-bank') ? { ok: true, status: 200, json: async () => trimmed } : diskFetch()(url));
  const r3 = await Content.syncAllBanks(db, f);
  assert.equal(r3.perModule.CM2011.removed, 1);
  assert.equal([...db.nodes.values()].filter((n) => n.moduleCode === 'CM2021').length, before21);
});

test('syncAllBanks: one module failing to load does not stop the other', async () => {
  const db = fakeDb();
  const f = async (url) => (String(url).includes('cm2011') ? { ok: false, status: 500, json: async () => ({}) } : diskFetch()(url));
  const r = await Content.syncAllBanks(db, f);
  assert.equal(r.state, 'unavailable');
  assert.match(r.error, /CM2011/);
  assert.ok([...db.nodes.values()].some((n) => n.moduleCode === 'CM2021'));
});

test('loadAllSkillMaps returns one valid map per module', async () => {
  const r = await Content.loadAllSkillMaps(diskFetch());
  assert.equal(r.error, null);
  assert.equal(Object.keys(r.maps).sort().join(), 'CM2011,CM2021');
  assert.equal(r.maps.CM2011.module, 'CM2011');
});

test('mastery: CM2011 questions map to their skills, so card-time retirement works for them too', () => {
  const id = 'bk-m11-t1-ci';
  assert.equal([...Mastery.skillsOfNode(map, id)].join(), 'm11.t1.ci');
  const logs = [];
  for (let i = 0; i < 3; i++) { logs.push({ nodeId: id, variantId: 'x', timestamp: i, normalizedGrade: 1 }); for (let k = 0; k < 7; k++) logs.push({ nodeId: 'bk-m11-t1-qtest', variantId: 'y', timestamp: 100 * i + k, normalizedGrade: 0.5 }); }
  const ev = Mastery.evaluate(logs, map, bank.questionNodes, {}, { removed: {}, resetAt: {} });
  assert.ok(ev, 'evaluates against the CM2011 map');
});

test('final-style paper: four sections, only CM2011 questions, sensible marks, fresh data each time', () => {
  const recipe = Scheduler.FINAL_RECIPES.CM2011;
  assert.equal(recipe.sections.length, 4);
  const seenStems = new Set();
  for (let i = 0; i < 40; i++) {
    const paper = Scheduler.assembleRecipePaper(bank.questionNodes, recipe, { random: Math.random });
    assert.equal(paper.sections.length, 4);
    assert.ok(paper.questions.length >= 15 && paper.questions.length <= 22, `${paper.questions.length} parts`);
    assert.ok(paper.totalMarks >= 70 && paper.totalMarks <= 120, `${paper.totalMarks} marks`);
    assert.ok(paper.sections.every((s) => s.marks >= 15 && s.marks <= 32), paper.sections.map((s) => s.marks).join());
    assert.equal(new Set(paper.questions.map((q) => q.node.id + q.inst.variant.variantId)).size, paper.questions.length, 'no question is used twice');
    assert.ok(paper.questions.every((q) => q.node.moduleCode === 'CM2011' && q.inst && q.section && q.userInput !== undefined));
    assert.equal(paper.questions.reduce((a, q) => a + q.inst.variant.marks, 0), paper.totalMarks);
    seenStems.add(paper.questions[0].inst.resolvedStem);
  }
  assert.ok(seenStems.size > 10, 'each paper has fresh random data');
  // every id in the recipe exists in the bundle
  const ids = new Set(bank.questionNodes.map((n) => n.id));
  for (const s of recipe.sections) for (const part of s.parts) for (const id of part) assert.ok(ids.has(id), id);
});
