# CM2011 finals: what the papers actually show

Written 19 Nov 2026. Numbers come from `dataset.csv` (one hand-coded row per sub-question) through `analyse.mjs`; re-run `node docs/cm2011-finals/analyse.mjs` after adding a paper. **Scope: finals only** (owner steer, 19 Nov 2026: the mid-semester tests do not count). No mid-term or mid-sem paper is used in any count or recommendation below. Tags: **[data]** counted from the papers, **[inference]** my reading, **[advice]** my recommendation.

## 0. What the data is, and is not

- **11 finals, first half only.** 2009/10, 2010/11, 2011/12, 2014/15, 2015/16, 2017/18, 2019/20, 2021/22, 2023/24, 2024/25, 2025/26. Each file holds the first-half (weeks 1–7) questions with keys: Q1–Q2 in most years, Q3–Q4 in 2014/15 and 2015/16. That is 22 questions and 550 marks; every question sums to 25 in my coding, which is the check that I read each one correctly. **Not held:** 2012/13, 2013/14, 2016/17, 2018/19, 2020/21, 2022/23.
- **32 marks (6%)** are labelled NOT EXAMINABLE in the files (power-rule propagation, two-component Beer–Lambert, the Harned cell). All sit in 2009/10 and 2014/15. They are excluded from the shares below.
- **The second half (weeks 8–13, Ye Hui) is thinner still:** one document, `Previous_final_1.docx` (Q3–Q4), plus the lecturer's practice and Q&A decks. File metadata show the docx is the lecturer's own file: created 30 Sep 2025 from an older template, last saved by Ye Hui on 4 Nov 2026. The cover still says "November 2022" and "13 pages" (the 2025/26 Q1–Q2 PDF says 14), and its Q4 marks add to 27, so read it as "probably the 2025/26 second half, or a lecturer-made sample" and ignore its mark split.
- **Coding is mine.** A "family" is a recurring question type. Counts are descriptive (n = 11); they are base rates, not forecasts.

## 1. Headline numbers [data]

| Block | All 11 | 2009–15 (5 papers) | 2017–26 (6 papers) |
|---|---|---|---|
| Topic 1 statistics and uncertainty | 19% | 15% | 22% |
| Topic 2 air quality (PSI) | 7% | 7% | 7% |
| Topic 3a electrochemistry | 20% | 27% | 15% |
| Topic 3b potentiometry / ISE | 28% | 29% | 27% |
| Topic 4 spectroscopy | 26% | 22% | 29% |

- **What you have to do:** calculation 64% (61% since 2017), explanation 22%, "why was it done this way" 4%, diagram or label 5%, graph 3%, unit conversion 2%. About a third of the marks are written or drawn.
- **Breadth is rising.** Parts per question 4.4 → 6.3; mean part size 5.0 → 4.0 marks; parts worth 10+ marks 4 → 2; distinct families in 50 marks 6–8 (2009–14) → 9–11 (since 2015/16).
- **Blocks with 5+ marks per paper:** statistics 11 of 11, ISE 9, spectroscopy 9, electrochemistry 7, Topic 2 four (4 of the 7 papers since 2015/16). A paper substantively covers 3 to 5 of the 5 blocks (mean 3.6).

### Marks per family per paper (· = absent; columns are 2009/10 … 2025/26)

| Family | 09 | 10 | 11 | 14 | 15 | 17 | 19 | 21 | 23 | 24 | 25 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S-T2 two-method t-test | 5 | 6 | 4 | 6 | 6 | 5 | 5 | 4 | 4 | 4 | 4 |
| S-PROP propagation | 3 | · | · | · | · | 5 | 5 | 5 | 5 | 5 | 5 |
| I-CAL calibration + dilution chain | · | · | 4 | 7 | · | 5 | 8 | 6 | 7 | · | 6 |
| B-BL Beer–Lambert chain | · | 8 | · | · | · | · | 5 | 3 | 8 | · | 5 |
| B-CONV nm / cm⁻¹ / Å | · | · | · | · | 2 | · | 2 | 2 | 2 | · | 2 |
| E-CELL cell with activities (table) | 15 | · | 8 | · | 8 | · | · | · | · | 15 | · |
| E-KSP E° from Ksp | · | 10 | 10 | · | · | · | · | · | · | · | 5 |
| E-I / E-ACT / E-PH / E-DG / E-CELLINV | 5 | · | · | · | 3 | 8 | · | 4 | 2 | 5 | 5 |
| A-PSI + A-AVG + A-BREATH | · | · | · | · | 11 | 8 | · | · | · | 6 | 6 |
| I-SEL selectivity coefficient | · | 15 | · | · | · | · | · | · | 8 | · | · |
| I-GAS ammonia / Kjeldahl | · | · | 11 | · | · | 8 | · | · | · | · | 8 |
| I-CON explain TISAB, activity, interferent | · | · | 4 | 5 | 6 | · | 4 | 2 | 2 | · | · |
| C-FREE ISE free vs ICP/AAS total | · | 3 | · | 2 | · | · | · | 2 | 2 | · | · |
| B-FLU fluorescence, Jablonski | · | 4 | · | · | 6 | · | · | 16 | · | 6 | · |
| B-INSTR instrument description | · | · | · | 5 | · | · | 9 | · | 10 | 5 | · |
| B-ATOM Boltzmann, broadening, ICP vs AAS | 10 | 4 | · | 5 | 3 | · | 4 | · | · | · | · |

(Full 31-row version: run the script. Rows above merge the small electrochemistry and air families.)

## 2. Patterns worth acting on

**P1. The two-method t-test is in every paper, and its level has climbed.** [data] 11 of 11 (4–6 marks): 7 paired, 4 pooled. Level: 95% in 4 papers (2010/11–2017/18), 99% in 2, **99.9% in the last four I hold (2021/22, 2023/24, 2024/25, 2025/26)**. Context: air data (PM2.5 or SO₂) in 5 papers; ISE against ICP or AAS in 4, each followed by a 2–3 mark "why do they differ" (ISE sees the free ion, ICP/AAS the total). The booklet's t table is an image with rows 1–10, 15, 20, 25, 30, 40, 60, 120 and ∞, so there is **no 11-df row**; every key takes the next lower tabulated df (4.587 for 11 df at 99.9% in 2021/22; 3.725 for 26 df in 2025/26). The app's t-test generators are 95% only and print the t value, so they train the wrong column.

**P2. Propagation is now a fixture.** [data] 7 of 11, and 6 of the last 6, always 5 marks and always a mixed expression (a sum or difference inside a product or quotient). 2023/24 gave an uncertainty larger than the value (±655%); 2024/25 subtracted two products. Keys: percent uncertainty to a whole number; the absolute uncertainty is given to 1, 2 or 3 s.f. depending on the year, so do not spend time on that convention (it also differs from the Topic 1 lecture rule).

**P3. Questions come back unchanged after fifteen years.** [data] The share of each paper's marks in a family already seen earlier in the set: 20%, 44%, 83%, 64%, 76%, 88%, 84%, 100%, 78%, 100% (2010/11 → 2025/26; family-level, so a floor given the missing papers). Verbatim returns: Ag₂SO₃ with Ksp 1.5×10⁻¹⁴ (2010/11 Q2(b) → 2025/26 Q1(b)); Cd/Cr at 0.01 and 0.033 M in a 15-mark table (2009/10 Q1(b)) → Hg/Al at the same concentrations in the same table (2024/25 Q2(c)); precipitation lowering ionic strength (2009/10, 2025/26); the Kjeldahl/ammonia-ISE layout (2011/12 → 2025/26); a 2017/18 inverse question that gives E_cell (+1.146 V) and asks for the activity. [inference] Dormancy is not retirement; the only retirements are the 32 NOT EXAMINABLE marks. Do not discard old papers.

**P4. No block is safe to skip.** [data] Each block except statistics has been (nearly) absent from some paper: ISE in 2009/10 and 2024/25, spectroscopy in 2011/12 and 2017/18, electrochemistry in 2014/15 and 2019/20 (≤4 marks in 2021/22 and 2023/24 as well), Topic 2 in six papers. There is no anti-repeat rule either: the 24-h vs 1-h PSI reasoning is in both 2024/25 and 2025/26. [advice] Topic 2 is the cheapest block to master per mark (one formula plus a few sentences) and sits in 4 of the last 7 papers.

**P5. The unpredictable part is small and mostly "why".** [data] Families new to the set in the last five papers carry 0–22% of marks and are nearly all explanation or small calculations: the levels at which a verdict flips; why dilute the blood; why pH 9.7; why excess reagent; why activity is below concentration; why 24-h values barely move; a two-point calibration; pH from activities. Twists inside known families come on top of that: mark a pathway on a Jablonski figure (2024/25), the effect of 0.5 M instead of 1.0 M NaOH in the calibration (2025/26; the key accepts "yes" and "no" with reasoning), "state the assumption" in a Beer–Lambert chain (2025/26). My family-level coding does not count those as novel, so true novelty is higher than the 0–22%. [inference] All of these are answerable from equilibrium, proportionality and linear-range arguments, so they are prepared for by generating rationales, not by memorising lists.

**P6. Calibration with a dilution chain is the recurring multi-stage calculation.** [data] 7 of 11, and 5 of the last 6. The data are Nernstian (60 or 30 mV per decade in most), so log c can be computed algebraically as well as read off the graph. A hand-plotted graph with labelled axes carries marks of its own (2 in 2021/22, 4 in 2019/20, 6 in 2025/26). The chain (two or three stages, aliquot against flask volume, TISAB or background salt added) is where the marks leak.

**P7. The big single parts are rare now.** [data] Two parts worth 10+ marks since 2017 (a 10-mark AAS table, a 15-mark cell table) against four in 2009–15. A 15-mark table question is also where one early slip cascades, so write intermediate values (I, γ, E per half-cell) and expect error-carried-forward credit.

**P8. The written marks are a bounded set.** [data] Explain, rationale and diagram marks per paper: 8, 11, 11, 12, 20, 10, 23, 26, 14, 13, 11 (of 50; of 38 and 30 live marks in 2009/10 and 2014/15). They were 20–26 in 2015/16, 2019/20 and 2021/22 and 11–14 in the last three. The same topics recur: free vs total (4 papers), ISE explanations such as TISAB, constant background electrolyte, activity vs concentration and interferents (6), fluorescence (4), instrument description (4). Keys give one mark per distinct point ("2 unique points for each topic").

## 3. Taught or supplied in the booklet, never asked in 11 finals [data]: the curveball reservoir

| Item | Where it is supported | Cost to cover |
|---|---|---|
| Known-value t-test (t = \|x̄ − μ\|√N / s) | Booklet; Topic 1 Ex Q3 | 20 min (same machinery as paired) |
| Confidence intervals at 50/90/99% and what they mean | Booklet; Topic 1 Ex Q2; in finals only once (2017/18) | 20 min |
| Photon energy E = hν (h and c are in the booklet) | Booklet; Topic 4 Ex Q1 | 10 min |
| Stokes shift, quenching, Stern–Volmer, quantum yield | 4b deck; booklet Stern–Volmer; Topic 4 Ex Q4(e); the word "Stokes" is in no final | 30 min |
| Solubility with activities; mean activity coefficient γ± | Booklet; Topic 3 Ex Q6–Q7 | 30 min |
| Saturated-salt electrode cell, Zn \| ZnSO₄, PbSO₄ \| Pb | Topic 3 Ex Q3 | 20 min |
| Junction-potential explanation and pH-meter errors as a stand-alone question | Topic 3 Ex Q9–Q10 (only touched indirectly in 2025/26) | 20 min |
| SHE ↔ SCE / Ag-AgCl conversion | Topic 3a slide 37b (new, no precedent) | 10 min |
| Heisenberg line-width numbers | Booklet (qualitative in 2009/10 and 2010/11) | 10 min |

[inference] Each is individually unlikely; together they are where a curveball would come from. About 3 hours covers all of them once.

## 4. The second half [data where stated]

An evidence ladder, with mid-terms left out:

- **Seen in a final (one paper, the docx).** Q3 (25): D at pH 5 for benzoic acid in ether, concentration left in the ether, % extracted, "is the ether concentration higher at pH 5 or pH 9?", minimum number and volume of extractions: an extraction chain with pH. Q4: TCD and FID principles, open-tubular vs packed with two applications, temperature programming, isocratic vs gradient, reversed-phase elution order, GC–MS vs LC–MS. **Q4 has no calculation.**
- **In the lecturer's own practice and Q&A decks, never seen in a final.** Repeated extractions and D(pH) for a base; k, α and K from V_S/V_M; void time shared by all solutes; linear vs volume flow and scale-up; open-tubular phase ratio; R_s, N, H and Purnell; van Deemter; peak asymmetry.
- **[inference] What goes into Q3–Q4 beyond the docx is open.** Fifty marks must span extraction, chromatography basics, efficiency and GC/HPLC; in the one paper I hold they went on extraction and descriptive GC/HPLC. Efficiency has its own practice and Q&A decks (11 and 13 pages), which suggests it is meant to be assessed, but I have no paper showing it. My earlier claim that it is "probably first tested in the final" leaned on the mid-term schedule and was weaker than I made it sound.
- **[advice]** Order the second half by evidence: the extraction chain with pH; the written GC/HPLC set (one point per mark); then efficiency with k and α as its inputs; flow and phase-ratio algebra last.

## 5. How I would study [advice]

The marks are about 64% calculation and about a third written or drawn, with a small remainder of twists inside both. Global "module fluency" is not scored for itself, so I would build it around a few ideas that generate the explanations and the twists, and I would drill the procedures to the point where they cost no thought.

1. **Diagnose (day 1).** Do an older Q1–Q2 cold in 60 minutes (2019/20 or 2021/22; save 2024/25 and 2025/26 for the last mocks). Mark against the key and tag every lost mark: method, table lookup, arithmetic, units, rounding, concept, omission. The tags decide the time split.
2. **Make the machines automatic** (the calculation marks, 61–64% of the total), ordered by marks × frequency: t-tests (paired or pooled by data layout; 99.9% column; next lower df), propagation, calibration with dilution chain (plus the ammonia/Kjeldahl wt% N), Beer–Lambert chain with the three unit conversions, the cell/Ksp/ionic-strength/pH block (E_cell = E_right − E_left, ½ half-cells, ΔG° from E° with the n as written, I from each compartment's own salt), the PSI chain, selectivity. Second half, in order of evidence: the extraction chain with pH (which phase is original, D for acid and for base, pH = pK_a gives D = K/2, number of extractions); the written GC/HPLC set as one point per mark; then efficiency (N, H, R_s, Purnell with k and α as inputs, van Deemter, asymmetry); flow and phase-ratio algebra last. Three clean passes each on fresh numbers, against a time of 1.2 minutes per mark.
3. **Build the "why" layer.** For each technique (ISE, ammonia probe, spectrophotometry, fluorescence, AAS/ICP, extraction, GC, HPLC) write five lines from memory: what it responds to; what that is proportional to; what corrupts it; what the protocol does about it; what you would see if the protocol were broken. Then answer 40 "why" prompts in point-per-mark form (2 marks = 2 distinct points).
4. **Practise twists.** On each family apply six operators and predict the direction before computing: invert (solve for the input); swap which phase or electrode is "original"; perturb one condition (ionic strength, pH, flow, temperature, concentration of a reagent); delete a reagent; change the level, charge or n; change units or scale (mg ↔ µg, mL ↔ L, Å ↔ cm⁻¹). Every "new" item in P5 fits one of these.
5. **Sweep the reservoir** (section 3) once, one worked example each.
6. **Mock at real density.** Two 60-minute half-papers, reviewed against the error log; re-drill the three most frequent error types. Last 48 hours: no new content, re-read the error log and a one-page list of the invariants below.

**Invariants that unify the module** (the explanations and twists fall out of them):
- Signal proportional to what? ISE to log activity of the free ion; Beer–Lambert to concentration; AAS to ground-state population, AES to excited-state population. This gives TISAB, free vs total, temperature sensitivity, zero-background sensitivity of fluorescence.
- Partitioning is one idea at two scales: K, D and f in extraction; k = K·V_S/V_M and α = K_B/K_A in chromatography.
- Is the difference larger than its uncertainty? t-test, confidence interval, Q-test, and resolution R_s are the same question.
- Activity versus concentration: one machinery (ionic strength, γ) in cells, ISE, pH and solubility.
- Energy-level pictures: Jablonski, Boltzmann populations, lifetimes and line width.
- Band spreading as three competing terms (A, B/u, Cu) with an optimum velocity.

## 6. What this means for the app [advice]

- **Final recipe for the first half:** always an S-T2 (99.9%, paired or pooled, air or ISE-vs-ICP context, no printed t) and an S-PROP (mixed), then draws from the rotating families weighted by the grid, plus one twist slot. Second half: an extraction chain and a written GC/HPLC/efficiency question. No MCQ or mid-term-style mock: the final is written.
- **Gaps in the bank against this analysis:** t-tests at 99% and 99.9% with a booklet look-up; Topic 2 (none at all); the calibration-with-dilution chain as one question; pH from activities; precipitation-and-ionic-strength; inverse cell problems; the two-point linear calibration; the "why" bank; and the entire second half (extraction, chromatography, GC/HPLC). Second-half content is the largest gap by marks.

## 7. Caveats

- n = 11 first-half papers and one second-half paper; everything above is a base rate.
- Missing years may contain families I have not seen; recycling shares are lower bounds.
- Keys contain slips (for example the 2017/18 confidence interval uses 10-df t values where a 9-df row exists), so show working rather than matching a key digit for digit.
- The second-half evidence is the current lecturer's, which is the right source, but it is one paper.
