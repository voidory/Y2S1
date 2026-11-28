"""Bond-line structure sets for CM2061 (draw on paper, then reveal).

   python3 tools/cm2061/structs.py        (needs RDKit: pip install rdkit)

Writes tools/cm2061/generated/structures.json: for each set an SVG grid of the model answers (labelled a, b, c ...) and a short
word description of each structure for the self-marked checklist. The Node build reads that file, so `node tools/cm2061/build.mjs`
stays offline and RDKit is only needed when a structure changes. Organometallic and apparatus drawings are hand-built in
tools/cm2061/figs.mjs, because RDKit cannot draw sandwich or octahedral complexes in the textbook way.
Sets follow the 2015 paper's pattern (ten chemicals, two marks each); every reagent, solvent and product named in the manual is
in a set (except sugars and enzyme material, which are not drawn in the course).
"""
import json, os, re, sys
from rdkit import Chem
from rdkit.Chem import Draw
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Chem import rdDepictor
rdDepictor.SetPreferCoordGen(True)   # cleaner layouts for oxoanions such as permanganate

HERE = os.path.dirname(os.path.abspath(__file__))

# (name, SMILES, description for the checklist)
SETS = {
    'solvents': ('Common solvents and laboratory chemicals', [
        ('pyridine', 'c1ccncc1', 'a six-membered aromatic ring containing one nitrogen'),
        ('ethyl acetate', 'CCOC(C)=O', 'CH3-C(=O)-O-CH2CH3: an acetyl group joined through oxygen to an ethyl group'),
        ('acetone', 'CC(C)=O', 'a carbonyl carbon carrying two methyl groups'),
        ('acetic acid', 'CC(=O)O', 'CH3 on a carbon that is C=O and OH'),
        ('diethyl ether', 'CCOCC', 'an oxygen joined to two ethyl groups'),
        ('dichloromethane', 'ClCCl', 'one carbon carrying two chlorines (and two hydrogens)'),
        ('toluene', 'Cc1ccccc1', 'a benzene ring with one methyl group'),
        ('hexane', 'CCCCCC', 'an unbranched chain of six carbons'),
        ('tetrahydrofuran', 'C1CCOC1', 'a saturated five-membered ring of four carbons and one oxygen'),
        ('ethanol', 'CCO', 'a two-carbon chain ending in OH'),
    ]),
    'inorganic': ('Inorganic laboratory chemicals', [
        ('sodium sulfate', '[Na+].[Na+].[O-]S(=O)(=O)[O-]', 'sulfate (S with two S=O and two O-) with two Na+ counter-ions'),
        ('nitric acid', 'O[N+](=O)[O-]', 'N with OH, one N=O and one O- (formal charges N+ and O-)'),
        ('hydrogen peroxide', 'OO', 'two oxygens joined by a single bond, each with one hydrogen (HO-OH)'),
        ('dimethyldichlorosilane', 'C[Si](C)(Cl)Cl', 'silicon bearing two methyl and two chlorine substituents'),
        ('sulfuric acid', 'OS(=O)(=O)O', 'sulfur with two S=O and two OH groups'),
        ('sodium borohydride', '[Na+].[BH4-]', 'a tetrahedral BH4- anion with a Na+ counter-ion'),
        ('carbon dioxide', 'O=C=O', 'a linear molecule, O=C=O'),
        ('phosphoric acid', 'OP(O)(O)=O', 'phosphorus with one P=O and three OH groups'),
        ('boric oxide', 'O=BOB=O', 'two borons joined by an oxygen bridge, each also with a B=O'),
        ('sodium cyanate', '[Na+].[O-]C#N', 'a Na+ counter-ion with the cyanate anion, OCN-'),
    ]),
    'inorganic2': ('More inorganic reagents', [
        ('zinc nitrate', '[Zn+2].[O-][N+]([O-])=O.[O-][N+]([O-])=O', 'Zn2+ with two nitrate anions'),
        ('sodium nitrite', '[Na+].[O-]N=O', 'Na+ with the nitrite anion O=N-O-'),
        ('potassium iodide', '[K+].[I-]', 'K+ and I-'),
        ('hydrochloric acid', 'Cl', 'H-Cl'),
        ('iodine', 'II', 'two iodine atoms joined by a single bond'),
        ('ammonium chloride', '[NH4+].[Cl-]', 'a tetrahedral NH4+ cation with Cl-'),
        ('magnesium sulfate', '[Mg+2].[O-]S(=O)(=O)[O-]', 'Mg2+ with the sulfate anion'),
        ('sodium bicarbonate', '[Na+].OC([O-])=O', 'Na+ with hydrogencarbonate: C with one C=O, one O- and one OH'),
        ('potassium hydroxide', '[K+].[OH-]', 'K+ with HO-'),
        ('potassium permanganate', '[K+].[O-][Mn](=O)(=O)=O', 'K+ with the permanganate anion: Mn with three Mn=O and one Mn-O-'),
    ]),
    'reagents1': ('Reagents of Experiments 1A to 1F', [
        ('4-aminophenol', 'Nc1ccc(O)cc1', 'a benzene ring with NH2 and OH para to each other'),
        ('acetic anhydride', 'CC(=O)OC(C)=O', 'two acetyl groups joined through one oxygen'),
        ('phenol', 'Oc1ccccc1', 'a benzene ring with one OH'),
        ('p-toluenesulfonyl chloride (TsCl)', 'Cc1ccc(S(=O)(=O)Cl)cc1', 'a benzene ring with CH3 and SO2Cl para to each other'),
        ('benzaldehyde', 'O=Cc1ccccc1', 'a benzene ring carrying CHO'),
        ('2,5-dimethoxytetrahydrofuran', 'COC1CCC(OC)O1', 'a saturated five-membered ring with one oxygen and OCH3 groups on both carbons next to that oxygen'),
        ('p-toluenesulfonamide', 'Cc1ccc(S(N)(=O)=O)cc1', 'a benzene ring with CH3 and SO2NH2 para to each other'),
        ('benzil', 'O=C(C(=O)c1ccccc1)c1ccccc1', 'two C=O groups joined directly, each carrying a phenyl'),
        ('1,3-diphenylacetone', 'O=C(Cc1ccccc1)Cc1ccccc1', 'a C=O flanked by two CH2 groups, each carrying a phenyl'),
        ('pyrrole', 'c1cc[nH]c1', 'a five-membered aromatic ring of four carbons and an NH'),
    ]),
    'products1': ('Products and starting materials of Experiments 1 and 5', [
        ('paracetamol', 'CC(=O)Nc1ccc(O)cc1', 'a benzene ring with OH and an NHC(=O)CH3 amide, para to each other'),
        ('phenyl toluene-p-sulfonate', 'Cc1ccc(S(=O)(=O)Oc2ccccc2)cc1', 'a tolyl-SO2 group joined through oxygen to a phenyl ring'),
        ('dibenzalacetone', 'O=C(C=Cc1ccccc1)C=Cc1ccccc1', 'a C=O with a CH=CH-phenyl on each side'),
        ('1-(p-toluenesulfonyl)pyrrole', 'Cc1ccc(S(=O)(=O)n2cccc2)cc1', 'a tolyl-SO2 group on the nitrogen of a pyrrole ring'),
        ('tetraphenylcyclopentadienone', 'O=C1C(c2ccccc2)=C(c2ccccc2)C(c2ccccc2)=C1c1ccccc1', 'a five-membered ring with a C=O and two C=C, each ring carbon (other than C=O) carrying a phenyl'),
        ('methyl benzoate', 'COC(=O)c1ccccc1', 'a benzene ring carrying CO2CH3'),
        ('methyl 3-nitrobenzoate', 'COC(=O)c1cccc([N+](=O)[O-])c1', 'a benzene ring with CO2CH3 and NO2 meta to each other'),
        ('1,2-dimethoxybenzene (veratrole)', 'COc1ccccc1OC', 'a benzene ring with two OCH3 groups on adjacent carbons'),
        ('1,2-dimethoxy-4,5-dinitrobenzene', 'COc1cc([N+](=O)[O-])c([N+](=O)[O-])cc1OC', 'a benzene ring with two adjacent OCH3 and two adjacent NO2 groups, on the other four carbons'),
        ('1,3-benzodioxole (methylenedioxybenzene)', 'C1Oc2ccccc2O1', 'a benzene ring fused to a five-membered ring O-CH2-O'),
    ]),
    'products2': ('Experiments 5C to 6', [
        ('5-nitro-1,3-benzodioxole', 'O=[N+]([O-])c1ccc2OCOc2c1', 'the benzodioxole with one NO2 on the benzene ring, para to one ring oxygen'),
        ('anthranilic acid (2-aminobenzoic acid)', 'Nc1ccccc1C(=O)O', 'a benzene ring with NH2 and CO2H on adjacent carbons'),
        ('2-iodobenzoic acid', 'OC(=O)c1ccccc1I', 'a benzene ring with I and CO2H on adjacent carbons'),
        ('trifluoroacetic anhydride', 'O=C(OC(=O)C(F)(F)F)C(F)(F)F', 'two CF3-C(=O) groups joined through one oxygen'),
        ('2-trifluoroacetylpyrrole', 'O=C(c1ccc[nH]1)C(F)(F)F', 'a pyrrole ring (with NH) carrying C(=O)CF3 on the carbon next to nitrogen'),
        ('ethyl acetoacetate', 'CCOC(=O)CC(C)=O', 'CH3-C(=O)-CH2-C(=O)-O-CH2CH3'),
        ('ethyl (S)-3-hydroxybutanoate', 'CCOC(=O)C[C@H](C)O', 'CH3-CH(OH)-CH2-CO2Et, with the stereocentre drawn as (S) (wedge or dash)'),
        ('disodium hydrogen phosphate', '[Na+].[Na+].OP([O-])([O-])=O', 'phosphorus with one P=O, one OH and two O- groups, with two Na+'),
        ('bromobenzene', 'Brc1ccccc1', 'a benzene ring with one Br'),
        ('phenylmagnesium bromide', 'Br[Mg]c1ccccc1', 'a benzene ring with an Mg-Br group bonded to carbon'),
    ]),
    'extras': ('Other chemicals named in the experiments', [
        ('sodium hydroxide', '[Na+].[OH-]', 'Na+ with HO-'),
        ('methanol', 'CO', 'CH3 on OH (a one-carbon chain ending in OH)'),
        ('water', 'O', 'H-O-H (a bent molecule with two O-H bonds)'),
        ('magnesium', '[Mg]', 'a single Mg atom (the metal used in Expt 9)'),
        ('sodium hydrogen sulfite (bisulfite)', '[Na+].OS([O-])=O', 'S with one S=O, one OH and one O-, with Na+'),
        ('sodium chloride', '[Na+].[Cl-]', 'Na+ and Cl-'),
        ('sodium carbonate', '[Na+].[Na+].[O-]C([O-])=O', 'a carbon with one C=O and two O-, with two Na+'),
        ('dimethylsilanediol (hydrolysis of Me2SiCl2)', 'C[Si](C)(O)O', 'silicon with two methyl and two OH groups'),
        ('hexamethylcyclotrisiloxane (a cyclic product of Expt 8)', 'C[Si]1(C)O[Si](C)(C)O[Si](C)(C)O1', 'a six-membered ring of alternating Si and O, each Si carrying two methyl groups'),
        ('calcium chloride (the drying-tube desiccant)', '[Ca+2].[Cl-].[Cl-]', 'Ca2+ with two Cl-'),
    ]),
    'products3': ('Experiments 7 to 9 and the work-up', [
        ('benzoic acid', 'OC(=O)c1ccccc1', 'a benzene ring carrying CO2H'),
        ('biphenyl', 'c1ccc(cc1)-c1ccccc1', 'two benzene rings joined by one C-C bond'),
        ('poly(dimethylsiloxane) repeat unit', '*O[Si](C)(C)*', 'a chain of alternating Si and O, each Si carrying two methyl groups'),
        ('silicon dioxide (silica)', 'O=[Si]=O', 'Si joined to two oxygens by double bonds'),
        ('sodium acetate', '[Na+].CC([O-])=O', 'CH3 on a carboxylate carbon (C=O and O-) with Na+'),
        ('acetylacetone (pentane-2,4-dione, keto form)', 'CC(=O)CC(C)=O', 'CH3-C(=O)-CH2-C(=O)-CH3'),
    ]),
}


def clean(svg):
    svg = re.sub(r'<\?xml[^>]*\?>\s*', '', svg)
    svg = re.sub(r'<rect style=\'opacity:1\.0;fill:#FFFFFF;stroke:none\'[^>]*/>\s*', '', svg, count=1)
    svg = re.sub(r"(<svg[^>]*?)\swidth='\d+px'\sheight='\d+px'", r'\1 style="width:100%;height:auto"', svg, count=1)
    return svg.strip()


out = {}
for key, (title, items) in SETS.items():
    mols, legends = [], []
    for i, (name, smi, desc) in enumerate(items):
        m = Chem.MolFromSmiles(smi)
        assert m is not None, f'bad SMILES {name}: {smi}'
        if name == 'ethyl (S)-3-hydroxybutanoate':
            cip = Chem.FindMolChiralCenters(m, useLegacyImplementation=False)
            assert cip and cip[0][1] == 'S', f'wrong stereo {cip}'
        mols.append(m)
        legends.append(f'({chr(97 + i)}) {name}')
    n = len(mols)
    per_row = 5 if n > 6 else 3
    svg = Draw.MolsToGridImage(mols, molsPerRow=per_row, subImgSize=(250, 190), legends=legends, useSVG=True)
    svg = clean(svg if isinstance(svg, str) else svg.data)
    out[key] = {'title': title, 'svg': svg, 'items': [{'name': a, 'smiles': b, 'desc': c} for a, b, c in items]}
os.makedirs(os.path.join(HERE, 'generated'), exist_ok=True)
with open(os.path.join(HERE, 'generated', 'structures.json'), 'w', encoding='utf8') as f:
    json.dump(out, f, ensure_ascii=False)
print({k: (len(v['items']), len(v['svg']) // 1000) for k, v in out.items()}, 'KB')
