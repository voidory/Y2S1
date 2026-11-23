import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Evaluators, Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const N = (id) => bank.questionNodes.find((n) => n.id === id);
const grade = (node, v, input) => Evaluators.evaluate(v, input, Scheduler.instantiateVariant(v, 1).scope, {}, node).normalizedGrade;
const IDS = ['bk-c4-isotope-gen', 'bk-c4-radical-gen'];

test('Kinjo batch 4: structure, skills, and model answers score full marks', () => {
  for (const id of IDS) {
    const n = N(id);
    assert.ok(n && n.variants.length >= 2, id);
    assert.ok(map.nodeSkills[id]?.length);
    for (const s of map.nodeSkills[id]) assert.ok(map.skills.find((k) => k.id === s).nodes.includes(id), `${id} in ${s}`);
    for (const v of n.variants) {
      assert.ok(v.sourceSlide, v.variantId);
      if (v.inputSlot.type === 'choice') assert.equal(grade(n, v, v.evaluator.targetIds), 1, v.variantId);
      else if (v.evaluator.type === 'atomic_rubric') assert.equal(v.evaluator.rubric.reduce((a, r) => a + r.marks, 0), v.marks, v.variantId);
      else {
        const ans = Object.fromEntries(Object.entries(v.evaluator.targets).map(([k, t]) => [k, t.type === 'keyword' ? t.expectedExpr.replace(/'/g, '') : t.targetExpr]));
        assert.equal(grade(n, v, ans), 1, `${v.variantId} full marks`);
        assert.equal(v.marks, Object.keys(ans).length);
      }
    }
  }
});

test('zero-point-energy chain: recomputed independently, and it reproduces the slide bond-enthalpy difference', () => {
  const t = N('bk-c4-isotope-gen').variants[0].evaluator.targets;
  const nuD = 4401 / Math.sqrt(2), eH = 0.5 * 4401 * 0.01196, eD = 0.5 * nuD * 0.01196, dk = (eH - eD) / 4.184;
  assert.ok(Math.abs(Number(t.nud.targetExpr) - nuD) < 1 && Math.abs(Number(t.eh.targetExpr) - eH) < 0.06 && Math.abs(Number(t.ed.targetExpr) - eD) < 0.06 && Math.abs(Number(t.dk.targetExpr) - dk) < 0.01);
  assert.ok(Math.abs(dk - (106.0 - 104.2)) < 0.1, `ZPE difference ${dk.toFixed(2)} kcal/mol is the slide's 1.8 kcal/mol`);
  assert.equal(Math.round(Math.pow(2, 0.5) * 1000), 1414);
});

test('radical chain: step enthalpies from the slide bond energies add up to the overall value', () => {
  const t = N('bk-c4-radical-gen').variants[1].evaluator.targets, d = (k) => Number(t[k].targetExpr);
  assert.equal(d('d1'), 243); assert.equal(d('d2'), 432 - 427); assert.equal(d('d3'), 243 - 427);
  assert.equal(d('d2') + d('d3'), d('d4'), 'two propagation steps sum to the overall ΔH');
  assert.equal(d('d4'), 432 + 243 - 2 * 427);
  const k = N('bk-c4-radical-gen').variants[0].evaluator.targets;
  assert.deepEqual(['s1', 's2', 's3', 's4'].map((x) => k[x].expectedExpr.replace(/'/g, '')), ['initiation', 'propagation', 'propagation', 'termination']);
});
