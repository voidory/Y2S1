import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const E = loadEngine();
const { Review, Evaluators, LF, SEED_NODES } = E;
const bank = readContent('question-bank.json');
const byId = Object.fromEntries(bank.questionNodes.map((n) => [n.id, n]));
// objects built inside the vm sandbox have another realm's prototypes: compare through JSON
const J = (x) => JSON.parse(JSON.stringify(x));
const variantOf = (id, vid) => byId[id].variants.find((v) => v.variantId === vid);
const run = (id, vid, input, checks = {}) => {
  const v = variantOf(id, vid);
  const res = Evaluators.evaluate(v, input, {}, checks, byId[id]);
  return { v, res, rv: J(Review.buildAnswerReview(v, input, res, checks)) };
};

test('prettyFormula: reads as chemistry', () => {
  assert.equal(Review.prettyFormula('N2 + 3H2 -> 2NH3'), 'N₂ + 3H₂ → 2NH₃');
  assert.equal(Review.prettyFormula('NH4^+ + OH^- -> NH3 + H2O'), 'NH₄⁺ + OH⁻ → NH₃ + H₂O');
  assert.equal(Review.prettyFormula('Fe^3+ + 3e^- -> Fe'), 'Fe³⁺ + 3e⁻ → Fe');
  assert.equal(Review.prettyFormula('(NH4)2SO4'), '(NH₄)₂SO₄');
  assert.equal(Review.prettyFormula('2NO + O2 -> 2NO2'), '2NO + O₂ → 2NO₂', 'leading coefficients stay full size');
});

test('choice review: every option is marked right, wrong, missed or neutral', () => {
  const v = variantOf('bk-c6-isomer-type', 'c6-isomer-type-v3') || byId['bk-c6-isomer-type'].variants.find((x) => x.perspectiveLabel === 'Nitro complex');
  const targets = v.evaluator.targetIds;
  const wrongOne = v.inputSlot.options.find((o) => !targets.includes(o.id)).id;
  const input = [targets[0], wrongOne];
  const res = Evaluators.evaluate(v, input, {}, {}, byId['bk-c6-isomer-type']);
  const rv = J(Review.buildAnswerReview(v, input, res, {}));
  assert.equal(rv.kind, 'choice');
  const state = (id) => rv.options.find((o) => o.id === id).state;
  assert.equal(state(targets[0]), 'right');
  assert.equal(state(wrongOne), 'wrong');
  for (const t of targets.slice(1)) assert.equal(state(t), 'missed');
  assert.ok(rv.anyWrong);
  const nothing = J(Review.buildChoiceReview(v, []));
  assert.equal(nothing.nothingPicked, true);
  assert.ok(nothing.options.filter((o) => o.state === 'missed').length === targets.length);
});

test('equation review: atom-count table shows exactly which elements are unbalanced', () => {
  const { rv, res } = run('bk-c4-haber', 'c4-haber-v1', 'N2 + H2 -> NH3');
  assert.equal(rv.kind, 'equation');
  assert.equal(res.passed, false);
  const row = rv.rows[0];
  assert.equal(row.valid, true);
  assert.equal(row.balanced, false);
  const at = Object.fromEntries(row.atoms.map((a) => [a.el, a]));
  assert.deepEqual([at.N.left, at.N.right, at.N.ok], [2, 1, false]);
  assert.deepEqual([at.H.left, at.H.right, at.H.ok], [2, 3, false]);
  assert.match(rv.correct, /N2 \+ 3H2 -> 2NH3/, 'the balanced reference is carried');
  // a balanced but different multiple of the right answer is shown balanced
  const ok = run('bk-c4-haber', 'c4-haber-v1', 'N2 + 3H2 -> 2NH3');
  assert.equal(ok.rv.rows[0].balanced, true);
  assert.ok(ok.rv.rows[0].atoms.every((a) => a.ok));
});

test('equation review: wrong species, charge, and unreadable lines are all reported', () => {
  const wrong = run('bk-c4-olin-raschig', 'c4-olin-raschig-v2', 'NH3 + NaCl -> N2H4 + NaOCl');
  assert.ok(wrong.rv.missing.length + wrong.rv.extra.length > 0, 'species differences are listed');
  const noArrow = run('bk-c4-olin-raschig', 'c4-olin-raschig-v2', 'NH3 and NaOCl give N2H4');
  assert.equal(noArrow.rv.rows[0].valid, false);
  assert.match(noArrow.rv.rows[0].error, /arrow/i);
  const blank = run('bk-c4-olin-raschig', 'c4-olin-raschig-v2', '');
  assert.equal(blank.rv.hasInput, false);
  const charged = J(Review.buildEquationReview(variantOf('bk-c4-olin-raschig', 'c4-olin-raschig-v2'), 'NH4^+ + OH^- -> NH3 + H2O', { passed: false }));
  assert.equal(charged.rows[0].charge, null, 'balanced charge is not flagged');
  const unbalCharge = J(Review.buildEquationReview(variantOf('bk-c4-olin-raschig', 'c4-olin-raschig-v2'), 'NH4^+ + OH^- -> NH3 + H2O^-', { passed: false }));
  assert.equal(unbalCharge.rows[0].charge.ok, false);
});

test('rubric review: lists every criterion with met / missed, flags critical steps and the veto', () => {
  const v = variantOf('bk-c4-inert-pair', 'c4-inert-pair-v1');
  const checks = { r1: true, r2: false, r3: false };
  const res = Evaluators.evaluate(v, 'my answer', {}, checks, byId['bk-c4-inert-pair']);
  const rv = J(Review.buildAnswerReview(v, 'my answer', res, checks));
  assert.equal(rv.kind, 'rubric');
  assert.equal(rv.items.length, 3);
  assert.deepEqual(rv.items.map((i) => i.met), [true, false, false]);
  assert.deepEqual(rv.items.map((i) => i.critical), [false, true, true]);
  assert.equal(rv.veto, true);
  assert.equal(rv.text, 'my answer');
  assert.equal(rv.earned, 1);
  const all = J(Review.buildAnswerReview(v, 'x', Evaluators.evaluate(v, 'x', {}, { r1: true, r2: true, r3: true }, byId['bk-c4-inert-pair']), { r1: true, r2: true, r3: true }));
  assert.equal(all.veto, false);
  assert.ok(all.items.every((i) => i.met));
});

test('set review: correct, extra and missing items, honouring case and synonyms', () => {
  const n = LF.generateQuestionBank({}).find((x) => x.id === 'lf-inv-M_H2O_6_2plus-lfse-0p6-0p'); // Cr and Cu
  const v = n.variants[0];
  const input = { tokens: ['cr', 'Fe'], fields: { name: '', lfse: '' } };
  const res = Evaluators.evaluate(v, input, {}, {}, n);
  const rv = J(Review.buildAnswerReview(v, input, res, {}));
  assert.equal(rv.kind, 'set');
  assert.deepEqual(rv.correct, ['cr']);
  assert.deepEqual(rv.extra, ['Fe']);
  assert.deepEqual(rv.missing, ['Cu']);
  assert.equal(rv.passed, false);
  assert.ok(rv.fields && rv.fields.rows.length >= 1, 'the name and LFSE fields are reviewed too');
  const perfect = J(Review.buildSetReview(v, { tokens: ['Cu', 'Cr', 'cu'] }, res));
  assert.deepEqual([perfect.extra.length, perfect.missing.length, perfect.passed], [0, 0, true], 'duplicates are not double counted');
});

test('short and ordered answers: you versus correct, and the correct order with where you put each item', () => {
  const sv = byId['bk-c2-ice'].variants.find((v) => v.inputSlot.type === 'typed_short');
  const res = Evaluators.evaluate(sv, '3', {}, {}, byId['bk-c2-ice']);
  const rv = J(Review.buildAnswerReview(sv, '3', res, {}));
  assert.equal(rv.kind, 'short');
  assert.equal(rv.yours, '3');
  assert.equal(rv.passed, false);

  let found = null;
  for (const n of bank.questionNodes) for (const v of n.variants) if (!found && v.inputSlot?.type === 'ordered_list') found = [n, v];
  if (found) {
    const [n, v] = found;
    const ids = v.inputSlot.items.map((it) => String(typeof it === 'object' ? it.id : it));
    const reversed = ids.slice().reverse();
    const r = Evaluators.evaluate(v, reversed, {}, {}, n);
    const o = J(Review.buildAnswerReview(v, reversed, r, {}));
    assert.equal(o.kind, 'order');
    assert.equal(o.rows.length, ids.length);
    assert.ok(o.rows.every((row) => row.correctPos >= 1 && row.yourPos >= 1));
  }
});

test('smoke: every question in the bank and the generated pool builds a review (or none) without throwing', () => {
  const all = [...bank.questionNodes, ...SEED_NODES, ...LF.generateQuestionBank({})];
  let built = 0, none = 0;
  const kinds = {};
  for (const n of all) {
    for (const v of n.variants) {
      for (const input of ['', 'zzz', ['zzz'], {}, { tokens: ['zzz'], fields: { name: 'zzz' } }]) {
        let res;
        try { res = Evaluators.evaluate(v, input, {}, {}, n); } catch (e) { continue; } // the grader itself rejecting odd input is not this card's concern
        let rv;
        assert.doesNotThrow(() => { rv = Review.buildAnswerReview(v, input, res, {}); }, `${n.id}/${v.variantId}`);
        if (rv) { built++; kinds[rv.kind] = (kinds[rv.kind] || 0) + 1; assert.doesNotThrow(() => JSON.stringify(rv)); } else none++;
      }
    }
  }
  assert.ok(built > 500, `expected reviews for most variants (${built} built, ${none} none)`);
  for (const k of ['mapped', 'set', 'choice', 'equation', 'rubric', 'short']) assert.ok(kinds[k] > 0, `no ${k} reviews were built`);
});
