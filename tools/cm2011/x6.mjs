import { range, choice, num, kw, calc, pick, written, node } from './lib.mjs';

/* Extraction (week 8 of the app). The final's Q3 is an extraction chain with pH: D at a given pH, the concentration left in the
   organic phase, % extracted, which pH leaves more behind, and how many fresh portions are needed. These generators follow that
   chain with fresh numbers each time. All answers are computed from the displayed (rounded) data. */
const SRC = 'Extraction slides; final Q3 style';
const THEME = 'Extraction';
const WEEK = 8;
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });
const mk = (extra) => ({ week: WEEK, source: SRC, theme: THEME, ...extra });
/** $...$ around a scientific-notation value, as the interpolation expects. */
const S = (expr, d) => '$' + '{{sci(' + expr + ', ' + d + ')}}' + '$';
const SYN_PH = { 'the lower pH': ['lower pH', 'lower', 'low pH'], 'the higher pH': ['higher pH', 'higher', 'high pH'] };

/* ---------- weak acid in the organic phase, extracted into water at a pH (the final's Q3) ---------- */
{
  const sampled = {
    K: range(2.0, 5.0, 0.1, 1), pKa: range(3.8, 5.2, 0.1, 1), off: choice([0.3, 0.5, 0.8, 1.0]),
    Vo: choice([20, 25, 30, 40]), r: choice([1, 2]), Vw: choice([50, 75, 100, 150]),
    C0: choice([0.10, 0.15, 0.20, 0.25]), Ct: choice([0.001, 0.0001, 0.00001]),
  };
  const derived = {
    Ka: 'sigfig(10^(-pKa), 2)', pH: 'round(pKa + off, 1)', pH2: 'pH + 4', H: '10^(-pH)', H2: '10^(-pH2)',
    D: 'K / (1 + Ka / H)', fo: 'Vo / (Vo + Vw / D)', C1: 'C0 * fo', pct: '100 * (1 - fo)',
    D2: 'K / (1 + Ka / H2)', fo2: 'Vo / (Vo + Vw / D2)', Cb: 'C0 * fo2',
    which: "'the lower pH'",
    Vw2: 'Vo * r', f2: 'Vo / (Vo + Vw2 / D)', nex: 'ln(Ct / C0) / ln(f2)', n: 'round(nex + 0.4999999, 0)', Vtot: 'n * Vw2',
    Dbase: 'K / (1 + H / Ka)', Kwrong: 'K', C1aq: 'C0 * Vw / (Vw + D * Vo)', pctLeft: '100 * fo',
  };
  const lead = 'A weak acid HA has a partition coefficient **K = {{fix(K,1)}}** between an organic solvent and water (K = c_org/c_aq for the neutral form, so the organic solvent is favoured) and an acid dissociation constant **K_a = ' + S('Ka', 1) + '**. **{{fix(Vw,0)}} mL** of aqueous solution at **pH {{fix(pH,1)}}** is used to extract the acid from **{{fix(Vo,0)}} mL of the organic solvent, which holds {{fix(C0,2)}} M acid**.';
  const fD = num('D', 'Distribution coefficient D', '', 'D', { relTol: 0.01, sig: 3, paths: [{ label: 'You used K. At this pH the acid is partly ionised, so use D = K/(1 + K_a/[H⁺]).', expr: 'Kwrong' }, { label: 'That is the form for a base. For an acid D = K/(1 + K_a/[H⁺]).', expr: 'Dbase' }] });
  const fC1 = num('C1', 'Concentration left in the organic solvent', 'M', 'C1', { relTol: 0.015, sig: 3, paths: [{ label: 'You used the formula for a solute that starts in the water. Here it starts in the organic phase: f = V_org/(V_org + V_aq/D).', expr: 'C1aq' }], ecf: [{ expr: 'C0 * Vo / (Vo + Vw / u_D)', label: 'Consistent with your own D, so the method earns part credit.' }] });
  const fPct = num('pct', 'Percentage extracted into the water', '%', 'pct', { relTol: 0.01, sig: 3, paths: [{ label: 'That is the percentage left in the organic phase. % extracted = 100 × (1 − f).', expr: 'pctLeft' }], ecf: [{ expr: '100 * (1 - u_C1 / C0)', label: 'Consistent with your own concentration, so the method earns part credit.' }] });
  const hint = 'Acid: D = K/(1 + K_a/[H⁺]) with [H⁺] = 10^(−pH). The acid starts in the organic phase, so the fraction left after one extraction is f = V_org/(V_org + V_aq/D). After n identical extractions c = c₀ fⁿ, so n = ln(c/c₀)/ln f, rounded up.';
  const expl = 'D = K/(1 + K_a/[H⁺]) with [H⁺] = 10^(−pH). Because the acid starts in the organic phase, the fraction left after one extraction is f = V_org/(V_org + V_aq/D), the concentration left is c₀f, and the percentage extracted is 100(1 − f). At the higher pH the acid is mostly ionised (A⁻ stays in the water), D is tiny and almost nothing is left in the organic solvent, so the organic solvent holds more acid after extraction at the lower pH. For repeated extractions with fresh portions, f₂ = V_org/(V_org + V_portion/D) each time, n = ln(c_target/c₀)/ln f₂ rounded up to a whole number, and the total aqueous volume is n × V_portion.';
  add(node(mk({
    id: 'bk-m11-x-acid', title: 'Extraction chain for a weak acid (acid starts in the organic phase)', tags: ['extraction', 'distribution-coefficient'], family: 'extract-acid', mins: 12,
    variants: [
      calc({
        id: 'x-acid-chain', label: 'Full chain (25 marks)', marks: 25, hint, explanation: expl, sampled, derived,
        stem: lead + '\n\n(a) Calculate the distribution coefficient *D*.\n(b) Find the concentration of acid left in the organic solvent after one extraction.\n(c) What percentage of the acid has been extracted into the water?\n(d) Would the organic solvent hold more acid after extraction with aqueous solution at **pH {{fix(pH,1)}}** or at **pH {{fix(pH2,1)}}**? Give the concentration left at pH {{fix(pH2,1)}} as well.\n(e) Now extract with **fresh {{fix(Vw2,0)}} mL portions** of the aqueous solution at pH {{fix(pH,1)}}. Find the fraction left in the organic solvent after each portion, the minimum number of portions needed to bring the concentration down to ' + S('Ct', 1) + ' M, and the total volume of aqueous solution used.',
        fields: [
          fD, fC1, fPct,
          num('Cb', 'Concentration left at the higher pH', 'M', 'Cb', { relTol: 0.03, sig: 3 }),
          kw('which', 'More acid is left in the organic solvent at', ['the lower pH', 'the higher pH'], 'which', { synonyms: SYN_PH, displays: { 'the lower pH': 'the lower pH (the acid stays un-ionised, so D is larger)' } }),
          num('f2', 'Fraction left per portion', '', 'f2', { relTol: 0.01, sig: 3, paths: [{ label: 'You used the large aqueous volume. Each extraction here uses the smaller portion.', expr: 'fo' }], ecf: [{ expr: 'Vo / (Vo + Vw2 / u_D)', label: 'Consistent with your own D, so the method earns part credit.' }] }),
          num('n', 'Number of portions', '', 'n', { relTol: 0.001, sig: 2, paths: [{ label: 'Round up: you cannot do a fraction of an extraction.', expr: 'nex' }], ecf: [{ expr: 'round(ln(Ct / C0) / ln(u_f2) + 0.4999999, 0)', label: 'Consistent with your own fraction, so the method earns part credit.' }] }),
          num('Vtot', 'Total aqueous volume', 'mL', 'Vtot', { relTol: 0.001, sig: 3, paths: [{ label: 'Each extraction uses the smaller portion, not the first volume.', expr: 'n * Vw' }, { label: 'Round the number of portions up before multiplying.', expr: 'nex * Vw2' }], ecf: [{ expr: 'u_n * Vw2', label: 'Consistent with your own number of portions, so the method earns part credit.' }] }),
        ],
      }),
      calc({
        id: 'x-acid-short', label: 'D, concentration left, % extracted (14 marks)', marks: 14, hint, explanation: expl, sampled, derived,
        stem: lead + '\n\n(a) Calculate the distribution coefficient *D*.\n(b) Find the concentration of acid left in the organic solvent after one extraction.\n(c) What percentage of the acid has been extracted into the water?',
        fields: [fD, fC1, fPct],
      }),
    ],
  })), { id: 'm11.x.acid', name: 'Extraction chain for a weak acid: D at a pH, fraction left, number of portions', chunk: 'x-calc', marks: 25, tags: ['extraction', 'distribution-coefficient'] });
}

/* ---------- weak base in the organic phase, extracted into water at two pH values ---------- */
{
  const sampled = { K: choice([2, 3, 4, 5, 6]), pKa: choice([8.5, 9.0, 9.5, 10.0]), Vo: choice([40, 50, 60]), Vw: choice([80, 100, 120]), C0: choice([0.010, 0.020, 0.050]) };
  const derived = {
    Ka: 'sigfig(10^(-pKa), 2)', pHa: 'pKa + 1', pHb: 'pKa - 1', Ha: '10^(-pHa)', Hb: '10^(-pHb)',
    Da: 'K / (1 + Ha / Ka)', Db: 'K / (1 + Hb / Ka)', fa: 'Vo / (Vo + Vw / Da)', Corg_a: 'C0 * fa',
    fb: 'Vo / (Vo + Vw / Db)', Caq_b: 'C0 * (1 - fb) * Vo / Vw', which: "'the lower pH'",
    Dacid: 'K / (1 + Ka / Ha)', Caq_nov: 'C0 * (1 - fb)',
  };
  add(node(mk({
    id: 'bk-m11-x-base', title: 'Extraction of a weak base at two pH values', tags: ['extraction', 'distribution-coefficient', 'weak-base'], family: 'extract-base', mins: 8,
    variants: [
      calc({
        id: 'x-base', label: 'Amine in the organic phase (12 marks)', marks: 12, sampled, derived,
        stem: 'An amine B has a partition coefficient **K = {{fix(K,0)}}** between an organic solvent and water (K = c_org/c_aq for the neutral base). The acid dissociation constant of its conjugate acid BH⁺ is **K_a = ' + S('Ka', 1) + '**. **{{fix(Vo,0)}} mL** of the organic solvent holding **{{fix(C0,3)}} M** amine is shaken once with **{{fix(Vw,0)}} mL** of aqueous solution.\n\n(a) Calculate *D* at **pH {{fix(pHa,1)}}** and the concentration of amine left in the organic phase.\n(b) Calculate *D* at **pH {{fix(pHb,1)}}** and the concentration of amine in the aqueous phase.\n(c) At which pH is more amine pulled out of the organic solvent?',
        hint: 'Base: D = K/(1 + [H⁺]/K_a) (K_a of BH⁺). The amine starts in the organic phase: f = V_org/(V_org + V_aq/D). The amine that leaves the organic phase is c₀(1 − f)V_org, and it is dissolved in V_aq.',
        explanation: 'For a weak base D = K·K_a/(K_a + [H⁺]) = K/(1 + [H⁺]/K_a). At high pH the base stays neutral and D approaches K; at low pH it is protonated to BH⁺, which stays in the water, so D falls and the base is pulled out of the organic phase. f = V_org/(V_org + V_aq/D), c_org = c₀f, and the amount in the water is c₀(1 − f)V_org, so c_aq = c₀(1 − f)V_org/V_aq. More amine is pulled out at the lower pH.',
        fields: [
          num('Da', 'D at the higher pH', '', 'Da', { relTol: 0.01, sig: 3, paths: [{ label: 'That is the form for an acid. For a base D = K/(1 + [H⁺]/K_a).', expr: 'Dacid' }] }),
          num('Corg_a', 'c(amine) left in the organic phase at the higher pH', 'M', 'Corg_a', { relTol: 0.015, sig: 3, ecf: [{ expr: 'C0 * Vo / (Vo + Vw / u_Da)', label: 'Consistent with your own D, so the method earns part credit.' }] }),
          num('Db', 'D at the lower pH', '', 'Db', { relTol: 0.01, sig: 3 }),
          num('Caq_b', 'c(amine) in the aqueous phase at the lower pH', 'M', 'Caq_b', { relTol: 0.02, sig: 3, paths: [{ label: 'The amount that moved is dissolved in the aqueous volume, which is not the organic volume: divide by V_aq, not V_org.', expr: 'Caq_nov' }], ecf: [{ expr: 'C0 * (1 - Vo / (Vo + Vw / u_Db)) * Vo / Vw', label: 'Consistent with your own D, so the method earns part credit.' }] }),
          kw('which', 'More amine is pulled out of the organic solvent at', ['the lower pH', 'the higher pH'], 'which', { synonyms: SYN_PH, displays: { 'the lower pH': 'the lower pH (the base is protonated and stays in the water)' } }),
        ],
      }),
    ],
  })), { id: 'm11.x.base', name: 'Extraction of a weak base: D at two pH values and the concentration in each phase', chunk: 'x-calc', marks: 12, tags: ['extraction', 'weak-base'] });
}

/* ---------- plain K: one large extraction vs several small ones ---------- */
{
  const sampled = { Vaq: choice([50, 100]), Vtot: choice([100, 200, 250, 500]), ns: choice([2, 4, 5]), K: choice([2, 3, 4, 5, 8]), x: choice([1, 0.1]) };
  const derived = {
    q1: '100 * Vaq / (Vaq + K * Vtot)', Ve: 'Vtot / ns', qeach: 'Vaq / (Vaq + K * Ve)', q2: '100 * qeach^ns',
    nex: 'ln(x / 100) / ln(qeach)', nn: 'round(nex + 0.4999999, 0)', which: "'several small extractions'",
    wrongK: '100 * Vaq / (Vaq + Vtot / K)', q1only: '100 * qeach',
  };
  add(node(mk({
    id: 'bk-m11-x-repeat', title: 'One large extraction or several small ones', tags: ['extraction', 'multiple-extractions'], family: 'extract-multi', mins: 7,
    variants: [
      calc({
        id: 'x-repeat', label: 'Solute starts in water (10 marks)', marks: 10, sampled, derived,
        stem: 'A solute dissolved in **{{fix(Vaq,0)}} mL of water** is extracted with an organic solvent. Its partition coefficient is **K = {{fix(K,0)}}** (K = c_org/c_aq).\n\n(a) What percentage of the solute stays in the water after **one** extraction with **{{fix(Vtot,0)}} mL** of solvent?\n(b) What percentage stays after **{{fix(ns,0)}} extractions** with {{fix(Ve,1)}} mL each (the same total volume)?\n(c) How many extractions with {{fix(Ve,1)}} mL portions are needed to leave no more than **{{fix(x,1)}}%** in the water?\n(d) Which way removes more solute?',
        hint: 'The solute starts in the water: after one extraction f = V_aq/(V_aq + K V_org). After n extractions the fraction is fⁿ. n = ln(target)/ln f for one portion size, rounded up.',
        explanation: 'f = V_aq/(V_aq + K V_org) for each extraction when the solute starts in the water. One extraction with the whole volume leaves f₁; n portions of V_org/n leave (V_aq/(V_aq + K V_org/n))ⁿ, which is smaller: several small extractions beat one large one because each re-applies the equilibrium to what is left. The number needed is n = ln(target)/ln(f per portion), rounded up.',
        fields: [
          num('q1', 'Left in water after one extraction', '%', 'q1', { relTol: 0.01, sig: 3, paths: [{ label: 'You inverted K. For K = c_org/c_aq the denominator is V_aq + K × V_org.', expr: 'wrongK' }] }),
          num('q2', 'Left in water after several portions', '%', 'q2', { relTol: 0.015, sig: 3, paths: [{ label: 'That is the fraction left after one portion only. Raise it to the power of the number of portions.', expr: 'q1only' }] }),
          num('nn', 'Number of extractions for the target', '', 'nn', { relTol: 0.001, sig: 2, paths: [{ label: 'Round up: you cannot do a fraction of an extraction.', expr: 'nex' }] }),
          kw('which', 'More solute is removed by', ['one large extraction', 'several small extractions'], 'which', { synonyms: { 'one large extraction': ['one large', 'one big', 'single'], 'several small extractions': ['several small', 'many small', 'small portions', 'multiple'] } }),
        ],
      }),
    ],
  })), { id: 'm11.x.repeat', name: 'Fraction left after one large or several small extractions, and how many are needed', chunk: 'x-calc', marks: 10, tags: ['extraction', 'multiple-extractions'] });
}

/* ---------- concepts and conventions ---------- */
add(node(mk({
  id: 'bk-m11-x-explain', title: 'Extraction: explain', tags: ['extraction', 'written'], family: 'extract-concept', mins: 6,
  variants: [
    written({
      id: 'x-w-ph', label: 'Which pH leaves more acid in the ether (4 marks)',
      stem: 'Benzoic acid (a weak acid) in diethyl ether is extracted with an aqueous solution. Would you expect the concentration of benzoic acid left in the ether to be **higher after extraction at pH 5 or at pH 9**? Explain your reasoning.',
      explanation: 'The neutral acid HA prefers the organic phase; its anion A⁻ stays in the water. At pH 9, well above the pKa (about 4.2), the acid is almost completely ionised, so the distribution coefficient D = K/(1 + K_a/[H⁺]) is tiny and almost all of the acid moves into the water. At pH 5, close to the pKa, a good fraction is still un-ionised, D is larger and more acid remains in the ether. So the ether holds more acid after extraction at pH 5.',
      items: [
        ['The neutral acid HA prefers the organic phase; the ionised form A⁻ stays in the water', 1, true],
        ['At pH 9 (well above the pKa) the acid is mostly ionised, so D is very small and nearly all of it moves into the water', 1],
        ['At pH 5 (near the pKa) much of the acid is still un-ionised, so D is larger and more stays in the ether', 1, true],
        ['So the ether concentration is higher after extraction at pH 5 (supported by D = K/(1 + K_a/[H⁺]))', 1],
      ],
    }),
    written({
      id: 'x-w-small', label: 'Why several small extractions win (3 marks)',
      stem: 'With the same total volume of solvent, why do **several small extractions** remove more solute than **one large extraction**?',
      explanation: 'Each extraction re-applies the partition equilibrium to the solute that is still left. After n portions of V_org/n the fraction left in the water is [V_aq/(V_aq + K V_org/n)]ⁿ, which is smaller than V_aq/(V_aq + K V_org) for one large portion. The gain levels off as n grows, so a few portions capture most of the benefit.',
      items: [
        ['Each extraction re-applies the equilibrium to the solute still left, starting again from a smaller amount', 1],
        ['The fraction left after n portions, [V_aq/(V_aq + K V_org/n)]ⁿ, is smaller than for one portion V_org', 1, true],
        ['So the same total volume extracts more when split (with diminishing returns as n grows)', 1],
      ],
    }),
    written({
      id: 'x-w-kd', label: 'K and D (3 marks)',
      stem: 'What is the difference between the **partition coefficient K** and the **distribution coefficient D**, and when are they equal?',
      explanation: 'K describes the equilibrium of one chemical form (the neutral molecule) between the two solvents and does not change with pH. D is the overall ratio of the total concentration in the organic phase to the total concentration (all forms, such as HA and A⁻, or B and BH⁺) in the aqueous phase, so it depends on pH. They are equal when the solute exists in only one form, for example an acid at low pH or a base at high pH, where D approaches K.',
      items: [
        ['K: ratio of the concentration of the neutral species in the two phases; it does not depend on pH', 1, true],
        ['D: ratio of the total concentration in the organic phase to the total in the aqueous phase (all forms, such as HA and A⁻); it depends on pH', 1, true],
        ['They are equal when the solute is present in one form only (an acid at low pH, a base at high pH), where D approaches K', 1],
      ],
    }),
    pick({
      id: 'x-p-orig', label: 'Which fraction formula', stem: 'A solute starts in **50 mL of organic solvent** and is shaken once with **25 mL of water**. Its distribution coefficient is D = 2 (organic/aqueous). Which expression gives the fraction left in the organic phase?',
      explanation: 'The solute starts in the organic phase, so f = V_org/(V_org + V_aq/D) = 50/(50 + 25/2). The expression 25/(25 + 2 × 50) is the one for a solute that starts in the water.',
      options: [['a', '50 / (50 + 25/2)'], ['b', '25 / (25 + 2 × 50)'], ['c', '50 / (50 + 2 × 25)'], ['d', '25 / (25 + 50/2)']], correct: 'a',
    }),
    pick({
      id: 'x-p-pka', label: 'D at pH = pKa', stem: 'A weak acid HA has K = 6.0 and pKa 5.0. What is D at pH 5.0?',
      explanation: 'At pH = pKa, [A⁻] = [HA], so D = K/(1 + K_a/[H⁺]) = K/2 = 3.0.',
      options: [['a', '3.0'], ['b', '6.0'], ['c', '0.5'], ['d', '12.0']], correct: 'a',
    }),
    pick({
      id: 'x-p-base', label: 'Lowering the pH for a base', stem: 'The pH of the aqueous phase is lowered while a weak base B is extracted. Which statement is correct?',
      explanation: 'Lower pH converts more of B into BH⁺, which is ionic and stays in the water, so D falls and more of the solute moves to the aqueous phase. K, which describes the neutral base, does not change.',
      options: [['a', 'D falls and more solute moves into the aqueous phase; K does not change'], ['b', 'D rises and more solute stays in the organic phase'], ['c', 'K falls and more solute moves into the aqueous phase'], ['d', 'neither K nor D changes']], correct: 'a',
    }),
  ],
})), { id: 'm11.x.explain', name: 'Extraction concepts: pH, several small portions, K vs D, which formula', chunk: 'x-concepts', marks: 4, tags: ['extraction', 'written'] });

export default out;
