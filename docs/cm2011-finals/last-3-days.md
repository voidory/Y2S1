# Last three days: HPLC/GC, fluorescence, AAS/ICP, in exam shape

Written 19 Nov 2026 for the final only. Prompts marked with a year and marks are questions a past final actually asked; the points are from the lectures and the keys, in my words. **How to use:** cover the points, answer from memory (1 mark = 1 distinct point), compare, fix. Where a key disagrees with the lecture it is flagged ⚠ and the lecture wins.

## 0. What is at stake [data + estimate]

- **GC/HPLC:** the one second-half final I hold has a 25-mark Q4 that is entirely GC/HPLC, all descriptive. If the next final looks like it, this block is a quarter of the paper.
- **Fluorescence + atomic spectroscopy:** about 8 first-half marks a paper on average (present in 4 of the last 6 finals; 7 to 16 marks when present, 0 in 2017/18 and 2025/26).
- Together roughly a third of the exam, all recall and short explanation, so it is the cheapest marks you can still add.

## 1. Three-day schedule (about 7 study hours a day; scale it)

**Day 1: learn the three unstudied blocks in exam shape**
- GC/HPLC, 3.5 h: read the combined deck p1–62 once (45 min); rebuild the section 2 tables from memory (60 min); answer the six Q4 prompts closed-book (45 min); mark and redo the misses (60 min).
- Fluorescence, 1.5 h: slides (20 min); draw and label the Jablonski diagram from memory; answer the section 3 prompts.
- AAS/atomic, 1.5 h: slides (25 min); write the four-row AAS table from memory; answer the section 4 prompts.
- 30 min: log what you missed.

**Day 2: retrieve, connect, keep the calculations warm**
- 45 min: rewrite Day 1's tables cold.
- 2.5 h second half: the extraction chain (docx Q3 timed, then the same with a base or another pH); if you have not done efficiency, N, H, R_s and the van Deemter reasoning go here.
- 2.5 h first half: one older Q1–Q2 (2019/20 or 2021/22) in 60 min, mark it (30 min), then drill your three most frequent error types (t-table column and df, dilution chain, ionic strength per half-cell).
- 30 min: the never-asked items once (known-value t, E = hν, SHE ↔ SCE, Stern–Volmer in one line).

**Day 3: mock and stop early**
- 60 min first half under time (2024/25 or 2025/26 Q1–Q2) plus 30 min marking; 60 min second half (docx Q3–Q4) plus 30 min marking.
- 90 min re-drill of misses; 30 min one-page list of traps; 30 min last cold retrieval of the Day 1 tables.
- If the exam falls on Day 3, move both mocks to Day 2 and make Day 3 retrieval only. Sleep beats another hour.

## 2. GC and HPLC

### 2A. The six prompts the final asked (docx Q4, 27 marks as typed)

**TCD principle (3).** A heated filament sits in the column effluent. Carrier gas (helium, high thermal conductivity) carries heat away at a steady rate. When an analyte elutes, the gas's thermal conductivity changes, so the filament's temperature and resistance change (a Wheatstone bridge goes out of balance) and that is the signal. Near-universal, non-destructive, less sensitive than FID.

**FID principle (3).** The effluent burns in a hydrogen–air flame. Organic compounds form ions in the flame, and the ion current is the signal. Very sensitive to organics and hydrocarbons, suits the small samples of capillary columns, destroys the sample.

**Open tubular vs packed, plus two uses (5).** Open tubular: narrow tube with the stationary phase on the wall (WCOT liquid film; PLOT solid layer, for permanent gases such as O₂, N₂, CO; SCOT coated support, in between). Packed: tube filled with a coated or solid support. Open tubular gives higher resolution, shorter runs and higher sensitivity but lower sample capacity, and has no multiple-path (A) term; packed gives higher capacity but broader peaks, longer retention, lower resolution. Capillary is preferred for complex mixtures that need high resolution and for trace analysis (including GC–MS).

**Temperature programming (3).** A sample with a wide boiling range cannot be run well isothermally: cold gives good early separation but heavy compounds stick and broaden; hot sweeps the light ones out together. So start low (separates volatiles), ramp (about 5–20 °C/min) so less volatile compounds elute sooner as peaks stay sharp, then a final high hold to clean the column. Result: all components elute with resolution in a reasonable time, sharper late peaks (better sensitivity). Costs: baseline slope from stationary-phase bleed, cool-down time. Pressure programming gives a similar effect without heat.

**Isocratic vs gradient, and one advantage (4).** Isocratic: constant mobile-phase composition. Gradient: composition changes during the run, continuously or stepwise (in reversed phase, more organic over time). Advantage: strongly retained compounds elute sooner, giving shorter runs and sharper late peaks, so one run handles weakly and strongly retained solutes.

**Reversed-phase elution order (4).** Non-polar C18 phase, polar mobile phase: the most polar compound elutes first and retention rises with hydrophobicity. Toluene, phenol, butanol, cyclohexane elute **butanol → phenol → toluene → cyclohexane**. Deck examples: ethanol → 1-propanol → 1-butanol → 1-pentanol (longer chain); C₂H₅F → Cl → Br → I (hydrophobicity rises down the halogens); methanol < acetone < toluene < hexadecane (–OH most polar, C=O next, then aromatic hydrocarbon, then long alkane). Normal phase reverses the order.

**GC–MS easier than LC–MS, and two LC–MS problems (5).** The GC effluent is already a gas and compatible with the MS vacuum. The LC effluent is a liquid, so it needs (1) an interface that converts it to gas-phase ions (ESI or APCI), (2) desolvation, because the solvent load must not reach the high vacuum, and (3) volatile, MS-friendly mobile phases (non-volatile salts and buffers contaminate the source and suppress ionisation). HPLC suits polar, non-volatile or thermally labile analytes that GC cannot handle.

### 2B. Rest of the deck (for variations)

| Topic | Facts to hold |
|---|---|
| GC basics | Carrier gas He, N₂ or H₂ (inert, low viscosity, detector-compatible); analytes must be gas or volatile liquid, stable at about 50–300 °C |
| Carrier gas speed | Optimum flow rises N₂ < He < H₂; H₂ and He allow faster runs; H₂ has a broad flat van Deemter optimum. ⚠ H₂ and MS: the older deck says unusable (vacuum pump); the updated deck says it needs a compatible instrument and precautions; H₂ is flammable. Use the updated wording |
| GC stationary phase | Like dissolves like; PDMS is non-polar; 50% phenyl is slightly polar |
| Injection | Split: high concentration, avoids overload, sharp peaks. Splitless: trace analytes, vent opened after a short time. On-column: thermally labile or high-boiling, column starts cool to focus the band |
| Derivatisation | Turn an analyte into a volatile or detectable form (carboxylic acid → trimethylsilyl ester) |
| GC detectors | TCD (universal, non-destructive, less sensitive), FID (organics, sensitive, destructive), MS (m/z, specific identification) |
| HPLC column | Analytical column plus a shorter, cheaper guard column with the same packing that protects it. Silica particles 2–10 µm; silica is unstable at high pH |
| Column label | e.g. C18, 60 Å, 4 µm, 3.9 × 150 mm. ⚠ updated deck: inner diameter × length. Pores about 100 Å for small molecules, about 300 Å for peptides and proteins. C8 is less hydrophobic than C18, so less retention |
| Why small packed particles | Liquid diffusion is slow, small particles shorten diffusion paths and fill more uniformly (smaller A and C terms, N ∝ L/d_p), at the price of higher pressure |
| Normal vs reversed phase | Normal: polar phase (amino, diol), non-polar mobile phase, least polar elutes first. Reversed: C18/C8 phase, polar mobile phase, most polar elutes first; more organic (%B) is a stronger eluent, so shorter retention |
| HPLC detectors | UV (most common, diode array, linear over 5 orders); refractive index (universal, much less sensitive); electrochemical (electroactive compounds only, selective and sensitive) |
| Injection (HPLC) | Loop injector |

### 2C. Twists to predict before you compute

- More organic in reversed-phase HPLC: stronger eluent, shorter retention.
- C18 to C8: less hydrophobic, shorter retention.
- Hotter GC oven: higher vapour pressure, shorter retention, early peaks may merge.
- Smaller particles: more plates, better resolution, higher pressure.
- H₂ for N₂: faster optimum, flatter curve, but flammability and MS compatibility.
- Thermally labile or non-volatile analyte: HPLC, on-column injection, or LC–MS with ESI.
- Void time is the same for every solute, whatever its hydrophobicity.

## 3. Fluorescence (Topic 4b)

### 3A. Jablonski key (2021/22 Q2(b)(i), 5 marks)

| Symbol | Process | Notes |
|---|---|---|
| A | Absorption | ground to excited state, S₀ → S₁ (or S₂) |
| R | Vibrational relaxation | energy to solvent, under 10⁻¹⁵ s, ends in the lowest vibrational level |
| IC | Internal conversion | same spin, lowest level of one electronic state into a high vibrational level of a lower state (S₁ → S₀), non-radiative |
| ISC | Intersystem crossing | isoenergetic, between different multiplicities (S₁ → T₁), non-radiative |
| F | Fluorescence | S₁ → S₀, same spin, photon, lifetime 10⁻⁹–10⁻⁴ s (as the slides state) |
| P | Phosphorescence | T₁ → S₀, different spin, photon, lifetime 10⁻⁴–10² s |

Non-radiative quenching takes roughly 10⁻⁹–10⁻⁶ s, so it competes with fluorescence.

### 3B. Prompts and points

- **Why fluorescence is more sensitive than absorbance (4 in 2010/11, 3 in 2021/22).** Fluorescence is measured against a zero (dark) background: the detector sits at 90° to the source, so only emitted light reaches it, and a detector can be made very sensitive to a small signal on nothing. Absorbance is a small decrease in a large transmitted beam (small difference between two large signals), which is hard to measure accurately. Analogy: spotting a faint light in a dark room versus a bright one.
- **Absorption with no emission (4).** Photon absorbed to an upper level of S₁; vibrational relaxation (R1) to the bottom of S₁; internal conversion into a high vibrational level of S₀; vibrational relaxation (R2) to the bottom of S₀. Energy ends as heat.
- **Absorption then fluorescence (4).** Same first two steps, then instead of IC the molecule emits a photon from the bottom of S₁ to S₀. Favoured in rigid molecules that cannot lose energy through vibration.
- **Fluorescence vs phosphorescence (6, 2015/16).** F: S₁ → S₀, same spin, fast. P: first ISC from S₁ to the triplet T₁, then T₁ → S₀ with a spin change, so slow, with a far longer lifetime. (Standard physics, not on the slides: T₁ lies below S₁, so phosphorescence comes at longer wavelength.)
- **Which molecules fluoresce (2, 2024/25).** Rigid ones such as polycyclic aromatics, and many substituted aromatics (quantum yield near 1), because they lose less energy by vibration and internal conversion. Higher temperature lowers the quantum yield.
- **Why absorption bands in solution are broad (2).** Each electronic transition has many closely spaced vibrational and rotational levels superimposed on it (solvent adds to it).
- **Instrument vs absorption instrument (5 for a diagram, 2024/25).** Source → excitation wavelength selection (a line source such as the Zn lamp needs none; a continuum lamp needs a monochromator) → sample cell → detector at 90° behind an emission monochromator → photomultiplier → readout. Excitation wavelength fixed, emission scanned.
- **Two-point calibration (4, 2024/25).** y = mx + c from the two standards, then x = (y − c)/m. Slope 0.03 per µg/m³ and intercept 0.08 gave 9 µg/m³ at I_f = 0.35.

### 3C. Short facts

- **Stokes shift:** emission is at longer wavelength than the excitation. Causes: the molecule re-optimises its geometry in S₁ and the solvent interacts with it. Absorption and emission spectra are roughly mirror images when vibrational spacings and transition probabilities are alike (that is the condition for the mirror image, not the cause of the shift).
- **Quantum yield:** photons emitted ÷ photons absorbed (molecules that fluoresce ÷ molecules excited).
- **Quenching:** M* + Q → M + Q*, then Q* → Q + heat.
- **Stern–Volmer (booklet):** Φ₀/Φ_Q = 1 + (k_q/(k_e + k_d))[Q]; a plot against [Q] is a straight line.
- **Fluorescence sensors** are used for anions and dissolved oxygen.

## 4. AAS and ICP (Topic 4c)

### 4A. The AAS component table (10 marks, 2023/24)

| Component | Points |
|---|---|
| Hollow-cathode lamp | Cathode made of the analyte metal; filled with argon; high voltage ionises Ar to Ar⁺ and e⁻; Ar⁺ sputters metal atoms off the cathode; they collide with energetic electrons and are excited; the excited atoms emit lines of exactly the frequency the analyte absorbs; lines narrower than 10⁻³–10⁻² nm |
| Flame / atomiser | Nebuliser makes an aerosol that mixes with fuel and oxidant (baffles remove large drops; only about 5% reaches the flame); solvent evaporates in the primary zone, particles vaporise and atomise in the hot interzonal region, oxides and hydroxides form in the outer cone; hottest region wanted to avoid oxides |
| Monochromator | Entrance slit, grating, exit slit; isolates the lamp's line from flame emission and other lines. ⚠ the keys say "wider slit = higher resolution, lower sensitivity", which is the reverse of the physics and the lecture. Safe wording: slit width trades resolution against light throughput |
| Detector / amplifier | Photomultiplier: a photon ejects electrons from a photoemissive cathode, which are multiplied at successive dynodes (key: about 10⁶ electrons per photon); the signal is amplified and read out |

**Block diagram (5, 2014/15).** Sample → nebuliser (with fuel and oxidant, spray chamber with baffles) → burner/flame, crossed by the beam from the hollow-cathode lamp → monochromator → photomultiplier detector → amplifier and readout.

### 4B. Prompts and points

- **Why AES is more sensitive to temperature than AAS (5, 2014/15).** Boltzmann: N_e/N₀ = (g_e/g₀) exp[−(E_e − E₀)/kT]. For Na (excited state 3.371×10⁻¹⁹ J above ground, g_e/g₀ = 2): 1.15×10⁻⁴ at 2500 K and 1.24×10⁻⁴ at 2520 K, a rise of about 8% for 20 K (1.67×10⁻⁴ to 1.74×10⁻⁴, about 4%, for 2600 to 2610 K in the slides). More than 99.98% of the atoms stay in the ground state, so absorption (ground-state atoms) barely moves, but emission scales with the small excited population, which changes a lot. Also 3500 → 4500 K: 0.187% to 0.882% (2009/10).
- **Causes of line broadening (5, 2009/10).** Natural: Heisenberg, δE·δt ≥ h/4π, a short excited-state lifetime (about 10⁻⁸–10⁻⁹ s) gives an uncertain energy (width about 10⁻⁵–10⁻⁴ nm). Collisional (pressure): collisions shorten the lifetime, grows with pressure and temperature (up to about 10⁻³ nm for Na). Doppler: atoms moving toward or away from the detector shift the frequency, grows with temperature.
- **Why hollow-cathode lines are narrower than flame lines (lecture p25, not seen in a final).** The lamp is cooler and at lower pressure, so there is less Doppler and pressure broadening. A monochromator cannot isolate lines narrower than 10⁻³–10⁻² nm, which is why AAS needs a line source.
- **Why molecular bands are broader than atomic lines (4, 2010/11).** Molecular transitions carry vibrational and rotational sub-levels on top of the electronic change; atomic lines are electronic only. Atomic emission has no Stokes shift.
- **ICP-OES advantages over AAS (3, 2015/16).** Many elements at once without changing lamps (polychromator with many exit slits); hotter plasma (6,000–10,000 K) gives more complete atomisation and excitation; inert argon means fewer oxides; temperature is fairly uniform across the plasma.
- **Molecular vs atomic methods for lead (4, 2019/20).** Molecular (complexing and UV-vis): sees only the free ion, no flame or high temperature. Atomic: sees all forms (total lead), and narrow-line measurement means fewer interferences.
- **Sample preparation for atomic analysis of PM2.5 (2, 2015/16).** Collect on a filter, microwave-assisted acid digestion to dissolve it, then ICP.
- **The three kinds of atomic spectroscopy:** absorption of sharp lines (AAS); emission from a thermally populated excited state (AES, ICP); emission after an initial absorption (atomic fluorescence).

## 5. Rules for the exam itself

1. 1.2 minutes per mark. Read the whole paper first and bank the calculation parts you know.
2. Descriptive answers: one distinct point per mark, short sentences, no padding.
3. t-tests: decide paired vs pooled from the data layout; the 99.9% column is the last one; use the next lower tabulated df.
4. Show intermediate values; keys give step marks and error carried forward.
5. Cells: E_cell = E_right − E_left, ½ half-cells, ionic strength from each compartment's own salt, ΔG° from E° with the n of the reaction as written.
6. Extraction: decide which phase the solute starts in before choosing f; use D (not K) when the pH matters.
7. Anything unfamiliar: name what the signal is proportional to, write the booklet equation, check direction, state assumptions.

## 6. Where to drill in the app (after the pull request that adds these)

- **Chapter 10 GC and HPLC:** the written prompts above (tick the rubric points after writing), the six elution-order lists, and short pick-one checks.
- **Chapter 6 fluorescence and chapter 7 atomic:** Jablonski labelling, the explanation prompts, the AAS component table and block diagram, Boltzmann and two-point calibration generators.
- **Chapter 8 extraction:** the full chain from the final's Q3 (eight answer fields) with fresh numbers each time, a short version, the base version, and one-large-versus-several-small.
- **Chapter 1, "Two-method t-tests at 99% and 99.9%":** paired with the d column, pooled from summary statistics, a df the table does not list, and the highest level at which a verdict still holds. The critical value is an answer field; the table rows are in the hint.
- **Mock → choose chapters 8 and 10** for a timed second-half set.
