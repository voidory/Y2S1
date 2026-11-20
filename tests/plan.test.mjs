import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Scheduler: S } = loadEngine();
const mk = (id, mins = 3) => ({ id, moduleCode: 'M', tier: 'atomic', metadata: { estimatedMinutes: mins }, variants: [] });
const map = {
  chunks: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
  skills: [{ id: 's1', chunk: 'a', weight: 0.8, nodes: ['n1'] }, { id: 's2', chunk: 'b', weight: 0.2, nodes: ['n2'] }],
  nodeSkills: { n1: ['s1'], n2: ['s2'] },
};
const nodes = [mk('n1'), mk('n2')];

test('allocation: an over-served low-mark topic is damped, an under-served high-mark topic is lifted, and it stays clamped', () => {
  const logs = Array.from({ length: 60 }, (_, i) => ({ nodeId: 'n2', timestamp: i }));
  const m = S.allocationMultipliers(nodes, map, logs);
  assert.ok(m.get('n1') > 1 && m.get('n2') < 1);
  for (const v of m.values()) assert.ok(v >= 0.35 && v <= 6);
  const none = S.allocationMultipliers(nodes, map, []);
  assert.ok(none.get('n1') > none.get('n2'), 'with no history the bigger topic leads');
});

test('allocation reaches the queue: with equal base scores the lifted topic is picked', () => {
  const logs = Array.from({ length: 60 }, (_, i) => ({ nodeId: 'n2', timestamp: i }));
  const allocMult = S.allocationMultipliers(nodes, map, logs);
  const pick = S.selectNextNode(nodes, {}, {}, [], S.DEFAULT_SETTINGS, { allocMult });
  assert.equal(pick.node.id, 'n1');
});

test('plan: your latest grade beats the prior, untried questions use your rating, ranking is marks per hour', () => {
  const logs = [{ nodeId: 'n1', timestamp: 1, normalizedGrade: 0.95 }];
  const rows = S.planChunks(nodes, map, logs, { 'M:b': 2 }, 'M');
  const a = rows.find((r) => r.chunk === 'a'), b = rows.find((r) => r.chunk === 'b');
  assert.equal(a.tried, 1); assert.ok(a.score > 0.9 && a.perHour === 0);
  assert.ok(Math.abs(b.score - 0.7) < 1e-9, 'rating "ok" counts as 0.7');
  const unrated = S.planChunks(nodes, map, [], {}, 'M');
  assert.equal(unrated[0].chunk, 'a', 'never seen: the 80-mark topic returns most');
});

test('plan blocks: right count, shares respected, only topics with something to win', () => {
  const rows = { X: [{ chunk: 'c1', name: 'C1', perHour: 5, minutes: 30, needed: 5, marks: 10, score: 0.2 }, { chunk: 'c2', name: 'C2', perHour: 0, minutes: 0, needed: 0, marks: 5, score: 0.9 }], Y: [{ chunk: 'd1', name: 'D1', perHour: 3, minutes: 20, needed: 4, marks: 8, score: 0.3 }] };
  const b = S.planBlocks(rows, 4, { X: 0.75, Y: 0.25 });
  assert.equal(b.length, 6);
  assert.equal(b.filter((x) => x.module === 'X').length, 4);
  assert.equal(b.filter((x) => x.module === 'Y').length, 2);
  assert.ok(b.every((x) => x.chunk !== 'c2'));
});

test('skill maps: both modules total 100 marks and weights follow marks', () => {
  for (const [dir, expectChunks] of [['cm2011', 17], ['cm2021', 20]]) {
    const m = readContent('skill-map.json', dir);
    const tot = m.skills.reduce((a, k) => a + k.marks, 0);
    assert.ok(Math.abs(tot - 100) < 0.5, `${dir} marks ${tot}`);
    assert.equal(m.chunks.length, expectChunks);
  }
  const m11 = readContent('skill-map.json', 'cm2011');
  const share = (p) => m11.skills.filter((k) => k.chunk.startsWith(p)).reduce((a, k) => a + k.weight, 0);
  assert.ok(Math.abs(share('x') - 0.25) < 0.01 && Math.abs(share('g') - 0.25) < 0.01, 'extraction and GC/HPLC are a quarter each');
});

test('queue probes every topic before it settles, then fades topics you know and keeps the weak one', () => {
  for (const dir of ['cm2011', 'cm2021']) {
    const bank = readContent('question-bank.json', dir);
    const nodes = bank.questionNodes.filter((n) => !n.metadata?.composerOnly);
    const map = readContent('skill-map.json', dir);
    const skillById = Object.fromEntries(map.skills.map((k) => [k.id, k]));
    const chunkOf = (id) => { let b = null; for (const sid of map.nodeSkills?.[id] || []) { const k = skillById[sid]; if (k && (!b || k.weight > b.weight)) b = k; } return b?.chunk; };
    const w = {};
    for (const k of map.skills) w[k.chunk] = (w[k.chunk] || 0) + k.weight;
    const heavy = map.chunks.map((c) => c.id).filter((c) => w[c] > 0.02);
    const weak = heavy[2];
    const run = (weakChunk) => {
      const logs = [], review = {};
      let now = 1e9, covered = 0;
      const seen = {};
      for (let i = 0; i < 90; i++) {
        const allocMult = S.allocationMultipliers(nodes, map, logs, { moduleCode: dir });
        const n = S.selectNextNode(nodes, review, {}, logs, S.DEFAULT_SETTINGS, { allocMult }, now).node;
        const c = chunkOf(n.id), g = c === weakChunk ? 0.2 : 0.95;
        logs.push({ nodeId: n.id, timestamp: now += 1000, normalizedGrade: g });
        review[n.id] = { S: 1, D: 5, reps: 1, lapses: g < 0.5 ? 1 : 0, lastReviewMs: now, dueMs: now + 864e5 };
        seen[c] = (seen[c] || 0) + 1;
        if (i === 44) covered = heavy.filter((h) => (seen[h] || 0) >= 2).length;
      }
      return { covered, late: logs.slice(60).filter((l) => chunkOf(l.nodeId) === weakChunk).length };
    };
    const strong = run(null), weakRun = run(weak);
    assert.ok(strong.covered >= heavy.length * 0.8, `${dir}: after 45 cards ${strong.covered} of ${heavy.length} topics have two cards`);
    assert.ok(weakRun.late > 1.4 * Math.max(1, strong.late), `${dir}: weak topic ${weakRun.late} cards in the last 30, against ${strong.late} when you know it`);
  }
});
