import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Content, Scheduler } = loadEngine();
const scope = readContent('out-of-scope.json', 'cm2021');
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const nodes = Object.values(bank.questionNodes);

test('out of scope: the listed questions exist and the Ch 9 chunk is the one left out', () => {
  const ids = new Set(nodes.map((n) => n.id));
  for (const id of scope.nodes) assert.ok(ids.has(id), `${id} exists`);
  assert.deepEqual([...scope.chunks], ['kinetics']);
  // every Ch 9 mechanism question (and nothing else) is on the list
  const c9 = nodes.filter((n) => n.id.startsWith('bk-c9-')).map((n) => n.id).sort();
  assert.deepEqual([...scope.nodes].sort(), c9);
  // no other question is filed under week 9 (three Ch 7 deck questions used to be)
  assert.deepEqual(nodes.filter((n) => n.metadata.week === 9 && !scope.nodes.includes(n.id)).map((n) => n.id), []);
});

test('out of scope: the scoped skill map has no Ch 9 chunk, skills or links, and is still consistent', () => {
  const m = Content.scopeSkillMap(map, scope);
  assert.ok(!m.chunks.some((c) => c.id === 'kinetics'));
  assert.ok(!m.skills.some((k) => k.chunk === 'kinetics' || k.id.startsWith('c9.')));
  const out = new Set(scope.nodes);
  const skillIds = new Set(m.skills.map((k) => k.id));
  for (const k of m.skills) for (const id of k.nodes) assert.ok(!out.has(id), `${k.id} -> ${id}`);
  for (const [id, list] of Object.entries(m.nodeSkills)) { assert.ok(!out.has(id), `nodeSkills ${id}`); for (const sid of list) assert.ok(skillIds.has(sid), `${id} -> ${sid}`); }
  // skills shared with other chapters keep their other questions
  assert.ok(m.skills.find((k) => k.id === 'c4.kinetic-stability').nodes.length >= 1);
  assert.ok(m.skills.find((k) => k.id === 'c7.cfse').nodes.length >= 1);
  // the original map is untouched
  assert.ok(map.chunks.some((c) => c.id === 'kinetics'));
});

test('out of scope: nothing the app serves on purpose points at a left-out question (final recipe, focus sets, supersession)', () => {
  const out = new Set(scope.nodes);
  const recipe = JSON.stringify(Scheduler.FINAL_RECIPES.CM2021);
  for (const id of out) assert.ok(!recipe.includes(id), `recipe mentions ${id}`);
  const sets = readContent('focus-sets.json', 'cm2021').sets;
  const m = map;
  for (const set of sets) for (const sid of set.skills) { const k = m.skills.find((x) => x.id === sid); assert.ok(k && k.chunk !== 'kinetics', `${set.id}: ${sid}`); }
  const pairs = readContent('supersedes.json', 'cm2021').pairs;
  for (const p of pairs) for (const ref of [...p.easier, ...p.harder]) assert.ok(!out.has(String(ref).split('#')[0]), `supersedes ${ref}`);
});

test('out of scope: weeks are dropped from a module only for the module named in the file', () => {
  const mods = [{ moduleCode: 'CM2021', weeks: [{ weekNum: 8 }, { weekNum: 9 }] }, { moduleCode: 'CM2011', weeks: [{ weekNum: 9 }] }];
  const out = Content.scopeModules(mods, scope);
  assert.deepEqual(out[0].weeks.map((w) => w.weekNum), [8]);
  assert.deepEqual(out[1].weeks.map((w) => w.weekNum), [9]);
});
