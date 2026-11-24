/* Terms trainer: the pure Trainer namespace (cards, grading, chains) against hand-checked tables and the Tanabe-Sugano data. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadEngine } from './helpers/load-engine.mjs';

const { Trainer, Figures } = loadEngine();
Figures.tsStore.data = JSON.parse(fs.readFileSync(new URL('../public/content/figures/ts.json', import.meta.url), 'utf8'));
let seed = 12345;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const strip = (s) => String(s).replace(/<[^>]+>/g, '');

/* the answers that make a card pass, built from its own `want` (chips answer with the raw label whose pretty form matches) */
function rightAnswers(card) {
  const want = card.check({}).want, a = {};
  if (card.chips) {
    a.seq = Object.keys(want).sort().map((k) => card.chips.pool.find((p) => p.t === want[k]).v).join('|');
    return a;
  }
  for (const f of card.fields) a[f.key] = f.type === 'pick' ? (want[f.key] === 'high spin' ? 'hs' : 'ls') : want[f.key];
  if (card.grid) for (const k of Object.keys(want)) a[k] = want[k];
  return a;
}

test('microstate tables: totals, a golden d2 table, and hole partners share a table', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) assert.equal(Trainer.microTable(n).total, Trainer.choose(10, n), `d${n} total`);
  const d2 = Trainer.microTable(2);
  assert.equal(d2.total, 45);
  assert.deepEqual([...d2.rows], [2, 0]); assert.deepEqual([...d2.cols], [4, 3, 2, 1, 0]);
  assert.equal(d2.want(2, 4), 0, 'M_S = 1 cannot reach M_L = 4 (Pauli)');
  assert.equal(d2.want(0, 4), 1); assert.equal(d2.want(2, 3), 1); assert.equal(d2.want(0, 0), 5); assert.equal(d2.want(2, 0), 2);
  assert.equal(Trainer.microTable(8).m, 2); assert.equal(Trainer.microTable(8).want(0, 0), 5);
  assert.deepEqual([...Trainer.microTable(2).steps.map((s) => s.symbol)], ['3F', '3P', '1G', '1D', '1S']);
  assert.deepEqual([...Trainer.microTable(3).steps.map((s) => s.symbol)], ['4F', '4P', '2H', '2G', '2F', '2D', '2D', '2P']);
});

test('arrangements list the real microstates of a cell', () => {
  assert.equal(Trainer.arrangements(2, 3, 2).length, 1);
  assert.equal(Trainer.arrangements(2, 0, 0).length, 5);
  assert.equal(Trainer.arrangements(2, 4, 2).length, 0);
});

test('peeling d2 and d3 empties the table exactly, term by term', () => {
  for (const m of [2, 3, 4]) {
    const ps = Trainer.peelStates(m);
    const t = Trainer.microTable(m);
    let left = Object.values(t.counts).reduce((a, b) => a + b, 0);
    for (const p of ps) { left -= p.step.N; assert.ok(Object.values(p.work).every((v) => v >= 0), 'never negative before a peel'); }
    assert.equal(left, 0, `d${m}: the term degeneracies add to the total`);
  }
});

test('answer parsing: terms, O_h labels and Tanabe-Sugano labels', () => {
  assert.equal(Trainer.normTerm('³F'), Trainer.normTerm(' 3f '));
  assert.equal(Trainer.normTS('⁴T₁g(P)'), Trainer.normTS('4t1'));
  assert.equal(Trainer.normTS('5T2g'), Trainer.normTS('⁵T₂g'));
  assert.deepEqual([...Trainer.ohMulti('Eg, T1g, T1g, T2g')], [...Trainer.ohMulti('Eg, 2T1g, T2g')]);
  assert.deepEqual([...Trainer.ohMulti('T1g x2, Eg, T2g')], [...Trainer.ohMulti('2T1g, Eg, T2g')]);
  assert.notDeepEqual([...Trainer.ohMulti('Eg, T1g, T2g')], [...Trainer.ohMulti('Eg, 2T1g, T2g')]);
});

test('every card kind builds for many seeds, explains itself, passes with its own answer and fails with a blank', () => {
  for (const kind of Object.keys(Trainer.KINDS)) {
    for (let i = 0; i < 120; i++) {
      const card = Trainer.make(kind, {}, rnd);
      assert.ok(card.prompt && card.explain && card.step, `${kind}: text`);
      const good = card.check(rightAnswers(card));
      assert.ok(good.pass && good.score === 1, `${kind} #${i}: its own answer passes (${strip(card.prompt).slice(0, 80)})`);
      assert.equal(card.check({}).pass, false, `${kind}: a blank answer fails`);
    }
  }
});

test('specific grading rules: counts, ground terms, the d3 two-D terms, table cells, tolerance on readings', () => {
  const c = Trainer.make('count', { n: 3 }, rnd); assert.ok(c.check({ n: '120' }).pass); assert.ok(!c.check({ n: '45' }).pass);
  const g = Trainer.make('ground', { n: 6 }, rnd); assert.ok(g.check({ t: '5D', u: '4' }).pass); assert.ok(!g.check({ t: '3F', u: '4' }).pass);
  const g7 = Trainer.make('ground', { n: 7 }, rnd); assert.ok(g7.check({ t: '⁴F', u: '3' }).pass);
  const t3 = Trainer.make('terms', { n: 3 }, rnd);
  assert.ok(t3.check({ t: '4F, 4P, 2H, 2G, 2F, 2D, 2D, 2P' }).pass);
  assert.ok(!t3.check({ t: '4F, 4P, 2H, 2G, 2F, 2D, 2P' }).pass, 'the second 2D is required');
  const tb = Trainer.make('table', { n: 2 }, rnd); const ans = rightAnswers(tb); assert.ok(tb.check(ans).pass);
  ans.c_0_0 = '4'; const bad = tb.check(ans); assert.ok(!bad.pass && bad.score > 0.85 && bad.ok.c_0_0 === false);
  const oh = Trainer.make('oh', { letter: 'F' }, rnd); assert.ok(oh.check({ t: 'A2g, T1g, T2g' }).pass); assert.ok(!oh.check({ t: 'T1g, T2g' }).pass);
  const h = Trainer.make('hole', { n: 8 }, rnd); assert.ok(h.check({ m: '2', t: '3F' }).pass);
  const read = Trainer.make('tsread', { ion: 7, x: 12 }, rnd); const w = read.check({}).want;
  assert.ok(read.check({ e0: String(+w.e0 + 1), e1: String(+w.e1 - 1), e2: w.e2 }).pass, 'within 1.2 of E/B counts');
  assert.ok(!read.check({ e0: String(+w.e0 + 2.5), e1: w.e1, e2: w.e2 }).pass);
});

test('Tanabe-Sugano cards agree with the diagram data', () => {
  const d7 = Trainer.ionOf(7), cr = Trainer.crossover(d7);
  assert.ok(cr > 18 && cr < 26, `d7 crossover ${cr}`);
  const weak = Trainer.make('tsground', { ion: 7, x: 10 }, rnd), strong = Trainer.make('tsground', { ion: 7, x: 30 }, rnd);
  assert.ok(weak.check({ g: '4T1g', u: '3', s: 'hs' }).pass); assert.ok(strong.check({ g: '2Eg', u: '1', s: 'ls' }).pass);
  assert.ok(!weak.check({ g: '4T1g', u: '3', s: 'ls' }).pass);
  const d3 = Trainer.make('tsground', { ion: 3, x: 20 }, rnd); assert.ok(d3.check({ g: '4A2g', u: '3' }).pass);
  const bands = Trainer.make('tsbands', { ion: 7, x: 12 }, rnd);
  assert.deepEqual([...Object.values(bands.check({}).want)], ['⁴T₂g', '⁴A₂g', '⁴T₁g(P)']);
  assert.ok(bands.check({ seq: '4T2g|4A2g|4T1g(P)' }).pass); assert.ok(!bands.check({ seq: '4A2g|4T2g|4T1g(P)' }).pass);
  assert.ok(!bands.check({ seq: '4T2g|4A2g' }).pass, 'a missing band fails');
  for (const n of [4, 5, 6, 7]) { const c = Trainer.make('tscross', { ion: n }, rnd); assert.ok(c.check(rightAnswers(c)).pass, `d${n}`); }
});

test('ratio method recovers the Delta_o/B the bands were generated at, for every ion that has the pair', () => {
  for (const n of Trainer.RATIO_IONS) {
    for (let i = 0; i < 25; i++) {
      const ctx = { ion: n }, card = Trainer.make('tsratio', ctx, rnd), want = card.check({}).want;
      assert.ok(Math.abs(Number(want.x) - ctx.x) < 0.5, `d${n}: solved ${want.x} vs generated ${ctx.x}`);
      assert.ok(Math.abs(Number(want.b) - ctx.B) / ctx.B < 0.04, `d${n}: B ${want.b} vs ${ctx.B}`);
      assert.ok(Math.abs(Number(want.d) - ctx.x * ctx.B) / (ctx.x * ctx.B) < 0.05, `d${n}: Delta_o`);
      const third = Trainer.make('tsthird', ctx, rnd); assert.ok(third.check(rightAnswers(third)).pass);
    }
  }
});

test('chains: the right steps in order, sharing their numbers, each card buildable', () => {
  for (let i = 0; i < 30; i++) {
    const micro = Trainer.chain('micro', {}, rnd), kinds = micro.map((s) => s.kind);
    assert.equal(kinds[0], 'count'); assert.equal(kinds[1], 'table'); assert.equal(kinds.at(-2), 'ground'); assert.equal(kinds.at(-1), 'oh');
    assert.ok(kinds.filter((k) => k === 'peel').length >= 5);
    assert.ok(micro.every((s) => s.ctx.n === micro[0].ctx.n || s.kind === 'oh'));
    for (const s of micro) assert.ok(Trainer.make(s.kind, s.ctx, rnd).check(rightAnswers(Trainer.make(s.kind, s.ctx, rnd))).pass || s.kind === 'oh');
    const ts = Trainer.chain('ts', {}, rnd);
    assert.deepEqual([...ts.slice(0, 4).map((s) => s.kind)], ['tsground', 'tsbands', 'tsread', 'tsconv']);
    assert.equal(ts[0].ctx, ts[1].ctx, 'the ion, line and B are shared');
    for (const s of ts) Trainer.make(s.kind, s.ctx, rnd);
    for (const s of Trainer.chain('bands', {}, rnd)) Trainer.make(s.kind, s.ctx, rnd);
  }
  for (const n of [2, 3, 8]) assert.equal(Trainer.chain('ts', { ion: n }, rnd).at(-1).kind, 'tsratio', `d${n}: no crossover, so the ratio method closes the chain`);
  for (const n of [4, 5, 6, 7]) { const ch = Trainer.chain('ts', { ion: n }, rnd); assert.equal(ch.at(-1).kind, 'tscross', `d${n}`); for (const st of ch) Trainer.make(st.kind, st.ctx, rnd); }
});

/* ---------------- naming ---------------- */
const { Naming: N } = loadEngine();
const NS = (r) => N.normName(r);

test('naming: every slide ligand is present with the slide name, charge and denticity', () => {
  const names = Object.fromEntries(N.LIGS.map((l) => [l.id, l]));
  const want = { F: ['fluoro', -1], Cl: ['chloro', -1], Br: ['bromo', -1], CN: ['cyano', -1], OH: ['hydroxo', -1], O: ['oxo', -2], NO2: ['nitro', -1], ONO: ['nitrito', -1], SCN: ['thiocyanato', -1], NCS: ['isothiocyanato', -1],
    CH3: ['methyl', -1], CO3: ['carbonato', -2], SO4: ['sulfato', -2], SO3: ['sulfito', -2], S2O3: ['thiosulfato', -2], ox: ['oxalato', -2], gly: ['glycinato', -1], H2O: ['aqua', 0], NH3: ['ammine', 0], CO: ['carbonyl', 0],
    PPh3: ['triphenylphosphine', 0], PCy3: ['tricyclohexylphosphine', 0], DMSO: ['dimethylsulfoxide', 0], py: ['pyridine', 0], MeNH2: ['methylamine', 0], en: ['ethylenediamine', 0], tren: ['triaminotriethylamine', 0], dppm: ['bis(diphenylphosphino)methane', 0] };
  for (const [id, [name, q]] of Object.entries(want)) { assert.equal(names[id].name, name, id); assert.equal(names[id].q, q, `${id} charge`); }
  assert.equal(names.en.dent, 2); assert.equal(names.ox.dent, 2); assert.equal(names.gly.dent, 2); assert.equal(names.edta.dent, 6); assert.equal(names.tren.dent, 4); assert.equal(names.dien.dent, 3);
  assert.deepEqual([...names.gly.donors], ['N', 'O']); assert.deepEqual([...names.ox.donors], ['O', 'O']);
  assert.equal(names.NO2.pair, 'ONO'); assert.equal(names.SCN.pair, 'NCS');
  assert.deepEqual([...N.METALS.map((m) => m.s)], ['Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn']);
  const an = Object.fromEntries(N.METALS.map((m) => [m.s, m.an]));
  assert.deepEqual({ ...an }, { Sc: 'scandate', Ti: 'titanate', V: 'vanadate', Cr: 'chromate', Mn: 'manganate', Fe: 'ferrate', Co: 'cobaltate', Ni: 'nickelate', Cu: 'cuprate', Zn: 'zincate' });
});

test('naming: the rules of the slides on hand-checked complexes', () => {
  const n = (f) => N.nameFromParsed(N.parseFormula(f));
  assert.equal(n('K3[Fe(CN)6]'), 'potassium hexacyanoferrate(III)');
  assert.equal(n('[Co(en)3]2+'), 'tris(ethylenediamine)cobalt(II)');
  assert.equal(n('[Co(Cl)2(NH3)4]+'), 'tetraamminedichlorocobalt(III)');
  assert.equal(n('[CrCl2(H2O)4]+'), 'tetraaquadichlorochromium(III)');
  assert.equal(n('[Ni(CO)3(py)]'), 'tricarbonylpyridinenickel(0)');
  assert.equal(n('[Co(CO)2(H2O)2NH3(C5H5N)]F'), 'amminediaquadicarbonylpyridinecobalt(I) fluoride', 'ammine < aqua < carbonyl < pyridine, ignoring di');
  assert.equal(n('[CrCl2(OH2)4]Cl·2H2O'), 'tetraaquadichlorochromium(III) chloride dihydrate');
  assert.equal(n('[Co(NH3)5(NO2)]2+'), 'pentaamminenitrocobalt(III)');
  assert.equal(n('[Cr(edta)]-'), '(ethylenediaminetetraacetato)chromate(III)');
  assert.equal(N.dimerName({ m: 'Cu', ox: 2, x: 'Cl', term: 'Cl', nTerm: 4, q: -2 }), 'di-µ-chloro-tetrachlorodicuprate(II)');
});

test('naming: every slide example parses, and the generator names it as written (checks parser, namer and the authored list against each other)', () => {
  for (const it of N.SLIDE) {
    const p = N.parseFormula(it.f); assert.ok(p, `parse ${it.f}`);
    const nm = N.nameFromParsed(p);
    assert.ok(NS(nm) === NS(it.name) || NS(nm).replace('dimethylamine', 'dimethylamine') === NS(it.name), `${it.f}: ${nm} vs ${it.name}`);
  }
});

test('naming: generated complexes are consistent (charge balance, counter-ions, coordination number, formula round trip)', () => {
  let seed = 77; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const seenMetals = new Set(), seenLigs = new Set();
  for (let i = 0; i < 1500; i++) {
    const c = N.gen(rnd); seenMetals.add(c.m); c.ligs.forEach((x) => seenLigs.add(x.id));
    assert.equal(N.oxState(c), c.ox, 'oxidation state agrees with the charge');
    const zA = c.anion ? c.anion.n * (c.anion.f === 'SO4' ? 2 : 1) : 0, zC = c.cation ? c.cation.n : 0;
    assert.equal(c.q + zC - zA, 0, `the salt is neutral: ${N.formulaOf(c)}`);
    assert.ok(Math.abs(c.q) <= 3);
    assert.ok(N.cnOf(c.ligs) === 4 || N.cnOf(c.ligs) === 6, 'coordination number 4 or 6');
    const p = N.parseFormula(N.formulaOf(c)); assert.ok(p, N.formulaOf(c));
    assert.equal(p.q, c.q, `charge from the outer ions: ${N.formulaOf(c)}`);
    assert.equal(NS(N.nameFromParsed(p)), NS(N.nameOf(c)), `parsed formula names the same: ${N.formulaOf(c)}`);
    assert.ok(N.sameFormula(N.formulaOf(c), N.formulaOf(c)));
  }
  assert.equal(seenMetals.size, 10, 'all ten first-row metals appear');
  const usable = N.LIGS.filter((l) => l.known !== false).map((l) => l.id);
  for (const id of usable) assert.ok(seenLigs.has(id), `${id} appears in generated complexes`);
});

test('naming: grading accepts the slide spellings and names the usual slips', () => {
  const c = { m: 'Fe', ox: 3, ligs: [{ id: 'CN', n: 6 }], q: -3, cation: { f: 'K', n: 3 }, anion: null, hyd: 0 };
  assert.ok(N.sameName('Potassium hexacyanoferrate(III)', N.nameOf(c)));
  assert.ok(N.sameName('potassium hexacyanidoferrate(III)', N.nameOf(c)), '-ido accepted');
  assert.ok(!N.sameName('potassium hexacyanoiron(III)', N.nameOf(c)));
  assert.match(N.diagnose('potassium hexacyanoiron(III)', c, N.nameOf(c)), /-ate/);
  assert.match(N.diagnose('potassium hexacyanoferrate(II)', c, N.nameOf(c)), /oxidation state/);
  const en = { m: 'Co', ox: 3, ligs: [{ id: 'en', n: 3 }], q: 3, cation: null, anion: { f: 'Cl', n: 3 }, hyd: 0 };
  assert.match(N.diagnose('tri(ethylenediamine)cobalt(III) chloride', en, N.nameOf(en)), /bis, tris/);
  assert.match(N.diagnose('chloride tris(ethylenediamine)cobalt(III)', en, N.nameOf(en)), /cation|order/);
  assert.ok(N.sameName('tris(ethylenediamine)cobalt(III) chloride', N.nameOf(en)));
  const mixed = { m: 'Co', ox: 3, ligs: [{ id: 'NH3', n: 4 }, { id: 'Cl', n: 2 }], q: 1, cation: null, anion: { f: 'Cl', n: 1 }, hyd: 0 };
  assert.match(N.diagnose('dichlorotetraamminecobalt(III) chloride', mixed, N.nameOf(mixed)), /alphabetical/);
});

test('naming: formulas typed by the student are compared by structure, not spelling', () => {
  assert.ok(N.sameFormula('K3[Fe(CN)6]', 'K3[Fe(CN)6]'));
  assert.ok(N.sameFormula('K₃[Fe(CN)₆]', 'K3[Fe(CN)6]'));
  assert.ok(N.sameFormula('[Co(Cl)2(en)2]', '[Co(en)2Cl2]'), 'ligand order and brackets do not matter');
  assert.ok(N.sameFormula('[Co(OH2)6]Cl3', '[Co(H2O)6]Cl3'), 'OH2 = H2O');
  assert.ok(N.sameFormula('[Cr(NH2CH2CH2NH2)3]Cl3', '[Cr(en)3]Cl3'));
  assert.ok(!N.sameFormula('[Co(NH3)5Cl]Cl2', '[Co(NH3)5Cl]SO4'));
  assert.ok(!N.sameFormula('[Co(NH3)5(NO2)]Cl2', '[Co(NH3)5(ONO)]Cl2'), 'nitro and nitrito differ');
  assert.equal(N.parseFormula('[Co(NH3)'), null);
});
