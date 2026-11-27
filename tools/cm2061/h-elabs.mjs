/* Chunk H: e-labs. Week 8. SEED ONLY: built from one supplied example (e-lab 2, "metal chelate": Cr(CO)6 + 2,2'-bipyridyl in toluene
   under nitrogen on a Schlenk line, to give Cr(CO)4(bipy)), whose screens cover the intro video, the Schlenk line, a safety MCQ set,
   set-up, weighing and measuring, the reaction video, IR and X-ray and a noticeboard. The supplied page showed the questions but not
   their answers, so every key here is standard chemistry checked against the databook (IR p.11, spectrochemical series p.19), not the
   course's own key, and each says so. The other three e-labs have not been supplied. Wording is our own. */
import { mcq, mcqSet } from './lib.mjs';

const W = 8;
const items = [];
const add = (x) => items.push(x);
const SRC = 'E-lab 2 (metal chelate) example screen; standard inorganic chemistry';
const SAFE = { week: W, chunk: 'el-2', skill: 'el.2.safety', skillName: 'E-lab 2: hazards, Schlenk line and atmosphere' };
const RXN = { week: W, chunk: 'el-2', skill: 'el.2.reaction', skillName: 'E-lab 2: the reaction and its product' };
const CHAR = { week: W, chunk: 'el-2', skill: 'el.2.char', skillName: 'E-lab 2: IR and characterisation' };

add(mcqSet({
  id: 'bk-c61-h-2-hazards', ...SAFE, source: SRC, beyond: true, diff: 2,
  items: [
    { stem: 'In the metal-chelate e-lab, toluene is heated on a hotplate near a hot oil bath. Which hazard should head its entry in the risk assessment?',
      right: ['Flammable', 'A volatile organic liquid heated near a hot surface is chiefly a fire risk (it is also harmful, but fire is the leading hazard here).'],
      wrong: [['Corrosive', 'Toluene does not attack skin or metal in the way an acid or base does.'], ['Not hazardous', 'It is a flammable, harmful liquid.'], ['Explosive on contact with water', 'It does not react with water.']] },
    { stem: 'Which hazard should head the risk-assessment entry for chromium hexacarbonyl, Cr(CO)₆, in this e-lab?',
      right: ['Toxic', 'It is a volatile metal carbonyl: toxic by inhalation, ingestion and skin contact, and it can release carbon monoxide.'],
      wrong: [['Corrosive', 'It is not an acid or a base.'], ['Flammable liquid', 'It is a solid, and toxicity is the principal hazard.'], ['Not hazardous, since it is a stable solid', 'Stability does not remove its toxicity.']] },
    { stem: 'Which hazard should head the entry for the ligand 2,2\'-bipyridyl?',
      right: ['Toxic', 'It is harmful if swallowed or absorbed through the skin.'],
      wrong: [['Flammable', 'It is a solid with a high flash point; it is not the leading hazard.'], ['Corrosive', 'It is a weak base, not a corrosive reagent.'], ['Not hazardous', 'It is toxic and needs gloves and care.']] },
  ],
}));
add(mcq({
  id: 'bk-c61-h-2-bubbler', ...SAFE, source: SRC, beyond: true,
  stem: 'Why is an oil bubbler attached to the nitrogen side of the Schlenk line in the e-lab?',
  right: ['It lets excess gas escape so the pressure cannot build up, while the oil seal stops air from being drawn back in', 'A closed line being heated would otherwise pressurise; a bubbler also shows the gas is flowing.'],
  wrong: [['It measures the exact pressure of the line', 'A bubbler indicates flow; it is not a pressure gauge.'], ['It dries the nitrogen', 'Drying uses a desiccant column or trap; the oil does not dry the gas.'], ['It condenses the toluene vapour', 'Condensing is the job of the reflux condenser.']],
}));
add(mcq({
  id: 'bk-c61-h-2-co', ...RXN, source: SRC, beyond: true,
  stem: 'Cr(CO)₆ reacts with 2,2\'-bipyridyl (bipy) in refluxing toluene to give Cr(CO)₄(bipy). Which by-product explains why the reaction is done in a fume cupboard, and how many moles form per mole of product?',
  right: ['Carbon monoxide, 2 mol (Cr(CO)₆ + bipy → Cr(CO)₄(bipy) + 2 CO)', 'The chelating bipy replaces two CO ligands, and carbon monoxide is toxic.'],
  wrong: [['Carbon dioxide, 2 mol', 'CO₂ is not formed; the CO ligands leave as CO.'], ['Carbon monoxide, 6 mol', 'Only two of the six CO ligands are displaced.'], ['Chromium oxide, 1 mol', 'The chromium stays in the complex; no oxide forms under nitrogen.']],
}));
add(mcq({
  id: 'bk-c61-h-2-n2', ...SAFE, source: SRC, beyond: true,
  stem: 'The reaction is run under nitrogen to prevent oxidation. Which component is most likely to be oxidised by air?',
  right: ['The chromium(0) centre of Cr(CO)₆ and of the product, a low-valent, electron-rich metal', 'Metals in a low oxidation state with strong π-acceptor ligands are easily oxidised, especially when heated.'],
  wrong: [['The carbon monoxide ligands', 'Bound CO is not what air oxidises first; the electron-rich metal is.'], ['The 2,2\'-bipyridyl', 'It is an aromatic heterocycle that is stable in air.'], ['The toluene', 'It is only oxidised under much harsher conditions.']],
}));
add(mcqSet({
  id: 'bk-c61-h-2-structure', ...RXN, source: SRC, beyond: true, diff: 3,
  items: [
    { stem: 'How many valence electrons does the chromium centre have in Cr(CO)₄(bipy)? (Cr contributes 6; each CO donates 2; bipy donates 4 through its two nitrogens.)',
      right: ['18', '6 + 4×2 + 4 = 18, a closed-shell count like Cr(CO)₆ (6 + 6×2).'],
      wrong: [['16', 'This would be missing the two electrons from one donor.'], ['14', 'Too few: the bipy donates 4, not 2.'], ['20', 'Too many; the count is 18 for both complexes.']] },
    { stem: 'Why can one 2,2\'-bipyridyl displace two CO ligands from Cr(CO)₆?',
      right: ['Bipy is a bidentate chelate: its two nitrogens bind the same metal, and the chelate effect (an entropy gain) favours substitution of two CO by one ligand', 'It is a ligand substitution releasing two CO molecules.'],
      wrong: [['Bipy is monodentate and replaces one CO only', 'Bipy has two donor nitrogens and binds through both.'], ['Bipy oxidises chromium and the CO is lost as CO₂', 'Chromium stays Cr(0) and CO leaves as CO.'], ['Bipy displaces all six CO ligands', 'Only two are replaced under these conditions.']] },
    { stem: 'Is Cr(CO)₄(bipy) paramagnetic or diamagnetic, and what would a magnetic susceptibility measurement give?',
      right: ['Diamagnetic: all electrons are paired (a low-spin 18-electron d⁶ complex), so no unpaired electrons', 'Both CO and bipy are strong-field ligands, high on the databook spectrochemical series.'],
      wrong: [['Paramagnetic with four unpaired electrons', 'A strong-field d⁶ complex pairs its electrons.'], ['Paramagnetic with two unpaired electrons', 'There are none.'], ['Ferromagnetic', 'Molecular complexes like this are not ferromagnetic.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-h-2-ir', ...CHAR, source: 'E-lab 2 (metal chelate) example screen; CBC databook pp.11, 19; standard inorganic chemistry', beyond: true, diff: 3,
  items: [
    { stem: 'Which databook range covers the C-O stretching bands of a neutral terminal metal carbonyl?',
      right: ['2150-1850 cm⁻¹', 'The databook lists terminal CO at 2150-1850 (bridging 1850-1750, triply bridging or capping 1750-1600).'],
      wrong: [['1750-1600 cm⁻¹', 'That is the range for triply bridging (capping) CO.'], ['3650-3590 cm⁻¹', 'That is free O-H.'], ['1725-1705 cm⁻¹', 'That is an organic saturated ketone C=O.']] },
    { stem: 'The CO bands of Cr(CO)₄(bipy) lie at lower wavenumber than those of Cr(CO)₆. Which explanation is right?',
      right: ['Bipy is a stronger σ-donor and a weaker π-acceptor than CO, so more electron density goes into the remaining CO π* orbitals, lowering the C-O stretch', 'Replacing a strong π-acceptor by a weaker one increases back-bonding to the CO ligands that stay.'],
      wrong: [['Bipy is a stronger π-acceptor than CO', 'The reverse: CO is among the strongest π-acceptors, and sits at the top of the databook spectrochemical series.'], ['The chromium is oxidised, which strengthens the C-O bond', 'Chromium stays Cr(0); less back-bonding would raise, not lower, ν(CO).'], ['The sample is dissolved in a heavier solvent', 'Solvent does not explain the systematic shift.']] },
    { stem: 'How many CO stretching bands are expected in the IR of octahedral Cr(CO)₆ and of cis-Cr(CO)₄(bipy) (C₂ᵥ local symmetry)?',
      right: ['One for Cr(CO)₆ and four for Cr(CO)₄(bipy)', 'The octahedral molecule has a single IR-active T₁ᵤ mode; the lower-symmetry chelate has A₁ + A₁ + B₁ + B₂, all IR-active.'],
      wrong: [['Four for Cr(CO)₆ and one for Cr(CO)₄(bipy)', 'This reverses them.'], ['Six for both, one per CO', 'Symmetry-equivalent CO groups vibrate together; not one band per CO.'], ['One for both', 'Lowering the symmetry splits the modes.']] },
    { stem: 'Which observation would tell you that Cr(CO)₄(bipy) has formed from the colourless Cr(CO)₆?',
      right: ['The product is intensely coloured, unlike colourless Cr(CO)₆, and its CO bands move to lower wavenumber and increase in number', 'Charge-transfer (metal to bipy π*) absorption gives the colour.'],
      wrong: [['The product is colourless and its IR is unchanged', 'Then nothing has happened.'], ['The mixture turns white and effervesces violently', 'Gas is evolved gently as CO is lost; the product is deeply coloured, not white.'], ['A broad O-H band at 3300 cm⁻¹ appears', 'There is no OH in the product.']] },
  ],
}));

export default items;
