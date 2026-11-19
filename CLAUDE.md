# Y2S1: exam-prep app (CM2021 and CM2011)

Single-file study app for NTU finals. `index.html` holds the whole app (inline module script, Dexie/IndexedDB). It is a **private, personal** project: the repository and the deployed site are not public, so course material is used for the owner's study only. Still write question text in our own words; do not paste slide text, slide figures or paper text into content.

The owner wants a critical peer: say so when something looks wrong, give a recommendation instead of a survey, and ask only about things that would change the output.

## Commands

```bash
npm test                      # 100+ unit tests (Node vm sandbox, no browser, no install needed)
node tools/cm2011/build.mjs   # regenerate public/content/cm2011/*.json from tools/cm2011/*.mjs
# browser suites (need Playwright + Chromium; set DEXIE_FILE if unpkg is blocked):
npm run test:e2e              # layout, study flows, answer review, weak spots, copy, data safety
npm run test:cm2011           # CM2011 flows
```
Dexie for the browser tests: `DEXIE_FILE=/path/to/dexie@4.0.10/dist/dexie.mjs`. Work on branch `claude/epic-galileo-qly4ky`; open a PR only when asked.

## Architecture (the parts that matter)

- Namespaces inside `index.html`: `Expr` (safe expression language), `DB`, `Content`, `Scheduler`, `Mastery`, `Review`, `Weakness`, `Evaluators`, `LF`, `IsomerEngine`, `Widgets`, `UI`. All are exposed on `window.__MASTERY_ENGINE__`; `tests/helpers/load-engine.mjs` loads them in a `vm` sandbox.
- **Modules.** `Content.MODULES` lists `{code, dir, recordKey}`. Each module has `public/content/<dir>/question-bank.json` and `skill-map.json`. `SEED_MODULES` holds module titles and weeks. The header switch sets `appState.activeModule`; `appState.nodes`, `composerNodes` and `skillMap` are always the **active module's**, so every screen works unchanged. Choice persists in the settings row `activeModule`. A new module needs: a `MODULES` entry, a `SEED_MODULES` entry, a `cm11-`-style reserved prefix for generated ids if any, content files, tests.
- **Question node (schema 3.0):** `variants[]`, each with `stem`, `inputSlot`, `evaluator`, optional `variables.sampled/derived` (values drawn fresh every time a question is served; derived values use `Expr`). Slots: choice, mapped_fields, typed_short, typed_synthesis, unordered_set, ordered_list, typed_equation, interactive_widget.
- **`Expr`** functions: sqrt, abs, log (base 10), ln, exp, pow, min, max, round, sigfig, sum, mean, sd (sample), nth(k, ...), fix(x,d) (string), sci(x,d) (returns `3.0\times10^{-34}`; put it inside `$...$`). Supports ternary, comparisons, `^`.
- **Numeric answers** (`mapped_fields_match` targets): `{type:'numeric', targetExpr, relTol|tolerance, sig, unit, paths:[{label,expr}], ecf:[{expr,label}]}`.
  - `paths` name a known wrong route when the student's number matches it; sign slips and powers of ten are named automatically.
  - `ecf` = error carried forward: expressions may use `u_<fieldKey>` (the student's own earlier numbers) and earn 0.5 credit with the label.
  - `{type:'keyword', expectedExpr, synonyms, displays}` is a pick-one decision field (field has `options` so it renders as a drop-down).
- Mastery retirement is in card time; weak spots read `errorTags` (`calc:<label>` tags come from named wrong routes).
- `Scheduler.FINAL_RECIPES` + `assembleRecipePaper` build a final-style mock paper from named nodes.
- Layout rule: no page scroll anywhere; phone step flow, bottom tab bar; `tests/e2e/layout-check.cjs` enforces it.

## Content pipeline for CM2011

Source of truth is `tools/cm2011/*.mjs` (`lib.mjs` helpers; `t1`, `e3a`, `p3b`, `s4` families; `build.mjs`). Edit those, run the build, run `npm test`. Never hand-edit the JSON. `tests/cm2011.test.mjs` has fuzz tests (every variant, 150 seeds), golden tests against printed answers, and checks that every listed wrong route scores as wrong and is named. Add a golden test whenever a formula is added.

Rules for new generators:
1. Compute the answer in `derived` from the displayed (rounded) data, not from hidden unrounded values.
2. Give each plausible mistake a `paths` entry; give each later step an `ecf`.
3. Never let sampled data collapse (e.g. all replicates equal): use `bands()`.
4. Print only what the exam prints. **The exam provides the booklet below, so stems should not hand out table values** (see "Content corrections to make").
5. Anchor each family to a printed answer where one exists.

---

# CM2011 Analytical Chemistry: course knowledge

## Course facts
- NTU, instructors Richard Webster and Ye Hui. Assessment: 2 mid-semester tests (40%) + final exam (60%). Texts: Skoog, West, Holler, Crouch (10th ed.); Harris and Lucy (10th ed.).
- Weeks 1–7 outline: W1 Topic 1 errors and confidence intervals; W2 Topic 2 air pollution in Singapore; W3 Topic 3a introductory electrochemistry; W4 3a and 3b; W5 3b potentiometry; W6 test, Topic 4a molecular absorption; W7 Topic 4b molecular fluorescence and 4c atomic spectroscopy. Weeks 8–13 are blank on the outline.
- **The Supplementary Information booklet** (given in the exam; it is not open book otherwise) has six sections: atmospheric chemistry, uncertainties and statistics, introductory electrochemistry, chemical sensors and potentiometry, atomic and molecular spectroscopy, **extractions, chromatography and electrophoresis**. The last section means the final very likely covers material after week 7 (a chromatography lecture dated 28 Oct 2026, "Efficiency and Band Spreading", was supplied). Electrophoresis has a title in the booklet but no equations. This is an inference; confirm scope with the owner.
- Exam papers seen: 2010/11 mid-sem, 2014/15 mid-sem, 2011-12 final (old; the syllabus has drifted, so use them for style and number checks, not scope). The 2011-12 final: Q1 = Kjeldahl/melamine (4 marks) + draw and label the ammonia ISE (6) + define interferent (2) + how interferents are quantified (2) + interferents of the ammonia electrode (1); Q2 = cell potential with activities and spontaneity (8) + Q-test and pooled t-test on AAS vs ICP (3 + 4) + E° from Ksp (10). Q2 is 25 marks. Answer keys contain slips (Fe(NO₃)₂ printed as c = 0.01666 M against 0.01333 M in the question): verify by recomputing.
- Exam marking conventions seen in the keys: results to about 4 significant figures; units stated; "reject / same / different / spontaneous" decisions stated in words with the reason (t_cal > t_table, ΔG negative).

## Booklet: statistics
- Uncertainty: y = x₁ ± x₂: e_y = √(e₁² + e₂²). y = x₁ × x₂ or x₁ ÷ x₂: %e_y = √(%e₁² + %e₂²).
- CI: μ = x̄ ± ts/√N. Known value: t_cal = |x̄ − known| √N / s.
- Two samples: s_pooled = √[(s₁²(N₁−1) + s₂²(N₂−1)) / (N₁+N₂−2)]; t_cal = |x̄₁ − x̄₂| / s_pooled × √(N₁N₂/(N₁+N₂)). Paired: t_cal = |d̄| √n / s_d. If t_cal > t_table the results differ significantly at that confidence level.
- Student's t (two-tailed; columns 50, 90, 95, 98, 99, 99.5, 99.9 %). 95% column: df 1 12.706, 2 4.303, 3 3.182, 4 2.776, 5 2.571, 6 2.447, 7 2.365, 8 2.306, 9 2.262, 10 2.228, 15 2.131, 20 2.086, 25 2.060, 30 2.042, 40 2.021, 60 2.000, 120 1.980, ∞ 1.960. 90% column: 6.314, 2.920, 2.353, 2.132, 2.015, 1.943, 1.895, 1.860, 1.833, 1.812. 99% column: 63.657, 9.925, 5.841, 4.604, 4.032, 3.707, 3.500, 3.355, 3.250, 3.169.
- Q-test: Q = gap/range, **90% confidence**, reject if Q_calc > Q_table. Table (to 2 d.p.): n=4 0.76, 5 0.64, 6 0.56, 7 0.51, 8 0.47, 9 0.44, 10 0.41. (No n = 3 row.)

## Booklet: atmospheric chemistry (Topic 2, PSI)
- Sub-index: I_p = [(PSI_max,J+1 − PSI_max,J) / (I_max,J+1 − I_max,J)] × (C_p − I_max,J) + PSI_max,J, for I_max,J ≤ C_p ≤ I_max,J+1. Here I_max,J is the **maximum** concentration of the lower band. The overall PSI is the largest sub-index (standard practice; the booklet does not say so: confirm).
- Table (PSI band: 24-h PM2.5 µg/m³, 24-h PM10 µg/m³, 24-h SO₂ µg/m³, 8-h CO mg/m³, 8-h O₃ µg/m³, 1-h NO₂ µg/m³, J). Good 0–50: 0–12, 0–50, 0–80, 0–5.0, 0–118, –, 1. Moderate 51–100: 13–55, 51–150, 81–365, 5.1–10.0, 119–157, –, 2. Unhealthy 101–200: 56–150, 151–350, 366–800, 10.1–17.0, 158–235, 1130, 3. Very unhealthy 201–300: 151–250, 351–420, 810–1600, 17.1–34.0, 236–785, 1131–2260, 4. Hazardous 301–400: 251–350, 421–500, 1601–2100, 34.1–46.0, 786–980, 2261–3000, 5. Hazardous 401–500: 251–500 (as printed; almost certainly a typo for 351–500: verify before using), 501–600, 2101–2620, 46.1–57.5, 981–1180, 3001–3750, 6.
- Footnotes: when the 8-h O₃ exceeds 785 µg/m³ the sub-index uses the 1-h concentration; the NO₂ sub-index is reported only when the 1-h value is ≥ 1130 µg/m³.
- No past question or lecture on Topic 2 has been seen. Generators for PSI sub-index, category and overall PSI are possible from the booklet alone.

## Booklet: introductory electrochemistry (Topic 3a)
- Ionic strength I = ½ Σ cᵢzᵢ². Shortcuts I/c: 1:1 → c, 1:2 → 3c, 1:3 → 6c, 2:2 → 4c. Activity aᵢ = [i]γᵢ. Mean activity coefficient γ± = (γ_A^m γ_B^n)^(1/(m+n)). Ksp = [A]^m[B]^n γ_A^m γ_B^n.
- Debye–Hückel: −log γᵢ = 0.51 zᵢ² √I / (1 + 3.3 αᵢ √I) (αᵢ in nm); limiting form −log γᵢ = 0.51 zᵢ² √I; −log γ± = 0.51 |z₊z₋| √I.
- ΔG° = −nFE°_cell = −RT ln K (R = 8.3143 J K⁻¹ mol⁻¹, F = 96485 C mol⁻¹). Nernst: E = E° − (RT/nF) ln Q = E° − (0.0592/n) log [a_C^c a_D^d … / a_A^a a_B^b …].
- Cell shorthand: one line = a phase boundary with a potential; two lines = a salt bridge. Written half-cells use ½ (e.g. ½ Zn | ½ ZnSO₄ (a = …) ‖ …) because **every half-reaction is written as a one-electron reduction**. Rules: (1) one-electron reductions, swap the sign of data given as oxidation potentials; (2) write the cell so the couple with the more negative reduction potential is on the left (as the species that is oxidised); (3) E_cell = E_right − E_left.
- Reference electrodes (slide 37b): convert SCE → SHE by **adding** 0.242 V; SHE → SCE by subtracting 0.242 V. Potentials depend on the medium. (Example: Al³⁺/Al −1.66 V vs SHE = −1.90 V vs SCE; Au⁺/Au +1.83 vs SHE = +1.59 vs SCE.)
- Activity coefficient table at 25 °C: γ at I = 0.001, 0.005, 0.01, 0.05, 0.1 (αᵢ in nm). The exam keys **look γ up** here (the 2011-12 key used γ(Fe³⁺) 0.24 and γ(Fe²⁺) 0.48 at I = 0.05) or compute it from Debye–Hückel; both agree to 2 d.p.
  - H₃O⁺ α 0.9: 0.967, 0.934, 0.913, 0.85, 0.83
  - Li⁺, C₆H₅COO⁻ 0.6: 0.966, 0.930, 0.907, 0.83, 0.80
  - Na⁺, IO₃⁻, HSO₃⁻, HCO₃⁻, H₂PO₄⁻, H₂AsO₄⁻, OAc⁻ **0.43**: 0.965, 0.927, 0.902, 0.82, 0.77
  - OH⁻, F⁻, SCN⁻, HS⁻, ClO₃⁻, ClO₄⁻, BrO₃⁻, MnO₄⁻ 0.35: 0.965, 0.926, 0.900, 0.81, 0.76
  - K⁺, Cl⁻, Br⁻, I⁻, CN⁻, NO₂⁻, NO₃⁻, HCOO⁻ 0.3: 0.965, 0.925, 0.899, 0.81, 0.75
  - Rb⁺, Cs⁺, Tl⁺, Ag⁺, NH₄⁺ 0.25: 0.965, 0.925, 0.897, 0.80, 0.75
  - Mg²⁺, Be²⁺ 0.8: 0.872, 0.756, 0.690, 0.52, 0.44
  - Ca²⁺, Cu²⁺, Zn²⁺, Sn²⁺, Mn²⁺, Fe²⁺, Ni²⁺, Co²⁺, phthalate²⁻ 0.6: 0.870, 0.748, 0.676, 0.48, 0.40
  - Sr²⁺, Ba²⁺, Cd²⁺, Hg²⁺, S²⁻ 0.5: 0.869, 0.743, 0.668, 0.46, 0.38
  - Pb²⁺, CO₃²⁻, SO₃²⁻, C₂O₄²⁻ 0.45: 0.868, 0.741, 0.665, 0.45, 0.36
  - Hg₂²⁺, SO₄²⁻, S₂O₃²⁻, CrO₄²⁻, HPO₄²⁻ 0.40: 0.867, 0.738, 0.661, 0.44, 0.35
  - Al³⁺, Fe³⁺, Cr³⁺, La³⁺, Ce³⁺ 0.9: 0.737, 0.540, 0.443, 0.24, 0.18
  - PO₄³⁻, Fe(CN)₆³⁻ 0.4: 0.726, 0.505, 0.394, 0.16, 0.095
  - Th⁴⁺, Zr⁴⁺, Ce⁴⁺, Sn⁴⁺ 1.1: 0.587, 0.348, 0.252, 0.10, 0.063
  - Fe(CN)₆⁴⁻ 0.5: 0.569, 0.305, 0.200, 0.047, 0.020
- Standard potentials E°/V vs SHE: Li⁺ −3.045; K⁺ −2.925; Ba²⁺ −2.906; Na⁺ −2.714; Mg²⁺ −2.363; Al³⁺ −1.662; Mn²⁺ −1.180; 2H₂O + 2e⁻ → H₂ + 2OH⁻ −0.83; Zn²⁺ −0.763; Cr³⁺ −0.744; Fe²⁺ −0.440; Cd²⁺ −0.403; PbSO₄ + 2e⁻ → Pb + SO₄²⁻ −0.350; Pb²⁺ −0.126; 2H⁺ 0.000; C + 4H⁺ + 4e⁻ → CH₄ +0.13; Cu²⁺/Cu⁺ +0.153; Sn⁴⁺/Sn²⁺ +0.154; Cu²⁺/Cu +0.337; H₂SO₃ + 4H⁺ + 4e⁻ → S + 3H₂O +0.450; Cu⁺/Cu +0.521; Fe³⁺/Fe²⁺ +0.771; Ag⁺/Ag +0.799; Hg²⁺/Hg +0.854; Br₂/Br⁻ +1.065; O₂ + 4H⁺ → 2H₂O +1.229; Cl₂/Cl⁻ +1.359; Au⁺/Au +1.83; Co³⁺/Co²⁺ +1.808; F₂ + 2H⁺ + 2e⁻ → 2HF +3.06.

## Booklet: chemical sensors and potentiometry (Topic 3b)
- Cations: E = const + (RT/nF) ln a = const + 2.303(RT/nF) log a = const + (0.0592/n) log a (25 °C). Anions: the same with a **minus** sign.
- Selectivity coefficient: K_ij^pot = (a_i × 10^((E₂−E₁)/s) − a_i′) / a_j^(n/x). E₁ = potential with primary ion only; E₂ with primary + interferent; a_i activity of primary ion alone, a_i′ of primary ion in the mixture, a_j of interferent in the mixture; s = calibration slope; n, x = charges of primary and interfering ions. Activities need I for each solution and Debye–Hückel.
- Lecture facts (Topic 3b): chemical sensor = selective chemistry region + transducer (electrochemical, optical, mass, heat). Potentiometry measures cell potential with no appreciable current: reference electrode + indicator electrode + meter. ISE membranes: glass, sparingly soluble inorganic salts (single crystal LaF₃; pressed powder Ag₂S), polymer-immobilised ionophore (PVC). Glass electrode: sodium silicate (Al₂O₃, Na₂O, SiO₂), 0.3–0.4 mm thick; conditioned in 0.1 M HCl for 1 h to make silanol groups (−SiO⁻H⁺); response ∝ a(H⁺); interferents are alkali metal ions; both electrodes sit in one barrel (internal 0.1 M HCl, Ag/AgCl). Cell notation: reference on the left, sensor on the right; E = E_RHS − E_LHS = E_G + E_G′ + E_R′ − (E_R + E_J); only E_G varies with pH; the junction potential is the largest error (worse when calibration and sample ionic strengths differ, or temperature changes). Junction potential: ions diffuse at different rates (H⁺ faster than Cl⁻), the dilute side becomes positive. Gas probes: gas-permeable membrane over an inner solution with an ISE: NH₃ (0.1 M NH₄Cl, pH glass; E = const − 59.2 log[NH₃]; amines interfere), CO₂ (NaHCO₃, pH glass), SO₂ (NaHSO₃, pH glass), HF (H⁺, F⁻/LaF₃), H₂S (pH 5 buffer, S²⁻/Ag₂S), HCN (KAg(CN)₂, Ag⁺/Ag). LaF₃ doped with EuF₂, F⁻ hops between vacancies (Frenkel defects), slope −59.2 mV, OH⁻ interferes. Ag₂S membrane: Ag⁺ mobile; senses S²⁻ indirectly through Ksp, slope −29.6 mV per decade of a(S²⁻). PVC membrane = polymer ~30%, plasticiser 65–70%, ionophore ~1%, salt ~1%; K⁺ electrode uses valinomycin (cavity size gives selectivity; serum K⁺ 3.5–5.0 mM vs Na⁺ 135–145 mM), NH₄NO₃ bridge keeps K⁺ from the KCl reference out of the sample. Slopes at 298 K: ±59.2 / ±29.6 / ±19.7 mV per decade for z = 1, 2, 3 (cations +, anions −); Nernstian if within about ±1–2 mV; linear range usually 10⁻⁵–10⁻¹ M with curvature below 10⁻⁵ M. Calibration: condition in 0.01 M of the ion for 1 h, then de-ionised water for 30 min; stir gently; steady when the potential changes by no more than ±0.1 mV in 60 s. ISA (ionic strength adjuster) makes γ constant so the electrode follows concentration; TISAB for fluoride: NaCl (ionic strength), sodium acetate (pH 5–6, avoids OH⁻), CDTA (complexes Al(III) and Fe(III)). K^pot classes: < 10⁻³ very weak, 10⁻³–1 intermediate, = 1 equally selective, > 1 prefers the interferent. Two-point method: 0.001 M primary ion alone (E₁), then 0.001 M primary + 0.1 M interferent (E₂); use 0.01 M primary if interference is strong. Worked example in the lecture: Ca²⁺ ISE, s = +29.6 mV, E₁ = −20.1, E₂ = −19.8 mV, 0.001 M CaCl₂ and 0.1 M NaCl → I = 0.003 and 0.103 M, γ(Ca²⁺) 0.79 and 0.40, γ(Na⁺) 0.77, a_i 7.9×10⁻⁴, a_i′ 4.0×10⁻⁴, a_j 7.7×10⁻², K = 6.9×10⁻² (intermediate).
- The lecture uses 59.2 mV; the booklet uses 0.0592 V. Treat both as equal.

## Booklet: atomic and molecular spectroscopy (Topic 4)
- E = hν = hc/λ with **h = 6.63×10⁻³⁴ J s, c = 3.00×10⁸ m s⁻¹**. T = I/I₀. A = −log T = log(I₀/I) = εbc.
- Stern–Volmer: Φ₀/Φ_Q = 1 + (k_q / (k_e + k_d)) [Q] (Φ₀ quantum yield without quencher, Φ_Q with it).
- Boltzmann: N_e/N₀ = (g_e/g₀) exp[−(E_e − E₀)/kT], k = 1.381×10⁻²³ J K⁻¹ (excited-state population in a flame, Topic 4c).
- Heisenberg: δE δt ≥ h/4π (natural line width of an atomic line).
- Topic 4b lecture (molecular fluorescence): fluorescence and absorption instruments differ in geometry and background: the emission is viewed away from the excitation beam (diagram shows 90°), with a fixed excitation wavelength and a scanned emission monochromator, and a near-zero background, so it is extremely sensitive (absorbance is a small difference between large signals). Fluorescence sensors are used for anions and dissolved oxygen. Jablonski ideas: absorption A; vibrational relaxation (R₁–R₄, < 10⁻¹⁵ s, energy to the solvent, ends in the lowest vibrational level); internal conversion IC (same spin, from the lowest vibrational level of one electronic state to a high vibrational level of a lower one, e.g. S₁ → S₀); intersystem crossing ISC (isoenergetic, between different multiplicities, e.g. S₁ → T₁); fluorescence F (S₁ → S₀, same spin, lifetime 10⁻⁹–10⁻⁴ s as the slide states); phosphorescence P (T₁ → S₀, different spin, 10⁻⁴–10² s); non-radiative quenching timescale 10⁻⁹–10⁻⁶ s. Stokes shift: emitted light has a longer wavelength than the excitation; causes are re-optimisation of the molecule's geometry in S₁ and interactions with the environment (solvent); absorption and emission spectra are approximate mirror images when vibrational spacings are similar and transition probabilities are similar. Quantum yield = photons emitted ÷ photons absorbed = molecules that fluoresce ÷ excited molecules; high for rigid molecules and many substituted aromatics (Φ_F → 1); a rise in temperature lowers it. Quenching: M + hν → M*; M* → M + hν; M* + Q → M + Q*, then Q* → Q + heat.
- Topic 4a and 4c lectures have not been supplied. From the papers: Beer–Lambert with dilution chains, %T ↔ A, cm⁻¹ → nm → Å, AAS components, absorbance vs fluorescence instrument layout. Qualitative AAS/layout items in the bank come from standard texts and should be checked against the slides.

## Booklet: extractions
K = a_s2/a_s1 ≈ [S]₂/[S]₁. Fraction left in the aqueous phase after i extractions f = (V_aq / (V_aq + V_org K))^i; [A]_i = f·[A]₀. Distribution coefficient D = c_org/c_aq = [B]_org / ([B]_aq + [BH⁺]_aq), which the booklet follows with D = K·K_a/(K_a + [H⁺]) (this one fits a base B/BH⁺) and D = K·[H⁺]/(K_a + [H⁺]) (the matching acid form: my reading, check against the slide); metal-chelate extraction D ≈ K_M β K_a^n [HL]_org^n / (K_L^n [H⁺]_aq^n); for pH-dependent extractions use D in place of K in f. No lecture or past question has been seen.

## Booklet and lecture: chromatography (not yet in the app)
- Resolution R_S = 2[(t_R)_B − (t_R)_A]/(W_A + W_B) = 1.178[(t_R)_B − (t_R)_A]/(W½A + W½B) (booklet; the lecture writes 1.177, N with 5.52 and W = 1.699 W½, the booklet writes 1.178 and 5.55: the booklet is what is in the exam). R_S < 1.0 poor, = 1.0 partial, ≥ 1.5 baseline separation.
- t_S = t_R − t_M; k = t_S/t_M = (t_R − t_M)/t_M; α = t_S(B)/t_S(A) = k_B/k_A = K_B/K_A. N = L/H = 16 (t_R/W)² = 5.55 (t_R/W½)² ≈ 41.7 (t_r/w₀.₁)² / (A/B + 1.25). H = σ²/x.
- Purnell: R_S = (√N/4)((α − 1)/α)(k_B/(1 + k_B)). R_S ∝ √N ∝ √L (doubling L raises R_S by √2; doubling R_S needs 4× the length). The k_B/(1 + k_B) term levels off: 0.5 at k = 1, 0.83 at 5, 0.91 at 10.
- Band spreading: σ = √(2Dt); σ²_injection = σ²_detector = (ΔV)²/12; σ²_tubing = π d_t⁴ l_t u_v / (384 D); wall-coated column k = K/β, β = r/(2d_f); ln k = ΔH_vap/RT + ΔH_mix/RT + constant. Causes: multiple flow paths (eddy diffusion), longitudinal diffusion, finite equilibration time. Van Deemter H ≈ A + B/u_x + C u_x: below the optimum velocity B/u dominates, above it C u dominates, at the optimum B/u and Cu contribute equally and H is lowest (N greatest); open-tubular GC column has A ≈ 0. Peak asymmetry: tailing (some molecules retained too strongly, come out late) and fronting (overload, part of the band retained less strongly and comes out early); K = C_S/C_M; if K falls with concentration the peak tails, if K rises it fronts; the two are not exact opposites in mechanism.

## What the app covers today (CM2011 bank, PR #7)
Topic 1 statistics and quantitation (mean/s/%RSD, SEM, Q-test, CI, pooled and paired t, error propagation, ppm, dilution, Kjeldahl); Topic 3a (ionic strength, γ, half-cell and full-cell Nernst with activities, Ksp → E°, ΔG and K); Topic 3b (slopes, calibration, selectivity, interference error, Ag₂S/AgCl slope, gas probes, membranes, written explanations); Topic 4 (Beer–Lambert, wavenumbers, instrument layouts, fluorescence and AAS concepts). 37 families, 128 variants, 37 skills, 11 topics. Final-style paper = 4 questions, about 85–90 marks.

## Content corrections to make (found by comparing the bank with the booklet)
1. **Q-test table:** the bank uses 3-decimal values (0.642, 0.507, 0.468, 0.765). Use the booklet's 2-decimal values (0.64, 0.51, 0.47, 0.76); n = 3 is not in the table, so drop it.
2. **α(Na⁺)** is 0.43 (bank uses 0.4). Re-check the selectivity golden test (K ≈ 0.069 should still hold within its tolerance). **E°(Mg²⁺/Mg)** is −2.363 (bank uses −2.37).
3. **Constants:** use h = 6.63×10⁻³⁴, c = 3.00×10⁸, R = 8.3143, k = 1.381×10⁻²³ where the exam gives them.
4. **Stems print t, Q_crit and α values the exam does not print.** Replace with an in-app "Booklet" drawer holding the tables above (t, Q, γ, E°, equations, PSI), reachable in study and mock, and move the printed values into the Hint. Add look-up-style variants (γ from the table at the nearest I; E° from the table).
5. **Add a "convert between SCE and SHE" family** (±0.242 V).
6. **Scope gaps to build:** Topic 2 PSI (formula, band table, overall PSI, category); Topic 4b quantum yield, Stern–Volmer, Stokes shift, relaxation processes (written and pick); Topic 4c Boltzmann populations and Heisenberg linewidth (calculations) plus AAS/AES concepts once slides arrive; extractions (K, f after i extractions, D with pH, number of extractions needed); chromatography (k, α, N, H, R_S, Purnell, plate-height scaling, van Deemter qualitative, peak asymmetry). Extend `SEED_MODULES` CM2011 weeks beyond 7 (or rename them as topics) and add chunks to `build.mjs`.
7. The final-style recipe (`Scheduler.FINAL_RECIPES.CM2011`) should add the new topics once they exist.

## Uncertainties to keep visible
- Final scope beyond week 7 is inferred from the booklet. The 2011-12 paper is old.
- PSI: the overall PSI rule, the 401–500 PM2.5 band, and use of I_max,J as the lower anchor in the formula are read from one slide.
- Extraction distribution-coefficient forms are transcribed from slide images; check them against the lecture before generating questions.
- Topic 4a/4c slides and a Topic 3a lecture beyond the booklet slides have not been seen.
