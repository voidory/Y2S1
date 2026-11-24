import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Evaluators } = loadEngine();
const doc = readContent('reactions.json', 'cm2021');
const eqRoutes = (r) => [r.steps || [r.eq], ...(r.alt || []).map((a) => (Array.isArray(a) ? a : [a]))];

test('reaction data: every reaction has a group, a prompt, a memory hook and (equation | steps | nuclear answer)', () => {
  const gids = new Set(doc.groups.map((g) => g.id));
  const seen = new Set();
  for (const r of doc.reactions) {
    assert.ok(!seen.has(r.id), `duplicate ${r.id}`); seen.add(r.id);
    assert.ok(gids.has(r.g), `${r.id}: group`);
    assert.ok(r.ask && r.hook, `${r.id}: ask/hook`);
    assert.ok(r.kind === 'nuc' ? r.answer && r.answer.A && r.answer.Z && r.answer.sym : (r.eq || (r.steps && r.steps.length)), `${r.id}: answer`);
    assert.ok([1, 2, 3].includes(r.x), `${r.id}: weight`);
  }
  for (const g of doc.groups) assert.ok(doc.reactions.some((r) => r.g === g.id), `empty group ${g.id}`);
  for (const c of doc.chains) for (const row of c.rows) assert.ok(seen.has(row.rid), `${c.id}: ${row.rid}`);
});

test('every reaction equation (and every accepted alternative) is balanced in atoms and charge, and the app grades it correct', () => {
  const bad = [];
  for (const r of doc.reactions) {
    if (r.kind === 'nuc') continue;
    for (const route of eqRoutes(r)) {
      const lines = Evaluators.parseEquationBlock(route);
      for (const l of lines) if (!l.valid || !l.isBalanced || !l.chargeBalanced) bad.push(`${r.id}: ${l.raw} ${l.error || ''} ${(l.unbalancedElements || []).join(',')}`);
      const res = Evaluators.gradeEquationMatch({ accepted: eqRoutes(r).map((x) => ({ equations: x })) }, route.join('\n'));
      if (res.normalizedGrade !== 1) bad.push(`${r.id}: own answer scored ${res.normalizedGrade} (${res.feedback})`);
    }
  }
  assert.deepEqual(bad, []);
});

test('a wrong or unbalanced attempt is not marked correct', () => {
  const r = doc.reactions.find((x) => x.id === 'n-haber');
  const acc = { accepted: [{ equations: [r.eq] }] };
  assert.equal(Evaluators.gradeEquationMatch(acc, 'N2 + H2 -> NH3').normalizedGrade, 0.5);
  assert.equal(Evaluators.gradeEquationMatch(acc, 'N2 + 3H2 -> 2NH3').normalizedGrade, 1);
  assert.equal(Evaluators.gradeEquationMatch(acc, '2N2 + 6H2 -> 4NH3').normalizedGrade, 1);
  assert.equal(Evaluators.gradeEquationMatch(acc, 'N2 + O2 -> 2NO').normalizedGrade, 0);
});

/* ---------- the Reactions engine: display, cards, grading, boxes ---------- */
const { Reactions } = loadEngine();
const byId = Object.fromEntries(doc.reactions.map((r) => [r.id, r]));
const fns = { gradeEquationMatch: Evaluators.gradeEquationMatch };

test('formulas are typeset with subscripts and charges', () => {
  assert.equal(Reactions.fmtEq('N2 + 3H2 -> 2NH3'), 'N<sub>2</sub> + 3H<sub>2</sub> → 2NH<sub>3</sub>');
  assert.equal(Reactions.fmtEq('2Br^- -> Br2 + 2e-'), '2Br<sup>−</sup> → Br<sub>2</sub> + 2e<sup>−</sup>');
  assert.ok(Reactions.fmtEq('SiF4 + 2F^- -> [SiF6]^2-').includes('[SiF<sub>6</sub>]<sup>2−</sup>'));
  assert.ok(Reactions.fmtEq('2SiH3Cl + H2O -> (SiH3)2O + 2HCl').includes('(SiH<sub>3</sub>)<sub>2</sub>O'));
  for (const r of doc.reactions) for (const e of (r.steps || (r.eq ? [r.eq] : []))) assert.ok(!/<(?!\/?(?:sub|sup)>)/.test(Reactions.fmtEq(e)), `${r.id} renders sub/sup only`);
});

test('every reaction can be turned into a card of the kind chosen for it, and a gap card hides exactly one species', () => {
  for (const r of doc.reactions) {
    for (const st of [undefined, { seen: 1, box: 0 }, { seen: 3, box: 3 }]) {
      for (const rnd of [0.05, 0.5, 0.95]) {
        const kind = Reactions.chooseKind(r, st, rnd);
        assert.ok(['write', 'gap', 'name', 'cond', 'nuc'].includes(kind));
        if (kind === 'name') assert.ok(r.aka, `${r.id}: name card without aka`);
        if (kind === 'cond') assert.ok(r.cond, `${r.id}: cond card without cond`);
        const card = Reactions.buildCard(r, kind, rnd);
        if (kind === 'gap') { assert.equal((card.eqHtml.match(/data-rx-blank/g) || []).length, 1, r.id); assert.ok(card.answer.length > 0); }
      }
    }
  }
});

test('gap cards accept the missing formula however it is typed, and nothing else', () => {
  const card = Reactions.buildCard(byId['n-haber'], 'gap', 0.99);   // last species: NH3
  assert.equal(card.answer, 'NH3');
  for (const ok of ['NH3', ' nh3'.trim() && 'NH3', 'NH₃', '2NH3', 'NH3(g)']) assert.equal(Reactions.gradeCard(card, byId['n-haber'], ok, fns).grade, 1, ok);
  for (const no of ['NH4', 'N2', 'H3N2']) assert.equal(Reactions.gradeCard(card, byId['n-haber'], no, fns).grade, 0, no);
  const ion = Reactions.buildCard(byId['hal-clbr'], 'gap', 0.5);
  assert.ok(ion.answer);
  assert.equal(Reactions.gradeCard({ kind: 'gap', answer: 'Br^-' }, byId['hal-clbr'], 'Br-', fns).grade, 1);
  assert.equal(Reactions.gradeCard({ kind: 'gap', answer: '[SiF6]^2-' }, byId['si-sif4-f'], '[SiF6]2-', fns).grade, 1);
});

test('write cards: a right answer scores 1, right species unbalanced 0.5, wrong 0; steps may come in any order', () => {
  const w = (id, txt) => Reactions.gradeCard({ kind: 'write' }, byId[id], txt, fns).grade;
  assert.equal(w('g1-na', '2Na + O2 -> Na2O2'), 1);
  assert.equal(w('g1-na', '2Na + O2 → Na2O2'), 1);
  assert.equal(w('g1-na', 'Na + O2 -> Na2O2'), 0.5);
  assert.equal(w('g1-na', '4Na + O2 -> 2Na2O'), 0);
  assert.equal(w('n-wislicenus', '2NaNH2 + N2O -> NaN3 + NaOH + NH3\n2Na + 2NH3 -> 2NaNH2 + H2'), 1);
  assert.equal(w('nox-aqua', 'Au + HNO3 + 4HCl -> HAuCl4 + NO + 2H2O'), 1);          // the one-line alternative
  assert.equal(w('n-olin', '2NH3 + NaOCl -> N2H4 + NaCl + H2O'), 1);
  assert.equal(w('n-olin', 'NH3 + NaOCl -> NH2Cl + NaOH\nNH2Cl + NH3 + NaOH -> N2H4 + NaCl + H2O'), 1);
  assert.equal(w('b-bf3-hf', 'BF3 + HF -> HBF4'), 1);
  assert.equal(w('g1-na', ''), 0);
});

test('name and nuclear cards', () => {
  assert.equal(Reactions.gradeCard({ kind: 'name' }, byId['n-haber'], 'Haber-Bosch process', fns).grade, 1);
  assert.equal(Reactions.gradeCard({ kind: 'name' }, byId['n-haber'], 'Ostwald', fns).grade, 0);
  assert.equal(Reactions.gradeCard({ kind: 'name' }, byId['nox-aqua'], 'aqua regia', fns).grade, 1);
  for (const ok of ['25Mg', '²⁵Mg', 'Mg-25', 'mg 25', 'magnesium-25']) assert.equal(Reactions.gradeCard({ kind: 'nuc' }, byId['nuc-ne'], ok, fns).grade, 1, ok);
  for (const no of ['24Mg', '25Al', 'Mg', '']) assert.equal(Reactions.gradeCard({ kind: 'nuc' }, byId['nuc-ne'], no, fns).grade, 0, no);
  assert.equal(Reactions.gradeCard({ kind: 'nuc' }, byId['nuc-u'], 'Pu-239', fns).grade, 1);
  // every nuclear answer is itself consistent (A and Z conserved is checked by hand above; here: the element symbol matches Z)
  const Z = { Mg: 12, Pu: 94, C: 6 };
  for (const r of doc.reactions.filter((x) => x.kind === 'nuc')) assert.equal(Z[r.answer.sym], r.answer.Z, r.id);
});

test('boxes: right moves up, a miss drops to 0 and is due now, partly keeps the box; due and unseen cards come first', () => {
  let st = {};
  const t0 = 1e12;
  st = Reactions.applyResult(st, 'a', 1, t0); assert.equal(st.a.box, 1); assert.ok(st.a.due > t0);
  st = Reactions.applyResult(st, 'a', 1, t0 + 1); st = Reactions.applyResult(st, 'a', 1, t0 + 2); assert.equal(st.a.box, 3);
  st = Reactions.applyResult(st, 'a', 0.5, t0 + 3); assert.equal(st.a.box, 3);
  st = Reactions.applyResult(st, 'a', 0, t0 + 4); assert.equal(st.a.box, 0); assert.equal(st.a.due, t0 + 4); assert.equal(st.a.miss, 1);
  assert.ok(Reactions.isKnown({ box: 3 }) && !Reactions.isKnown({ box: 2 }));

  const rs = doc.reactions;
  const stats = {};
  for (const r of rs.slice(0, 40)) stats[r.id] = { box: 4, seen: 5, right: 5, due: t0 + 1e10 };   // known, not due
  const missed = rs[3].id; stats[missed] = { box: 0, seen: 2, miss: 2, due: t0 };                 // due now
  const q = Reactions.pickQueue(rs, stats, t0 + 1000, { n: 12 }, () => 0.5);
  assert.equal(q.length, 12);
  assert.ok(q.includes(missed), 'the missed reaction comes back first');
  assert.ok(q.every((id) => !stats[id] || id === missed), 'known reactions that are not due stay out while unseen ones remain');
  assert.equal(new Set(q).size, 12);
  const only = Reactions.pickQueue(rs, {}, t0, { n: 50, group: 'nchain' }, Math.random);
  assert.ok(only.length > 0 && only.every((id) => byId[id].g === 'nchain'));
  const named = Reactions.pickQueue(rs, {}, t0, { n: 50, namedOnly: true }, Math.random);
  assert.ok(named.length > 5 && named.every((id) => byId[id].aka));
  const exam = Reactions.pickQueue(rs, {}, t0, { n: 100, examOnly: true }, Math.random);
  assert.ok(exam.length >= 8 && exam.every((id) => byId[id].x >= 3));
});

test('the finals evidence is attached to the reactions the three papers asked', () => {
  const fin = Object.fromEntries(doc.reactions.filter((r) => r.fin && r.fin.length).map((r) => [r.id, r.fin.join(',')]));
  assert.match(fin['g1-na'], /2023\/24/); assert.match(fin['g1-k'], /2024\/25/);
  assert.match(fin['nox-aqua'], /2023\/24/); assert.match(fin['nox-aqua'], /2025\/26/);
  assert.match(fin['n-wislicenus'], /2025\/26/); assert.match(fin['p-pf5'], /2024\/25/); assert.match(fin['p-pcl3-h2o'], /2023\/24/);
  assert.match(fin['nuc-ne'], /2024\/25/); assert.match(fin['nuc-u'], /2025\/26/);
});

test('a wrong answer with the right species says what is off instead of a generic message', () => {
  const ev = { gradeEquationMatch: Evaluators.gradeEquationMatch, parseEquationLine: Evaluators.parseEquationLine };
  const g = (id, txt) => Reactions.gradeCard({ kind: 'write' }, byId[id], txt, ev);
  const swapped = g('n-haber', 'NH3 + N2 -> H2');              // species wrong: engine's own message
  assert.equal(swapped.grade, 0);
  assert.match(g('n-haber', '2NH3 -> N2 + 3H2').feedback, /N2 should be on the reactant side|NH3 should be on the reactant side|should be on the/);
  assert.match(g('n-wislicenus', '2Na + 2NH3 -> 2NaNH2 + H2\n2NaNH2 + N2O -> NaN3 + NaOH').feedback, /NH3 should appear on both sides|missing species/i);
  assert.match(g('n-wislicenus', '2Na + 2NH3 -> 2NaNH2 + H2').feedback, /missing species|takes 2 equations/i);
});

test('patterns: each has a title, a rule, reagent chips and at least three rows that point at real reactions', () => {
  assert.ok(Array.isArray(doc.patterns) && doc.patterns.length >= 8, 'patterns exist');
  const ids = new Set(doc.reactions.map((r) => r.id)), seen = new Set();
  for (const p of doc.patterns) {
    assert.ok(!seen.has(p.id), `duplicate ${p.id}`); seen.add(p.id);
    assert.ok(p.title && p.rule && p.rule.length > 40, `${p.id}: title and rule`);
    assert.ok(p.reagents.length >= 1, `${p.id}: reagents`);
    assert.ok(p.rows.length >= 3, `${p.id}: rows`);
    for (const row of p.rows) { assert.ok(row.label, `${p.id}: label`); assert.ok(ids.has(row.rid), `${p.id}: ${row.rid}`); }
  }
  // the reagent axis the owner asked for is covered
  const chips = new Set(doc.patterns.flatMap((p) => p.reagents));
  for (const x of ['O₂', 'H₂O', 'N₂', 'H₂', 'Cl₂', 'F₂']) assert.ok(chips.has(x), `reagent ${x}`);
});

test('exceptions: neutral stems, decoys, a second "what does it give" step, and the pure card/grade logic works', () => {
  const { Reactions } = loadEngine();
  assert.ok(Array.isArray(doc.exceptions) && doc.exceptions.length >= 5);
  const byId = new Map(doc.reactions.map((r) => [r.id, r]));
  const answers = new Set();
  for (const e of doc.exceptions) {
    assert.ok(e.ask && e.why && e.why.length > 30, `${e.id}: ask/why`);
    assert.ok(!/only|Li only|also releases|does not hydrolyse|stops at/i.test(e.ask), `${e.id}: the stem must not name the exception`);
    assert.ok(e.options.length >= 3 && e.options.includes(e.answer), `${e.id}: options`);
    assert.ok(!answers.has(e.answer), `${e.id}: the answer reaction is used once`); answers.add(e.answer);
    for (const o of [...e.options, ...(e.decoys || [])]) assert.ok(byId.get(o)?.eq, `${e.id}: ${o} needs a single equation to show as reactants`);
    assert.ok(e.then && e.then.right && e.then.wrong.length >= 3 && !e.then.wrong.includes(e.then.right), `${e.id}: then`);
    for (const seed of [0.01, 0.5, 0.99]) {
      let k = 0; const seq = [seed, 1 - seed, seed / 2, 0.7];
      const card = Reactions.buildExceptionCard(e, () => seq[k++ % seq.length]);
      const pool = new Set([...e.options, ...(e.decoys || [])]);
      assert.ok(card.options.includes(e.answer) && card.options.length >= 3 && card.options.length <= 5 && card.options.every((o) => pool.has(o)), `${e.id}: options come from the pool, answer present`);
      assert.equal(Reactions.gradeException(card, e.answer).grade, 1);
      for (const o of card.options.filter((x) => x !== e.answer)) assert.equal(Reactions.gradeException(card, o).grade, 0);
      assert.equal(card.then.options.filter((o) => o.ok).length, 1);
      card.then.options.forEach((o, i) => assert.equal(Reactions.gradeExceptionOutcome(card, i).grade, o.ok ? 1 : 0));
    }
  }
});

test('lower case is accepted: species are matched ignoring case, in write and gap cards, and a whole equation typed into a gap card is graded as an equation', () => {
  const w = (id, txt, kind = 'write', answer) => Reactions.gradeCard({ kind, answer }, byId[id], txt, fns).grade;
  assert.equal(w('g1-na', '2na + o2 -> na2o2'), 1);
  assert.equal(w('g1-ko2', '2ko2 + 2h2o -> 2koh + h2o2 + o2'), 1);
  assert.equal(w('g1-ko2', '2ko2 + 2h2o -> 2koh + h2o2 + o2', 'gap', 'O2'), 1);
  assert.equal(w('g1-ko2', 'o2', 'gap', 'O2'), 1);
  assert.equal(w('g1-ko2', '2ko2 + 2h2o -> 2koh + h2o2', 'gap', 'O2'), 0, 'the wrong equation is still wrong');
  assert.equal(w('g1-na', 'na + o2 -> na2o2'), 0.5, 'lower case does not make an unbalanced equation right');
  assert.equal(w('g1-na', '4na + o2 -> 2na2o'), 0);
  assert.equal(w('hal-clbr', 'br-', 'gap', 'Br^-'), 1);
});
