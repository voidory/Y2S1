import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const E = loadEngine();
const { Review, Evaluators } = E;
const bank = readContent('question-bank.json');
const byId = Object.fromEntries(bank.questionNodes.map((n) => [n.id, n]));
const count = (svg, attr) => (svg.match(new RegExp(`data-${attr}="1"`, 'g')) || []).length;

test('shapeFromName: recognises the spellings students actually type', () => {
  const cases = {
    'linear': 'linear', 'Bent': 'bent', 'angular': 'bent', 'V-shaped': 'bent', 'trigonal planar': 'trigonal planar',
    'trigonal pyramidal': 'trigonal pyramidal', 'pyramidal': 'trigonal pyramidal', 'tetrahedral': 'tetrahedral',
    'seesaw': 'see-saw', 'see saw': 'see-saw', 'See-Saw': 'see-saw', 'T-shaped': 'T-shaped', 'T shape': 'T-shaped',
    'square planar': 'square planar', 'square pyramidal': 'square pyramidal', 'square-based pyramid': 'square pyramidal',
    'trigonal bipyramidal': 'trigonal bipyramidal', 'TBP': 'trigonal bipyramidal', 'octahedral': 'octahedral',
    'pentagonal bipyramidal': 'pentagonal bipyramidal', 'pentagonal bipyramid': 'pentagonal bipyramidal',
  };
  for (const [text, shape] of Object.entries(cases)) assert.equal(Review.shapeFromName(text)?.shape, shape, text);
  assert.equal(Review.shapeFromName(''), null);
  assert.equal(Review.shapeFromName('banana'), null);
});

test('shapes: every (bonded, lone) pair maps to one shape, and each shape name maps back to a typical count', () => {
  for (const [shape, [bp, lp]] of Object.entries(Review.CANON)) assert.equal(Review.SHAPE_OF[`${bp},${lp}`], shape, shape);
});

test('drawing: each shape draws exactly its bonded atoms and lone-pair lobes', () => {
  for (const key of Object.keys(Review.SHAPE_OF)) {
    const [bp, lp] = key.split(',').map(Number);
    const svg = Review.vseprSvg(bp, lp);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), key);
    assert.equal(count(svg, 'bond'), bp, `${key}: bonded atoms`);
    assert.equal(count(svg, 'lp'), lp, `${key}: lone pairs`);
  }
  assert.equal(Review.vseprSvg(9, 0), '', 'unsupported domain counts draw nothing');
  assert.equal(Review.vseprSvg(0, 3), '');
  // lone pairs go where VSEPR puts them: equatorial in a trigonal bipyramid, trans in an octahedron
  assert.equal(JSON.stringify(Review.lonePairIndices(5, 2)), '[2,3]');
  assert.equal(JSON.stringify(Review.lonePairIndices(6, 2)), '[4,5]');
});

test('diagnosis: says what is actually wrong', () => {
  const d = (youText, bp, lp) => {
    const shape = Review.SHAPE_OF[`${bp},${lp}`];
    return Review.diagnoseShape(Review.shapeFromName(youText), { shape, bp, lp });
  };
  assert.match(d('linear', 2, 1), /missed 1 lone pair/);                        // SO2 said linear
  assert.match(d('tetrahedral', 4, 1), /missed 1 lone pair/);                   // SF4 said tetrahedral
  assert.match(d('bent', 2, 3), /missed 2 lone pairs/);                         // XeF2 said bent
  assert.match(d('square planar', 4, 0), /added 2 lone pairs that are not there/); // CF2Cl2 said square planar
  assert.match(d('see-saw', 3, 2), /Same electron geometry \(trigonal bipyramidal\)/); // ICl3 said see-saw
  assert.match(d('octahedral', 5, 1), /Same electron geometry \(octahedral\)/);        // XeOF4 said octahedral
  assert.match(d('trigonal planar', 4, 0), /Count the electron domains again/);
  assert.equal(d('T-shaped', 3, 2), 'The shape is right.');
  assert.match(Review.diagnoseShape(null, { shape: 'bent', bp: 2, lp: 1 }), /No recognisable shape/);
});

test('data: every annotated shape field draws the same shape the bank asks for', () => {
  const bad = [];
  let fields = 0;
  for (const n of bank.questionNodes) {
    for (const v of n.variants) {
      const vs = v.review?.vsepr;
      if (!vs) continue;
      for (const [key, { bp, lp }] of Object.entries(vs)) {
        fields++;
        const expected = v.evaluator.targets?.[key]?.expectedDisplay;
        const fromName = Review.shapeFromName(expected)?.shape;
        if (!expected || fromName !== Review.SHAPE_OF[`${bp},${lp}`]) bad.push(`${n.id}/${v.variantId}/${key}: ${bp}+${lp} is ${Review.SHAPE_OF[`${bp},${lp}`]}, the bank says ${expected}`);
        if (!Review.vseprSvg(bp, lp)) bad.push(`${n.id}/${v.variantId}/${key}: cannot draw ${bp}+${lp}`);
      }
    }
  }
  assert.deepEqual(bad, []);
  assert.ok(fields >= 18, `expected the shape questions to be annotated (${fields})`);
});

test('data: every VSEPR-style shape question in chapters 1 and 4 has its drawing data', () => {
  const missing = [];
  for (const n of bank.questionNodes) {
    if (!/^bk-c[14]-/.test(n.id)) continue;
    for (const v of n.variants) {
      for (const [k, spec] of Object.entries(v.evaluator?.targets || {})) {
        if (v.evaluator.type === 'mapped_fields_match' && Review.shapeFromName(spec.expectedDisplay) && !v.review?.vsepr?.[k]) missing.push(`${n.id}/${v.variantId}/${k} (${spec.expectedDisplay})`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

test('review rows: built from the real grader, with a drawn comparison for wrong shapes', () => {
  const node = byId['bk-c1-vsepr-ex1'];
  const v = node.variants[0];
  const input = { a: 'linear', b: 'seesaw', c: 'square pyramidal' };
  const res = Evaluators.evaluate(v, input, {}, {}, node);
  const rv = Review.buildMappedReview(v, input, res);
  assert.equal(rv.rows.length, 3);
  assert.deepEqual(rv.rows.map((r) => r.passed), [false, false, true]);
  assert.equal(rv.anyShape && rv.anyWrong, true);
  assert.equal(rv.rows[0].vsepr.yours.shape, 'linear');
  assert.equal(rv.rows[0].vsepr.correct.shape, 'bent');
  assert.match(rv.rows[0].vsepr.diagnosis, /missed 1 lone pair/);
  assert.match(rv.rows[1].vsepr.diagnosis, /Same electron geometry/);
  // a blank or unreadable answer still gets the right picture, and says so
  const blank = Review.buildMappedReview(v, {}, Evaluators.evaluate(v, {}, {}, {}, node));
  assert.ok(blank.rows.every((r) => r.vsepr.yours === null && !r.passed));
  assert.match(blank.rows[0].vsepr.diagnosis, /No recognisable shape/);
  // non-shape mapped fields still get a plain yours-versus-correct row
  const den = byId['bk-c6-denticity'];
  const dv = den.variants[0];
  const wrongIn = Object.fromEntries(dv.inputSlot.fields.map((f) => [f.key, '9']));
  const dres = Evaluators.evaluate(dv, wrongIn, {}, {}, den);
  const drv = Review.buildMappedReview(dv, wrongIn, dres);
  assert.ok(drv.rows.length > 0 && drv.rows.every((r) => !r.vsepr && r.expected && r.yours === '9'));
});

test('review rows: set answers read their companion fields, not blanks', () => {
  const n = E.LF.generateQuestionBank({}).find((x) => x.id === 'lf-inv-M_H2O_6_3plus-unpaired-1');
  const v = n.variants[0];
  const input = { tokens: ['Fe'], fields: { name: 'hexaaquairon(III)', lfse: '0' } };
  const res = Evaluators.evaluate(v, input, {}, {}, n);
  const rv = Review.buildMappedReview(v, input, res);
  assert.ok(rv && rv.rows.length >= 1);
  const name = rv.rows.find((r) => r.key === 'name');
  assert.equal(name.yours, 'hexaaquairon(III)', 'what the student typed is shown, not (blank)');
  assert.equal(name.passed, false);
  assert.match(name.expected, /titanium/);
});

test('generated metal-ID explanations: math spans are balanced and no LaTeX command leaks outside one', () => {
  const bad = [];
  for (const n of E.LF.generateQuestionBank({})) {
    for (const v of n.variants) {
      const ex = (v.explanation || '').replace(/\\\$/g, '');
      const parts = ex.split('$');
      if ((parts.length - 1) % 2 !== 0) bad.push(`${n.id}: odd number of $`);
      // even-indexed parts are plain text: a \text{...} or \mu there means a math span was cut short
      parts.forEach((t, i) => { if (i % 2 === 0 && /\\(text|mu|Delta|sqrt)\b/.test(t)) bad.push(`${n.id}: LaTeX outside math: ${t.slice(0, 40)}`); });
    }
  }
  assert.deepEqual(bad.slice(0, 5), []);
});
