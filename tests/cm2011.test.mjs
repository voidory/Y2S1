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

test('pick-one options are shuffled (the key is not always first), keep their ids, and are seeded', () => {
  const picks = [];
  for (const n of bank.questionNodes) for (const v of n.variants) if (v.inputSlot.type === 'choice') picks.push(v);
  assert.ok(picks.length > 40, `${picks.length} pick-one variants`);
  assert.ok(picks.every((v) => v.inputSlot.shuffleOptions === true), 'every CM2011 pick-one variant opts in to shuffling');
  let keyFirst = 0;
  let total = 0;
  for (const v of picks) {
    const ids = v.inputSlot.options.map((o) => o.id).sort().join();
    for (let seed = 1; seed <= 12; seed++) {
      const a = Scheduler.instantiateVariant(v, seed * 104729);
      const b = Scheduler.instantiateVariant(v, seed * 104729);
      const order = a.variant.inputSlot.options.map((o) => o.id);
      assert.equal(order.slice().sort().join(), ids, `${v.variantId}: same options`);
      assert.equal(order.join(), b.variant.inputSlot.options.map((o) => o.id).join(), `${v.variantId}: same seed, same order`);
      assert.equal(v.inputSlot.options[0].id, v.evaluator.targetIds[0], `${v.variantId}: authored key-first`);
      if (order[0] === v.evaluator.targetIds[0]) keyFirst++;
      total++;
    }
  }
  assert.ok(keyFirst / total < 0.5, `the key is first in ${keyFirst} of ${total} instances`);
});

test('a variant that does not opt in keeps its authored option order', () => {
  const v = { variantId: 'x', stem: 's', inputSlot: { type: 'choice', selectionMode: 'single', options: [{ id: 'a', label: '1' }, { id: 'b', label: '2' }, { id: 'c', label: '3' }] }, evaluator: { type: 'choice_match', targetIds: ['a'] } };
  for (let seed = 1; seed <= 20; seed++) assert.equal(Scheduler.instantiateVariant(v, seed).variant.inputSlot.options.map((o) => o.id).join(), 'a,b,c');
});

test('second-half and spectroscopy drills: rubric marks add up, ordered lists and pick-one items are well formed', () => {
  const newIds = ['bk-m11-g-detectors', 'bk-m11-g-columns', 'bk-m11-g-tprog', 'bk-m11-g-inject', 'bk-m11-g-carrier', 'bk-m11-h-column', 'bk-m11-h-mode', 'bk-m11-h-order', 'bk-m11-h-gradient', 'bk-m11-h-detect', 'bk-m11-h-particles', 'bk-m11-g-ms', 'bk-m11-g-choose',
    'bk-m11-s-jablonski', 'bk-m11-s-fl-explain', 'bk-m11-s-fl-cal', 'bk-m11-s-aas-table', 'bk-m11-s-boltz', 'bk-m11-s-aes-aas', 'bk-m11-s-broad', 'bk-m11-s-icp'];
  for (const id of newIds) assert.ok(byId[id], `${id} is in the bundle`);
  for (const id of newIds.filter((x) => /-g-|-h-/.test(x))) assert.equal(byId[id].metadata.week, 10, `${id} is in week 10`);
  for (const id of newIds) {
    for (const v of byId[id].variants) {
      const t = v.evaluator.type;
      if (t === 'atomic_rubric') {
        const sum = v.evaluator.rubric.reduce((a, r) => a + r.marks, 0);
        assert.equal(sum, v.marks, `${v.variantId}: rubric adds to ${sum}, marks ${v.marks}`);
        assert.ok(v.evaluator.rubric.every((r) => r.criterion.length > 8), `${v.variantId}: criteria are not empty`);
        assert.ok(v.explanation.length > 60, `${v.variantId}: has a model answer`);
      } else if (t === 'order_match') {
        assert.ok(v.inputSlot.items.length >= 4);
        assert.equal(v.evaluator.targetOrder.join(), v.inputSlot.items.map((i) => i.id).join());
      } else if (t === 'choice_match') {
        assert.equal(v.evaluator.targetIds.length, 1);
        assert.ok(v.inputSlot.options.length >= 3);
        assert.ok(new Set(v.inputSlot.options.map((o) => o.label)).size === v.inputSlot.options.length, `${v.variantId}: distinct options`);
      }
    }
  }
});

test('golden: Boltzmann fractions for Na (2500 → 2520 K gives 1.15e-4 → 1.24e-4, about +8%)', () => {
  const v = variantOf('bk-m11-s-boltz', 'a-boltz-small');
  const sc = scopeWith(v, { T1: 2500, dT: 20 });
  assert.ok(close(sc.p1, 0.0115, 0.01), `p1 ${sc.p1}`);
  assert.ok(close(sc.p2, 0.0124, 0.01), `p2 ${sc.p2}`);
  assert.ok(close(sc.rise, 8.06, 0.01), `rise ${sc.rise}`);
  const big = scopeWith(variantOf('bk-m11-s-boltz', 'a-boltz-big'), { T1: 3500, dT: 1000 });
  assert.ok(close(big.p1, 0.187, 0.01) && close(big.p2, 0.881, 0.01), `${big.p1} ${big.p2}`);
});

test('golden: two-point fluorescence calibration (slope 0.03, intercept 0.08, I = 0.35 gives 9 µg/m³) and the no-intercept slip is named', () => {
  const v = variantOf('bk-m11-s-fl-cal', 'f-cal2');
  const sc = scopeWith(v, { m: 0.03, b: 0.08, c1: 4, c2: 24, cx: 9 });
  assert.ok(close(sc.slope, 0.03) && close(sc.icpt, 0.08) && close(sc.cxv, 9), JSON.stringify([sc.slope, sc.icpt, sc.cxv]));
  const res = Evaluators.evaluate(v, { slope: String(sc.slope), icpt: String(sc.icpt), cxv: String(sc.cnoint) }, sc, {}, byId['bk-m11-s-fl-cal']);
  assert.ok(res.normalizedGrade < 1);
  assert.match(JSON.stringify(res.fieldResults.cxv), /intercept/);
});

test('Jablonski labelling: the right names score full marks and a swapped pair does not', () => {
  const v = variantOf('bk-m11-s-jablonski', 'f-jab-labelAE');
  const sc = scopeWith(v, {});
  const right = { a: 'absorption', b: 'fluorescence', c: 'phosphorescence', d: 'internal conversion', e: 'intersystem crossing' };
  assert.equal(Evaluators.evaluate(v, right, sc, {}, byId['bk-m11-s-jablonski']).normalizedGrade, 1);
  const swapped = { ...right, b: 'phosphorescence', c: 'fluorescence' };
  const r = Evaluators.evaluate(v, swapped, sc, {}, byId['bk-m11-s-jablonski']);
  assert.ok(r.normalizedGrade > 0 && r.normalizedGrade < 1);
});

test('golden: the final\u2019s Q3 chain (benzoic acid, K 4.1, Ka 6.3e-5, pH 5: D 0.562, 1.85e-2 M left, 87.7% extracted, n = 10, 250 mL)', () => {
  const v = variantOf('bk-m11-x-acid', 'x-acid-chain');
  const sc = scopeWith(v, { K: 4.1, pKa: 4.2, off: 0.8, Vo: 25, r: 1, Vw: 100, C0: 0.15, Ct: 0.00001 });
  assert.equal(sc.Ka, 6.3e-5);
  assert.equal(sc.pH, 5);
  assert.ok(close(sc.D, 0.562, 0.005), `D ${sc.D}`);
  assert.ok(close(sc.C1, 1.85e-2, 0.005), `C1 ${sc.C1}`);
  assert.ok(close(sc.pct, 87.7, 0.002), `pct ${sc.pct}`);
  assert.ok(close(sc.Cb, 2.45e-6, 0.01), `Cb at pH 9 ${sc.Cb}`);
  assert.ok(close(sc.f2, 0.360, 0.005), `f2 ${sc.f2}`);
  assert.equal(sc.n, 10);
  assert.equal(sc.Vtot, 250);
  assert.equal(sc.which, 'the lower pH');
  // the three named slips are recognised
  const wrongD = Evaluators.evaluate(v, { D: String(sc.K), C1: String(sc.C1), pct: String(sc.pct), Cb: String(sc.Cb), which: 'the lower pH', f2: String(sc.f2), n: String(sc.n), Vtot: String(sc.Vtot) }, sc, {}, byId['bk-m11-x-acid']);
  assert.match(JSON.stringify(wrongD.fieldResults.D), /ionised/);
  const noRound = Evaluators.evaluate(v, { D: String(sc.D), C1: String(sc.C1), pct: String(sc.pct), Cb: String(sc.Cb), which: 'the lower pH', f2: String(sc.f2), n: String(sc.nex), Vtot: String(sc.Vtot) }, sc, {}, byId['bk-m11-x-acid']);
  assert.match(JSON.stringify(noRound.fieldResults.n), /Round up/);
});

test('golden: amine extraction from the lecture Q&A (K 3, Ka 1e-9: D 2.73 and 0.0058 M left at pH 10; D 0.273 and 0.0044 M in water at pH 8)', () => {
  const sc = scopeWith(variantOf('bk-m11-x-base', 'x-base'), { K: 3, pKa: 9.0, Vo: 50, Vw: 100, C0: 0.010 });
  assert.equal(sc.pHa, 10);
  assert.equal(sc.pHb, 8);
  assert.ok(close(sc.Da, 2.73, 0.005) && close(sc.Corg_a, 0.0058, 0.01), `${sc.Da} ${sc.Corg_a}`);
  assert.ok(close(sc.Db, 0.273, 0.005) && close(sc.Caq_b, 0.0044, 0.01), `${sc.Db} ${sc.Caq_b}`);
});

test('golden: one large vs several small extractions (K 3, 100 mL water, 500 mL solvent: 6.25% vs 0.098% after 5 x 100 mL; 5 portions for 0.1%)', () => {
  const sc = scopeWith(variantOf('bk-m11-x-repeat', 'x-repeat'), { Vaq: 100, Vtot: 500, ns: 5, K: 3, x: 0.1 });
  assert.ok(close(sc.q1, 6.25, 0.002), `q1 ${sc.q1}`);
  assert.ok(close(sc.q2, 0.0977, 0.005), `q2 ${sc.q2}`);
  assert.equal(sc.nn, 5);
  assert.equal(sc.which, 'several small extractions');
});

test('extraction drills: n is always a whole number between 1 and 25, and the fractions are sensible', () => {
  const v = variantOf('bk-m11-x-acid', 'x-acid-chain');
  for (let seed = 1; seed <= 300; seed++) {
    const sc = Scheduler.instantiateVariant(v, seed * 7727).scope;
    assert.ok(Number.isInteger(sc.n) && sc.n >= 1 && sc.n <= 25, `n = ${sc.n} (seed ${seed})`);
    assert.ok(sc.D > 0.05 && sc.D < 5, `D = ${sc.D}`);
    assert.ok(sc.fo > 0 && sc.fo < 1 && sc.f2 > 0 && sc.f2 < 1);
    assert.ok(sc.C1 < sc.C0 && sc.Cb < sc.C1, 'more is left in the organic phase at the lower pH');
  }
});

test('golden: pooled t from summary statistics (2025/26: 30.86 ± 3.63, N 20 v 8.68 ± 1.65, N 8; s_pooled 3.219, t 4.589, 26 df read at row 25 = 3.725)', () => {
  const v = variantOf('bk-m11-t1-ttest-final', 't-pooled-999-stats');
  const sc = scopeWith(v, { N1: 20, N2: 8, m2: 24.68, gap: 6.18, s1: 3.63, s2: 1.65 });
  assert.equal(sc.m1, 30.86);
  assert.equal(sc.df, 26);
  assert.ok(close(sc.sp, 3.219, 0.002), `sp ${sc.sp}`);
  assert.ok(close(sc.tc, 4.589, 0.002), `tc ${sc.tc}`);
  assert.equal(sc.tt, 3.725);
  assert.equal(sc.dec, 'different');
  // reading the 95% column, or df + 1, is named
  const slip = Evaluators.evaluate(v, { sp: String(sc.sp), tc: String(sc.tc), df: String(sc.df), tt: '2.060', dec: 'different' }, sc, {}, byId['bk-m11-t1-ttest-final']);
  assert.match(JSON.stringify(slip.fieldResults.tt), /95% column/);
});

test('golden: paired t at 99.9% (2024/25: d = 3,3,3,3,2,2,2,1 gives t 9.03 against 5.408) and at 99% with 12 pairs read at row 10 (2019/20: t 1.2 against 3.169)', () => {
  const v8 = variantOf('bk-m11-t1-ttest-final', 't-paired-999-n8');
  const a = scopeWith(v8, { bias: 0, e1: 3, e2: 3, e3: 3, e4: 3, e5: 2, e6: 2, e7: 2, e8: 1, x1: 10, x2: 10, x3: 10, x4: 10, x5: 9, x6: 9, x7: 9, x8: 9 });
  assert.ok(close(a.db, 2.375) && close(a.sd_, 0.744, 0.002), `${a.db} ${a.sd_}`);
  assert.ok(close(a.tc, 9.03, 0.002), `tc ${a.tc}`);
  assert.equal(a.tt, 5.408);
  assert.equal(a.dec, 'different');
  const v12 = variantOf('bk-m11-t1-ttest-final', 't-paired-99-n12');
  const e = [-2, -1, 0, 0, -1, 0, 1, 1, 1, 2, 2, 3];
  const sampled = { bias: 0 };
  e.forEach((x, i) => { sampled['e' + (i + 1)] = x; sampled['x' + (i + 1)] = 50; });
  const b = scopeWith(v12, sampled);
  assert.ok(close(b.db, 0.5) && close(b.sd_, 1.446, 0.003), `${b.db} ${b.sd_}`);
  assert.ok(close(b.tc, 1.198, 0.005), `tc ${b.tc}`);
  assert.equal(b.tt, 3.169);
  assert.equal(b.dec, 'same');
});

test('the booklet t table: next lower row for a df that is not listed, and the verdict-flip question', () => {
  const lib = (name) => name;
  const { levelsOk } = { levelsOk: true };
  assert.ok(levelsOk && lib);
  const lv = variantOf('bk-m11-t1-levels', 't-levels');
  const sc = scopeWith(lv, { tc: 3.4, dfv: 7 });
  assert.equal(sc.lvl, '98%');
  assert.equal(scopeWith(lv, { tc: 0.6, dfv: 7 }).lvl, 'none of the levels');
  assert.equal(scopeWith(lv, { tc: 7.5, dfv: 7 }).lvl, '99.9%');
  // 99% and 99.9% are different answers for a drop-down, even though one is the start of the other
  const r = Evaluators.evaluate(lv, { lvl: '99%' }, scopeWith(lv, { tc: 7.5, dfv: 7 }), {}, byId['bk-m11-t1-levels']);
  assert.equal(r.normalizedGrade, 0);
});

test('golden: PSI sub-indices from the lecture and the finals (PM2.5 70 → 116, 6 → 25, 24 → 64, 44 → 87, 30.86 → 72; PM10 70 → 60; SO2 9 → 6)', () => {
  const sub = (variantId, nodeId, c) => {
    const v = variantOf(nodeId, variantId);
    return target(v.evaluator.targets.psi, scopeWith(v, { c }));
  };
  const cases = [['psi-sub-pm25', 70, 116], ['psi-sub-pm25', 6, 25], ['psi-sub-pm25', 24, 64], ['psi-sub-pm25', 44, 87], ['psi-sub-pm25', 31, 72], ['psi-sub-pm10', 70, 60], ['psi-sub-so2', 9, 6]];
  for (const [id, c, want] of cases) assert.equal(sub(id, 'bk-m11-a-sub', c), want, `${id} at ${c}`);
});

test('PSI: the overall value is the largest sub-index, and the bottom-of-band slip is named', () => {
  const v = variantOf('bk-m11-a-overall', 'psi-overall');
  const scope = scopeWith(v, { a: 70, b: 70, s: 100 });
  assert.equal(scope.top, 116); assert.equal(scope.who, 'PM2.5'); assert.equal(scope.cat, 'unhealthy');
  const w = variantOf('bk-m11-a-sub', 'psi-sub-pm25');
  const res = Evaluators.evaluate(w, { psi: '117.0', cat: 'unhealthy' }, scopeWith(w, { c: 70 }), {}, byId['bk-m11-a-sub']);
  assert.ok(res.normalizedGrade > 0, 'within a whole-number tolerance');
  const bad = Evaluators.evaluate(w, { psi: '291.7', cat: 'unhealthy' }, scopeWith(w, { c: 70 }), {}, byId['bk-m11-a-sub']);
  assert.ok(/straight ratio/.test(JSON.stringify(bad.fieldResults.psi)), 'the ratio slip is named');
});

test('golden: breathing chain (8 L/min is 11.52 m3 a day; 40 ug/m3 is 168 mg a year, 14 cigarettes) and 3.6e-4 g in a day is 31.25 ug/m3 (PSI 72)', () => {
  const v = variantOf('bk-m11-a-cig', 'cig-year');
  const s = scopeWith(v, { rate: 8, c: 40 });
  assert.ok(close(s.vday, 11.52) && close(s.mgyr, 168.2, 0.01) && close(s.cigs, 14, 0.02));
  const b = variantOf('bk-m11-a-cig', 'cig-back');
  const t = scopeWith(b, { m: 360 });
  assert.ok(close(t.c, 31.25, 0.001) && t.psi === 72);
});
