/* Draw-on-paper items for CM2021: the finals ask for diagrams (the d-orbital splitting for given complexes in 2025-26 Q3(a), MO diagrams in 2023-24 and
   2024-25), and a typed field cannot rehearse that. Each variant is `drawOnPaperThenCompare` with an `atomic_rubric`: the student draws on paper, then ticks the
   points of the marking checklist they drew, so they see which marks they would have lost. Two nodes:
     bk-c7-draw-split  (skills c7.splitting, c7.cfse)       d-orbital splitting diagrams with the electrons and the CFSE
     bk-c3-draw-mo     (skills c3.diatomic, c3.hetero-diatomic, c3.polyatomic, c3.lgo)   MO diagrams
   Run: node tools/cm2021/draw.mjs   — rewrites the two nodes in question-bank.json and their skill links in skill-map.json. */
import fs from 'node:fs';
import { FIGS_BY_VARIANT } from './figs.mjs';

const DIR = 'public/content';
const crit = (list) => list.map(([criterion, marks, isCritical], i) => ({ id: `r${i + 1}`, criterion, marks, isCritical: Boolean(isCritical) }));
const sum = (list) => list.reduce((a, [, m]) => a + m, 0);
const variant = (id, label, stem, rubric, explanation, hint) => ({
  variantId: id,
  perspectiveLabel: label,
  marks: sum(rubric),
  stem,
  ...(hint ? { hint } : {}),
  explanation,
  drawOnPaperThenCompare: true,
  inputSlot: { type: 'typed_synthesis', placeholder: 'Write the key points (or tick the box if you answered on paper)…', minWordsToUnlockRubric: 0, allowPaperScratchpad: true },
  evaluator: { type: 'atomic_rubric', rubric: crit(rubric) },
});

const split = [
  variant('c7-draw-split-mno4', 'KMnO₄ (d⁰, tetrahedral)',
    'Draw the d-orbital splitting diagram for the metal in KMnO₄ (assume tetrahedral or octahedral, as appropriate). Label the orbital sets, show the electrons and give the CFSE.',
    [['Oxidation state Mn(VII), so d⁰; four oxide donors, so tetrahedral', 1, true], ['Two sets drawn with the gap labelled Δt: e (d_z², d_x²−y²) lower and t₂ (d_xy, d_xz, d_yz) upper', 1.5, true], ['e BELOW t₂ (the inverse of octahedral), centred on the free-ion level', 1, false], ['No d electrons shown; CFSE = 0', 1, true]],
    'Mn(VII) is d⁰. Four donors give a tetrahedron: e below t₂ with gap Δt (about 4/9 Δo). With no d electrons there is nothing to stabilise, CFSE = 0. (The purple colour is a ligand-to-metal charge transfer, not a d–d band.)'),
  variant('c7-draw-split-croxalate', 'K[Cr(H₂O)₂(ox)₂] (d³, octahedral)',
    'Draw the d-orbital splitting diagram for K[Cr(H₂O)₂(C₂O₄)₂]·3H₂O. Label the orbital sets, show the electrons and give the CFSE.',
    [['Cr(III), d³, six donors (two H₂O and two bidentate oxalates), so octahedral', 1, true], ['t₂g (d_xy, d_xz, d_yz) LOWER by 0.4 Δo and e_g (d_z², d_x²−y²) UPPER by 0.6 Δo, gap Δo labelled', 1.5, true], ['Three electrons in three separate t₂g orbitals, parallel spins (Hund); e_g empty', 1.5, true], ['CFSE = 3 × (−0.4 Δo) = −1.2 Δo (no pairing either way)', 1, true]],
    'd³ in an octahedron: t₂g³ e_g⁰, three unpaired electrons, CFSE = −1.2 Δo. Weak or strong field makes no difference for d³.'),
  variant('c7-draw-split-niamine', '[Ni(NH₃)Cl(NH₂CH₃)₂]Cl (d⁸, four donors)',
    'Draw the d-orbital splitting diagram for the metal in [Ni(NH₃)Cl(NH₂CH₃)₂]Cl (assume tetrahedral or octahedral, as appropriate). Label the orbital sets, show the electrons and give the CFSE.',
    [['Ni(II), d⁸; four donors (NH₃, Cl⁻ and two NH₂CH₃), so tetrahedral', 1, true], ['e (lower, −0.6 Δt) and t₂ (upper, +0.4 Δt) drawn and labelled with the gap Δt', 1.5, true], ['Eight electrons: e⁴ t₂⁴, with the last two electrons in separate t₂ orbitals (two unpaired)', 1.5, true], ['CFSE = 4(−0.6) + 4(+0.4) = −0.8 Δt', 1, true]],
    'Four donors means a tetrahedron when the question says to choose between tetrahedral and octahedral. Fill e then t₂: e⁴ t₂⁴ puts two electrons singly in t₂ (paramagnetic). CFSE = −0.8 Δt.'),
  variant('c7-draw-split-fe-d6', 'd⁶: [Fe(H₂O)₆]²⁺ and [Fe(CN)₆]⁴⁻ side by side',
    'Draw the splitting diagrams for [Fe(H₂O)₆]²⁺ and [Fe(CN)₆]⁴⁻ side by side. Show the electrons, say which is high spin and which low spin, and give each CFSE.',
    [['Both Fe(II), d⁶, octahedral; the ligand sets the size of Δo (H₂O weak, CN⁻ strong)', 1, true], ['H₂O: Δo smaller than the pairing energy P, so t₂g⁴ e_g² (four unpaired, high spin); CFSE = 4(−0.4) + 2(+0.6) = −0.4 Δo', 2, true], ['CN⁻: Δo larger than P, so t₂g⁶ (no unpaired, low spin, diamagnetic); CFSE = −2.4 Δo + 2P', 2, true], ['States the rule: electrons pair before occupying e_g only when Δo > P', 1, false]],
    'Same metal ion and d count; only the ligands change Δo. Weak field: spread the electrons (Δo < P). Strong field: pair first (Δo > P). The low-spin d⁶ ion has two more pairs than the high-spin one, hence the 2P.'),
  variant('c7-draw-split-sqplanar', 'Square planar d⁸: [Ni(CN)₄]²⁻',
    'Draw the d-orbital splitting for square-planar [Ni(CN)₄]²⁻ and fill in the electrons. Why is it diamagnetic?',
    [['Ni(II) d⁸ with four strong-field CN⁻ donors in the xy plane, so square planar (a tetragonal distortion of octahedral with the axial ligands removed)', 1, true], ['Order from the top: d_x²−y² (points at the ligands) ≫ d_xy > d_z² > d_xz, d_yz (lowest, degenerate pair)', 2, true], ['Eight electrons fill the four lower orbitals in pairs; d_x²−y² empty', 1.5, true], ['No unpaired electrons: diamagnetic, because the large gap above the fourth orbital outweighs the pairing energy', 0.5, false]],
    'The ligands lie on x and y, so d_x²−y² is far above the rest. Eight electrons pair in d_xz, d_yz, d_z² and d_xy, which is why d⁸ strong-field complexes are square planar and diamagnetic.'),
  variant('c7-draw-split-jt', 'Jahn–Teller: [Cu(H₂O)₆]²⁺ (d⁹)',
    'Draw the d-orbital splitting of [Cu(H₂O)₆]²⁺ including the tetragonal (Jahn–Teller) distortion. Show the electrons and say why the distortion lowers the energy.',
    [['Cu(II), d⁹: t₂g⁶ e_g³, an unevenly filled e_g set', 1, true], ['Elongation along z: d_z² drops and d_x²−y² rises (e_g splits); d_xz, d_yz drop and d_xy rises (t₂g splits)', 2, true], ['Electrons: (d_xz,d_yz)⁴ (d_xy)² (d_z²)² (d_x²−y²)¹, one unpaired', 1, true], ['Net stabilisation comes from e_g (two electrons lowered by δ/2, one raised by δ/2); the filled t₂g set gives none', 1, false]],
    'An uneven e_g occupation (d⁹, and high-spin d⁴) is removed by distorting the octahedron. The d_z² pair is lowered and the single d_x²−y² electron raised, so there is a net energy gain.'),
];

const mo = [
  variant('c3-draw-mo-n2o2', 'N₂ and O₂ (s–p mixing)',
    'Draw the valence MO diagrams of N₂ and O₂ (include the effect of s–p mixing where it applies). Give each bond order and say whether it is paramagnetic.',
    [['Atomic 2s and 2p columns each side with the eight MOs between them: σ2s, σ*2s, π2p, σ2p, π*2p, σ*2p', 1.5, true], ['N₂ (s–p mixing): π2p BELOW σ2p; 10 valence electrons give bond order 3, diamagnetic', 1.5, true], ['O₂ (no mixing): σ2p BELOW π2p; 12 valence electrons fill up to π*2p', 1.5, true], ['O₂: two unpaired electrons in the degenerate π*2p pair (parallel), bond order 2, paramagnetic', 1.5, true]],
    's–p mixing pushes σ2p up when the 2s–2p gap is small (up to N₂); from O₂ on, the gap is large and σ2p lies below π2p. Bond order = (bonding − antibonding)/2.'),
  variant('c3-draw-mo-co', 'CO',
    'Draw the valence MO diagram of CO. Show which orbitals are the HOMO and LUMO and where they sit, and give the bond order.',
    [['Atomic orbitals offset: O lower than C (more electronegative)', 1, true], ['Ten valence electrons fill σ(2s), σ*(2s), the two π bonds and the σ(2p); bond order 3', 1.5, true], ['HOMO is the σ orbital, mainly on carbon (the carbon lone pair)', 1, true], ['LUMO is the degenerate π* pair, mainly on carbon', 1, true], ['Binding to a metal: σ donation from the C lone pair, π back-donation into π*', 0.5, false]],
    'Because the HOMO is mostly a carbon lone pair, CO binds through C. The empty π* orbitals accept electron density back from the metal, which strengthens M–C and weakens C–O.'),
  variant('c3-draw-mo-ml6', 'Octahedral ML₆ (σ only)',
    'Draw the σ-only MO diagram of an octahedral complex ML₆. Label the metal and ligand-group orbitals by symmetry and show where Δo appears.',
    [['Metal orbitals: 4s (a₁g), 4p (t₁u), 3d split into e_g and t₂g', 1, true], ['Six ligand group orbitals (σ): a₁g + t₁u + e_g', 1, true], ['Bonding MOs a₁g, t₁u, e_g (mostly ligand, twelve ligand electrons); antibonding a₁g*, t₁u*, e_g*', 1.5, true], ['t₂g non-bonding (metal d only), with the metal d electrons going into t₂g and e_g*', 1.5, true], ['Δo = the gap between t₂g and e_g*', 1, true]],
    'Only e_g (d_z², d_x²−y²) points at the ligands, so only e_g can mix with the ligand a₁g/t₁u/e_g group orbitals; t₂g stays non-bonding. The t₂g–e_g* gap is Δo, which is why CFT and LFT give the same splitting pattern.'),
  variant('c3-draw-mo-h2o', 'H₂O',
    'Draw the valence MO diagram of H₂O (bent, C₂v) and show its electrons.',
    [['O 2s, 2p and the two H 1s group orbitals (a₁ and b₂) combine', 1, true], ['Bonding MOs: 1a₁ (mostly O 2s), 1b₂, 2a₁; antibonding 3a₁* and 2b₂*', 1.5, true], ['1b₁ is a non-bonding pure O 2p orbital (out of the molecular plane): the HOMO', 1.5, true], ['Eight valence electrons fill 1a₁, 1b₂, 2a₁, 1b₁', 1, false]],
    'The H 1s group orbitals have a₁ and b₂ symmetry; the O 2p_x (out of plane) has b₁ symmetry and no partner, so it stays non-bonding. That is the second lone pair seen in photoelectron spectra.'),
];

const NODES = [
  {
    schemaVersion: '3.0', id: 'bk-c7-draw-split', moduleCode: 'CM2021', tier: 'synthesis',
    metadata: { title: 'Draw it: d-orbital splitting with the electrons and the CFSE', source: 'Template of 2025-26 Q3(a) (splitting diagram and CFSE of a given complex); draw on paper, then tick the marking points', week: 7, primaryTheme: 'Crystal Field Theory', conceptTags: ['cfse-calculation', 'd-orbital-splitting'], difficultyEstimate: 5, estimatedMinutes: 4, examStyle: 'construct_4to6', family: 'draw-split' },
    variants: split,
  },
  {
    schemaVersion: '3.0', id: 'bk-c3-draw-mo', moduleCode: 'CM2021', tier: 'synthesis',
    metadata: { title: 'Draw it: MO diagrams', source: 'Template of 2023-24 Q2(d) and 2024-25 Q2(a); draw on paper, then tick the marking points', week: 3, primaryTheme: 'Molecular Orbital Theory', conceptTags: ['mo-diagram', 'bond-order'], difficultyEstimate: 6, estimatedMinutes: 5, examStyle: 'construct_4to6', family: 'draw-mo' },
    variants: mo,
  },
];
for (const n of NODES) for (const v of n.variants) if (FIGS_BY_VARIANT[v.variantId]) v.comparisonVisualAsset = FIGS_BY_VARIANT[v.variantId];   // reference picture shown beside the marking points
const LINKS = { 'bk-c7-draw-split': ['c7.splitting', 'c7.cfse'], 'bk-c3-draw-mo': ['c3.diatomic', 'c3.hetero-diatomic', 'c3.polyatomic', 'c3.lgo'] };

if (process.argv[1].endsWith('draw.mjs')) {
  const bankPath = `${DIR}/cm2021/question-bank.json`, mapPath = `${DIR}/cm2021/skill-map.json`;
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  bank.questionNodes = bank.questionNodes.filter((n) => !LINKS[n.id]).concat(NODES);
  bank.exportedAt = new Date().toISOString();
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 1));
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  for (const [nid, skills] of Object.entries(LINKS)) {
    for (const sk of map.skills) sk.nodes = sk.nodes.filter((id) => id !== nid);
    for (const sid of skills) map.skills.find((k) => k.id === sid).nodes.push(nid);
    map.nodeSkills[nid] = skills;
  }
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 1));
  console.log('wrote', NODES.map((n) => `${n.id}: ${n.variants.length} variants`).join('; '));
}
export { NODES };
