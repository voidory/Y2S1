/* Kinjo half, batch 2: Chapter 1 Parts 1-5 (VSEPR review, ionic and heavier elements, van der Waals and H-bonding, dative and metallic bonds, MO theory and LGO).
   Slides read: 2025-Chapter1_Part1..Part5 (the VSEPR/Lewis/hybridisation part carries no finals marks in 300, so it is not drilled further).
   Built here (answers from tables printed on the slides or from counting rules that tests/kinjo2-items.test.mjs recomputes):
   - bk-c2-trend-gen2   pick the highest/lowest from the Part 2 heavier-group-14 table (E≡E length, trans-bend angle, E–E length), the Part 4 metal
                        melting/boiling points (periods and Group 1), the Part 3 hydride boiling-point table and the noble-gas/alkane electron-count table
   - bk-c1-partial-charge  Part 4 slide 53-55: formal charge against partial charge in NH₃→BF₃ (charge donated, accepted, left on F)
   - bk-c3-ahn-count    Part 5 CH₄ and H₂O LGO diagrams: number of MOs by type, electrons in the non-bonding MOs, bond order per A–H bond
   - bk-c3-diatomic-gen Part 5 homonuclear/heteronuclear diatomics: bond order and unpaired electrons, with s–p mixing for ≤ 10 valence electrons
   - bk-c2-solid-props  Part 2 slides 9-11, Part 4 slides 58-65, Part 3 slide 45: brittleness, conduction, metal melting points, graphite, H-bond count
   Run: node tools/cm2021/kinjo2.mjs */
import fs from 'node:fs';

const DIR = 'public/content';
const L = 'abcdefghij';
const base = (id, label, marks, stem, explanation, sourceSlide, hint) => ({ variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation, sourceSlide });
const mc = (id, label, stem, opts, key, explanation, slide, marks = 1) => ({
  ...base(id, label, marks, stem, explanation, slide),
  inputSlot: { type: 'choice', selectionMode: 'single', options: opts.map((o, i) => ({ id: L[i], label: o })), shuffleOptions: true },
  evaluator: { type: 'choice_match', targetIds: [L[key]], gradingMode: 'exact' },
});
const multi = (id, label, stem, opts, keys, explanation, slide, marks = 2) => ({
  ...base(id, label, marks, stem, explanation, slide),
  inputSlot: { type: 'choice', selectionMode: 'multi', options: opts.map((o, i) => ({ id: L[i], label: o })), shuffleOptions: true },
  evaluator: { type: 'choice_match', targetIds: keys.map((k) => L[k]), gradingMode: 'partial_with_penalty' },
});
const rubric = (id, label, stem, points, explanation, slide, hint) => ({
  ...base(id, label, points.length, stem, explanation, slide, hint),
  inputSlot: { type: 'typed_synthesis', placeholder: 'Write the key points (or tick the box if you answered on paper)…', minWordsToUnlockRubric: 8, allowPaperScratchpad: true },
  evaluator: { type: 'atomic_rubric', rubric: points.map((p, i) => ({ id: `r${i + 1}`, criterion: p, marks: 1, isCritical: i === 0 })) },
});
const numFields = (id, label, stem, fields, explanation, slide, hint) => ({
  ...base(id, label, fields.length, stem, explanation, slide, hint),
  inputSlot: { type: 'mapped_fields', layout: 'table', fields: fields.map(([k, lab]) => ({ key: k, label: lab })) },
  evaluator: { type: 'mapped_fields_match', targets: Object.fromEntries(fields.map(([k, , v, tol]) => [k, { type: 'numeric', targetExpr: String(v), tolerance: tol ?? 0 }])) },
});
const node = (id, title, source, week, theme, tags, est, family, variants) => ({
  schemaVersion: '3.0', id, moduleCode: 'CM2021', tier: 'atomic',
  metadata: { title, source, week, primaryTheme: theme, conceptTags: tags, difficultyEstimate: 3, estimatedMinutes: est, examStyle: 'short_2to3', family },
  variants,
});

/* ---------- 1. pick the highest or lowest, from the Chapter 1 slide tables ---------- */
export const TABLES2 = {
  g14len: { name: 'E≡E bond length in R–E≡E–R', unit: 'Å', slide: 'ch1-p2 s32', data: { C: 1.2, Si: 2.06, Ge: 2.29, Sn: 2.67, Pb: 3.19 }, why: 'The triple bond lengthens down Group 14 as the atoms get bigger and the np orbitals overlap less.' },
  g14ang: { name: 'E–E–C bond angle in R–E≡E–R', unit: '°', slide: 'ch1-p2 s32', data: { C: 180, Si: 137.4, Ge: 128.7, Sn: 125.1, Pb: 94.3 }, why: 'Only carbon is linear. The heavier analogues are trans-bent, and the bend grows down the group until Pb is close to 90°: the ns pair behaves like a core-like lone pair and the np orbitals bond at nearly right angles.' },
  g14single: { name: 'E–E single-bond length', unit: 'Å', slide: 'ch1-p2 s32', data: { C: 1.54, Si: 2.34, Ge: 2.44, Sn: 2.81, Pb: 2.9 }, why: 'Single bonds lengthen down the group with atomic size.' },
  metMP: { name: 'melting point of the metal', unit: '°C', slide: 'ch1-p4 s63-64', data: { Li: 181, Na: 98, K: 63, Mg: 650, Al: 659 }, why: 'Metallic bonding is the pull of the electron cloud on the ion cores. Across a period each atom donates more electrons (Na 1, Mg 2, Al 3) so the cloud is denser and the ions are held harder; down a group the ions get bigger and the cloud holds them less effectively, so the melting point falls (Li 181, Na 98, K 63).' },
  metBP: { name: 'boiling point of the metal', unit: '°C', slide: 'ch1-p4 s63-64', data: { Li: 1313, Na: 890, K: 774, Mg: 1110, Al: 2470 }, why: 'Same reasoning as the melting point: more electrons donated per atom strengthens the metallic bond across a period (Na 890, Mg 1110, Al 2470), and bigger ions weaken it down a group (Li 1313, Na 890, K 774).' },
  hydBP: { name: 'boiling point of the hydride', unit: '°C', slide: 'ch1-p3 s42', data: { 'CH₄': -161, 'SiH₄': -117, 'GeH₄': -90, 'SnH₄': -50, 'NH₃': -33, 'PH₃': -90, 'AsH₃': -55, 'SbH₃': -17, 'H₂O': 100, 'H₂S': -61, 'H₂Se': -40, 'H₂Te': -2, 'HF': 20, 'HCl': -85, 'HBr': -69, 'HI': -35 }, why: 'Within a group the boiling point rises with the number of electrons (stronger dispersion forces), but the first member of Groups 15, 16 and 17 (NH₃, H₂O, HF) breaks the trend because of hydrogen bonding. (Slide values in °C.)' },
  gasBP: { name: 'boiling point of the gas or alkane', unit: '°C', slide: 'ch1-p3 s37', data: { He: -269, Ne: -246, Ar: -186, Kr: -152, 'CH₄': -161, 'C₂H₆': -88, 'C₃H₈': -42 }, why: 'More electrons means a more polarisable electron cloud and stronger instantaneous-dipole attractions, so the boiling point rises along He < Ne < Ar < Kr and CH₄ < C₂H₆ < C₃H₈.' },
};
const PICKS2 = [
  ['g14len', ['Si', 'Ge', 'Pb'], 'min'], ['g14len', ['C', 'Sn', 'Pb'], 'max'], ['g14ang', ['Si', 'Ge', 'Sn'], 'min'], ['g14ang', ['Si', 'Sn', 'Pb'], 'max'], ['g14ang', ['C', 'Ge', 'Pb'], 'min'],
  ['g14single', ['C', 'Si', 'Ge'], 'max'],
  ['metMP', ['Na', 'Mg', 'Al'], 'max'], ['metMP', ['Na', 'Mg', 'Al'], 'min'], ['metMP', ['Li', 'Na', 'K'], 'max'], ['metMP', ['Li', 'Na', 'K'], 'min'], ['metBP', ['Na', 'Mg', 'Al'], 'max'], ['metBP', ['Li', 'Na', 'K'], 'min'],
  ['hydBP', ['NH₃', 'PH₃', 'AsH₃'], 'max'], ['hydBP', ['NH₃', 'PH₃', 'AsH₃'], 'min'], ['hydBP', ['PH₃', 'AsH₃', 'SbH₃'], 'max'], ['hydBP', ['H₂O', 'H₂S', 'H₂Se'], 'max'], ['hydBP', ['H₂O', 'H₂S', 'H₂Se'], 'min'],
  ['hydBP', ['H₂S', 'H₂Se', 'H₂Te'], 'max'], ['hydBP', ['HF', 'HCl', 'HBr'], 'max'], ['hydBP', ['HF', 'HCl', 'HBr'], 'min'], ['hydBP', ['HCl', 'HBr', 'HI'], 'max'], ['hydBP', ['CH₄', 'GeH₄', 'SnH₄'], 'max'],
  ['gasBP', ['He', 'Ne', 'Kr'], 'max'], ['gasBP', ['Ne', 'Ar', 'Kr'], 'min'], ['gasBP', ['CH₄', 'C₂H₆', 'C₃H₈'], 'max'], ['gasBP', ['CH₄', 'C₂H₆', 'C₃H₈'], 'min'],
];
export const trendKey2 = (table, set, dir) => {
  const d = TABLES2[table].data;
  return set.reduce((best, s) => (dir === 'max' ? (d[s] > d[best] ? s : best) : (d[s] < d[best] ? s : best)), set[0]);
};
const trends = PICKS2.map(([table, set, dir], i) => {
  const T = TABLES2[table], key = trendKey2(table, set, dir);
  const vals = set.map((s) => `${s} ${T.data[s]}${T.unit ? ' ' + T.unit : ''}`).join(', ');
  return mc(`c2-trend2-${String(i + 1).padStart(2, '0')}`, `${T.name}, ${dir === 'max' ? 'highest' : 'lowest'} of ${set.join(', ')}`,
    `Among ${set.join(', ')}, which has the **${dir === 'max' ? 'highest' : 'lowest'}** ${T.name}?`,
    set, set.indexOf(key), `${key}. ${T.why} (Slide values: ${vals}.)`, T.slide);
});
const trend2 = node('bk-c2-trend-gen2', 'Pick the highest or lowest: heavier Group 14, metals, hydrides', 'Chapter 1 Part 2 slide 32, Part 3 slides 37 and 42, Part 4 slides 63-64; template of the Kinjo example mid-terms (boiling-point and trend picks)', 2, 'Periodic Trends', ['periodic-trends', 'boiling-point', 'heavier-group-14'], 1, 'trend-gen2', trends);

/* ---------- 2. formal charge against partial charge in a dative bond (Part 4 slides 53-55) ---------- */
const pc = (id, label, donor, acceptor, qD0, qD1, qA0, qA1, fD, fA, extra) => {
  const don = Number((Math.abs(qD1) < Math.abs(qD0) ? Math.abs(qD0) - Math.abs(qD1) : 0).toFixed(2));
  const acc = Number((qA0 - qA1).toFixed(2));
  const rest = Number((don - acc).toFixed(2));
  return numFields(id, label, `${extra}In the free ${donor} the partial charge on the donor atom is **${qD0}**, and in the free ${acceptor} the partial charge on the acceptor atom is **+${qA0}**. After the adduct forms they are **${qD1}** and **+${qA1}**. (Partial charges come from a calculation.) Give: the formal charge on each of the two atoms in the adduct, and how much charge (electron density) the donor atom has given up and the acceptor atom has gained.`,
    [['fd', `Formal charge on the donor atom in the adduct`, fD], ['fa', `Formal charge on the acceptor atom in the adduct`, fA], ['don', `Charge donated by the donor atom`, don, 0.011], ['acc', `Charge gained by the acceptor atom`, acc, 0.011], ['rest', `Charge that went onto the rest of the acceptor molecule`, rest, 0.011]],
    `Formal charges treat the shared pair as split equally: the donor becomes ${fD > 0 ? '+' : ''}${fD} and the acceptor ${fA}. The partial charges tell the real story: the donor goes from ${qD0} to ${qD1}, so it gave up ${don}; the acceptor goes from +${qA0} to +${qA1}, so it gained only ${acc}; the remaining ${rest} was passed on to the other atoms of the acceptor.`,
    'ch1-p4 s53-54', 'Charge given up = the change in the donor’s partial charge; charge gained = the change in the acceptor’s partial charge; the difference was spread over the other atoms.');
};
const partial = node('bk-c1-partial-charge', 'Dative bond: formal charge against partial charge', 'Chapter 1 Part 4 slides 52-55 (NH₃→BF₃ with partial charges -0.8/+0.9 → -0.5/+0.7)', 1, 'Dative Bonding', ['dative-bond', 'formal-charge', 'partial-charge'], 3, 'partial-charge', [
  pc('c1-partial-charge-v1', 'NH₃→BF₃ (slide values)', 'NH₃', 'BF₃', -0.8, -0.5, 0.9, 0.7, 1, -1, ''),
  pc('c1-partial-charge-v2', 'H₃N→AlCl₃ (hypothetical values)', 'NH₃', 'AlCl₃', -0.8, -0.55, 1.1, 0.9, 1, -1, 'Take these as hypothetical values for the adduct H₃N–AlCl₃. '),
  pc('c1-partial-charge-v3', 'Me₃N→BH₃ (hypothetical values)', 'Me₃N', 'BH₃', -0.6, -0.4, 0.3, 0.1, 1, -1, 'Take these as hypothetical values for the adduct Me₃N–BH₃. '),
  mc('c1-partial-charge-v4', 'which statement is right', 'In H₃N→BF₃ the formal charges are +1 on N and −1 on B. Which statement is correct?',
    ['The formal charges are misleading about electron flow: the partial charges show N is still electron-rich and B electron-poor, although N has donated about 0.3 of charge', 'N carries +1 so it ends up electron-poor and B ends up electron-rich', 'The formal charge on N and B is zero in the free molecules and still zero in the adduct', 'Formal charge measures how much electron density has really moved, so it is the best guide to a dative bond', 'The bond is purely ionic because N is +1 and B is −1'], 0,
    'Formal charge assumes the bond pair is shared exactly equally, so it only keeps count of electrons. Partial charges (from calculation) show that N is still negative (−0.5) and B still positive (+0.7). Formal charge is not a good indicator of electron flow.', 'ch1-p4 s53-55', 1),
  rubric('c1-partial-charge-v5', 'why formal charge misleads', 'Explain why formal charges are not a good indicator of electron flow in the dative adduct H₃N→BF₃.',
    ['Formal charge assumes the shared pair is split equally between the two atoms (a purely covalent bond)', 'In the adduct the formal charges are N +1 and B −1, but the calculated partial charges are N negative and B positive', 'So N is still electron-rich and B electron-poor: only a fraction of the charge (about 0.3 from N, 0.2 reaching B) has moved, and some is passed on to the F atoms'],
    'Formal charge counts electrons by a fixed rule (equal sharing). Partial charges show the real distribution: N goes from −0.8 to −0.5 (gives up ~0.3) and B from +0.9 to +0.7 (gains ~0.2), with the rest on F.', 'ch1-p4 s53-55', 'Think: what does the formal-charge rule assume about the bond pair, and what do the calculated charges say?'),
]);

/* ---------- 3. bonding / non-bonding / antibonding MOs of an AHn molecule (Part 5 CH₄ and H₂O LGO slides) ---------- */
const AHN = [
  ['CH₄', 4, 4, [4, 0, 4], 0, 'Eight AOs (C 2s, 2p ×3 and four H 1s as LGOs) give eight MOs. The a₁ and t₂ sets are bonding (4 MOs, 8 electrons) and the t₂* and a₁* sets are antibonding. There is no non-bonding MO.'],
  ['NH₃', 4, 3, [3, 1, 3], 2, 'Seven AOs give seven MOs: three bonding (a₁ and the e pair), the N lone-pair a₁ orbital that is non-bonding (2 electrons), and three antibonding.'],
  ['H₂O', 4, 2, [2, 2, 2], 4, 'Six AOs give six MOs: two bonding, two non-bonding (the O lone pairs, 4 electrons) and two antibonding. The 4 bonding electrons give 2 O–H bonds in total.'],
  ['BH₃', 4, 3, [3, 1, 3], 0, 'Seven AOs give seven MOs: three bonding (6 electrons, three B–H bonds), the empty B 2p orbital perpendicular to the plane is non-bonding (0 electrons) and three antibonding.'],
  ['BeH₂', 4, 2, [2, 2, 2], 0, 'Six AOs give six MOs: two bonding (4 electrons), two empty non-bonding Be 2p orbitals and two antibonding.'],
];
const ahn = node('bk-c3-ahn-count', 'MO count for AHₙ hydrides: bonding, non-bonding, antibonding', 'Chapter 1 Part 5 slides 51-62 (CH₄ and H₂O with ligand group orbitals; number of MOs = number of AOs)', 3, 'Molecular Orbital Theory', ['mo-diagram', 'lgo', 'bond-order'], 3, 'ahn-count', AHN.map(([f, a, n, [b, nb, ab], enb, why], i) => numFields(`c3-ahn-count-${i + 1}`, f,
  `Build the MO diagram of ${f} from the central-atom valence AOs and the H 1s ligand group orbitals (number of MOs = number of AOs). Give the number of MOs of each kind, the number of electrons in the non-bonding MOs, and the bond order of each A–H bond.`,
  [['b', 'Bonding MOs', b], ['nb', 'Non-bonding MOs', nb], ['ab', 'Antibonding MOs', ab], ['enb', 'Electrons in the non-bonding MOs', enb], ['bo', 'Bond order of one A–H bond', 1]],
  `${why} Bond order per A–H bond = (electrons in bonding MOs − electrons in antibonding MOs) / 2 / number of A–H bonds = 1.`, 'ch1-p5 s51-62', 'Total MOs = total AOs (central atom 4 valence AOs + one per H). Count the central-atom orbitals with no matching LGO as non-bonding.')));

/* ---------- 4. bond order and unpaired electrons of diatomics, with s–p mixing for the early ones (Part 5 slides 25-33) ---------- */
const mixLevels = [[2, 1], [2, -1], [4, 1], [2, 1], [4, -1], [2, -1]];       // σ2s σ*2s π2p σ2p π*2p σ*2p  (capacity, +1 bonding / −1 antibonding)
const plainLevels = [[2, 1], [2, -1], [2, 1], [4, 1], [4, -1], [2, -1]];     // σ2s σ*2s σ2p π2p π*2p σ*2p
export function fillDiatomic(ve, mix) {
  let left = ve, b = 0, a = 0, last = 0, lastCap = 0;
  for (const [cap, sign] of (mix ? mixLevels : plainLevels)) {
    if (left <= 0) break;
    const k = Math.min(cap, left); left -= k;
    if (sign > 0) b += k; else a += k;
    last = k; lastCap = cap;
  }
  const unpaired = lastCap === 4 ? (last <= 2 ? last : 4 - last) : (last === 1 ? 1 : 0);
  return { bo: (b - a) / 2, unpaired };
}
const DI = [
  ['B₂', 6, true], ['C₂', 8, true], ['N₂⁺', 9, true], ['O₂⁺', 11, false], ['O₂⁻', 13, false], ['O₂²⁻', 14, false], ['F₂', 14, false], ['F₂⁺', 13, false], ['Ne₂', 16, false],
  ['Li₂', 2, true], ['Be₂', 4, true], ['C₂²⁻', 10, true], ['CN', 9, true], ['CO⁺', 9, true], ['NO⁻', 12, false], ['N₂⁻', 11, true], ['NO', 11, true], ['NO⁺', 10, true],
];
const diNote = { 'B₂': 'with s–p mixing the π2p pair lies below σ2p, so the last two electrons sit singly in the degenerate π pair (paramagnetic)', 'C₂': 'with s–p mixing the π2p set holds the last four electrons (diamagnetic, two π bonds)', 'Be₂': 'σ2s and σ*2s are both full, so there is no net bond', 'Ne₂': 'every bonding and antibonding MO is full, so there is no net bond' };
const diV = (id, label, sp) => numFields(id, label, 'Using the MO diagram (s–p mixing for the early diatomics Li₂ to N₂ and their isoelectronic relatives, no mixing for O₂ and F₂), give the bond order and the number of unpaired electrons of each species.',
  sp.flatMap(([name], i) => [[`bo${i}`, `Bond order of ${name}`, fillDiatomic(DI.find((d) => d[0] === name)[1], DI.find((d) => d[0] === name)[2]).bo, 0.01], [`n${i}`, `Unpaired electrons in ${name}`, fillDiatomic(DI.find((d) => d[0] === name)[1], DI.find((d) => d[0] === name)[2]).unpaired]]),
  sp.map(([name]) => { const d = DI.find((x) => x[0] === name), r = fillDiatomic(d[1], d[2]); return `${name} (${d[1]} valence electrons): bond order ${r.bo}, ${r.unpaired} unpaired${diNote[name] ? ' — ' + diNote[name] : ''}.`; }).join(' '),
  'ch1-p5 s25-33', 'Count valence electrons (2s and 2p), fill σ2s, σ*2s, then π2p/σ2p (π below σ if there is s–p mixing), then π*2p, σ*2p. Bond order = (bonding − antibonding)/2.');
const diatomic = node('bk-c3-diatomic-gen', 'Bond order and unpaired electrons of diatomic species', 'Chapter 1 Part 5 slides 25-33; template of the Kinjo example mid-terms (diatomic bond orders and magnetism)', 3, 'Molecular Orbital Theory', ['mo-diagram', 'bond-order', 'magnetism'], 3, 'diatomic-gen', [
  diV('c3-diatomic-gen-v1', 'B₂, C₂, N₂⁺', [['B₂'], ['C₂'], ['N₂⁺']]), diV('c3-diatomic-gen-v2', 'O₂⁺, O₂⁻, O₂²⁻', [['O₂⁺'], ['O₂⁻'], ['O₂²⁻']]), diV('c3-diatomic-gen-v3', 'F₂, F₂⁺, Ne₂', [['F₂'], ['F₂⁺'], ['Ne₂']]),
  diV('c3-diatomic-gen-v4', 'Li₂, Be₂, C₂²⁻', [['Li₂'], ['Be₂'], ['C₂²⁻']]), diV('c3-diatomic-gen-v5', 'CN, CO⁺, NO⁻', [['CN'], ['CO⁺'], ['NO⁻']]), diV('c3-diatomic-gen-v6', 'N₂⁻, NO, NO⁺', [['N₂⁻'], ['NO'], ['NO⁺']]),
]);

/* ---------- 5. properties of solids and H-bond counting (Part 2 slides 9-11, Part 3 slide 45, Part 4 slides 58-65) ---------- */
const solids = node('bk-c2-solid-props', 'Properties of ionic, metallic and covalent solids; hydrogen-bond count', 'Chapter 1 Part 2 slides 9-11, Part 3 slides 44-45, Part 4 slides 58-65', 2, 'Solids and Intermolecular Forces', ['ionic-solid', 'metallic-bonding', 'hydrogen-bond', 'covalent-network'], 2, 'solid-props', [
  mc('c2-solid-props-1', 'ionic solids are brittle', 'Why is an ionic crystal such as NaCl brittle?',
    ['A slip of one layer puts ions of the same charge next to each other, the repulsion splits the crystal', 'The ions are held by weak van der Waals forces that break easily', 'The electrons are free to move so the lattice collapses', 'The ionic bonds are directional covalent bonds that snap when bent', 'The crystal has no regular lattice'], 0,
    'In the lattice cations and anions alternate. Moving a layer by one ion puts like charges face to face; they repel and the crystal cleaves. (Metals do not do this: their electron cloud keeps binding the ions after the layers slide.)', 'ch1-p2 s10'),
  multi('c2-solid-props-2', 'NaCl conduction', 'Which forms of NaCl conduct electricity? Select all.',
    ['Molten NaCl', 'Solid NaCl', 'NaCl dissolved in water', 'NaCl dissolved in hexane', 'A single crystal of NaCl at room temperature'], [0, 2],
    'Conduction needs mobile charge carriers. In the solid the ions are fixed in the lattice. When melted or dissolved in water they are free to move to the electrodes. Hexane is non-polar and does not dissolve NaCl, so there are no free ions.', 'ch1-p2 s9-11'),
  mc('c2-solid-props-3', 'Mg against Na', 'Why does magnesium melt at a much higher temperature than sodium (650 °C against 98 °C)?',
    ['Each Mg atom donates two electrons to the cloud (denser cloud, smaller 2+ ion), so the ions are held more strongly', 'Mg atoms are larger so they overlap more', 'Mg has fewer valence electrons than Na', 'Mg forms covalent bonds and Na does not', 'Mg is a transition metal'], 0,
    'The strength of metallic bonding depends on the number of electrons donated to the cloud and on the size of the ion. Mg gives two electrons per atom and its ion is small and doubly charged, so the cloud holds the ions together more strongly than for Na⁺.', 'ch1-p4 s59-63'),
  mc('c2-solid-props-4', 'K against Na', 'Why does potassium melt at a lower temperature than sodium (63 °C against 98 °C)?',
    ['The K⁺ ion is larger, so the electron cloud is less effective at holding the ions together', 'K donates more electrons per atom than Na', 'K atoms are smaller than Na atoms', 'K has a stronger ionic bond', 'K is less reactive than Na'], 0,
    'Both donate one electron per atom. Going down the group the ionic radius increases, the electron cloud has a larger volume to cover and holds the ions less effectively, so the metal is easier to melt.', 'ch1-p4 s60-64'),
  mc('c2-solid-props-5', 'graphite against diamond', 'Graphite conducts electricity although diamond does not. Why?',
    ['Graphite has delocalised π electrons that can move along the layers', 'Graphite contains mobile ions', 'Diamond is a metal', 'Graphite has no covalent bonds', 'Graphite has a lower melting point than diamond'], 0,
    'Each carbon in graphite is sp² with one leftover p electron; these form a delocalised π system across the layer, so charge can flow. In diamond all four valence electrons are in localised σ bonds, so there are no mobile carriers. (Graphite is soft because the layers slip over each other.)', 'ch1-p4 s65'),
  rubric('c2-solid-props-6', 'malleable metals', 'Explain why a metal can be hammered into a sheet (malleable) or drawn into a wire (ductile), but an ionic crystal shatters.',
    ['In a metal the ions sit in a sea of delocalised electrons', 'When the layers of ions slide past each other the electron cloud still surrounds and binds the ions, so no bonds are broken and the shape changes', 'In an ionic crystal sliding a layer puts like charges next to each other, which repel and split the crystal (brittle)'],
    'Metal: sliding layers leaves the electron cloud binding the ion cores, so the metal deforms. Ionic solid: a one-ion slip brings ions of the same charge face to face and the crystal fractures.', 'ch1-p2 s10, ch1-p4 s58-61', 'Compare what keeps the particles together after a layer slides.'),
  numFields('c2-solid-props-7', 'hydrogen bonds per molecule', 'A molecule can form a hydrogen bond only through an H atom on N, O or F and a lone pair on N, O or F. HF has 1 such H and 3 lone pairs, H₂O has 2 H and 2 lone pairs, NH₃ has 3 H and 1 lone pair. How many hydrogen bonds can each molecule make per molecule in the liquid, taking the shorter supply (H atoms or lone pairs) as the limit?',
    [['hf', 'HF', 1], ['h2o', 'H₂O', 2], ['nh3', 'NH₃', 1]],
    'The limit is the smaller of the number of H atoms and the number of lone pairs: HF has 1 H (3 lone pairs spare), NH₃ has 1 lone pair (2 H atoms spare), whereas H₂O has 2 H and 2 lone pairs matched, so each molecule can form 2 hydrogen bonds. This is why H₂O (bp +100 °C) boils higher than HF (+20 °C) and NH₃ (−33 °C).', 'ch1-p3 s45', 'Both quality (how polar) and quantity (how many H-bonds per molecule) matter.'),
  mc('c2-solid-props-8', 'highest boiling point of HF, H₂O, NH₃', 'HF (bp +20 °C), H₂O (+100 °C) and NH₃ (−33 °C): which statement explains why water has the highest boiling point?',
    ['Water has two H atoms and two lone pairs, so each molecule can make two hydrogen bonds, more than HF or NH₃', 'Water has the largest molar mass of the three', 'Water has no hydrogen bonds but strong dispersion forces', 'Water has the most electrons so van der Waals forces dominate', 'The O–H bond is the longest'], 0,
    'The number of H bonds per molecule is limited by the smaller of the H atoms and lone pairs available: 1 for HF, 2 for H₂O, 1 for NH₃. Molar mass cannot explain it (H₂O is the lightest of the three).', 'ch1-p3 s44-45'),
]);

const NODES = [trend2, partial, ahn, diatomic, solids];
const LINKS = {
  'bk-c2-trend-gen2': ['c2.periodic-trends', 'c2.imf-bp', 'c2.double-bond-rule'],
  'bk-c1-partial-charge': ['c1.dative', 'c1.formal-charge'],
  'bk-c3-ahn-count': ['c3.polyatomic', 'c3.lgo'],
  'bk-c3-diatomic-gen': ['c3.diatomic', 'c3.diatomic-magnetism'],
  'bk-c2-solid-props': ['c2.solid-types', 'c2.hbond-anomaly'],
};
export { NODES };

if (process.argv[1].endsWith('kinjo2.mjs')) {
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
