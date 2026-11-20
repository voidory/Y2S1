/*
 * Re-cuts the CM2021 skill marks from the three finals (docs/cm2021-finals): 70% the mean share of marks in the finals,
 * 30% spread over skills no final has tested, in proportion to their current marks. Marks are scaled to total 100 and
 * weight = marks / total (the content test requires this). Safe to re-run: the result does not depend on the starting scale.
 *   node tools/cm2021/reweight.mjs
 */
import fs from 'node:fs';
const file = 'public/content/cm2021/skill-map.json';
const map = JSON.parse(fs.readFileSync(file, 'utf8'));
const rows = fs.readFileSync('docs/cm2021-finals/dataset.csv', 'utf8').trim().split('\n').slice(1).map((l) => l.split(','));
const tested = {};
for (const r of rows) { const ks = r[4].split('+'); for (const k of ks) tested[k] = (tested[k] || 0) + Number(r[3]) / ks.length; }
const known = new Set(map.skills.map((s) => s.id));
for (const k of Object.keys(tested)) if (!known.has(k)) throw new Error('unknown skill ' + k);
const untested = map.skills.filter((s) => !tested[s.id]);
const uSum = untested.reduce((a, s) => a + s.marks, 0);
for (const s of map.skills) {
  s.marks = Number((100 * (0.7 * ((tested[s.id] || 0) / 300) + 0.3 * (tested[s.id] ? 0 : s.marks / uSum))).toFixed(3));
}
const total = map.skills.reduce((a, s) => a + s.marks, 0);
for (const s of map.skills) s.weight = Number((s.marks / total).toFixed(5));
fs.writeFileSync(file, JSON.stringify(map, null, 1) + '\n');
console.log(`CM2021 skill marks re-cut: total ${total.toFixed(2)}, ${untested.length} untested skills share 30%`);
