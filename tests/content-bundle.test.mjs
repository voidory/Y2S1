import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent, fakeDb, fakeFetch } from './helpers/load-engine.mjs';

const E = loadEngine();
const { Content, DB, SEED_MODULES } = E;
const bank = readContent('question-bank.json');
const skillMap = readContent('skill-map.json');
const bankIds = new Set(bank.questionNodes.map((n) => n.id));
// Objects built inside the vm sandbox have another realm's prototypes; compare them by JSON.
const same = (a, b, msg) => assert.equal(JSON.stringify(a), JSON.stringify(b), msg);
const files = { [Content.BANK_URL]: bank, [Content.SKILL_MAP_URL]: skillMap };

/*
 * The skill map was generated against a fuller bank than the one first shipped. Most gaps were filled from the
 * course notes and tutorials. One remains on purpose and is pinned in both directions: a NEW gap fails
 * (something regressed), and a CLOSED gap fails until it is removed here.
 *   bk-c3-pes   photoelectron spectra (textbook 5.2.4) is not in the lecture slides or tutorials
 * Formal point-group / irreducible-representation skills are out of scope for the course (symmetry labels are
 * read, not manipulated) and have been removed from both the bank and the skill map.
 */
const KNOWN_GAPS = ['bk-c3-pes'];

test('bundled bank: every node passes the app validator and belongs to a known module/week', () => {
  assert.equal(bank.bundleVersion, '3.0');
  assert.ok(bank.questionNodes.length > 0);
  const mod = SEED_MODULES.find((m) => m.moduleCode === 'CM2021');
  const weeks = new Set(mod.weeks.map((w) => w.weekNum));
  const bad = [];
  for (const n of bank.questionNodes) {
    const r = DB.validateQuestionNodeV3(n);
    if (!r.valid) bad.push(`${n.id}: ${r.errors.join('; ')}`);
    if (n.moduleCode !== 'CM2021') bad.push(`${n.id}: moduleCode ${n.moduleCode}`);
    if (!weeks.has(n.metadata.week)) bad.push(`${n.id}: week ${n.metadata.week}`);
    if (Content.isReservedNodeId(n.id)) bad.push(`${n.id}: reserved id`);
  }
  assert.deepEqual(bad, []);
});

test('bundled bank: node ids and variant ids are unique', () => {
  assert.equal(bankIds.size, bank.questionNodes.length);
  const vids = bank.questionNodes.flatMap((n) => n.variants.map((v) => v.variantId));
  assert.equal(new Set(vids).size, vids.length);
});

test('skill map: structurally valid, weights sum to ~1, nodeSkills is the exact inverse of skills[].nodes', () => {
  same(Content.validateSkillMap(skillMap), { valid: true, errors: [] });
  const a = Content.analyzeSkillMap(skillMap, bankIds);
  assert.ok(Math.abs(a.weightSum - 1) < 0.01, `weights sum to ${a.weightSum}`);
  same(a.inconsistent, []);
  same(a.unknownSkillRefs, []);
});

test('skill map vs bank: every bank node is mapped, and the missing-id list equals KNOWN_GAPS exactly', () => {
  const a = Content.analyzeSkillMap(skillMap, bankIds);
  same(a.nodesWithoutSkills, [], 'bank nodes with no skill mapping');
  const unexpected = a.missingIds.filter((id) => !KNOWN_GAPS.includes(id));
  const closed = KNOWN_GAPS.filter((id) => !a.missingIds.includes(id));
  same(unexpected, [], 'new mapped ids missing from the bank');
  same(closed, [], 'gap is now closed: remove it from KNOWN_GAPS');
});

test('planBankSync: rejects invalid, reserved and duplicate nodes; flags stale ids', () => {
  const good = bank.questionNodes[0];
  const bundle = {
    bundleVersion: '3.0', exportedAt: 'x',
    questionNodes: [good, { ...good }, { ...good, id: 'gb-oh-ma4b2' }, { ...good, id: 'lf-x' }, { id: 'broken' }],
  };
  const plan = Content.planBankSync(bundle, { bankKey: 'old', ids: [good.id, 'bk-gone'] }, new Set());
  assert.equal(plan.valid.length, 1);
  assert.equal(plan.rejected.length, 4);
  same(plan.stale, ['bk-gone']);
  assert.equal(plan.upToDate, false);
});

test('syncBank: first boot loads everything, second boot is a no-op, bookkeeping lives in its own row', async () => {
  const db = fakeDb();
  const f = fakeFetch(files);
  const first = await Content.syncBank(db, f);
  assert.equal(first.state, 'synced');
  assert.equal(first.count, bank.questionNodes.length);
  assert.equal(db.nodes.size, bank.questionNodes.length);
  assert.ok(db.rows.get(Content.RECORD_KEY));
  assert.equal(db.rows.has('global'), false);
  const second = await Content.syncBank(db, f);
  assert.equal(second.state, 'up-to-date');
});

test('syncBank: self-heals when nodes disappear (e.g. an overwrite import) even though the version stamp matches', async () => {
  const db = fakeDb();
  const f = fakeFetch(files);
  await Content.syncBank(db, f);
  db.nodes.delete(bank.questionNodes[3].id);
  const again = await Content.syncBank(db, f);
  assert.equal(again.state, 'synced');
  assert.equal(db.nodes.size, bank.questionNodes.length);
});

test('syncBank: a newer bundle replaces changed nodes and removes ones it dropped, leaving other nodes alone', async () => {
  const db = fakeDb();
  await Content.syncBank(db, fakeFetch(files));
  db.nodes.set('lf-keep', { id: 'lf-keep' });
  const dropped = bank.questionNodes[0].id;
  const newer = { ...bank, exportedAt: 'later', questionNodes: bank.questionNodes.slice(1) };
  const res = await Content.syncBank(db, fakeFetch({ [Content.BANK_URL]: newer }));
  assert.equal(res.state, 'synced');
  assert.equal(res.removed, 1);
  assert.equal(db.nodes.has(dropped), false);
  assert.equal(db.nodes.has('lf-keep'), true);
});

test('syncBank: fetch failure, HTML fallback and malformed bundle leave the DB untouched and never throw', async () => {
  const db = fakeDb();
  db.nodes.set('bk-existing', { id: 'bk-existing' });
  const notFound = await Content.syncBank(db, fakeFetch({}));
  assert.equal(notFound.state, 'unavailable');
  const html = await Content.syncBank(db, fakeFetch({ [Content.BANK_URL]: '<!doctype html><html></html>' }));
  assert.equal(html.state, 'unavailable');
  assert.match(html.error, /not valid JSON/);
  const noArray = await Content.syncBank(db, fakeFetch({ [Content.BANK_URL]: { bundleVersion: '3.0' } }));
  assert.equal(noArray.state, 'unavailable');
  assert.deepEqual([...db.nodes.keys()], ['bk-existing']);
});

test('loadSkillMap: returns the map, or an error string instead of throwing', async () => {
  const ok = await Content.loadSkillMap(fakeFetch(files));
  assert.equal(ok.error, null);
  assert.equal(ok.map.skills.length, skillMap.skills.length);
  const missing = await Content.loadSkillMap(fakeFetch({}));
  assert.equal(missing.map, null);
  assert.ok(missing.error);
  const invalid = await Content.loadSkillMap(fakeFetch({ [Content.SKILL_MAP_URL]: { module: 'CM2021', skills: [], nodeSkills: {} } }));
  assert.equal(invalid.map, null);
});

test('skillRows: missing questions count against readiness but are reported as coverage', () => {
  const map = {
    module: 'M',
    skills: [
      { id: 's1', ch: 1, marks: 1, weight: 0.5, nodes: ['a', 'b'] },
      { id: 's2', ch: 1, marks: 1, weight: 0.5, nodes: ['c', 'x'] },
    ],
    nodeSkills: {},
  };
  const ids = new Set(['a', 'b', 'c']);
  const progress = { a: { attempted: true, proficient: true }, b: { attempted: true, proficient: true }, c: { attempted: true, proficient: false } };
  const { rows, readiness, coverage } = Content.skillRows(map, ids, progress);
  assert.equal(rows[0].ready, 1);
  assert.equal(rows[1].ready, 0);
  assert.equal(rows[1].cover, 0.5);
  assert.equal(readiness, 0.5);
  assert.equal(coverage, 0.75);
});

test('nodeProgress: proficient needs an attempt scoring >= 0.7 (latest log wins)', () => {
  const nodes = [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }];
  const logs = [
    { nodeId: 'n1', timestamp: 1, normalizedGrade: 0.2 },
    { nodeId: 'n1', timestamp: 2, normalizedGrade: 0.9 },
    { nodeId: 'n2', timestamp: 1, normalizedGrade: 0.5 },
  ];
  const p = Content.nodeProgress(nodes, {}, logs);
  same(p.n1, { attempted: true, proficient: true });
  same(p.n2, { attempted: true, proficient: false });
  same(p.n3, { attempted: false, proficient: false });
});

test('skill map: weights equal marks / total marks, and no formal group-theory skills remain', () => {
  const total = skillMap.skills.reduce((a, k) => a + k.marks, 0);
  const off = skillMap.skills.filter((k) => Math.abs(k.weight - k.marks / total) > 0.0001).map((k) => k.id);
  same(off, [], 'skills whose weight is not marks/total');
  const formal = ['c5.point-group', 'c5.reducible-rep', 'c5.projection', 'c5.hybrids'];
  same(skillMap.skills.filter((k) => formal.includes(k.id)).map((k) => k.id), []);
  same([...bankIds].filter((id) => ['bk-c5-point-groups', 'bk-c5-reducible-rep', 'bk-c5-hybrids-gt'].includes(id)), []);
});

test('sweepOrphanedProgress: removes review states and logs of nodes that no longer exist, keeps the rest', async () => {
  const db = fakeDb();
  await Content.syncBank(db, fakeFetch(files));
  const live = bank.questionNodes[0].id;
  db.reviews.set(live, { nodeId: live });
  db.reviews.set('bk-gone', { nodeId: 'bk-gone' });
  db.logs.push({ id: 1, nodeId: live }, { id: 2, nodeId: 'bk-gone' }, { id: 3, nodeId: 'bk-gone' });
  const res = await Content.sweepOrphanedProgress(db);
  same(res, { reviewStates: 1, attemptLogs: 2 });
  same([...db.reviews.keys()], [live]);
  same(db.logs.map((l) => l.id), [1]);
  same(await Content.sweepOrphanedProgress(db), { reviewStates: 0, attemptLogs: 0 });
});

test('sweepOrphanedProgress: does nothing when no nodes are stored (a failed boot must not wipe progress)', async () => {
  const db = fakeDb();
  db.reviews.set('bk-x', { nodeId: 'bk-x' });
  db.logs.push({ id: 1, nodeId: 'bk-x' });
  same(await Content.sweepOrphanedProgress(db), { reviewStates: 0, attemptLogs: 0 });
  assert.equal(db.reviews.size, 1);
  assert.equal(db.logs.length, 1);
});

test('sweepOrphanedProgress: a database error is swallowed and reported as zero removals', async () => {
  const db = fakeDb();
  db.nodes.set('n', { id: 'n' });
  db.reviewStates.toCollection = () => { throw new Error('boom'); };
  same(await Content.sweepOrphanedProgress(db), { reviewStates: 0, attemptLogs: 0 });
});

test('content loading: falls back to public/content when the repo root is served as-is (e.g. GitHub Pages from main)', async () => {
  const rootLayout = { ['public/' + Content.BANK_URL]: bank, ['public/' + Content.SKILL_MAP_URL]: skillMap };
  const db = fakeDb();
  const res = await Content.syncBank(db, fakeFetch(rootLayout));
  assert.equal(res.state, 'synced');
  assert.equal(db.nodes.size, bank.questionNodes.length);
  const sm = await Content.loadSkillMap(fakeFetch(rootLayout));
  assert.equal(sm.error, null);
  // neither location present: one error that names both attempts
  const none = await Content.syncBank(fakeDb(), fakeFetch({}));
  assert.equal(none.state, 'unavailable');
  assert.match(none.error, /content\/cm2021\/question-bank\.json.*\|.*public\/content\/cm2021\/question-bank\.json/);
});

test('skill map: every skill sits in exactly one theory chunk, and no chunk is empty', () => {
  assert.ok(skillMap.chunks.length >= 15 && skillMap.chunks.length <= 25, 'about twenty topics, not a hundred');
  const ids = new Set(skillMap.chunks.map((c) => c.id));
  assert.equal(ids.size, skillMap.chunks.length, 'chunk ids are unique');
  const used = new Set(skillMap.skills.map((s) => s.chunk));
  same(skillMap.skills.filter((s) => !ids.has(s.chunk)).map((s) => s.id), [], 'skills with an unknown chunk');
  same([...ids].filter((id) => !used.has(id)), [], 'empty chunks');
  assert.ok(skillMap.chunks.every((c) => c.part && c.summary), 'chunks carry a course part and a summary');
});

test('skill map: validator rejects an unknown chunk but still accepts a map without chunks', () => {
  const bad = JSON.parse(JSON.stringify(skillMap));
  bad.skills[0].chunk = 'nope';
  assert.equal(Content.validateSkillMap(bad).valid, false);
  const legacy = JSON.parse(JSON.stringify(skillMap));
  delete legacy.chunks;
  assert.equal(Content.validateSkillMap(legacy).valid, true);
});

test('topic drill: chunkNodeIds covers exactly the topic\'s skills, and the scheduler stays inside it', () => {
  const chunk = 'terms-ts';
  const ids = Content.chunkNodeIds(skillMap, chunk);
  const expected = new Set(skillMap.skills.filter((s) => s.chunk === chunk).flatMap((s) => s.nodes));
  same([...ids].sort(), [...expected].sort());
  assert.ok(ids.length > 0);
  const nodes = bank.questionNodes.filter((n) => ids.includes(n.id));
  const { Scheduler } = E; const DEFAULT_SETTINGS = Scheduler.DEFAULT_SETTINGS;
  for (let i = 0; i < 10; i++) {
    const pick = Scheduler.selectNextNode(bank.questionNodes, {}, {}, [], DEFAULT_SETTINGS, { moduleCode: 'ALL', tier: 'ALL', chunkNodeIds: ids }, Date.now() + i);
    assert.ok(pick?.node && ids.includes(pick.node.id), `picked ${pick?.node?.id} outside ${chunk}`);
  }
  assert.ok(nodes.length > 0);
});
