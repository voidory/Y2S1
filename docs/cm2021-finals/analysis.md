# CM2021 finals: what the three papers show

Written 19 Nov 2026. Numbers come from `dataset.csv` (one hand-coded row per printed part) through `analyse.mjs`; re-run `node docs/cm2021-finals/analyse.mjs` after changing either. Tags: **[data]** counted from the papers, **[inference]** my reading, **[advice]** my recommendation. Question text is paraphrased, not copied.

## 0. What the data is, and is not

- **Three finals: 2023-24, 2024-25, 2025-26** (the only ones the owner holds), 12 questions, 300 marks. They are scans with no text layer, read page by page. Every question sums to its printed total (25 / 25 / 30 / 20), which is the check that I read each part and its marks correctly.
- The skill map (`public/content/cm2021/skill-map.json`) already cites these papers as P1, P2, P3 (for example "P1 Q4 d7", "P2 Q4 d4", "P3 Q4 d8", which match the figures and questions here), so the app's CM2021 marks were built from them. This analysis checks and quantifies that; it is not a new source.
- **Coding is mine.** A "template" is a recurring question type; each part is mapped to the app's skills (marks split equally when a part needs several outputs, for example identify the metal + name it + LFSE) and rolled up to the app's 20 chunks. n = 3: these are base rates, not forecasts.

## 1. Format [data]

- NTU Semester I, **2 hours, four compulsory questions, 100 marks, closed book**, each question on a fresh page. That is 1.2 minutes a mark.
- The Chemistry Databook "may be used as reference material" in 2023-24 and 2024-25. The 2025-26 cover says closed book only and supplies a periodic table (Annex A) instead. The owner confirms the Databook is always allowed.
- Identical skeleton in all three years: **Q1 = five 5-mark parts (25); Q2 = four parts (25); Q3 = 30; Q4 = 20.** Parts per paper: 20, 20, 18; sizes 2 to 16 marks.
- **Q1 + Q2 = Kinjo's chapters 1-5 (50 marks); Q3 + Q4 = Hiang Kwee's chapters 6-9 (50 marks), exactly, three years running.**

## 2. The stable skeleton [data]

| Theme | 2023-24 | 2024-25 | 2025-26 |
|---|---|---|---|
| Coordination, Ch 6-7 (Q3) | 30 | 30 | 30 |
| Terms, Tanabe-Sugano, magnetism (Q4) | 20 | 20 | 20 |
| Kinjo half: bonding and MO | 25 | 24 | 5 |
| Kinjo half: main-group chemistry | 25 | 26 | 45 |
| Substitution kinetics, Ch 9 | 0 | 0 | 0 |

The Hiang Kwee half is fixed in size and chapters; only its templates move. The Kinjo half is fixed in size, and its mix moved a lot in the last year.

## 3. What rotates [data, then inference]

- **Q3.** 2023-24 and 2024-25: five "identify the first-row metal M" parts (6 marks each), each also asking for the names of the complexes and, in most, the LFSE; "more than one answer may be possible". 2025-26: no identify-the-metal part. Instead three formulas (KMnO4, a chromium oxalate, a nickel amine chloride) each needing name, oxidation state, dn, a splitting diagram and CFSE (15), then three essays: principles of crystal field theory, principles of ligand field theory, limitations of crystal field theory (15).
- **Q4.** 2023-24 and 2024-25: read a Tanabe-Sugano diagram (d7, then d4): ground terms for high and low spin, unpaired electrons either side of the crossover, spin-only moment, all spin-allowed transitions, and (2024-25) an instrument that tells high from low spin. 2025-26: no diagram; count microstates for d2 and d8, then derive **all atomic terms of d8 (16 marks, the largest single part in the set)**.
- **Kinjo half.** Bonding and MO marks fell 25, 24, 5 while main-group chemistry rose 25, 26, 45. 2025-26 Q2 is all descriptive (the phosphorus scheme from Ca3(PO4)2 worth 10, the Wislicenus process, the conformation of the Olin Raschig product) plus an isotope effect; the two earlier Q2s were MO and bonding explanations. [inference] Three papers cannot tell a drift from noise; both halves of that mix are live.
- **Marks whose template appeared in an earlier paper:** 61% (2024-25) and 25% (2025-26). **Marks in a chunk examined earlier:** 75.5% and 85%. [inference] The examiner keeps the chapters and rotates the template, so memorising last year's questions fails, and knowing the chapter and the method works.
- **The latest paper had zero marks of the two templates that carried 50 marks in the first two** (identify-the-metal and diagram reading). A 3-year average over-weights them; a chunk-level weight (section 5) does not, because the chunks stayed constant.

## 4. Items that recur [data]

- **Every year:** an oxidation-number computation (5 marks): P in the acid from PCl3 and water; Cl in the product of a chlorate reduced by SO2; the average oxidation numbers of Mn in Mn3O4 and Ga in Mg5Ga2.
- **Two years in three:** a nuclear equation (2024-25, 2025-26); aqua regia and gold (2023-24 equation, 2025-26 the two oxidising species); counting electrons in the HOMOs of an AXn molecule (SF6, then CH4); a Group 1 metal with O2 (Na, K); an isotope effect (H2 versus D2 bond enthalpy, then CH4 versus CD4 rates); a polyatomic MO explanation ending in bond orders (O3, then SF6).
- **Phosphorus chemistry appears in all three** (the acid, the P4 + F2 product, the 10-mark scheme).
- The skill map's references (from an earlier session, not re-checked here) say several of these are tutorial or exercise questions reused, which would make the exercise sets the best predictor of the Kinjo half.

## 5. What the app weights today against the evidence [data]

The skill map's marks add to 154, not 100, and **36% of today's weight sits on skills no final has tested.** Full table in the appendix; the points that matter:

- **Q4 is 20% of the paper; terms and TS plus magnetism carry 15.6% of the app's weight.** Q3's chunks carry 26.3% against 30%.
- **Five chunks have no marks in 300:** Lewis structures, VSEPR, isomerism, substitution kinetics, complex stability. They hold 7.7% of the weight, 47 nodes, about 2.5 h per pass. (The 2025-26 Q3 says outright that isomerism may be ignored.)
- **Polyatomic MO** carries 1.6% of the weight but 5.7 marks a paper on average (ozone 10, SF6 7).
- **Splitting Q3 between naming, bonding models and field energetics is uncertain**, because the papers never separate the marks for the name. Naming's evidence share runs from about 2.5% (name worth nothing) to 10.2% (equal split); today's 4.2% is inside that range, so do not move it on this evidence. The Q3 total is solid.
- **Proposed weights** (appendix): 80% the mean share of marks, 20% spread over untested skills in proportion to today's weights. The 20% is anchored on the share of marks that landed in a chunk not examined earlier (24.5% in 2024-25, 15% in 2025-26).

## 6. Taught, never asked in three finals [data]

Isomerism and chirality, substitution kinetics (labile and inert, trans effect), complex stability (chelate effect), Lewis structures and VSEPR as stand-alone questions, Jahn-Teller, charge-transfer bands and selection rules as a stand-alone question (the only spectra item is the instrument that separates high from low spin). [inference] Each is individually unlikely; the Kinjo half's rotation is where a new item would come from.

## 7. How I would study CM2021 [advice]

1. **Q3 + Q4 first and twice**: five chunks (naming, bonding models, field energetics, magnetism and colour, terms and TS), 64 nodes, about 4.6 h per pass, 50 marks a paper. Make four procedures automatic: the microstate table and term derivation (d2 and d8 give 45 microstates: 3F, 3P, 1G, 1D, 1S), the Hund-rule ground term, reading a TS diagram (ground terms, unpaired electrons either side of the crossover, spin-only moment, spin-allowed transitions), and the full "name, oxidation state, dn, splitting diagram, CFSE" chain for given formulas (tetrahedral and octahedral, high and low spin). Keep an essay skeleton for crystal field theory, ligand field theory and the limits of crystal field theory.
2. **Kinjo half as recall plus mechanism**: the five 5-mark parts of Q1 are one-line answers; "explain in detail" parts want the orbital or energy argument (zero-point energy, 3c-4e bonding, pi back-donation, hyperconjugation). Go through the recurring items in section 4 first.
3. **Do not spend time on** the five zero-mark chunks until the above is solid; they are 2.5 h of one pass for 7.7% of today's weight.
4. **Practise with a clock**: 1.2 minutes a mark, so the 16-mark d8 term derivation should cost about 19 minutes and the 25-mark Q1 about 30.

## 8. Caveats

- Three papers; one lecturer per half; the template coding and the equal split of marks across a part's outputs are mine.
- The 2024-25 Q1(d) names the reactant sodium chlorate but prints the formula NaClO4 in the sentence; the equation (NaClO3) is what the question works from.
- 2024-25 Q3(c) (a 2- complex with two thiocyanates and a moment of 5.92 BM) is consistent only with a d5 metal in the zero oxidation state (vanadium), so it may be deliberate; it is not necessarily a typo.

<!-- the tables below are the output of analyse.mjs -->

## Appendix: script output

### Check: question totals
| Paper | Q1 | Q2 | Q3 | Q4 | Total |
|---|---|---|---|---|---|
| 2023-24 | 25 | 25 | 30 | 20 | 100 |
| 2024-25 | 25 | 25 | 30 | 20 | 100 |
| 2025-26 | 25 | 25 | 30 | 20 | 100 |

### Marks by lecturer part (Kinjo Ch 1-5, Hiang Kwee Ch 6-9)
| Paper | Kinjo (Ch 1-5) | Hiang Kwee (Ch 6-9) |
|---|---|---|
| 2023-24 | 50 | 50 |
| 2024-25 | 50 | 50 |
| 2025-26 | 50 | 50 |

### Marks by theme (of 100)
| Theme | 2023-24 | 2024-25 | 2025-26 | Mean |
|---|---|---|---|---|
| Bonding and MO | 25 | 24 | 5 | 18 |
| Main-group chemistry | 25 | 26 | 45 | 32 |
| Coordination (Ch 6-7) | 30 | 30 | 30 | 30 |
| Terms, TS, spectra (Ch 8) | 20 | 20 | 20 | 20 |
| Kinetics (Ch 9) | 0 | 0 | 0 | 0 |

### Marks per chunk against the app's current weight
| Chunk | Mean marks / 100 | App weight today | Nodes | Minutes per pass | Marks per hour of a pass |
|---|---|---|---|---|---|
| terms-ts | 17.3 | 13% | 10 | 54 | 19.3 |
| reaction-toolkit | 15.8 | 13% | 43 | 147 | 6.5 |
| field-energetics | 14.8 | 15.6% | 21 | 95 | 9.4 |
| naming | 10.2 | 4.2% | 15 | 51 | 12 |
| s-block | 6.7 | 7.8% | 16 | 46 | 8.7 |
| mo-polyatomic | 5.7 | 1.6% | 9 | 30 | 11.3 |
| mo-diatomic | 5.3 | 7.1% | 18 | 59 | 5.4 |
| bonding-models | 5 | 3.9% | 10 | 41 | 7.3 |
| group15-18 | 4.2 | 6.5% | 24 | 85 | 2.9 |
| hydrogen | 3.7 | 4.2% | 11 | 29 | 7.6 |
| delocalised | 3.3 | 3.6% | 9 | 26 | 7.7 |
| magnetism-colour | 2.7 | 2.6% | 8 | 37 | 4.3 |
| periodic-trends | 2 | 2.9% | 6 | 19 | 6.3 |
| group13-14 | 1.7 | 3.6% | 11 | 34 | 2.9 |
| imf-solids | 1.7 | 2.6% | 9 | 24 | 4.2 |
| lewis-bonding | 0 | 2.3% | 13 | 43 | 0 |
| vsepr | 0 | 1.6% | 10 | 28 | 0 |
| isomerism | 0 | 1.6% | 12 | 47 | 0 |
| kinetics | 0 | 1.3% | 7 | 18 | 0 |
| stability | 0 | 1% | 5 | 11 | 0 |

Minutes per pass add the bank's own time estimate for every node in the chunk; a node mapped to skills in two chunks is counted in both, so the column sums to more than the bank total.

Chunks with no marks in any of the three finals: lewis-bonding, vsepr, isomerism, kinetics, stability (7.7% of today's weight, 47 nodes, about 2.5 h per pass).

Share of today's weight that sits on skills no final has tested: 36% (the skill-map marks total 154, not 100).

### Templates by paper (marks)
| Template | 2023-24 | 2024-25 | 2025-26 |
|---|---|---|---|
| OXN | 5 | 5 | 5 |
| G1OX | 5 | 5 | · |
| HOMO | 5 | · | 5 |
| AQR | 5 | · | 5 |
| CRYPT | 5 | · | · |
| 3C4E | 5 | · | · |
| BX3 | 5 | · | · |
| HYPER | 5 | · | · |
| POLYMO | 10 | 7 | · |
| MID | 30 | 30 | · |
| TSREAD | 16 | 14 | · |
| SPINONLY | 4 | · | · |
| PCHEM | · | 5 | · |
| DIHYD | · | 5 | · |
| NUC | · | 5 | 5 |
| MOHET | · | 6 | · |
| ISO | · | 6 | 5 |
| TRANSBENT | · | 6 | · |
| TERMGS | · | 2 | · |
| MAGINSTR | · | 4 | · |
| HYDR | · | · | 5 |
| RXSCHEME | · | · | 10 |
| NAMEDPROC | · | · | 5 |
| GAUCHE | · | · | 5 |
| COORD5 | · | · | 15 |
| CFTESSAY | · | · | 5 |
| LFTESSAY | · | · | 5 |
| CFTLIM | · | · | 5 |
| MICRO | · | · | 4 |
| TERMS | · | · | 16 |

### Marks whose template or chunk was already in an earlier paper
| Paper | Same template as an earlier paper | Chunk already examined earlier | Chunk not seen before |
|---|---|---|---|
| 2024-25 | 61 of 100 | 75.5 of 100 | 24.5 of 100 |
| 2025-26 | 25 of 100 | 85 of 100 | 15 of 100 |

### What the student has to do (marks of 100)
| Paper | derive | recall | write-equation | draw | explain | identify | read-diagram | calc |
|---|---|---|---|---|---|---|---|---|
| 2023-24 | 15 | 5 | 5 | 10 | 15 | 30 | 16 | 4 |
| 2024-25 | 15.5 | 10 | 0 | 6 | 24.5 | 30 | 14 | 0 |
| 2025-26 | 42.5 | 25 | 0 | 7.5 | 25 | 0 | 0 | 0 |

Parts per paper: 2023-24 20, 2024-25 20, 2025-26 18. Part sizes (marks): 2, 3, 4, 5, 6, 7, 10, 16.

### Proposed chunk weights (evidence first, a floor for untested material)
| Chunk | Evidence share | Proposed weight | App weight today |
|---|---|---|---|
| terms-ts | 17.3% | 14.2% | 13% |
| reaction-toolkit | 15.8% | 13.8% | 13% |
| field-energetics | 14.8% | 13.9% | 15.6% |
| naming | 10.2% | 8.7% | 4.2% |
| s-block | 6.7% | 7.3% | 7.8% |
| mo-polyatomic | 5.7% | 4.9% | 1.6% |
| mo-diatomic | 5.3% | 6.3% | 7.1% |
| bonding-models | 5% | 4.5% | 3.9% |
| group15-18 | 4.2% | 4.6% | 6.5% |
| hydrogen | 3.7% | 3.8% | 4.2% |
| delocalised | 3.3% | 3.2% | 3.6% |
| magnetism-colour | 2.7% | 2.9% | 2.6% |
| periodic-trends | 2% | 2.5% | 2.9% |
| group13-14 | 1.7% | 2.6% | 3.6% |
| imf-solids | 1.7% | 2.4% | 2.6% |
| lewis-bonding | 0% | 1.3% | 2.3% |
| vsepr | 0% | 0.9% | 1.6% |
| isomerism | 0% | 0.9% | 1.6% |
| kinetics | 0% | 0.7% | 1.3% |
| stability | 0% | 0.5% | 1% |

Blend: 80% the mean share of marks in the three finals, 20% spread over skills no final has tested in proportion to today's weights. The 20% is a judgement (with CM2011's 11 finals, 0-22% of a paper's marks sat in families new to the set; three papers see less of the range).
