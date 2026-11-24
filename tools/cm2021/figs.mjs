/* Reference pictures for the draw-on-paper items: energy-level diagrams (d-orbital splitting, MO diagrams) and crown-ether rings.
   Each figure is an SVG string the app shows next to the marking points (`comparisonVisualAsset`, type 'svg'). `levels()` is a tiny builder:
   lvl(x, y, occupancy, label) draws an orbital line with up/down electron arrows; dash() joins levels; t() writes text; dbl() draws a labelled gap.
   Positions are authored by hand (y grows downward, so higher energy = smaller y). Used by tools/cm2021/draw.mjs and kinjo.mjs. */

import { lewisSvg } from './kinjo5.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function levels(W, H, caption) {
  const parts = [];
  const api = {
    lvl(x, y, occ = '', label = '', pos = 'below', color = '#0f172a') {
      parts.push(`<line x1="${x - 17}" y1="${y}" x2="${x + 17}" y2="${y}" stroke="${color}" stroke-width="2.2"/>`);
      const ups = occ.includes('u'), dns = occ.includes('d');
      if (ups) parts.push(`<line x1="${x - 5}" y1="${y - 2}" x2="${x - 5}" y2="${y - 16}" stroke="#1d4ed8" stroke-width="1.6"/><polygon points="${x - 5},${y - 19} ${x - 8.5},${y - 13} ${x - 1.5},${y - 13}" fill="#1d4ed8"/>`);
      if (dns) parts.push(`<line x1="${x + 5}" y1="${y - 16}" x2="${x + 5}" y2="${y - 2}" stroke="#be123c" stroke-width="1.6"/><polygon points="${x + 5},${y + 1} ${x + 1.5},${y - 5} ${x + 8.5},${y - 5}" fill="#be123c"/>`);
      if (label) parts.push(pos === 'right' ? `<text x="${x + 22}" y="${y + 4}" font-size="10" fill="#334155">${esc(label)}</text>` : `<text x="${x}" y="${pos === 'below' ? y + 13 : y - 22}" text-anchor="middle" font-size="10" fill="#334155">${esc(label)}</text>`);
    },
    dash(x1, y1, x2, y2) { parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>`); },
    t(x, y, text, o = {}) { parts.push(`<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-size="${o.size || 11}" ${o.bold ? 'font-weight="700"' : ''} fill="${o.color || '#0f172a'}">${esc(text)}</text>`); },
    dbl(x, y1, y2, label, lx) {
      parts.push(`<line x1="${x}" y1="${y1 + 4}" x2="${x}" y2="${y2 - 4}" stroke="#475569" stroke-width="1.2"/><polygon points="${x},${y1} ${x - 3.5},${y1 + 7} ${x + 3.5},${y1 + 7}" fill="#475569"/><polygon points="${x},${y2} ${x - 3.5},${y2 - 7} ${x + 3.5},${y2 - 7}" fill="#475569"/>`);
      parts.push(`<text x="${lx ?? x + 8}" y="${(y1 + y2) / 2 + 4}" text-anchor="${lx !== undefined && lx < x ? 'end' : 'start'}" font-size="12" font-weight="700" fill="#0f172a">${esc(label)}</text>`);
    },
    axis(x, y1, y2) { parts.push(`<line x1="${x}" y1="${y2}" x2="${x}" y2="${y1 + 6}" stroke="#64748b" stroke-width="1.2"/><polygon points="${x},${y1} ${x - 3.5},${y1 + 8} ${x + 3.5},${y1 + 8}" fill="#64748b"/><text x="${x + 6}" y="${y1 + 8}" font-size="11" fill="#64748b">E</text>`); },
    raw(s) { parts.push(s); },
    done() { return { type: 'svg', payload: `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(caption)}" style="width:100%;max-width:${W}px;height:auto;display:block;margin:0 auto">${parts.join('')}</svg>`, caption }; },
  };
  return api;
}

/* ---------- d-orbital splitting ---------- */
const splitMn = () => { const f = levels(300, 190, 'KMnO₄: tetrahedral, e below t₂, no d electrons, CFSE = 0');
  f.axis(20, 8, 170); [[140, 'd_xy'], [180, 'd_xz'], [220, 'd_yz']].forEach(([x, l]) => f.lvl(x, 50, '', l)); [[160, 'd_z²'], [200, 'd_x²−y²']].forEach(([x, l]) => f.lvl(x, 130, '', l));
  f.t(255, 54, 't₂', { anchor: 'start', bold: true }); f.t(240, 134, 'e', { anchor: 'start', bold: true }); f.dash(60, 90, 260, 90); f.t(262, 94, 'free ion', { anchor: 'start', size: 9, color: '#64748b' });
  f.dbl(95, 50, 130, 'Δt', 60); f.t(150, 182, 'd⁰: no electrons, CFSE = 0', { size: 11 }); return f.done(); };
const splitCr = () => { const f = levels(340, 200, 'Cr(III) d³ octahedral: t₂g³, CFSE = −1.2 Δo');
  f.axis(20, 8, 180); [[160, 'd_z²'], [200, 'd_x²−y²']].forEach(([x, l]) => f.lvl(x, 40, '', l)); [[140, 'd_xy'], [180, 'd_xz'], [220, 'd_yz']].forEach(([x, l]) => f.lvl(x, 130, 'u', l));
  f.t(250, 44, 'e_g (+0.6 Δo)', { anchor: 'start', size: 10, bold: true }); f.t(250, 134, 't₂g (−0.4 Δo)', { anchor: 'start', size: 10, bold: true }); f.dash(60, 76, 260, 76);
  f.dbl(95, 40, 130, 'Δo', 60); f.t(150, 192, 't₂g³ e_g⁰, 3 unpaired, CFSE = 3(−0.4) = −1.2 Δo', { size: 10 }); return f.done(); };
const splitNi = () => { const f = levels(340, 200, 'Ni(II) d⁸ tetrahedral: e⁴ t₂⁴, CFSE = −0.8 Δt');
  f.axis(20, 8, 180); [[140, 'd_xy', 'ud'], [180, 'd_xz', 'u'], [220, 'd_yz', 'u']].forEach(([x, l, o]) => f.lvl(x, 50, o, l)); [[160, 'd_z²'], [200, 'd_x²−y²']].forEach(([x, l]) => f.lvl(x, 130, 'ud', l));
  f.t(250, 54, 't₂ (+0.4 Δt)', { anchor: 'start', size: 10, bold: true }); f.t(235, 134, 'e (−0.6 Δt)', { anchor: 'start', size: 10, bold: true }); f.dash(60, 90, 260, 90);
  f.dbl(95, 50, 130, 'Δt', 60); f.t(150, 192, 'e⁴ t₂⁴, 2 unpaired, CFSE = 4(−0.6) + 4(+0.4) = −0.8 Δt', { size: 10 }); return f.done(); };
const splitFe = () => { const f = levels(340, 200, 'Fe(II) d⁶: [Fe(H₂O)₆]²⁺ high spin, [Fe(CN)₆]⁴⁻ low spin');
  f.t(90, 14, '[Fe(H₂O)₆]²⁺  high spin', { size: 10, bold: true }); f.t(250, 14, '[Fe(CN)₆]⁴⁻  low spin', { size: 10, bold: true });
  [[55, 'ud'], [90, 'u'], [125, 'u']].forEach(([x, o]) => f.lvl(x, 120, o)); [[72, 'u'], [108, 'u']].forEach(([x, o]) => f.lvl(x, 70, o));
  f.t(90, 140, 't₂g⁴', { size: 10 }); f.t(90, 88, 'e_g²', { size: 10 }); f.t(90, 165, 'Δo < P', { size: 11, bold: true }); f.t(90, 180, 'CFSE = −0.4 Δo', { size: 10 });
  [[215, 'ud'], [250, 'ud'], [285, 'ud']].forEach(([x, o]) => f.lvl(x, 150, o)); [[232, ''], [268, '']].forEach(([x, o]) => f.lvl(x, 40, o));
  f.t(250, 170, 't₂g⁶', { size: 10 }); f.t(250, 28, 'e_g⁰', { size: 10 }); f.t(250, 184, 'Δo > P: CFSE = −2.4 Δo + 2P', { size: 10, bold: true }); return f.done(); };
const splitSq = () => { const f = levels(300, 230, 'Square planar d⁸ [Ni(CN)₄]²⁻: four lower orbitals filled, d_x²−y² empty');
  f.axis(20, 8, 210); f.lvl(150, 34, '', 'd_x²−y² (empty)', 'right'); f.lvl(150, 88, 'ud', 'd_xy', 'right'); f.lvl(150, 132, 'ud', 'd_z²', 'right'); f.lvl(130, 182, 'ud', ''); f.lvl(170, 182, 'ud', ''); f.t(215, 186, 'd_xz, d_yz', { anchor: 'start', size: 10, color: '#334155' });
  f.t(150, 224, '8 electrons paired in 4 orbitals: diamagnetic', { size: 10 }); return f.done(); };
const splitJt = () => { const f = levels(340, 250, 'Cu(II) d⁹ elongated: (d_xz,d_yz)⁴ (d_xy)² (d_z²)² (d_x²−y²)¹');
  f.axis(20, 8, 230); f.lvl(150, 34, 'u', 'd_x²−y²', 'right'); f.lvl(150, 82, 'ud', 'd_z²', 'right'); f.lvl(150, 138, 'ud', 'd_xy', 'right'); f.lvl(130, 192, 'ud', ''); f.lvl(170, 192, 'ud', ''); f.t(215, 196, 'd_xz, d_yz', { anchor: 'start', size: 10, color: '#334155' });
  f.t(270, 58, '← e_g splits (δ₁)', { anchor: 'start', size: 9, color: '#64748b' }); f.t(270, 160, '← t₂g splits (δ₂)', { anchor: 'start', size: 9, color: '#64748b' });
  f.t(170, 242, 'one unpaired; net gain from the e_g split', { size: 10 }); return f.done(); };

/* ---------- MO diagrams ---------- */
const moN2O2 = () => {
  const f = levels(380, 250, 'N₂ (s–p mixing, π2p below σ2p, bond order 3) and O₂ (no mixing, π*2p half filled, bond order 2)');
  const panel = (ox, title, rows) => {
    f.t(ox + 90, 14, title, { size: 12, bold: true });
    f.lvl(ox + 18, 200, 'ud', ''); f.lvl(ox + 162, 200, 'ud', ''); f.t(ox + 18, 222, '2s', { size: 9 }); f.t(ox + 162, 222, '2s', { size: 9 });
    f.lvl(ox + 18, 110, '', ''); f.lvl(ox + 162, 110, '', ''); f.t(ox + 18, 132, '2p', { size: 9 }); f.t(ox + 162, 132, '2p', { size: 9 });
    rows.forEach(([lab, y, occs]) => { if (occs.length === 1) f.lvl(ox + 90, y, occs[0], ''); else { f.lvl(ox + 74, y, occs[0], ''); f.lvl(ox + 106, y, occs[1], ''); } f.t(ox + 128, y + 4, lab, { anchor: 'start', size: 9, color: '#475569' }); });
  };
  panel(0, 'N₂', [['σ2s', 190, ['ud']], ['σ*2s', 158, ['ud']], ['π2p', 128, ['ud', 'ud']], ['σ2p', 98, ['ud']], ['π*2p', 62, ['', '']], ['σ*2p', 30, ['']]]);
  panel(190, 'O₂', [['σ2s', 190, ['ud']], ['σ*2s', 158, ['ud']], ['σ2p', 128, ['ud']], ['π2p', 98, ['ud', 'ud']], ['π*2p', 62, ['u', 'u']], ['σ*2p', 30, ['']]]);
  f.t(95, 244, 'BO 3, diamagnetic', { size: 10, bold: true }); f.t(285, 244, 'BO 2, two unpaired', { size: 10, bold: true });
  return f.done(); };
const moCO = () => { const f = levels(320, 230, 'CO: HOMO σ (mainly C lone pair), LUMO π* pair, bond order 3');
  f.t(160, 14, 'CO', { size: 11, bold: true }); f.t(30, 14, 'C', { size: 11 }); f.t(290, 14, 'O', { size: 11 });
  f.lvl(30, 118, 'u'); f.t(30, 140, '2p', { size: 9 }); f.lvl(30, 168, 'ud'); f.t(30, 190, '2s', { size: 9 });
  f.lvl(290, 150, 'ud'); f.t(290, 172, '2p', { size: 9 }); f.lvl(290, 205, 'ud'); f.t(290, 227, '2s', { size: 9 });
  [['σ*2s', 160, 'ud', 0], ['σ2p', 108, 'ud', 0]].forEach(([l, y, o]) => { });
  f.lvl(160, 212, 'ud'); f.t(197, 216, 'σ(2s)', { anchor: 'start', size: 9 });
  f.lvl(160, 178, 'ud'); f.t(197, 182, 'σ*(2s)', { anchor: 'start', size: 9 });
  f.lvl(135, 148, 'ud'); f.lvl(185, 148, 'ud'); f.t(207, 152, 'π (2 bonds)', { anchor: 'start', size: 9 });
  f.lvl(160, 118, 'ud'); f.t(197, 122, 'σ  HOMO (on C)', { anchor: 'start', size: 9, bold: true, color: '#1d4ed8' });
  f.lvl(135, 72, ''); f.lvl(185, 72, ''); f.t(207, 76, 'π*  LUMO (on C)', { anchor: 'start', size: 9, bold: true, color: '#be123c' });
  f.lvl(160, 36, ''); f.t(197, 40, 'σ*(2p)', { anchor: 'start', size: 9 }); return f.done(); };
const moML6 = () => { const f = levels(360, 260, 'Octahedral ML₆ σ-only MO diagram: bonding a₁g, t₁u, e_g; non-bonding t₂g; antibonding e_g*, a₁g*, t₁u*; Δo = t₂g to e_g*');
  f.t(180, 12, 'ML₆ (σ only)', { size: 11, bold: true }); f.t(40, 24, 'M', { size: 11 }); f.t(320, 24, '6 L (LGOs)', { size: 10 });
  f.lvl(40, 58, '', '4p'); f.lvl(40, 88, '', '4s'); [[22, 130], [40, 130], [58, 130]].forEach(([x, y], i) => i === 0 || i === 2 ? null : null);
  f.lvl(30, 118, '', 'e_g'); f.lvl(62, 118, '', ''); f.lvl(30, 158, '', 't₂g'); f.lvl(62, 158, '', '');
  f.lvl(320, 205, 'udud', 'a₁g + t₁u + e_g');
  f.lvl(180, 28, '', ''); f.t(206, 32, 't₁u*', { anchor: 'start', size: 9 }); f.lvl(180, 54, '', ''); f.t(206, 58, 'a₁g*', { anchor: 'start', size: 9 });
  f.lvl(165, 100, '', ''); f.lvl(195, 100, '', ''); f.t(220, 104, 'e_g*', { anchor: 'start', size: 9, bold: true });
  f.lvl(150, 140, '', ''); f.lvl(180, 140, '', ''); f.lvl(210, 140, '', ''); f.t(232, 144, 't₂g  (non-bonding)', { anchor: 'start', size: 9, bold: true });
  f.dbl(120, 100, 140, 'Δo', 112); f.t(246, 142, '', {});
  f.lvl(165, 190, 'ud', ''); f.lvl(195, 190, 'ud', ''); f.t(220, 194, 'e_g', { anchor: 'start', size: 9 });
  f.lvl(150, 214, 'udud', ''); f.lvl(180, 214, 'ud', ''); f.lvl(210, 214, 'ud', ''); f.t(232, 218, 't₁u', { anchor: 'start', size: 9 });
  f.lvl(180, 238, 'ud', ''); f.t(206, 242, 'a₁g', { anchor: 'start', size: 9 });
  [[58, 28], [88, 54], [130, 100], [130, 140]].forEach(() => {});
  f.dash(57, 58, 163, 28); f.dash(57, 88, 163, 54); f.dash(75, 118, 148, 100); f.dash(75, 158, 148, 140); f.dash(300, 205, 213, 214); f.dash(300, 205, 213, 190); f.dash(300, 205, 183, 238);
  return f.done(); };
const moH2O = () => { const f = levels(320, 240, 'H₂O: 1a₁, 1b₂, 2a₁ bonding, 1b₁ non-bonding HOMO, 3a₁* and 2b₂* antibonding');
  f.t(160, 14, 'H₂O (C₂ᵥ)', { size: 11, bold: true }); f.t(35, 14, 'O', { size: 11 }); f.t(285, 14, 'H···H', { size: 10 });
  f.lvl(35, 120, 'ud', '2p'); f.lvl(35, 120, '', ''); f.lvl(35, 200, 'ud', '2s'); f.lvl(285, 140, '', 'a₁'); f.lvl(285, 180, '', 'b₂');
  f.lvl(160, 40, '', ''); f.t(190, 44, '2b₂*', { anchor: 'start', size: 9 }); f.lvl(160, 68, '', ''); f.t(190, 72, '3a₁*', { anchor: 'start', size: 9 });
  f.lvl(160, 112, 'ud', ''); f.t(190, 116, '1b₁  non-bonding, HOMO', { anchor: 'start', size: 9, bold: true, color: '#1d4ed8' });
  f.lvl(160, 148, 'ud', ''); f.t(190, 152, '2a₁', { anchor: 'start', size: 9 }); f.lvl(160, 182, 'ud', ''); f.t(190, 186, '1b₂', { anchor: 'start', size: 9 }); f.lvl(160, 216, 'ud', ''); f.t(190, 220, '1a₁ (mostly O 2s)', { anchor: 'start', size: 9 });
  f.dash(52, 200, 143, 216); f.dash(52, 120, 143, 112); f.dash(268, 140, 177, 148); f.dash(268, 180, 177, 182); f.t(160, 236, '8 valence electrons; two O–H bonds in total (BO 1 each)', { size: 10 }); return f.done(); };

/* ---------- crown ethers ---------- */
export function crownSvg(n, ion, name) {
  /* skeletal zig-zag ring: every vertex is an O or a CH2 (printed-style bent straight bonds, not a smooth circle) */
  const cx = 160, cy = 160, R = 104, d = 13;
  const pts = Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n, r = R + (i % 2 ? d : -d); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const f = (v) => v.toFixed(1);
  let s = `<polygon points="${pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="none" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>`;
  pts.forEach(([x, y], i) => { if (i % 3 === 0) s += `<circle cx="${f(x)}" cy="${f(y)}" r="12" fill="#fff"/><text x="${f(x)}" y="${f(y + 5.5)}" text-anchor="middle" font-size="17" font-weight="700" fill="#be123c">O</text>`; });
  s += `<circle cx="${cx}" cy="${cy}" r="${n === 12 ? 16 : n === 15 ? 20 : 26}" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#1d4ed8">${esc(ion)}</text>`;
  s += `<text x="${cx}" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="#334155">${esc(name)}</text><text x="${cx}" y="312" text-anchor="middle" font-size="12" fill="#475569">${n} ring atoms · ${n / 3} O, each pair joined by –CH₂CH₂–</text>`;
  return { type: 'svg', payload: `<svg viewBox="0 0 320 322" role="img" aria-label="${esc(name)}" style="width:100%;max-width:460px;height:auto;display:block;margin:0 auto">${s}</svg>`, caption: `${name}: ${n / 3} O donors separated by two CH₂ groups; cavity matches ${ion}` };
}

/* ---------- more draw items ---------- */
const A = (id, el, x, y, lp, fc) => ({ id, el, x, y, lp, fc });
const resonance = () => lewisSvg([
  { title: 'O₃ (one of two resonance forms)', atoms: [A('c', 'O', 150, 70, 1, 1), A('l', 'O', 100, 100, 3, -1), A('r', 'O', 200, 100, 2, 0)], bonds: [['c', 'l'], ['c', 'r', 2]] },
  { title: 'ClO₄⁻ (one of four equivalent forms, expanded octet)', atoms: [A('c', 'Cl', 150, 70, 0, 0), A('a', 'O', 150, 32, 2, 0), A('b', 'O', 150, 112, 2, 0), A('d', 'O', 108, 70, 2, 0), A('e', 'O', 192, 70, 3, -1)], bonds: [['c', 'a', 2], ['c', 'b', 2], ['c', 'd', 2], ['c', 'e']] },
  { title: 'NO₃⁻ (one of three equivalent forms)', atoms: [A('n', 'N', 150, 70, 0, 1), A('o1', 'O', 150, 32, 2, 0), A('o2', 'O', 112, 100, 3, -1), A('o3', 'O', 188, 100, 3, -1)], bonds: [['n', 'o1', 2], ['n', 'o2'], ['n', 'o3']] },
], 'O₃, ClO₄⁻ and NO₃⁻ with formal charges (one resonance form each)');
const phosphorus = () => lewisSvg([
  { title: 'Phosphonic acid H₃PO₃: HP(=O)(OH)₂', atoms: [A('p', 'P', 150, 62, 0, 0), A('o', 'O', 150, 22, 2, 0), A('o1', 'OH', 108, 92, 2, 0), A('o2', 'OH', 192, 92, 2, 0), A('h', 'H', 150, 104, 0, 0)], bonds: [['p', 'o', 2], ['p', 'o1'], ['p', 'o2'], ['p', 'h']] },
  { title: 'Phosphinic acid H₃PO₂: H₂P(=O)OH', atoms: [A('p', 'P', 150, 62, 0, 0), A('o', 'O', 150, 22, 2, 0), A('o1', 'OH', 192, 92, 2, 0), A('h1', 'H', 108, 92, 0, 0), A('h2', 'H', 150, 104, 0, 0)], bonds: [['p', 'o', 2], ['p', 'o1'], ['p', 'h1'], ['p', 'h2']] },
], 'Phosphonic acid (two P–OH, one P–H) and phosphinic acid (one P–OH, two P–H); each P has one P=O');
const moNF = () => { const f = levels(330, 240, 'NF: 12 valence electrons, last two singly in the π* pair (triplet), bond order 2');
  f.t(165, 14, 'NF', { size: 12, bold: true }); f.t(30, 14, 'F', { size: 11 }); f.t(300, 14, 'N', { size: 11 });
  f.lvl(30, 150, 'udud', ''); f.t(30, 172, '2p', { size: 9 }); f.lvl(30, 206, 'ud', ''); f.t(30, 228, '2s', { size: 9 });
  f.lvl(300, 120, 'uuu', ''); f.t(300, 142, '2p', { size: 9 }); f.lvl(300, 182, 'ud', ''); f.t(300, 204, '2s', { size: 9 });
  f.lvl(165, 214, 'ud', ''); f.t(200, 218, 'σ(2s)', { anchor: 'start', size: 9 }); f.lvl(165, 180, 'ud', ''); f.t(200, 184, 'σ*(2s)', { anchor: 'start', size: 9 });
  f.lvl(165, 148, 'ud', ''); f.t(200, 152, 'σ(2p)', { anchor: 'start', size: 9 }); f.lvl(140, 118, 'ud', ''); f.lvl(190, 118, 'ud', ''); f.t(212, 122, 'π(2p) ×2', { anchor: 'start', size: 9 });
  f.lvl(140, 76, 'u', ''); f.lvl(190, 76, 'u', ''); f.t(212, 80, 'π* ×2 (HOMO, parallel)', { anchor: 'start', size: 9, bold: true, color: '#1d4ed8' }); f.lvl(165, 36, '', ''); f.t(200, 40, 'σ*(2p)', { anchor: 'start', size: 9 });
  return f.done(); };
const moNH = () => { const f = levels(330, 220, 'Nitrene NH: N 2s non-bonding, one N–H σ bond, two parallel electrons in the degenerate 2p pair: triplet');
  f.t(165, 14, 'NH', { size: 12, bold: true }); f.t(30, 14, 'N', { size: 11 }); f.t(300, 14, 'H', { size: 11 });
  f.lvl(30, 100, 'uuu', ''); f.t(30, 122, '2p', { size: 9 }); f.lvl(30, 190, 'ud', ''); f.t(30, 212, '2s', { size: 9 }); f.lvl(300, 110, 'u', ''); f.t(300, 132, '1s', { size: 9 });
  f.lvl(165, 196, 'ud', ''); f.t(200, 200, '1σ (N 2s, non-bonding)', { anchor: 'start', size: 9 }); f.lvl(165, 138, 'ud', ''); f.t(200, 142, '2σ (N–H bond)', { anchor: 'start', size: 9 });
  f.lvl(140, 100, 'u', ''); f.lvl(190, 100, 'u', ''); f.t(212, 104, 'π nb ×2 (HOMO)', { anchor: 'start', size: 9, bold: true, color: '#1d4ed8' }); f.lvl(165, 44, '', ''); f.t(200, 48, '3σ* (empty)', { anchor: 'start', size: 9 });
    return f.done(); };
const ozonePi = () => { const f = levels(330, 230, 'Ozone π system: π₁ bonding, π₂ non-bonding (node on the central O), π₃ antibonding; four electrons fill π₁ and π₂');
  const lobes = (cx, y, signs) => signs.forEach((sg, i) => { const x = cx + (i - 1) * 34; if (!sg) { f.raw(`<circle cx="${x}" cy="${y}" r="2" fill="#94a3b8"/>`); return; } const top = sg > 0 ? '#bfdbfe' : '#fecaca', bot = sg > 0 ? '#fecaca' : '#bfdbfe'; f.raw(`<ellipse cx="${x}" cy="${y - 10}" rx="8" ry="10" fill="${top}" stroke="#334155"/><ellipse cx="${x}" cy="${y + 10}" rx="8" ry="10" fill="${bot}" stroke="#334155"/>`); });
  lobes(90, 40, [1, -1, 1]); f.lvl(235, 40, '', 'π₃ antibonding', 'right');
  lobes(90, 110, [1, 0, -1]); f.lvl(235, 110, 'ud', 'π₂ non-bonding', 'right');
  lobes(90, 180, [1, 1, 1]); f.lvl(235, 180, 'ud', 'π₁ bonding', 'right');
  f.t(170, 224, 'bond order per O–O = 1 (σ) + 0.5 (π) = 1.5', { size: 10, bold: true }); return f.done(); };

export const FIGS_BY_VARIANT = {
  'c1-resonance-count-v2': resonance(), 'c4-h3po3-v2': phosphorus(), 'c3-nf-v2': moNF(), 'c3-nitrene-v2': moNH(), 'c3-three-centre-pi-v3': ozonePi(), 'c4-crown-cryptand-v3': crownSvg(18, 'K⁺', '18-crown-6'),

  'c7-draw-split-mno4': splitMn(), 'c7-draw-split-croxalate': splitCr(), 'c7-draw-split-niamine': splitNi(), 'c7-draw-split-fe-d6': splitFe(), 'c7-draw-split-sqplanar': splitSq(), 'c7-draw-split-jt': splitJt(),
  'c3-draw-mo-n2o2': moN2O2(), 'c3-draw-mo-co': moCO(), 'c3-draw-mo-ml6': moML6(), 'c3-draw-mo-h2o': moH2O(),
  'c4-crown-draw-12c4': crownSvg(12, 'Li⁺', '12-crown-4'), 'c4-crown-draw-15c5': crownSvg(15, 'Na⁺', '15-crown-5'), 'c4-crown-draw-18c6': crownSvg(18, 'K⁺', '18-crown-6'),
};
