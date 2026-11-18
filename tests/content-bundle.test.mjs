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
 * course notes and tutorials; these two remain on purpose and are pinned in both directions: a NEW gap fails
 * (something regressed), and a CLOSED gap fails until it is removed here.
 *   bk-c3-pes                 photoelectron spectra (textbook 5.2.4) is not in the lecture slides or tutorials
 *   bk-c5-elements-reduction  formal point groups / irreducible representations are not examined in the course
 */
const KNOWN_GAPS = ['bk-c3-pes', 'bk-c5-elements-reduction'];

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
