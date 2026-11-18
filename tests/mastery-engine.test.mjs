import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const rootDir = process.cwd();
const htmlPath = path.join(rootDir, 'index.html');
const goldenPath = path.join(rootDir, 'public/assets/aistudio/golden-bank_d304f08f.json');

const html = fs.readFileSync(htmlPath, 'utf8');
const goldenBank = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));

// Extract the main application <script type="module"> block from index.html
const scriptMatches = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
assert.ok(scriptMatches.length >= 2, 'Expected main application <script type="module"> in index.html');
const mainScript = scriptMatches[scriptMatches.length - 1][1];

// Minimal safe sandbox for executing pure namespaces without browser DOM bootstrap
const sandbox = {
  window: {},
  document: undefined,
  console,
  Math,
  Date,
  Number,
  String,
  Boolean,
  Array,
  Object,
  Set,
  Map,
  RegExp,
  JSON,
  Error,
  Promise,
  setTimeout,
  clearTimeout,
};
sandbox.globalThis = sandbox;
vm.runInNewContext(mainScript, sandbox);

const Engine = sandbox.window.__MASTERY_ENGINE__;
assert.ok(Engine, 'window.__MASTERY_ENGINE__ must be exposed');

const {
  Expr,
  DB,
  Scheduler,
  IsomerEngine,
  Evaluators,
  migrateGoldenBankToNodes,
  CONTENT_VERSION,
  REMOVED_NODE_IDS,
  SEED_MODULES,
  SEED_NODES,
} = Engine;

test('Zero-build single-file hygiene, pinned CDN versions, no hard-coded 239, and security checks', () => {
  const noComments = mainScript.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.equal(/TODO|FIXME|implement later/i.test(html), false, 'No placeholder comments allowed');
  assert.equal(/\beval\s*\(/.test(noComments), false, 'Strict NO eval()');
  assert.equal(/\bnew\s+Function\s*\(/.test(noComments), false, 'Strict NO new Function()');
  assert.equal(/\blocalStorage\b/.test(noComments), false, 'Strict NO localStorage for primary state');
  assert.equal(/window\.(alert|confirm|prompt)\b/.test(noComments), false, 'No window.alert/confirm/prompt');
  assert.equal(/@latest\b/.test(html), false, 'Dexie and Lucide must be pinned to fixed versions');
  assert.equal(/\b239\b/.test(html), false, 'Hard-coded "239" must be replaced everywhere');
  assert.equal('sessionMix' in Scheduler.DEFAULT_SETTINGS, false, 'sessionMix removed from DEFAULT_SETTINGS');
});

test('Sandboxed Expr compiler evaluates arithmetic, functions, comparisons, ternaries, and interpolation', () => {
  assert.equal(Expr.evaluate('2 + 3 * 4 ^ 2'), 50);
  assert.equal(Expr.evaluate('round(0.4 * 4 - 0.6 * 2, 2)'), 0.4);
  assert.equal(Expr.evaluate('dCount <= 6 ? dCount : 6', { dCount: 7 }), 6);
  assert.equal(Expr.evaluate('dCount <= 6 ? dCount : 6', { dCount: 4 }), 4);
  assert.ok(Math.abs(Expr.evaluate('sqrt(n * (n + 2))', { n: 3 }) - Math.sqrt(15)) < 1e-9);
  assert.equal(Expr.evaluate('sigfig(12.3456, 3)'), 12.3);
  assert.equal(Expr.interpolate('CFSE = {{round(x, 2)}} Δo', { x: 1.234 }), 'CFSE = 1.23 Δo');
  assert.throws(() => Expr.evaluate('process.exit(1)'), /Unknown identifier|Unexpected/);
  assert.throws(() => Expr.evaluate('alert(1)'), /disallowed function/);
});

test('SEED_MODULES has single CM2021 module with 9 chapters and examTimestamp null', () => {
  assert.equal(SEED_MODULES.length, 1);
  const m = SEED_MODULES[0];
  assert.equal(m.moduleCode, 'CM2021');
  assert.equal(m.title, 'Inorganic and Bioinorganic Chemistry');
  assert.equal(m.examTimestamp, null);
  assert.equal(m.targetRetention, 0.9);
  assert.equal(m.weeks.length, 9);
  for (let i = 0; i < 9; i++) {
    assert.equal(m.weeks[i].weekNum, i + 1);
    assert.equal(m.weeks[i].examWeight, 1.0);
  }
});

test('All 11 SEED_NODES pass validation, use CM2021, remapped weeks, source "seed (unverified)", and no audit', () => {
  assert.equal(SEED_NODES.length, 11);
  const removed = ['cm2101-particle-in-box-param', 'cm2112-symmetry-ir-atomic', 'cm2112-synthesis-ir-co-bonding'];
  for (const id of removed) {
    assert.equal(SEED_NODES.some((n) => n.id === id), false, `${id} should be deleted from SEED_NODES`);
    assert.equal(REMOVED_NODE_IDS.includes(id), true, `${id} should be in REMOVED_NODE_IDS`);
  }
  assert.ok(CONTENT_VERSION, 'CONTENT_VERSION must be defined');

  const expectedWeeks = {
    'cm2112-cfse-oct-param': 7,
    'cm2112-jahn-teller-choice': 7,
    'cm2112-orbital-d6-oh': 7,
    'cm2112-ligand-field-table': 7,
    'cm2112-pi-backbonding-atomic': 7,
    'cm2112-vsepr-pointgroup-set': 6,
    'cm2112-build-cis-ma4b2': 6,
    'cm2112-spectro-series-pattern': 8,
    'cm2101-laporte-atomic': 8,
    'cm2101-synthesis-selection-rules': 8,
    'cm2101-term-symbol-grid': 8,
  };

  for (const node of SEED_NODES) {
    const res = DB.validateQuestionNodeV3(node);
    assert.equal(res.valid, true, `Seed node ${node.id} failed validation: ${res.errors.join(', ')}`);
    assert.equal(node.moduleCode, 'CM2021');
    assert.equal(node.metadata.source, 'seed (unverified)');
    assert.equal('audit' in node.metadata, false, `${node.id} must not have metadata.audit`);
    assert.equal(node.metadata.week, expectedWeeks[node.id], `Unexpected week for ${node.id}`);
  }

  // Course conventions: positive CFSE stabilisation & "3F" full credit
  const cfseNode = SEED_NODES.find((n) => n.id === 'cm2112-cfse-oct-param');
  assert.equal(cfseNode.variants[0].variables.derived.cfse, 'round(0.4 * t2g - 0.6 * eg, 2)');
  assert.equal(cfseNode.variants[1].variables.derived.cfse, 'round(0.4 * t2g - 0.6 * eg, 2)');
  assert.equal(Expr.evaluate(cfseNode.variants[1].variables.derived.cfse, { t2g: 6, eg: 0 }), 2.4);

  const termNode = SEED_NODES.find((n) => n.id === 'cm2112-spectro-series-pattern');
  assert.equal(Evaluators.evaluate(termNode.variants[0], '3F').normalizedGrade, 1);
  assert.equal(Evaluators.evaluate(termNode.variants[0], '3F2').normalizedGrade, 1);
});

test('IsomerEngine matches all 239 formulas in golden-bank.json with 100% parity', () => {
  assert.equal(goldenBank.length, 239);
  assert.equal(IsomerEngine.BANK.length, 239);
  const byId = new Map(IsomerEngine.BANK.map((c) => [c.id, c]));
  for (const g of goldenBank) {
    const c = byId.get(g[0]);
    assert.ok(c, `Missing BANK entry for golden key ${g[0]}`);
    const A = IsomerEngine.ANALYSIS[c.id];
    const row = [
      c.id,
      A.stereo,
      A.geometric,
      A.pairs,
      A.isomers.map((i) => [i.label, i.sym.plain, i.chiral ? 1 : 0, i.trans, i.chir || ''].join('|')),
    ];
    assert.equal(JSON.stringify(row), JSON.stringify(g), `Parity mismatch for ${g[0]}`);
  }
});

test('migrateGoldenBankToNodes filters allowed chelate modes after first-appearance relabelling, sets CM2021 week 6, and priority × 0.5', () => {
  const migrated = migrateGoldenBankToNodes();
  assert.equal(CONTENT_VERSION, 6);
  assert.equal(migrated.length, 101);
  const allowedModes = new Set(['ABA:x', 'ABA:m', 'AAA:c', 'ABBA:x']);
  const relabel = (ch) => {
    const [raw, mode] = String(ch || '').split(':');
    const map = new Map();
    let out = '';
    for (const c of raw) {
      if (!map.has(c)) map.set(c, String.fromCharCode(65 + map.size));
      out += map.get(c);
    }
    return mode ? `${out}:${mode}` : out;
  };
  for (const node of migrated) {
    const res = DB.validateQuestionNodeV3(node);
    assert.equal(res.valid, true, `Migrated node ${node.id} invalid: ${res.errors.join(', ')}`);
    assert.equal(node.moduleCode, 'CM2021');
    assert.equal(node.metadata.week, 6);
    const caseObj = IsomerEngine.BANK.find((c) => `gb-${c.id}` === node.id);
    assert.ok(
      (caseObj.chel || []).every((ch) => IsomerEngine.ligDent(ch) === 2 || allowedModes.has(relabel(ch))),
      `Disallowed chelate mode in ${node.id}: ${JSON.stringify(caseObj.chel)}`
    );
  }
  assert.ok(migrated.some((n) => n.id === 'gb-g-Oh-ABAx_CDCx-'), 'CDC:x must be accepted as ABA:x after relabelling');
  assert.equal(Scheduler.DEFAULT_SETTINGS.includeGoldenBankInQueue, true);
  assert.equal('examTimestamp' in Scheduler.DEFAULT_SETTINGS, false, 'examTimestamp must not be in DEFAULT_SETTINGS');

  // Verify Golden Bank priority score is 0.5x an equivalent non-Golden Bank atomic node
  const modMap = { CM2021: SEED_MODULES[0] };
  const gbSample = migrated[0];
  const nonGbClone = { ...gbSample, metadata: { ...gbSample.metadata, isGoldenBank: false } };
  const sGb = Scheduler.priorityScore(gbSample, null, modMap, {}, 1700000000000).score;
  const sRegular = Scheduler.priorityScore(nonGbClone, null, modMap, {}, 1700000000000).score;
  assert.ok(Math.abs(sGb - sRegular * 0.5) < 1e-9, 'Golden Bank priority score must be 0.5x');
});

test('Evaluators cover all 7 evaluator types accurately', () => {
  const numRes = Evaluators.evaluate(
    { evaluator: { type: 'numeric_match', targetExpr: 'sqrt(15)', tolerance: 0.05 } },
    '3.87'
  );
  assert.equal(numRes.passed, true);

  const patVar = {
    evaluator: {
      type: 'pattern_match',
      acceptedPatterns: ['^3F$', '^3F2$'],
      partialCreditMatches: [],
      caseSensitive: true,
    },
  };
  assert.equal(Evaluators.evaluate(patVar, '3F').normalizedGrade, 1);
  assert.equal(Evaluators.evaluate(patVar, '3F2').normalizedGrade, 1);
  assert.equal(Evaluators.evaluate(patVar, '3f').normalizedGrade, 0);

  const setVar = {
    evaluator: {
      type: 'set_match',
      targetSet: ['E', 'C2'],
      synonyms: { C_2: 'C2' },
      caseSensitive: true,
      penaltyRatio: 0.5,
    },
  };
  assert.equal(Evaluators.evaluate(setVar, ['E', 'C_2']).normalizedGrade, 1);
  assert.equal(Evaluators.evaluate(setVar, ['E', 'C2', 'i']).normalizedGrade, 0.75);

  const mapVar = {
    evaluator: {
      type: 'mapped_fields_match',
      targets: {
        a: { type: 'numeric', targetExpr: '4000', tolerance: 10 },
        b: { type: 'pattern', acceptedPatterns: ['^Td$'], caseSensitive: true },
      },
    },
  };
  assert.equal(Evaluators.evaluate(mapVar, { a: '4000', b: 'Td' }).normalizedGrade, 1);
  assert.equal(Evaluators.evaluate(mapVar, { a: '4000', b: 'Oh' }).normalizedGrade, 0.5);

  const choiceVar = {
    evaluator: {
      type: 'choice_match',
      targetIds: ['a', 'b'],
      gradingMode: 'partial_with_penalty',
    },
  };
  assert.equal(Evaluators.evaluate(choiceVar, ['a', 'b']).normalizedGrade, 1);
  assert.equal(Evaluators.evaluate(choiceVar, ['a', 'b', 'c']).normalizedGrade, 0.75);

  const orbVar = {
    evaluator: {
      type: 'widget_state_match',
      widgetType: 'orbital_energy_diagram',
      expectedElectrons: 6,
      expectedLevels: { t2g: 4, eg: 2 },
      expectedUnpaired: 4,
    },
  };
  assert.equal(
    Evaluators.evaluate(orbVar, { boxes: { t2g: [2, 1, 1], eg: [1, 1] } }).normalizedGrade,
    1
  );
  assert.equal(
    Evaluators.evaluate(orbVar, { boxes: { t2g: [2, 2, 0], eg: [1, 1] } }).normalizedGrade,
    0.5
  );

  const isoVar = {
    evaluator: {
      type: 'widget_state_match',
      widgetType: 'isomer_3d_canvas',
      targetCaseId: 'oh-ma4b2',
      targetIsoId: 'oh-ma4b2:1',
    },
  };
  const cisAdjacent = ['B', 'A', 'B', 'A', 'A', 'A'];
  assert.equal(Evaluators.evaluate(isoVar, { geom: 'Oh', labels: cisAdjacent, edges: [] }).normalizedGrade, 1);
  const transOpposite = ['B', 'B', 'A', 'A', 'A', 'A'];
  assert.equal(Evaluators.evaluate(isoVar, { geom: 'Oh', labels: transOpposite, edges: [] }).passed, false);

  const synVar = {
    evaluator: {
      type: 'atomic_rubric',
      rubric: [
        { id: 'r1', criterion: 'Non-critical', marks: 3, isCritical: false, linkedSkillTag: 'tag1' },
        { id: 'r2', criterion: 'Critical step', marks: 1, isCritical: true, linkedSkillTag: 'jahn-teller' },
      ],
    },
  };
  const vetoed = Evaluators.evaluate(synVar, '', {}, { r1: true, r2: false });
  assert.equal(vetoed.vetoApplied, true);
  assert.equal(vetoed.rawGrade, 0.75);
  assert.equal(vetoed.normalizedGrade, 0.45);
  assert.deepEqual([...vetoed.missedSkillTags], ['jahn-teller']);
});

test('Scheduler uses urgency = 1 when examTimestamp is null, caps only interval (not S) at days to exam, and computes chapter coverage', () => {
  const node = SEED_NODES[0];
  const now = 1700000000000;
  const modNullExam = { ...SEED_MODULES[0], examTimestamp: null };
  const pNull = Scheduler.priorityScore(node, null, { CM2021: modNullExam }, {}, now);
  assert.ok(Math.abs(pNull.score - 1.05) < 1e-9, `Expected score 1.05 when examTimestamp is null, got ${pNull.score}`);

  // When exam is 5 days away on mod, interval is capped at 5 days while stability S is NOT capped at 5
  const examIn5Days = now + 5 * 86400000;
  const prevRs = {
    nodeId: node.id,
    moduleCode: 'CM2021',
    S: 20,
    D: 3.0,
    reps: 3,
    lapses: 0,
    lastReviewMs: now - 5 * 86400000,
    dueMs: now,
    variantStats: {},
  };
  const cappedRs = Scheduler.updateReviewState(
    prevRs,
    node,
    node.variants[0].variantId,
    1.0,
    now,
    Scheduler.DEFAULT_SETTINGS,
    { ...SEED_MODULES[0], examTimestamp: examIn5Days }
  );
  const scheduledDays = (cappedRs.dueMs - now) / 86400000;
  assert.ok(scheduledDays <= 5.001, `Expected interval <= 5 days until exam, got ${scheduledDays}`);
  assert.ok(cappedRs.S > 20, `Stability S must not be capped by exam date, got S=${cappedRs.S}`);

  // Readiness coverage metrics
  const readiness = Scheduler.computeModuleReadiness(
    SEED_MODULES[0],
    SEED_NODES,
    { [node.id]: cappedRs },
    now,
    [{ nodeId: node.id, timestamp: now, normalizedGrade: 0.9 }]
  );
  assert.equal(readiness.daysToExam, null);
  assert.equal(readiness.totalNodes, 11);
  assert.equal(readiness.attemptedCount, 1);
  assert.equal(readiness.proficientCount, 1);
  assert.equal(readiness.neverAttemptedCount, 10);
  const ch7 = readiness.weeks.find((w) => w.weekNum === 7);
  assert.equal(ch7.count, 5);
  assert.equal(ch7.attemptedCount, 1);
  assert.equal(ch7.proficientCount, 1);
  assert.equal(ch7.neverAttemptedCount, 4);
  assert.equal(ch7.attemptedPct, 20);
  assert.equal(ch7.proficientPct, 20);
});

test('Feature A: inputSlot "ordered_list" validation and evaluator "order_match" grading', () => {
  const orderedNode = {
    schemaVersion: '3.0',
    id: 'test-ordered-list',
    moduleCode: 'CM2021',
    tier: 'atomic',
    metadata: {
      title: 'Boiling Point Ordering',
      week: 4,
      primaryTheme: 'Main group trends',
      conceptTags: ['boiling-point'],
    },
    variants: [
      {
        variantId: 'v1',
        marks: 2,
        stem: 'Order the following hydrides from lowest to highest boiling point.',
        inputSlot: {
          type: 'ordered_list',
          directionLabel: 'lowest → highest boiling point',
          items: [
            { id: 'PH3', label: 'PH₃' },
            { id: 'AsH3', label: 'AsH₃' },
            { id: 'NH3', label: 'NH₃' },
            { id: 'SbH3', label: 'SbH₃' },
          ],
        },
        evaluator: {
          type: 'order_match',
          targetOrder: ['PH3', 'AsH3', 'NH3', 'SbH3'],
        },
      },
    ],
  };
  assert.equal(DB.validateQuestionNodeV3(orderedNode).valid, true);

  const variant = orderedNode.variants[0];
  // Exact match => grade = 1
  const exactRes = Evaluators.evaluate(variant, ['PH3', 'AsH3', 'NH3', 'SbH3']);
  assert.equal(exactRes.normalizedGrade, 1);
  assert.equal(exactRes.discordantPairs, 0);
  assert.deepEqual([...exactRes.correctOrder], ['PH3', 'AsH3', 'NH3', 'SbH3']);

  // 1 discordant pair out of 6 totalPairs => max(0, 1 - 2 * 1 / 6) = 4/6 = 0.6667
  const oneSwap = Evaluators.evaluate(variant, ['PH3', 'NH3', 'AsH3', 'SbH3']);
  assert.equal(oneSwap.discordantPairs, 1);
  assert.equal(oneSwap.totalPairs, 6);
  assert.equal(oneSwap.normalizedGrade, Number((1 - 2 / 6).toFixed(4)));

  // 3 discordant pairs out of 6 => max(0, 1 - 2 * 3 / 6) = 0
  const threeSwaps = Evaluators.evaluate(variant, ['SbH3', 'PH3', 'AsH3', 'NH3']);
  assert.equal(threeSwaps.discordantPairs, 3);
  assert.equal(threeSwaps.normalizedGrade, 0);
});

test('Feature B: isomer_3d_canvas enumerate_all canonicalisation and evaluator "isomer_set_match"', () => {
  const { Widgets } = Engine;
  // Chiral case oh-maa2b2 ([M(AA)2B2]): 2 geometric isomers (trans achiral, cis chiral pair => 3 stereoisomers)
  const A = IsomerEngine.ANALYSIS['oh-maa2b2'];
  assert.equal(A.geometric, 2);
  assert.equal(A.stereo, 3);
  const G = IsomerEngine.GEOMS.Oh;

  const cisIso = A.isomers.find((i) => i.chiral);
  const transIso = A.isomers.find((i) => !i.chiral);
  assert.ok(cisIso && transIso);

  const found = [];
  // 1. Add cis isomer -> "new: <label>"
  const r1 = Widgets.classifyEnumeratedIsomer(cisIso.cfg, 'Oh', 'oh-maa2b2', true, found);
  assert.equal(r1.status, 'new');
  assert.equal(r1.reply.startsWith('new: '), true);
  found.push(r1.entry);

  // 2. Rotate cis isomer by a proper rotation in G.rots -> "duplicate of #1 (same isomer, rotated)"
  const rotatedCis = IsomerEngine.applyCfg(G.rots[1].perm, cisIso.cfg);
  const r2 = Widgets.classifyEnumeratedIsomer(rotatedCis, 'Oh', 'oh-maa2b2', true, found);
  assert.equal(r2.status, 'duplicate');
  assert.equal(r2.reply, 'duplicate of #1 (same isomer, rotated)');

  // 3. Mirror image of cis isomer -> "mirror image of #1" (added when countEnantiomersSeparately = true)
  const mirrorCis = IsomerEngine.applyCfg(G.sigma.perm, cisIso.cfg);
  const r3 = Widgets.classifyEnumeratedIsomer(mirrorCis, 'Oh', 'oh-maa2b2', true, found);
  assert.equal(r3.status, 'mirror_added');
  assert.equal(r3.reply, 'mirror image of #1');

  // If countEnantiomersSeparately = false, mirror image is NOT added as a new entry
  const r3NoEnant = Widgets.classifyEnumeratedIsomer(mirrorCis, 'Oh', 'oh-maa2b2', false, found);
  assert.equal(r3NoEnant.status, 'mirror_ignored');
  assert.equal(r3NoEnant.reply, 'mirror image of #1');

  found.push(r3.entry);

  // 4. Evaluator isomer_set_match: found/expected - 0.25 * duplicates, floored at 0
  const evalVariant = {
    evaluator: {
      type: 'isomer_set_match',
      formulaCaseId: 'oh-maa2b2',
      countEnantiomersSeparately: true,
      expectedCount: 3,
    },
  };
  // 3 found, 0 duplicates => 1.0
  assert.equal(Evaluators.evaluate(evalVariant, { found: [{}, {}, {}], duplicates: 0 }).normalizedGrade, 1);
  // 2 found out of 3, 1 duplicate => 2/3 - 0.25 = 0.4167
  assert.equal(
    Evaluators.evaluate(evalVariant, { found: [{}, {}], duplicates: 1 }).normalizedGrade,
    Number((2 / 3 - 0.25).toFixed(4))
  );
  // 1 found out of 3, 3 duplicates => max(0, 1/3 - 0.75) = 0
  assert.equal(Evaluators.evaluate(evalVariant, { found: [{}], duplicates: 3 }).normalizedGrade, 0);
});

test('Feature C: evaluator "name_match" normalises case/whitespace/hyphens and provides targeted error feedback', () => {
  const nameVar = {
    evaluator: {
      type: 'name_match',
      acceptedNames: [
        'tetraamminechloridonitritocobalt(III) ion',
        'tetraamminechloronitritocobalt(III) ion',
      ],
      commonErrors: [
        {
          type: 'amine_vs_ammine',
          feedback: 'Use "ammine" (double m) for NH3; "amine" refers to organic amines.',
        },
        {
          type: 'alphabetical_order',
          ligands: ['ammine', 'chlorido', 'nitrito'],
          feedback: 'List ligands in alphabetical order: ammine before chlorido before nitrito.',
        },
        {
          type: 'missing_oxidation_state',
          feedback: 'Include the Roman numeral oxidation state (III) on cobalt.',
        },
      ],
    },
  };

  // Case, whitespace, and hyphen normalisation
  assert.equal(
    Evaluators.evaluate(nameVar, '  Tetra-ammine-chlorido-nitrito-cobalt (iii)   ion ').normalizedGrade,
    1
  );

  // Targeted feedback: "amine" vs "ammine"
  const errAmine = Evaluators.evaluate(nameVar, 'tetraaminechloridonitritocobalt(III) ion');
  assert.equal(errAmine.normalizedGrade, 0);
  assert.ok(errAmine.feedback.includes('double m'));

  // Targeted feedback: ligands out of alphabetical order
  const errOrder = Evaluators.evaluate(nameVar, 'chloridotetraamminenitritocobalt(III) ion');
  assert.equal(errOrder.normalizedGrade, 0);
  assert.ok(errOrder.feedback.includes('alphabetical order'));

  // Targeted feedback: missing oxidation state
  const errOx = Evaluators.evaluate(nameVar, 'tetraamminechloridonitritocobalt ion');
  assert.equal(errOx.normalizedGrade, 0);
  assert.ok(errOx.feedback.includes('oxidation state'));

  // Anionic complex missing "-ate" suffix
  const anionicVar = {
    evaluator: {
      type: 'name_match',
      acceptedNames: ['potassium hexacyanidoferrate(II)', 'potassium hexacyanoferrate(II)'],
      commonErrors: [
        {
          type: 'missing_ate',
          feedback: 'Anionic complex requires the "-ate" suffix on the metal (ferrate, not iron).',
        },
      ],
    },
  };
  assert.equal(Evaluators.evaluate(anionicVar, 'Potassium hexa-cyanido-ferrate (II)').normalizedGrade, 1);
  const errAte = Evaluators.evaluate(anionicVar, 'potassium hexacyanidoiron(II)');
  assert.equal(errAte.normalizedGrade, 0);
  assert.ok(errAte.feedback.includes('-ate'));
});

test('Feature D: Mock Paper assembly by metadata.examStyle proportions and chapter filtering', () => {
  const allNodes = [...SEED_NODES, ...migrateGoldenBankToNodes()];
  const paper = Scheduler.assembleMockPaper(allNodes, {
    chapters: [6, 7, 8],
    durationMinutes: 30,
    totalQuestions: 8,
    proportions: {
      mcq_1mark: 0.25,
      short_2to3: 0.50,
      construct_4to6: 0.25,
    },
  });

  assert.ok(paper.mockId.startsWith('mock-'));
  assert.equal(paper.questions.length, 8);
  assert.deepEqual([...paper.chapters], [6, 7, 8]);
  assert.equal(paper.styleTargets.mcq_1mark, 2);
  assert.equal(paper.styleTargets.short_2to3, 4);
  assert.equal(paper.styleTargets.construct_4to6, 2);

  const actualStyles = { mcq_1mark: 0, short_2to3: 0, construct_4to6: 0 };
  for (const q of paper.questions) {
    actualStyles[q.examStyle] += 1;
    assert.ok([6, 7, 8].includes(q.node.metadata.week));
  }
  assert.equal(actualStyles.mcq_1mark, 2);
  assert.equal(actualStyles.short_2to3, 4);
  assert.equal(actualStyles.construct_4to6, 2);
});

test('Turn 5 Feature A: typed_equation + equation_match (formulas, charges, hydrates, multiples, multi-step, partial credit)', () => {
  // 1. Species identity by element counts + charge (ClNO == NOCl), state symbols ignored, integer multiples accepted
  const nitrosylVar = {
    inputSlot: 'typed_equation',
    accepted: ['2 NO + Cl2 -> 2 NOCl'],
    evaluator: {
      type: 'equation_match',
    },
  };

  // Exact match with ClNO instead of NOCl and state symbols
  const resExact = Evaluators.evaluate(nitrosylVar, '2 NO(g) + Cl2(g) → 2 ClNO(g)');
  assert.equal(resExact.normalizedGrade, 1);
  assert.equal(resExact.passed, true);

  // Integer multiple of key's coefficients (x2) with "=" separator
  const resMultipleRightSide = Evaluators.evaluate(nitrosylVar, '4 NO + 2 Cl2 = 4 ClNO');
  assert.equal(resMultipleRightSide.normalizedGrade, 1);
  assert.equal(resMultipleRightSide.passed, true);

  // Correct species but unbalanced atoms -> 0.5 and names unbalanced element
  const resUnbalanced = Evaluators.evaluate(nitrosylVar, 'NO + Cl2 -> ClNO');
  assert.equal(resUnbalanced.normalizedGrade, 0.5);
  assert.equal(resUnbalanced.passed, false);
  assert.ok(resUnbalanced.feedback.includes('Cl'), `Expected feedback to name Cl, got: ${resUnbalanced.feedback}`);

  // Missing or extra species -> 0 and names missing/extra species
  const resMissing = Evaluators.evaluate(nitrosylVar, '2 NO + O2 -> 2 ClNO');
  assert.equal(resMissing.normalizedGrade, 0);
  assert.ok(resMissing.feedback.includes('Cl2') || resMissing.feedback.includes('O2'));

  // 2. Complex ions with [] and (), hydrate dot, charges (2-, ^2-, superscripts), and electrons e-
  const complexRedoxVar = {
    inputSlot: 'typed_equation',
    evaluator: {
      type: 'equation_match',
      accepted: [
        '[Fe(CN)6]3- + e- -> [Fe(CN)6]4-',
        'CuSO4·5H2O -> Cu2+ + SO4^2- + 5H2O',
      ],
    },
  };

  // Superscript charges and e-
  const resRedox = Evaluators.evaluate(complexRedoxVar, '[Fe(CN)6]³⁻(aq) + e- -> [Fe(CN)6]^4-(aq)');
  assert.equal(resRedox.normalizedGrade, 1);

  // Unbalanced charge when user writes 2 e-
  const resUnbalCharge = Evaluators.evaluate(complexRedoxVar, '[Fe(CN)6]3- + 2 e- -> [Fe(CN)6]4-');
  assert.equal(resUnbalCharge.normalizedGrade, 0.5);
  assert.ok(resUnbalCharge.feedback.toLowerCase().includes('charge'));

  // Hydrate dot · or .
  const resHydrate = Evaluators.evaluate(complexRedoxVar, '2 CuSO4.5H2O(s) -> 2 Cu2+(aq) + 2 SO4 2-(aq) + 10 H2O(l)');
  assert.equal(resHydrate.normalizedGrade, 1);

  // 3. Multi-step route in node.accepted[]
  const multiStepNode = {
    accepted: [
      ['Zn + 2 H+ -> Zn2+ + H2'],
      [
        'Zn + 2 HCl -> ZnCl2 + H2',
        'ZnCl2 + 2 Ag+ -> 2 AgCl + Zn2+',
      ],
    ],
  };
  const multiStepVar = {
    inputSlot: 'typed_equation',
    evaluator: { type: 'equation_match' },
  };
  const resMulti = Evaluators.evaluate(
    multiStepVar,
    'Zn(s) + 2 HCl(aq) -> ZnCl2(aq) + H2(g)\nZnCl2(aq) + 2 Ag+(aq) -> 2 AgCl(s) + Zn2+(aq)',
    {},
    multiStepNode
  );
  assert.equal(resMulti.normalizedGrade, 1);
});

test('Turn 5 Feature B: visualAsset type "image" (data URL) and "draw on paper, then compare" mode', () => {
  const { UI } = Engine;
  const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  const imgHtml = UI.renderVisualAssetHtml({
    type: 'image',
    dataUrl: sampleDataUrl,
    caption: 'MO diagram for CO',
  });
  assert.ok(imgHtml.includes(sampleDataUrl));
  assert.ok(imgHtml.includes('MO diagram for CO'));

  const drawVar = {
    inputSlot: { type: 'typed_synthesis', drawOnPaperThenCompare: true },
    visualAsset: {
      type: 'image',
      dataUrl: sampleDataUrl,
      mode: 'draw_then_compare',
    },
  };
  assert.equal(UI.isDrawThenCompareVariant(drawVar), true);
  assert.equal(UI.isDrawThenCompareVariant({ inputSlot: { type: 'numeric' }, visualAsset: { type: 'image', dataUrl: sampleDataUrl } }), false);
});

test('Turn 5 Feature C: metadata.family anti-consecutive scheduling and metadata.chainNext', () => {
  const familyNodes = [
    {
      id: 'node-fam-a1',
      moduleCode: 'CM2021',
      tier: 'atomic',
      metadata: { title: 'Fam A1', week: 6, examWeight: 1, estimatedTimeSec: 60, conceptTags: ['a'], family: 'cfse_family', chainNext: 'node-fam-a2', source: 'seed (unverified)' },
      variants: [{ variantId: 'v1', stem: 'Q1', inputSlot: { type: 'numeric' }, evaluator: { type: 'numeric_tolerance', targetExpr: '1', tolerance: 0.1 }, explanation: 'E1' }],
    },
    {
      id: 'node-fam-a2',
      moduleCode: 'CM2021',
      tier: 'atomic',
      metadata: { title: 'Fam A2', week: 6, examWeight: 1, estimatedTimeSec: 60, conceptTags: ['a'], family: 'cfse_family', source: 'seed (unverified)' },
      variants: [{ variantId: 'v1', stem: 'Q2', inputSlot: { type: 'numeric' }, evaluator: { type: 'numeric_tolerance', targetExpr: '2', tolerance: 0.1 }, explanation: 'E2' }],
    },
    {
      id: 'node-fam-b1',
      moduleCode: 'CM2021',
      tier: 'atomic',
      metadata: { title: 'Fam B1', week: 6, examWeight: 1, estimatedTimeSec: 60, conceptTags: ['b'], family: 'mo_family', source: 'seed (unverified)' },
      variants: [{ variantId: 'v1', stem: 'Q3', inputSlot: { type: 'numeric' }, evaluator: { type: 'numeric_tolerance', targetExpr: '3', tolerance: 0.1 }, explanation: 'E3' }],
    },
  ];

  // Give node-fam-a1 and node-fam-a2 much higher urgency/overdue weight than node-fam-b1,
  // but when lastFamily is 'cfse_family', scheduler must pick 'node-fam-b1' instead of another 'cfse_family' node.
  const nowMs = Date.now();
  const reviewStates = {
    'node-fam-a1': { nodeId: 'node-fam-a1', S: 0.5, D: 8, reps: 1, lapses: 2, lastReviewMs: nowMs - 86400000 * 10, dueMs: nowMs - 86400000 * 9 },
    'node-fam-a2': { nodeId: 'node-fam-a2', S: 0.5, D: 8, reps: 1, lapses: 2, lastReviewMs: nowMs - 86400000 * 10, dueMs: nowMs - 86400000 * 9 },
    'node-fam-b1': { nodeId: 'node-fam-b1', S: 10, D: 3, reps: 3, lapses: 0, lastReviewMs: nowMs - 86400000, dueMs: nowMs + 86400000 * 5 },
  };
  const modMap = Object.fromEntries(SEED_MODULES.map((m) => [m.moduleCode, m]));

  const nextAfterFamA = Scheduler.selectNextNode(
    familyNodes,
    reviewStates,
    modMap,
    [{ nodeId: 'node-fam-a1', timestamp: nowMs - 1000 }],
    Scheduler.DEFAULT_SETTINGS,
    { lastFamily: 'cfse_family', excludeNodeId: 'node-fam-a1' },
    nowMs
  );
  assert.ok(nextAfterFamA);
  assert.equal(nextAfterFamA.node.id, 'node-fam-b1', 'Scheduler must not serve two nodes of the same family back to back');

  // However, forceNodeId (used by "Next in chain" button for metadata.chainNext) opens chainNext immediately
  const forcedChainNext = Scheduler.selectNextNode(
    familyNodes,
    reviewStates,
    modMap,
    [{ nodeId: 'node-fam-a1', timestamp: nowMs - 1000 }],
    Scheduler.DEFAULT_SETTINGS,
    { forceNodeId: familyNodes[0].metadata.chainNext, lastFamily: 'cfse_family' },
    nowMs
  );
  assert.ok(forcedChainNext);
  assert.equal(forcedChainNext.node.id, 'node-fam-a2', 'Next in chain (forceNodeId) must open chainNext immediately');
});

test('Turn 6 & Turn 7: LF namespace (pure functions, heteroleptic/salt IUPAC nomenclature, constraint types, textbookExceptions, separate grading, and 10-case console self-test)', () => {
  const { LF } = Engine;
  assert.ok(LF, 'LF namespace should be exposed');

  // 1. Console self-test on load must pass all 10 required checks (4 original + 5 new + low-spin [Co(NH3)6]3+) with textbookExceptions off and oxState 0 allowed
  const selfTest = LF.runSelfTest();
  assert.equal(selfTest.allPassed, true);
  assert.deepEqual(
    Array.from(selfTest.results, (r) => ({ label: r.label, actual: [...r.actual], pass: r.pass })),
    [
      { label: '[M(H2O)6]3+ one unpaired', actual: ['Ti'], pass: true },
      { label: '[MBr4]- most unpaired', actual: ['Fe'], pass: true },
      { label: 'diamagnetic [M(CN)6]3-', actual: ['Co'], pass: true },
      { label: '[M(H2O)6]2+ with LFSE 0.6 Δo', actual: ['Cr', 'Cu'], pass: true },
      { label: '[M(H2O)6]Cl3 with 4 unpaired', actual: ['Mn', 'Co'], pass: true },
      { label: 'K2[MF4] with half-filled e', actual: ['Ti', 'Mn'], pass: true },
      { label: 'Na2[M(NH3)2(H2O)2(SCN)2] with μs = 5.92 BM', actual: ['V'], pass: true },
      { label: '[M(en)3]F3 with LFSE = 2Δo − 2P', actual: ['Fe'], pass: true },
      { label: '[M(H2O)6]SO4 with LFSE = 0.4Δo', actual: ['Fe'], pass: true },
      { label: '[Co(NH3)6]3+ → low spin, 0 unpaired, LFSE 2.4Δo − 2P', actual: ['low', 0, '2.4Δo − 2P'], pass: true },
    ]
  );

  // 2. Settings flag: includeD0D10InDiamagnetic
  const diaDefault = LF.solveInverseTemplate({
    ligandFormula: 'CN-',
    coordNumber: 6,
    geometry: 'Oh',
    overallCharge: -3,
    constraint: { type: 'diamagnetic' },
    includeD0D10InDiamagnetic: false,
  });
  assert.deepEqual([...diaDefault.validMetals], ['Co']);

  const diaWithD0D10 = LF.solveInverseTemplate({
    ligandFormula: 'CN-',
    coordNumber: 6,
    geometry: 'Oh',
    overallCharge: -3,
    constraint: { type: 'diamagnetic' },
    includeD0D10InDiamagnetic: true,
  });
  assert.deepEqual([...diaWithD0D10.validMetals], ['Sc', 'Co']);

  // 3. Settings flag: textbookExceptions (default off vs on for [Co(H2O)6]3+)
  const coH2O3Off = LF.solveInverseTemplate('[M(H2O)6]Cl3', { type: 'unpaired', value: 4 }, { textbookExceptions: false });
  assert.deepEqual([...coH2O3Off.validMetals], ['Mn', 'Co']);
  assert.ok(
    coH2O3Off.textbookExceptionNote && coH2O3Off.textbookExceptionNote.includes('[Co(H2O)6]3+ is in fact low-spin'),
    'When textbookExceptions is off and Co(III) with H2O is in the answer set, a low-spin note must be attached'
  );

  const coH2O3On = LF.solveInverseTemplate('[M(H2O)6]Cl3', { type: 'unpaired', value: 4 }, { textbookExceptions: true });
  assert.deepEqual([...coH2O3On.validMetals], ['Mn']);
  assert.equal(coH2O3On.textbookExceptionNote, null);

  const coH2O3DiaOn = LF.solveInverseTemplate('[M(H2O)6]Cl3', 'diamagnetic', { textbookExceptions: true });
  assert.deepEqual([...coH2O3DiaOn.validMetals], ['Co']);

  // 4. Formulas with counter-ions, heteroleptic complexes, ambidentate donor atoms, and oxidation state 0
  const vHet = LF.analyzeComplex('Na2[V(NH3)2(H2O)2(SCN)2]');
  assert.equal(vHet.oxState, 0);
  assert.equal(vHet.oxRoman, '0');
  assert.equal(vHet.dn, 5);
  assert.equal(vHet.geometry, 'Oh');
  assert.equal(vHet.spinState, 'high');
  assert.equal(vHet.unpaired, 5);
  assert.equal(Number(vHet.muSO.toFixed(2)), 5.92);
  // Counter-ion sodium + alphabetical ligands (ammine, aqua, thiocyanato) + anionic -ate (vanadate) + (0)
  assert.equal(vHet.iupacName, 'sodium diamminediaquadithiocyanatovanadate(0)');

  // Ambidentate donor atoms: SCN- (S-bound, thiocyanato) vs NCS- (N-bound, isothiocyanato)
  const scnLig = LF.resolveLigand('SCN');
  const ncsLig = LF.resolveLigand('NCS');
  assert.equal(scnLig.donorAtom, 'S');
  assert.equal(scnLig.nameInComplex, 'thiocyanato');
  assert.equal(ncsLig.donorAtom, 'N');
  assert.equal(ncsLig.nameInComplex, 'isothiocyanato');

  const ncsComplex = LF.analyzeComplex('K3[Cr(NCS)6]');
  assert.equal(ncsComplex.oxState, 3);
  assert.equal(ncsComplex.iupacName, 'potassium hexaisothiocyanatochromate(III)');

  // 5. en is strong-field; [Fe(en)3]F3 is low-spin d5 with LFSE = 2Δo − 2P
  const feEn3 = LF.analyzeComplex('[Fe(en)3]F3');
  assert.equal(feEn3.oxState, 3);
  assert.equal(feEn3.dn, 5);
  assert.equal(feEn3.spinState, 'low');
  assert.equal(feEn3.unpaired, 1);
  assert.equal(feEn3.lfseCoeff, 2);
  assert.equal(feEn3.pTermsRelative, 2);
  assert.equal(feEn3.lfseExpression, '2Δo − 2P');
  assert.equal(feEn3.iupacName, 'tris(ethylenediamine)iron(III) fluoride');

  // 6. Pure complex analysis: Oh weak vs strong, Td vs Square Planar (4-coord d8 all strong)
  const feCn6 = LF.analyzeComplex({ metalSymbol: 'Fe', oxidationState: 2, ligandFormula: 'CN-', coordNumber: 6, geometry: 'Oh', pTermMode: 'relative' });
  assert.equal(feCn6.dn, 6);
  assert.equal(feCn6.spinState, 'low');
  assert.equal(feCn6.unpaired, 0);
  assert.equal(feCn6.lfseCoeff, 2.4);
  assert.equal(feCn6.pTermsRelative, 2);
  assert.equal(feCn6.pTermsAbsolute, 3);
  assert.ok(feCn6.acceptedNames.includes('hexacyanidoferrate(II)'));

  const niCn4Auto = LF.analyzeComplex('[Ni(CN)4]2-');
  assert.equal(niCn4Auto.geometry, 'square_planar');
  assert.equal(niCn4Auto.spinState, 'low');
  assert.equal(niCn4Auto.unpaired, 0);

  const niCl4Auto = LF.analyzeComplex('[NiCl4]2-');
  assert.equal(niCl4Auto.geometry, 'Td');
  assert.equal(niCl4Auto.spinState, 'high');
  assert.equal(niCl4Auto.unpaired, 2);

  // Never generate a question whose answer depends on spin state if weakest ligand is NH3
  assert.equal(LF.buildForwardQuestionNode('[Fe(NH3)6]2+'), null);
  assert.equal(LF.buildInverseQuestionNode('[M(NH3)6]2+', { type: 'unpaired', value: 4 }), null);
  // Never generate a question with oxidation state 0 unless allowOxStateZero is set
  assert.equal(LF.buildForwardQuestionNode('Na2[V(NH3)2(H2O)2(SCN)2]'), null);
  assert.equal(LF.buildInverseQuestionNode('Na2[M(NH3)2(H2O)2(SCN)2]', { type: 'mu_s', value: 5.92 }), null);

  // 7. Question factory validation & separate grading of metal set, names, and LFSE
  const bankRel = LF.generateQuestionBank({ pTermMode: 'relative', includeD0D10InDiamagnetic: false, textbookExceptions: false });
  assert.ok(bankRel.length > 20, `Expected >20 generated LF nodes, got ${bankRel.length}`);
  const forwardNodes = bankRel.filter((n) => n.id.startsWith('lf-fwd-'));
  const inverseNodes = bankRel.filter((n) => n.id.startsWith('lf-inv-'));
  assert.ok(forwardNodes.length > 0);
  assert.ok(inverseNodes.length > 0);

  for (const node of bankRel) {
    const v = DB.validateQuestionNodeV3(node);
    assert.equal(v.valid, true, `Invalid LF QuestionNodeV3 ${node.id}: ${v.errors.join(', ')}`);
    assert.ok([7, 8].includes(node.metadata.week), `LF node ${node.id} must be tagged chapter 7 or 8`);
    assert.ok(!node.id.includes('nh3'), `NH3 spin-state question found in ${node.id}`);
  }

  // Test separate grading on [M(en)3]F3 with LFSE = 2Δo − 2P -> {Fe}
  const enNode = LF.buildInverseQuestionNode('[M(en)3]F3', 'LFSE = 2Δo − 2P');
  assert.ok(enNode);
  const enVar = enNode.variants[0];

  const enFull = Evaluators.evaluate(enVar, {
    tokens: ['Fe'],
    fields: {
      name: 'tris(ethylenediamine)iron(III) fluoride',
      lfse: '2Δo - 2P',
    },
  });
  assert.equal(enFull.normalizedGrade, 1);
  assert.equal(enFull.separateGrades.metalSet.normalizedGrade, 1);
  assert.equal(enFull.separateGrades.name.normalizedGrade, 1);
  assert.equal(enFull.separateGrades.lfse.normalizedGrade, 1);

  // Partial credit when metal set and LFSE are right, but name is wrong
  const enPartial = Evaluators.evaluate(enVar, {
    tokens: ['Fe'],
    fields: {
      name: 'wrong name',
      lfse: '2Δo − 2P',
    },
  });
  assert.equal(enPartial.separateGrades.metalSet.normalizedGrade, 1);
  assert.equal(enPartial.separateGrades.name.normalizedGrade, 0);
  assert.equal(enPartial.separateGrades.lfse.normalizedGrade, 1);
  assert.equal(enPartial.normalizedGrade, Number((2 / 3).toFixed(4)));
});




