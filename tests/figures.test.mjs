import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load-engine.mjs';

const { Figures } = loadEngine();
const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('extraction: at pH = pKa an acid has D = K/2; far above it D falls to ~0, far below it D -> K', () => {
  near(Figures.extraction(4.1, 5, 5, 'acid').D, 2.05);
  assert.ok(Figures.extraction(4.1, 5, 9, 'acid').D < 1e-3);
  near(Figures.extraction(4.1, 5, 1, 'acid').D, 4.1, 1e-3);
});
test('extraction: the final-style benzoic acid case (K 4.1, Ka 6.3e-5, pH 5) gives D = 0.562', () => {
  near(Figures.extraction(4.1, -Math.log10(6.3e-5), 5, 'acid').D, 0.562, 1e-3);
});
test('extraction: a base is the mirror image (D -> K at high pH, falls at low pH)', () => {
  near(Figures.extraction(6, 9, 9, 'base').D, 3);
  assert.ok(Figures.extraction(6, 9, 7, 'base').D < 0.1);
  near(Figures.extraction(6, 9, 13, 'base').D, 6, 1e-3);
});
test('van Deemter: the minimum is at sqrt(B/C) with H = A + 2 sqrt(BC)', () => {
  const v = Figures.vanDeemter(2, 3, 0.3, 1);
  near(v.uOpt, Math.sqrt(10)); near(v.Hmin, 2 + 2 * Math.sqrt(0.9));
  near(Figures.vanDeemter(2, 3, 0.3, v.uOpt).H, v.Hmin);
  assert.ok(Figures.vanDeemter(2, 3, 0.3, v.uOpt * 0.5).H > v.Hmin && Figures.vanDeemter(2, 3, 0.3, v.uOpt * 2).H > v.Hmin);
});
test('resolution: Purnell with the practice-set values (alpha 1.12, kB 4.2) needs N = 2.14e3 for Rs 1.0', () => {
  near(Figures.resolution(1.12, 4.2, 2140).RsPurnell, 1.0, 0.01);
  const r = Figures.resolution(1.1, 3, 4000);
  assert.ok(Math.abs(r.RsPeaks - r.RsPurnell) / r.RsPurnell < 0.1, 'peak-based and Purnell agree within 10%');
  near(Figures.resolution(1.1, 3, 16000).RsPurnell / Figures.resolution(1.1, 3, 4000).RsPurnell, 2, 1e-9); // 4x N doubles Rs
});
test('calibration: the 10 mL -> 100 mL style chain (slope 59, standard 400 mV, sample 303.7 mV)', () => {
  const m = Figures.calibration(400, -59, 303.7, 10);
  near(m.logc, -4 + (303.7 - 400) / -59); near(m.c0, m.c * 10);
  near(m.E3, 282);
});
test('ohFill: spin choice flips with the field for d4-d7, d1-d3 and d8-d9 have no choice', () => {
  assert.equal(Figures.ohFill(6, 0.6).unpaired, 4);   // weak field, high spin
  assert.equal(Figures.ohFill(6, 1.6).unpaired, 0);   // strong field, low spin
  assert.equal(Figures.ohFill(5, 0.6).unpaired, 5);
  assert.equal(Figures.ohFill(5, 1.6).unpaired, 1);
  assert.equal(Figures.ohFill(4, 0.6).cfse.toFixed(1), '0.6');   // high spin d4: 0.6 Delta_o
  assert.equal(Figures.ohFill(4, 1.6).cfse.toFixed(1), '1.6');   // low spin d4: 1.6 Delta_o
  assert.equal(Figures.ohFill(6, 1.6).cfse.toFixed(1), '2.4');
  for (const r of [0.4, 1.8]) { assert.equal(Figures.ohFill(3, r).unpaired, 3); assert.equal(Figures.ohFill(8, r).unpaired, 2); assert.equal(Figures.ohFill(8, r).cfse.toFixed(1), '1.2'); }
});
test('figuresForChunks maps topics to their pictures once', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(Figures.figuresForChunks(['x-calc', 'x-concepts']))), ['extraction-ph']);
  assert.deepEqual(JSON.parse(JSON.stringify(Figures.figuresForChunks(['c-calc']))), ['resolution']);
  assert.deepEqual(JSON.parse(JSON.stringify(Figures.figuresForChunks(['t1-stats']))), []);
});

import fs from 'node:fs';
const termList = (n) => JSON.parse(JSON.stringify(Figures.termsOf(n).steps.map((t) => t.symbol))).sort().join(' ');
test('termsOf: d2 and d8 give 3F 1G 3P 1D 1S (45 microstates); d3 and d7 give 4F 4P 2H 2G 2F 2D 2D 2P (120)', () => {
  assert.equal(termList(2), ['3F', '1G', '3P', '1D', '1S'].sort().join(' '));
  assert.equal(termList(8), termList(2));
  assert.equal(termList(3), ['4F', '4P', '2H', '2G', '2F', '2D', '2D', '2P'].sort().join(' '));
  assert.equal(termList(7), termList(3));
  assert.equal(Figures.termsOf(2).total, 45); assert.equal(Figures.termsOf(3).total, 120);
});
test('termsOf: the term sizes always add up to the microstate count, and the ground term follows Hund', () => {
  for (let n = 1; n <= 9; n++) { const m = Figures.termsOf(n); assert.equal(m.steps.reduce((a, t) => a + t.N, 0), m.total, `d${n}`); }
  const g = { 1: '2D', 2: '3F', 3: '4F', 4: '5D', 5: '6S', 6: '5D', 7: '4F', 8: '3F', 9: '2D' };
  for (const [n, sym] of Object.entries(g)) assert.equal(Figures.termsOf(Number(n)).ground, sym, `d${n} ground`);
  assert.equal(Figures.termsOf(4).steps.length, 16); assert.equal(Figures.termsOf(5).steps.length, 16); assert.equal(Figures.termsOf(5).total, 252);
});
const ts = JSON.parse(fs.readFileSync(new URL('../public/content/figures/ts.json', import.meta.url), 'utf8'));
test('Tanabe-Sugano data: d3 4T2g is exactly Delta_o above the 4A2g ground (the textbook anchor)', () => {
  const at = Figures.tsAt(ts.ions[3], 10);
  assert.equal(at.ground, '4A2g');
  const t2 = at.allowed.find((c) => c.label === '4T2g'); assert.ok(Math.abs(t2.E - 10) < 0.01, `${t2.E}`);
});
test('Tanabe-Sugano data: grounds and the spin crossovers of d4 to d7 fall where the published diagrams put them', () => {
  const g = (n, x) => Figures.tsAt(ts.ions[n], x).ground;
  assert.equal(g(2, 10), '3T1g'); assert.equal(g(8, 10), '3A2g'); assert.equal(g(7, 10), '4T1g'); assert.equal(g(6, 10), '5T2g'); assert.equal(g(5, 10), '6A1g'); assert.equal(g(4, 10), '5Eg');
  assert.equal(g(7, 30), '2Eg'); assert.equal(g(6, 30), '1A1g'); assert.equal(g(4, 35), '3T1g'); assert.equal(g(5, 35), '2T2g');
  const cross = (n) => ts.ions[n].x[ts.ions[n].ground.findIndex((l) => Number(l[0]) !== Number(ts.ions[n].ground[0][0]))];
  assert.ok(Math.abs(cross(6) - 20.5) < 1.5 && Math.abs(cross(7) - 22) < 1.5 && Math.abs(cross(4) - 27.5) < 1.5 && Math.abs(cross(5) - 28.5) < 1.5);
});
test('Tanabe-Sugano data: the d2 and d8 free-ion limit (small field) has 3P at 15B and 1D at 5B + 2C above the ground', () => {
  const at = Figures.tsAt(ts.ions[2], 0.05);
  const allLv = at.levels.map((l) => [l.label, l.E]);
  const near = (v) => allLv.some(([, E]) => Math.abs(E - v) < 0.2);
  assert.ok(near(15) && near(5 + 2 * 4.42) && near(12 + 2 * 4.42));
});
test('tsSolve: reading a d7-style ratio returns the Delta_o/B that reproduces it', () => {
  const ion = ts.ions[3], at = Figures.tsAt(ion, 22), r = at.allowed[1].E / at.allowed[0].E;
  const sol = Figures.tsSolve(ion, r); assert.ok(sol && Math.abs(sol.x - 22) < 0.3, JSON.stringify(sol));
});
