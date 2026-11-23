import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { LF, Evaluators, Scheduler, Figures } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const chain = bank.questionNodes.find((n) => n.id === 'bk-c6-chain-gen');
const terms = bank.questionNodes.find((n) => n.id === 'bk-c8-terms-gen');
const grade = (node, v, input) => Evaluators.evaluate(v, input, Scheduler.instantiateVariant(v, 1).scope, {}, node).normalizedGrade;
const formulaOf = (v) => /`([^`]+)`/.exec(v.stem)[1];

test('chain: every formula is re-derived by the ligand-field engine and the printed key matches it', () => {
  assert.ok(chain.variants.length >= 35);
  for (const v of chain.variants) {
    const a = LF.analyzeComplex(formulaOf(v));
    const t = v.evaluator.targets;
    assert.equal(Number(t.ox.targetExpr), a.oxState, v.variantId);
    assert.equal(Number(t.d.targetExpr), a.dn, v.variantId);
    assert.equal(Number(t.c.targetExpr), a.lfseCoeff + 0, v.variantId);
    assert.equal(Number(t.p.targetExpr), (a.pTermsRelative ?? 0) + 0, v.variantId);
    assert.equal(t.name.expectedDisplay, a.iupacName, v.variantId);
    assert.ok(a.geometry === 'Oh' || a.geometry === 'Td', `${v.variantId}: only octahedral or tetrahedral`);
  }
});

test('chain: the model answer scores full marks, and each single slip loses marks', () => {
  for (const v of chain.variants) {
    const t = v.evaluator.targets;
    const good = { name: t.name.expectedDisplay, ox: t.ox.targetExpr, d: t.d.targetExpr, g: t.g.expectedDisplay, conf: t.conf.expectedDisplay, c: t.c.targetExpr, p: t.p.targetExpr };
    assert.equal(grade(chain, v, good), 1, `${v.variantId} full marks`);
    const wrongD = { ...good, d: String(Number(good.d) + 1) };
    assert.ok(grade(chain, v, wrongD) < 1, `${v.variantId}: a wrong dⁿ is marked`);
    const wrongG = { ...good, g: good.g === 'octahedral' ? 'tetrahedral' : 'octahedral' };
    assert.ok(grade(chain, v, wrongG) < 1, `${v.variantId}: a wrong geometry is marked`);
    assert.ok(grade(chain, v, { ...good, name: 'nonsense' }) < 1, `${v.variantId}: a wrong name is marked`);
    // typed variants of the same configuration are accepted
    assert.equal(grade(chain, v, { ...good, conf: good.conf.replace(/₂/g, '2').replace(/e_g/g, 'eg').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)) }), 1, `${v.variantId}: plain-typed configuration`);
  }
});

test('chain: coverage is spread over dⁿ, geometry, spin state, mixed ligands and counter-ions, and none repeats a past formula', () => {
  const as = chain.variants.map((v) => LF.analyzeComplex(formulaOf(v)));
  for (let n = 0; n <= 10; n++) assert.ok(as.some((a) => a.dn === n), `d${n}`);
  assert.ok(as.filter((a) => a.geometry === 'Td').length >= 8, 'tetrahedral');
  assert.ok(as.filter((a) => a.spinState === 'low').length >= 10, 'low spin');
  assert.ok(as.filter((a) => a.isHeteroleptic).length >= 20, 'mixed ligands');
  assert.ok(as.filter((a) => a.counterIons).length >= 20, 'counter-ions');
  assert.equal(new Set(as.map((a) => a.formula)).size, as.length, 'no duplicate formula');
  const past = ['K[Cr(H2O)2(C2O4)2]', '[Ni(NH3)Cl(NH2CH3)2]Cl'];
  for (const p of past) assert.ok(!as.some((a) => a.formula === p));
});

test('chain: the skill map links it to naming, oxidation state, splitting and CFSE', () => {
  for (const s of ['c6.name', 'c6.ox-dn-cn', 'c7.splitting', 'c7.cfse']) {
    assert.ok(map.skills.find((k) => k.id === s).nodes.includes('bk-c6-chain-gen'), s);
    assert.ok(map.nodeSkills['bk-c6-chain-gen'].includes(s));
  }
});

test('terms: all-terms sets and ground terms match the exact microstate enumeration, and the model answers score full marks', () => {
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
  for (const v of terms.variants) {
    const m = /^c8-terms-gen-(all|gs)-d(\d)$/.exec(v.variantId);
    if (!m) continue;
    const n = Number(m[2]), t = Figures.termsOf(n), distinct = [...new Set(t.steps.map((s) => s.symbol))];
    if (m[1] === 'all') {
      assert.equal([...v.evaluator.targetSet].sort().join(), [...distinct].sort().join(), `d${n} set`);
      assert.equal(grade(terms, v, [...distinct]), 1, `d${n} full`);
      assert.ok(grade(terms, v, distinct.slice(1)) < 1, `d${n}: a missing term is marked`);
    } else {
      assert.equal(Number(v.evaluator.targets.m.targetExpr), C(10, n));
      assert.equal(Number(v.evaluator.targets.u.targetExpr), Math.round(2 * t.steps[0].S));
      assert.equal(grade(terms, v, { m: String(C(10, n)), g: t.ground, u: String(Math.round(2 * t.steps[0].S)) }), 1, `d${n} ground`);
      assert.equal(grade(terms, v, { m: String(C(10, n)), g: t.ground.replace(/^(\d)/, (x, d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]), u: String(Math.round(2 * t.steps[0].S)) }), 1, `d${n}: superscript accepted`);
      assert.ok(grade(terms, v, { m: String(C(10, n) + 1), g: t.ground, u: String(Math.round(2 * t.steps[0].S)) }) < 1);
    }
  }
  assert.ok(['2', '3', '4', '7'].every((n) => terms.variants.some((v) => v.variantId === `c8-terms-gen-all-d${n}`)));
  for (let n = 1; n <= 9; n++) assert.ok(terms.variants.some((v) => v.variantId === `c8-terms-gen-gs-d${n}`), `d${n} ground`);
});

test('terms: the d³ degeneracies add to 120 with ²D twice', () => {
  const v = terms.variants.find((x) => x.variantId === 'c8-terms-gen-check-d3');
  assert.equal(grade(terms, v, { f: '28', p: '12', h: '22', g: '18', d: '2' }), 1);
  assert.ok(grade(terms, v, { f: '28', p: '12', h: '22', g: '18', d: '1' }) < 1);
});
