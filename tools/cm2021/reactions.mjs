/* Master list of reactions for the Kinjo half of CM2021 (Ch 1-5: hydrogen, Groups 1-2, boron, carbon and silicon, nitrogen,
   phosphorus, oxygen and sulfur, halogens, noble gases, nuclear equations).
     node tools/cm2021/reactions.mjs   ->   public/content/cm2021/reactions.json
   The "Reactions" screen (Reference map and Train mode) reads that file; never edit the JSON by hand.

   SOURCE RULE (owner, 22 Nov 2026): only reactions already in the question bank, the method pages and the three finals. Nothing
   from outside the course is added. `flag: 'unchecked'` marks reactions that the notes say are in no uploaded slide deck.
   Equation syntax is the app's own (Ca(OH)2, Br^-, [Al(OH)4]^-, e-, ->). Multi-step answers use `steps` (graded as a route, any line order).
   `x` is the exam weight 0-3: 3 = asked in a final we hold (finals tag in `fin`), 2 = a named process or a template the finals use, 1 = bank only.
   `ask` is the stem for the "write it" card; `hook` is a one-line memory device in plain words; `cond` the conditions to know. */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');

export const GROUPS = [
  { id: 'h2', title: 'Making and using H₂', rule: 'Hydrocarbon or water gives H₂ at high T (steam reforming, then the shift); a metal that dissolves in acid or base gives H₂ at the bench; electrolysis splits water.', hook: 'Steam + carbon → CO + H₂; shift CO with more steam; metals displace H₂.' },
  { id: 'hydrides', title: 'Hydrides: making them and what they do', rule: 'Hydride H⁻ is a base and a reducing agent: it takes H⁺ (or D⁺) from water, and it hands H⁻ to a metal or boron/aluminium halide.', hook: 'H⁻ + H⁺ → H₂ (or HD with D₂O); H⁻ swaps for Cl⁻ to make the hydride reagents.' },
  { id: 'g1o2', title: 'Group 1 in oxygen, and the oxides with water and CO₂', rule: 'Bigger cation, bigger anion: Li gives the oxide, Na the peroxide, K (Rb, Cs) the superoxide. Peroxide and superoxide give H₂O₂ with water; superoxide also eats CO₂ and gives O₂.', hook: 'Li oxide, Na peroxide, K superoxide: O²⁻, O₂²⁻, O₂⁻ as the cation grows.' },
  { id: 'g1more', title: 'Group 1: nitrogen, hydrogen, acetylene, alkyl halides', rule: 'Li is the odd one out (nitride with N₂, organolithiums). Every alkali metal reduces H₂ to MH and takes H⁺ from acetylene.', hook: 'Only Li takes N₂ directly; all of them make MH and carbides.' },
  { id: 'nacl', title: 'Making Na and NaOH by electrolysis', rule: 'Molten salt: the metal ion is reduced. Aqueous salt: water is reduced first (H₂ and OH⁻), so NaOH, H₂ and Cl₂ come out.', hook: 'No water → Na metal (Downs). Brine → NaOH + H₂ + Cl₂ (chlor-alkali).' },
  { id: 'g2', title: 'Group 2 and beryllium', rule: 'Be–Sr burn to the oxide, Ba to the peroxide. Ca(OH)₂ + CO₂ gives the carbonate, then the soluble hydrogencarbonate. Be(OH)₂ is amphoteric, like Al.', hook: 'Ba is the peroxide exception; Be reacts with acid and base.' },
  { id: 'boron', title: 'Boron: BX₃ and diborane', rule: 'BX₃ are made from the oxide with a fluoride source (and acid). Diborane comes from BF₃ + hydride. Both hydrolyse to boric acid; B₂H₆ also burns and gives H₂.', hook: 'B₂O₃ + F source → BF₃; BF₃ + NaH → B₂H₆; both + H₂O → B(OH)₃.' },
  { id: 'silicon', title: 'Silicon: silanes and halides', rule: 'SiH₄ comes from SiCl₄ and a hydride; it is hydrolysed by base to silicate + H₂. Silicon halides hydrolyse to SiO₂ (SiF₄ also takes F⁻ to [SiF₆]²⁻). Si is purified through SiHCl₃.', hook: 'Si–Cl bonds hydrolyse fast; SiF₄ + 2F⁻ → [SiF₆]²⁻.' },
  { id: 'nchain', title: 'Nitrogen: Haber → Ostwald → hydrazine → azide', rule: 'N₂ + H₂ → NH₃ (Haber). NH₃ is burned over Pt to NO, then NO₂ and HNO₃ (Ostwald). NH₃ + OCl⁻ gives hydrazine (Olin–Raschig); NaNH₂ + N₂O gives azide (Wislicenus).', hook: 'NH₃ is the hub: oxidise for HNO₃, chlorinate for N₂H₄, sodamide for N₃⁻.' },
  { id: 'nox', title: 'Nitrogen oxides, nitric acid and aqua regia', rule: 'Concentrated HNO₃ oxidises (non-metals go to their highest oxoacid; NO₂ is the nitrogen product). Aqua regia makes NOCl and Cl₂, which dissolve gold as [AuCl₄]⁻.', hook: 'Conc. HNO₃ → NO₂; aqua regia = HNO₃ + 3 HCl → NOCl + Cl₂.' },
  { id: 'phos', title: 'Phosphorus', rule: 'Phosphate rock + sand + coke gives P₄. P₄ with F₂ goes to PF₅, with limited Cl₂ to PCl₃, with limited O₂ to P₄O₆, with excess O₂ to P₄O₁₀. PCl₃ and P₄O₆ hydrolyse to H₃PO₃; P₄O₁₀ gives H₃PO₄ and dehydrates amides.', hook: 'Limited oxidant → P(III); excess → P(V); water on P(III) gives H₃PO₃, on P(V) gives H₃PO₄.' },
  { id: 'osx', title: 'Hydrogen peroxide, sulfur and chlorine dioxide', rule: 'BaO₂ + acid gives H₂O₂, which disproportionates. The contact process takes SO₂ to SO₃ (V₂O₅), absorbs it in H₂SO₄ and dilutes. ClO₂ is made by reducing chlorate with SO₂.', hook: 'Contact: oxidise, absorb in acid (oleum), dilute.' },
  { id: 'halogens', title: 'Halogens and noble gases', rule: 'A halogen higher up the group oxidises a halide below it. I₂ + I⁻ gives I₃⁻. Fluorine drives interhalogens and xenon fluorides to high oxidation states; HF comes from fluorspar and acid.', hook: 'Cl₂ beats Br⁻ and I⁻; excess F₂ and heat give the highest fluoride.' },
  { id: 'nuclear', title: 'Nuclear equations', rule: 'Mass number A and atomic number Z each balance on both sides. n: A 1, Z 0. α: A 4, Z 2. β⁻: A 0, Z +1 (n → p + e⁻). The unknown is read off the periodic table from Z.', hook: 'Balance the top numbers, balance the bottom numbers, look up the symbol.' },
];

/* id, group, fields. Equations: see header. */
const R = [];
const add = (id, g, o) => R.push({ id, g, x: 1, ...o });

/* ------------------------------ H2 ------------------------------ */
add('h2-reform', 'h2', { aka: ['reforming'], name: 'Steam reforming', ask: 'Write steam reforming of methane (nickel catalyst, about 1200 K).', eq: 'CH4 + H2O -> CO + 3H2', cond: 'Ni catalyst, about 1200 K', hook: 'Methane plus steam gives synthesis gas: CO and three H₂.', x: 2, flag: 'unchecked' });
add('h2-wgs', 'h2', { aka: ['shift', 'water gas', 'water-gas'], name: 'Water–gas shift', ask: 'Write the water–gas shift reaction (iron oxide catalyst, about 700 K).', eq: 'CO + H2O -> CO2 + H2', cond: 'Fe oxide catalyst, about 700 K', hook: 'Shift the O from water onto CO: more H₂, CO₂ out.', x: 2, flag: 'unchecked' });
add('h2-coke', 'h2', { name: 'Coke and steam', ask: 'Write the reaction of coke with steam at 1000–1200 K.', eq: 'C + H2O -> CO + H2', cond: '1000–1200 K', hook: 'Hot carbon strips O from steam: CO + H₂ ("water gas").', flag: 'unchecked' });
add('h2-zn', 'h2', { ask: 'Write the laboratory preparation of H₂ from zinc and dilute HCl.', eq: 'Zn + 2HCl -> ZnCl2 + H2', cond: 'dilute HCl', hook: 'Metal above H in the series displaces H₂ from acid.' });
add('h2-al', 'h2', { ask: 'Write the laboratory preparation of H₂ from aluminium and aqueous NaOH.', eq: '2Al + 2NaOH + 6H2O -> 2Na[Al(OH)4] + 3H2', hook: 'Amphoteric Al dissolves in base as the tetrahydroxoaluminate.' });
add('h2-elec-acid', 'h2', { ask: 'Electrolysis of water in acid: write the anode and cathode half-equations (one per line, with e⁻).', steps: ['2H2O -> O2 + 4H^+ + 4e-', '2H^+ + 2e- -> H2'], hook: 'Anode oxidises water (O₂ + H⁺); cathode reduces H⁺.' });
add('h2-elec-base', 'h2', { ask: 'Electrolysis of water in base: write the anode and cathode half-equations (one per line, with e⁻).', steps: ['4OH^- -> O2 + 2H2O + 4e-', '2H2O + 2e- -> H2 + 2OH^-'], hook: 'Anode oxidises OH⁻; cathode reduces water to H₂ + OH⁻.' });
add('h2-hcl', 'h2', { ask: 'Write the formation of HCl from H₂ and Cl₂ (a light-initiated radical chain).', eq: 'H2 + Cl2 -> 2HCl', cond: 'light starts the chain (Cl–Cl is the weak bond)', hook: 'Cl• takes H from H₂; H• takes Cl from Cl₂; the cycle repeats.' });
add('h2-meoh', 'h2', { ask: 'Write the catalytic hydrogenation of carbon monoxide to methanol over ZnO.', eq: 'CO + 2H2 -> CH3OH', cond: 'ZnO catalyst', hook: 'CO takes two H₂ to become CH₃OH.' });

/* --------------------------- hydrides --------------------------- */
add('hyd-cah2', 'hydrides', { ask: 'Write the reaction of CaH₂ with water (why it is a drying agent).', eq: 'CaH2 + 2H2O -> Ca(OH)2 + 2H2', hook: 'H⁻ takes H⁺ from water: H₂ and hydroxide, so it removes water.' });
add('hyd-nad2o', 'hydrides', { ask: 'Write NaH reacting with D₂O.', eq: 'NaH + D2O -> NaOD + HD', hook: 'H⁻ takes one D⁺: essentially pure HD.' });
add('hyd-lialh4', 'hydrides', { name: 'Lithium aluminium hydride synthesis', ask: 'Write the synthesis of lithium aluminium hydride from LiH and Al₂Cl₆.', eq: '8LiH + Al2Cl6 -> 6LiCl + 2Li[AlH4]', hook: 'Hydride swaps for chloride; the Al ends up as AlH₄⁻.', flag: 'unchecked' });
add('hyd-nabh4', 'hydrides', { name: 'Sodium borohydride synthesis', ask: 'Write the synthesis of sodium borohydride from NaH and BCl₃.', eq: '4NaH + BCl3 -> 3NaCl + Na[BH4]', hook: 'Three H⁻ swap for Cl⁻; the fourth H⁻ binds B.', flag: 'unchecked' });
add('hyd-tih', 'hydrides', { ask: 'Hydride is a strong reducing agent: write the reaction of TiCl₄ with LiH to give Ti metal.', eq: 'TiCl4 + 4LiH -> Ti + 4LiCl + 2H2', hook: 'Four H⁻ give up their electrons, leaving H₂.', flag: 'unchecked' });
add('hyd-gH2', 'hydrides', { ask: 'Write the reaction of a Group 1 metal (sodium) with H₂.', eq: '2Na + H2 -> 2NaH', hook: 'All alkali metals reduce H₂ to the saline hydride MH.' });

/* ----------------------- group 1 and oxygen ----------------------- */
add('g1-li', 'g1o2', { ask: 'Write lithium burning in oxygen.', eq: '4Li + O2 -> 2Li2O', hook: 'Li is small: the oxide O²⁻.', x: 2 });
add('g1-na', 'g1o2', { ask: 'Write sodium heated in oxygen (the principal product).', eq: '2Na + O2 -> Na2O2', hook: 'Na: the peroxide O₂²⁻ (diamagnetic, singlet).', x: 3, fin: ['2023/24'] });
add('g1-k', 'g1o2', { ask: 'Write potassium heated in oxygen (the principal product).', eq: 'K + O2 -> KO2', hook: 'K, Rb, Cs: the superoxide O₂⁻ (one unpaired electron).', x: 3, fin: ['2024/25'] });
add('g1-na2o2', 'g1o2', { ask: 'Write sodium peroxide with water.', eq: 'Na2O2 + 2H2O -> 2NaOH + H2O2', hook: 'Peroxide + water → hydroxide + hydrogen peroxide.', x: 2 });
add('g1-ko2', 'g1o2', { ask: 'Write potassium superoxide with water.', eq: '2KO2 + 2H2O -> 2KOH + H2O2 + O2', hook: 'Superoxide + water → hydroxide + H₂O₂ and O₂.', x: 2 });
add('g1-ko2-co2', 'g1o2', { ask: 'KO₂ absorbs CO₂ and releases O₂ (breathing apparatus, submarines). Write the equation (product: K₂CO₃).', eq: '4KO2 + 2CO2 -> 2K2CO3 + 3O2', hook: 'It swaps CO₂ out for O₂: a breathing-apparatus scrubber.', x: 2 });

/* ---------------------- group 1: other reactions ---------------------- */
add('g1-li-n2', 'g1more', { ask: 'Li is the only alkali metal that reacts directly with N₂. Write the equation.', eq: '6Li + N2 -> 2Li3N', hook: 'Only Li makes a nitride directly; Li₃N is a fast-ion conductor.', x: 2 });
add('g1-li3n', 'g1more', { ask: 'Write the reaction of Li₃N with water (a lab source of NH₃).', eq: 'Li3N + 3H2O -> NH3 + 3LiOH', hook: 'N³⁻ is a very strong base: it takes three H⁺.' });
add('g1-c2h2', 'g1more', { ask: 'Write the reaction of sodium with acetylene.', eq: '2Na + C2H2 -> Na2C2 + H2', hook: 'Acetylene is acidic enough to lose both H⁺: carbide + H₂.' });
add('g1-rli', 'g1more', { ask: 'Write the formation of ethyllithium from Li metal and chloroethane.', eq: '2Li + C2H5Cl -> C2H5Li + LiCl', hook: 'Two Li: one goes into C–Li, one makes LiCl.' });

/* ------------------------- electrolysis ------------------------- */
add('na-downs', 'nacl', { aka: ['downs'], name: 'Downs cell', ask: 'Write the overall equation for electrolysis of molten NaCl (the Downs cell).', eq: '2NaCl -> 2Na + Cl2', cond: 'molten NaCl, no water', hook: 'No water: Na⁺ is reduced, Cl⁻ is oxidised.', x: 2 });
add('na-chlor', 'nacl', { aka: ['chlor', 'alkali'], name: 'Chlor-alkali process', ask: 'Write the overall equation for electrolysis of aqueous NaCl (chlor-alkali).', eq: '2NaCl + 2H2O -> 2NaOH + H2 + Cl2', cond: 'aqueous brine', hook: 'Water is reduced before Na⁺: H₂ and OH⁻ at the cathode.', x: 2 });
add('na-kbr', 'nacl', { ask: 'Electrolysis of molten KBr: write the anode and cathode half-equations (one per line, with e⁻).', steps: ['2Br^- -> Br2 + 2e-', 'K^+ + e- -> K'], hook: 'Anode oxidises the anion, cathode reduces the cation.', x: 2 });

/* ------------------------------ group 2 ------------------------------ */
add('g2-mg', 'g2', { ask: 'Write magnesium burning in oxygen (Be to Sr give the normal oxide).', eq: '2Mg + O2 -> 2MgO', hook: 'Be–Sr: oxide.' });
add('g2-ba', 'g2', { ask: 'Write the combustion of barium in O₂.', eq: 'Ba + O2 -> BaO2', hook: 'Ba is the big cation, so it takes the peroxide.', x: 2 });
add('g2-caco3', 'g2', { ask: 'Write the thermal decomposition of calcium carbonate.', eq: 'CaCO3 -> CaO + CO2', cond: 'heat; MgCO₃ < CaCO₃ < SrCO₃ in decomposition temperature', hook: 'Small cations pull the carbonate apart at lower T.' });
add('g2-limewater', 'g2', { ask: 'Bubbling CO₂ through limewater first gives a milky suspension, then a clear solution with more CO₂. Write both balanced equations (one per line).', steps: ['Ca(OH)2 + CO2 -> CaCO3 + H2O', 'CaCO3 + CO2 + H2O -> Ca(HCO3)2'], hook: 'Milky = CaCO₃; excess CO₂ turns it into soluble Ca(HCO₃)₂.', x: 2 });
add('g2-mg3n2', 'g2', { ask: 'Mg burns in N₂ to form a nitride, which reacts with water to give ammonia. Write both equations.', steps: ['3Mg + N2 -> Mg3N2', 'Mg3N2 + 6H2O -> 3Mg(OH)2 + 2NH3'], hook: 'Li and Mg are diagonal neighbours: both nitrides, both give NH₃ with water.' });
add('g2-beoh-naoh', 'g2', { ask: 'Be(OH)₂ is amphoteric. Write its reaction with NaOH.', eq: 'Be(OH)2 + 2NaOH -> Na2[Be(OH)4]', hook: 'Amphoteric like Al(OH)₃: dissolves in base to [Be(OH)₄]²⁻.', x: 2 });
add('g2-beoh-acid', 'g2', { ask: 'Write the reaction of Be(OH)₂ with sulfuric acid.', eq: 'Be(OH)2 + H2SO4 -> BeSO4 + 2H2O', hook: 'The same hydroxide also acts as a base.' });
add('g2-becl2', 'g2', { ask: 'Write the synthesis of anhydrous BeCl₂ from BeO and CCl₄ (1070 K).', eq: '2BeO + CCl4 -> 2BeCl2 + CO2', cond: '1070 K', hook: 'Anhydrous: CCl₄ chlorinates BeO and takes the oxygen as CO₂.' });

/* ------------------------------ boron ------------------------------ */
add('b-mg', 'boron', { ask: 'Write the reduction of B₂O₃ with magnesium to give amorphous boron.', eq: 'B2O3 + 3Mg -> 2B + 3MgO', hook: 'Mg takes the oxygen.' });
add('b-bf3', 'boron', { name: 'BF₃ from the oxide', ask: 'Write the laboratory synthesis of BF₃ from B₂O₃, CaF₂ and concentrated H₂SO₄.', eq: 'B2O3 + 3CaF2 + 3H2SO4 -> 2BF3 + 3CaSO4 + 3H2O', cond: 'concentrated H₂SO₄', hook: 'Acid + fluorspar make HF in situ; HF converts the oxide.', x: 2 });
add('b-b2h6', 'boron', { name: 'Diborane synthesis', ask: 'Write the industrial synthesis of B₂H₆ from BF₃ and NaH (450 K).', eq: '2BF3 + 6NaH -> B2H6 + 6NaF', cond: '450 K', hook: 'H⁻ swaps for F⁻; the three-centre bonds form the dimer.', x: 2 });
add('b-b2h6-h2o', 'boron', { ask: 'Write the hydrolysis of diborane.', eq: 'B2H6 + 6H2O -> 2B(OH)3 + 6H2', hook: 'Each B–H gives H₂; boric acid is left.' });
add('b-b2h6-o2', 'boron', { ask: 'Write the combustion of diborane.', eq: 'B2H6 + 3O2 -> B2O3 + 3H2O', hook: 'Burns to B₂O₃ and water.' });
add('b-bcl3-h2o', 'boron', { ask: 'Write the hydrolysis of BCl₃.', eq: 'BCl3 + 3H2O -> B(OH)3 + 3HCl', hook: 'BX₃ is a Lewis acid: water attacks and chloride leaves.', x: 2 });
add('b-bcl3-nh3', 'boron', { ask: 'Write BCl₃ with liquid ammonia (aminolysis).', eq: 'BCl3 + 6NH3 -> B(NH2)3 + 3NH4Cl', hook: 'Three NH₃ substitute, three more take the HCl as NH₄Cl.' });
add('b-bf3-hf', 'boron', { ask: 'Write the formation of tetrafluoroboric acid from BF₃ and HF.', eq: 'BF3 + HF -> H[BF4]', alt: ['BF3 + HF -> HBF4'], hook: 'BF₃ accepts F⁻ and becomes a strong acid.' });

/* ----------------------------- silicon ----------------------------- */
add('si-sih4', 'silicon', { ask: 'Write the synthesis of silane from SiCl₄ and LiAlH₄.', eq: 'SiCl4 + LiAlH4 -> SiH4 + LiAlCl4', hook: 'Hydride and chloride trade places.' });
add('si-sih4-koh', 'silicon', { ask: 'Write the hydrolysis of SiH₄ by aqueous KOH (product: potassium silicate K₂SiO₃).', eq: 'SiH4 + 2KOH + H2O -> K2SiO3 + 4H2', hook: 'Base cleaves every Si–H: four H₂.' });
add('si-shcl3', 'silicon', { name: 'Purification of silicon', ask: 'Write the formation of trichlorosilane from impure Si and anhydrous HCl (300 °C), the first step in purifying Si.', eq: 'Si + 3HCl -> SiHCl3 + H2', cond: 'anhydrous HCl, 300 °C; then thermal decomposition', hook: 'Distil the volatile SiHCl₃, then decompose it to pure Si.', x: 2 });
add('si-n-sih3', 'silicon', { ask: 'Write the synthesis of trisilylamine from SiH₃Cl and NH₃.', eq: '3SiH3Cl + 4NH3 -> N(SiH3)3 + 3NH4Cl', hook: 'Three Si–Cl react; extra NH₃ takes the HCl.' });
add('si-ether', 'silicon', { ask: 'Write the reaction of SiH₃Cl with water vapour to give disilyl ether.', eq: '2SiH3Cl + H2O -> (SiH3)2O + 2HCl', hook: 'Two SiH₃ share one O.' });
add('si-sif4', 'silicon', { ask: 'Write the synthesis of SiF₄ from SiO₂, CaF₂ and concentrated H₂SO₄.', eq: 'SiO2 + 2H2SO4 + 2CaF2 -> SiF4 + 2CaSO4 + 2H2O', hook: 'The same trick as BF₃: acid + fluorspar.' });
add('si-sicl4', 'silicon', { ask: 'Write the hydrolysis of liquid SiCl₄.', eq: 'SiCl4 + 2H2O -> SiO2 + 4HCl', hook: 'Si has empty d-type access: water attacks, silica forms.', x: 2 });
add('si-sif4-f', 'silicon', { ask: 'SiF₄ is a mild Lewis acid. Write SiF₄ accepting fluoride ions.', eq: 'SiF4 + 2F^- -> [SiF6]^2-', hook: 'Four-coordinate to six-coordinate.' });

/* ------------------------- nitrogen chain ------------------------- */
add('n-haber', 'nchain', { aka: ['haber'], name: 'Haber–Bosch process', ask: 'Write the Haber process equation.', eq: 'N2 + 3H2 -> 2NH3', cond: 'iron catalyst, heat, high pressure', hook: 'Hub of the nitrogen chart: N₂ + 3H₂ → 2NH₃.', x: 2 });
add('n-ostwald', 'nchain', { aka: ['ostwald'], name: 'Ostwald process', ask: 'Write the equations for the Ostwald process from NH₃ to HNO₃ (Pt catalyst, about 1300 K for the first step).', steps: ['4NH3 + 5O2 -> 4NO + 6H2O', '2NO + O2 -> 2NO2', '3NO2 + H2O -> 2HNO3 + NO'], alt: [['4NH3 + 5O2 -> 4NO + 6H2O', '2NO + O2 -> 2NO2', '4NO2 + O2 + 2H2O -> 4HNO3'], 'NH3 + 2O2 -> HNO3 + H2O'], cond: 'Pt catalyst, about 1300 K (first step)', hook: 'Burn NH₃ to NO, oxidise to NO₂, dissolve in water (NO is recycled).', x: 2 });
add('n-olin', 'nchain', { aka: ['olin', 'raschig'], name: 'Olin–Raschig process', ask: 'Write the Olin–Raschig process (overall, or as its two steps via chloramine).', eq: '2NH3 + NaOCl -> N2H4 + NaCl + H2O', alt: [['NH3 + NaOCl -> NH2Cl + NaOH', 'NH2Cl + NH3 + NaOH -> N2H4 + NaCl + H2O']], hook: 'Hypochlorite makes chloramine, which couples with a second NH₃.', x: 2 });
add('n-wislicenus', 'nchain', { aka: ['wislicenus'], name: 'Wislicenus process', ask: 'With chemical equations, explain the Wislicenus process (two steps).', steps: ['2Na + 2NH3 -> 2NaNH2 + H2', '2NaNH2 + N2O -> NaN3 + NaOH + NH3'], hook: 'Sodium makes sodamide; sodamide plus N₂O gives sodium azide.', x: 3, fin: ['2025/26'] });
add('n-azide', 'nchain', { ask: 'Write the decomposition of sodium azide in an airbag.', eq: '2NaN3 -> 2Na + 3N2', hook: 'Azide decomposes to N₂ gas, which inflates the bag.', x: 2 });
add('n-tnt', 'nchain', { ask: 'TNT (C₇H₅N₃O₆) decomposes to N₂, H₂O, CO and soot (C). Write the balanced equation.', eq: '2C7H5N3O6 -> 3N2 + 5H2O + 7CO + 7C', hook: 'Oxygen-poor explosive: lots of CO and carbon.' });
add('n-nh3-lab', 'nchain', { ask: 'Write the laboratory preparation of NH₃ by heating NH₄Cl with Ca(OH)₂.', eq: '2NH4Cl + Ca(OH)2 -> 2NH3 + CaCl2 + 2H2O', cond: 'heat', hook: 'A base frees NH₃ from its ammonium salt.' });
add('n-chloramine', 'nchain', { ask: 'Ammonia cleaners and hypochlorite bleach must never be mixed. Write the reaction of NH₃ with OCl⁻ that forms the toxic gas.', eq: 'NH3 + OCl^- -> NH2Cl + OH^-', hook: 'The first step of Olin–Raschig: chloramine.' });
add('n-nh4no3', 'nchain', { ask: 'Write the neutralisation that makes the fertiliser NH₄NO₃ from NH₃ and nitric acid.', eq: 'NH3 + HNO3 -> NH4NO3', hook: 'Base + acid; the nitrogen chart ends in ammonium nitrate.' });

/* ------------------- nitrogen oxides and nitric acid ------------------- */
add('nox-n2o', 'nox', { ask: 'Write the preparation of N₂O (laughing gas) by careful heating of ammonium nitrate (250 °C).', eq: 'NH4NO3 -> N2O + 2H2O', cond: '250 °C, careful heating', hook: 'Internal redox of NH₄⁺ and NO₃⁻.' });
add('nox-no2', 'nox', { ask: 'Write the preparation of NO₂ from copper and concentrated nitric acid.', eq: 'Cu + 4HNO3 -> Cu(NO3)2 + 2H2O + 2NO2', cond: 'concentrated HNO₃', hook: 'Concentrated acid gives NO₂ (dilute would give NO).' });
add('nox-n2o5', 'nox', { ask: 'N₂O₅ is the anhydride of nitric acid. Write its preparation by dehydrating HNO₃ with P₂O₅ (product also H₃PO₄).', eq: '6HNO3 + P2O5 -> 3N2O5 + 2H3PO4', hook: 'P₂O₅ is the dehydrating agent.' });
add('nox-n2o4', 'nox', { ask: 'NO₂/N₂O₄ are corrosive because they react with water. Write (i) N₂O₄ + H₂O and (ii) the disproportionation of HNO₂.', steps: ['N2O4 + H2O -> HNO3 + HNO2', '3HNO2 -> HNO3 + 2NO + H2O'], hook: 'Mixed anhydride: HNO₃ + HNO₂, and HNO₂ disproportionates.' });
add('nox-hno3-i2', 'nox', { ask: 'Concentrated HNO₃ oxidises I₂ to HIO₃ and is itself reduced to NO₂. Write the balanced equation.', eq: 'I2 + 10HNO3 -> 2HIO3 + 10NO2 + 4H2O', hook: 'Conc. HNO₃ takes a non-metal to its highest oxoacid.' });
add('nox-hno3-p4', 'nox', { ask: 'Concentrated HNO₃ oxidises P₄ to H₃PO₄ (NO₂ formed). Write the balanced equation.', eq: 'P4 + 20HNO3 -> 4H3PO4 + 20NO2 + 4H2O', hook: 'Every P goes to +5, five NO₂ each.' });
add('nox-hno3-s8', 'nox', { ask: 'Concentrated HNO₃ oxidises S₈ to H₂SO₄ (NO₂ formed). Write the balanced equation.', eq: 'S8 + 48HNO3 -> 8H2SO4 + 48NO2 + 16H2O', hook: 'Every S goes to +6: six NO₂ each.' });
add('nox-aqua', 'nox', { aka: ['aqua regia'], name: 'Aqua regia', ask: 'Aqua regia (1:3 conc. HNO₃ : HCl) dissolves Au(0) to give HAuCl₄. Write the balanced equation(s).', steps: ['HNO3 + 3HCl -> NOCl + Cl2 + 2H2O', 'Au + NOCl + Cl2 + HCl -> HAuCl4 + NO'], alt: ['Au + HNO3 + 4HCl -> HAuCl4 + NO + 2H2O'], hook: 'HNO₃ oxidises; Cl⁻ complexes Au³⁺ as [AuCl₄]⁻, which pulls the reaction over.', x: 3, fin: ['2023/24', '2025/26'] });
add('nox-clo2', 'nox', { ask: 'Balance: NaClO₃ + SO₂ + H₂SO₄ → ClO₂ + NaHSO₄ (write the balanced equation).', eq: '2NaClO3 + SO2 + H2SO4 -> 2ClO2 + 2NaHSO4', hook: 'SO₂ reduces Cl(V) to Cl(IV): yellow-green odd-electron ClO₂.', x: 3, fin: ['2024/25'] });

/* ----------------------------- phosphorus ----------------------------- */
add('p-extract', 'phos', { name: 'White phosphorus from phosphate rock', ask: 'Write the extraction of white phosphorus from phosphate rock, sand and coke.', eq: '2Ca3(PO4)2 + 6SiO2 + 10C -> P4 + 6CaSiO3 + 10CO', cond: 'heat, sand (SiO₂) and coke', hook: 'Coke reduces P(V); sand takes the calcium as CaSiO₃.', x: 3, fin: ['2025/26'] });
add('p-pf5', 'phos', { ask: 'White phosphorus is treated with fluorine gas. Write the equation.', eq: 'P4 + 10F2 -> 4PF5', hook: 'Excess F₂ takes P to +5; PF₅ is trigonal bipyramidal, a Lewis acid.', x: 3, fin: ['2024/25', '2025/26'] });
add('p-pcl3', 'phos', { ask: 'Write the formation of PCl₃ from white phosphorus.', eq: 'P4 + 6Cl2 -> 4PCl3', cond: 'limited Cl₂', hook: 'Limited oxidant gives P(III).' });
add('p-pf3', 'phos', { ask: 'Write the formation of PF₃ from CaF₂ and PCl₃ (driven by the stronger P–F bond).', eq: '3CaF2 + 2PCl3 -> 2PF3 + 3CaCl2', hook: 'P–F (490) beats P–Cl (322 kJ mol⁻¹).' });
add('p-pcl3-h2o', 'phos', { ask: 'Write the hydrolysis of PCl₃.', eq: 'PCl3 + 3H2O -> H3PO3 + 3HCl', hook: 'P(III) stays P(III): phosphorous acid, not phosphoric.', x: 3, fin: ['2023/24'] });
add('p-p4o6', 'phos', { ask: 'Write the controlled oxidation of P₄ to P₄O₆ (an O inserted into each P–P bond).', eq: 'P4 + 3O2 -> P4O6', cond: 'limited O₂', hook: 'Six P–P edges, six bridging O.', x: 2 });
add('p-p4o10', 'phos', { ask: 'Write the further oxidation of P₄O₆ to P₄O₁₀.', eq: 'P4O6 + 2O2 -> P4O10', cond: 'excess O₂', hook: 'Four terminal O added, one per P.', x: 2 });
add('p-p4o6-h2o', 'phos', { ask: 'Write P₄O₆ with water.', eq: 'P4O6 + 6H2O -> 4H3PO3', hook: 'P(III) oxide gives phosphorous acid.', x: 2 });
add('p-p4o10-h2o', 'phos', { ask: 'Write P₄O₁₀ with water.', eq: 'P4O10 + 6H2O -> 4H3PO4', hook: 'P(V) oxide gives phosphoric acid.', x: 2 });
add('p-amide', 'phos', { ask: 'P₄O₁₀ is a powerful dehydrating agent. Write the dehydration of benzamide (PhCONH₂) to benzonitrile (PhCN), with H₃PO₄ as the other product.', eq: '6PhCONH2 + P4O10 -> 6PhCN + 4H3PO4', hook: 'It removes H₂O from –CONH₂ to leave –C≡N (balanced from the scheme in the notes).', x: 2, flag: 'unchecked' });
add('p-wet', 'phos', { name: 'Wet method for phosphoric acid', ask: 'Write the manufacture of H₃PO₄ from phosphate rock and sulfuric acid (the "wet method").', eq: 'Ca3(PO4)2 + 3H2SO4 -> 2H3PO4 + 3CaSO4', hook: 'A stronger acid displaces the weaker; CaSO₄ precipitates.' });
add('p-nh4h2po4', 'phos', { ask: 'Write phosphoric acid with one equivalent of NH₃ (the first step to ammonium phosphate fertilisers).', eq: 'NH3 + H3PO4 -> NH4H2PO4', alt: ['NH3 + H3PO4 -> (NH4)H2PO4'], hook: 'Neutralise one acidic H.' });

/* -------------------- peroxide, sulfur, chlorine dioxide -------------------- */
add('o-thenard', 'osx', { aka: ['thenard'], name: 'Thenard preparation', ask: 'Write Thenard\'s preparation of H₂O₂ from barium peroxide and dilute H₂SO₄.', eq: 'BaO2 + H2SO4 -> BaSO4 + H2O2', cond: 'dilute H₂SO₄', hook: 'BaSO₄ precipitates, leaving H₂O₂.' });
add('o-h2o2', 'osx', { ask: 'Write the disproportionation of hydrogen peroxide (oxidation numbers −1 to −2 and 0).', eq: '2H2O2 -> 2H2O + O2', hook: 'The same O goes both down (to water) and up (to O₂).' });
add('s-contact', 'osx', { aka: ['contact'], name: 'Contact process', ask: 'Write the three steps that turn SO₂ into sulfuric acid in the contact process (oxidation; absorption into acid; dilution).', steps: ['2SO2 + O2 -> 2SO3', 'SO3 + H2SO4 -> H2S2O7', 'H2S2O7 + H2O -> 2H2SO4'], cond: 'V₂O₅ catalyst for the oxidation', hook: 'Oxidise, absorb in acid to make oleum (H₂S₂O₇), dilute.', x: 2 });
add('s-sf6', 'osx', { ask: 'Write the hydrolysis of SF₆ (thermodynamically favourable, ΔG° = −221 kJ mol⁻¹, yet it does not happen).', eq: 'SF6 + 3H2O -> SO3 + 6HF', hook: 'Kinetically inert, not thermodynamically: no low-energy pathway.' });

/* --------------------------- halogens and noble gases --------------------------- */
add('hal-clbr', 'halogens', { ask: 'Write chlorine bubbled into aqueous bromide.', eq: 'Cl2 + 2Br^- -> 2Cl^- + Br2', hook: 'The halogen higher up the group wins.', x: 2 });
add('hal-cli', 'halogens', { ask: 'Write chlorine bubbled into aqueous iodide.', eq: 'Cl2 + 2I^- -> 2Cl^- + I2', hook: 'Same rule: Cl₂ oxidises I⁻.' });
add('hal-i3', 'halogens', { ask: 'I₂ dissolves readily in aqueous KI. Write the equation.', eq: 'I2 + I^- -> I3^-', hook: 'I⁻ donates into the σ* of I₂: linear I₃⁻.' });
add('hal-if5', 'halogens', { ask: 'Write the reaction of I₂ with F₂ at room temperature (the interhalogen with five F).', eq: 'I2 + 5F2 -> 2IF5', hook: 'Room temperature stops at IF₅.' });
add('hal-if7', 'halogens', { ask: 'Write the reaction of I₂ with F₂ at 250–300 °C (the interhalogen with seven F).', eq: 'I2 + 7F2 -> 2IF7', cond: '250–300 °C', hook: 'More heat and excess F₂ reach IF₇.' });
add('hal-hf', 'halogens', { ask: 'Write the production of HF from fluorspar (CaF₂) and concentrated H₂SO₄.', eq: 'CaF2 + 2H2SO4 -> 2HF + Ca(HSO4)2', alt: ['CaF2 + H2SO4 -> CaSO4 + 2HF'], cond: 'concentrated H₂SO₄', hook: 'A strong non-volatile acid displaces volatile HF.', x: 2 });
add('ng-xef2', 'halogens', { ask: 'Write xenon reacting with fluorine to give the +2 fluoride.', eq: 'Xe + F2 -> XeF2', hook: 'Linear XeF₂.' });
add('ng-xef4', 'halogens', { ask: 'Write xenon reacting with excess fluorine at 400 °C (the +4 fluoride).', eq: 'Xe + 2F2 -> XeF4', cond: 'excess F₂, 400 °C', hook: 'Square-planar XeF₄.' });

/* ------------------------------ nuclear ------------------------------ */
const nuc = (id, ask, answer, why, fin = [], x = 2) => add(id, 'nuclear', { kind: 'nuc', ask, answer, hook: why, flag: 'unchecked', x, fin });
nuc('nuc-ne', 'Capture of an α-particle (⁴He) by ²²Ne, followed by release of a neutron, gives species X. Which isotope of which element is X?', { A: 25, Z: 12, sym: 'Mg', name: 'magnesium' }, 'A: 22 + 4 − 1 = 25. Z: 10 + 2 − 0 = 12, magnesium.', ['2024/25'], 3);
nuc('nuc-u', '²³⁸U captures a neutron, then undergoes two successive β⁻ decays. What isotope results?', { A: 239, Z: 94, sym: 'Pu', name: 'plutonium' }, 'A: 238 + 1 = 239. Each β⁻ adds 1 to Z: 92 → 93 → 94, plutonium.', ['2025/26'], 3);
nuc('nuc-t', 'Natural tritium forms by neutron capture by nitrogen: ¹⁴N + n → T + X. What is X?', { A: 12, Z: 6, sym: 'C', name: 'carbon' }, 'A: 14 + 1 = 3 + 12. Z: 7 = 1 + 6, carbon-12.');
nuc('nuc-be', '⁹Be + ⁴He → n + X. What is X?', { A: 12, Z: 6, sym: 'C', name: 'carbon' }, 'A: 9 + 4 = 1 + 12. Z: 4 + 2 = 0 + 6, carbon-12 (the discovery of the neutron).');

/* ------------------------------ chains ------------------------------ */
export const CHAINS = [
  { id: 'chain-n', title: 'Nitrogen chart', rows: [
    { from: 'N₂ + H₂', to: 'NH₃', label: 'Fe, heat, pressure (Haber)', rid: 'n-haber' },
    { from: 'NH₃ + O₂', to: 'NO + H₂O', label: 'Pt, 1300 K (Ostwald step 1)', rid: 'n-ostwald' },
    { from: 'NO + O₂', to: 'NO₂', label: 'Ostwald step 2', rid: 'n-ostwald' },
    { from: 'NO₂ + H₂O', to: 'HNO₃ + NO', label: 'Ostwald step 3', rid: 'n-ostwald' },
    { from: 'NH₃ + NaOCl', to: 'N₂H₄', label: 'Olin–Raschig', rid: 'n-olin' },
    { from: 'NH₃ + HNO₃', to: 'NH₄NO₃', label: 'neutralisation', rid: 'n-nh4no3' } ] },
  { id: 'chain-p', title: 'Phosphorus scheme', rows: [
    { from: 'Ca₃(PO₄)₂', to: 'P₄', label: 'SiO₂, C, heat', rid: 'p-extract' },
    { from: 'P₄', to: 'PF₅', label: 'F₂ (excess)', rid: 'p-pf5' },
    { from: 'P₄', to: 'P₄O₆', label: 'limited O₂', rid: 'p-p4o6' },
    { from: 'P₄O₆', to: 'H₃PO₃', label: '+ H₂O', rid: 'p-p4o6-h2o' },
    { from: 'P₄O₆', to: 'P₄O₁₀', label: '+ O₂', rid: 'p-p4o10' },
    { from: 'P₄O₁₀', to: 'H₃PO₄', label: '+ H₂O', rid: 'p-p4o10-h2o' },
    { from: 'P₄O₁₀ + PhCONH₂', to: 'PhCN + H₃PO₄', label: 'dehydration', rid: 'p-amide' },
    { from: 'P₄', to: 'PCl₃', label: 'limited Cl₂', rid: 'p-pcl3' },
    { from: 'PCl₃', to: 'H₃PO₃ + HCl', label: '+ H₂O', rid: 'p-pcl3-h2o' },
    { from: 'PCl₃ + CaF₂', to: 'PF₃', label: 'F for Cl', rid: 'p-pf3' } ] },
  { id: 'chain-na', title: 'Sodium compounds', rows: [
    { from: 'NaCl (molten)', to: 'Na + Cl₂', label: 'Downs cell', rid: 'na-downs' },
    { from: 'NaCl (aq)', to: 'NaOH + H₂ + Cl₂', label: 'chlor-alkali', rid: 'na-chlor' },
    { from: 'Na + NH₃', to: 'NaNH₂ + H₂', label: 'Wislicenus 1', rid: 'n-wislicenus' },
    { from: 'NaNH₂ + N₂O', to: 'NaN₃ + NaOH + NH₃', label: 'Wislicenus 2', rid: 'n-wislicenus' },
    { from: 'NaN₃', to: 'Na + N₂', label: 'airbag', rid: 'n-azide' } ] },
  { id: 'chain-g1', title: 'Group 1 in oxygen', rows: [
    { from: 'Li + O₂', to: 'Li₂O', label: 'oxide', rid: 'g1-li' },
    { from: 'Na + O₂', to: 'Na₂O₂', label: 'peroxide', rid: 'g1-na' },
    { from: 'K + O₂', to: 'KO₂', label: 'superoxide', rid: 'g1-k' },
    { from: 'Na₂O₂ + H₂O', to: 'NaOH + H₂O₂', label: '', rid: 'g1-na2o2' },
    { from: 'KO₂ + H₂O', to: 'KOH + H₂O₂ + O₂', label: '', rid: 'g1-ko2' },
    { from: 'KO₂ + CO₂', to: 'K₂CO₃ + O₂', label: 'breathing apparatus', rid: 'g1-ko2-co2' } ] },
  { id: 'chain-s', title: 'Contact process', rows: [
    { from: 'SO₂ + O₂', to: 'SO₃', label: 'V₂O₅', rid: 's-contact' },
    { from: 'SO₃ + H₂SO₄', to: 'H₂S₂O₇ (oleum)', label: 'absorb', rid: 's-contact' },
    { from: 'H₂S₂O₇ + H₂O', to: 'H₂SO₄', label: 'dilute', rid: 's-contact' } ] },
  { id: 'chain-h2', title: 'Hydrogen from methane', rows: [
    { from: 'CH₄ + H₂O', to: 'CO + 3H₂', label: 'Ni, 1200 K', rid: 'h2-reform' },
    { from: 'CO + H₂O', to: 'CO₂ + H₂', label: 'Fe oxide, 700 K', rid: 'h2-wgs' },
    { from: 'CO + H₂', to: 'CH₃OH', label: 'ZnO', rid: 'h2-meoh' } ] },
];

export function build() {
  const ids = new Set();
  for (const r of R) { if (ids.has(r.id)) throw new Error('duplicate ' + r.id); ids.add(r.id); }
  const groupIds = new Set(GROUPS.map((g) => g.id));
  for (const r of R) if (!groupIds.has(r.g)) throw new Error(`${r.id}: unknown group ${r.g}`);
  for (const c of CHAINS) for (const row of c.rows) if (!ids.has(row.rid)) throw new Error(`${c.id}: unknown reaction ${row.rid}`);
  return { version: 1, module: 'CM2021', exportedAt: '2026-11-22', groups: GROUPS, chains: CHAINS, reactions: R };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const out = path.join(root, 'public', 'content', 'cm2021', 'reactions.json');
  const doc = build();
  fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
  console.log(`CM2021 reactions: ${doc.reactions.length} reactions, ${doc.groups.length} groups, ${doc.chains.length} chains -> ${out}`);
}
