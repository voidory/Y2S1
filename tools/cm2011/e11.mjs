import { choice, range, num, calc, pick, written, node } from './lib.mjs';
import { dhSlips, dhDerived, dhLine } from './e3a.mjs';

/* pH of a strong acid by concentrations and by activities (Topic 3a). Anchor: the 2024/25 final, 0.025 M HCl in 0.025 M Na₂SO₄
   (I = 0.1, γ(H⁺) = 0.83 from the booklet table, pH 1.60 by concentration and 1.68 by activity). The pH meter reports −log a(H⁺). */

const SRC = 'Topic 3a · electrochemistry · 2024/25 final Q2';
const WEEK = 3;
const THEME = 'Electrochemistry & Activities';
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });

/** Extended Debye–Hückel for H⁺ (z = 1, α = 0.9 nm). */
const gH = (I) => `10^(-(0.51 * sqrt(${I})) / (1 + 3.3 * 0.9 * sqrt(${I})))`;
const gLimit = (I) => `10^(-0.51 * sqrt(${I}))`;
const HINT = 'a(H⁺) = γ·[H⁺] and pH = −log a(H⁺). Ionic strength I = ½ Σ cᵢzᵢ² over every ion, including the acid and its anion. γ from −log γ = 0.51 z² √I / (1 + 3.3 α √I), with α(H₃O⁺) = 0.9 nm (or read the booklet table).';

const BG = [
  { id: 'na2so4', f: 'Na₂SO₄', k: 3, ions: 'Na⁺ ×2 and SO₄²⁻', calc: '(2 × 1² + 1 × 2²)', cs: [0.02, 0.025, 0.05, 0.1] },
  { id: 'nacl', f: 'NaCl', k: 1, ions: 'Na⁺ and Cl⁻', calc: '(1 × 1² + 1 × 1²)', cs: [0.025, 0.05, 0.1, 0.2] },
  { id: 'mgso4', f: 'MgSO₄', k: 4, ions: 'Mg²⁺ and SO₄²⁻', calc: '(1 × 2² + 1 × 2²)', cs: [0.01, 0.02, 0.025, 0.05] },
];

/* ---------- strong acid in a background salt (the printed question) ---------- */
{
  const variants = BG.map((b) => calc({
    id: `e-ph-${b.id}`, label: `HCl in ${b.f}`, marks: 5,
    stem: `A solution contains **{{fix(ca,3)}} M HCl** and **{{fix(cs,3)}} M ${b.f}**. Give the pH (a) from concentrations and (b) from activities, which is what a pH meter responds to. Use the extended Debye–Hückel equation with α(H₃O⁺) = 0.9 nm, and give the ionic strength and γ(H⁺) on the way.`,
    hint: HINT,
    explanation: `By concentration: pH = −log {{fix(ca,3)}} = {{fix(pc,2)}}. Ionic strength: HCl gives H⁺ and Cl⁻ (I = ½ × 2 × {{fix(ca,3)}} = {{fix(ca,3)}} M) and ${b.f} gives ${b.ions}, which adds ${b.k}c = {{fix(Ibg,3)}} M, so I = {{fix(I,3)}} M. Then ${dhLine('H⁺', 1, 0.9)}. Activity: a(H⁺) = γ × [H⁺] = {{fix(g,3)}} × {{fix(ca,3)}} = {{fix(aH,4)}} M, so pH = −log {{fix(aH,4)}} = {{fix(pa,2)}}. The activity pH is higher by {{fix(d,2)}} because the ionic atmosphere lowers the effective concentration of H⁺ (γ < 1).`,
    sampled: { ca: choice([0.01, 0.02, 0.025, 0.05]), cs: choice(b.cs) },
    derived: {
      Ibg: `${b.k} * cs`, I: 'ca + Ibg', g: gH('I'), ...dhDerived(1, 0.9), pc: '-log(ca)', aH: 'g * ca', pa: '-log(g * ca)', d: 'pa - pc',
      onlyBg: `-log(${gH('Ibg')} * ca)`, lim: `-log(${gLimit('I')} * ca)`, divided: '-log(ca / g)', lnSlip: '-ln(g * ca)', gOnly: '-log(g)',
    },
    fields: [
      num('pc', 'pH from concentration', '', 'pc', { relTol: 0.004, tol: 0.01, sig: 3 }),
      num('I', 'Ionic strength I', 'M', 'I', { relTol: 0.01, paths: [{ label: 'You counted only the background salt; the HCl contributes too.', expr: 'Ibg' }, { label: 'You counted only the HCl; the background salt contributes too.', expr: 'ca' }] }),
      num('g', 'γ(H⁺)', '', 'g', { relTol: 0.015, sig: 3, paths: dhSlips(1, 0.9), ecf: [{ expr: gH('u_I'), label: 'Consistent with your own ionic strength, so the method earns part credit.' }] }),
      num('pa', 'pH from activity', '', 'pa', {
        relTol: 0.004, tol: 0.01, sig: 3,
        paths: [{ label: 'You used the concentration (γ = 1); a pH meter responds to activity.', expr: 'pc' }, { label: 'You used the limiting law (no 1 + 3.3α√I term).', expr: 'lim' }, { label: 'You divided by γ; the activity is a = γ × [H⁺], so multiply.', expr: 'divided' }, { label: 'You used ln instead of log10: pH = −log10 a(H⁺).', expr: 'lnSlip' }, { label: 'You took −log γ on its own; pH = −log(γ × [H⁺]), which includes the concentration.', expr: 'gOnly' }],
        ecf: [{ expr: '-log(u_g * ca)', label: 'Consistent with your own γ, so the method earns part credit.' }],
      }),
    ],
  }));
  add(node({ id: 'bk-m11-e-ph', week: WEEK, title: 'pH from activities: a strong acid in a salt solution', theme: THEME, tags: ['ph', 'activity', 'ionic-strength'], source: SRC, family: 'elec-ph', mins: 6, variants }),
    { id: 'm11.e.ph', name: 'pH from concentration and from activity (acid in a background salt)', chunk: 'e-activity', marks: 4, tags: ['ph', 'activity'] });
}

/* ---------- strong acid alone, and the reverse problem ---------- */
{
  const alone = ['HCl', 'HNO₃'].map((acid) => calc({
    id: `e-ph-alone-${acid === 'HCl' ? 'hcl' : 'hno3'}`, label: `${acid} in water`, marks: 4,
    stem: `A solution of **{{fix(ca,4)}} M ${acid}** in pure water (fully dissociated). Calculate the ionic strength, γ(H⁺) (extended Debye–Hückel, α(H₃O⁺) = 0.9 nm), and the pH both from concentration and from activity.`,
    hint: HINT,
    explanation: `${acid} gives H⁺ and its anion, so I = ½ (c + c) = ½ ({{fix(ca,4)}} + {{fix(ca,4)}}) = {{fix(I,4)}} M. Then ${dhLine('H⁺', 1, 0.9)}. pH from concentration = −log {{fix(ca,4)}} = {{fix(pc,2)}}; from activity = −log({{fix(g,3)}} × {{fix(ca,4)}}) = {{fix(pa,2)}}. In a dilute solution the two nearly agree; the gap widens as I rises.`,
    sampled: { ca: choice([0.002, 0.005, 0.01, 0.02, 0.05, 0.1]) },
    derived: { I: 'ca', g: gH('I'), ...dhDerived(1, 0.9), pc: '-log(ca)', pa: '-log(g * ca)', lim: `-log(${gLimit('I')} * ca)`, divided: '-log(ca / g)' },
    fields: [
      num('g', 'γ(H⁺)', '', 'g', { relTol: 0.015, sig: 3, paths: dhSlips(1, 0.9) }),
      num('pc', 'pH from concentration', '', 'pc', { relTol: 0.004, tol: 0.01, sig: 3 }),
      num('pa', 'pH from activity', '', 'pa', { relTol: 0.003, tol: 0.006, sig: 3, paths: [{ label: 'You used the concentration (γ = 1); a pH meter responds to activity.', expr: 'pc' }, { label: 'You divided by γ; the activity is a = γ × [H⁺], so multiply.', expr: 'divided' }], ecf: [{ expr: '-log(u_g * ca)', label: 'Consistent with your own γ, so the method earns part credit.' }] }),
    ],
  }));
  const reverse = BG.map((b) => calc({
    id: `e-ph-rev-${b.id}`, label: `Find [H⁺] from a meter reading (${b.f})`, marks: 4,
    stem: `A pH meter reads **{{fix(pm,2)}}** in a solution of HCl made up in **{{fix(cs,3)}} M ${b.f}**. The acid is dilute, so take the ionic strength as that of the ${b.f} alone. Calculate γ(H⁺) (extended Debye–Hückel, α = 0.9 nm), a(H⁺) and the molar concentration of H⁺.`,
    hint: 'The meter reports −log a(H⁺), so a(H⁺) = 10^(−pH). Concentration = activity ÷ γ.',
    explanation: `I = ${b.k} × {{fix(cs,3)}} = {{fix(I,3)}} M (${b.f}: ${b.ions}), so ${dhLine('H⁺', 1, 0.9)}. The meter reading is the activity pH: a(H⁺) = 10^(−{{fix(pm,2)}}) = {{fix(aH,5)}} M. Concentration = a/γ = {{fix(aH,5)}} / {{fix(g,3)}} = {{fix(cH,5)}} M, larger than the activity because γ < 1.`,
    sampled: { pm: range(1.50, 3.00, 0.01, 2), cs: choice(b.cs) },
    derived: { I: `${b.k} * cs`, g: gH('I'), ...dhDerived(1, 0.9), aH: '10^(-pm)', cH: 'aH / g', times: 'aH * g' },
    fields: [
      num('g', 'γ(H⁺)', '', 'g', { relTol: 0.015, sig: 3, paths: dhSlips(1, 0.9) }),
      num('aH', 'a(H⁺)', 'M', 'aH', { relTol: 0.02, sig: 3, paths: [{ label: 'You took 10^(+pH); the activity is 10^(−pH).', expr: '10^(pm)' }, { label: 'You used ln-style decay: a(H⁺) = 10^(−pH), a base-10 power, not e^(−pH).', expr: 'exp(-pm)' }] }),
      num('cH', '[H⁺]', 'M', 'cH', { relTol: 0.025, sig: 3, paths: [{ label: 'You took the activity as the concentration; divide by γ.', expr: 'aH' }, { label: 'You multiplied by γ; the concentration is the activity divided by γ.', expr: 'times' }], ecf: [{ expr: 'u_aH / u_g', label: 'Consistent with your own a(H⁺) and γ, so the method earns part credit.' }] }),
    ],
  }));
  add(node({ id: 'bk-m11-e-ph2', week: WEEK, title: 'pH from activities: acid alone, and finding [H⁺] from a reading', theme: THEME, tags: ['ph', 'activity'], source: SRC, family: 'elec-ph', mins: 5, variants: [...alone, ...reverse] }),
    { id: 'm11.e.ph2', name: 'pH of an acid in water, and [H⁺] from a pH reading', chunk: 'e-activity', marks: 3, tags: ['ph', 'activity'] });
}

/* ---------- explanations and concepts ---------- */
{
  const variants = [
    written({
      id: 'e-ph-why', label: 'Why the two pH values differ',
      stem: 'The pH of a 0.025 M HCl solution that also contains 0.025 M Na₂SO₄ is higher when calculated from activities than from concentrations. Explain why, and say which value a pH meter reports.',
      explanation: 'A pH meter responds to the activity of H⁺, a = γ[H⁺], so it reports −log a(H⁺). In a solution of appreciable ionic strength each H⁺ is surrounded by an ionic atmosphere of oppositely charged ions that reduces its effective concentration, so γ < 1 and a < [H⁺]. A smaller activity means a higher pH than the concentration alone predicts, and the gap grows with ionic strength (it vanishes as I → 0).',
      items: [['A pH meter (glass electrode) responds to the activity of H⁺, a = γ[H⁺], not to its concentration', 1, true], ['The other ions (Na⁺, SO₄²⁻, Cl⁻) form an ionic atmosphere around H⁺ so it behaves as if less concentrated: γ < 1', 1, true], ['So a(H⁺) is smaller than [H⁺] and pH = −log a is higher; the difference grows with ionic strength', 1]],
    }),
    pick({
      id: 'e-ph-salt', label: 'Adding an inert salt to an acid',
      stem: 'A 0.010 M HCl solution is read on a pH meter, then NaCl is dissolved in it to 0.10 M. Na⁺ and Cl⁻ do not react with H⁺. The meter reading:',
      explanation: 'The added salt raises the ionic strength, so γ(H⁺) falls and a(H⁺) falls even though [H⁺] is unchanged. The meter reports −log a(H⁺), so the reading rises slightly.',
      options: [['up', 'rises slightly, because γ(H⁺) falls as the ionic strength rises'], ['down', 'falls, because the extra Cl⁻ makes the solution more acidic'], ['same', 'stays the same, because Na⁺ and Cl⁻ do not react with H⁺'], ['neut', 'moves towards 7, because the salt is neutral']], correct: 'up',
    }),
    pick({
      id: 'e-ph-meter', label: 'What a pH meter measures',
      stem: 'The glass electrode in a pH meter responds to which quantity?',
      explanation: 'The interface potential depends on a(H⁺), so the meter reads −log a(H⁺). It equals −log [H⁺] only when γ ≈ 1, in dilute solution.',
      options: [['act', 'the activity of H⁺, a = γ[H⁺]'], ['conc', 'the molar concentration of H⁺'], ['tot', 'the total acid concentration, including undissociated HA'], ['ion', 'the ionic strength of the solution']], correct: 'act',
    }),
  ];
  add(node({ id: 'bk-m11-e-ph3', week: WEEK, title: 'pH and activity: explanations', theme: THEME, tags: ['ph', 'activity', 'concepts'], source: SRC, family: 'elec-ph-concept', tier: 'atomic', exam: 'short_2to3', diff: 2, mins: 2, variants }),
    { id: 'm11.e.ph3', name: 'Why activity pH differs from concentration pH', chunk: 'e-activity', marks: 2, tags: ['ph', 'concepts'] });
}

export default out;
