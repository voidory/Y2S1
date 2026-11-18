import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const E = loadEngine();
const { Mastery, Scheduler } = E;
const bank = readContent('question-bank.json');
const map = readContent('skill-map.json');
const nodes = bank.questionNodes;
const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

/* Target: a skill with several distinct (node, variant) questions. Filler: cards from skills that do not overlap it. */
const target = map.skills.find((s) => s.id === 'c7.cfse');
const pairs = target.nodes.flatMap((id) => (byId[id]?.variants || []).map((v) => ({ nodeId: id, variantId: v.variantId })));
const fillerNode = map.skills.find((s) => s.id === 'c1.vsepr').nodes.find((id) => !(map.nodeSkills[id] || []).includes(target.id));
assert.ok(pairs.length >= 4, 'test needs a skill with several variants');

let clock = 0;
const log = (nodeId, variantId, grade) => ({ id: 'a' + clock, nodeId, variantId, timestamp: ++clock, normalizedGrade: grade });
const filler = (n) => Array.from({ length: n }, () => log(fillerNode, byId[fillerNode].variants[0].variantId, 1));
const hit = (i, g = 1) => log(pairs[i].nodeId, pairs[i].variantId, g);
const run = (logs, overrides) => Mastery.evaluate(logs, map, nodes, {}, overrides);
const stateOf = (res) => res.states[target.id];

test('mastery: three full-mark answers on different questions, each after a gap, retire the skill', () => {
  const two = run([hit(0), ...filler(6), hit(1)]);
  assert.equal(stateOf(two).status, 'active');
  assert.equal(stateOf(two).evidence, 2);
  const three = run([hit(0), ...filler(6), hit(1), ...filler(6), hit(2)]);
  assert.equal(stateOf(three).status, 'retired');
});

test('mastery: answers that come too soon after the previous attempt on the skill do not count', () => {
  const res = run([hit(0), ...filler(2), hit(1), ...filler(2), hit(2), ...filler(2), hit(3)]);
  assert.equal(stateOf(res).status, 'active');
  assert.equal(stateOf(res).evidence, 1, 'only the first, which had nothing before it, counts');
});

test('mastery: a miss resets the evidence, and a partial score neither counts nor resets', () => {
  const missed = run([hit(0), ...filler(6), hit(1), ...filler(6), hit(2, 0.4), ...filler(6), hit(3)]);
  assert.equal(stateOf(missed).evidence, 1, 'the miss wiped the earlier evidence; only the later success counts');
  const partial = run([hit(0), ...filler(6), hit(1), ...filler(6), hit(2, 0.8)]);
  assert.equal(stateOf(partial).evidence, 2);
  assert.equal(stateOf(partial).status, 'active');
});

test('mastery: repeating one question does not count while other questions are available', () => {
  const res = run([hit(0), ...filler(6), hit(0), ...filler(6), hit(0)]);
  assert.equal(stateOf(res).status, 'active');
  assert.equal(stateOf(res).evidence, 1);
});

test('mastery: a retired skill counts down to a maintenance check, doubles the interval on a pass, and re-opens on a miss', () => {
  const retired = [hit(0), ...filler(6), hit(1), ...filler(6), hit(2)];
  const cfg = Mastery.DEFAULTS;
  const soon = run([...retired, ...filler(10)]);
  assert.equal(stateOf(soon).status, 'retired');
  assert.equal(stateOf(soon).dueIn, cfg.maintenanceCards - 10);
  const due = run([...retired, ...filler(cfg.maintenanceCards)]);
  assert.equal(stateOf(due).dueIn, 0);
  const passed = run([...retired, ...filler(cfg.maintenanceCards), hit(3)]);
  assert.equal(stateOf(passed).checks, 1);
  assert.equal(stateOf(passed).dueIn, cfg.maintenanceCards * 2, 'the next check is twice as far away');
  const failed = run([...retired, ...filler(cfg.maintenanceCards), hit(3, 0.2)]);
  assert.equal(stateOf(failed).status, 'active', 'failing a check re-opens the skill');
  const earlyMiss = run([...retired, ...filler(3), hit(3, 0.2)]);
  assert.equal(stateOf(earlyMiss).status, 'active', 'a miss at any time re-opens it');
});

test('mastery: a manual re-open ignores earlier attempts', () => {
  const logs = [hit(0), ...filler(6), hit(1), ...filler(6), hit(2)];
  assert.equal(stateOf(run(logs)).status, 'retired');
  const reopened = run(logs, { resetAt: { [target.id]: logs.length } });
  assert.equal(stateOf(reopened).status, 'active');
  assert.equal(stateOf(reopened).evidence, 0);
});

test('mastery: adjustments hide removed skills, thin retired ones until due, and spare shared questions', () => {
  const retired = [hit(0), ...filler(6), hit(1), ...filler(6), hit(2)];
  const res = run([...retired, ...filler(5)]);
  const adj = Mastery.adjustments(res, map, {});
  const onlyTarget = target.nodes.find((id) => (map.nodeSkills[id] || []).length === 1);
  assert.equal(adj.mult.get(onlyTarget), Mastery.DEFAULTS.retiredWeight);
  assert.equal(adj.exclude.size, 0);
  assert.equal(Mastery.adjustments(res, map, {}, { ignoreRetired: true }).mult.size, 0, 'drills are not thinned');

  const removed = Mastery.adjustments(res, map, { [target.id]: true });
  assert.ok(removed.exclude.has(onlyTarget));

  // shared questions, on an exact synthetic map: n1 is only in A, n2 is in A and B
  const m2 = { skills: [{ id: 'A', nodes: ['n1', 'n2'] }, { id: 'B', nodes: ['n2'] }], nodeSkills: { n1: ['A'], n2: ['A', 'B'] } };
  const res2 = { cfg: Mastery.DEFAULTS, states: { A: { status: 'retired', dueIn: 5 }, B: { status: 'active', dueIn: null } } };
  const a2 = Mastery.adjustments(res2, m2, {});
  assert.equal(a2.mult.get('n1'), Mastery.DEFAULTS.retiredWeight);
  assert.equal(a2.mult.has('n2'), false, 'a question that also serves an active skill stays fully visible');
  const r2 = Mastery.adjustments(res2, m2, { A: true });
  assert.ok(r2.exclude.has('n1'));
  assert.equal(r2.exclude.has('n2'), false, 'removing one skill does not hide a question another skill still needs');

  const due = run([...retired, ...filler(Mastery.DEFAULTS.maintenanceCards)]);
  assert.equal(Mastery.adjustments(due, map, {}).mult.has(onlyTarget), false, 'when the check is due the skill is back to full weight');
});

test('scheduler: honours exclusions and the retired weight', () => {
  const pool = target.nodes.map((id) => byId[id]).filter(Boolean);
  const none = Scheduler.selectNextNode(pool, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { moduleCode: 'ALL', tier: 'ALL' }, 1e12);
  assert.ok(none.node);
  const excluded = Scheduler.selectNextNode(pool, {}, {}, [], Scheduler.DEFAULT_SETTINGS,
    { moduleCode: 'ALL', tier: 'ALL', masteryAdj: { exclude: new Set([none.node.id]), mult: new Map() } }, 1e12);
  assert.notEqual(excluded.node.id, none.node.id);
  const thinned = Scheduler.selectNextNode(pool, {}, {}, [], Scheduler.DEFAULT_SETTINGS,
    { moduleCode: 'ALL', tier: 'ALL', masteryAdj: { exclude: new Set(), mult: new Map([[none.node.id, 0.01]]) } }, 1e12);
  assert.notEqual(thinned.node.id, none.node.id, 'a heavily discounted question loses to its siblings');
  assert.ok(thinned.queuePreview.find((q) => q.node.id === none.node.id).meta.masteryMult === 0.01);
});

/* ---------- metal-ID set composer ---------- */
const { LF, DB } = E;
const lfAll = LF.generateQuestionBank({ lfData: LF.DEFAULT_DATA, pTermMode: 'relative', includeD0D10InDiamagnetic: false, textbookExceptions: false, allowOxStateZero: true });
const inv = lfAll.filter((n) => n.id.startsWith('lf-inv-'));
const composerOnly = inv.filter((n) => n.metadata.composerOnly);

test('composer pool: extended inverse nodes are valid, solvable, composer-only, and the shipped ones stay in the queue', () => {
  assert.ok(composerOnly.length >= 100, `expected a large extended pool, got ${composerOnly.length}`);
  const bad = [];
  for (const n of inv) {
    const r = DB.validateQuestionNodeV3(n);
    if (!r.valid) bad.push(`${n.id}: ${r.errors.join('; ')}`);
    if (!(n.variants[0].evaluator.targetSet.length >= 1)) bad.push(`${n.id}: empty answer set`);
    if (!n.metadata.lfTemplate || !n.metadata.lfConstraintType) bad.push(`${n.id}: missing composer metadata`);
  }
  assert.deepEqual(bad, []);
  assert.equal(new Set(inv.map((n) => n.id)).size, inv.length, 'ids are unique');
  assert.equal(inv.length - composerOnly.length, 33, 'the original 33 inverse questions are unchanged and not composer-only');
});

test('composer: the paper\'s own Q3 answers are solvable by the extended engine', () => {
  const sets = {
    'lf-inv-M_H2O_6_3plus-unpaired-1': ['Ti'], 'lf-inv-MBr4_minus-most-unpaired': ['Fe'], 'lf-inv-M_CN_6_3minus-diamagnetic': ['Co'],
  };
  for (const [id, expected] of Object.entries(sets)) {
    const n = inv.find((x) => x.id === id);
    assert.ok(n, `missing ${id}`);
    assert.deepEqual([...n.variants[0].evaluator.targetSet].sort(), expected);
  }
  const lf06 = inv.find((n) => n.id.startsWith('lf-inv-M_H2O_6_2plus-lfse-0p6'));
  assert.deepEqual([...lf06.variants[0].evaluator.targetSet].sort(), ['Cr', 'Cu']);
});

test('composer: five distinct complexes covering aqua, tetrahedral, strong-field and an LFSE clue; deterministic by seed', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const set = LF.composeMetalIdSet(inv, { parts: 5, seed });
    assert.equal(set.length, 5);
    const tpls = set.map((n) => n.metadata.lfTemplate);
    assert.equal(new Set(tpls).size, 5, `seed ${seed}: repeated complex ${tpls.join(', ')}`);
    assert.ok(tpls.some((t) => /H2O/.test(t)), `seed ${seed}: no aqua part`);
    assert.ok(set.some((n) => n.metadata.lfCoordNumber === 4), `seed ${seed}: no tetrahedral part`);
    assert.ok(tpls.some((t) => /CN|\(en\)/.test(t)), `seed ${seed}: no strong-field part`);
    assert.ok(set.some((n) => n.metadata.lfConstraintType === 'lfse'), `seed ${seed}: no LFSE clue`);
    assert.ok(set.some((n) => n.metadata.lfAnswerCount >= 2), `seed ${seed}: no multi-answer part`);
    assert.deepEqual(LF.composeMetalIdSet(inv, { parts: 5, seed }).map((n) => n.id), set.map((n) => n.id), 'same seed, same set');
  }
  const distinct = new Set(Array.from({ length: 40 }, (_, i) => LF.composeMetalIdSet(inv, { parts: 5, seed: i + 1 }).map((n) => n.id).sort().join('|')));
  assert.ok(distinct.size >= 30, `sets should rarely repeat (${distinct.size}/40 distinct)`);
});

test('composer-only nodes never enter the study queue or a mock paper', () => {
  const only = composerOnly[0];
  const pick = Scheduler.selectNextNode([only, ...nodes.slice(0, 5)], {}, {}, [], Scheduler.DEFAULT_SETTINGS, { moduleCode: 'ALL', tier: 'ALL' }, 1e12);
  assert.notEqual(pick.node.id, only.id);
  const paper = Scheduler.assembleMockPaper([only, ...nodes.slice(0, 20)], { chapters: [only.metadata.week, 1, 2, 3, 4, 5, 6, 7, 8, 9], totalQuestions: 10, durationMinutes: 30, seed: 1 });
  assert.ok(!paper.questions.some((q) => q.node.id === only.id));
});

test('mastery: generated metal-ID attempts count towards metal-ID and CFSE, but not the general naming skill', () => {
  const ids = inv.slice(0, 3);
  const logs = [];
  let t2 = 0;
  for (const n of ids) {
    for (let k = 0; k < 6; k++) logs.push({ nodeId: fillerNode, variantId: byId[fillerNode].variants[0].variantId, timestamp: ++t2, normalizedGrade: 1 });
    logs.push({ nodeId: n.id, variantId: n.variants[0].variantId, timestamp: ++t2, normalizedGrade: 1 });
  }
  const res = Mastery.evaluate(logs, map, nodes, {});
  assert.equal(res.states['c7.metal-id'].evidence, 3);
  assert.equal(res.states['c7.cfse'].evidence, 3);
  assert.equal(res.states['c6.name'].evidence, 0, 'a few generated complexes must not retire "name a coordination compound"');
  assert.equal(res.states['c6.name'].status, 'active');
  const adj = Mastery.adjustments(res, map, {}, {}, ['lf-inv-x']);
  assert.ok(adj.exclude.size === 0);
});

test('generated metal-ID questions never quote their own answer in the stem or the field placeholders', () => {
  const leaks = [];
  for (const n of inv) {
    const v = n.variants[0];
    const shown = [v.stem, ...v.inputSlot.fields.map((f) => `${f.label} ${f.placeholder}`)].join(' \n ');
    const answers = [
      ...(v.evaluator.fields.name?.expectedDisplay || '').split(' or '),
      // when the clue itself is an LFSE value ("... has LFSE = 0.6Δo", as in the paper's Q3(e)) the stem must state it
      ...(n.metadata.lfConstraintType === 'lfse' ? [] : (v.evaluator.fields.lfse?.expectedDisplay || '').split(' or ').map((x) => x.replace(/ \(or .*\)$/, ''))),
    ].map((x) => x.trim()).filter((x) => x.length >= 3);
    for (const a of answers) if (shown.includes(a)) leaks.push(`${n.id}: shows "${a}"`);
  }
  assert.deepEqual(leaks, []);
});

test('scheduler: a filter that matches nothing returns no question instead of unrelated ones (removed means never)', () => {
  const S2 = Scheduler.selectNextNode;
  const base = { moduleCode: 'ALL', tier: 'ALL' };
  const all = new Set(nodes.map((n) => n.id));
  assert.equal(S2(nodes, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { ...base, masteryAdj: { exclude: all, mult: new Map() } }, 1e12).node, null, 'every question removed');
  assert.equal(S2(nodes, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { ...base, skillTag: 'no-such-tag' }, 1e12).node, null, 'tag with no questions');
  assert.equal(S2(nodes, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { ...base, chunkNodeIds: ['nope'] }, 1e12).node, null, 'topic with no questions');
  assert.equal(S2(nodes, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { ...base, tier: 'no-such-tier' }, 1e12).node, null, 'tier with no questions');
  assert.ok(S2(nodes, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { moduleCode: 'ALL', tier: 'ALL' }, 1e12).node, 'with no filter a question is still served');
});
