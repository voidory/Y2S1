/* Kinjo half, batch 5: formal charge generator. The example mid-term asks the formal charge of Al in Al₂Cl₆ and I in I₂Cl₆ (both −1, bridging Cl +1);
   the bank held that item plus SCN⁻ and NH₃→BF₃ as fixed variants. Formal charge = valence electrons − non-bonding electrons − number of bonds
   (a double bond counts as two). This writes 10 variants with new structures (Part 1 slides 'Formal Charge', 'Lewis exception' and 'BF₃ π' plus
   the dative-bond slides). Answers are recomputed in tests/kinjo5-items.test.mjs from a hand-written table.
   Run: node tools/cm2021/kinjo5.mjs */
import fs from 'node:fs';

const DIR = 'public/content';
const L = 'abcdefghij';
const base = (id, label, marks, stem, explanation, sourceSlide, hint) => ({ variantId: id, perspectiveLabel: label, marks, stem, ...(hint ? { hint } : {}), explanation, sourceSlide });
const node = (id, title, source, week, theme, tags, est, family, variants) => ({
  schemaVersion: '3.0', id, moduleCode: 'CM2021', tier: 'atomic',
  metadata: { title, source, week, primaryTheme: theme, conceptTags: tags, difficultyEstimate: 3, estimatedMinutes: est, examStyle: 'short_2to3', family },
  variants,
});

// atom: [label, valence electrons, lone pairs, bonds (double = 2), description of its environment]
export const fc = ([, V, lp, b]) => V - 2 * lp - b;
const STRUCTS = [
  ['Al₂Cl₆', 'Al₂Cl₆ has two bridging Cl atoms. Each Al has four single bonds (two to terminal Cl, two to bridging Cl) and no lone pair; a bridging Cl has two single bonds and two lone pairs; a terminal Cl has one bond and three lone pairs.',
    [['Al', 3, 0, 4], ['bridging Cl', 7, 2, 2], ['terminal Cl', 7, 3, 1]], 's-fc'],
  ['I₂Cl₆', 'I₂Cl₆ has two bridging Cl atoms. Each I has four single bonds (two to terminal Cl, two to bridging Cl) and two lone pairs; a bridging Cl has two single bonds and two lone pairs; a terminal Cl has one bond and three lone pairs.',
    [['I', 7, 2, 4], ['bridging Cl', 7, 2, 2], ['terminal Cl', 7, 3, 1]], 's-fc'],
  ['H₃N→BF₃', 'In the adduct H₃N–BF₃ the N has four single bonds (three to H, one to B) and no lone pair; B has four single bonds (three to F, one to N) and no lone pair; each F has one bond and three lone pairs.',
    [['N', 5, 0, 4], ['B', 3, 0, 4], ['F', 7, 3, 1]], 's-dative'],
  ['H₃O⁺, NH₄⁺, BF₄⁻, BH₄⁻', 'H₃O⁺: O has three single bonds and one lone pair. NH₄⁺: N has four single bonds and no lone pair. BF₄⁻ and BH₄⁻: B has four single bonds and no lone pair.',
    [['O in H₃O⁺', 6, 1, 3], ['N in NH₄⁺', 5, 0, 4], ['B in BF₄⁻', 3, 0, 4], ['B in BH₄⁻', 3, 0, 4]], 's-fc'],
  ['SCN⁻ (structures B and C)', 'Structure B of SCN⁻ is S–C≡N with three lone pairs on S and one on N. Structure C is S≡C–N with one lone pair on S and three on N.',
    [['S in B', 6, 3, 1], ['N in B', 5, 1, 3], ['S in C', 6, 1, 3], ['N in C', 5, 3, 1]], 's-fc'],
  ['O₃ and NO₃⁻', 'In O₃ drawn O=O⁺–O⁻, the central O has one double and one single bond and one lone pair, the double-bonded end O has two lone pairs, and the single-bonded end O has three lone pairs. In NO₃⁻ the N has one double and two single bonds and no lone pair, the double-bonded O has two lone pairs and each single-bonded O has three.',
    [['central O in O₃', 6, 1, 3], ['single-bonded end O in O₃', 6, 3, 1], ['N in NO₃⁻', 5, 0, 4], ['single-bonded O in NO₃⁻', 6, 3, 1]], 's-fc'],
  ['CO and N₂O', 'CO has a triple bond; C has one lone pair and O has one lone pair. In N₂O drawn N≡N⁺–O⁻ the terminal N has a triple bond and one lone pair, the central N has a triple and a single bond and no lone pair, and O has one bond and three lone pairs.',
    [['C in CO', 4, 1, 3], ['O in CO', 6, 1, 3], ['central N in N₂O', 5, 0, 4], ['O in N₂O', 6, 3, 1]], 's-fc'],
  ['BF₃ with a B=F π bond', 'In one resonance form of BF₃ a B=F double bond is drawn: that B has one double and two single bonds and no lone pair, the double-bonded F has two lone pairs and the other two F each have three.',
    [['B', 3, 0, 4], ['double-bonded F', 7, 2, 2], ['single-bonded F', 7, 3, 1]], 's-bf3'],
  ['SO₄²⁻ with all single bonds', 'In the Lewis structure of SO₄²⁻ with four S–O single bonds, S has four bonds and no lone pair and each O has one bond and three lone pairs.',
    [['S', 6, 0, 4], ['O', 6, 3, 1]], 's-expanded'],
  ['SO₄²⁻ with two S=O bonds', 'In the Lewis structure of SO₄²⁻ with two S=O and two S–O⁻ bonds, S has six bonds (two double, two single) and no lone pair; a double-bonded O has two lone pairs; a single-bonded O has three.',
    [['S', 6, 0, 6], ['double-bonded O', 6, 2, 2], ['single-bonded O', 6, 3, 1]], 's-expanded'],
];
const why = (a) => `${a[0]}: ${a[1]} − 2(${a[2]}) − ${a[3]} = ${fc(a) > 0 ? '+' : ''}${fc(a)}`;
const variants = STRUCTS.map(([name, desc, atoms, slide], i) => ({
  ...base(`c1-fc-gen-${String(i + 1).padStart(2, '0')}`, name, atoms.length, `${desc} Give the formal charge of each atom listed.`,
    `Formal charge = valence electrons − non-bonding electrons − number of bonds. ${atoms.map(why).join('; ')}.${name === 'Al₂Cl₆' || name === 'I₂Cl₆' ? ' The bridging Cl is +1 in both because it forms two bonds; Al and I are both −1 because each makes four bonds.' : ''}${name.startsWith('SO₄²⁻ with all') ? ' The formal charges on S (+2) are larger than in the structure with S=O bonds (0), which is why the expanded-octet form is drawn.' : ''}`,
    slide, 'Formal charge = V − (non-bonding electrons) − (bonds); count each non-bonding electron individually (a lone pair = 2), a double bond = 2 bonds.'),
  inputSlot: { type: 'mapped_fields', layout: 'table', fields: atoms.map((a, j) => ({ key: `a${j}`, label: `Formal charge of ${a[0]}` })) },
  evaluator: { type: 'mapped_fields_match', targets: Object.fromEntries(atoms.map((a, j) => [`a${j}`, { type: 'numeric', targetExpr: String(fc(a) + 0), tolerance: 0 }])) },
}));
variants.push({
  ...base('c1-fc-gen-11', 'which sulfate structure', 1, 'Two Lewis structures of SO₄²⁻ are drawn: one with four S–O single bonds, one with two S=O and two S–O⁻ bonds. Which statement is correct?', 'x', 's-expanded'),
  inputSlot: { type: 'choice', selectionMode: 'single', options: [
    'The structure with two S=O bonds has the smaller formal charges (S 0 and O 0 or −1), so it is preferred, and S can expand its octet because 3d/higher orbitals are close in energy',
    'The all-single-bond structure is preferred because S obeys the octet and has a formal charge of +2',
    'The two structures have identical formal charges',
    'Sulfur cannot form S=O bonds because it is in the third period',
    'Formal charges are irrelevant to choosing between Lewis structures'].map((o, i) => ({ id: L[i], label: o })), shuffleOptions: true },
  evaluator: { type: 'choice_match', targetIds: ['a'], gradingMode: 'exact' },
});
variants[10].explanation = 'All-single bonds: S +2 and each O −1. With two S=O bonds: S 0, double-bonded O 0, single-bonded O −1. Smaller formal charges mean a better contributor, and from the third period down the valence shell can hold more than 8 electrons (the slides’ “expanded shells” exception).';
variants[10].marks = 1;

const fcNode = node('bk-c1-fc-gen', 'Formal charge from a described Lewis structure', 'Chapter 1 Part 1 slides (Formal Charge, Lewis exceptions, BF₃ π), Part 4 slides 52-55; Kinjo example mid-term (Al₂Cl₆ and I₂Cl₆)', 1, 'Formal Charge', ['formal-charge', 'lewis-structure'], 3, 'fc-gen', variants);


/* ---------- a small Lewis-structure SVG handler: atoms at fixed positions, bond lines, lone-pair dots, formal-charge labels ---------- */
const DIRS = [0, 45, 90, 135, 180, 225, 270, 315];
const angDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
export function lewisSvg(structs, caption) {
  const xs = structs.flatMap((st) => st.atoms.map((a) => a.x)), cxm = (Math.min(...xs) + Math.max(...xs)) / 2;
  const x0 = Math.min(Math.min(...xs) - 30, cxm - 150), W = Math.max(Math.max(...xs) + 36, cxm + 150) - x0;
  let cur = 4; const offs = [], titleY = [];
  structs.forEach((st) => { const ys = st.atoms.map((a) => a.y), tsp = st.title ? 22 : 0; titleY.push(cur + 12); offs.push(cur + tsp + 22 - Math.min(...ys)); cur += tsp + 22 + (Math.max(...ys) - Math.min(...ys)) + 26; });
  const H = cur + 4;
  let out = '';
  structs.forEach((st, si) => {
    const oy = offs[si], at = Object.fromEntries(st.atoms.map((a) => [a.id, a]));
    const ang = (a, b) => (Math.atan2(-(b.y - a.y), b.x - a.x) * 180 / Math.PI + 360) % 360;
    const bondDirs = Object.fromEntries(st.atoms.map((a) => [a.id, []]));
    for (const [i, j] of st.bonds) { bondDirs[i].push(ang(at[i], at[j])); bondDirs[j].push(ang(at[j], at[i])); }
    if (st.title) out += `<text x="${x0 + 4}" y="${titleY[si]}" font-size="11" fill="#475569" font-weight="600">${st.title}</text>`;
    for (const [i, j, order = 1, arrow] of st.bonds) {
      const a = at[i], b = at[j], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      const offs = order === 1 ? [0] : order === 2 ? [-2.5, 2.5] : [-4, 0, 4];
      for (const o of offs) out += `<line x1="${a.x + nx * o}" y1="${oy + a.y + ny * o}" x2="${b.x + nx * o}" y2="${oy + b.y + ny * o}" stroke="#0f172a" stroke-width="1.6"/>`;
      if (arrow) { const mx = a.x + dx * 0.55, my = a.y + dy * 0.55, ux = dx / len, uy = dy / len; out += `<polygon points="${mx + ux * 7},${oy + my + uy * 7} ${mx - ux * 3 + nx * 5},${oy + my - uy * 3 + ny * 5} ${mx - ux * 3 - nx * 5},${oy + my - uy * 3 - ny * 5}" fill="#0f172a"/>`; }
    }
    for (const a of st.atoms) {
      const chosen = [];
      for (let k = 0; k < (a.lp || 0); k++) {
        let best = null, bd = -1;
        for (const d of DIRS) { if (chosen.includes(d)) continue; const m = Math.min(...[...bondDirs[a.id], ...chosen].map((x) => angDist(d, x)), 360); if (m > bd) { bd = m; best = d; } }
        chosen.push(best);
      }
      for (const d of chosen) {
        const r = d % 90 === 0 ? 17 : 19, cx = a.x + r * Math.cos(d * Math.PI / 180), cy = oy + a.y - r * Math.sin(d * Math.PI / 180), px = -Math.sin(d * Math.PI / 180) * 3.2, py = -Math.cos(d * Math.PI / 180) * 3.2;
        out += `<circle cx="${cx + px}" cy="${cy + py}" r="1.7" fill="#0f172a"/><circle cx="${cx - px}" cy="${cy - py}" r="1.7" fill="#0f172a"/>`;
      }
      out += `<circle cx="${a.x}" cy="${oy + a.y}" r="9" fill="#fff"/><text x="${a.x}" y="${oy + a.y + 4.5}" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">${a.el}</text>`;
      if (a.fc !== undefined && a.fc !== 0) out += `<text x="${a.x + 12}" y="${oy + a.y - 9}" font-size="13" font-weight="800" fill="${a.fc > 0 ? '#1d4ed8' : '#be123c'}">${a.fc > 0 ? '+' : '−'}${Math.abs(a.fc)}</text>`;
    }
  });
  return { type: 'svg', payload: `<svg viewBox="${x0} 0 ${W} ${H}" role="img" aria-label="${caption}" style="width:100%;max-width:${W}px;height:auto;display:block;margin:0 auto">${out}</svg>`, caption };
}
const A = (id, el, x, y, lp, fcv) => ({ id, el, x, y, lp, fc: fcv });
const dimer = (m, fcM, lpM) => ({ atoms: [A('m1', m, 120, 94, lpM, fcM), A('m2', m, 220, 94, lpM, fcM), A('b1', 'Cl', 170, 44, 2, 1), A('b2', 'Cl', 170, 144, 2, 1),
  A('t1', 'Cl', 70, 44, 3, 0), A('t2', 'Cl', 70, 144, 3, 0), A('t3', 'Cl', 270, 44, 3, 0), A('t4', 'Cl', 270, 144, 3, 0)],
  bonds: [['m1', 'b1'], ['m1', 'b2'], ['m2', 'b1'], ['m2', 'b2'], ['m1', 't1'], ['m1', 't2'], ['m2', 't3'], ['m2', 't4']] });
export const FIGS = {
  al2cl6: lewisSvg([dimer('Al', -1, 0)], 'Al₂Cl₆: Al −1, bridging Cl +1, terminal Cl 0'),
  i2cl6: lewisSvg([dimer('I', -1, 2)], 'I₂Cl₆: I −1 with two lone pairs (above and below the plane), bridging Cl +1'),
  adduct: lewisSvg([{ atoms: [A('n', 'N', 110, 95, 0, 1), A('b', 'B', 210, 95, 0, -1), A('h1', 'H', 110, 40, 0), A('h2', 'H', 60, 130, 0), A('h3', 'H', 110, 150, 0), A('f1', 'F', 210, 40, 3), A('f2', 'F', 260, 130, 3), A('f3', 'F', 210, 150, 3)],
    bonds: [['n', 'b', 1, true], ['n', 'h1'], ['n', 'h2'], ['n', 'h3'], ['b', 'f1'], ['b', 'f2'], ['b', 'f3']] }], 'H₃N→BF₃: N +1, B −1, the pair donated N→B'),
  no3: lewisSvg([{ atoms: [A('n', 'N', 170, 90, 0, 1), A('o1', 'O', 170, 34, 2, 0), A('o2', 'O', 120, 135, 3, -1), A('o3', 'O', 220, 135, 3, -1)], bonds: [['n', 'o1', 2], ['n', 'o2'], ['n', 'o3']] }], 'NO₃⁻: N +1, double-bonded O 0, single-bonded O −1 (one of three resonance forms)'),
  so4: lewisSvg([{ atoms: [A('s', 'S', 170, 95, 0, 0), A('o1', 'O', 170, 38, 2, 0), A('o2', 'O', 170, 152, 2, 0), A('o3', 'O', 112, 95, 3, -1), A('o4', 'O', 228, 95, 3, -1)], bonds: [['s', 'o1', 2], ['s', 'o2', 2], ['s', 'o3'], ['s', 'o4']] }], 'SO₄²⁻ with two S=O: S 0, double-bonded O 0, single-bonded O −1'),
  scn: lewisSvg([
    { title: 'A: S=C=N', atoms: [A('s', 'S', 80, 62, 2, 0), A('c', 'C', 170, 62, 0, 0), A('n', 'N', 260, 62, 2, -1)], bonds: [['s', 'c', 2], ['c', 'n', 2]] },
    { title: 'B: S–C≡N', atoms: [A('s', 'S', 80, 62, 3, -1), A('c', 'C', 170, 62, 0, 0), A('n', 'N', 260, 62, 1, 0)], bonds: [['s', 'c'], ['c', 'n', 3]] },
    { title: 'C: S≡C–N', atoms: [A('s', 'S', 80, 62, 1, 1), A('c', 'C', 170, 62, 0, 0), A('n', 'N', 260, 62, 3, -2)], bonds: [['s', 'c', 3], ['c', 'n']] }], 'SCN⁻ structures A, B and C with formal charges'),
};

/* ---------- draw and label: draw the structure on paper, mark every formal charge, then tick the marking points ---------- */
const drawV = (id, label, stem, points, explanation, slide) => ({
  ...base(id, label, points.length, stem, explanation, slide, 'Draw all lone pairs, then count: formal charge = valence electrons − non-bonding electrons − bonds.'),
  drawOnPaperThenCompare: true,
  inputSlot: { type: 'typed_synthesis', placeholder: 'Draw on paper, then tick the marking points (or note the formal charges here)…', minWordsToUnlockRubric: 0, allowPaperScratchpad: true },
  evaluator: { type: 'atomic_rubric', rubric: points.map((p, i) => ({ id: `r${i + 1}`, criterion: p, marks: 1, isCritical: i === 0 })) },
});
const FIGBY = { 'c1-fc-draw-1': 'al2cl6', 'c1-fc-draw-2': 'i2cl6', 'c1-fc-draw-3': 'adduct', 'c1-fc-draw-4': 'no3', 'c1-fc-draw-5': 'so4', 'c1-fc-draw-6': 'scn' };
const drawNode = node('bk-c1-fc-draw', 'Draw the Lewis structure and label every formal charge', 'Kinjo example mid-term (Al₂Cl₆ and I₂Cl₆ with bridging Cl); Chapter 1 Part 1 and Part 4 slides', 1, 'Formal Charge', ['formal-charge', 'lewis-structure', 'draw'], 4, 'fc-draw', [
  drawV('c1-fc-draw-1', 'Al₂Cl₆', 'Draw Al₂Cl₆ (two bridging Cl atoms), showing every lone pair, and label the formal charge on Al, on a bridging Cl and on a terminal Cl.',
    ['Two Al atoms joined by two bridging Cl atoms, each Al also bonded to two terminal Cl (each Al has four single bonds in total)', 'Terminal Cl: one bond and three lone pairs, formal charge 0; bridging Cl: two single bonds and two lone pairs', 'Formal charge on each Al = −1 (3 − 0 − 4)', 'Formal charge on each bridging Cl = +1 (7 − 4 − 2); the charges add up to zero for the molecule'],
    'Al: 3 − 0 − 4 = −1. Bridging Cl: 7 − 2(2) − 2 = +1. Terminal Cl: 7 − 2(3) − 1 = 0. Two Al (−2) and two bridging Cl (+2) cancel.', 's-fc'),
  drawV('c1-fc-draw-2', 'I₂Cl₆', 'Draw I₂Cl₆ (two bridging Cl atoms), showing every lone pair, label the formal charges, and say why the molecule is planar.',
    ['Two I atoms joined by two bridging Cl atoms, each I also bonded to two terminal Cl (four bonds per I)', 'Each I carries two lone pairs; each bridging Cl two bonds and two lone pairs; each terminal Cl one bond and three lone pairs', 'Formal charge on each I = −1 (7 − 4 − 4) and on each bridging Cl = +1', 'Planar because each I has six electron pairs (octahedral electron-pair geometry) with the two lone pairs trans to each other, so each ICl₄ unit is square planar'],
    'I: 7 − 2(2) − 4 = −1; bridging Cl +1; terminal Cl 0. Six electron pairs around I (four bonds, two lone pairs) give an octahedral arrangement, and the lone pairs sit opposite each other, so each ICl₄ unit is square planar and the dimer is planar.', 's-fc'),
  drawV('c1-fc-draw-3', 'H₃N→BF₃', 'Draw the adduct H₃N–BF₃ with every lone pair and label the formal charge on N and on B. Show which atom donates the electron pair.',
    ['N bonded to three H and to B with no lone pair left; B bonded to N and three F; each F with three lone pairs', 'Donor/acceptor marked: the lone pair on N (a Lewis base) is donated to the empty orbital on B (a Lewis acid), shown with an arrow N→B', 'Formal charge on N = +1 (5 − 0 − 4)', 'Formal charge on B = −1 (3 − 0 − 4); the formal charges are not a guide to electron flow (the partial charge on N is still negative)'],
    'N: 5 − 0 − 4 = +1; B: 3 − 0 − 4 = −1; F: 0. Formal charge counts the dative bond as shared equally, so it does not show that N is still electron-rich.', 's-dative'),
  drawV('c1-fc-draw-4', 'NO₃⁻', 'Draw the Lewis structure of NO₃⁻, show all resonance forms and label every formal charge in one form.',
    ['One N bonded to three O, with one N=O double bond and two N–O single bonds; N has no lone pair', 'Double-bonded O two lone pairs, single-bonded O three lone pairs each', 'Formal charges: N +1, double-bonded O 0, each single-bonded O −1 (total −1)', 'Three equivalent resonance forms (the double bond on each O in turn), so all three N–O bonds have bond order 4/3'],
    'N: 5 − 0 − 4 = +1; =O: 6 − 4 − 2 = 0; −O⁻: 6 − 6 − 1 = −1; sum +1 + 0 − 2 = −1.', 's-fc'),
  drawV('c1-fc-draw-5', 'SO₄²⁻', 'Draw the sulfate ion with S=O bonds so that the formal charges are as small as possible, and label every formal charge. Compare with the all-single-bond structure.',
    ['S bonded to four O; two S=O double bonds and two S–O⁻ single bonds (six bonds at S, no lone pair)', 'Formal charge S = 0 (6 − 0 − 6); double-bonded O = 0; single-bonded O = −1 each (total −2)', 'All-single-bond structure: S = +2 and every O = −1, larger formal charges', 'The S=O form is preferred and is possible because S (period 3) can hold more than eight electrons (expanded octet)'],
    'With two S=O: S 6 − 0 − 6 = 0; =O 6 − 4 − 2 = 0; −O 6 − 6 − 1 = −1. All single: S 6 − 0 − 4 = +2, O −1. Smaller formal charges mean the better contributor.', 's-expanded'),
  drawV('c1-fc-draw-6', 'SCN⁻', 'Draw the three Lewis structures of SCN⁻ (S=C=N, S–C≡N, S≡C–N), show lone pairs, label every formal charge, and say which contributes most.',
    ['S=C=N with two lone pairs on S and two on N: S 0, C 0, N −1', 'S–C≡N with three lone pairs on S and one on N: S −1, C 0, N 0', 'S≡C–N with one lone pair on S and three on N: S +1, C 0, N −2', 'The structure with the lowest formal charges and the negative charge on the more electronegative atom (S=C=N or S–C≡N) contributes most; S≡C–N (+1 and −2) contributes least'],
    'Each structure sums to −1. S≡C–N has the largest formal charges (+1 on S and −2 on N), so it contributes least.', 's-fc'),
]);

for (const v of drawNode.variants) v.comparisonVisualAsset = FIGS[FIGBY[v.variantId]];
const NODES = [fcNode, drawNode];
const LINKS = { 'bk-c1-fc-gen': ['c1.formal-charge'], 'bk-c1-fc-draw': ['c1.formal-charge', 'c1.dative'] };
export { NODES, STRUCTS };

if (process.argv[1]?.endsWith('kinjo5.mjs')) {
  const bankPath = `${DIR}/cm2021/question-bank.json`, mapPath = `${DIR}/cm2021/skill-map.json`;
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  bank.questionNodes = bank.questionNodes.filter((n) => !LINKS[n.id]).concat(NODES);
  bank.exportedAt = new Date().toISOString();
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 1));
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  for (const [nid, skills] of Object.entries(LINKS)) {
    for (const sk of map.skills) sk.nodes = sk.nodes.filter((id) => id !== nid);
    for (const sid of skills) map.skills.find((k) => k.id === sid).nodes.push(nid);
    map.nodeSkills[nid] = skills;
  }
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 1));
  console.log('wrote', NODES.map((n) => `${n.id}: ${n.variants.length}`).join('; '));
}
