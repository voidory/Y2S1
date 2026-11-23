import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Evaluators, Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const N = (id) => bank.questionNodes.find((n) => n.id === id);
const grade = (node, v, input) => Evaluators.evaluate(v, input, Scheduler.instantiateVariant(v, 1).scope, {}, node).normalizedGrade;
const IDS = ['bk-c4-ox-gen', 'bk-c4-silicate-gen', 'bk-c4-facts-gen'];

test('Kinjo batch 3: structure, skills, and model answers score full marks', () => {
  for (const id of IDS) {
    const n = N(id);
    assert.ok(n && n.variants.length >= 4, id);
    assert.ok(map.nodeSkills[id]?.length, `${id} linked`);
    for (const s of map.nodeSkills[id]) assert.ok(map.skills.find((k) => k.id === s).nodes.includes(id), `${id} in ${s}`);
    for (const v of n.variants) {
      assert.ok(v.sourceSlide, `${v.variantId} sourceSlide`);
      if (v.inputSlot.type === 'choice') {
        assert.ok(v.inputSlot.shuffleOptions);
        assert.equal(grade(n, v, v.evaluator.targetIds), 1, `${v.variantId} key`);
      } else {
        const ans = Object.fromEntries(Object.entries(v.evaluator.targets).map(([k, t]) => [k, t.targetExpr]));
        assert.equal(grade(n, v, ans), 1, `${v.variantId} full marks`);
        const first = Object.keys(ans)[0];
        assert.ok(grade(n, v, { ...ans, [first]: String(Number(ans[first]) + 1) }) < 1, `${v.variantId} off-by-one marked wrong`);
        assert.equal(v.marks, Object.keys(ans).length);
      }
    }
  }
});

test('oxidation numbers equal an independent hand-written table (including hydridic H in silanes and boranes)', () => {
  const E = { 'N in N₂O': 1, 'N in NO': 2, 'N in N₂O₃': 3, 'N in NO₂': 4, 'N in N₂O₅': 5, 'N in NO₂⁺': 5, 'N in NO₃⁻': 5, 'N in NO₂⁻': 3, 'N in HNO₂': 3, 'N in HNO₃': 5, 'N in H₂N₂O₂ (hyponitrous acid)': 1, 'N in NH₂OH': -1,
    'N in NOCl': 3, 'N in NO⁺': 3, 'N in NH₄⁺': -3, 'N in N₂H₄': -2, 'P in H₃PO₄': 5, 'P in H₃PO₃': 3, 'P in P₄O₆': 3, 'P in P₄O₁₀': 5, 'P in PCl₃': 3, 'P in PCl₅': 5, 'P in PCl₄⁺': 5, 'P in PCl₆⁻': 5,
    'S in SO₂': 4, 'S in SO₃': 6, 'S in H₂S₂O₇': 6, 'S in SF₆': 6, 'Cl in ClO₂': 4, 'Cl in ClO₂⁻': 3, 'Cl in ClO₃⁻': 5, 'Cl in ClO₄⁻': 7,
    'C in CH₄': -4, 'Si in SiH₄': 4, 'Si in SiHCl₃': 4, 'B in B₂H₆': 3, 'Au in HAuCl₄': 3, 'Si in K₂SiO₃': 4, 'Al in Na₃[AlF₆] (cryolite)': 3, 'Al in AlH₄⁻': 3, 'Ge in GeH₄': 4, 'Au in AuCl₄⁻': 3, 'S in H₂SO₃': 4, 'Cl in HClO': 1 };
  let seen = 0;
  for (const v of N('bk-c4-ox-gen').variants) {
    for (const f of v.inputSlot.fields) {
      assert.ok(f.label in E, f.label);
      assert.equal(Number(v.evaluator.targets[f.key].targetExpr), E[f.label], f.label);
      seen++;
    }
  }
  assert.equal(seen, 50);
});

test('silicate charges: 4 per Si minus 2 per O; terminal plus bridging equals the O count', () => {
  const F = { 'SiO₄': [1, 4, -4], 'Si₂O₇': [2, 7, -6], 'Si₃O₉': [3, 9, -6], 'Si₆O₁₈': [6, 18, -12], '(SiO₃)': [1, 3, -2], '(Si₄O₁₁)': [4, 11, -6], '(Si₂O₅)': [2, 5, -2], 'SiO₂': [1, 2, 0] };
  const key = (label) => Object.keys(F).find((k) => label.includes(k));
  for (const v of N('bk-c4-silicate-gen').variants) {
    for (const f of v.inputSlot.fields) {
      const [si, o, q] = F[key(f.label)], t = Number(v.evaluator.targets[f.key].targetExpr);
      assert.equal(4 * si - 2 * o, q);
      if (f.key.startsWith('q')) assert.equal(t, q, f.label);
      else if (f.key.startsWith('t')) assert.equal(t, -q + 0, f.label);
      else assert.equal(t, o + q, f.label);
    }
  }
});

test('group facts: E–H picks follow the slide values, interhalogen keys follow the XX′n odd-n rule', () => {
  const eh = { energy: { 'C–H': 95, 'Si–H': 75, 'Ge–H': 70 }, length: { 'C–H': 1.09, 'Si–H': 1.48, 'Ge–H': 1.53 } };
  for (const v of N('bk-c4-facts-gen').variants.slice(0, 4)) {
    const m = /\*\*(highest|lowest)\*\* E–H bond (energy|length)/.exec(v.stem), t = eh[m[2]];
    const vals = Object.values(t), best = m[1] === 'highest' ? Math.max(...vals) : Math.min(...vals);
    const key = v.inputSlot.options.find((o) => o.id === v.evaluator.targetIds[0]).label;
    assert.equal(t[key], best, v.variantId);
  }
  const v6 = N('bk-c4-facts-gen').variants.find((v) => v.variantId === 'c4-facts-gen-06');
  const key = v6.inputSlot.options.find((o) => o.id === v6.evaluator.targetIds[0]).label;
  assert.equal(key, 'ClF₃');
  const n = (s) => Number(s.match(/[₀-₉]+/)[0].replace(/[₀-₉]/g, (c) => c.charCodeAt(0) - 0x2080));
  const valid = v6.inputSlot.options.map((o) => o.label).filter((l) => n(l) % 2 === 1 && 'FClBrI'.indexOf(l.match(/^[A-Z][a-z]?/)[0]) > 'FClBrI'.indexOf(l.match(/[A-Z][a-z]?(?=[₀-₉]+$)/)[0]));
  assert.deepEqual(valid, ['ClF₃'], 'only ClF₃ satisfies odd n with the lighter halogen outside');
});
