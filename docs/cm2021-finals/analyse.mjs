/*
 * Tallies the hand-coded CM2021 final-exam dataset (dataset.csv) and prints markdown tables.
 *   node docs/cm2021-finals/analyse.mjs
 * Each row is one printed part of a final. `skills` lists the app skills it exercises (joined by +);
 * a part's marks are split equally over its skills, then each skill is rolled up to its chunk through
 * public/content/cm2021/skill-map.json, so the shares are comparable with the weights the app uses today.
 * `template` is the recurring question family (my coding), `kind` what the student has to do.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const lines = fs.readFileSync(path.join(here, 'dataset.csv'), 'utf8').trim().split('\n');
const head = lines.shift().split(',');
const rows = lines.map((l) => {
  const c = l.split(',');
  const r = Object.fromEntries(head.map((h, i) => [h, c[i]]));
  r.marks = Number(r.marks);
  r.skillList = r.skills.split('+');
  return r;
});
const map = JSON.parse(fs.readFileSync(path.join(root, 'public/content/cm2021/skill-map.json'), 'utf8'));
const bank = JSON.parse(fs.readFileSync(path.join(root, 'public/content/cm2021/question-bank.json'), 'utf8')).questionNodes;
const skillById = Object.fromEntries(map.skills.map((s) => [s.id, s]));
const chunkById = Object.fromEntries(map.chunks.map((c) => [c.id, c]));

const PAPERS = ['2023-24', '2024-25', '2025-26'];
const sum = (a) => a.reduce((x, y) => x + y, 0);
const f1 = (x) => (Math.round(x * 10) / 10).toString();
const pct = (x, t = 1) => `${(100 * x / t).toFixed(0)}%`;
const out = [];
const p = (s = '') => out.push(s);
const table = (headers, body) => {
  p(`| ${headers.join(' | ')} |`);
  p(`|${headers.map(() => '---').join('|')}|`);
  for (const r of body) p(`| ${r.join(' | ')} |`);
  p();
};

// unknown skill ids would silently vanish from the tallies: stop instead
for (const r of rows) for (const s of r.skillList) if (!skillById[s]) throw new Error(`unknown skill ${s} in ${r.paper} Q${r.q}${r.part}`);

// marks per (paper, skill) and (paper, chunk)
const skillMarks = {}; // paper -> skill -> marks
for (const r of rows) {
  for (const s of r.skillList) {
    const m = (skillMarks[r.paper] ||= {});
    m[s] = (m[s] || 0) + r.marks / r.skillList.length;
  }
}
const chunkMarks = (paper) => {
  const m = {};
  for (const [s, v] of Object.entries(skillMarks[paper] || {})) m[skillById[s].chunk] = (m[skillById[s].chunk] || 0) + v;
  return m;
};

// 1. validation
p('## Check: question totals');
table(['Paper', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'], PAPERS.map((y) => {
  const qs = [1, 2, 3, 4].map((q) => sum(rows.filter((r) => r.paper === y && Number(r.q) === q).map((r) => r.marks)));
  return [y, ...qs, sum(qs)];
}));

// 2. which lecturer's chapters (the skill map's chunk part)
p('## Marks by lecturer part (Kinjo Ch 1-5, Hiang Kwee Ch 6-9)');
const partOf = (chunk) => (chunkById[chunk].part.startsWith('Kinjo') ? 'Kinjo (Ch 1-5)' : 'Hiang Kwee (Ch 6-9)');
table(['Paper', 'Kinjo (Ch 1-5)', 'Hiang Kwee (Ch 6-9)'], PAPERS.map((y) => {
  const cm = chunkMarks(y);
  const k = sum(Object.entries(cm).filter(([c]) => partOf(c).startsWith('Kinjo')).map(([, v]) => v));
  return [y, f1(k), f1(100 - k)];
}));

// 3. themes
const THEME = {
  'lewis-bonding': 'Bonding and MO', vsepr: 'Bonding and MO', 'imf-solids': 'Bonding and MO', 'periodic-trends': 'Bonding and MO', 'mo-diatomic': 'Bonding and MO', 'mo-polyatomic': 'Bonding and MO', delocalised: 'Bonding and MO',
  'reaction-toolkit': 'Main-group chemistry', hydrogen: 'Main-group chemistry', 's-block': 'Main-group chemistry', 'group13-14': 'Main-group chemistry', 'group15-18': 'Main-group chemistry',
  naming: 'Coordination (Ch 6-7)', isomerism: 'Coordination (Ch 6-7)', stability: 'Coordination (Ch 6-7)', 'bonding-models': 'Coordination (Ch 6-7)', 'field-energetics': 'Coordination (Ch 6-7)',
  'magnetism-colour': 'Terms, TS, spectra (Ch 8)', 'terms-ts': 'Terms, TS, spectra (Ch 8)', kinetics: 'Kinetics (Ch 9)',
};
const THEMES = [...new Set(Object.values(THEME))];
p('## Marks by theme (of 100)');
table(['Theme', ...PAPERS, 'Mean'], THEMES.map((t) => {
  const v = PAPERS.map((y) => sum(Object.entries(chunkMarks(y)).filter(([c]) => THEME[c] === t).map(([, x]) => x)));
  return [t, ...v.map(f1), f1(sum(v) / 3)];
}));

// 4. chunk shares vs what the app weights today
p('## Marks per chunk against the app\'s current weight');
const nodeCount = {};
const nodeMinutes = {};
const nodeById = Object.fromEntries(bank.map((n) => [n.id, n]));
for (const c of map.chunks) {
  const ids = new Set(map.skills.filter((s) => s.chunk === c.id).flatMap((s) => s.nodes || []));
  nodeCount[c.id] = ids.size;
  nodeMinutes[c.id] = sum([...ids].map((id) => Number(nodeById[id]?.metadata?.estimatedMinutes || 3)));
}
const curW = {};
for (const s of map.skills) curW[s.chunk] = (curW[s.chunk] || 0) + s.weight;
const exam = {};
for (const c of map.chunks) exam[c.id] = sum(PAPERS.map((y) => chunkMarks(y)[c.id] || 0)) / 3;
const rowsC = map.chunks.map((c) => ({ id: c.id, exam: exam[c.id], cur: curW[c.id] * 100, n: nodeCount[c.id], min: nodeMinutes[c.id] }));
rowsC.sort((a, b) => b.exam - a.exam || b.cur - a.cur);
table(['Chunk', 'Mean marks / 100', 'App weight today', 'Nodes', 'Minutes per pass', 'Marks per hour of a pass'], rowsC.map((r) => [r.id, f1(r.exam), `${f1(r.cur)}%`, r.n, Math.round(r.min), f1(r.exam / (r.min / 60))]));
p('Minutes per pass add the bank\'s own time estimate for every node in the chunk; a node mapped to skills in two chunks is counted in both, so the column sums to more than the bank total.');
p();
const zero = rowsC.filter((r) => r.exam === 0);
p(`Chunks with no marks in any of the three finals: ${zero.map((r) => r.id).join(', ')} (${f1(sum(zero.map((r) => r.cur)))}% of today's weight, ${sum(zero.map((r) => r.n))} nodes, about ${Math.round(sum(zero.map((r) => r.min)) / 60 * 10) / 10} h per pass).`);
p();
const examSkillsW = sum(map.skills.filter((s) => PAPERS.some((y) => skillMarks[y]?.[s.id])).map((s) => s.weight));
p(`Share of today's weight that sits on skills no final has tested: ${pct(1 - examSkillsW)} (the skill-map marks total ${sum(map.skills.map((s) => s.marks))}, not 100).`);
p();

// 5. templates
p('## Templates by paper (marks)');
const TEMPLATES = [...new Set(rows.map((r) => r.template))];
const tm = (y, t) => sum(rows.filter((r) => r.paper === y && r.template === t).map((r) => r.marks));
table(['Template', ...PAPERS], TEMPLATES.map((t) => [t, ...PAPERS.map((y) => tm(y, t) || '·')]));
p('### Marks whose template or chunk was already in an earlier paper');
table(['Paper', 'Same template as an earlier paper', 'Chunk already examined earlier', 'Chunk not seen before'], PAPERS.slice(1).map((y, i) => {
  const earlier = PAPERS.slice(0, i + 1);
  const seenT = new Set(rows.filter((r) => earlier.includes(r.paper)).map((r) => r.template));
  const seenC = new Set(earlier.flatMap((e) => Object.keys(chunkMarks(e))));
  const t = sum(rows.filter((r) => r.paper === y && seenT.has(r.template)).map((r) => r.marks));
  const cm = chunkMarks(y);
  const cOld = sum(Object.entries(cm).filter(([c]) => seenC.has(c)).map(([, v]) => v));
  return [y, `${f1(t)} of 100`, `${f1(cOld)} of 100`, `${f1(100 - cOld)} of 100`];
}));

// 6. what the student has to do
p('## What the student has to do (marks of 100)');
const KINDS = [...new Set(rows.flatMap((r) => r.kind.split('+')))];
const kShare = (y) => KINDS.map((k) => sum(rows.filter((r) => r.paper === y).flatMap((r) => (r.kind.split('+').includes(k) ? [r.marks / r.kind.split('+').length] : []))));
table(['Paper', ...KINDS], PAPERS.map((y) => [y, ...kShare(y).map(f1)]));
p(`Parts per paper: ${PAPERS.map((y) => `${y} ${rows.filter((r) => r.paper === y).length}`).join(', ')}. Part sizes (marks): ${[...new Set(rows.map((r) => r.marks))].sort((a, b) => a - b).join(', ')}.`);
p();

// 7. a proposed re-weighting: evidence share blended with today's weights on skills no final has tested
p('## Proposed chunk weights (evidence first, a floor for untested material)');
const LAMBDA = 0.2;
const untested = map.skills.filter((s) => !PAPERS.some((y) => skillMarks[y]?.[s.id]));
const untestedW = {};
for (const s of untested) untestedW[s.chunk] = (untestedW[s.chunk] || 0) + s.weight;
const untestedTot = sum(Object.values(untestedW));
const prop = {};
for (const c of map.chunks) prop[c.id] = (1 - LAMBDA) * (exam[c.id] / 100) + LAMBDA * ((untestedW[c.id] || 0) / untestedTot);
table(['Chunk', 'Evidence share', 'Proposed weight', 'App weight today'], rowsC.map((r) => [r.id, `${f1(r.exam)}%`, `${f1(prop[r.id] * 100)}%`, `${f1(r.cur)}%`]));
p(`Blend: ${100 - LAMBDA * 100}% the mean share of marks in the three finals, ${LAMBDA * 100}% spread over skills no final has tested in proportion to today's weights. The ${LAMBDA * 100}% is a judgement (with CM2011's 11 finals, 0-22% of a paper's marks sat in families new to the set; three papers see less of the range).`);

console.log(out.join('\n'));
