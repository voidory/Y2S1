/* Changed-instance practice for the Kinjo half (Ch 1-5) of CM2021. The four example mid-term papers (answer keys by Kinjo and Ito) repeat the
   same templates with new instances: pick the highest/lowest of three (boiling point, ionisation energy, electron affinity, hydration energy),
   average oxidation number (N₂O₃ twice), HOMO electron count (CH₄ twice), nuclear equation (tritium). The bank held one fixed variant of each,
   so this adds changed-instance variants whose answers come from tables printed on the slides or from arithmetic that tests/kinjo-items.test.mjs
   recomputes.
   Batch 1 sources: 2025-Chapter2_Part8_Group17_and_18.pdf slides 21-23 (halogens), 30 (noble gases), 33 (xenon fluorides).
   Add further tables (Group 1, 2, 13-16) here as the other lecture decks arrive.
   Run: node tools/cm2021/kinjo.mjs   — rewrites bk-c2-trend-gen, bk-c4-avgon-gen, bk-c4-nuclear-gen, bk-c3-homo-gen and their skill links. */
import fs from 'node:fs';

const DIR = 'public/content';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹', SUB = '₀₁₂₃₄₅₆₇₈₉';
const L = 'abcdefghij';
const sup = (n) => String(n).split('').map((c) => SUP[c]).join('');
const sub = (n) => String(n).split('').map((c) => SUB[c]).join('');
const base = (id, label, marks, stem, explanation, sourceSlide, hint) => ({ variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation, sourceSlide });
const mc = (id, label, stem, opts, key, explanation, slide, marks = 1) => ({
  ...base(id, label, marks, stem, explanation, slide),
  inputSlot: { type: 'choice', selectionMode: 'single', options: opts.map((o, i) => ({ id: L[i], label: o })), shuffleOptions: true },
  evaluator: { type: 'choice_match', targetIds: [L[key]], gradingMode: 'exact' },
});
const node = (id, title, source, week, theme, tags, est, family, variants) => ({
  schemaVersion: '3.0', id, moduleCode: 'CM2021', tier: 'atomic',
  metadata: { title, source, week, primaryTheme: theme, conceptTags: tags, difficultyEstimate: 3, estimatedMinutes: est, examStyle: 'short_2to3', family },
  variants,
});

/* ---------- 1. pick the highest or lowest of three, from slide tables ---------- */
export const TABLES = {
  haloIE: { name: 'first ionisation energy', unit: 'kJ/mol', slide: 's21', data: { F: 1681, Cl: 1256, Br: 1143, I: 1009 }, why: 'Ionisation energy falls down the group: the outer electron is farther from the nucleus and better shielded.' },
  haloEN: { name: 'electronegativity', unit: '', slide: 's21', data: { F: 4.0, Cl: 3.0, Br: 2.8, I: 2.5 }, why: 'Electronegativity falls down the group as the atoms get larger.' },
  haloR: { name: 'atomic radius', unit: 'pm', slide: 's21', data: { F: 72, Cl: 100, Br: 114, I: 133 }, why: 'Atomic radius grows down the group as extra shells are added.' },
  haloIon: { name: 'ionic radius of the halide ion', unit: 'pm', slide: 's21', data: { 'F⁻': 133, 'Cl⁻': 181, 'Br⁻': 196, 'I⁻': 220 }, why: 'Halide ions get larger down the group.' },
  haloBP: { name: 'boiling point of the element', unit: '°C', slide: 's21', data: { 'F₂': -188, 'Cl₂': -34.0, 'Br₂': 59.5, 'I₂': 185 }, why: 'Boiling and melting points rise down the group: more electrons, stronger dispersion forces between the X₂ molecules.' },
  haloMP: { name: 'melting point of the element', unit: '°C', slide: 's21', data: { 'F₂': -219, 'Cl₂': -101, 'Br₂': -7.2, 'I₂': 114 }, why: 'Melting points rise down the group because dispersion forces grow with the number of electrons.' },
  haloBE: { name: 'X–X bond energy', unit: 'kJ/mol', slide: 's22', data: { 'F–F': 159, 'Cl–Cl': 243, 'Br–Br': 193, 'I–I': 151 }, why: 'The bond energy is not simply decreasing: Cl–Cl is the strongest, and F–F is weak despite being short (lone-pair repulsion across the short bond); then Br–Br > I–I.' },
  haloBL: { name: 'X–X bond length', unit: 'pm', slide: 's22', data: { 'F–F': 143, 'Cl–Cl': 200, 'Br–Br': 228, 'I–I': 266 }, why: 'Bond length grows down the group with atomic size.' },
  haloEA: { name: 'electron affinity (energy released on E + e⁻ → E⁻)', unit: 'kJ/mol', slide: 's23', data: { F: 334, Cl: 355, Br: 325, I: 295 }, why: 'Chlorine has the largest electron affinity, not fluorine: the small 2p shell of F makes the added electron repel the ones already there; after Cl the values fall down the group. (F is still the most electronegative.)' },
  nobleIE: { name: 'first ionisation energy', unit: 'kJ/mol', slide: 's30', data: { He: 2372, Ne: 2080, Ar: 1520, Kr: 1351, Xe: 1170, Rn: 1037 }, why: 'Noble gases have the highest ionisation energy in each period and it falls down the group.' },
  nobleBP: { name: 'boiling point', unit: '°C', slide: 's30', data: { He: -269, Ne: -246, Ar: -186, Kr: -153, Xe: -108, Rn: -62 }, why: 'Boiling points rise down the group: larger atoms are more polarisable, so dispersion forces grow.' },
  nobleDen: { name: 'density at STP', unit: 'g/L', slide: 's30', data: { He: 0.178, Ne: 0.900, Ar: 1.78, Kr: 3.75, Xe: 5.90, Rn: 9.73 }, why: 'Density at STP rises down the group with the atomic mass (the molar volume of an ideal-like gas is the same).' },
  nobleR: { name: 'atomic radius', unit: 'pm', slide: 's30', data: { He: 31, Ne: 71, Ar: 98, Kr: 112, Xe: 131, Rn: 140 }, why: 'Atomic radius grows down the group.' },
  xeMP: { name: 'melting point of the xenon fluoride', unit: '°C', slide: 's33', data: { 'XeF₂': 140, 'XeF₄': 117, 'XeF₆': 49 }, why: 'The melting points fall as more fluorine is added (XeF₂ 140 °C, XeF₄ 117 °C, XeF₆ 49 °C).' },
  xeBL: { name: 'Xe–F bond length', unit: 'Å', slide: 's33', data: { 'XeF₂': 2.00, 'XeF₄': 1.95, 'XeF₆': 1.89 }, why: 'The Xe–F bond shortens as more F is bonded (2.00, 1.95, 1.89 Å).' },
};
const PICKS = [
  ['haloIE', ['F', 'Cl', 'Br'], 'max'], ['haloIE', ['Cl', 'Br', 'I'], 'min'], ['haloEN', ['Cl', 'Br', 'I'], 'max'], ['haloEN', ['F', 'Br', 'I'], 'min'],
  ['haloR', ['F', 'Cl', 'I'], 'max'], ['haloIon', ['F⁻', 'Cl⁻', 'Br⁻'], 'min'], ['haloIon', ['Cl⁻', 'Br⁻', 'I⁻'], 'max'],
  ['haloBP', ['F₂', 'Cl₂', 'Br₂'], 'max'], ['haloBP', ['Cl₂', 'Br₂', 'I₂'], 'min'], ['haloMP', ['F₂', 'Br₂', 'I₂'], 'max'], ['haloMP', ['F₂', 'Cl₂', 'Br₂'], 'min'],
  ['haloBE', ['F–F', 'Cl–Cl', 'Br–Br'], 'max'], ['haloBE', ['F–F', 'Br–Br', 'I–I'], 'min'], ['haloBE', ['Cl–Cl', 'Br–Br', 'I–I'], 'max'], ['haloBL', ['F–F', 'Cl–Cl', 'I–I'], 'max'],
  ['haloEA', ['F', 'Cl', 'Br'], 'max'], ['haloEA', ['F', 'Br', 'I'], 'max'], ['haloEA', ['Cl', 'Br', 'I'], 'min'], ['haloEA', ['F', 'Cl', 'I'], 'min'],
  ['nobleIE', ['He', 'Ne', 'Ar'], 'max'], ['nobleIE', ['Ar', 'Kr', 'Xe'], 'min'], ['nobleIE', ['Ne', 'Kr', 'Rn'], 'max'],
  ['nobleBP', ['He', 'Ne', 'Ar'], 'min'], ['nobleBP', ['Kr', 'Xe', 'Rn'], 'max'], ['nobleBP', ['Ne', 'Ar', 'Xe'], 'max'],
  ['nobleDen', ['Ne', 'Kr', 'Rn'], 'max'], ['nobleDen', ['He', 'Ar', 'Xe'], 'min'], ['nobleR', ['He', 'Ar', 'Xe'], 'max'],
  ['xeMP', ['XeF₂', 'XeF₄', 'XeF₆'], 'min'], ['xeMP', ['XeF₂', 'XeF₄', 'XeF₆'], 'max'], ['xeBL', ['XeF₂', 'XeF₄', 'XeF₆'], 'min'],
];
export const trendKey = (table, set, dir) => {
  const d = TABLES[table].data;
  return set.reduce((best, s) => (dir === 'max' ? (d[s] > d[best] ? s : best) : (d[s] < d[best] ? s : best)), set[0]);
};
const trends = PICKS.map(([table, set, dir], i) => {
  const T = TABLES[table], key = trendKey(table, set, dir);
  const vals = set.map((s) => `${s} ${T.data[s]}${T.unit ? ' ' + T.unit : ''}`).join(', ');
  return mc(`c2-trend-${String(i + 1).padStart(2, '0')}`, `${T.name}, ${dir === 'max' ? 'highest' : 'lowest'} of ${set.join(', ')}`,
    `Among ${set.join(', ')}, which has the **${dir === 'max' ? 'highest' : 'lowest'}** ${T.name}?`,
    set, set.indexOf(key), `${key}. ${T.why} (Slide values: ${vals}.)`, T.slide);
});
const trend = node('bk-c2-trend-gen', 'Pick the highest or lowest: halogens, noble gases and xenon fluorides', 'Chapter 2 Part 8 slides 21-23, 30, 33; template of the Kinjo example mid-terms (boiling point, ionisation energy, electron affinity picks)', 2, 'Periodic Trends', ['periodic-trends', 'halogens', 'noble-gases'], 1, 'trend-gen', trends);

/* ---------- 2. average oxidation number ---------- */
const AVG = [
  ['N₂O', 'N', 2, 0, -2, 'nitrous oxide'], ['N₂O₃', 'N', 2, 0, -6, 'dinitrogen trioxide'], ['N₂O₄', 'N', 2, 0, -8, 'dinitrogen tetroxide'], ['N₂O₅', 'N', 2, 0, -10, 'dinitrogen pentoxide'],
  ['N₂H₄', 'N', 2, 0, 4, 'hydrazine'], ['NH₂OH', 'N', 1, 0, 1, 'hydroxylamine'], ['NH₄NO₃ (average over both N atoms)', 'N', 2, 0, -2, 'ammonium nitrate'],
  ['Fe₃O₄', 'Fe', 3, 0, -8, 'magnetite'], ['Pb₃O₄', 'Pb', 3, 0, -8, 'red lead'], ['S₄O₆²⁻', 'S', 4, -2, -12, 'tetrathionate'], ['S₂O₃²⁻', 'S', 2, -2, -6, 'thiosulfate'],
  ['I₃⁻', 'I', 3, -1, 0, 'triiodide'], ['NaN₃', 'N', 3, 0, 1, 'sodium azide'],
];
export const avgOf = ([, , n, q, f]) => (q - f) / n;
const WHY = {
  'N₂O': 'O is −2, the molecule is neutral, so the two N share +2: +1 each.', 'N₂O₃': 'Three O give −6, so the two N share +6: average +3 (one N is +2 and the other +4 in the real structure, which is why it is an average).',
  'N₂O₄': 'Four O give −8: the two N share +8, average +4.', 'N₂O₅': 'Five O give −10: the two N share +10, average +5.', 'N₂H₄': 'Four H give +4, so the two N share −4: −2 each.',
  'NH₂OH': 'H₃ gives +3 and O is −2, together +1, so N is −1.', 'NH₄NO₃ (average over both N atoms)': 'NH₄⁺ has N(−3) and NO₃⁻ has N(+5), average (−3 + 5)/2 = +1.',
  'Fe₃O₄': 'Four O give −8, so the three Fe share +8: +8/3 = +2.67 on average (the real compound has one Fe²⁺ and two Fe³⁺).', 'Pb₃O₄': 'Four O give −8, three Pb share +8: +8/3 (two Pb(II) and one Pb(IV) in the real compound).',
  'S₄O₆²⁻': 'Six O give −12 and the ion is 2−, so the four S share +10: +2.5 on average.', 'S₂O₃²⁻': 'Three O give −6 and the ion is 2−, so the two S share +4: +2 on average.',
  'I₃⁻': 'The ion carries 1−, shared over three I: −1/3 each on average.', 'NaN₃': 'Na is +1, so the three N share −1: −1/3 on average.',
};
const avg = node('bk-c4-avgon-gen', 'Average oxidation number of an element in a formula', 'Template of the Kinjo example mid-terms (N₂O₃ in two papers) and the finals (average oxidation numbers of Mn₃O₄ and Mg₅Ga₂)', 4, 'Oxidation Numbers', ['average-oxidation-number'], 2, 'avgon-gen',
  AVG.map((r, i) => ({
    ...base(`c4-avgon-gen-${String(i + 1).padStart(2, '0')}`, `${r[0]}`, 2, `Give the average oxidation number of **${r[1]}** in **${r[0]}**. (Give a fraction as a decimal to two places.)`, WHY[r[0]], 's4-5',
      'Oxygen −2, hydrogen +1 (with a non-metal), sodium +1; the total must equal the charge on the species; divide what is left by the number of atoms of the element.'),
    inputSlot: { type: 'mapped_fields', layout: 'table', fields: [{ key: 'a', label: `Average oxidation number of ${r[1]}` }] },
    evaluator: { type: 'mapped_fields_match', targets: { a: { type: 'numeric', targetExpr: String(Number(avgOf(r).toFixed(4))), tolerance: 0.01 } } },
  })));

/* ---------- 3. nuclear equations ---------- */
const EL = { 1: ['H', 'hydrogen'], 2: ['He', 'helium'], 3: ['Li', 'lithium'], 4: ['Be', 'beryllium'], 5: ['B', 'boron'], 6: ['C', 'carbon'], 7: ['N', 'nitrogen'], 8: ['O', 'oxygen'], 12: ['Mg', 'magnesium'], 13: ['Al', 'aluminium|aluminum'], 14: ['Si', 'silicon'], 15: ['P', 'phosphorus'], 17: ['Cl', 'chlorine'], 18: ['Ar', 'argon'], 36: ['Kr', 'krypton'], 56: ['Ba', 'barium'], 92: ['U', 'uranium'] };
const iso = (A, Z) => `${sup(A)}${EL[Z][0]}`;
const NUC = [
  ['²⁷Al captures an α particle (⁴He) and then emits a neutron. Which isotope forms?', 30, 15, '²⁷Al + ⁴He → X + ¹n: A = 27 + 4 − 1 = 30, Z = 13 + 2 − 0 = 15, so ³⁰P.'],
  ['¹⁴N is hit by an α particle (⁴He) and a proton (¹H) is released. Which isotope forms?', 17, 8, '¹⁴N + ⁴He → X + ¹H: A = 14 + 4 − 1 = 17, Z = 7 + 2 − 1 = 8, so ¹⁷O (the first artificial transmutation).'],
  ['¹⁰B absorbs a neutron and splits into ⁴He and one other nucleus X. Identify X.', 7, 3, '¹⁰B + ¹n → ⁴He + X: A = 10 + 1 − 4 = 7, Z = 5 + 0 − 2 = 3, so ⁷Li.'],
  ['²³⁵U absorbs a neutron and splits into ¹⁴¹Ba, three neutrons and a second nucleus X. Identify X.', 92, 36, '²³⁵U + ¹n → ¹⁴¹Ba + 3 ¹n + X: A = 235 + 1 − 141 − 3 = 92, Z = 92 − 56 = 36, so ⁹²Kr.'],
  ['⁷Li captures a proton (¹H) and splits into two identical nuclei X. Identify X.', 4, 2, '⁷Li + ¹H → 2 X: A = (7 + 1)/2 = 4, Z = (3 + 1)/2 = 2, so ⁴He (an α particle each).'],
  ['²⁸Si captures a neutron and then emits a proton (¹H). Which isotope forms?', 28, 13, '²⁸Si + ¹n → X + ¹H: A = 28 + 1 − 1 = 28, Z = 14 + 0 − 1 = 13, so ²⁸Al.'],
  ['³⁷Cl captures a neutron and the product then undergoes one β⁻ decay. Which isotope results?', 38, 18, '³⁷Cl + ¹n → ³⁸Cl; β⁻ decay raises Z by 1 and leaves A unchanged: ³⁸Ar.'],
  ['²⁶Mg captures an α particle (⁴He) and then emits a neutron. Which isotope forms?', 29, 14, '²⁶Mg + ⁴He → X + ¹n: A = 26 + 4 − 1 = 29, Z = 12 + 2 = 14, so ²⁹Si.'],
];
const pat = (A, Z) => { const [s, names] = EL[Z]; return `^\\s*(?:\\^?\\s*${A}\\s*-?\\s*${s}|${s}\\s*-?\\s*${A}|${sup(A)}\\s*${s}|(?:${names})\\s*-?\\s*${A})\\s*(?:\\([^)]*\\))?\\s*\\.?\\s*$`; };
const nuc = node('bk-c4-nuclear-gen', 'Nuclear equations: find the unknown nucleus', 'Template of the Kinjo example mid-term (¹⁴N + n → T + X) and finals 2024-25 and 2025-26 (α capture, neutron capture then two β⁻)', 4, 'Nuclear Chemistry', ['nuclear-equation'], 2, 'nuclear-gen',
  NUC.map(([stem, A, Z, why], i) => ({
    ...base(`c4-nuclear-gen-${String(i + 1).padStart(2, '0')}`, iso(A, Z), 2, stem, why, 's4', 'Conserve the mass number A (top) and the atomic number Z (bottom) on both sides. β⁻ decay: Z + 1, A unchanged. α = ⁴He, neutron = ¹n (Z = 0), proton = ¹H.'),
    inputSlot: { type: 'typed_short', formatHint: 'e.g. 25Mg or Mg-25' },
    evaluator: { type: 'pattern_match', acceptedPatterns: [pat(A, Z)], caseSensitive: false, expectedDisplay: iso(A, Z) },
  })));

/* ---------- 4. HOMO electron counts ---------- */
const homoV = (id, label, species, why) => ({
  ...base(id, label, species.length, 'Based on MO theory, give the total number of electrons in the HOMO (count every electron in a degenerate HOMO set) of each species.', why, 's3',
    'Fill the valence MOs in energy order, then count the electrons in the highest occupied level (both orbitals if it is a degenerate pair or triple).'),
  inputSlot: { type: 'mapped_fields', layout: 'table', fields: species.map(([f], i) => ({ key: `h${i}`, label: f })) },
  evaluator: { type: 'mapped_fields_match', targets: Object.fromEntries(species.map(([, n], i) => [`h${i}`, { type: 'numeric', targetExpr: String(n), tolerance: 0 }])) },
});
const homo = node('bk-c3-homo-gen', 'HOMO electron counts for hydrides and small ions', 'Template of the Kinjo example mid-terms (CH₄ and OH⁻, C₂) and finals (SF₆, CH₄)', 3, 'Molecular Orbital Theory', ['homo', 'mo-diagram'], 3, 'homo-gen', [
  homoV('c3-homo-gen-v1', 'NH₃, H₂O, HF, BH₃, NO', [['NH₃', 2], ['H₂O', 2], ['HF', 4], ['BH₃', 4], ['NO', 1]],
    'NH₃: the HOMO is the non-bonding lone-pair a₁ orbital, 2 electrons. H₂O: the HOMO is the non-bonding out-of-plane O 2p lone pair (b₁), 2 electrons. HF: the HOMO is the degenerate non-bonding F 2p π pair, 4 electrons. BH₃ (6 valence electrons): a₁′ and e′ are filled, so the HOMO e′ pair holds 4 electrons. NO: the single unpaired electron sits in a degenerate π* orbital, 1 electron.'),
  homoV('c3-homo-gen-v2', 'SiH₄, CN⁻, O₂⁻, NO⁺, F₂', [['SiH₄', 6], ['CN⁻', 2], ['O₂⁻', 3], ['NO⁺', 2], ['F₂', 4]],
    'SiH₄ is like CH₄: a₁ then the t₂ set holds the last 6 electrons. CN⁻ and NO⁺ are isoelectronic with N₂ (10 valence electrons): the HOMO is the σ orbital with 2 electrons. O₂⁻ (13 valence electrons) puts 3 electrons in the π* pair. F₂ has all of π* filled: 4 electrons.'),
]);

/* ---------- 5. draw the crown ethers (the example papers ask 18-crown-6 twice and 15-crown-5 once, 1 mark each) ---------- */
const crownV = (id, name, ring, nO, ion, cavity) => ({
  ...base(id, name, 3, `Draw the structure of ${name} and say which alkali-metal ion it binds best.`,
    `${name}: a ring of ${ring} atoms (${nO} oxygen donors, each pair of neighbouring O atoms joined by –CH₂CH₂–). The cavity (${cavity}) matches ${ion}, so ${ion} is bound best; ions that are too small rattle in the cavity and ions that are too large do not fit.`, 's4-5',
    'Repeat –O–CH₂–CH₂– around the ring, count the ring atoms, then match the cavity size to the ion size.'),
  drawOnPaperThenCompare: true,
  inputSlot: { type: 'typed_synthesis', placeholder: 'Write the key points (or tick the box if you answered on paper)…', minWordsToUnlockRubric: 0, allowPaperScratchpad: true },
  evaluator: { type: 'atomic_rubric', rubric: [
    { id: 'r1', criterion: `A single ring of ${ring} atoms in total`, marks: 1, isCritical: true },
    { id: 'r2', criterion: `${nO} oxygen atoms, each separated from the next by two CH₂ groups (–O–CH₂CH₂–O–)`, marks: 1, isCritical: true },
    { id: 'r3', criterion: `Best-binding ion ${ion}, because the ion size matches the cavity size (${cavity})`, marks: 1, isCritical: false }] },
});
const crown = node('bk-c4-crown-draw', 'Draw a crown ether and name its best ion', 'Kinjo example mid-terms (18-crown-6 in two papers, 15-crown-5 in one); cavity sizes from the bank', 4, 'Crown Ethers', ['crown-ether', 'draw'], 3, 'crown-draw', [
  crownV('c4-crown-draw-12c4', '12-crown-4', 12, 4, 'Li⁺', '1.2–1.5 Å against Li⁺ 1.36 Å'),
  crownV('c4-crown-draw-15c5', '15-crown-5', 15, 5, 'Na⁺', '1.7–2.2 Å against Na⁺ 1.9 Å'),
  crownV('c4-crown-draw-18c6', '18-crown-6', 18, 6, 'K⁺', '2.6–3.2 Å against K⁺ 2.66 Å'),
]);

const NODES = [trend, avg, nuc, homo, crown];
const LINKS = {
  'bk-c2-trend-gen': ['c2.periodic-trends', 'c4.halogens', 'c4.noble'],
  'bk-c4-avgon-gen': ['c4.ox-number'],
  'bk-c4-nuclear-gen': ['c4.nuclear'],
  'bk-c3-homo-gen': ['c3.homo-count'],
  'bk-c4-crown-draw': ['c4.crown'],
};
export { NODES, EL };

if (process.argv[1].endsWith('kinjo.mjs')) {
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
