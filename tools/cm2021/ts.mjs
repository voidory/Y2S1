/* Guided Tanabe–Sugano questions for CM2021 (chunk terms-ts, skill c8.tanabe-sugano), generated from public/content/figures/ts.json so that every
   answer is read off the same computed diagram the student sees. Each variant shows a printed-style diagram (a `ts-diagram` visual asset, with the
   in-app ruler) and a fixed ion and Δo/B; answers are precomputed here, so the tests recompute them from the engine and compare.
   Run: node tools/cm2021/ts.mjs   (after node tools/figures/ts.mjs)  — rewrites the bk-c8-tsg-* nodes in question-bank.json and skill-map.json. */
import fs from 'node:fs';

const DIR = 'public/content';
const ts = JSON.parse(fs.readFileSync(`${DIR}/figures/ts.json`, 'utf8'));
const SUP = '⁰¹²³⁴⁵⁶', SUB = '₀₁₂';
export const pretty = (l) => l.replace(/^(\d)/, (m, d) => SUP[d]).replace(/([ATE])(\d)/, (m, a, d) => a + SUB[d]);

/* Same reading as Figures.tsAt in index.html (linear between grid points; the ground state is the nearer grid point's). */
export function at(n, x) {
  const ion = ts.ions[n], xs = ion.x;
  let i = 0;
  while (i < xs.length - 2 && xs[i + 1] < x) i++;
  const t = Math.max(0, Math.min(1, (x - xs[i]) / (xs[i + 1] - xs[i])));
  const val = (E) => (E[i] == null || E[i + 1] == null ? null : E[i] + t * (E[i + 1] - E[i]));
  const ground = ion.ground[t < 0.5 ? i : i + 1], gS = (Number(ground[0]) - 1) / 2;
  const levels = ion.curves.map((c) => ({ label: c.label, tag: c.tag, S: c.S, E: val(c.E) })).filter((c) => c.E !== null);
  return { ground, gS, levels, allowed: levels.filter((c) => c.S === gS && c.E > 0.05).sort((a, b) => a.E - b.E) };
}
/* The two bands used to find Δo/B: the lowest spin-allowed band and the lowest T1g band above it (T1g(F) for d3/d8, T1g(P) for d2/d7). */
export const pair = (allowed) => { const b2 = allowed.slice(1).find((b) => /T1g$/.test(b.label)); return b2 ? [allowed[0], b2] : null; };
export function solveRatio(n, ratio) {
  let prev = null;
  const m0 = at(n, 1).ground[0];
  for (let x = 1; x <= 40.001; x += 0.05) {
    if (at(n, x + 0.6).ground[0] !== m0) break; // only the weak-field side of a crossover (stop just short of it)
    const a = pair(at(n, x).allowed);
    if (!a) { prev = null; continue; }
    const r = a[1].E / a[0].E, cur = { x, r, E1: a[0].E };
    if (prev && (prev.r - ratio) * (r - ratio) <= 0) { const f = Math.abs(r - prev.r) < 1e-12 ? 0 : (ratio - prev.r) / (r - prev.r); return { x: prev.x + f * (x - prev.x), E1: prev.E1 + f * (a[0].E - prev.E1) }; }
    prev = cur;
  }
  return null;
}
/* how many times the first-two-band ratio passes through `ratio` between Δo/B 1 and 40 (we only ask where it is unique) */
function crossings(n, ratio) {
  let c = 0, prev = null;
  const m0 = at(n, 1).ground[0];
  for (let x = 1; x <= 40.001; x += 0.05) {
    if (at(n, x + 0.6).ground[0] !== m0) break;
    const a = pair(at(n, x).allowed);
    if (!a) { prev = null; continue; }
    const r = a[1].E / a[0].E;
    if (prev !== null && (prev - ratio) * (r - ratio) <= 0) c++;
    prev = r;
  }
  return c;
}

const typed = (label) => {
  const m = /^(\d)([ATE])(\d?)g$/.exec(label);
  const mult = `(?:\\^?\\s*[${m[1]}${SUP[m[1]]}])`;
  const sub = m[3] ? `\\s*_?\\s*[${m[3]}${SUB[m[3]]}]` : '';
  return { acceptedPatterns: [`^\\s*${mult}\\s*${m[2]}${sub}\\s*_?\\s*g?(?:\\s*\\([A-Za-z]\\))?\\s*(?:\\([^)]*\\))?\\s*\\.?\\s*$`], caseSensitive: false, expectedDisplay: pretty(label) };
};
const numField = (expr, tol, extra = {}) => ({ type: 'numeric', targetExpr: String(expr), tolerance: tol, ...extra });
const fmt = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);
const HUND = (n) => (n <= 5 ? n : 10 - n);
const SCALE = 'The scale is 10 units of Δo/B = 36 mm along the bottom and 10 units of E/B = 12 mm up the side (so E/B = mm up ÷ 1.2).';
const asset = (n, x, caption) => ({ type: 'ts-diagram', ion: n, ...(x != null ? { marker: x } : {}), caption: caption || `Tanabe–Sugano diagram for d${n} (octahedral). ${SCALE}` });
const dn = (n) => `d${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n]}`;

const variantsBy = { ground: [], allowed: [], read: [], reverse: [], cross: [] };

/* 1. Ground state and spin at a given Δo/B */
for (const [n, x] of [[4, 12], [4, 33], [6, 12], [6, 30], [7, 12], [7, 30], [2, 12], [3, 20], [8, 12], [5, 10], [5, 34]]) {
  const a = at(n, x), g = a.ground, un = Number(g[0]) - 1, choice = n >= 4 && n <= 7, hs = un === HUND(n);
  const fields = [{ key: 'gs', label: 'Ground state (term symbol)' }];
  const targets = { gs: typed(g) };
  if (choice) { fields.push({ key: 'sp', label: 'High spin or low spin', options: ['high', 'low'] }); targets.sp = { type: 'keyword', expectedExpr: `'${hs ? 'high' : 'low'}'`, synonyms: { high: ['high', 'high spin', 'hs'], low: ['low', 'low spin', 'ls'] } }; }
  fields.push({ key: 'un', label: 'Unpaired electrons' }); targets.un = numField(un, 0.01);
  variantsBy.ground.push({
    variantId: `c8-tsg-ground-d${n}-x${x}`, perspectiveLabel: `${dn(n)}, Δo/B = ${x}`, marks: fields.length,
    stem: `The diagram is the Tanabe–Sugano diagram of a ${dn(n)} octahedral complex. The dashed line marks Δo/B = ${x}.\n\nOn a Tanabe–Sugano diagram the **ground state is always the horizontal axis** (E/B = 0): every other level is drawn above it. Find the label of the line that lies along the axis at the dashed line.`,
    hint: 'Go up the dashed line to the bottom of the diagram. The line that runs along the axis there is the ground state; read its label at the right-hand edge. The number of unpaired electrons is the spin multiplicity minus 1 (a quintet has 4).',
    explanation: `At Δo/B = ${x} the line along the axis is ${pretty(g)}. Its spin multiplicity is ${Number(g[0])}, so there are ${un} unpaired electrons${choice ? `, which is ${hs ? 'the high-spin' : 'the low-spin'} arrangement for ${dn(n)}${n >= 4 && n <= 7 ? ` (the diagram's vertical kink is the spin crossover; the ground state changes there)` : ''}` : ` (a ${dn(n)} ion has only one possible octahedral arrangement)`}.`,
    visualAsset: asset(n, x),
    inputSlot: { type: 'mapped_fields', layout: 'table', fields },
    evaluator: { type: 'mapped_fields_match', targets },
  });
}

/* 2. Spin-allowed bands in order of energy */
for (const [n, x] of [[3, 12], [3, 28], [7, 10], [7, 18], [2, 10], [2, 20], [8, 10], [8, 28], [4, 12], [6, 10]]) {
  const a = at(n, x), bands = a.allowed;
  if (bands.some((b, i) => i && bands[i].E - bands[i - 1].E < 1.5 && bands[i].label !== bands[i - 1].label)) throw new Error(`near-tie in allowed bands d${n} x=${x}`);
  const fields = bands.map((b, i) => ({ key: `b${i + 1}`, label: i === 0 ? 'Lowest-energy spin-allowed band' : i === 1 ? 'Next band up' : 'Highest band' }));
  const targets = Object.fromEntries(bands.map((b, i) => [`b${i + 1}`, typed(b.label)]));
  fields.push({ key: 'nb', label: 'How many spin-allowed bands?' }); targets.nb = numField(bands.length, 0.01);
  const g = a.ground;
  variantsBy.allowed.push({
    variantId: `c8-tsg-allowed-d${n}-x${x}`, perspectiveLabel: `${dn(n)}, Δo/B = ${x}`, marks: fields.length,
    stem: `The diagram is the Tanabe–Sugano diagram of a ${dn(n)} octahedral complex, and the dashed line marks Δo/B = ${x}.\n\nA transition is **spin-allowed** only if the excited state has the same spin multiplicity as the ground state. First find the ground state at the dashed line; then, among the labelled lines of that same multiplicity, name the ones above it in order of increasing height at the dashed line (use the ruler). Give each as a term symbol.`,
    hint: 'Read the multiplicity (the small number in front of the letter) of the ground state. Ignore every line with a different number. Order the rest by their height above the axis where the dashed line crosses them.',
    explanation: `The ground state at Δo/B = ${x} is ${pretty(g)}, multiplicity ${g[0]}. The lines with multiplicity ${g[0]} above it, from the lowest up, are ${bands.map((b) => `${pretty(b.label)} (E/B ≈ ${fmt(b.E)})`).join(', ')}: ${bands.length} spin-allowed band${bands.length > 1 ? 's' : ''}. Lines of any other multiplicity give spin-forbidden bands, which are weak.`,
    visualAsset: asset(n, x),
    inputSlot: { type: 'mapped_fields', layout: 'table', fields },
    evaluator: { type: 'mapped_fields_match', targets },
  });
}

/* 3. Measure E/B and convert to cm-1 */
for (const [n, x, B] of [[7, 10, 900], [7, 16, 850], [3, 18, 700], [2, 15, 800], [8, 12, 1000], [3, 8, 750]]) {
  const a = at(n, x), b1 = a.allowed[0];
  variantsBy.read.push({
    variantId: `c8-tsg-read-d${n}-x${x}`, perspectiveLabel: `${dn(n)}, Δo/B = ${x}, B = ${B} cm⁻¹`, marks: 2,
    stem: `A ${dn(n)} octahedral complex has Δo/B = ${x} (the dashed line) and B = ${B} cm⁻¹. Use the ruler to read the height above the axis of the **lowest-energy spin-allowed band** at the dashed line, and convert it.\n\nGive E/B for that band, then its energy in cm⁻¹.`,
    hint: 'Measure the vertical distance in mm from the axis up to the line, then divide by 1.2 (10 units of E/B = 12 mm). Energy = (E/B) × B.',
    explanation: `The lowest spin-allowed band at Δo/B = ${x} is ${pretty(b1.label)}, at E/B ≈ ${fmt(b1.E)} (about ${fmt(b1.E * 1.2)} mm up the page on this scale). Its energy is ${fmt(b1.E)} × ${B} = ${Math.round(b1.E * B)} cm⁻¹.`,
    variables: { sampled: {}, derived: { e: fmt(b1.E, 2), B: String(B) } },
    visualAsset: asset(n, x),
    inputSlot: { type: 'mapped_fields', layout: 'table', fields: [{ key: 'e', label: 'E/B of the band', numeric: true }, { key: 'nu', label: 'Band energy', unit: 'cm⁻¹', numeric: true }] },
    evaluator: { type: 'mapped_fields_match', targets: {
      e: numField('e', 1.2, { paths: [{ label: 'That is the length in mm. Convert with the scale: 10 units of E/B = 12 mm, so divide by 1.2.', expr: 'e * 1.2' }] }),
      nu: numField('e * B', Math.round(1.2 * B), { relTol: 0.03, paths: [{ label: 'Multiply E/B by B (in cm⁻¹); the E/B value alone is not an energy.', expr: 'e' }], ecf: [{ expr: 'u_e * B', label: 'Consistent with the E/B you read.' }] }),
    } },
  });
}

/* 4. From two band energies to Δo/B, B and Δo */
const ratioAt = (n, x) => { const p = pair(at(n, x).allowed); return p[1].E / p[0].E; };
for (const [n, x, B] of [[3, 8, 700], [3, 12, 650], [3, 16, 720], [7, 8, 900], [7, 12, 880], [7, 16, 850], [7, 20, 860], [2, 10, 800], [2, 16, 780], [8, 10, 1000], [8, 14, 950]]) {
  const [b1, b2] = pair(at(n, x).allowed);
  const v1 = Math.round((b1.E * B) / 10) * 10, v2 = Math.round((b2.E * B) / 10) * 10, ratio = v2 / v1, sol = solveRatio(n, ratio);
  const tolX = n === 3 || n === 8 ? 2 : 1.3;
  if (!sol || crossings(n, ratio) !== 1) { console.warn(`skip d${n} x=${x}: ratio not unique`); continue; }
  if (Math.abs(ratioAt(n, sol.x + tolX) - ratioAt(n, sol.x - tolX)) < 0.03) { console.warn(`skip d${n} x=${x}: ratio too flat`); continue; }
  const Bs = v1 / sol.E1, Do = sol.x * Bs;
  const state2 = `${pretty(b2.label)}${b2.tag === 'upper' ? '(P)' : b2.tag === 'lower' ? '(F)' : ''}`;
  variantsBy.reverse.push({
    variantId: `c8-tsg-reverse-d${n}-x${x}`, perspectiveLabel: `${dn(n)}, bands ${v1} and ${v2} cm⁻¹`, marks: 4,
    stem: `A ${dn(n)} octahedral complex has a lowest-energy spin-allowed band at **${v1} cm⁻¹** and a band to the **${state2}** state at **${v2} cm⁻¹**.\n\nUse the diagram to find Δo and B:\n1. the ratio (higher band) ÷ (lower band);\n2. the Δo/B at which those two lines (their heights above the axis) have that same ratio;\n3. B from the lower band; 4. Δo.`,
    hint: 'The ratio of the two band energies equals the ratio of their heights (E/B) at the right Δo/B, because B cancels. Measure both heights at a trial Δo/B, form the ratio, and move the trial value until it matches. Then B = (lower band) ÷ (its E/B), and Δo = (Δo/B) × B.',
    explanation: `Ratio = ${v2} ÷ ${v1} = ${ratio.toFixed(2)}. On the diagram the lowest spin-allowed line and the ${state2} line have this height ratio at Δo/B ≈ ${fmt(sol.x)}, where the lower line is at E/B ≈ ${fmt(sol.E1)}. B = ${v1} ÷ ${fmt(sol.E1)} ≈ ${Math.round(Bs)} cm⁻¹, and Δo = ${fmt(sol.x)} × ${Math.round(Bs)} ≈ ${Math.round(Do)} cm⁻¹. (The ratio changes slowly with Δo/B, so reading Δo/B to within about ±${tolX} is as good as a ruler allows.)`,
    variables: { sampled: {}, derived: { v1: String(v1), v2: String(v2), x: fmt(sol.x, 2), Bs: fmt(Bs, 1) } },
    visualAsset: asset(n, null),
    inputSlot: { type: 'mapped_fields', layout: 'table', fields: [
      { key: 'r', label: 'Band ratio (higher ÷ lower)', numeric: true }, { key: 'x', label: 'Δo/B', numeric: true }, { key: 'B', label: 'B', unit: 'cm⁻¹', numeric: true }, { key: 'D', label: 'Δo', unit: 'cm⁻¹', numeric: true }] },
    evaluator: { type: 'mapped_fields_match', targets: {
      r: numField('v2 / v1', 0.02, { relTol: 0.01, sig: 3, paths: [{ label: 'Put the higher band on top: (higher) ÷ (lower), so the ratio is above 1.', expr: 'v1 / v2' }] }),
      x: numField('x', tolX, { sig: 3 }),
      B: numField('Bs', 0, { relTol: 0.12, sig: 3, paths: [{ label: 'B is the lower band divided by its E/B, not by Δo/B.', expr: 'v1 / x' }] }),
      D: numField('x * Bs', 0, { relTol: 0.15, sig: 3, ecf: [{ expr: 'u_x * u_B', label: 'Consistent with your own Δo/B and B.' }] }),
    } },
  });
}

/* 5. Spin crossover */
for (const n of [4, 5, 6, 7]) {
  const ion = ts.ions[n], k = ion.ground.findIndex((l) => l[0] !== ion.ground[0][0]), xc = (ion.x[k - 1] + ion.x[k]) / 2;
  const hsL = ion.ground[0], lsL = ion.ground[k], hs = Number(hsL[0]) - 1, ls = Number(lsL[0]) - 1;
  variantsBy.cross.push({
    variantId: `c8-tsg-cross-d${n}`, perspectiveLabel: dn(n), marks: 5,
    stem: `The diagram is the Tanabe–Sugano diagram of a ${dn(n)} octahedral complex. Somewhere along the horizontal axis the ground state changes: the line along the axis bends and a different line takes its place.\n\nGive the Δo/B at which this spin crossover happens, the ground state before it (weak field) and after it (strong field), and the number of unpaired electrons on each side.`,
    hint: 'Follow the horizontal axis from the left: the first label is the weak-field (high-spin) ground state. The place where the axis line is replaced by another line is the crossover; the new label is the strong-field (low-spin) ground state. Unpaired electrons = multiplicity − 1.',
    explanation: `Weak field (left of Δo/B ≈ ${fmt(xc)}): ${pretty(hsL)}, ${hs} unpaired electrons (high spin). Strong field (right): ${pretty(lsL)}, ${ls} unpaired (low spin). The crossover is where the pairing energy P equals the cost of putting an electron in e_g, so it marks the switch from high to low spin.`,
    visualAsset: asset(n, null),
    inputSlot: { type: 'mapped_fields', layout: 'table', fields: [
      { key: 'xc', label: 'Δo/B at the crossover', numeric: true }, { key: 'hs', label: 'Ground state, weak field' }, { key: 'ls', label: 'Ground state, strong field' }, { key: 'uh', label: 'Unpaired electrons, weak field', numeric: true }, { key: 'ul', label: 'Unpaired electrons, strong field', numeric: true }] },
    evaluator: { type: 'mapped_fields_match', targets: { xc: numField(fmt(xc), 2), hs: typed(hsL), ls: typed(lsL), uh: numField(hs, 0.01), ul: numField(ls, 0.01) } },
  });
}

/* 6. Written */
const written = {
  variantId: 'c8-tsg-explain-v1', perspectiveLabel: 'explain the diagram', marks: 5,
  stem: 'Explain how to use a Tanabe–Sugano diagram to get Δo and B for a d⁷ complex from two measured absorption bands. State what the axes mean, which bands to use, and what you do with the ratio.',
  explanation: 'Both axes are scaled by B: the horizontal axis is Δo/B and the vertical axis is E/B, measured from the ground state (the horizontal axis itself). Only spin-allowed transitions are used: those to states with the same multiplicity as the ground state. Measure the energies of two such bands; their ratio is independent of B, so find the Δo/B at which the heights of the two corresponding lines have that ratio. Then B = (lower band) ÷ (E/B of that line) and Δo = (Δo/B) × B.',
  inputSlot: { type: 'typed_synthesis', placeholder: 'Write the key points…', minWordsToUnlockRubric: 0, allowPaperScratchpad: true },
  evaluator: { type: 'atomic_rubric', rubric: [
    ['Horizontal axis is Δo/B and vertical axis is E/B (energies in units of B above the ground state)', 1],
    ['The ground state is the horizontal axis (E/B = 0)', 1],
    ['Use only spin-allowed transitions: same spin multiplicity as the ground state', 1, true],
    ['The ratio of the two band energies does not depend on B, so match it to the ratio of the line heights to find Δo/B', 1, true],
    ['Then B = band energy ÷ (E/B), and Δo = (Δo/B) × B', 1],
  ].map((it, i) => ({ id: `r${i + 1}`, criterion: it[0], marks: it[1], isCritical: Boolean(it[2]) })) },
};

const node = (id, title, mins, diff, variants, extra = {}) => ({
  schemaVersion: '3.0', id, moduleCode: 'CM2021', tier: 'synthesis',
  metadata: { title, source: 'Guided Tanabe–Sugano practice (diagram computed in-app)', week: 8, primaryTheme: 'Tanabe–Sugano Diagrams', conceptTags: ['tanabe-sugano'], difficultyEstimate: diff, estimatedMinutes: mins, examStyle: 'construct_4to6', family: 'ts-guided', ...extra },
  variants,
});
export const NODES = [
  node('bk-c8-tsg-ground', 'Tanabe–Sugano 1: ground state and spin at a given Δo/B', 3, 4, variantsBy.ground),
  node('bk-c8-tsg-allowed', 'Tanabe–Sugano 2: the spin-allowed bands, in order', 4, 5, variantsBy.allowed),
  node('bk-c8-tsg-read', 'Tanabe–Sugano 3: measure E/B and convert to cm⁻¹', 4, 5, variantsBy.read),
  node('bk-c8-tsg-reverse', 'Tanabe–Sugano 4: from two bands to Δo/B, B and Δo', 8, 7, variantsBy.reverse),
  node('bk-c8-tsg-cross', 'Tanabe–Sugano 5: the spin crossover', 4, 5, variantsBy.cross),
  node('bk-c8-tsg-explain', 'Tanabe–Sugano 6: explain the method', 4, 5, [written]),
];

if (process.argv[1].endsWith('ts.mjs')) {
  const bankPath = `${DIR}/cm2021/question-bank.json`, mapPath = `${DIR}/cm2021/skill-map.json`;
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  bank.questionNodes = bank.questionNodes.filter((n) => !n.id.startsWith('bk-c8-tsg-')).concat(NODES);
  bank.exportedAt = new Date().toISOString();
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 1));
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const skill = map.skills.find((k) => k.id === 'c8.tanabe-sugano');
  skill.nodes = skill.nodes.filter((id) => !id.startsWith('bk-c8-tsg-')).concat(NODES.map((n) => n.id));
  for (const id of Object.keys(map.nodeSkills)) if (id.startsWith('bk-c8-tsg-')) delete map.nodeSkills[id];
  for (const n of NODES) map.nodeSkills[n.id] = ['c8.tanabe-sugano'];
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 1));
  console.log('wrote', NODES.length, 'nodes,', NODES.reduce((a, n) => a + n.variants.length, 0), 'variants');
}
