/* Chunk C: IR and 1H NMR (Manual pp.15-23, footnotes 1-10). Week 3. Concept MCQs; the NMR predictor and IR drills come in stage 2. */
import { mcq, mcqSet, mcqMulti } from './lib.mjs';

const W = 3;
const items = [];
const add = (x) => items.push(x);
const S = (id, name, chunk) => ({ week: W, chunk, skill: id, skillName: name });

// ---- IR -------------------------------------------------------------------------------------------------
const nuj = S('sp.ir-nujol', 'IR of solids: the nujol bands', 'sp-ir');
add(mcq({
  id: 'bk-c61-c-nujol-bands', ...nuj, source: 'Manual p.15',
  stem: 'Solids are run in IR as a nujol mull. Which absorptions in your spectrum come from the nujol itself and should be ignored?',
  right: ['The C-H stretches near 2920 and 2850 cm⁻¹ and the C-H bends near 1460 and 1377 cm⁻¹', 'Nujol is a mineral oil (long-chain alkanes), so these four strong bands appear in every mull spectrum.'],
  wrong: [['A broad band at 3300 cm⁻¹ and a sharp band at 1700 cm⁻¹', 'Those are O-H and C=O regions; nujol has no such groups, so any band there is your sample\'s.'], ['Bands at 2250 and 1650 cm⁻¹', 'Nujol, a saturated hydrocarbon, absorbs at neither.'], ['The whole region from 4000 to 400 cm⁻¹', 'Nujol absorbs in only a few places; the rest of the spectrum is available for the sample.']],
}));
add(mcq({
  id: 'bk-c61-c-nujol-only', ...nuj, source: 'Manual p.15',
  stem: 'A student\'s mull spectrum shows only strong bands at about 2920, 2850, 1460 and 1377 cm⁻¹ and nothing else. What should they do?',
  right: ['Re-record the spectrum with a better sample, because too much nujol (or too little sample) was used', 'The manual says that seeing only the nujol peaks means you used too much nujol, and the spectrum must be recorded again.'],
  wrong: [['Report the compound as a long-chain alkane', 'The bands are the mulling oil, not the sample.'], ['Print it and note that the sample has no functional groups', 'A sample with no bands means the sample was not in the beam, not that it has no groups.'], ['Subtract the bands and hand in a spectrum with a gap', 'The spectrum must be re-recorded rather than edited.']],
}));
add(mcq({
  id: 'bk-c61-c-ir-flip', ...nuj, source: 'Manual p.15',
  stem: 'Your IR spectrum has peaks pointing up instead of down. What does the manual advise?',
  right: ['Correct the problem first and then print it; do not waste paper on a spectrum that looks wrong', 'Upward peaks (or only nujol bands) mean something is wrong with the measurement.'],
  wrong: [['Print it anyway and explain it in the report', 'The manual says not to print a wrong-looking spectrum.'], ['Turn the page upside down and use it as it is', 'The spectrum should be recorded correctly instead.'], ['Ask the TA to draw the missing bands by hand', 'Spectra must be real data.']],
}));
add(mcqSet({
  id: 'bk-c61-c-ir-bands', ...S('sp.ir-bands', 'IR: group frequencies you must know', 'sp-ir'), source: 'Year-1 IR correlation (standard tables); 2015 paper style', beyond: true, diff: 2,
  items: [
    { stem: 'A product is a saturated carboxylic acid with long CH₂ chains and no C=C. In which of these regions would it NOT show a band?',
      right: ['1620-1680 cm⁻¹ (C=C)', 'There is no C=C; the acid O-H (very broad, 2500-3300), C-H (2850-2960) and C=O (1700-1725) are all present.'],
      wrong: [['2500-3300 cm⁻¹ (broad O-H)', 'The carboxylic acid O-H gives a very broad band here.'], ['2850-2960 cm⁻¹ (C-H)', 'All saturated chains show C-H stretches here.'], ['1700-1725 cm⁻¹ (C=O)', 'The acid C=O absorbs here.']] },
    { stem: 'At which frequency would benzoic acid show its strong C=O stretch?',
      right: ['About 1690 cm⁻¹', 'Conjugation with the aromatic ring lowers the C=O frequency from about 1710-1725 cm⁻¹ (saturated acid dimer) to about 1685-1690 cm⁻¹.'],
      wrong: [['About 1740 cm⁻¹', 'That is typical of a saturated ester; hydrogen-bonded acid dimers absorb lower, and conjugation lowers it further.'], ['About 1715 cm⁻¹', 'This is a saturated acid; conjugation lowers it further.'], ['About 1600 cm⁻¹', 'That is the aromatic C=C region, not the carbonyl.']] },
    { stem: 'Which functional group gives a broad, strong absorption between about 2500 and 3300 cm⁻¹?',
      right: ['A carboxylic acid O-H (hydrogen-bonded)', 'Acid dimers give a very broad band overlapping the C-H stretches.'],
      wrong: [['A ketone C=O', 'That is a sharp band near 1715 cm⁻¹.'], ['An alkene C=C', 'It gives a weak band near 1650 cm⁻¹.'], ['A nitro group', 'It gives two strong bands near 1530 and 1350 cm⁻¹.']] },
    { stem: 'An aromatic nitro compound is expected to show which pair of strong IR bands?',
      right: ['About 1530 and 1350 cm⁻¹', 'These are the asymmetric and symmetric N-O stretches of Ar-NO₂.'], 
      wrong: [['About 3300 and 1650 cm⁻¹', 'These suggest N-H and an amide C=O.'], ['About 2250 and 2100 cm⁻¹', 'Triple-bond region (nitrile, alkyne).'], ['About 1740 and 1250 cm⁻¹', 'These suggest an ester (C=O and C-O).']] },
    { stem: 'Which IR feature distinguishes a ketone from an alcohol most simply?',
      right: ['A strong sharp C=O band near 1715 cm⁻¹ with no broad O-H band near 3300 cm⁻¹', 'The alcohol shows the reverse: a broad O-H and no C=O.'],
      wrong: [['A band at 2900 cm⁻¹', 'Both have C-H stretches.'], ['A band at 1600 cm⁻¹ only', 'That is the aromatic ring region and not specific to either.'], ['Neither can be distinguished by IR', 'IR separates them clearly.']] },
    { stem: 'Conjugating a ketone C=O to a C=C or an aryl ring changes its IR stretch how?',
      right: ['It lowers the frequency, to about 1650-1685 cm⁻¹ compared with about 1715 cm⁻¹', 'Delocalisation weakens the C=O bond, as seen for dibenzalacetone and acylferrocenes.'],
      wrong: [['It raises it to about 1750 cm⁻¹', 'Raising occurs for strained rings and esters, not conjugation.'], ['It does not change it', 'Conjugation lowers it by 30-60 cm⁻¹.'], ['It makes the band disappear', 'The band stays strong.']] },
  ],
}));

// ---- NMR basics ------------------------------------------------------------------------------------------
const fid = S('sp.fid', 'From FID to spectrum', 'sp-nmr-basics');
add(mcq({
  id: 'bk-c61-c-fid', ...fid, source: 'Manual p.16',
  stem: 'The raw data from the NMR spectrometer is a free induction decay (FID). What is on its x-axis, and what turns it into a spectrum?',
  right: ['Time; a Fourier transform converts it into a spectrum with chemical shift on the x-axis', 'The FID is a time-domain signal; the transform gives the frequency-domain spectrum.'],
  wrong: [['Chemical shift; a baseline correction is all it needs', 'The FID has time, not shift, on the axis.'], ['Frequency in Hz; integration turns it into a spectrum', 'Integration measures peak areas; the Fourier transform is the conversion.'], ['Temperature; a calibration curve converts it', 'No temperature axis is involved.']],
}));
add(mcq({
  id: 'bk-c61-c-print', ...fid, source: 'Manual p.16',
  stem: 'What must be submitted with a lab report for an NMR spectrum?',
  right: ['The spectrum limited to the normal range (0-10 or 0-8 ppm) and expansions of the peaks of interest to show splitting', 'Expansions are needed whenever splitting patterns must be examined.'],
  wrong: [['Only the raw FID', 'The FID is unprocessed; the processed spectrum is required.'], ['Only a table of shifts, without the spectrum', 'The printed spectra are submitted with the report.'], ['A hand-drawn sketch of the spectrum', 'Real, printed data are required.']],
}));
const spin = S('sp.spin', 'Spin states and nuclei', 'sp-nmr-basics');
add(mcqSet({
  id: 'bk-c61-c-spin', ...spin, source: 'Manual p.16 and footnote 1; p.23', diff: 2,
  items: [
    { stem: 'How many spin orientations does a proton (¹H) have in a magnetic field?',
      right: ['Two', 'The proton has spin 1/2: aligned with or against the applied field, with a small energy gap.'],
      wrong: [['Three', 'Three orientations belong to deuterium (spin 1).'], ['One', 'With a single state there would be no transitions to observe.'], ['Zero', 'A nucleus with no orientations, like ¹²C, cannot be studied.']] },
    { stem: 'How many spin orientations does deuterium (²H) have?',
      right: ['Three', 'Deuterium has spin 1, giving 2I + 1 = 3 orientations.'],
      wrong: [['Two', 'That is the proton.'], ['One', 'No nucleus with spin has just one orientation.'], ['Four', 'Not for a spin-1 nucleus.']] },
    { stem: 'Why can carbon-12 not be studied by NMR?',
      right: ['Its nucleus has no spin, so there are no orientations in a field', 'Only nuclei with spin give an NMR signal; ¹³C, ¹⁹F and ³¹P do.'],
      wrong: [['It has too many electrons', 'The number of electrons is irrelevant; the nucleus must have spin.'], ['It is too heavy to be affected by a magnetic field', 'Mass is not the issue.'], ['It always forms bonds that cancel its signal', 'Nothing cancels; there is simply no signal to cancel.']] },
    { stem: 'Which nuclei can be studied by NMR, according to the manual?',
      right: ['Any nucleus with spin, for example ¹³C, ¹⁹F and ³¹P (as well as ¹H)', 'The manual lists these three as other nuclei.'],
      wrong: [['Only ¹H', 'Other nuclei with spin work too.'], ['Only elements with an odd number of protons', 'The rule is nuclear spin, not proton parity as such.'], ['¹²C and ¹⁶O', 'These have no nuclear spin.']] },
  ],
}));
add(mcq({
  id: 'bk-c61-c-freq', ...S('sp.field', 'Field strength and frequency', 'sp-nmr-basics'), source: 'Manual pp.16-17 and footnote 4',
  stem: 'The CBC NMR spectrometers run at 300, 400 and 500 MHz. Which machine has the most powerful magnet?',
  right: ['The 500 MHz machine', 'The higher the frequency, the stronger the magnet.'],
  wrong: [['The 300 MHz machine', 'It has the weakest magnet of the three.'], ['They are all the same; frequency is set by the software', 'The frequency is set by the magnet strength.'], ['The 400 MHz machine, because it is the most common', 'Numbers of machines do not rank their field.']],
}));
add(mcq({
  id: 'bk-c61-c-ppm', ...S('sp.field', 'Field strength and frequency', 'sp-nmr-basics'), source: 'Manual p.17 and footnote 4',
  stem: 'Why is NMR chemical shift quoted in ppm (δ) and not in Hz?',
  right: ['δ is the same on every spectrometer, whereas a shift in Hz would depend on the magnet', 'The protons of acetone come at δ 2.1 on every machine.'],
  wrong: [['Hz cannot be measured on an NMR spectrometer', 'Frequencies are measured; they are simply machine-dependent.'], ['ppm is a more accurate unit', 'Accuracy is not the reason; independence from the machine is.'], ['To make the TMS peak positive', 'TMS is defined as zero.']],
}));
add(mcqSet({
  id: 'bk-c61-c-delta', ...S('sp.delta', 'The δ scale, TMS and τ', 'sp-nmr-basics'), source: 'Manual p.17 and footnotes 3-4', diff: 2,
  items: [
    { stem: 'Which compound defines δ = 0 in ¹H NMR?',
      right: ['Tetramethylsilane, Me₄Si', 'Zero is arbitrarily set as the shift of the protons in TMS.'],
      wrong: [['Silicon tetrahydride', 'It is not the reference compound.'], ['Trimethylsilanol', 'It carries an OH and is not the standard.'], ['Tetramethoxysilane', 'The reference has methyl groups on silicon, not methoxy groups.']] },
    { stem: 'In which direction is chemical shift plotted along the δ axis?',
      right: ['From right to left, so the highest δ is on the left (downfield)', 'Zero (TMS) is at the right (upfield).'],
      wrong: [['From left to right, with zero on the left', 'That is how the old τ scale ran.'], ['In both directions, depending on the machine', 'The convention is fixed.'], ['It is not plotted; only the intensities are plotted', 'Position along the axis is the chemical shift.']] },
    { stem: 'The old τ scale is related to δ by:',
      right: ['δ = 10 − τ', 'τ runs left to right, with TMS at 10.'],
      wrong: [['δ = τ', 'The two scales run in opposite directions.'], ['δ = 10 + τ', 'The sign is reversed.'], ['δ = 1/τ', 'The relation is linear, not reciprocal.']] },
    { stem: 'A proton signal appears at τ 2.7 on an old spectrum. What is its δ?',
      right: ['δ 7.3', 'δ = 10 − 2.7 = 7.3, the aromatic region.'],
      wrong: [['δ 2.7', 'τ and δ are different scales.'], ['δ 12.7', 'This adds instead of subtracting.'], ['δ −7.3', 'The two scales do not differ by a sign.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c-solvent', ...S('sp.solvent', 'Deuterated solvents and the residual peak', 'sp-nmr-basics'), source: 'Manual p.21 footnote 9', diff: 2,
  items: [
    { stem: 'A spectrum recorded in CDCl₃ has a small singlet at δ 7.26. What is it?',
      right: ['Residual CHCl₃ in the solvent, since CDCl₃ is not 100% deuterated', 'The solvent is deuterated so its protons do not swamp the spectrum, but a trace of CHCl₃ remains.'],
      wrong: [['A benzene ring in your product', 'A small singlet at exactly the solvent position is most likely the solvent signal, not your compound.'], ['Tetramethylsilane', 'TMS appears at δ 0.'], ['Water', 'Water appears at a different shift (about 1.6 in CDCl₃).']] },
    { stem: 'Why are NMR spectra recorded in deuterated solvents?',
      right: ['So that the solvent protons do not swamp the signals of the dilute sample', 'Solutions are dilute, so ordinary solvent would give an enormous peak.'],
      wrong: [['Because deuterium couples to every proton', 'Deuterium is not seen in a ¹H spectrum.'], ['To lower the boiling point of the sample', 'Deuteration does not do this.'], ['Because normal solvents react with the magnet', 'There is no such reaction; it is a signal issue.']] },
    { stem: 'Which of these is a deuterated solvent named in the manual?',
      right: ['d₆-DMSO', 'The manual lists D₂O, d₆-DMSO, d₆-acetone, d₆-benzene and d₄-methanol as other deuterated solvents.'],
      wrong: [['Carbon disulfide', 'It is not a listed NMR solvent here.'], ['Hexane (ordinary)', 'It would show its own large signals.'], ['Chloroform, ordinary CHCl₃', 'It gives a large solvent peak; the deuterated form CDCl₃ is used.']] },
    { stem: 'Before deuterated solvents were easy to obtain, which solvent was the usual choice, and why did it work?',
      right: ['Carbon tetrachloride, because it contains no hydrogen', 'With no protons, it gave no ¹H signal of its own.'],
      wrong: [['Ordinary water', 'Water gives a big proton signal.'], ['Ordinary hexane', 'It gives its own strong signals.'], ['Diethyl ether', 'It has many protons.']] },
  ],
}));

// ---- chemical shift ---------------------------------------------------------------------------------------
const en = S('sp.shift-en', 'Electronegativity and distance', 'sp-shift');
add(mcqSet({
  id: 'bk-c61-c-shift-en', ...en, source: 'Manual p.18 (CH₃X table)', diff: 2,
  items: [
    { stem: 'Among CH₃I, CH₃Br, CH₃Cl, CH₃OH and CH₃F, which methyl protons come at the highest chemical shift (δ 4.27)?',
      right: ['CH₃F', 'Fluorine is the most electronegative, pulling the most electron density away and deshielding the protons the most.'],
      wrong: [['CH₃I', 'Iodine is the least electronegative of the halogens here, so these protons are the least deshielded (δ 2.16).'], ['CH₃Cl', 'Chlorine deshields less than fluorine (δ 3.06).'], ['CH₃OH', 'Oxygen is less electronegative than fluorine (δ 3.39).']] },
    { stem: 'Why does Me₄Si have a lower δ than any CH₃X where X is more electronegative than silicon?',
      right: ['Silicon is electropositive, so it donates electron density and the protons are shielded', 'Electropositive atoms increase shielding, electronegative atoms decrease it.'],
      wrong: [['Silicon is more electronegative than carbon', 'Silicon (1.8) is less electronegative than carbon.'], ['TMS has no protons', 'It has twelve equivalent protons.'], ['Silicon has a nuclear spin that cancels the signal', 'The cause is shielding, not spin.']] },
    { stem: 'Methyl acetate (an ester, OCH₃ at about δ 3.67) and methanol (δ 3.39): why is the ester methoxy at a higher shift?',
      right: ['The carbonyl group makes the oxygen pull more electron density, so the methyl protons are further deshielded', 'More electronegative character nearby gives a bigger downfield shift.'],
      wrong: [['The ester has more protons', 'The number of protons in the molecule does not set the shift of one environment.'], ['The methanol OH shields the methyl group', 'The OH does not shield; it is the extra electron withdrawal in the ester that matters.'], ['The solvent changes the shift only', 'The difference is a real structural effect.']] },
    { stem: 'In 1-propanol the CH₂ next to oxygen comes at δ 3.49, the middle CH₂ at 1.53 and the CH₃ at 0.93. What does this show?',
      right: ['The deshielding effect of an electronegative atom falls off with distance', 'The effect behaves like the inductive effect: strongest on the nearest protons.'],
      wrong: [['The CH₃ is closest to the oxygen', 'It is the farthest, which is why it is the most shielded.'], ['Electronegative atoms increase shielding at a distance', 'The opposite: the effect decreases but is still deshielding.'], ['All three environments are equivalent', 'They give three different shifts.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c-additive', ...S('sp.shift-add', 'Additive shift effects', 'sp-shift'), source: 'Manual p.19 (CH₃Cl, CH₂Cl₂, CHCl₃)', diff: 3,
  items: [
    { stem: 'CH₃Cl, CH₂Cl₂ and CHCl₃ have shifts of 3.06, 5.33 and 7.24. What principle does this illustrate?',
      right: ['Deshielding effects of electronegative atoms add up with each extra chlorine', 'Each additional Cl on the carbon moves the proton further downfield.'],
      wrong: [['Each chlorine shields the remaining protons', 'Shielding would lower δ; the values rise.'], ['Chemical shift is independent of substitution', 'It clearly depends on it.'], ['Coupling to chlorine moves the signal', 'Chlorine does not couple to protons here; the shift change is an inductive effect.']] },
    { stem: 'Which proton comes at the highest δ?',
      right: ['The H in CHCl₃', 'It has three chlorines, giving the largest cumulative deshielding (δ 7.24).'],
      wrong: [['The H in CH₃Cl', 'It has only one chlorine (δ 3.06).'], ['The H in CH₂Cl₂', 'It has two chlorines (δ 5.33).'], ['They are the same', 'The shifts differ by several ppm.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c-ring', ...S('sp.ring', 'Ring currents and [18]annulene', 'sp-shift'), source: 'Manual pp.18-19', diff: 3,
  items: [
    { stem: 'Why do benzene protons resonate at δ 7.26 whereas cyclohexane protons are at about 1.44?',
      right: ['The applied field induces a ring current in the π electrons, which reinforces the field at the protons outside the ring and deshields them', 'Outside the ring the induced field is parallel to the applied field.'],
      wrong: [['Benzene has more electronegative atoms', 'It has none; the difference is the π system.'], ['Cyclohexane protons are close to carbon and so shielded by the nucleus', 'Both have C-H bonds; the π ring current explains the shift difference.'], ['Benzene is a liquid and cyclohexane a gas', 'Physical state is unrelated to the effect.']] },
    { stem: 'In [18]annulene the outer protons come at δ +9 and the inner protons at δ −3. What explains the inner protons?',
      right: ['Inside the ring the induced field opposes the applied field, so the inner protons are strongly shielded', 'This is the corollary of the ring current: field lines run opposite inside the ring.'],
      wrong: [['The inner protons are attached to electronegative atoms', 'All protons are on carbon; the cause is the ring current.'], ['The inner protons are exchanging with solvent', 'They are C-H protons and do not exchange.'], ['They are deuterated', 'Nothing is deuterated in the question.']] },
    { stem: 'At -100 °C the axial and equatorial protons of cyclohexane come at 1.1 and 1.6 ppm, but at room temperature a single signal appears at 1.44. Why?',
      right: ['The ring flips so fast at room temperature that the spectrometer sees a time-averaged signal', 'Axial and equatorial protons interconvert faster than the NMR timescale, so one averaged signal appears.'],
      wrong: [['At room temperature the axial and equatorial protons become chemically identical in structure', 'They are still different positions; it is the rapid interconversion that averages them.'], ['The magnet is weaker at room temperature', 'Field strength is fixed; temperature changes the ring-flip rate.'], ['The extra protons come from the solvent', 'The solvent plays no part in the averaging.']] },
    { stem: 'Why is [18]annulene aromatic?',
      right: ['It has 18 π electrons, which fits 4n + 2 with n = 4', 'The annulene shows the ring-current shifts expected of an aromatic system.'],
      wrong: [['It has 18 carbons, which is a multiple of 4n', 'Hückel aromaticity requires 4n + 2 π electrons, not 4n.'], ['It has no π electrons', 'It has a conjugated system of 18 π electrons.'], ['It contains a benzene ring', 'It is a single large ring, not a substituted benzene.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c-regions', ...S('sp.shift-groups', 'Approximate shifts of common proton types', 'sp-shift'), source: 'Manual p.17 (shift scale figure); typical values', diff: 2,
  items: [
    { stem: 'Which of these protons would come at the highest chemical shift?',
      right: ['A carboxylic acid O-H, about δ 12', 'The acidic OH is strongly deshielded and broad.'],
      wrong: [['An aldehyde C-H, about δ 10', 'It is high but lower than the carboxylic acid.'], ['An aromatic C-H, about δ 7', 'It is lower than aldehydes and acids.'], ['A CH₃ next to a C=O, about δ 2.1', 'It is far upfield of those above.']] },
    { stem: 'Put these in increasing order of chemical shift: CH₃C=O, ArH, RCH₂OH, TMS.',
      right: ['TMS < CH₃C=O < RCH₂OH < ArH', 'About 0, 2.1, 3.5 and 7.3 ppm respectively.'],
      wrong: [['ArH < RCH₂OH < CH₃C=O < TMS', 'This is the reverse order.'], ['TMS < RCH₂OH < CH₃C=O < ArH', 'The acetyl methyl (2.1) is below the CH₂OH (3.5).'], ['CH₃C=O < TMS < ArH < RCH₂OH', 'TMS is at zero, the lowest.']] },
    { stem: 'A singlet integrating for three protons appears at δ 3.8 in methyl crotonate. Which group is it?',
      right: ['The OCH₃ of the ester', 'It is the easiest signal to assign: a methyl next to oxygen with no neighbouring protons.'],
      wrong: [['The C4 methyl on the alkene', 'It appears near δ 1.9 and is split.'], ['An alkene proton', 'Alkene protons are near δ 6-7 and integrate for one each.'], ['The residual solvent peak', 'CHCl₃ would be at δ 7.26 and integrate for much less.']] },
  ],
}));

// ---- coupling -----------------------------------------------------------------------------------------------
const npl = S('sp.nplus1', 'The n+1 rule and Pascal ratios', 'sp-coupling');
add(mcqSet({
  id: 'bk-c61-c-nplus1', ...npl, source: 'Manual pp.20-21', diff: 2,
  items: [
    { stem: 'A proton has two equivalent neighbouring protons on the adjacent carbon. What multiplicity will it show?',
      right: ['A triplet (1:2:1)', 'N = 2 neighbours gives N + 1 = 3 lines in the ratio 1:2:1.'],
      wrong: [['A doublet', 'A doublet arises from a single neighbour.'], ['A quartet', 'Three neighbours are needed for a quartet.'], ['A singlet', 'Coupling to neighbouring protons splits the signal.']] },
    { stem: 'The CH proton of isopropanol is next to six equivalent protons. What multiplicity does it show?',
      right: ['A septet (seven lines)', '6 + 1 = 7.'],
      wrong: [['A sextet', 'That would need five neighbours.'], ['A sextuplet of doublets', 'The OH usually exchanges and does not split the CH.'], ['A triplet', 'A triplet needs only two neighbours.']] },
    { stem: 'What is the intensity ratio of the lines of a quartet?',
      right: ['1:3:3:1', 'Pascal\'s triangle gives the line intensities for three equivalent neighbours.'],
      wrong: [['1:2:1', 'That is a triplet.'], ['1:1:1:1', 'That is a doublet of doublets with two different couplings, not a quartet from three equivalent neighbours.'], ['1:4:6:4:1', 'That is a pentet.']] },
    { stem: 'A signal has 5 lines with intensities 1:4:6:4:1. How many equivalent neighbouring protons are there?',
      right: ['Four', 'A pentet means N + 1 = 5, so N = 4.'],
      wrong: [['Five', 'Five neighbours would give a sextet.'], ['Three', 'Three neighbours give a quartet.'], ['Six', 'Six neighbours give a septet.']] },
    { stem: 'An ethyl group (CH₃CH₂-) is attached to something with no hydrogens on the neighbouring atom. What does its ¹H spectrum look like?',
      right: ['A triplet for the CH₃ (coupled to the two protons of the CH₂) and a quartet for the CH₂ (coupled to the three protons of the CH₃), integrating 3:2', 'Each group is split by the other\'s protons.'],
      wrong: [['A quartet for the CH₃ and a triplet for the CH₂', 'The splitting is the other way round: the CH₃ sees two protons, so it is a triplet.'], ['Two singlets integrating 3:2', 'The groups are neighbours and do couple.'], ['A single peak integrating 5', 'The CH₃ and CH₂ protons are in different environments.']] },
  ],
}));
add(mcq({
  id: 'bk-c61-c-equiv-coupling', ...S('sp.equiv', 'Equivalence and coupling', 'sp-integral'), source: 'Manual p.20',
  stem: 'The ¹H NMR of 1,2-dichloroethane is a singlet but 1-bromo-2-chloroethane shows two triplets. Why?',
  right: ['Coupling is seen only between chemically non-equivalent protons; in ClCH₂CH₂Cl all four protons are equivalent, in ClCH₂CH₂Br the two CH₂ groups differ', 'In the second molecule each CH₂ is split into a triplet by the other.'],
  wrong: [['Bromine couples to protons but chlorine does not', 'Halogen coupling to H is not what is being seen here.'], ['Dichloroethane has fewer protons', 'Both have four protons.'], ['The spectrometer cannot split a four-proton signal', 'The instrument can; the protons are simply equivalent and do not split each other.']],
}));
add(mcqSet({
  id: 'bk-c61-c-equiv-count', ...S('sp.equiv', 'Equivalence and coupling', 'sp-integral'), source: 'Manual p.20 and footnote 10; counting by symmetry', diff: 3,
  items: [
    { stem: 'How many different proton signals does the ¹H NMR of methyl crotonate (CH₃CH=CHCO₂CH₃) show?',
      right: ['Four', 'OCH₃, the C4 methyl, H2 and H3 are four distinct environments.'],
      wrong: [['Two', 'The alkene protons and both methyls are in different environments.'], ['Three', 'H2 and H3 are different, so there are four, not three.'], ['Seven', 'Equivalent protons within a methyl count once.']] },
    { stem: 'Diisopropyl ether and 2-chloropropane both show methyl and methine signals. What does integration give for each?',
      right: ['Both give a 6:1 ratio (12:2 for the ether), so integration alone cannot tell them apart', 'The manual points out that both show a 6:1 pattern; their shifts and the number of protons differ.'],
      wrong: [['3:1 for the ether and 6:1 for the chloride', 'Both have two methyls on each isopropyl group, giving 6:1.'], ['1:1 for both', 'Methyl and methine integrate 6:1.'], ['The ether shows a single peak', 'It has two distinct environments.']] },
    { stem: 'Which molecule shows a single ¹H NMR signal?',
      right: ['Neopentane, C(CH₃)₄', 'All twelve protons are equivalent, so there is a single singlet.'],
      wrong: [['1-Bromo-2-chloroethane', 'Two different CH₂ groups give two triplets.'], ['Methyl crotonate', 'Four different environments.'], ['Isopropanol', 'The methyls, the CH and the OH are different.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c-j', ...S('sp.J', 'Coupling constants: size and geometry', 'sp-coupling'), source: 'Manual p.21 (J ranges) and p.19 footnote 6 (long-range coupling)', diff: 3,
  items: [
    { stem: 'Two alkene protons on a 1,2-disubstituted double bond are cis. What range of coupling constant is typical, according to the manual?',
      right: ['About 10-12 Hz', 'The manual gives about 10-12 Hz for cis and often 15-18 Hz for trans.'],
      wrong: [['About 15-18 Hz', 'That is the trans range.'], ['About 0-1 Hz', 'That is the size of a weak long-range coupling, not a cis vicinal coupling.'], ['About 40 Hz', 'H-H couplings do not reach that size.']] },
    { stem: 'A 1,2-disubstituted alkene shows J = 16 Hz between its two alkene protons. What geometry does it have?',
      right: ['Trans (E)', 'Trans couplings are larger, 15-18 Hz; cis is about 10-12 Hz.'],
      wrong: [['Cis (Z)', 'Cis couplings are smaller (about 10-12 Hz).'], ['Geminal', 'The two protons are on different carbons.'], ['It cannot be told from J', 'J is the standard way to tell them apart.']] },
    { stem: 'Over how many bonds does coupling usually occur between protons?',
      right: ['Two or three bonds (²J or ³J)', 'Coupling through more bonds (long range) is less common.'],
      wrong: [['Only through one bond', 'Protons are not directly bonded to each other.'], ['Always through six or more bonds', 'Coupling falls off quickly with distance.'], ['Through space only, never through bonds', 'The coupling in the manual is transmitted through bonds.']] },
    { stem: 'Which of these is an example of long-range coupling given in the manual?',
      right: ['Allylic coupling in alkenes and meta coupling in aromatics (both ⁴J)', 'Both are four-bond couplings; alkynes can show ⁴J or ⁵J.'],
      wrong: [['Geminal coupling in CH₂', 'That is ²J, a two-bond coupling.'], ['Vicinal coupling in an ethyl group', 'That is ³J, the normal case.'], ['Coupling between ¹²C and ¹H', '¹²C has no spin.']] },
    { stem: 'What is the possible range of ¹H-¹H coupling constants stated in the manual?',
      right: ['0 to 18 Hz', 'Couplings are never much larger than this.'],
      wrong: [['0 to 1 Hz', 'Many couplings are much larger.'], ['50 to 500 Hz', 'These are far outside the range.'], ['They are the same for all protons', 'J depends on the geometry and the bonds between the protons.']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c-dq', ...S('sp.dq', 'Reading a multiplet: methyl crotonate', 'sp-coupling'), source: 'Manual pp.21-22 (methyl crotonate)', diff: 4,
  items: [
    { stem: 'In methyl crotonate (CH₃-CH=CH-CO₂CH₃), H3 is next to both H2 and the C4 methyl. What does its signal look like?',
      right: ['A doublet of quartets (dq): a doublet from H2 and a quartet from the three methyl protons', 'The two couplings differ, so the splittings are analysed step by step.'],
      wrong: [['A triplet', 'H3 has two different kinds of neighbour, so a simple triplet is not expected.'], ['A doublet of doublets (dd)', 'That would mean only two single-proton neighbours; the three methyl protons give a quartet, not a doublet.'], ['A singlet', 'H3 has neighbours and must be split.']] },
    { stem: 'H2 of methyl crotonate is also a doublet of quartets. What causes the small quartet?',
      right: ['Long-range (allylic) coupling to the three protons of the C4 methyl', 'The allylic coupling is small, so the quartet lines are close together.'],
      wrong: [['Coupling to the OCH₃ protons', 'They are too many bonds away and separated by the ester.'], ['Coupling to the solvent', 'Solvent coupling is not seen in this way.'], ['Coupling to the ¹³C nucleus', '¹³C is only 1% abundant and gives tiny satellites, not a quartet.']] },
    { stem: 'The C4 methyl group of methyl crotonate appears as a doublet of doublets (dd). Which couplings are involved?',
      right: ['A larger coupling to H3 (three bonds) and a smaller allylic coupling to H2 (four bonds)', 'The two different one-proton neighbours give two different splittings.'],
      wrong: [['Coupling to both OCH₃ protons', 'The OCH₃ is a distant singlet.'], ['Coupling to the three protons on itself', 'Equivalent protons do not couple to each other.'], ['Coupling to the carbonyl carbon', 'No proton-carbon coupling is observed here.']] },
    { stem: 'In what ratio do the integrals of H3, H2, the C4 methyl and the OCH₃ of methyl crotonate fall (from low field to high field: H3, H2, OCH₃, C4-CH₃)?',
      right: ['1 : 1 : 3 : 3', 'Integrals count protons: one each for the alkene protons and three each for the two methyls (the manual\'s integrated spectrum reads about 1.0 : 1.0 : 3.2 : 3.0).'],
      wrong: [['1 : 1 : 2 : 2', 'A methyl group has three protons, not two.'], ['3 : 3 : 1 : 1', 'This reverses the order; the alkene protons are the single-proton signals.'], ['1 : 1 : 1 : 1', 'Methyl signals are three times larger than single-proton signals.']] },
  ],
}));
add(mcq({
  id: 'bk-c61-c-integral-def', ...S('sp.integral', 'Integration and mixtures', 'sp-integral'), source: 'Manual p.22 and footnote 10',
  stem: 'What does the integral of a ¹H NMR signal tell you?',
  right: ['The relative number of protons giving that signal (a ratio, not an absolute count)', 'Each proton emits in the same way, so signal size is proportional to the number of protons.'],
  wrong: [['The number of neighbouring protons', 'That comes from the splitting pattern.'], ['The absolute number of protons in the molecule', 'Integrals form ratios; you scale them with a known group.'], ['The coupling constant', 'J comes from the line spacing.']],
}));
add(mcq({
  id: 'bk-c61-c-mixture', ...S('sp.integral', 'Integration and mixtures', 'sp-integral'), source: 'Manual p.22 footnote 10', diff: 3,
  stem: 'A mixture of compound A and compound B shows an A singlet (3H per molecule) of integral 6.0 and a B singlet (1H per molecule) of integral 2.0. What is the A:B mole ratio?',
  right: ['1:1', 'Normalise per proton: A gives 6.0/3 = 2.0 and B gives 2.0/1 = 2.0, so they are present in equal amounts.'],
  wrong: [['3:1', 'This compares raw integrals without dividing by the number of protons each represents.'], ['1:3', 'This divides in the wrong direction.'], ['6:1', 'The integrals have not been normalised per proton.']],
}));
add(mcqSet({
  id: 'bk-c61-c-exch', ...S('sp.exch', 'Exchangeable protons (OH, NH)', 'sp-integral'), source: 'Manual p.22 (exchange); p.17 (shift chart, acid OH near 12)', diff: 2,
  items: [
    { stem: 'Why do OH and NH protons often appear as broad singlets with no visible coupling?',
      right: ['They exchange rapidly between molecules, often faster than the NMR timescale', 'Rapid exchange averages out the coupling and broadens the signal.'],
      wrong: [['They have no neighbouring protons', 'Many do; exchange is the reason they are not seen coupling.'], ['Oxygen and nitrogen have spin 1/2 and decouple them', 'The explanation is proton exchange.'], ['They resonate at exactly the same position as TMS', 'They appear at variable positions, often downfield.']] },
    { stem: 'The same OH proton is seen at different chemical shifts in different samples of the same compound. Why?',
      right: ['It exchanges with other OH groups and traces of water, so its position depends on concentration, solvent and water content', 'This variability is a hallmark of exchangeable protons.'],
      wrong: [['The spectrometer has drifted between samples', 'Drift is small and would affect all signals equally.'], ['The compound has changed structure between samples', 'The structure is the same; the environment of the OH varies.'], ['OH protons have random shifts that carry no information', 'They are informative, just variable.']] },
    { stem: 'Which signal in a ¹H spectrum is most likely to be a broad singlet near δ 12?',
      right: ['A carboxylic acid O-H', 'Acid protons are strongly deshielded and exchange.'],
      wrong: [['An aromatic C-H', 'It is sharp and near 7-8.'], ['A methyl on a ring', 'It is sharp and near 2.3.'], ['An aldehyde C-H', 'It gives a sharper signal near 10 (and may be a doublet or singlet).']] },
  ],
}));
add(mcqSet({
  id: 'bk-c61-c-hzppm', ...S('sp.field', 'Field strength and frequency', 'sp-nmr-basics'), source: 'Manual pp.16-17, footnote 4; Hz/ppm arithmetic', diff: 3,
  items: [
    { stem: 'A doublet has two lines 7.0 Hz apart. On a 300 MHz spectrometer, how far apart are they in δ?',
      right: ['0.023 ppm (7.0 / 300)', 'Divide the separation in Hz by the spectrometer frequency in MHz to get ppm.'],
      wrong: [['7.0 ppm', 'This confuses Hz with ppm.'], ['2100 ppm', 'This multiplies by 300 instead of dividing.'], ['0.0014 ppm', 'This divides by 5000, not by 300.']] },
    { stem: 'The same compound is run at 300 MHz and at 500 MHz. What changes?',
      right: ['Shifts in ppm and J in Hz stay the same, but the signals are spread over more Hz, so the multiplets overlap less', 'δ is independent of the machine; a stronger field spreads the same δ range over more Hz.'],
      wrong: [['The shifts in ppm change, but J does not', 'Both δ and J are field-independent.'], ['J in Hz increases in proportion to the frequency', 'J is a property of the molecule.'], ['Nothing at all, including the resolution', 'Higher field gives better dispersion.']] },
  ],
}));

export default items;
