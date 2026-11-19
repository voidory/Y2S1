import { range, choice, num, kw, calc, pick, written, order, node, tableRows } from './lib.mjs';

/* Exam-shaped drills for fluorescence (Topic 4b, week 6) and atomic spectroscopy (Topic 4c, week 7).
   Prompts follow questions the past finals asked (labelled in the variant titles); rubric points follow the lecture slides and the
   answer keys, in our own words. */
const SRC_F = 'Topic 4b slides; past finals';
const SRC_A = 'Topic 4c slides; past finals';
const THEME_F = 'Fluorescence';
const THEME_AT = 'Atomic Spectroscopy';
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });

/* ---------- Jablonski diagram ---------- */
{
  const OPT = ['absorption', 'vibrational relaxation', 'internal conversion', 'intersystem crossing', 'fluorescence', 'phosphorescence'];
  const label6 = calc({
    id: 'f-jab-label6', label: 'Label the Jablonski arrows (6 marks)', marks: 6,
    stem: 'The energy-level diagram of a molecule shows the singlet states S₀ and S₁, each with vibrational levels, and a triplet state T₁ just below S₁. Name the process shown by each arrow.',
    explanation: 'Absorption is the upward arrow from S₀. Vibrational relaxation drops the molecule to the lowest vibrational level of S₁ by giving energy to the solvent. Internal conversion is the non-radiative step between electronic states of the same spin (S₁ into a high vibrational level of S₀). Intersystem crossing is the isoenergetic non-radiative step between states of different spin (S₁ to T₁). Fluorescence and phosphorescence are the two photon-emitting steps: S₁ → S₀ (same spin, fast) and T₁ → S₀ (spin change, slow).',
    sampled: {},
    derived: { a1: "'absorption'", a2: "'vibrational relaxation'", a3: "'internal conversion'", a4: "'intersystem crossing'", a5: "'fluorescence'", a6: "'phosphorescence'" },
    fields: [
      kw('a1', 'Upward arrow from the lowest vibrational level of S₀ to a high vibrational level of S₁', OPT, 'a1'),
      kw('a2', 'Short non-radiative steps down the vibrational levels of S₁ to its lowest level, energy passed to the solvent', OPT, 'a2'),
      kw('a3', 'Non-radiative step from the lowest level of S₁ into a high vibrational level of S₀ (same spin)', OPT, 'a3'),
      kw('a4', 'Isoenergetic non-radiative step from S₁ to the triplet state T₁ (spin changes)', OPT, 'a4'),
      kw('a5', 'Photon emitted in S₁ → S₀ (same spin, lifetime about 10⁻⁹ to 10⁻⁴ s)', OPT, 'a5'),
      kw('a6', 'Photon emitted in T₁ → S₀ (spin changes, lifetime about 10⁻⁴ to 10² s)', OPT, 'a6'),
    ],
  });
  const labelAE = calc({
    id: 'f-jab-labelAE', label: 'Name processes A to E (5 marks)', marks: 5,
    stem: 'In a Jablonski diagram the arrows are lettered. **A** is the upward arrow from S₀; **B** is a downward photon-emitting arrow from the lowest level of S₁ to S₀; **C** is a downward photon-emitting arrow from the lowest level of T₁ to S₀; **D** is a horizontal non-radiative step from S₁ into a high vibrational level of S₀; **E** is a horizontal isoenergetic step from S₁ to T₁. Name each process.',
    explanation: 'A = absorption, B = fluorescence (S₁ → S₀, same spin), C = phosphorescence (T₁ → S₀, spin change, slower), D = internal conversion (non-radiative, same spin), E = intersystem crossing (non-radiative, between different multiplicities). The short vibrational relaxation steps (R) are not lettered here.',
    sampled: {},
    derived: { a: "'absorption'", b: "'fluorescence'", c: "'phosphorescence'", d: "'internal conversion'", e: "'intersystem crossing'" },
    fields: [
      kw('a', 'A', OPT, 'a'), kw('b', 'B', OPT, 'b'), kw('c', 'C', OPT, 'c'), kw('d', 'D', OPT, 'd'), kw('e', 'E', OPT, 'e'),
    ],
  });
  add(node({
    id: 'bk-m11-s-jablonski', week: 6, title: 'Jablonski diagram: label and explain', theme: THEME_F, tags: ['fluorescence', 'jablonski'], source: SRC_F, family: 'fluor', mins: 6,
    variants: [
      label6, labelAE,
      written({
        id: 'f-jab-absonly', label: 'Absorption with no emission (4 marks)',
        stem: 'With reference to the energy-level diagram, explain what happens when a molecule **absorbs radiation but neither fluoresces nor phosphoresces**.',
        explanation: 'Absorption lifts the molecule to an upper vibrational level of S₁. Vibrational relaxation (R) takes it to the lowest vibrational level of S₁, passing energy to the solvent. Internal conversion then moves it from S₁ into a high vibrational level of S₀ without any light being emitted, and a second vibrational relaxation brings it to the bottom of S₀. All the energy ends as heat.',
        items: [
          ['Absorption raises the molecule from the lowest level of S₀ to an upper vibrational level of S₁', 1],
          ['Vibrational relaxation (R) takes it to the lowest vibrational level of S₁, passing energy to the solvent', 1, true],
          ['Internal conversion carries it from S₁ into a high vibrational level of S₀ without emitting light', 1, true],
          ['Vibrational relaxation to the bottom of S₀: the excess energy ends as heat', 1],
        ],
      }),
      written({
        id: 'f-jab-fluor', label: 'Absorption then fluorescence (4 marks)',
        stem: 'With reference to the same diagram, explain what happens when a molecule **absorbs radiation and then fluoresces**. Which molecules do this?',
        explanation: 'The first steps are the same: absorption to an upper vibrational level of S₁ and vibrational relaxation to the bottom of S₁. Instead of internal conversion, the molecule emits a photon and drops straight to S₀ (a vibrational level of the ground state). This is favoured in rigid molecules, which cannot lose their energy easily through vibration.',
        items: [
          ['Absorption to an upper vibrational level of S₁, as before', 1],
          ['Vibrational relaxation to the lowest level of S₁', 1],
          ['Instead of internal conversion the molecule emits a photon in the transition S₁ → S₀ (fluorescence)', 1, true],
          ['This happens for rigid molecules that do not lose energy easily by vibration', 1],
        ],
      }),
      written({
        id: 'f-fvp', label: 'Fluorescence vs phosphorescence (6 marks)',
        stem: 'Explain how **molecular fluorescence differs from molecular phosphorescence**.',
        explanation: 'Fluorescence is the emission of a photon in a transition between states of the same spin (S₁ → S₀) and is fast, with a lifetime of about 10⁻⁹ to 10⁻⁴ s. For phosphorescence the molecule must first cross from the singlet S₁ to the triplet T₁ by intersystem crossing (an isoenergetic non-radiative step between different multiplicities); the photon is then emitted in the spin-changing transition T₁ → S₀, which is slow, with a lifetime of about 10⁻⁴ to 10² s. (Standard physics, not on the slides: T₁ lies below S₁, so phosphorescence appears at a longer wavelength.)',
        items: [
          ['Fluorescence: a photon is emitted in a transition between states of the same spin (S₁ → S₀)', 1, true],
          ['Fluorescence is fast: lifetime about 10⁻⁹ to 10⁻⁴ s', 1],
          ['Phosphorescence needs intersystem crossing first: an isoenergetic non-radiative step from the singlet S₁ to the triplet T₁', 1, true],
          ['Phosphorescence: a photon is emitted in a transition between states of different spin (T₁ → S₀)', 1, true],
          ['Phosphorescence is much slower: lifetime about 10⁻⁴ to 10² s', 1],
          ['Clear comparison of the two: both are radiative, but they differ in spin change and lifetime', 1],
        ],
      }),
    ],
  }), { id: 'm11.s.jablonski', name: 'Jablonski diagram: label the arrows, trace the paths, fluorescence vs phosphorescence', chunk: 's-fluorescence', marks: 5, tags: ['fluorescence', 'jablonski'] });
}

/* ---------- fluorescence: explain ---------- */
add(node({
  id: 'bk-m11-s-fl-explain', week: 6, title: 'Fluorescence: why and how (past-final prompts)', theme: THEME_F, tags: ['fluorescence', 'written'], source: SRC_F, family: 'fluor', mins: 5,
  variants: [
    written({
      id: 'f-sens', label: 'Why fluorescence is more sensitive (4 marks)',
      stem: 'Why are **fluorescence measurements more sensitive than absorbance measurements** for solution-phase species?',
      explanation: 'Fluorescence is measured against a zero background: the detector sits at 90° to the excitation beam, so only light emitted by the sample reaches it, and a detector can be made very responsive to a small signal on nothing. Absorbance is the small decrease in a large transmitted beam, which means measuring a small difference between two large intensities, and that is hard to do accurately. The effect is like spotting a faint light in a dark room compared with a brightly lit one.',
      items: [
        ['Fluorescence is measured against a zero (dark) background', 1, true],
        ['The detector is at right angles to the excitation beam, so only light emitted by the sample reaches it', 1],
        ['Absorbance is a small decrease in a large transmitted signal (a small difference between two large intensities), which is hard to measure accurately', 1, true],
        ['So the fluorescence detector can be made far more responsive to small signals (dark-room analogy)', 1],
      ],
    }),
    written({
      id: 'f-who', label: 'Which molecules fluoresce (2 marks)',
      stem: 'Which kinds of molecule are most likely to fluoresce strongly, and why?',
      explanation: 'Rigid molecules, such as polycyclic aromatic compounds, and many substituted aromatics, fluoresce strongly (quantum yield close to 1). They have few ways to lose the excitation energy by vibration, so internal conversion competes poorly with emission. A rise in temperature lowers the quantum yield.',
      items: [
        ['Rigid molecules such as polycyclic aromatic compounds (and many substituted aromatics)', 1],
        ['They lose less of the excitation energy by vibration and internal conversion, so more excited molecules emit (quantum yield near 1; higher temperature lowers it)', 1],
      ],
    }),
    written({
      id: 'f-broad', label: 'Why absorption bands are broad (2 marks)',
      stem: 'Why are molecular absorption bands in solution **broad** rather than sharp lines?',
      explanation: 'Each electronic transition has many closely spaced vibrational and rotational levels superimposed on it, and the solvent adds further interaction, so absorption occurs over a wide range of wavelengths instead of at one.',
      items: [
        ['Each electronic transition has many closely spaced vibrational and rotational levels superimposed on it', 1, true],
        ['Absorption therefore occurs over a range of wavelengths (solvent interactions add to the broadening)', 1],
      ],
    }),
    written({
      id: 'f-stokes', label: 'Stokes shift (4 marks)',
      stem: 'What is the **Stokes shift**, what causes it, and when are the absorption and emission spectra mirror images?',
      explanation: 'The Stokes shift is the displacement of the emission to a longer wavelength than the radiation that excited it. It is caused by re-optimisation of the molecule’s geometry in the excited state S₁ and by interactions with the surrounding solvent, which lose some of the energy before the photon is emitted. The spectra are approximate mirror images when the vibrational spacings are similar in the two states and the transition probabilities are similar; that is a condition on the spectra, not the cause of the shift.',
      items: [
        ['Emission occurs at a longer wavelength than the excitation radiation', 1],
        ['Cause: re-optimisation of the molecule’s geometry in the excited state S₁', 1, true],
        ['Cause: interactions with the environment (solvent)', 1, true],
        ['The spectra are approximate mirror images when vibrational spacings and transition probabilities are similar (a condition, not the cause)', 1],
      ],
    }),
    written({
      id: 'f-quench', label: 'Quenching and Stern–Volmer (3 marks)',
      stem: 'What is **fluorescence quenching**, and how does the Stern–Volmer relation show it?',
      explanation: 'Quenching happens when the energy of the excited molecule is transferred to another molecule, the quencher Q, instead of being emitted: M* + Q → M + Q*, after which Q* loses its energy as heat. The booklet gives Φ₀/Φ_Q = 1 + (k_q/(k_e + k_d))[Q], so the ratio of the fluorescence quantum yield without and with quencher rises linearly with the quencher concentration.',
      items: [
        ['Quenching: the excited molecule transfers its energy to another molecule (the quencher Q) instead of emitting', 1],
        ['M* + Q → M + Q*, then Q* → Q + heat', 1],
        ['Stern–Volmer: Φ₀/Φ_Q = 1 + (k_q/(k_e + k_d))[Q], a straight line against [Q]', 1],
      ],
    }),
    written({
      id: 'f-diagram', label: 'Fluorimeter block diagram (5 marks)', paper: true,
      stem: 'Draw a **block diagram of a fluorescence spectrometer** showing the radiation source, sample cell, wavelength selection, detector and readout. Sketch it on paper, then compare.',
      explanation: 'Source → wavelength selection for the excitation (a monochromator or filter; not needed for a line source such as a hollow-cathode lamp) → sample cell → emission monochromator and photomultiplier detector placed at 90° to the excitation beam → readout. The excitation wavelength is fixed and the emission is scanned. The 90° geometry keeps the transmitted source light off the detector.',
      items: [
        ['Radiation source', 1],
        ['Wavelength selection for the excitation (monochromator or filter; omitted only for a line source)', 1],
        ['Sample cell', 1],
        ['Emission monochromator and detector (photomultiplier) at 90° to the excitation beam', 1, true],
        ['Signal readout; excitation wavelength fixed and emission scanned', 1],
      ],
    }),
  ],
}), { id: 'm11.s.flexplain', name: 'Fluorescence: sensitivity, which molecules, broad bands, Stokes shift, quenching, instrument', chunk: 's-fluorescence', marks: 4, tags: ['fluorescence', 'written'] });

/* ---------- fluorescence: two-point calibration ---------- */
add(node({
  id: 'bk-m11-s-fl-cal', week: 6, title: 'Fluorescence: two-point calibration', theme: THEME_F, tags: ['fluorescence', 'calibration'], source: SRC_F, family: 'fluor', mins: 5,
  variants: [
    calc({
      id: 'f-cal2', label: 'Concentration from two standards (4 marks)', marks: 4,
      stem: 'The fluorescence intensity *I*_f (arbitrary units) of SO₂ in air is linearly proportional to its concentration. Two standards gave:\n\n' +
        tableRows(['I_f', '[SO₂] / µg m⁻³'], [['{{fix(I1,2)}}', '{{fix(c1,0)}}'], ['{{fix(I2,2)}}', '{{fix(c2,0)}}']]) +
        '\n\nA sample gives *I*_f = **{{fix(Ix,2)}}**. Using a two-point calibration of the form *y* = *m* *x* + *c*, find the slope, the intercept and the sample concentration.',
      hint: 'm = (y₂ − y₁)/(x₂ − x₁); c = y₁ − m x₁; then x = (y − c)/m.',
      explanation: 'Slope m = (I₂ − I₁)/(c₂ − c₁). Intercept = I₁ − m c₁. The sample concentration is x = (I_x − intercept)/m. Leaving out the intercept (x = I_x/m) is the usual slip.',
      sampled: { m: range(0.020, 0.050, 0.001, 3), b: range(0.04, 0.12, 0.01, 2), c1: choice([2, 4, 5, 6, 8]), c2: choice([20, 24, 25, 30, 40]), cx: range(6, 18, 1, 0) },
      derived: {
        I1: 'round(m * c1 + b, 2)', I2: 'round(m * c2 + b, 2)', Ix: 'round(m * cx + b, 2)',
        slope: '(I2 - I1) / (c2 - c1)', icpt: 'I1 - slope * c1', cxv: '(Ix - icpt) / slope', cnoint: 'Ix / slope',
      },
      fields: [
        num('slope', 'Slope m', 'per µg m⁻³', 'slope', { relTol: 0.02, sig: 3 }),
        num('icpt', 'Intercept c', '', 'icpt', { relTol: 0.03, sig: 3, ecf: [{ expr: 'I1 - u_slope * c1', label: 'Consistent with your own slope, so the method earns part credit.' }] }),
        num('cxv', 'Sample concentration', 'µg m⁻³', 'cxv', {
          relTol: 0.02, sig: 3,
          paths: [{ label: 'You left out the intercept: x = (y − c)/m, not y/m.', expr: 'cnoint' }],
          ecf: [{ expr: '(Ix - u_icpt) / u_slope', label: 'Consistent with your own slope and intercept.' }],
        }),
      ],
    }),
  ],
}), { id: 'm11.s.flcal', name: 'Two-point linear calibration of a fluorescence signal', chunk: 's-fluorescence', marks: 4, tags: ['fluorescence', 'calibration'] });

/* ---------- AAS ---------- */
add(node({
  id: 'bk-m11-s-aas-table', week: 7, title: 'AAS components and their features', theme: THEME_AT, tags: ['aas', 'instrumentation'], source: SRC_A, family: 'aas', mins: 8,
  variants: [
    written({
      id: 'a-hcl', label: 'Hollow-cathode lamp (3 marks)',
      stem: 'Describe the **hollow-cathode lamp** used in atomic absorption spectroscopy: what it is made of, how it works and what it emits.',
      explanation: 'The cathode is made of the metal being determined and the lamp is filled with argon. A high voltage ionises the argon to Ar⁺ and electrons; Ar⁺ strikes the cathode and dislodges metal atoms (sputtering); the sputtered atoms collide with energetic electrons and are excited. The excited atoms emit lines of exactly the frequency the analyte absorbs, and these lines are narrower than about 10⁻³ to 10⁻² nm.',
      items: [
        ['Cathode made of the metal being determined; lamp filled with argon', 1],
        ['High voltage ionises Ar to Ar⁺ and e⁻; Ar⁺ sputters metal atoms off the cathode and they are excited by collisions with energetic electrons', 1, true],
        ['The excited atoms emit the analyte’s own lines (same frequency the analyte absorbs), narrower than about 10⁻³ to 10⁻² nm', 1, true],
      ],
    }),
    written({
      id: 'a-flame', label: 'Flame and atomiser (3 marks)',
      stem: 'Describe the **atomiser (flame)** in atomic absorption spectroscopy: how the sample reaches it and what happens there.',
      explanation: 'The nebuliser turns the sample solution into a fine aerosol that mixes with fuel and oxidant; baffles remove large droplets, so only about 5% of the sample reaches the flame. The solvent burns off (desolvation in the primary combustion zone), then the particles vaporise and are atomised, mainly in the hot interzonal region, giving free ground-state atoms that absorb the lamp radiation. Oxides and hydroxides form in the outer cone, so the hottest region is wanted.',
      items: [
        ['The nebuliser makes a fine aerosol that mixes with fuel and oxidant (baffles remove large drops; only about 5% reaches the flame)', 1],
        ['The solvent burns off, then the particles vaporise and are atomised, in the hottest (interzonal) region, to avoid oxide formation', 1, true],
        ['The result is free ground-state atoms that absorb the radiation from the lamp', 1, true],
      ],
    }),
    written({
      id: 'a-mono', label: 'Monochromator (2 marks)',
      stem: 'What is the **monochromator** for in an atomic absorption spectrometer, and how does slit width matter?',
      explanation: 'It isolates the analytical line from the lamp (and from light emitted by the flame and other lines) using an entrance slit, a grating and an exit slit. Slit width trades resolution against light throughput: a narrow slit separates neighbouring lines better but passes less light; a wide slit passes more light but resolves less. (Several past keys say the opposite, that a wider slit gives higher resolution; the lecture and the physics agree with the trade-off written here.)',
      items: [
        ['Isolates the analytical line from the lamp, and from flame emission and other lines (entrance slit, grating, exit slit)', 1, true],
        ['Slit width trades resolution against light throughput (signal)', 1],
      ],
    }),
    written({
      id: 'a-det', label: 'Detector (2 marks)',
      stem: 'Describe the **detector** (photomultiplier) used in atomic absorption spectroscopy.',
      explanation: 'A photomultiplier converts photons into electrons. Each photon striking the photoemissive cathode ejects electrons, which are focused onto a dynode that releases more electrons, and this is repeated several times, so one photon gives about a million electrons (the key’s figure). The resulting current is amplified and read out.',
      items: [
        ['Photons strike a photoemissive cathode and eject electrons', 1],
        ['The electrons are multiplied at successive dynodes (about 10⁶ electrons per photon in the key); the amplified current is read out', 1, true],
      ],
    }),
    written({
      id: 'a-full', label: 'Whole AAS table (10 marks)',
      stem: 'A schematic of an atomic absorption spectrometer shows the hollow-cathode lamp, the flame, the monochromator and the detector/amplifier. **Identify each component and describe its important features.**',
      explanation: 'Hollow-cathode lamp: cathode of the analyte metal, argon fill, high voltage, Ar⁺ sputters metal atoms that are excited and emit the analyte lines (narrower than 10⁻³–10⁻² nm). Flame: nebuliser makes an aerosol, fuel and oxidant, desolvation, vaporisation and atomisation in the hot region, free ground-state atoms absorb. Monochromator: slits and grating isolate the line; slit width trades resolution against throughput. Detector: photomultiplier with dynode multiplication, amplified signal.',
      items: [
        ['Lamp: cathode made of the analyte metal, filled with argon', 1],
        ['Lamp: Ar⁺ sputters metal atoms off the cathode; they are excited by collisions with electrons', 1, true],
        ['Lamp: emits the analyte’s lines, narrower than about 10⁻³ to 10⁻² nm, at the frequency the analyte absorbs', 1, true],
        ['Flame: nebuliser makes an aerosol that mixes with fuel and oxidant', 1],
        ['Flame: solvent burns off, particles vaporise and atomise (hottest region, avoiding oxides)', 1, true],
        ['Flame: the free ground-state atoms absorb the lamp radiation', 1],
        ['Monochromator: isolates the analytical line (entrance slit, grating, exit slit)', 1, true],
        ['Monochromator: slit width trades resolution against light throughput', 1],
        ['Detector: photomultiplier converts photons to electrons, multiplied at dynodes', 1, true],
        ['Detector: the amplified current is the signal that is read out', 1],
      ],
    }),
    order({
      id: 'a-block-order', label: 'AAS block diagram (5 marks)', marks: 5,
      stem: 'Put the parts of a flame atomic absorption spectrometer in order, **from sample introduction to the final signal**.',
      explanation: 'Sample solution → nebuliser (aerosol) → spray chamber where it mixes with fuel and oxidant (baffles remove large drops) → flame (desolvation, vaporisation, atomisation; the beam from the hollow-cathode lamp passes through it) → monochromator → detector → amplifier and readout.',
      direction: 'Sample path: first → last',
      items: [['sol', 'Sample solution'], ['neb', 'Nebuliser (aerosol)'], ['mix', 'Mixing with fuel and oxidant (baffles remove large drops)'], ['flame', 'Flame (atomisation)'], ['mono', 'Monochromator'], ['det', 'Detector and amplifier']],
    }),
  ],
}), { id: 'm11.s.aastable', name: 'AAS: lamp, flame, monochromator, detector and the block diagram', chunk: 's-atomic', marks: 10, tags: ['aas', 'instrumentation'] });

/* ---------- Boltzmann ---------- */
{
  const stemSmall = 'The lowest excited state of sodium is **3.371 × 10⁻¹⁹ J** above the ground state and the excited state has degeneracy 2 (ground state 1); *k* = 1.381 × 10⁻²³ J K⁻¹. Calculate the **percentage of Na atoms in the excited state** at **{{fix(T1,0)}} K** and at **{{fix(T2,0)}} K**, and the **percentage increase** in the excited-state population between the two temperatures.';
  const fields = [
    num('p1', 'Excited-state atoms at T₁', '%', 'p1', { relTol: 0.02, sig: 3 }),
    num('p2', 'Excited-state atoms at T₂', '%', 'p2', { relTol: 0.02, sig: 3 }),
    num('rise', 'Increase in the excited population', '%', 'rise', { relTol: 0.08, sig: 2, ecf: [{ expr: '100 * (u_p2 - u_p1) / u_p1', label: 'Consistent with your own two percentages.' }] }),
  ];
  const expl = 'N_e/N₀ = (g_e/g₀) exp[−(E_e − E₀)/kT]. Multiply by 100 for a percentage. Only a tiny fraction of the atoms (well under 0.1%) is ever excited, so almost all atoms stay in the ground state whatever the temperature; but the excited population changes by a large percentage for a small change in temperature. That is why emission (which depends on the excited population) is far more temperature-sensitive than absorption (which depends on the ground-state atoms).';
  const derived = (T2) => ({ T2, p1: '200 * exp(-3.371 * 10^-19 / (1.381 * 10^-23 * T1))', p2: '200 * exp(-3.371 * 10^-19 / (1.381 * 10^-23 * T2))', rise: '100 * (p2 - p1) / p1' });
  add(node({
    id: 'bk-m11-s-boltz', week: 7, title: 'Boltzmann populations: why emission is temperature-sensitive', theme: THEME_AT, tags: ['boltzmann', 'aes'], source: SRC_A, family: 'aes', mins: 6,
    variants: [
      calc({
        id: 'a-boltz-small', label: 'Small change in temperature (5 marks)', marks: 5, stem: stemSmall,
        hint: 'N_e/N₀ = 2 exp[−ΔE/(kT)]. Percentage = 100 × that ratio.', explanation: expl,
        sampled: { T1: choice([2000, 2400, 2500, 2600, 2800, 3000]), dT: choice([10, 20, 25, 50]) }, derived: derived('T1 + dT'), fields,
      }),
      calc({
        id: 'a-boltz-big', label: 'Large change in temperature (5 marks)', marks: 5, stem: stemSmall,
        hint: 'N_e/N₀ = 2 exp[−ΔE/(kT)]. Percentage = 100 × that ratio.', explanation: expl,
        sampled: { T1: choice([2500, 3000, 3500]), dT: choice([500, 1000]) }, derived: derived('T1 + dT'), fields,
      }),
    ],
  }), { id: 'm11.s.boltz', name: 'Boltzmann: excited-state fraction and its change with temperature', chunk: 's-atomic', marks: 5, tags: ['boltzmann', 'aes'] });
}

/* ---------- AES vs AAS, broadening, ICP ---------- */
add(node({
  id: 'bk-m11-s-aes-aas', week: 7, title: 'AES vs AAS: temperature, types, no Stokes shift', theme: THEME_AT, tags: ['aes', 'aas', 'written'], source: SRC_A, family: 'aes', mins: 5,
  variants: [
    written({
      id: 'a-aes-t', label: 'AES vs AAS temperature sensitivity (5 marks)',
      stem: 'Explain why **atomic emission spectroscopy is more sensitive to fluctuations in flame temperature than atomic absorption spectroscopy**. Use the Boltzmann distribution.',
      explanation: 'N_e/N₀ = (g_e/g₀) exp[−(E_e − E₀)/kT]. For sodium at 2500 K only about 1×10⁻⁴ of the atoms are excited, so more than 99.98% are in the ground state. A small rise in temperature (for example 20 K) changes that tiny excited population by a large percentage (about 8%) but hardly changes the ground-state population. Emission is proportional to the excited-state population, so it responds strongly; absorption is by the ground-state atoms, which hardly change, so it is much less sensitive.',
      items: [
        ['States the Boltzmann relation N_e/N₀ = (g_e/g₀) exp[−(E_e − E₀)/kT]', 1],
        ['Only a tiny fraction of the atoms is excited (for example about 10⁻⁴ for Na near 2500 K), so almost all atoms are in the ground state', 1, true],
        ['A small temperature change alters that tiny excited population by a large percentage (for example about 8% for 20 K)', 1, true],
        ['Emission depends on the excited-state population, so it is very temperature-sensitive', 1, true],
        ['Absorption depends on the ground-state atoms, whose number hardly changes, so AAS is much less sensitive', 1],
      ],
    }),
    pick({
      id: 'a-types', label: 'Three kinds of atomic spectroscopy', stem: 'In which kind of atomic spectroscopy is the signal **emission from an excited state populated thermally**, without any lamp?',
      explanation: '**Atomic emission spectroscopy (AES)**, for example ICP-OES: a hot plasma excites the atoms thermally and the emitted light is measured. In AAS sharp lamp lines are absorbed by ground-state atoms; in atomic fluorescence the emission follows an initial absorption of radiation.',
      options: [['a', 'atomic emission spectroscopy (AES)'], ['b', 'atomic absorption spectroscopy (AAS)'], ['c', 'atomic fluorescence'], ['d', 'molecular absorption']], correct: 'a',
    }),
    pick({
      id: 'a-nostokes', label: 'No Stokes shift in AES', stem: 'Why does atomic emission show no Stokes shift (the emission wavelength equals the excitation wavelength)?',
      explanation: 'Atoms have no molecular orbitals, vibrations or geometry to re-optimise, so no energy is lost between excitation and emission. The Stokes shift belongs to molecular fluorescence.',
      options: [['a', 'there are no molecular orbitals, so no vibrational relaxation or re-optimisation takes place'], ['b', 'because atomic lines are broader than molecular bands'], ['c', 'because the plasma is cooler than a flame'], ['d', 'because atoms emit only in the infrared']], correct: 'a',
    }),
  ],
}), { id: 'm11.s.aesaas', name: 'AES vs AAS: temperature sensitivity, types of atomic spectroscopy, no Stokes shift', chunk: 's-atomic', marks: 5, tags: ['aes', 'aas'] });

add(node({
  id: 'bk-m11-s-broad', week: 7, title: 'Atomic line widths', theme: THEME_AT, tags: ['linewidth', 'broadening'], source: SRC_A, family: 'aes', mins: 5,
  variants: [
    written({
      id: 'a-broad', label: 'Causes of line broadening (5 marks)',
      stem: 'Describe the processes that lead to **broadening of atomic linewidths**.',
      explanation: 'Natural broadening comes from the Heisenberg uncertainty principle, δE δt ≥ h/4π: an excited state with a short lifetime (about 10⁻⁸ to 10⁻⁹ s) has an uncertain energy, giving widths of about 10⁻⁵ to 10⁻⁴ nm. Collisional (pressure) broadening: collisions between atoms shorten the lifetime of the excited state, and it grows with temperature (up to about 10⁻³ nm for Na). Doppler broadening: atoms moving toward the detector emit light seen at a higher frequency and atoms moving away at a lower frequency, and the spread of velocities broadens the line; it grows with temperature.',
      items: [
        ['Natural broadening: Heisenberg uncertainty, a short excited-state lifetime gives an uncertain energy (δE δt ≥ h/4π)', 1, true],
        ['Collisional (pressure) broadening: collisions between atoms shorten the excited-state lifetime', 1, true],
        ['Doppler broadening: atoms moving toward or away from the detector shift the observed frequency up or down; the spread of velocities broadens the line', 1, true],
        ['Collisional and Doppler broadening increase with temperature', 1],
        ['Typical widths: natural about 10⁻⁵–10⁻⁴ nm; collisional up to about 10⁻³ nm', 1],
      ],
    }),
    written({
      id: 'a-hcl-narrow', label: 'Why lamp lines are narrower than flame lines (2 marks)',
      stem: 'Why are the lines emitted by a **hollow-cathode lamp narrower** than the absorption lines of atoms in a flame, and why does that matter for AAS?',
      explanation: 'The gas in the lamp is cooler and at lower pressure than the flame, so there is less Doppler and pressure broadening. A monochromator cannot isolate lines narrower than about 10⁻³ to 10⁻² nm, so a line source whose lines are narrower than the absorption lines is needed for Beer’s law to hold.',
      items: [
        ['The lamp is cooler and at lower pressure than the flame, so there is less Doppler and pressure broadening', 1, true],
        ['A monochromator cannot isolate such narrow lines (below about 10⁻³–10⁻² nm), so AAS needs a line source', 1],
      ],
    }),
    written({
      id: 'a-mol-vs-atom', label: 'Molecular bands vs atomic lines (4 marks)',
      stem: 'Why are **molecular emission bands much broader than atomic emission lines**, and what controls the width of atomic lines?',
      explanation: 'In molecules the electronic transitions have vibrational and rotational levels superimposed on them, so each transition spreads into a band. In atoms only electronic levels are involved, so the lines are narrow. Their widths are set by natural broadening (the Heisenberg uncertainty principle), collisional (pressure) broadening and Doppler broadening, the last two growing with temperature.',
      items: [
        ['Molecular transitions include vibrational and rotational levels superimposed on the electronic change, so they spread into bands', 1, true],
        ['Atomic transitions are electronic only, so the lines are narrow', 1],
        ['Atomic widths are controlled by natural (Heisenberg) broadening', 1],
        ['and by collisional (pressure) and Doppler broadening, which grow with temperature', 1],
      ],
    }),
  ],
}), { id: 'm11.s.broad', name: 'Atomic line broadening: natural, collisional, Doppler; why lamp lines are narrow', chunk: 's-atomic', marks: 5, tags: ['linewidth', 'broadening'] });

add(node({
  id: 'bk-m11-s-icp', week: 7, title: 'ICP-OES vs AAS and atomic vs molecular methods', theme: THEME_AT, tags: ['icp', 'written'], source: SRC_A, family: 'aes', mins: 5,
  variants: [
    written({
      id: 'a-icp-aas', label: 'ICP-OES vs AAS (3 marks)',
      stem: 'Outline the **advantages of inductively coupled plasma – optical emission spectroscopy (ICP-OES) compared with AAS**.',
      explanation: 'ICP-OES measures many elements at once (a polychromator with many exit slits and detectors) without changing a lamp for each element. The argon plasma is much hotter (6,000 to 10,000 K, fairly uniform across its cross-section), so desolvation, vaporisation and atomisation are essentially complete and a good excited-state population is reached. The inert argon atmosphere also means fewer oxides form.',
      items: [
        ['Many elements measured simultaneously, without a separate lamp for each element', 1, true],
        ['Much hotter plasma (6,000–10,000 K): more complete atomisation and excitation', 1, true],
        ['Inert argon atmosphere, so less oxide formation', 1],
      ],
    }),
    written({
      id: 'a-mol-vs-atomic-pb', label: 'Molecular vs atomic method for lead (4 marks)',
      stem: 'Lead can be determined by UV-vis spectroscopy after complexing Pb²⁺ with a ligand, or by atomic absorption or emission. Give **one advantage of each approach** (two points each).',
      explanation: 'Molecular (complexation and UV-vis): it measures only free Pb²⁺, which is what you want if speciation matters, and it needs no flame or high temperature, which is cheaper and safer. Atomic methods: they measure all forms of lead at once (total lead), and because only a very narrow wavelength is measured there are fewer interferences.',
      items: [
        ['Molecular: measures only the free Pb²⁺ (useful when speciation matters)', 1],
        ['Molecular: no flame or high temperature needed (cheaper, safer)', 1],
        ['Atomic: measures all forms of lead, so gives the total lead', 1],
        ['Atomic: only a very narrow wavelength is measured, so fewer interferences', 1],
      ],
    }),
    written({
      id: 'a-pm-prep', label: 'Preparing PM2.5 for atomic analysis (2 marks)',
      stem: 'How must **PM2.5 samples be prepared** before elemental analysis by atomic spectroscopy?',
      explanation: 'The particles are collected on filter paper. The filter is digested by microwave-assisted acid digestion so that the particulate matter dissolves completely, and the solution is then analysed by ICP spectroscopy.',
      items: [
        ['Collect the particles on a filter, then dissolve them completely by microwave-assisted acid digestion', 1, true],
        ['Analyse the resulting solution by ICP spectroscopy (ICP-OES or ICP-MS)', 1],
      ],
    }),
  ],
}), { id: 'm11.s.icp', name: 'ICP-OES vs AAS, atomic vs molecular methods, sample preparation', chunk: 's-atomic', marks: 4, tags: ['icp', 'written'] });

export default out;
