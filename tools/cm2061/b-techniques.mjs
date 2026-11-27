/* Chunk B: techniques and apparatus (Manual pp.15, 24-25, 39, 42, 44-46, 50 and the Year-1 techniques the 2015 paper assumed). Week 2. */
import { mcq, mcqSet, mcqMulti, orderItem } from './lib.mjs';

const W = 2;
const items = [];
const add = (x) => items.push(x);
const S = (id, name, chunk) => ({ week: W, chunk, skill: id, skillName: name });

// ---- TLC ------------------------------------------------------------------------------------------------
const tlc = S('tq.tlc', 'TLC: Rf, polarity and visualising agents', 'tq-tlc');
add(mcqSet({
  id: 'bk-c61-b-tlc-rf', ...tlc, source: 'Manual p.24', diff: 2,
  items: [
    { stem: 'On a silica TLC plate, which of ferrocene, acetylferrocene and 1,1\'-diacetylferrocene has the highest Rf?',
      right: ['Ferrocene', 'It has no polar group, so it sticks least to silica and runs furthest; each added acetyl group makes the compound more polar and lowers Rf.'],
      wrong: [['Acetylferrocene', 'It has one polar C=O, so it is more strongly held than ferrocene and runs lower.'], ['1,1\'-Diacetylferrocene', 'Two carbonyl groups make it the most polar of the three, so it has the lowest Rf.'], ['All three have the same Rf because they share the ferrocene core', 'Rf depends on overall polarity, and the acetyl groups change it a lot.']] },
    { stem: 'A TLC plate shows two spots, one at Rf 0.65 and one at Rf 0.20. Which statement is correct?',
      right: ['The Rf 0.20 compound is the more polar one', 'The more polar a compound, the lower its Rf, because it is held more strongly by the silica.'],
      wrong: [['The Rf 0.65 compound is the more polar one', 'This reverses the relationship: a higher Rf means a less polar compound.'], ['The Rf 0.20 compound is smaller in molecular mass', 'Rf is governed by polarity, not molecular mass.'], ['Polarity cannot be inferred from Rf at all', 'On a given plate and solvent, Rf ranks polarity.']] },
  ],
}));
add(mcq({
  id: 'bk-c61-b-tlc-ionic', ...tlc, source: 'Manual p.24',
  stem: 'Why are ionic compounds almost never analysed by TLC?',
  right: ['They are so polar that they hardly move from the baseline', 'Very polar compounds have Rf near zero, so the plate tells you nothing.'],
  wrong: [['They dissolve in the mobile phase and run with the solvent front', 'It is the opposite: they stick to the silica and stay at the origin.'], ['They decompose on silica to give neutral products', 'The manual gives high polarity, not decomposition, as the reason.'], ['They cannot be seen by any visualising agent', 'Visualisation is a separate issue; the problem is that they do not move.']],
}));
add(mcq({
  id: 'bk-c61-b-tlc-uv', ...tlc, source: 'Manual p.24',
  stem: 'In first-year labs every spot showed under UV light. What does the manual warn about CM2061?',
  right: ['Not every compound is visible under UV, so other visualising agents may be needed', 'Compounds without a chromophore (for example alkenes and simple alcohols) can be invisible under UV and need a stain.'],
  wrong: [['UV light can no longer be used in the teaching lab', 'UV is still used; the warning is that it will not show everything.'], ['All spots now need iodine because UV damages silica', 'Nothing says UV damages the plate; iodine is one optional stain.'], ['Only coloured compounds can be analysed by TLC', 'Colourless compounds are analysed routinely; the point is to pick the right visualisation.']],
}));
add(mcqSet({
  id: 'bk-c61-b-tlc-stain', ...tlc, source: 'Manual p.24', diff: 3,
  items: [
    { stem: 'A TLC spot is an alcohol with no chromophore. Which visualising agent does the manual recommend for alcohols, silyl ethers and epoxides?',
      right: ['Acidic ammonium molybdate, dipped and heated above 100 °C, giving dark blue spots', 'This is the manual\'s agent for alcohols and related compounds.'],
      wrong: [['2,4-Dinitrophenylhydrazine, giving yellow to red spots', 'DNP targets aldehydes and ketones, not alcohols.'], ['Potassium permanganate, giving yellow spots on purple', 'Permanganate is listed for alkenes and alkynes.'], ['Iodine alone, which is specific to alcohols', 'Iodine gives dark brown spots with many compounds and is not specific to alcohols.']] },
    { stem: 'Which stain is the best choice to reveal an aryl ketone or an aldehyde, giving yellow, orange or red spots?',
      right: ['2,4-Dinitrophenylhydrazine (DNP)', 'DNP is recommended for aldehydes and ketones, especially conjugated or aryl; usually no heating is needed.'],
      wrong: [['Acidic ammonium molybdate', 'That one is for alcohols, silyl ethers and epoxides, and needs heating.'], ['Potassium permanganate', 'Permanganate is chosen for unsaturated C=C and C≡C.'], ['Iodine vapour', 'It stains many compound types brown but is not the carbonyl-specific stain.']] },
    { stem: 'A compound containing only a C=C double bond and no chromophore is run on TLC. Which stain shows it as a yellow spot on a purple background?',
      right: ['Potassium permanganate (dip; usually no heating)', 'Permanganate oxidises alkenes and alkynes, leaving a yellow spot where the purple reagent was consumed.'],
      wrong: [['Acidic ammonium molybdate', 'It is for alcohols and similar oxygen compounds and gives dark blue spots.'], ['2,4-Dinitrophenylhydrazine', 'It reacts with C=O groups, not with an isolated C=C.'], ['No stain: all organic compounds show under UV', 'An isolated alkene has no UV chromophore at the usual wavelength.']] },
    { stem: 'After developing a plate with iodine, you want to visualise it a second way. Is that possible?',
      right: ['Yes, once the iodine has evaporated another method can be used', 'The manual notes that iodine staining is reversible, so the plate can then be stained with another agent.'],
      wrong: [['No, iodine permanently ruins the silica', 'The manual states the plate can be visualised by another method after the I₂ evaporates.'], ['Yes, but only with UV light', 'Any other method may be used; UV is not the only choice.'], ['No, because iodine reacts with every spot irreversibly', 'The brown spots fade as the iodine leaves the plate.']] },
  ],
}));

// ---- reflux and rotavap -----------------------------------------------------------------------------------
const reflux = S('tq.reflux', 'Reflux set-up and rules', 'tq-heat');
add(mcq({
  id: 'bk-c61-b-reflux-water', ...reflux, source: 'Manual p.24',
  stem: 'In which direction should cooling water pass through a reflux condenser?',
  right: ['In at the bottom and out at the top', 'The jacket then fills completely and the coolest water meets the hot vapour where it matters.'],
  wrong: [['In at the top and out at the bottom', 'The jacket would not fill properly, leaving air pockets and poor cooling.'], ['Either way, it makes no difference', 'The manual specifies bottom in, top out.'], ['No water at all; air cooling is sufficient', 'Only special cases (such as 200 °C heating in Expt 8 or the acetylation in Expt 7) use an air condenser.']],
}));
add(mcq({
  id: 'bk-c61-b-reflux-clamp', ...reflux, source: 'Manual p.24; 2015 paper style',
  stem: 'Where should a reflux apparatus be clamped?',
  right: ['At the neck of the flask', 'The flask neck supports the whole assembly; the manual warns against clamping the condenser and relying on a plastic clip to hold the flask.'],
  wrong: [['On the condenser, with a plastic clip holding the flask', 'The manual says never to do this, even if a TA suggests it.'], ['On the top of the condenser only', 'That leaves the flask supported by the joint alone.'], ['Anywhere, provided the clamp is tight', 'The neck of the flask is the stated position.']],
}));
add(mcq({
  id: 'bk-c61-b-reflux-ice', ...reflux, source: 'Manual p.25; 2015 paper style',
  stem: 'For which solvent is ice-water (rather than tap water) needed in the condenser when heating under reflux?',
  right: ['Diethyl ether', 'Its boiling point is very low, so ordinary water may not condense all the vapour.'],
  wrong: [['Toluene', 'Its boiling point is well above room temperature; ordinary tap water condenses it.'], ['Ethanol', 'It boils at about 78 °C, so ordinary cooling water is enough.'], ['Tetrahydrofuran', 'It boils near 66 °C, still high enough for tap water.']],
}));
add(mcq({
  id: 'bk-c61-b-reflux-bath', ...reflux, source: 'Manual pp.24-25',
  stem: 'Which statement about heating a reflux is correct?',
  right: ['Use an oil bath, not direct heating, with the oil level below the liquid level in the flask, and add a stir bar or anti-bumping granules', 'These are the manual\'s instructions: the oil level should be below the level of the liquid.'],
  wrong: [['Heat the flask directly on the hotplate to save time', 'The manual says to use an oil bath (not direct heating).'], ['Keep the oil level above the liquid so the heating is more even', 'The diagram specifies the oil below the liquid level.'], ['No stir bar is needed once the solvent is boiling', 'A stir bar or anti-bumping granules is required to prevent bumping.']],
}));
add(mcq({
  id: 'bk-c61-b-reflux-why', ...reflux, source: 'Manual p.24',
  stem: 'Why do chemists heat a reaction at the boiling point of the solvent under reflux?',
  right: ['The temperature stays constant at the solvent\'s boiling point, while the condenser returns the vapour to the flask', 'A boiling liquid cannot exceed its boiling point, and the condenser stops the solvent from escaping.'],
  wrong: [['To distil off the product continuously', 'Reflux returns the vapour; it does not collect it.'], ['To raise the temperature above the boiling point', 'A liquid at atmospheric pressure cannot be heated above its boiling point.'], ['To remove water from the system', 'Nothing in reflux removes water; it just holds the temperature.']],
}));
const rot = S('tq.rotavap', 'Rotary evaporator use', 'tq-heat');
add(mcq({
  id: 'bk-c61-b-rotavap-spin', ...rot, source: 'Manual p.25',
  stem: 'Why is the flask on a rotary evaporator rotated rapidly?',
  right: ['To ensure smooth boiling; no rotation or slow rotation gives bumping', 'The manual says rotate rapidly (not slowly) for this reason.'],
  wrong: [['To spin the water out of the sample by centrifugal force', 'Rotation promotes smooth, even evaporation; it is not a centrifuge.'], ['To keep the bath temperature constant', 'The bath has its own control; do not adjust its setting.'], ['To increase the pressure in the flask', 'The pump lowers the pressure; rotation does not change it.']],
}));
add(mcq({
  id: 'bk-c61-b-rotavap-temp', ...rot, source: 'Manual pp.25, 46',
  stem: 'Which set of rotary-evaporator instructions matches the manual?',
  right: ['Bath at 35-40 °C (do not adjust it), rotate rapidly, flask less than half full', 'These are the three points on pp.25 and 46.'],
  wrong: [['Bath at 80 °C to be quick, rotate slowly, flask completely full', 'All three are wrong: bumping and overfilling are the typical accidents.'], ['Bath at 35-40 °C, rotate slowly, flask half full or more', 'Slow rotation bumps, and the flask must be less than half full.'], ['Bath at room temperature, no rotation, flask two-thirds full', 'No rotation causes bumping and an overfilled flask will bump into the condenser.']],
}));
add(mcq({
  id: 'bk-c61-b-rotavap-how', ...rot, source: 'Manual p.25',
  stem: 'What makes solvents evaporate so easily on a rotary evaporator?',
  right: ['The pump holds the sample under low pressure, so the solvent boils at a low temperature', 'The vapour then condenses in the cooled condenser and drops into the collecting flask.'],
  wrong: [['The very hot bath boils the solvent off', 'The bath is only 35-40 °C; it is the low pressure that makes boiling easy.'], ['The condenser pulls the vapour out chemically', 'It simply cools the vapour back to liquid.'], ['Fast rotation throws the liquid out of the flask', 'Rotation ensures smooth boiling; it does not eject liquid.']],
}));

// ---- column chromatography -------------------------------------------------------------------------------
const col = S('tq.column', 'Flash column chromatography', 'tq-column');
add(mcq({
  id: 'bk-c61-b-col-vs-tlc', ...col, source: 'Manual p.44',
  stem: 'How does column chromatography differ from TLC in the way the solvent moves?',
  right: ['On TLC the solvent moves up the plate; in a column it flows down through the silica', 'Both rely on the same principle (polarity); the column is preparative and collects fractions.'],
  wrong: [['On TLC it moves down and in the column up', 'This is reversed.'], ['Both move the solvent upwards', 'Column solvent runs downwards.'], ['The solvent does not move on a column; the silica does', 'The solvent flows through the stationary silica.']],
}));
add(mcq({
  id: 'bk-c61-b-col-dry', ...col, source: 'Manual p.45',
  stem: 'Why must the silica never be allowed to run dry?',
  right: ['Air gets in, the packing cracks and the separation is spoiled', 'Good packing means good separation; once the solvent level drops below the top of the silica, channels open up. Take the pump off as the hexane reaches the top of the silica.'],
  wrong: [['The silica would catch fire', 'There is no fire hazard; the problem is the separation.'], ['The coloured bands would turn white', 'The bands keep their colours; the problem is channelling.'], ['The stopcock would seize', 'That is unrelated to the packing.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-col-order', ...col, source: 'Manual pp.43, 46',
  stem: 'In Expt 7, which compound comes off the column first with hexane?',
  right: ['Unreacted ferrocene, the least polar component', 'Less polar compounds spend less time on the silica, so they elute first; acetylferrocene needs a more polar eluent.'],
  wrong: [['Acetylferrocene', 'It is more polar than ferrocene (one carbonyl), so it moves more slowly.'], ['Diacetylferrocene', 'It is the most polar of the three and elutes last.'], ['All three together, since they are coloured', 'Colour plays no part in the separation; polarity does.']],
}));
add(mcq({
  id: 'bk-c61-b-col-eluent', ...col, source: 'Manual p.46',
  stem: 'After the first orange fraction has come off with hexane, why is the eluent changed to 4:1 hexane:ethyl acetate?',
  right: ['The second band is more polar and needs a more polar eluent to move down the column', 'Ethyl acetate raises the eluent polarity, so the more strongly held compound can be eluted.'],
  wrong: [['The first band must be washed off the silica with ethyl acetate', 'The first band has already eluted; the change is to move the next one.'], ['Hexane has run out and any solvent will do', 'The manual specifies a particular, more polar mixture.'], ['Ethyl acetate stops the second band from decomposing', 'The purpose is polarity, not stabilisation.']],
}));
add(mcq({
  id: 'bk-c61-b-col-pack', ...col, source: 'Manual pp.44-45',
  stem: 'Which statement about packing the column is consistent with the manual?',
  right: ['Use just enough sand to cover the cotton wool, and do not pack the cotton wool too tightly or the flow will be too slow', 'Both points are on the diagrams; a clean joint at the top is also essential.'],
  wrong: [['Pack the cotton wool as tightly as possible so no silica escapes', 'The manual warns that a tight plug makes the flow too slow.'], ['Fill the column with dry silica first, then add hexane from above', 'The silica is made into a slurry in hexane and poured in so all the air is expelled.'], ['Leave silica on the ground-glass joint for a better seal', 'The joint must be entirely free of silica so the air-pump adapter seals properly.']],
}));
add(mcq({
  id: 'bk-c61-b-col-load', ...col, source: 'Manual p.45',
  stem: 'Why is the crude product dissolved in only 1-2 mL of toluene before loading it on the column?',
  right: ['A small volume applies the sample as a narrow band, giving a cleaner separation', 'A wide starting band would overlap with the next band.'],
  wrong: [['Toluene is the eluent and must be used in a large volume', 'The eluent is hexane (then hexane:ethyl acetate); toluene is only used to load the sample.'], ['Toluene reacts with silica to fix the sample', 'It just dissolves the sample for loading.'], ['More toluene would make the silica dry', 'The reason is band width, not drying.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-col-fractions', ...col, source: 'Manual pp.44, 46',
  stem: 'What do you do with the test-tube fractions from the column?',
  right: ['Check them by TLC against authentic ferrocene, combine tubes with identical components, then evaporate on the rotavap in a less-than-half-full pre-weighed flask', 'This is how pure fractions are identified and recovered.'],
  wrong: [['Combine all the tubes, since the bands are already separated', 'Each tube may hold a different component; TLC tells you which to combine.'], ['Evaporate each tube separately on a hotplate', 'Identical fractions are combined and evaporated on the rotavap.'], ['Discard every tube that is not orange', 'Colourless fractions may still contain product; TLC decides.']],
}));
add(mcq({
  id: 'bk-c61-b-col-flash', ...col, source: 'Manual p.44',
  stem: 'Why does flash chromatography use an air pump on the top of the column?',
  right: ['Very fine silica gives better resolution but flows too slowly by gravity, so gentle air pressure pushes the solvent through', 'The manual notes aquarium pumps provide the small pressure needed.'],
  wrong: [['To dry the silica before use', 'Never let the silica go dry; the pressure is applied to the solvent.'], ['To evaporate the eluent as it descends', 'The pump pushes the liquid through; it does not evaporate it.'], ['To keep air out of the column', 'The reverse: pressure drives solvent, not an inert atmosphere.']],
}));

// ---- sublimation, polarimetry, magnetic susceptibility ------------------------------------------------------
const sub = S('tq.sublim', 'Sublimation', 'tq-special');
add(mcq({
  id: 'bk-c61-b-sub-why', ...sub, source: 'Manual p.39',
  stem: 'In Expt 5E, why is the crude product sublimed under vacuum (about 6 mmHg) with gentle heating of at most 50 °C?',
  right: ['The solid passes into vapour at low temperature under reduced pressure and re-forms on the cold surface, leaving non-volatile impurities behind', 'Reduced pressure lets a sublimation happen without melting or decomposing the product.'],
  wrong: [['The vacuum removes the solvent from the crude solid', 'Solvent was removed on the rotavap before; sublimation separates by volatility.'], ['The cold water jacket is there to crystallise the product from solution', 'Nothing is in solution; the vapour deposits directly as a solid on the cold finger.'], ['Heating above 50 °C would be fine but is slower', 'The manual caps the temperature at 50 °C; hotter heating risks melting or decomposition.']],
}));
add(orderItem({
  id: 'bk-c61-b-sub-order', ...sub, source: 'Manual p.39',
  stem: 'Put the sublimation shut-down steps in the order the manual gives them.',
  steps: ['Remove the heat when no more solid seems to form', 'Turn off the cooling water', 'Release the vacuum', 'Scrape the solid out of the cone'],
  explanation: 'Stop heating, then stop the cooling water, then release the vacuum, and only then take the apparatus apart to scrape the sublimed solid from the cone.',
}));
add(mcq({
  id: 'bk-c61-b-sub-set', ...sub, source: 'Manual p.39',
  stem: 'Which preparation of the sublimation apparatus is correct?',
  right: ['Grease the joint, fit the top, connect the vertical tube to the pump and pass ice-cold water through the cooling jacket before applying vacuum and heating', 'A greased joint holds the vacuum and the ice-cold finger traps the vapour.'],
  wrong: [['Leave the joint ungreased so the apparatus can be opened quickly', 'The joint is greased to hold the vacuum.'], ['Heat first, then connect the vacuum when the solid melts', 'The solid is sublimed under vacuum with gentle heating, not melted.'], ['Pass hot water through the jacket to prevent condensation', 'The finger is cooled with ice-cold water so the vapour deposits on it.']],
}));
const pol = S('tq.polarimetry', 'Polarimetry', 'tq-special');
add(mcq({
  id: 'bk-c61-b-pol-what', ...pol, source: 'Manual pp.40, 42; 2015 paper style',
  stem: 'Which course technique tells you whether a chiral product is racemic or enriched in one enantiomer?',
  right: ['Polarimetry, because only a non-racemic sample rotates plane-polarised light', 'Most other properties and spectra are identical for racemate and non-racemate; optical rotation is what differs.'],
  wrong: [['Melting point of the product alone', 'Enantiomers have identical melting points, and a racemate\'s may or may not differ, so mp does not reliably give the enantiomer ratio.'], ['1H NMR', 'In an achiral solvent the spectra of enantiomers and of a racemate are identical.'], ['IR spectroscopy', 'IR spectra of enantiomers are identical too.']],
}));
add(mcq({
  id: 'bk-c61-b-pol-report', ...pol, source: 'Manual p.42',
  stem: 'Which items must be stated when reporting a specific rotation [α]D?',
  right: ['The wavelength (sodium D line), temperature, solvent and concentration', 'The rotation varies with all of these, so a value without them cannot be compared.'],
  wrong: [['Only the sign of the rotation', 'The magnitude and conditions matter.'], ['Only the concentration', 'Temperature, wavelength and solvent also change the value.'], ['The melting point of the sample', 'It is not part of the rotation report.']],
}));
add(mcq({
  id: 'bk-c61-b-pol-sample', ...pol, source: 'Manual p.42',
  stem: 'How is a sample prepared for polarimetry in Expt 6?',
  right: ['Weigh 50-100 mg accurately into a 5 or 10 mL volumetric flask, make up to the mark with CH₂Cl₂, and fill the cell with no trapped bubbles', 'An accurately known concentration is needed to calculate [α], and bubbles disturb the light path.'],
  wrong: [['Dissolve an approximate amount in any volume of water', 'The concentration must be known accurately, so a volumetric flask and a stated solvent (CH₂Cl₂) are used.'], ['Put the neat solid straight into the cell', 'The measurement needs a solution of known concentration.'], ['Use any flask, since concentration does not affect rotation', 'The rotation is proportional to concentration and path length.']],
}));
add(mcq({
  id: 'bk-c61-b-pol-ta', ...pol, source: 'Manual p.42',
  stem: 'Who must be present when you use the polarimeter, and why?',
  right: ['A TA must supervise, because the polarimeter cells are very expensive', 'The manual highlights this in bold.'],
  wrong: [['Nobody; it is a simple benchtop instrument', 'You must be supervised.'], ['A TA, because the lamp is dangerous UV', 'The stated reason is the cost of the cells.'], ['The lab technician, because the sample is hazardous', 'The stated requirement is a TA, for the cell expense.']],
}));
const mag = S('tq.magsus', 'Magnetic susceptibility', 'tq-special');
add(mcq({
  id: 'bk-c61-b-mag-instr', ...mag, source: 'Manual p.4 (mentioned); 2015 paper style',
  stem: 'Which instrument would you use to find the number of unpaired electrons in a metal complex?',
  right: ['A magnetic susceptibility balance', 'It measures susceptibility, from which the effective magnetic moment and the number of unpaired electrons follow.'],
  wrong: [['A polarimeter', 'It measures optical rotation of chiral compounds.'], ['An NMR spectrometer recording a routine proton spectrum', 'A routine spectrum does not count unpaired electrons (paramagnetism in fact broadens signals); special methods such as the Evans method are a different measurement and are not what the course uses.'], ['An IR spectrometer', 'It identifies functional groups by vibrations.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-mag-zn', ...mag, source: 'Manual p.32; CM2021 magnetism',
  stem: 'The complex Py₂Zn(NCO)₂ from Expt 1D has zinc(II), a d¹⁰ ion. What would a magnetic susceptibility measurement show?',
  right: ['Diamagnetic: no unpaired electrons', 'A filled d subshell has no unpaired electrons, so the sample is repelled weakly by a magnetic field.'],
  wrong: [['Paramagnetic with two unpaired electrons', 'Two unpaired electrons would need a d⁸ or d²-type configuration, not d¹⁰.'], ['Paramagnetic with one unpaired electron', 'Zn²⁺ has a full 3d subshell.'], ['Ferromagnetic', 'Ferromagnetism requires cooperative ordering in solids like iron.']],
  beyond: true,
}));

// ---- distillation under reduced pressure, azeotropes ----------------------------------------------------------
const dist = S('tq.distil', 'Reduced-pressure distillation, nomograph and azeotropes', 'tq-distil');
add(mcq({
  id: 'bk-c61-b-dist-why', ...dist, source: 'Manual p.4 (video); 2015 paper style',
  stem: 'Why would a chemist remove formic acid by distillation under reduced pressure instead of at atmospheric pressure?',
  right: ['The boiling point drops with pressure, so the acid distils at a lower temperature and the sensitive product is not overheated', 'Lowering the pressure is a way to distil without excessive heat.'],
  wrong: [['Reduced pressure raises the boiling point so the acid stays in the flask', 'It lowers the boiling point.'], ['Reduced pressure makes the acid react with the vacuum pump oil', 'Nothing of the kind is the aim.'], ['It is the only way to separate a liquid from a solid', 'Filtration does that; distillation is chosen to avoid high temperatures.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-dist-nomo', ...dist, source: '2015 paper style; Year-1 technique (nomograph)',
  stem: 'The boiling point of formic acid is 101 °C at atmospheric pressure. Using a pressure-temperature nomograph, roughly what would it boil at under 180 mmHg?',
  right: ['About 60 °C', 'A straight edge through 101 °C on the 760 mmHg scale and 180 mmHg on the pressure scale reads about 60 °C: the boiling point falls by roughly 40 °C when the pressure drops to about a quarter of atmospheric. (A check from vapour-pressure data, about 44 mmHg at 25 °C for formic acid, gives about 58 °C.)'],
  wrong: [['About 100 °C', 'That would mean pressure has no effect; boiling points fall substantially at 180 mmHg.'], ['About 80 °C', 'A drop of only about 20 °C is too small for a reduction to one quarter of atmospheric pressure.'], ['About 40 °C', 'This over-reads the drop: 40 °C would need a pressure well below 180 mmHg (about 100 mmHg for this acid).'], ['About 5 °C', 'Far too low; the acid freezes at about 8 °C and would not boil there.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-dist-nomoread', ...dist, source: 'Year-1 technique (nomograph)',
  stem: 'A nomograph has three scales: observed boiling point, boiling point corrected to 760 mmHg and pressure. How is it used?',
  right: ['Lay a straight edge across two known values; the line meets the third scale at the value you need', 'Any two of the three quantities fix the third.'],
  wrong: [['Read each scale separately and add the values', 'The scales are linked by a straight line, not added.'], ['Multiply the pressure by the boiling point', 'No such calculation is used.'], ['Use only the pressure scale, since boiling points never change', 'The whole point is how boiling point changes with pressure.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-dist-azeo', ...dist, source: '2015 paper style; Year-1 technique',
  stem: 'What is an azeotrope?',
  right: ['A mixture of liquids that boils at a constant temperature with the vapour having the same composition as the liquid, so simple distillation cannot separate it further', 'It behaves like a single compound with its own boiling point.'],
  wrong: [['A mixture that boils over a very wide temperature range', 'That describes an ordinary mixture; an azeotrope boils at one temperature.'], ['A solid that sublimes without melting', 'That is sublimation, unrelated to azeotropes.'], ['Any liquid that cannot be distilled', 'Most liquids distil; an azeotrope limits the separation of a particular mixture.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-dist-azeo-fa', ...dist, source: '2015 paper style; CRC Handbook azeotrope data',
  stem: 'Formic acid (bp 101 °C) and water form a maximum-boiling azeotrope (about 107 °C, roughly 77 wt% acid). How does water in the flask affect the distillation of formic acid?',
  right: ['The acid-water azeotrope distils at a higher temperature than pure formic acid, so water makes complete removal of the acid by simple distillation harder', 'A maximum-boiling azeotrope holds the last of the acid back in the pot as a constant-boiling mixture; azeotropes do not always lower the boiling point.'],
  wrong: [['The mixture distils at a lower temperature, as ethanol-water does', 'Ethanol-water is a minimum-boiling azeotrope, but formic acid-water is a maximum-boiling one.'], ['Nothing changes: the acid distils at its normal 101 °C', 'The azeotrope has its own, higher, boiling point.'], ['Vigorous stirring breaks the azeotrope', 'Stirring only prevents bumping; it does not change vapour-liquid equilibrium.']],
  beyond: true, diff: 4,
}));
add(mcq({
  id: 'bk-c61-b-dist-bump', ...dist, source: 'Year-1 technique',
  stem: 'Which method prevents bumping during a distillation under reduced pressure?',
  right: ['Stir the liquid with a magnetic stir bar', 'Boiling chips release trapped air at low pressure and stop working; a stir bar gives smooth boiling.'],
  wrong: [['Add fresh boiling chips (anti-bumping granules)', 'Under vacuum the air in the granules is quickly lost, so they do not work.'], ['Heat as strongly as possible to boil it off quickly', 'Overheating increases the risk of bumping.'], ['Open the system to air briefly during the distillation', 'Opening the system defeats the reduced pressure.']],
  beyond: true,
}));

// ---- isolating products: recrystallisation, filtration, extraction, drying agents -------------------------------
const rec = S('tq.recryst', 'Recrystallisation and filtration', 'tq-isolate');
add(orderItem({
  id: 'bk-c61-b-recryst-order', ...rec, source: 'Manual pp.29, 34 (and Year-1 technique)',
  stem: 'Put the stages of a recrystallisation in a sensible order.',
  steps: ['Dissolve the crude solid in the minimum volume of hot solvent', 'Filter off any insoluble material while hot', 'Let the solution cool slowly to room temperature', 'Cool further in an ice bath', 'Collect the crystals by Buchner filtration', 'Wash with a little cold solvent and suck dry'],
  explanation: 'Minimum hot solvent gives a saturated solution; slow cooling grows pure crystals; the ice bath maximises recovery; a little cold solvent washes the surface without dissolving the product.',
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-recryst-toomuch', ...rec, source: 'Manual p.29',
  stem: 'What does the manual say happens if too much solvent is used in a recrystallisation?',
  right: ['The product will not crystallise on cooling, and the manual says the only way to recover it is by extraction', 'This is a warning on p.29. (Beyond the manual: in practice, boiling off or rotavapping some of the solvent and cooling again also recovers the product.)'],
  wrong: [['The crystals form faster and are purer', 'The opposite: nothing crystallises if the solution is not saturated at the low temperature.'], ['The product decomposes in the excess solvent', 'Decomposition is not the issue; solubility is.'], ['Nothing, because the product always crystallises on cooling', 'It crystallises only from a saturated solution.']],
}));
add(mcqMulti({
  id: 'bk-c61-b-recryst-recovery', ...rec, source: '2015 paper style; Manual p.29',
  stem: 'A recrystallisation from hot ethanol gave very poor recovery. Which changes would be likely to help? Select all that apply.',
  right: [['Use less hot ethanol to dissolve the material', 'a smaller volume leaves less product in solution'], ['Cool the solution to a lower temperature at the end', 'solubility falls as the temperature falls'], ['Add a little water to the hot solution to make the product less soluble', 'a poor solvent for the product that is miscible with ethanol lowers its solubility']],
  wrong: [['Wash the crystals with a large volume of warm ethanol', 'this redissolves the product and sends it into the filtrate'], ['Filter the solution while it is still hot and discard the filtrate', 'the product is still dissolved in the hot filtrate and is thrown away']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-buchner', ...rec, source: 'Manual pp.29, 34',
  stem: 'Why is the collected solid washed with only "a little cold" solvent on the Buchner funnel?',
  right: ['Cold solvent in a small volume rinses off mother liquor without dissolving much product', 'Warm or large volumes would redissolve the crystals.'],
  wrong: [['Cold solvent reacts with the product to purify it', 'The wash is a physical rinse.'], ['Large volumes of cold solvent are always better because they are cold', 'Even cold solvent dissolves some product; use as little as will do.'], ['Hot solvent removes impurities better and only a little is needed', 'Hot solvent would dissolve the product and ruin the yield.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-slowcool', ...rec, source: 'Manual pp.38, 51 (cool slowly); Year-1 technique',
  stem: 'Why do the procedures for 2-iodobenzoic acid and benzoic acid say to cool the hot solution slowly?',
  right: ['Slow cooling gives larger, purer crystals that exclude impurities, whereas rapid cooling traps impurities in small crystals', 'The slow growth lets molecules of the product, and not impurities, fit the lattice.'],
  wrong: [['Slow cooling increases the solubility of the product', 'Solubility drops with temperature on cooling, which is why crystals form.'], ['Rapid cooling would decompose the acid', 'Decomposition is not the issue.'], ['The precipitate dissolves faster at lower temperature', 'Crystals form as the temperature falls; they do not dissolve.']],
  beyond: true,
}));
const ext = S('tq.extraction', 'Separatory funnel and extraction', 'tq-isolate');
add(mcq({
  id: 'bk-c61-b-sep-layers', ...ext, source: 'Manual pp.39, 41, 47; densities from standard tables',
  stem: 'In Expt 5E the product is in dichloromethane and is washed with water in a separatory funnel. Which layer is at the bottom?',
  right: ['Dichloromethane (the organic layer), because it is denser than water', 'Dichloromethane is about 1.33 g/mL; the aqueous layer floats on top.'],
  wrong: [['Water, because organic solvents always float', 'Diethyl ether and hexane float; dichloromethane sinks.'], ['The two mix and form one layer', 'Dichloromethane and water are immiscible.'], ['The layers cannot be told apart', 'Density decides which is which.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-sep-ether', ...ext, source: 'Manual p.41; densities from standard tables',
  stem: 'In the work-up of Expt 6 the aqueous mixture is extracted twice with diethyl ether. Where is the ether layer in the separatory funnel?',
  right: ['On top, because diethyl ether is less dense than water', 'Ether is about 0.71 g/mL.'],
  wrong: [['At the bottom, like dichloromethane', 'Ether is lighter than water, unlike dichloromethane.'], ['Dissolved evenly in the aqueous phase', 'Ether and water form two layers (ether is only slightly soluble in water).'], ['It evaporates immediately and no layer forms', 'It remains as a liquid layer at room temperature.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-brine', ...ext, source: 'Manual p.41 (brine wash)',
  stem: 'Why are the combined ether layers washed with brine (saturated aqueous NaCl) before drying in Expt 6?',
  right: ['Brine pulls dissolved water out of the organic layer and lowers the solubility of the organic product in the aqueous phase, so less drying agent is needed and less product is lost', 'This is the "salting-out" effect.'],
  wrong: [['Brine neutralises traces of acid', 'It is neutral; neutralisation needs a base such as NaHCO₃.'], ['Brine converts the ester into its sodium salt', 'No reaction takes place.'], ['Brine increases the volume so the layers separate more slowly', 'The purpose is removing water, not slowing separation.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-bicarb', ...ext, source: 'Manual p.47',
  stem: 'In Expt 8 the combined organic layers are washed with sodium bicarbonate solution. What is the purpose and what do you watch for?',
  right: ['It neutralises the HCl formed in the hydrolysis; CO₂ is released, so vent the funnel', 'HCl plus bicarbonate gives chloride, water and carbon dioxide gas.'],
  wrong: [['It dries the organic layer; nothing is released', 'Bicarbonate solution is aqueous and does not dry anything; gas is released.'], ['It converts the siloxane to a silanol', 'It only neutralises acid.'], ['It extracts the siloxane into the water layer', 'The siloxane stays in the organic layer.']],
  beyond: true,
}));
const dry = S('tq.drying', 'Drying agents', 'tq-isolate');
add(mcqSet({
  id: 'bk-c61-b-dryagent', ...dry, source: 'Manual pp.39, 41, 47; properties from standard tables', diff: 3, beyond: true,
  items: [
    { stem: 'Which statement about magnesium sulfate and sodium sulfate as drying agents is correct?',
      right: ['Magnesium sulfate dries faster (a fine powder with a high capacity) but must be filtered; sodium sulfate is slower and neutral', 'Both are used in the manual: MgSO₄ in Expt 8 and the NaBH₄ reduction in Expt 6, Na₂SO₄ in Expts 5E and the yeast work-up.'],
      wrong: [['Sodium sulfate is faster than magnesium sulfate', 'Sodium sulfate is the slower of the two.'], ['Magnesium sulfate cannot be filtered off', 'It is a fine powder that is filtered off.'], ['Neither removes water; they only change the colour of the solution', 'They take up water of hydration from the organic solution.']] },
    { stem: 'What do you do once the organic layer has been dried over a drying agent?',
      right: ['Filter off the drying agent and evaporate the solvent', 'The manual does exactly this: filter, then rotavap.'],
      wrong: [['Evaporate with the drying agent still in the flask', 'The solid would contaminate the product.'], ['Add water to dissolve the drying agent', 'That would re-wet the solution.'], ['Pour the solution into the next experiment as it is', 'The solvent must be removed to isolate the product.']] },
  ],
}));

// ---- inert and dry conditions ---------------------------------------------------------------------------------
const inert = S('tq.inert', 'Drying tubes, oven-dried glassware and the Schlenk line', 'tq-inert');
add(mcq({
  id: 'bk-c61-b-dryingtube', ...inert, source: 'Manual pp.39, 44',
  stem: 'What does a drying tube on top of an addition funnel or condenser do?',
  right: ['It lets gas move in and out while keeping moist air out of the apparatus', 'The system stays open (no pressure build-up) but atmospheric water is trapped by the desiccant in the tube.'],
  wrong: [['It seals the apparatus completely so no gas can escape', 'A sealed system would build up pressure; a drying tube is vented.'], ['It supplies dry nitrogen to the flask', 'Nitrogen comes from a manifold or balloon, not from a drying tube.'], ['It condenses solvent vapour', 'That is the job of the condenser.']],
}));
add(mcq({
  id: 'bk-c61-b-5e-dry', ...inert, source: 'Manual p.39',
  stem: 'Why does Expt 5E use a dried flask, an oven-dried stir bar, anhydrous dichloromethane and a drying tube?',
  right: ['Trifluoroacetic anhydride is moisture-sensitive: water would hydrolyse it to trifluoroacetic acid and consume the reagent', 'Keeping water out preserves the electrophile for the pyrrole.'],
  wrong: [['The pyrrole explodes on contact with water', 'The sensitive reagent is the anhydride; water would waste it.'], ['Water would turn the dichloromethane into chloroform', 'It would not.'], ['Dry apparatus prevents the product from sublimating early', 'The drying has nothing to do with the later sublimation.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-oven', ...inert, source: 'Manual p.50',
  stem: 'How is glassware prepared for a Grignard reaction in Expt 9?',
  right: ['Dried in an oven at about 120 °C for an hour, assembled hot, put under vacuum at once, then flushed with nitrogen when cool', 'Looking dry is not enough: a film of water clings to glass surfaces and would destroy the Grignard reagent.'],
  wrong: [['Rinsed with acetone and air-dried for a minute', 'Acetone leaves traces of water and is not oven-drying.'], ['Washed with water and used straight away', 'Water destroys a Grignard reagent.'], ['Dried in an oven, then left open on the bench to cool', 'It would pick up moisture from the air as it cools; it is assembled hot and put under vacuum.']],
}));
add(mcq({
  id: 'bk-c61-b-schlenk', ...inert, source: 'Manual p.49',
  stem: 'What does the vacuum-nitrogen double manifold (Schlenk line) allow?',
  right: ['The apparatus can be evacuated and refilled with nitrogen, so reagents and solvents are kept free of air and moisture', 'This is what the Grignard preparation needs.'],
  wrong: [['It heats the flask to a precise temperature', 'It is a gas and vacuum manifold, not a heater.'], ['It distils the ether continuously', 'Collecting dry ether is done with a demonstrator\'s help; the line just supplies vacuum and nitrogen.'], ['It filters the reaction mixture', 'No filtration happens on a Schlenk line.']],
}));

// ---- apparatus sense: addition funnels, flask size, necks -------------------------------------------------------
const app = S('tq.apparatus', 'Flask size, necks and addition funnels', 'tq-apparatus');
add(mcq({
  id: 'bk-c61-b-pressure-eq', ...app, source: 'Manual p.50',
  stem: 'Why is a pressure-equalising addition funnel used in the Grignard apparatus of Expt 9?',
  right: ['The liquid drips in even though the funnel is closed under nitrogen, because the pressure above and below the liquid is equal', 'A plain funnel with the top closed would not drain; with the top open it would admit moist air.'],
  wrong: [['It heats the bromobenzene as it is added', 'It has no heating function.'], ['It filters the bromobenzene', 'It is only a dropping device.'], ['It lets you add the solid magnesium without a stopper', 'The magnesium is already in the flask.']],
}));
add(mcq({
  id: 'bk-c61-b-necks-9', ...app, source: 'Manual p.50',
  stem: 'In the Expt 9 apparatus, what is attached to each neck of the two-neck round-bottom flask?',
  right: ['One neck carries the reflux condenser (with a connection to the manifold) and the other the pressure-equalising addition funnel', 'Each necessary item needs its own neck, and the flask holds the magnesium in ether.'],
  wrong: [['A thermometer and a stopper', 'No thermometer is used and the funnel needs a neck.'], ['Two condensers', 'Only one is needed, and the addition funnel must be fitted.'], ['An addition funnel and a stirrer', 'A magnetic stir bar is used and the condenser is needed for reflux.']],
}));
add(mcq({
  id: 'bk-c61-b-flasksize', ...app, source: '2015 paper style; Year-1 technique',
  stem: 'A reaction mixture will have a total volume of about 640 mL. A rule of thumb is to fill a flask no more than half full. What is the smallest standard flask that fits?',
  right: ['2 L (since 640 mL needs a flask of at least 1.3 L)', 'Half full or less means the flask volume must be at least twice the mixture volume, and 2 L is the next standard size above 1.28 L.'],
  wrong: [['500 mL', 'It is smaller than the mixture itself.'], ['1 L', 'The mixture would fill it to about two-thirds, more than half.'], ['5 L', 'It would work but is far larger than necessary; the smallest standard flask that satisfies the rule is asked for.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-necks-min', ...app, source: '2015 paper style; Year-1 technique',
  stem: 'A reaction needs a dropwise addition of a reagent, a thermometer to monitor the exotherm and magnetic stirring. Using plain necks only (no multi-port adapters), what is the minimum number of necks on the flask?',
  right: ['Two: one for the addition funnel and one for the thermometer', 'A magnetic stir bar needs no neck; every other item that must enter the flask needs its own.'],
  wrong: [['One, since only one reagent is added', 'Two items cannot enter through one bare neck.'], ['Three, because stirring needs a neck', 'Magnetic stirring works through the flask wall, so no neck is needed.'], ['Four, one for each of the items plus a condenser', 'No condenser is needed in this scenario.']],
  beyond: true,
}));
add(mcq({
  id: 'bk-c61-b-sepfunnel-add', ...app, source: 'Manual pp.30, 31, 47',
  stem: 'In Expts 1B, 1C and 8 a separatory funnel is clamped above the flask. What is it doing there?',
  right: ['It serves as an addition funnel: the stopcock lets the reagent solution be added slowly and controllably', 'Slow addition controls the exotherm (and, in Expt 8, the HCl evolution).'],
  wrong: [['It separates the layers of the product during the reaction', 'No layers are separated at this stage.'], ['It filters the reaction as it runs', 'It does not filter.'], ['It keeps the reaction under nitrogen', 'It has no inert-gas function here.']],
}));

export default items;
