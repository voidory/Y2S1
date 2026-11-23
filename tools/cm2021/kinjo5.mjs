/* Kinjo half, batch 5: formal charge generator. The example mid-term asks the formal charge of Al in Al₂Cl₆ and I in I₂Cl₆ (both −1, bridging Cl +1);
   the bank held that item plus SCN⁻ and NH₃→BF₃ as fixed variants. Formal charge = valence electrons − non-bonding electrons − number of bonds
   (a double bond counts as two). This writes 10 variants with new structures (Part 1 slides 'Formal Charge', 'Lewis exception' and 'BF₃ π' plus
   the dative-bond slides). Answers are recomputed in tests/kinjo5-items.test.mjs from a hand-written table.
   Run: node tools/cm2021/kinjo5.mjs */
import fs from 'node:fs';

const DIR = 'public/content';
const L = 'abcdefghij';
const base = (id, label, marks, stem, explanation, sourceSlide, hint) => ({ variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation, sourceSlide });
const node = (id, title, source, week, theme, tags, est, family, variants) => ({
  schemaVersion: '3.0', id, moduleCode: 'CM2021', tier: 'atomic',
  metadata: { title, source, week, primaryTheme: theme, conceptTags: tags, difficultyEstimate: 3, estimatedMinutes: est, examStyle: 'short_2to3', family },
  variants,
});

// atom: [label, valence electrons, lone pairs, bonds (double = 2), description of its environment]
export const fc = ([, V, lp, b]) => V - 2 * lp - b;
const STRUCTS = [
  ['Al₂Cl₆', 'Al₂Cl₆ has two bridging Cl atoms. Each Al has four single bonds (two to terminal Cl, two to bridging Cl) and no lone pair; a bridging Cl has two single bonds and two lone pairs; a terminal Cl has one bond and three lone pairs.',
    [['Al', 3, 0, 4], ['bridging Cl', 7, 2, 2], ['terminal Cl', 7, 3, 1]], 's-fc'],
  ['I₂Cl₆', 'I₂Cl₆ has two bridging Cl atoms. Each I has four single bonds (two to terminal Cl, two to bridging Cl) and two lone pairs; a bridging Cl has two single bonds and two lone pairs; a terminal Cl has one bond and three lone pairs.',
    [['I', 7, 2, 4], ['bridging Cl', 7, 2, 2], ['terminal Cl', 7, 3, 1]], 's-fc'],
  ['H₃N→BF₃', 'In the adduct H₃N–BF₃ the N has four single bonds (three to H, one to B) and no lone pair; B has four single bonds (three to F, one to N) and no lone pair; each F has one bond and three lone pairs.',
    [['N', 5, 0, 4], ['B', 3, 0, 4], ['F', 7, 3, 1]], 's-dative'],
  ['H₃O⁺, NH₄⁺, BF₄⁻, BH₄⁻', 'H₃O⁺: O has three single bonds and one lone pair. NH₄⁺: N has four single bonds and no lone pair. BF₄⁻ and BH₄⁻: B has four single bonds and no lone pair.',
    [['O in H₃O⁺', 6, 1, 3], ['N in NH₄⁺', 5, 0, 4], ['B in BF₄⁻', 3, 0, 4], ['B in BH₄⁻', 3, 0, 4]], 's-fc'],
  ['SCN⁻ (structures B and C)', 'Structure B of SCN⁻ is S–C≡N with three lone pairs on S and one on N. Structure C is S≡C–N with one lone pair on S and three on N.',
    [['S in B', 6, 3, 1], ['N in B', 5, 1, 3], ['S in C', 6, 1, 3], ['N in C', 5, 3, 1]], 's-fc'],
  ['O₃ and NO₃⁻', 'In O₃ drawn O=O⁺–O⁻, the central O has one double and one single bond and one lone pair, the double-bonded end O has two lone pairs, and the single-bonded end O has three lone pairs. In NO₃⁻ the N has one double and two single bonds and no lone pair, the double-bonded O has two lone pairs and each single-bonded O has three.',
    [['central O in O₃', 6, 1, 3], ['single-bonded end O in O₃', 6, 3, 1], ['N in NO₃⁻', 5, 0, 4], ['single-bonded O in NO₃⁻', 6, 3, 1]], 's-fc'],
  ['CO and N₂O', 'CO has a triple bond; C has one lone pair and O has one lone pair. In N₂O drawn N≡N⁺–O⁻ the terminal N has a triple bond and one lone pair, the central N has a triple and a single bond and no lone pair, and O has one bond and three lone pairs.',
    [['C in CO', 4, 1, 3], ['O in CO', 6, 1, 3], ['central N in N₂O', 5, 0, 4], ['O in N₂O', 6, 3, 1]], 's-fc'],
  ['BF₃ with a B=F π bond', 'In one resonance form of BF₃ a B=F double bond is drawn: that B has one double and two single bonds and no lone pair, the double-bonded F has two lone pairs and the other two F each have three.',
    [['B', 3, 0, 4], ['double-bonded F', 7, 2, 2], ['single-bonded F', 7, 3, 1]], 's-bf3'],
  ['SO₄²⁻ with all single bonds', 'In the Lewis structure of SO₄²⁻ with four S–O single bonds, S has four bonds and no lone pair and each O has one bond and three lone pairs.',
    [['S', 6, 0, 4], ['O', 6, 3, 1]], 's-expanded'],
  ['SO₄²⁻ with two S=O bonds', 'In the Lewis structure of SO₄²⁻ with two S=O and two S–O⁻ bonds, S has six bonds (two double, two single) and no lone pair; a double-bonded O has two lone pairs; a single-bonded O has three.',
    [['S', 6, 0, 6], ['double-bonded O', 6, 2, 2], ['single-bonded O', 6, 3, 1]], 's-expanded'],
];
const why = (a) => `${a[0]}: ${a[1]} − 2(${a[2]}) − ${a[3]} = ${fc(a) > 0 ? '+' : ''}${fc(a)}`;
const variants = STRUCTS.map(([name, desc, atoms, slide], i) => ({
  ...base(`c1-fc-gen-${String(i + 1).padStart(2, '0')}`, name, atoms.length, `${desc} Give the formal charge of each atom listed.`,
    `Formal charge = valence electrons − non-bonding electrons − number of bonds. ${atoms.map(why).join('; ')}.${name === 'Al₂Cl₆' || name === 'I₂Cl₆' ? ' The bridging Cl is +1 in both because it forms two bonds; Al and I are both −1 because each makes four bonds.' : ''}${name.startsWith('SO₄²⁻ with all') ? ' The formal charges on S (+2) are larger than in the structure with S=O bonds (0), which is why the expanded-octet form is drawn.' : ''}`,
    slide, 'Formal charge = V − (non-bonding electrons) − (bonds); count each non-bonding electron individually (a lone pair = 2), a double bond = 2 bonds.'),
  inputSlot: { type: 'mapped_fields', layout: 'table', fields: atoms.map((a, j) => ({ key: `a${j}`, label: `Formal charge of ${a[0]}` })) },
  evaluator: { type: 'mapped_fields_match', targets: Object.fromEntries(atoms.map((a, j) => [`a${j}`, { type: 'numeric', targetExpr: String(fc(a) + 0), tolerance: 0 }])) },
}));
variants.push({
  ...base('c1-fc-gen-11', 'which sulfate structure', 1, 'Two Lewis structures of SO₄²⁻ are drawn: one with four S–O single bonds, one with two S=O and two S–O⁻ bonds. Which statement is correct?', 'x', 's-expanded'),
  inputSlot: { type: 'choice', selectionMode: 'single', options: [
    'The structure with two S=O bonds has the smaller formal charges (S 0 and O 0 or −1), so it is preferred, and S can expand its octet because 3d/higher orbitals are close in energy',
    'The all-single-bond structure is preferred because S obeys the octet and has a formal charge of +2',
    'The two structures have identical formal charges',
    'Sulfur cannot form S=O bonds because it is in the third period',
    'Formal charges are irrelevant to choosing between Lewis structures'].map((o, i) => ({ id: L[i], label: o })), shuffleOptions: true },
  evaluator: { type: 'choice_match', targetIds: ['a'], gradingMode: 'exact' },
});
variants[10].explanation = 'All-single bonds: S +2 and each O −1. With two S=O bonds: S 0, double-bonded O 0, single-bonded O −1. Smaller formal charges mean a better contributor, and from the third period down the valence shell can hold more than 8 electrons (the slides’ “expanded shells” exception).';
variants[10].marks = 1;

const fcNode = node('bk-c1-fc-gen', 'Formal charge from a described Lewis structure', 'Chapter 1 Part 1 slides (Formal Charge, Lewis exceptions, BF₃ π), Part 4 slides 52-55; Kinjo example mid-term (Al₂Cl₆ and I₂Cl₆)', 1, 'Formal Charge', ['formal-charge', 'lewis-structure'], 3, 'fc-gen', variants);

const NODES = [fcNode];
const LINKS = { 'bk-c1-fc-gen': ['c1.formal-charge'] };
export { NODES, STRUCTS };

if (process.argv[1].endsWith('kinjo5.mjs')) {
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
  console.log('wrote', NODES.map((n) => `${n.id}: ${n.variants.length}`).join('; '));
}
