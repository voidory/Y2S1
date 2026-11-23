import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Scheduler, Content } = loadEngine();
const DIRS = ['cm2011', 'cm2021'];
const docs = Object.fromEntries(DIRS.map((d) => [d, readContent('focus-sets.json', d)]));
const maps = Object.fromEntries(DIRS.map((d) => [d, readContent('skill-map.json', d)]));
const banks = Object.fromEntries(DIRS.map((d) => [d, readContent('question-bank.json', d)]));

test('every focus set names real skills, has a reason, and resolves to questions that exist in the bank', () => {
  for (const d of DIRS) {
    const skillIds = new Set(maps[d].skills.map((s) => s.id));
    const nodeIds = new Set(banks[d].questionNodes.map((n) => n.id));
    const seen = new Set();
    assert.ok(docs[d].sets.length >= 5, `${d}: sets`);
    for (const set of docs[d].sets) {
      assert.ok(!seen.has(set.id), `${d}: duplicate set id ${set.id}`); seen.add(set.id);
      assert.ok(set.name && set.why && (set.drawOnly || set.skills.length >= 2), `${d}/${set.id}: name, why and skills`);
      for (const sk of set.skills) assert.ok(skillIds.has(sk), `${d}/${set.id}: unknown skill ${sk}`);
      const ids = Content.focusNodeIds(maps[d], set, banks[d].questionNodes);
      assert.ok(ids.length >= 2, `${d}/${set.id}: ${ids.length} questions`);
      for (const id of ids) assert.ok(nodeIds.has(id), `${d}/${set.id}: node ${id} missing`);
    }
  }
});

test('the CM2021 sets cover what was asked for: all Tanabe-Sugano questions and all named processes', () => {
  const byId = Object.fromEntries(docs.cm2021.sets.map((s) => [s.id, s]));
  const ts = Content.focusNodeIds(maps.cm2021, byId.ts);
  for (const id of ['bk-c8-ts-d7', 'bk-c8-ts-d4', 'bk-c8-tsg-allowed', 'bk-c8-tsg-reverse']) assert.ok(ts.includes(id), id);
  const proc = Content.focusNodeIds(maps.cm2021, byId.processes);
  for (const id of ['bk-c4-haber', 'bk-c4-contact', 'bk-c4-p-scheme', 'bk-c4-ostwald']) assert.ok(proc.includes(id), id);
});

test('focusStats counts questions, tried, secure and failed from the latest attempts', () => {
  const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd', metadata: { composerOnly: true } }];
  const logs = [
    { nodeId: 'a', normalizedGrade: 0.9, timestamp: 1 }, { nodeId: 'a', normalizedGrade: 1, timestamp: 2 },
    { nodeId: 'b', normalizedGrade: 1, timestamp: 1 }, { nodeId: 'b', normalizedGrade: 0.2, timestamp: 2 },
  ];
  const st = Scheduler.focusStats(nodes, ['a', 'b', 'c', 'd', 'zzz'], logs);
  assert.equal(JSON.stringify(st), JSON.stringify({ n: 3, seen: 2, secure: 1, failed: 1 }));
});

test('the "Draw it on paper" set serves only draw-then-compare variants, and covers the splitting and MO diagrams the finals ask for', () => {
  const set = docs.cm2021.sets.find((s) => s.id === 'draw');
  assert.ok(set && set.drawOnly);
  const ids = Content.focusNodeIds(maps.cm2021, set, banks.cm2021.questionNodes);
  for (const id of ['bk-c7-draw-split', 'bk-c3-draw-mo', 'bk-c3-nitrene', 'bk-c3-three-centre-pi', 'bk-c4-crown-cryptand']) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes('bk-c8-spin-only'), 'a node with no draw variant is not in it');
  const draw = (v) => v.drawOnPaperThenCompare || v.inputSlot?.drawOnPaperThenCompare;
  const node = banks.cm2021.questionNodes.find((n) => n.id === 'bk-c3-nitrene');
  assert.ok(node.variants.length > 1 && node.variants.some((v) => !draw(v)), 'the nitrene node also has a typed variant');
  for (let i = 0; i < 25; i++) assert.ok(draw(Scheduler.selectVariant(node, undefined, { drawOnly: true })), 'drawOnly never serves the typed variant');
  const splitNode = banks.cm2021.questionNodes.find((n) => n.id === 'bk-c7-draw-split');
  const seen = new Set();
  for (let i = 0; i < 80; i++) seen.add(Scheduler.selectVariant(splitNode, undefined, { drawOnly: true }).variantId);
  assert.ok(seen.size >= 4, 'it rotates through the splitting diagrams');
});

test('every draw variant has a rubric whose marks add up to its marks, with at least one critical point', () => {
  for (const id of ['bk-c7-draw-split', 'bk-c3-draw-mo']) {
    const n = banks.cm2021.questionNodes.find((x) => x.id === id);
    for (const v of n.variants) {
      const total = v.evaluator.rubric.reduce((a, r) => a + r.marks, 0);
      assert.ok(Math.abs(total - v.marks) < 1e-9, `${v.variantId}: rubric ${total} vs marks ${v.marks}`);
      assert.ok(v.evaluator.rubric.some((r) => r.isCritical), `${v.variantId}: a critical point`);
      assert.ok(v.drawOnPaperThenCompare && v.inputSlot.allowPaperScratchpad);
    }
  }
});
