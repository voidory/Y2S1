/* Fresh "name -> oxidation state -> d^n -> geometry -> configuration -> CFSE" chains for CM2021 (chunk field-energetics / naming; skills c6.name,
   c6.ox-dn-cn, c7.splitting, c7.cfse), the template of the 2025-26 Q3(a). The finals use formulas with mixed ligands and counter-ions; the three
   past ones are in bk-c6-p3q3-cfse, and this adds about 45 new ones, each answered by the same engine the metal-ID generator uses (LF.analyzeComplex:
   charge balance, d^n, geometry, spin state, filling, LFSE, IUPAC name), so the answers come from one source of truth.
   Run: node tools/cm2021/chain.mjs   — rewrites node bk-c6-chain-gen in question-bank.json and its skill links in skill-map.json.
   Spin rule: where the spin state matters (Oh d4-d7) the ligands in one sphere must all be weak-field or all strong-field, so the answer is not
   a judgement call; where it does not matter (d1-d3, d8-d10) any mix of the engine's ligands is allowed. */
import fs from 'node:fs';
import { loadEngine } from '../../tests/helpers/load-engine.mjs';

const { LF } = loadEngine();
const DIR = 'public/content';
const data = LF.cloneDefaultData();

let st = 20261123;
const rand = () => { st = (st * 16807) % 2147483647; return (st - 1) / 2147483646; };
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

const LIG = {
  H2O: { f: 'H2O', q: 0, d: 1, c: 'weak' }, F: { f: 'F', q: -1, d: 1, c: 'weak' }, Cl: { f: 'Cl', q: -1, d: 1, c: 'weak' }, Br: { f: 'Br', q: -1, d: 1, c: 'weak' },
  OH: { f: 'OH', q: -1, d: 1, c: 'weak' }, NH3: { f: 'NH3', q: 0, d: 1, c: 'intermediate' }, CN: { f: 'CN', q: -1, d: 1, c: 'strong' },
  CO: { f: 'CO', q: 0, d: 1, c: 'strong' }, en: { f: 'en', q: 0, d: 2, c: 'strong' },
};
const tok = (id, n) => { const f = LIG[id].f; const base = /^[A-Z][a-z]?$/.test(f) ? f : `(${f})`; return n > 1 ? `${base}${n}` : base; };

/* ligand mixtures for CN 6 (octahedral) and CN 4 (tetrahedral): [{id, n}]. Only combinations a lecturer could plausibly set (no carbonyls on
   high-valent metals, no hydroxo mixtures): octahedral from H2O, F-, Cl-, NH3, CN-, en; tetrahedral from Cl-, Br- and NH3. */
function mixtures(cn) {
  const out = [];
  if (cn === 6) {
    const mono = ['H2O', 'F', 'Cl', 'NH3', 'CN'];
    for (const a of mono) {
      out.push([{ id: a, n: 6 }]);
      for (const b of mono) { if (a >= b) continue; for (const k of [1, 2, 3]) out.push([{ id: a, n: 6 - k }, { id: b, n: k }]); }
    }
    out.push([{ id: 'en', n: 3 }]);
    for (const a of ['H2O', 'Cl', 'CN', 'NH3']) out.push([{ id: 'en', n: 2 }, { id: a, n: 2 }]);
    for (const [a, b] of [['H2O', 'Cl'], ['NH3', 'Cl'], ['CN', 'Cl']]) out.push([{ id: 'en', n: 2 }, { id: a, n: 1 }, { id: b, n: 1 }]);
  } else {
    for (const [x, y] of [['Cl', 'Br'], ['Cl', 'NH3'], ['Br', 'NH3']]) for (const k of [1, 2, 3]) out.push([{ id: x, n: 4 - k }, { id: y, n: k }]);
    out.push([{ id: 'Cl', n: 4 }], [{ id: 'Br', n: 4 }]);
  }
  return out;
}

const CAT = ['K', 'Na'], AN = [['Cl', -1], ['Br', -1], ['NO3', -1], ['SO4', -2]];
function template(metal, ox, mix) {
  const inner = mix.map((m) => tok(m.id, m.n)).join('');
  const charge = ox + mix.reduce((a, m) => a + LIG[m.id].q * m.n, 0);
  let pre = '', suf = '';
  if (charge < 0) { const c = CAT[Math.floor(rand() * CAT.length)]; pre = -charge > 1 ? `${c}${-charge}` : c; }
  else if (charge > 0) {
    const opts = AN.filter(([, q]) => charge % -q === 0);
    const [a, q] = opts[Math.floor(rand() * opts.length)], n = charge / -q;
    const poly = /\d/.test(a);
    suf = n > 1 ? (poly ? `(${a})${n}` : `${a}${n}`) : a;
  }
  return { str: `${pre}[${metal}${inner}]${suf}`, charge };
}

const candidates = [];
for (const m of data.metals) {
  for (const ox of m.oxStates) {
    if (ox < 1 || ox > 3) continue;
    for (const cn of [6, 4]) {
      for (const mix of mixtures(cn)) {
        const t = template(m.symbol, ox, mix);
        let a = null;
        try { a = LF.analyzeComplex(t.str); } catch (e) { a = null; }
        if (!a || Math.abs(a.charge) > 3 || a.geometry === 'square_planar' || a.coordNumber !== cn || a.oxState === 0 || !a.iupacName) continue;
        if (a.spinState === 'undetermined' || a.isCoIIIH2OException) continue;
        const classes = new Set(a.ligands.map((l) => l.ligand.fieldClass));
        if (LF.dependsOnSpinState(a.geometry, a.dn) && !(classes.size === 1 && (classes.has('weak') || classes.has('strong')))) continue;
        if (a.dn < 0 || a.dn > 10 || a.lfseCoeff === null) continue;
        if (/^(?:Cu|Zn)$/.test(m.symbol) && ox === 1 && cn === 6) continue;
        candidates.push({ a, mix, hetero: a.isHeteroleptic, counter: Boolean(a.counterIons), td: a.geometry === 'Td', low: a.spinState === 'low' });
      }
    }
  }
}

/* about 45 formulas: a quota per d^n, steered towards a spread of tetrahedral, low-spin, mixed-ligand and counter-ion cases */
const QUOTA = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 5, 6: 6, 7: 5, 8: 4, 9: 3, 10: 1 };
const chosen = [], seen = new Set();
const tally = { td: 0, low: 0, hetero: 0, counter: 0 };
const metalsUsed = {};
for (const [dnS, quota] of Object.entries(QUOTA)) {
  const pool = shuffle(candidates.filter((c) => c.a.dn === Number(dnS)));
  for (let k = 0; k < quota; k++) {
    let best = null, bestScore = -1e9;
    for (const c of pool.slice(0, 400)) {
      if (seen.has(c.a.formula)) continue;
      const s = (c.td && tally.td < 9 ? 2 : 0) + (c.low && tally.low < 14 ? 2 : 0) + (c.hetero && tally.hetero < 26 ? 1.5 : 0) + (c.counter && tally.counter < 32 ? 1 : 0)
        - (metalsUsed[c.a.metal] || 0) * 0.7 + rand() * 0.5;
      if (s > bestScore) { bestScore = s; best = c; }
    }
    if (!best) break;
    seen.add(best.a.formula); chosen.push(best);
    for (const k2 of ['td', 'low', 'hetero', 'counter']) if (best[k2]) tally[k2]++;
    metalsUsed[best.a.metal] = (metalsUsed[best.a.metal] || 0) + 1;
  }
}
chosen.sort((x, y) => x.a.dn - y.a.dn || x.a.formula.localeCompare(y.a.formula));

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹', SUB = '₀₁₂₃₄₅₆₇₈₉';
const sup = (n) => String(n).split('').map((c) => SUP[c]).join('');
/* d-electron configuration, e.g. "t2g^4 eg^2" or "e^2 t2^3" -> a display string and tolerant patterns */
function confParts(cfg) {
  return [...String(cfg).matchAll(/(t2g|eg|t2|e)\^(\d+)/g)].map((m) => ({ name: m[1], n: Number(m[2]) }));
}
const NAMEPAT = { t2g: 't\\s*_?\\s*[2₂]\\s*g', eg: 'e\\s*_?\\s*g', t2: 't\\s*_?\\s*[2₂]', e: 'e' };
const NAMEDISP = { t2g: 't₂g', eg: 'e_g', t2: 't₂', e: 'e' };
function confTargets(cfg) {
  const parts = confParts(cfg);
  const display = parts.map((p) => `${NAMEDISP[p.name]}${sup(p.n)}`).join(' ');
  const tokP = (p) => `\\(?\\s*${NAMEPAT[p.name]}\\s*\\)?\\s*\\^?\\s*[${p.n}${sup(p.n)}]`;
  if (parts.every((p) => p.n === 0)) return { display: 'none (d⁰)', patterns: ['^\\s*(?:none|empty|no\\s+d[\\s-]*electrons?|d\\s*\\^?\\s*[0⁰]|0)\\s*(?:\\([^)]*\\))?\\s*\\.?\\s*$'] };
  const need = parts.filter((p) => p.n > 0), opt = parts.filter((p) => p.n === 0);
  const sep = '[\\s,·.]*';
  const orders = need.length === 2 ? [need, [need[1], need[0]]] : [need];
  const patterns = orders.map((o) => `^\\s*${o.map(tokP).join(sep)}(?:${sep}${opt.map(tokP).join(`(?:${sep})?`) || '(?!)'})?\\s*(?:\\([^)]*\\))?\\s*\\.?\\s*$`);
  return { display, patterns };
}

const unit = (a) => (a.lfseUnit === 'Δo' ? 'Δo' : 'Δt');
const sp = (n) => `d${SUP[n] ?? n}`.replace('d10', 'd¹⁰');
const dnLabel = (n) => (n === 10 ? 'd¹⁰' : `d${SUP[n]}`);

function variantFor(c, idx) {
  const a = c.a, geo = a.geometry === 'Oh' ? 'octahedral' : 'tetrahedral';
  const id = `c6-chain-gen-v${String(idx + 1).padStart(2, '0')}`;
  const ct = confTargets(a.configuration);
  const coeff = a.lfseCoeff + 0, pn = (a.pTermsRelative ?? 0) + 0;
  const u = unit(a);
  const geoPat = a.geometry === 'Oh' ? '^\\s*(?:octahedral|octahedron|Oh|O_h)\\s*(?:\\([^)]*\\))?\\s*\\.?\\s*$' : '^\\s*(?:tetrahedral|tetrahedron|Td|T_d)\\s*(?:\\([^)]*\\))?\\s*\\.?\\s*$';
  const spinWord = a.spinState === 'low' ? 'low-spin' : 'high-spin';
  const why = LF.dependsOnSpinState(a.geometry, a.dn) ? `${[...new Set(a.ligands.map((l) => l.ligand.id))].join(', ')} ${a.fieldClass === 'strong' ? 'are all strong-field, so electrons pair up before filling e_g' : 'are all weak-field, so electrons spread out (high spin)'}.` : `The ${dnLabel(a.dn)} count fills the same way in either field, so the spin state does not change the answer.`;
  return {
    variantId: id,
    perspectiveLabel: `${a.formula} (${dnLabel(a.dn)}, ${geo})`,
    marks: 5,
    stem: `For **\`${a.formula}\`** (assume tetrahedral or octahedral, as appropriate): give its name, the oxidation state of ${a.metal}, its dⁿ count, the geometry, the d-electron configuration in that geometry, the CFSE as a multiple of ${u}, and how many extra pairing energies (P) it has compared with the high-spin arrangement (0 if none).`,
    hint: 'Charge balance first (counter-ions and ligand charges), then dⁿ = group number − oxidation state, then count the donors to choose the geometry, then fill the orbitals (all weak-field ligands: high spin; all strong-field: low spin). Octahedral CFSE: −0.4 Δo per t₂g electron, +0.6 Δo per e_g electron.',
    explanation: `**${a.formula}** is **${a.iupacName}**. Charge balance gives ${a.metal}(${a.oxRoman}), so the metal is ${dnLabel(a.dn)}. ${a.coordNumber} donors: ${geo}. ${why} Configuration ${ct.display} (${spinWord}), CFSE = ${a.lfseExpression}${pn ? `, with ${pn} extra pairing ${pn === 1 ? 'energy' : 'energies'} compared with high spin` : ''}: coefficient ${coeff} ${u}.`,
    inputSlot: {
      type: 'mapped_fields',
      layout: 'table',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'ox', label: `Oxidation state of ${a.metal}` },
        { key: 'd', label: 'n in dⁿ' },
        { key: 'g', label: 'Geometry' },
        { key: 'conf', label: 'Configuration' },
        { key: 'c', label: `CFSE (coefficient of ${u})` },
        { key: 'p', label: 'Extra pairing energies (P)' },
      ],
    },
    evaluator: {
      type: 'mapped_fields_match',
      targets: {
        name: { type: 'pattern', caseSensitive: false, acceptedPatterns: a.acceptedNamePatterns, expectedDisplay: a.iupacName },
        ox: { type: 'numeric', targetExpr: String(a.oxState), tolerance: 0.01 },
        d: { type: 'numeric', targetExpr: String(a.dn), tolerance: 0.01 },
        g: { acceptedPatterns: [geoPat], caseSensitive: false, expectedDisplay: geo },
        conf: { acceptedPatterns: ct.patterns, caseSensitive: false, expectedDisplay: ct.display },
        c: { type: 'numeric', targetExpr: String(coeff), tolerance: 0.01 },
        p: { type: 'numeric', targetExpr: String(pn), tolerance: 0.01 },
      },
    },
  };
}

const NODE = {
  schemaVersion: '3.0',
  id: 'bk-c6-chain-gen',
  moduleCode: 'CM2021',
  tier: 'synthesis',
  metadata: {
    title: 'Name → oxidation state → dⁿ → geometry → configuration → CFSE (fresh formulas)',
    source: 'Template of the 2025-26 Q3(a); formulas generated by the in-app ligand-field engine (tools/cm2021/chain.mjs)',
    week: 7,
    primaryTheme: 'Crystal Field Theory',
    conceptTags: ['cfse-calculation', 'oxidation-state-complex', 'd-electron-count', 'iupac-nomenclature'],
    difficultyEstimate: 5,
    estimatedMinutes: 5,
    examStyle: 'construct_4to6',
    family: 'chain-gen',
  },
  variants: chosen.map(variantFor),
};

if (process.argv[1].endsWith('chain.mjs')) {
  const bankPath = `${DIR}/cm2021/question-bank.json`, mapPath = `${DIR}/cm2021/skill-map.json`;
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  bank.questionNodes = bank.questionNodes.filter((n) => n.id !== NODE.id).concat(NODE);
  bank.exportedAt = new Date().toISOString();
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 1));
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const skills = ['c6.name', 'c6.ox-dn-cn', 'c7.splitting', 'c7.cfse'];
  for (const sid of skills) {
    const sk = map.skills.find((k) => k.id === sid);
    sk.nodes = sk.nodes.filter((id) => id !== NODE.id).concat(NODE.id);
  }
  map.nodeSkills[NODE.id] = skills;
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 1));
  console.log('wrote', NODE.variants.length, 'variants;', JSON.stringify(tally), 'by dn:', JSON.stringify(Object.fromEntries(Object.keys(QUOTA).map((d) => [d, chosen.filter((c) => c.a.dn === Number(d)).length]))));
  for (const c of chosen) console.log(' ', c.a.formula.padEnd(26), c.a.iupacName);
}
export { NODE };
