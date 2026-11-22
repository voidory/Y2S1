import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2011');
const map = readContent('skill-map.json', 'cm2011');
const nodes = bank.questionNodes.map((n) => ({ ...n, moduleCode: 'CM2011' }));
const chunkOf = (id) => {
  const sk = Object.fromEntries(map.skills.map((k) => [k.id, k]));
  let best = null;
  for (const sid of map.nodeSkills[id] || []) { const k = sk[sid]; if (k && (!best || k.weight > best.weight)) best = k; }
  return best?.chunk;
};
const log = (nodeId, g, t) => ({ nodeId, normalizedGrade: g, timestamp: t });

test('the pass line is 85% everywhere: a 70-84% card is neither "passed" nor "proficient"', () => {
  assert.equal(Scheduler.PASS_GRADE, 0.85);
  const rows = Scheduler.planChunks(nodes, map, [log(nodes[0].id, 0.8, 1)], {}, 'CM2011');
  const r = rows.find((x) => x.chunk === chunkOf(nodes[0].id));
  assert.ok(r.needed >= 1, 'a card scored 80% still needs work');
  const mod = { moduleCode: 'CM2011', weeks: [], examTimestamp: null };
  const rd = Scheduler.computeModuleReadiness(mod, nodes, {}, Date.now(), [log(nodes[0].id, 0.8, 1)], map);
  assert.equal(rd.proficientCount, 0);
  const rd2 = Scheduler.computeModuleReadiness(mod, nodes, {}, Date.now(), [log(nodes[0].id, 0.9, 1)], map);
  assert.equal(rd2.proficientCount, 1);
});

test('topic level uses the last two attempts, so one lucky draw cannot decide a topic', () => {
  const big = nodes.filter((n) => chunkOf(n.id) === 'x-calc');
  assert.ok(big.length >= 3);
  const one = Scheduler.planChunks(nodes, map, [log(big[0].id, 1, 1)], {}, 'CM2011').find((r) => r.chunk === 'x-calc');
  const two = Scheduler.planChunks(nodes, map, [log(big[0].id, 0, 1), log(big[0].id, 1, 2)], {}, 'CM2011').find((r) => r.chunk === 'x-calc');
  assert.ok(Math.abs(one.score - 1 / big.length) < 1e-9, 'one attempt counts alone');
  assert.ok(Math.abs(two.score - 0.5 / big.length) < 1e-9, 'a miss then a pass averages to 50% for that question');
});

test('readiness is weighted by marks, not by chapter count', () => {
  const mod = { moduleCode: 'CM2011', weeks: [{ weekNum: 1, examWeight: 1 }, { weekNum: 8, examWeight: 1 }], examTimestamp: null };
  const ext = nodes.filter((n) => ['x-calc', 'x-concepts'].includes(chunkOf(n.id)));
  const logs = ext.map((n, i) => log(n.id, 1, i + 1));
  const withMap = Scheduler.computeModuleReadiness(mod, nodes, {}, Date.now(), logs, map);
  const without = Scheduler.computeModuleReadiness(mod, nodes, {}, Date.now(), logs);
  const share = (ext.length / nodes.length) * 100;
  assert.ok(withMap.proficientPct > 24 && withMap.proficientPct < 27, `extraction is about a quarter of the marks (${withMap.proficientPct.toFixed(1)}%)`);
  assert.ok(Math.abs(without.proficientPct - share) < 0.01, 'without a map it falls back to the node count');
});

test('coverage meter: seen, secure and blind marks add up, and secure needs two passes', () => {
  const none = Scheduler.coverage(nodes, map, []);
  assert.ok(Math.abs(none.blindPct - 100) < 1e-6 && none.seenPct === 0 && none.unseenN === nodes.length);
  const some = nodes.slice(0, 10);
  const logs = some.flatMap((n, i) => [log(n.id, 1, i * 2 + 1), log(n.id, 1, i * 2 + 2)]);
  const c = Scheduler.coverage(nodes, map, logs);
  assert.ok(c.securePct > 0 && Math.abs(c.seenPct - c.securePct) < 1e-6, 'two passes make them secure');
  assert.ok(Math.abs(c.seenPct + c.blindPct - 100) < 1e-6);
  const once = Scheduler.coverage(nodes, map, some.map((n, i) => log(n.id, 1, i + 1)));
  assert.equal(once.securePct, 0, 'one pass is seen, not secure');
  assert.ok(once.seenPct > 0);
});

test('cram pass 1 serves only unseen questions, one per topic first, biggest marks per minute first', () => {
  const served = [];
  let logs = [];
  for (let i = 0; i < 25; i++) {
    const pick = Scheduler.cramNext(nodes, map, logs, { pass: 'auto' });
    assert.equal(pick.pass, 'cover');
    assert.ok(!logs.some((l) => l.nodeId === pick.node.id), 'never an already-seen question');
    served.push(pick);
    logs = [...logs, log(pick.node.id, 0, i + 1)];                 // a miss still counts as seen
  }
  const nChunks = new Set(nodes.map((n) => chunkOf(n.id)).filter(Boolean)).size;
  assert.equal(new Set(served.slice(0, nChunks).map((p) => p.chunk)).size, nChunks, 'every topic gets one before any gets a second');
  assert.equal(served[0].chunk, 'x-calc', 'the topic with the most marks per question-minute comes first');
});

test('cram pass 2 fixes misses: failed questions first, topic done after two passes in a row, other topics next', () => {
  const some = nodes.filter((n) => chunkOf(n.id) === 'x-calc');
  let logs = nodes.map((n, i) => log(n.id, chunkOf(n.id) === 'x-calc' ? 0.2 : 1, i + 1));      // everything seen; extraction failed
  let cram = { pass: 'fix', done: [], streak: {} };
  const first = Scheduler.cramNext(nodes, map, logs, cram);
  assert.equal(first.pass, 'fix'); assert.equal(first.chunk, 'x-calc');
  assert.ok(some.some((n) => n.id === first.node.id));
  // answer the first card right, then the next one right: the topic is done only then
  cram = { ...cram, passNow: 'fix', chunkNow: 'x-calc', last: first.node.id };
  logs = [...logs, log(first.node.id, 1, 1000)];
  cram = Scheduler.cramRecord(cram, 'x-calc', 1);
  assert.equal(cram.streak['x-calc'], 1); assert.equal(cram.done.length, 0);
  const second = Scheduler.cramNext(nodes, map, logs, cram);
  assert.equal(second.chunk, 'x-calc', 'one pass is not enough: the same topic continues');
  assert.notEqual(second.node.id, first.node.id, 'a different question, not the same one again');
  logs = [...logs, log(second.node.id, 1, 1001)];
  cram = Scheduler.cramRecord({ ...cram, last: second.node.id }, 'x-calc', 1);
  assert.equal(JSON.stringify([...cram.done]), '["x-calc"]');
  assert.equal(Scheduler.cramNext(nodes, map, logs, cram), null, 'nothing else failed: the pass ends');
  // a miss resets the streak
  assert.equal(Scheduler.cramRecord({ pass: 'fix', streak: { 'x-calc': 1 }, done: [] }, 'x-calc', 0.4).streak['x-calc'], 0);
});

test('auto cram moves from cover to fix when nothing is unseen', () => {
  const logs = nodes.map((n, i) => log(n.id, i % 2 ? 1 : 0, i + 1));
  const pick = Scheduler.cramNext(nodes, map, logs, { pass: 'auto' });
  assert.equal(pick.pass, 'fix');
  assert.ok(logs.find((l) => l.nodeId === pick.node.id).normalizedGrade < 0.85);
  assert.equal(Scheduler.cramNext(nodes, map, logs, { pass: 'cover' }), null, 'cover alone ends when nothing is unseen');
});
