/* Chunk D, part 3: Experiments 6, 7, 8, 9 and cross-experiment comparisons (Manual pp.40-51). Week 4. */
import { mcq, mcqSet } from './lib.mjs';

const W = 4;
const items = [];
const add = (x) => items.push(x);
const X = (e, aspect, name) => ({ week: W, chunk: `ex-${e}`, skill: `ex.${e}.${aspect}`, skillName: name });
const R = (e) => X(e, 'reaction', 'Reaction, reagents and roles');
const K = (e) => X(e, 'work', 'Work-up, purification and apparatus');
const C = (e) => X(e, 'char', 'Observations, characterisation and problems');

// ======================================= 6 reduction of ethyl acetoacetate (pp.40-42) =======================================
add(mcq({
  id: 'bk-c61-d-6-stereo', ...R('6'), source: 'Manual p.40',
  stem: 'Reduction of ethyl acetoacetate with NaBH₄ and with baker\'s yeast give ethyl 3-hydroxybutanoate. How do the products differ?',
  right: ['NaBH₄ gives the racemate, whereas yeast gives mainly the (S)-enantiomer', 'Borohydride is achiral and attacks both faces of the ketone equally; the yeast enzyme is chiral and selects one face.'],
  wrong: [['NaBH₄ gives (S) and yeast gives the racemate', 'It is the other way round.'], ['Both give the racemate, since the substrate is achiral', 'A chiral catalyst such as an enzyme can give a non-racemic product from an achiral substrate.'], ['Both give the pure (R)-enantiomer', 'The manual states the yeast gives (S) products and NaBH₄ gives the racemate.']],
}));
add(mcq({
  id: 'bk-c61-d-6-why-chiral', ...R('6'), source: 'Manual p.40',
  stem: 'Why can an enzyme in baker\'s yeast reduce a ketone enantioselectively?',
  right: ['Enzymes are proteins built from chiral amino acids, so their active sites are chiral and distinguish the two faces of the ketone', 'This is why biotransformations often show high enantioselectivity.'],
  wrong: [['Enzymes are achiral but selective', 'Enzymes are intrinsically chiral.'], ['The yeast uses a chiral reducing agent like NaBH₄', 'NaBH₄ is achiral; the enzyme is chiral.'], ['The sugar in the mixture is the chiral reagent that adds the hydride', 'The sugar is only the ultimate source of reducing power; the enzyme controls the stereochemistry.']],
}));
add(mcq({
  id: 'bk-c61-d-6-oxidised', ...R('6'), source: 'Manual pp.40-41; 2015 paper style', beyond: true,
  stem: 'When yeast reduces ethyl acetoacetate, something must be oxidised in the overall process. What is it?',
  right: ['The sugar (sucrose, via the glucose it is cleaved to), whose metabolism regenerates the reduced cofactor the enzyme uses', 'Reduction of the ketoester is balanced by oxidation of the sugar fed to the yeast.'],
  wrong: [['The disodium hydrogen phosphate', 'It is a buffer/nutrient and is not oxidised.'], ['The enzyme itself, which is used up', 'The enzyme is a catalyst and is regenerated.'], ['The ketoester, which oxidises itself', 'It is the species being reduced.']],
}));
add(mcq({
  id: 'bk-c61-d-6-yeast-obs', ...C('6'), source: 'Manual p.41', beyond: true,
  stem: 'During the first 15 minutes after adding yeast to the sucrose solution at 35 °C, what should you see?',
  right: ['The yeast becomes active: the mixture bubbles and foams as carbon dioxide is released by fermentation', 'This shows the culture is alive before the substrate is added.'],
  wrong: [['The solution turns purple', 'No colour change of this kind is expected.'], ['The flask becomes cold as the sugar dissolves endothermically', 'A visible fermentation is what you watch for.'], ['Nothing at all; yeast acts only after a week', 'Fermentation begins quickly at 35 °C.']],
}));
add(mcq({
  id: 'bk-c61-d-6-filter', ...K('6'), source: 'Manual p.41',
  stem: 'Why must you not swirl or disturb the yeast layer until the very end of the filtration through Celite?',
  right: ['Stirring up the yeast clogs the filter, making the filtration very slow', 'The manual warns that you would then miss lunch.'],
  wrong: [['The yeast layer holds the product, which would be lost', 'The product is in the liquid; the yeast cells simply block the filter.'], ['Swirling releases toxic gas', 'It does not.'], ['Celite reacts with the yeast when shaken', 'Celite is an inert filter aid.']],
}));
add(mcq({
  id: 'bk-c61-d-6-extract', ...K('6'), source: 'Manual p.41',
  stem: 'Why is the aqueous layer extracted a second time with ether in the yeast work-up?',
  right: ['The product has appreciable water solubility, so a second extraction recovers more of it than a single extraction', 'Two smaller extractions remove more than one large one.'],
  wrong: [['To dilute the yeast', 'The yeast has been filtered off already.'], ['To remove the sucrose by dissolving it in ether', 'Sucrose does not dissolve in ether.'], ['The first extraction always fails', 'The point is better recovery, not failure.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-d-6-nabh4-add', ...K('6'), source: 'Manual p.41',
  stem: 'Why is NaBH₄ added in portions to the ice-cooled ethanol solution, and what do you expect to see?',
  right: ['It reacts with the protic solvent (ethanol) to evolve hydrogen, and the reduction is exothermic, so portionwise addition controls the effervescence and the heat', 'The manual warns "beware of effervescence".'],
  wrong: [['The solid is hygroscopic and would clump if added at once', 'The concern is gas evolution.'], ['The ketone freezes in the ice bath', 'It stays dissolved in ethanol.'], ['NaBH₄ is added in portions because it is the limiting reagent', 'Its amount is 0.5 equivalents; the portionwise addition is a control measure.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-d-6-quench', ...K('6'), source: 'Manual p.41', beyond: true,
  stem: 'Why is saturated ammonium chloride solution added cautiously after the hour of stirring?',
  right: ['It destroys the excess hydride and protonates the alkoxide/borate intermediates; hydrogen is evolved, so it is added carefully', 'NH₄⁺ is a mild acid source.'],
  wrong: [['It oxidises the product to the ketone again', 'The quench does not oxidise the product.'], ['It dries the ethanol', 'It is an aqueous solution.'], ['It generates more NaBH₄', 'It destroys the hydride.']],
}));
add(mcq({
  id: 'bk-c61-d-6-salts', ...K('6'), source: 'Manual p.41',
  stem: 'After most of the ethanol is removed on the rotavap, water is added to dissolve any solids. What are these solids?',
  right: ['Precipitated inorganic salts (such as borate and ammonium/sodium salts from the quench)', 'The product is an organic oil, extracted from the aqueous layer with ether.'],
  wrong: [['Crystals of the organic product', 'The product is an oil.'], ['Undissolved yeast', 'There is no yeast in the borohydride reaction.'], ['Unreacted ethyl acetoacetate crystals', 'Ethyl acetoacetate is a liquid.']],
}));
add(mcq({
  id: 'bk-c61-d-6-drying-tube', ...K('6'), source: 'Manual p.41',
  stem: 'The NaBH₄ reaction flask is fitted with a drying tube. Why not a tight stopper?',
  right: ['Hydrogen is evolved, so the system must stay open to avoid pressure build-up, while the tube keeps moist air out', 'A closed vessel evolving gas could burst.'],
  wrong: [['The stopper would react with NaBH₄', 'The issue is pressure from H₂.'], ['The drying tube supplies hydride', 'It holds a desiccant only.'], ['Stoppers are never used in the lab', 'They are used when no gas is evolved.']],
}));
add(mcq({
  id: 'bk-c61-d-6-chemoselect', ...R('6'), source: 'Manual pp.40-41', beyond: true,
  stem: 'Ethyl acetoacetate has a ketone and an ester. Which group does NaBH₄ in ethanol reduce?',
  right: ['The ketone only, giving the secondary alcohol; the ester is left intact', 'NaBH₄ is a mild hydride donor that reduces aldehydes and ketones but not normally esters.'],
  wrong: [['Both the ketone and the ester, giving a diol', 'That requires a stronger reagent such as LiAlH₄.'], ['The ester only', 'The more electrophilic ketone reacts first.'], ['Neither, since NaBH₄ reduces only alkenes', 'NaBH₄ reduces carbonyls and does not touch isolated alkenes.']],
}));
add(mcq({
  id: 'bk-c61-d-6-polarimetry', ...C('6'), source: 'Manual pp.40, 42',
  stem: 'You measure [α]D for the products of both reductions. What result would you expect?',
  right: ['The yeast product rotates plane-polarised light (non-racemic), whereas the NaBH₄ product shows essentially no rotation (racemic)', 'A racemate has equal and opposite rotations that cancel.'],
  wrong: [['Both rotate light by the same amount', 'The racemic product cancels to zero.'], ['The NaBH₄ product rotates and the yeast product does not', 'It is the other way round.'], ['Neither rotates light since the compound is an ester', 'Chiral non-racemic esters do rotate light.']],
}));
add(mcq({
  id: 'bk-c61-d-6-timing', ...K('6'), source: 'Manual pp.6, 40-41',
  stem: 'Which timing and labelling instruction applies to the yeast part of Expt 6?',
  right: ['Set it up one lab session earlier and leave it at 35 °C; label the flask with name, matric number, fume cupboard number and lab day, or it will be removed', 'The fermentation needs about a week.'],
  wrong: [['Set it up on the day and finish in 2 hours', 'The yeast reduction needs a week.'], ['Label it only with the chemical name', 'Unlabelled flasks are removed; the label needs your own details.'], ['Leave it in the fridge to slow the reaction', 'It is kept at 35 °C in a thermostatted bath.']],
}));

// ======================================= 7 acetylation of ferrocene and the column (pp.43-46) =======================================
add(mcq({
  id: 'bk-c61-d-7-reaction', ...R('7'), source: 'Manual p.43', beyond: true,
  stem: 'What are the roles of acetic anhydride and phosphoric acid in the Friedel-Crafts acetylation of ferrocene?',
  right: ['Acetic anhydride is the acylating agent; phosphoric acid is the acid catalyst that activates it as an acylium-type electrophile', 'Ferrocene\'s electron-rich cyclopentadienyl rings attack the electrophile.'],
  wrong: [['Phosphoric acid is the acylating agent and acetic anhydride the catalyst', 'The roles are reversed.'], ['Both are solvents that do not take part', 'The anhydride supplies the acetyl group.'], ['Acetic anhydride oxidises iron(II) to iron(III)', 'The aim is acylation of the ring, not oxidation of the metal.']],
}));
add(mcq({
  id: 'bk-c61-d-7-diacetyl', ...R('7'), source: 'Manual p.43', beyond: true,
  stem: 'Why does a second acetylation of ferrocene occur on the other ring (1,1\'-diacetylferrocene) rather than the same ring?',
  right: ['The acetyl group deactivates the ring it is on, so the second electrophile attacks the unsubstituted ring', 'The carbonyl withdraws electron density from its own ring.'],
  wrong: [['The first acetyl activates its own ring for another attack', 'Acyl groups are deactivating.'], ['The second ring is the only one with H atoms', 'Both rings have C-H bonds; deactivation decides.'], ['Both rings are always acetylated at the same moment', 'Monoacetylferrocene forms first; diacetyl is formed with more forcing conditions.']],
}));
add(mcq({
  id: 'bk-c61-d-7-temp', ...K('7'), source: 'Manual p.43',
  stem: 'Why does the manual say to err on the high side of the 70-80 °C range?',
  right: ['Below 70 °C there may be no reaction, whereas ferrocene is stable and survives higher temperatures', 'The consequence of too cold is no product; too warm is harmless.'],
  wrong: [['Above 80 °C acetic anhydride boils violently at once', 'Acetic anhydride boils at about 140 °C; the manual says ferrocene survives higher temperature.'], ['Ferrocene decomposes below 70 °C', 'It does not decompose; there is simply no reaction.'], ['The water bath cannot go above 80 °C', 'The point concerns the reaction, not the bath.']],
}));
add(mcq({
  id: 'bk-c61-d-7-quench', ...K('7'), source: 'Manual p.44', beyond: true,
  stem: 'After 30 minutes the mixture is poured into ice water and neutralised with 2 M NaOH before filtering. What does the NaOH do?',
  right: ['It neutralises the phosphoric and acetic acids (and hydrolyses leftover anhydride) so that the neutral organic products precipitate and can be filtered', 'The mixture must no longer be strongly acidic.'],
  wrong: [['It deprotonates acetylferrocene to give a water-soluble salt', 'Acetylferrocene has no acidic proton in this range; it stays as a solid.'], ['It reduces the ketone to an alcohol', 'NaOH is not a reducing agent.'], ['It converts ferrocene to the ferrocenium ion', 'Base does not oxidise ferrocene.']],
}));
add(mcq({
  id: 'bk-c61-d-7-condenser', ...K('7'), source: 'Manual pp.43-44',
  stem: 'The flask for the ferrocene acetylation has a condenser but "cooling water is not required", plus a drying tube. Why?',
  right: ['Only a modest temperature (70-80 °C) is used, so the condenser serves as an air condenser, and the drying tube keeps moisture away from the anhydride', 'Acetic anhydride boils near 140 °C and is hydrolysed by water.'],
  wrong: [['The reaction is run under reflux in boiling ether', 'The heating is in a 70-80 °C water bath, not in boiling ether.'], ['Water would make ferrocene explode', 'It would not.'], ['The drying tube supplies hydrogen', 'It holds a desiccant.']],
}));
add(mcq({
  id: 'bk-c61-d-7-conversion', ...C('7'), source: 'Manual p.43; 2015 paper style',
  stem: 'Some unreacted ferrocene remains after acetylation. Which change would NOT be expected to increase conversion to acetylferrocene?',
  right: ['Adding more ferrocene', 'It is the substrate; adding more of it cannot increase the fraction converted.'],
  wrong: [['Adding more acetic anhydride', 'More acylating agent pushes the reaction forward.'], ['Increasing the temperature (keeping within the stable range)', 'Heat increases the rate.'], ['Increasing the reaction time or adding more acid catalyst', 'Both help the conversion.']],
}));
add(mcq({
  id: 'bk-c61-d-7-colours', ...C('7'), source: 'Manual pp.43, 46', beyond: true,
  stem: 'Which statement about the column separation of the ferrocene mixture is correct?',
  right: ['Orange ferrocene elutes first with hexane, then more polar acetylferrocene (orange-red) with 4:1 hexane:ethyl acetate; the doubly acetylated compound is more polar still and elutes last or stays on the column', 'Polarity increases with each acetyl group.'],
  wrong: [['Diacetylferrocene elutes first because it is largest', 'Size is not the factor; polarity is, and the diacetyl compound is the most polar.'], ['All three elute together as one orange band', 'They have different polarities, which is why the column works.'], ['Ferrocene is the last to elute because it is the most soluble', 'Ferrocene is the least polar and elutes first.']],
}));
add(mcq({
  id: 'bk-c61-d-7-ir', ...C('7'), source: 'Manual p.46; IR correlation tables', beyond: true,
  stem: 'Which IR band distinguishes acetylferrocene from ferrocene?',
  right: ['A strong conjugated ketone C=O stretch near 1660 cm⁻¹, absent in ferrocene', 'Ferrocene itself has no carbonyl.'],
  wrong: [['A broad O-H near 3300 cm⁻¹', 'Neither compound has an OH.'], ['A nitrile near 2250 cm⁻¹', 'There is no nitrile.'], ['A strong C=O at 1740 cm⁻¹ typical of an ester', 'The ketone is conjugated to the ring and absorbs lower.']],
}));
add(mcq({
  id: 'bk-c61-d-7-safety', ...K('7'), source: 'Manual pp.43-45',
  stem: 'Which safety points are specific to Expt 7?',
  right: ['Phosphoric acid and acetic anhydride are corrosive, and silica gel dust must not be inhaled, so weigh it in the fume cupboard and wear a face mask', 'The balance for silica is specially equipped in the fume cupboard.'],
  wrong: [['Ferrocene is pyrophoric and must be handled under nitrogen', 'It is a stable solid.'], ['Silica is safe to weigh on the open bench', 'The manual forbids weighing silica in the open lab.'], ['Hexane is non-flammable', 'Hexane is flammable.']],
}));

// ======================================= 8 siloxanes (pp.47-48) =======================================
add(mcq({
  id: 'bk-c61-d-8-hydrolysis', ...R('8'), source: 'Manual p.47', beyond: true,
  stem: 'What happens when dimethyldichlorosilane meets water in Expt 8, and what is the by-product?',
  right: ['The Si-Cl bonds hydrolyse readily to Si-OH, which condense (losing water) to Si-O-Si chains and rings, releasing HCl', 'Silicon chlorides hydrolyse far more easily than alkyl chlorides.'],
  wrong: [['The C-Cl bonds are hydrolysed to give methanol', 'There are no C-Cl bonds; the methyl groups stay attached to silicon.'], ['No reaction occurs because silicon is inert to water', 'Si-Cl bonds are very water-sensitive.'], ['Hydrogen gas and silica are formed', 'The product is an oligomeric siloxane, not silica.']],
}));
add(mcq({
  id: 'bk-c61-d-8-ice', ...K('8'), source: 'Manual p.47',
  stem: 'Why is the silane dissolved in ether and the water added slowly, from a funnel, to an ice-cooled flask?',
  right: ['The hydrolysis is very exothermic and generates HCl; dilution in ether, cooling and slow addition keep it from getting hot', 'The manual says explicitly not to allow the mixture to get hot.'],
  wrong: [['Ether is a catalyst for the hydrolysis', 'It is a solvent that moderates the reaction.'], ['The ice prevents the silane from boiling away as methane', 'There is no methane formed.'], ['Water and ether react to form ethanol', 'No such reaction occurs.']],
}));
add(mcq({
  id: 'bk-c61-d-8-workup', ...K('8'), source: 'Manual p.47',
  stem: 'Which order of work-up steps matches Expt 8, part 1?',
  right: ['Separate the layers, extract the aqueous layer with hexane, combine the organic layers, neutralise HCl with sodium bicarbonate, dry over MgSO₄, filter into a pre-weighed flask and rotavap', 'Weighing the flask first lets you find the mass of product by difference.'],
  wrong: [['Dry, then neutralise, then separate', 'You must separate and neutralise before drying.'], ['Distil the ether, then add water', 'Water is added first; the volatiles are removed at the end.'], ['Filter off the product, then recrystallise from ethanol', 'The product is an oil, not a crystalline solid.']],
}));
add(mcq({
  id: 'bk-c61-d-8-boric', ...R('8'), source: 'Manual p.47', beyond: true,
  stem: 'What does adding about 7% by weight of boric oxide and heating to 200 °C do to the siloxane?',
  right: ['Boron links siloxane chains through Si-O-B bonds, cross-linking the polymer into a viscoelastic bouncing putty', 'The heating drives condensation reactions that join the chains.'],
  wrong: [['It hydrolyses the siloxane back to the dichlorosilane', 'Boric oxide cross-links the chains; it does not reverse the polymerisation.'], ['It dehydrates the oil to give pure silicon', 'Silicon-oxygen bonds are retained.'], ['It only dries the product', 'It changes the material\'s structure and properties.']],
}));
add(mcq({
  id: 'bk-c61-d-8-air', ...K('8'), source: 'Manual p.47',
  stem: 'What does the manual mean by an "air condenser" in Expt 8, part 2?',
  right: ['A reflux condenser that is fitted but not connected to the cooling water', 'The manual defines it exactly this way for the 3 h heating of the siloxane with boric oxide in a 200 °C oil bath.'],
  wrong: [['A condenser cooled with ice-water', 'An air condenser has no water at all.'], ['A condenser filled with nitrogen', 'It is simply open to the air, not filled with nitrogen.'], ['A vacuum distillation head', 'It is a plain condenser; no vacuum is drawn.']],
}));
add(mcq({
  id: 'bk-c61-d-8-bounce', ...C('8'), source: 'Manual p.48',
  stem: 'How is the percentage bounce of the putty measured?',
  right: ['Roll the putty into a ball, drop it from the top of a metre ruler, and note the bounce height in cm, which equals the percentage bounce', 'A bounce of 40 cm from a 100 cm drop is 40%.'],
  wrong: [['Weigh the putty before and after bouncing', 'Mass is not measured.'], ['Time the putty as it falls', 'The bounce height is what is measured.'], ['Measure how far the putty stretches in 30 minutes', 'That is a separate observation of flow.']],
}));
add(mcq({
  id: 'bk-c61-d-8-flow', ...C('8'), source: 'Manual p.48; standard material behaviour', beyond: true,
  stem: 'After bouncing, the putty is left on a watch glass for 30 minutes. What does a borosiloxane putty do?',
  right: ['It slowly flows and flattens like a very viscous liquid, even though it bounces elastically on fast impact', 'This combination of elastic and viscous behaviour is viscoelasticity.'],
  wrong: [['It hardens into a brittle solid', 'It does not harden.'], ['It evaporates', 'The cross-linked polymer is not volatile.'], ['It keeps its ball shape exactly', 'It flows slowly under its own weight.']],
}));
add(mcq({
  id: 'bk-c61-d-8-ir', ...C('8'), source: 'Manual p.47; IR correlation tables', beyond: true,
  stem: 'Which IR bands are most characteristic of a polydimethylsiloxane?',
  right: ['A very strong, broad Si-O-Si stretch between about 1000 and 1100 cm⁻¹ and Si-CH₃ bands near 1260 and 800 cm⁻¹', 'These bands dominate silicone spectra.'],
  wrong: [['A strong C=O at 1715 cm⁻¹', 'There is no carbonyl.'], ['A nitrile at 2250 cm⁻¹', 'There is no nitrile.'], ['A broad O-H at 2500-3300 cm⁻¹ as the main feature', 'A fully condensed polymer has little OH; silanol O-H is weak or absent.']],
}));
add(mcq({
  id: 'bk-c61-d-8-hazard', ...K('8'), source: 'Manual pp.47-48',
  stem: 'Which hazards apply to Expt 8?',
  right: ['Dimethyldichlorosilane is corrosive (and releases HCl with moisture), and the 200 °C oil bath can cause serious burns until cooled to room temperature', 'Both hazards are in the manual (pp.47-48); that moisture releases HCl is standard chemistry.'],
  wrong: [['Boric oxide gas is explosive', 'Not a listed hazard.'], ['Diethyl ether is non-flammable', 'It is highly flammable.'], ['The oil bath is safe once the heater is off', 'The manual says not to touch it until it has cooled to RT.']],
}));

// ======================================= 9 Grignard: benzoic acid (pp.49-51) =======================================
add(mcq({
  id: 'bk-c61-d-9-reaction', ...R('9'), source: 'Manual pp.49-50',
  stem: 'Which sequence describes Expt 9?',
  right: ['Mg inserts into the C-Br bond of bromobenzene in ether to give PhMgBr, which adds to CO₂ (dry ice) to give a carboxylate, and acid work-up gives benzoic acid', 'Grignard reagents are carbon nucleophiles.'],
  wrong: [['PhBr is oxidised by CO₂ to give PhCO₂Br', 'The Grignard reagent is a nucleophile adding to CO₂.'], ['Magnesium reduces CO₂ to formic acid, which then brominates the ring', 'The aryl-metal bond forms first and attacks CO₂.'], ['The ether is carboxylated by CO₂', 'The ether is just the solvent.']],
}));
add(mcq({
  id: 'bk-c61-d-9-ether', ...R('9'), source: 'Manual p.49',
  stem: 'Why must a Grignard reagent be made in ether or THF?',
  right: ['The ether oxygen lone pairs coordinate (act as ligands) to magnesium, stabilising the reagent, and the solvent contains no acidic protons', 'The manual says the solvents are essential as they act as ligands for magnesium.'],
  wrong: [['Ethers are acidic enough to protonate the reagent', 'They are not; protic solvents would destroy it.'], ['Ether reacts with magnesium to form the Grignard directly', 'It is the solvent, not a reactant.'], ['Ether is used only because it is cheap', 'It plays a chemical role.']],
}));
add(mcq({
  id: 'bk-c61-d-9-dry', ...R('9'), source: 'Manual p.50',
  stem: 'What happens if water is present when the Grignard reagent forms?',
  right: ['The Grignard reagent is protonated (to benzene) and destroyed, so all reagents, the solvent and the glassware must be dry', 'Grignard reagents react with water and similar proton sources.'],
  wrong: [['Water speeds up the reaction by acting as a catalyst', 'Water destroys the reagent.'], ['Water forms an acid that dissolves the magnesium to give a better yield', 'It protonates the carbanion; the yield falls.'], ['Nothing, since benzoic acid forms in water anyway', 'The Grignard reagent would be gone before it can attack CO₂.']],
}));
add(mcq({
  id: 'bk-c61-d-9-iodine', ...K('9'), source: 'Manual pp.50-51', beyond: true,
  stem: 'A crystal of iodine is added to the magnesium and warmed until its colour disappears. What does the iodine do?',
  right: ['It activates the magnesium by cleaning the oxide-coated surface; the colour fades as the iodine is consumed', 'This helps the reaction to start.'],
  wrong: [['It acts as an indicator that the Grignard reagent has formed', 'The fading shows the iodine is consumed, not the Grignard being complete; the bromobenzene is added after.'], ['It reacts with bromobenzene to give iodobenzene', 'The iodine reacts with the magnesium surface.'], ['It is the source of the bromide', 'The bromide comes from bromobenzene.']],
}));
add(mcq({
  id: 'bk-c61-d-9-rate', ...K('9'), source: 'Manual p.51',
  stem: 'During addition of the bromobenzene solution the ether reflux stops. What does the manual tell you?',
  right: ['You are adding the aryl bromide too slowly; the exothermic reaction should keep the ether gently refluxing without external heating', 'If the reflux is too vigorous you are adding too fast.'],
  wrong: [['You are adding it too fast, so stop the addition for an hour', 'Reflux stopping means too slow, not too fast.'], ['The reaction is complete', 'Complete formation is followed by 30 minutes of heating at reflux after the addition ends.'], ['Add more iodine', 'The manual does not suggest this.']],
}));
add(mcq({
  id: 'bk-c61-d-9-dryice', ...K('9'), source: 'Manual p.51',
  stem: 'Why is the dry ice broken into chunks (not powder) and wiped free of water ice before the Grignard is poured on?',
  right: ['Frost (water ice) on the surface would destroy the Grignard reagent, and powdered dry ice has more surface for frost; chunks keep a drier surface', 'The Grignard solution is poured on immediately after removing the funnel and condenser.'],
  wrong: [['Powdered dry ice is too cold and would freeze the ether', 'Water frost is the problem, not freezing the ether.'], ['Chunks sublime faster and give more CO₂', 'Powder sublimes faster; chunks are chosen to limit moisture pick-up.'], ['Water ice acts as a catalyst for carboxylation', 'Water destroys the reagent.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-d-9-workup', ...K('9'), source: 'Manual p.51', beyond: true,
  stem: 'After the dry ice has evaporated, the residue is dissolved in water and the organic layer goes to a "waste" beaker. Why is the product not in the organic layer?',
  right: ['It is present as the water-soluble magnesium benzoate salt (the bromomagnesium carboxylate dissolves and gives benzoate salts) in the aqueous layer; the ether layer holds neutral by-products such as biphenyl and unreacted bromobenzene', 'The ether wash of the aqueous layer removes more neutral impurities.'],
  wrong: [['Benzoic acid is insoluble in water and floats into the ether', 'At this stage the product is a salt, not the neutral acid.'], ['The product has evaporated with the dry ice', 'It is a non-volatile salt.'], ['The product is a gas that bubbles out', 'It is a solid salt, dissolved in water.']],
}));
add(mcq({
  id: 'bk-c61-d-9-acidify', ...K('9'), source: 'Manual p.51',
  stem: 'Why is the aqueous layer acidified with conc. HCl until blue litmus turns red, and then heated to boiling and cooled slowly?',
  right: ['Acid converts soluble benzoate to insoluble benzoic acid, which precipitates; heating dissolves it so it recrystallises as purer crystals on slow cooling', 'This is an acid-base precipitation followed by a recrystallisation from water.'],
  wrong: [['Acid converts benzoic acid into benzoate, which is the product', 'It is the reverse: benzoate to acid.'], ['Boiling destroys biphenyl by oxidation', 'Biphenyl was removed in the organic wash; boiling dissolves the benzoic acid for recrystallisation.'], ['Cooling slowly makes the acid more soluble', 'Solubility falls on cooling, giving crystals.']],
}));
add(mcq({
  id: 'bk-c61-d-9-byproduct', ...C('9'), source: 'Manual pp.49-51', beyond: true,
  stem: 'Which neutral by-product forms when a Grignard reagent meets unreacted aryl bromide, and where does it end up?',
  right: ['Biphenyl, which stays in the ether layer and is discarded with the organic waste', 'It has no acid group, so it is not extracted into the aqueous benzoate layer.'],
  wrong: [['Benzoic acid dimer, which precipitates', 'The dimer is not a by-product here.'], ['Phenol, which stays in the water', 'Phenol would need oxygen as a reagent.'], ['Cyclohexane, which evaporates', 'The ring is not reduced.']],
}));
add(mcq({
  id: 'bk-c61-d-9-hazard', ...K('9'), source: 'Manual p.49',
  stem: 'Which hazard note belongs with Expt 9?',
  right: ['Bromobenzene is toxic, and dry ice causes burns, so handle it with care; diethyl ether is flammable and the work is in the fume cupboard', 'The manual lists bromobenzene (toxic) and solid CO₂ (burns).'],
  wrong: [['Magnesium is the only hazard because it explodes in water', 'The listed hazards are bromobenzene and dry ice.'], ['Benzoic acid is pyrophoric', 'It is not.'], ['Hydrochloric acid is harmless', 'Conc. HCl is corrosive.']],
}));
add(mcq({
  id: 'bk-c61-d-9-reactivity', ...R('9'), source: 'Manual p.49',
  stem: 'In what order do alkyl halides RX react with magnesium to form Grignard reagents?',
  right: ['I > Br > Cl', 'Weaker C-X bonds react more easily.'],
  wrong: [['Cl > Br > I', 'This reverses the order.'], ['They all react at the same rate', 'The rates differ.'], ['Br > I > Cl', 'Iodides are the most reactive.']],
}));
add(mcq({
  id: 'bk-c61-d-9-limiting', ...R('9'), source: 'Manual p.50 (quantities)', beyond: true,
  stem: 'Magnesium (500 mg, 20.6 mmol) and bromobenzene (3.3 g, 21.0 mmol) are used. Which is limiting?',
  right: ['Magnesium', 'It has slightly fewer moles than bromobenzene, so it caps the Grignard reagent at 20.6 mmol.'],
  wrong: [['Bromobenzene', 'It is present at 21.0 mmol, a slight excess.'], ['Diethyl ether', 'It is the solvent.'], ['Carbon dioxide', 'It is added in large excess as dry ice.']],
}));
add(mcq({
  id: 'bk-c61-d-9-inert', ...K('9'), source: 'Manual pp.49-51',
  stem: 'Why is the ether for Expt 9 collected with a demonstrator\'s help, and why is the addition funnel charged by injection through a septum?',
  right: ['The ether must not absorb oxygen or moisture from the air, so it is handled under inert gas and transferred by syringe through a septum with the stopcock closed', 'This keeps the Grignard reagent from being destroyed.'],
  wrong: [['The ether is toxic and must be handled by staff only', 'The concern is moisture and oxygen, not staff-only handling.'], ['A septum is needed to let the ether boil', 'It is for air-free transfer.'], ['Syringes are used because ether is too viscous to pour', 'The reason is excluding air and moisture.']],
}));
add(mcq({
  id: 'bk-c61-d-9-mp-recover', ...C('9'), source: 'Manual p.51; standard values', beyond: true,
  stem: 'Benzoic acid from Expt 9 melts at 118-121 °C instead of about 122 °C. What does the broadened, lowered range suggest?',
  right: ['The sample contains some impurity (for example residual biphenyl or water)', 'Impurities depress and broaden the melting range.'],
  wrong: [['The sample is purer than the literature value', 'A lower, broader range signals impurity.'], ['The thermometer is broken and the data are meaningless', 'It is a reasonable indication of purity; the instrument is not assumed faulty.'], ['The sample is a different compound', 'It is close to the literature value, so the identity is likely right but the purity is low.']],
}));

// ======================================= cross-experiment comparisons =======================================
add(mcqSet({
  id: 'bk-c61-d-x-solvent', week: W, chunk: 'ex-cross', skill: 'ex.cross.recryst', skillName: 'Which solvent, which technique, which experiment', source: 'Manual pp.29-51 (solvents and techniques; drying tubes pp.39, 41, 43; dried glassware p.50)', diff: 3,
  items: [
    { stem: 'Which experiment\'s product is recrystallised from water?',
      right: ['1A, paracetamol', 'The manual says to recrystallise paracetamol from water (after the base/acid purification).'],
      wrong: [['1B, phenyl tosylate', 'It is recrystallised from ethanol.'], ['5A, methyl 3-nitrobenzoate', 'It is recrystallised from methanol.'], ['5E, trifluoroacetylpyrrole', 'It is purified by sublimation, not recrystallisation.']] },
    { stem: 'Which product is recrystallised from methanol?',
      right: ['Methyl 3-nitrobenzoate (5A)', 'Expt 5A says recrystallise from methanol; the 1B, 1C, 1E, 5B and 5C products use ethanol.'],
      wrong: [['Phenyl tosylate (1B)', 'It uses ethanol.'], ['Dibenzalacetone (1C)', 'It uses ethanol.'], ['1,2-Dimethoxy-4,5-dinitrobenzene (5B)', 'It uses ethanol.']] },
    { stem: 'Which product is purified by sublimation?',
      right: ['2-Trifluoroacetylpyrrole (5E)', 'It is a volatile solid sublimed at about 6 mmHg with gentle heating.'],
      wrong: [['Paracetamol (1A)', 'It is recrystallised from water.'], ['Benzoic acid (9)', 'It is recrystallised by acidifying and cooling, not by sublimation.'], ['Acetylferrocene (7)', 'It is separated by column chromatography.']] },
    { stem: 'Which experiment uses a flash column to separate a mixture?',
      right: ['Expt 7, the acetylation of ferrocene', 'The mixture of ferrocene, acetylferrocene and diacetylferrocene is separated on silica.'],
      wrong: [['Expt 9, the Grignard synthesis', 'Benzoic acid is isolated by acidification and crystallisation.'], ['Expt 8, the silicone', 'The step-1 siloxane oil is isolated by extraction and evaporation; the final product is a putty.'], ['Expt 1C, dibenzalacetone', 'The product is recrystallised.']] },
    { stem: 'Which experiments need a drying tube (or oven-dried glassware) to exclude moisture?',
      right: ['5E (trifluoroacetic anhydride), 6 (the NaBH₄ flask), 7 (acetic anhydride) and 9 (the Grignard)', 'Each involves a reagent that reacts with water or is moisture-sensitive.'],
      wrong: [['1A, 1B and 1C only', 'These run in water or aqueous base.'], ['5A, 5B and 5C only', 'Nitrations in strong aqueous acid do not use drying tubes.'], ['None of them', 'Several do, as listed.']] },
    { stem: 'Which experiments use a reflux condenser with water in at the bottom?',
      right: ['1E, 1F and the Grignard formation in 9', 'Each heats a volatile solvent at its boiling point for a time; 7 and 8 use the condenser without cooling water.'],
      wrong: [['5A, 5B and 5C', 'Nitrations are run in a flask in baths with no reflux.'], ['1A and 1B', 'These are stirred in a flask without a condenser.'], ['5D and 6 only', 'They do not use a reflux condenser.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-d-x-classes', week: W, chunk: 'ex-cross', skill: 'ex.cross.class', skillName: 'Reaction classes across the experiments', source: 'Manual pp.29-51', beyond: true, diff: 3,
  items: [
    { stem: 'Which experiments are electrophilic aromatic substitutions on the ring?',
      right: ['5A, 5B, 5C (nitrations), 5E (acylation of pyrrole) and 7 (acylation of ferrocene)', 'Each has an electrophile attacking an aromatic ring.'],
      wrong: [['1A, 1B and 1C', 'These are N-acylation, sulfonylation at oxygen and an aldol condensation.'], ['5D and 9', 'Diazonium displacement and Grignard carboxylation are not ring substitutions by an electrophile.'], ['6 and 8', 'These are a carbonyl reduction and a silane hydrolysis.']] },
    { stem: 'Which experiments are nucleophilic substitutions at an acyl or sulfonyl centre?',
      right: ['1A (amine on acetic anhydride) and 1B (phenoxide on tosyl chloride)', 'Both nucleophiles attack an electrophilic centre that carries a leaving group.'],
      wrong: [['1C and 1F', 'These are aldol-type condensations of enolates with carbonyls.'], ['5A and 5B', 'They are electrophilic aromatic substitutions.'], ['6 and 9', 'They are a reduction and a carbon nucleophile adding to CO₂.']] },
    { stem: 'Which experiments use an enolate as the nucleophile?',
      right: ['1C and 1F (aldol-type condensations)', 'Base removes an α-proton from acetone or diphenylacetone.'],
      wrong: [['1A and 1B', 'The nucleophiles are an amine and a phenoxide.'], ['5E and 7', 'Aromatic rings are the nucleophiles there.'], ['8 and 9', 'A silanol and a Grignard reagent are not enolates.']] },
    { stem: 'Which experiment involves a metal inserting into a carbon-halogen bond?',
      right: ['Expt 9 (Mg into C-Br)', 'It is the formation of the Grignard reagent.'],
      wrong: [['Expt 5D', 'Iodide replaces a diazonium group; no metal inserts.'], ['Expt 1D', 'Zn(II) is coordinated by ligands; no C-X bond is involved.'], ['Expt 7', 'Iron is already in the ferrocene.']] },
  ],
}));

export default items;
