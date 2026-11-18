import { T95, Q90, range, choice, bands, round, names, list, shuffled, table, tableRows, num, kw, calc, pick, written, node, anyOf } from './lib.mjs';

const SRC = 'Topic 1 · errors and statistics';
const WEEK = 1;
const THEME = 'Errors & Confidence Intervals';
const out = [];   // [{ node, skill }]
const add = (nd, skill) => out.push({ node: nd, skill });

const rows = (prefix, n) => shuffled(prefix, n).map((v) => `{{fix(${v},DP)}}`);

/* ---------- mean, standard deviation, relative standard deviation ---------- */
{
  const scen = [
    { id: 'pb', what: 'lead in river water', unit: 'µg/L', lo: 48.0, hi: 53.0, step: 0.1, dp: 1 },
    { id: 'caf', what: 'caffeine in a cola', unit: 'mg/L', lo: 95, hi: 105, step: 0.5, dp: 1 },
    { id: 'fe', what: 'iron in a vitamin tablet', unit: 'mg per tablet', lo: 17.5, hi: 19.5, step: 0.05, dp: 2 },
    { id: 'no3', what: 'nitrate in well water', unit: 'mg/L', lo: 4.0, hi: 5.0, step: 0.02, dp: 2 },
  ];
  const variants = scen.map((s) => {
    const R = names('r', 5);
    return calc({
      id: `t1-meansd-${s.id}`, label: s.what, marks: 4,
      stem: `Five replicate measurements of ${s.what} gave (${s.unit}):\n\n${table(['1', '2', '3', '4', '5'], rows('r', 5).map((c) => c.replace('DP', s.dp)))}\n\nCalculate the mean, the sample standard deviation *s* and the relative standard deviation (%RSD).`,
      hint: 'Sample standard deviation divides by N − 1, not N. %RSD = s / mean × 100.',
      explanation: 'mean = Σx / N. s = √[Σ(xᵢ − mean)² / (N − 1)]. %RSD = (s / mean) × 100. Dividing by N instead of N − 1 gives the population value, which is too small for a small sample.',
      sampled: bands('r', 5, s.lo, s.hi, s.step, s.dp),
      derived: { m: `mean(${list('r', 5)})`, s: `sd(${list('r', 5)})`, rsd: 's / m * 100', sPop: `sqrt(((r1-m)^2+(r2-m)^2+(r3-m)^2+(r4-m)^2+(r5-m)^2)/5)` },
      fields: [
        num('m', 'Mean', s.unit, 'm', { relTol: 0.003 }),
        num('s', 's', s.unit, 's', { relTol: 0.02, paths: [{ label: 'You divided by N instead of N − 1 (population standard deviation).', expr: 'sPop' }] }),
        num('rsd', '%RSD', '%', 'rsd', { relTol: 0.03, ecf: [{ expr: 'u_s / u_m * 100', label: 'Your %RSD is consistent with your own mean and s, so the method earns part credit.' }] }),
      ],
    });
  });
  add(node({ id: 'bk-m11-t1-meansd', week: WEEK, title: 'Mean, standard deviation and %RSD', theme: THEME, tags: ['statistics', 'standard-deviation'], source: SRC, family: 'stats-basic', mins: 4, variants }),
    { id: 'm11.t1.meansd', name: 'Mean, standard deviation and %RSD of replicates', chunk: 't1-stats', marks: 4, tags: ['standard-deviation'] });
}

/* ---------- standard error of the mean and the effect of N ---------- */
{
  const variants = [6, 9].map((n) => calc({
    id: `t1-sem-n${n}`, label: `${n} replicates`, marks: 3,
    stem: `A method has a sample standard deviation *s* = {{fix(s,3)}} mg/L from a large number of earlier runs. A new result is reported as the mean of **${n}** replicates. Calculate the standard error of that mean, and the number of replicates needed to halve it.`,
    explanation: 'Standard error = s / √N. Because it falls as 1/√N, halving it needs four times as many replicates, not twice as many.',
    sampled: { s: range(0.20, 0.90, 0.05, 2) },
    derived: { se: `s / sqrt(${n})`, nn: `${n} * 4` },
    fields: [
      num('se', 'Standard error of the mean', 'mg/L', 'se', { relTol: 0.02, paths: [{ label: 'You divided by N instead of √N.', expr: `s / ${n}` }, { label: 'You gave s itself; the mean of N results is more precise than one result.', expr: 's' }] }),
      num('nn', 'Replicates to halve it', '', 'nn', { relTol: 0.001, sig: 3, paths: [{ label: 'Halving the error needs four times the replicates (error ∝ 1/√N), not twice.', expr: `${n} * 2` }] }),
    ],
  }));
  add(node({ id: 'bk-m11-t1-sem', week: WEEK, title: 'Standard error of the mean', theme: THEME, tags: ['statistics', 'standard-error'], source: SRC, family: 'stats-basic', tier: 'atomic', exam: 'short_2to3', mins: 3, variants }),
    { id: 'm11.t1.sem', name: 'Standard error of the mean and the 1/√N rule', chunk: 't1-stats', marks: 3, tags: ['standard-error'] });
}

/* ---------- Q-test ---------- */
{
  const variants = [5, 6, 7, 8].map((n) => {
    const centre = [48.0, 0.1180, 12.40, 5.60][n - 5];
    const W = [3.0, 0.0050, 0.60, 0.50][n - 5];
    const step = [0.1, 0.0005, 0.01, 0.01][n - 5];
    const dp = [1, 4, 2, 2][n - 5];
    const lo = centre - W / 2, hi = centre + W / 2;
    const unit = ['µg/L', 'ppm', 'mg/L', 'mmol/L'][n - 5];
    const what = ['copper in wastewater', 'Pb in an ore digest', 'chloride in a sample', 'calcium in milk'][n - 5];
    const fs = [0.45, 1.1, 1.9, 3.0];
    const susOpts = [...fs.map((f) => round(lo - f * W, dp)), ...fs.map((f) => round(hi + f * W, dp))];
    const all = [...names('v', n - 1), 'vs'];
    const order = shuffled('v', n - 1);
    order.splice(1, 0, 'vs');
    return calc({
      id: `t1-q-n${n}`, label: `n = ${n}`, marks: 4,
      stem: `Replicate determinations of ${what} (${unit}):\n\n${table(order.map((_, i) => String(i + 1)), order.map((v) => `{{fix(${v},${dp})}}`))}\n\nUse the Q-test at the 90% confidence level (Q_crit = **${Q90[n].toFixed(3)}** for n = ${n}) to decide whether the most suspect value should be rejected.`,
      hint: 'Q = gap ÷ range, where the gap is the difference between the suspect value and its nearest neighbour. Check both ends and test the larger gap.',
      explanation: `Sort the values. Q = (suspect − nearest neighbour) / (largest − smallest), tested at the end with the bigger gap. Compare with Q_crit = ${Q90[n].toFixed(3)}: reject only if Q is greater.`,
      sampled: { ...bands('v', n - 1, lo, hi, step, dp), vs: choice(susOpts) },
      derived: {
        mx: `max(${all.join(', ')})`, mn: `min(${all.join(', ')})`, rg: 'mx - mn',
        lowGap: `nth(2, ${all.join(', ')}) - nth(1, ${all.join(', ')})`,
        hiGap: `nth(${n}, ${all.join(', ')}) - nth(${n - 1}, ${all.join(', ')})`,
        suspect: 'hiGap >= lowGap ? mx : mn', Q: 'max(lowGap, hiGap) / rg', Qo: 'min(lowGap, hiGap) / rg',
        Qx: 'max(lowGap, hiGap) / (rg - max(lowGap, hiGap))', dec: `Q > ${Q90[n]} ? 'reject' : 'keep'`,
      },
      fields: [
        num('suspect', 'Most suspect value', unit, 'suspect', { relTol: 0.002, sig: 6 }),
        num('Q', 'Q', '', 'Q', { relTol: 0.02, sig: 3, paths: [{ label: 'You tested the other end of the data; test the end with the larger gap.', expr: 'Qo' }, { label: 'You divided by the range without the suspect value; use the full range of all the data.', expr: 'Qx' }] }),
        kw('dec', 'Decision', ['reject', 'keep'], 'dec', { synonyms: { reject: ['reject', 'discard', 'outlier', 'remove', 'exclude'], keep: ['keep', 'retain', 'accept', 'include', 'not an outlier'] }, displays: { reject: 'reject (Q > Q_crit)', keep: 'keep (Q < Q_crit)' } }),
      ],
    });
  });
  add(node({ id: 'bk-m11-t1-qtest', week: WEEK, title: 'Q-test for an outlier', theme: THEME, tags: ['q-test', 'outlier'], source: SRC, family: 'stats-test', mins: 5, variants }),
    { id: 'm11.t1.qtest', name: 'Q-test: compute Q and decide', chunk: 't1-stats', marks: 4, tags: ['q-test'] });
}

/* ---------- confidence interval ---------- */
{
  const variants = [4, 5, 6, 7].map((n) => {
    const base = [110, 25.0, 0.0850, 7.40][n - 4];
    const W = [6, 1.2, 0.0030, 0.30][n - 4];
    const step = [0.5, 0.05, 0.0002, 0.01][n - 4];
    const dp = [1, 2, 4, 2][n - 4];
    const unit = ['mg/L', 'ppm', 'mol/L', '% w/w'][n - 4];
    const what = ['cholesterol in a serum standard', 'sodium in tap water', 'an acid by titration', 'moisture in a flour sample'][n - 4];
    const t = T95[n - 1];
    const R = names('r', n);
    const hw = `${t} * s / sqrt(${n})`;
    return calc({
      id: `t1-ci-n${n}`, label: `n = ${n}`, marks: 5,
      stem: `Replicate analyses of ${what} gave (${unit}):\n\n${table(R.map((_, i) => String(i + 1)), shuffled('r', n).map((v) => `{{fix(${v},${dp})}}`))}\n\nThe certified value is **{{fix(cert,${dp})}}** ${unit}. Calculate the mean, *s* and the 95% confidence interval (t = **${t}** for ${n - 1} degrees of freedom), and say whether the interval contains the certified value.`,
      hint: 'CI = mean ± t·s/√N. The "±" part is what is asked for.',
      explanation: `CI = x̄ ± t·s/√N with t(95%, ${n - 1} df) = ${t}. The certified value is inside the interval only if it lies within x̄ ± that half-width.`,
      sampled: { ...bands('r', n, base - W / 2, base + W / 2, step, dp), k: choice([-2.4, -0.7, 0.5, 1.8]) },
      derived: { m: `mean(${list('r', n)})`, s: `sd(${list('r', n)})`, hw, cert: `round(m + k * ${hw}, ${dp})`, inside: `abs(cert - m) <= ${hw} ? 'yes' : 'no'` },
      fields: [
        num('m', 'Mean', unit, 'm', { relTol: 0.003 }),
        num('s', 's', unit, 's', { relTol: 0.02 }),
        num('hw', '95% CI half-width (±)', unit, 'hw', { relTol: 0.03, paths: [
          { label: 'You used z = 1.96; with so few replicates you need Student’s t.', expr: '1.96 * s / sqrt(' + n + ')' },
          { label: 'You divided by N instead of √N.', expr: t + ' * s / ' + n },
          { label: 'You left out the 1/√N: that is a range for one measurement, not for the mean.', expr: t + ' * s' }],
          ecf: [{ expr: `${t} * u_s / sqrt(${n})`, label: 'Consistent with your own s, so the method earns part credit.' }] }),
        kw('inside', 'Certified value inside the interval?', ['yes', 'no'], 'inside', { synonyms: { yes: ['yes', 'inside', 'contains', 'within'], no: ['no', 'outside', 'not'] } }),
      ],
    });
  });
  add(node({ id: 'bk-m11-t1-ci', week: WEEK, title: '95% confidence interval of a mean', theme: THEME, tags: ['confidence-interval', 'student-t'], source: SRC, family: 'stats-ci', mins: 6, variants }),
    { id: 'm11.t1.ci', name: '95% confidence interval from replicates', chunk: 't1-stats', marks: 5, tags: ['confidence-interval'] });
}

/* ---------- two-sample t-test ---------- */
{
  const mk = (n1, n2) => {
    const df = n1 + n2 - 2;
    const t = T95[df];
    const A = names('a', n1), B = names('b', n2);
    const SA = bands('a', n1, 0.1100, 0.1100 + 0.0003 * n1 * 2.5, 0.0001, 4);
    const SB = bands('b', n2, 0.1100, 0.1100 + 0.0003 * n2 * 2.5, 0.0001, 4);
    return calc({
      id: `t1-t2-${n1}v${n2}`, label: `${n1} v ${n2} replicates`, marks: 6,
      stem: `The Pb content of an ore (ppm) was measured by two methods, ${n1} replicates by AAS and ${n2} by ICP:\n\n${tableRows(['#', 'AAS', 'ICP'], Array.from({ length: Math.max(n1, n2) }, (_, i) => [String(i + 1), i < n1 ? `{{fix(${shuffled('a', n1)[i]},4)}}` : '–', i < n2 ? `{{fix(${shuffled('c', n2)[i]},4)}}` : '–']))}\n\nUse a pooled two-sample t-test at 95% (t_table = **${t}** for ${df} degrees of freedom) to decide whether the two methods give the same result within experimental error.`,
      hint: 'Pool the variances: s_pooled = √[((N₁−1)s₁² + (N₂−1)s₂²)/(N₁+N₂−2)], then t = |x̄₁ − x̄₂| / s_pooled × √(N₁N₂/(N₁+N₂)).',
      explanation: `s_pooled combines the two variances weighted by degrees of freedom. t_calc = |x̄₁ − x̄₂|/s_pooled · √(N₁N₂/(N₁+N₂)). If t_calc > ${t} the means differ significantly at 95%; otherwise there is no evidence of a difference.`,
      sampled: { ...SA, ...SB, sh: choice([0, 0.0004, 0.0020, 0.0040]) },
      derived: {
        m1: `mean(${list('a', n1)})`, s1: `sd(${list('a', n1)})`,
        ...Object.fromEntries(B.map((v, i) => [`c${i + 1}`, `${v} + sh`])),
        m2: `mean(${list('c', n2)})`, s2: `sd(${list('c', n2)})`,
        sp: `sqrt(((${n1}-1)*s1^2 + (${n2}-1)*s2^2) / ${df})`,
        tc: `abs(m1 - m2) / sp * sqrt(${n1 * n2} / ${n1 + n2})`,
        dec: `tc > ${t} ? 'different' : 'same'`,
      },
      fields: [
        num('sp', 's_pooled', 'ppm', 'sp', { relTol: 0.03, sig: 4, paths: [{ label: 'You averaged the two standard deviations; pool the variances instead.', expr: '(s1 + s2) / 2' }] }),
        num('tc', 't_calc', '', 'tc', { relTol: 0.04, sig: 3, paths: [
          { label: 'You left out the √(N₁N₂/(N₁+N₂)) factor.', expr: 'abs(m1 - m2) / sp' },
          { label: 'You used the averaged standard deviation instead of s_pooled.', expr: `abs(m1 - m2) / ((s1 + s2) / 2) * sqrt(${n1 * n2} / ${n1 + n2})` }],
          ecf: [{ expr: `abs(m1 - m2) / u_sp * sqrt(${n1 * n2} / ${n1 + n2})`, label: 'Consistent with your own s_pooled, so the method earns part credit.' }] }),
        kw('dec', 'Same or different at 95%?', ['same', 'different'], 'dec', { synonyms: { same: ['same', 'no significant difference', 'agree', 'not different', 'no difference'], different: ['different', 'significant', 'disagree'] }, displays: { same: `same (t_calc < ${t})`, different: `different (t_calc > ${t})` } }),
      ],
    });
  };
  add(node({ id: 'bk-m11-t1-ttest2', week: WEEK, title: 'Pooled two-sample t-test', theme: THEME, tags: ['t-test', 'pooled-variance'], source: SRC, family: 'stats-test', mins: 7, variants: [mk(5, 5), mk(5, 6), mk(4, 6)] }),
    { id: 'm11.t1.ttest2', name: 'Two-sample pooled t-test: s_pooled, t_calc, decision', chunk: 't1-stats', marks: 6, tags: ['t-test'] });
}

/* ---------- paired t-test ---------- */
{
  const mk = (id, what, unit, lo, hi) => {
    const n = 5;
    const e = [[-3, -2], [-1.5, -0.5], [-0.25, 0.25], [0.5, 1.5], [2, 3]];
    const sampled = { bias: choice([0, 0, 1.5, 3]) };
    for (let i = 0; i < n; i++) { sampled[`x${i + 1}`] = range(lo, hi, 1); sampled[`e${i + 1}`] = range(e[i][0], e[i][1], 0.25, 2); }
    const D = names('d', n);
    return calc({
      id: `t1-pair-${id}`, label: what, marks: 6,
      stem: `${what} was measured on the same ${n} samples by two methods (${unit}):\n\n${table(['sample', ...names('', n).map((_, i) => String(i + 1))], []).split('\n').slice(0, 2).join('\n')}\n${'| Method A | ' + shuffled('x', n).map((v) => `{{fix(${v},0)}}`).join(' | ') + ' |'}\n${'| Method B | ' + shuffled('y', n).map((v) => `{{fix(${v},2)}}`).join(' | ') + ' |'}\n\nUse a **paired** t-test at 95% (t_table = **${T95[n - 1]}** for ${n - 1} degrees of freedom) to decide whether the methods differ.`,
      hint: 'Work with the differences dᵢ = A − B for each sample. t = |d̄| · √N / s_d.',
      explanation: 'A paired test removes sample-to-sample variation: take dᵢ = Aᵢ − Bᵢ, then t_calc = |d̄|√N / s_d and compare with t_table(N − 1 df).',
      sampled,
      derived: {
        ...Object.fromEntries(names('y', n).map((y, i) => [y, `x${i + 1} + bias + e${i + 1}`])),
        ...Object.fromEntries(D.map((d, i) => [d, `x${i + 1} - ${names('y', n)[i]}`])),
        db: `mean(${D.join(', ')})`, sd_: `sd(${D.join(', ')})`, tc: `abs(db) * sqrt(${n}) / sd_`, dec: `tc > ${T95[n - 1]} ? 'different' : 'same'`,
      },
      fields: [
        num('db', 'Mean difference d̄ (A − B)', unit, 'db', { relTol: 0.03, tol: 0.01 }),
        num('sd_', 's_d', unit, 'sd_', { relTol: 0.03 }),
        num('tc', 't_calc', '', 'tc', { relTol: 0.04, sig: 3, paths: [{ label: 'You left out the √N: t = |d̄|√N / s_d.', expr: 'abs(db) / sd_' }], ecf: [{ expr: `abs(u_db) * sqrt(${n}) / u_sd_`, label: 'Consistent with your own d̄ and s_d, so the method earns part credit.' }] }),
        kw('dec', 'Same or different at 95%?', ['same', 'different'], 'dec', { synonyms: { same: ['same', 'no significant difference', 'not different', 'agree'], different: ['different', 'significant', 'disagree'] }, displays: { same: `same (t_calc < ${T95[n - 1]})`, different: `different (t_calc > ${T95[n - 1]})` } }),
      ],
    });
  };
  add(node({ id: 'bk-m11-t1-paired', week: WEEK, title: 'Paired t-test', theme: THEME, tags: ['t-test', 'paired'], source: SRC, family: 'stats-test', mins: 7,
    variants: [mk('glucose', 'Glucose in five blood samples', 'mg/dL', 70, 110), mk('nitrate', 'Nitrate in five water samples', 'mg/L', 20, 60)] }),
    { id: 'm11.t1.paired', name: 'Paired t-test on differences', chunk: 't1-stats', marks: 6, tags: ['t-test', 'paired'] });
}

/* ---------- error propagation ---------- */
{
  const v1 = calc({
    id: 't1-prop-sub', label: 'Volume by difference', marks: 3,
    stem: 'A burette reads **{{fix(vi,2)}} ± {{fix(s,2)}} mL** at the start and **{{fix(vf,2)}} ± {{fix(s,2)}} mL** at the end. What is the volume delivered and its absolute uncertainty?',
    hint: 'For addition and subtraction the absolute uncertainties add in quadrature.',
    explanation: 'V = V_f − V_i. For sums and differences, σ² = σ₁² + σ₂². With the same uncertainty on each reading, σ_V = √2 × σ ≈ 1.41σ, not 2σ.',
    sampled: { vi: range(0.00, 2.00, 0.05, 2), vf: range(18.00, 34.00, 0.05, 2), s: choice([0.02, 0.03, 0.05]) },
    derived: { V: 'vf - vi', sV: 'sqrt(s^2 + s^2)', lin: 's + s' },
    fields: [num('V', 'Volume delivered', 'mL', 'V', { relTol: 0.002 }), num('sV', 'Uncertainty (±)', 'mL', 'sV', { relTol: 0.03, sig: 3, paths: [{ label: 'You added the uncertainties directly; independent random errors add in quadrature.', expr: 'lin' }, { label: 'You used one reading’s uncertainty; the difference carries both.', expr: 's' }] })],
  });
  const v2 = calc({
    id: 't1-prop-sum', label: 'Sum and difference of three terms', marks: 3,
    stem: 'A result is calculated as *R* = *a* + *b* − *c*, with *a* = {{fix(a,2)}} ± {{fix(sa,2)}}, *b* = {{fix(b,2)}} ± {{fix(sb,2)}} and *c* = {{fix(c,2)}} ± {{fix(sc,2)}}. Give *R* and its absolute uncertainty.',
    explanation: 'R = a + b − c. For sums and differences σ_R = √(σ_a² + σ_b² + σ_c²): the sign does not matter, every term adds its variance.',
    sampled: { a: range(10, 20, 0.05, 2), b: range(5, 12, 0.05, 2), c: range(3, 9, 0.05, 2), sa: choice([0.05, 0.10, 0.20]), sb: choice([0.03, 0.08, 0.15]), sc: choice([0.02, 0.06, 0.12]) },
    derived: { R: 'a + b - c', sR: 'sqrt(sa^2 + sb^2 + sc^2)', lin: 'sa + sb + sc' },
    fields: [num('R', 'R', '', 'R', { relTol: 0.002 }), num('sR', 'Uncertainty in R (±)', '', 'sR', { relTol: 0.03, sig: 3, paths: [{ label: 'You added the uncertainties directly; combine them in quadrature.', expr: 'lin' }, { label: 'You subtracted the uncertainty of c; every term adds, whatever the sign.', expr: 'abs(sa + sb - sc)' }] })],
  });
  const v3 = calc({
    id: 't1-prop-mul', label: 'Multiplication and division', marks: 4,
    stem: 'A concentration is calculated as *c* = (*m* × *p*) / *V* with *m* = {{fix(m,3)}} ± {{fix(sm,3)}} g, *p* = {{fix(p,3)}} ± {{fix(sp,3)}} (purity, fraction) and *V* = {{fix(V,2)}} ± {{fix(sV,2)}} mL. Give *c* (g/mL) and its absolute uncertainty.',
    hint: 'For multiplication and division add the **relative** uncertainties in quadrature, then convert back to an absolute value.',
    explanation: 'σ_c/c = √[(σ_m/m)² + (σ_p/p)² + (σ_V/V)²]; then σ_c = c × (σ_c/c). Forgetting the last step gives a relative error, not an absolute one.',
    sampled: { m: range(1.000, 2.500, 0.005, 3), sm: choice([0.002, 0.004, 0.006]), p: range(0.900, 0.995, 0.005, 3), sp: choice([0.005, 0.01]), V: range(20.00, 50.00, 0.05, 2), sV: choice([0.05, 0.08, 0.12]) },
    derived: { c: 'm * p / V', rel: 'sqrt((sm/m)^2 + (sp/p)^2 + (sV/V)^2)', sc: 'c * rel', lin: 'c * (sm/m + sp/p + sV/V)' },
    fields: [num('c', 'c', 'g/mL', 'c', { relTol: 0.01 }), num('sc', 'Uncertainty (±)', 'g/mL', 'sc', { relTol: 0.04, sig: 3, paths: [{ label: 'You gave the relative uncertainty; multiply it by c to get the absolute value.', expr: 'rel' }, { label: 'You added the relative uncertainties directly instead of in quadrature.', expr: 'lin' }], ecf: [{ expr: 'u_c * rel', label: 'Consistent with your own c, so the method earns part credit.' }] })],
  });
  add(node({ id: 'bk-m11-t1-errprop', week: WEEK, title: 'Propagation of uncertainty', theme: THEME, tags: ['error-propagation'], source: SRC, family: 'stats-error', mins: 5, variants: [v1, v2, v3] }),
    { id: 'm11.t1.errprop', name: 'Propagate uncertainty through + − × ÷', chunk: 't1-stats', marks: 4, tags: ['error-propagation'] });
}

/* ---------- concepts (pick one) ---------- */
{
  const variants = [
    pick({ id: 't1-def-acc', label: 'Accuracy vs precision', stem: 'Five replicate results are very close together but all lie well above the true value. This method is:', explanation: 'Close agreement between replicates is **precision**; closeness to the true value is **accuracy**. A consistent offset is a systematic error (bias), which averaging cannot remove.', options: [['a', 'precise but not accurate (systematic error)'], ['b', 'accurate but not precise'], ['c', 'both precise and accurate'], ['d', 'neither precise nor accurate']], correct: 'a' }),
    pick({ id: 't1-def-rand', label: 'Random vs systematic', stem: 'Which error is reduced by taking more replicates and averaging?', explanation: 'Random errors scatter either side of the true value, so they average out (the standard error falls as 1/√N). Systematic errors push every result the same way and are not reduced by replication.', options: [['a', 'random error'], ['b', 'systematic error (bias)'], ['c', 'both equally'], ['d', 'neither']], correct: 'a' }),
    pick({ id: 't1-def-ci', label: 'Meaning of a CI', stem: 'A 95% confidence interval for a mean is 110 ± 6 mg/L. What does the interval tell you?', explanation: 'It is the range around the sample mean that would contain the true mean in 95% of repeated experiments of this kind. It is not the range that contains 95% of individual measurements.', options: [['a', 'the true mean lies in this range with 95% confidence'], ['b', '95% of individual measurements fall in this range'], ['c', 'the result is 95% accurate'], ['d', 'there is a 5% error in every measurement']], correct: 'a' }),
    pick({ id: 't1-def-t', label: 'Why t, not z', stem: 'Why is Student’s *t*, rather than z = 1.96, used for a 95% interval from 4 or 5 replicates?', explanation: 'With few replicates *s* is itself uncertain, so the interval must be wider. t is larger than 1.96 and approaches it only as N grows large.', options: [['a', 's is only an estimate of σ when N is small, so a wider interval is needed'], ['b', 'the data must be normally distributed'], ['c', 'the mean is biased for small N'], ['d', 't is easier to look up']], correct: 'a' }),
    pick({ id: 't1-def-ttest', label: 'Reading a t-test', stem: 'In a two-sample t-test at 95%, t_calc = 1.8 and t_table = 2.306. The correct conclusion is:', explanation: 't_calc < t_table, so the difference between the means is not significant at 95%. That is **not** proof that the means are equal, only that the data cannot show a difference.', options: [['a', 'no significant difference at the 95% level'], ['b', 'the two means are significantly different'], ['c', 'the methods are proved identical'], ['d', 'one outlier must be removed']], correct: 'a' }),
  ];
  add(node({ id: 'bk-m11-t1-concepts', week: WEEK, title: 'Errors and statistics: concepts', theme: THEME, tags: ['statistics', 'concepts'], source: SRC, family: 'stats-concept', tier: 'atomic', exam: 'mcq_1mark', diff: 2, mins: 1, variants }),
    { id: 'm11.t1.concepts', name: 'Accuracy, precision, random/systematic error, meaning of CI and t-test results', chunk: 't1-stats', marks: 1, tags: ['concepts'] });
}

/* ---------- units, dilutions, ppm, Kjeldahl ---------- */
{
  const el = [['Pb', 207.2], ['Cu', 63.55], ['Ca', 40.08], ['Zn', 65.38], ['Mg', 24.31], ['Fe', 55.85]];
  const variants = el.slice(0, 4).map(([sym, aw]) => calc({
    id: `q-ppm-${sym}`, label: `${sym}: ppm to molarity`, marks: 2,
    stem: `A water sample contains **{{fix(ppm,1)}} ppm** ${sym} (1 ppm = 1 mg/L in dilute aqueous solution; A_r(${sym}) = ${aw}). Calculate the molar concentration of ${sym}, and the concentration in ppb.`,
    explanation: `ppm = mg/L, so c = (ppm / 1000) g/L ÷ ${aw} g/mol. 1 ppm = 1000 ppb.`,
    sampled: { ppm: range(0.5, 80, 0.5, 1) },
    derived: { cM: `ppm / 1000 / ${aw}`, ppb: 'ppm * 1000', wrong: `ppm / ${aw}` },
    fields: [num('cM', `[${sym}]`, 'mol/L', 'cM', { relTol: 0.01, paths: [{ label: 'You forgot to convert mg to g (divide by 1000).', expr: 'wrong' }] }), num('ppb', 'Concentration', 'ppb', 'ppb', { relTol: 0.005 })],
  }));
  add(node({ id: 'bk-m11-q-ppm', week: WEEK, title: 'ppm, ppb and molarity', theme: 'Units, Dilutions & Kjeldahl', tags: ['ppm', 'units'], source: SRC, family: 'quant-units', exam: 'short_2to3', mins: 3, variants }),
    { id: 'm11.q.ppm', name: 'Convert between ppm, ppb and mol/L', chunk: 't1-quant', marks: 2, tags: ['ppm'] });

  const dil = [
    calc({
      id: 'q-dil-one', label: 'Single dilution', marks: 3,
      stem: 'A **{{fix(V1,2)}} mL** aliquot of a stock solution is transferred to a **{{fix(V2,0)}} mL** volumetric flask and made up to the mark. The diluted solution reads **{{fix(cf,4)}} mol/L** by a calibrated method. What was the concentration of the stock solution? What is the dilution factor?',
      explanation: 'c₁V₁ = c₂V₂, so c₁ = c₂V₂/V₁. The dilution factor is V₂/V₁.',
      sampled: { V1: choice([1.00, 2.00, 5.00, 10.00, 25.00]), V2: choice([50, 100, 250]), cf: range(0.0010, 0.0090, 0.0001, 4) },
      derived: { c1: 'cf * V2 / V1', df: 'V2 / V1' },
      fields: [num('df', 'Dilution factor', '', 'df', { relTol: 0.005, sig: 3 }), num('c1', 'Stock concentration', 'mol/L', 'c1', { relTol: 0.005, paths: [{ label: 'You multiplied by the volume ratio the wrong way round.', expr: 'cf * V1 / V2' }], ecf: [{ expr: 'cf * u_df', label: 'Consistent with your own dilution factor, so the method earns part credit.' }] })],
    }),
    calc({
      id: 'q-dil-two', label: 'Two-step dilution', marks: 4,
      stem: 'A stock solution is diluted in two steps: **{{fix(V1,2)}} mL → {{fix(V2,0)}} mL**, then **{{fix(V3,2)}} mL of that → {{fix(V4,0)}} mL**. The final solution contains **{{fix(cf,2)}} ppm** of the analyte. What is the analyte concentration in the original stock (ppm)?',
      explanation: 'Multiply the dilution factors of the two steps: DF = (V₂/V₁)(V₄/V₃). c_stock = c_final × DF.',
      sampled: { V1: choice([1.00, 2.00, 5.00]), V2: choice([50, 100]), V3: choice([2.00, 5.00, 10.00]), V4: choice([50, 100, 250]), cf: range(0.40, 9.00, 0.05, 2) },
      derived: { DF: '(V2 / V1) * (V4 / V3)', c0: 'cf * DF', one: 'cf * V2 / V1' },
      fields: [num('DF', 'Overall dilution factor', '', 'DF', { relTol: 0.005, sig: 4 }), num('c0', 'Stock concentration', 'ppm', 'c0', { relTol: 0.005, paths: [{ label: 'You applied only the first dilution; there are two steps.', expr: 'one' }], ecf: [{ expr: 'cf * u_DF', label: 'Consistent with your own dilution factor, so the method earns part credit.' }] })],
    }),
  ];
  add(node({ id: 'bk-m11-q-dilution', week: WEEK, title: 'Dilution factors', theme: 'Units, Dilutions & Kjeldahl', tags: ['dilution'], source: SRC, family: 'quant-dilution', mins: 4, variants: dil }),
    { id: 'm11.q.dilution', name: 'Dilution factors, single and two-step', chunk: 't1-quant', marks: 3, tags: ['dilution'] });

  const kj = [
    calc({
      id: 'q-kj-pct', label: 'Nitrogen and protein from a back-titration', marks: 5,
      stem: 'A **{{fix(w,3)}} g** food sample is digested and the ammonia distilled into **{{fix(Va,2)}} mL of {{fix(ca,4)}} M HCl**. The excess acid needs **{{fix(Vb,2)}} mL of {{fix(cb,4)}} M NaOH**. Calculate the mass of nitrogen, the % N in the sample, and the % protein (protein = %N × {{fix(fac,2)}}; A_r(N) = 14.01).',
      hint: 'The acid that reacted with NH₃ = acid added − acid left over (found from the NaOH).',
      explanation: 'mmol N = mmol HCl added − mmol NaOH used = c_a V_a − c_b V_b (1 : 1 : 1). mass N = mmol × 14.01 mg. %N = mass N / sample mass × 100. % protein = %N × conversion factor.',
      sampled: { w: range(0.800, 2.000, 0.001, 3), ca: choice([0.1000, 0.1250, 0.2000]), Va: choice([25.00, 50.00]), cb: choice([0.1000, 0.0980, 0.1500]), fac: choice([6.25, 6.38]) },
      derived: { Vb: 'round(ca * Va / cb * (0.30 + 0.45 * ((w * 1000) % 7) / 7), 2)', mmol: 'ca * Va - cb * Vb', mN: 'mmol * 14.01', pN: 'mN / (w * 1000) * 100', prot: 'pN * fac', mmolWrong: 'cb * Vb' },
      fields: [
        num('mN', 'Mass of nitrogen', 'mg', 'mN', { relTol: 0.01, paths: [{ label: 'You used only the NaOH moles; the N is the acid that was *used up* (added − excess).', expr: 'cb * Vb * 14.01' }] }),
        num('pN', '% N', '%', 'pN', { relTol: 0.015, ecf: [{ expr: 'u_mN / (w * 1000) * 100', label: 'Consistent with your own mass of N, so the method earns part credit.' }] }),
        num('prot', '% protein', '%', 'prot', { relTol: 0.015, ecf: [{ expr: 'u_pN * fac', label: 'Consistent with your own %N, so the method earns part credit.' }] }),
      ],
    }),
    calc({
      id: 'q-kj-mel', label: 'Adulterant in milk powder (melamine)', marks: 4,
      stem: 'A **{{fix(w,4)}} g** milk-powder sample contains **{{fix(mN,5)}} g** of nitrogen by Kjeldahl analysis. **{{fix(pc,0)}}%** of this nitrogen is known to come from added melamine (C₃H₆N₆; A_r: C 12.01, N 14.01, H 1.01). Calculate the concentration of melamine in the sample in ppm.',
      hint: 'Melamine is 6 N out of 126.15 g/mol, so each gram of N from melamine means 126.15/84.06 g of melamine.',
      explanation: 'mass N from melamine = mN × pc/100. M(melamine) = 126.15, N in melamine = 6 × 14.01 = 84.06, so mass melamine = mass N × 126.15/84.06. ppm = μg melamine per g of sample.',
      sampled: { w: range(0.3000, 0.6000, 0.0001, 4), mN: range(0.0100, 0.0200, 0.0001, 4), pc: choice([25, 40, 50, 60]) },
      derived: { mNm: 'mN * pc / 100', mm: 'mNm * 126.15 / 84.06', ppm: 'mm * 1000000 / w', wrongN: 'mNm * 1000000 / w' },
      fields: [
        num('mm', 'Mass of melamine', 'g', 'mm', { relTol: 0.01, paths: [{ label: 'You treated the melamine nitrogen as the melamine mass: scale by 126.15/84.06.', expr: 'mNm' }] }),
        num('ppm', 'Melamine', 'ppm', 'ppm', { relTol: 0.015, paths: [{ label: 'You left out the N → melamine mass scaling (126.15/84.06).', expr: 'wrongN' }], ecf: [{ expr: 'u_mm * 1000000 / w', label: 'Consistent with your own melamine mass, so the method earns part credit.' }] }),
      ],
    }),
  ];
  add(node({ id: 'bk-m11-q-kjeldahl', week: WEEK, title: 'Kjeldahl nitrogen, protein and adulterants', theme: 'Units, Dilutions & Kjeldahl', tags: ['kjeldahl', 'ppm'], source: SRC + ' · 2011-12 final Q1', family: 'quant-kjeldahl', mins: 6, variants: kj }),
    { id: 'm11.q.kjeldahl', name: 'Kjeldahl back-titration to %N, % protein and ppm of an adulterant', chunk: 't1-quant', marks: 5, tags: ['kjeldahl'] });
}

export default out;
