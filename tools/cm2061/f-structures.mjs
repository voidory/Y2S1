/* Chunk F: structures and apparatus (draw on paper, then reveal a model answer and tick a checklist). Week 6.
   2015 Q2 asked for ten laboratory chemicals in bond-line notation at two marks each (inorganic ones included), and Q1(a) for a glassware
   sketch. The app cannot grade a drawing, so each item is a self-marked checklist (atomic_rubric) against a model answer.
   Structure grids come from tools/cm2061/structs.py (RDKit, in generated/structures.json); hand-built drawings from figs.mjs. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drawItem } from './lib.mjs';
import { ORGANOMETALLIC, APPARATUS } from './figs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SETS = JSON.parse(fs.readFileSync(path.join(here, 'generated', 'structures.json'), 'utf8'));
const W = 6;
const items = [];
const add = (x) => items.push(x);

const ST = { week: W, chunk: 'st-structures', skill: 'st.bondline', skillName: 'Bond-line structures of the laboratory chemicals' };
const AP = (id, name) => ({ week: W, chunk: 'st-apparatus', skill: `st.app.${id}`, skillName: name });

const SET_ORDER = [
  ['solvents', 'bk-c61-f-set-solvents'], ['inorganic', 'bk-c61-f-set-inorganic'], ['inorganic2', 'bk-c61-f-set-inorganic2'],
  ['reagents1', 'bk-c61-f-set-reagents1'], ['products1', 'bk-c61-f-set-products1'], ['products2', 'bk-c61-f-set-products2'], ['products3', 'bk-c61-f-set-products3'], ['extras', 'bk-c61-f-set-extras'],
];
for (const [key, id] of SET_ORDER) {
  const s = SETS[key];
  const names = s.items.map((it, i) => `(${String.fromCharCode(97 + i)}) ${it.name}`).join('; ');
  add(drawItem({
    id, ...ST, source: 'Manual pp.29-51 (the chemicals named in the experiments, plus the common laboratory solvents and reagents the 2015 paper drew); 2015 paper style (Q2: ten chemicals, bond-line notation)',
    stem: `Using bond-line notation, draw the structure of each of these laboratory chemicals on paper (inorganic ones as you would in a lab report: show charges, counter-ions and double bonds to oxygen). When you have finished, reveal the model answers and mark yourself, 2 marks for each: ${names}.`,
    items: s.items.map((it, i) => [`(${String.fromCharCode(97 + i)}) ${it.name}: ${it.desc}`, 2]),
    figure: s.svg, caption: `${s.title}: model answers`,
    explanation: `Two marks per structure: one for the correct skeleton and connectivity, one for the functional groups, charges and (where asked) stereochemistry. Draw rings as polygons, carbon and hydrogen on carbon implied, heteroatoms and the hydrogens on them shown. Inorganic species follow the same rules: sulfate and nitrate show formal charges, hydrides and cations are written as ions.`,
    tags: [s.title], diff: 2,
  }));
}
add(drawItem({
  id: 'bk-c61-f-set-organometallic', ...ST, source: 'Manual pp.32, 43 (Py2Zn(NCO)2 and the ferrocenes); E-lab 2 (Cr carbonyls)',
  stem: `Draw these organometallic and coordination compounds on paper, then reveal the model answers: ${ORGANOMETALLIC.items.map((it, i) => `(${String.fromCharCode(97 + i)}) ${it.name}`).join('; ')}. Mark yourself, 2 marks each.`,
  items: ORGANOMETALLIC.items.map((it, i) => [`(${String.fromCharCode(97 + i)}) ${it.name}: ${it.desc}`, 2]),
  figure: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.5rem">${ORGANOMETALLIC.items.map((it, i) => `<figure style="margin:0"><div>${it.svg}</div><figcaption style="text-align:center;font-size:12px">(${String.fromCharCode(97 + i)}) ${it.name}</figcaption></figure>`).join('')}</div>`,
  caption: 'Organometallic and coordination compounds: model answers',
  explanation: 'A metal complex is drawn with the metal at the centre and every donor atom bonded to it. In ferrocene the two C5H5 rings are parallel with Fe between them; in Py2Zn(NCO)2 the isocyanate binds through nitrogen; Cr(CO)6 is octahedral with carbon-bound CO, and bipy chelates through both nitrogens.',
  tags: ['Organometallic and coordination compounds'], diff: 3,
}));

// ---------- apparatus ----------
const APP = [
  ['reflux', 'Reflux apparatus', 'Expts 1E, 1F, 9 (Manual pp.24-25, 33, 34, 49-51); 2015 paper Q1(a) and Q24 (glassware sketch, clamp position)',
    'Sketch the apparatus for heating a reaction mixture in ethanol at reflux, as you would for the first step of a procedure. Label the water connections and show where the clamp goes. Then reveal the model answer and tick what you drew.',
    ['A round-bottom flask holding liquid that fills less than half of it', 'A vertical condenser fitted directly to the flask neck', 'Cooling water enters at the BOTTOM of the condenser', 'Cooling water leaves at the TOP', 'The top of the condenser is open (not stoppered): an open system', 'The clamp holds the NECK of the flask, not the condenser', 'An oil bath (or heater) with the oil level below the liquid level in the flask', 'A stir bar or anti-bumping granules is shown', 'Every part and the direction of water flow is labelled'],
    'Reflux keeps a solvent at its boiling point while the condenser returns the vapour. Water goes in at the bottom so the jacket fills; the system is open so no pressure builds; the flask is clamped at its neck; an oil bath, not direct heat, is used with a stir bar or granules to prevent bumping.'],
  ['addition', 'Addition funnel with a drying tube', 'Expt 5E (Manual p.39); 2015 paper style (set-up sketches)',
    'Sketch the set-up for adding a pyrrole solution dropwise to trifluoroacetic anhydride in dichloromethane, protected from moisture, then reveal the model answer.',
    ['A dried round-bottom flask holding the anhydride solution, with an ice bath', 'A stir bar (oven-dried) in the flask', 'An addition funnel fitted to the flask neck holding the pyrrole solution', 'The funnel stopcock is shown (closed at the start)', 'A drying tube on top of the funnel, open to the air', 'The system is open through the drying tube, not sealed', 'The flask is clamped at its neck', 'Every part is labelled'],
    'The funnel meters in the second reagent. A drying tube keeps atmospheric moisture away from a moisture-sensitive anhydride while leaving the system open, which avoids pressure build-up.'],
  ['vacdist', 'Distillation under reduced pressure', 'Manual p.4 (video); 2015 paper Q9, Q23 (reduced-pressure distillation, short-path head)',
    'Sketch a distillation under reduced pressure (a short-path or simple still head), showing the thermometer, the water connections and the vacuum connection. Then reveal the model answer.',
    ['A round-bottom flask with a stir bar and a heating bath (not more than half full)', 'A still head with the thermometer bulb level with the side-arm opening', 'A condenser with water in at the LOW end and out at the HIGH end', 'A receiving flask, cooled', 'A vacuum connection at the receiver end leading to a cold trap and pump', 'Joints greased; the vacuum is applied before heating', 'A stir bar rather than boiling chips', 'Every part is labelled'],
    'Lowering the pressure lowers the boiling point. The thermometer must read the temperature of the vapour passing to the condenser; boiling chips do not work under vacuum so a stir bar is used; joints are greased and the vacuum is applied before heating.'],
  ['grignard', 'Grignard apparatus on a Schlenk line', 'Expt 9 (Manual pp.49-51); the open-versus-closed contrast with a drying tube',
    'Sketch the apparatus for making phenylmagnesium bromide from magnesium and bromobenzene in ether, under nitrogen. Show the glassware, how the reagent is added and how the apparatus is connected to the Schlenk line. Then reveal the model answer.',
    ['An oven-dried two-neck flask containing magnesium, dry ether and a stir bar', 'A pressure-equalising addition funnel holding bromobenzene in ether', 'A septum on the funnel (reagent injected through it, stopcock closed)', 'A reflux condenser on the second neck', 'Water in at the bottom and out at the top of the condenser', 'A take-off adapter at the top of the condenser connecting to the vacuum-nitrogen manifold', 'This is a CLOSED system under inert gas (contrast with an open system with a drying tube)', 'Every part is labelled'],
    'All glassware is oven-dried and assembled hot, then evacuated and refilled with nitrogen. The pressure-equalising funnel lets the liquid run in a closed system. Unlike a drying-tube set-up, the system is closed to the air and connected to inert gas.'],
  ['sublimation', 'Sublimation apparatus', 'Expt 5E (Manual p.39)',
    'Sketch the apparatus for purifying 2-trifluoroacetylpyrrole by sublimation under vacuum. Show where the solid starts, where it collects and the connections. Then reveal the model answer.',
    ['An outer tube holding the crude solid at the bottom', 'A cold finger (inner tube) with ice-cold water in and out', 'A side arm or vertical tube connected to the vacuum pump (about 6 mmHg)', 'A greased joint holding the vacuum', 'Gentle heating from below (not above 50 °C)', 'The purified solid collects on the cold finger', 'Every part is labelled'],
    'The solid passes directly into vapour under reduced pressure and re-forms as crystals on the cold surface, leaving non-volatile impurities behind. At the end: remove the heat, switch off the cooling water, release the vacuum, then scrape out the solid.'],
  ['column', 'Flash column', 'Expt 7 (Manual pp.44-46)',
    'Sketch a flash chromatography column as set up in Expt 7, showing the packing from the bottom up, the solvent and the air-pump connection. Then reveal the model answer.',
    ['A column with a stopcock at the bottom', 'A plug of cotton wool just above the stopcock (not packed too tightly)', 'A layer of sand over the cotton wool', 'The silica bed, packed as a slurry, with the solvent level always above it', 'A solvent reservoir above the column', 'An air-pump adapter on top, held by a clip', 'Test tubes below collecting fractions in order', 'Every part is labelled'],
    'Packing from the bottom: cotton wool, a little sand, silica slurry in hexane. Never let the silica run dry. Gentle air pressure drives the eluent; fractions are collected in order and checked by TLC.'],
  ['sepfunnel', 'Separatory funnel extraction', 'Expts 5E, 6, 8 (Manual pp.39, 41, 47)',
    'Sketch a separatory funnel during an extraction of an aqueous mixture with dichloromethane, then draw it again with diethyl ether. Show which layer is on top in each case and how it is supported. Then reveal the model answer.',
    ['The funnel supported in a ring clamp on a stand', 'A stopper on top and a stopcock at the bottom', 'Two layers drawn, with the denser layer at the bottom', 'Dichloromethane (density about 1.3) forms the LOWER layer', 'Diethyl ether (density about 0.7) forms the UPPER layer, above the water', 'A flask or beaker below to receive the layer drained through the stopcock', 'Both layers are kept until the product is found'],
    'Densities decide the layers: dichloromethane is denser than water, diethyl ether and hexane are less dense. Shake, vent through the stopcock, and remove the stopper before draining.'],
];
for (const [key, name, src, stem, rubric, expl] of APP) {
  add(drawItem({
    id: `bk-c61-f-app-${key}`, ...AP(key, name), source: src, stem, items: rubric.map((r) => [r, 1]), figure: APPARATUS[key].svg, caption: `${name}: model answer (schematic)`, explanation: expl, tags: [name], diff: 3,
  }));
}

export default items;
