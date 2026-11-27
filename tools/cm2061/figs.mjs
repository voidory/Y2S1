/* Hand-built model-answer drawings for CM2061 (SVG strings): organometallic and coordination structures (RDKit cannot draw sandwich or
   octahedral complexes the textbook way) and the seven apparatus sketches. They are shown AFTER the student has drawn on paper.
   Style: dark line on a transparent background, blue arrows for water, labels in the margins. Schematic, not to scale. */

const S = '#1e293b', BL = '#2563eb', LQ = '#bfdbfe', GR = '#64748b';
const f = (n) => Math.round(n * 10) / 10;
const ln = (x1, y1, x2, y2, c = S, w = 2, d = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ''}/>`;
const rc = (x, y, w, h, o = {}) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${o.r ?? 0}" fill="${o.fill ?? 'none'}" stroke="${o.stroke ?? S}" stroke-width="${o.w ?? 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ''}/>`;
const ci = (cx, cy, r, o = {}) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${o.fill ?? 'none'}" stroke="${o.stroke ?? S}" stroke-width="${o.w ?? 2}"/>`;
const tx = (x, y, s, o = {}) => `<text x="${f(x)}" y="${f(y)}" font-family="DM Sans, Arial, sans-serif" font-size="${o.size ?? 11}" text-anchor="${o.a ?? 'start'}" fill="${o.fill ?? S}"${o.b ? ' font-weight="600"' : ''}>${s}</text>`;
const pg = (pts, o = {}) => `<polygon points="${pts.map((p) => p.map(f).join(',')).join(' ')}" fill="${o.fill ?? 'none'}" stroke="${o.stroke ?? S}" stroke-width="${o.w ?? 2}" stroke-linejoin="round"/>`;
const pa = (d, o = {}) => `<path d="${d}" fill="${o.fill ?? 'none'}" stroke="${o.stroke ?? S}" stroke-width="${o.w ?? 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
const arrow = (x1, y1, x2, y2, c = BL) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
  return ln(x1, y1, x2, y2, c, 2) + pg([[x2, y2], [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)], [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)]], { fill: c, stroke: c, w: 1 });
};
const label = (x, y, s, tx0, ty0, o = {}) => ln(x, y, tx0, ty0, GR, 1) + tx(tx0 + (tx0 >= x ? 3 : -3), ty0 + 4, s, { a: tx0 >= x ? 'start' : 'end', ...o });
const svg = (w, h, body, title, pad = 0) => `<svg viewBox="${-pad} 0 ${w + 2 * pad} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}" style="width:100%;height:auto;max-height:26rem">${body}</svg>`;
const flask = (cx, cy, r, liquid = 0.45, neckW = 20, neckH = 50) => {
  // round-bottom flask: circle with a neck rising from the top
  const top = cy - r;
  const lvl = cy + r * (1 - 2 * liquid);
  const half = Math.sqrt(Math.max(0, r * r - (lvl - cy) ** 2));
  return `<clipPath id="fc${Math.round(cx)}${Math.round(cy)}"><circle cx="${cx}" cy="${cy}" r="${r - 1}"/></clipPath>` +
    `<rect x="${cx - r}" y="${lvl}" width="${2 * r}" height="${2 * r}" fill="${LQ}" clip-path="url(#fc${Math.round(cx)}${Math.round(cy)})"/>` +
    ci(cx, cy, r) + rc(cx - neckW / 2, top - neckH + 6, neckW, neckH, { fill: '#fff', stroke: S }) + ln(cx - neckW / 2, top + 4, cx - neckW / 2, top + 4) + `<rect x="${cx - neckW / 2 + 1}" y="${top - 2}" width="${neckW - 2}" height="10" fill="#fff"/>`;
};

/* ------------------------------------------------ organometallic and coordination structures ------------------------------------------------ */
const cp = (cx, cy, r = 24) => pg(Array.from({ length: 5 }, (_, i) => [cx + r * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 5), cy + r * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 5)])) + ci(cx, cy, r * 0.5, { w: 1.5 });
const acetyl = (x, y, up) => {
  // C(=O)CH3 hanging off the ring vertex (x,y); up = true draws the oxygen above
  const s = up ? -1 : 1, cx = x + 26, cy = y + 14 * s;
  return ln(x, y, cx, cy) + ln(cx - 2, cy, cx - 2, cy + 22 * s) + ln(cx + 2, cy, cx + 2, cy + 22 * s) + tx(cx, cy + 36 * s + (up ? 0 : 6), 'O', { a: 'middle' }) + ln(cx, cy, cx + 28, cy - 12 * s) + tx(cx + 32, cy - 12 * s + 4, 'CH₃');
};
const ferrocene = (n) => {
  let b = cp(90, 80) + ci(90, 130, 17) + tx(90, 135, 'Fe', { a: 'middle', b: true }) + cp(90, 180);
  if (n >= 1) b += acetyl(90 + 24 * Math.cos(-Math.PI / 2 + (2 * Math.PI) / 5), 80 + 24 * Math.sin(-Math.PI / 2 + (2 * Math.PI) / 5), true);
  if (n >= 2) b += acetyl(90 + 24 * Math.cos(Math.PI / 2 - (2 * Math.PI) / 5 + 0), 180 + 24 * Math.sin(Math.PI / 2 - (2 * Math.PI) / 5), false);
  return b;
};
const hex = (cx, cy, r, rot) => pg(Array.from({ length: 6 }, (_, i) => [cx + r * Math.cos(rot + (i * Math.PI) / 3), cy + r * Math.sin(rot + (i * Math.PI) / 3)]));
// pyridine ring centred (cx,cy) whose N vertex points toward angle `ang`; returns the markup and the N position
const pyN = (cx, cy, r, ang) => {
  const nx = cx + r * Math.cos(ang), ny = cy + r * Math.sin(ang);
  return { svg: hex(cx, cy, r, ang) + `<circle cx="${f(nx)}" cy="${f(ny)}" r="8" fill="#fff"/>` + tx(nx, ny + 4, 'N', { a: 'middle', b: true }), n: [nx, ny] };
};
const co = (x, y, dx, dy, o = {}) => ln(x, y, x + dx, y + dy, S, o.dash ? 2 : 3, o.dash ? '4 3' : '') + tx(x + dx + (dx > 0 ? 4 : dx < 0 ? -4 : 0), y + dy + (dy > 0 ? 14 : dy < 0 ? -5 : 4), 'CO', { a: dx > 0 ? 'start' : dx < 0 ? 'end' : 'middle' });
const zn = () => {
  const p1 = pyN(55, 60, 22, Math.atan2(105 - 60, 105 - 55)), p2 = pyN(235, 60, 22, Math.atan2(105 - 60, 185 - 235));
  return ci(145, 110, 15) + tx(145, 115, 'Zn', { a: 'middle', b: true }) + p1.svg + ln(p1.n[0] + 6, p1.n[1] + 6, 132, 103) + p2.svg + ln(p2.n[0] - 6, p2.n[1] + 6, 158, 103) +
    ln(138, 124, 108, 170, S, 3, '4 3') + tx(100, 186, 'N=C=O', { a: 'middle' }) + ln(152, 124, 182, 170, S, 3) + tx(190, 186, 'N=C=O', { a: 'middle' });
};
const crbipy = () => {
  const p1 = pyN(75, 185, 22, -Math.PI / 6), p2 = pyN(195, 185, 22, (7 * Math.PI) / 6);
  return ci(135, 100, 15) + tx(135, 105, 'Cr', { a: 'middle', b: true }) + co(135, 85, 0, -45) + co(150, 100, 60, 0) + co(120, 100, -60, 0) +
    ln(135, 115, 135, 128, S, 3, '4 3') + tx(135, 141, 'CO', { a: 'middle' }) +
    p1.svg + p2.svg + ln(p1.n[0] + 4, p1.n[1] - 6, 125, 112) + ln(p2.n[0] - 4, p2.n[1] - 6, 145, 112) + ln(97, 193, 173, 193) +
    tx(135, 232, '2,2′-bipyridyl (bidentate, binds through both N)', { a: 'middle', size: 10 });
};
export const ORGANOMETALLIC = {
  title: 'Organometallic and coordination compounds',
  items: [
    { name: 'ferrocene', desc: 'an Fe atom sandwiched between two parallel five-membered C5H5 rings (the rings drawn as pentagons, with or without a circle)', svg: svg(180, 280, ferrocene(0), 'ferrocene', 40) },
    { name: 'acetylferrocene', desc: 'the ferrocene sandwich with one C(=O)CH3 group on ONE ring only', svg: svg(180, 280, ferrocene(1), 'acetylferrocene', 40) },
    { name: '1,1\'-diacetylferrocene', desc: 'the ferrocene sandwich with one C(=O)CH3 group on EACH of the two rings', svg: svg(180, 280, ferrocene(2), '1,1\'-diacetylferrocene', 40) },
    { name: 'Py2Zn(NCO)2', desc: 'Zn at the centre with four nitrogen donors: two pyridine rings bonded through N and two N=C=O (isocyanate) groups bonded through N, drawn tetrahedral', svg: svg(290, 200, zn(), 'Py2Zn(NCO)2', 20) },
    { name: 'Cr(CO)6', desc: 'Cr at the centre of an octahedron with six CO ligands (two along the vertical axis, four in the horizontal plane shown with wedges and dashes)',
      svg: svg(240, 220, ci(120, 110, 15) + tx(120, 115, 'Cr', { a: 'middle', b: true }) + co(120, 95, 0, -50) + co(120, 125, 0, 50) + co(135, 110, 65, 0) + co(105, 110, -65, 0) + co(131, 118, 38, 38, { dash: true }) + co(109, 118, -38, 38, { dash: true }), 'Cr(CO)6', 30) },
    { name: 'Cr(CO)4(bipy)', desc: 'Cr bonded to four CO ligands and to both nitrogens of one 2,2\'-bipyridyl (two linked pyridine rings, a bidentate chelate)', svg: svg(270, 240, crbipy(), 'Cr(CO)4(bipy)', 20) },
  ],
};

/* ------------------------------------------------ apparatus sketches ------------------------------------------------ */
const ground = (x, y, w) => ln(x, y, x + w, y, S, 3);
const stand = (x, y0, y1) => ln(x, y0, x, y1, GR, 5);
const clamp = (x1, y, x2) => ln(x1, y, x2, y, GR, 4) + rc(x2 - 4, y - 5, 8, 10, { fill: GR, stroke: GR });
const condenser = (cx, top, h) => {
  // vertical condenser: jacket, inner tube, side arms. Water in at the BOTTOM, out at the TOP.
  const w = 30;
  return rc(cx - w / 2, top, w, h, { fill: '#f8fafc' }) + ln(cx - 6, top, cx - 6, top + h, S, 1.5) + ln(cx + 6, top, cx + 6, top + h, S, 1.5) +
    ln(cx + w / 2, top + 16, cx + w / 2 + 20, top + 16, S, 5) + ln(cx + w / 2, top + h - 16, cx + w / 2 + 20, top + h - 16, S, 5) +
    arrow(cx + w / 2 + 56, top + h - 16, cx + w / 2 + 26, top + h - 16) + arrow(cx + w / 2 + 26, top + 16, cx + w / 2 + 56, top + 16);
};
const rbf = (cx, cy, r, liquid, necks) => {
  // round-bottom flask with one or two vertical necks; returns glass outline and liquid
  const lvl = cy + r * (1 - 2 * liquid), id = `c${Math.round(cx)}${Math.round(cy)}`;
  let b = `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r - 1}"/></clipPath><rect x="${cx - r}" y="${lvl}" width="${2 * r}" height="${2 * r}" fill="${LQ}" clip-path="url(#${id})"/>` + ci(cx, cy, r, { fill: 'none' });
  for (const [nx, h] of necks) b += rc(nx - 11, cy - r - h + 8, 22, h, { fill: '#fff' });
  return b;
};

const REFLUX = svg(380, 410,
  ground(10, 395, 360) + stand(30, 20, 395) + clamp(30, 150, 140) +
  // hotplate and oil bath behind the flask, oil level BELOW the liquid level in the flask
  rc(110, 375, 180, 20, { fill: '#e2e8f0' }) + rc(120, 322, 160, 53, { fill: '#fde68a', stroke: '#d97706', w: 1.5, r: 3 }) +
  rbf(200, 295, 55, 0.5, [[200, 70]]) + rc(184, 232, 32, 8, { fill: '#fff', stroke: 'none' }) +
  ci(194, 330, 3, { fill: '#475569' }) + ln(185, 332, 210, 332, '#475569', 4) +
  condenser(200, 60, 140) + ln(186, 48, 214, 48, S, 2) + tx(200, 38, 'open top: not sealed', { a: 'middle' }) +
  label(140, 150, 'clamp on the NECK of the flask,', -20, 230) + tx(-20, 244, 'not on the condenser', { a: 'start' }) +
  label(246, 76, 'water OUT at the top', 300, 62) + label(246, 184, 'water IN at the bottom', 300, 196) +
  label(280, 340, 'oil bath: oil level BELOW the liquid level', 300, 352) + label(185, 285, 'liquid: flask less than half full', -20, 285) +
  label(200, 332, 'stir bar (or anti-bumping granules)', 300, 380) + tx(200, 408, 'hotplate stirrer', { a: 'middle', size: 10 }),
  'Reflux apparatus', 240);

const ADDITION = svg(380, 430,
  ground(10, 415, 360) + stand(30, 20, 415) + clamp(30, 245, 175) +
  rc(185, 20, 34, 38, { fill: '#e2e8f0' }) + tx(202, 44, 'CaCl₂', { a: 'middle', size: 9 }) + pa('M219 32 q16 0 16 -12') +
  rc(190, 58, 24, 22, { fill: '#fff' }) + pa('M170 80 L234 80 L218 175 L186 175 Z', { fill: '#dbeafe' }) + ln(202, 175, 202, 232, S, 3) +
  ln(190, 195, 214, 195, S, 3) + ci(202, 195, 4, { fill: S }) +
  rbf(202, 320, 58, 0.35, [[202, 90]]) + rc(138, 372, 128, 16, { fill: '#e0f2fe', stroke: '#0284c7', w: 1.5 }) + tx(202, 404, 'ice-water bath', { a: 'middle', size: 10 }) +
  label(235, 40, 'drying tube: open to the air, keeps moisture out', 285, 28) + label(234, 125, 'addition funnel: pyrrole solution', 285, 115) +
  label(214, 195, 'stopcock (closed at the start)', 285, 208) + label(258, 325, 'dried flask: anhydride in CH₂Cl₂', 285, 320) +
  label(160, 345, 'oven-dried stir bar', -20, 365) + label(180, 245, 'clamp the flask neck', -20, 260),
  'Addition funnel with drying tube', 240);

// distillation under reduced pressure: tilted condenser drawn as a rotated rectangle
const tilted = (x1, y1, x2, y2, w, fill) => {
  const a = Math.atan2(y2 - y1, x2 - x1), dx = (-Math.sin(a) * w) / 2, dy = (Math.cos(a) * w) / 2;
  return pg([[x1 + dx, y1 + dy], [x2 + dx, y2 + dy], [x2 - dx, y2 - dy], [x1 - dx, y1 - dy]], { fill });
};
const VACDIST = svg(520, 400,
  ground(10, 385, 500) + rc(30, 350, 140, 30, { fill: '#e2e8f0' }) + tx(100, 370, 'hotplate stirrer', { a: 'middle', size: 10 }) +
  rc(48, 305, 104, 45, { fill: '#fef3c7', stroke: '#d97706', w: 1.5, r: 3 }) + tx(100, 342, 'oil bath', { a: 'middle', size: 10 }) +
  rbf(100, 290, 42, 0.45, [[100, 60]]) + ln(92, 296, 108, 296, '#475569', 4) +
  // still head: vertical tube from the flask, thermometer in the top port, side arm to the condenser
  rc(89, 160, 22, 24, { fill: '#fff' }) + pa('M89 160 L89 118 L111 118 L111 160') + rc(84, 108, 32, 14, { fill: '#fff' }) +
  ln(100, 60, 100, 146, '#dc2626', 3) + ci(100, 148, 4, { fill: '#dc2626', stroke: '#dc2626' }) + tx(100, 52, 'thermometer', { a: 'middle', size: 10 }) +
  pa('M111 132 L190 160') + pa('M111 144 L190 172') +
  tilted(190, 166, 335, 226, 26, '#f1f5f9') + arrow(215, 238, 238, 214) + tx(205, 258, 'water IN (low end)', { size: 10, fill: BL }) + arrow(300, 196, 280, 178) + tx(290, 168, 'water OUT (high end)', { size: 10, fill: BL }) +
  pa('M335 226 L352 232 L352 252') + rc(344, 250, 16, 14, { fill: '#fff' }) + ln(360, 258, 400, 258, S, 6) + arrow(470, 258, 408, 258, '#7c3aed') + tx(412, 244, 'to cold trap and pump', { size: 10, fill: '#7c3aed' }) +
  rbf(352, 305, 36, 0.3, [[352, 46]]) + rc(310, 336, 84, 30, { fill: '#e0f2fe', stroke: '#0284c7', w: 1.5, r: 3 }) + tx(352, 378, 'receiver cooled in ice', { a: 'middle', size: 10 }) +
  label(100, 130, 'thermometer bulb level with the side-arm opening', 150, 100, { a: 'start' }) + label(80, 296, 'stir bar (boiling chips fail under vacuum)', -20, 330) +
  label(240, 170, 'condenser', 330, 120) + tx(10, 16, 'Greased joints throughout; apply the vacuum BEFORE heating', { size: 11, b: true }),
  'Distillation under reduced pressure', 240);

// Grignard apparatus: two-neck flask, pressure-equalising addition funnel (left), condenser with take-off adapter (right)
const GRIGNARD = svg(430, 420,
  ground(10, 405, 400) + stand(30, 20, 405) + clamp(30, 255, 200) +
  rc(150, 385, 140, 20, { fill: '#e2e8f0' }) + tx(220, 400, 'stirrer / heater', { a: 'middle', size: 10 }) +
  rbf(220, 330, 55, 0.35, [[188, 52], [252, 52]]) +
  // pressure-equalising addition funnel on the left neck
  rc(178, 242, 20, 26, { fill: '#fff' }) + ln(188, 242, 188, 218, S, 3) + ln(177, 230, 199, 230, S, 3) + ci(188, 230, 3.5, { fill: S }) +
  rc(170, 120, 36, 98, { fill: '#dbeafe' }) + rc(172, 106, 32, 16, { fill: '#e2e8f0' }) + tx(188, 100, 'septum', { a: 'middle', size: 10 }) +
  pa('M170 150 L152 150 L152 262 L178 262', { w: 2 }) +
  // condenser on the right neck
  condenser(252, 90, 130) + rc(241, 222, 22, 20, { fill: '#fff' }) + ln(252, 90, 252, 62, S, 5) + ln(252, 62, 292, 62, S, 5) + ln(292, 62, 292, 40, S, 5) + arrow(292, 52, 292, 30, '#7c3aed') + tx(300, 28, 'to manifold (N₂ / vacuum) and bubbler', { size: 10, fill: '#7c3aed' }) +
  label(206, 110, 'septum: inject the dry reagent', 330, 140, { size: 10 }) + label(152, 200, 'pressure-equalising side arm', -20, 170) + label(185, 170, 'addition funnel: PhBr in dry ether', -20, 130) +
  label(275, 180, 'condenser: water in at the bottom, out at the top', 340, 200, { size: 10 }) + label(256, 62, 'take-off adapter', 340, 74, { size: 10 }) +
  label(250, 345, 'Mg + dry ether; oven-dried stir bar', 330, 360) + label(166, 290, 'two-neck flask, oven-dried', -20, 300),
  'Grignard apparatus on a Schlenk line', 240);

const SUBLIM = svg(380, 400,
  ground(10, 385, 360) + stand(30, 20, 385) + clamp(30, 170, 150) +
  rc(150, 120, 90, 230, { fill: '#fff' }) + ln(150, 130, 240, 130, S, 2) +
  ln(240, 160, 290, 160, S, 6) + arrow(330, 160, 296, 160, '#7c3aed') + tx(300, 144, 'to vacuum (about 6 mmHg)', { size: 10, fill: '#7c3aed' }) +
  rc(183, 40, 24, 250, { fill: '#e0f2fe', stroke: '#0284c7' }) + ln(195, 40, 195, 230, '#0284c7', 1.5) +
  arrow(110, 60, 183, 60) + arrow(207, 76, 262, 76) + tx(105, 56, 'ice-cold water in', { a: 'end', size: 10, fill: BL }) + tx(268, 80, 'water out', { size: 10, fill: BL }) +
  rc(162, 330, 66, 16, { fill: '#fde68a', stroke: '#b45309' }) + tx(195, 322, 'crude solid', { a: 'middle', size: 10 }) +
  ci(195, 296, 3, { fill: '#475569' }) + ci(188, 304, 3, { fill: '#475569' }) + ci(202, 304, 3, { fill: '#475569' }) +
  rc(120, 352, 150, 22, { fill: '#fef3c7', stroke: '#d97706', w: 1.5, r: 3 }) + tx(195, 368, 'gentle heat (not above 50 °C)', { a: 'middle', size: 10 }) +
  label(195, 296, 'sublimed solid collects on the cold finger', -20, 320) + label(188, 128, 'greased joint', -20, 118, { size: 10 }) + label(240, 250, 'vacuum first, then gentle heat', 290, 250),
  'Sublimation apparatus', 240);

const COLUMN = svg(380, 440,
  ground(10, 428, 360) + stand(30, 20, 428) + clamp(30, 210, 140) +
  rc(165, 18, 40, 30, { fill: '#fff' }) + rc(163, 44, 44, 8, { fill: '#16a34a', stroke: '#16a34a' }) + ln(205, 28, 250, 28, S, 5) + tx(256, 32, 'connection to air pump', { size: 10 }) +
  ci(185, 100, 36, { fill: '#fff' }) + rc(176, 52, 18, 20, { fill: '#fff', stroke: 'none' }) + ln(160, 112, 210, 112, '#475569', 1.5, '3 3') + tx(185, 90, 'eluent', { a: 'middle', size: 10 }) +
  rc(177, 132, 16, 230, { fill: '#fff' }) + rc(178, 190, 14, 120, { fill: '#e2e8f0', stroke: 'none' }) + rc(178, 310, 14, 8, { fill: '#fde68a', stroke: 'none' }) + ln(178, 182, 192, 182, '#475569', 1.5, '3 3') +
  rc(178, 330, 14, 14, { fill: '#f8fafc', stroke: GR, w: 1 }) + ln(170, 352, 210, 352, S, 3) + ci(185, 352, 4, { fill: S }) +
  rc(170, 372, 30, 50, { fill: '#fff' }) + rc(171, 397, 28, 24, { fill: LQ, stroke: 'none' }) +
  label(208, 50, 'green clip holds the adapter', 262, 56, { size: 10 }) + label(221, 112, 'solvent reservoir', 262, 112) +
  label(193, 250, 'silica bed: never let it run dry', 262, 250) + label(193, 314, 'sand layer', 262, 314) + label(193, 337, 'cotton wool plug (not too tight)', 262, 340) +
  label(195, 352, 'stopcock', 262, 366) + label(200, 400, 'test tubes in order; check by TLC', 262, 410, { size: 10 }),
  'Flash column', 240);

const SEPFUN = svg(380, 420,
  ground(10, 405, 360) + stand(30, 40, 405) + ln(30, 150, 120, 150, GR, 4) + ci(150, 150, 32, { stroke: GR, w: 4 }) +
  rc(138, 52, 24, 16, { fill: '#fff' }) + tx(150, 46, 'stopper', { a: 'middle', size: 10 }) +
  pa('M140 68 L140 120 Q100 140 118 196 L144 276 L156 276 L182 196 Q200 140 160 120 L160 68 Z', { fill: '#fff' }) +
  pa('M126 166 L174 166 L156 270 L144 270 Z', { fill: LQ, stroke: 'none' }) + pa('M113 146 Q120 154 126 166 L174 166 Q182 154 187 146 Z', { fill: '#fef9c3', stroke: 'none' }) + ln(124, 166, 176, 166, '#475569', 1.5, '3 3') +
  ln(150, 276, 150, 302, S, 3) + ln(138, 290, 162, 290, S, 3) + ci(150, 290, 4, { fill: S }) +
  pa('M110 340 L118 392 L182 392 L190 340 Z', { fill: '#fff' }) + pa('M116 372 L184 372 L182 392 L118 392 Z', { fill: LQ, stroke: 'none' }) + arrow(150, 306, 150, 336, GR) +
  label(185, 150, 'upper layer (lighter: ether or hexane)', 235, 128) + label(170, 215, 'lower layer (denser: water, or CH₂Cl₂)', 235, 215) +
  label(120, 150, 'ring clamp on a stand', -20, 130, { size: 10 }) + label(162, 290, 'stopcock: drain the lower layer', 235, 296) + label(184, 372, 'keep BOTH layers until the product is found', 235, 380, { size: 10 }) +
  tx(10, 16, 'Shake, invert and vent through the stopcock; remove the stopper before draining', { size: 10, b: true }),
  'Separatory funnel extraction', 240);

export const APPARATUS = {
  reflux: { title: 'Reflux apparatus', svg: REFLUX },
  addition: { title: 'Addition funnel with a drying tube', svg: ADDITION },
  vacdist: { title: 'Distillation under reduced pressure', svg: VACDIST },
  grignard: { title: 'Grignard apparatus on a Schlenk line', svg: GRIGNARD },
  sublimation: { title: 'Sublimation apparatus', svg: SUBLIM },
  column: { title: 'Flash column', svg: COLUMN },
  sepfunnel: { title: 'Separatory funnel extraction', svg: SEPFUN },
};
