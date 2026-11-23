import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Evaluators, Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const N = (id) => bank.questionNodes.find((n) => n.id === id);
const grade = (node, v, input) => Evaluators.evaluate(v, input, Scheduler.instantiateVariant(v, 1).scope, {}, node).normalizedGrade;
const IDS = ['bk-c2-trend-gen', 'bk-c4-avgon-gen', 'bk-c4-nuclear-gen', 'bk-c3-homo-gen', 'bk-c4-crown-draw'];
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

test('Kinjo items: structure, source tag, shuffle, skills, and model answers score full marks', () => {
  for (const id of IDS) {
    const n = N(id);
    assert.ok(n && n.variants.length >= 2, id);
    assert.ok(map.nodeSkills[id]?.length, `${id} linked`);
    for (const s of map.nodeSkills[id]) assert.ok(map.skills.find((k) => k.id === s).nodes.includes(id), `${id} in ${s}`);
    for (const v of n.variants) {
      assert.ok(/^s\d/.test(v.sourceSlide), `${v.variantId} sourceSlide`);
      if (v.inputSlot.type === 'choice') {
        assert.ok(v.inputSlot.shuffleOptions); assert.equal(grade(n, v, v.evaluator.targetIds), 1, `${v.variantId} key`);
      } else if (v.evaluator.type === 'mapped_fields_match') {
        const ans = Object.fromEntries(Object.entries(v.evaluator.targets).map(([k, t]) => [k, t.targetExpr]));
        assert.equal(grade(n, v, ans), 1, `${v.variantId} full marks`);
        const first = Object.keys(ans)[0];
        assert.ok(grade(n, v, { ...ans, [first]: String(Number(ans[first]) + 5) }) < 1, `${v.variantId} wrong number marked`);
      } else if (v.evaluator.type === 'atomic_rubric') {
        assert.ok(Math.abs(v.evaluator.rubric.reduce((a, r) => a + r.marks, 0) - v.marks) < 1e-9, `${v.variantId} rubric sum`); assert.ok(v.drawOnPaperThenCompare);
      } else if (v.evaluator.type === 'pattern_match') {
        assert.equal(grade(n, v, v.evaluator.expectedDisplay), 1, `${v.variantId} model answer`);
        for (const alt of ['nonsense', '12C']) assert.ok(grade(n, v, alt) < 1);
      }
    }
  }
});

test('trend picks: the key is recomputed from an independent copy of the slide tables', () => {
  const T = {
    'first ionisation energy#hal': { F: 1681, Cl: 1256, Br: 1143, I: 1009 }, 'electronegativity': { F: 4.0, Cl: 3.0, Br: 2.8, I: 2.5 }, 'atomic radius#hal': { F: 72, Cl: 100, Br: 114, I: 133 },
    'ionic radius of the halide ion': { 'F⁻': 133, 'Cl⁻': 181, 'Br⁻': 196, 'I⁻': 220 }, 'boiling point of the element': { 'F₂': -188, 'Cl₂': -34, 'Br₂': 59.5, 'I₂': 185 },
    'melting point of the element': { 'F₂': -219, 'Cl₂': -101, 'Br₂': -7.2, 'I₂': 114 }, 'X–X bond energy': { 'F–F': 159, 'Cl–Cl': 243, 'Br–Br': 193, 'I–I': 151 }, 'X–X bond length': { 'F–F': 143, 'Cl–Cl': 200, 'Br–Br': 228, 'I–I': 266 },
    'electron affinity (energy released on E + e⁻ → E⁻)': { F: 334, Cl: 355, Br: 325, I: 295 },
    'first ionisation energy#ng': { He: 2372, Ne: 2080, Ar: 1520, Kr: 1351, Xe: 1170, Rn: 1037 }, 'boiling point': { He: -269, Ne: -246, Ar: -186, Kr: -153, Xe: -108, Rn: -62 },
    'density at STP': { He: 0.178, Ne: 0.9, Ar: 1.78, Kr: 3.75, Xe: 5.9, Rn: 9.73 }, 'atomic radius#ng': { He: 31, Ne: 71, Ar: 98, Kr: 112, Xe: 131, Rn: 140 },
    'melting point of the xenon fluoride': { 'XeF₂': 140, 'XeF₄': 117, 'XeF₆': 49 }, 'Xe–F bond length': { 'XeF₂': 2.0, 'XeF₄': 1.95, 'XeF₆': 1.89 },
  };
  const n = N('bk-c2-trend-gen');
  for (const v of n.variants) {
    const m = /Among (.+), which has the \*\*(highest|lowest)\*\* (.+)\?$/.exec(v.stem);
    const set = m[1].split(', '), dir = m[2], name = m[3];
    const tbl = T[name] || (set[0] in (T[`${name}#hal`] || {}) ? T[`${name}#hal`] : T[`${name}#ng`]);
    const vals = set.map((s) => tbl[s]);
    assert.ok(vals.every((x) => x !== undefined), `${v.variantId}: ${set} in ${name}`);
    const best = dir === 'highest' ? Math.max(...vals) : Math.min(...vals);
    const expected = set[vals.indexOf(best)];
    const key = v.inputSlot.options.find((o) => o.id === v.evaluator.targetIds[0]).label;
    assert.equal(key, expected, `${v.variantId} (${name}, ${dir}, ${set})`);
  }
  // the exceptions the slides stress are present
  const labels = n.variants.map((v) => v.perspectiveLabel).join('|');
  assert.ok(/electron affinity.*highest of F, Cl, Br/.test(labels) && /bond energy, lowest of F–F, Br–Br, I–I/.test(labels));
});

test('average oxidation numbers are recomputed from the sum rule', () => {
  const R = {
    'N₂O': { q: 0, others: [[-2, 1]], n: 2 }, 'N₂O₃': { q: 0, others: [[-2, 3]], n: 2 }, 'N₂O₄': { q: 0, others: [[-2, 4]], n: 2 }, 'N₂O₅': { q: 0, others: [[-2, 5]], n: 2 },
    'N₂H₄': { q: 0, others: [[1, 4]], n: 2 }, 'NH₂OH': { q: 0, others: [[1, 3], [-2, 1]], n: 1 }, 'NH₄NO₃ (average over both N atoms)': { q: 0, others: [[1, 4], [-2, 3]], n: 2 },
    'Fe₃O₄': { q: 0, others: [[-2, 4]], n: 3 }, 'Pb₃O₄': { q: 0, others: [[-2, 4]], n: 3 }, 'S₄O₆²⁻': { q: -2, others: [[-2, 6]], n: 4 }, 'S₂O₃²⁻': { q: -2, others: [[-2, 3]], n: 2 },
    'I₃⁻': { q: -1, others: [], n: 3 }, 'NaN₃': { q: 0, others: [[1, 1]], n: 3 },
  };
  const n = N('bk-c4-avgon-gen');
  assert.equal(n.variants.length, Object.keys(R).length);
  for (const v of n.variants) {
    const r = R[v.perspectiveLabel];
    const avg = (r.q - r.others.reduce((a, [c, k]) => a + c * k, 0)) / r.n;
    assert.ok(Math.abs(Number(v.evaluator.targets.a.targetExpr) - avg) < 1e-3, `${v.perspectiveLabel}: ${avg}`);
  }
  assert.equal(grade(n, n.variants.find((v) => v.perspectiveLabel === 'Fe₃O₄'), { a: '2.67' }), 1, '8/3 typed as 2.67');
  assert.equal(grade(n, n.variants.find((v) => v.perspectiveLabel === 'I₃⁻'), { a: '-0.33' }), 1, '−1/3 typed as −0.33');
});

test('nuclear equations conserve A and Z, and the key is the isotope the conservation gives', () => {
  const E = { 1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 17: 'Cl', 18: 'Ar', 36: 'Kr', 56: 'Ba', 92: 'U' };
  const n = [[27, 13], [4, 2]], rx = [
    { left: [[27, 13], [4, 2]], right: [[1, 0]] },        // 27Al + a -> X + n
    { left: [[14, 7], [4, 2]], right: [[1, 1]] },         // 14N + a -> X + p
    { left: [[10, 5], [1, 0]], right: [[4, 2]] },         // 10B + n -> a + X
    { left: [[235, 92], [1, 0]], right: [[141, 56], [1, 0], [1, 0], [1, 0]] }, // 235U + n -> 141Ba + 3n + X
    { left: [[7, 3], [1, 1]], right: [], pair: true },    // 7Li + p -> 2 X
    { left: [[28, 14], [1, 0]], right: [[1, 1]] },        // 28Si + n -> X + p
    { left: [[37, 17], [1, 0]], right: [], beta: true },  // 37Cl + n -> 38Cl -> beta- -> X
    { left: [[26, 12], [4, 2]], right: [[1, 0]] },        // 26Mg + a -> X + n
  ];
  const v = N('bk-c4-nuclear-gen').variants;
  assert.equal(v.length, rx.length);
  rx.forEach((r, i) => {
    let A = r.left.reduce((a, [x]) => a + x, 0) - r.right.reduce((a, [x]) => a + x, 0);
    let Z = r.left.reduce((a, [, z]) => a + z, 0) - r.right.reduce((a, [, z]) => a + z, 0);
    if (r.pair) { A /= 2; Z /= 2; }
    if (r.beta) Z += 1;
    const expected = `${[...String(A)].map((c) => SUP[c]).join('')}${E[Z]}`;
    assert.equal(v[i].evaluator.expectedDisplay, expected, `reaction ${i + 1}`);
  });
});

test('HOMO counts follow a simple valence-MO filling for the diatomics, and the hydride values match the textbook diagrams', () => {
  const homoDiatomic = (e, mixing) => {
    const levels = mixing ? [2, 2, 4, 2, 4, 2] : [2, 2, 2, 4, 4, 2];   // σ2s σ*2s then π2p/σ2p order, π*2p, σ*2p
    let left = e, last = 0;
    for (const cap of levels) { if (left <= 0) break; last = Math.min(cap, left); left -= last; }
    return last;
  };
  const v2 = N('bk-c3-homo-gen').variants.find((v) => v.variantId === 'c3-homo-gen-v2');
  const t = v2.evaluator.targets;
  assert.equal(Number(t.h1.targetExpr), homoDiatomic(10, true), 'CN⁻ (10 valence electrons, s–p mixing)');
  assert.equal(Number(t.h2.targetExpr), homoDiatomic(13, false), 'O₂⁻ (13)');
  assert.equal(Number(t.h3.targetExpr), homoDiatomic(10, true), 'NO⁺ (10)');
  assert.equal(Number(t.h4.targetExpr), homoDiatomic(14, false), 'F₂ (14)');
  assert.equal(Number(t.h0.targetExpr), 6, 'SiH₄ like CH₄: t₂ holds 6');
  const v1 = N('bk-c3-homo-gen').variants.find((v) => v.variantId === 'c3-homo-gen-v1').evaluator.targets;
  assert.equal(Number(v1.h4.targetExpr), homoDiatomic(11, true), 'NO (11 valence electrons)');
  assert.deepEqual(['h0', 'h1', 'h2', 'h3'].map((k) => Number(v1[k].targetExpr)), [2, 2, 4, 4], 'NH₃ and H₂O lone pairs (2), HF π pair (4), BH₃ e′ (4)');
});
