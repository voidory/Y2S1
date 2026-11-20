import { range, choice, num, calc, written, tableRows, node } from './lib.mjs';

/* ISE calibration with a dilution chain (Topic 3b). The finals ask it in five of the last six papers: read a sample's potential
   against a calibration line (E against log c), then carry the concentration back through the dilution steps to the original
   sample, sometimes on to a mass or a weight percent (the 2025-26 Kjeldahl question with the ammonia probe). Constant ionic
   strength (ISA or TISAB) makes concentration stand in for activity. Data are drawn so the standards lie exactly on a Nernstian
   line before rounding; every answer is computed from the displayed (rounded) values. No printed answer was available for these
   chains, so the tests check them against hand calculations. */
const SRC = 'Topic 3b · calibration with a dilution chain (finals style)';
const THEME = 'Potentiometry';
const WEEK = 4;
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });

const STD = tableRows(['c (M)', 'E (mV)'], [['1.0 × 10⁻⁴', '{{fix(E1,1)}}'], ['1.0 × 10⁻³', '{{fix(Em,1)}}'], ['1.0 × 10⁻²', '{{fix(E3,1)}}']]);

const kBlood = calc({
  id: 'chain-k', label: 'K⁺ electrode: calibration line and two dilutions (8 marks)', marks: 8,
  stem: `A K⁺ ion-selective electrode is calibrated with standards made up in a constant background electrolyte, so concentration can be used in place of activity:\n\n${STD}\n\nA serum sample is diluted in two steps: **{{fix(Va,0)}} mL** is made up to **{{fix(Vb,0)}} mL**, then **{{fix(Vc,0)}} mL** of that solution is made up to **{{fix(Vd,0)}} mL**. The final solution gives **{{fix(Ex,1)}} mV**. Use the line through the two end standards.\n\n(a) Find the slope of the calibration (mV per decade).\n(b) Find log c for the final solution, and its concentration.\n(c) What is the overall dilution factor?\n(d) What is the K⁺ concentration of the original serum?`,
  hint: 'Slope = (E at 10⁻² M − E at 10⁻⁴ M)/2 decades. log c = −4 + (E − E₁)/slope with E₁ the reading at 10⁻⁴ M. Dilution factor = (V_b/V_a) × (V_d/V_c); multiply the measured concentration by it.',
  explanation: 'The two end standards are two decades apart, so the slope is (E₃ − E₁)/2 = {{fix(sl,2)}} mV per decade (close to the Nernstian 59 mV for a cation). A reading is converted by log c = −4 + (E − E₁)/slope = {{fix(lgx,2)}}, so the measured solution holds ${{sci(cx,2)}}$ M. Each dilution divides the concentration, so the original is the measured value times both factors: ({{fix(Vb,0)}}/{{fix(Va,0)}}) × ({{fix(Vd,0)}}/{{fix(Vc,0)}}) = {{fix(DF,1)}}, giving ${{sci(c0,2)}}$ M. Constant ionic strength is what lets concentration replace activity.',
  sampled: {
    s: choice([57.0, 57.8, 58.5, 59.0, 59.2]), b0: range(150, 260, 0.5, 1), lg: range(-3.9, -2.6, 0.1, 1),
    Va: choice([10, 20, 25]), Vb: choice([100, 250]), Vc: choice([10, 20, 25]), Vd: choice([50]),
  },
  derived: {
    E1: 'round(b0, 1)', Em: 'round(b0 + s, 1)', E3: 'round(b0 + 2 * s, 1)', Ex: 'round(b0 + s * (lg + 4), 1)',
    sl: '(E3 - E1) / 2', lgx: '-4 + (Ex - E1) / sl', cx: '10^lgx', DF: '(Vb / Va) * (Vd / Vc)', c0: 'cx * DF',
  },
  fields: [
    num('sl', 'Slope', 'mV/decade', 'sl', { relTol: 0.01, sig: 3, paths: [{ label: 'The end standards are two decades apart: divide the potential difference by 2.', expr: 'E3 - E1' }] }),
    num('lgx', 'log c of the final solution', '', 'lgx', { tol: 0.04, sig: 3, ecf: [{ expr: '-4 + (Ex - E1) / u_sl', label: 'Consistent with your own slope.' }] }),
    num('cx', 'Concentration of the final solution', 'M', 'cx', { relTol: 0.06, sig: 3, ecf: [{ expr: '10^u_lgx', label: 'Consistent with your own log c.' }] }),
    num('DF', 'Overall dilution factor', '', 'DF', { relTol: 0.005, sig: 3, paths: [{ label: 'Both dilutions count: multiply (V_b/V_a) by (V_d/V_c).', expr: 'Vb / Va' }, { label: 'The dilution factor is final volume over the volume taken, not the reverse.', expr: '(Va / Vb) * (Vc / Vd)' }] }),
    num('c0', 'K⁺ in the original serum', 'M', 'c0', { relTol: 0.07, sig: 3, paths: [
      { label: 'The measured solution is dilute: multiply by the dilution factor to get back to the original, not divide.', expr: 'cx / DF' },
      { label: 'Both dilution steps must be undone, not just the first.', expr: 'cx * Vb / Va' },
    ], ecf: [{ expr: 'u_cx * u_DF', label: 'Consistent with your own concentration and dilution factor.' }] }),
  ],
});

const kjeldahl = calc({
  id: 'chain-nh3', label: 'Ammonia probe in a Kjeldahl analysis: calibration, dilution and weight % N (10 marks)', marks: 10,
  stem: `An ammonia gas-sensing electrode (its potential falls as the NH₃ concentration rises) is calibrated with standards in a constant background:\n\n${STD}\n\nA **{{fix(m,2)}} g** food sample is digested by the Kjeldahl method, made alkaline and made up to **{{fix(Vt,0)}} mL**. **{{fix(Va,0)}} mL** of this solution is diluted to **{{fix(Vb,0)}} mL** and gives **{{fix(Ex,1)}} mV**. Use the line through the two end standards.\n\n(a) Find the slope of the calibration.\n(b) Find log c and the NH₃ concentration of the diluted solution.\n(c) What was the concentration in the {{fix(Vt,0)}} mL solution?\n(d) How many mg of nitrogen does the sample contain (N = 14.01 g mol⁻¹)?\n(e) What is the weight percent nitrogen in the food?`,
  hint: 'Slope = (E at 10⁻² M − E at 10⁻⁴ M)/2; for a gas probe it is negative. log c = −4 + (E − E₁)/slope. Undo the dilution (× V_b/V_a), then n(N) = c × V_t, mass = n × 14.01, % N = mass/sample mass × 100.',
  explanation: 'Slope = (E₃ − E₁)/2 = {{fix(sl,2)}} mV per decade (negative for a gas probe whose reading falls as NH₃ rises). log c = −4 + (E − E₁)/slope = {{fix(lgx,2)}}, so the diluted solution holds ${{sci(cm,2)}}$ M. Undoing the dilution: ${{sci(cd,2)}}$ M in the {{fix(Vt,0)}} mL. Moles of N = c × V = {{fix(nN * 1000,2)}} mmol, so {{fix(mN,1)}} mg of nitrogen, which is {{fix(pct,1)}}% of the {{fix(m,2)}} g sample. Each mole of nitrogen in the protein gives one mole of NH₃, which is why moles of NH₃ equal moles of N.',
  sampled: {
    s: choice([-57.0, -58.0, -59.0, -59.2, -60.0]), b0: range(380, 460, 0.5, 1), m: choice([0.50, 0.75, 1.00]), pct0: range(8, 22, 0.1, 1),
    Vt: choice([250, 500]), Va: choice([5, 10]), Vb: choice([100, 250]),
  },
  derived: {
    mN0: 'pct0 * m * 10', c0m: 'mN0 / 14.01 / Vt * Va / Vb', lg0: 'log(c0m)',
    E1: 'round(b0, 1)', Em: 'round(b0 + s, 1)', E3: 'round(b0 + 2 * s, 1)', Ex: 'round(b0 + s * (lg0 + 4), 1)',
    sl: '(E3 - E1) / 2', lgx: '-4 + (Ex - E1) / sl', cm: '10^lgx', cd: 'cm * Vb / Va', nN: 'cd * Vt / 1000', mN: 'nN * 14.01 * 1000', pct: 'mN / (m * 10)',
  },
  fields: [
    num('sl', 'Slope', 'mV/decade', 'sl', { relTol: 0.01, sig: 3, paths: [{ label: 'The end standards are two decades apart: divide the potential difference by 2.', expr: 'E3 - E1' }] }),
    num('lgx', 'log c of the diluted solution', '', 'lgx', { tol: 0.04, sig: 3, paths: [{ label: 'A gas probe has a negative slope: use the sign you found in (a).', expr: '-4 + (Ex - E1) / abs(sl)' }], ecf: [{ expr: '-4 + (Ex - E1) / u_sl', label: 'Consistent with your own slope.' }] }),
    num('cm', 'NH₃ in the diluted solution', 'M', 'cm', { relTol: 0.06, sig: 3, ecf: [{ expr: '10^u_lgx', label: 'Consistent with your own log c.' }] }),
    num('cd', 'NH₃ in the digest solution', 'M', 'cd', { relTol: 0.07, sig: 3, paths: [{ label: 'Undo the dilution by multiplying by V_b/V_a.', expr: 'cm * Va / Vb' }], ecf: [{ expr: 'u_cm * Vb / Va', label: 'Consistent with your own concentration.' }] }),
    num('mN', 'Nitrogen in the sample', 'mg', 'mN', { relTol: 0.08, sig: 3, paths: [
      { label: 'You left out the dilution before scaling up to the full volume.', expr: 'cm * Vt * 14.01' },
      { label: 'That is the mass of NH₃ (17.04 g mol⁻¹); the question asks for nitrogen (14.01).', expr: 'cd * Vt * 17.04' },
    ], ecf: [{ expr: 'u_cd * Vt * 14.01', label: 'Consistent with your own concentration.' }] }),
    num('pct', 'Weight % N', '%', 'pct', { relTol: 0.08, sig: 3, ecf: [{ expr: 'u_mN / (m * 10)', label: 'Consistent with your own mass of nitrogen.' }] }),
  ],
});

const why = written({
  id: 'chain-why', label: 'Why dilute the sample and keep the ionic strength constant (3 marks)',
  stem: 'A K⁺ ISE is calibrated in a constant background electrolyte, and a blood sample is diluted before measurement. Give **three** reasons for these choices.',
  hint: 'Think about the electrode\'s working range, what the electrode really responds to, and the junction potential.',
  explanation: 'Dilution brings the concentration into the electrode\'s linear range (about 10⁻⁵ to 10⁻¹ M). A constant background ionic strength keeps the activity coefficient the same in the standards and in the sample, so the electrode, which responds to activity, follows concentration. The same background also keeps the liquid junction potential the same in every solution.',
  items: [['Dilution brings the concentration into the linear range of the electrode', 1], ['A constant ionic strength keeps the activity coefficient constant, so the response follows concentration', 1], ['It keeps the junction potential constant between standards and sample', 1]],
});

add(node({
  id: 'bk-m11-p-chain', week: WEEK, title: 'ISE calibration with a dilution chain', theme: THEME, tags: ['calibration', 'dilution'], source: SRC, family: 'ise-chain', mins: 9, exam: 'construct_4to6',
  variants: [kBlood, kjeldahl, why],
}), { id: 'm11.p.chain', name: 'Calibration line, dilution chain back to the sample, and weight % N', chunk: 'p-calibration', marks: 5, tags: ['calibration', 'dilution'] });

export default out;
