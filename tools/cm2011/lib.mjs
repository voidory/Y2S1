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
export const T95 = { 1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228 };
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
