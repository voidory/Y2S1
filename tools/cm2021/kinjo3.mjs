/* Kinjo half, batch 3: Chapter 2 Parts 4-8 (Groups 13 to 18). These five decks repeat material already ingested from the Chapter 4 deck
   (about 50 slide facts and equations were checked against the bank and the Reactions list: nearly all were present). What was thin and is
   examined every year is the oxidation number, so this adds:
   - bk-c4-ox-gen       oxidation numbers of the element in 10 sets of species taken from the slides (N oxides and oxoacids, P, S, Cl species,
                        hydridic H in silanes and boranes against CH₄, Au/Al/B/Si in aqua regia, cryolite, borax, silicate)
   - bk-c4-silicate-gen charge of silicate anions from the formula, and terminal against bridging O (slide 'each terminal O contributes −1')
   - bk-c4-facts-gen    E–H bond energy and length (Group 14 slide), SO₃ polymorph melting points, interhalogen formula rules and conditions
   Answers come from the sum rule (tests/kinjo3-items.test.mjs recomputes them with its own table). Run: node tools/cm2021/kinjo3.mjs */
import fs from 'node:fs';

const DIR = 'public/content';
const L = 'abcdefghij';
const base = (id, label, marks, stem, explanation, sourceSlide, hint) => ({ variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation, sourceSlide });
const mc = (id, label, stem, opts, key, explanation, slide, marks = 1) => ({
  ...base(id, label, marks, stem, explanation, slide),
  inputSlot: { type: 'choice', selectionMode: 'single', options: opts.map((o, i) => ({ id: L[i], label: o })), shuffleOptions: true },
  evaluator: { type: 'choice_match', targetIds: [L[key]], gradingMode: 'exact' },
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

/* ---------- 1. oxidation numbers (sum rule) ---------- */
// species: [display, element, atoms of the element, overall charge, [[oxidation number, count] of every other atom], rule used]
const OX = [
  ['N₂O', 'N', 2, 0, [[-2, 1]], 'O is −2'], ['NO', 'N', 1, 0, [[-2, 1]], 'O is −2'], ['N₂O₃', 'N', 2, 0, [[-2, 3]], 'O is −2'], ['NO₂', 'N', 1, 0, [[-2, 2]], 'O is −2'],
  ['N₂O₅', 'N', 2, 0, [[-2, 5]], 'O is −2'], ['NO₂⁺', 'N', 1, 1, [[-2, 2]], 'O is −2, the ion is 1+ (the nitronium ion in N₂O₅)'], ['NO₃⁻', 'N', 1, -1, [[-2, 3]], 'O is −2'], ['NO₂⁻', 'N', 1, -1, [[-2, 2]], 'O is −2'],
  ['HNO₂', 'N', 1, 0, [[1, 1], [-2, 2]], 'H is +1 (bonded to O), O is −2'], ['HNO₃', 'N', 1, 0, [[1, 1], [-2, 3]], 'H is +1, O is −2'], ['H₂N₂O₂ (hyponitrous acid)', 'N', 2, 0, [[1, 2], [-2, 2]], 'H is +1, O is −2'], ['NH₂OH', 'N', 1, 0, [[1, 3], [-2, 1]], 'H is +1 (all three H are bonded to the less electronegative... N and O are both more electronegative than H), O is −2'],
  ['NOCl', 'N', 1, 0, [[-2, 1], [-1, 1]], 'O is −2, Cl is −1'], ['NO⁺', 'N', 1, 1, [[-2, 1]], 'O is −2, the ion is 1+'], ['NH₄⁺', 'N', 1, 1, [[1, 4]], 'H is +1'], ['N₂H₄', 'N', 2, 0, [[1, 4]], 'H is +1'],
  ['H₃PO₄', 'P', 1, 0, [[1, 3], [-2, 4]], 'H is +1, O is −2'], ['H₃PO₃', 'P', 1, 0, [[1, 3], [-2, 3]], 'H is +1, O is −2'], ['P₄O₆', 'P', 4, 0, [[-2, 6]], 'O is −2'], ['P₄O₁₀', 'P', 4, 0, [[-2, 10]], 'O is −2'],
  ['PCl₃', 'P', 1, 0, [[-1, 3]], 'Cl is −1'], ['PCl₅', 'P', 1, 0, [[-1, 5]], 'Cl is −1'], ['PCl₄⁺', 'P', 1, 1, [[-1, 4]], 'Cl is −1, the ion is 1+'], ['PCl₆⁻', 'P', 1, -1, [[-1, 6]], 'Cl is −1, the ion is 1−'], ['PH₃', 'P', 1, 0, [[1, 3]], 'H is +1 (P is less electronegative than... H is 2.2 and P is 2.2, so H is taken as +1 by convention for a p-block hydride; the value is −3)'],
  ['SO₂', 'S', 1, 0, [[-2, 2]], 'O is −2'], ['SO₃', 'S', 1, 0, [[-2, 3]], 'O is −2'], ['H₂S₂O₇', 'S', 2, 0, [[1, 2], [-2, 7]], 'H is +1, O is −2'], ['SF₆', 'S', 1, 0, [[-1, 6]], 'F is −1'], ['H₂SO₃', 'S', 1, 0, [[1, 2], [-2, 3]], 'H is +1, O is −2'],
  ['ClO₂', 'Cl', 1, 0, [[-2, 2]], 'O is −2'], ['ClO₂⁻', 'Cl', 1, -1, [[-2, 2]], 'O is −2'], ['ClO₃⁻', 'Cl', 1, -1, [[-2, 3]], 'O is −2'], ['ClO₄⁻', 'Cl', 1, -1, [[-2, 4]], 'O is −2'], ['HClO', 'Cl', 1, 0, [[1, 1], [-2, 1]], 'H is +1, O is −2'],
  ['SiH₄', 'Si', 1, 0, [[-1, 4]], 'H is −1: hydrogen (2.2) is more electronegative than silicon (1.9), so silanes are hydridic'], ['CH₄', 'C', 1, 0, [[1, 4]], 'H is +1: carbon (2.5) is more electronegative than hydrogen (2.2)'], ['SiH₃Cl', 'Si', 1, 0, [[-1, 3], [-1, 1]], 'H is −1 (silanes are hydridic) and Cl is −1'],
  ['SiHCl₃', 'Si', 1, 0, [[-1, 1], [-1, 3]], 'H is −1 and Cl is −1'], ['B₂H₆', 'B', 2, 0, [[-1, 6]], 'H is −1: boron (2.0) is less electronegative than hydrogen (2.2)'], ['AlH₄⁻', 'Al', 1, -1, [[-1, 4]], 'H is −1 (a hydride)'], ['GeH₄', 'Ge', 1, 0, [[-1, 4]], 'H is −1: germanium is less electronegative than hydrogen'],
  ['HAuCl₄', 'Au', 1, 0, [[1, 1], [-1, 4]], 'H is +1, Cl is −1'], ['AuCl₄⁻', 'Au', 1, -1, [[-1, 4]], 'Cl is −1'], ['K₂SiO₃', 'Si', 1, 0, [[1, 2], [-2, 3]], 'K is +1, O is −2'], ['Na₃[AlF₆] (cryolite)', 'Al', 1, 0, [[1, 3], [-1, 6]], 'Na is +1, F is −1'],
  ['Na₂[B₄O₅(OH)₄] (borax anion unit, with 2 Na)', 'B', 4, 0, [[1, 2], [-2, 5], [-2, 4], [1, 4]], 'Na is +1, O is −2 and H is +1 (in OH)'],
];
const oxVal = (r) => (r[3] - r[4].reduce((a, [c, k]) => a + c * k, 0)) / r[2];
export { OX, oxVal };
const WHYS = { 'PH₃': 'P is −3 and H is +1: with phosphorus (2.2) and hydrogen (2.2) equal in electronegativity, the slides treat it like NH₃ (N −3, H +1).', 'NH₂OH': 'H is +1 (N and O are both more electronegative), O is −2, so N is −1.' };
// the two awkward explanations above replace the hand notes in OX for PH₃ and NH₂OH
const ruleOf = (r) => WHYS[r[0]] || r[5];
const SETS = [
  ['N₂O', 'NO', 'N₂O₃', 'NO₂'], ['N₂O₅', 'NO₂⁺', 'NO₃⁻', 'NO₂⁻'], ['HNO₂', 'HNO₃', 'H₂N₂O₂ (hyponitrous acid)', 'NH₂OH'], ['NOCl', 'NO⁺', 'NH₄⁺', 'N₂H₄'],
  ['H₃PO₄', 'H₃PO₃', 'P₄O₆', 'P₄O₁₀'], ['PCl₃', 'PCl₅', 'PCl₄⁺', 'PCl₆⁻'], ['SO₂', 'SO₃', 'H₂S₂O₇', 'SF₆'], ['ClO₂', 'ClO₂⁻', 'ClO₃⁻', 'ClO₄⁻'],
  ['CH₄', 'SiH₄', 'SiHCl₃', 'B₂H₆'], ['HAuCl₄', 'K₂SiO₃', 'Na₃[AlF₆] (cryolite)', 'AlH₄⁻'],
];
const oxV = (set, i) => {
  const rows = set.map((n) => OX.find((r) => r[0] === n));
  return numFields(`c4-ox-gen-${String(i + 1).padStart(2, '0')}`, set.join(', '), 'Give the oxidation number of the element named in each case. Treat H as −1 when it is bonded to a less electronegative element (a hydride), otherwise +1; O is −2 and F and Cl are −1 unless stated.',
    rows.map((r, j) => [`x${j}`, `${r[1]} in ${r[0]}`, oxVal(r)]),
    rows.map((r) => `${r[0]}: ${ruleOf(r)}; the atoms of ${r[1]} must make up the rest of the charge (${r[3]}): ${oxVal(r) > 0 ? '+' : ''}${oxVal(r)}${r[2] > 1 ? ' each' : ''}.`).join(' '), 'ch2-p4-8',
    'Sum of oxidation numbers = overall charge. Hydrogen is −1 in silanes, boranes and metal hydrides (bonded to something less electronegative than H) and +1 in CH₄, NH₃, H₂O.');
};
const oxNode = node('bk-c4-ox-gen', 'Oxidation numbers: nitrogen, phosphorus, sulfur, chlorine species and hydridic H', 'Chapter 2 Parts 4-8 (nitrogen oxides and oxoacids, phosphorus, sulfur, chlorine oxides, silanes and boranes as hydrides, aqua regia, cryolite); an oxidation-number question is in every final', 4, 'Oxidation Numbers', ['oxidation-number', 'hydride'], 3, 'ox-gen', SETS.map(oxV));

/* ---------- 2. silicate charge from the formula (Part 5 slides 16-17) ---------- */
const SI = [
  ['SiO₄ (orthosilicate)', 1, 4, 'isolated tetrahedron'], ['Si₂O₇ (pyrosilicate)', 2, 7, 'two tetrahedra sharing one O'], ['Si₃O₉ (three-membered ring)', 3, 9, 'ring of three tetrahedra'], ['Si₆O₁₈ (six-membered ring)', 6, 18, 'ring of six tetrahedra'],
  ['(SiO₃) repeat unit of a single chain', 1, 3, 'single chain, two bridging O per Si'], ['(Si₄O₁₁) repeat unit of a double chain (tremolite)', 4, 11, 'double chain'], ['(Si₂O₅) repeat unit of a sheet (talc, micas)', 2, 5, 'sheet, three bridging O per Si'], ['SiO₂ (silica)', 1, 2, 'three-dimensional framework'],
];
const siCharge = (r) => 4 * r[1] - 2 * r[2];
export { SI, siCharge };
const siV = (id, label, names, withTerm) => {
  const rows = names.map((n) => SI.find((r) => r[0] === n));
  const fields = withTerm ? rows.flatMap((r, i) => [[`t${i}`, `Terminal O in ${r[0]}`, -siCharge(r)], [`b${i}`, `Bridging O in ${r[0]}`, r[2] - -siCharge(r)]]) : rows.map((r, i) => [`q${i}`, `Charge of ${r[0]}`, siCharge(r)]);
  return numFields(id, label, withTerm ? 'In a silicate every Si is bonded to four O, and each **terminal** O carries a −1 charge while a **bridging** O (shared by two Si) is neutral overall. Using the formula (Si 4+, O 2−), give the number of terminal and bridging O atoms in each unit.'
    : 'Silicates are built from SiO₄ tetrahedra that share O atoms; each terminal O contributes −1. Using Si 4+ and O 2−, give the charge of each unit as a signed whole number (e.g. −4).',
    fields, rows.map((r) => `${r[0]}: ${r[3]}; charge 4(${r[1]}) − 2(${r[2]}) = ${siCharge(r)}, so ${-siCharge(r)} terminal O and ${r[2] + siCharge(r)} bridging O.`).join(' '), 'ch2-p5 s16-17', 'Charge = 4 × (number of Si) − 2 × (number of O). Terminal O = −charge; bridging O = total O − terminal O.');
};
const siNode = node('bk-c4-silicate-gen', 'Silicate anions: charge and bridging oxygen', 'Chapter 2 Part 5 slides 16-18 (SiO₃²⁻ chain, tremolite Si₄O₁₁ double chain, talc sheet)', 4, 'Silicates', ['silicates'], 2, 'silicate-gen', [
  siV('c4-silicate-gen-1', 'orthosilicate, pyrosilicate and rings', ['SiO₄ (orthosilicate)', 'Si₂O₇ (pyrosilicate)', 'Si₃O₉ (three-membered ring)', 'Si₆O₁₈ (six-membered ring)'], false),
  siV('c4-silicate-gen-2', 'chains, double chain, sheet, framework', ['(SiO₃) repeat unit of a single chain', '(Si₄O₁₁) repeat unit of a double chain (tremolite)', '(Si₂O₅) repeat unit of a sheet (talc, micas)', 'SiO₂ (silica)'], false),
  siV('c4-silicate-gen-3', 'terminal and bridging O: pyro, ring, chain', ['Si₂O₇ (pyrosilicate)', 'Si₃O₉ (three-membered ring)', '(SiO₃) repeat unit of a single chain'], true),
  siV('c4-silicate-gen-4', 'terminal and bridging O: double chain, sheet', ['(Si₄O₁₁) repeat unit of a double chain (tremolite)', '(Si₂O₅) repeat unit of a sheet (talc, micas)', 'SiO₂ (silica)'], true),
]);

/* ---------- 3. group facts: E–H bond energy and length, SO₃ polymorphs, interhalogen rules (Part 5, 7, 8) ---------- */
const EH = { name: 'E–H bond energy', unit: 'kcal/mol', data: { 'C–H': 95, 'Si–H': 75, 'Ge–H': 70 }, why: 'The E–H bond weakens down Group 14 (about 95 > 75 > 70 kcal/mol) because the larger atoms overlap less well with H 1s.' };
const EL = { name: 'E–H bond length', unit: 'Å', data: { 'C–H': 1.09, 'Si–H': 1.48, 'Ge–H': 1.53 }, why: 'The E–H bond lengthens down Group 14 (1.09, 1.48, 1.53 Å) as the element gets larger.' };
const pick = (id, T, set, dir, slide) => {
  const key = set.reduce((b, s) => (dir === 'max' ? (T.data[s] > T.data[b] ? s : b) : (T.data[s] < T.data[b] ? s : b)), set[0]);
  return mc(id, `${T.name}, ${dir === 'max' ? 'highest' : 'lowest'} of ${set.join(', ')}`, `Among ${set.join(', ')}, which has the **${dir === 'max' ? 'highest' : 'lowest'}** ${T.name}?`, set, set.indexOf(key), `${key}. ${T.why} (Slide values: ${set.map((s) => `${s} ${T.data[s]} ${T.unit}`).join(', ')}.)`, slide);
};
const facts = node('bk-c4-facts-gen', 'Group 14, 16 and 17 facts: E–H bonds, SO₃ forms, interhalogens', 'Chapter 2 Part 5 slide 4, Part 7 slide 9, Part 8 slides 22-25', 4, 'Main Group Chemistry', ['group-14', 'sulfur-trioxide', 'interhalogens'], 2, 'facts-gen', [
  pick('c4-facts-gen-01', EH, ['C–H', 'Si–H', 'Ge–H'], 'min', 'ch2-p5 s4'), pick('c4-facts-gen-02', EH, ['C–H', 'Si–H', 'Ge–H'], 'max', 'ch2-p5 s4'), pick('c4-facts-gen-03', EL, ['C–H', 'Si–H', 'Ge–H'], 'max', 'ch2-p5 s4'), pick('c4-facts-gen-04', EL, ['C–H', 'Si–H', 'Ge–H'], 'min', 'ch2-p5 s4'),
  mc('c4-facts-gen-05', 'SO₃ forms, lowest melting point', 'Solid SO₃ exists as α-SO₃ (polymeric, m.p. 62.3 °C), β-SO₃ (polymeric, m.p. 32.5 °C) and γ-SO₃ (trimeric, m.p. 16.8 °C). Which has the lowest melting point and why?',
    ['γ-SO₃: it consists of small trimer molecules, so there is less to break apart than in a polymer chain', 'α-SO₃: polymeric solids always melt lowest', 'β-SO₃: it has the most S–O double bonds', 'All three melt at the same temperature because the unit is SO₃', 'γ-SO₃: it is the only one with S–S bonds'], 0,
    'The polymeric forms are held together by S–O–S links through the whole chain, so they melt higher. γ-SO₃ is a discrete trimer (S₃O₉ rings), so only weak forces between small molecules have to be overcome: 16.8 °C.', 'ch2-p7 s9'),
  mc('c4-facts-gen-06', 'interhalogen formula rule', 'Neutral interhalogens have the formula XX′ₙ with n odd, and X′ is the lighter halogen when n > 1. Which is a neutral interhalogen compound?',
    ['ClF₃', 'ClF₂', 'FCl₃', 'IF₆', 'BrCl₄'], 0, 'ClF₃ has n = 3 (odd) and F is the lighter halogen. ClF₂, IF₆ and BrCl₄ have an even n, and in FCl₃ the heavier halogen is the outer atom. An odd n gives an even total of valence electrons (7(n + 1)), which is why neutral interhalogens are diamagnetic.', 'ch2-p8 s25'),
  mc('c4-facts-gen-07', 'interhalogen conditions', 'Iodine reacts with excess fluorine. Which product forms at room temperature, and which at 250–300 °C?',
    ['IF₅ at room temperature and IF₇ at 250–300 °C', 'IF₇ at room temperature and IF₅ at 250–300 °C', 'IF₃ at room temperature and IF₅ at 250–300 °C', 'IF at both temperatures', 'IF₅ at both temperatures'], 0,
    'Higher fluorination needs a higher temperature (and pressure): I₂ + F₂ gives IF₅ at room temperature and IF₇ at 250–300 °C. Likewise Cl₂ + F₂ gives ClF at 225 °C, ClF₃ at 300 °C, and ClF₅ needs 350 °C and 250 atm.', 'ch2-p8 s25'),
  mc('c4-facts-gen-08', 'chlorine fluorides and conditions', 'Chlorine reacts with fluorine. Which product needs the most forcing conditions?',
    ['ClF₅ (350 °C and 250 atm of F₂)', 'ClF (225 °C)', 'ClF₃ (300 °C)', 'All form at room temperature', 'ClF₇ (400 °C)'], 0,
    'The more F atoms added, the harsher the conditions: ClF at 225 °C, ClF₃ at 300 °C, ClF₅ at 350 °C and 250 atm. ClF₇ is not known (Cl is too small for seven F).', 'ch2-p8 s25'),
]);

const NODES = [oxNode, siNode, facts];
const LINKS = {
  'bk-c4-ox-gen': ['c4.ox-number'],
  'bk-c4-silicate-gen': ['c4.silicates'],
  'bk-c4-facts-gen': ['c4.silicon', 'c4.oxygen-sulfur', 'c4.halogens'],
};
export { NODES };

if (process.argv[1].endsWith('kinjo3.mjs')) {
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
