import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const E = loadEngine();
const { Weakness, Review, Evaluators, LF, SEED_NODES } = E;
const bank = readContent('question-bank.json');
const map = readContent('skill-map.json');
const byId = Object.fromEntries(bank.questionNodes.map((n) => [n.id, n]));
const J = (x) => JSON.parse(JSON.stringify(x));

// nodes that belong to exactly one topic each
const chunkNodes = (chunk) => map.skills.filter((s) => s.chunk === chunk).flatMap((s) => s.nodes).filter((id) => Weakness.chunksOf(map, id).length === 1);
const vsepr = chunkNodes('vsepr'), ts = chunkNodes('terms-ts'), named = chunkNodes('reaction-toolkit');
let clock = 1_000_000;
const log = (nodeId, grade, extra = {}) => ({ nodeId, variantId: 'v', timestamp: (clock += 60000), normalizedGrade: grade, ...extra });

test('topicStats: ranks topics weakest first by shrunk recent score and keeps thin topics unranked', () => {
  const logs = [];
  for (let i = 0; i < 10; i++) logs.push(log(vsepr[i % vsepr.length], i < 8 ? 0.2 : 1));   // 8 of 10 missed
  for (let i = 0; i < 10; i++) logs.push(log(ts[i % ts.length], i < 1 ? 0.2 : 1));          // 1 of 10 missed
  logs.push(log(named[0], 0));                                                              // a single attempt
  const st = J(Weakness.topicStats(logs, map));
  assert.deepEqual(st.slice(0, 2).map((t) => t.id), ['vsepr', 'terms-ts']);
  assert.equal(st[0].missed, 8);
  assert.equal(st[0].window, 10);
  assert.ok(st[0].mean < 0.4 && st[1].mean > 0.8);
  assert.equal(st[0].ranked, true);
  const thin = st.find((t) => t.id === 'reaction-toolkit');
  assert.equal(thin.ranked, false, 'one attempt is not enough to rank a topic');
  assert.ok(st[0].rankScore < st[1].rankScore, 'weakest first');
  // shrinkage: two misses in two answers is less certain than eight misses in ten, so it is held nearer to average
  const small = J(Weakness.topicStats([log(ts[0], 0), log(ts[0], 0)], map))[0];
  const big = J(Weakness.topicStats(Array.from({ length: 10 }, () => log(vsepr[0], 0)), map))[0];
  assert.ok(small.rankScore > big.rankScore, 'a longer record of misses outranks a short one');
  assert.equal(st[st.length - 1].id, 'reaction-toolkit', 'unranked topics come last');
  assert.ok(st[0].name && st[0].part, 'topics carry their readable name and course part');
});

test('topicStats: only the latest window counts, and a question in two topics counts for both', () => {
  const logs = [];
  for (let i = 0; i < 12; i++) logs.push(log(vsepr[0], 0));          // old misses...
  for (let i = 0; i < 12; i++) logs.push(log(vsepr[0], 1));          // ...then twelve passes
  const st = J(Weakness.topicStats(logs, map));
  assert.equal(st.find((t) => t.id === 'vsepr').missed, 0, 'recovery shows: old misses fall out of the window');
  const shared = map.skills.flatMap((s) => s.nodes.map((n) => [n, s.chunk])).reduce((a, [n, c]) => ((a[n] ||= new Set()).add(c), a), {});
  const two = Object.entries(shared).find(([, c]) => c.size > 1);
  if (two) {
    const s2 = J(Weakness.topicStats([log(two[0], 0), log(two[0], 0)], map));
    assert.equal(s2.length, two[1].size, 'counted once in each topic');
  }
});

test('topicStats: names the weakest skills inside a topic', () => {
  const sk = map.skills.find((s) => s.chunk === 'vsepr' && s.nodes.length);
  const only = sk.nodes.find((n) => Weakness.chunksOf(map, n).length === 1);
  const st = J(Weakness.topicStats([log(only, 0), log(only, 0), log(only, 0)], map));
  assert.ok(st[0].weakSkills.length >= 1 && st[0].weakSkills[0].misses === 3);
});

test('unresolvedMisses: only questions whose latest attempt was a miss, newest first, deduplicated', () => {
  const [a, b, c] = vsepr;
  const logs = [log(a, 0), log(b, 0.3), log(a, 1), log(c, 0.1), log(c, 0.2)];
  const titles = (id) => byId[id]?.metadata?.title;
  const out = J(Weakness.unresolvedMisses(logs, titles, map));
  assert.deepEqual(out.map((x) => x.nodeId), [c, b], 'a is gone (later passed); c is listed once, newest first');
  assert.equal(out[0].grade, 0.2, 'shows the latest attempt');
  assert.ok(out[0].title && out[0].chunk === 'vsepr');
  assert.equal(Weakness.unresolvedMisses(logs, titles, map, 1).length, 1, 'respects the limit');
});

test('slipCounts: recurring error tags and old skill tags, with the topic they happen in', () => {
  const [a, b] = vsepr, [t] = ts;
  const logs = [
    log(a, 0.2, { errorTags: ['shape:missed-lp'] }), log(b, 0.2, { errorTags: ['shape:missed-lp', 'shape:miscount'] }),
    log(a, 0.2, { errorTags: ['shape:missed-lp'] }), log(t, 0.3, { missedSkillTags: ['term-symbols'] }), log(t, 0.3, { missedSkillTags: ['term-symbols'] }),
    log(t, 0.2, { errorTags: ['short:wrong-value'] }),
  ];
  const out = J(Weakness.slipCounts(logs, map));
  assert.equal(out[0].key, 'shape:missed-lp');
  assert.equal(out[0].count, 3);
  assert.equal(out[0].topChunk, 'vsepr');
  assert.match(out[0].label, /lone pairs/);
  assert.ok(out.some((x) => x.key === 'skill:term-symbols' && x.count === 2 && x.kind === 'skill'));
  assert.ok(!out.some((x) => x.count < 2), 'a one-off is not a pattern');
});

test('timeAgo: plain language', () => {
  const now = 10_000_000_000;
  assert.equal(Weakness.timeAgo(now - 20_000, now), 'just now');
  assert.equal(Weakness.timeAgo(now - 5 * 60_000, now), '5 min ago');
  assert.equal(Weakness.timeAgo(now - 3 * 3_600_000, now), '3 h ago');
  assert.equal(Weakness.timeAgo(now - 26 * 3_600_000, now), 'yesterday');
  assert.equal(Weakness.timeAgo(now - 5 * 86_400_000, now), '5 days ago');
});

test('errorTags: the kind of slip behind each wrong answer', () => {
  const tags = (id, vid, input, checks = {}) => {
    const v = byId[id].variants.find((x) => x.variantId === vid);
    const res = Evaluators.evaluate(v, input, {}, checks, byId[id]);
    return J(Review.errorTags(v, input, res, checks));
  };
  assert.deepEqual(tags('bk-c1-vsepr-ex1', 'c1-vsepr-ex1-v1', { a: 'linear', b: 'T-shaped', c: 'square pyramidal' }), ['shape:missed-lp']);
  assert.deepEqual(tags('bk-c1-vsepr-ex1', 'c1-vsepr-ex1-v1', { a: 'bent', b: 'seesaw', c: 'octahedral' }).sort(), ['shape:same-geometry']);
  assert.deepEqual(tags('bk-c1-vsepr-ex1', 'c1-vsepr-ex1-v1', { a: 'bent', b: 'T-shaped', c: 'square pyramidal' }), [], 'a correct answer has no slips');
  assert.deepEqual(tags('bk-c4-haber', 'c4-haber-v1', 'N2 + H2 -> NH3'), ['equation:unbalanced']);
  assert.ok(tags('bk-c4-olin-raschig', 'c4-olin-raschig-v2', 'NH3 + NaCl -> N2H4 + NaOCl').includes('equation:wrong-species'));
  assert.deepEqual(tags('bk-c4-olin-raschig', 'c4-olin-raschig-v2', 'no arrow here'), ['equation:unreadable']);
  assert.deepEqual(tags('bk-c4-inert-pair', 'c4-inert-pair-v1', 'x', { r1: true }), ['written:critical-step']);
  const nitro = byId['bk-c6-isomer-type'].variants.find((v) => v.perspectiveLabel === 'Nitro complex');
  const wrong = nitro.inputSlot.options.find((o) => !nitro.evaluator.targetIds.includes(o.id)).id;
  const r = Evaluators.evaluate(nitro, [wrong], {}, {}, byId['bk-c6-isomer-type']);
  assert.deepEqual(J(Review.errorTags(nitro, [wrong], r, {})).sort(), ['choice:missed-option', 'choice:wrong-option']);
  for (const t of Object.keys(Review.ERROR_LABELS)) assert.ok(Review.ERROR_LABELS[t].length > 5, t);
});

test('errorTags: every tag ever produced has a readable label (smoke over the bank and generated pool)', () => {
  const seen = new Set();
  for (const n of [...bank.questionNodes, ...SEED_NODES, ...LF.generateQuestionBank({})]) {
    for (const v of n.variants) {
      for (const input of ['', 'zzz', { tokens: ['zzz'], fields: { name: 'zzz' } }, { a: 'zzz' }]) {
        let res; try { res = Evaluators.evaluate(v, input, {}, {}, n); } catch (e) { continue; }
        let tg; assert.doesNotThrow(() => { tg = Review.errorTags(v, input, res, {}); }, `${n.id}/${v.variantId}`);
        for (const t of tg) seen.add(t);
      }
    }
  }
  const unlabelled = [...seen].filter((t) => !Review.ERROR_LABELS[t]);
  assert.deepEqual(unlabelled, []);
  assert.ok(seen.size >= 8, `a good spread of slip kinds should come up (${[...seen].join(', ')})`);
});

test('humanDue: when a question comes back, in words', () => {
  const now = 10_000_000_000, H = 3_600_000, D = 86_400_000;
  assert.equal(Weakness.humanDue(now + 20 * 60_000, now), 'soon');
  assert.equal(Weakness.humanDue(now + 5 * H, now), 'in a few hours');
  assert.equal(Weakness.humanDue(now + 24 * H, now), 'tomorrow');
  assert.equal(Weakness.humanDue(now + 3 * D, now), 'in 3 days');
  assert.equal(Weakness.humanDue(now + 21 * D, now), 'in 3 weeks');
  assert.equal(Weakness.humanDue(now + 120 * D, now), 'in 4 months');
  assert.equal(Weakness.humanDue(undefined, now), '');
  assert.equal(Weakness.humanDue(now - D, now), 'soon', 'already due reads as soon, not a negative time');
});

test('queueReason: says why each question is next', () => {
  const r = (meta, has) => J(Weakness.queueReason(meta, has));
  assert.equal(r({ bucket: 'newMaterial' }, false).label, 'New');
  assert.equal(r({ bucket: 'weakAtomic' }, true).label, 'Weak spot');
  assert.equal(r({ bucket: 'dueReviews', overdueDays: 0.2 }, true).label, 'Due now');
  assert.equal(r({ bucket: 'dueReviews', overdueDays: 3.4 }, true).label, 'Overdue 3d');
  assert.equal(r({ bucket: 'newMaterial' }, true).label, 'Review soon');
  for (const x of [r({}, false), r({ bucket: 'weakAtomic' }, true), r({ bucket: 'dueReviews' }, true)]) assert.ok(x.cls.includes('border'));
});

test('humanTag: concept tags as words', () => {
  assert.equal(Weakness.humanTag('lewis-resonance'), 'lewis resonance');
  assert.equal(Weakness.humanTag('cfse_calculation'), 'cfse calculation');
  assert.equal(Weakness.humanTag(null), '');
});

test('grader wording: the veto message is plain language', () => {
  const v = byId['bk-c4-inert-pair'].variants[0];
  const res = Evaluators.evaluate(v, 'x', {}, { r1: true }, byId['bk-c4-inert-pair']);
  assert.match(res.feedback, /critical step was missed/i);
  assert.doesNotMatch(res.feedback, /Zero-Step|Veto/);
});

test('topicStats: a miss you were sure about pulls its topic up the list and is counted', () => {
  const mk = (conf) => { const logs = []; for (let i = 0; i < 6; i++) logs.push(log(vsepr[i % vsepr.length], i < 3 ? 0.2 : 1, i < 3 ? { confidence: conf } : {})); for (let i = 0; i < 6; i++) logs.push(log(ts[i % ts.length], i < 3 ? 0.2 : 1)); return J(Weakness.topicStats(logs, map)); };
  const plain = mk('guess'), sure = mk('sure');
  const get = (st, id) => st.find((t) => t.id === id);
  assert.equal(get(plain, 'vsepr').sureMisses, 0);
  assert.equal(get(sure, 'vsepr').sureMisses, 3);
  assert.ok(get(sure, 'vsepr').rankScore < get(plain, 'vsepr').rankScore, 'sure-but-wrong lowers the rank score');
  assert.ok(get(sure, 'vsepr').rankScore >= get(plain, 'vsepr').rankScore - 0.12 - 1e-9, 'by at most 0.12');
});

test('slipCounts: "Sure, but wrong" is a named recurring slip', () => {
  const logs = [0, 1, 2].map((i) => log(vsepr[0], 0, { errorTags: ['confident-miss'], confidence: 'sure' }));
  const s = J(Weakness.slipCounts(logs, map));
  assert.equal(s[0].label, 'Sure, but wrong');
  assert.equal(s[0].count, 3);
});
