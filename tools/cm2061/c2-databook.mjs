/* Chunk C (continued): reading the CBC databook (2017 revision) the way the exam allows. Week 3.
   The exam is open-databook, so many spectroscopy questions are "find it in the table and apply it". Items cite databook pages
   (IR pp.9-11, NMR nuclides p.12, 1H shifts pp.14-15, additivity p.15, couplings p.16) and use the ranges printed there.
   Values are quoted as facts for private study; the databook itself is not reproduced. */
import { mcq, mcqSet } from './lib.mjs';

const W = 3;
const items = [];
const add = (x) => items.push(x);
const IR = { week: W, chunk: 'sp-databook', skill: 'sp.db-ir', skillName: 'Reading the databook IR tables' };
const NMR = { week: W, chunk: 'sp-databook', skill: 'sp.db-nmr', skillName: 'Reading the databook NMR tables' };

add(mcqSet({
  id: 'bk-c61-c2-db-co', ...IR, source: 'CBC databook p.9 (C=O stretching); 2015 paper style', diff: 3,
  items: [
    { stem: 'Using the databook, which of these carbonyl types has the LOWEST wavenumber range?',
      right: ['An α,β-unsaturated ketone (1685-1660 cm⁻¹)', 'Conjugation lowers the C=O stretch; the saturated ketone is 1725-1705 and the aryl ketone 1700-1680.'],
      wrong: [['A saturated acyclic ketone (1725-1705 cm⁻¹)', 'Higher: no conjugation to lower it.'], ['An aryl ketone (1700-1680 cm⁻¹)', 'Lowered by the ring, but not as far as an α,β-unsaturated ketone.'], ['A five-membered ring ketone (1750-1740 cm⁻¹)', 'Ring strain raises the frequency.']] },
    { stem: 'Which of these has the highest-frequency C=O stretch in the databook?',
      right: ['A saturated anhydride (1850-1800 and 1790-1740 cm⁻¹)', 'Anhydrides and acid chlorides are above the normal ester range.'],
      wrong: [['A saturated ester (1750-1735 cm⁻¹)', 'Lower than an anhydride.'], ['A saturated ketone (1725-1705 cm⁻¹)', 'Lower still.'], ['A secondary amide (1700-1670 cm⁻¹)', 'Amides are the lowest of these, because of nitrogen donation.']] },
    { stem: 'The solid (nujol mull) IR spectrum of paracetamol is read against the databook. Which pair of secondary-amide bands should you look for?',
      right: ['About 1680-1630 cm⁻¹ (C=O) and 1570-1515 cm⁻¹ (N-H bend), the solid-phase values', 'The databook gives separate solid-phase and solution ranges; a mull is solid phase.'],
      wrong: [['About 1850-1800 and 1790-1740 cm⁻¹', 'That is the anhydride pair; paracetamol has no anhydride.'], ['About 1750-1735 cm⁻¹ only', 'That is a saturated ester, which paracetamol lacks.'], ['About 1670-1630 cm⁻¹ alone', 'That is the single tertiary-amide band; paracetamol is a secondary amide with two bands.']] },
    { stem: 'In which databook range would the strong C=O band of an aryl carboxylic acid such as benzoic acid fall?',
      right: ['1700-1680 cm⁻¹', 'The databook lists aryl acids at 1700-1680 (saturated acids 1725-1700, α,β-unsaturated 1715-1690).'],
      wrong: [['1725-1700 cm⁻¹', 'That is the saturated acid range.'], ['1610-1550 cm⁻¹', 'That is the carboxylate anion, not the neutral acid.'], ['1750-1735 cm⁻¹', 'That is a saturated ester.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c2-db-ir-other', ...IR, source: 'CBC databook pp.9-11 (OH, CH, nitro, alkene deformations, anions)', diff: 3,
  items: [
    { stem: 'A dilute solution of an alcohol shows a sharp O-H band near 3620 cm⁻¹. Which databook entry fits?',
      right: ['Free (non-hydrogen-bonded) O-H, 3650-3590 cm⁻¹, sharp', 'Hydrogen bonding in concentrated samples shifts and broadens the band to 3400-3200.'],
      wrong: [['Carboxylic acid O-H, 3200-2500 cm⁻¹, broad', 'Far lower and very broad.'], ['Intermolecular hydrogen-bonded polymeric O-H, 3400-3200 cm⁻¹', 'Lower and broad.'], ['Alkyne C-H, 3300 cm⁻¹', 'Not near 3620, and no alkyne is involved.']] },
    { stem: 'Which databook range covers both the asymmetric and symmetric stretches of an aromatic nitro group (two bands)?',
      right: ['1555-1540 and 1385-1350 cm⁻¹', 'These are the two N=O ranges for nitro compounds.'],
      wrong: [['1850-1800 and 1790-1740 cm⁻¹', 'These are the anhydride C=O pair.'], ['3500-3300 cm⁻¹ (two bands)', 'These are primary amine N-H stretches.'], ['2260-2220 and 2260-2100 cm⁻¹', 'These are nitrile and alkyne stretches.']] },
    { stem: 'You make Py₂Zn(NCO)₂ from zinc nitrate. Which databook band would reveal residual nitrate in the product spectrum?',
      right: ['A strong nitrate absorption at 1380-1350 cm⁻¹', 'Nitrate is listed among the anions at that range; its presence would show incomplete washing.'],
      wrong: [['A band at 2150-2050 cm⁻¹', 'That range belongs to thiocyanate.'], ['A band at 1130-1080 cm⁻¹', 'That is sulfate.'], ['A band at 1610-1550 cm⁻¹', 'That is carboxylate (and not nitrate).']] },
    { stem: 'Which band shows the trans geometry of the C=C bonds in dibenzalacetone, according to the databook C-H deformation table?',
      right: ['RCH=CHR (trans) at 970-960 cm⁻¹', 'The trans out-of-plane C-H deformation is listed there; the cis one is near 690.'],
      wrong: [['RCH=CHR (cis) at about 690 cm⁻¹', 'That is the cis band.'], ['RCH=CH₂ at 995-985 and 915-905 cm⁻¹', 'That is a terminal vinyl group.'], ['An aldehyde C-H at 2900-2700 cm⁻¹', 'That is not an alkene deformation.']] },
  ],
}));

add(mcqSet({
  id: 'bk-c61-c2-db-shift', ...NMR, source: 'CBC databook pp.14-15 (1H shifts of methyl, methylene, methine and unsaturated protons)', diff: 3,
  items: [
    { stem: 'Methyl acetate, CH₃CO₂CH₃, shows two methyl singlets. Using the databook, which assignment is right?',
      right: ['The OCH₃ at about δ 3.7 and the acetyl CH₃ at about δ 2.0', 'CH₃-O-CO-R is 3.7 and CH₃-CO-OR is 2.0.'],
      wrong: [['The OCH₃ at about δ 2.0 and the acetyl CH₃ at about δ 3.7', 'This swaps them: the methyl on oxygen is the more deshielded.'], ['Both at about δ 0.9', 'That is CH₃ on a plain carbon.'], ['Both at about δ 3.3', 'That is CH₃-OR in an ether, not the ester pair.']] },
    { stem: 'Which methyl group is predicted at the highest chemical shift by the databook table?',
      right: ['CH₃-OAr (about 3.8)', 'Methyl on an aryl ether oxygen is the most deshielded of these.'],
      wrong: [['CH₃-CO-R (about 2.2)', 'Lower: separated from oxygen.'], ['CH₃-S (about 2.1)', 'Lower: sulfur is less deshielding than oxygen.'], ['CH₃-C (about 0.9)', 'The most shielded methyl.']] },
    { stem: 'Why are the acetyl CH₃ of acetophenone (about 2.6) and the CH₃ of toluene (about 2.3) different?',
      right: ['The carbonyl and the ring together deshield the acetyl methyl more than a ring alone deshields a benzylic methyl', 'The databook lists CH₃-CO-Ar at 2.6 and CH₃-Ar at 2.3.'],
      wrong: [['Toluene\'s methyl is on oxygen', 'It is on carbon (a benzylic methyl).'], ['Acetophenone has more protons', 'The number of protons does not set the shift.'], ['They are identical within the databook\'s accuracy', 'The values differ by 0.3, more than the quoted ±0.2.']] },
    { stem: 'The databook says shifts are "usually within ±0.2" of the tabulated value. What does that margin warn you about?',
      right: ['Use the table with caution: inductive, anisotropic or steric effects can move a signal further', 'It is a typical accuracy, not a guarantee.'],
      wrong: [['The table is exact for all compounds', 'The databook itself says to use it with caution.'], ['Only ¹³C values are uncertain', 'The caution is stated for both ¹H and ¹³C shifts.'], ['Shifts depend on the spectrometer frequency, so ±0.2 ppm is meaningless', 'δ is field-independent; the margin reflects structure, not the machine.']] },
    { stem: 'Which proton type does the databook place at the HIGHEST chemical shift range?',
      right: ['R-CO₂H (about 10 to 13)', 'Acid protons come above aldehyde protons.'],
      wrong: [['R-CHO and Ar-CHO (9.4-10.5)', 'High, but below the carboxylic acid upper range.'], ['Aromatic protons (6.0-9.0)', 'Lower than aldehydes.'], ['R-OH (2-10, variable)', 'Spread over a wide range but typically well below 10.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c2-db-j', ...NMR, source: 'CBC databook p.16 (1H-1H coupling constants)', diff: 3,
  items: [
    { stem: 'In a 1,2,4-trisubstituted benzene, one proton has an ortho neighbour and a meta neighbour. What pattern and couplings does the databook lead you to expect?',
      right: ['A doublet of doublets, J about 6-9 Hz (ortho) and 1-3 Hz (meta)', 'The databook gives ortho 6-9, meta 1-3 and para 0-1 Hz.'],
      wrong: [['A triplet, J about 6-9 Hz', 'A triplet needs two equal couplings; here they differ.'], ['A singlet', 'The couplings are small but real; a singlet means no neighbours at all.'], ['A doublet of doublets, J about 12-18 Hz and 5-12 Hz', 'Those are alkene trans and cis couplings.']] },
    { stem: 'Two alkene protons on a double bond show J = 15 Hz. According to the databook ranges, what is their geometry?',
      right: ['Trans (12-18 Hz)', 'The databook gives trans 12-18 and cis 5-12 Hz (the manual quotes 10-12 and 15-18).'],
      wrong: [['Cis (5-12 Hz)', 'Too small for 15 Hz.'], ['Geminal (-3 to +3 Hz)', 'Geminal couplings on an alkene are tiny.'], ['Ortho aromatic (6-9 Hz)', 'These protons are on a C=C, not on a ring.']] },
    { stem: 'For an ethyl group with free rotation, the databook gives a H-C-C-H coupling of:',
      right: ['6-8 Hz', 'This is the typical vicinal coupling for freely rotating sp³ carbons.'],
      wrong: [['12-18 Hz', 'That is an alkene trans coupling.'], ['0-1 Hz', 'That is a para aromatic coupling.'], ['40-60 Hz', 'H-H couplings never reach that size.']] },
  ],
}));
add(mcq({
  id: 'bk-c61-c2-db-nuclides', ...NMR, source: 'CBC databook p.12 (NMR-active nuclides); Manual p.23',
  stem: 'In 2-trifluoroacetylpyrrole, which pair of nuclides is both spin-½ and 100% (or essentially 100%) naturally abundant, and so easy to observe?',
  right: ['¹H and ¹⁹F', '¹H is 99.985% and ¹⁹F is 100%, both with I = ½ (the databook also lists ¹³C at only 1.108%).'],
  wrong: [['¹H and ¹³C', '¹³C is only 1.1% abundant, which is why ¹³C spectra are weak.'], ['¹⁹F and ¹²C', '¹²C has no spin.'], ['¹⁴N and ¹⁹F', '¹⁴N has I = 1 and is a quadrupolar nucleus; it is not spin-½.']],
}));

export default items;
