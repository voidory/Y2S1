import { TT, tLookup, tExpr, tColumnLine, fmtT, range, choice, bands, names, list, shuffled, tableRows, num, kw, calc, node } from './lib.mjs';

/* Two-method t-tests the way the finals set them: at 99% or 99.9%, no printed critical value (the booklet's t table is the source), the
   d column given for a paired test, summary statistics for a pooled test, and a df the table does not list (read the next lower row).
   Every final in the set has one of these (4 to 6 marks); the last four used 99.9%. */
const SRC = 'Topic 1 · booklet t table; final-style';
const THEME = 'Statistics';
const WEEK = 1;
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });
const COLS = [99.9, 99.5, 99, 98, 95, 90, 50];
const hintTable = (level) => `The booklet's ${level}% column (df: t): ${tColumnLine(level)}. If your df is not listed, take the next lower row.`;
const SYN_DEC = { same: ['same', 'no significant difference', 'not different', 'agree', 'no difference'], different: ['different', 'significant', 'disagree'] };

function tPaths(level, dfExpr, extra = []) {
  const others = level === 99.9 ? [95, 99] : [95, 99.9];
  return [
    ...others.map((l) => ({ label: `That is the ${l}% column. Use the ${level}% column of the booklet table.`, expr: tExpr(l, dfExpr) })),
    ...extra,
  ];
}

/* ---------- paired, d column given ---------- */
function paired({ id, n, level, what, unit, label, marks }) {
  const df = n - 1;
  const tt = tLookup(level, df);
  const x = Object.fromEntries(Array.from({ length: n }, (_, i) => [`x${i + 1}`, range(15, 95, 1, 0)]));
  const e = bands('e', n, -1.5, 1.5, 0.1, 1);
  const ord = shuffled('', n).map(Number);
  const D = names('d', n);
  const rows = ord.map((k, r) => [String(r + 1), `{{fix(x${k},0)}}`, `{{fix(y${k},1)}}`, `{{fix(d${k},1)}}`]);
  const note = tt.row === df ? '' : ` (${df} degrees of freedom is not a row of the table: use the next lower row, ${tt.row})`;
  return calc({
    id, label, marks,
    stem: `${what} was measured at ${n} different times by an existing instrument and by a new one (${unit}):\n\n${tableRows(['#', 'Existing', 'New', 'd = existing − new'], rows)}\n\nUse an appropriate Student t-test to decide whether the two instruments give different results at the **${level}% confidence level**. Look the critical value up in the booklet's t table and enter the value you used.`,
    hint: `The same samples are measured by both instruments, so this is a **paired** test: t = |d̄|√n / s_d with n − 1 degrees of freedom. ${hintTable(level)}`,
    explanation: `The d column is given, so work with it: d̄ and s_d, then t_calc = |d̄|√n / s_d. A paired test has n − 1 = ${df} degrees of freedom, so the ${level}% critical value is **${tt.t}**${note}. If t_calc is larger than that the instruments differ significantly at ${level}%; if not, the data cannot show a difference at that level. A higher confidence level needs a larger t_calc, so a result that is significant at 95% can fail at 99.9%.`,
    sampled: { ...x, ...e, bias: choice([0.3, 0.8, 2, 3, 4]) },
    derived: {
      ...Object.fromEntries(D.map((d, i) => [d, `round(bias + e${i + 1}, 1)`])),
      ...Object.fromEntries(D.map((d, i) => [`y${i + 1}`, `x${i + 1} - ${d}`])),
      db: `mean(${list('d', n)})`, sd_: `sd(${list('d', n)})`, tc: `abs(db) * sqrt(${n}) / sd_`, tt: String(tt.t),
      dec: `tc > ${tt.t} ? 'different' : 'same'`,
    },
    fields: [
      num('db', 'Mean difference d̄', unit, 'db', { relTol: 0.03, tol: 0.05 }),
      num('sd_', 'Standard deviation of d', unit, 'sd_', { relTol: 0.03 }),
      num('tc', 't_calc', '', 'tc', { relTol: 0.04, sig: 3, paths: [{ label: 'You left out the √n: t = |d̄|√n / s_d.', expr: 'abs(db) / sd_' }], ecf: [{ expr: `abs(u_db) * sqrt(${n}) / u_sd_`, label: 'Consistent with your own d̄ and s_d, so the method earns part credit.' }] }),
      num('tt', `t_table (${level}%, ${df} df)`, '', 'tt', { relTol: 0.001, sig: 4, paths: tPaths(level, String(df), [{ label: 'Degrees of freedom for a paired test are n − 1.', expr: String(tLookup(level, n).t) }]) }),
      kw('dec', `Same or different at ${level}%?`, ['same', 'different'], 'dec', { synonyms: SYN_DEC, displays: { same: `same (t_calc < ${tt.t})`, different: `different (t_calc > ${tt.t})` } }),
    ],
  });
}

/* ---------- pooled, summary statistics (the 2025/26 form) ---------- */
function pooledStats(level) {
  return calc({
    id: `t-pooled-${String(level).replace('.', '')}-stats`, label: `Pooled test from summary statistics, ${level}% (4 marks)`, marks: 4,
    stem: 'Two methods were used to measure the 24-hour PM2.5 concentration in the air (µg m⁻³). The summary statistics are:\n\n' +
      tableRows(['Method', 'Mean', 'Std. dev.', 'No. measurements'], [['1', '{{fix(m1,2)}}', '±{{fix(s1,2)}}', '{{fix(N1,0)}}'], ['2', '{{fix(m2,2)}}', '±{{fix(s2,2)}}', '{{fix(N2,0)}}']]) +
      `\n\nUse an appropriate Student t-test to decide whether the two methods give different results at the **${level}% confidence level**. Give the degrees of freedom and the critical value you read from the booklet's t table.`,
    hint: `The two methods each measured the same quantity several times, so use the **pooled** test: s_pooled = √[((N₁−1)s₁² + (N₂−1)s₂²)/(N₁+N₂−2)] and t = |x̄₁ − x̄₂|/s_pooled × √(N₁N₂/(N₁+N₂)). ${hintTable(level)}`,
    explanation: `s_pooled weights the variances by their degrees of freedom; df = N₁ + N₂ − 2. t_calc = |x̄₁ − x̄₂|/s_pooled · √(N₁N₂/(N₁+N₂)). The booklet table lists df = 1–10, 15, 20, 25, 30, 40, 60 and 120, so a df that is not listed is read at the next lower row (for example 26 df is read at 25). If t_calc exceeds that critical value the methods differ significantly at ${level}%.`,
    sampled: { N1: choice([12, 15, 18, 20, 24]), N2: choice([6, 8, 10]), m2: range(20, 30, 0.01, 2), gap: choice([1.0, 2.5, 4.0, 6.0]), s1: range(2.50, 4.50, 0.01, 2), s2: range(1.20, 2.40, 0.01, 2) },
    derived: {
      m1: 'round(m2 + gap, 2)', df: 'N1 + N2 - 2',
      sp: 'sqrt(((N1 - 1) * s1^2 + (N2 - 1) * s2^2) / df)', tc: 'abs(m1 - m2) / sp * sqrt(N1 * N2 / (N1 + N2))',
      tt: tExpr(level, 'df'), dec: `tc > (${tExpr(level, 'df')}) ? 'different' : 'same'`,
    },
    fields: [
      num('sp', 's_pooled', 'µg m⁻³', 'sp', { relTol: 0.03, sig: 4, paths: [{ label: 'You averaged the two standard deviations; pool the variances instead.', expr: '(s1 + s2) / 2' }] }),
      num('tc', 't_calc', '', 'tc', { relTol: 0.04, sig: 3, paths: [{ label: 'You left out the √(N₁N₂/(N₁+N₂)) factor.', expr: 'abs(m1 - m2) / sp' }], ecf: [{ expr: 'abs(m1 - m2) / u_sp * sqrt(N1 * N2 / (N1 + N2))', label: 'Consistent with your own s_pooled, so the method earns part credit.' }] }),
      num('df', 'Degrees of freedom', '', 'df', { relTol: 0.001, sig: 3, paths: [{ label: 'For a pooled test df = N₁ + N₂ − 2.', expr: 'N1 + N2 - 1' }, { label: 'For a pooled test df = N₁ + N₂ − 2.', expr: 'N1 + N2' }] }),
      num('tt', `t_table (${level}%)`, '', 'tt', { relTol: 0.001, sig: 4, paths: tPaths(level, 'df', [{ label: 'Read the table at df = N₁ + N₂ − 2, then take the next lower listed row.', expr: tExpr(level, '(df + 1)') }]) }),
      kw('dec', `Same or different at ${level}%?`, ['same', 'different'], 'dec', { synonyms: SYN_DEC, displays: { same: 'same (t_calc < t_table)', different: 'different (t_calc > t_table)' } }),
    ],
  });
}

/* ---------- pooled, raw replicates, df not in the table (the 2021/22 form) ---------- */
function pooledRaw(n1, n2, level) {
  const df = n1 + n2 - 2;
  const tt = tLookup(level, df);
  const A = names('a', n1), B = names('b', n2);
  const note = tt.row === df ? '' : ` (${df} degrees of freedom is not a row of the table: use the next lower row, ${tt.row})`;
  return calc({
    id: `t-pooled-${String(level).replace('.', '')}-raw-${n1}v${n2}`, label: `Pooled test on replicates, ${level}% (${n1} v ${n2}, 4 marks)`, marks: 4,
    stem: `Calcium in a milk sample was measured by two methods, ${n1} replicates by ICP-OES and ${n2} by an ion-selective electrode (mmol L⁻¹):\n\n${tableRows(['#', 'ICP-OES', 'ISE'], Array.from({ length: Math.max(n1, n2) }, (_, i) => [String(i + 1), i < n1 ? `{{fix(${shuffled('a', n1)[i]},1)}}` : '–', i < n2 ? `{{fix(${shuffled('c', n2)[i]},1)}}` : '–']))}\n\nUse a pooled Student t-test to decide whether the two methods give different results at the **${level}% confidence level**. Give the critical value you read from the booklet's t table.`,
    hint: `Pool the variances: s_pooled = √[((N₁−1)s₁² + (N₂−1)s₂²)/(N₁+N₂−2)], then t = |x̄₁ − x̄₂|/s_pooled × √(N₁N₂/(N₁+N₂)). df = ${n1} + ${n2} − 2 = ${df}. ${hintTable(level)}`,
    explanation: `s_pooled combines the variances weighted by degrees of freedom, df = N₁ + N₂ − 2 = ${df}. t_calc = |x̄₁ − x̄₂|/s_pooled · √(N₁N₂/(N₁+N₂)). The ${level}% critical value for ${df} df is **${tt.t}**${note}. t_calc above it means the methods differ significantly at ${level}%.`,
    sampled: { ...bands('a', n1, 30.0, 31.4, 0.1, 1), ...bands('b', n2, 30.0, 31.4, 0.1, 1), sh: choice([0, 0.5, 1.2, 2.0, 3.0]) },
    derived: {
      ...Object.fromEntries(B.map((v, i) => [`c${i + 1}`, `${v} + sh`])),
      m1: `mean(${list('a', n1)})`, s1: `sd(${list('a', n1)})`, m2: `mean(${list('c', n2)})`, s2: `sd(${list('c', n2)})`,
      sp: `sqrt(((${n1}-1)*s1^2 + (${n2}-1)*s2^2) / ${df})`, tc: `abs(m1 - m2) / sp * sqrt(${n1 * n2} / ${n1 + n2})`,
      tt: String(tt.t), dec: `tc > ${tt.t} ? 'different' : 'same'`,
    },
    fields: [
      num('sp', 's_pooled', 'mmol L⁻¹', 'sp', { relTol: 0.03, sig: 4, paths: [{ label: 'You averaged the two standard deviations; pool the variances instead.', expr: '(s1 + s2) / 2' }] }),
      num('tc', 't_calc', '', 'tc', { relTol: 0.04, sig: 3, paths: [{ label: 'You left out the √(N₁N₂/(N₁+N₂)) factor.', expr: 'abs(m1 - m2) / sp' }], ecf: [{ expr: `abs(m1 - m2) / u_sp * sqrt(${n1 * n2} / ${n1 + n2})`, label: 'Consistent with your own s_pooled, so the method earns part credit.' }] }),
      num('tt', `t_table (${level}%, ${df} df)`, '', 'tt', { relTol: 0.001, sig: 4, paths: tPaths(level, String(df), [{ label: 'For a pooled test df = N₁ + N₂ − 2.', expr: String(tLookup(level, df + 1).t) }]) }),
      kw('dec', `Same or different at ${level}%?`, ['same', 'different'], 'dec', { synonyms: SYN_DEC, displays: { same: `same (t_calc < ${tt.t})`, different: `different (t_calc > ${tt.t})` } }),
    ],
  });
}

add(node({
  id: 'bk-m11-t1-ttest-final', week: WEEK, title: 'Two-method t-tests at 99% and 99.9% (booklet look-up)', theme: THEME, tags: ['t-test', 'paired', 'pooled', 'booklet-table'], source: SRC, family: 'stats-test', mins: 8,
  variants: [
    paired({ id: 't-paired-999-n6', n: 6, level: 99.9, what: '24-hour SO₂', unit: 'µg m⁻³', label: 'Paired, 99.9%, 6 pairs (5 marks)', marks: 5 }),
    paired({ id: 't-paired-999-n8', n: 8, level: 99.9, what: '24-hour PM2.5', unit: 'µg m⁻³', label: 'Paired, 99.9%, 8 pairs (5 marks)', marks: 5 }),
    paired({ id: 't-paired-99-n12', n: 12, level: 99, what: '24-hour PM2.5', unit: 'µg m⁻³', label: 'Paired, 99%, 12 pairs: df not in the table (5 marks)', marks: 5 }),
    pooledStats(99.9),
    pooledStats(99),
    pooledRaw(7, 6, 99.9),
  ],
}), { id: 'm11.t1.ttestfinal', name: 'Paired and pooled t-tests at 99% and 99.9%, reading the booklet table', chunk: 't1-stats', marks: 5, tags: ['t-test', 'booklet-table'] });

/* ---------- at which level does the verdict flip ---------- */
{
  const OPT = ['none of the levels', '50%', '90%', '95%', '98%', '99%', '99.5%', '99.9%'];
  const colVar = (l) => 't' + String(l).replace('.', '');
  const derived = { df: 'dfv' };
  for (const l of [50, 90, 95, 98, 99, 99.5, 99.9]) derived[colVar(l)] = tExpr(l, 'dfv');
  derived.lvl = "tc > t999 ? '99.9%' : (tc > t995 ? '99.5%' : (tc > t99 ? '99%' : (tc > t98 ? '98%' : (tc > t95 ? '95%' : (tc > t90 ? '90%' : (tc > t50 ? '50%' : 'none of the levels'))))))";
  const dfs = [5, 6, 7, 8, 9, 10, 15, 20];
  add(node({
    id: 'bk-m11-t1-levels', week: WEEK, title: 'At which confidence level does the verdict flip?', theme: THEME, tags: ['t-test', 'confidence-level'], source: SRC, family: 'stats-test', tier: 'atomic', exam: 'short_2to3', mins: 3,
    variants: [calc({
      id: 't-levels', label: 'Highest level at which the methods still differ (2 marks)', marks: 2,
      stem: 'A t-test comparing two methods gives **t_calc = {{fix(tc,1)}}** with **{{fix(dfv,0)}} degrees of freedom**. Using the booklet\'s t table (columns 50, 90, 95, 98, 99, 99.5 and 99.9%), what is the **highest confidence level at which the two methods still give significantly different results**?',
      hint: 'The methods differ at a level when t_calc is larger than the table value for that level. Higher confidence levels need larger t. Booklet rows (df: 50 / 90 / 95 / 98 / 99 / 99.5 / 99.9%): ' + dfs.map((d) => `${d}: ${[50, 90, 95, 98, 99, 99.5, 99.9].map((l) => fmtT(TT[l][d])).join(' / ')}`).join('; ') + '.',
      explanation: 'Find the row for the degrees of freedom and compare t_calc with each column from the left: the verdict is "different" for every level whose critical value is below t_calc, and "same" from the first level whose critical value is above it. The answer is the highest level in the "different" range.',
      sampled: { tc: choice([0.6, 1.5, 2.4, 3.0, 3.4, 4.0, 5.2, 7.5]), dfv: choice(dfs) },
      derived,
      fields: [kw('lvl', 'Highest level at which they differ', OPT, 'lvl', { synonyms: Object.fromEntries(OPT.map((o) => [o, [o]])) })],
    })],
  }), { id: 'm11.t1.levels', name: 'Highest confidence level at which a t result is still significant', chunk: 't1-stats', marks: 2, tags: ['t-test', 'confidence-level'] });
}

export default out;
