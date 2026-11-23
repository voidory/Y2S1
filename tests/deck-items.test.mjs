import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Evaluators, Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const N = (id) => bank.questionNodes.find((n) => n.id === id);
const V = (id, vid) => N(id).variants.find((v) => v.variantId === vid);
const grade = (node, v, input) => Evaluators.evaluate(v, input, Scheduler.instantiateVariant(v, 1).scope, {}, node).normalizedGrade;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const supNum = (s) => Number([...s].map((c) => SUP.indexOf(c)).join(''));
const IDS = ['bk-c6-ox-organo', 'bk-c6-oxo-chain', 'bk-c8-magnetism-chain', 'bk-c7-oh-td-ratio', 'bk-c8-term-concepts', 'bk-c8-intensity', 'bk-c7-jt-more', 'bk-c7-geom-orbitals', 'bk-c7-lig-bond'];

/* the model answer for a mapped-fields variant, built from its own targets */
const modelAnswer = (v) => Object.fromEntries(Object.entries(v.evaluator.targets).map(([k, t]) => [k, t.type === 'numeric' ? t.targetExpr : t.type === 'keyword' ? t.expectedExpr.replace(/'/g, '') : t.expectedDisplay]));

test('deck items: structure, source slide, shuffle, rubric totals, week and skill links', () => {
  const ids = new Set();
  for (const id of IDS) {
    const n = N(id);
    assert.ok(n && n.variants.length >= 4, `${id} exists with at least 4 variants`);
    assert.equal(n.moduleCode, 'CM2021');
    assert.ok(n.metadata.week >= 1 && n.metadata.week <= 9, `${id}: week ${n.metadata.week}`);
    assert.ok(map.nodeSkills[id]?.length, `${id}: linked to skills`);
    for (const s of map.nodeSkills[id]) assert.ok(map.skills.find((k) => k.id === s).nodes.includes(id), `${id} in skill ${s}`);
    for (const v of n.variants) {
      assert.ok(!ids.has(v.variantId), `duplicate ${v.variantId}`); ids.add(v.variantId);
      assert.ok(/^s\d/.test(v.sourceSlide), `${v.variantId}: sourceSlide`);
      if (v.inputSlot.type === 'choice') { assert.ok(v.inputSlot.shuffleOptions); assert.equal(v.evaluator.targetIds.length, 1); }
      if (v.evaluator.type === 'atomic_rubric') assert.ok(Math.abs(v.evaluator.rubric.reduce((a, r) => a + r.marks, 0) - v.marks) < 1e-9, `${v.variantId}: rubric sum`);
    }
  }
});

test('deck items: every model answer scores full marks and a wrong number loses marks', () => {
  for (const id of IDS) for (const v of N(id).variants) {
    if (v.evaluator.type === 'mapped_fields_match') {
      assert.equal(grade(N(id), v, modelAnswer(v)), 1, `${v.variantId} full marks`);
      const firstNum = Object.entries(v.evaluator.targets).find(([, t]) => t.type === 'numeric');
      if (firstNum) { const bad = { ...modelAnswer(v), [firstNum[0]]: String(Number(firstNum[1].targetExpr) + 3) }; assert.ok(grade(N(id), v, bad) < 1, `${v.variantId}: a wrong number is marked`); }
    } else if (v.evaluator.type === 'choice_match') {
      assert.equal(grade(N(id), v, v.evaluator.targetIds), 1, `${v.variantId} key`);
    } else if (v.evaluator.type === 'order_match') {
      assert.equal(grade(N(id), v, v.evaluator.targetOrder), 1, `${v.variantId} order`);
    }
  }
});

test('oxidation states and dⁿ of the organometallic items match an independent charge balance', () => {
  const G = { Ni: 10, Co: 9, Mn: 7, Pt: 10, Cr: 6, Fe: 8 };
  const spec = {
    'c6-ox-organo-ni2': { m: 'Ni', k: 2, q: 0, lig: [[-1, 2], [0, 2]] },
    'c6-ox-organo-conorb': { m: 'Co', k: 1, q: 0, lig: [[-1, 4]] },
    'c6-ox-organo-codimer': { m: 'Co', k: 2, q: 4, lig: [[0, 8], [-1, 1], [-1, 1]] },
    'c6-ox-organo-mn2co10': { m: 'Mn', k: 2, q: 0, lig: [[0, 10]] },
    'c6-ox-organo-ptpcy3': { m: 'Pt', k: 1, q: 0, lig: [[0, 3]] },
    'c6-ox-organo-zeise': { m: 'Pt', k: 1, q: -1, lig: [[-1, 3], [0, 1]] },
    'c6-ox-organo-cr2oh': { m: 'Cr', k: 2, q: 5, lig: [[0, 10], [-1, 1]] },
    'c6-ox-organo-fecoh5': { m: 'Fe', k: 1, q: 0, lig: [[0, 5]] },
  };
  for (const [vid, s] of Object.entries(spec)) {
    const ox = (s.q - s.lig.reduce((a, [c, n]) => a + c * n, 0)) / s.k;
    const t = V('bk-c6-ox-organo', vid).evaluator.targets;
    assert.equal(Number(t.ox.targetExpr), ox, `${vid} oxidation state`);
    assert.equal(Number(t.d.targetExpr), G[s.m] - ox, `${vid} dⁿ`);
  }
  assert.equal(N('bk-c6-ox-organo').variants.length, Object.keys(spec).length);
});

test('oxo-anion chains: charge balance, dⁿ, tetrahedral e filling and CFSE are recomputed', () => {
  const G = { Mn: 7, Cr: 6, V: 5, Fe: 8 };
  for (const v of N('bk-c6-oxo-chain').variants) {
    const f = /`([^`]+)`/.exec(v.stem)[1];
    const cat = /^(K|Na)([₀-₉]*)/.exec(f), metal = /(Mn|Cr|V|Fe)/.exec(f)[1];
    const k = cat[2] ? Number([...cat[2]].map((c) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join('')) : 1;
    const ox = 8 - k, d = G[metal] - ox;           // four O²⁻ = −8; the cation(s) supply +k
    const t = v.evaluator.targets;
    assert.equal(Number(t.ox.targetExpr), ox, `${f} oxidation state`);
    assert.equal(Number(t.d.targetExpr), d, `${f} dⁿ`);
    assert.equal(Number(t.c.targetExpr), Number((0.6 * d).toFixed(1)), `${f} CFSE (only e is occupied for d ≤ 2)`);
    assert.ok(d <= 2);
    assert.equal(grade(N('bk-c6-oxo-chain'), v, { ...modelAnswer(v), name: 'potassium chlorate' }) < 1, true, `${f}: a wrong name is marked`);
  }
  const mno4 = V('bk-c6-oxo-chain', 'c6-oxo-chain-mno4');
  for (const ok of ['potassium permanganate', 'Potassium tetraoxomanganate(VII)', 'potassium tetraoxidomanganate(7)']) assert.equal(grade(N('bk-c6-oxo-chain'), mno4, { ...modelAnswer(mno4), name: ok }), 1, ok);
  assert.ok(grade(N('bk-c6-oxo-chain'), mno4, { ...modelAnswer(mno4), name: 'potassium tetraoxomanganate(VI)' }) < 1);
});

test('magnetism chain: μ = 2.828 √(χT), n from √(n(n+2)), and the spin state, recomputed from the stem', () => {
  const high = (n) => (n <= 5 ? n : 10 - n), low = { 4: 2, 5: 1, 6: 0, 7: 1 };
  for (const v of N('bk-c8-magnetism-chain').variants.filter((x) => x.evaluator.type === 'mapped_fields_match')) {
    const m = /χ_M = (\d\.\d+)×10(⁻[⁰¹²³⁴⁵⁶⁷⁸⁹]+) cm³ mol⁻¹ at (\d+) K/.exec(v.stem);
    const chi = Number(m[1]) * 10 ** -supNum(m[2].slice(1)), T = Number(m[3]);
    const mu = 2.828 * Math.sqrt(chi * T);
    const n = [1, 2, 3, 4, 5].reduce((best, k) => (Math.abs(Math.sqrt(k * (k + 2)) - mu) < Math.abs(Math.sqrt(best * (best + 2)) - mu) ? k : best), 1);
    const dnum = supNum(/d([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\)/.exec(v.perspectiveLabel)[1]);
    const t = v.evaluator.targets;
    assert.ok(Math.abs(Number(t.mu.targetExpr) - mu) < 0.05, `${v.variantId}: μ ${mu.toFixed(2)} vs ${t.mu.targetExpr}`);
    assert.equal(Number(t.n.targetExpr), n, `${v.variantId}: n`);
    const spin = dnum === 8 ? 'neither' : n === high(dnum) ? 'high' : n === low[dnum] ? 'low' : '?';
    assert.equal(t.spin.expectedExpr, `'${spin}'`, `${v.variantId}: spin state`);
  }
});

test('Oh against Td CFSE is recomputed from the orbital fillings, with Δt = 4/9 Δo', () => {
  const oh = (n) => { const t2g = Math.min(n, 3) + Math.max(0, Math.min(n - 5, 3)); return 0.4 * t2g - 0.6 * (n - t2g); };
  const td = (n) => { const e = Math.min(n, 2) + (n > 5 ? Math.min(n - 5, 2) : 0); return 0.6 * e - 0.4 * (n - e); };
  for (const v of N('bk-c7-oh-td-ratio').variants.filter((x) => x.evaluator.type === 'mapped_fields_match')) {
    const n = supNum(/\(d([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\)/.exec(v.stem)[1]);
    const t = v.evaluator.targets;
    assert.ok(Math.abs(Number(t.oh.targetExpr) - oh(n)) < 1e-9, `d${n} octahedral`);
    assert.ok(Math.abs(Number(t.td.targetExpr) - td(n)) < 1e-9, `d${n} tetrahedral`);
    assert.ok(Math.abs(Number(t.r.targetExpr) - oh(n) / (td(n) * 4 / 9)) < 0.01, `d${n} ratio`);
  }
  assert.ok(Math.abs(oh(8) / (td(8) * 4 / 9) - 27 / 8) < 1e-9, 'the Ni(II) ratio is 27/8');
});

test('A/E/T letters follow the occupation rule, the intensity order follows the ε ranges and the JT table follows the slide', () => {
  const v = V('bk-c8-term-concepts', 'c8-tc-aet');
  Object.entries(v.evaluator.targets).forEach(([k, t], i) => {
    const lab = v.inputSlot.fields[i].label, tg = /t₂g([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/.exec(lab), eg = /e_g([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/.exec(lab);
    const a = tg ? supNum(tg[1]) : 0, e = eg ? supNum(eg[1]) : 0;
    const sym = (x, full) => x === 0 || x === full || (full === 6 ? x === 3 : x === 1 || x === 2 && false);
    const tSym = [0, 3, 6].includes(a), eSym = [0, 2, 4].includes(e);
    const letter = tSym && eSym ? 'A' : tSym ? 'E' : eSym ? 'T' : '?';
    assert.equal(t.expectedDisplay, letter, `${lab}`);
  });
  const rank = { mn: 0.5, ti: 5, ni: 100, mno4: 10000 };
  assert.deepEqual([...V('bk-c8-intensity', 'c8-int-rank').evaluator.targetOrder], Object.keys(rank).sort((x, y) => rank[x] - rank[y]));
  const strong = (n, hs) => (hs ? [4, 9].includes(n) : [7, 9].includes(n)), weak = (n, hs) => (hs ? [1, 2, 6, 7].includes(n) : [1, 2, 4, 5].includes(n));
  const ions = [[4, true], [6, true], [8, true], [7, false], [5, true], [9, true]];
  const t = V('bk-c7-jt-more', 'c7-jt-table').evaluator.targets;
  ions.forEach(([n, hs], i) => assert.equal(t[`j${i}`].expectedExpr, `'${strong(n, hs) ? 'strong' : weak(n, hs) ? 'weak' : 'none'}'`, `d${n} ${hs ? 'high' : 'low'} spin`));
});

test('the term-order, geometry and ligand questions state the facts the deck states', () => {
  const key = (id, vid) => { const v = V(id, vid); const i = v.evaluator.targetIds[0]; return v.inputSlot.options.find((o) => o.id === i).label; };
  assert.equal(key('bk-c8-term-concepts', 'c8-tc-order-d2'), '³F < ¹D < ³P < ¹G < ¹S');
  assert.match(key('bk-c7-geom-orbitals', 'c7-geo-sqpyr'), /d_z²/);
  assert.match(key('bk-c7-geom-orbitals', 'c7-geo-order'), /Tetrahedral and square planar/);
  assert.match(key('bk-c7-oh-td-ratio'.replace('ratio', 'ratio'), 'c7-ohtd-order'), /e\) are lower|\(e\) are lower/);
  assert.match(key('bk-c7-lig-bond', 'c7-lb-cn'), /CN/);
});
