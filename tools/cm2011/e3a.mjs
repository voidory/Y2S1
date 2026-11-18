import { range, choice, num, kw, calc, pick, node, sup } from './lib.mjs';

const SRC = 'Topic 3a · electrochemistry';
const WEEK = 3;
const THEME = 'Electrochemistry & Activities';
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });

/** Extended Debye-Hückel: γ = 10^( −0.51 z² √I / (1 + 3.3 α √I) ), α in nm. */
const gam = (z, alpha, I) => `10^(-(0.51 * ${z}^2 * sqrt(${I})) / (1 + 3.3 * ${alpha} * sqrt(${I})))`;
const DH_NOTE = 'Use −log γ = 0.51 z² √I / (1 + 3.3 α √I) with α in nm.';
const CONC = choice([0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1]);

const SALTS = [
  { f: 'NaCl', cat: 'Na⁺', zc: 1, nc: 1, ac: 0.4, an: 'Cl⁻', za: 1, na: 1, aa: 0.3 },
  { f: 'CaCl₂', cat: 'Ca²⁺', zc: 2, nc: 1, ac: 0.6, an: 'Cl⁻', za: 1, na: 2, aa: 0.3 },
  { f: 'ZnSO₄', cat: 'Zn²⁺', zc: 2, nc: 1, ac: 0.6, an: 'SO₄²⁻', za: 2, na: 1, aa: 0.4 },
  { f: 'K₂SO₄', cat: 'K⁺', zc: 1, nc: 2, ac: 0.3, an: 'SO₄²⁻', za: 2, na: 1, aa: 0.4 },
  { f: 'Fe(NO₃)₃', cat: 'Fe³⁺', zc: 3, nc: 1, ac: 0.9, an: 'NO₃⁻', za: 1, na: 3, aa: 0.3 },
  { f: 'MgCl₂', cat: 'Mg²⁺', zc: 2, nc: 1, ac: 0.8, an: 'Cl⁻', za: 1, na: 2, aa: 0.3 },
];
const Iof = (s, c = 'c') => `0.5 * ${c} * (${s.nc} * ${s.zc}^2 + ${s.na} * ${s.za}^2)`;

/* ---------- ionic strength ---------- */
{
  const single = SALTS.map((s) => calc({
    id: `e-ionic-${s.f.replace(/[^A-Za-z0-9]/g, '')}`, label: s.f, marks: 2,
    stem: `Calculate the ionic strength of a **{{fix(c,4)}} M ${s.f}** solution (fully dissociated).`,
    hint: 'I = ½ Σ cᵢ zᵢ² over every ion in solution, cations and anions.',
    explanation: `${s.f} gives ${s.nc} ${s.cat} (z = ${s.zc}) and ${s.na} ${s.an} (z = ${s.za}) per formula unit, so I = ½ c (${s.nc}×${s.zc}² + ${s.na}×${s.za}²).`,
    sampled: { c: CONC }, derived: { I: Iof(s), noHalf: `2 * (${Iof(s)})`, noSq: `0.5 * c * (${s.nc} * ${s.zc} + ${s.na} * ${s.za})` },
    fields: [num('I', 'Ionic strength I', 'M', 'I', { relTol: 0.005, paths: [{ label: 'You left out the ½.', expr: 'noHalf' }, { label: 'You used z instead of z² (the charge must be squared).', expr: 'noSq' }] })],
  }));
  const mixed = [
    { id: 'cacl-nacl', a: SALTS[1], b: SALTS[0], ca: 'choice([0.001, 0.002, 0.005])', cb: 'choice([0.05, 0.1, 0.2])' },
    { id: 'znso4-kcl', a: SALTS[2], b: { f: 'KCl', cat: 'K⁺', zc: 1, nc: 1, an: 'Cl⁻', za: 1, na: 1 }, ca: 'choice([0.002, 0.005, 0.01])', cb: 'choice([0.05, 0.1])' },
  ].map((m) => calc({
    id: `e-ionic-mix-${m.id}`, label: `${m.a.f} + ${m.b.f}`, marks: 3,
    stem: `A solution contains **{{fix(ca,4)}} M ${m.a.f}** and **{{fix(cb,3)}} M ${m.b.f}**. Calculate the ionic strength of the mixture, and the ionic strength if only the ${m.a.f} were present.`,
    explanation: 'Add the contribution of every ion from both salts: I = ½ Σ cᵢ zᵢ². The second salt dominates because its concentration is much higher.',
    sampled: { ca: choice(m.ca === 'choice([0.001, 0.002, 0.005])' ? [0.001, 0.002, 0.005] : [0.002, 0.005, 0.01]), cb: choice(m.cb === 'choice([0.05, 0.1, 0.2])' ? [0.05, 0.1, 0.2] : [0.05, 0.1]) },
    derived: { Ia: Iof(m.a, 'ca'), Ib: Iof(m.b, 'cb'), I: 'Ia + Ib' },
    fields: [num('Ia', `I of ${m.a.f} alone`, 'M', 'Ia', { relTol: 0.005 }), num('I', 'I of the mixture', 'M', 'I', { relTol: 0.005, paths: [{ label: 'You gave the ionic strength of one salt only; add both.', expr: 'Ib' }] })],
  }));
  add(node({ id: 'bk-m11-e-ionic', week: WEEK, title: 'Ionic strength', theme: THEME, tags: ['ionic-strength'], source: SRC, family: 'elec-activity', exam: 'short_2to3', mins: 2, variants: [...single, ...mixed] }),
    { id: 'm11.e.ionic', name: 'Ionic strength of a salt or a mixture', chunk: 'e-activity', marks: 2, tags: ['ionic-strength'] });
}

/* ---------- activity coefficient and activity ---------- */
{
  const variants = SALTS.filter((s) => s.zc >= 1).map((s) => calc({
    id: `e-gamma-${s.f.replace(/[^A-Za-z0-9]/g, '')}`, label: `${s.cat} in ${s.f}`, marks: 4,
    stem: `A solution is **{{fix(c,4)}} M ${s.f}**. Using the extended Debye–Hückel equation (−log γ = 0.51 z² √I / (1 + 3.3 α √I), α(${s.cat}) = ${s.ac} nm), calculate the ionic strength, the activity coefficient of ${s.cat}, and its activity.`,
    hint: DH_NOTE,
    explanation: `I = ½ Σ cz². Then −log γ = 0.51 z² √I / (1 + 3.3 α √I) with z = ${s.zc} and α = ${s.ac}. The activity a = γ × [${s.cat}] = γ × ${s.nc}c.`,
    sampled: { c: CONC },
    derived: { I: Iof(s), g: gam(s.zc, s.ac, 'I'), a: `g * ${s.nc} * c`, gLim: `10^(-0.51 * ${s.zc}^2 * sqrt(I))` },
    fields: [
      num('I', 'Ionic strength', 'M', 'I', { relTol: 0.005 }),
      num('g', `γ(${s.cat})`, '', 'g', { relTol: 0.015, sig: 3, paths: [{ label: 'You used the limiting law and left out the 1 + 3.3α√I term.', expr: 'gLim' }], ecf: [{ expr: gam(s.zc, s.ac, 'u_I'), label: 'Consistent with your own ionic strength, so the method earns part credit.' }] }),
      num('a', `a(${s.cat})`, 'M', 'a', { relTol: 0.02, sig: 3, ecf: [{ expr: `u_g * ${s.nc} * c`, label: 'Consistent with your own γ, so the method earns part credit.' }] }),
    ],
  }));
  add(node({ id: 'bk-m11-e-gamma', week: WEEK, title: 'Activity coefficient from ionic strength', theme: THEME, tags: ['activity-coefficient', 'debye-huckel'], source: SRC, family: 'elec-activity', mins: 5, variants }),
    { id: 'm11.e.gamma', name: 'Extended Debye–Hückel: γ and activity', chunk: 'e-activity', marks: 4, tags: ['activity-coefficient'] });
}

/* ---------- Nernst half-cell with activities ---------- */
const HALVES = [
  { id: 'zn', ion: 'Zn²⁺', z: 2, a: 0.6, E0: -0.763, n: 2, salt: SALTS[2], rxn: 'Zn²⁺ + 2e⁻ → Zn(s)' },
  { id: 'cu', ion: 'Cu²⁺', z: 2, a: 0.6, E0: 0.337, n: 2, salt: { f: 'CuSO₄', nc: 1, zc: 2, na: 1, za: 2 }, rxn: 'Cu²⁺ + 2e⁻ → Cu(s)' },
  { id: 'ag', ion: 'Ag⁺', z: 1, a: 0.25, E0: 0.799, n: 1, salt: { f: 'AgNO₃', nc: 1, zc: 1, na: 1, za: 1 }, rxn: 'Ag⁺ + e⁻ → Ag(s)' },
];
{
  const variants = HALVES.map((h) => calc({
    id: `e-half-${h.id}`, label: `${h.ion}/${h.ion.slice(0, 2).replace(/[⁺²]/g, '')}`, marks: 5,
    stem: `Calculate the electrode potential of a ${h.rxn.split(' ')[h.rxn.split(' ').length - 1].replace('(s)', '')} electrode in **{{fix(c,4)}} M ${h.salt.f}** (${h.rxn}, E° = ${h.E0 > 0 ? '+' : '−'}${Math.abs(h.E0)} V vs SHE; α(${h.ion}) = ${h.a} nm). Use **activities**.`,
    hint: `E = E° − (0.0592/n) log (1/a) = E° + (0.0592/n) log a. ${DH_NOTE}`,
    explanation: `I = ½ c(${h.salt.nc}×${h.salt.zc}² + ${h.salt.na}×${h.salt.za}²). γ from the extended Debye–Hückel equation. Then E = E° + (0.0592/${h.n}) log(γ·c) because the solid metal has unit activity.`,
    sampled: { c: CONC },
    derived: { I: Iof(h.salt), g: gam(h.z, h.a, 'I'), E: `${h.E0} + 0.05916 / ${h.n} * log(g * c)`, Ec: `${h.E0} + 0.05916 / ${h.n} * log(c)`, Ewrong: `${h.E0} - 0.05916 / ${h.n} * log(g * c)` },
    fields: [
      num('I', 'Ionic strength', 'M', 'I', { relTol: 0.005 }),
      num('g', 'γ', '', 'g', { relTol: 0.015, sig: 3 }),
      num('E', 'E (V vs SHE)', 'V', 'E', { relTol: 0.002, tol: 0.002, sig: 4, paths: [{ label: 'You used concentration instead of activity (γ = 1).', expr: 'Ec' }, { label: 'The sign of the log term is wrong for a reduction potential: E = E° + (0.0592/n) log a.', expr: 'Ewrong' }], ecf: [{ expr: `${h.E0} + 0.05916 / ${h.n} * log(u_g * c)`, label: 'Consistent with your own γ, so the method earns part credit.' }] }),
    ],
  }));
  add(node({ id: 'bk-m11-e-half', week: WEEK, title: 'Nernst equation for a metal / metal-ion electrode', theme: THEME, tags: ['nernst', 'activity'], source: SRC, family: 'elec-nernst', mins: 6, variants }),
    { id: 'm11.e.half', name: 'Electrode potential of M/Mⁿ⁺ using activities', chunk: 'e-nernst', marks: 5, tags: ['nernst'] });
}

/* ---------- Fe3+/Fe2+ half-cell with mixed ionic strength ---------- */
{
  const v = calc({
    id: 'e-fe-redox', label: 'Fe³⁺/Fe²⁺ redox electrode', marks: 7,
    stem: 'A platinum electrode dips into a solution of **{{fix(c3,5)}} M Fe(NO₃)₃** and **{{fix(c2,5)}} M Fe(NO₃)₂** (Fe³⁺ + e⁻ → Fe²⁺, E° = +0.771 V vs SHE; α(Fe³⁺) = 0.9 nm, α(Fe²⁺) = 0.6 nm). Calculate the total ionic strength, both activity coefficients, and the electrode potential using activities.',
    hint: 'Both salts contribute to I: Fe(NO₃)₃ gives ½c(9 + 3) = 6c; Fe(NO₃)₂ gives ½c(4 + 2) = 3c. E = E° − 0.0592 log(a(Fe²⁺)/a(Fe³⁺)).',
    explanation: 'I = 6c₃ + 3c₂. γ(Fe³⁺) and γ(Fe²⁺) from the extended Debye–Hückel equation at that I. E = 0.771 − 0.0592 log[(γ₂c₂)/(γ₃c₃)] (the ratio is reduced over oxidised).',
    sampled: { c3: choice([0.001, 0.00167, 0.003, 0.005]), c2: choice([0.005, 0.01333, 0.02, 0.04]) },
    derived: { I: '6 * c3 + 3 * c2', g3: gam(3, 0.9, 'I'), g2: gam(2, 0.6, 'I'), E: '0.771 - 0.05916 * log((g2 * c2) / (g3 * c3))', Econc: '0.771 - 0.05916 * log(c2 / c3)', Einv: '0.771 + 0.05916 * log((g2 * c2) / (g3 * c3))' },
    fields: [
      num('I', 'Total ionic strength', 'M', 'I', { relTol: 0.005, paths: [{ label: 'You counted only one of the two salts.', expr: '6 * c3' }] }),
      num('g3', 'γ(Fe³⁺)', '', 'g3', { relTol: 0.02, sig: 3, ecf: [{ expr: gam(3, 0.9, 'u_I'), label: 'Consistent with your own ionic strength, so the method earns part credit.' }] }),
      num('g2', 'γ(Fe²⁺)', '', 'g2', { relTol: 0.02, sig: 3, ecf: [{ expr: gam(2, 0.6, 'u_I'), label: 'Consistent with your own ionic strength, so the method earns part credit.' }] }),
      num('E', 'E (V vs SHE)', 'V', 'E', { relTol: 0.002, tol: 0.002, paths: [{ label: 'You used concentrations (γ = 1).', expr: 'Econc' }, { label: 'The ratio is upside down: E = E° − 0.0592 log(a_red / a_ox).', expr: 'Einv' }], ecf: [{ expr: '0.771 - 0.05916 * log((u_g2 * c2) / (u_g3 * c3))', label: 'Consistent with your own γ values, so the method earns part credit.' }] }),
    ],
  });
  add(node({ id: 'bk-m11-e-fe', week: WEEK, title: 'Fe³⁺/Fe²⁺ half-cell with activities', theme: THEME, tags: ['nernst', 'activity', 'ionic-strength'], source: SRC + ' · 2011-12 final Q2(a)', family: 'elec-nernst', mins: 8, variants: [v] }),
    { id: 'm11.e.fe', name: 'Redox couple in a mixed-electrolyte solution', chunk: 'e-nernst', marks: 7, tags: ['nernst', 'ionic-strength'] });
}

/* ---------- complete cell and spontaneity ---------- */
{
  const znI = '4 * c1';
  const znE = (g) => `-0.763 + 0.05916 / 2 * log(${g} * c1)`;
  const feE = (g3, g2) => `0.771 - 0.05916 * log((${g2} * c2) / (${g3} * c3))`;
  const printed = calc({
    id: 'e-cell-znfe', label: 'Zn | Zn²⁺ ‖ Fe³⁺, Fe²⁺', marks: 8,
    stem: 'Calculate the potential of the cell (using activities) and say whether the reaction is spontaneous as written:\n\n**Zn | ZnSO₄ (c = {{fix(c1,4)}} M) ‖ Fe(NO₃)₃ (c = {{fix(c3,5)}} M), Fe(NO₃)₂ (c = {{fix(c2,5)}} M) | Pt**\n\nE°(Zn²⁺/Zn) = −0.763 V, E°(Fe³⁺/Fe²⁺) = +0.771 V; α(Zn²⁺) = 0.6, α(Fe³⁺) = 0.9, α(Fe²⁺) = 0.6 nm.',
    hint: 'Each half-cell has its own ionic strength. E_cell = E_RHS − E_LHS, both written as reduction potentials.',
    explanation: 'LHS: I = 4c (ZnSO₄), E = E° + (0.0592/2) log(γc). RHS: I = 6c₃ + 3c₂, E = E° − 0.0592 log(a₂/a₃). E_cell = E_RHS − E_LHS. A positive E_cell means ΔG = −nFE is negative: spontaneous.',
    sampled: { c1: choice([0.01, 0.02, 0.05]), c3: choice([0.001, 0.00167, 0.003, 0.005]), c2: choice([0.005, 0.01333, 0.02, 0.04]) },
    derived: { gz: gam(2, 0.6, znI), Il: znI, Ir: '6 * c3 + 3 * c2', g3: gam(3, 0.9, 'Ir'), g2: gam(2, 0.6, 'Ir'), El: znE('gz'), Er: feE('g3', 'g2'), Ec: 'Er - El', sp: "Ec > 0 ? 'yes' : 'no'", Eswap: 'El - Er' },
    fields: [
      num('El', 'E_LHS (Zn)', 'V', 'El', { relTol: 0.002, tol: 0.002 }),
      num('Er', 'E_RHS (Fe)', 'V', 'Er', { relTol: 0.002, tol: 0.002 }),
      num('Ec', 'E_cell', 'V', 'Ec', { relTol: 0.003, tol: 0.003, paths: [{ label: 'You subtracted the wrong way round: E_cell = E_RHS − E_LHS.', expr: 'Eswap' }], ecf: [{ expr: 'u_Er - u_El', label: 'Consistent with your own half-cell values, so the method earns part credit.' }] }),
      kw('sp', 'Spontaneous?', ['yes', 'no'], 'sp', { synonyms: { yes: ['yes', 'spontaneous'], no: ['no', 'non-spontaneous', 'not spontaneous'] }, displays: { yes: 'yes (E_cell > 0, ΔG < 0)', no: 'no (E_cell < 0, ΔG > 0)' } }),
    ],
  });
  const cuag = (rev) => {
    const L = rev ? { ion: 'Ag', E0: 0.799, n: 1, z: 1, a: 0.25, c: 'c2', I: 'c2', f: 'AgNO₃' } : { ion: 'Cu', E0: 0.337, n: 2, z: 2, a: 0.6, c: 'c1', I: '4 * c1', f: 'CuSO₄' };
    const R = rev ? { ion: 'Cu', E0: 0.337, n: 2, z: 2, a: 0.6, c: 'c1', I: '4 * c1', f: 'CuSO₄' } : { ion: 'Ag', E0: 0.799, n: 1, z: 1, a: 0.25, c: 'c2', I: 'c2', f: 'AgNO₃' };
    const half = (h, g) => `${h.E0} + 0.05916 / ${h.n} * log(${g} * ${h.c})`;
    return calc({
      id: `e-cell-cuag${rev ? '-rev' : ''}`, label: `${L.ion} | ${L.f} ‖ ${R.f} | ${R.ion}`, marks: 6,
      stem: `Calculate the cell potential (using activities) and state whether the cell reaction is spontaneous as written:\n\n**${L.ion} | ${L.f} (${L.c === 'c1' ? '{{fix(c1,4)}}' : '{{fix(c2,4)}}'} M) ‖ ${R.f} (${R.c === 'c1' ? '{{fix(c1,4)}}' : '{{fix(c2,4)}}'} M) | ${R.ion}**\n\nE°(Cu²⁺/Cu) = +0.337 V, E°(Ag⁺/Ag) = +0.799 V; α(Cu²⁺) = 0.6, α(Ag⁺) = 0.25 nm.`,
      hint: 'The left electrode is written as the oxidation half-cell in the cell diagram, but E_cell = E_RHS − E_LHS uses reduction potentials for both.',
      explanation: 'For each half-cell: I from the salt, γ from extended Debye–Hückel, E = E° + (0.0592/n) log(γc). E_cell = E_RHS − E_LHS. Positive: spontaneous as written; negative: the reverse reaction is spontaneous.',
      sampled: { c1: choice([0.005, 0.01, 0.02, 0.05]), c2: choice([0.001, 0.005, 0.01, 0.05]) },
      derived: { gL: gam(L.z, L.a, L.I), gR: gam(R.z, R.a, R.I), El: half(L, 'gL'), Er: half(R, 'gR'), Ec: 'Er - El', sp: "Ec > 0 ? 'yes' : 'no'", Eswap: 'El - Er' },
      fields: [
        num('El', `E_LHS (${L.ion})`, 'V', 'El', { relTol: 0.002, tol: 0.002 }), num('Er', `E_RHS (${R.ion})`, 'V', 'Er', { relTol: 0.002, tol: 0.002 }),
        num('Ec', 'E_cell', 'V', 'Ec', { relTol: 0.003, tol: 0.003, paths: [{ label: 'You subtracted the wrong way round: E_cell = E_RHS − E_LHS.', expr: 'Eswap' }], ecf: [{ expr: 'u_Er - u_El', label: 'Consistent with your own half-cell values, so the method earns part credit.' }] }),
        kw('sp', 'Spontaneous?', ['yes', 'no'], 'sp', { synonyms: { yes: ['yes', 'spontaneous'], no: ['no', 'non-spontaneous', 'not spontaneous'] }, displays: { yes: 'yes (E_cell > 0, ΔG < 0)', no: 'no (E_cell < 0, ΔG > 0)' } }),
      ],
    });
  };
  add(node({ id: 'bk-m11-e-cell', week: WEEK, title: 'Cell potential with activities, and spontaneity', theme: THEME, tags: ['nernst', 'cell-potential', 'activity'], source: SRC + ' · 2011-12 final Q2(a)', family: 'elec-cell', mins: 9, variants: [printed, cuag(false), cuag(true)] }),
    { id: 'm11.e.cell', name: 'Full cell potential from two half-cells; spontaneity', chunk: 'e-nernst', marks: 8, tags: ['cell-potential'] });
}

/* ---------- E° from Ksp ---------- */
{
  const M = [
    { id: 'al', rxn: 'Al(OH)₃(s) + 3e⁻ ⇌ Al(s) + 3OH⁻(aq)', n: 3, E0: -1.662, ion: 'Al³⁺/Al', m: choice([3, 1, 5]), e: -34, solid: 'Al(OH)₃' },
    { id: 'zn', rxn: 'Zn(OH)₂(s) + 2e⁻ ⇌ Zn(s) + 2OH⁻(aq)', n: 2, E0: -0.763, ion: 'Zn²⁺/Zn', m: choice([3, 1, 5]), e: -17, solid: 'Zn(OH)₂' },
    { id: 'mg', rxn: 'Mg(OH)₂(s) + 2e⁻ ⇌ Mg(s) + 2OH⁻(aq)', n: 2, E0: -2.37, ion: 'Mg²⁺/Mg', m: choice([7, 2, 5]), e: -12, solid: 'Mg(OH)₂' },
    { id: 'agcl', rxn: 'AgCl(s) + e⁻ ⇌ Ag(s) + Cl⁻(aq)', n: 1, E0: 0.799, ion: 'Ag⁺/Ag', m: choice([1.8, 1, 3]), e: -10, solid: 'AgCl' },
  ];
  const variants = M.map((m) => calc({
    id: `e-ksp-${m.id}`, label: m.solid, marks: 6,
    stem: `The solubility product of ${m.solid} is *K*sp = $\${{sci(ksp, 1)}}$. Given E°(${m.ion}) = ${m.E0 > 0 ? '+' : '−'}${Math.abs(m.E0)} V, calculate E° for\n\n${m.rxn}`.replace('$$', '$'),
    hint: 'Split it into two steps you can add: the solid dissolving (E° from Ksp: E° = (0.05916/n) log K) and the ion being reduced.',
    explanation: `(1) ${m.solid} ⇌ ion + OH⁻/Cl⁻ with K = Ksp, so E°₁ = (0.05916/${m.n}) log Ksp. (2) the metal ion is reduced, E°₂ = ${m.E0} V. Adding the two reactions adds the potentials (same n): E° = E°₁ + E°₂.`,
    sampled: { km: m.m },
    derived: { ksp: `km * 10^(${m.e})`, E1: `0.05916 / ${m.n} * log(ksp)`, Et: `${m.E0} + E1`, wrong: `${m.E0} - E1`, noN: `0.05916 * log(ksp) + ${m.E0}` },
    fields: [
      num('E1', 'E° of the dissolution step', 'V', 'E1', { relTol: 0.005, tol: 0.003, paths: m.n === 1 ? [] : [{ label: 'You left out the 1/n: E° = (0.0592/n) log K.', expr: '0.05916 * log(ksp)' }] }),
      num('Et', 'E° of the overall reaction', 'V', 'Et', { relTol: 0.003, tol: 0.003, paths: [{ label: 'The dissolution E° must be added with its own sign, not subtracted.', expr: 'wrong' }].concat(m.n === 1 ? [] : [{ label: 'You left out the 1/n in the dissolution step.', expr: 'noN' }]), ecf: [{ expr: `${m.E0} + u_E1`, label: 'Consistent with your own dissolution E°, so the method earns part credit.' }] }),
    ],
  }));
  add(node({ id: 'bk-m11-e-ksp', week: WEEK, title: 'E° of a sparingly soluble salt electrode from Ksp', theme: THEME, tags: ['ksp', 'standard-potential'], source: SRC + ' · 2011-12 final Q2(c)', family: 'elec-ksp', mins: 6, variants }),
    { id: 'm11.e.ksp', name: 'Combine Ksp with E° to get E° of a metal / insoluble-salt electrode', chunk: 'e-nernst', marks: 6, tags: ['ksp'] });
}

/* ---------- ΔG and K ---------- */
{
  const a = calc({
    id: 'e-dg', label: 'E° to ΔG° and K', marks: 4,
    stem: 'A cell reaction transferring **{{fix(n,0)}} electrons** has E°_cell = **{{fix(E,2)}} V** at 298 K. Calculate ΔG° (kJ/mol, F = 96485 C/mol) and log K.',
    explanation: 'ΔG° = −nFE° (divide by 1000 for kJ). log K = nE°/0.05916. A positive E° means a negative ΔG° and K > 1.',
    sampled: { n: choice([1, 2, 3, 6]), E: range(0.20, 1.60, 0.01, 2) },
    derived: { dG: '-n * 96485 * E / 1000', lk: 'n * E / 0.05916' },
    fields: [num('dG', 'ΔG°', 'kJ/mol', 'dG', { relTol: 0.005, paths: [{ label: 'The sign is wrong: a positive E° means a negative ΔG°.', expr: 'n * 96485 * E / 1000' }, { label: 'You forgot n.', expr: '-96485 * E / 1000' }] }), num('lk', 'log K', '', 'lk', { relTol: 0.01, sig: 4, ecf: [{ expr: '-u_dG * 1000 / (96485 * 0.05916 * 2.302585)', label: 'Consistent with your own ΔG°, so the method earns part credit.' }] })],
  });
  const b = calc({
    id: 'e-k-e', label: 'K to E°', marks: 3,
    stem: 'An equilibrium constant K = $\${{sci(K, 2)}}$ is found for a reaction with n = {{fix(n,0)}} at 298 K. Calculate E°_cell.'.replace('$$', '$'),
    explanation: 'E° = (0.05916/n) log K. K > 1 means E° > 0.',
    sampled: { n: choice([1, 2, 3]), km: choice([1.0, 2.5, 6.0]), ex: range(-12, 25, 1, 0) },
    derived: { K: 'km * 10^ex', E: '0.05916 / n * log(K)' },
    fields: [num('E', 'E°', 'V', 'E', { relTol: 0.01, tol: 0.003, paths: [{ label: 'You left out the 1/n.', expr: '0.05916 * log(K)' }] })],
  });
  add(node({ id: 'bk-m11-e-thermo', week: WEEK, title: 'E°, ΔG° and K', theme: THEME, tags: ['gibbs', 'equilibrium-constant'], source: SRC, family: 'elec-thermo', mins: 3, variants: [a, b] }),
    { id: 'm11.e.thermo', name: 'Convert between E°, ΔG° and K', chunk: 'e-nernst', marks: 3, tags: ['gibbs'] });
}

/* ---------- concepts ---------- */
{
  const variants = [
    pick({ id: 'e-c-gamma', label: 'Effect of ionic strength', stem: 'As the ionic strength of a dilute solution increases, the activity coefficient of an ion:', explanation: 'Each ion is surrounded by an ionic atmosphere of opposite charge that lowers its effective concentration, so γ < 1 and falls as I rises (in dilute solution; at high I it eventually climbs again).', options: [['a', 'decreases below 1'], ['b', 'increases above 1'], ['c', 'stays at 1'], ['d', 'depends only on the temperature']], correct: 'a' }),
    pick({ id: 'e-c-charge', label: 'Charge and γ', stem: 'In the same solution, which ion has the **smallest** activity coefficient?', explanation: 'γ depends on z². A more highly charged ion feels a stronger ionic atmosphere: −log γ ∝ z². Fe³⁺ (z² = 9) is lowest.', options: [['a', 'Fe³⁺'], ['b', 'Zn²⁺'], ['c', 'Na⁺'], ['d', 'Cl⁻']], correct: 'a' }),
    pick({ id: 'e-c-spont', label: 'Spontaneity', stem: 'A cell has E_cell = −0.35 V as written. Which statement is right?', explanation: 'ΔG = −nFE_cell, so a negative E_cell means ΔG > 0: the reaction as written is **not** spontaneous (the reverse reaction is).', options: [['a', 'ΔG > 0; the reverse reaction is spontaneous'], ['b', 'ΔG < 0; spontaneous as written'], ['c', 'ΔG = 0; at equilibrium'], ['d', 'E_cell must be recalculated with positive sign']], correct: 'a' }),
    pick({ id: 'e-c-solid', label: 'Pure solids in Q', stem: 'Why does the solid metal not appear in the Nernst equation for M^n+ + ne⁻ → M(s)?', explanation: 'The activity of a pure solid is defined as 1, so the reaction quotient contains only a(M^n+).', options: [['a', 'a pure solid has activity 1'], ['b', 'a solid does not take part in the reaction'], ['c', 'its concentration is zero'], ['d', 'metals have no charge']], correct: 'a' }),
  ];
  add(node({ id: 'bk-m11-e-concepts', week: WEEK, title: 'Electrochemistry: concepts', theme: THEME, tags: ['nernst', 'concepts'], source: SRC, family: 'elec-concept', tier: 'atomic', exam: 'mcq_1mark', diff: 2, mins: 1, variants }),
    { id: 'm11.e.concepts', name: 'Activity, spontaneity and the Nernst equation: concepts', chunk: 'e-activity', marks: 1, tags: ['concepts'] });
}

export default out;
