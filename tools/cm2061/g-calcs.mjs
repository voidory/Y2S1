/* Chunk G: calculations (Manual pp.14, 20-22, 24, 29-51). Week 7. Answers are computed in `derived` with the app's Expr from the
   displayed (rounded) data; each plausible slip is a named wrong route (paths) and each later step has carried-forward credit (ecf).
   Molar masses and densities are the textbook values the CBC databook supplies in the exam; they are printed here for practice. */
import { node, calc, num, kw, range, choice } from './lib.mjs';

const W = 7;
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });
const SRC = 'Manual pp.29-51 (quantities); databook-type molar masses and densities';
const mk = (id, title, chunk, tags, source, variants, extra = {}) => node({ id, week: W, title, theme: chunk, tags, source, tier: 'atomic', exam: 'short_2to3', mins: 3, diff: 3, variants, ...extra });

/* ---------- volume or mass of a liquid from density ---------- */
{
  const LIQ = [
    { id: 'phbr', name: 'bromobenzene', expt: 'Expt 9', d: 1.49, lo: 3.00, hi: 3.60, step: 0.05 },
    { id: 'phcho', name: 'benzaldehyde', expt: 'Expt 1C', d: 1.04, lo: 1.70, hi: 1.85, step: 0.01 },
    { id: 'acetone', name: 'acetone', expt: 'Expt 1C', d: 0.791, lo: 0.45, hi: 0.60, step: 0.01 },
    { id: 'pyrrole', name: 'pyrrole', expt: 'Expt 5E', d: 0.967, lo: 0.65, hi: 0.85, step: 0.01 },
    { id: 'eaa', name: 'ethyl acetoacetate', expt: 'Expt 6', d: 1.02, lo: 1.40, hi: 1.70, step: 0.01 },
    { id: 'sicl', name: 'dimethyldichlorosilane', expt: 'Expt 8', d: 1.06, lo: 9.00, hi: 11.00, step: 0.10 },
  ];
  const toV = LIQ.map((l) => calc({
    id: `vol-${l.id}`, label: `${l.name}: mass to volume`, marks: 2,
    stem: `${l.expt} needs {{fix(m,${l.step < 0.05 ? 2 : l.step < 0.1 ? 2 : 1})}} g of ${l.name}, a liquid of density ${l.d} g mL⁻¹. What volume do you measure out with a syringe?`,
    hint: 'volume = mass ÷ density.',
    explanation: 'V = m / d, with d in g mL⁻¹ and m in g. A liquid is dispensed by volume, so the mass the procedure gives is converted: dividing by a density below 1 gives a volume larger than the mass; above 1, smaller. *(Databook-type density.)*',
    sampled: { m: range(l.lo, l.hi, l.step, l.step < 0.05 ? 2 : l.step < 0.1 ? 2 : 1) },
    derived: { V: `m / ${l.d}`, Vwrong: `m * ${l.d}` },
    fields: [num('V', 'Volume', 'mL', 'V', { relTol: 0.02, paths: [{ label: 'You multiplied the mass by the density (m × d) instead of dividing by it.', expr: 'Vwrong' }] })],
  }));
  const toM = [
    { id: 'ac2o', name: 'acetic anhydride', expt: 'Expt 1A', d: 1.08, v: [1.0, 1.4, 0.1] },
    { id: 'tfaa', name: 'trifluoroacetic anhydride', expt: 'Expt 5E', d: 1.49, v: [1.5, 2.0, 0.05] },
    { id: 'py', name: 'pyridine', expt: 'Expt 1D', d: 0.982, v: [0.8, 1.2, 0.1] },
  ].map((l) => calc({
    id: `mass-${l.id}`, label: `${l.name}: volume to mass`, marks: 2,
    stem: `${l.expt} measures out {{fix(V,${l.v[2] < 0.1 ? 2 : 1})}} mL of ${l.name} (density ${l.d} g mL⁻¹). What mass of liquid is this?`,
    hint: 'mass = volume × density.',
    explanation: 'm = V × d. A mass is the quantity you need for moles; the density converts the measured volume to it. *(Databook-type density.)*',
    sampled: { V: range(l.v[0], l.v[1], l.v[2], l.v[2] < 0.1 ? 2 : 1) },
    derived: { m: `V * ${l.d}`, mwrong: `V / ${l.d}` },
    fields: [num('m', 'Mass', 'g', 'm', { relTol: 0.02, paths: [{ label: 'You divided the volume by the density instead of multiplying.', expr: 'mwrong' }] })],
  }));
  const fixed = calc({
    id: 'vol-manual-9', label: 'The manual\'s own question: 3.3 g of bromobenzene', marks: 2,
    stem: 'Expt 9 adds bromobenzene (3.3 g) and asks "what volume is this?" Take the density of bromobenzene as 1.49 g mL⁻¹. What volume do you inject? Give it to 2 significant figures.',
    hint: 'volume = mass ÷ density.',
    explanation: 'V = 3.3 g ÷ 1.49 g mL⁻¹ = 2.2 mL (2 significant figures, set by the 3.3 g). The manual poses this as a question on p.50. *(Databook-type density.)*',
    derived: { V: '3.3 / 1.49', Vwrong: '3.3 * 1.49' },
    fields: [num('V', 'Volume', 'mL', 'V', { relTol: 0.02, paths: [{ label: 'You multiplied by the density instead of dividing (that gives 4.9 mL).', expr: 'Vwrong' }] })],
  });
  add(mk('bk-c61-g-volume', 'Volume or mass of a liquid from its density', 'calc-mass', ['density', 'volume'], SRC, [...toV, ...toM, fixed], { family: 'calc-density' }),
    { id: 'g.volume', name: 'Volume or mass of a liquid from its density', chunk: 'calc-mass' });
}

/* ---------- moles, equivalents and the limiting reagent ---------- */
{
  const LIMIT = { pn: 'phenol', ts: 'tosyl chloride' };
  const pair = ({ id, label, expt, A, B, nameA, nameB, mwA, mwB, ra, rb, dpa, dpb, stoichB = 1 }) => calc({
    id, label, marks: 5,
    stem: `${expt}: ${nameA} (${'{{fix(a,' + dpa + ')}}'} g, M = ${mwA} g mol⁻¹) reacts with ${nameB} (${'{{fix(b,' + dpb + ')}}'} g, M = ${mwB} g mol⁻¹)${stoichB === 2 ? ', and each ' + nameA + ' molecule condenses with two ' + nameB + ' molecules' : ' in a 1:1 reaction'}. Give the amount of each reagent, the equivalents of ${nameB} relative to ${nameA}, which reagent is limiting and the maximum amount of product in mmol.`,
    hint: 'n = m ÷ M. Equivalents = n(B) ÷ n(A). The limiting reagent is the one with the smaller n(reagent) ÷ coefficient.',
    explanation: `n = m / M, so n(${nameA}) = a/${mwA} and n(${nameB}) = b/${mwB}. Equivalents of B per A = n(B)/n(A)${stoichB === 2 ? ' (the reaction needs 2 equivalents of ' + nameB + ' per ' + nameA + ', so compare n(B)/2 with n(A))' : ''}. The reagent that gives the smaller number of reaction units is limiting and sets the maximum product.`,
    sampled: { a: range(ra[0], ra[1], ra[2], dpa), b: range(rb[0], rb[1], rb[2], dpb) },
    derived: { nA: `a / ${mwA} * 1000`, nB: `b / ${mwB} * 1000`, eq: 'nB / nA', lim: `nB / ${stoichB} < nA ? '${nameB}' : '${nameA}'`, prod: `min(nA, nB / ${stoichB})`, prodWrong: 'min(nA, nB)' },
    fields: [
      num('nA', `Amount of ${nameA}`, 'mmol', 'nA', { relTol: 0.02, sig: 3 }),
      num('nB', `Amount of ${nameB}`, 'mmol', 'nB', { relTol: 0.02, sig: 3 }),
      num('eq', `Equivalents of ${nameB} per ${nameA}`, 'equiv', 'eq', { relTol: 0.03, sig: 3, paths: [{ label: `You inverted the ratio (${nameA} per ${nameB}).`, expr: 'nA / nB' }], ecf: [{ expr: 'u_nB / u_nA', label: 'Consistent with your own two amounts.' }] }),
      kw('lim', 'Limiting reagent', [nameA, nameB], 'lim', { synonyms: { [nameA]: [nameA.toLowerCase()], [nameB]: [nameB.toLowerCase()] } }),
      num('prod', 'Maximum product', 'mmol', 'prod', { relTol: 0.03, sig: 3, paths: stoichB === 2 ? [{ label: 'You ignored the 2:1 stoichiometry when choosing the limiting reagent.', expr: 'prodWrong' }] : undefined, ecf: [{ expr: `min(u_nA, u_nB / ${stoichB})`, label: 'Consistent with your own two amounts.' }] }),
    ],
  });
  const variants = [
    pair({ id: 'eq-1b-tscl', label: '1B: phenol and tosyl chloride (TsCl limiting)', expt: 'Expt 1B', nameA: 'phenol', nameB: 'tosyl chloride', mwA: 94.11, mwB: 190.65, ra: [1.00, 1.10, 0.01], rb: [1.50, 1.70, 0.01], dpa: 2, dpb: 2 }),
    pair({ id: 'eq-1b-phenol', label: '1B: phenol and tosyl chloride (phenol limiting)', expt: 'Expt 1B', nameA: 'phenol', nameB: 'tosyl chloride', mwA: 94.11, mwB: 190.65, ra: [0.70, 0.80, 0.01], rb: [1.90, 2.10, 0.01], dpa: 2, dpb: 2 }),
    pair({ id: 'eq-1e-ts', label: '1E: dimethoxytetrahydrofuran and tosylamide (tosylamide limiting)', expt: 'Expt 1E', nameA: 'dimethoxytetrahydrofuran', nameB: 'tosylamide', mwA: 132.16, mwB: 171.22, ra: [0.90, 1.10, 0.01], rb: [1.00, 1.10, 0.01], dpa: 2, dpb: 2 }),
    pair({ id: 'eq-9-mg', label: '9: magnesium and bromobenzene (Mg limiting)', expt: 'Expt 9', nameA: 'magnesium', nameB: 'bromobenzene', mwA: 24.31, mwB: 157.01, ra: [0.480, 0.520, 0.005], rb: [3.30, 3.60, 0.05], dpa: 3, dpb: 2 }),
    pair({ id: 'eq-9-phbr', label: '9: magnesium and bromobenzene (bromobenzene limiting)', expt: 'Expt 9', nameA: 'magnesium', nameB: 'bromobenzene', mwA: 24.31, mwB: 157.01, ra: [0.500, 0.540, 0.005], rb: [2.90, 3.10, 0.05], dpa: 3, dpb: 2 }),
    pair({ id: 'eq-1c-acetone', label: '1C: benzaldehyde and acetone, 2:1 (benzaldehyde limiting)', expt: 'Expt 1C', nameA: 'acetone', nameB: 'benzaldehyde', mwA: 58.08, mwB: 106.12, ra: [0.52, 0.58, 0.01], rb: [1.60, 1.75, 0.01], dpa: 2, dpb: 2, stoichB: 2 }),
    pair({ id: 'eq-1c-acetone2', label: '1C: benzaldehyde and acetone, 2:1 (acetone limiting)', expt: 'Expt 1C', nameA: 'acetone', nameB: 'benzaldehyde', mwA: 58.08, mwB: 106.12, ra: [0.40, 0.45, 0.01], rb: [1.80, 1.90, 0.01], dpa: 2, dpb: 2, stoichB: 2 }),
  ];
  // equivalents of a liquid reagent or solvent given by volume (needs the density)
  variants.push(calc({
    id: 'eq-1e-acoh', label: '1E: equivalents of acetic acid', marks: 3,
    stem: 'In Expt 1E, tosylamide ({{fix(a,2)}} g, M = 171.22 g mol⁻¹) is heated in {{fix(v,1)}} mL of glacial acetic acid (density 1.05 g mL⁻¹, M = 60.05 g mol⁻¹). How many equivalents of acetic acid per tosylamide is that?',
    hint: 'Convert the volume to mass with the density, then to moles, then divide by moles of tosylamide.',
    explanation: 'n(AcOH) = V × d / M. Comparing with n(tosylamide) shows the "solvent" is a large excess (about 15 equivalents), which is why it works as solvent and acid catalyst at once.',
    sampled: { a: range(0.95, 1.10, 0.01, 2), v: range(4.5, 5.5, 0.1, 1) },
    derived: { nA: 'a / 171.22 * 1000', nAc: 'v * 1.05 / 60.05 * 1000', eq: 'nAc / nA', eqNoD: 'v / 60.05 * 1000 / nA' },
    fields: [
      num('nAc', 'Acetic acid', 'mmol', 'nAc', { relTol: 0.02, sig: 3, paths: [{ label: 'You used the volume as if it were the mass (no density).', expr: 'v / 60.05 * 1000' }] }),
      num('eq', 'Equivalents of acetic acid', 'equiv', 'eq', { relTol: 0.03, sig: 3, paths: [{ label: 'You left out the density when converting mL to g.', expr: 'eqNoD' }], ecf: [{ expr: 'u_nAc / (a / 171.22 * 1000)', label: 'Consistent with your own acetic acid amount.' }] }),
    ],
  }));
  variants.push(calc({
    id: 'eq-5b-hno3', label: '5B: equivalents of nitric acid (70%)', marks: 4,
    stem: 'In Expt 5B, 1,2-dimethoxybenzene ({{fix(a,3)}} g, M = 138.17 g mol⁻¹) is added to {{fix(v,0)}} mL of 70% (w/w) nitric acid (density 1.41 g mL⁻¹, M = 63.01 g mol⁻¹). How many equivalents of HNO₃ are present per mole of substrate, and how many does the product need (two nitro groups)?',
    hint: 'Mass of solution = V × d; mass of HNO₃ = 0.70 × that; then moles.',
    explanation: 'n(HNO₃) = V × d × 0.70 / M. The ratio to substrate is large (about 18 equivalents) against the 2 needed, which is why this procedure drives the second nitration.',
    sampled: { a: range(0.800, 0.880, 0.005, 3), v: range(6, 8, 1, 0) },
    derived: { nS: 'a / 138.17 * 1000', nH: 'v * 1.41 * 0.70 / 63.01 * 1000', eq: 'nH / nS', eqPure: 'v * 1.41 / 63.01 * 1000 / nS' },
    fields: [
      num('eq', 'Equivalents of HNO₃ present', 'equiv', 'eq', { relTol: 0.03, sig: 3, paths: [{ label: 'You treated the solution as pure nitric acid (ignored the 70%).', expr: 'eqPure' }] }),
      num('need', 'Equivalents the reaction needs', 'equiv', '2', { relTol: 0.001, sig: 1 }),
    ],
  }));
  add(mk('bk-c61-g-equiv', 'Moles, equivalents and the limiting reagent', 'calc-mass', ['equivalents', 'limiting-reagent'], SRC, variants, { family: 'calc-equivalents', exam: 'construct_4to6', mins: 5 }),
    { id: 'g.equiv', name: 'Moles, equivalents and the limiting reagent', chunk: 'calc-mass' });
}

/* ---------- theoretical and percentage yield ---------- */
{
  const Y = [
    { id: '1a', name: 'paracetamol', expt: '1A', lim: '4-aminophenol (1.1 g, M = 109.13)', n: '1.10 / 109.13 * 1000', other: '1.2 * 1.08 / 102.09 * 1000', M: 151.16, act: [0.90, 1.40, 0.01], note: 'Acetic anhydride (1.2 mL, d 1.08, M = 102.09) is in slight excess, so 4-aminophenol limits.' },
    { id: '5d', name: '2-iodobenzoic acid', expt: '5D', lim: 'anthranilic acid (3.42 g, M = 137.14)', n: '3.42 / 137.14 * 1000', other: '4.25 / 166.00 * 1000', M: 248.02, act: [3.80, 5.60, 0.01], note: 'Potassium iodide (4.25 g, M = 166.00) and sodium nitrite (1.8 g, M = 69.00) are each in slight excess, so anthranilic acid limits.' },
    { id: '9', name: 'benzoic acid', expt: '9', lim: 'magnesium (500 mg, M = 24.31)', n: '0.500 / 24.31 * 1000', other: '3.3 / 157.01 * 1000', M: 122.12, act: [1.20, 2.20, 0.01], note: 'Bromobenzene (3.3 g, M = 157.01) is in very slight excess, so magnesium limits.' },
    { id: '5a', name: 'methyl 3-nitrobenzoate', expt: '5A', lim: 'methyl benzoate (1.00 g, M = 136.15)', n: '1.00 / 136.15 * 1000', other: '0.65 * 1.41 * 0.70 / 63.01 * 1000', M: 181.15, act: [0.80, 1.20, 0.01], note: 'Nitric acid (about 0.65 mL of 70%, d 1.41) is in excess, so the ester limits.' },
    { id: '7', name: 'acetylferrocene', expt: '7', lim: 'ferrocene (465 mg, M = 186.04)', n: '0.465 / 186.04 * 1000', other: '1.75 * 1.08 / 102.09 * 1000', M: 228.07, act: [0.15, 0.45, 0.01], note: 'Acetic anhydride (1.75 mL, d 1.08, M = 102.09) is in large excess, so ferrocene limits.' },
  ].map((y) => calc({
    id: `yield-${y.id}`, label: `${y.expt}: ${y.name}`, marks: 4,
    stem: `Expt ${y.expt} starts from ${y.lim}. ${y.note} You isolate {{fix(act,2)}} g of ${y.name} (M = ${y.M} g mol⁻¹). Give the amount of limiting reagent, the theoretical yield and the percentage yield (whole percent).`,
    hint: 'theoretical mass = n(limiting) × M(product) for a 1:1 reaction; % yield = actual ÷ theoretical × 100.',
    explanation: `The limiting reagent sets the theoretical yield: n × M(product). % yield = actual ÷ theoretical × 100, quoted as a whole percentage (accuracy table). Using the reagent in excess gives a theoretical yield that is too high and a percentage that is too low.`,
    sampled: { act: range(y.act[0], y.act[1], y.act[2], 2) },
    derived: { n: y.n, th: `n * ${y.M} / 1000`, pc: 'act / th * 100', nOther: y.other, pcWrong: `act / (nOther * ${y.M} / 1000) * 100` },
    fields: [
      num('n', 'Limiting reagent', 'mmol', 'n', { relTol: 0.02, sig: 3 }),
      num('th', 'Theoretical yield', 'g', 'th', { relTol: 0.02, sig: 3, ecf: [{ expr: 'u_n * ' + y.M + ' / 1000', label: 'Consistent with your own amount of limiting reagent.' }] }),
      num('pc', 'Percentage yield', '%', 'pc', { relTol: 0.02, tol: 1, sig: 2, paths: [{ label: 'You based the theoretical yield on the reagent in excess instead of the limiting one.', expr: 'pcWrong' }], ecf: [{ expr: `act / (u_th) * 100`, label: 'Consistent with your own theoretical yield.' }] }),
    ],
  }));
  add(mk('bk-c61-g-yield', 'Theoretical and percentage yield', 'calc-mass', ['yield'], SRC, Y, { family: 'calc-yield', exam: 'construct_4to6', mins: 5 }),
    { id: 'g.yield', name: 'Theoretical and percentage yield', chunk: 'calc-mass' });
}

/* ---------- specific rotation (and ee, beyond the manual) ---------- */
{
  const variants = [
    calc({
      id: 'alpha-6', label: '6: [α]D of the reduced ester', marks: 4,
      stem: 'You weigh {{fix(m,0)}} mg of the product of Expt 6 into a {{fix(V,0)}} mL volumetric flask and make up to the mark with CH₂Cl₂. In a 1.00 dm cell the observed rotation at 20 °C (sodium D line) is α = {{fix(al,2)}}°. Calculate the concentration (g mL⁻¹) and the specific rotation [α]D, to the accuracy the course asks for.',
      hint: '[α] = α ÷ (l × c), with l in dm and c in g mL⁻¹.',
      explanation: 'c = m(g) ÷ V(mL). [α]D = α / (l c), l in decimetres and c in g mL⁻¹ (manual p.42). The result is quoted to one decimal place with temperature, wavelength, solvent and concentration.',
      sampled: { m: range(55, 95, 5, 0), V: choice([5, 10]), al: range(0.20, 0.95, 0.05, 2) },
      derived: { c: 'm / 1000 / V', a: 'al / (1.00 * c)', aCm: 'al / (10 * c)', aPct: 'al / (1.00 * c * 100)' },
      fields: [
        num('c', 'Concentration', 'g mL⁻¹', 'c', { relTol: 0.02, sig: 3 }),
        num('a', '[α]D', '°', 'a', { relTol: 0.02, sig: 3, paths: [{ label: 'You used the cell length in cm (10 cm) instead of dm.', expr: 'aCm' }, { label: 'You used c in g per 100 mL.', expr: 'aPct' }], ecf: [{ expr: 'al / (1.00 * u_c)', label: 'Consistent with your own concentration.' }] }),
      ],
    }),
    calc({
      id: 'alpha-zero', label: 'Racemate or not?', marks: 3,
      stem: 'Two samples of ethyl 3-hydroxybutanoate (each 80 mg in 10 mL CH₂Cl₂, 1.00 dm cell) give observed rotations of {{fix(a1,2)}}° (yeast product) and {{fix(a2,2)}}° (NaBH₄ product). Calculate the two specific rotations and say which sample is racemic.',
      hint: '[α] = α ÷ (l × c); a racemate has no net rotation.',
      explanation: 'c = 0.080 g / 10 mL = 0.0080 g mL⁻¹. [α] = α / (1.00 × 0.0080). The NaBH₄ product is racemic (rotation near zero within error); the yeast product is enriched in one enantiomer (a clear rotation).',
      sampled: { a1: range(0.30, 0.34, 0.01, 2), a2: range(0.00, 0.02, 0.01, 2) },
      derived: { s1: 'a1 / (1.00 * 0.0080)', s2: 'a2 / (1.00 * 0.0080)', rac: "abs(s2) < abs(s1) ? 'NaBH4' : 'yeast'" },
      fields: [
        num('s1', '[α]D of the yeast product', '°', 's1', { relTol: 0.03, sig: 3 }),
        num('s2', '[α]D of the NaBH₄ product', '°', 's2', { relTol: 0.05, tol: 0.2, sig: 2 }),
        kw('rac', 'Racemic product', ['yeast', 'NaBH4'], 'rac', { synonyms: { yeast: ['yeast', 'baker', 'biotransformation'], NaBH4: ['nabh4', 'borohydride', 'sodium borohydride'] } }),
      ],
    }),
    calc({
      id: 'alpha-ee', label: 'Enantiomeric excess (beyond the manual)', marks: 3,
      stem: '**Beyond the manual.** A pure enantiomer has [α]D = +43.0°. Your product has [α]D = {{fix(obs,1)}}° under the same conditions. Calculate the enantiomeric excess (ee, whole percent) and the percentage of the major enantiomer in the mixture.',
      hint: 'ee = [α]obs ÷ [α]pure × 100; major enantiomer = (100 + ee) ÷ 2 %.',
      explanation: 'ee = [α]obs / [α]max × 100 (assuming a linear relation). A product with ee = 60% is 80% major and 20% minor enantiomer: major = (100 + ee)/2. This formula is not in the CM2061 manual, which only asks whether a product is racemic or not.',
      sampled: { obs: range(10.0, 40.0, 0.5, 1) },
      derived: { ee: 'obs / 43.0 * 100', maj: '(100 + ee) / 2', majWrong: 'ee' },
      fields: [
        num('ee', 'ee', '%', 'ee', { relTol: 0.02, tol: 1, sig: 2 }),
        num('maj', 'Major enantiomer', '%', 'maj', { relTol: 0.02, tol: 1, sig: 2, paths: [{ label: 'You reported the ee as the percentage of the major enantiomer.', expr: 'majWrong' }] }),
      ],
    }),
  ];
  add(mk('bk-c61-g-alpha', 'Specific rotation, racemic or not, and ee', 'calc-spec', ['polarimetry'], 'Manual pp.40, 42; ee is beyond the manual', variants, { family: 'calc-alpha' }),
    { id: 'g.alpha', name: 'Specific rotation (and ee)', chunk: 'calc-spec' });
}

/* ---------- spin-only magnetic moment and unpaired electrons ---------- */
{
  const mu = calc({
    id: 'mu-from-n', label: 'μ(spin-only) from n', marks: 2,
    stem: 'A complex has {{fix(n,0)}} unpaired electrons. Calculate the spin-only magnetic moment in Bohr magnetons, to the accuracy the course asks for (2 decimal places).',
    hint: 'μ = √[n(n + 2)].',
    explanation: 'μ(spin-only) = √[n(n+2)] BM, so n = 1, 2, 3, 4, 5 give 1.73, 2.83, 3.87, 4.90, 5.92. It ignores orbital contributions. *(Beyond the manual: the manual only mentions measuring susceptibility; the formula is from the CM2021 magnetism lectures.)*',
    sampled: { n: range(1, 5, 1, 0) },
    derived: { m: 'sqrt(n * (n + 2))', mWrong: 'n', mWrong2: 'n * (n + 2)' },
    fields: [num('m', 'μ(spin-only)', 'BM', 'm', { relTol: 0.01, tol: 0.01, sig: 3, paths: [{ label: 'You gave n itself as the moment.', expr: 'mWrong' }, { label: 'You forgot the square root.', expr: 'mWrong2' }] })],
  });
  const nfrom = calc({
    id: 'n-from-mu', label: 'n from a measured μeff', marks: 2,
    stem: 'A magnetic susceptibility measurement gives an effective magnetic moment μeff = {{fix(mu,2)}} BM for a metal complex. How many unpaired electrons does it have, assuming spin-only behaviour?',
    hint: 'Solve μ² = n(n + 2) for n and round to a whole number.',
    explanation: 'μ² = n(n + 2) gives n = √(1 + μ²) − 1, rounded to the nearest whole number of unpaired electrons. *(Beyond the manual: formula from the CM2021 magnetism lectures.)*',
    sampled: { mu: choice([1.70, 1.75, 1.78, 2.80, 2.85, 2.90, 3.85, 3.90, 3.95, 4.85, 4.90, 5.00, 5.90, 5.95, 6.00]) },
    derived: { n: 'round(sqrt(1 + mu * mu) - 1, 0)', nWrong: 'round(mu, 0)' },
    fields: [num('n', 'Unpaired electrons', '', 'n', { relTol: 0.001, tol: 0.001, sig: 1, paths: [{ label: 'You took the moment itself as the number of electrons.', expr: 'nWrong' }] })],
  });
  add(mk('bk-c61-g-mu', 'Spin-only magnetic moment and unpaired electrons', 'calc-spec', ['magnetic-moment'], 'Manual p.4 (susceptibility mentioned), p.14 (2 d.p.); formula from CM2021 (beyond the manual)', [mu, nfrom], { family: 'calc-mu' }),
    { id: 'g.mu', name: 'Spin-only moment and unpaired electrons', chunk: 'calc-spec' });
}

/* ---------- NaBH4 hydride equivalents ---------- */
{
  const variants = [0.5, 0.4, 0.3].map((eqv, i) => calc({
    id: `hydride-${i + 1}`, label: `${eqv} equivalents of NaBH₄`, marks: 4,
    stem: `Expt 6 reduces ethyl acetoacetate ({{fix(a,2)}} g, M = 130.14 g mol⁻¹) with ${eqv} equivalents of sodium borohydride (M = 37.83 g mol⁻¹). Calculate the amount of substrate, the mass of NaBH₄ to weigh, and the number of hydride equivalents available per ketone (each BH₄⁻ has four hydrides).`,
    hint: 'n(NaBH₄) = equiv × n(substrate); hydrides = 4 × n(NaBH₄).',
    explanation: `n(NaBH₄) = ${eqv} × n(substrate); mass = n × 37.83. Each NaBH₄ carries four B-H bonds, so ${eqv} equivalents provide ${4 * eqv} equivalents of hydride per ketone, which is why a sub-stoichiometric amount of NaBH₄ is enough. In practice some hydride is lost to the ethanol (effervescence), so an excess of hydride over the one needed per ketone is used.`,
    sampled: { a: range(1.30, 1.70, 0.05, 2) },
    derived: { nS: 'a / 130.14 * 1000', nB: `${eqv} * nS`, mB: 'nB * 37.83', hyd: `${eqv} * 4`, hydWrong: `${eqv}` },
    fields: [
      num('nS', 'Substrate', 'mmol', 'nS', { relTol: 0.02, sig: 3 }),
      num('mB', 'Mass of NaBH₄', 'mg', 'mB', { relTol: 0.03, sig: 3, ecf: [{ expr: `${eqv} * u_nS * 37.83`, label: 'Consistent with your own amount of substrate.' }] }),
      num('hyd', 'Hydride equivalents per ketone', 'equiv', 'hyd', { relTol: 0.01, sig: 2, paths: [{ label: 'You counted one hydride per NaBH₄ (each carries four).', expr: 'hydWrong' }] }),
    ],
  }));
  add(mk('bk-c61-g-hydride', 'Sodium borohydride: mass and hydride equivalents', 'calc-mass', ['hydride', 'NaBH4'], 'Manual p.41; M(NaBH4) from databook', variants, { family: 'calc-hydride', exam: 'construct_4to6', mins: 4 }),
    { id: 'g.hydride', name: 'NaBH₄ mass and hydride equivalents', chunk: 'calc-mass' });
}

/* ---------- Hz and ppm, integrals, Rf ---------- */
{
  const variants = [
    calc({
      id: 'hz-ppm', label: 'J in ppm and Hz at two fields', marks: 3,
      stem: 'A doublet has lines {{fix(J,1)}} Hz apart. How far apart (in δ, to 3 decimal places) are the lines on a 300 MHz and on a 500 MHz spectrometer? What is the coupling constant on each?',
      hint: 'Δδ (ppm) = Δν (Hz) ÷ spectrometer frequency (MHz). J is a property of the molecule.',
      explanation: 'Divide the separation in Hz by the frequency in MHz to get ppm: the lines are 0.023 ppm apart at 300 MHz but only 0.014 ppm at 500 MHz for J = 7 Hz. J stays the same in Hz on both machines; the signals of different protons are what spread further apart (in Hz) at the higher field.',
      sampled: { J: range(6.0, 9.0, 0.5, 1) },
      derived: { d3: 'J / 300', d5: 'J / 500', dWrong: 'J * 300' },
      fields: [
        num('d3', 'Separation at 300 MHz', 'ppm', 'd3', { relTol: 0.02, sig: 2, paths: [{ label: 'You multiplied by the frequency instead of dividing.', expr: 'dWrong' }] }),
        num('d5', 'Separation at 500 MHz', 'ppm', 'd5', { relTol: 0.02, sig: 2 }),
        num('jj', 'J at 500 MHz', 'Hz', 'J', { relTol: 0.01, sig: 2 }),
      ],
    }),
    calc({
      id: 'integral-mix', label: 'Mole ratio of a mixture from integrals', marks: 3,
      stem: 'A ¹H NMR spectrum of a mixture of methyl 3-nitrobenzoate (OCH₃ singlet, 3 H per molecule) and its isomer methyl 2-nitrobenzoate (OCH₃ singlet, 3 H per molecule) shows the two OCH₃ singlets with integrals {{fix(i1,2)}} and {{fix(i2,2)}}. What is the mole ratio of the 3- to the 2-isomer, and what percentage of the mixture is the 3-isomer?',
      hint: 'Divide each integral by the number of protons it represents; then take the ratio.',
      explanation: 'Each integral is proportional to (moles of compound × number of H giving that signal). Both signals are 3 H, so the ratio of integrals is the mole ratio. With signals of different proton counts, divide by the count first (manual p.22 footnote 10).',
      sampled: { i1: range(2.5, 3.0, 0.05, 2), i2: range(0.10, 0.40, 0.05, 2) },
      derived: { r: 'i1 / i2', p: 'i1 / (i1 + i2) * 100' },
      fields: [
        num('r', 'Mole ratio 3-isomer : 2-isomer', '', 'r', { relTol: 0.03, sig: 3 }),
        num('p', '% of the 3-isomer', '%', 'p', { relTol: 0.02, tol: 1, sig: 2 }),
      ],
    }),
    calc({
      id: 'integral-diff', label: 'Mole ratio when the protons differ', marks: 3,
      stem: 'A mixture of toluene (CH₃ singlet, 3 H) and dichloromethane (CH₂ singlet, 2 H) shows integrals of {{fix(i1,2)}} for the CH₃ and {{fix(i2,2)}} for the CH₂. What is the mole ratio toluene : dichloromethane?',
      hint: 'Divide each integral by the number of protons it represents.',
      explanation: 'Moles are proportional to integral ÷ number of protons. Comparing raw integrals ignores that CH₃ has 3 H and CH₂ has 2 (manual p.22 footnote 10).',
      sampled: { i1: range(3.0, 6.0, 0.25, 2), i2: range(1.0, 3.0, 0.25, 2) },
      derived: { r: '(i1 / 3) / (i2 / 2)', rWrong: 'i1 / i2' },
      fields: [num('r', 'toluene : dichloromethane', '', 'r', { relTol: 0.03, sig: 3, paths: [{ label: 'You compared the raw integrals without dividing by the number of protons.', expr: 'rWrong' }] })],
    }),
    calc({
      id: 'rf', label: 'Rf from distances', marks: 2,
      stem: 'On a TLC plate the solvent front travelled {{fix(f,1)}} cm from the baseline. Ferrocene moved {{fix(a,1)}} cm and acetylferrocene {{fix(b,1)}} cm. Calculate both Rf values to 2 decimal places and say which compound is more polar.',
      hint: 'Rf = distance moved by the spot ÷ distance moved by the solvent front.',
      explanation: 'Rf = d(spot) / d(front), a number between 0 and 1 given to two decimal places. The compound with the lower Rf is held more strongly by the silica, so it is the more polar one (acetylferrocene).',
      sampled: { f: range(5.0, 6.0, 0.1, 1), a: range(3.8, 4.6, 0.1, 1), b: range(1.4, 2.2, 0.1, 1) },
      derived: { ra: 'a / f', rb: 'b / f', rbWrong: 'f / b', pol: "rb < ra ? 'acetylferrocene' : 'ferrocene'" },
      fields: [
        num('ra', 'Rf of ferrocene', '', 'ra', { relTol: 0.02, tol: 0.01, sig: 2 }),
        num('rb', 'Rf of acetylferrocene', '', 'rb', { relTol: 0.02, tol: 0.01, sig: 2, paths: [{ label: 'You divided the front by the spot distance (inverted Rf).', expr: 'rbWrong' }] }),
        kw('pol', 'More polar compound', ['ferrocene', 'acetylferrocene'], 'pol', { synonyms: { ferrocene: ['ferrocene'], acetylferrocene: ['acetylferrocene', 'acetyl ferrocene'] } }),
      ],
    }),
  ];
  add(mk('bk-c61-g-spec', 'Hz and ppm, integrals and Rf', 'calc-spec', ['nmr', 'tlc'], 'Manual pp.17, 20-22 and footnote 10, 24', variants, { family: 'calc-spec' }),
    { id: 'g.nmrnum', name: 'Hz and ppm, integrals and Rf values', chunk: 'calc-spec' });
}

export default out;
