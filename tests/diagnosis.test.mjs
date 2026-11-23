import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const D = (entries) => Scheduler.paperDiagnosis(entries, map, bank.questionNodes);

test('paper diagnosis: marks lost are grouped by skill, ranked, and shared across linked skills', () => {
  const ox = 'bk-c4-ox-gen', homo = 'bk-c3-homo-gen';
  const d = D([{ nodeId: ox, label: 'Q1: ox', marks: 5, earned: 1 }, { nodeId: homo, label: 'Q1: homo', marks: 5, earned: 5 }, { nodeId: 'bk-c4-avgon-gen', label: 'Q1: avg', marks: 5, earned: 3 }]);
  assert.equal(d.totalMarks, 15); assert.equal(d.totalLost, 6);
  assert.equal(d.rows.reduce((a, r) => a + r.lost, 0).toFixed(2), '6.00', 'every lost mark is assigned to some skill');
  assert.ok(d.rows.every((r, i, a) => i === 0 || a[i - 1].lost >= r.lost), 'ranked by marks lost');
  assert.equal(d.rows[0].skillId, 'c4.ox-number'); assert.equal(d.rows[0].lost, 6, 'both losses sit on the one skill these nodes share');
  assert.ok(!d.rows.some((r) => r.skillId === 'c3.homo-count'), 'a full-marks question adds no row');
});

test('paper diagnosis: the repair list holds the lost questions first, then up to two others per skill, no duplicates, only known nodes', () => {
  const d = D([{ nodeId: 'bk-c4-ox-gen', label: 'Q1', marks: 5, earned: 0 }, { nodeId: 'bk-c8-ts-d7', label: 'Q4', marks: 6, earned: 2 }]);
  assert.equal(d.repairIds[0], 'bk-c4-ox-gen');
  assert.equal(new Set(d.repairIds).size, d.repairIds.length);
  const ids = new Set(bank.questionNodes.map((n) => n.id));
  assert.ok(d.repairIds.every((id) => ids.has(id)));
  assert.ok(d.repairIds.includes('bk-c8-ts-d7'));
  assert.ok(d.repairIds.length <= 14 && d.repairIds.length > 2);
  const skill = map.skills.find((s) => s.id === 'c4.ox-number');
  const extras = d.repairIds.filter((id) => id !== 'bk-c4-ox-gen' && skill.nodes.includes(id) && !map.nodeSkills['bk-c8-ts-d7'].includes('c4.ox-number'));
  assert.ok(extras.length <= 2 + 2, 'at most two extra questions per skill');
});

test('paper diagnosis: a perfect paper and a paper with unlinked nodes behave', () => {
  const none = D([{ nodeId: 'bk-c4-ox-gen', label: 'Q1', marks: 5, earned: 5 }]);
  assert.equal(none.totalLost, 0); assert.equal(none.rows.length, 0); assert.equal(none.repairIds.length, 0);
  const odd = D([{ nodeId: 'not-a-node', label: 'Q?', marks: 4, earned: 0, errorTags: ['calc:x'] }]);
  assert.equal(odd.rows[0].skillId, '_other'); assert.equal(odd.repairIds.length, 0); assert.equal(Array.from(odd.rows[0].slips).join(), 'calc:x');
});
