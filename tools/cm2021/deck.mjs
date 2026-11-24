/* Questions written from the finals revision deck (Revision_for_final_exam.pdf, slides 2-43) to close the gaps listed in
   docs/cm2021-finals/revision-deck-ledger.md section 5. Each variant carries `sourceSlide`. Answers are computed or checked by
   tests/deck-items.test.mjs independently of this file (charge balance, mu = 2.828 sqrt(chi T), CFSE tables, A/E/T occupation rule).
   Run: node tools/cm2021/deck.mjs   — rewrites the bk-c6-ox-organo, bk-c6-oxo-chain, bk-c8-magnetism-chain, bk-c7-oh-td-ratio,
   bk-c8-term-concepts, bk-c8-intensity, bk-c7-jt-more, bk-c7-geom-orbitals and bk-c7-lig-bond nodes and their skill links. */
import fs from 'node:fs';

const DIR = 'public/content';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const L = 'abcdefghij';
const num = (expr, tol = 0.01) => ({ type: 'numeric', targetExpr: String(expr), tolerance: tol });
const kw = (answer, synonyms) => ({ type: 'keyword', expectedExpr: `'${answer}'`, synonyms });
const field = (key, label, options) => ({ key, label, ...(options ? { options } : {}) });
const base = (id, label, marks, stem, explanation, sourceSlide, hint) => ({ variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation, sourceSlide });

const mapped = (b, fields, targets) => ({ ...b, inputSlot: { type: 'mapped_fields', layout: 'table', fields }, evaluator: { type: 'mapped_fields_match', targets } });
const mc = (id, label, stem, opts, key, explanation, slide, marks = 1, hint) => ({
  ...base(id, label, marks, stem, explanation, slide, hint),
  inputSlot: { type: 'choice', selectionMode: 'single', options: opts.map((o, i) => ({ id: L[i], label: o })), shuffleOptions: true },
  evaluator: { type: 'choice_match', targetIds: [L[key]], gradingMode: 'exact' },
});
const rubricV = (id, label, stem, rubric, explanation, slide, hint) => ({
  ...base(id, label, rubric.reduce((a, [, m]) => a + m, 0), stem, explanation, slide, hint),
  inputSlot: { type: 'typed_synthesis', placeholder: 'Write the key points (or tick the box if you answered on paper)…', minWordsToUnlockRubric: 12, allowPaperScratchpad: true },
  evaluator: { type: 'atomic_rubric', rubric: rubric.map(([criterion, marks, isCritical], i) => ({ id: `r${i + 1}`, criterion, marks, isCritical: Boolean(isCritical) })) },
});
const node = (id, title, source, week, theme, tags, est, family, variants) => ({
  schemaVersion: '3.0', id, moduleCode: 'CM2021', tier: 'synthesis',
  metadata: { title, source, week, primaryTheme: theme, conceptTags: tags, difficultyEstimate: 5, estimatedMinutes: est, examStyle: 'construct_4to6', family },
  variants,
});
const dn = (n) => (n === 10 ? 'd¹⁰' : `d${SUP[n]}`);

/* ---------- 1. oxidation states of drawn organometallic and bridged complexes (slides 5-6) ---------- */
const oxo = (id, label, stem, ox, d, why, slide) => mapped(base(id, label, 3, stem, why, slide,
  'Add up the ligand charges (neutral ligands 0, alkyl −1, bridging hydroxide or amide −1 each, chloride −1), then make the total equal the charge on the complex. A metal–metal bond contributes nothing.'),
  [field('ox', 'Oxidation state of each metal'), field('d', 'n in dⁿ for that metal')],
  { ox: num(ox), d: num(d) });
const organo = node('bk-c6-ox-organo', 'Oxidation state of drawn organometallic and bridged complexes', 'Finals revision deck slides 5-6 (Ni dimer, Co alkyl, bridged Co dimer) and transfer cases', 7, 'Coordination Chemistry', ['oxidation-state-complex', 'd-electron-count'], 3, 'ox-organo', [
  oxo('c6-ox-organo-ni2', 'Ni₂Cl₂(PPh₃)₂ (bridging chlorides, Ni–Ni bond)',
    'Two nickel atoms are joined by a Ni–Ni bond. Each carries one PPh₃ (a neutral donor, drawn as an arrow) and the two chlorides each bridge both nickels. The molecule is neutral: Ni₂(μ-Cl)₂(PPh₃)₂. Give the oxidation state of each nickel and its dⁿ.',
    1, 9, 'Two bridging Cl⁻ give −2 in total, PPh₃ is neutral and the Ni–Ni bond adds nothing, so the two Ni share +2: each is Ni(I), d⁹ (3d¹⁰ minus one electron).', 's6'),
  oxo('c6-ox-organo-conorb', 'Co(1-norbornyl)₄',
    'Cobalt carries four 1-norbornyl groups (bicyclic alkyl groups bound through carbon, each counted as R⁻) in a neutral molecule, Co(C₇H₁₁)₄. Give the oxidation state of cobalt and its dⁿ.',
    4, 5, 'Each alkyl group is R⁻ (−1), four of them give −4, the molecule is neutral, so cobalt is +4: Co(IV), d⁵.', 's6'),
  oxo('c6-ox-organo-codimer', '[(NH₃)₄Co(μ-OH)(μ-NH₂)Co(NH₃)₄]⁴⁺',
    'Two cobalt centres are bridged by one hydroxide and one amide (NH₂⁻) and each carries four NH₃: [(NH₃)₄Co(μ-OH)(μ-NH₂)Co(NH₃)₄]⁴⁺. Give the oxidation state of each cobalt and its dⁿ.',
    3, 6, 'NH₃ is neutral, the bridging OH⁻ and NH₂⁻ give −2 in total, the complex is 4+, so the two Co share +6: each is Co(III), d⁶.', 's6'),
  oxo('c6-ox-organo-mn2co10', 'Mn₂(CO)₁₀ (Mn–Mn bond)',
    'Mn₂(CO)₁₀ is a neutral molecule with a Mn–Mn bond and ten terminal CO ligands. Give the oxidation state of each manganese and its dⁿ.',
    0, 7, 'CO is neutral and the Mn–Mn bond adds nothing, so each Mn is 0: Mn(0), d⁷ (the neutral atom is 3d⁵4s²).', 's6'),
  oxo('c6-ox-organo-ptpcy3', 'Pt(PCy₃)₃',
    'The neutral complex Pt(PCy₃)₃ has three tricyclohexylphosphine ligands (neutral donors). Give the oxidation state of platinum and its dⁿ.',
    0, 10, 'Phosphines are neutral, the complex is neutral, so Pt(0): d¹⁰ (5d⁹6s¹ for the atom, 6s electron moved into d).', 's4'),
  oxo('c6-ox-organo-zeise', 'K[PtCl₃(C₂H₄)] (Zeise\'s salt)',
    'K[PtCl₃(C₂H₄)] contains the anion [PtCl₃(C₂H₄)]⁻ with three chloride ligands and one neutral ethene. Give the oxidation state of platinum and its dⁿ.',
    2, 8, 'Three Cl⁻ give −3, ethene is neutral and the anion is 1−, so Pt is +2: Pt(II), d⁸.', 's5'),
  oxo('c6-ox-organo-cr2oh', '[(NH₃)₅Cr–(μ-OH)–Cr(NH₃)₅]⁵⁺',
    'Two chromium centres are bridged by a single hydroxide and each carries five NH₃: [(NH₃)₅Cr(μ-OH)Cr(NH₃)₅]⁵⁺. Give the oxidation state of each chromium and its dⁿ.',
    3, 3, 'Ten NH₃ are neutral, the bridging OH⁻ is −1, the ion is 5+, so the two Cr share +6: each is Cr(III), d³.', 's6'),
  oxo('c6-ox-organo-fecoh5', 'Fe(CO)₅',
    'Fe(CO)₅ is a neutral molecule with five carbonyl ligands. Give the oxidation state of iron and its dⁿ.',
    0, 8, 'CO is neutral, so Fe(0): d⁸ (3d⁶4s² for the atom, the 4s electrons promoted into d in the complex).', 's6'),
]);

/* ---------- 2. oxo-anion chains (slides 4, 10, 15, 22, 43) ---------- */
const NAMEPAT = { t2: 't\\s*_?\\s*[2₂]', e: 'e' };
const confOxo = (n) => {
  if (n === 0) return { disp: 'none (d⁰)', pats: ['^\\s*(?:none|empty|no\\s+d[\\s-]*electrons?|d\\s*\\^?\\s*[0⁰]|0)\\s*(?:\\([^)]*\\))?\\s*\\.?\\s*$'] };
  return { disp: `e${SUP[n]}`, pats: [`^\\s*\\(?\\s*e\\s*\\)?\\s*\\^?\\s*[${n}${SUP[n]}](?:\\s*[,·]?\\s*\\(?\\s*${NAMEPAT.t2}\\s*\\)?\\s*\\^?\\s*[0⁰])?\\s*(?:\\([^)]*\\))?\\s*\\.?\\s*$`] };
};
const oxoPat = (cation, stem, roman, n, trivial) => {
  const rom = `(?:${roman}|${n})`;
  const full = `${cation}\\s+tetra(?:oxo|oxido)${stem}e\\s*\\(\\s*${rom}\\s*\\)`;
  const triv = trivial ? `|${trivial}` : '';
  return `^\\s*(?:${full}${triv})\\s*$`;
};
const oxoChain = (id, formula, cation, metal, stemName, roman, ox, d, nameDisp, trivial, why) => {
  const conf = confOxo(d);
  return mapped(base(id, `${formula} (${dn(d)}, tetrahedral)`, 5,
    `For **\`${formula}\`**: give its name, the oxidation state of ${metal}, its dⁿ count, the d-electron configuration in the tetrahedral field of the four oxide donors, and the CFSE as a multiple of Δt.`,
    why, 's4, s10, s22',
    'Name oxide ligands as oxo (slide 10), the metal ends in -ate in an anion (slide 15) and the cation is named first. Tetrahedral: e lies below t₂ (slide 22); each electron in e is worth −0.6 Δt, in t₂ +0.4 Δt.'),
    [field('name', 'Name'), field('ox', `Oxidation state of ${metal}`), field('d', 'n in dⁿ'), field('conf', 'Configuration'), field('c', 'CFSE (coefficient of Δt)')],
    {
      name: { type: 'pattern', caseSensitive: false, acceptedPatterns: [oxoPat(cation, stemName, roman, ox, trivial)], expectedDisplay: nameDisp },
      ox: num(ox), d: num(d),
      conf: { acceptedPatterns: conf.pats, caseSensitive: false, expectedDisplay: conf.disp },
      c: num((0.6 * d).toFixed(1)),
    });
};
const oxochain = node('bk-c6-oxo-chain', 'Name → oxidation state → dⁿ → tetrahedral configuration → CFSE for oxo-anions', 'Finals revision deck slides 4, 10, 15, 22, 43 (KMnO₄ and oxo ligand) and the 2025-26 final Q3(a) template', 7, 'Crystal Field Theory', ['cfse-calculation', 'oxidation-state-complex', 'iupac-nomenclature'], 4, 'oxo-chain', [
  oxoChain('c6-oxo-chain-mno4', 'KMnO₄', 'potassium', 'Mn', 'manganat', 'VII', 7, 0, 'potassium tetraoxomanganate(VII)', 'potassium\\s+permanganate',
    'Charge balance: K⁺ plus MnO₄⁻, four O²⁻ give −8 so Mn is +7, d⁰. Tetrahedral, nothing to place in e or t₂, CFSE 0. The purple colour is ligand-to-metal charge transfer (slide 43), not a d–d band.'),
  oxoChain('c6-oxo-chain-cro4', 'K₂CrO₄', 'potassium', 'Cr', 'chromat', 'VI', 6, 0, 'potassium tetraoxochromate(VI)', 'potassium\\s+chromate(?:\\s*\\(\\s*VI\\s*\\))?',
    'Four O²⁻ give −8 and the anion is 2−, so Cr is +6, d⁰: tetrahedral, CFSE 0. The yellow colour is charge transfer.'),
  oxoChain('c6-oxo-chain-mno4-2', 'K₂MnO₄', 'potassium', 'Mn', 'manganat', 'VI', 6, 1, 'potassium tetraoxomanganate(VI)', 'potassium\\s+manganate(?:\\s*\\(\\s*VI\\s*\\))?',
    'Four O²⁻ give −8 and the anion is 2−, so Mn is +6, d¹. In the tetrahedral field the electron goes into e (below t₂): e¹, CFSE = 0.6 Δt.'),
  oxoChain('c6-oxo-chain-vo4', 'Na₃VO₄', 'sodium', 'V', 'vanadat', 'V', 5, 0, 'sodium tetraoxovanadate(V)', 'sodium\\s+(?:ortho)?vanadate(?:\\s*\\(\\s*V\\s*\\))?',
    'Four O²⁻ give −8 and the anion is 3−, so V is +5, d⁰: tetrahedral, CFSE 0.'),
  oxoChain('c6-oxo-chain-feo4', 'K₂FeO₄', 'potassium', 'Fe', 'ferrat', 'VI', 6, 2, 'potassium tetraoxoferrate(VI)', 'potassium\\s+ferrate(?:\\s*\\(\\s*VI\\s*\\))?',
    'Four O²⁻ give −8 and the anion is 2−, so Fe is +6, d². Both electrons go into e (parallel spins): e², CFSE = 2 × 0.6 = 1.2 Δt.'),
]);

/* ---------- 3. magnetism: chi -> mu -> n -> spin state (slide 33) ---------- */
const sciSup = (e) => `10${e < 0 ? '⁻' : ''}${String(Math.abs(e)).split('').map((c) => SUP[c]).join('')}`;
const mag = (id, label, chi, e, T, mu, n, spin, why) => mapped(base(id, label, 4,
  `The molar magnetic susceptibility of an octahedral ${label.split(' ')[0]} complex is χ_M = ${chi}×${sciSup(e)} cm³ mol⁻¹ at ${T} K (diamagnetic correction already made). Use μ = 2.828 √(χ_M T) to find the magnetic moment in Bohr magnetons, then the number of unpaired electrons (μ_s = √(n(n+2))), and say whether the complex is high spin or low spin (or neither).`,
  why, 's33', 'Work out χ_M T first. Compare μ with the spin-only values for n = 1 to 5 (1.73, 2.83, 3.87, 4.90, 5.92 BM); orbital contribution is largely quenched for first-row metals.'),
  [field('mu', 'μ (BM)'), field('n', 'Unpaired electrons'), field('spin', 'Spin state', ['high', 'low', 'neither'])],
  { mu: num(mu, 0.08), n: num(n, 0), spin: kw(spin, { high: ['high', 'high spin', 'hs'], low: ['low', 'low spin', 'ls'], neither: ['neither', 'not applicable', 'n/a', 'na', 'none'] }) });
const magnet = node('bk-c8-magnetism-chain', 'Magnetism: susceptibility to μ to unpaired electrons to high or low spin', 'Finals revision deck slide 33 (Guoy balance; 2023-24 spin-only and 2024-25 instrument parts)', 8, 'Magnetic Properties', ['spin-only-magnetism', 'high-low-spin'], 4, 'magnetism', [
  mag('c8-mag-fe2', 'Fe(II) complex (d⁶)', '1.01', -2, 298, 4.9, 4, 'high', 'χ_M T = 1.01×10⁻² × 298 = 3.01, μ = 2.828 √3.01 = 4.9 BM. √(n(n+2)) = 4.90 gives n = 4: that is the high-spin d⁶ arrangement (low-spin d⁶ would be diamagnetic, n = 0).'),
  mag('c8-mag-co2', 'Co(II) complex (d⁷)', '6.30', -3, 298, 3.87, 3, 'high', 'χ_M T = 6.30×10⁻³ × 298 = 1.88, μ = 2.828 √1.88 = 3.87 BM, so n = 3: high-spin d⁷ (low-spin d⁷ has n = 1, μ_s = 1.73).'),
  mag('c8-mag-mn2', 'Mn(II) complex (d⁵)', '1.47', -2, 298, 5.92, 5, 'high', 'χ_M T = 1.47×10⁻² × 298 = 4.38, μ = 2.828 √4.38 = 5.92 BM, so n = 5: high-spin d⁵ (low-spin d⁵ has n = 1).'),
  mag('c8-mag-fe3', 'Fe(III) complex (d⁵)', '1.26', -3, 298, 1.73, 1, 'low', 'χ_M T = 1.26×10⁻³ × 298 = 0.375, μ = 2.828 √0.375 = 1.73 BM, so n = 1: low-spin d⁵ (high-spin would have n = 5, μ = 5.92).'),
  mag('c8-mag-ni2', 'Ni(II) complex (d⁸)', '3.36', -3, 298, 2.83, 2, 'neither', 'χ_M T = 3.36×10⁻³ × 298 = 1.00, μ = 2.828 BM, so n = 2. d⁸ has the same t₂g⁶e_g² arrangement whatever the field, so high or low spin does not apply.'),
  rubricV('c8-mag-guoy', 'Guoy balance and spin state',
    'Describe how a Guoy balance is used to tell a paramagnetic from a diamagnetic sample and, from the measurement, to decide whether an octahedral d⁶ complex is high spin or low spin.',
    [['The sample tube hangs between magnet poles and is weighed with the magnet off and on', 1, false],
     ['A paramagnetic sample is drawn into the field, so its apparent weight increases; a diamagnetic sample is pushed out, so it decreases', 1.5, true],
     ['The change in weight gives the molar susceptibility χ, and μ = 2.828 √(χT)', 1, true],
     ['Set μ = √(n(n+2)) to find the number of unpaired electrons n', 1, true],
     ['Compare n with the dⁿ arrangements: d⁶ high spin n = 4, low spin n = 0 (diamagnetic); orbital contribution is quenched for first-row metals so the spin-only value is adequate', 0.5, false]],
    'Paramagnetic: weight up with the magnet on. Diamagnetic: weight down. χ → μ = 2.828 √(χT) → n from √(n(n+2)) → high spin (n = 4) or low spin (n = 0) for d⁶.', 's33'),
]);

/* ---------- 4. Oh against Td CFSE (slides 19-22) ---------- */
const OHT = (id, label, ion, n, ohCoef, tdCoef, ratio, why) => mapped(base(id, label, 4,
  `Compare the CFSE of ${ion} in an octahedral and in a tetrahedral complex of the same weak-field ligand (both high spin), taking Δt = 4/9 Δo. Give the CFSE of each as a coefficient of its own Δ, the tetrahedral value in units of Δo, and the ratio CFSE(octahedral) : CFSE(tetrahedral) (pairing energy ignored).`,
  why, 's19-22', 'Octahedral: −0.4 Δo per t₂g electron, +0.6 Δo per e_g electron. Tetrahedral: −0.6 Δt per e electron, +0.4 Δt per t₂ electron. Stabilisation is reported as a positive number.'),
  [field('oh', 'Octahedral CFSE (× Δo)'), field('td', 'Tetrahedral CFSE (× Δt)'), field('tdo', 'Tetrahedral CFSE in units of Δo'), field('r', 'Ratio Oh : Td')],
  { oh: num(ohCoef), td: num(tdCoef), tdo: num((tdCoef * 4 / 9).toFixed(3), 0.01), r: num(ratio, 0.05) });
const ohtd = node('bk-c7-oh-td-ratio', 'Octahedral against tetrahedral CFSE and why tetrahedral complexes are high spin', 'Finals revision deck slides 19-22; the 27/8 ratio type recurs in the mid-terms', 7, 'Crystal Field Theory', ['cfse-calculation', 'tetrahedral'], 3, 'oh-td', [
  OHT('c7-ohtd-ni2', 'Ni(II) d⁸', 'Ni(II) (d⁸)', 8, 1.2, 0.8, 3.375, 'Octahedral d⁸ is t₂g⁶e_g²: 6(0.4) − 2(0.6) = 1.2 Δo. Tetrahedral d⁸ is e⁴t₂⁴: 4(0.6) − 4(0.4) = 0.8 Δt = 0.8 × 4/9 Δo = 0.356 Δo. Ratio 1.2 / 0.356 = 3.375 = 27/8.'),
  OHT('c7-ohtd-co2', 'Co(II) d⁷', 'Co(II) (d⁷)', 7, 0.8, 1.2, 1.5, 'Octahedral high-spin d⁷ is t₂g⁵e_g²: 5(0.4) − 2(0.6) = 0.8 Δo. Tetrahedral d⁷ is e⁴t₂³: 4(0.6) − 3(0.4) = 1.2 Δt = 0.533 Δo. Ratio 0.8 / 0.533 = 1.5 (this is why Co(II) forms tetrahedral halide complexes so readily).'),
  OHT('c7-ohtd-cu2', 'Cu(II) d⁹', 'Cu(II) (d⁹)', 9, 0.6, 0.4, 3.375, 'Octahedral d⁹ is t₂g⁶e_g³: 6(0.4) − 3(0.6) = 0.6 Δo. Tetrahedral d⁹ is e⁴t₂⁵: 4(0.6) − 5(0.4) = 0.4 Δt = 0.178 Δo. Ratio 0.6 / 0.178 = 3.375.'),
  OHT('c7-ohtd-fe2', 'Fe(II) d⁶', 'Fe(II) (d⁶)', 6, 0.4, 0.6, 1.5, 'Octahedral high-spin d⁶ is t₂g⁴e_g²: 4(0.4) − 2(0.6) = 0.4 Δo. Tetrahedral d⁶ is e³t₂³: 3(0.6) − 3(0.4) = 0.6 Δt = 0.267 Δo. Ratio 0.4 / 0.267 = 1.5.'),
  mc('c7-ohtd-why-hs', 'Why tetrahedral complexes are high spin', 'Why do tetrahedral complexes almost always adopt high-spin configurations?',
    ['Δt is only about 4/9 of Δo, so it rarely exceeds the pairing energy', 'Δt is larger than Δo, so electrons avoid the upper set', 'the e orbitals lie above the t₂ orbitals, which forces parallel spins', 'tetrahedral ligands are always weak-field ligands'], 0,
    'No orbital points straight at a ligand in a tetrahedron, so the splitting is small (Δt = 4/9 Δo) and rarely beats the pairing energy: electrons occupy both sets singly first, high spin. The e set is the lower one, and strong-field ligands in a tetrahedron are possible but still do not give low spin because Δt stays small.', 's22'),
  mc('c7-ohtd-order', 'Which set is lower in a tetrahedron', 'In a tetrahedral crystal field, which statement about the d orbitals is correct?',
    ['d_z² and d_x²−y² (e) are lower, d_xy, d_xz and d_yz (t₂) are higher', 'd_xy, d_xz and d_yz (t₂) are lower, d_z² and d_x²−y² (e) are higher', 'all five stay degenerate in a tetrahedron', 'the sets are labelled e_g and t₂g'], 0,
    'The ligands sit at alternate corners of a cube. The t₂ orbitals point toward the cube edges (nearer the ligands, more repulsion, higher); e points to the faces (lower). There is no inversion centre, so no g or u labels.', 's21'),
]);

/* ---------- 5. term and Tanabe-Sugano concepts (slides 34-41) ---------- */
const AET = [['t₂g¹', 'T'], ['t₂g³', 'A'], ['t₂g³e_g¹', 'E'], ['t₂g³e_g²', 'A'], ['t₂g⁴e_g²', 'T'], ['t₂g⁶e_g²', 'A'], ['t₂g⁶e_g³', 'E']];
const aetTarget = (ans) => ({ type: 'pattern', caseSensitive: false, acceptedPatterns: [`^\\s*${ans}\\s*(?:\\(?\\s*[12]?\\s*\\)?)?\\s*(?:g|\\s*\\(?\\s*[12]?g?\\s*\\)?)?\\s*$`], expectedDisplay: ans });
const termc = node('bk-c8-term-concepts', 'Term, Tanabe-Sugano and molecular-term concepts', 'Finals revision deck slides 34-41', 8, 'Term Symbols', ['term-symbols', 'tanabe-sugano'], 3, 'term-concepts', [
  mc('c8-tc-order-d2', 'Observed order of the d² terms', 'For a free ion with a d² configuration, which energy order of the five terms (lowest first) is observed, the one that differs from the naive order of Hund-type rules?',
    ['³F < ¹D < ³P < ¹G < ¹S', '³F < ³P < ¹G < ¹D < ¹S', '³F < ³P < ¹D < ¹G < ¹S', '¹D < ³F < ³P < ¹G < ¹S'], 0,
    'The rules (largest multiplicity, then largest L) predict ³F < ³P < ¹G < ¹D < ¹S, but the observed order is ³F < ¹D < ³P < ¹G < ¹S. Only the ground term (³F) is reliably predicted.', 's38'),
  mc('c8-tc-rules', 'What the rules predict reliably', 'Which statement about predicting the energies of spectroscopic terms is correct?',
    ['The highest-multiplicity and greatest-L rules reliably give only the ground term', 'They give the correct energy order of all terms of the configuration', 'The greatest-L rule orders every term of the same multiplicity correctly', 'They apply only to d¹ and d⁹ ions'], 0,
    'The spin-multiplicity rule is fairly reliable for ordering, but the greatest-L rule and the two rules together reliably predict only the ground term; the d² example shows the excited terms come in a different order.', 's38'),
  mapped(base('c8-tc-aet', 'A, E or T for the ground configuration', 3,
    'In an octahedral complex, the letter of a molecular term shows how the d electrons occupy the degenerate sets: T for a triply degenerate set that is asymmetrically occupied, E for a doubly degenerate set that is asymmetrically occupied, A (or B) when every set is symmetrically occupied (empty, half-filled or full). Give the letter for each configuration.',
    'T: t₂g¹ and t₂g⁴ (three orbitals, uneven filling). A: t₂g³, t₂g³e_g² and t₂g⁶e_g² (every set empty, half-filled or full). E: e_g¹ and e_g³ with a symmetric t₂g (high-spin d⁴ and d⁹). The full labels are ²T₂g, ⁴A₂g, ⁵E_g, ⁶A₁g, ⁵T₂g, ³A₂g and ²E_g.', 's40'),
    AET.map(([c], i) => field(`c${i}`, c)),
    Object.fromEntries(AET.map(([, a], i) => [`c${i}`, aetTarget(a)]))),
  mc('c8-tc-noncross', 'Non-crossing rule', 'On a Tanabe-Sugano diagram, what happens when two terms of the same symmetry approach each other as the field strength increases?',
    ['They do not cross: they bend apart', 'They cross at the point where they meet', 'They merge into a single level', 'The upper one is lost from the diagram'], 0,
    'Terms of the same symmetry obey the non-crossing rule: as the ligand field brings them close they bend away from each other. Terms of different symmetry can cross.', 's41'),
  mc('c8-tc-racah', 'What B is', 'On a Tanabe-Sugano diagram the axes are E/B and Δo/B. What is the Racah parameter B?',
    ['A measure of the repulsion between terms of the same multiplicity', 'The ligand-field splitting Δo', 'The energy of the excited state above the ground state', 'The spin-orbit coupling constant'], 0,
    'B measures electron-electron repulsion between terms of the same multiplicity; E is the energy above the ground state and Δ the ligand-field splitting, so dividing by B makes one diagram serve every complex of that dⁿ.', 's41'),
  mc('c8-tc-hole', 'dⁿ and d¹⁰⁻ⁿ share terms', 'Which configuration has the same set of spectroscopic terms (the same atomic term symbols) as d³?',
    ['d⁷', 'd⁴', 'd⁶', 'd⁵'], 0,
    'dⁿ and d¹⁰⁻ⁿ have the same terms (n electrons behave like n holes in a full shell): d³ = d⁷ (⁴F, ⁴P, ²H, ²G, ²F, ²D twice, ²P), d² = d⁸ and d¹ = d⁹ (²D).', 's36'),
]);

/* ---------- 6. selection rules, intensity and charge transfer (slides 42-43) ---------- */
const ordI = (items, order) => ({ type: 'ordered_list', directionLabel: 'Weakest → strongest band (smallest to largest ε)', items });
const inten = node('bk-c8-intensity', 'Selection rules, band intensity and charge-transfer bands', 'Finals revision deck slides 42-43', 8, 'UV-Vis Spectroscopy', ['selection-rules', 'charge-transfer'], 3, 'intensity', [
  { ...base('c8-int-rank', 'Rank four bands by ε', 3,
    'Order these absorption bands from the weakest to the strongest (smallest to largest molar absorptivity ε): the d–d band of [Mn(H₂O)₆]²⁺ (high-spin d⁵), the d–d band of [Ti(H₂O)₆]³⁺, the d–d band of tetrahedral [NiCl₄]²⁻, and the intense purple band of [MnO₄]⁻.',
    'Weakest to strongest: [Mn(H₂O)₆]²⁺ (spin-forbidden, ε < 1), [Ti(H₂O)₆]³⁺ (spin-allowed but Laporte-forbidden in a centrosymmetric complex, ε about 1-10), [NiCl₄]²⁻ (spin- and Laporte-allowed because a tetrahedron has no inversion centre, ε about 10-1000), [MnO₄]⁻ (charge transfer, fully allowed, ε about 1000-50000).', 's42'),
    inputSlot: { type: 'ordered_list', directionLabel: 'Weakest → strongest band (smallest to largest ε)', items: [{ id: 'ti', label: '[Ti(H₂O)₆]³⁺ d–d' }, { id: 'mno4', label: '[MnO₄]⁻ band' }, { id: 'mn', label: '[Mn(H₂O)₆]²⁺ d–d' }, { id: 'ni', label: '[NiCl₄]²⁻ d–d' }] },
    evaluator: { type: 'order_match', targetOrder: ['mn', 'ti', 'ni', 'mno4'] } },
  mc('c8-int-tetra', 'Why tetrahedral d–d bands are stronger', 'The d–d bands of tetrahedral [NiCl₄]²⁻ are much more intense than those of octahedral [Ni(H₂O)₆]²⁺. What is the reason?',
    ['A tetrahedron has no centre of inversion, so d–d transitions are not Laporte-forbidden', 'The tetrahedral complex has more d electrons', 'The d–d transitions in the tetrahedral complex are spin-allowed but those in the octahedral complex are not', 'Chloride is a stronger-field ligand than water'], 0,
    'The Laporte rule (g ↔ u only) forbids d–d bands in a centrosymmetric octahedron (ε about 1-10); without an inversion centre the rule relaxes (d–p mixing) and the band is much stronger (ε about 10-1000). Both complexes are spin-allowed.', 's42'),
  mc('c8-int-lmct', 'Type of band in [MnO₄]⁻', 'The intense purple colour of [MnO₄]⁻ (ε of the order of 10³) comes from which kind of transition?',
    ['Ligand-to-metal charge transfer from O²⁻-based orbitals into empty metal d orbitals (Mn is d⁰)', 'A spin-forbidden d–d transition', 'A Laporte-forbidden d–d transition within the e and t₂ sets', 'Metal-to-ligand charge transfer from filled Mn d orbitals'], 0,
    'Mn(VII) is d⁰, so there are no d electrons to excite in a d–d band. The colour is charge transfer from ligand-based orbitals (O²⁻) to empty metal d orbitals: LMCT, fully allowed and very intense.', 's43'),
  mc('c8-int-which', 'LMCT or MLCT from the ions', 'Which combination of metal and ligand favours a low-energy metal-to-ligand charge-transfer (MLCT) band?',
    ['A metal in a low oxidation state with filled d orbitals and a π-acceptor ligand with low-lying empty orbitals (such as CO, CN⁻ or bpy)', 'A metal in a high oxidation state with empty d orbitals and a π-donor ligand such as O²⁻ or Cl⁻', 'A d⁰ metal with a σ-only ligand such as NH₃', 'Any complex with a spin-forbidden d–d band'], 0,
    'MLCT moves an electron from a metal-based filled orbital to an empty ligand orbital, so it needs a metal that is easy to oxidise (low oxidation state) and a ligand with low-lying acceptor orbitals. The reverse pairing (high-valent metal, π-donor ligand) gives LMCT.', 's43'),
  mc('c8-int-ct-strong', 'Why charge-transfer bands are intense', 'Why are charge-transfer bands (ε about 10³-10⁵) usually far more intense than d–d bands?',
    ['They are allowed by both the spin and Laporte selection rules', 'They involve a change of spin multiplicity', 'They occur only in centrosymmetric complexes', 'They involve only the t₂g orbitals'], 0,
    'Charge-transfer transitions move an electron between metal-based and ligand-based orbitals of different parity without a spin flip, so both the spin and Laporte rules are satisfied (slide 43: fully allowed, generally much more intense than d–d).', 's43'),
]);

/* ---------- 7. Jahn-Teller written and table items (slides 28-32) ---------- */
const JT = [['[Cr(H₂O)₆]²⁺ (high-spin d⁴)', 'strong'], ['[Fe(H₂O)₆]²⁺ (high-spin d⁶)', 'weak'], ['[Ni(H₂O)₆]²⁺ (d⁸)', 'none'], ['[Co(CN)₆]⁴⁻ (low-spin d⁷)', 'strong'], ['[Mn(H₂O)₆]²⁺ (high-spin d⁵)', 'none'], ['[Cu(H₂O)₆]²⁺ (d⁹)', 'strong']];
const jtm = node('bk-c7-jt-more', 'Jahn-Teller strength, spectra and reactivity', 'Finals revision deck slides 28-32', 7, 'Jahn-Teller Effect', ['jahn-teller'], 3, 'jt-more', [
  mapped(base('c7-jt-table', 'Strong, weak or none', 3,
    'Using the Jahn-Teller table for octahedral complexes (an asymmetrically occupied e_g set gives a strong distortion, an asymmetrically occupied t₂g set a weak one, symmetric occupation none), classify the expected Jahn-Teller effect of each ion.',
    'Strong: e_g asymmetrically filled, that is high-spin d⁴ (t₂g³e_g¹), low-spin d⁷ (t₂g⁶e_g¹) and d⁹ (t₂g⁶e_g³). Weak: asymmetric t₂g, high-spin d⁶ (t₂g⁴e_g²). None: symmetric occupation, d⁸ (t₂g⁶e_g²) and high-spin d⁵ (t₂g³e_g²).', 's29'),
    JT.map(([n], i) => field(`j${i}`, n, ['strong', 'weak', 'none'])),
    Object.fromEntries(JT.map(([, a], i) => [`j${i}`, kw(a, { strong: ['strong', 's'], weak: ['weak', 'w'], none: ['none', 'no', 'no effect', 'nil'] })]))),
  rubricV('c7-jt-twobands', 'Two bands for Ti³⁺ (d¹)',
    'Octahedral [Ti(H₂O)₆]³⁺ (d¹) should give a single d–d band, yet its spectrum shows two close bands. Explain.',
    [['d¹ is t₂g¹: the single electron sits in a degenerate set that is asymmetrically occupied', 1, true], ['The complex distorts (Jahn-Teller) to remove the degeneracy, splitting e_g (and t₂g) into sublevels', 1, true], ['So the electron can be excited into two different upper levels, giving two possible transitions', 1, true], ['The splittings are small, so the two bands lie close together and appear as a shoulder', 1, false]],
    'One electron in t₂g is a degenerate asymmetric occupation, so the ion distorts. The split e_g sublevels allow two transitions, and because the distortion is small the two bands overlap as a shoulder peak.', 's31'),
  rubricV('c7-jt-cu', 'Cu(II) elongation and formation constants',
    'In [Cu(H₂O)₆]²⁺ the two axial Cu–O distances (2.38 Å) are longer than the four equatorial ones (about 1.95 Å). Explain why, and what it does to the stepwise formation constants when NH₃ replaces water (K₁ to K₄ large, K₅ about 3×10⁻¹, K₆ very small).',
    [['d⁹ is t₂g⁶e_g³: the e_g set is asymmetrically occupied, which gives a strong Jahn-Teller distortion', 1, true], ['Axial elongation lowers d_z² (two electrons) and raises d_x²−y² (one electron), a net energy gain', 1, true], ['Four short equatorial bonds and two long, weak axial bonds', 1, false], ['The two axial positions bind a fifth and sixth NH₃ only weakly, so K₅ is small and K₆ very small, while K₁ to K₄ (equatorial) are large', 1, true]],
    'The e_g³ configuration distorts the octahedron; the stabilisation comes from lowering the doubly occupied d_z². The weak axial sites explain why the fifth and sixth ammonia ligands are hard to add.', 's30, s32'),
  mc('c7-jt-eg-strong', 'Why e_g asymmetry distorts more', 'Why is the Jahn-Teller distortion much stronger for asymmetric occupation of e_g than of t₂g?',
    ['The e_g orbitals point at the ligands and are σ-antibonding, so their occupation changes the metal-ligand bond lengths directly', 'The e_g orbitals are lower in energy than t₂g', 'The t₂g orbitals are involved in σ bonding', 'The e_g set holds more electrons than t₂g'], 0,
    'e_g* levels are involved in the σ bond (they point toward the ligands), so uneven occupation distorts the bond lengths strongly; t₂g orbitals point between the ligands and the distortion is weak (slide 29).', 's29'),
]);

/* ---------- 8. d-orbital energies when the geometry changes (the mid-terms asked this in 4 of 4 years) ---------- */
const geo = node('bk-c7-geom-orbitals', 'd-orbital energies when ligands are added, removed or distorted', 'Finals revision deck slides 18, 21-22, 28 (orbital directions, tetragonal distortion); recurs in all four mid-terms', 7, 'Crystal Field Theory', ['d-orbital-splitting', 'jahn-teller'], 2, 'geom-orbitals', [
  mc('c7-geo-sqpyr', 'Square planar to square pyramidal', 'Which d orbital is most destabilised when a square-planar complex gains one extra ligand along the z axis to become square pyramidal?',
    ['d_z²', 'd_xy', 'd_xz', 'd_yz'], 0,
    'The new ligand approaches along z, directly toward the lobes of d_z², so that orbital feels the most extra repulsion; d_xz and d_yz are raised only a little and d_xy not at all.', 's18'),
  mc('c7-geo-remove', 'Remove the two axial ligands', 'Which d orbital is stabilised most when the two ligands on the z axis are removed from an octahedral complex?',
    ['d_z²', 'd_xy', 'd_x²−y²', 'none: removing ligands does not change orbital energies'], 0,
    'd_z² points along the removed ligands, so losing them removes most of its repulsion and it drops the most (d_xz and d_yz drop a little).', 's28'),
  mc('c7-geo-elong', 'Axial elongation', 'Which statement is true when an octahedral complex undergoes axial elongation (Jahn-Teller, z-axis ligands move away)?',
    ['d_x²−y² is the highest orbital and d_z² drops below it', 'd_xy is the lowest orbital', 'The d orbitals with lobes along z are raised in energy', 'All five d orbitals stay degenerate'], 0,
    'Elongation reduces repulsion along z: d_z² (and, among t₂g, d_xz and d_yz) are lowered, d_x²−y² (and d_xy) are raised, so d_x²−y² is the highest; d_xz and d_yz, not d_xy, are the lowest (slide 28).', 's28'),
  mc('c7-geo-compress', 'Axial compression', 'Which statement is true when an octahedral complex undergoes axial compression (z-axis ligands move closer)?',
    ['d_xy is the lowest-energy orbital and d_z² the highest', 'd_x²−y² is the highest-energy orbital', 'The orbitals with lobes along z are lowered', 'd_z² and d_xy are degenerate'], 0,
    'Compression increases repulsion along z: d_z² (e_g) and d_xz, d_yz are raised, d_x²−y² and d_xy are lowered. d_z² ends up highest and d_xy lowest, the reverse of elongation.', 's28'),
  mc('c7-geo-order', 'Where d_xy lies above d_z²', 'In which geometries is the d_xy orbital higher in energy than d_z²?',
    ['Tetrahedral and square planar, but not octahedral', 'Octahedral only', 'Octahedral and square planar', 'All three'], 0,
    'Octahedral: t₂g (d_xy) below e_g (d_z²). Tetrahedral: t₂ (d_xy) above e (d_z²). Square planar: order d_x²−y² > d_xy > d_z² > d_xz, d_yz, so d_xy is above d_z² there too.', 's18, s21'),
]);

/* ---------- 9. ligand type and M-L bond character (slides 24-27; a template in all four mid-terms) ---------- */
const lig = node('bk-c7-lig-bond', 'π-donor, π-acceptor and the σ/π character of an M–L bond', 'Finals revision deck slides 24-27', 7, 'Ligand Field Theory', ['pi-bonding', 'back-bonding'], 2, 'lig-bond', [
  mc('c7-lb-cn', 'Which ligand is a π-acceptor', 'Which of these ligands is a π-acceptor?',
    ['CN⁻', 'F⁻', 'NH₃', 'H₂O'], 0,
    'CN⁻ (and CO, PR₃) have low-lying empty π* orbitals that accept electron density from filled metal t₂g orbitals (M→L back-bonding), which raises Δo. F⁻ and H₂O are π-donors, NH₃ has no π effect.', 's25'),
  mc('c7-lb-f', 'Fluoride as a ligand', 'Which description of the fluoride ligand is correct?',
    ['σ-donor and π-donor', 'σ-donor and π-acceptor', 'σ-acceptor and π-acceptor', 'π-donor only, with no σ donation'], 0,
    'F⁻ donates a σ pair and has filled p orbitals of π symmetry that can donate to empty metal t₂g orbitals (L→M π donation), which lowers Δo (halides sit at the weak-field end of the series).', 's25'),
  mc('c7-lb-nh3', 'The ligand with no π effect', 'In the π-bonding classification, which of these ligands has essentially no π interaction (σ-donor only)?',
    ['NH₃', 'Cl⁻', 'CO', 'PR₃'], 0,
    'NH₃ has a lone pair for σ donation but no filled p orbitals or low-lying empty orbitals of suitable symmetry. Halides are π-donors; CO and PR₃ are π-acceptors.', 's25'),
  mc('c7-lb-d0', 'Bond character with and without d electrons', 'In [Ti(CO)₆]⁴⁺ (Ti is d⁰) and in Cr(CO)₆ (Cr is d⁶), which statement about the metal-carbon bond is correct?',
    ['Ti–C is σ only (no d electrons to back-donate); Cr–C is both σ and π', 'Both have σ and π character', 'Ti–C has π character only, Cr–C σ only', 'Both are purely ionic'], 0,
    'CO is always a σ donor through carbon. π back-donation needs filled metal d orbitals of t₂g symmetry: Ti⁴⁺ is d⁰, so none; Cr(0) is d⁶, so back-donation into π* (which also weakens C–O) gives π character.', 's26'),
  mc('c7-lb-co-length', 'C–O length with more d electrons', 'A CO ligand is bound to metal ions of the same size and charge, one d⁰ and one d⁶. In which does the C–O bond come out longer, and why?',
    ['In the d⁶ ion: metal-to-ligand π back-donation puts electron density into CO π*, weakening C–O', 'In the d⁰ ion: ligand-to-metal π donation weakens C–O', 'They are the same: only σ donation matters', 'In the d⁰ ion, because the metal is more electropositive'], 0,
    'Back-donation needs d electrons. Filling CO π* weakens and lengthens C–O and strengthens M–C (slide 26), so the d⁶ ion has the longer C–O.', 's26'),
]);

const NODES = [organo, oxochain, magnet, ohtd, termc, inten, jtm, geo, lig];
const LINKS = {
  'bk-c6-ox-organo': ['c6.ox-dn-cn'],
  'bk-c6-oxo-chain': ['c6.name', 'c6.ox-dn-cn', 'c7.splitting', 'c7.cfse'],
  'bk-c8-magnetism-chain': ['c8.spin-only'],
  'bk-c7-oh-td-ratio': ['c7.cfse', 'c7.splitting', 'c7.hs-ls'],
  'bk-c8-term-concepts': ['c8.terms', 'c8.tanabe-sugano'],
  'bk-c8-intensity': ['c8.selection', 'c8.charge-transfer'],
  'bk-c7-jt-more': ['c7.jahn-teller'],
  'bk-c7-geom-orbitals': ['c7.splitting', 'c7.jahn-teller'],
  'bk-c7-lig-bond': ['c7.pi-bonding', 'c7.spectrochemical'],
};

if (process.argv[1].endsWith('deck.mjs')) {
  const bankPath = `${DIR}/cm2021/question-bank.json`, mapPath = `${DIR}/cm2021/skill-map.json`;
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  bank.questionNodes = bank.questionNodes.filter((n) => !LINKS[n.id]).concat(NODES);
  bank.exportedAt = new Date().toISOString();
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 1));
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  for (const [nid, skills] of Object.entries(LINKS)) {
    for (const sk of map.skills) sk.nodes = sk.nodes.filter((id) => id !== nid);
    for (const sid of skills) map.skills.find((k) => k.id === sid).nodes.push(nid);
    map.nodeSkills[nid] = skills;
  }
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 1));
  console.log('wrote', NODES.map((n) => `${n.id}: ${n.variants.length}`).join('; '), '| total', NODES.reduce((a, n) => a + n.variants.length, 0));
}
export { NODES };
