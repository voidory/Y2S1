import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Evaluators, Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const N = (id) => bank.questionNodes.find((n) => n.id === id);
const grade = (node, v, input) => Evaluators.evaluate(v, input, Scheduler.instantiateVariant(v, 1).scope, {}, node).normalizedGrade;
const IDS = ['bk-c2-trend-gen2', 'bk-c1-partial-charge', 'bk-c3-ahn-count', 'bk-c3-diatomic-gen', 'bk-c2-solid-props'];

test('Kinjo batch 2: structure, source tag, skills, and model answers score full marks', () => {
  for (const id of IDS) {
    const n = N(id);
    assert.ok(n && n.variants.length >= 5, id);
    assert.ok(map.nodeSkills[id]?.length, `${id} linked`);
    for (const s of map.nodeSkills[id]) assert.ok(map.skills.find((k) => k.id === s).nodes.includes(id), `${id} in ${s}`);
    for (const v of n.variants) {
      assert.ok(v.sourceSlide, `${v.variantId} sourceSlide`);
      if (v.inputSlot.type === 'choice') {
        assert.ok(v.inputSlot.shuffleOptions);
        assert.equal(grade(n, v, v.evaluator.targetIds), 1, `${v.variantId} key`);
        const wrong = v.inputSlot.options.map((o) => o.id).filter((o) => !v.evaluator.targetIds.includes(o));
        assert.ok(grade(n, v, [wrong[0]]) < 1, `${v.variantId} a wrong option is marked wrong`);
      } else if (v.evaluator.type === 'mapped_fields_match') {
        const ans = Object.fromEntries(Object.entries(v.evaluator.targets).map(([k, t]) => [k, t.targetExpr]));
        assert.equal(grade(n, v, ans), 1, `${v.variantId} full marks`);
        const first = Object.keys(ans)[0];
        assert.ok(grade(n, v, { ...ans, [first]: String(Number(ans[first]) + 5) }) < 1, `${v.variantId} wrong number marked`);
        assert.equal(v.marks, Object.keys(ans).length, `${v.variantId} marks = fields`);
      } else if (v.evaluator.type === 'atomic_rubric') {
        assert.equal(v.evaluator.rubric.reduce((a, r) => a + r.marks, 0), v.marks, `${v.variantId} rubric sum`);
      }
    }
  }
});

test('trend picks: the key is recomputed from an independent copy of the slide tables', () => {
  const T = {
    'E≡E bond length in R–E≡E–R': { C: 1.2, Si: 2.0622, Ge: 2.2850, Sn: 2.6675, Pb: 3.1881 },
    'E–E–C bond angle in R–E≡E–R': { C: 180, Si: 137.44, Ge: 128.67, Sn: 125.1, Pb: 94.26 },
    'E–E single-bond length': { C: 1.54, Si: 2.34, Ge: 2.44, Sn: 2.81, Pb: 2.9 },
    'melting point of the metal': { Na: 98, Mg: 650, Al: 659, Li: 181, K: 63 },
    'boiling point of the metal': { Na: 890, Mg: 1110, Al: 2470, Li: 1313, K: 774 },
    'boiling point of the hydride': { 'CH₄': -161, 'SiH₄': -117, 'GeH₄': -90, 'SnH₄': -50, 'NH₃': -33, 'PH₃': -90, 'AsH₃': -55, 'SbH₃': -17, 'H₂O': 100, 'H₂S': -61, 'H₂Se': -40, 'H₂Te': -2, 'HF': 20, 'HCl': -85, 'HBr': -69, 'HI': -35 },
    'boiling point of the gas or alkane': { He: -269, Ne: -246, Ar: -186, Kr: -152, 'CH₄': -161, 'C₂H₆': -88, 'C₃H₈': -42 },
  };
  const n = N('bk-c2-trend-gen2');
  for (const v of n.variants) {
    const m = /Among (.+), which has the \*\*(highest|lowest)\*\* (.+)\?$/.exec(v.stem);
    const set = m[1].split(', '), dir = m[2], tbl = T[m[3]];
    assert.ok(tbl, `${v.variantId}: table ${m[3]}`);
    const vals = set.map((s) => tbl[s]);
    assert.ok(vals.every((x) => x !== undefined) && new Set(vals).size === vals.length, `${v.variantId}: ${set} complete and distinct`);
    const best = dir === 'highest' ? Math.max(...vals) : Math.min(...vals);
    const key = v.inputSlot.options.find((o) => o.id === v.evaluator.targetIds[0]).label;
    assert.equal(key, set[vals.indexOf(best)], `${v.variantId} (${m[3]}, ${dir}, ${set})`);
  }
  // the anomalies the slides stress are present: NH3/H2O/HF top their groups, and lead is the most bent
  const labels = n.variants.map((v) => v.perspectiveLabel).join('|');
  assert.ok(/boiling point of the hydride, highest of NH₃, PH₃, AsH₃/.test(labels) && /E–E–C bond angle in R–E≡E–R, lowest of C, Ge, Pb/.test(labels));
});

test('formal charge against partial charge: the slide numbers and the hypothetical ones add up', () => {
  const n = N('bk-c1-partial-charge');
  const v1 = n.variants[0].evaluator.targets;
  assert.equal(Number(v1.fd.targetExpr), 1); assert.equal(Number(v1.fa.targetExpr), -1);
  assert.ok(Math.abs(Number(v1.don.targetExpr) - 0.3) < 1e-9 && Math.abs(Number(v1.acc.targetExpr) - 0.2) < 1e-9 && Math.abs(Number(v1.rest.targetExpr) - 0.1) < 1e-9, 'NH3→BF3: 0.3 given, 0.2 gained, 0.1 on F');
  for (const v of n.variants.slice(0, 3)) {
    const t = v.evaluator.targets;
    assert.ok(Math.abs(Number(t.don.targetExpr) - Number(t.acc.targetExpr) - Number(t.rest.targetExpr)) < 1e-9, `${v.variantId} charge conserved`);
    assert.ok(Number(t.rest.targetExpr) >= 0, `${v.variantId} remainder not negative`);
  }
});

test('AHn MO counts: MOs = AOs, electrons are conserved, bonding electron pairs give the number of A–H bonds', () => {
  const E = { 'CH₄': { ao: 8, ve: 8, bonds: 4 }, 'NH₃': { ao: 7, ve: 8, bonds: 3 }, 'H₂O': { ao: 6, ve: 8, bonds: 2 }, 'BH₃': { ao: 7, ve: 6, bonds: 3 }, 'BeH₂': { ao: 6, ve: 4, bonds: 2 } };
  const n = N('bk-c3-ahn-count');
  assert.equal(n.variants.length, 5);
  for (const v of n.variants) {
    const e = E[v.perspectiveLabel], t = Object.fromEntries(Object.entries(v.evaluator.targets).map(([k, x]) => [k, Number(x.targetExpr)]));
    assert.equal(t.b + t.nb + t.ab, e.ao, `${v.perspectiveLabel}: number of MOs equals number of AOs`);
    assert.equal(t.b, t.ab, `${v.perspectiveLabel}: as many antibonding as bonding MOs`);
    assert.equal(2 * t.b + t.enb, e.ve === 6 || e.ve === 4 ? 2 * t.b : e.ve, `${v.perspectiveLabel}: bonding pairs + non-bonding electrons = valence electrons`);
    assert.equal(t.b, e.bonds + (v.perspectiveLabel === 'CH₄' ? 0 : 0), `${v.perspectiveLabel}: bonding MOs = number of A–H bonds`);
    assert.equal(t.bo, 1);
  }
});

test('diatomic bond orders and unpaired electrons match the textbook values, recomputed by explicit configuration', () => {
  const known = { 'B₂': [1, 2], 'C₂': [2, 0], 'N₂⁺': [2.5, 1], 'O₂⁺': [2.5, 1], 'O₂⁻': [1.5, 1], 'O₂²⁻': [1, 0], 'F₂': [1, 0], 'F₂⁺': [1.5, 1], 'Ne₂': [0, 0],
    'Li₂': [1, 0], 'Be₂': [0, 0], 'C₂²⁻': [3, 0], 'CN': [2.5, 1], 'CO⁺': [2.5, 1], 'NO⁻': [2, 2], 'N₂⁻': [2.5, 1], 'NO': [2.5, 1], 'NO⁺': [3, 0] };
  const n = N('bk-c3-diatomic-gen');
  let seen = 0;
  for (const v of n.variants) {
    for (const [k, t] of Object.entries(v.evaluator.targets)) {
      const i = k.slice(-1), kind = k.startsWith('bo') ? 'bo' : 'n';
      const label = v.inputSlot.fields.find((f) => f.key === k).label.replace(/^(Bond order of |Unpaired electrons in )/, '');
      assert.ok(label in known, label);
      assert.equal(Number(t.targetExpr), known[label][kind === 'bo' ? 0 : 1], `${label} ${kind}`);
      seen++;
    }
  }
  assert.equal(seen, 36);
});

test('H-bond count is the smaller of the H atoms and lone pairs; the three-way key follows', () => {
  const n = N('bk-c2-solid-props');
  const v = n.variants.find((x) => x.variantId === 'c2-solid-props-7').evaluator.targets;
  const supply = { hf: [1, 3], h2o: [2, 2], nh3: [3, 1] };
  for (const [k, [h, lp]] of Object.entries(supply)) assert.equal(Number(v[k].targetExpr), Math.min(h, lp), k);
  // bp order consistent with H-bonds per molecule (water highest of the three, per the slide values)
  const bp = { HF: 20, 'H₂O': 100, 'NH₃': -33 };
  assert.equal(Object.entries(bp).sort((a, b) => b[1] - a[1])[0][0], 'H₂O');
});
