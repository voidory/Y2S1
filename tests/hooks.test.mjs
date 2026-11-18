import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const E = loadEngine();
const { Evaluators } = E;
const bank = readContent('question-bank.json');
const map = readContent('skill-map.json');
const byId = Object.fromEntries(bank.questionNodes.map((n) => [n.id, n]));
const variant = (nodeId, vid) => byId[nodeId].variants.find((v) => v.variantId === vid);
const grade = (nodeId, vid, input) => Evaluators.evaluate(variant(nodeId, vid), input, {}, {}, byId[nodeId]).normalizedGrade;

const hookOf = (n, v) => v?.memoryHook || n.metadata?.memoryHook || '';

test('hooks: the named processes the student said they forget all have one, on every variant', () => {
  for (const id of ['bk-c4-olin-raschig', 'bk-c4-wislicenus', 'bk-c4-ostwald', 'bk-c4-downs', 'bk-c4-haber']) {
    assert.ok(byId[id], `missing node ${id}`);
    for (const v of byId[id].variants) assert.ok(hookOf(byId[id], v), `${id}/${v.variantId} has no hook`);
  }
  // Downs shows up as the molten-NaCl variant of the chlor-alkali node, and the aqueous variant has its own hook
  const chlor = byId['bk-c4-chloralkali'];
  assert.match(chlor.variants.find((v) => v.perspectiveLabel === 'Molten NaCl').memoryHook, /Downs/);
  assert.ok(!/Downs/.test(chlor.variants.find((v) => v.perspectiveLabel === 'Chlor-alkali').memoryHook));
});

test('hooks: short, well-formed, and never printed in a question stem (they would cue the answer)', () => {
  const bad = [];
  for (const n of bank.questionNodes) {
    for (const v of n.variants) {
      const h = hookOf(n, v);
      if (!h) continue;
      if (typeof h !== 'string' || h.length < 20 || h.length > 420) bad.push(`${n.id}/${v.variantId}: length ${h.length}`);
      if (v.stem.includes(h.slice(0, 40))) bad.push(`${n.id}/${v.variantId}: hook is in the stem`);
    }
  }
  assert.deepEqual(bad, []);
});

test('new nodes: Ostwald and Downs are in the bank, mapped to named-process, and grade correctly', () => {
  const named = map.skills.find((s) => s.id === 'c4.named-process');
  for (const id of ['bk-c4-ostwald', 'bk-c4-downs']) {
    assert.ok(named.nodes.includes(id));
    assert.deepEqual(map.nodeSkills[id], ['c4.named-process']);
  }
  assert.equal(grade('bk-c4-ostwald', 'c4-ostwald-v1', 'Ostwald process'), 1);
  assert.equal(grade('bk-c4-ostwald', 'c4-ostwald-v1', 'the Ostwald process.'), 1);
  assert.equal(grade('bk-c4-ostwald', 'c4-ostwald-v1', 'Haber process'), 0);

  const steps = '4NH3 + 5O2 -> 4NO + 6H2O\n2NO + O2 -> 2NO2\n3NO2 + H2O -> 2HNO3 + NO';
  assert.equal(grade('bk-c4-ostwald', 'c4-ostwald-v2', steps), 1);
  assert.equal(grade('bk-c4-ostwald', 'c4-ostwald-v2', '4NH3 + 5O2 -> 4NO + 6H2O\n2NO + O2 -> 2NO2\n4NO2 + O2 + 2H2O -> 4HNO3'), 1);
  assert.equal(grade('bk-c4-ostwald', 'c4-ostwald-v2', 'NH3 + 2O2 -> HNO3 + H2O'), 1);
  assert.ok(grade('bk-c4-ostwald', 'c4-ostwald-v2', '4NH3 + 3O2 -> 2N2 + 6H2O') < 0.5, 'a wrong equation does not score');

  assert.equal(grade('bk-c4-downs', 'c4-downs-v1', 'Downs cell'), 1);
  assert.equal(grade('bk-c4-downs', 'c4-downs-v1', "Down's process"), 1);
  assert.equal(grade('bk-c4-downs', 'c4-downs-v1', 'Haber'), 0);
});
