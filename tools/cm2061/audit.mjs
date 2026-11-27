/* Exports a reproducible audit sample for an independent checker (a reader who did not write the items).
 *   node tools/cm2061/audit.mjs <out.md> [--sample 0.25] [--seed 1] [--exclude ids.txt] [--include id1,id2]
 * --include forces nodes into the sample (use it for items that were changed after an earlier audit round, so the fix is re-checked).
 * Sample = a seeded random fraction of all nodes, plus EVERY node in the spectroscopy chunks (sp-*) and, once they exist, the
 * unseen-procedure case chains. Each entry shows the source, the stem, the keyed answer, every distractor and the explanation,
 * so the checker can compare them with the manual page or the cited reference. Pass --exclude to draw a fresh sample after a fix.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const args = process.argv.slice(2);
const out = args[0];
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const frac = Number(opt('--sample', '0.25'));
let seed = Number(opt('--seed', '1'));
const include = new Set(opt('--include') ? opt('--include').split(',') : []);
const exclude = new Set(opt('--exclude') ? fs.readFileSync(opt('--exclude'), 'utf8').split(/\s+/).filter(Boolean) : []);
const bank = JSON.parse(fs.readFileSync(path.join(root, 'public/content/cm2061/question-bank.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(root, 'public/content/cm2061/skill-map.json'), 'utf8'));
const chunkOf = (id) => map.skills.find((s) => s.nodes.includes(id)).chunk;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };

const must = (n) => /^sp-|^case-/.test(chunkOf(n.id));
const chosen = bank.questionNodes.filter((n) => include.has(n.id) || (!exclude.has(n.id) && (must(n) || rnd() < frac)));

function show(n) {
  const lines = [`### ${n.id}  [${chunkOf(n.id)}]  source: ${n.metadata.source}`];
  for (const v of n.variants) {
    lines.push(`**${v.variantId}** (${v.marks} mark${v.marks > 1 ? 's' : ''})`, '', v.stem.replace(/\{\{[^}]+\}\}/g, '‹value›'), '');
    if (v.inputSlot.type === 'choice') {
      const keys = new Set(v.evaluator.targetIds);
      for (const o of v.inputSlot.options) lines.push(`- ${keys.has(o.id) ? '**KEY**' : 'wrong'}: ${o.label}`);
    } else if (v.inputSlot.type === 'ordered_list') {
      lines.push('Correct order: ' + v.evaluator.targetOrder.map((id) => v.inputSlot.items.find((i) => i.id === id).label).join(' → '));
    } else if (v.variables) {
      lines.push('Calculation; fields: ' + Object.entries(v.evaluator.targets).map(([k, t]) => `${k} = ${t.targetExpr || t.expectedExpr}`).join('; '));
      lines.push('Derived: ' + Object.entries(v.variables.derived).map(([k, e]) => `${k} = ${e}`).join('; '));
    }
    lines.push('', 'Explanation: ' + v.explanation.replace(/\n+/g, ' '), '');
  }
  return lines.join('\n');
}
const head = `# CM2061 audit sample\n\n${chosen.length} of ${bank.questionNodes.length} nodes (sample ${frac}, seed ${opt('--seed', '1')}, plus every spectroscopy node).\n\nFor each entry check: (1) is the KEY correct, (2) is every "wrong" option really wrong (and not also defensible), (3) is each stated fact true against the cited manual page or standard reference, (4) does anything claim a manual page that does not say it, (5) is anything marked "Beyond the manual" actually wrong chemistry.\n\n`;
fs.writeFileSync(out, head + chosen.map(show).join('\n---\n\n'));
fs.writeFileSync(out.replace(/\.md$/, '.ids.txt'), chosen.map((n) => n.id).join('\n'));
console.log(`${chosen.length} nodes -> ${out}`);
