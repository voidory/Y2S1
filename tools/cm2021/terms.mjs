/* Term symbols for any d^n (CM2021, chunk terms-ts, skills c8.terms and c8.microstates). The 2025-26 final asked for all terms of d8 (16 marks) and the
   bank only had d2/d8; the method is the same for every d^n, and the exam can change n. Answers come from Figures.termsOf, the exact microstate
   enumeration the in-app terms builder uses (tested for d1 to d9 in tests/figures.test.mjs), so there is one source of truth.
   Run: node tools/cm2021/terms.mjs   — rewrites node bk-c8-terms-gen in question-bank.json and its skill links in skill-map.json.
   Variants: (a) all distinct terms of d2, d3, d4, d7 (the hole shortcut makes d7 = d3), (b) microstates + ground term + 2S for d1 to d9,
   (c) d3 degeneracies and the repeated 2D. */
import fs from 'node:fs';
import { loadEngine } from '../../tests/helpers/load-engine.mjs';

const { Figures } = loadEngine();
const DIR = 'public/content';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const dn = (n) => (n === 10 ? 'd¹⁰' : `d${SUP[n]}`);
const pretty = (sym) => sym.replace(/^(\d)/, (m, d) => SUP[d]);
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const distinct = (t) => [...new Set(t.steps.map((s) => s.symbol))];
const repeats = (t) => { const c = {}; for (const s of t.steps) c[s.symbol] = (c[s.symbol] || 0) + 1; return c; };
const spinPat = (sym) => {
  const m = /^(\d)([SPDFGHI])$/.exec(sym);
  return `^\\s*(?:\\^?\\s*[${m[1]}${SUP[m[1]]}])\\s*${m[2]}\\s*(?:_?\\s*\\d(?:\\/\\d)?)?\\s*\\.?\\s*$`;
};
const synonymsFor = (syms) => {
  const out = {};
  for (const s of syms) { const m = /^(\d)(.)$/.exec(s); const l = s.toLowerCase(); out[`${SUP[m[1]]}${m[2].toLowerCase()}`] = l; out[`^${l}`] = l; out[`${m[1]} ${m[2].toLowerCase()}`] = l; }
  return out;
};

const variants = [];
const HOLE = { 7: 'd⁷ has the same set of terms as d³ (seven electrons are three holes in a full d shell); the repulsion energies differ but the symbols and the ground term (⁴F) are the same.', 8: '', 2: '', 3: '', 4: '' };

for (const n of [2, 3, 4, 7]) {
  const t = Figures.termsOf(n), syms = distinct(t), rep = repeats(t);
  const dup = Object.entries(rep).filter(([, k]) => k > 1).map(([s, k]) => `${pretty(s)} (×${k})`);
  variants.push({
    variantId: `c8-terms-gen-all-d${n}`,
    perspectiveLabel: `all terms of ${dn(n)}`,
    marks: 16,
    stem: `Determine all possible atomic term symbols arising from a ${dn(n)} configuration. (Enter each distinct term once, e.g. 3F; J is not required. A term that occurs more than once is entered once.)`,
    hint: `Build the microstate table by M_L and M_S, take the largest S then the largest L, remove that block (2L+1)(2S+1) of microstates, and repeat until the table is empty. Check: the (2L+1)(2S+1) of all the terms (repeats counted) add up to ${t.total}.`,
    explanation: `${dn(n)} has ${t.total} microstates and these terms: ${t.steps.map((s) => pretty(s.symbol)).join(', ')}${dup.length ? ` (${dup.join(', ')} occur more than once; each is entered once)` : ''}. Check: ${t.steps.map((s) => s.N).join(' + ')} = ${t.steps.reduce((a, s) => a + s.N, 0)}. Ground term ${pretty(t.ground)} (largest S, then largest L).${HOLE[n] ? ' ' + HOLE[n] : ''}`,
    inputSlot: { type: 'unordered_set', placeholder: 'Type one item, press Enter' },
    evaluator: { type: 'set_match', targetSet: syms, caseSensitive: false, penaltyRatio: 0.5, synonyms: synonymsFor(syms) },
  });
}

for (let n = 1; n <= 9; n++) {
  const t = Figures.termsOf(n), g = t.steps[0], twoS = Math.round(2 * g.S);
  variants.push({
    variantId: `c8-terms-gen-gs-d${n}`,
    perspectiveLabel: `${dn(n)} microstates and ground term`,
    marks: 4,
    stem: `For a ${dn(n)} configuration, give the total number of microstates, the ground term (Hund's rules; J not required) and the number of unpaired electrons the ground term corresponds to.`,
    hint: 'Microstates = 10!/(n!(10−n)!). Hund: the largest total spin S first, then the largest L. Unpaired electrons = 2S.',
    explanation: `${dn(n)}: ${10}!/(${n}!·${10 - n}!) = ${t.total} microstates. Fill m_l = +2, +1, 0, −1, −2 with parallel spins as far as possible: S = ${g.S}, M_L = ${g.L}, so the ground term is ${pretty(t.ground)} with ${twoS} unpaired electron${twoS === 1 ? '' : 's'}.`,
    inputSlot: { type: 'mapped_fields', layout: 'table', fields: [{ key: 'm', label: 'Number of microstates' }, { key: 'g', label: 'Ground term' }, { key: 'u', label: 'Unpaired electrons in the ground term' }] },
    evaluator: {
      type: 'mapped_fields_match',
      targets: {
        m: { type: 'numeric', targetExpr: String(C(10, n)), tolerance: 0 },
        g: { acceptedPatterns: [spinPat(t.ground)], caseSensitive: false, expectedDisplay: pretty(t.ground) },
        u: { type: 'numeric', targetExpr: String(twoS), tolerance: 0 },
      },
    },
  });
}

{
  const t = Figures.termsOf(3), N = Object.fromEntries(t.steps.map((s) => [s.symbol, s.N])), rep = repeats(t);
  variants.push({
    variantId: 'c8-terms-gen-check-d3',
    perspectiveLabel: 'd³ degeneracies and the repeated ²D',
    marks: 5,
    stem: 'The d³ configuration (120 microstates) gives the terms 4F, 4P, 2H, 2G, 2F, 2D and 2P, with one of them occurring more than once. Give the number of microstates (2L+1)(2S+1) in each of ⁴F, ⁴P, ²H and ²G, and say how many times ²D occurs so that the microstates add up to 120.',
    hint: '(2L+1)(2S+1) for each term; the terms must add to 120. Whatever is missing after the other six terms is made up by the repeated term.',
    explanation: `⁴F = 7×4 = ${N['4F']}, ⁴P = 3×4 = ${N['4P']}, ²H = 11×2 = ${N['2H']}, ²G = 9×2 = ${N['2G']}, ²F = 7×2 = ${N['2F']}, ²P = 3×2 = ${N['2P']}, and each ²D = 5×2 = ${N['2D']}. ${N['4F'] + N['4P'] + N['2H'] + N['2G'] + N['2F'] + N['2P']} microstates are in the six non-²D terms, so 120 − ${N['4F'] + N['4P'] + N['2H'] + N['2G'] + N['2F'] + N['2P']} = ${120 - (N['4F'] + N['4P'] + N['2H'] + N['2G'] + N['2F'] + N['2P'])} = ${rep['2D']} × ${N['2D']}: ²D occurs ${rep['2D']} times.`,
    inputSlot: { type: 'mapped_fields', layout: 'table', fields: [{ key: 'f', label: '⁴F' }, { key: 'p', label: '⁴P' }, { key: 'h', label: '²H' }, { key: 'g', label: '²G' }, { key: 'd', label: 'Times ²D occurs' }] },
    evaluator: {
      type: 'mapped_fields_match',
      targets: {
        f: { type: 'numeric', targetExpr: String(N['4F']), tolerance: 0 }, p: { type: 'numeric', targetExpr: String(N['4P']), tolerance: 0 },
        h: { type: 'numeric', targetExpr: String(N['2H']), tolerance: 0 }, g: { type: 'numeric', targetExpr: String(N['2G']), tolerance: 0 },
        d: { type: 'numeric', targetExpr: String(rep['2D']), tolerance: 0 },
      },
    },
  });
}

const NODE = {
  schemaVersion: '3.0',
  id: 'bk-c8-terms-gen',
  moduleCode: 'CM2021',
  tier: 'synthesis',
  metadata: {
    title: 'Terms and ground term of any dⁿ',
    source: 'Template of the 2025-26 Q4(a)-(c) (d², d⁸ microstates; all terms of d⁸); answers from the exact microstate enumeration (tools/cm2021/terms.mjs)',
    week: 8,
    primaryTheme: 'Term Symbols',
    conceptTags: ['term-symbols', 'microstates', 'ground-term'],
    difficultyEstimate: 6.5,
    estimatedMinutes: 10,
    examStyle: 'construct_4to6',
    family: 'terms-gen',
  },
  variants,
};

if (process.argv[1].endsWith('terms.mjs')) {
  const bankPath = `${DIR}/cm2021/question-bank.json`, mapPath = `${DIR}/cm2021/skill-map.json`;
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  bank.questionNodes = bank.questionNodes.filter((n) => n.id !== NODE.id).concat(NODE);
  bank.exportedAt = new Date().toISOString();
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 1));
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const skills = ['c8.terms', 'c8.microstates'];
  for (const sid of skills) { const sk = map.skills.find((k) => k.id === sid); sk.nodes = sk.nodes.filter((id) => id !== NODE.id).concat(NODE.id); }
  map.nodeSkills[NODE.id] = skills;
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 1));
  console.log('wrote', variants.length, 'variants');
}
export { NODE };
