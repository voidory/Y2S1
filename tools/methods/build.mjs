/* Builds public/content/<dir>/methods.json from tools/methods/<dir>.md.   node tools/methods/build.mjs
   Page format: "=== id | Title | chunk1,chunk2", then optional "flag:" and "summary:" lines, a blank line, then markdown
   (## headings, lists, tables, **bold**). Each page serves the listed topics (chunks of the skill map). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
for (const [dir, module] of [['cm2011', 'CM2011'], ['cm2021', 'CM2021']]) {
  const src = fs.readFileSync(path.join(here, `${dir}.md`), 'utf8');
  const pages = src.split(/^=== /m).slice(1).map((block) => {
    const [head, ...rest] = block.split('\n');
    const [id, title, chunks] = head.split('|').map((x) => x.trim());
    const meta = {};
    let i = 0;
    for (; i < rest.length && rest[i].trim() !== ''; i++) { const m = rest[i].match(/^(flag|summary):\s*(.*)$/); if (m) meta[m[1]] = m[2].trim(); else break; }
    const md = rest.slice(i).join('\n').trim();
    return { id, title, chunks: chunks.split(',').map((c) => c.trim()), ...(meta.flag ? { flag: meta.flag } : {}), summary: meta.summary || '', md };
  });
  const skill = JSON.parse(fs.readFileSync(path.join(root, 'public', 'content', dir, 'skill-map.json'), 'utf8'));
  const known = new Set(skill.chunks.map((c) => c.id));
  const seen = new Set();
  for (const p of pages) {
    if (seen.has(p.id)) throw new Error('duplicate page ' + p.id);
    seen.add(p.id);
    for (const c of p.chunks) if (!known.has(c)) throw new Error(`${dir}/${p.id}: unknown topic ${c}`);
    if (!/^## /m.test(p.md)) throw new Error(`${dir}/${p.id}: no sections`);
  }
  fs.writeFileSync(path.join(root, 'public', 'content', dir, 'methods.json'), JSON.stringify({ version: 1, module, methods: pages }, null, 1) + '\n');
  const covered = new Set(pages.flatMap((p) => p.chunks));
  console.log(`${module}: ${pages.length} method pages cover ${covered.size} of ${known.size} topics`);
}
