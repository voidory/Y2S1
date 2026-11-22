import { range, choice, num, kw, calc, pick, written, order, recall, node, anyOf, has } from './lib.mjs';

const SRC = 'Topic 3b · potentiometry';
const WEEK = 4;
const THEME = 'Potentiometry & Ion-Selective Electrodes';
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });
const gam = (z, alpha, I) => `10^(-(0.51 * ${z}^2 * sqrt(${I})) / (1 + 3.3 * ${alpha} * sqrt(${I})))`;
const sgn = (z) => (z > 0 ? 1 : -1);
const SLOPE = 59.16;

/* ---------- slope of a Nernstian electrode ---------- */
{
  const ions = [['K⁺', 1], ['Ca²⁺', 2], ['Al³⁺', 3], ['F⁻', -1], ['Cl⁻', -1], ['S²⁻', -2], ['PO₄³⁻', -3]];
  const variants = ions.map(([ion, z]) => calc({
    id: `p-slope-${ion.replace(/[^A-Za-z0-9]/g, 'x')}`, label: ion, marks: 3,
    stem: `A Nernstian ion-selective electrode responds to ${ion} (z = ${z > 0 ? '+' : '−'}${Math.abs(z)}) at 298 K. What is the slope of a plot of E against log *a*, in mV per decade of activity? What is the change in potential when the activity rises by a factor of **{{fix(f,0)}}**?`,
    hint: 'Slope = (59.2 mV)/z: positive for cations, negative for anions, smaller for higher charge.',
    explanation: `E = const + (0.0592/z) log a with the sign of the charge: slope = ${z > 0 ? '+' : '−'}59.2/${Math.abs(z)} = ${z > 0 ? '+' : '−'}${(SLOPE / Math.abs(z)).toFixed(1)} mV per decade. A factor f in activity changes E by slope × log f.`,
    sampled: { f: choice([10, 100, 5, 20, 50, 1000]) },
    derived: { s: `${sgn(z) * SLOPE / Math.abs(z)}`, dE: `${sgn(z) * SLOPE / Math.abs(z)} * log(f)`, noZ: `${sgn(z) * SLOPE} * log(f)` },
    fields: [
      num('s', 'Slope', 'mV/decade', 's', { relTol: 0.015, sig: 3, paths: Math.abs(z) > 1 ? [{ label: `You used the monovalent slope; divide 59.2 by the charge (${Math.abs(z)}).`, expr: `${sgn(z) * SLOPE}` }] : [] }),
      num('dE', 'ΔE', 'mV', 'dE', { relTol: 0.02, sig: 3, ecf: [{ expr: 'u_s * log(f)', label: 'Consistent with your own slope, so the method earns part credit.' }] }),
    ],
  }));
  add(node({ id: 'bk-m11-p-slope', week: WEEK, title: 'Nernstian slope by ion charge', theme: THEME, tags: ['nernst', 'ise-slope'], source: SRC, family: 'ise-calc', exam: 'short_2to3', mins: 3, variants }),
    { id: 'm11.p.slope', name: 'Slope of E vs log a (sign and charge dependence)', chunk: 'p-calibration', marks: 3, tags: ['ise-slope'] });
}

/* ---------- calibration: unknown from a measured potential ---------- */
{
  const mk = (id, ion, z) => {
    const s = sgn(z) * SLOPE / Math.abs(z);
    return calc({
      id: `p-cal-${id}`, label: ion, marks: 4,
      stem: `A ${ion} ion-selective electrode (Nernstian response) reads **{{fix(E1,1)}} mV** in a standard with activity **{{fix(a1,4)}}**. In the sample it reads **{{fix(Ex,1)}} mV**. Calculate the activity of ${ion} in the sample.`,
      hint: 'Use E₂ − E₁ = slope × log(a₂/a₁) with the Nernstian slope for this charge, then solve for a₂.',
      explanation: `The slope is ${s > 0 ? '+' : '−'}${Math.abs(s).toFixed(1)} mV/decade, so a_x = a₁ × 10^((E_x − E₁)/slope). Watch the sign for an anion: a higher potential means *lower* activity.`,
      sampled: { E1: range(-60, 80, 0.5, 1), a1: choice([0.0010, 0.0100, 0.0050]), fct: choice([0.12, 0.35, 2.5, 6, 15]) },
      derived: { Ex: `round(E1 + ${s} * log(fct), 1)`, ax: `a1 * 10^((Ex - E1) / ${s})`, wrongSign: `a1 * 10^((Ex - E1) / ${-s})`, wrongZ: `a1 * 10^((Ex - E1) / ${sgn(z) * SLOPE})` },
      fields: [num('ax', 'a (sample)', '', 'ax', { relTol: 0.05, sig: 3, paths: [{ label: 'The slope has the wrong sign for this ion: cations rise and anions fall as activity rises.', expr: 'wrongSign' }].concat(Math.abs(z) > 1 ? [{ label: 'You used the monovalent slope instead of 59.2/z.', expr: 'wrongZ' }] : []) })],
    });
  };
  const nern = calc({
    id: 'p-cal-nernstian', label: 'Is the response Nernstian?', marks: 3,
    stem: 'A calibration of a **{{fix(z,0)}}+** cation electrode at 298 K gives a slope of **{{fix(m,1)}} mV/decade**. What slope does theory predict, and is the electrode behaving in a Nernstian way (within ±2 mV)?',
    explanation: 'Theory: 59.2/z mV per decade. A sensor is called Nernstian if the measured slope is within about ±1–2 mV of that value; outside the range it can still be useful if the response is uniform.',
    sampled: { z: choice([1, 2]), d: choice([-6, -3.5, -1.2, 0.8, 1.7, 4.5]) },
    derived: { th: `${SLOPE} / z`, m: 'round(th + d, 1)', ok: "abs(m - th) <= 2 ? 'yes' : 'no'" },
    fields: [num('th', 'Theoretical slope', 'mV/decade', 'th', { relTol: 0.015, sig: 3, paths: [{ label: 'Divide 59.2 by the charge z.', expr: '59.16' }] }), kw('ok', 'Nernstian?', ['yes', 'no'], 'ok', { synonyms: { yes: ['yes', 'nernstian'], no: ['no', 'not'] }, displays: { yes: 'yes (within ±2 mV of theory)', no: 'no (more than 2 mV from theory)' } })],
  });
  const line = calc({
    id: 'p-cal-line', label: 'Read a calibration line', marks: 3,
    stem: 'A fluoride electrode calibration gives E = **{{fix(m,1)}}** log *a*(F⁻) + **{{fix(b,1)}}** (E in mV). The sample reads **{{fix(Ex,1)}} mV**. Find the fluoride activity in the sample.',
    hint: 'Rearrange: log a = (E − b)/m, so a = 10^((E − b)/m). The slope for an anion is negative.',
    explanation: 'a = 10^((E − intercept)/slope). With a negative slope a higher E means a lower activity.',
    sampled: { m: choice([-56.8, -57.5, -58.4, -59.0]), b: range(-20, 60, 0.5, 1), lg: choice([-5.4, -4.7, -3.8, -3.1, -2.4]) },
    derived: { Ex: 'round(m * lg + b, 1)', ax: '10^((Ex - b) / m)', wrong: '10^((Ex - b) / abs(m))' },
    fields: [num('ax', 'a(F⁻)', '', 'ax', { relTol: 0.05, sig: 3, paths: [{ label: 'You dropped the sign of the slope.', expr: 'wrong' }] })],
  });
  add(node({ id: 'bk-m11-p-cal', week: WEEK, title: 'ISE calibration and readings', theme: THEME, tags: ['calibration', 'ise-slope'], source: SRC, family: 'ise-calc', mins: 5, variants: [mk('ca', 'Ca²⁺', 2), mk('f', 'F⁻', -1), mk('k', 'K⁺', 1), nern, line] }),
    { id: 'm11.p.cal', name: 'Unknown activity from a reading, and the Nernstian test', chunk: 'p-calibration', marks: 4, tags: ['calibration'] });
}

/* ---------- selectivity coefficient, two-point mixed solution method ---------- */
{
  const pairs = [
    { id: 'ca-na', i: 'Ca²⁺', zi: 2, ai: 0.6, ci: 0.001, fi: 'CaCl₂', si: 29.6, j: 'Na⁺', zj: 1, aj: 0.4, cj: 0.1, fj: 'NaCl', ni: 1, Ii: '0.003', Ij: 'I1 + 0.1', Ks: [0.02, 0.05, 0.1, 0.3] },
    { id: 'k-na', i: 'K⁺', zi: 1, ai: 0.3, ci: 0.001, fi: 'KCl', si: 59.2, j: 'Na⁺', zj: 1, aj: 0.4, cj: 0.1, fj: 'NaCl', ni: 1, Ii: '0.001', Ij: 'I1 + 0.1', Ks: [0.005, 0.01, 0.02, 0.05] },
    { id: 'ca-mg', i: 'Ca²⁺', zi: 2, ai: 0.6, ci: 0.001, fi: 'CaCl₂', si: 29.6, j: 'Mg²⁺', zj: 2, aj: 0.8, cj: 0.1, fj: 'MgCl₂', ni: 1, Ii: '0.003', Ij: 'I1 + 0.3', Ks: [0.02, 0.05, 0.1, 0.3] },
  ];
  const variants = pairs.map((p) => {
    const ex = `(${p.zi} / ${p.zj})`;
    const K = (ai, aip, aj, dE) => `(${ai} * 10^(${dE} / ${p.si}) - ${aip}) / ${aj}^${ex}`;
    return calc({
      id: `p-sel-${p.id}`, label: `${p.i} electrode, ${p.j} interferent`, marks: 8,
      stem: `A ${p.i}-selective electrode has a slope of ${p.si} mV per activity decade. Its potential is **{{fix(E1,2)}} mV** in a ${p.ci} M ${p.fi} solution (E₁) and **{{fix(E2,2)}} mV** in a solution that is ${p.ci} M ${p.fi} **and** ${p.cj} M ${p.fj} (E₂). Calculate the selectivity coefficient K(${p.i}, ${p.j})^pot.\n\nUse activities from the extended Debye–Hückel equation (α(${p.i}) = ${p.ai} nm, α(${p.j}) = ${p.aj} nm).`,
      hint: 'K = ( a_i · 10^((E₂−E₁)/s) − a_i′ ) / a_j^(n/x). Here a_i is the primary-ion activity in the pure solution, a_i′ in the mixture (different ionic strength!), a_j the interferent in the mixture.',
      explanation: `Ionic strengths: I₁ = ${p.Ii}, I₂ = I₁ + the added salt. Each γ comes from −log γ = 0.51 z² √I/(1 + 3.3α√I) at the right I. Then K = (a_i·10^((E₂−E₁)/s) − a_i′)/a_j^(n/x) with n/x = ${p.zi}/${p.zj}. The two terms in the numerator are close, so keep four significant figures in the activities.`,
      sampled: { E1: range(-40, 40, 0.1, 1), Kt: choice(p.Ks) },
      derived: {
        I1: p.Ii, I2: p.Ij,
        gi: gam(p.zi, p.ai, 'I1'), gip: gam(p.zi, p.ai, 'I2'), gj: gam(p.zj, p.aj, 'I2'),
        ai: `gi * ${p.ci}`, aip: `gip * ${p.ci}`, aj: `gj * ${p.cj}`,
        E2: `round(E1 + ${p.si} * log((aip + Kt * aj^${ex}) / ai), 2)`,
        K: K('ai', 'aip', 'aj', '(E2 - E1)'),
        Kc: `(${p.ci} * 10^((E2 - E1) / ${p.si}) - ${p.ci}) / ${p.cj}^${ex}`,
      },
      fields: [
        num('I2', 'Ionic strength of the mixture', 'M', 'I2', { relTol: 0.005 }),
        num('ai', `a(${p.i}) in the pure solution`, 'M', 'ai', { relTol: 0.02, sig: 3 }),
        num('aip', `a(${p.i}) in the mixture`, 'M', 'aip', { relTol: 0.02, sig: 3 }),
        num('aj', `a(${p.j}) in the mixture`, 'M', 'aj', { relTol: 0.02, sig: 3 }),
        num('K', 'K^pot', '', 'K', { relTol: 0.15, sig: 3, paths: [{ label: 'You used concentrations instead of activities (γ = 1).', expr: 'Kc' }], ecf: [{ expr: K('u_ai', 'u_aip', 'u_aj', '(E2 - E1)'), label: 'Consistent with your own activities, so the method earns part credit.' }] }),
      ],
    });
  });
  add(node({ id: 'bk-m11-p-sel', week: WEEK, title: 'Selectivity coefficient (two-point mixed solution)', theme: THEME, tags: ['selectivity-coefficient', 'activity'], source: SRC + ' · lecture Example 6', family: 'ise-selectivity', mins: 10, variants }),
    { id: 'm11.p.sel', name: 'Selectivity coefficient from E₁ and E₂ with activities', chunk: 'p-selectivity', marks: 8, tags: ['selectivity-coefficient'] });

  const intf = calc({
    id: 'p-intf-serum', label: 'Size of the interference', marks: 4,
    stem: 'A potassium ISE has K(K⁺, Na⁺)^pot = $\${{sci(Kij, 1)}}$. It is used in a sample with *a*(K⁺) = **{{fix(aK,1)}} mM** and *a*(Na⁺) = **{{fix(aNa,0)}} mM**. (Both ions are monovalent.) Calculate the apparent K⁺ activity the electrode reports, the percentage error caused by Na⁺, and classify the interference.'.replace('$$', '$'),
    hint: 'The electrode responds to a_K + K·a_Na (n = x = 1). Error % = K·a_Na / a_K × 100.',
    explanation: 'E = const + s·log(a_i + K·a_j^(n/x)), so the apparent activity is a_i + K·a_j. K < 10⁻³: very weak interference; 10⁻³ < K < 1: intermediate; K = 1: equally selective for both; K > 1: the electrode prefers the interferent.',
    sampled: { Kij: choice([0.00026, 0.0008, 0.04, 1, 8]), aK: range(3.5, 5.0, 0.1, 1), aNa: choice([135, 140, 145]) },
    derived: { app: 'aK + Kij * aNa', err: 'Kij * aNa / aK * 100', cls: "Kij < 0.001 ? 'very weak' : Kij < 1 ? 'intermediate' : Kij == 1 ? 'equal' : 'interferent favoured'" },
    fields: [
      num('app', 'Apparent a(K⁺)', 'mM', 'app', { relTol: 0.01, sig: 4, paths: [{ label: 'You left out the interferent term K·a_j.', expr: 'aK' }] }),
      num('err', 'Error', '%', 'err', { relTol: 0.03, sig: 3, tol: 0.02, ecf: [{ expr: '(u_app - aK) / aK * 100', label: 'Consistent with your own apparent activity, so the method earns part credit.' }] }),
      kw('cls', 'Interference is', ['very weak', 'intermediate', 'equal', 'interferent favoured'], 'cls', { synonyms: { 'very weak': ['very weak', 'negligible'], intermediate: ['intermediate', 'moderate'], equal: ['equal', 'equally'], 'interferent favoured': ['interferent favoured', 'prefers the interferent', 'more selective for the interferent'] }, displays: { 'very weak': 'very weak (K < 10⁻³)', intermediate: 'intermediate (10⁻³ < K < 1)', equal: 'equally selective (K = 1)', 'interferent favoured': 'electrode prefers the interferent (K > 1)' } }),
    ],
  });
  add(node({ id: 'bk-m11-p-intf', week: WEEK, title: 'Size of an interference error', theme: THEME, tags: ['selectivity-coefficient', 'interferent'], source: SRC, family: 'ise-selectivity', mins: 5, variants: [intf] }),
    { id: 'm11.p.intf', name: 'Interference error and what K^pot means', chunk: 'p-selectivity', marks: 4, tags: ['interferent'] });
}

/* ---------- pressed-powder electrodes: slope for the indirectly sensed ion ---------- */
{
  const mk = (id, solid, mobile, mz, sensed, sz, m, x) => {
    const s = -(SLOPE / mz) * (x / m);
    return calc({
      id: `p-ag2s-${id}`, label: `${solid}: ${sensed}`, marks: 4,
      stem: `A pressed-powder ${solid} membrane responds to ${mobile} directly (mobile ion, Nernstian: E = const + (0.0592/${mz}) log a(${mobile})). The ${sensed} activity controls a(${mobile}) through the solubility product. What is the slope of E against log a(${sensed}), in mV per decade?`,
      hint: 'Write Ksp for the solid, solve for a(mobile ion) and substitute into the Nernst equation. The exponent of a(sensed ion) gives the slope.',
      explanation: `Ksp = a(${mobile})^${m} · a(${sensed})^${x}, so a(${mobile}) = (Ksp / a(${sensed})^${x})^(1/${m}). Substituting: E = const′ − (59.2/${mz})(${x}/${m}) log a(${sensed}) = ${s.toFixed(1)} mV per decade.`,
      derived: { s: `${s}`, direct: `${SLOPE / mz}`, noExp: `${-SLOPE / mz}` },
      fields: [num('s', 'Slope', 'mV/decade', 's', { relTol: 0.015, sig: 3, paths: [{ label: 'You gave the slope for the mobile ion; the sensed ion works through Ksp and has a smaller, opposite slope.', expr: 'direct' }, { label: 'You left out the exponent from Ksp.', expr: 'noExp' }] })],
    });
  };
  add(node({ id: 'bk-m11-p-ag2s', week: WEEK, title: 'Indirect response through Ksp', theme: THEME, tags: ['ksp', 'ise-slope', 'solid-state'], source: SRC + ' · lecture Ag₂S slides', family: 'ise-calc', mins: 4,
    variants: [mk('s2', 'Ag₂S', 'Ag⁺', 1, 'S²⁻', -2, 2, 1), mk('cl', 'AgCl', 'Ag⁺', 1, 'Cl⁻', -1, 1, 1), mk('cus', 'CuS', 'Cu²⁺', 2, 'S²⁻', -2, 1, 1)] }),
    { id: 'm11.p.ag2s', name: 'Slope for an ion sensed indirectly through Ksp', chunk: 'p-types', marks: 4, tags: ['ksp'] });
}

/* ---------- gas-sensing probes ----------
   Only the ammonia probe has ever been examined (2011/12, 2017/18, 2025/26 finals); the lecture's wider gas table (H2S, HCN, SO2, HF)
   never appears in 11 finals, so it was dropped. CO2 stays as the one other example of the same principle. */
{
  const G = [
    ['nh3', 'NH₃', '0.1 M NH₄Cl', has('nh[4₄]\\+? ?cl', 'nh[4₄]cl', 'ammonium chloride', 'ammonium'), 'pH glass electrode', has('ph', 'glass'),
      'NH₃ crosses the membrane and raises the pH of the thin NH₄Cl layer (NH₃ + H₂O ⇌ NH₄⁺ + OH⁻); the glass electrode reads that pH change. More NH₃ means higher pH, so the potential falls as log[NH₃] rises: the slope is negative, about −59 mV per decade.'],
    ['co2', 'CO₂', 'NaHCO₃', has('nahco[3₃]', 'sodium (?:hydrogen ?)?carbonate', 'sodium bicarbonate', 'hco[3₃]'), 'pH glass electrode', has('ph', 'glass'),
      'CO₂ crosses the membrane and acidifies the thin NaHCO₃ layer (CO₂ + H₂O ⇌ H⁺ + HCO₃⁻); the glass electrode reads the pH fall. Same principle as the ammonia probe, opposite direction: more CO₂ gives a lower pH.'],
  ];
  const variants = G.map(([id, gas, inner, innerRe, sensor, sensorRe, why]) => recall({
    id: `p-gas-${id}`, label: gas, marks: 2,
    stem: `A dissolved-gas sensing probe for **${gas}** has a gas-permeable membrane over a thin layer of inner solution, with an ion-selective electrode behind it. What is the inner filling solution, and which electrode senses the change?`,
    explanation: `${gas}: inner solution ${inner}; sensing electrode ${sensor}. ${why}`,
    fields: [['inner', 'Inner solution', inner, [`^.*${innerRe}.*$`]], ['sensor', 'Sensing electrode', sensor, [`^.*${sensorRe}.*$`]]],
  }));
  add(node({ id: 'bk-m11-p-gas', week: WEEK, title: 'Gas-sensing probes: how the ammonia probe works', theme: THEME, tags: ['gas-sensing-probe'], source: SRC + ' · gas-probe lecture slides', family: 'ise-recall', tier: 'atomic', exam: 'short_2to3', mins: 2, variants }),
    { id: 'm11.p.gas', name: 'Gas probes: the ammonia probe (and CO₂ as the same idea)', chunk: 'p-types', marks: 1, tags: ['gas-sensing-probe'] });
}

/* ---------- membranes and their facts ---------- */
{
  const variants = [
    recall({ id: 'p-fact-glass', label: 'Glass pH electrode', marks: 3,
      stem: 'For the glass pH electrode: (a) in which solution is it conditioned, and for how long, (b) which surface group forms, and (c) which class of ions interferes?',
      explanation: 'Conditioning in 0.1 M HCl for about an hour forms silanol groups (–SiO⁻H⁺) in a thin surface layer. The response is to H⁺ activity; alkali-metal ions (Na⁺, Li⁺, K⁺) interfere, more so as the Al₂O₃ content rises.',
      fields: [['cond', 'Conditioning', '0.1 M HCl for 1 hour', [`^.*${has('0\\.1 ?m ?hcl', 'hcl', 'hydrochloric')}.*$`]], ['grp', 'Surface group', 'silanol, –SiO⁻H⁺', [`^.*${has('silanol', 'sio-? ?h', 'sio⁻ ?h')}.*$`]], ['intf', 'Interferents', 'alkali metal ions (Na⁺, Li⁺, K⁺)', [`^.*${has('alkali', 'na\\+', 'na⁺', 'sodium', 'li\\+', 'k\\+', 'group 1')}.*$`]]] }),
    recall({ id: 'p-fact-tisab', label: 'TISAB', marks: 3,
      stem: 'The fluoride ionic strength adjustment buffer (TISAB) has three components. State the job of (a) NaCl, (b) sodium acetate, (c) CDTA.',
      explanation: 'NaCl fixes the ionic strength so γ is constant and the electrode follows concentration. Acetate holds pH at 5–6 so OH⁻ does not interfere. CDTA complexes Al(III) and Fe(III), which would otherwise bind F⁻.',
      fields: [['nacl', 'NaCl', 'sets a constant ionic strength', [`^.*${has('ionic strength', 'constant', 'activity coeff', 'γ')}.*$`]], ['ac', 'Sodium acetate', 'buffers pH to 5–6 (avoids OH⁻)', [`^.*${has('ph', 'buffer', 'oh')}.*$`]], ['cdta', 'CDTA', 'complexes Al(III) and Fe(III)', [`^.*${has('complex', 'chelat', 'bind', 'mask', 'al', 'fe')}.*$`]]] }),
  ];
  add(node({ id: 'bk-m11-p-facts', week: WEEK, title: 'Glass electrode and TISAB: key facts', theme: THEME, tags: ['glass-electrode', 'tisab'], source: SRC, family: 'ise-recall', mins: 3, exam: 'short_2to3', tier: 'atomic', variants }),
    { id: 'm11.p.facts', name: 'Glass electrode facts and TISAB', chunk: 'p-types', marks: 2, tags: ['membranes'] });
}

/* ---------- concepts (pick one) ---------- */
{
  const variants = [
    pick({ id: 'p-c-notation', label: 'Cell notation', stem: 'In the shorthand for an ISE cell, which side is the reference electrode written on?', explanation: 'By convention the reference electrode is written on the left (LHS) and the primary chemical sensor on the right (RHS): E = E_RHS − E_LHS.', options: [['a', 'left-hand side'], ['b', 'right-hand side'], ['c', 'either, as long as the meter is connected']], correct: 'a' }),
    pick({ id: 'p-c-eg', label: 'What changes with pH', stem: 'In E = E_G + E_G′ + E_R′ − (E_R + E_J) for a glass-electrode cell, which one term changes with the pH of the sample?', explanation: 'The inner glass/solution potential E_G′, the two reference potentials and (ideally) E_J are constant. Only E_G at the outer glass/sample interface depends on a(H⁺).', options: [['a', 'E_G (outer glass/sample interface)'], ['b', 'E_G′ (inner interface)'], ['c', 'E_R (reference electrode)'], ['d', 'E_J (junction potential)']], correct: 'a' }),
    pick({ id: 'p-c-ej', label: 'Largest error', stem: 'Which potential is the largest source of error in a pH measurement, especially if the meter is calibrated at a different ionic strength from the sample?', explanation: 'The liquid junction potential E_J: it arises from the different diffusion rates of ions across the reference junction, so it changes with ionic strength and temperature.', options: [['a', 'the liquid junction potential'], ['b', 'the inner glass potential'], ['c', 'the Ag/AgCl potential'], ['d', 'the potential of the meter']], correct: 'a' }),
    pick({ id: 'p-c-lj', label: 'Junction polarity', stem: 'At a boundary between 0.1 M HCl and 0.01 M HCl, H⁺ diffuses faster than Cl⁻. Which side becomes positive?', explanation: 'H⁺ outruns Cl⁻ from the concentrated to the dilute side, so the **dilute** (0.01 M) side becomes positive until the potential slows H⁺ and speeds Cl⁻ to a steady state.', options: [['a', 'the dilute side (0.01 M)'], ['b', 'the concentrated side (0.1 M)'], ['c', 'neither; the charges cancel']], correct: 'a' }),
    pick({ id: 'p-c-trivalent', label: 'Trivalent ions', stem: 'Why are ion-selective electrodes poor at measuring trivalent ions?', explanation: 'The Nernst slope is only 59.2/3 ≈ 19.7 mV per decade, so a given change in concentration produces a small, hard-to-measure change in E.', options: [['a', 'the slope is only about 19.7 mV per decade'], ['b', 'trivalent ions cannot cross any membrane'], ['c', 'the slope is infinite'], ['d', 'activity coefficients are always zero']], correct: 'a' }),
    pick({ id: 'p-c-nh3', label: 'Ammonia probe sign', stem: 'For the ammonia gas-sensing probe the response is E = constant ___ 59.2 log[NH₃]. Why is the sign what it is?', explanation: 'NH₃ raises the pH of the inner NH₄Cl layer (NH₃ + H₂O ⇌ NH₄⁺ + OH⁻); a glass electrode gives lower E at higher pH, so E falls as [NH₃] rises: E = const − 59.2 log[NH₃].', options: [['a', 'minus: more NH₃ raises the inner pH, which lowers E'], ['b', 'plus: NH₃ is a cation-like species'], ['c', 'plus: the slope is always positive'], ['d', 'it has no sign']], correct: 'a' }),
    pick({ id: 'p-c-intf', label: 'Which interferent', stem: 'Match the electrode to its typical interferent: the **ammonia gas probe** is interfered with by:', explanation: 'Small, volatile amines cross the gas-permeable membrane and also raise the inner pH. (The glass pH electrode is interfered with by alkali metals; the fluoride electrode by OH⁻.)', options: [['a', 'low-molar-mass amines'], ['b', 'alkali metal ions'], ['c', 'hydroxide'], ['d', 'chloride']], correct: 'a' }),
    pick({ id: 'p-c-nernstian', label: 'Nernstian behaviour', stem: 'A sensor is said to be Nernstian if its slope is:', explanation: 'Within ±1–2 mV of the theoretical value. A sensor outside that range can still be useful if its response is uniform with activity.', options: [['a', 'within about ±1–2 mV of the theoretical slope'], ['b', 'exactly 59.2 mV for any ion'], ['c', 'always positive'], ['d', 'independent of concentration']], correct: 'a' }),
  ];
  add(node({ id: 'bk-m11-p-concepts', week: WEEK, title: 'Potentiometry: concepts', theme: THEME, tags: ['ise', 'concepts'], source: SRC, family: 'ise-concept', tier: 'atomic', exam: 'mcq_1mark', diff: 2, mins: 1, variants }),
    { id: 'm11.p.concepts', name: 'Cell notation, junction potentials and interference: concepts', chunk: 'p-principles', marks: 1, tags: ['concepts'] });

  add(node({ id: 'bk-m11-p-calib-order', week: WEEK, title: 'Building a calibration curve', theme: THEME, tags: ['calibration'], source: SRC, family: 'ise-recall', tier: 'atomic', exam: 'short_2to3', mins: 2,
    variants: [order({ id: 'p-calib-order-v1', label: 'Procedure', stem: 'Put the steps of preparing an ISE calibration in order.', direction: 'First → last', explanation: 'Condition the electrode in 0.01 M of the ion for an hour, then soak it in de-ionised water for 30 minutes. Measure each standard with gentle stirring (it thins the diffusion layer) until the potential is steady (±0.1 mV over 60 s). Then plot E against log a and read the slope.',
      items: [['cond', 'Condition in 0.01 M of the target ion for 1 hour'], ['soak', 'Soak in de-ionised water for 30 minutes'], ['meas', 'Measure each standard with gentle stirring until steady (±0.1 mV in 60 s)'], ['plot', 'Plot E against log a and check the slope']] })] }),
    { id: 'm11.p.procedure', name: 'Calibration and measurement procedure for an ISE', chunk: 'p-calibration', marks: 2, tags: ['calibration'] });
}

/* ---------- written answers ---------- */
{
  const variants = [
    written({ id: 'p-w-glass', label: 'How a glass pH electrode works', stem: 'Explain how a glass pH electrode produces a potential that depends on pH. Include what happens at the membrane and why the measured cell potential tracks only the outer interface.',
      explanation: 'Model answer: a conditioned glass membrane carries silanol groups; the equilibrium −SiO⁻H⁺ ⇌ −SiO⁻ + H⁺ at the sample interface depends on a(H⁺), setting up a charge separation (interfacial potential). The inside is held constant by 0.1 M HCl and Ag/AgCl, the reference electrode and junction are constant, so E = const + 59.2 mV·log a(H⁺).',
      items: [['The glass is conditioned in HCl so its surface forms silanol groups (–SiO⁻H⁺) that exchange H⁺ reversibly', 1, true], ['The H⁺ exchange equilibrium at the glass/water interface depends on a(H⁺): charge separation gives an interfacial potential E_G', 2, true], ['The inner surface sees a fixed 0.1 M HCl and an Ag/AgCl electrode, so its potential is constant', 1], ['Potential is measured against a reference electrode (Ag/AgCl, sat. KCl) with a high-impedance meter and no appreciable current', 1], ['E = constant + 59.2 mV × log a(H⁺) at 298 K, i.e. 59.2 mV per pH unit', 1]] }),
    written({ id: 'p-w-nh3', label: 'Ammonia probe: draw and label', paper: true, stem: 'Draw and label the ion-selective electrode used to detect ammonia. Include both the ammonia electrode and the Ag/AgCl reference electrode, and state what it measures.',
      explanation: 'Per the 2011-12 final answer: a gas-permeable membrane at the tip over 0.1 M NH₄Cl; a pH glass membrane behind it with an inner Ag/AgCl electrode in 0.1 M HCl; an external Ag/AgCl reference in saturated KCl; a meter connecting them. NH₃ diffuses through the membrane and changes the pH of the NH₄Cl layer.',
      items: [['Gas-permeable membrane at the tip that lets NH₃ (not ions) through', 1, true], ['0.1 M NH₄Cl solution between the gas membrane and the glass membrane', 1], ['pH glass membrane / pH electrode with inner 0.1 M HCl and an Ag/AgCl electrode', 2, true], ['Separate Ag/AgCl reference electrode in saturated KCl, both connected to the meter', 1], ['Principle: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ changes the inner pH, so E = constant − 59.2 log[NH₃]', 1]] }),
    written({ id: 'p-w-intf', label: 'Interferents', stem: 'Define an interferent in analytical chemistry, say how its effect is quantified for an ion-selective electrode, and give a possible interferent for the ammonia electrode.',
      explanation: 'An interferent is a species that interferes with measurement of the analyte, adding to or masking the signal. Its effect is quantified by the selectivity coefficient K(i,j)^pot, measured from the potential with and without the interferent. For the ammonia electrode: small amines that diffuse across the membrane.',
      items: [['An interferent is a species other than the analyte that affects the measured signal (adds to it or masks it)', 1, true], ['Quantified by the selectivity coefficient K(i,j)^pot from potentials measured with and without the interferent', 1, true], ['K^pot < 10⁻³ very weak, 10⁻³–1 intermediate, = 1 equally selective, > 1 prefers the interferent', 1], ['Ammonia electrode: low-molar-mass amines cross the gas-permeable membrane', 1]] }),
    written({ id: 'p-w-laf3', label: 'Fluoride electrode and TISAB', stem: 'Describe how the fluoride ion-selective electrode works, how F⁻ moves through the membrane, and why a TISAB solution is added to samples.',
      explanation: 'LaF₃ single crystal doped with EuF₂ gives vacancies; F⁻ hops between them. At the crystal/water interface F⁻ exchange sets a potential: E = const − 59.2 log a(F⁻). TISAB fixes ionic strength, buffers to pH 5–6 to avoid OH⁻ interference and CDTA complexes Al(III)/Fe(III).',
      items: [['LaF₃ single crystal doped with EuF₂; F⁻ moves by hopping between vacancies (defects)', 1, true], ['Interfacial F⁻ exchange sets a potential: E = const − 59.2 log a(F⁻) (negative slope for an anion)', 1, true], ['Internal solution 0.1 M NaCl/NaF with Ag/AgCl electrode gives a constant inner potential', 1], ['TISAB fixes the ionic strength so that the electrode responds to concentration', 1], ['TISAB buffers to pH 5–6 (acetate) to avoid OH⁻ interference, and CDTA frees F⁻ from Al(III)/Fe(III)', 1]] }),
    written({ id: 'p-w-lj', label: 'Liquid junction potential', stem: 'Explain how a liquid junction potential arises between 0.1 M HCl and 0.01 M HCl, and why it makes pH measurements less reliable when sample and calibration buffer have different ionic strengths.',
      explanation: 'H⁺ diffuses faster than Cl⁻ from the concentrated to the dilute side, so the dilute side charges positive; a steady state with a fixed potential difference results. That potential depends on ionic strength and temperature, so it differs between buffer and sample and adds an error that calibration does not remove.',
      items: [['Ions diffuse from the more concentrated to the less concentrated side', 1], ['H⁺ diffuses faster than Cl⁻, so charge separates: the dilute side becomes positive', 2, true], ['A steady state is reached with a constant potential difference: the LJP', 1], ['E_J depends on ionic strength/temperature, so a different value in sample and buffer is an error in E', 1]] }),
  ];
  add(node({ id: 'bk-m11-p-written', week: WEEK, title: 'Potentiometry: explain and draw', theme: THEME, tags: ['glass-electrode', 'fluoride-ise', 'ammonia-probe', 'junction-potential'], source: SRC, family: 'ise-written', mins: 7, variants }),
    { id: 'm11.p.written', name: 'Explain glass, fluoride, ammonia electrodes and the liquid junction potential', chunk: 'p-principles', marks: 5, tags: ['written'] });
}

export default out;
