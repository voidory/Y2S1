/* Chunk D, part 2: Experiments 5A-5E (Manual pp.35-39). Week 4. */
import { mcq } from './lib.mjs';

const W = 4;
const items = [];
const add = (x) => items.push(x);
const X = (e, aspect, name) => ({ week: W, chunk: `ex-${e}`, skill: `ex.${e}.${aspect}`, skillName: name });
const R = (e) => X(e, 'reaction', 'Reaction, reagents and roles');
const K = (e) => X(e, 'work', 'Work-up, purification and apparatus');
const C = (e) => X(e, 'char', 'Observations, characterisation and problems');

// ======================================= 5A methyl benzoate nitration (p.35) =======================================
add(mcq({
  id: 'bk-c61-d-5a-reaction', ...R('5a'), source: 'Manual p.35', beyond: true,
  stem: 'What does the mixture of nitric and sulfuric acids do in Expt 5A?',
  right: ['Sulfuric acid protonates nitric acid, which loses water to give the nitronium ion NO₂⁺, the electrophile that attacks the ring', 'This is electrophilic aromatic substitution; sulfuric acid is also the medium.'],
  wrong: [['It oxidises the ester to a carboxylic acid', 'The ester is not oxidised; the ring is nitrated.'], ['It hydrolyses the methyl ester to benzoic acid', 'The ester survives the cold nitrating mixture.'], ['It acts as a nucleophile attacking the carbonyl carbon', 'The nitrating agent is an electrophile and it attacks the ring.']],
}));
add(mcq({
  id: 'bk-c61-d-5a-regio', ...R('5a'), source: 'Manual p.35', beyond: true,
  stem: 'Why does the nitro group enter the meta position of methyl benzoate?',
  right: ['The ester is an electron-withdrawing, deactivating group, and attack at the meta position avoids placing positive charge next to it in the intermediate', 'Ortho and para attack give a less stable intermediate, so meta is the least disfavoured.'],
  wrong: [['The ester is an electron-donating group that directs ortho and para', 'The carbonyl withdraws electrons, so it directs meta.'], ['The nitronium ion is too large to attack ortho or para', 'Sterics play a minor role; the electronic effect decides.'], ['Meta is the only position that is not deactivated', 'All positions are deactivated; meta is deactivated least.']],
}));
add(mcq({
  id: 'bk-c61-d-5a-temp', ...K('5a'), source: 'Manual p.35',
  stem: 'Why is the temperature held between 5 and 15 °C while the nitrating mixture is added?',
  right: ['Nitration is strongly exothermic, and a hot mixture risks over-nitration and runaway; the acids are added slowly with cooling', 'The sulfuric acid is cooled to 0 °C at the start.'],
  wrong: [['Nitric acid freezes below 15 °C', 'It does not freeze there.'], ['Higher temperatures stop the nitronium ion forming', 'Higher temperature increases the rate; the aim is control and selectivity.'], ['The product decomposes below 5 °C', 'The product does not decompose at low temperature.']],
}));
add(mcq({
  id: 'bk-c61-d-5a-ice', ...K('5a'), source: 'Manual p.35',
  stem: 'After the mixture has warmed to room temperature it is poured onto about 8 g of crushed ice. What does this do?',
  right: ['It quenches the reaction, dilutes and cools the strong acid, and precipitates the yellow solid, which is filtered when the ice has melted', 'The product is insoluble in cold dilute acid.'],
  wrong: [['It converts the ester into the acid', 'The ester is not hydrolysed in this short, cold quench.'], ['It dissolves the product for extraction', 'The product precipitates as a solid.'], ['It removes the nitro group', 'The nitro group is retained.']],
}));
add(mcq({
  id: 'bk-c61-d-5a-hazard', ...K('5a'), source: 'Manual p.35',
  stem: 'Which first-aid and handling rule does the manual give for Expt 5A?',
  right: ['If either acid touches your skin, wash the affected area with copious amounts of water; neutralise the measuring cylinder with dilute sodium carbonate before washing it', 'Nitric and sulfuric acids are both very corrosive and cause burns.'],
  wrong: [['Neutralise a skin splash with concentrated NaOH', 'A strong base on skin would add a second burn; copious water is the instruction.'], ['Wipe the acid off with a dry tissue', 'Water must be used in large amounts.'], ['Acid spills need no action because the acids are dilute', 'The acids are concentrated and very corrosive.']],
}));
add(mcq({
  id: 'bk-c61-d-5a-ir', ...C('5a'), source: 'Manual p.35; IR correlation tables', beyond: true,
  stem: 'Which pair of IR features would you expect for methyl 3-nitrobenzoate?',
  right: ['Ester C=O near 1725 cm⁻¹ and nitro bands near 1530 and 1350 cm⁻¹', 'The ester carbonyl is retained and the nitro group adds two strong bands.'],
  wrong: [['A broad O-H near 3300 cm⁻¹ and a C=O near 1700 cm⁻¹', 'These would indicate a carboxylic acid; the ester has no OH.'], ['Only a C=O at 1725 cm⁻¹', 'The nitro bands should also be present.'], ['A nitrile near 2250 cm⁻¹ and an NH near 3300 cm⁻¹', 'Neither group is present.']],
}));
add(mcq({
  id: 'bk-c61-d-5a-impurity', ...C('5a'), source: 'Manual p.35 (recrystallise from methanol)', beyond: true,
  stem: 'Besides the meta isomer, what impurities are likely in crude methyl 3-nitrobenzoate, and how are they removed?',
  right: ['Small amounts of ortho and para isomers (and dinitro compounds), which stay in the mother liquor on recrystallisation from methanol', 'The major isomer crystallises on cooling while the minor isomers remain dissolved.'],
  wrong: [['Unreacted nitric acid, which is removed by sublimation', 'Acid is removed by the water quench and washing; sublimation is not used here.'], ['Benzoic acid, which is removed by distillation', 'No distillation is used in the procedure.'], ['Nothing; nitration is perfectly selective', 'Minor isomers are always possible, which is why recrystallisation is used.']],
}));

// ======================================= 5B dinitroveratrole (p.36) =======================================
add(mcq({
  id: 'bk-c61-d-5b-reaction', ...R('5b'), source: 'Manual p.36', beyond: true,
  stem: 'Why can 1,2-dimethoxybenzene be nitrated with nitric acid alone, without sulfuric acid?',
  right: ['The two methoxy groups make the ring electron-rich and highly reactive, so concentrated nitric acid supplies enough electrophile', 'Electron-poor rings like methyl benzoate need the stronger nitrating mixture.'],
  wrong: [['Nitric acid alone cannot nitrate; the procedure is wrong', 'It works, as shown by the manual and its citation.'], ['The methoxy groups are the nitrating agent', 'The nitrating agent is NO₂⁺ from the nitric acid.'], ['Dimethoxybenzene is deactivated, so a milder reagent is needed', 'Methoxy groups are activating.']],
}));
add(mcq({
  id: 'bk-c61-d-5b-regio', ...R('5b'), source: 'Manual p.36', beyond: true,
  stem: 'Where do the two nitro groups go in the dinitration of 1,2-dimethoxybenzene (veratrole)?',
  right: ['At positions 4 and 5, each para to one of the methoxy groups', 'Methoxy groups direct ortho and para; the 4,5-pattern is para to an OMe and avoids crowding next to the other substituents.'],
  wrong: [['At positions 3 and 6, each ortho to a methoxy group', 'Positions 3 and 6 are ortho to an OMe but are crowded; para (4,5) is preferred.'], ['At positions 4 and 6, meta to each other', 'In a 4,6-pattern the nitro groups would be meta to each other; the second nitro group instead goes at C5, which is para to the methoxy at C2 (the first, at C4, is para to the methoxy at C1).'], ['On the methyl carbons of the methoxy groups', 'Nitration is electrophilic substitution on the ring.']],
}));
add(mcq({
  id: 'bk-c61-d-5b-conditions', ...R('5b'), source: 'Manual pp.35-37 (5A, 5B, 5C compared)', beyond: true,
  stem: 'Nitration of the activated ring in Expt 5B is heated to 70-80 °C for 2 h but 5C is kept below 0 °C for 3 h. What explains the different outcomes (dinitro versus mono-nitro)?',
  right: ['Higher temperature and a large excess of acid drive a second nitration of the deactivated mono-nitro ring, whereas at low temperature the reaction stops after one nitro group', 'Temperature controls how far an activated ring is nitrated.'],
  wrong: [['The 5B compound has no methoxy groups', 'Both substrates are strongly activated.'], ['Nitric acid reduces the ring at high temperature', 'Nitric acid is not acting as a reductant.'], ['Nitration is faster at low temperature', 'It is slower; the low temperature limits over-reaction.']],
}));
add(mcq({
  id: 'bk-c61-d-5b-wash', ...K('5b'), source: 'Manual p.36',
  stem: 'The filtered dinitro product is washed with water, then dilute sodium bicarbonate, then water again. What does the bicarbonate wash do?',
  right: ['It neutralises residual nitric acid trapped in the solid; the final water wash removes salts', 'Bicarbonate reacts with acid to give CO₂, water and a soluble nitrate salt.'],
  wrong: [['It converts the product to a soluble salt', 'The product has no acidic group; it stays insoluble.'], ['It dissolves unreacted veratrole', 'Veratrole is not removed by an aqueous base; recrystallisation does that.'], ['It reduces the nitro groups to amines', 'Bicarbonate is not a reductant.']],
}));
add(mcq({
  id: 'bk-c61-d-5b-add', ...K('5b'), source: 'Manual p.36',
  stem: 'Why is the veratrole added dropwise to the nitric acid (rather than the acid to the veratrole), with the acid cooled in a water bath?',
  right: ['The reaction is exothermic and the electron-rich substrate reacts rapidly; adding it slowly to an excess of cooled acid keeps the heat and local concentration under control', 'The mixture is heated only after the addition is complete.'],
  wrong: [['The veratrole would freeze in the acid', 'It would not.'], ['Nitric acid cannot be poured onto organic compounds under any circumstances', 'The ordering is chosen for control, not because acid addition is forbidden.'], ['So that the product sublimes out of the mixture', 'The product stays in the mixture and is later precipitated on ice/water.']],
}));
add(mcq({
  id: 'bk-c61-d-5b-source', ...C('5b'), source: 'Manual pp.36-37',
  stem: 'The manual cites the nitration procedure for 5B and 5C. Which citation and format is it?',
  right: ['Wulfman, D. S.; Cooper, C. F. Synthesis 1978, 924', 'Authors (family name, initials), abbreviated journal, year, first page; Synthesis is a Thieme title not abbreviated further.'],
  wrong: [['Wulfman and Cooper, Tetrahedron Lett. 1978, 924, "Nitration of aromatic ethers"', 'The journal is Synthesis and chemistry citations omit the title.'], ['Cooper, C. F. J. Org. Chem. 1978, 924', 'The journal and author order differ.'], ['https://www.thieme.de/synthesis', 'Web pages are not acceptable citations.']],
}));

// ======================================= 5C methylenedioxybenzene (p.37) =======================================
add(mcq({
  id: 'bk-c61-d-5c-regio', ...R('5c'), source: 'Manual p.37', beyond: true,
  stem: 'Nitration of 1,3-benzodioxole (methylenedioxybenzene) gives mainly one product. Which?',
  right: ['5-Nitro-1,3-benzodioxole, with the nitro group para to one of the ring oxygens', 'The two oxygens donate electron density, and the position para to an oxygen is both activated and unhindered.'],
  wrong: [['4-Nitro-1,3-benzodioxole, next to the O-CH₂-O bridge', 'The position adjacent to the ring oxygen is hindered and less favoured than the para position.'], ['The nitro group on the CH₂ carbon', 'The ring is nitrated, not the methylene.'], ['A 1:1 mixture of 4- and 5-nitro isomers', 'The para-to-O position is strongly preferred.']],
}));
add(mcq({
  id: 'bk-c61-d-5c-temp', ...K('5c'), source: 'Manual p.37',
  stem: 'The temperature in Expt 5C must not rise above 0 °C. Why?',
  right: ['The activated ring is very reactive, and a warm solution in 70% nitric acid risks over-nitration, oxidation and tar formation', 'The substrate is added dropwise by syringe to nitric acid cooled below 0 °C.'],
  wrong: [['Nitric acid becomes unreactive above 0 °C', 'It becomes more reactive when warm.'], ['The product would sublime away above 0 °C', 'It is a solid that stays in the mixture.'], ['The ice would melt before the end', 'The 3 h stir is at below 0 °C, and the ice is used for the later quench.']],
}));
add(mcq({
  id: 'bk-c61-d-5c-workup', ...K('5c'), source: 'Manual p.37',
  stem: 'Which sequence matches the isolation of 5-nitro-1,3-benzodioxole?',
  right: ['Pour into ice water, filter, wash with water, aqueous sodium bicarbonate and water, then recrystallise from ethanol', 'Bicarbonate neutralises residual acid before recrystallisation.'],
  wrong: [['Extract into dichloromethane and distil', 'No extraction or distillation is used.'], ['Recrystallise from the nitric acid mixture directly', 'The acid is removed first by quenching on ice and washing.'], ['Sublime the crude product', 'Sublimation is Expt 5E.']],
}));
add(mcq({
  id: 'bk-c61-d-5c-nmr', ...C('5c'), source: 'Manual p.37 (NMR submitted); standard shifts', beyond: true,
  stem: 'Which feature of the ¹H NMR spectrum of 5-nitro-1,3-benzodioxole is easy to assign?',
  right: ['A two-proton singlet near δ 6.1 for the O-CH₂-O group', 'The bridging CH₂ is flanked by two oxygens and has no coupling partners; it is far from the aromatic region.'],
  wrong: [['A three-proton singlet near δ 2.3 for an aromatic methyl', 'There is no methyl group in the molecule.'], ['A broad one-proton singlet near δ 12', 'There is no acid or OH.'], ['A triplet near δ 1.2', 'There is no ethyl group.']],
}));
add(mcq({
  id: 'bk-c61-d-5c-compare', ...C('5c'), source: 'Manual pp.35-37', beyond: true,
  stem: 'Which statement compares the three nitrations 5A, 5B and 5C correctly?',
  right: ['5A needs the strong HNO₃/H₂SO₄ mixture for a deactivated ring and gives the meta product; 5B and 5C use nitric acid alone on activated rings, which give ortho/para-type products', 'The ester deactivates and directs meta; ether oxygens activate and direct ortho/para.'],
  wrong: [['All three use the same reagents and give meta products', 'Substituent effects differ: the ester directs meta; the ethers direct ortho/para.'], ['5A uses nitric acid alone, 5B and 5C use mixed acid', 'It is the other way round.'], ['5B and 5C give the meta product because the methoxy group is deactivating', 'Alkoxy groups are activating.']],
}));

// ======================================= 5D 2-iodobenzoic acid (p.38) =======================================
add(mcq({
  id: 'bk-c61-d-5d-reaction', ...R('5d'), source: 'Manual p.38', beyond: true,
  stem: 'What are the two stages of Expt 5D?',
  right: ['Diazotisation of the amine with nitrous acid (from NaNO₂/HCl) at low temperature, then displacement of N₂ by iodide from KI', 'This Sandmeyer-type route converts ArNH₂ to ArN₂⁺ to ArI.'],
  wrong: [['Nitration of the ring followed by reduction', 'No nitro compound is made; the nitrite generates a diazonium ion from the amine.'], ['Direct electrophilic iodination of anthranilic acid with I₂', 'The iodine ends up where the NH₂ was, not on another ring position.'], ['Amide formation followed by hydrolysis', 'No amide is made.']],
}));
add(mcq({
  id: 'bk-c61-d-5d-temp', ...K('5d'), source: 'Manual p.38',
  stem: 'Why must the diazotisation be kept below 5 °C, in an ice-salt bath?',
  right: ['Aryl diazonium salts are unstable and decompose when warm (losing N₂ and giving phenols), so the cold keeps the diazonium ion intact until iodide is added', 'Warming comes only after the KI has been added.'],
  wrong: [['Nitrous acid is only produced below 5 °C', 'It is made in situ but the cooling is to protect the diazonium salt.'], ['The anthranilic acid freezes above 5 °C', 'It is dissolved and is not about to freeze.'], ['Iodide is unreactive above 5 °C', 'The warming after addition of KI is what drives the displacement.']],
}));
add(mcq({
  id: 'bk-c61-d-5d-hcl', ...R('5d'), source: 'Manual p.38 (quantities)', beyond: true,
  stem: 'About 75 mmol of concentrated HCl are used for about 25 mmol of anthranilic acid and NaNO₂. Why so much?',
  right: ['HCl dissolves the amine as its hydrochloride, reacts with NaNO₂ to make nitrous acid (and leaves excess acid to keep the medium acidic)', 'Roughly three equivalents: one for the amine salt, one for nitrite, one to keep the solution acidic.'],
  wrong: [['HCl is the reducing agent that replaces N₂ with I', 'Iodide displaces N₂; HCl is the acid medium.'], ['HCl is a catalyst only and could be used in trace amounts', 'It is consumed stoichiometrically and also acidifies the solution.'], ['HCl evaporates and so a large excess is needed', 'It is not volatile enough to disappear in the cold.']],
}));
add(mcq({
  id: 'bk-c61-d-5d-n2', ...C('5d'), source: 'Manual p.38', beyond: true,
  stem: 'What do you observe when the mixture is warmed to 40-50 °C after the potassium iodide is added?',
  right: ['Bubbles of nitrogen gas are released as the diazonium group is displaced, along with dark brown colour from some iodine', 'N₂ is the leaving group.'],
  wrong: [['A violent explosion', 'Diazonium salts can be hazardous when dry, but the warm solution simply gives off gas.'], ['The solution turns blue-black from starch', 'No starch is present.'], ['White fumes of HCl only', 'The visible effervescence is nitrogen.']],
}));
add(mcq({
  id: 'bk-c61-d-5d-bisulfite', ...K('5d'), source: 'Manual p.38',
  stem: 'A small amount of aqueous sodium bisulfite is added after cooling. Why?',
  right: ['It reduces excess iodine (I₂) to colourless iodide, removing the brown colour from the product', 'Iodide is water-soluble and stays in the filtrate.'],
  wrong: [['It oxidises the iodide to iodine to improve the yield', 'Bisulfite is a reducing agent: it removes iodine.'], ['It neutralises the HCl', 'It is added in a small amount to destroy iodine, not to neutralise.'], ['It converts the acid to its sodium salt', 'That would make the product soluble and lose it.']],
}));
add(mcq({
  id: 'bk-c61-d-5d-recryst', ...K('5d'), source: 'Manual p.38',
  stem: 'How is the 2-iodobenzoic acid recrystallised in Expt 5D?',
  right: ['Dissolve in ethanol, dilute with hot water, bring to boiling, add cold water and let it cool slowly (a mixed-solvent recrystallisation)', 'Water is the anti-solvent that lowers the solubility.'],
  wrong: [['Dissolve in hot water only', 'The manual uses ethanol and water.'], ['Dissolve in hexane and add ethyl acetate', 'These solvents are not used.'], ['Sublime the precipitate', 'Sublimation is Expt 5E.']],
}));
add(mcq({
  id: 'bk-c61-d-5d-ir', ...C('5d'), source: 'Manual p.38; IR correlation tables', beyond: true,
  stem: 'Which IR bands would you expect for 2-iodobenzoic acid?',
  right: ['A very broad O-H absorption from about 2500 to 3300 cm⁻¹ and a strong C=O near 1690 cm⁻¹', 'These are the carboxylic acid features; the aryl iodide has no distinctive band in the main region.'],
  wrong: [['Two NH₂ bands near 3400 and 3300 cm⁻¹', 'These belong to the starting material (anthranilic acid\'s amine), whose disappearance shows success.'], ['A C≡N band near 2250 cm⁻¹', 'There is no nitrile.'], ['A strong ester C=O near 1740 cm⁻¹', 'The product is an acid, so its C=O is lower.']],
}));
add(mcq({
  id: 'bk-c61-d-5d-problem', ...C('5d'), source: 'Manual p.38', beyond: true,
  stem: 'The diazotised solution is allowed to warm to room temperature before the KI is added. Which by-product is most likely to appear?',
  right: ['2-Hydroxybenzoic acid (salicylic acid), from reaction of the diazonium salt with water', 'Warm diazonium salts react with water to give phenols and nitrogen.'],
  wrong: [['Benzoic acid by loss of the nitrogen as N₂ with hydride', 'There is no hydride source.'], ['Methyl benzoate', 'No methanol is present.'], ['Anthranilic acid re-forms', 'Diazonium ions do not revert to the amine.']],
}));

// ======================================= 5E 2-trifluoroacetylpyrrole (p.39) =======================================
add(mcq({
  id: 'bk-c61-d-5e-reaction', ...R('5e'), source: 'Manual p.39', beyond: true,
  stem: 'Why can pyrrole be acylated with trifluoroacetic anhydride without a Lewis acid catalyst?',
  right: ['Pyrrole is very electron-rich, and trifluoroacetic anhydride is a highly reactive electrophile', 'It is an electrophilic aromatic substitution on a reactive heteroarene.'],
  wrong: [['Pyrrole is electron-poor and is attacked by nucleophiles', 'It is a π-excessive ring, attacked by electrophiles.'], ['The anhydride is a nucleophile that attacks the pyrrole N-H', 'The reaction is C-acylation on the ring by an electrophile.'], ['Dichloromethane is the Lewis acid', 'It is only the solvent.']],
}));
add(mcq({
  id: 'bk-c61-d-5e-regio', ...R('5e'), source: 'Manual p.39', beyond: true,
  stem: 'Why does acylation of pyrrole occur at C2 rather than C3?',
  right: ['Attack at C2 gives an intermediate cation delocalised over more resonance forms (stabilised by the nitrogen lone pair), so it is more stable than the C3 intermediate', 'The 2-position is the more reactive α-position of pyrrole.'],
  wrong: [['C3 is blocked by the N-H', 'Nothing blocks C3; the intermediate energies decide.'], ['The nitrogen is acylated first and then migrates', 'The reaction is a direct C-acylation.'], ['The CF₃ group directs to C2 by hydrogen bonding', 'The preference comes from the pyrrole\'s own electronics.']],
}));
add(mcq({
  id: 'bk-c61-d-5e-setup', ...K('5e'), source: 'Manual p.39',
  stem: 'Which set-up is right for the addition in Expt 5E?',
  right: ['A dried flask with the anhydride solution cooled in an ice bath, an addition funnel (stopcock closed at first) holding the pyrrole solution, and a drying tube on top of the funnel', 'The ice bath moderates the exotherm; the drying tube excludes moisture without sealing the system.'],
  wrong: [['A sealed flask under pressure', 'A sealed vessel could burst; the drying tube leaves the system open.'], ['An open flask in a water bath at 50 °C', 'The reaction is cooled in ice, and moisture must be excluded.'], ['A reflux condenser and heating to boiling', 'No reflux is used; the reaction is at 0 °C and then room temperature.']],
}));
add(mcq({
  id: 'bk-c61-d-5e-workup', ...K('5e'), source: 'Manual p.39', beyond: true,
  stem: 'After 2 hours the mixture is poured into water in a separatory funnel and the organic layer is washed again with water. What is removed?',
  right: ['Trifluoroacetic acid (the by-product) and water-soluble material, leaving the product in the dichloromethane layer', 'The strong, water-soluble acid partitions into the aqueous phase.'],
  wrong: [['The product, which dissolves in the water', 'The product stays in the organic layer.'], ['Unreacted pyrrole only', 'Pyrrole is not removed by water; the acid is.'], ['Dichloromethane, which dissolves in water', 'DCM is only slightly water-soluble and is the organic layer.']],
}));
add(mcq({
  id: 'bk-c61-d-5e-evap', ...K('5e'), source: 'Manual p.39',
  stem: 'After drying with sodium sulfate, what do you do before sublimation?',
  right: ['Filter off the drying agent and evaporate the dichloromethane on the rotavap to leave the crude solid', 'The crude solid is then transferred to the sublimation apparatus.'],
  wrong: [['Distil the dichloromethane at atmospheric pressure from the oil bath', 'The manual uses the rotavap.'], ['Add more sodium sulfate until a crystalline product precipitates', 'Drying agents do not crystallise product.'], ['Recrystallise from hot water', 'The manual purifies by sublimation.']],
}));
add(mcq({
  id: 'bk-c61-d-5e-observe', ...C('5e'), source: 'Manual p.39',
  stem: 'During sublimation, what shows that the process is working, and when do you stop?',
  right: ['A colourless solid appears on the cold finger (cone); stop when no more seems to form', 'You remove the heat, turn off the cooling water and release the vacuum, then scrape out the solid.'],
  wrong: [['A brown liquid distils into the receiver; stop when the pot is dry', 'A sublimation gives a solid, not a liquid.'], ['The solid in the pot turns black; stop at once', 'Charring would signal overheating; the product is colourless.'], ['Gas bubbles leave the solid; stop after 10 minutes exactly', 'Time is not the criterion; formation of solid on the cone is.']],
}));
add(mcq({
  id: 'bk-c61-d-5e-ir', ...C('5e'), source: 'Manual p.39; IR correlation tables', beyond: true,
  stem: 'Which IR features would you expect for 2-trifluoroacetylpyrrole?',
  right: ['An N-H stretch near 3300 cm⁻¹, a conjugated ketone C=O at about 1650-1690 cm⁻¹ and very strong C-F bands between about 1100 and 1300 cm⁻¹', 'The pyrrole NH remains, the ketone is conjugated to the ring, and CF₃ gives intense C-F absorptions.'],
  wrong: [['No N-H band, since the nitrogen is acylated', 'Acylation occurs on carbon; the N-H is retained.'], ['A C=O near 1815 and 1750 cm⁻¹ (anhydride)', 'That is a typical anhydride pattern; no anhydride is present in the purified product.'], ['A nitrile band near 2250 cm⁻¹', 'No nitrile is present.']],
}));
add(mcq({
  id: 'bk-c61-d-5e-hazard', ...K('5e'), source: 'Manual p.39',
  stem: 'What is the hazard for Expt 5E and an appropriate precaution?',
  right: ['Trifluoroacetic anhydride is corrosive; avoid skin contact and measure it with a syringe', 'The manual says avoid skin contact and use syringes to measure out the chemicals. *(Beyond the manual: it is also volatile and moisture-sensitive, so it is handled in the fume cupboard.)*'],
  wrong: [['Pyrrole gas forms an explosive mixture with water', 'Not the listed hazard.'], ['Dichloromethane is pyrophoric', 'It is not.'], ['Sodium sulfate is toxic', 'It is not hazardous in this way.']],
}));

export default items;
