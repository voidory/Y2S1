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
