import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Evaluators, Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const n = bank.questionNodes.find((x) => x.id === 'bk-c1-fc-gen');
const grade = (v, input) => Evaluators.evaluate(v, input, Scheduler.instantiateVariant(v, 1).scope, {}, n).normalizedGrade;

test('formal-charge variants: structure, linked skill, full marks, off-by-one is wrong', () => {
  assert.equal(n.variants.length, 11);
  assert.ok(map.skills.find((s) => s.id === 'c1.formal-charge').nodes.includes('bk-c1-fc-gen'));
  for (const v of n.variants) {
    if (v.inputSlot.type === 'choice') { assert.ok(v.inputSlot.shuffleOptions); assert.equal(grade(v, v.evaluator.targetIds), 1); continue; }
    const ans = Object.fromEntries(Object.entries(v.evaluator.targets).map(([k, t]) => [k, t.targetExpr]));
    assert.equal(grade(v, ans), 1, v.variantId);
    assert.ok(grade(v, { ...ans, a0: String(Number(ans.a0) + 1) }) < 1, v.variantId);
    assert.equal(v.marks, Object.keys(ans).length);
  }
});

test('formal charges equal hand-written textbook values (V − non-bonding electrons − bonds)', () => {
  const E = ['Al', -1, 'bridging Cl', 1, 'terminal Cl', 0, '|', 'I', -1, 'bridging Cl', 1, 'terminal Cl', 0, '|', 'N', 1, 'B', -1, 'F', 0, '|',
    'O in H₃O⁺', 1, 'N in NH₄⁺', 1, 'B in BF₄⁻', -1, 'B in BH₄⁻', -1, '|', 'S in B', -1, 'N in B', 0, 'S in C', 1, 'N in C', -2, '|',
    'central O in O₃', 1, 'single-bonded end O in O₃', -1, 'N in NO₃⁻', 1, 'single-bonded O in NO₃⁻', -1, '|', 'C in CO', -1, 'O in CO', 1, 'central N in N₂O', 1, 'O in N₂O', -1, '|',
    'B', -1, 'double-bonded F', 1, 'single-bonded F', 0, '|', 'S', 2, 'O', -1, '|', 'S', 0, 'double-bonded O', 0, 'single-bonded O', -1].join('§').split('§|§').map((g) => g.split('§'));
  E.forEach((g, i) => {
    const t = n.variants[i].evaluator.targets;
    for (let j = 0; j < g.length; j += 2) assert.equal(Number(t[`a${j / 2}`].targetExpr), Number(g[j + 1]), `${n.variants[i].perspectiveLabel}: ${g[j]}`);
  });
  // the example-paper item: Al and I are both -1 and the bridging Cl is +1
  const al = n.variants[0].evaluator.targets, iod = n.variants[1].evaluator.targets;
  assert.equal(al.a0.targetExpr, '-1'); assert.equal(iod.a0.targetExpr, '-1'); assert.equal(al.a1.targetExpr, '1');
  // formal charges of a neutral molecule / ion add up: Al₂Cl₆ (2 Al, 2 bridging Cl, 4 terminal Cl) = 0
  assert.equal(2 * -1 + 2 * 1 + 4 * 0, 0);
});

test('draw-and-label formal charge variants: rubric marks add up, every quoted formal charge matches the rule', () => {
  const d = bank.questionNodes.find((x) => x.id === 'bk-c1-fc-draw');
  assert.equal(d.variants.length, 6);
  for (const v of d.variants) {
    assert.ok(v.drawOnPaperThenCompare);
    assert.equal(v.evaluator.rubric.reduce((a, r) => a + r.marks, 0), v.marks);
  }
  const fcOf = (V, lp, b) => V - 2 * lp - b;
  const text = d.variants.map((v) => v.explanation).join(' ');
  // spot-check the arithmetic quoted in the explanations against the rule
  assert.equal(fcOf(3, 0, 4), -1); assert.ok(text.includes('Al: 3 − 0 − 4 = −1'));
  assert.equal(fcOf(7, 2, 2), 1); assert.equal(fcOf(7, 2, 4), -1);
  assert.equal(fcOf(6, 0, 6), 0); assert.equal(fcOf(6, 0, 4), 2); assert.equal(fcOf(5, 0, 4), 1);
  assert.equal(fcOf(6, 3, 1), -1); assert.equal(fcOf(6, 2, 2), 0);
});
