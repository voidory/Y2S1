import { range, choice, num, kw, calc, written, node } from './lib.mjs';

/* Topic 2: air pollution in Singapore (the PSI). The booklet gives the band table and the sub-index formula; the exam gives
   no values in the stem. Four of the last seven finals carry a PSI part (4 to 11 marks): sub-index and category, which pollutant
   sets the PSI, why a 24-hour value barely moves, and the breathing / cigarette-equivalent chain.
   Method (booklet): I_p = (PSI_J+1 - PSI_J)/(I_max,J+1 - I_max,J) x (C_p - I_max,J) + PSI_J, with I_max,J the TOP of the lower band;
   the lowest band uses 0 and 0; the overall PSI is the largest sub-index. */
const SRC = 'Topic 2 · PSI (booklet)';
const THEME = 'Air quality';
const WEEK = 2;
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });

// 24-h breakpoints: [pollutant concentration at the top of the band, PSI at the top of the band]
const BP = {
  pm25: [[12, 50], [55, 100], [150, 200], [250, 300], [350, 400]],
  pm10: [[50, 50], [150, 100], [350, 200], [420, 300], [500, 400]],
  so2: [[80, 50], [365, 100], [800, 200], [1600, 300], [2100, 400]],
};
const NAME = { pm25: 'PM2.5', pm10: 'PM10', so2: 'SO₂' };
const hintTable = (keys) => 'Booklet, 24-hour values at PSI 50 / 100 / 200 / 300 / 400 (µg m⁻³): ' + keys.map((k) => `${NAME[k]} ${BP[k].map((b) => b[0]).join(' / ')}`).join('; ') + '. Sub-index I = [(PSI_upper − PSI_lower)/(C_upper − C_lower)] × (C − C_lower) + PSI_lower, where C_lower and PSI_lower are the values at the **top of the band below** (0 and 0 for the lowest band). The overall PSI is the largest sub-index.';

/** Piecewise sub-index as an Expr string in variable v. */
function subExpr(key, v) {
  const bp = BP[key];
  const f = (k) => {
    const [cu, iu] = bp[k];
    const [cl, il] = k === 0 ? [0, 0] : bp[k - 1];
    return `((${iu} - ${il}) / (${cu} - ${cl})) * (${v} - ${cl}) + ${il}`;
  };
  let e = f(bp.length - 1);
  for (let k = bp.length - 2; k >= 0; k--) e = `${v} <= ${bp[k][0]} ? ${f(k)} : (${e})`;
  return e;
}
const catExpr = (p) => `${p} <= 50 ? 'good' : (${p} <= 100 ? 'moderate' : (${p} <= 200 ? 'unhealthy' : (${p} <= 300 ? 'very unhealthy' : 'hazardous')))`;
const CATS = ['good', 'moderate', 'unhealthy', 'very unhealthy', 'hazardous'];
const catKw = (key, label, expr) => kw(key, label, CATS, expr, { synonyms: Object.fromEntries(CATS.map((c) => [c, [c]])) });
const shortcut = (key, v) => `${v} / ${BP[key][0][0]} * 50`; // slip: a straight ratio from zero

/* ---------- sub-index and category, one pollutant ---------- */
const subVariant = (key, lo, hi, step, marks = 4) => calc({
  id: `psi-sub-${key}`, label: `${NAME[key]} sub-index and category (${marks} marks)`, marks,
  stem: `The 24-hour mean concentration of ${NAME[key]} at a monitoring station in Singapore was **{{fix(c,0)}} µg m⁻³**. Using the booklet, calculate the ${NAME[key]} sub-index (round to a whole number) and state the air-quality descriptor for that value.`,
  hint: hintTable([key]),
  explanation: `Find the band that holds {{fix(c,0)}} µg m⁻³, take the **top of the band below** as the lower anchor (concentration and PSI), and interpolate: I = {{fix(psi,0)}}. The descriptor follows the PSI: up to 50 good, 51–100 moderate, 101–200 unhealthy, 201–300 very unhealthy, above 300 hazardous.`,
  sampled: { c: range(lo, hi, step, 0) },
  derived: { psi: `round(${subExpr(key, 'c')}, 0)`, cat: catExpr('psi') },
  fields: [
    num('psi', `${NAME[key]} sub-index`, '', 'psi', { relTol: 0.015, tol: 1, sig: 3, paths: [
      { label: 'A straight ratio from zero is only right inside the lowest band; interpolate between the band limits.', expr: shortcut(key, 'c') },
    ] }),
    catKw('cat', 'Descriptor', 'cat'),
  ],
});
add(node({
  id: 'bk-m11-a-sub', week: WEEK, title: 'PSI sub-index from a 24-hour concentration', theme: THEME, tags: ['psi', 'sub-index'], source: SRC, family: 'psi', tier: 'atomic', exam: 'short_2to3', mins: 3,
  variants: [subVariant('pm25', 3, 140, 1), subVariant('pm10', 8, 190, 1), subVariant('so2', 6, 330, 1)],
}), { id: 'm11.a.sub', name: 'PSI sub-index and descriptor from a concentration', chunk: 'a-psi', marks: 3, tags: ['psi'] });

/* ---------- three pollutants: the overall PSI ---------- */
{
  const POLL = ['PM2.5', 'PM10', 'SO2'];
  add(node({
    id: 'bk-m11-a-overall', week: WEEK, title: 'Overall PSI from three pollutants', theme: THEME, tags: ['psi', 'overall'], source: SRC, family: 'psi', exam: 'short_2to3', mins: 5,
    variants: [calc({
      id: 'psi-overall', label: 'Sub-indices, overall PSI and the pollutant that sets it (6 marks)', marks: 6,
      stem: 'The 24-hour concentrations at one station were:\n\n| Pollutant | 24-h mean (µg m⁻³) |\n|---|---|\n| PM2.5 | {{fix(a,0)}} |\n| PM10 | {{fix(b,0)}} |\n| SO₂ | {{fix(s,0)}} |\n\nCalculate the three sub-indices, give the overall PSI (whole number), say which pollutant sets it and name the descriptor.',
      hint: hintTable(['pm25', 'pm10', 'so2']),
      explanation: 'Each pollutant gets its own sub-index by interpolation inside its own band table; the **largest** sub-index is the PSI, and the pollutant that produced it is the one reported. PM10 limits are larger than PM2.5 limits, so the same concentration gives a lower PM10 sub-index.',
      sampled: { a: range(14, 130, 1, 0), b: range(30, 230, 1, 0), s: range(20, 330, 1, 0) },
      derived: { p1: `round(${subExpr('pm25', 'a')}, 0)`, p2: `round(${subExpr('pm10', 'b')}, 0)`, p3: `round(${subExpr('so2', 's')}, 0)`, top: 'max(p1, p2, p3)', who: "p1 >= p2 && p1 >= p3 ? 'PM2.5' : (p2 >= p3 ? 'PM10' : 'SO2')", cat: catExpr('top') },
      fields: [
        num('p1', 'PM2.5 sub-index', '', 'p1', { relTol: 0.015, tol: 1, sig: 3 }),
        num('p2', 'PM10 sub-index', '', 'p2', { relTol: 0.015, tol: 1, sig: 3 }),
        num('p3', 'SO₂ sub-index', '', 'p3', { relTol: 0.015, tol: 1, sig: 3 }),
        num('top', 'Overall PSI', '', 'top', { relTol: 0.015, tol: 1, sig: 3, paths: [{ label: 'The PSI is the largest sub-index, not the mean.', expr: '(p1 + p2 + p3) / 3' }], ecf: [{ expr: 'max(u_p1, u_p2, u_p3)', label: 'The largest of your own sub-indices: right method, built on an earlier slip.' }] }),
        kw('who', 'Pollutant that sets the PSI', POLL, 'who', { synonyms: { 'PM2.5': ['pm2.5', 'pm 2.5', 'pm25'], PM10: ['pm10', 'pm 10'], SO2: ['so2', 'so₂', 'sulfur dioxide', 'sulphur dioxide'] } }),
        catKw('cat', 'Descriptor', 'cat'),
      ],
    })],
  }), { id: 'm11.a.overall', name: 'Overall PSI: the largest sub-index', chunk: 'a-psi', marks: 3, tags: ['psi'] });
}

/* ---------- breathing and cigarette equivalents ---------- */
{
  const VDAY = 'rate * 60 * 24 / 1000';
  add(node({
    id: 'bk-m11-a-cig', week: WEEK, title: 'Breathing and cigarette-equivalent chain', theme: THEME, tags: ['psi', 'cigarette'], source: SRC, family: 'psi-chain', exam: 'construct_4to6', mins: 5,
    variants: [
      calc({
        id: 'cig-year', label: 'Air breathed, PM2.5 inhaled and cigarette equivalents (4 marks)', marks: 4,
        stem: 'A person breathes at **{{fix(rate,0)}} L min⁻¹**. The year-round 24-hour PM2.5 concentration is **{{fix(c,0)}} µg m⁻³**. One cigarette is estimated to contain 12 mg of PM2.5. Calculate (a) the volume of air breathed in one day, (b) the mass of PM2.5 inhaled in a year (365 days) and (c) how many cigarettes that is equivalent to.',
        hint: '1 m³ = 1000 L. Mass inhaled = concentration × volume. 12 mg = 12 000 µg.',
        explanation: 'Volume per day = rate × 60 × 24 / 1000 = {{fix(vday,2)}} m³. Mass per year = c × V × 365 = {{fix(mgyr,0)}} mg (convert µg to mg). Divide by 12 mg per cigarette: about {{fix(cigs,0)}} cigarettes a year. The comparison ignores what the particles are made of, which is one reason the PSI descriptors can mislead.',
        sampled: { rate: choice([6, 8, 10]), c: choice([15, 20, 25, 30, 35, 40, 45, 50, 60, 70]) },
        derived: { vday: VDAY, mgyr: 'c * vday * 365 / 1000', cigs: 'mgyr / 12' },
        fields: [
          num('vday', 'Air breathed per day', 'm³', 'vday', { relTol: 0.02 }),
          num('mgyr', 'PM2.5 inhaled per year', 'mg', 'mgyr', { relTol: 0.02, ecf: [{ expr: 'c * u_vday * 365 / 1000', label: 'Consistent with your own daily volume.' }] }),
          num('cigs', 'Cigarette equivalents per year', '', 'cigs', { relTol: 0.03, sig: 3, paths: [{ label: 'That is one day, not a year: multiply by 365.', expr: 'c * vday / 12000' }], ecf: [{ expr: 'u_mgyr / 12', label: 'Consistent with your own yearly mass.' }] }),
        ],
      }),
      calc({
        id: 'cig-back', label: 'Concentration from the mass breathed, and its PSI (4 marks)', marks: 4,
        stem: 'A person breathing at 8 L min⁻¹ inhaled **{{fix(m,0)}} µg** of PM2.5 in 24 hours. Calculate the average PM2.5 concentration in the air (µg m⁻³) and, using the booklet, the PM2.5 sub-index (whole number).',
        hint: hintTable(['pm25']),
        explanation: 'Air breathed in 24 h = 8 × 60 × 24 / 1000 = 11.52 m³, so c = m / V = {{fix(c,1)}} µg m⁻³. That lies in the band whose top below is given by the booklet; interpolate to get PSI {{fix(psi,0)}}.',
        sampled: { m: range(150, 900, 10, 0) },
        derived: { c: 'm / 11.52', psi: `round(${subExpr('pm25', 'c')}, 0)` },
        fields: [
          num('c', 'PM2.5 concentration', 'µg m⁻³', 'c', { relTol: 0.02 }),
          num('psi', 'PM2.5 sub-index', '', 'psi', { relTol: 0.015, tol: 1.5, sig: 3, ecf: [{ expr: `round(${subExpr('pm25', 'u_c')}, 0)`, label: 'Consistent with your own concentration.' }] }),
        ],
      }),
    ],
  }), { id: 'm11.a.cig', name: 'Breathing volume, mass inhaled and cigarette equivalents', chunk: 'a-psi', marks: 4, tags: ['psi', 'cigarette'] });
}

/* ---------- written points ---------- */
add(node({
  id: 'bk-m11-a-written', week: WEEK, title: 'PSI: 24-hour versus 1-hour, and why the descriptors can mislead', theme: THEME, tags: ['psi', 'explain'], source: SRC, family: 'psi-written', exam: 'short_2to3', mins: 4,
  variants: [
    written({
      id: 'psi-24h', label: 'Why the 24-hour PSI barely changes from hour to hour (2 marks)',
      stem: 'The 24-hour PM2.5 value reported each hour hardly changes from one hour to the next, yet a fire nearby can make the air much worse within an hour. Explain why the 24-hour value changes slowly and why the 1-hour value is sometimes reported as well.',
      explanation: 'The 24-hour value is an average of the present hourly reading and the previous 23, so one new hour changes it by only about 1/24 of the difference. The 1-hour value tracks the present, so it shows a sudden event (haze, fire) that the 24-hour value would take many hours to reflect.',
      items: [['The 24-hour value is an average of the latest and the previous 23 hourly values, so one new hour moves it only a little', 1, true], ['The 1-hour value responds quickly to a sudden change such as haze or a fire, so it is reported when conditions are changing', 1]],
    }),
    written({
      id: 'psi-mislead', label: 'Reasons the PSI descriptors may mislead (4 marks)',
      stem: 'The PSI descriptor ("moderate", "unhealthy") is sometimes read as a direct statement about health. Give **four** reasons it can mislead.',
      hint: 'Think about where the bands come from, what the number leaves out, and what it does not say about time.',
      explanation: 'The health thresholds are extrapolated from studies with assumptions; the number gives no uncertainty; it ignores what the particles are made of (cigarette smoke is mostly carbon and tar, haze particles carry metals and other material); it has no time dimension (the exposure that matters is cumulative) and an equivalence with smoking compares unlike particles.',
      items: [['The bands rest on extrapolated health data and assumptions', 1], ['No error analysis or uncertainty is attached to the number', 1], ['It ignores the composition of the particles (carbon and tar versus metals and industrial particles)', 1], ['No time dimension: short exposure and long cumulative exposure are not distinguished', 1]],
    }),
  ],
}), { id: 'm11.a.written', name: 'PSI explanations: 24-hour versus 1-hour, limits of the descriptors', chunk: 'a-psi', marks: 2, tags: ['psi'] });

export default out;
