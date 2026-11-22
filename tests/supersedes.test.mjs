import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Scheduler } = loadEngine();
const DIRS = ['cm2011', 'cm2021'];
const docs = Object.fromEntries(DIRS.map((d) => [d, readContent('supersedes.json', d)]));
const banks = Object.fromEntries(DIRS.map((d) => [d, readContent('question-bank.json', d)]));
const log = (nodeId, g, t, variantId) => ({ nodeId, variantId, normalizedGrade: g, timestamp: t });

test('every ref names a real node (and variant), each pair has a reason, and nothing is its own harder question', () => {
  for (const d of DIRS) {
    const ids = new Map(banks[d].questionNodes.map((n) => [n.id, new Set(n.variants.map((v) => v.variantId))]));
    assert.ok(docs[d].pairs.length >= 5, `${d} has pairs`);
    const seenIds = new Set();
    for (const p of docs[d].pairs) {
      assert.ok(!seenIds.has(p.id), `${d}: duplicate pair id ${p.id}`); seenIds.add(p.id);
      assert.ok(p.why && p.why.length > 20, `${d}/${p.id} needs a reason`);
      assert.ok(p.easier.length && p.harder.length, `${d}/${p.id} lists both sides`);
      for (const r of [...p.easier, ...p.harder]) {
        const [n, v] = r.split('#');
        assert.ok(ids.has(n), `${d}/${p.id}: no node ${n}`);
        if (v) assert.ok(ids.get(n).has(v), `${d}/${p.id}: no variant ${r}`);
      }
      for (const e of p.easier) assert.ok(!p.harder.includes(e), `${d}/${p.id}: ${e} is on both sides`);
    }
  }
});

test('the relation has no loops (an easier question can never be made harder than itself)', () => {
  for (const d of DIRS) {
    const harder = new Map();
    for (const p of docs[d].pairs) for (const e of p.easier) for (const h of p.harder) (harder.get(e) || harder.set(e, new Set()).get(e)).add(h);
    for (const start of harder.keys()) {
      const seen = new Set(), stack = [start];
      while (stack.length) for (const h of harder.get(stack.pop()) || []) { assert.notEqual(h, start, `${d}: loop through ${start}`); if (!seen.has(h)) { seen.add(h); stack.push(h); } }
    }
  }
});

const nodes11 = banks.cm2011.questionNodes;
const sup = (logs) => Scheduler.supersession(docs.cm2011.pairs, nodes11, logs);

test('passing the harder question retires the easier one; a miss, or no attempt, does not', () => {
  assert.equal(sup([]).nodes.size, 0);
  assert.ok(!sup([log('bk-m11-a-overall', 0.6, 1)]).nodes.has('bk-m11-a-sub'), 'a miss on the harder one retires nothing');
  assert.ok(!sup([log('bk-m11-a-sub', 1, 1)]).nodes.has('bk-m11-a-sub'), 'passing the easier one does not retire itself');
  assert.ok(sup([log('bk-m11-a-overall', 0.9, 1)]).nodes.has('bk-m11-a-sub'));
  assert.ok(!sup([log('bk-m11-a-overall', 0.84, 1)]).nodes.has('bk-m11-a-sub'), 'just under the pass line is not a pass');
});

test('only the latest attempt counts: failing the harder one again brings the easier one back', () => {
  const s = sup([log('bk-m11-a-overall', 0.95, 1), log('bk-m11-a-overall', 0.3, 2)]);
  assert.ok(!s.nodes.has('bk-m11-a-sub'));
  const t = sup([log('bk-m11-a-overall', 0.3, 1), log('bk-m11-a-overall', 0.95, 2)]);
  assert.ok(t.nodes.has('bk-m11-a-sub'));
});

test('a variant-level harder ref needs that variant, not just any attempt on the node', () => {
  assert.ok(!sup([log('bk-m11-q-dilution', 1, 1, 'q-dil-one')]).variants.size, 'the easier variant itself retires nothing');
  const s = sup([log('bk-m11-q-dilution', 1, 1, 'q-dil-two')]);
  assert.ok(s.nodes.size === 0 || !s.nodes.has('bk-m11-q-dilution'), 'one variant of the node is retired, not the node');
  assert.ok(s.variants.get('bk-m11-q-dilution')?.has('q-dil-one'));
  assert.ok(!sup([log('bk-m11-q-dilution', 1, 1, 'q-dil-one')]).variants.get('bk-m11-q-dilution'));
});

test('it follows the chain: the hardest question retires everything below it', () => {
  const s = sup([log('bk-m11-e-cell', 1, 1, 'e-cell-znfe')]);
  for (const id of ['bk-m11-e-fe', 'bk-m11-e-half', 'bk-m11-e-gamma']) assert.ok(s.nodes.has(id), `${id} is covered by the full cell`);
  assert.ok(s.variants.get('bk-m11-e-cell')?.has('e-cell-cuag'), 'and the simpler cell variants');
  assert.ok(s.nodes.has('bk-m11-e-ionic'), 'and the ionic-strength question at the bottom of the chain (single salts via gamma, mixtures via the Fe cell)');
});

test('a node whose every variant is retired counts as retired', () => {
  const s = sup([log('bk-m11-e-gamma', 1, 1, 'e-gamma-NaCl')]);
  const ionic = nodes11.find((n) => n.id === 'bk-m11-e-ionic');
  const singles = ionic.variants.filter((v) => !/mix/.test(v.variantId)).length;
  assert.equal(s.variants.get('bk-m11-e-ionic').size, singles, 'six single-salt variants go, the two mixtures stay');
  assert.ok(!s.nodes.has('bk-m11-e-ionic'));
  const t = sup([log('bk-m11-e-gamma', 1, 1, 'e-gamma-NaCl'), log('bk-m11-e-ph', 1, 2, 'e-ph-na2so4')]);
  assert.ok(t.nodes.has('bk-m11-e-ionic'), 'with the pH question passed too, the mixtures go and the whole node is retired');
});

test('the queue never serves a retired node, and falls back if that would leave nothing', () => {
  const retired = sup([log('bk-m11-a-overall', 1, 1)]);
  const all = nodes11.map((n) => ({ ...n, moduleCode: 'CM2011' }));
  for (let i = 0; i < 40; i++) {
    const pick = Scheduler.selectNextNode(all, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { retired });
    assert.notEqual(pick.node.id, 'bk-m11-a-sub');
  }
  const only = all.filter((n) => n.id === 'bk-m11-a-sub');
  assert.equal(Scheduler.selectNextNode(only, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { retired }).node?.id, 'bk-m11-a-sub', 'a pool of only retired nodes still serves one');
  const forced = Scheduler.selectNextNode(all, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { retired, forceNodeId: 'bk-m11-a-sub' });
  assert.equal(forced.node.id, 'bk-m11-a-sub', 'a forced question (a mock, a redo) is not filtered');
});

test('selectVariant skips retired variants of a node that is otherwise still served', () => {
  const node = nodes11.find((n) => n.id === 'bk-m11-q-dilution');
  for (let i = 0; i < 20; i++) assert.equal(Scheduler.selectVariant(node, undefined, { retiredVariants: new Set(['q-dil-one']) }).variantId, 'q-dil-two');
});

test('coverage, plan and cram ignore retired questions instead of counting them as unseen work', () => {
  const map = readContent('skill-map.json', 'cm2011');
  const all = nodes11.map((n) => ({ ...n, moduleCode: 'CM2011' }));
  const retired = sup([log('bk-m11-a-overall', 1, 1)]);
  const a = Scheduler.coverage(all, map, []), b = Scheduler.coverage(all, map, [], retired);
  assert.equal(b.unseenN, a.unseenN - retired.nodes.size);
  assert.ok(b.unseenMin < a.unseenMin);
  const picks = new Set();
  let logs = [];
  for (let i = 0; i < all.length; i++) {
    const pick = Scheduler.cramNext(all, map, logs, { pass: 'cover' }, retired);
    if (!pick) break;
    picks.add(pick.node.id);
    logs = [...logs, log(pick.node.id, 0, i + 2)];
  }
  assert.ok(!picks.has('bk-m11-a-sub'), 'cram never serves it');
  assert.equal(picks.size, all.length - retired.nodes.size, 'and covers every other question');
  const rows = Scheduler.planChunks(all, map, [], {}, 'CM2011', retired), rows0 = Scheduler.planChunks(all, map, [], {}, 'CM2011');
  assert.equal(rows.reduce((x, r) => x + r.n, 0), rows0.reduce((x, r) => x + r.n, 0) - retired.nodes.size);
});

test('a retired question that was failed is not listed as a miss to fix', () => {
  const { Weakness } = loadEngine();
  const map = readContent('skill-map.json', 'cm2011');
  const logs = [log('bk-m11-a-sub', 0.2, 1), log('bk-m11-a-overall', 1, 2)];
  const retired = sup(logs);
  assert.equal(Weakness.unresolvedMisses(logs, (id) => id, map, 9).length, 1);
  assert.equal(Weakness.unresolvedMisses(logs, (id) => id, map, 9, retired).length, 0);
});
