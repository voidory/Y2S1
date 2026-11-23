/* Kinjo half, batch 4: Chapter 2 Parts 1-3 (Hydrogen, Group 1, Group 2). Nearly everything in these decks was already in the bank and on the
   Reactions screen (equations and ~60 facts audited). The thin, recurring item is the isotope effect (zero-point energy: two of the three
   finals; the bank had 3 fixed variants), plus the H₂ + Cl₂ radical chain (1 node). Slide numbers used (Part 1 slides 22-26, 32):
   bond enthalpy H₂ 104.2 and D₂ 106.0 kcal/mol; ω = (f/μ)^½ with the same force constant; μ(D₂) = 2 μ(H₂); E₀ = ½hω;
   D₂O m.p. 3.8, b.p. 101.4 °C, density 1.106 g/mL, viscosity 1.25 mPa·s against H₂O 0.0, 100.0, 0.998, 1.00;
   chain: Cl₂ 243, H–H 432, H–Cl 427 kJ/mol.
   - bk-c4-isotope-gen  explain-why rubrics for new pairs (written like the keys: one key idea per mark), a multi-select, and a numeric ZPE chain
   - bk-c4-radical-gen  classify the steps of the H₂ + Cl₂ chain, and the ΔH of each step from the slide bond energies
   Answers are recomputed in tests/kinjo4-items.test.mjs. Run: node tools/cm2021/kinjo4.mjs */
import fs from 'node:fs';

const DIR = 'public/content';
const L = 'abcdefghij';
const base = (id, label, marks, stem, explanation, sourceSlide, hint) => ({ variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation, sourceSlide });
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
  inputSlot: { type: 'mapped_fields', layout: 'table', fields: fields.map(([k, lab, , , opts]) => ({ key: k, label: lab, ...(opts ? { options: opts } : {}) })) },
  evaluator: { type: 'mapped_fields_match', targets: Object.fromEntries(fields.map(([k, , v, tol, opts]) => [k, opts
    ? { type: 'keyword', expectedExpr: `'${v}'`, synonyms: Object.fromEntries(opts.map((o) => [o, [o]])) }
    : { type: 'numeric', targetExpr: String(v), tolerance: tol ?? 0 }])) },
});
const node = (id, title, source, week, theme, tags, est, family, variants) => ({
  schemaVersion: '3.0', id, moduleCode: 'CM2021', tier: 'atomic',
  metadata: { title, source, week, primaryTheme: theme, conceptTags: tags, difficultyEstimate: 3, estimatedMinutes: est, examStyle: 'short_2to3', family },
  variants,
});

/* ---------- 1. isotope effect ---------- */
// zero-point energy of H₂ from ν(H₂) = 4401 cm⁻¹ (given in the stem); D₂ has μ twice as large, so ν smaller by √2
const KJ_PER_CM = 0.0119627;        // kJ/mol per cm⁻¹ (h c N_A)
export const zpe = { nuH: 4401, nuD: 4401 / Math.SQRT2 };
export const chain = (nuH = 4401) => {
  const nuD = nuH / Math.SQRT2, eH = 0.5 * nuH * KJ_PER_CM, eD = 0.5 * nuD * KJ_PER_CM;
  return { nuD, eH, eD, diffKJ: eH - eD, diffKcal: (eH - eD) / 4.184 };
};
const c = chain();
const chainV = numFields('c4-isotope-gen-01', 'zero-point energy chain for H₂ and D₂',
  'The stretching wavenumber of H₂ is 4401 cm⁻¹. The force constant is the same for D₂ and the reduced mass of D₂ is twice that of H₂ (ω = (f/μ)½). Use 1 cm⁻¹ = 0.01196 kJ mol⁻¹ and E₀ = ½ hν. Give the D₂ wavenumber, E₀ for H₂ and for D₂ (kJ/mol), and by how many kcal/mol the D–D bond is stronger than H–H (1 kcal = 4.184 kJ).',
  [['nud', 'Wavenumber of D₂ (cm⁻¹)', Number(c.nuD.toFixed(0)), 5], ['eh', 'E₀ of H₂ (kJ/mol)', Number(c.eH.toFixed(1)), 0.2], ['ed', 'E₀ of D₂ (kJ/mol)', Number(c.eD.toFixed(1)), 0.2], ['dk', 'Extra bond enthalpy of D₂ over H₂ (kcal/mol)', Number(c.diffKcal.toFixed(2)), 0.06]],
  `ν(D₂) = 4401/√2 = ${c.nuD.toFixed(0)} cm⁻¹. E₀(H₂) = ½ × 4401 × 0.01196 = ${c.eH.toFixed(1)} kJ/mol; E₀(D₂) = ½ × ${c.nuD.toFixed(0)} × 0.01196 = ${c.eD.toFixed(1)} kJ/mol. The two molecules have the same electronic energy, so the bond enthalpy differs only by the zero-point energy: ${(c.eH - c.eD).toFixed(1)} kJ/mol = ${c.diffKcal.toFixed(2)} kcal/mol, in line with the slide values (106.0 − 104.2 = 1.8 kcal/mol).`,
  'ch2-p1 s22-24', 'ν ∝ 1/√μ, so ν(D₂) = ν(H₂)/√2; E₀ is half of hν; the bond enthalpy is −(E_electronic + E₀) so the molecule with the smaller E₀ has the larger bond enthalpy.');
const isoV = [
  chainV,
  rubric('c4-isotope-gen-02', 'rate of H₂ + Cl₂ against D₂ + Cl₂', 'The chain reaction of H₂ with Cl· (H₂ + Cl· → H· + HCl) is faster than that of D₂ with Cl·. Explain.',
    ['The H–H and D–D bonds have the same electronic potential energy curve and force constant', 'D is heavier, so the reduced mass is larger and the vibration frequency (ω = (f/μ)½) and zero-point energy are lower for D–D', 'The D–D bond therefore sits lower in the well and needs more energy to break (higher activation energy), so the D₂ reaction is slower'],
    'Isotopes share the same potential energy surface, so the force constant is the same. The heavier D gives a larger reduced mass and so a lower frequency and zero-point energy; the D–D bond starts lower in the well, is harder to break and the rate is lower (k_H/k_D > 1).', 'ch2-p1 s24', 'Same force constant, different reduced mass: follow ω to the zero-point energy to the activation energy.'),
  rubric('c4-isotope-gen-03', 'O–H and O–D', 'A hydrolysis in which an O–H bond is broken in the slow step is slower in D₂O (O–D bond) than in H₂O. Explain using zero-point energy.',
    ['The force constant of O–H and O–D is the same, but μ(O–D) is larger, so ω and the zero-point energy E₀ = ½hω are smaller for O–D', 'The O–D bond lies lower in the well, so more energy is needed to reach the transition state (larger activation energy)', 'So the rate constant is smaller: k_H/k_D > 1 (a primary kinetic isotope effect)'],
    'The bond to the heavier isotope has the lower zero-point energy, so it is stronger in effect and needs a higher activation energy to break; the rate falls when D replaces H at the bond being broken.', 'ch2-p1 s24', 'Think: which has the lower zero-point energy, and what does that do to the activation energy?'),
  rubric('c4-isotope-gen-04', 'D₂O melting and boiling point', 'D₂O melts at 3.8 °C and boils at 101.4 °C, against 0.0 °C and 100.0 °C for H₂O. Suggest why D₂O is the more strongly bound liquid.',
    ['D is heavier, so the O–D bonds (and the hydrogen bonds involving D) have lower vibrational frequencies and a lower zero-point energy', 'The O–D···O hydrogen bonds are slightly stronger (the lower zero-point energy leaves a deeper effective well), so more energy is needed to separate the molecules', 'Hence higher melting and boiling points, higher density (1.106 against 0.998 g/mL) and higher viscosity (1.25 against 1.00 mPa·s)'],
    'The same zero-point-energy argument applies to the O–D bonds and the hydrogen bonds: bonds involving D are slightly stronger, so the intermolecular attraction is greater and D₂O has higher melting and boiling points, density and viscosity than H₂O.', 'ch2-p1 s25-26', 'Remember the b.p. of D₂ (−249.7 °C) is also above that of H₂ (−252.8 °C).'),
  rubric('c4-isotope-gen-05', 'ice of D₂O sinks in H₂O', 'A cube of D₂O ice dropped into ice-cold ordinary water sinks. Give the two reasons from the properties of heavy water.',
    ['D₂O is denser than H₂O (1.106 against 0.998 g/mL at 20 °C), so its solid is heavier too', 'D₂O melts at 3.8 °C, so D₂O ice stays solid in water at 0 °C and does not melt'],
    'Ice made from heavy water is a solid at 0 °C because D₂O melts at 3.8 °C, and its higher density (the deuterium atoms add mass without changing the molecular size appreciably) makes it sink in H₂O.', 'ch2-p1 s26'),
  multi('c4-isotope-gen-06', 'which statements about isotope effects', 'Which statements about the effect of replacing H by D in H₂ are correct? Select all.',
    ['The force constant of the bond is unchanged', 'The zero-point energy of D₂ is lower than that of H₂', 'The bond enthalpy of D₂ (106.0 kcal/mol) is larger than that of H₂ (104.2 kcal/mol)', 'The electronic energy of D₂ is much more negative than that of H₂', 'The vibration frequency of D₂ is higher than that of H₂'], [0, 1, 2],
    'The potential energy curve (and so f and the electronic energy) is the same; the larger reduced mass of D₂ lowers ω and E₀ = ½hω, so the bond enthalpy −(E_el + E₀) is larger. The frequency of D₂ is lower by √2.', 'ch2-p1 s22-24'),
  rubric('c4-isotope-gen-07', 'CH₄ against CD₄ in the radical chain', 'In the radical chlorination Cl· + CH₄ → HCl + ·CH₃ the C–H bond is broken in the rate-determining step. Explain why CD₄ reacts more slowly than CH₄.',
    ['The C–H and C–D bonds have the same force constant, but the C–D bond has the larger reduced mass', 'It therefore has the lower vibrational frequency and the lower zero-point energy, so it sits lower in the potential well', 'More energy is needed to break C–D (larger activation energy), so k_H/k_D > 1 and CD₄ reacts more slowly'],
    'Primary kinetic isotope effect: the bond that is broken in the slow step is to H or D; the heavier D has a lower zero-point energy, so a larger activation energy and a slower reaction.', 'ch2-p1 s24', 'Use the same three links: reduced mass → zero-point energy → activation energy.'),
];
const isoNode = node('bk-c4-isotope-gen', 'Isotope effect and zero-point energy: new pairs and a numeric chain', 'Chapter 2 Part 1 slides 22-26 (H₂ and D₂ bond enthalpies, ω = (f/μ)½, E₀, D₂O properties); the isotope effect is in two of the three finals', 4, 'Hydrogen and Isotopes', ['isotope-effect', 'zero-point-energy', 'kie'], 4, 'isotope-gen', isoV);

/* ---------- 2. the H₂ + Cl₂ chain (Part 1 slide 32) ---------- */
const BE = { 'Cl–Cl': 243, 'H–H': 432, 'H–Cl': 427 };
export const stepDH = { init: BE['Cl–Cl'], prop1: BE['H–H'] - BE['H–Cl'], prop2: BE['Cl–Cl'] - BE['H–Cl'], overall: BE['H–H'] + BE['Cl–Cl'] - 2 * BE['H–Cl'] };
const radV = [
  numFields('c4-radical-gen-1', 'classify the steps', 'The photochemical reaction H₂ + Cl₂ → 2 HCl is a radical chain. Classify each step as initiation, propagation or termination.',
    [['s1', 'Cl₂ → 2 Cl·', 'initiation', 0, ['initiation', 'propagation', 'termination']], ['s2', 'H₂ + Cl· → H· + HCl', 'propagation', 0, ['initiation', 'propagation', 'termination']], ['s3', 'H· + Cl₂ → HCl + Cl·', 'propagation', 0, ['initiation', 'propagation', 'termination']], ['s4', 'H· + Cl· → HCl', 'termination', 0, ['initiation', 'propagation', 'termination']]],
    'Initiation makes radicals from a molecule (Cl₂ → 2 Cl·, by light). Propagation consumes one radical and makes another, so the chain carries on. Termination removes two radicals without making a new one.', 'ch2-p1 s32', 'Count radicals: initiation creates them, propagation keeps the number, termination destroys them.'),
  numFields('c4-radical-gen-2', 'ΔH of each step', 'Use the bond enthalpies Cl–Cl 243, H–H 432 and H–Cl 427 kJ/mol to give the enthalpy change of each step (positive if endothermic): the initiation Cl₂ → 2 Cl·, the propagation H₂ + Cl· → H· + HCl, the propagation H· + Cl₂ → HCl + Cl·, and the overall reaction H₂ + Cl₂ → 2 HCl.',
    [['d1', 'Cl₂ → 2 Cl· (kJ/mol)', stepDH.init], ['d2', 'H₂ + Cl· → H· + HCl (kJ/mol)', stepDH.prop1], ['d3', 'H· + Cl₂ → HCl + Cl· (kJ/mol)', stepDH.prop2], ['d4', 'H₂ + Cl₂ → 2 HCl (kJ/mol)', stepDH.overall]],
    'ΔH = (bonds broken) − (bonds formed). Initiation: break Cl–Cl, +243. First propagation: break H–H (432), form H–Cl (427): +5. Second propagation: break Cl–Cl (243), form H–Cl (427): −184. Overall: 432 + 243 − 2(427) = −179 kJ/mol. The two propagation steps add to the overall value (5 − 184 = −179).', 'ch2-p1 s32', 'ΔH = sum of bonds broken minus sum of bonds formed for each step.'),
];
const radNode = node('bk-c4-radical-gen', 'H₂ + Cl₂ radical chain: classify the steps and compute ΔH', 'Chapter 2 Part 1 slide 32 (initiation Cl–Cl 243, propagation H–H 432 and H–Cl 427)', 4, 'Radical Chain Reactions', ['radical-chain', 'bond-enthalpy'], 3, 'radical-gen', radV);

const NODES = [isoNode, radNode];
const LINKS = { 'bk-c4-isotope-gen': ['c4.isotope-zpe', 'c4.kie'], 'bk-c4-radical-gen': ['c4.radical-chain'] };
export { NODES };

if (process.argv[1].endsWith('kinjo4.mjs')) {
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
