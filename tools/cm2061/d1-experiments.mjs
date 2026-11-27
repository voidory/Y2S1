/* Chunk D, part 1: Experiments 1A-1F (Manual pp.29-34). Week 4. Every item covers a variant, not only the one a student did. */
import { mcq, mcqSet } from './lib.mjs';

const W = 4;
const items = [];
const add = (x) => items.push(x);
const X = (e, aspect, name) => ({ week: W, chunk: `ex-${e}`, skill: `ex.${e}.${aspect}`, skillName: name });
const R = (e) => X(e, 'reaction', 'Reaction, reagents and roles');
const K = (e) => X(e, 'work', 'Work-up, purification and apparatus');
const C = (e) => X(e, 'char', 'Observations, characterisation and problems');

// ======================================= 1A paracetamol (p.29) =======================================
add(mcq({
  id: 'bk-c61-d-1a-reaction', ...R('1a'), source: 'Manual p.29', beyond: true,
  stem: 'In Expt 1A, 4-aminophenol reacts with acetic anhydride. Which reaction class and site of reaction is correct?',
  right: ['Nucleophilic acyl substitution on nitrogen (N-acetylation); the amine is a better nucleophile than the phenol OH', 'The NH₂ attacks a carbonyl of the anhydride, expelling acetate, to give the amide paracetamol and acetic acid.'],
  wrong: [['Electrophilic aromatic substitution on the ring', 'The anhydride acylates the heteroatom nucleophile; the ring is not attacked under these conditions.'], ['Esterification of the phenol OH', 'The OH is the weaker nucleophile; the amide forms instead.'], ['Aldol condensation', 'There is no enolisable carbonyl component acting as a nucleophile here.']],
}));
add(mcq({
  id: 'bk-c61-d-1a-byproduct', ...R('1a'), source: 'Manual p.29', beyond: true,
  stem: 'What is the by-product of 4-aminophenol + acetic anhydride, and what happens to it?',
  right: ['Acetic acid; it stays dissolved in the aqueous mother liquor and is washed away', 'One acetyl group goes to the amine and the other leaves as acetic acid.'],
  wrong: [['Sodium acetate; it crystallises with the product', 'No sodium is present at this stage; NaOH only appears in the later purification.'], ['Hydrogen gas; it bubbles out', 'No reduction occurs.'], ['Water; it makes the reaction boil', 'The acylation of an amine by an anhydride releases acetic acid, not water.']],
}));
add(mcq({
  id: 'bk-c61-d-1a-naoh', ...K('1a'), source: 'Manual p.29', beyond: true,
  stem: 'To purify crude paracetamol you dissolve it in 2 M NaOH, filter, and then acidify the filtrate with 6 M HCl. What does this achieve?',
  right: ['The phenol is deprotonated to the soluble phenoxide, so insoluble non-acidic impurities are filtered off; acid then re-forms the insoluble paracetamol', 'This acid-base purification separates the product from material that is not soluble in base.'],
  wrong: [['The NaOH hydrolyses paracetamol to 4-aminophenol, which is then re-acetylated', 'No second acetylation takes place; the base only deprotonates the phenol.'], ['The HCl converts paracetamol to its hydrochloride salt, which dissolves', 'The point of acidifying is to precipitate paracetamol, which comes out as a solid.'], ['The NaOH removes the water of crystallisation', 'It performs an acid-base separation; no hydrate is involved.']],
}));
add(mcq({
  id: 'bk-c61-d-1a-litmus', ...K('1a'), source: 'Manual p.29',
  stem: 'How do you know enough 6 M hydrochloric acid has been added to the basic paracetamol solution?',
  right: ['Blue litmus turns red, and a precipitate of paracetamol forms', 'The solution must be acidic so that the phenoxide is converted back to neutral paracetamol; the HCl is added dropwise and cautiously.'],
  wrong: [['The solution turns clear and colourless', 'The solution should turn cloudy as the product precipitates.'], ['Red litmus turns blue', 'That indicates a basic solution, i.e. not enough acid.'], ['The temperature drops to 0 °C', 'Neutralisation of NaOH by HCl is exothermic; temperature is not the indicator.']],
}));
add(mcq({
  id: 'bk-c61-d-1a-recryst', ...K('1a'), source: 'Manual p.29',
  stem: 'The manual warns about the amount of solvent for recrystallising paracetamol from water. What is the instruction?',
  right: ['Use the minimum amount of hot solvent, found by adding small portions to the heated sample until it just dissolves', 'This gives a saturated solution; too much solvent means no crystals on cooling.'],
  wrong: [['Use plenty of water so that all impurities dissolve and stay dissolved', 'Too much water leaves the product in solution.'], ['Use a fixed volume of 50 mL for every sample', 'The right volume depends on the sample; it is found by trial.'], ['Add water until the solution is cold', 'The aim is saturation at high temperature.']],
}));
add(mcq({
  id: 'bk-c61-d-1a-ir', ...C('1a'), source: 'Manual p.29; IR correlation tables', beyond: true,
  stem: 'Which feature of the IR spectrum would distinguish paracetamol from the 4-aminophenol starting material?',
  right: ['An amide C=O band near 1650 cm⁻¹, which is absent in 4-aminophenol', 'The starting material has NH₂ and OH but no carbonyl.'],
  wrong: [['A broad O-H band, which is absent in the product', 'Paracetamol keeps the phenolic OH, so an O-H band remains.'], ['An ester C=O at 1740 cm⁻¹', 'The product is an amide, not an ester; its C=O is lower in frequency.'], ['A nitrile band at 2250 cm⁻¹', 'There is no nitrile.']],
}));
add(mcq({
  id: 'bk-c61-d-1a-hazard', ...K('1a'), source: 'Manual p.29',
  stem: 'Which hazard does the manual attach to Expt 1A?',
  right: ['Acetic anhydride is corrosive', 'The corrosive property is the hazard; precautions are gloves and the fume cupboard when dispensing.'],
  wrong: [['4-Aminophenol is pyrophoric', 'It is not.'], ['Sodium hydroxide gas is released', 'NaOH is a solid or a solution; no gas is released.'], ['Water is flammable', 'It is not.']],
}));

// ======================================= 1B phenyl tosylate (p.30) =======================================
add(mcq({
  id: 'bk-c61-d-1b-reaction', ...R('1b'), source: 'Manual p.30', beyond: true,
  stem: 'Why is sodium hydroxide added to phenol before the tosyl chloride in Expt 1B?',
  right: ['It converts phenol to the much more nucleophilic phenoxide, and it neutralises the HCl produced', 'Phenoxide attacks the sulfur of TsCl, displacing chloride (nucleophilic substitution at sulfur).'],
  wrong: [['It protects the sulfonyl chloride from oxidation', 'The NaOH activates the phenol; it does nothing for oxidation protection.'], ['It dehydrates the phenol to benzene', 'Phenol is not dehydrated; it is deprotonated.'], ['It reduces TsCl to a sulfinate', 'No reduction takes place.']],
}));
add(mcq({
  id: 'bk-c61-d-1b-acetone', ...R('1b'), source: 'Manual p.30', beyond: true,
  stem: 'Why is tosyl chloride added as a solution in acetone from a separatory funnel?',
  right: ['TsCl is a solid that dissolves in acetone (miscible with water), so it can be added slowly and mixes with the aqueous phenoxide', 'Slow dropwise addition with vigorous stirring controls the reaction and limits hydrolysis of TsCl by the base.'],
  wrong: [['Acetone is the nucleophile that reacts with TsCl', 'Acetone is just a solvent here.'], ['Acetone removes the HCl produced', 'The base neutralises HCl.'], ['The funnel keeps the mixture under nitrogen', 'The funnel is simply an addition funnel.']],
}));
add(mcq({
  id: 'bk-c61-d-1b-water', ...K('1b'), source: 'Manual p.30', beyond: true,
  stem: 'After stirring 15 minutes, the contents are poured into 30 mL of water. What does this do?',
  right: ['The water-insoluble ester precipitates, while salts, excess NaOH and the sodium sulfonate from hydrolysed TsCl stay in solution', 'The product is isolated by filtration (Buchner) and then recrystallised from ethanol.'],
  wrong: [['It hydrolyses the product back to phenol', 'Phenyl tosylate is not significantly hydrolysed by this quench.'], ['It dissolves the product so it can be extracted', 'The product precipitates and is filtered off.'], ['It cools the reaction to 0 °C', 'Pouring into water cools slightly, but the purpose is to precipitate the product.']],
}));
add(mcq({
  id: 'bk-c61-d-1b-hazards', ...K('1b'), source: 'Manual p.30',
  stem: 'Which hazards and notes does the manual give for Expt 1B?',
  right: ['Phenol is corrosive; tosyl chloride is toxic (avoid skin contact) with a stench, so clean up any spills immediately', 'These are the manual\'s warnings for the two reagents.'],
  wrong: [['Acetone is the main hazard because it is explosive in water', 'Acetone is flammable, but the manual\'s listed hazards are phenol and tosyl chloride.'], ['TsCl is odourless but corrosive', 'The manual specifically mentions the stench.'], ['Sodium hydroxide is the only hazard', 'Phenol and TsCl are also listed.']],
}));
add(mcq({
  id: 'bk-c61-d-1b-ir', ...C('1b'), source: 'Manual p.30; IR correlation tables', beyond: true,
  stem: 'Which IR change shows that phenol has become phenyl tosylate?',
  right: ['The broad O-H band of phenol disappears and strong sulfonate S=O bands appear near 1370 and 1180 cm⁻¹', 'An aryl sulfonate ester has no OH but shows asymmetric and symmetric S=O stretches.'],
  wrong: [['A new C=O band near 1700 cm⁻¹', 'There is no carbonyl in the product.'], ['A new N-H band near 3300 cm⁻¹', 'There is no nitrogen.'], ['A nitrile band near 2250 cm⁻¹', 'No nitrile is present.']],
}));
add(mcq({
  id: 'bk-c61-d-1b-limiting', ...R('1b'), source: 'Manual p.30 (quantities)', beyond: true,
  stem: 'Phenol (1 g, about 10.6 mmol), 5 mL of 2 M NaOH (10 mmol) and tosyl chloride (1.82 g, about 9.5 mmol) are used. Which reagent limits the amount of ester that can form?',
  right: ['Tosyl chloride', 'It gives the smallest number of moles (about 9.5 mmol) so it sets the theoretical yield, even though phenol is named first.'],
  wrong: [['Phenol', 'There is more phenol (10.6 mmol) than TsCl.'], ['Sodium hydroxide', 'NaOH (10 mmol) is also in slight excess over TsCl.'], ['Acetone', 'It is a solvent and not stoichiometric.']],
}));

// ======================================= 1C dibenzalacetone (p.31) =======================================
add(mcq({
  id: 'bk-c61-d-1c-reaction', ...R('1c'), source: 'Manual p.31', beyond: true,
  stem: 'What reaction type forms dibenzalacetone from benzaldehyde and acetone with NaOH?',
  right: ['A base-catalysed crossed aldol condensation (twice), with loss of water', 'The acetone enolate attacks benzaldehyde; dehydration gives a conjugated enone, and the process repeats on the other side of the acetone.'],
  wrong: [['A Grignard addition', 'No organometallic reagent is present.'], ['A Friedel-Crafts acylation', 'No acylium ion or Lewis acid is involved.'], ['A Cannizzaro reaction giving benzyl alcohol and benzoate', 'That is a side reaction of benzaldehyde with strong base, not the aim.']],
}));
add(mcq({
  id: 'bk-c61-d-1c-roles', ...R('1c'), source: 'Manual p.31', beyond: true,
  stem: 'Why does benzaldehyde act only as the electrophile in this aldol reaction?',
  right: ['It has no α-hydrogens, so it cannot form an enolate and cannot condense with itself', 'Acetone is the only partner that can enolise, so the crossed reaction is clean.'],
  wrong: [['It is too hindered to react with itself', 'The key is the lack of α-hydrogens, not steric bulk.'], ['It is deactivated by the ring and unreactive to nucleophiles', 'Aromatic aldehydes are good electrophiles.'], ['It is insoluble in ethanol', 'It dissolves in ethanol.']],
}));
add(mcq({
  id: 'bk-c61-d-1c-temp', ...K('1c'), source: 'Manual p.31',
  stem: 'Why is the benzaldehyde-acetone solution added slowly, with the temperature held between 20 and 25 °C?',
  right: ['The reaction is exothermic, and higher temperatures favour side reactions; slow addition with a cooling bath keeps it under control', 'The NaOH solution is first cooled in an ice-water bath.'],
  wrong: [['Below 20 °C the benzaldehyde freezes', 'Benzaldehyde does not freeze at these temperatures.'], ['Above 25 °C the ethanol boils', 'Ethanol boils at about 78 °C.'], ['The product only forms below 20 °C', 'The target range is 20-25 °C.']],
}));
add(mcq({
  id: 'bk-c61-d-1c-stoich', ...R('1c'), source: 'Manual p.31 (quantities)', beyond: true,
  stem: 'The procedure uses about 16.7 mmol of benzaldehyde and 8.6 mmol of acetone. Why is the ratio about 2:1?',
  right: ['Each acetone molecule condenses with two benzaldehyde molecules, one at each α-carbon, giving the bis-benzylidene product', 'Acetone is therefore the limiting reagent for the theoretical yield.'],
  wrong: [['One benzaldehyde per acetone is enough, so the extra is to speed the reaction', 'The product contains two benzylidene units, so two benzaldehydes are needed.'], ['Benzaldehyde acts as the base', 'The base is NaOH.'], ['Acetone is also the solvent', 'Acetone is the reagent used in limited amount; ethanol/water is the solvent.']],
}));
add(mcq({
  id: 'bk-c61-d-1c-ir', ...C('1c'), source: 'Manual p.31; IR correlation tables', beyond: true,
  stem: 'Which IR band is characteristic of dibenzalacetone, and where does it fall relative to an ordinary ketone?',
  right: ['A conjugated C=O near 1650 cm⁻¹, lower than the 1715 cm⁻¹ of acetone', 'Conjugation with two C=C bonds lowers the carbonyl frequency; a C=C stretch appears near 1600-1625 cm⁻¹ too.'],
  wrong: [['An aldehyde C-H near 2720 cm⁻¹ from unreacted benzaldehyde', 'In the pure product that band should be absent, so its presence would indicate contamination.'], ['A broad O-H near 3300 cm⁻¹', 'There is no OH in the pure product.'], ['A C=O at 1740 cm⁻¹', 'That is typical of an ester.']],
}));
add(mcq({
  id: 'bk-c61-d-1c-recryst', ...K('1c'), source: 'Manual p.31',
  stem: 'How is crude dibenzalacetone purified, and what does the manual ask you to record?',
  right: ['Recrystallise from ethanol, dry in a desiccator, then measure the mp and yield, record the IR and run TLC', 'The solid is collected by filtration first.'],
  wrong: [['Distil it under reduced pressure', 'It is a solid, not a distillable liquid under these conditions.'], ['Run a flash column on the crude solid', 'Column chromatography is Expt 7.'], ['Sublime it under vacuum', 'Sublimation is used in Expt 5E.']],
}));

// ======================================= 1D Py2Zn(NCO)2 (p.32) =======================================
add(mcq({
  id: 'bk-c61-d-1d-reaction', ...R('1d'), source: 'Manual p.32', beyond: true,
  stem: 'What is the balanced overall change in Expt 1D?',
  right: ['Zn(NO₃)₂ + 2 NaNCO + 2 py → Zn(py)₂(NCO)₂ + 2 NaNO₃', 'Cyanate and pyridine both coordinate to zinc; the sodium nitrate stays in solution.'],
  wrong: [['Zn(NO₃)₂ + NaNCO + py → Zn(py)(NCO)₂ + NaNO₃', 'This does not balance: two cyanates and two pyridines are needed per zinc.'], ['Zn + 2 NaNCO + 2 py → Zn(py)₂(NCO)₂ + 2 Na', 'Zinc starts as Zn(II) nitrate, not the metal, and sodium is not released as a metal.'], ['Zn(NO₃)₂ + 2 py → Zn(py)₂(NO₃)₂', 'This is a different complex; the cyanate is the second ligand type.']],
}));
add(mcq({
  id: 'bk-c61-d-1d-stoich', ...R('1d'), source: 'Manual p.32 (volumes and concentrations)', beyond: true,
  stem: '3 mL of 2 M Zn(NO₃)₂ is treated with 12 mL of 1 M NaNCO. What is the cyanate-to-zinc mole ratio?',
  right: ['2:1 (12 mmol NCO⁻ to 6 mmol Zn²⁺)', 'This matches the formula Zn(py)₂(NCO)₂ with two cyanate ligands per zinc.'],
  wrong: [['1:1', 'That would use 6 mL of the cyanate solution.'], ['4:1', 'That ratio does not follow from 12 mmol and 6 mmol.'], ['1:2', 'The ratio is inverted.']],
}));
add(mcq({
  id: 'bk-c61-d-1d-wash', ...K('1d'), source: 'Manual p.32', beyond: true,
  stem: 'The filtered complex is washed with ice-cold water. What does this remove, and why cold?',
  right: ['Dissolved salts such as sodium nitrate; cold water minimises loss of the slightly soluble product', 'A cold wash rinses the by-product off the solid without redissolving the complex.'],
  wrong: [['Unreacted pyridine, which is insoluble in water', 'Pyridine is miscible with water; the main contaminant is the sodium salt.'], ['Unreacted zinc metal', 'No zinc metal is present.'], ['The wash is for cooling the product only', 'It removes soluble impurities too.']],
}));
add(mcq({
  id: 'bk-c61-d-1d-hazard', ...K('1d'), source: 'Manual p.32',
  stem: 'What hazard does the manual give for Expt 1D?',
  right: ['Pyridine is toxic: avoid inhalation and skin contact', 'Dispense it in the fume cupboard with a syringe, wearing gloves.'],
  wrong: [['Zinc nitrate is explosive when warmed to 50 °C', 'The listed hazard is pyridine.'], ['Sodium cyanate releases hydrogen cyanide on warming', 'The manual does not say this; it warns about pyridine.'], ['The reaction must be done under nitrogen', 'It is carried out in water in air.']],
}));
add(mcq({
  id: 'bk-c61-d-1d-structure', ...R('1d'), source: 'Manual p.32 (structure drawn)', beyond: true,
  stem: 'In Py₂Zn(NCO)₂ the cyanate ligands bind to zinc through which atom, and what is the likely geometry at zinc?',
  right: ['Through nitrogen (an isocyanate), with a tetrahedral arrangement of two pyridine N and two NCO N donors', 'The drawn structure shows four nitrogen donors around zinc(II), a d¹⁰ centre that favours tetrahedral geometry.'],
  wrong: [['Through oxygen, with square-planar geometry', 'The manual\'s drawing shows Zn-NCO bonds, and zinc(II) d¹⁰ is not square-planar.'], ['Through carbon, with octahedral geometry', 'Coordination via carbon would be a cyanide-type ligand; this is a four-coordinate complex.'], ['The cyanate bridges two zinc ions in a polymer', 'The manual\'s formula is a discrete four-coordinate complex.']],
}));
add(mcq({
  id: 'bk-c61-d-1d-ir', ...C('1d'), source: 'Manual p.32; IR correlation tables', beyond: true,
  stem: 'Which IR band would you look for to confirm the isocyanate ligand in Py₂Zn(NCO)₂?',
  right: ['A strong N=C=O asymmetric stretch in the 2200-2250 cm⁻¹ region', 'This cumulated-double-bond stretch is distinctive and appears in the triple-bond window.'],
  wrong: [['A broad O-H band near 3300 cm⁻¹', 'The complex has no OH.'], ['A strong C=O stretch near 1715 cm⁻¹', 'There is no ketone-type carbonyl.'], ['A nitro stretch near 1530 cm⁻¹', 'The nitrate remained in solution as sodium nitrate.']],
}));

// ======================================= 1E 1-tosylpyrrole (p.33) =======================================
add(mcq({
  id: 'bk-c61-d-1e-reaction', ...R('1e'), source: 'Manual p.33', beyond: true,
  stem: 'What is 2,5-dimethoxytetrahydrofuran doing in Expt 1E?',
  right: ['It is a masked succinaldehyde (a 1,4-dicarbonyl equivalent) that, in hot acetic acid, condenses with the sulfonamide nitrogen to build the pyrrole ring', 'The acetals lose methanol under acid, and the nitrogen closes the five-membered ring, which then loses water (Clauson-Kaas pyrrole synthesis).'],
  wrong: [['It is the nucleophile that adds to the aromatic ring of tosylamide', 'It supplies the four carbons of the pyrrole ring, not a ring substituent.'], ['It is a base that deprotonates the sulfonamide', 'The medium is acidic (acetic acid), not basic.'], ['It is an oxidant converting the NH₂ to NO₂', 'No oxidation takes place.']],
}));
add(mcq({
  id: 'bk-c61-d-1e-stoich', ...R('1e'), source: 'Manual p.33 (quantities)', beyond: true,
  stem: 'About 7.6 mmol of 2,5-dimethoxytetrahydrofuran react with about 5.8 mmol of p-toluenesulfonamide. Which is the limiting reagent?',
  right: ['p-Toluenesulfonamide', 'It supplies the nitrogen that goes into the pyrrole and has the smaller number of moles.'],
  wrong: [['2,5-Dimethoxytetrahydrofuran', 'There is more of it (7.6 mmol) than sulfonamide (5.8 mmol).'], ['Acetic acid', 'It is the solvent, in large excess.'], ['They are exactly equal', 'The moles differ.']],
}));
add(mcq({
  id: 'bk-c61-d-1e-workup', ...K('1e'), source: 'Manual p.33',
  stem: 'After two hours at reflux the mixture is poured into 60 mL of water and the solid is washed with water. What are the washings for?',
  right: ['To remove acetic acid until the solid no longer smells of it, leaving the insoluble product', 'The acid and water-soluble by-products stay in the aqueous phase.'],
  wrong: [['To neutralise the product with a base', 'Only water is used; there is no base.'], ['To hydrolyse the sulfonamide to the pyrrole', 'The pyrrole ring has already been formed; water just washes.'], ['To dissolve the product for recrystallisation', 'The product is insoluble in water, which is why it precipitates.']],
}));
add(mcq({
  id: 'bk-c61-d-1e-apparatus', ...K('1e'), source: 'Manual pp.24-25, 33',
  stem: 'Which set-up is right for the two-hour reflux of Expt 1E?',
  right: ['A round-bottom flask with a stir bar, fitted with a water-cooled reflux condenser and heated in an oil bath, with water in at the bottom', 'No special ice-water is needed because acetic acid is not very volatile.'],
  wrong: [['An open flask on a hotplate', 'The solvent would evaporate and fumes escape; a reflux condenser is needed.'], ['A condenser with ice-water in at the top', 'Water goes in at the bottom, and ice-water is only for very volatile solvents like ether.'], ['A sealed tube', 'A closed system under heat could build up pressure.']],
}));
add(mcq({
  id: 'bk-c61-d-1e-ir', ...C('1e'), source: 'Manual p.33; IR correlation tables', beyond: true,
  stem: 'Which IR evidence shows the sulfonamide has become 1-tosylpyrrole?',
  right: ['The N-H stretches of the primary sulfonamide (two bands between about 3250 and 3400 cm⁻¹) disappear, and strong S=O bands remain near 1370 and 1170 cm⁻¹', 'The N is now fully substituted, so there is no N-H.'],
  wrong: [['A new C=O band near 1700 cm⁻¹', 'There is no carbonyl in the product.'], ['The S=O bands disappear', 'The sulfonyl group is retained.'], ['A broad O-H band near 3300 cm⁻¹', 'The product has no OH (a broad band would signal wet or acid-contaminated sample).']],
}));
add(mcq({
  id: 'bk-c61-d-1e-acid', ...R('1e'), source: 'Manual p.33', beyond: true,
  stem: 'Why is glacial acetic acid the solvent for Expt 1E?',
  right: ['It dissolves the reagents and also supplies the acid catalyst needed to unmask the aldehyde from the acetal', 'The acetal ring-opens under acid.'],
  wrong: [['It acts as the reducing agent', 'No reduction is involved.'], ['It is the source of the pyrrole nitrogen', 'The nitrogen comes from the sulfonamide.'], ['It protects the product from water', 'Water is a by-product of the ring closure.']],
}));

// ======================================= 1F tetraphenylcyclopentadienone (p.34) =======================================
add(mcq({
  id: 'bk-c61-d-1f-reaction', ...R('1f'), source: 'Manual p.34', beyond: true,
  stem: 'What bonds form when benzil reacts with 1,3-diphenylacetone and KOH in ethanol?',
  right: ['Two C-C bonds in a double aldol (Knoevenagel-type) condensation, closing a five-membered ring after loss of two molecules of water', 'The two CH₂ carbons of diphenylacetone attack the two carbonyls of benzil, then dehydrations give the conjugated ring.'],
  wrong: [['Two C-O bonds in an esterification', 'No ester forms; the new bonds are C-C.'], ['One C-N bond to give an imine', 'No nitrogen reagent is present.'], ['A Diels-Alder cycloaddition forming two C-C bonds in one step', 'The product forms by base-mediated condensations, not by a concerted cycloaddition.']],
}));
add(mcq({
  id: 'bk-c61-d-1f-base', ...R('1f'), source: 'Manual p.34 (quantities)', beyond: true,
  stem: 'KOH (about 2.6 mmol) is used with benzil and diphenylacetone (about 4.8 mmol each). What does this tell you about its role?',
  right: ['It is a catalyst (substoichiometric): it generates enolates, and hydroxide is regenerated after each dehydration', 'Less than one equivalent of base is enough for aldol condensations.'],
  wrong: [['It is the limiting reagent that sets the yield', 'The yield is set by the two ketones.'], ['It is consumed completely to form potassium salts', 'The base is regenerated in the condensation steps.'], ['It acts as the solvent', 'Ethanol is the solvent.']],
}));
add(mcq({
  id: 'bk-c61-d-1f-addition', ...K('1f'), source: 'Manual p.34',
  stem: 'Why is the KOH solution added with a Pasteur pipette through the top of the condenser to the almost-boiling mixture, in two portions?',
  right: ['The mixture froths when the base goes in, so adding the KOH in two portions through the condenser keeps it controlled without opening the hot apparatus', 'The manual waits for the frothing to subside before refluxing for 15 minutes. *(Beyond the manual: the condensation is also exothermic.)*'],
  wrong: [['To keep air out of the flask', 'The apparatus is not under inert gas.'], ['KOH only dissolves when added slowly to cold ethanol', 'It is dissolved first in 1 mL of ethanol.'], ['The condenser is the only neck available for a stirrer', 'A stir bar is used and the condenser neck is used for addition.']],
}));
add(mcq({
  id: 'bk-c61-d-1f-hazard', ...K('1f'), source: 'Manual p.34',
  stem: 'What is the specific warning for KOH in Expt 1F?',
  right: ['KOH is corrosive, especially as a solution in ethanol', 'Wear gloves and take care when pipetting.'],
  wrong: [['KOH is only dangerous as a dry solid', 'The manual says the ethanolic solution is especially corrosive.'], ['KOH is flammable on contact with air', 'It is not.'], ['KOH is toxic only by inhalation', 'The listed hazard is corrosive.']],
}));
add(mcq({
  id: 'bk-c61-d-1f-isolate', ...K('1f'), source: 'Manual p.34',
  stem: 'How is the product isolated in Expt 1F?',
  right: ['Cool to room temperature, then to 0 °C in ice, and collect the precipitate by Buchner filtration, washing with a little cool ethanol', 'The product is poorly soluble in cold ethanol and crystallises directly; no extraction is needed.'],
  wrong: [['Extract into ether and evaporate', 'No extraction is described.'], ['Evaporate the ethanol on the rotavap and sublime the residue', 'The product precipitates and is filtered; sublimation is Expt 5E.'], ['Pour into water and extract with dichloromethane', 'The procedure filters the precipitate formed on cooling.']],
}));
add(mcq({
  id: 'bk-c61-d-1f-ir', ...C('1f'), source: 'Manual p.34; IR correlation tables', beyond: true,
  stem: 'Which IR band best marks the formation of tetraphenylcyclopentadienone from benzil and diphenylacetone?',
  right: ['A single conjugated C=O stretch near 1710 cm⁻¹ for the cyclopentadienone, without the separate benzil band near 1680 cm⁻¹', 'The product has one carbonyl and no O-H.'],
  wrong: [['A broad O-H band near 3300 cm⁻¹', 'No alcohol or acid is in the product.'], ['An aldehyde C-H near 2720 cm⁻¹', 'No aldehyde is present.'], ['A nitrile band near 2250 cm⁻¹', 'No nitrile is present.']],
}));

export default items;
