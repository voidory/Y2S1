/* Writes the CM2061 final-style paper recipe into index.html (between the cm2061-recipe markers in Scheduler.FINAL_RECIPES).
 *   node tools/cm2061/recipe.mjs        (run after build.mjs)
 * Mirrors the exam described on Manual p.14: 40 pick-one questions plus short-answer parts, 2 hours. Each MCQ part draws from its
 * own disjoint pool of questions (round-robin across the topics of a group), so a paper never repeats a question and every sitting
 * differs. Stage 1 has no case chain or structures set yet; recipe sections for them are added when those banks exist.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const bank = JSON.parse(fs.readFileSync(path.join(root, 'public/content/cm2061/question-bank.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(root, 'public/content/cm2061/skill-map.json'), 'utf8'));
const chunkOf = (id) => { const s = map.skills.find((k) => k.nodes.includes(id)); return s.chunk; };
const groupOf = (c) => (/^fw-/.test(c) ? 'fw' : /^tq-/.test(c) ? 'tq' : /^sp-/.test(c) ? 'sp' : /^ex-/.test(c) ? 'ex' : /^calc-/.test(c) ? 'calc' : /^el-/.test(c) ? 'el' : 'other');

const single = (n) => n.variants.every((v) => v.inputSlot.type === 'choice' && v.inputSlot.selectionMode !== 'multi');
const pools = { fw: [], tq: [], sp: [], ex: [], el: [], calc: [], mixed: [] };
for (const n of bank.questionNodes) {
  const g = groupOf(chunkOf(n.id));
  if (g === 'calc') pools.calc.push(n.id);
  else if (single(n)) pools[g].push(n.id);
  else pools.mixed.push(n.id);              // multi-select and ordering items form the short-answer pool
}
// how many MCQ parts per group (about 40): proportional to the agreed weights, with calculations as short answers
const PARTS = { ex: 13, sp: 12, tq: 8, el: 5, fw: 2 };

function split(ids, k) {
  const out = Array.from({ length: k }, () => []);
  ids.forEach((id, i) => out[i % k].push(id));
  return out.filter((p) => p.length);
}
const sections = [];
const mcqParts = [];
for (const [g, k] of Object.entries(PARTS)) mcqParts.push(...split(pools[g], k));
// interleave groups so the paper is not blocked by topic
const byGroup = Object.entries(PARTS).map(([g, k]) => split(pools[g], k));
const interleaved = [];
for (let i = 0; Object.values(byGroup).some((a) => i < a.length); i++) for (const a of byGroup) if (i < a.length) interleaved.push(a[i]);
sections.push({ label: 'Part B · Pick-one questions (1 mark each)', parts: interleaved });
// short answers: two calculation parts and one multi-select / ordering part
const calcA = pools.calc.filter((id) => /equiv|yield|volume|hydride/.test(id));
const calcB = pools.calc.filter((id) => /alpha|mu|spec/.test(id));
sections.push({ label: 'Part A · Short answers: amounts and measurements', parts: [calcA.filter((id) => /equiv|yield/.test(id)), calcA.filter((id) => /volume|hydride/.test(id)), calcB] });
sections.push({ label: 'Part A · Short answers: techniques', parts: split(pools.mixed, 3) });

const nMcq = interleaved.length;
const recipe = `        CM2061: {
          label: 'Final-style paper', durationMinutes: 120, approxMarks: ${nMcq + 14}, sizeLabel: '${nMcq} pick-one + short answers',
          note: 'Built like the exam described on Manual p.14 (2 h, no notes, between 30 and 50 pick-one questions plus short answers). This stage has ${nMcq} pick-one questions and short answers on amounts and techniques; the unseen-procedure case chain and the structures set are added with their banks. Use the CBC databook as in the exam.',
          sections: ${JSON.stringify(sections, null, 0).replace(/"/g, "'")},
        },`;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const a = html.indexOf('/* cm2061-recipe:start');
const b = html.indexOf('/* cm2061-recipe:end */');
if (a < 0 || b < 0) throw new Error('markers missing in index.html');
const startEnd = html.indexOf('*/', a) + 2;
const out = html.slice(0, startEnd) + '\n' + recipe + '\n        ' + html.slice(b);
fs.writeFileSync(path.join(root, 'index.html'), out);
console.log(`CM2061 recipe: ${nMcq} pick-one parts, ${sections[1].parts.length + sections[2].parts.length} short-answer parts`);
