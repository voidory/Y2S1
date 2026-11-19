/*
 * Helpers for building the CM2011 (analytical chemistry) bundle.
 * Run `node tools/cm2011/build.mjs` to regenerate public/content/cm2011/*.json.
 *
 * Every calculation question is a normal question node: `variables.sampled` draws random data each time the
 * question is served, `variables.derived` computes the answers with the app's expression language, and each
 * answer field is a `numeric` (or `keyword`) target. Nothing here runs in the browser.
 */

export const MODULE = 'CM2011';

/** Two-tailed 95% Student t, by degrees of freedom (the 8-df value 2.306 matches the 2011-12 final's key). */
export const T95 = { 1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228, 15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042, 40: 2.021, 60: 2.000, 120: 1.980 };

/** The booklet's Student t table (two-tailed). Its rows are df = 1-10, 15, 20, 25, 30, 40, 60 and 120 (then infinity), so a df that is not
    listed is read at the next lower row (the exam keys do this: 4.587 for 11 df at 99.9%, 3.725 for 26 df). */
export const TT = {
  50:   { 1: 1.000, 2: 0.816, 3: 0.765, 4: 0.741, 5: 0.727, 6: 0.718, 7: 0.711, 8: 0.706, 9: 0.703, 10: 0.700, 15: 0.691, 20: 0.687, 25: 0.684, 30: 0.683, 40: 0.681, 60: 0.679, 120: 0.677 },
  90:   { 1: 6.314, 2: 2.920, 3: 2.353, 4: 2.132, 5: 2.015, 6: 1.943, 7: 1.895, 8: 1.860, 9: 1.833, 10: 1.812, 15: 1.753, 20: 1.725, 25: 1.708, 30: 1.697, 40: 1.684, 60: 1.671, 120: 1.658 },
  95:   T95,
  98:   { 1: 31.821, 2: 6.965, 3: 4.541, 4: 3.747, 5: 3.365, 6: 3.143, 7: 2.998, 8: 2.896, 9: 2.821, 10: 2.764, 15: 2.602, 20: 2.528, 25: 2.485, 30: 2.457, 40: 2.423, 60: 2.390, 120: 2.358 },
  99:   { 1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032, 6: 3.707, 7: 3.500, 8: 3.355, 9: 3.250, 10: 3.169, 15: 2.947, 20: 2.845, 25: 2.787, 30: 2.750, 40: 2.704, 60: 2.660, 120: 2.617 },
  99.5: { 1: 127.32, 2: 14.089, 3: 7.453, 4: 5.598, 5: 4.773, 6: 4.317, 7: 4.029, 8: 3.832, 9: 3.690, 10: 3.581, 15: 3.252, 20: 3.153, 25: 3.078, 30: 3.030, 40: 2.971, 60: 2.915, 120: 2.860 },
  99.9: { 1: 636.619, 2: 31.598, 3: 12.924, 4: 8.610, 5: 6.869, 6: 5.959, 7: 5.408, 8: 5.041, 9: 4.781, 10: 4.587, 15: 4.073, 20: 3.850, 25: 3.725, 30: 3.646, 40: 3.551, 60: 3.460, 120: 3.373 },
};
/** The value the exam would read for this confidence level and df. */
export function tLookup(level, df) {
  const tab = TT[level];
  const rows = Object.keys(tab).map(Number).sort((a, b) => a - b);
  let use = rows[0];
  for (const r of rows) if (r <= df) use = r;
  return { row: use, t: tab[use] };
}
/** An Expr expression for the table value at a df held in an expression (nested ternaries over the table rows). */
export function tExpr(level, dfExpr) {
  const tab = TT[level];
  const rows = Object.keys(tab).map(Number).sort((a, b) => b - a);
  let e = String(tab[rows[rows.length - 1]]);
  for (let i = rows.length - 2; i >= 0; i--) e = `${dfExpr} >= ${rows[i]} ? ${tab[rows[i]]} : (${e})`;
  return e;
}
/** The 99.9% column of the booklet table as one line, for hints. */
/** A table value as the booklet prints it (three decimals; the 99.5% column starts 127.32). */
export const fmtT = (t) => (t >= 127 && t < 128 ? t.toFixed(2) : t.toFixed(3));
export const tColumnLine = (level) => Object.entries(TT[level]).map(([df, t]) => `${df}: ${fmtT(t)}`).join(', ');
/** Q-test critical values at 90% confidence (the 2010/11 key uses 0.47 for n = 8 and the 2011-12 key 0.56 for n = 6). */
export const Q90 = { 3: 0.941, 4: 0.765, 5: 0.642, 6: 0.560, 7: 0.507, 8: 0.468, 9: 0.437, 10: 0.412 };

/** Extended Debye-Hückel size parameters (nm), given in the questions so nothing depends on memory. */
export const ALPHA = { 'H+': 0.9, 'Na+': 0.4, 'K+': 0.3, 'Ag+': 0.25, 'Ca2+': 0.6, 'Mg2+': 0.8, 'Zn2+': 0.6, 'Cu2+': 0.6, 'Fe2+': 0.6, 'Fe3+': 0.9, 'Al3+': 0.9, 'Cl-': 0.3, 'NO3-': 0.3, 'SO42-': 0.4, 'F-': 0.35, 'OH-': 0.35 };

export const sup = (z) => ({ 1: '⁺', 2: '²⁺', 3: '³⁺', '-1': '⁻', '-2': '²⁻', '-3': '³⁻' })[z];

export const range = (min, max, step, decimals) => ({ type: 'range', min, max, step, ...(decimals !== undefined ? { decimals } : {}) });
export const choice = (options) => ({ type: 'choice', options });

/** n variables name1..namen, each drawn from its own band of [lo, hi] so the data are never all equal. */
export function bands(prefix, n, lo, hi, step, decimals) {
  const out = {};
  const w = (hi - lo) / n;
  for (let i = 0; i < n; i++) {
    const a = lo + i * w;
    const b = lo + (i + 1) * w - step;
    out[`${prefix}${i + 1}`] = range(round(a, decimals), round(Math.max(a, b), decimals), step, decimals);
  }
  return out;
}

export function round(x, d = 6) { return Number(x.toFixed(d)); }
export const names = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);
export const list = (prefix, n) => names(prefix, n).join(', ');
/** A fixed display order so the sorted bands do not appear sorted. */
export function shuffled(prefix, n) {
  const order = [3, 1, 5, 2, 7, 4, 6, 8].filter((k) => k <= n);
  while (order.length < n) order.push(order.length + 1);
  return order.slice(0, n).map((k) => `${prefix}${k}`);
}

/** A one-row (or two-row) markdown table: headers on the first line, values on the second. */
export function table(headers, valueExprs) {
  return `| ${headers.join(' | ')} |\n|${headers.map(() => '---').join('|')}|\n| ${valueExprs.join(' | ')} |`;
}

/** A table with one row per entry of rows (each an array of cell expressions). */
export function tableRows(headers, rows) {
  return `| ${headers.join(' | ')} |\n|${headers.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}`;
}

export const num = (key, label, unit, expr, o = {}) => ({ kind: 'num', key, label, unit, expr, ...o });
export const kw = (key, label, options, expr, o = {}) => ({ kind: 'kw', key, label, options, expr, ...o });

/** A multi-field calculation variant. */
export function calc({ id, label, marks, stem, hint, explanation, sampled = {}, derived = {}, fields }) {
  const slotFields = fields.map((f) => ({ key: f.key, label: f.label, ...(f.unit ? { unit: f.unit } : {}), ...(f.kind === 'kw' ? { options: f.options } : { numeric: true }) }));
  const targets = {};
  for (const f of fields) {
    if (f.kind === 'kw') {
      targets[f.key] = { type: 'keyword', expectedExpr: f.expr, synonyms: f.synonyms || {}, ...(f.displays ? { displays: f.displays } : {}) };
    } else {
      targets[f.key] = {
        type: 'numeric', targetExpr: f.expr, relTol: f.relTol ?? 0.01, sig: f.sig ?? 4,
        ...(f.tol !== undefined ? { tolerance: f.tol } : {}),
        ...(f.unitShown ? { unit: f.unitShown } : f.unit ? { unit: f.unit } : {}),
        ...(f.paths ? { paths: f.paths } : {}), ...(f.ecf ? { ecf: f.ecf } : {}),
      };
    }
  }
  return {
    variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation,
    variables: { sampled, derived },
    inputSlot: { type: 'mapped_fields', layout: 'table', fields: slotFields },
    evaluator: { type: 'mapped_fields_match', targets },
  };
}

/** A pick-one question. options: [id, label][]; correct: id or ids. */
export function pick({ id, label, marks = 1, stem, explanation, options, correct, multi = false, hint }) {
  return {
    variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation,
    inputSlot: { type: 'choice', selectionMode: multi ? 'multi' : 'single', shuffleOptions: true, options: options.map(([i, l]) => ({ id: i, label: l })) },
    evaluator: { type: 'choice_match', targetIds: [].concat(correct), gradingMode: multi ? 'partial_with_penalty' : 'exact' },
  };
}

/** A written answer marked against a checklist. items: [criterion, marks, critical?][] */
export function written({ id, label, stem, explanation, items, paper = false, hint }) {
  return {
    variantId: id, perspectiveLabel: label, marks: items.reduce((a, it) => a + (it[1] ?? 1), 0), stem, ...(hint ? { hint } : {}), explanation,
    ...(paper ? { drawOnPaperThenCompare: true } : {}),
    inputSlot: { type: 'typed_synthesis', placeholder: paper ? 'Sketch it on paper, then tick the box (or note the labels here)…' : 'Write the key points…', minWordsToUnlockRubric: 0, allowPaperScratchpad: true },
    evaluator: { type: 'atomic_rubric', rubric: items.map((it, i) => ({ id: `r${i + 1}`, criterion: it[0], marks: it[1] ?? 1, isCritical: Boolean(it[2]) })) },
  };
}

/** Put steps or parts in order. items: [id, label][] already in the correct order. */
export function order({ id, label, marks = 2, stem, explanation, items, direction }) {
  return {
    variantId: id, perspectiveLabel: label, marks, stem, explanation,
    inputSlot: { type: 'ordered_list', directionLabel: direction, items: items.map(([i, l]) => ({ id: i, label: l })) },
    evaluator: { type: 'order_match', targetOrder: items.map(([i]) => i) },
  };
}

/** Short typed answers, one per field, each matched by regular expressions. fields: [key, label, display, patterns[]][] */
export function recall({ id, label, marks, stem, explanation, hint, fields }) {
  const targets = {};
  for (const [key, , display, patterns] of fields) targets[key] = { acceptedPatterns: patterns, caseSensitive: false, expectedDisplay: display };
  return {
    variantId: id, perspectiveLabel: label, marks: marks ?? fields.length, stem, ...(hint ? { hint } : {}), explanation,
    inputSlot: { type: 'mapped_fields', layout: 'table', fields: fields.map(([key, lab]) => ({ key, label: lab })) },
    evaluator: { type: 'mapped_fields_match', targets },
  };
}

export function node({ id, week, title, theme, tags, tier = 'synthesis', exam = 'construct_4to6', family, diff = 3, mins = 4, source, variants }) {
  return {
    schemaVersion: '3.0', id, moduleCode: MODULE, tier,
    metadata: { title, source, week, primaryTheme: theme, conceptTags: tags, difficultyEstimate: diff, estimatedMinutes: mins, examStyle: exam, family: family || id },
    variants,
  };
}

/** Regex that accepts any of the phrases as whole words, in any case, with optional punctuation around. */
export const anyOf = (...phrases) => `^\\s*(?:${phrases.join('|')})\\s*[.)]?\\s*$`;
export const has = (...phrases) => `(?:${phrases.join('|')})`;
