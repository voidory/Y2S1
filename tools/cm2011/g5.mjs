import { pick, written, order, node } from './lib.mjs';

/* GC and HPLC, week 10 of the app. Written for the final: the second-half final asks descriptive questions
   (detectors, columns, temperature programming, isocratic vs gradient, reversed-phase order, GC-MS vs LC-MS), one point per mark.
   Sources: the combined Topic 4 teaching deck (HPLC and GC slides) and the 2025/26 final Q4. Rubric points are in our own words. */
const SRC = 'GC and HPLC slides; final Q4 style';
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });
const THEME_GC = 'Gas chromatography';
const THEME_LC = 'Liquid chromatography';
const WEEK = 10;
const mk = (extra) => ({ week: WEEK, source: SRC, ...extra });

/* ---------- GC detectors ---------- */
add(node(mk({
  id: 'bk-m11-g-detectors', title: 'GC detectors: TCD, FID and MS', theme: THEME_GC, tags: ['gc', 'detectors'], family: 'gc-detect', mins: 6,
  variants: [
    written({
      id: 'g-tcd', label: 'TCD principle (3 marks)',
      stem: 'Describe the principle of the **thermal conductivity detector (TCD)** used in gas chromatography.',
      explanation: 'A heated filament sits in the gas leaving the column. Helium carries heat away from it at a steady rate. When an analyte elutes, the thermal conductivity of the gas changes, so the filament temperature and resistance change (a Wheatstone bridge goes out of balance) and that is the signal. The TCD responds to almost any compound, does not destroy the sample, and is less sensitive than the FID.',
      items: [
        ['A heated filament sits in the gas leaving the column; the carrier gas (usually helium, a good heat conductor) carries heat away at a steady rate', 1, true],
        ['When an analyte elutes, the thermal conductivity of the gas changes, so the filament temperature and resistance change (Wheatstone bridge unbalanced) and this is the signal', 1, true],
        ['Near-universal and non-destructive, but less sensitive than the FID', 1],
      ],
    }),
    written({
      id: 'g-fid', label: 'FID principle (3 marks)',
      stem: 'Describe the principle of the **flame ionisation detector (FID)** used in gas chromatography.',
      explanation: 'The column effluent is burned in a hydrogen–air flame. Organic compounds form ions in the flame, and the resulting ion current is the signal. The FID is very sensitive to organic compounds (including the small samples from capillary columns) but it destroys the sample.',
      items: [
        ['The column effluent is burned in a hydrogen–air flame', 1, true],
        ['Organic compounds form ions in the flame and the resulting ion current is measured as the signal', 1, true],
        ['Highly sensitive to organic compounds (suits the small samples of capillary columns) but destructive', 1],
      ],
    }),
    written({
      id: 'g-ms', label: 'Mass spectrometer as a detector (3 marks)',
      stem: 'Explain how a **mass spectrometer** works as a GC detector and what it adds compared with the TCD and FID.',
      explanation: 'Molecules from the sample are converted into ions; the ions are separated in the mass analyser by their mass-to-charge ratio (m/z); the detector records each ion signal and the result is a mass spectrum. Unlike the TCD and FID, which only say that something eluted, the spectrum identifies each compound.',
      items: [
        ['Sample molecules are first converted into ions', 1],
        ['The ions are separated in the mass analyser according to their mass-to-charge ratio (m/z)', 1, true],
        ['The signals form a mass spectrum, giving specific identification of each compound (TCD and FID only show that something eluted)', 1],
      ],
    }),
    written({
      id: 'g-choose-det', label: 'Choosing a detector (4 marks)',
      stem: 'One GC analysis must detect **trace hydrocarbons**; another must detect **permanent gases and water** that give no response in a flame. Which detector would you use for each, and why?',
      explanation: 'Trace hydrocarbons: the FID, because it is highly sensitive to organic compounds; destroying the sample does not matter for a trace determination. Permanent gases and water: the TCD, because it responds to almost anything whose thermal conductivity differs from the carrier gas (helium), and it does not destroy the sample, although it is less sensitive.',
      items: [
        ['Trace hydrocarbons: FID', 1, true],
        ['Reason: highly sensitive to organic compounds (ions formed in the flame); destroying the sample is acceptable', 1],
        ['Permanent gases and water: TCD', 1, true],
        ['Reason: near-universal response to anything whose thermal conductivity differs from the carrier gas (helium); non-destructive but less sensitive', 1],
      ],
    }),
  ],
})), { id: 'm11.g.detectors', name: 'GC detectors: TCD, FID, MS and choosing between them', chunk: 'g-detect', marks: 6, tags: ['gc', 'detectors'] });

/* ---------- GC columns ---------- */
add(node(mk({
  id: 'bk-m11-g-columns', title: 'GC columns: open tubular and packed', theme: THEME_GC, tags: ['gc', 'columns'], family: 'gc-column', mins: 6,
  variants: [
    written({
      id: 'g-open-packed', label: 'Open tubular vs packed (5 marks)',
      stem: 'Compare **open tubular (capillary)** and **packed** GC columns in construction and performance, and give **two applications** for which capillary columns are preferred.',
      explanation: 'An open tubular column is a narrow tube with the stationary phase coated on its inner wall and nothing packed inside. A packed column is filled with particles of support coated with liquid phase (or the solid is the phase). Open tubular columns give higher resolution, shorter analysis times and higher sensitivity but hold less sample; packed columns hold more sample but give broader peaks, longer retention and lower resolution. Capillary columns are preferred for complex mixtures that need high resolution and for trace analysis (including GC–MS).',
      items: [
        ['Open tubular: narrow tube with the stationary phase on the inner wall, nothing packed inside', 1],
        ['Packed: tube filled with particles of coated support (or the solid itself is the stationary phase)', 1],
        ['Open tubular: higher resolution, shorter analysis time and higher sensitivity, but lower sample capacity', 1, true],
        ['Packed: higher sample capacity, but broader peaks, longer retention times and lower resolution', 1],
        ['Two applications for capillary columns, for example complex mixtures needing high resolution, and trace analysis (including GC–MS)', 1],
      ],
    }),
    written({
      id: 'g-ot-types', label: 'Kinds of open tubular column (3 marks)',
      stem: 'Name the **three kinds of open tubular column** and say what is on the wall of each.',
      explanation: 'WCOT (wall-coated): a thin film of liquid stationary phase on the inner wall. PLOT (porous layer): a layer of solid particles that is itself the active phase, used for gases so volatile that a liquid film retains them poorly, such as O₂, N₂ and CO. SCOT (support-coated): solid support particles coated with liquid phase and attached to the wall; it holds more sample than WCOT and performs between WCOT and PLOT.',
      items: [
        ['WCOT: a thin film of liquid stationary phase on the inner wall', 1, true],
        ['PLOT: a porous layer of solid particles is the active phase (for very volatile gases such as O₂, N₂, CO)', 1, true],
        ['SCOT: solid support coated with liquid phase attached to the wall; larger sample than WCOT, performance between WCOT and PLOT', 1],
      ],
    }),
    written({
      id: 'g-no-A', label: 'Why no A term (2 marks)',
      stem: 'Why does band spreading by **multiple paths** (the A term of the van Deemter equation) not occur in an open tubular column, and what does that do to efficiency and flow?',
      explanation: 'There are no packed particles, so every molecule follows essentially the same single path along the open tube and the multiple-path term is about zero. Plate height is therefore lower (efficiency higher), and for the same length and pressure the linear flow rate is much higher than in a packed column.',
      items: [
        ['No packing, so there is a single open flow path and the multiple-path (eddy diffusion) term A is essentially zero', 1, true],
        ['So plate height is lower (efficiency higher), and the linear flow for the same length and pressure is much higher than in a packed column', 1],
      ],
    }),
  ],
})), { id: 'm11.g.columns', name: 'Open tubular vs packed GC columns', chunk: 'g-gc', marks: 5, tags: ['gc', 'columns'] });

/* ---------- temperature programming ---------- */
add(node(mk({
  id: 'bk-m11-g-tprog', title: 'Temperature and pressure programming', theme: THEME_GC, tags: ['gc', 'temperature-programming'], family: 'gc-prog', mins: 5,
  variants: [
    written({
      id: 'g-tprog', label: 'Temperature programming (3 marks)',
      stem: 'How does **column temperature programming** affect the separation in gas chromatography?',
      explanation: 'A sample with a wide boiling range cannot be separated well at one temperature: if the oven is cool the heavy compounds are held too long and give broad peaks, and if it is hot the light compounds all leave together. The program starts low to separate the volatile compounds, then raises the temperature (about 5–20 °C/min) so the less volatile compounds gain vapour pressure and elute sooner, and ends with a hold to clean the column. All compounds elute with adequate resolution in a shorter run and the late peaks are sharper.',
      items: [
        ['Problem: a wide boiling range cannot be run well isothermally (cool: heavy compounds retained too long, broad peaks; hot: volatiles bunch together)', 1],
        ['Start low to separate the volatile compounds, then raise the temperature so less volatile compounds gain vapour pressure and elute sooner', 1, true],
        ['Result: every compound elutes with adequate resolution in a shorter run, with sharper late peaks (better sensitivity)', 1],
      ],
    }),
    written({
      id: 'g-tprog-pros', label: 'Advantages, drawbacks, alternative (4 marks)',
      stem: 'Give **two advantages** and **two disadvantages** of temperature programming, and name an alternative that avoids high temperatures.',
      explanation: 'Advantages: compounds with very different boiling points all elute with resolution in a reasonable time, and later peaks are sharper so sensitivity improves (a low starting temperature also focuses the band in splitless or on-column injection). Disadvantages: the baseline can slope because the stationary phase bleeds at high temperature, and the oven needs time to cool between runs. Alternative: pressure programming raises the flow instead, shortening the retention of late peaks without high temperature and so sparing thermally sensitive compounds; it needs a costly high-pressure system.',
      items: [
        ['Advantage: compounds with very different boiling points all elute with resolution in a reasonable time', 1],
        ['Advantage: later peaks are sharper, so sensitivity improves (a low start also focuses the band for splitless or on-column injection)', 1],
        ['Disadvantages: sloping baseline from stationary-phase bleed at high temperature; time needed to cool the oven between runs', 1],
        ['Alternative: pressure programming (higher flow shortens retention of late peaks without heat, sparing thermally sensitive compounds; costly high-pressure pump)', 1],
      ],
    }),
  ],
})), { id: 'm11.g.tprog', name: 'Temperature programming and pressure programming', chunk: 'g-gc', marks: 3, tags: ['gc', 'temperature-programming'] });

/* ---------- injection, derivatisation, carrier gas ---------- */
add(node(mk({
  id: 'bk-m11-g-inject', title: 'GC injection modes and derivatisation', theme: THEME_GC, tags: ['gc', 'injection'], family: 'gc-inject', tier: 'atomic', exam: 'short_2to3', mins: 2,
  variants: [
    pick({
      id: 'g-inj-split', label: 'Concentrated sample', stem: 'A sample is so concentrated that the column would be overloaded. Which injection mode is used?',
      explanation: '**Split** injection sends only a small fraction of the vaporised sample onto the column and vents the rest, which avoids overload and keeps the peaks sharp.',
      options: [['a', 'split injection'], ['b', 'splitless injection'], ['c', 'on-column injection'], ['d', 'none: the sample must be diluted by 100 times first']], correct: 'a',
    }),
    pick({
      id: 'g-inj-splitless', label: 'Trace analyte', stem: 'A trace-level analyte must reach the column with as little loss as possible. Which injection mode is used?',
      explanation: '**Splitless** injection keeps the split vent closed at first so nearly all the vaporised sample enters the column, then opens it to flush out the remaining solvent vapour. That maximises sensitivity for trace analytes.',
      options: [['a', 'splitless injection'], ['b', 'split injection with a high split ratio'], ['c', 'no injection port is needed'], ['d', 'split injection at the lowest temperature']], correct: 'a',
    }),
    pick({
      id: 'g-inj-oncol', label: 'Thermally labile sample', stem: 'A thermally labile, high-boiling compound would decompose in a hot injector. Which injection mode suits it?',
      explanation: '**On-column** injection puts the liquid sample directly onto the cool column, which concentrates the analytes near the entrance; heating the column then starts the separation. Thermal degradation and sample loss are minimal.',
      options: [['a', 'on-column injection'], ['b', 'split injection'], ['c', 'splitless injection'], ['d', 'injection into the detector']], correct: 'a',
    }),
    pick({
      id: 'g-deriv', label: 'Derivatisation', stem: 'A carboxylic acid is not volatile enough for GC. What is the standard remedy?',
      explanation: '**Derivatisation** converts the analyte into a form that is more volatile or easier to detect. A carboxylic acid is converted into its trimethylsilyl ester, which is volatile.',
      options: [['a', 'convert it into a volatile derivative such as the trimethylsilyl ester'], ['b', 'run the oven above 500 °C'], ['c', 'switch the carrier gas to nitrogen'], ['d', 'use a thicker packed column']], correct: 'a',
    }),
  ],
})), { id: 'm11.g.inject', name: 'Split, splitless and on-column injection; derivatisation', chunk: 'g-gc', marks: 2, tags: ['gc', 'injection'] });

add(node(mk({
  id: 'bk-m11-g-carrier', title: 'GC carrier gases', theme: THEME_GC, tags: ['gc', 'carrier-gas'], family: 'gc-carrier', tier: 'atomic', exam: 'short_2to3', mins: 2,
  variants: [
    pick({
      id: 'g-car-order', label: 'Optimum flow', stem: 'Arranged from lowest to highest optimum flow rate, the usual GC carrier gases are:',
      explanation: 'The optimum flow rate rises in the order N₂ < He < H₂, so He and H₂ allow faster analyses than N₂ at the same efficiency.',
      options: [['a', 'N₂ < He < H₂'], ['b', 'H₂ < He < N₂'], ['c', 'He < N₂ < H₂'], ['d', 'all three have the same optimum']], correct: 'a',
    }),
    pick({
      id: 'g-car-h2', label: 'Hydrogen carrier', stem: 'Which statement about hydrogen as a carrier gas matches the updated lecture slides?',
      explanation: 'Hydrogen has a particularly broad, flat van Deemter optimum, so efficient operation at higher linear velocity gives faster analysis. Its drawbacks are that it is flammable and explosive, and GC–MS use needs a compatible instrument and precautions. (The older slide said it simply cannot be used with MS; use the updated wording.)',
      options: [['a', 'broad flat optimum and faster analysis, but flammable; GC–MS needs a compatible instrument'], ['b', 'the slowest of the three carriers'], ['c', 'inert, non-flammable and ideal for every detector'], ['d', 'it cannot be used with an FID']], correct: 'a',
    }),
    pick({
      id: 'g-car-tcd', label: 'Carrier for a TCD', stem: 'Which carrier gas is normally used with a TCD, and why?',
      explanation: 'Helium: its high thermal conductivity gives a large contrast with most analytes, so an eluting compound changes the thermal conductivity of the gas leaving the column and the filament temperature clearly.',
      options: [['a', 'helium, because of its high thermal conductivity'], ['b', 'nitrogen, because it is the cheapest'], ['c', 'air, because it supports the flame'], ['d', 'argon, because it ionises easily']], correct: 'a',
    }),
  ],
})), { id: 'm11.g.carrier', name: 'GC carrier gases: speed, H₂ and the TCD', chunk: 'g-gc', marks: 2, tags: ['gc', 'carrier-gas'] });

/* ---------- HPLC columns and modes ---------- */
add(node(mk({
  id: 'bk-m11-h-column', title: 'HPLC columns: reading the label', theme: THEME_LC, tags: ['hplc', 'columns'], family: 'hplc-column', tier: 'atomic', exam: 'short_2to3', mins: 2,
  variants: [
    pick({
      id: 'h-lab-dim', label: 'Dimensions on the label', stem: 'An HPLC column is labelled **C18, 60 Å, 4 µm, 3.9 × 150 mm**. In the updated lecture, “3.9 × 150 mm” gives:',
      explanation: 'Inner diameter × length: the column is 150 mm long with an inner diameter of 3.9 mm. C18 is the bonded stationary phase, 60 Å the pore size and 4 µm the particle size.',
      options: [['a', 'inner diameter 3.9 mm × length 150 mm'], ['b', 'length 3.9 mm × inner diameter 150 mm'], ['c', 'particle size 3.9 µm and pore size 150 Å'], ['d', 'a pressure rating']], correct: 'a',
    }),
    pick({
      id: 'h-lab-pore', label: 'Pore size', stem: 'Which pore size is chosen for peptides and proteins, compared with small molecules?',
      explanation: 'Small molecules use pores of about 100 Å; peptides and proteins are larger and need pores of about 300 Å so that they can enter.',
      options: [['a', 'about 300 Å for peptides and proteins, about 100 Å for small molecules'], ['b', 'about 100 Å for peptides and proteins, about 300 Å for small molecules'], ['c', 'the same pore size for both'], ['d', 'no pores: peptides need non-porous glass']], correct: 'a',
    }),
    pick({
      id: 'h-c8', label: 'C8 vs C18', stem: 'Replacing a C18 column by a C8 column, with the same mobile phase, will usually give:',
      explanation: 'C8 has shorter (8-carbon) chains, so the stationary phase is less hydrophobic, hydrophobic analytes stick less and retention is generally shorter.',
      options: [['a', 'shorter retention, because C8 is less hydrophobic'], ['b', 'longer retention, because C8 is more polar and more selective'], ['c', 'identical retention'], ['d', 'no retention of non-polar compounds']], correct: 'a',
    }),
    pick({
      id: 'h-guard', label: 'Guard column', stem: 'What is a guard column for?',
      explanation: 'It protects the analytical column from particulate matter and contaminants in the sample and solvents. It has the same packing and stationary phase, but is shorter and cheaper, so it is the part that gets replaced.',
      options: [['a', 'to protect the analytical column: same packing, shorter and cheaper'], ['b', 'to raise the number of plates'], ['c', 'to detect the analytes'], ['d', 'to degas the mobile phase']], correct: 'a',
    }),
    pick({
      id: 'h-silica-ph', label: 'Silica and pH', stem: 'What limits the use of silica-based HPLC columns?',
      explanation: 'Silica has limited stability at high pH, so other support materials are used when a wider pH range is needed.',
      options: [['a', 'silica is unstable at high pH'], ['b', 'silica dissolves in organic solvents'], ['c', 'silica cannot be bonded to alkyl chains'], ['d', 'silica absorbs UV light so no detector can be used']], correct: 'a',
    }),
  ],
})), { id: 'm11.h.column', name: 'HPLC column label, pore size, C8 vs C18, guard column', chunk: 'g-hplc', marks: 2, tags: ['hplc', 'columns'] });

add(node(mk({
  id: 'bk-m11-h-mode', title: 'Normal and reversed phase, eluent strength', theme: THEME_LC, tags: ['hplc', 'reversed-phase'], family: 'hplc-mode', tier: 'atomic', exam: 'short_2to3', mins: 2,
  variants: [
    pick({
      id: 'h-mode-id', label: 'Identify the mode', stem: 'An HPLC column has a **polar** stationary phase (amino or diol groups) and a **non-polar** mobile phase. Which mode is this and which solutes elute first?',
      explanation: 'This is **normal-phase** chromatography. In normal phase the least polar component elutes first, and making the mobile phase more polar increases eluent strength, so solutes elute sooner.',
      options: [['a', 'normal phase; the least polar elutes first'], ['b', 'reversed phase; the most polar elutes first'], ['c', 'normal phase; the most polar elutes first'], ['d', 'reversed phase; the least polar elutes first']], correct: 'a',
    }),
    pick({
      id: 'h-mode-first', label: 'Reversed phase: who elutes first', stem: 'On a C18 column with an aqueous–organic mobile phase, which kind of solute elutes first?',
      explanation: 'Reversed phase has a non-polar stationary phase and a polar mobile phase. The most polar solute interacts least with the C18 chains and spends most of its time in the mobile phase, so it elutes first. Retention rises with hydrophobicity.',
      options: [['a', 'the most polar solute'], ['b', 'the most hydrophobic solute'], ['c', 'the largest solute whatever its polarity'], ['d', 'the solute present at the highest concentration']], correct: 'a',
    }),
    pick({
      id: 'h-mode-strength', label: 'More organic solvent', stem: 'In reversed-phase HPLC the percentage of organic solvent (%B, for example acetonitrile) is increased. What happens?',
      explanation: 'The mobile phase becomes less polar, so its eluent strength rises. Analytes spend less time on the hydrophobic C18 surface and elute sooner, so retention times fall.',
      options: [['a', 'the eluent is stronger and retention times fall'], ['b', 'the eluent is weaker and retention times rise'], ['c', 'retention times are unchanged'], ['d', 'the elution order reverses completely']], correct: 'a',
    }),
  ],
})), { id: 'm11.h.mode', name: 'Normal vs reversed phase and eluent strength', chunk: 'g-hplc', marks: 2, tags: ['hplc', 'reversed-phase'] });

/* ---------- elution order (ordered list) ---------- */
const dir = 'Elution order: first → last';
add(node(mk({
  id: 'bk-m11-h-order', title: 'Elution order in HPLC', theme: THEME_LC, tags: ['hplc', 'elution-order'], family: 'hplc-order', tier: 'atomic', exam: 'short_2to3', mins: 2,
  variants: [
    order({
      id: 'h-ord-final', label: 'Reversed phase: final-paper set', marks: 4, direction: dir,
      stem: 'Put these compounds in the order they elute from a **reversed-phase (C18)** HPLC column: toluene, phenol, butanol, cyclohexane.',
      explanation: 'In reversed phase retention rises with hydrophobicity, so the most polar compound leaves first: **butanol → phenol → toluene → cyclohexane**. Butanol and phenol carry an –OH group, toluene is an aromatic hydrocarbon, and cyclohexane is a saturated hydrocarbon with no polar group.',
      items: [['but', 'butanol'], ['phe', 'phenol'], ['tol', 'toluene'], ['cyc', 'cyclohexane']],
    }),
    order({
      id: 'h-ord-alc', label: 'Reversed phase: alcohols', marks: 4, direction: dir,
      stem: 'Put these alcohols in the order they elute from a **reversed-phase (C18)** column: 1-butanol, ethanol, 1-pentanol, 1-propanol.',
      explanation: 'All four have the same –OH group, so the difference is the length of the hydrocarbon chain. A longer chain is more hydrophobic and interacts more with C18, so retention rises: **ethanol → 1-propanol → 1-butanol → 1-pentanol**.',
      items: [['eth', 'ethanol'], ['pro', '1-propanol'], ['but', '1-butanol'], ['pen', '1-pentanol']],
    }),
    order({
      id: 'h-ord-hal', label: 'Reversed phase: ethyl halides', marks: 4, direction: dir,
      stem: 'Put these ethyl halides in the order they elute from a **reversed-phase (C18)** column: C₂H₅Br, C₂H₅F, C₂H₅I, C₂H₅Cl.',
      explanation: 'Hydrophobicity increases down the halogen series F < Cl < Br < I, so interaction with C18 and retention increase in the same order: **C₂H₅F → C₂H₅Cl → C₂H₅Br → C₂H₅I**.',
      items: [['f', 'C₂H₅F'], ['cl', 'C₂H₅Cl'], ['br', 'C₂H₅Br'], ['i', 'C₂H₅I']],
    }),
    order({
      id: 'h-ord-mix', label: 'Reversed phase: methanol to hexadecane', marks: 4, direction: dir,
      stem: 'Put these in the order they elute from a **reversed-phase (C18)** column: toluene, hexadecane, methanol, acetone.',
      explanation: 'The –OH group makes methanol very polar, the C=O group of acetone is polar but less hydrophilic, toluene has only C and H (an aromatic hydrocarbon), and hexadecane has a long hydrocarbon chain and is the most hydrophobic: **methanol → acetone → toluene → hexadecane**.',
      items: [['meoh', 'methanol'], ['ace', 'acetone'], ['tol', 'toluene'], ['hex', 'hexadecane']],
    }),
    order({
      id: 'h-ord-np-alc', label: 'Normal phase: alcohols', marks: 4, direction: dir,
      stem: 'Put these alcohols in the order they elute from a **normal-phase (polar silica-type)** column: ethanol, 1-pentanol, 1-propanol, 1-butanol.',
      explanation: 'In normal phase the least polar component elutes first. A longer hydrocarbon chain makes the alcohol less polar, so the order is the reverse of reversed phase: **1-pentanol → 1-butanol → 1-propanol → ethanol**.',
      items: [['pen', '1-pentanol'], ['but', '1-butanol'], ['pro', '1-propanol'], ['eth', 'ethanol']],
    }),
    order({
      id: 'h-ord-np-mix', label: 'Normal phase: methanol to hexadecane', marks: 4, direction: dir,
      stem: 'Put these in the order they elute from a **normal-phase (polar silica-type)** column: acetone, methanol, hexadecane, toluene.',
      explanation: 'In normal phase the least polar compound elutes first, so the order is the reverse of reversed phase: **hexadecane → toluene → acetone → methanol**.',
      items: [['hex', 'hexadecane'], ['tol', 'toluene'], ['ace', 'acetone'], ['meoh', 'methanol']],
    }),
  ],
})), { id: 'm11.h.order', name: 'Order of elution in reversed-phase and normal-phase HPLC', chunk: 'g-hplc', marks: 4, tags: ['hplc', 'elution-order'] });

/* ---------- isocratic vs gradient ---------- */
add(node(mk({
  id: 'bk-m11-h-gradient', title: 'Isocratic and gradient elution', theme: THEME_LC, tags: ['hplc', 'gradient'], family: 'hplc-gradient', mins: 4,
  variants: [
    written({
      id: 'h-grad-vs-iso', label: 'Isocratic vs gradient (4 marks)',
      stem: 'Explain the difference between **isocratic** and **gradient** elution in HPLC, and give one advantage of gradient elution.',
      explanation: 'In isocratic elution the mobile-phase composition stays constant. In gradient elution the composition changes during the run, continuously or in steps; in reversed phase this means more organic solvent as the run proceeds, which raises the eluent strength. The advantage is that strongly retained compounds elute sooner, so the run is shorter and late peaks are sharper, and one run copes with a sample that contains both weakly and strongly retained compounds.',
      items: [
        ['Isocratic: the mobile-phase composition is constant throughout the run', 1],
        ['Gradient: the composition is changed during the run, continuously or stepwise (in reversed phase, more organic solvent with time)', 1, true],
        ['Advantage: strongly retained compounds elute sooner, giving a shorter run', 1, true],
        ['Late peaks are sharper, so one run copes with a mixture of weakly and strongly retained solutes', 1],
      ],
    }),
    pick({
      id: 'h-grad-when', label: 'When to use a gradient', stem: 'A sample contains both weakly and strongly retained compounds. A single constant solvent composition would either leave the early peaks unresolved or take very long to elute the last ones. What is the usual solution?',
      explanation: '**Gradient elution**: start with a weaker mobile phase to resolve the early peaks, then increase the eluent strength so the strongly retained compounds leave in reasonable time.',
      options: [['a', 'gradient elution'], ['b', 'a longer isocratic run'], ['c', 'a shorter column only'], ['d', 'switch from HPLC to a TCD']], correct: 'a',
    }),
    pick({
      id: 'h-grad-B', label: 'Reading a gradient', stem: 'In a reversed-phase gradient, mobile phase A is water and B is acetonitrile. As the run proceeds %B rises. Which statement is correct?',
      explanation: 'Raising %B makes the mobile phase less polar, so the eluent strength increases and retained hydrophobic compounds elute sooner.',
      options: [['a', 'the mobile phase becomes less polar and a stronger eluent'], ['b', 'the mobile phase becomes more polar and a stronger eluent'], ['c', 'the eluent strength falls, so retention increases'], ['d', 'the stationary phase changes to normal phase']], correct: 'a',
    }),
  ],
})), { id: 'm11.h.gradient', name: 'Isocratic vs gradient elution, and reading %B', chunk: 'g-hplc', marks: 4, tags: ['hplc', 'gradient'] });

/* ---------- HPLC detectors, particle size ---------- */
add(node(mk({
  id: 'bk-m11-h-detect', title: 'HPLC detectors', theme: THEME_LC, tags: ['hplc', 'detectors'], family: 'hplc-detect', tier: 'atomic', exam: 'short_2to3', mins: 2,
  variants: [
    pick({
      id: 'h-det-uv', label: 'The usual detector', stem: 'Which is the most common HPLC detector?',
      explanation: 'The **UV (spectroscopic) detector**, with a lamp and a monochromator or a photodiode array. It is linear over about five orders of magnitude of solute concentration.',
      options: [['a', 'UV absorbance (photodiode array)'], ['b', 'refractive index'], ['c', 'flame ionisation'], ['d', 'thermal conductivity']], correct: 'a',
    }),
    pick({
      id: 'h-det-ri', label: 'Universal detector', stem: 'Which HPLC detector responds to almost any solute but is much less sensitive than UV?',
      explanation: 'The **refractive index detector** is universal, but its detection limit is far poorer than that of the UV detector (the slides say by about a factor of 1000).',
      options: [['a', 'refractive index'], ['b', 'electrochemical'], ['c', 'UV absorbance'], ['d', 'mass spectrometer']], correct: 'a',
    }),
    pick({
      id: 'h-det-ec', label: 'Electroactive analytes', stem: 'Which HPLC detector is highly selective and sensitive but only responds to electroactive compounds?',
      explanation: 'The **electrochemical detector**: only compounds that can be oxidised or reduced at the electrode respond, which makes it selective as well as sensitive.',
      options: [['a', 'electrochemical'], ['b', 'refractive index'], ['c', 'UV absorbance'], ['d', 'flame ionisation']], correct: 'a',
    }),
  ],
})), { id: 'm11.h.detect', name: 'HPLC detectors: UV, refractive index, electrochemical', chunk: 'g-hplc', marks: 2, tags: ['hplc', 'detectors'] });

add(node(mk({
  id: 'bk-m11-h-particles', title: 'Why HPLC columns use small packed particles', theme: THEME_LC, tags: ['hplc', 'van-deemter'], family: 'hplc-particles', mins: 3,
  variants: [
    written({
      id: 'h-small-particles', label: 'Small particles (3 marks)',
      stem: 'Why do HPLC columns use **small, uniformly packed particles**, and what is the cost?',
      explanation: 'Diffusion in liquids is slow, so long diffusion paths cause band broadening. Small particles shorten the distances molecules must diffuse (smaller mass-transfer C term) and pack more uniformly (smaller multiple-path A term). Efficiency rises, N ∝ L/dₚ, so resolution improves or the run can be faster at the same resolution. The cost is that the narrow gaps between small particles resist flow, so a higher pressure is needed.',
      items: [
        ['Liquid diffusion is slow, so small particles shorten the diffusion paths and reduce mass-transfer broadening (smaller C term)', 1],
        ['More uniform packing reduces multiple-path broadening (smaller A term); efficiency rises (N ∝ L/dₚ), so resolution improves', 1, true],
        ['Cost: smaller particles resist flow, so a higher pressure is needed', 1, true],
      ],
    }),
  ],
})), { id: 'm11.h.particles', name: 'Why small particles improve efficiency and what they cost', chunk: 'g-hplc', marks: 3, tags: ['hplc', 'van-deemter'] });

/* ---------- GC-MS vs LC-MS, choosing GC or HPLC ---------- */
add(node(mk({
  id: 'bk-m11-g-ms', title: 'Coupling to mass spectrometry: GC–MS and LC–MS', theme: THEME_LC, tags: ['gc', 'hplc', 'ms'], family: 'gc-ms', mins: 5,
  variants: [
    written({
      id: 'g-gcms-lcms', label: 'GC–MS vs LC–MS (5 marks)',
      stem: 'Why is **GC–MS** generally easier to interface than **LC–MS**? Describe **two** technical challenges of coupling LC to MS.',
      explanation: 'The GC effluent is already a gas and is compatible with the vacuum of the mass spectrometer. The LC effluent is a liquid, so (1) it must be converted into gas-phase ions by an interface such as electrospray (ESI) or atmospheric-pressure chemical ionisation (APCI); (2) the large amount of solvent must be removed (desolvation) before the ions reach the high vacuum; and (3) the mobile phase must be MS-compatible, because non-volatile salts and buffers contaminate the source and suppress ionisation.',
      items: [
        ['GC: the effluent is already a gas and is compatible with the MS vacuum', 1, true],
        ['LC challenge 1: the liquid effluent must be converted into gas-phase ions, using an interface such as ESI or APCI', 1, true],
        ['LC challenge 2: the large solvent load must be removed (desolvated) before the ions enter the high vacuum', 1, true],
        ['Further LC point: the mobile phase must be MS-compatible (volatile buffers); non-volatile salts contaminate the source and suppress ionisation', 1],
        ['Clear statement of why this makes GC–MS easier (no solvent removal or ion-generation interface needed)', 1],
      ],
    }),
    written({
      id: 'g-hplc-suits', label: 'What HPLC suits (2 marks)',
      stem: 'Which kinds of analyte suit **HPLC** rather than GC, and why does that make LC–MS attractive?',
      explanation: 'HPLC suits polar, non-volatile and thermally labile compounds, which cannot be vaporised without decomposing. Soft ionisation such as electrospray makes gas-phase ions from these compounds without needing to vaporise them by heat, so LC–MS can analyse compounds that GC–MS cannot.',
      items: [
        ['HPLC suits polar, non-volatile or thermally labile analytes (they cannot be vaporised without decomposing)', 1],
        ['Electrospray-type interfaces give gas-phase ions without heating the analyte to vaporise it, so LC–MS reaches compounds GC–MS cannot', 1],
      ],
    }),
  ],
})), { id: 'm11.g.ms', name: 'GC–MS vs LC–MS and what HPLC suits', chunk: 'g-detect', marks: 5, tags: ['ms', 'gc', 'hplc'] });

add(node(mk({
  id: 'bk-m11-g-choose', title: 'GC or HPLC?', theme: THEME_LC, tags: ['gc', 'hplc', 'method-selection'], family: 'gc-or-hplc', tier: 'atomic', exam: 'short_2to3', mins: 2,
  variants: [
    pick({
      id: 'g-sel-gc', label: 'Volatile mixture', stem: 'You must separate a mixture of volatile hydrocarbons that are stable at 200 °C. Which technique is the natural choice?',
      explanation: '**GC**: the analytes are volatile and thermally stable, which is exactly what GC needs (gas or volatile liquid stable at roughly 50–300 °C). An FID would detect them sensitively.',
      options: [['a', 'GC with an FID'], ['b', 'HPLC with a refractive index detector'], ['c', 'LC–MS with electrospray'], ['d', 'size-exclusion chromatography']], correct: 'a',
    }),
    pick({
      id: 'g-sel-hplc1', label: 'Thermally labile biomolecule', stem: 'You must analyse a thermally labile, non-volatile peptide. Which technique is the natural choice?',
      explanation: '**HPLC** (and LC–MS with electrospray if identification is needed): the peptide would decompose long before it vaporised in a GC oven.',
      options: [['a', 'HPLC (or LC–MS)'], ['b', 'GC with a TCD'], ['c', 'GC with on-column injection at 300 °C'], ['d', 'GC–MS with a packed column']], correct: 'a',
    }),
    pick({
      id: 'g-sel-hplc2', label: 'Polar non-volatile drug', stem: 'A polar, non-volatile drug must be separated from its metabolites in a urine extract. Which technique is the natural choice?',
      explanation: '**Reversed-phase HPLC**: the polar, non-volatile analytes cannot be vaporised for GC without derivatisation, and reversed phase handles polar compounds well (most polar elutes first).',
      options: [['a', 'reversed-phase HPLC'], ['b', 'GC with a splitless injector'], ['c', 'GC with a PLOT column'], ['d', 'GC with an FID at 400 °C']], correct: 'a',
    }),
  ],
})), { id: 'm11.g.choose', name: 'Choose GC or HPLC for an analyte', chunk: 'g-hplc', marks: 2, tags: ['gc', 'hplc', 'method-selection'] });

export default out;
