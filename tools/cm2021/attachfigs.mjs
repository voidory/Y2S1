/* Attach the reference pictures from figs.mjs to the draw-on-paper variants (by variantId) in the CM2021 bank. Idempotent. Needed for variants that live in
   hand-written nodes; the generated ones (draw.mjs, kinjo.mjs, kinjo5.mjs) also attach their own when they run, so run this last.
   Run: node tools/cm2021/attachfigs.mjs */
import fs from 'node:fs';
import { FIGS_BY_VARIANT } from './figs.mjs';

const path = 'public/content/cm2021/question-bank.json';
const bank = JSON.parse(fs.readFileSync(path, 'utf8'));
let n = 0;
for (const node of bank.questionNodes) for (const v of node.variants) if (FIGS_BY_VARIANT[v.variantId]) { v.comparisonVisualAsset = FIGS_BY_VARIANT[v.variantId]; n++; }
bank.exportedAt = new Date().toISOString();
fs.writeFileSync(path, JSON.stringify(bank, null, 1));
console.log(`attached ${n} reference pictures (${Object.keys(FIGS_BY_VARIANT).length} defined)`);
