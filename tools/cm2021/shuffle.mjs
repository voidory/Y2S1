/* Turns on seeded option shuffling for every choice question in the CM2021 bank.
   The bank was authored with the key first (56 of 84 single-choice keys sat in position 1, and 46 of 48 select-all keys included it),
   so position gave the answer away. Idempotent: run `node tools/cm2021/shuffle.mjs` after adding choice questions.
   Options such as "none of the above" stay last (handled in Scheduler.instantiateVariant). Explanations must name options by their
   content, never by letter, because the order changes every time (tests/content-bundle.test.mjs enforces this). */
import fs from 'node:fs';

const file = 'public/content/cm2021/question-bank.json';
const bank = JSON.parse(fs.readFileSync(file, 'utf8'));
let changed = 0;
for (const n of bank.questionNodes) {
  for (const v of n.variants) {
    if (v.inputSlot?.type === 'choice' && !v.inputSlot.shuffleOptions) { v.inputSlot.shuffleOptions = true; changed++; }
  }
}
if (changed) {
  bank.exportedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(bank, null, 1));
}
console.log(`shuffleOptions turned on for ${changed} choice variants`);
