/* Chunk A: course framework, safety, notebook and reports, accuracy table, the literature (Manual pp.3-14, 26-28). Week 1. */
import { mcq, mcqSet } from './lib.mjs';

const W = 1;
const items = [];
const add = (x) => items.push(x);

// ---- method: four purification methods; synthesise - purify - characterise --------------------------------
add(mcq({
  id: 'bk-c61-a-four-methods', week: W, chunk: 'fw-method', skill: 'fw.purif', skillName: 'The four purification methods', source: 'Manual p.3',
  stem: 'The course says that by the end you will know four purification methods and when to use each. Which set is it?',
  right: ['Distillation, recrystallisation, chromatography and sublimation', 'These are the four named on p.3. In the six lab experiments you use recrystallisation most often, column chromatography in Expt 7 and sublimation in Expt 5E; distillation (including under reduced pressure) is taught through the technique videos.'],
  wrong: [
    ['Distillation, recrystallisation, extraction and filtration', 'Extraction and filtration are separation operations used in work-ups, not the four purification methods the manual lists.'],
    ['Recrystallisation, chromatography, titration and sublimation', 'Titration measures an amount; it does not purify a product.'],
    ['Distillation, chromatography, melting-point determination and sublimation', 'A melting point characterises a solid (it shows purity) but does not purify it.'],
  ], tags: ['purification'],
}));
add(mcqSet({
  id: 'bk-c61-a-pick-method', week: W, chunk: 'fw-method', skill: 'fw.purif', skillName: 'The four purification methods', source: 'Manual p.3 (the four methods); matching them to the experiments: pp.29-47', diff: 2,
  items: [
    { stem: 'A crude product is a mixture of three coloured organometallic compounds of different polarity, a few hundred milligrams in all. Which purification method fits?',
      right: ['Column chromatography', 'It separates components by how strongly they stick to silica; the polarity differences are exactly what Expt 7 exploits.'],
      wrong: [['Recrystallisation from one solvent', 'It removes small amounts of impurity from one major solid; three comparable components would co-crystallise or be lost in the mother liquor.'], ['Simple distillation', 'These are solids, not liquids with well-separated boiling points.'], ['Washing with water', 'The compounds are organic and not water-soluble, so water separates none of them.']] },
    { stem: 'A small amount of a volatile, low-melting solid must be freed from non-volatile solid by-products. Which method does the manual use for this in Expt 5E?',
      right: ['Sublimation under vacuum with gentle warming', 'The product passes straight from solid to vapour onto the cold finger and leaves the non-volatile material behind.'],
      wrong: [['Column chromatography on silica', 'Possible in principle but not the method the manual uses, and wasteful for a clean volatile solid.'], ['Recrystallisation from hot water', 'The manual does not use it for this product; sublimation avoids solvent and losses in the mother liquor.'], ['Distillation at atmospheric pressure', 'The product is a solid, and the manual sublimes it under about 6 mmHg with heating of at most 50 °C, far gentler than atmospheric distillation.']] },
    { stem: 'A product is a solid that dissolves well in hot ethanol and poorly in cold ethanol, with small amounts of coloured impurity. Which method is the usual choice?',
      right: ['Recrystallisation', 'The large solubility change with temperature is what recrystallisation needs; impurities stay in the cold solvent.'],
      wrong: [['Sublimation', 'It needs a solid that is volatile; solubility behaviour is irrelevant to it.'], ['Distillation', 'Distillation is for liquids; this product is a solid purified by dissolving and recrystallising.'], ['Column chromatography', 'It works, but is slower and uses much more solvent than the simple method that fits this solubility pattern.']] },
  ],
}));
add(mcq({
  id: 'bk-c61-a-spc', week: W, chunk: 'fw-method', skill: 'fw.spc', skillName: 'Synthesise, purify, characterise', source: 'Manual p.4',
  stem: 'In the course workflow "synthesise, purify, characterise", what is the aim of the characterise stage?',
  right: ['To show that the material is both the right compound and pure', 'The manual says you must demonstrate that what you made is the desired product and is pure, using mp, TLC, IR and NMR.'],
  wrong: [
    ['To increase the yield of the crude product', 'Yield is set in the synthesis; characterisation measures, it does not make more product.'],
    ['To remove the last traces of solvent', 'Drying is part of purification; characterisation only analyses the result.'],
    ['To check that the procedure was followed in the notebook', 'Following the procedure belongs to the first stage; this stage is about the product itself.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-nmr-who', week: W, chunk: 'fw-method', skill: 'fw.spc', skillName: 'Synthesise, purify, characterise', source: 'Manual pp.4, 15-16',
  stem: 'Who does what with the NMR and IR spectra in CM2061?',
  right: ['You run the IR yourself; the NMR is recorded for you after a TA helps with the sample, and you process, print and interpret it', 'The manual makes processing (Fourier transform, printing, expansions) and interpretation your responsibility; Spinworks is one option, any software is allowed.'],
  wrong: [
    ['The TA runs and interprets both spectra for you', 'You record the IR yourself and you interpret both; only the NMR acquisition is done for you.'],
    ['You run both spectrometers unaided', 'Students submit NMR samples with a TA\'s help and do not run the spectrometer (even licence holders submit samples).'],
    ['You run the NMR yourself and the TA records the IR', 'The roles are the other way round: IR is yours, NMR acquisition is the staff\'s.'],
  ],
}));

// ---- safety ------------------------------------------------------------------------------------------
add(mcq({
  id: 'bk-c61-a-hazard-def', week: W, chunk: 'fw-safety', skill: 'fw.risk', skillName: 'Risk assessment: hazards and precautions', source: 'Manual p.7',
  stem: 'Benzene is both a carcinogen and flammable. How should this appear in the pre-lab risk assessment?',
  right: ['As two separate hazards, each with its own precaution', 'A hazard is a property of a chemical, not the chemical itself, and different properties need different precautions.'],
  wrong: [
    ['As one entry, "benzene: dangerous", with a single precaution', 'This names the chemical, not a property, and one precaution cannot cover both properties.'],
    ['Only the more serious property is listed', 'The table asks for three hazards of the experiment, so a second property of the same chemical can fill another row; it should not be dropped just because it is less serious.'],
    ['Benzene need not be listed because it is a solvent', 'Being a solvent does not remove its hazards; the table is for the most serious risks of the experiment.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-hazard-which', week: W, chunk: 'fw-safety', skill: 'fw.risk', skillName: 'Risk assessment: hazards and precautions', source: 'Manual p.7',
  stem: 'Which row is written correctly for a risk assessment (hazard, then precaution)?',
  right: ['Diethyl ether is flammable; use it in the fume cupboard with no naked flames or sources of ignition', 'It names a property (flammable) and gives a precaution that addresses that property.'],
  wrong: [
    ['Diethyl ether; wear goggles', 'No hazard is named, and goggles are required for every experiment, so this is not a precaution specific to the hazard.'],
    ['Sulfuric acid is a chemical; be careful', 'A chemical is not a hazard, and "be careful" is not a precaution.'],
    ['Flammable, corrosive and toxic; use the fume cupboard', 'Separate hazards need separate precautions; one precaution cannot address all three properties.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-risk-count', week: W, chunk: 'fw-safety', skill: 'fw.risk', skillName: 'Risk assessment: hazards and precautions', source: 'Manual pp.3, 7',
  stem: 'How many hazards must the pre-lab risk assessment identify for an experiment, and what goes with each?',
  right: ['Three hazards, each with one reasonable precaution', 'The manual\'s table has three rows, and the learning outcomes say you consider "three risks, not one".'],
  wrong: [
    ['One hazard, the most dangerous, with every precaution you can think of', 'The task is breadth: three different hazards, one precaution each.'],
    ['Every hazard of every chemical, with a full safety data sheet', 'The table is a short list of the most serious risks, not an exhaustive inventory.'],
    ['Three hazards with three precautions each', 'One reasonable precaution per hazard is what the table asks for.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-risk-check', week: W, chunk: 'fw-safety', skill: 'fw.risk', skillName: 'Risk assessment: hazards and precautions', source: 'Manual p.7',
  stem: 'A TA looks at your completed risk assessment before you start. What does that inspection establish?',
  right: ['Only that the assessment has been done, not that it is correct', 'The manual says the inspection ensures it was done; being correct is still your responsibility.'],
  wrong: [
    ['That every hazard and precaution is correct', 'The manual explicitly says the inspection does not check correctness.'],
    ['That you may skip the safety quiz', 'The safety video and test are separate requirements for working in the lab at all.'],
    ['That the experiment is approved for repetition if it goes wrong', 'Repeats need permission from the course coordinator and lab staff, and have nothing to do with the risk assessment.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-goggles', week: W, chunk: 'fw-safety', skill: 'fw.rules', skillName: 'Safety rules and dress code', source: 'Manual p.8',
  stem: 'You wear prescription glasses to the lab. What eye protection is required?',
  right: ['Safety goggles worn over the glasses', 'Ordinary glasses do not give adequate protection, so goggles go over them, at all times.'],
  wrong: [
    ['Your glasses are enough because they cover the eyes', 'The manual states that ordinary glasses do not provide adequate protection.'],
    ['Goggles only when handling corrosive reagents', 'Goggles must be worn at all times in the lab, not just for dangerous steps.'],
    ['Swap to contact lenses and wear goggles over them', 'Contact lenses must not be worn in the lab even under goggles.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-lenses', week: W, chunk: 'fw-safety', skill: 'fw.rules', skillName: 'Safety rules and dress code', source: 'Manual p.8',
  stem: 'Why are contact lenses forbidden even when safety goggles are worn?',
  right: ['Corrosive material can flow under the edge of the lens, and a lens hinders immediate, complete flushing of the eye', 'Both reasons are given on p.8: permanent damage can result.'],
  wrong: [
    ['Lenses are flammable and would catch fire from a hot plate', 'Nothing in the manual says this; the concern is chemical splashes and flushing.'],
    ['Goggles fog up more when lenses are worn', 'Comfort is not the issue; eye injury is.'],
    ['Lenses react with organic solvent vapour and release toxic gas', 'The risk is a splash trapped under the lens, not a reaction of the lens itself.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-sash', week: W, chunk: 'fw-safety', skill: 'fw.rules', skillName: 'Safety rules and dress code', source: 'Manual p.10',
  stem: 'A fume cupboard in the teaching lab starts to sound a whining alarm. What is the cause and the fix?',
  right: ['The sash is up too far, so the cupboard is not protecting you; pull the sash down', 'The alarm sounds when the sash is left too far up, and the same applies to a shared waste-solvent cupboard.'],
  wrong: [
    ['The extraction fan has failed; leave it running and carry on', 'The manual ties the alarm to the sash position, and a cupboard in that state cannot protect you, so you must not carry on.'],
    ['Solvent has been spilt inside; mop it up', 'The alarm is a sash-height alarm, not a spill detector.'],
    ['The fire alarm has been triggered; evacuate', 'A fume-cupboard alarm is separate from the fire alarm.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-dress', week: W, chunk: 'fw-safety', skill: 'fw.rules', skillName: 'Safety rules and dress code', source: 'Manual pp.8, 10',
  stem: 'Which student would be allowed into the teaching lab?',
  right: ['Lab coat, long trousers, closed shoes with no gap to the trousers, long hair tied back', 'It meets every rule: coat, long pants, full-coverage shoes and tied-back hair.'],
  wrong: [
    ['Lab coat, Bermuda shorts, closed shoes', 'Shorts of any kind (including Bermudas) are not permitted.'],
    ['Lab coat, long trousers, sandals', 'Sandals, slippers, open-toed and high-heeled shoes are not allowed.'],
    ['Lab coat, long skirt, closed shoes', 'Skirts may not be worn; long pants are required.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-phone', week: W, chunk: 'fw-safety', skill: 'fw.rules', skillName: 'Safety rules and dress code', source: 'Manual pp.8-9',
  stem: 'Which use of a phone is permitted in the teaching lab?',
  right: ['Watching an experiment video via its QR code', 'This is the single exception: videos only (and gloves must come off before touching the phone).'],
  wrong: [
    ['Listening to music through earphones while you stir', 'Personal audio equipment is banned because anything that interferes with hearing what is going on is a hazard.'],
    ['Replying to messages between steps', 'Electronic items are not permitted except for the lab videos.'],
    ['Photographing your apparatus for the report', 'Only video viewing is allowed; photos are not mentioned as an exception.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-late', week: W, chunk: 'fw-safety', skill: 'fw.rules', skillName: 'Safety rules and dress code', source: 'Manual p.11',
  stem: 'The lab starts at 9:30 am. What happens if you arrive at 9:45?',
  right: ['You may be refused entry and receive zero marks for that session', 'More than 10 minutes late risks exclusion and a zero for the session.'],
  wrong: [
    ['You enter normally and lose a few marks for lateness only', 'Lateness up to 10 minutes can cost behaviour marks; beyond 10 minutes you may be excluded with zero.'],
    ['You may enter but must skip the risk assessment', 'The risk assessment is never skipped, and the manual makes no such concession.'],
    ['You are moved to the Friday group automatically', 'Swapping groups needs permission from the coordinator or lab staff.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-leave-reaction', week: W, chunk: 'fw-safety', skill: 'fw.rules', skillName: 'Safety rules and dress code', source: 'Manual p.11',
  stem: 'The procedure says to stir for two hours. Can you leave the bench for lunch during that time?',
  right: ['Yes, if the reaction is safe and stable while unattended; ask a TA if unsure', 'The manual encourages planning lunch around stirring or refluxing, provided it is safe.'],
  wrong: [
    ['No, the reaction must be watched every minute', 'The manual says you can leave it while stirring or refluxing if safe.'],
    ['Yes, but only after switching off the stirrer', 'Stopping the stirrer defeats the two-hour step; the point is to leave it running safely.'],
    ['Only if another student signs a form', 'No such form is mentioned; the test is safety and a TA\'s advice.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-ethics', week: W, chunk: 'fw-safety', skill: 'fw.rules', skillName: 'Safety rules and dress code', source: 'Manual pp.5, 14',
  stem: 'Which of these is listed as unethical behaviour?',
  right: ['Claiming a higher yield than you actually obtained', 'Pretending you got a higher yield is on the manual\'s list, with copying reports and using others\' data.'],
  wrong: [
    ['Discussing the chemistry with your neighbours at the bench', 'The manual encourages discussing chemistry and learning from neighbours\' activities.'],
    ['Reading the procedures of experiments you were not assigned', 'The manual advises this, since the exam can ask about all versions.'],
    ['Asking a TA whether a piece of advice is sound', 'You are meant to judge advice critically, and asking is fine.'],
  ],
}));

// ---- notebook, reports, accuracy ----------------------------------------------------------------------
add(mcq({
  id: 'bk-c61-a-card-board', week: W, chunk: 'fw-reports', skill: 'fw.notebook', skillName: 'Notebook and report rules', source: 'Manual p.12',
  stem: 'Where does the thick cardboard sheet from the back of the lab notebook go before you write?',
  right: ['Between the carbon copy of the current page and the standard copy of the next page', 'It stops the carbon copies of the following pages being etched by the pressure of your pen.'],
  wrong: [
    ['Between the standard copy and the carbon copy of the page you are writing on', 'That would stop the carbon copy from forming at all; the sheet goes behind the carbon, protecting the pages that follow.'],
    ['Under the back cover so the book lies flat', 'It has a specific job inside the book, shielding the next pages from etching.'],
    ['Torn out and handed in with the carbon copy', 'It is a working shield, not something you submit; you tear out only the carbon copy.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-card-submit', week: W, chunk: 'fw-reports', skill: 'fw.notebook', skillName: 'Notebook and report rules', source: 'Manual p.12',
  stem: 'At the end of the lab day, what do you hand in from your notebook?',
  right: ['Only the carbon copy of each page for that day\'s experiment, signed by a TA, before leaving the lab', 'You tear out just the carbon copies, with a TA signature at the bottom, and submit them to the document box before leaving.'],
  wrong: [
    ['The standard (top) copies, since they are the clearer ones', 'You keep the standard copies and submit the carbon copies.'],
    ['Both copies of every page in the notebook', 'Only the pages for that day\'s experiment, and only the carbon copy of each.'],
    ['Nothing; the notebook page is attached to the lab report online', 'The carbon copy must be dropped in the box before you leave, and a copy of the page is also attached to the report; neither replaces the other.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-report-ok', week: W, chunk: 'fw-reports', skill: 'fw.notebook', skillName: 'Notebook and report rules', source: 'Manual pp.12-13',
  stem: 'Which lab report would be marked?',
  right: ['Answers typed into the current proforma, with IR, NMR and the notebook page combined into one PDF, structures in bond-line style', 'This follows every rule on pp.12-13.'],
  wrong: [
    ['A neatly handwritten report, photographed and uploaded', 'Handwritten, scanned or photographed reports are not marked and graded zero.'],
    ['A retyped copy of last year\'s proforma with your answers', 'Only the current proformas downloaded from the experiment LAMS sequence are accepted; re-typed versions score zero.'],
    ['The proforma plus the spectra as three separate uploads', 'Everything must be combined into a single PDF, or it is not accepted.'],
  ],
}));
add(mcq({
  id: 'bk-c61-a-grade', week: W, chunk: 'fw-reports', skill: 'fw.notebook', skillName: 'Notebook and report rules', source: 'Manual p.12',
  stem: 'How is the CM2061 grade divided?',
  right: ['Final exam 50%, lab reports 30%, e-labs 15%, LAMS quizzes 5%', 'These are the weights in the table on p.12; you must also complete all six in-lab experiments to sit the exam.'],
  wrong: [
    ['Final exam 70%, lab reports 30%', 'The e-labs (15%) and LAMS quizzes (5%) carry marks and the exam is 50%.'],
    ['Final exam 50%, lab reports 50%', 'Reports are 30%; e-labs and quizzes make up the other 20%.'],
    ['Final exam 30%, lab reports 50%, e-labs 20%', 'The weights are reversed: the exam is the largest part, at 50%.'],
  ],
}));
const ACC = [
  { stem: 'A balance displays 16.1323 g for your crude product. How do you report the mass?',
    right: ['16.132 g', 'Masses are given to 3 significant figures but never to less than a whole milligram, so the 3 s.f. value of 16.1 g is too coarse; the milligram is the finest digit justified.'],
    wrong: [['16.1 g', 'Three significant figures alone would give this, but the rule adds "not less than a whole mg": 16.1 g throws away more than a milligram.'], ['16.1323 g', 'The extra digits come from the instrument, not from real precision; the manual warns that digital read-outs give too many figures.'], ['16.13 g', 'This rounds to the nearest 10 mg, which is coarser than the whole-mg limit.']] },
  { stem: 'The yield of a reaction calculates as 71.46%. How should it be reported?',
    right: ['71%', 'Yields are quoted as a whole percentage.'],
    wrong: [['71.5%', 'One decimal place is more precision than the rule allows.'], ['71.46%', 'The raw calculator value claims accuracy that the measurements do not have.'], ['70%', 'Rounding to the nearest ten is coarser than the whole-percent rule.']] },
  { stem: 'A product melts over 169.4 to 171.2 °C. How is the melting-point range reported?',
    right: ['169-171 °C', 'Melting points are quoted to the nearest whole degree, so each end of the range is rounded to a whole degree.'],
    wrong: [['169.4-171.2 °C', 'Tenths of a degree are not justified on this apparatus; the rule is the nearest whole degree.'], ['170 °C', 'Quoting one number discards the range, and the range tells you about purity.'], ['169.0-171.0 °C', 'Adding ".0" implies the tenths place was measured, which it was not.']] },
  { stem: 'Which value is reported to the accuracy the manual asks for?',
    right: ['δ 7.26 and J = 8.1 Hz', 'Chemical shifts are given to 2 decimal places and coupling constants to 1.'],
    wrong: [['δ 7.3 and J = 8.1 Hz', 'The shift needs two decimal places.'], ['δ 7.26 and J = 8 Hz', 'J needs one decimal place.'], ['δ 7.264 and J = 8.12 Hz', 'Both are too precise: 2 d.p. for δ and 1 d.p. for J.']] },
  { stem: 'The instrument gives an IR band at 1687.4 cm⁻¹ and an Rf of 0.4321. Which pair is reported correctly?',
    right: ['1687 cm⁻¹ and Rf 0.43', 'IR frequencies go to the nearest whole wavenumber and Rf to 2 decimal places.'],
    wrong: [['1687.4 cm⁻¹ and Rf 0.4', 'Neither is right: the IR needs a whole number and Rf needs 2 d.p.'], ['1690 cm⁻¹ and Rf 0.43', 'The IR value is rounded to the nearest 10 rather than the nearest whole wavenumber.'], ['1687 cm⁻¹ and Rf 0.432', 'Rf is given to 2 decimal places, not 3.']] },
  { stem: 'A pressure gauge on the vacuum line reads 5.8 mmHg (to a tenth). How should the pressure be reported?',
    right: ['6 mmHg', 'Pressure is reported to a whole mmHg.'],
    wrong: [['5.8 mmHg', 'Tenths are not justified for this gauge; the rule says whole mmHg.'], ['5 mmHg', 'Truncating instead of rounding gives the wrong value; 5.8 rounds to 6.'], ['0.0058 mmHg', 'This changes the number itself, not just the way it is quoted.']] },
  { stem: 'A solution has a measured optical rotation which you convert to a specific rotation of +41.2873. How is [α]D reported?',
    right: ['+41.3', '[α]D is given to 1 decimal place.'],
    wrong: [['+41', 'One decimal place is required, so a whole number is too coarse.'], ['+41.29', 'Two decimal places is too many for this quantity.'], ['+41.2873', 'This is the unrounded calculator display.']] },
  { stem: 'You calculate that a reaction used 0.0067842 mol of a reagent. How many moles do you quote?',
    right: ['0.00678 mol (6.78 mmol)', 'Moles are quoted to 3 significant figures.'],
    wrong: [['0.0068 mol', 'That is only 2 significant figures.'], ['0.006784 mol', 'That is 4 significant figures, one too many.'], ['0.01 mol', 'This rounds far too coarsely and wastes the measurement.']] },
];
add(mcqSet({ id: 'bk-c61-a-accuracy', week: W, chunk: 'fw-reports', skill: 'fw.accuracy', skillName: 'Accuracy table: decimal places', source: 'Manual p.14', items: ACC, diff: 2 }));
add(mcq({
  id: 'bk-c61-a-accuracy-mm', week: W, chunk: 'fw-reports', skill: 'fw.accuracy', skillName: 'Accuracy table: decimal places', source: 'Manual p.14',
  stem: 'Which quantity is reported to two decimal places according to the accuracy table?',
  right: ['Molecular mass (and magnetic moment, Rf and 1H NMR shift)', 'The table gives 2 d.p. for molecular mass, magnetic moment, Rf and δ; coupling constants and [α]D get 1.'],
  wrong: [['Yield', 'A whole percentage.'], ['Boiling point', 'Boiling points are given to the nearest whole degree.'], ['Coupling constant J', 'J has one decimal place.']],
}));

// ---- literature -------------------------------------------------------------------------------------------
add(mcqSet({
  id: 'bk-c61-a-papers', week: W, chunk: 'fw-lit', skill: 'fw.journals', skillName: 'Journals, paper types and citations', source: 'Manual pp.26-27', diff: 2,
  items: [
    { stem: 'Which type of article is a fast announcement of a new discovery with a limited amount of experimental detail?',
      right: ['A communication', 'It is short, quick and may have few examples; a full paper follows with details.'],
      wrong: [['A review', 'A review discusses existing literature and has no new results.'], ['A full paper', 'A full paper is the thorough investigation with a good number of examples and full experimental details.'], ['A textbook chapter', 'Textbooks are secondary literature that rely on published papers.']] },
    { stem: 'Which of these is primary literature?',
      right: ['A full paper reporting new results', 'Communications and full papers contain new results, so they are primary.'],
      wrong: [['A review article', 'Reviews rely on earlier papers, so they are secondary.'], ['A textbook such as Comprehensive Organic Synthesis', 'Textbooks are secondary literature.'], ['The Dictionary of Organic Compounds', 'It is a reference collection built from the literature, so it is secondary.']] },
    { stem: 'Which of these journals publishes reviews only?',
      right: ['Chemical Reviews', 'Chem. Rev. (ACS) and Chem. Soc. Rev. (RSC) are marked as reviews only.'],
      wrong: [['Organic Letters', 'Org. Lett. publishes communications.'], ['Tetrahedron', 'Tetrahedron takes both reviews and papers.'], ['Synlett', 'Synlett (Thieme) publishes communications.']] },
    { stem: 'Which journal and publisher are correctly paired?',
      right: ['Tetrahedron Letters, Elsevier', 'Tetrahedron and Tetrahedron Lett. are Elsevier titles; the latter carries communications.'],
      wrong: [['Synthesis, Wiley-VCH', 'Synthesis and Synlett are published by Thieme.'], ['Chemical Communications, the American Chemical Society', 'Chem. Commun. is a Royal Society of Chemistry journal.'], ['Inorganic Chemistry, Elsevier', 'Inorg. Chem. is an ACS journal.']] },
    { stem: 'Which publisher issues Angewandte Chemie?',
      right: ['Wiley-VCH', 'The manual lists Angewandte Chemie, Chemistry (a European and an Asian Journal) and Advanced Synthesis and Catalysis under Wiley-VCH.'],
      wrong: [['Elsevier', 'Elsevier lists Tetrahedron and Tetrahedron Letters.'], ['Thieme', 'Thieme lists Synthesis and Synlett.'], ['The American Chemical Society', 'ACS lists JACS, JOC, Org. Lett., Chem. Rev. and Inorg. Chem.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-a-citation', week: W, chunk: 'fw-lit', skill: 'fw.journals', skillName: 'Journals, paper types and citations', source: 'Manual p.27', diff: 2,
  items: [
    { stem: 'Which element must NOT appear in an ACS-format citation of a chemistry journal paper as CM2061 uses it?',
      right: ['The title of the paper', 'Chemistry journals (almost always) omit the paper title; biologists usually include it.'],
      wrong: [['The first page number', 'The first page is required.'], ['The year', 'The year is required (in bold).'], ['The volume', 'The volume is required (in italics), where the journal has one.']] },
    { stem: 'Which reference is acceptable in a CM2061 lab report?',
      right: ['Hegedus, L. S.; Bates, R. W.; Soderberg, B. C. J. Am. Chem. Soc. 1991, 113, 923-927', 'It cites a journal paper with authors (family name, initials), abbreviated journal, year, volume and pages.'],
      wrong: [['https://www.nobelprize.org/prizes/chemistry/1912/summary/', 'Citations must be to journals, not web pages.'], ['Hegedus; Bates; Soderberg. J. Am. Chem. Soc. 113 (3), 1991.', 'It lacks initials and pages, and quotes an issue number the format does not need.'], ['Wikipedia, "Grignard reagent", retrieved last week.', 'A web page, not a journal paper; the manual says no www.']] },
    { stem: 'In the citation format, how are the authors written?',
      right: ['Family name then initials, authors separated by semicolons, no comma before the journal', 'The example reads "Hegedus, L.S.; Bates, R.W.; Soderberg, B.C. J. Am. Chem. Soc."'],
      wrong: [['Initials then family name, separated by commas', 'The order is family name first, and semicolons separate authors.'], ['First author only, then "et al."', 'The manual\'s example lists all authors.'], ['Full first names in alphabetical order', 'The format uses initials, in the order they appear on the paper.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-a-databases', week: W, chunk: 'fw-lit', skill: 'fw.databases', skillName: 'Databases and searching the literature', source: 'Manual p.28', diff: 2,
  items: [
    { stem: 'You need all papers by a named author on a particular topic. Which NTU resource is suited, and why?',
      right: ['Scopus, which searches by author and keyword but cannot search by molecule', 'The manual says Scopus finds particular authors and topics, not molecules.'],
      wrong: [['Scopus, because it lets you draw a structure to search', 'It cannot search for molecules; Reaxys and SciFinder can.'], ['A general web search, because it is faster', 'Search engines cover the whole internet and can return wrong chemistry (the lead styphnate example).'], ['The Dictionary of Organic Compounds, which indexes every paper', 'It lists only a few thousand compounds and is not a paper index.']] },
    { stem: 'Which statement about Reaxys is correct?',
      right: ['It is the online Beilstein (organic) and Gmelin (inorganic) database and allows structure drawing as a search', 'The manual presents Reaxys as the German-origin counterpart to SciFinder, good for molecules and reactions.'],
      wrong: [['It is the American Chemical Society\'s abstract service', 'That description fits SciFinder (the CAS database), not Reaxys.'], ['It cannot search for reactions', 'It is "very useful for finding particular molecules and reactions".'], ['It holds only a few thousand organic compounds', 'That is the size of the Chapman and Hall dictionaries on chemnetbase, not Reaxys.']] },
    { stem: 'In the chemnetbase dictionaries, how should a molecular formula be written to find a compound by formula?',
      right: ['C first, then H, then all other elements alphabetically (p-toluenesulfonyl chloride: C7H7ClO2S)', 'This is the stated rule: C, then H, then everything else in alphabetical order.'],
      wrong: [['In the usual chemical order, e.g. C7H7SO2Cl', 'The database expects the strict ordering, not the way the formula is drawn.'], ['All elements alphabetically, including C and H', 'C and H come first regardless of the alphabet.'], ['Heaviest element first, e.g. SClO2C7H7', 'Mass order is not used.']] },
    { stem: 'Which formula is in the order chemnetbase wants?',
      right: ['C6H5Br for bromobenzene', 'C, H, then Br alphabetically.'],
      wrong: [['BrC6H5', 'Br must not come first.'], ['C6BrH5', 'H comes immediately after C.'], ['H5C6Br', 'C comes first.']] },
    { stem: 'Which resource is described as NTU\'s subscription version of Chemical Abstracts?',
      right: ['SciFinder', 'Chemical Abstracts (from 1907) was computerised; NTU subscribes to the version called SciFinder.'],
      wrong: [['Scopus', 'Scopus searches authors and topics and is not Chemical Abstracts.'], ['Reaxys', 'Reaxys is the Beilstein/Gmelin database, a different (German) service.'], ['chemnetbase', 'It hosts the Chapman and Hall dictionaries.']] },
  ],
}));

export default items;
