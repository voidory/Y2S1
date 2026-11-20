/* Regenerates public/content/cm2011/question-bank.json and skill-map.json.   node tools/cm2011/build.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import t1 from './t1.mjs';
import e3a from './e3a.mjs';
import p3b from './p3b.mjs';
import s4 from './s4.mjs';
import f5 from './f5.mjs';
import g5 from './g5.mjs';
import x6 from './x6.mjs';
import t7 from './t7.mjs';
import a8 from './a8.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '..', '..', 'public', 'content', 'cm2011');

const CHUNKS = [
  { id: 't1-stats', part: 'Topic 1: Errors & confidence intervals', name: 'Statistics and uncertainty', summary: 'Mean, s, %RSD, Q-test, confidence interval, t-tests, error propagation' },
  { id: 'a-psi', part: 'Topic 2: Air pollution in Singapore', name: 'PSI and air quality', summary: 'Sub-index from a 24-hour concentration, overall PSI, descriptors, breathing and cigarette equivalents, 24-hour versus 1-hour' },
  { id: 't1-quant', part: 'Topic 1: Errors & confidence intervals', name: 'Units, dilutions & Kjeldahl', summary: 'ppm and molarity, dilution factors, Kjeldahl nitrogen and adulterants' },
  { id: 'e-activity', part: 'Topic 3a: Electrochemistry', name: 'Ionic strength and activity', summary: 'I, extended Debye–Hückel γ, activities' },
  { id: 'e-nernst', part: 'Topic 3a: Electrochemistry', name: 'Nernst equation and cells', summary: 'Half-cells and cells with activities, spontaneity, Ksp → E°, ΔG and K' },
  { id: 'p-principles', part: 'Topic 3b: Potentiometry', name: 'How the electrodes work', summary: 'Glass electrode, junction potential, cell notation, written explanations' },
  { id: 'p-types', part: 'Topic 3b: Potentiometry', name: 'Membrane types and probes', summary: 'Glass, LaF₃, Ag₂S, PVC; gas-sensing probes; TISAB' },
  { id: 'p-calibration', part: 'Topic 3b: Potentiometry', name: 'Slope, calibration and readings', summary: 'Nernstian slope by charge, reading an unknown, calibration procedure' },
  { id: 'p-selectivity', part: 'Topic 3b: Potentiometry', name: 'Interferents and selectivity', summary: 'Selectivity coefficient, size of an interference error' },
  { id: 's-absorption', part: 'Topic 4: Spectroscopy', name: 'Absorption spectroscopy', summary: 'Beer–Lambert, %T, dilutions, unit conversions, instrument layout' },
  { id: 's-fluorescence', part: 'Topic 4: Spectroscopy', name: 'Fluorescence', summary: 'Stokes shift, 90° geometry, sensitivity, layout' },
  { id: 's-atomic', part: 'Topic 4: Spectroscopy', name: 'Atomic spectroscopy', summary: 'AAS components, lamps, atomisers, Boltzmann populations, line widths, ICP' },
  { id: 'x-calc', part: 'Extraction', name: 'Extraction calculations: D at a pH, fraction left, number of portions', summary: 'Acid and base D(pH), fraction left when the solute starts in either phase, repeated extractions' },
  { id: 'x-concepts', part: 'Extraction', name: 'Extraction concepts and conventions', summary: 'Which pH leaves more behind, several small portions, K vs D, which fraction formula' },
  { id: 'g-gc', part: 'GC and HPLC', name: 'GC: columns, programming, injection, carrier gas', summary: 'Open tubular vs packed, temperature and pressure programming, split/splitless/on-column, derivatisation, carrier gases' },
  { id: 'g-detect', part: 'GC and HPLC', name: 'GC detectors and coupling to MS', summary: 'TCD, FID, MS; GC–MS vs LC–MS; what HPLC suits' },
  { id: 'g-hplc', part: 'GC and HPLC', name: 'HPLC: columns, modes, elution order, detection', summary: 'Column label, C18/C8, normal vs reversed phase, elution order, isocratic vs gradient, detectors, particle size, choosing GC or HPLC' },
];

const all = [...t1, ...t7, ...a8, ...e3a, ...p3b, ...s4, ...f5, ...g5, ...x6];
const nodes = all.map((x) => x.node);
const ids = new Set();
for (const n of nodes) { if (ids.has(n.id)) throw new Error('duplicate node id ' + n.id); ids.add(n.id); }

// Skill marks follow the shape of the final (docs/cm2011-finals/analysis.md): a 4 x 25 paper whose first half (Q1-Q2) splits
// statistics 19%, electrochemistry 20%, potentiometry 28%, spectroscopy 26% (Topic 2 PSI 3.5), Q3 extraction 25, Q4 GC/HPLC 25.
// Within a block the authored marks keep their relative sizes; the whole map is scaled to 100.
const BLOCK_OF = (c) => ({ t: 'stats', a: 'air', e: 'elec', p: 'ise', s: 'spec', x: 'extr', g: 'gc' })[c[0]];
const BLOCK_MARKS = { stats: 9.5, air: 3.5, elec: 10, ise: 14, spec: 13, extr: 25, gc: 25 };
const blockSum = {};
for (const x of all) blockSum[BLOCK_OF(x.skill.chunk)] = (blockSum[BLOCK_OF(x.skill.chunk)] || 0) + x.skill.marks;
const blockTotal = Object.values(BLOCK_MARKS).reduce((a, b) => a + b, 0);
for (const x of all) { const b = BLOCK_OF(x.skill.chunk); x.skill = { ...x.skill, marks: Number(((BLOCK_MARKS[b] / blockTotal) * 100 * x.skill.marks / blockSum[b]).toFixed(3)) }; }
const totalMarks = all.reduce((a, x) => a + x.skill.marks, 0);
const skills = all.map(({ node, skill }) => ({
  id: skill.id, ch: node.metadata.week, name: skill.name, mode: node.variants.some((v) => v.variables) ? 'calc' : 'recall', engine: 'gen',
  marks: skill.marks, basis: 'notes', ref: node.metadata.source, tags: skill.tags || [],
  ids: [node.id], weight: Number((skill.marks / totalMarks).toFixed(5)), nodes: [node.id], chunk: skill.chunk,
}));
const nodeSkills = Object.fromEntries(all.map(({ node, skill }) => [node.id, [skill.id]]));
const used = new Set(skills.map((s) => s.chunk));
const chunks = CHUNKS.filter((c) => used.has(c.id));
for (const s of skills) if (!CHUNKS.some((c) => c.id === s.chunk)) throw new Error('unknown chunk ' + s.chunk);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'question-bank.json'), JSON.stringify({ bundleVersion: '3.0', exportedAt: new Date().toISOString(), questionNodes: nodes }, null, 1));
fs.writeFileSync(path.join(outDir, 'skill-map.json'), JSON.stringify({ version: '1.0', date: new Date().toISOString().slice(0, 10), module: 'CM2011', chunks, skills, nodeSkills }, null, 1));
console.log(`CM2011: ${nodes.length} questions, ${nodes.reduce((a, n) => a + n.variants.length, 0)} variants, ${skills.length} skills, ${chunks.length} topics`);
