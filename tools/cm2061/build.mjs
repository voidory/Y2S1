/* Regenerates public/content/cm2061/question-bank.json and skill-map.json.   node tools/cm2061/build.mjs
 *
 * Mark weights follow the plan agreed for CM2061 (sum 100 once every group exists):
 *   unseen-procedure reasoning 30, experiments 22, spectroscopy 20, techniques 11, structures and apparatus 10,
 *   calculations 5, framework and literature 2, e-labs 10 (a seed from one e-lab so far).
 * A group with no content yet is left out and the rest are rescaled to 100, so the planner never sends you to study nothing.
 * Stage 1 builds framework, techniques, spectroscopy, experiments and calculations. Node ids are stable: the app deletes progress
 * for any node that disappears from the bank, so never rename an id once released.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import a from './a-framework.mjs';
import b from './b-techniques.mjs';
import c from './c-spectroscopy.mjs';
import c2 from './c2-databook.mjs';
import d1 from './d1-experiments.mjs';
import d5 from './d5-experiments.mjs';
import d6 from './d6-experiments.mjs';
import g from './g-calcs.mjs';
import h from './h-elabs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '..', '..', 'public', 'content', 'cm2061');

export const GROUP_WEIGHT = { framework: 2, techniques: 11, spectroscopy: 20, experiments: 22, calcs: 5, unseen: 30, structures: 10, elabs: 10 };

const WEEK = { 8: 'H. E-labs', 1: 'A. Course framework, safety and the literature', 2: 'B. Laboratory techniques and apparatus', 3: 'C. Spectroscopy: IR and 1H NMR', 4: 'D. The experiments', 7: 'G. Calculations' };
const CHUNKS = [
  { id: 'fw-method', group: 'framework', name: 'Purification, and synthesise-purify-characterise', summary: 'The four purification methods and when to use each; the three stages; who does what with IR and NMR' },
  { id: 'fw-safety', group: 'framework', name: 'Risk assessment, safety rules and conduct', summary: 'A hazard is a property; goggles, contact lenses, the fume-cupboard sash, dress code, lateness, ethics' },
  { id: 'fw-reports', group: 'framework', name: 'Notebook, reports and the accuracy table', summary: 'Carbon-copy notebook, the one-PDF report, grade weights, decimal places for every quantity' },
  { id: 'fw-lit', group: 'framework', name: 'Journals, citations and databases', summary: 'Publishers, communication / paper / review, ACS citation, SciFinder, Reaxys, Scopus, chemnetbase and formula order' },
  { id: 'tq-tlc', group: 'techniques', name: 'TLC and visualising agents', summary: 'Rf and polarity, ionic compounds, UV, iodine, molybdate, DNP, permanganate' },
  { id: 'tq-heat', group: 'techniques', name: 'Reflux and the rotary evaporator', summary: 'Water in at the bottom, ice-water only for ether, clamp the neck, oil bath; fast rotation, 35-40 °C, less than half full' },
  { id: 'tq-column', group: 'techniques', name: 'Flash column chromatography', summary: 'Packing, sand, never dry, loading, elution order, fractions checked by TLC' },
  { id: 'tq-special', group: 'techniques', name: 'Sublimation, polarimetry and magnetic susceptibility', summary: 'Conditions and shut-down for sublimation; [α]D sample preparation; the susceptibility balance' },
  { id: 'tq-distil', group: 'techniques', name: 'Distillation under reduced pressure and azeotropes', summary: 'Why reduce the pressure, the nomograph, azeotropes, bumping under vacuum' },
  { id: 'tq-isolate', group: 'techniques', name: 'Recrystallisation, filtration, extraction and drying', summary: 'Minimum hot solvent and recovery, Buchner, separatory funnel, brine, Na2SO4 vs MgSO4' },
  { id: 'tq-inert', group: 'techniques', name: 'Drying tubes, oven-dried glassware and the Schlenk line', summary: 'Keeping water and air out without sealing the system' },
  { id: 'tq-apparatus', group: 'techniques', name: 'Flask size, necks and addition funnels', summary: 'Half full or less, how many necks, pressure-equalising funnels' },
  { id: 'sp-ir', group: 'spectroscopy', name: 'IR: nujol and group frequencies', summary: 'Nujol bands to ignore, re-recording, C=O, O-H, NO2 and other key bands' },
  { id: 'sp-nmr-basics', group: 'spectroscopy', name: '1H NMR basics', summary: 'FID and Fourier transform, spin states, instrument frequencies, δ and τ, TMS, solvents' },
  { id: 'sp-shift', group: 'spectroscopy', name: 'Chemical shift', summary: 'Electronegativity, distance, additivity, ring currents and [18]annulene, typical regions' },
  { id: 'sp-coupling', group: 'spectroscopy', name: 'Splitting and coupling constants', summary: 'n+1 rule, Pascal ratios, J and geometry, long-range coupling, methyl crotonate' },
  { id: 'sp-databook', group: 'spectroscopy', name: 'Reading the CBC databook', summary: 'Look up IR ranges, 1H shifts, coupling constants and the methylene additivity rule, as the open-databook exam allows' },
  { id: 'sp-integral', group: 'spectroscopy', name: 'Equivalence, integration and exchange', summary: 'Which protons couple, integrals and mixtures, OH and NH' },
  ...[['1a', '1A paracetamol'], ['1b', '1B phenyl toluene-p-sulfonate'], ['1c', '1C dibenzalacetone'], ['1d', '1D Py2Zn(NCO)2'], ['1e', '1E 1-tosylpyrrole'], ['1f', '1F tetraphenylcyclopentadienone'], ['5a', '5A methyl 3-nitrobenzoate'], ['5b', '5B dinitroveratrole'], ['5c', '5C nitromethylenedioxybenzene'], ['5d', '5D 2-iodobenzoic acid'], ['5e', '5E 2-trifluoroacetylpyrrole'], ['6', '6 reduction of ethyl acetoacetate'], ['7', '7 acetylation of ferrocene and the column'], ['8', '8 siloxanes and bouncing putty'], ['9', '9 Grignard: benzoic acid']]
    .map(([e, name]) => ({ id: `ex-${e}`, group: 'experiments', name: `Expt ${name}`, summary: 'Reaction and roles, work-up and purification, observations, characterisation and what goes wrong' })),
  { id: 'ex-cross', group: 'experiments', name: 'Comparing the experiments', summary: 'Which solvent, which technique and which reaction class belongs to which experiment' },
  { id: 'el-2', group: 'elabs', name: 'E-lab 2: metal chelate, Cr(CO)4(bipy)', summary: 'Hazards, the Schlenk line, the substitution, 18 electrons, IR of the carbonyls (seed from one example screen)' },
  { id: 'calc-mass', group: 'calcs', name: 'Amounts, yields and reagent quantities', summary: 'Volume from density, equivalents, limiting reagent, % yield, NaBH4 hydride' },
  { id: 'calc-spec', group: 'calcs', name: 'Spectroscopy and measurement numbers', summary: '[α]D and ee, spin-only μ, Hz and ppm, integrals, Rf' },
].map((c0) => ({ ...c0, part: null }));

const all = [...a, ...b, ...c, ...c2, ...d1, ...d5, ...d6, ...g, ...h];
const nodes = all.map((x) => x.node);
const ids = new Set();
for (const n of nodes) {
  if (ids.has(n.id)) throw new Error('duplicate node id ' + n.id);
  ids.add(n.id);
  if (!n.metadata.source) throw new Error('no source on ' + n.id);
}
const chunkById = Object.fromEntries(CHUNKS.map((c0) => [c0.id, c0]));
for (const x of all) if (!chunkById[x.skill.chunk]) throw new Error(`unknown chunk ${x.skill.chunk} on ${x.node.id}`);

// skills: one per skill id, holding every node linked to it
const skillMap = new Map();
for (const { node, skill } of all) {
  const marks = node.variants.reduce((s, v) => s + Number(v.marks || 1), 0) / node.variants.length;   // a node is served one variant at a time
  if (!skillMap.has(skill.id)) skillMap.set(skill.id, { id: skill.id, name: skill.name, chunk: skill.chunk, week: node.metadata.week, nodes: [], raw: 0, calc: false });
  const s = skillMap.get(skill.id);
  if (s.chunk !== skill.chunk) throw new Error(`skill ${skill.id} spans chunks ${s.chunk} and ${skill.chunk}`);
  s.nodes.push(node.id);
  s.raw += marks;
  if (node.variants.some((v) => v.variables)) s.calc = true;
}
// group weights, rescaled over the groups that exist
const active = new Set([...skillMap.values()].map((s) => chunkById[s.chunk].group));
const total = [...active].reduce((t, g0) => t + GROUP_WEIGHT[g0], 0);
const groupRaw = {};
for (const s of skillMap.values()) groupRaw[chunkById[s.chunk].group] = (groupRaw[chunkById[s.chunk].group] || 0) + s.raw;
const skills = [...skillMap.values()].map((s) => {
  const g0 = chunkById[s.chunk].group;
  const marks = Number(((GROUP_WEIGHT[g0] / total) * 100 * s.raw / groupRaw[g0]).toFixed(3));
  return { id: s.id, ch: s.week, name: s.name, mode: s.calc ? 'calc' : 'auto', engine: 'gen', marks, basis: 'manual', ref: nodes.find((n) => n.id === s.nodes[0]).metadata.source, tags: [], ids: [s.nodes[0]], weight: 0, nodes: s.nodes, chunk: s.chunk };
});
const sum = skills.reduce((t, s) => t + s.marks, 0);
for (const s of skills) s.weight = Number((s.marks / sum).toFixed(5));
const nodeSkills = Object.fromEntries(all.map(({ node, skill }) => [node.id, [skill.id]]));
const used = new Set(skills.map((s) => s.chunk));
const chunks = CHUNKS.filter((c0) => used.has(c0.id)).map((c0) => ({ id: c0.id, part: WEEK[skills.find((s) => s.chunk === c0.id).ch], name: c0.name, summary: c0.summary }));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'question-bank.json'), JSON.stringify({ bundleVersion: '3.0', exportedAt: new Date().toISOString(), questionNodes: nodes }, null, 1));
fs.writeFileSync(path.join(outDir, 'skill-map.json'), JSON.stringify({ version: '1.0', date: new Date().toISOString().slice(0, 10), module: 'CM2061', chunks, skills, nodeSkills }, null, 1));

const variants = nodes.reduce((t, n) => t + n.variants.length, 0);
const mcqs = nodes.reduce((t, n) => t + n.variants.filter((v) => v.inputSlot.type === 'choice').length, 0);
const byGroup = {};
for (const s of skills) { const g0 = chunkById[s.chunk].group; byGroup[g0] = (byGroup[g0] || 0) + s.marks; }
console.log(`CM2061: ${nodes.length} nodes, ${variants} variants (${mcqs} pick-one), ${skills.length} skills, ${chunks.length} topics`);
console.log('group marks (sum 100):', Object.fromEntries(Object.entries(byGroup).map(([k, v]) => [k, Number(v.toFixed(1))])));
