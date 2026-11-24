import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Content, Scheduler } = loadEngine();
const scope = readContent('out-of-scope.json', 'cm2021');
const bank = readContent('question-bank.json', 'cm2021');
const map = readContent('skill-map.json', 'cm2021');
const nodes = Object.values(bank.questionNodes);

test('out of scope: the listed questions exist; Ch 9 and every question that only tests isomerism are on the list', () => {
  const ids = new Set(nodes.map((n) => n.id));
  for (const id of scope.nodes) assert.ok(ids.has(id), `${id} exists`);
  assert.deepEqual([...scope.chunks].sort(), ['isomerism', 'kinetics']);
  const out = new Set(scope.nodes);
  // every Ch 9 mechanism question is on the list
  for (const n of nodes.filter((x) => x.id.startsWith('bk-c9-'))) assert.ok(out.has(n.id), `${n.id} listed`);
  // every question linked only to left-out chunks is listed; questions that also test something else are not
  const dropChunks = new Set(scope.chunks), chunkOf = Object.fromEntries(map.skills.map((k) => [k.id, k.chunk]));
  for (const [id, list] of Object.entries(map.nodeSkills)) {
    if (!ids.has(id) || !list.length || id.startsWith('bk-c9-')) continue;   // Ch 9 questions are listed whole, even where one also touches CFSE or kinetic stability
    const only = list.every((sid) => dropChunks.has(chunkOf[sid]));
    assert.equal(out.has(id), only, `${id}: ${only ? 'only tests left-out chunks' : 'also tests something that is in scope'}`);
  }
  // no in-scope question is filed under a left-out week
  assert.deepEqual(nodes.filter((n) => scope.weeks.includes(n.metadata.week) && !out.has(n.id)).map((n) => n.id), []);
});

test('out of scope: the scoped skill map has no Ch 9 chunk, skills or links, and is still consistent', () => {
  const m = Content.scopeSkillMap(map, scope);
  for (const c of scope.chunks) assert.ok(!m.chunks.some((x) => x.id === c), `chunk ${c} gone`);
  assert.ok(!m.skills.some((k) => scope.chunks.includes(k.chunk) || k.id.startsWith('c9.')));
  const out = new Set(scope.nodes);
  const skillIds = new Set(m.skills.map((k) => k.id));
  for (const k of m.skills) for (const id of k.nodes) assert.ok(!out.has(id), `${k.id} -> ${id}`);
  for (const [id, list] of Object.entries(m.nodeSkills)) { assert.ok(!out.has(id), `nodeSkills ${id}`); for (const sid of list) assert.ok(skillIds.has(sid), `${id} -> ${sid}`); }
  // skills shared with other chapters keep their other questions
  assert.ok(m.skills.find((k) => k.id === 'c4.kinetic-stability').nodes.length >= 1);
  assert.ok(m.skills.find((k) => k.id === 'c7.cfse').nodes.length >= 1);
  // the original map is untouched
  assert.ok(map.chunks.some((c) => c.id === 'kinetics') && map.chunks.some((c) => c.id === 'isomerism'));
  // skills that mix isomerism with another topic keep their other questions
  for (const id of ['bk-c6-ambidentate', 'bk-c6-agcl', 'bk-c6-structure-from-name']) assert.ok(m.nodeSkills[id]?.length >= 1, `${id} keeps a skill`);
});

test('out of scope: nothing the app serves on purpose points at a left-out question (final recipe, focus sets, supersession)', () => {
  const out = new Set(scope.nodes);
  const recipe = JSON.stringify(Scheduler.FINAL_RECIPES.CM2021);
  for (const id of out) assert.ok(!recipe.includes(id), `recipe mentions ${id}`);
  const sets = readContent('focus-sets.json', 'cm2021').sets;
  const m = map;
  for (const set of sets) for (const sid of set.skills) { const k = m.skills.find((x) => x.id === sid); assert.ok(k && !scope.chunks.includes(k.chunk), `${set.id}: ${sid}`); }
  const pairs = readContent('supersedes.json', 'cm2021').pairs;
  for (const p of pairs) for (const ref of [...p.easier, ...p.harder]) assert.ok(!out.has(String(ref).split('#')[0]), `supersedes ${ref}`);
});

test('out of scope: weeks are dropped from a module only for the module named in the file', () => {
  const mods = [{ moduleCode: 'CM2021', weeks: [{ weekNum: 5 }, { weekNum: 8 }, { weekNum: 9 }] }, { moduleCode: 'CM2011', weeks: [{ weekNum: 9 }] }];
  const out = Content.scopeModules(mods, scope);
  assert.deepEqual(out[0].weeks.map((w) => w.weekNum), [8]);  // 5 and 9 dropped
  assert.deepEqual(out[1].weeks.map((w) => w.weekNum), [9]);
});
