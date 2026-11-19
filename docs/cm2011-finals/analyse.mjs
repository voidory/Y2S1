/*
 * Tallies the hand-coded first-half CM2011 final-exam dataset (dataset.csv) and prints markdown tables.
 *   node docs/cm2011-finals/analyse.mjs
 * Every row is one sub-question of a past final. `macro` is the lecture block, `template` the recurring
 * question family, `kind` what the student has to do. NE rows were marked NOT EXAMINABLE in the files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const lines = fs.readFileSync(path.join(here, 'dataset.csv'), 'utf8').trim().split('\n');
const head = lines.shift().split(',');
const rows = lines.map((l) => {
  const c = l.split(',');
  const r = Object.fromEntries(head.map((h, i) => [h, c[i]]));
  r.marks = Number(r.marks);
  return r;
});

const PAPERS = ['2009-10', '2010-11', '2011-12', '2014-15', '2015-16', '2017-18', '2019-20', '2021-22', '2023-24', '2024-25', '2025-26'];
const ERA_A = PAPERS.slice(0, 5);
const ERA_B = PAPERS.slice(5);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const pct = (x, t) => (t ? `${((100 * x) / t).toFixed(0)}%` : '-');
const by = (arr, f) => arr.reduce((m, r) => ((m[f(r)] ||= []).push(r), m), {});
const out = [];
const p = (s = '') => out.push(s);
const table = (headers, body) => {
  p(`| ${headers.join(' | ')} |`);
  p(`|${headers.map(() => '---').join('|')}|`);
  for (const r of body) p(`| ${r.join(' | ')} |`);
  p();
};

// 1. validation
p('## Check: every question sums to 25');
const bad = [];
for (const [k, g] of Object.entries(by(rows, (r) => `${r.paper} Q${r.q}`))) if (sum(g.map((r) => r.marks)) !== 25) bad.push(`${k}=${sum(g.map((r) => r.marks))}`);
p(bad.length ? `Mismatches: ${bad.join(', ')}` : `All ${new Set(rows.map((r) => r.paper + r.q)).size} questions sum to 25 (${sum(rows.map((r) => r.marks))} marks, ${PAPERS.length} papers).`);
p();

const live = rows.filter((r) => r.flag !== 'NE');
const neMarks = sum(rows.filter((r) => r.flag === 'NE').map((r) => r.marks));
p(`Marks flagged NOT EXAMINABLE in the files: ${neMarks} of ${sum(rows.map((r) => r.marks))} (${pct(neMarks, sum(rows.map((r) => r.marks)))}).`);
p();

// 2. macro share
const MACROS = ['STAT', 'AIR', 'ELEC', 'ISE', 'SPEC'];
const MACRO_NAME = { STAT: 'Topic 1 statistics and uncertainty', AIR: 'Topic 2 air quality (PSI)', ELEC: 'Topic 3a electrochemistry', ISE: 'Topic 3b potentiometry / ISE', SPEC: 'Topic 4 spectroscopy' };
p('## Marks by lecture block (live questions only, out of 50 per paper)');
const share = (set) => {
  const rs = live.filter((r) => set.includes(r.paper));
  const tot = sum(rs.map((r) => r.marks));
  return MACROS.map((m) => sum(rs.filter((r) => r.macro === m).map((r) => r.marks)) / tot);
};
const sA = share(ERA_A), sB = share(ERA_B), sAll = share(PAPERS);
table(['Block', 'All 11', '2009-15 (5)', '2017-26 (6)'], MACROS.map((m, i) => [MACRO_NAME[m], `${(sAll[i] * 100).toFixed(0)}%`, `${(sA[i] * 100).toFixed(0)}%`, `${(sB[i] * 100).toFixed(0)}%`]));

p('### Per paper (marks of 50)');
table(['Paper', ...MACROS, 'NE'], PAPERS.map((y) => {
  const g = rows.filter((r) => r.paper === y);
  return [y, ...MACROS.map((m) => sum(g.filter((r) => r.macro === m && r.flag !== 'NE').map((r) => r.marks))), sum(g.filter((r) => r.flag === 'NE').map((r) => r.marks))];
}));

// 3. kind
p('## What the student has to do (live marks)');
const KINDS = ['calc', 'graph', 'convert', 'explain', 'rationale', 'diagram'];
const kshare = (set) => {
  const rs = live.filter((r) => set.includes(r.paper));
  const tot = sum(rs.map((r) => r.marks));
  return KINDS.map((k) => pct(sum(rs.filter((r) => r.kind === k).map((r) => r.marks)), tot));
};
table(['Era', ...KINDS], [['All 11', ...kshare(PAPERS)], ['2009-15', ...kshare(ERA_A)], ['2017-26', ...kshare(ERA_B)]]);
const partSize = (set) => {
  const rs = live.filter((r) => set.includes(r.paper));
  return { n: rs.length / (set.length * 2), mean: sum(rs.map((r) => r.marks)) / rs.length, big: rs.filter((r) => r.marks >= 10).length };
};
const pa = partSize(ERA_A), pb = partSize(ERA_B);
p(`Parts per question: 2009-15 ${pa.n.toFixed(1)}, 2017-26 ${pb.n.toFixed(1)}. Mean part size: ${pa.mean.toFixed(1)} vs ${pb.mean.toFixed(1)} marks. Parts of 10+ marks: ${pa.big} vs ${pb.big}.`);
p();

// 4. templates
p('## Question families (templates)');
const TEMPLATES = by(live, (r) => r.template);
const trows = Object.entries(TEMPLATES).map(([t, g]) => {
  const papers = [...new Set(g.map((r) => r.paper))];
  const perPaper = papers.map((y) => sum(g.filter((r) => r.paper === y).map((r) => r.marks)));
  const inB = papers.filter((y) => ERA_B.includes(y)).length;
  const last = PAPERS.filter((y) => papers.includes(y)).pop();
  return { t, macro: g[0].macro, n: papers.length, inB, mean: sum(perPaper) / papers.length, max: Math.max(...perPaper), total: sum(perPaper), last };
}).sort((a, b) => b.total - a.total);
table(['Family', 'Block', 'Papers (of 11)', 'Of last 6', 'Marks when present (mean / max)', 'Total marks', 'Last seen'],
  trows.map((r) => [r.t, r.macro, r.n, r.inB, `${r.mean.toFixed(1)} / ${r.max}`, r.total, r.last]));

// 4b. presence matrix
p('## Marks per family per paper (· = absent)');
const short = PAPERS.map((y) => y.slice(2, 4));
table(['Family', ...short], trows.map((r) => [r.t, ...PAPERS.map((y) => {
  const m = sum(live.filter((x) => x.paper === y && x.template === r.t).map((x) => x.marks));
  return m ? String(m) : '·';
})]));

// 5. recycling
p('## How much of each paper is a family seen in an earlier paper of this set');
const seen = new Set();
const rec = PAPERS.map((y) => {
  const g = live.filter((r) => r.paper === y);
  const tot = sum(g.map((r) => r.marks));
  const old = sum(g.filter((r) => seen.has(r.template)).map((r) => r.marks));
  const fresh = [...new Set(g.filter((r) => !seen.has(r.template)).map((r) => r.template))];
  g.forEach((r) => seen.add(r.template));
  return [y, tot, pct(old, tot), fresh.join(', ') || '-'];
});
table(['Paper', 'Live marks', 'Recycled share', 'Families new to the set'], rec);

// 6. t-test timeline
p('## The two-method t-test in every paper');
table(['Paper', 'Test (P = paired, U = pooled) and level', 'Marks'], PAPERS.map((y) => {
  const r = live.find((x) => x.paper === y && x.template === 'S-T2');
  return [y, r.sub, r.marks];
}));

// 7. fixed pairings
p('## Pairings');
const has = (y, t) => live.some((r) => r.paper === y && r.template === t);
const pair = (a, b) => PAPERS.filter((y) => has(y, a) && has(y, b)).join(', ') || '-';
p(`- S-T2 with C-FREE (free vs total follow-up): ${pair('S-T2', 'C-FREE')}`);
p(`- S-T2 with A-PSI: ${pair('S-T2', 'A-PSI')}`);
p(`- S-PROP and B-CONV in the same paper: ${pair('S-PROP', 'B-CONV')}`);
p(`- Papers with S-PROP: ${PAPERS.filter((y) => has(y, 'S-PROP')).join(', ')}`);
p(`- Papers with B-CONV: ${PAPERS.filter((y) => has(y, 'B-CONV')).join(', ')}`);
p();

// 8. blocks present per paper
p('## Blocks that get 5 or more marks in a paper');
table(['Block', 'Papers with 5+ marks (of 11)', 'Of last 6', 'Papers with 0 live marks'], MACROS.map((m) => {
  const marks = PAPERS.map((y) => sum(live.filter((r) => r.paper === y && r.macro === m).map((r) => r.marks)));
  return [MACRO_NAME[m], marks.filter((x) => x >= 5).length, marks.slice(5).filter((x) => x >= 5).length, PAPERS.filter((_, i) => marks[i] === 0).join(', ') || '-'];
}));
const nb = PAPERS.map((y) => MACROS.filter((m) => sum(live.filter((r) => r.paper === y && r.macro === m).map((r) => r.marks)) >= 5).length);
p(`Blocks with 5+ marks per paper: ${nb.join(', ')} (mean ${(sum(nb) / nb.length).toFixed(1)} of 5).`);
const nf = PAPERS.map((y) => new Set(live.filter((r) => r.paper === y).map((r) => r.template)).size);
p(`Distinct families per paper: ${nf.join(', ')}.`);
p();

// 9. core families
p('## Marks in families that appeared in at least 4 of the last 6 papers');
const core = trows.filter((r) => r.inB >= 4).map((r) => r.t);
p(`Core families: ${core.join(', ')}`);
p(ERA_B.map((y) => {
  const g = live.filter((r) => r.paper === y);
  return `${y}: ${sum(g.filter((r) => core.includes(r.template)).map((r) => r.marks))}/${sum(g.map((r) => r.marks))}`;
}).join('; '));
p();
const kindOf = (set, k) => sum(live.filter((r) => set.includes(r.paper) && r.kind === k).map((r) => r.marks));
p(`Written marks (explain + rationale + diagram) per paper: ${PAPERS.map((y) => sum(['explain', 'rationale', 'diagram'].map((k) => kindOf([y], k)))).join(', ')} of 50.`);
p();

console.log(out.join('\n'));
