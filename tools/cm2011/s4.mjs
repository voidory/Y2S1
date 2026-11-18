import { range, choice, num, kw, calc, pick, written, order, node } from './lib.mjs';

/* Topic 4 (spectroscopy). The lecture slides for these topics were not available when this was written, so the
   source line says "standard texts": check the qualitative items against your own slides. */
const SRC_Q = 'Topic 4 · standard texts, check against your slides';
const SRC_N = 'Topic 4 · spectroscopy';
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });
const THEME_A = 'Molecular Absorption';
const THEME_F = 'Fluorescence';
const THEME_AT = 'Atomic Spectroscopy';

/* ---------- Beer-Lambert ---------- */
{
  const findA = calc({
    id: 's-bl-A', label: 'Absorbance from concentration', marks: 3,
    stem: 'A solution of an absorbing species has a concentration of **{{fix(cu,2)}} µM**. Its molar absorptivity is ε = **{{fix(eps,0)}} L mol⁻¹ cm⁻¹** and the cell path length is **{{fix(b,2)}} cm**. Calculate the absorbance and the percentage transmittance.',
    hint: 'A = ε b c, with c in mol/L (1 µM = 10⁻⁶ M). %T = 100 × 10^(−A).',
    explanation: 'A = εbc. Convert µM to M first. %T = 100 × 10^(−A).',
    sampled: { eps: choice([2400, 8500, 12000, 15000, 25000]), b: choice([1.00, 0.50, 2.00]), At: range(0.10, 0.90, 0.01, 2) },
    derived: { cu: 'At / (eps * b) * 1000000', A: 'eps * b * cu / 1000000', T: '100 * 10^(-A)', wrongC: 'eps * b * cu' },
    fields: [num('A', 'Absorbance A', '', 'A', { relTol: 0.01, sig: 3, paths: [{ label: 'You used µM as if it were M: convert to mol/L first.', expr: 'wrongC' }] }), num('T', 'Transmittance', '%T', 'T', { relTol: 0.015, sig: 3, paths: [{ label: 'T = 10^(−A) gives a fraction: multiply by 100 for %T.', expr: '10^(-A)' }], ecf: [{ expr: '100 * 10^(-u_A)', label: 'Consistent with your own absorbance, so the method earns part credit.' }] })],
  });
  const findC = calc({
    id: 's-bl-c', label: 'Concentration from absorbance', marks: 3,
    stem: 'A solution in a **{{fix(b,2)}} cm** cell has absorbance **{{fix(A,3)}}** at the absorption maximum, where ε = **{{fix(eps,0)}} L mol⁻¹ cm⁻¹**. What is its concentration in mol/L and in µM?',
    explanation: 'c = A/(εb).',
    sampled: { eps: choice([2400, 8500, 12000, 15000, 25000]), b: choice([1.00, 0.50, 2.00]), A: range(0.10, 0.90, 0.001, 3) },
    derived: { c: 'A / (eps * b)', cu: 'c * 1000000' },
    fields: [num('c', 'c', 'mol/L', 'c', { relTol: 0.01, sig: 3 }), num('cu', 'c', 'µM', 'cu', { relTol: 0.01, sig: 3, ecf: [{ expr: 'u_c * 1000000', label: 'Consistent with your own molarity, so the method earns part credit.' }] })],
  });
  const tA = calc({
    id: 's-bl-TA', label: '%T and A', marks: 3,
    stem: 'A sample transmits **{{fix(T,0)}}%** of the incident light at the analytical wavelength. Calculate its absorbance. What would the absorbance and %T be if the path length were **doubled**?',
    hint: 'A = −log T where T is the fraction (%T/100). Doubling b doubles A.',
    explanation: 'A = −log₁₀(%T/100) = 2 − log₁₀(%T). Absorbance is proportional to path length, so doubling b doubles A, but %T = 10^(2−A) is not simply halved or squared by eye.',
    sampled: { T: range(8, 92, 1, 0) },
    derived: { A: '2 - log(T)', A2: '2 * A', T2: '100 * 10^(-A2)' },
    fields: [num('A', 'A', '', 'A', { relTol: 0.01, sig: 3, paths: [{ label: 'You used %T instead of the fraction T (A = 2 − log %T, not −log %T).', expr: '-log(T)' }, { label: 'You used the natural log instead of log₁₀.', expr: '-ln(T / 100)' }] }), num('A2', 'A (double path)', '', 'A2', { relTol: 0.01, sig: 3, ecf: [{ expr: '2 * u_A', label: 'Consistent with your own absorbance, so the method earns part credit.' }] }), num('T2', '%T (double path)', '%T', 'T2', { relTol: 0.02, sig: 3, ecf: [{ expr: '100 * 10^(-u_A2)', label: 'Consistent with your own A, so the method earns part credit.' }] })],
  });
  const dil = calc({
    id: 's-bl-dil', label: 'Diluted sample', marks: 6,
    stem: 'A **{{fix(V1,2)}} mL** portion of a sample solution is diluted to **{{fix(V2,0)}} mL**. The diluted solution gives absorbance **{{fix(A,3)}}** in a 1.00 cm cell (ε = **{{fix(eps,0)}} L mol⁻¹ cm⁻¹**). Calculate the concentration in the diluted solution, the concentration in the original sample, and the original concentration in mg/L for an analyte with M = 158.03 g/mol.',
    hint: 'Beer–Lambert gives the diluted concentration. Then multiply by V₂/V₁ to undo the dilution.',
    explanation: 'c_dil = A/(εb). c_orig = c_dil × V₂/V₁. mg/L = c × M × 1000.',
    sampled: { V1: choice([1.00, 2.00, 5.00, 10.00]), V2: choice([25, 50, 100]), A: range(0.15, 0.85, 0.001, 3), eps: choice([2400, 9800, 15000]) },
    derived: { cd: 'A / eps', co: 'cd * V2 / V1', mg: 'co * 158.03 * 1000', inv: 'cd * V1 / V2' },
    fields: [num('cd', 'c (diluted)', 'mol/L', 'cd', { relTol: 0.01, sig: 3 }), num('co', 'c (original)', 'mol/L', 'co', { relTol: 0.01, sig: 3, paths: [{ label: 'You did not correct for the dilution.', expr: 'cd' }, { label: 'You applied the dilution factor upside down.', expr: 'inv' }], ecf: [{ expr: 'u_cd * V2 / V1', label: 'Consistent with your own diluted concentration, so the method earns part credit.' }] }), num('mg', 'c (original)', 'mg/L', 'mg', { relTol: 0.015, sig: 3, ecf: [{ expr: 'u_co * 158.03 * 1000', label: 'Consistent with your own molarity, so the method earns part credit.' }] })],
  });
  const line = calc({
    id: 's-cal-line', label: 'Read a calibration line', marks: 5,
    stem: 'A calibration line for an absorbance method is *A* = **{{fix(m,4)}}** × *c* + **{{fix(b,4)}}** (c in mg/L). A sample prepared by diluting **{{fix(V1,1)}} mL to {{fix(V2,0)}} mL** gives *A* = **{{fix(A,4)}}**. Find the concentration in the diluted solution and in the original sample.',
    explanation: 'Invert the line: c = (A − intercept)/slope. Then multiply by the dilution factor V₂/V₁.',
    sampled: { m: range(0.0400, 0.0900, 0.0005, 4), b: range(0.0020, 0.0200, 0.0005, 4), V1: choice([1.0, 2.0, 5.0]), V2: choice([25, 50, 100]), c0: range(0.5, 9.0, 0.1, 1) },
    derived: { A: 'round(m * c0 + b, 4)', cd: '(A - b) / m', co: 'cd * V2 / V1', noInt: 'A / m * V2 / V1' },
    fields: [num('cd', 'c (diluted)', 'mg/L', 'cd', { relTol: 0.01, sig: 3 }), num('co', 'c (original)', 'mg/L', 'co', { relTol: 0.015, sig: 3, paths: [{ label: 'You ignored the intercept of the calibration line.', expr: 'noInt' }, { label: 'You did not correct for the dilution.', expr: 'cd' }], ecf: [{ expr: 'u_cd * V2 / V1', label: 'Consistent with your own diluted concentration, so the method earns part credit.' }] })],
  });
  add(node({ id: 'bk-m11-s-beer', week: 5, title: 'Beer–Lambert, transmittance and dilution', theme: THEME_A, tags: ['beer-lambert', 'absorbance', 'dilution'], source: SRC_N, family: 'spec-calc', mins: 5, variants: [findA, findC, tA, dil, line] }),
    { id: 'm11.s.beer', name: 'Beer–Lambert: A, %T, c and dilutions', chunk: 's-absorption', marks: 4, tags: ['beer-lambert'] });
}

/* ---------- wavelength, wavenumber, frequency, energy ---------- */
{
  const a = calc({
    id: 's-wave-a', label: 'Wavenumber to wavelength', marks: 4,
    stem: 'An absorption band lies at **{{fix(nu,0)}} cm⁻¹**. Calculate its wavelength in nm and in ångström (Å), and its frequency in Hz (c = 2.998 × 10¹⁰ cm s⁻¹).',
    hint: 'λ(nm) = 10⁷ / ṽ(cm⁻¹). 1 nm = 10 Å. ν = c ṽ.',
    explanation: 'λ = 1/ṽ, with 1 cm = 10⁷ nm, so λ(nm) = 10⁷/ṽ. 1 nm = 10 Å. ν = c·ṽ (c in cm/s).',
    sampled: { nu: range(12000, 32000, 100, 0) },
    derived: { nm: '10000000 / nu', A: 'nm * 10', hz: '2.998 * 10^10 * nu' },
    fields: [num('nm', 'λ', 'nm', 'nm', { relTol: 0.005, sig: 4, paths: [{ label: 'You forgot the factor 10⁷ (cm → nm).', expr: '1 / nu' }] }), num('A', 'λ', 'Å', 'A', { relTol: 0.005, sig: 4, ecf: [{ expr: 'u_nm * 10', label: 'Consistent with your own wavelength, so the method earns part credit.' }] }), num('hz', 'ν', 'Hz', 'hz', { relTol: 0.01, sig: 4 })],
  });
  const b = calc({
    id: 's-wave-b', label: 'Wavelength to energy', marks: 4,
    stem: 'Light of wavelength **{{fix(nm,0)}} nm** excites a molecule. Calculate its wavenumber (cm⁻¹), the energy of one photon (J; h = 6.626 × 10⁻³⁴ J s, c = 2.998 × 10⁸ m s⁻¹) and the energy per mole of photons (kJ/mol; N_A = 6.022 × 10²³).',
    explanation: 'ṽ = 10⁷/λ(nm). E = hc/λ with λ in metres. Multiply by N_A for a mole of photons.',
    sampled: { nm: range(250, 750, 5, 0) },
    derived: { nu: '10000000 / nm', E: '6.626 * 10^-34 * 2.998 * 10^8 / (nm * 10^-9)', Em: 'E * 6.022 * 10^23 / 1000' },
    fields: [num('nu', 'ṽ', 'cm⁻¹', 'nu', { relTol: 0.005, sig: 4 }), num('E', 'E per photon', 'J', 'E', { relTol: 0.01, sig: 4 }), num('Em', 'E per mole', 'kJ/mol', 'Em', { relTol: 0.01, sig: 4, ecf: [{ expr: 'u_E * 6.022 * 10^23 / 1000', label: 'Consistent with your own photon energy, so the method earns part credit.' }] })],
  });
  add(node({ id: 'bk-m11-s-wave', week: 5, title: 'Wavelength, wavenumber, frequency and energy', theme: THEME_A, tags: ['wavenumber', 'units'], source: SRC_N, family: 'spec-calc', mins: 4, variants: [a, b] }),
    { id: 'm11.s.wave', name: 'Convert cm⁻¹, nm, Å, Hz and photon energy', chunk: 's-absorption', marks: 4, tags: ['wavenumber'] });
}

/* ---------- instrument layouts ---------- */
{
  add(node({ id: 'bk-m11-s-layout', week: 5, title: 'Instrument layouts', theme: THEME_A, tags: ['instrumentation'], source: SRC_Q, family: 'spec-layout', tier: 'atomic', exam: 'short_2to3', mins: 2,
    variants: [
      order({ id: 's-layout-abs', label: 'Absorption spectrometer', stem: 'Put the parts of a single-beam UV-visible absorption spectrometer in the order the light meets them.', direction: 'Light path: first → last', explanation: 'Source → wavelength selector (monochromator) → sample cell → detector → readout. Absorption is measured in line with the beam, as the light lost on the way through.', items: [['src', 'Lamp (source)'], ['mono', 'Wavelength selector (monochromator)'], ['cell', 'Sample cell'], ['det', 'Detector'], ['out', 'Readout']] }),
    ] }),
    { id: 'm11.s.layout', name: 'Order the parts of an absorption spectrometer', chunk: 's-absorption', marks: 2, tags: ['instrumentation'] });

  add(node({ id: 'bk-m11-s-fl-layout', week: 6, title: 'Fluorimeter layout', theme: THEME_F, tags: ['instrumentation', 'fluorescence'], source: SRC_Q, family: 'fluor', tier: 'atomic', exam: 'short_2to3', mins: 2,
    variants: [
      order({ id: 's-layout-fl', label: 'Fluorimeter', stem: 'Put the parts of a fluorescence spectrometer in the order the light meets them (detector at 90°).', direction: 'Light path: first → last', explanation: 'Source → excitation monochromator (or filter) → sample cell → emission monochromator (or filter) at 90° to the excitation beam → detector → readout. The 90° geometry keeps the transmitted source light off the detector.', items: [['src', 'Lamp (source)'], ['ex', 'Excitation monochromator / filter'], ['cell', 'Sample cell'], ['em', 'Emission monochromator / filter (at 90°)'], ['det', 'Detector'], ['out', 'Readout']] }),
    ] }),
    { id: 'm11.s.fllayout', name: 'Order the parts of a fluorimeter and explain the 90° geometry', chunk: 's-fluorescence', marks: 2, tags: ['fluorescence'] });

  add(node({ id: 'bk-m11-s-aas-layout', week: 7, title: 'AAS layout', theme: THEME_AT, tags: ['instrumentation', 'aas'], source: SRC_Q, family: 'aas', tier: 'atomic', exam: 'short_2to3', mins: 2,
    variants: [
      order({ id: 's-layout-aas', label: 'Atomic absorption spectrometer', stem: 'Put the parts of an atomic absorption spectrometer in the order the light meets them.', direction: 'Light path: first → last', explanation: 'Hollow-cathode lamp (the element being determined) → atomiser (flame or graphite furnace) → monochromator (isolates the line) → detector → readout. Unlike molecular absorption, the "sample cell" is the atom cloud.', items: [['hcl', 'Hollow-cathode lamp'], ['atom', 'Atomiser (flame or graphite furnace)'], ['mono', 'Monochromator'], ['det', 'Detector'], ['out', 'Readout']] }),
    ] }),
    { id: 'm11.s.aaslayout', name: 'Order the parts of an atomic absorption spectrometer', chunk: 's-atomic', marks: 2, tags: ['aas'] });
}

/* ---------- fluorescence and AAS: reasoning ---------- */
{
  const flu = [
    pick({ id: 's-f-wl', label: 'Emission wavelength', stem: 'A molecule is excited at 350 nm. Its fluorescence emission is most likely to be centred near:', explanation: 'Some energy is lost by vibrational relaxation before emission (the Stokes shift), so the fluorescence photon has less energy and a **longer** wavelength than the excitation photon.', options: [['a', '430 nm (longer than the excitation)'], ['b', '350 nm (identical)'], ['c', '280 nm (shorter than the excitation)'], ['d', 'it cannot be predicted']], correct: 'a' }),
    pick({ id: 's-f-90', label: 'Why 90°', stem: 'Why is the fluorescence detector placed at 90° to the excitation beam?', explanation: 'In line with the beam the detector would be swamped by the (much brighter) transmitted source light. At 90° only emitted light and a little scatter reach it.', options: [['a', 'to avoid detecting the transmitted excitation light'], ['b', 'because fluorescence is emitted only at right angles'], ['c', 'to make the path length 1 cm'], ['d', 'to allow Beer’s law to be used']], correct: 'a' }),
    pick({ id: 's-f-sens', label: 'Sensitivity', stem: 'Fluorescence methods usually have much lower detection limits than absorption methods because:', explanation: 'Fluorescence is measured against a near-dark background, so a tiny signal can be detected. Absorbance is the small difference between two large light intensities, which limits sensitivity.', options: [['a', 'a small emitted signal is measured against a dark background'], ['b', 'molar absorptivities are larger'], ['c', 'longer path lengths are used'], ['d', 'there is no scattered light']], correct: 'a' }),
  ];
  add(node({ id: 'bk-m11-s-fl-concepts', week: 6, title: 'Fluorescence: concepts', theme: THEME_F, tags: ['fluorescence', 'concepts'], source: SRC_Q, family: 'fluor', tier: 'atomic', exam: 'mcq_1mark', diff: 2, mins: 1, variants: flu }),
    { id: 'm11.s.flconcepts', name: 'Fluorescence: Stokes shift, 90° geometry, sensitivity', chunk: 's-fluorescence', marks: 1, tags: ['fluorescence'] });

  const aas = [
    pick({ id: 's-a-hcl', label: 'Hollow-cathode lamp', stem: 'Why does atomic absorption spectrometry use a hollow-cathode lamp made of the element being determined?', explanation: 'Atomic absorption lines are very narrow (~0.01 nm). A lamp emitting the same element’s lines supplies exactly those wavelengths, with a bandwidth narrower than the absorption line, so Beer’s law holds without a very high-resolution monochromator.', options: [['a', 'it emits the narrow lines the atoms absorb'], ['b', 'it gives a continuous spectrum'], ['c', 'it atomises the sample'], ['d', 'it replaces the monochromator']], correct: 'a' }),
    pick({ id: 's-a-gf', label: 'Flame vs furnace', stem: 'Compared with a flame, a graphite furnace atomiser usually gives:', explanation: 'The furnace holds the whole atomised sample in the light path for longer, so it detects much lower amounts (parts per billion) but is slower and less precise than flame AAS.', options: [['a', 'lower detection limits but slower analysis'], ['b', 'higher detection limits'], ['c', 'faster analysis of large samples'], ['d', 'no need for a lamp']], correct: 'a' }),
    pick({ id: 's-a-what', label: 'What is absorbed', stem: 'In AAS the absorbing species are:', explanation: 'Free ground-state atoms in the flame or furnace. The sample is first desolvated, vaporised and atomised; the absorbance is proportional to the number of atoms in the light path.', options: [['a', 'free ground-state atoms'], ['b', 'excited atoms only'], ['c', 'intact molecules in the solvent'], ['d', 'ions formed by the lamp']], correct: 'a' }),
  ];
  add(node({ id: 'bk-m11-s-aas-concepts', week: 7, title: 'Atomic spectroscopy: concepts', theme: THEME_AT, tags: ['aas', 'concepts'], source: SRC_Q, family: 'aas', tier: 'atomic', exam: 'mcq_1mark', diff: 2, mins: 1, variants: aas }),
    { id: 'm11.s.aasconcepts', name: 'AAS: lamp, atomisers and what absorbs', chunk: 's-atomic', marks: 1, tags: ['aas'] });

  add(node({ id: 'bk-m11-s-written', week: 6, title: 'Spectroscopy: explain', theme: THEME_F, tags: ['fluorescence', 'aas'], source: SRC_Q, family: 'fluor', mins: 6,
    variants: [
      written({ id: 's-w-fl-vs-abs', label: 'Fluorescence versus absorption', stem: 'Compare molecular fluorescence with molecular absorption spectrometry: how the signal is measured, instrument geometry, and sensitivity.', explanation: 'Absorption measures the light lost through the sample in line with the beam; fluorescence measures light emitted at a longer wavelength, viewed at 90° against a dark background, which makes it more sensitive and more selective (two wavelengths).',
        items: [['Absorption: measures the light lost (transmitted vs incident) in line with the beam; signal is a small difference at low concentration', 1], ['Fluorescence: measures emitted light, at a longer wavelength than the excitation (Stokes shift)', 1, true], ['Emission is detected at 90° to the excitation beam so transmitted source light is not seen', 1], ['Because the signal is measured against a dark background, fluorescence has lower detection limits; two wavelengths (excitation and emission) also improve selectivity', 1]] }),
      written({ id: 's-w-aas', label: 'Atomic absorption', stem: 'Describe how atomic absorption spectrometry works: the main components and how an absorbance is related to concentration.', explanation: 'A hollow-cathode lamp of the analyte element emits its narrow lines; the atomiser (flame or furnace) produces free atoms from the sample; the monochromator isolates the line; the detector measures the light lost. A = ε b c holds for the atom cloud, so a calibration of A against concentration gives the sample.',
        items: [['Hollow-cathode lamp of the element sought supplies narrow line radiation', 1, true], ['Atomiser (flame or graphite furnace) converts the sample into free ground-state atoms', 1, true], ['Monochromator isolates the analytical line; detector measures the intensity before and after', 1], ['Absorbance is proportional to the atom concentration (Beer–Lambert), so a calibration curve gives the unknown', 1]] }),
    ] }),
    { id: 'm11.s.written', name: 'Explain fluorescence vs absorption and AAS', chunk: 's-fluorescence', marks: 4, tags: ['written'] });
}

export default out;
