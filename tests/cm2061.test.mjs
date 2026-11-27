import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent, diskFetch, fakeDb } from './helpers/load-engine.mjs';

const E = loadEngine();
const { Content, Scheduler, Evaluators, Expr, SEED_MODULES } = E;
const bank = readContent('question-bank.json', 'cm2061');
const map = readContent('skill-map.json', 'cm2061');
const none = (a, msg) => assert.equal(JSON.stringify(Array.from(a)), '[]', msg);
const target = (spec, scope) => Number(Expr.evaluate(spec.targetExpr, scope));
const variants = bank.questionNodes.flatMap((n) => n.variants.map((v) => [n, v]));
const choice = variants.filter(([, v]) => v.inputSlot.type === 'choice');

test('module is registered: MODULES entry, seed module with eight weeks, no exam date yet', () => {
  assert.ok(Content.MODULES.some((m) => m.code === 'CM2061' && m.dir === 'cm2061' && m.recordKey === 'bundledBank:CM2061'));
  const seed = SEED_MODULES.find((m) => m.moduleCode === 'CM2061');
  assert.equal(seed.weeks.length, 8);
  assert.equal(seed.weeks.map((w) => w.weekNum).join(), '1,2,3,4,5,6,7,8');
  assert.equal(seed.examTimestamp, null);
  // every node's week is one of the seeded weeks
  const weeks = new Set(seed.weeks.map((w) => w.weekNum));
  for (const n of bank.questionNodes) assert.ok(weeks.has(n.metadata.week), `${n.id} week ${n.metadata.week}`);
});

test('bundle: every node validates, ids are unique, none collide with built-in namespaces, all name a source', () => {
  const plan = Content.planBankSync(bank, null, new Set());
  none(plan.rejected, JSON.stringify(plan.rejected));
  assert.equal(plan.valid.length, bank.questionNodes.length);
  assert.ok(bank.questionNodes.every((n) => n.moduleCode === 'CM2061'));
  const noSource = bank.questionNodes.filter((n) => !n.metadata.source || n.metadata.source.length < 6).map((n) => n.id);
  none(noSource, 'every node must name its source (manual page, paper style or external reference)');
  // sources name a printed manual page, a paper style or an external reference
  const odd = bank.questionNodes.filter((n) => !/Manual p|2015 paper style|CM2021|Year-1|databook|CRC|Standard|standard|E-lab/i.test(n.metadata.source)).map((n) => `${n.id}: ${n.metadata.source}`);
  none(odd);
});

test('skill map: valid, consistent with the bank, every question in a skill and every topic non-empty', () => {
  assert.equal(Content.validateSkillMap(map).valid, true, Content.validateSkillMap(map).errors.join('; '));
  const a = Content.analyzeSkillMap(map, new Set(bank.questionNodes.map((n) => n.id)));
  none(a.missingIds); none(a.inconsistent); none(a.unknownSkillRefs); none(a.orphanSkills);
  assert.ok(Math.abs(a.weightSum - 1) < 0.01, `weights sum to ${a.weightSum}`);
  for (const n of bank.questionNodes) assert.ok(map.nodeSkills[n.id]?.length, `${n.id} has a skill`);
  for (const c of map.chunks) assert.ok(Content.chunkNodeIds(map, c.id).length > 0, `${c.id} has questions`);
});

test('weights follow the agreed plan: unseen-procedure 30, experiments 22, spectroscopy 20, techniques 11, structures 10, e-labs 10, calculations 5, framework 2', () => {
  const group = (id) => (/^fw-/.test(id) ? 'framework' : /^tq-/.test(id) ? 'techniques' : /^sp-/.test(id) ? 'spectroscopy' : /^ex-/.test(id) ? 'experiments' : /^calc-/.test(id) ? 'calcs' : /^el-/.test(id) ? 'elabs' : /^case-/.test(id) ? 'unseen' : /^st-/.test(id) ? 'structures' : 'other');
  const totals = {};
  for (const s of map.skills) totals[group(s.chunk)] = (totals[group(s.chunk)] || 0) + s.marks;
  assert.equal(totals.other, undefined);
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 100) < 0.5, `marks sum to ${sum}`);
  const want = { framework: 2, techniques: 11, spectroscopy: 20, experiments: 22, calcs: 5, elabs: 10, unseen: 30, structures: 10 };
  for (const [g, w] of Object.entries(want)) assert.ok(Math.abs(totals[g] / sum - w / 110) < 0.005, `${g}: ${(totals[g] / sum * 110).toFixed(2)} vs ${w}`);
});

test('there are at least 150 pick-one questions, each key unique and every distractor explained', () => {
  assert.ok(choice.length >= 150, `only ${choice.length} pick-one variants`);
  const bad = [];
  for (const [, v] of choice) {
    const labels = v.inputSlot.options.map((o) => o.label);
    if (new Set(labels).size !== labels.length) bad.push(`${v.variantId}: duplicate options`);
    if (v.inputSlot.shuffleOptions !== true) bad.push(`${v.variantId}: not shuffled`);
    const multi = v.inputSlot.selectionMode === 'multi';
    const keys = v.evaluator.targetIds;
    if (!multi && keys.length !== 1) bad.push(`${v.variantId}: ${keys.length} keys`);
    // every option text appears in the explanation, so each wrong option is accounted for
    for (const o of v.inputSlot.options) if (!v.explanation.includes(o.label)) bad.push(`${v.variantId}: option "${o.label.slice(0, 30)}" not explained`);
    if (!/Source:/.test(v.explanation)) bad.push(`${v.variantId}: no source line`);
  }
  assert.deepEqual(bad.slice(0, 8), []);
});

test('the key is not always first once options are shuffled (seeded, so the same card repeats)', () => {
  let moved = 0, total = 0;
  for (const [, v] of choice.slice(0, 80)) {
    const pos = new Set();
    for (let seed = 1; seed <= 24; seed++) {
      const inst = Scheduler.instantiateVariant(v, seed * 7919);
      pos.add(inst.variant.inputSlot.options.findIndex((o) => v.evaluator.targetIds.includes(o.id)));
    }
    total++; if (pos.size > 1) moved++;
  }
  assert.ok(moved / total > 0.95, `key moved in ${moved}/${total}`);
});

test('choice items grade: the key scores full marks and each distractor scores zero', () => {
  const bad = [];
  for (const [n, v] of choice) {
    if (v.inputSlot.selectionMode === 'multi') continue;
    const inst = Scheduler.instantiateVariant(v, 4242);
    const keyId = v.evaluator.targetIds[0];
    const right = Evaluators.evaluate(inst.variant, [keyId], inst.scope, {}, n);
    if (right.normalizedGrade !== 1) bad.push(`${v.variantId}: key scored ${right.normalizedGrade}`);
    for (const o of v.inputSlot.options) {
      if (o.id === keyId) continue;
      const wrong = Evaluators.evaluate(inst.variant, [o.id], inst.scope, {}, n);
      if (wrong.normalizedGrade !== 0) bad.push(`${v.variantId}: distractor ${o.id} scored ${wrong.normalizedGrade}`);
    }
  }
  assert.deepEqual(bad.slice(0, 8), []);
});

test('fuzz: every calculation instantiates cleanly and the exact answer scores full marks', () => {
  const problems = [];
  for (const [n, v] of variants) {
    if (!v.variables) continue;
    for (let seed = 1; seed <= 120; seed++) {
      const inst = Scheduler.instantiateVariant(v, seed * 7919);
      const text = inst.resolvedStem + inst.resolvedExplanation + inst.resolvedHint;
      if (/\{\{|NaN|Infinity|undefined|\[object/.test(text)) { problems.push(`${v.variantId}#${seed}: bad text`); break; }
      const input = {};
      for (const [k, spec] of Object.entries(v.evaluator.targets)) {
        if (spec.type === 'numeric') input[k] = String(target(spec, inst.scope));
        else if (spec.type === 'keyword') input[k] = String(Expr.evaluate(spec.expectedExpr, inst.scope));
      }
      const res = Evaluators.evaluate(v, input, inst.scope, {}, n);
      if (res.normalizedGrade !== 1) { problems.push(`${v.variantId}#${seed}: exact answer scored ${res.normalizedGrade}`); break; }
    }
  }
  assert.deepEqual(problems.slice(0, 8), []);
});

test('fuzz: a blank scores zero, a clear miss fails, and every named wrong route is recognised', () => {
  const problems = [];
  let named = 0, checked = 0;
  for (const [n, v] of variants) {
    if (!v.variables) continue;
    const inst0 = Scheduler.instantiateVariant(v, 77);
    const blank = Object.fromEntries(Object.keys(v.evaluator.targets).map((k) => [k, '']));
    if (Evaluators.evaluate(v, blank, inst0.scope, {}, n).normalizedGrade > 0) problems.push(`${v.variantId}: a blank scores`);
    for (let seed = 1; seed <= 40; seed++) {
      const inst = Scheduler.instantiateVariant(v, seed * 104729);
      for (const [k, spec] of Object.entries(v.evaluator.targets)) {
        if (spec.type !== 'numeric') continue;
        const t = target(spec, inst.scope);
        if (Evaluators.evaluate(v, { [k]: String(t * 1.4 + 0.3) }, inst.scope, {}, n).fieldResults[k].passed) problems.push(`${v.variantId}/${k}: 40% off still passes`);
        for (const p of spec.paths || []) {
          const pv = Number(Expr.evaluate(p.expr, inst.scope));
          if (!Number.isFinite(pv)) { problems.push(`${v.variantId}/${k}: path not finite`); continue; }
          const tol = Math.max(spec.relTol ?? 0, 0.02);
          if (Math.abs(pv - t) <= Math.abs(t) * tol + (spec.tolerance ?? 0)) continue;
          checked++;
          const r = Evaluators.evaluate(v, { [k]: String(pv) }, inst.scope, {}, n).fieldResults[k];
          if (r.passed) problems.push(`${v.variantId}/${k}: wrong route "${p.label.slice(0, 30)}" scores as correct`);
          else if (r.note) named++;
        }
      }
    }
  }
  assert.deepEqual([...new Set(problems)].slice(0, 8), []);
  assert.ok(checked > 100 && named / checked > 0.8, `wrong routes named ${named}/${checked}`);
});

test('golden: the manual\'s own numbers (3.3 g bromobenzene is 2.2 mL; Mg limits the Grignard; TsCl limits 1B; [α] formula)', () => {
  const ev = (nid, vid, input, seed = 1) => {
    const n = bank.questionNodes.find((x) => x.id === nid); const v = n.variants.find((x) => x.variantId === vid);
    const inst = Scheduler.instantiateVariant(v, seed);
    return { v, n, inst, res: Evaluators.evaluate(v, input, inst.scope, {}, n) };
  };
  assert.equal(ev('bk-c61-g-volume', 'vol-manual-9', { V: '2.2' }).res.normalizedGrade, 1);
  const wrong = ev('bk-c61-g-volume', 'vol-manual-9', { V: '4.9' });
  assert.ok(wrong.res.fieldResults.V.note, 'multiplying by the density is named');
  // Expt 9: with PhBr 3.30 g and Mg 0.500 g, Mg limits (20.57 vs 21.02 mmol)
  const g9 = bank.questionNodes.find((x) => x.id === 'bk-c61-g-equiv').variants.find((x) => x.variantId === 'eq-9-mg');
  const sc = { a: 0.500, b: 3.30 };
  for (const [k, e] of Object.entries(g9.variables.derived)) sc[k] = Expr.evaluate(e, sc);
  assert.equal(sc.lim, 'bromobenzene'.length ? sc.lim : '');   // value checked below
  assert.ok(sc.nA < sc.nB, 'Mg (20.6 mmol) is below PhBr (21.0 mmol)');
  assert.equal(sc.lim, 'magnesium');
  // Expt 1B: TsCl limits (9.55 mmol vs phenol 10.6 mmol at the manual quantities)
  const g1 = bank.questionNodes.find((x) => x.id === 'bk-c61-g-equiv').variants.find((x) => x.variantId === 'eq-1b-tscl');
  const s1 = { a: 1.00, b: 1.82 };
  for (const [k, e] of Object.entries(g1.variables.derived)) s1[k] = Expr.evaluate(e, s1);
  assert.equal(s1.lim, 'tosyl chloride');
  // [α] = α / (l c): 80 mg in 10 mL, 1 dm, α = 0.32° gives +40
  const al = bank.questionNodes.find((x) => x.id === 'bk-c61-g-alpha').variants.find((x) => x.variantId === 'alpha-6');
  const sa = { m: 80, V: 10, al: 0.32 };
  for (const [k, e] of Object.entries(al.variables.derived)) sa[k] = Expr.evaluate(e, sa);
  assert.ok(Math.abs(sa.a - 40) < 1e-9);
  // spin-only moments
  const mu = bank.questionNodes.find((x) => x.id === 'bk-c61-g-mu').variants.find((x) => x.variantId === 'mu-from-n');
  const mm = (n) => { const s = { n }; for (const [k, e] of Object.entries(mu.variables.derived)) s[k] = Expr.evaluate(e, s); return s.m; };
  assert.ok(Math.abs(mm(1) - 1.73) < 0.005 && Math.abs(mm(2) - 2.83) < 0.005 && Math.abs(mm(5) - 5.92) < 0.005);
});

test('yield items: the quoted theoretical yields match hand calculation', () => {
  const y = bank.questionNodes.find((x) => x.id === 'bk-c61-g-yield');
  const th = (vid) => { const v = y.variants.find((x) => x.variantId === vid); const s = { act: 1 }; for (const [k, e] of Object.entries(v.variables.derived)) s[k] = Expr.evaluate(e, s); return s.th; };
  assert.ok(Math.abs(th('yield-1a') - 1.5239) < 0.005, 'paracetamol theoretical 1.52 g');
  assert.ok(Math.abs(th('yield-5d') - 6.1775) < 0.01, '2-iodobenzoic acid theoretical 6.18 g');
  assert.ok(Math.abs(th('yield-9') - 2.5126) < 0.01, 'benzoic acid theoretical 2.51 g');
  assert.ok(Math.abs(th('yield-7') - 0.5700) < 0.005, 'acetylferrocene theoretical 0.570 g');
});

test('syncAllBanks loads all three modules; old modules\' progress and nodes are untouched when CM2061 arrives', async () => {
  const db = fakeDb();
  // an install that already holds CM2021 and CM2011 progress
  db.rows.set('bundledBank', { key: 'bundledBank', bankKey: 'old', ids: ['stub'] });
  db.nodes.set('bk-keep-me', { id: 'bk-keep-me', moduleCode: 'CM2021' });
  const r1 = await Content.syncAllBanks(db, diskFetch());
  assert.equal(r1.state, 'synced', JSON.stringify(r1.error));
  none(r1.rejected);
  const mods = new Set([...db.nodes.values()].map((n) => n.moduleCode));
  assert.equal([...mods].sort().join(), 'CM2011,CM2021,CM2061');
  assert.equal(db.rows.get('bundledBank:CM2061').ids.length, bank.questionNodes.length);
  const r2 = await Content.syncAllBanks(db, diskFetch());
  assert.equal(r2.state, 'up-to-date');
  // a CM2061 node dropped from the bundle removes only that node
  const before = [...db.nodes.values()].filter((n) => n.moduleCode !== 'CM2061').length;
  const trimmed = { ...bank, exportedAt: 'x', questionNodes: bank.questionNodes.slice(1) };
  const f = async (url) => (String(url).includes('cm2061/question-bank') ? { ok: true, status: 200, json: async () => trimmed } : diskFetch()(url));
  const r3 = await Content.syncAllBanks(db, f);
  assert.equal(r3.perModule.CM2061.removed, 1);
  assert.equal([...db.nodes.values()].filter((n) => n.moduleCode !== 'CM2061').length, before);
});

test('final-style paper: CM2061 has a recipe whose parts all resolve', () => {
  const recipe = Scheduler.FINAL_RECIPES.CM2061;
  assert.ok(recipe, 'CM2061 recipe exists');
  const ids = new Set(bank.questionNodes.map((n) => n.id));
  for (const sec of recipe.sections) for (const part of sec.parts) for (const ref of part) assert.ok(ids.has(String(ref).split('/')[0]), `ref ${ref} resolves`);
  const paper = Scheduler.assembleRecipePaper(bank.questionNodes, recipe, { random: () => 0.37 });
  assert.equal(paper.durationMinutes, 120);
  const mcq = paper.questions.filter((q) => q.inst.variant.inputSlot.type === 'choice' && q.inst.variant.inputSlot.selectionMode !== 'multi').length;
  assert.ok(mcq >= 38 && mcq <= 42, `${mcq} pick-one questions`);       // the manual says 30-50 pick-one questions
  assert.ok(paper.questions.length <= 50, `${paper.questions.length} questions in all`);
  // no question appears twice, and two sittings differ
  const qids = paper.questions.map((q) => q.node.id + '/' + q.inst.variant.variantId);
  assert.equal(new Set(qids).size, qids.length);
  const other = Scheduler.assembleRecipePaper(bank.questionNodes, recipe, { random: () => 0.81 });
  assert.notEqual(qids.join(), other.questions.map((q) => q.node.id + '/' + q.inst.variant.variantId).join());
});

test('case chains: six or more, each a linked question of 10-14 parts; only the keyed option scores, for every part', () => {
  const cases = bank.questionNodes.filter((n) => /^bk-c61-e-case-/.test(n.id));
  assert.ok(cases.length >= 6, `${cases.length} cases`);
  const bad = [];
  for (const n of cases) {
    const v = n.variants[0];
    const keys = Object.keys(v.evaluator.targets);
    if (keys.length < 10 || keys.length > 14) bad.push(`${n.id}: ${keys.length} parts`);
    if (!/Organic Syntheses style/.test(n.metadata.source) || !/not a verified/.test(n.metadata.source)) bad.push(`${n.id}: source must say it is a model procedure`);
    for (const seed of [1, 2, 3]) {
      const inst = Scheduler.instantiateVariant(v, seed * 7919);
      for (const f of v.inputSlot.fields) {
        if (!Array.isArray(f.options)) continue;
        const spec = v.evaluator.targets[f.key];
        const right = spec.synonyms.ok[0];
        if (!f.options.includes(right)) { bad.push(`${n.id}.${f.key}: key not among the options`); continue; }
        if (new Set(f.options).size !== f.options.length) bad.push(`${n.id}.${f.key}: duplicate options`);
        for (const o of f.options) {
          const r = Evaluators.evaluate(v, { [f.key]: o }, inst.scope, {}, n).fieldResults[f.key];
          if ((o === right) !== (r.normalizedGrade === 1)) bad.push(`${n.id}.${f.key}: option "${o.slice(0, 30)}" scored ${r.normalizedGrade}`);
        }
      }
    }
    // the key is not always the first option
  }
  assert.deepEqual(bad.slice(0, 8), []);
  let first = 0, all = 0;
  for (const n of cases) for (const f of n.variants[0].inputSlot.fields) if (Array.isArray(f.options)) { all++; if (f.options[0] === n.variants[0].evaluator.targets[f.key].synonyms.ok[0]) first++; }
  assert.ok(first / all < 0.5, `key is first in ${first}/${all} parts`);
});

test('structures and apparatus: every draw item has a model answer and a checklist whose marks add up', () => {
  const draws = bank.questionNodes.filter((n) => /^bk-c61-f-/.test(n.id));
  assert.ok(draws.length >= 15, `${draws.length} draw items`);
  const bad = [];
  for (const n of draws) {
    const v = n.variants[0];
    if (!v.drawOnPaperThenCompare) bad.push(`${n.id}: not draw-then-reveal`);
    if (v.evaluator.type !== 'atomic_rubric') bad.push(`${n.id}: not a rubric`);
    const svg = v.comparisonVisualAsset?.payload || '';
    if (!/<svg/.test(svg) || /NaN|undefined/.test(svg)) bad.push(`${n.id}: bad model answer`);
    const sum = v.evaluator.rubric.reduce((a, r) => a + r.marks, 0);
    if (sum !== v.marks) bad.push(`${n.id}: rubric ${sum} vs marks ${v.marks}`);
  }
  assert.deepEqual(bad, []);
  // ten structures per set (two marks each), as in the 2015 paper's Q2
  const sets = draws.filter((n) => /-set-/.test(n.id) && !/products3|organometallic/.test(n.id));
  for (const n of sets) assert.equal(n.variants[0].marks, 20, `${n.id} is 10 x 2 marks`);
});

test('every reagent, solvent and product named in the manual experiments has a drawn structure', () => {
  const text = bank.questionNodes.filter((n) => /^bk-c61-f-set-/.test(n.id)).map((n) => n.variants[0].evaluator.rubric.map((r) => r.criterion).join(' ')).join(' ').toLowerCase();
  const need = ['pyridine', 'ethyl acetate', 'acetone', 'benzoic acid', 'sodium sulfate', 'nitric acid', 'hydrogen peroxide', 'dimethyldichlorosilane', 'paracetamol', 'phenyl toluene-p-sulfonate',
    'dibenzalacetone', 'py2zn', 'sulfonyl)pyrrole', 'tetraphenylcyclopentadienone', 'methyl 3-nitrobenzoate', 'dinitrobenzene', 'benzodioxole', '2-iodobenzoic acid', 'trifluoroacetylpyrrole', 'ethyl acetoacetate',
    'ethyl (s)-3-hydroxybutanoate', 'sodium borohydride', 'ferrocene', 'acetylferrocene', 'bromobenzene', 'phenylmagnesium bromide', 'carbon dioxide', 'boric oxide', 'sodium cyanate', 'zinc nitrate', 'potassium iodide', 'iodine'];
  for (const w of need) assert.ok(text.includes(w), `no drawing for ${w}`);
});
