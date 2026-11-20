/* Tanabe–Sugano data, computed rather than copied.
   Hamiltonian for d^n in an octahedral field: Slater–Condon electron repulsion (F2, F4 from the Racah parameters B and C) plus the
   octahedral crystal-field operator, in the basis of Slater determinants of the complex d orbitals (z along C4). Blocks are split by
   M_S and by M_L mod 4 (the C4 eigenvalue), diagonalised by Jacobi, spin is read from how a level repeats from M_S to M_S + 1, and the
   Oh irrep from which C4 sectors it appears in (A1: k=0 only, A2: k=2 only, E: k=0 and 2, T1: k=1 and 0, T2: k=1 and 2).
   Output: public/content/figures/ts.json (energies in units of B above the ground state, against Delta_o/B). C/B per ion are the
   original Tanabe–Sugano values. Run: node tools/figures/ts.mjs */
import fs from 'node:fs';

const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
function w3j(j1, j2, j3, m1, m2, m3) {
  if (m1 + m2 + m3 !== 0) return 0;
  if (j3 < Math.abs(j1 - j2) || j3 > j1 + j2) return 0;
  if (Math.abs(m1) > j1 || Math.abs(m2) > j2 || Math.abs(m3) > j3) return 0;
  const t1 = j3 - j2 + m1, t2 = j3 - j1 - m2, t3 = j1 + j2 - j3, t4 = j1 - m1, t5 = j2 + m2;
  let s = 0;
  for (let t = Math.max(0, -t1, -t2); t <= Math.min(t3, t4, t5); t++) s += ((t % 2 ? -1 : 1)) / (fact(t) * fact(t + t1) * fact(t + t2) * fact(t3 - t) * fact(t4 - t) * fact(t5 - t));
  const tri = Math.sqrt((fact(j1 + j2 - j3) * fact(j1 - j2 + j3) * fact(-j1 + j2 + j3)) / fact(j1 + j2 + j3 + 1));
  const pre = Math.sqrt(fact(j1 + m1) * fact(j1 - m1) * fact(j2 + m2) * fact(j2 - m2) * fact(j3 + m3) * fact(j3 - m3));
  return (((j1 - j2 - m3) % 2 ? -1 : 1)) * tri * pre * s;
}
const L = 2;
const ck = (k, m, mp) => ((m % 2 ? -1 : 1)) * (2 * L + 1) * w3j(L, L, k, 0, 0, 0) * w3j(L, L, k, -m, mp, m - mp);

const MS = [-2, -1, 0, 1, 2];
const orb = (p) => p >> 1, spin = (p) => p & 1; // spin-orbital p = 2*(m+2) + sigma
const mOf = (p) => MS[p >> 1];
const CFdiag = { '-2': 1, '-1': -4, '0': 6, '1': -4, '2': 1 }; // in Dq; <2|V|-2> = 5 Dq

function buildOps(F2, F4) {
  const F = { 0: 0, 2: F2, 4: F4 };
  const g = (a, b, c, d) => { // <ab|g|cd> over spin-orbitals
    if (spin(a) !== spin(c) || spin(b) !== spin(d)) return 0;
    const ma = mOf(a), mb = mOf(b), mc = mOf(c), md = mOf(d);
    if (ma + mb !== mc + md) return 0;
    let s = 0;
    for (const k of [2, 4]) s += ck(k, ma, mc) * ck(k, md, mb) * F[k];
    return s;
  };
  const h = (p, q) => { // crystal field per Dq
    if (spin(p) !== spin(q)) return 0;
    const mp = mOf(p), mq = mOf(q);
    if (mp === mq) return CFdiag[mp];
    if (Math.abs(mp - mq) === 4) return 5;
    return 0;
  };
  return { g, h };
}

const bits = (x) => { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; };
const annih = (D, p) => (D >> p) & 1 ? [D ^ (1 << p), bits(D & ((1 << p) - 1)) % 2 ? -1 : 1] : null;
const creat = (D, p) => (D >> p) & 1 ? null : [D | (1 << p), bits(D & ((1 << p) - 1)) % 2 ? -1 : 1];

function determinants(n, twoMs) {
  const out = [];
  for (let D = 0; D < 1024; D++) {
    if (bits(D) !== n) continue;
    let up = 0, dn = 0, ML = 0;
    for (let p = 0; p < 10; p++) if ((D >> p) & 1) { if (spin(p)) dn++; else up++; ML += mOf(p); }
    if (up - dn === twoMs) out.push({ D, ML });
  }
  return out;
}

function jacobi(A) { // real symmetric, returns eigenvalues
  const n = A.length, a = A.map((r) => r.slice());
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
    if (off < 1e-22) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(a[p][q]) < 1e-30) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = c * x - s * y; a[k][q] = s * x + c * y; }
      for (let k = 0; k < n; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = c * x - s * y; a[q][k] = s * x + c * y; }
    }
  }
  return a.map((r, i) => r[i]).sort((x, y) => x - y);
}

/* Hamiltonian matrices (repulsion and per-Dq crystal field) for one (n, 2*Ms) sector, split by k = M_L mod 4. */
function sectorMatrices(n, twoMs, ops) {
  const dets = determinants(n, twoMs), idx = new Map(dets.map((d, i) => [d.D, i]));
  const N = dets.length, Vee = Array.from({ length: N }, () => new Float64Array(N)), Vcf = Array.from({ length: N }, () => new Float64Array(N));
  dets.forEach((d, j) => {
    for (let r = 0; r < 10; r++) for (let s2 = 0; s2 < 10; s2++) { // one-body: a+_p a_q
      const hv = ops.h(r, s2); if (!hv) continue;
      const a1 = annih(d.D, s2); if (!a1) continue; const c1 = creat(a1[0], r); if (!c1) continue;
      const i = idx.get(c1[0]); if (i !== undefined) Vcf[i][j] += hv * a1[1] * c1[1];
    }
    for (let r = 0; r < 10; r++) for (let s2 = 0; s2 < 10; s2++) {
      if (r === s2) continue;
      const a1 = annih(d.D, r); if (!a1) continue; const a2 = annih(a1[0], s2); if (!a2) continue;
      for (let p = 0; p < 10; p++) for (let q = 0; q < 10; q++) {
        if (p === q) continue;
        const gv = ops.g(p, q, r, s2); if (!gv) continue;
        const c1 = creat(a2[0], q); if (!c1) continue; const c2 = creat(c1[0], p); if (!c2) continue;
        const i = idx.get(c2[0]); if (i !== undefined) Vee[i][j] += 0.5 * gv * a1[1] * a2[1] * c1[1] * c2[1];
      }
    }
  });
  const sectors = [0, 1, 2, 3].map((k) => dets.map((d, i) => (((d.ML % 4) + 4) % 4 === k ? i : -1)).filter((i) => i >= 0));
  return { Vee, Vcf, sectors };
}

const TOL = 1e-6;
function levelsFor(n, B, C, delta) { // delta = Delta_o in units of B; Dq = delta / 10
  const F4 = 441 * C / 35, F2 = 49 * B + 7 * C, ops = buildOps(F2, F4), dq = delta / 10 * B;
  const nMax = n <= 5 ? n : 10 - n, twoMin = n % 2, res = [];
  const eig = {};
  for (let twoMs = twoMin; twoMs <= nMax; twoMs += 2) {
    const { Vee, Vcf, sectors } = sectorMatrices(n, twoMs, ops);
    eig[twoMs] = sectors.map((sec) => jacobi(sec.map((i) => sec.map((j) => Vee[i][j] + dq * Vcf[i][j]))));
  }
  const take = (list, e) => { const i = list.findIndex((x) => Math.abs(x - e) < TOL); if (i < 0) return false; list.splice(i, 1); return true; };
  for (let twoMs = twoMin; twoMs <= nMax; twoMs += 2) {
    const sec = eig[twoMs].map((a) => a.slice());
    if (eig[twoMs + 2]) for (let k = 0; k < 4; k++) for (const e of eig[twoMs + 2][k]) take(sec[k], e);
    const [L0, L1, L2] = sec;
    for (const e of L1.slice()) { // T states
      if (take(L0, e)) res.push({ twoS: twoMs, irrep: 'T1', E: e });
      else if (take(L2, e)) res.push({ twoS: twoMs, irrep: 'T2', E: e });
      else throw new Error(`unmatched T level at n=${n} delta=${delta}`);
    }
    for (const e of L0.slice()) { if (take(L2, e)) res.push({ twoS: twoMs, irrep: 'E', E: e }); else res.push({ twoS: twoMs, irrep: 'A1', E: e }); }
    for (const e of L2) res.push({ twoS: twoMs, irrep: 'A2', E: e });
  }
  return res;
}

const CB = { 2: 4.42, 3: 4.5, 4: 4.61, 5: 4.477, 6: 4.8, 7: 4.633, 8: 4.709 };
const label = (r) => `${r.twoS + 1}${r.irrep}g`;

if (process.argv[1].endsWith('ts.mjs')) {
  const grid = [0.05]; for (let x = 0.5; x <= 40.001; x += 0.5) grid.push(Number(x.toFixed(2)));
  const out = { note: 'Computed by tools/figures/ts.mjs (Slater-Condon + octahedral field). Energies in units of B above the ground state; C/B per ion from the original Tanabe-Sugano values.', ions: {} };
  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    const B = 1, C = CB[n] * B;
    const cols = grid.map((x) => levelsFor(n, B, C, x));
    const byLabel = {};
    cols.forEach((lv, gi) => {
      const g0 = Math.min(...lv.map((r) => r.E));
      const seen = {};
      lv.sort((a, b) => a.E - b.E).forEach((r) => { const l = label(r); const j = (seen[l] = (seen[l] ?? -1) + 1); ((byLabel[l] ||= [])[j] ||= new Array(grid.length).fill(null))[gi] = Number((r.E - g0).toFixed(3)); });
    });
    const curves = [];
    for (const [l, arr] of Object.entries(byLabel)) arr.forEach((E, j) => curves.push({ label: l, tag: arr.length > 1 ? (j === 0 ? 'lower' : j === 1 ? 'upper' : String(j)) : '', S: (Number(l[0]) - 1) / 2, E }));
    const ground = cols.map((lv) => { const m = lv.reduce((a, b) => (a.E <= b.E ? a : b)); return label(m); });
    out.ions[n] = { CB: CB[n], x: grid, curves, ground };
  }
  fs.mkdirSync('public/content/figures', { recursive: true });
  fs.writeFileSync('public/content/figures/ts.json', JSON.stringify(out));
  console.log('wrote public/content/figures/ts.json', (fs.statSync('public/content/figures/ts.json').size / 1024).toFixed(0), 'KB');
}
export { levelsFor, label, CB, sectorMatrices, buildOps, jacobi };
