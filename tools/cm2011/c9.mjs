import { range, choice, num, kw, calc, pick, written, node } from './lib.mjs';

/* Chromatography theory (week 9 of the app): retention (k, alpha), resolution, plate number and height, the Purnell equation,
   flow and scale-up, van Deemter, peak shape and the types of chromatography. The booklet prints R_S, N, k, alpha and the Purnell
   form; the lecturer's practice decks and the 4 Nov slides supply the worked examples used as golden tests. The final's Q4 held
   so far is descriptive, so this block carries a modest share of the marks. Booklet constants: R_S = 2(tB - tA)/(WA + WB) =
   1.178 (tB - tA)/(w½A + w½B); N = 16 (tR/W)^2 = 5.55 (tR/w½)^2.
   The decks disagree on which way the isotherm bends tailing vs fronting (contested: not asked here). */
const SRC = 'Chromatography slides; booklet (efficiency and band spreading)';
const THEME = 'Chromatography theory';
const WEEK = 9;
const out = [];
const add = (nd, skill) => out.push({ node: nd, skill });
const mk = (extra) => ({ week: WEEK, source: SRC, theme: THEME, ...extra });
const S = (expr, d) => '$' + '{{sci(' + expr + ', ' + d + ')}}' + '$';

/* ---------- retention factor and selectivity ---------- */
add(node(mk({
  id: 'bk-m11-c-retention', title: 'Retention factor k and selectivity α', tags: ['retention', 'k', 'alpha'], family: 'chrom-retention', exam: 'short_2to3', mins: 5,
  variants: [
    calc({
      id: 'ret-times', label: 'k and α from retention times (6 marks)', marks: 6,
      stem: 'On a column the unretained compound elutes at **{{fix(tM,2)}} min**. Solute A elutes at **{{fix(tA,2)}} min** and solute B at **{{fix(tB,2)}} min**. Calculate the retention factor of each solute and the selectivity factor α.',
      hint: 'k = (t_R − t_M)/t_M. α = k_B/k_A, with B the more retained solute (α ≥ 1).',
      explanation: 'The time a solute spends in the stationary phase is t_S = t_R − t_M, so k = t_S/t_M: k_A = {{fix(kA,2)}} and k_B = {{fix(kB,2)}}. The selectivity factor is the ratio of the two retention factors, α = k_B/k_A = {{fix(al,2)}} (the same as the ratio of the adjusted times t_S). α = 1 would mean no separation.',
      sampled: { tM: range(0.25, 0.60, 0.01, 2), tA: range(3.0, 7.0, 0.1, 1), dt: range(0.6, 2.5, 0.1, 1) },
      derived: { tB: 'tA + dt', kA: '(tA - tM) / tM', kB: '(tB - tM) / tM', al: 'kB / kA' },
      fields: [
        num('kA', 'k of solute A', '', 'kA', { relTol: 0.01, sig: 3, paths: [{ label: 'Subtract the unretained time first: k = (t_R − t_M)/t_M, not t_R/t_M.', expr: 'tA / tM' }] }),
        num('kB', 'k of solute B', '', 'kB', { relTol: 0.01, sig: 3, paths: [{ label: 'Subtract the unretained time first: k = (t_R − t_M)/t_M, not t_R/t_M.', expr: 'tB / tM' }] }),
        num('al', 'Selectivity factor α', '', 'al', { relTol: 0.01, sig: 3, paths: [{ label: 'α uses the adjusted times (or the k values), not the raw retention times.', expr: 'tB / tA' }], ecf: [{ expr: 'u_kB / u_kA', label: 'Consistent with your own k values.' }] }),
      ],
    }),
    calc({
      id: 'ret-partition', label: 'k and α from K and the phase volumes (6 marks)', marks: 6,
      stem: 'Two solutes have distribution constants **K_A = {{fix(KA,1)}}** and **K_B = {{fix(KB,1)}}** (K = c_S/c_M) on a column that holds **{{fix(VS,1)}} mL** of stationary phase and **{{fix(VM,1)}} mL** of mobile phase. Calculate k for each solute and α.',
      hint: 'k = K V_S/V_M (the amount in the stationary phase divided by the amount in the mobile phase). α = k_B/k_A = K_B/K_A.',
      explanation: 'k = n_S/n_M = c_S V_S/(c_M V_M) = K V_S/V_M, so k_A = {{fix(kA,2)}} and k_B = {{fix(kB,2)}}. The phase ratio cancels in α, which is simply K_B/K_A = {{fix(al,2)}}.',
      sampled: { KA: choice([2.0, 3.0, 4.0, 5.0]), r: choice([1.5, 2.0, 2.5, 3.0]), VS: choice([2.0, 4.0, 5.0, 8.0]), VM: choice([10.0, 16.0, 20.0, 25.0]) },
      derived: { KB: 'KA * r', kA: 'KA * VS / VM', kB: 'KB * VS / VM', al: 'KB / KA' },
      fields: [
        num('kA', 'k of solute A', '', 'kA', { relTol: 0.01, sig: 3, paths: [{ label: 'k is the amount ratio: multiply K by V_S/V_M. K alone is the concentration ratio.', expr: 'KA' }, { label: 'You inverted the phase ratio: k = K V_S/V_M.', expr: 'KA * VM / VS' }] }),
        num('kB', 'k of solute B', '', 'kB', { relTol: 0.01, sig: 3, paths: [{ label: 'k is the amount ratio: multiply K by V_S/V_M. K alone is the concentration ratio.', expr: 'KB' }, { label: 'You inverted the phase ratio: k = K V_S/V_M.', expr: 'KB * VM / VS' }] }),
        num('al', 'Selectivity factor α', '', 'al', { relTol: 0.01, sig: 3, ecf: [{ expr: 'u_kB / u_kA', label: 'Consistent with your own k values.' }] }),
      ],
    }),
    calc({
      id: 'ret-open', label: 'k and K for an open tubular column (4 marks)', marks: 4,
      stem: 'On an open tubular column of inner diameter **{{fix(dc,0)}} µm** with a stationary-phase film **{{fix(df,2)}} µm** thick, an unretained gas elutes at **{{fix(tM,0)}} s** and toluene at **{{fix(tR,0)}} s**. Calculate the retention factor of toluene and its distribution constant K. For a thin film take V_M/V_S ≈ d_c/(4 d_f).',
      hint: 'k = (t_R − t_M)/t_M and k = K V_S/V_M, so K = k V_M/V_S = k d_c/(4 d_f).',
      explanation: 'k = (t_R − t_M)/t_M = {{fix(k,2)}}. The phase ratio of a thin film is V_M/V_S ≈ d_c/(4 d_f) = {{fix(ph,1)}}, so K = k × {{fix(ph,1)}} = {{fix(K,0)}}.',
      sampled: { dc: choice([250, 320, 530]), df: choice([0.25, 0.5, 1.0, 2.0]), tM: choice([30, 40, 50, 60]), tR: range(150, 400, 10, 0) },
      derived: { k: '(tR - tM) / tM', ph: 'dc / (4 * df)', K: 'k * ph' },
      fields: [
        num('k', 'Retention factor k', '', 'k', { relTol: 0.01, sig: 3, paths: [{ label: 'Subtract the unretained time first: k = (t_R − t_M)/t_M.', expr: 'tR / tM' }] }),
        num('K', 'Distribution constant K', '', 'K', { relTol: 0.015, sig: 3, paths: [{ label: 'K = k × V_M/V_S, and V_M/V_S = d_c/(4 d_f); K is not equal to k.', expr: 'k' }, { label: 'The phase ratio of a film is d_c/(4 d_f); the factor 4 is missing.', expr: 'k * dc / df' }], ecf: [{ expr: 'u_k * ph', label: 'Consistent with your own k.' }] }),
      ],
    }),
  ],
})), { id: 'm11.c.retention', name: 'Retention factor k and selectivity α', chunk: 'c-calc', marks: 4, tags: ['retention'] });

/* ---------- resolution ---------- */
add(node(mk({
  id: 'bk-m11-c-resolution', title: 'Resolution of two peaks', tags: ['resolution'], family: 'chrom-resolution', exam: 'short_2to3', mins: 5,
  variants: [
    calc({
      id: 'rs-base', label: 'R_S from baseline widths and a verdict (4 marks)', marks: 4,
      stem: 'Two peaks have retention times **{{fix(tA,2)}} min** and **{{fix(tB,2)}} min** and baseline widths **{{fix(WA,2)}} min** and **{{fix(WB,2)}} min**. Calculate the resolution R_S and say how well the peaks are separated.',
      hint: 'R_S = 2 (t_B − t_A)/(W_A + W_B). R_S < 1.0 poor, about 1.0 partial, ≥ 1.5 baseline separation.',
      explanation: 'R_S = 2({{fix(tB,2)}} − {{fix(tA,2)}})/({{fix(WA,2)}} + {{fix(WB,2)}}) = {{fix(rs,2)}}. Resolution depends on both the distance between the peaks and their widths. Below 1.0 the peaks overlap noticeably, about 1.0 they just touch, and 1.5 or more is baseline separation.',
      sampled: { tA: range(5.0, 12.0, 0.1, 1), gap: range(0.4, 1.9, 0.1, 1), WA: range(0.30, 0.90, 0.01, 2), wd: range(0, 0.20, 0.01, 2) },
      derived: { tB: 'tA + gap', WB: 'WA + wd', rs: '2 * (tB - tA) / (WA + WB)', rs2: 'round(rs, 2)', v: "rs2 >= 1.5 ? 'baseline' : (rs2 >= 1 ? 'partial' : 'poor')" },
      fields: [
        num('rs', 'Resolution R_S', '', 'rs', { relTol: 0.01, sig: 3, paths: [{ label: 'The factor 2 is missing: R_S = 2(t_B − t_A)/(W_A + W_B).', expr: '(tB - tA) / (WA + WB)' }, { label: 'Use the mean width: the sum of the widths goes in the denominator with a factor 2 in the numerator.', expr: '(tB - tA) / ((WA + WB) / 2)' }] }),
        kw('v', 'The separation is', ['poor', 'partial', 'baseline'], 'v', { synonyms: { poor: ['poor', 'poorly resolved', 'not resolved', 'overlap'], partial: ['partial', 'partially resolved', 'partly resolved'], baseline: ['baseline', 'baseline resolved', 'baseline separation', 'fully resolved', 'complete'] }, displays: { poor: 'poor (R_S < 1.0)', partial: 'partial (about 1.0 to 1.5)', baseline: 'baseline (R_S ≥ 1.5)' } }),
      ],
    }),
    calc({
      id: 'rs-half', label: 'R_S from half-height widths (3 marks)', marks: 3,
      stem: 'Two peaks elute at **{{fix(tA,2)}} min** and **{{fix(tB,2)}} min**. Their widths at half height are **{{fix(hA,2)}} min** and **{{fix(hB,2)}} min**. Calculate R_S.',
      hint: 'Half-height widths use the booklet form R_S = 1.178 (t_B − t_A)/(w½A + w½B), not the one with 2.',
      explanation: 'When the widths are measured at half height the constant is 1.178 (it converts w½ to the baseline width W = 1.699 w½): R_S = 1.178({{fix(tB,2)}} − {{fix(tA,2)}})/({{fix(hA,2)}} + {{fix(hB,2)}}) = {{fix(rs,2)}}.',
      sampled: { tA: range(5.0, 10.0, 0.1, 1), gap: range(0.4, 1.9, 0.05, 2), hA: range(0.20, 0.45, 0.01, 2), hd: range(0, 0.10, 0.01, 2) },
      derived: { tB: 'tA + gap', hB: 'hA + hd', rs: '1.178 * (tB - tA) / (hA + hB)' },
      fields: [
        num('rs', 'Resolution R_S', '', 'rs', { relTol: 0.015, sig: 3, paths: [{ label: 'That is the form for baseline widths (factor 2). With half-height widths use 1.178.', expr: '2 * (tB - tA) / (hA + hB)' }] }),
      ],
    }),
    calc({
      id: 'rs-wider', label: 'What a change in width does to R_S (4 marks)', marks: 4,
      stem: 'Two peaks elute at **{{fix(tA,2)}} min** and **{{fix(tB,2)}} min** with baseline widths **{{fix(WA,2)}} min** and **{{fix(WB,2)}} min**. Calculate R_S. A different column makes **both** peaks **{{fix(p,0)}}% wider** with the same retention times. What is the new R_S?',
      hint: 'R_S = 2 (t_B − t_A)/(W_A + W_B). Both widths scale by (1 + p/100).',
      explanation: 'R_S = {{fix(rs,2)}}. Widening both peaks by {{fix(p,0)}}% multiplies the denominator by {{fix(f,2)}} while the separation of the peak centres is unchanged, so R_S falls to {{fix(rs2,2)}}: resolution depends on the width as well as the distance between the peaks.',
      sampled: { tA: choice([6.4, 7.2, 8.0, 9.0]), gap: choice([0.6, 0.9, 1.2, 1.5]), WA: choice([0.40, 0.48, 0.55, 0.60]), wd: choice([0.06, 0.12, 0.18]), p: choice([10, 20, 25, 30, 40]) },
      derived: { tB: 'tA + gap', WB: 'WA + wd', rs: '2 * (tB - tA) / (WA + WB)', f: '1 + p / 100', rs2: 'rs / f' },
      fields: [
        num('rs', 'R_S now', '', 'rs', { relTol: 0.01, sig: 3, paths: [{ label: 'The factor 2 is missing: R_S = 2(t_B − t_A)/(W_A + W_B).', expr: '(tB - tA) / (WA + WB)' }] }),
        num('rs2', 'R_S with wider peaks', '', 'rs2', { relTol: 0.01, sig: 3, paths: [{ label: 'R_S falls when the peaks widen: divide by (1 + p/100), do not multiply.', expr: 'rs * f' }], ecf: [{ expr: 'u_rs / f', label: 'Consistent with your own R_S.' }] }),
      ],
    }),
    calc({
      id: 'rs-length', label: 'Column length and R_S (4 marks)', marks: 4,
      stem: 'A column of length **{{fix(L,0)}} cm** gives R_S = **{{fix(R1,2)}}** for a pair of solutes. (a) What R_S would you expect from a column of the same kind and **{{fix(g,0)}} times the length**? (b) What length would you need to reach **R_S = {{fix(Rt,1)}}**?',
      hint: 'R_S ∝ √N and N ∝ L at fixed H, so R_S ∝ √L.',
      explanation: 'Resolution grows with the square root of the plate number, and N = L/H, so R_S ∝ √L. Multiplying the length by {{fix(g,0)}} multiplies R_S by √{{fix(g,0)}}: {{fix(R2,2)}}. To reach R_S = {{fix(Rt,1)}} the length must change by (R_t/R_S)² = {{fix(q,2)}}: L = {{fix(L2,0)}} cm. Doubling R_S takes four times the length (and about four times the time).',
      sampled: { L: choice([15, 25, 30, 50]), R1: choice([0.8, 1.0, 1.1, 1.2]), g: choice([2, 3, 4, 9]), Rt: choice([1.5, 2.0]) },
      derived: { R2: 'R1 * sqrt(g)', q: '(Rt / R1)^2', L2: 'L * q' },
      fields: [
        num('R2', 'R_S on the longer column', '', 'R2', { relTol: 0.01, sig: 3, paths: [{ label: 'R_S grows as the square root of L, not in proportion to L.', expr: 'R1 * g' }] }),
        num('L2', 'Length needed for the target R_S', 'cm', 'L2', { relTol: 0.015, sig: 3, paths: [{ label: 'Length goes as the square of the R_S ratio (R_S ∝ √L), not linearly.', expr: 'L * Rt / R1' }] }),
      ],
    }),
  ],
})), { id: 'm11.c.resolution', name: 'Resolution from times and widths; R_S and column length', chunk: 'c-calc', marks: 5, tags: ['resolution'] });

/* ---------- plate number and plate height ---------- */
add(node(mk({
  id: 'bk-m11-c-plates', title: 'Plate number N and plate height H', tags: ['plates', 'efficiency'], family: 'chrom-plates', exam: 'short_2to3', mins: 5,
  variants: [
    calc({
      id: 'n-base', label: 'N and H from a baseline width (4 marks)', marks: 4,
      stem: 'A peak elutes at **{{fix(tR,2)}} min** and has a baseline width of **{{fix(W,2)}} min** on a column **{{fix(L,2)}} m** long. Calculate the number of theoretical plates N and the plate height H (in mm).',
      hint: 'N = 16 (t_R/W)². H = L/N.',
      explanation: 'N = 16({{fix(tR,2)}}/{{fix(W,2)}})² = {{fix(N,0)}} plates. H = L/N = {{fix(H,3)}} mm. A smaller H and a larger N mean a more efficient column.',
      sampled: { tR: range(5.0, 12.0, 0.1, 1), W: range(0.20, 0.60, 0.01, 2), L: choice([1.0, 1.5, 1.8, 2.0, 2.5]) },
      derived: { N: '16 * (tR / W)^2', H: 'L * 1000 / N' },
      fields: [
        num('N', 'Number of plates N', '', 'N', { relTol: 0.01, sig: 3, paths: [{ label: 'N goes as the square of t_R/W.', expr: '16 * (tR / W)' }, { label: 'The constant 5.55 belongs to the half-height width; with the baseline width use 16.', expr: '5.55 * (tR / W)^2' }] }),
        num('H', 'Plate height H', 'mm', 'H', { relTol: 0.015, sig: 3, paths: [{ label: 'H = L/N with L in mm.', expr: 'L / N' }], ecf: [{ expr: 'L * 1000 / u_N', label: 'Consistent with your own N.' }] }),
      ],
    }),
    calc({
      id: 'n-half', label: 'N from a half-height width (3 marks)', marks: 3,
      stem: 'A peak elutes at **{{fix(tR,2)}} min** with a width at half height of **{{fix(h,3)}} min** on a column **{{fix(L,2)}} m** long. Calculate N and H (in µm).',
      hint: 'With the half-height width the booklet gives N = 5.55 (t_R/w½)².',
      explanation: 'N = 5.55({{fix(tR,2)}}/{{fix(h,3)}})² = {{fix(N,0)}}. H = L/N = {{fix(H,1)}} µm.',
      sampled: { tR: range(5.0, 12.0, 0.1, 1), h: range(0.10, 0.30, 0.005, 3), L: choice([0.5, 1.0, 1.5, 2.0, 2.5]) },
      derived: { N: '5.55 * (tR / h)^2', H: 'L * 1000000 / N' },
      fields: [
        num('N', 'Number of plates N', '', 'N', { relTol: 0.01, sig: 3, paths: [{ label: 'With the half-height width the constant is 5.55, not 16.', expr: '16 * (tR / h)^2' }] }),
        num('H', 'Plate height H', 'µm', 'H', { relTol: 0.015, sig: 3, ecf: [{ expr: 'L * 1000000 / u_N', label: 'Consistent with your own N.' }] }),
      ],
    }),
    calc({
      id: 'n-purnell', label: 'Plates and length needed for a target R_S (6 marks)', marks: 6,
      stem: 'A pair of solutes has **α = {{fix(al,2)}}** and **k_B = {{fix(kB,1)}}**. The column\'s plate height is **{{fix(Hmm,2)}} mm**. How many plates are needed for **R_S = {{fix(Rt,1)}}**, and how long must the column be?',
      hint: 'Purnell: R_S = (√N/4)((α − 1)/α)(k_B/(1 + k_B)). Solve for N, then L = N × H.',
      explanation: 'Solving the Purnell equation for N: N = 16 R_S² (α/(α − 1))² ((1 + k_B)/k_B)² = {{fix(N,0)}} plates. L = N × H = {{fix(N,0)}} × {{fix(Hmm,2)}} mm = {{fix(L,0)}} mm. The selectivity term (α − 1)/α is the most sensitive: a small α needs a very long column.',
      sampled: { al: range(1.05, 1.30, 0.01, 2), kB: range(1.5, 6.0, 0.1, 1), Rt: choice([1.0, 1.5, 2.0]), Hmm: choice([0.10, 0.15, 0.20, 0.25]) },
      derived: { N: '16 * Rt^2 * (al / (al - 1))^2 * ((1 + kB) / kB)^2', L: 'N * Hmm' },
      fields: [
        num('N', 'Plates needed N', '', 'N', { relTol: 0.015, sig: 3, paths: [{ label: 'Leave out the retention term: N = 16 R_S² (α/(α−1))² ((1 + k_B)/k_B)².', expr: '16 * Rt^2 * (al / (al - 1))^2' }, { label: 'The terms are squared: R_S, α/(α−1) and (1 + k_B)/k_B all appear squared.', expr: '16 * Rt * (al / (al - 1)) * ((1 + kB) / kB)' }] }),
        num('L', 'Column length L', 'mm', 'L', { relTol: 0.02, sig: 3, ecf: [{ expr: 'u_N * Hmm', label: 'Consistent with your own N.' }] }),
      ],
    }),
    calc({
      id: 'n-forward', label: 'R_S from N, α and k (4 marks)', marks: 4,
      stem: 'A column with **N = {{fix(N,0)}} plates** separates two solutes with **α = {{fix(al,2)}}** and **k_B = {{fix(kB,1)}}**. Calculate R_S. Then find the R_S if the column is replaced by one with **four times as many plates**.',
      hint: 'R_S = (√N/4)((α − 1)/α)(k_B/(1 + k_B)).',
      explanation: 'R_S = (√{{fix(N,0)}}/4)(({{fix(al,2)}} − 1)/{{fix(al,2)}})({{fix(kB,1)}}/(1 + {{fix(kB,1)}})) = {{fix(rs,2)}}. Four times the plates doubles R_S (it goes as √N), giving {{fix(rs4,2)}}.',
      sampled: { N: choice([2500, 4000, 6400, 10000, 16000]), al: range(1.06, 1.30, 0.01, 2), kB: range(1.5, 6.0, 0.1, 1) },
      derived: { rs: 'sqrt(N) / 4 * ((al - 1) / al) * (kB / (1 + kB))', rs4: '2 * rs' },
      fields: [
        num('rs', 'R_S', '', 'rs', { relTol: 0.015, sig: 3, paths: [{ label: 'Check the selectivity term: it is (α − 1)/α.', expr: 'sqrt(N) / 4 * (al - 1) * (kB / (1 + kB))' }] }),
        num('rs4', 'R_S with four times the plates', '', 'rs4', { relTol: 0.015, sig: 3, paths: [{ label: 'R_S goes as √N, so four times the plates doubles it, not quadruples it.', expr: '4 * rs' }], ecf: [{ expr: '2 * u_rs', label: 'Consistent with your own R_S.' }] }),
      ],
    }),
  ],
})), { id: 'm11.c.plates', name: 'Plate number, plate height and the plates needed for a target R_S', chunk: 'c-calc', marks: 5, tags: ['plates', 'purnell'] });

/* ---------- flow and scale-up ---------- */
add(node(mk({
  id: 'bk-m11-c-flow', title: 'Linear velocity, volume flow and scale-up', tags: ['flow', 'scale-up'], family: 'chrom-flow', exam: 'short_2to3', mins: 4,
  variants: [
    calc({
      id: 'flow-ux', label: 'Linear velocity in a packed column (3 marks)', marks: 3,
      stem: 'A packed column has an inner diameter of **{{fix(d,2)}} cm**. The fraction of the column volume the mobile phase can occupy is **ε = {{fix(eps,2)}}**. The volume flow rate is **{{fix(uv,2)}} mL min⁻¹**. Calculate the linear velocity u_x (cm min⁻¹).',
      hint: 'Volume flow u_v = u_x π r² ε for a packed column, r = d/2.',
      explanation: 'The cross-section open to flow is π r² ε with r = d/2 = {{fix(d/2,2)}} cm, so u_x = u_v/(π r² ε) = {{fix(ux,2)}} cm min⁻¹ (1 mL = 1 cm³).',
      sampled: { d: choice([0.40, 0.46, 0.60, 0.80]), eps: choice([0.20, 0.30, 0.40]), uv: choice([0.20, 0.30, 0.50, 1.00]) },
      derived: { ux: 'uv / (pi * (d / 2)^2 * eps)' },
      fields: [
        num('ux', 'Linear velocity', 'cm min⁻¹', 'ux', { relTol: 0.015, sig: 3, paths: [{ label: 'Use the radius (half the inner diameter) in π r².', expr: 'uv / (pi * d^2 * eps)' }, { label: 'Only the fraction ε of the cross-section carries the flow: divide by ε as well.', expr: 'uv / (pi * (d / 2)^2)' }] }),
      ],
    }),
    calc({
      id: 'flow-scale', label: 'Scale-up (5 marks)', marks: 5,
      stem: 'An analytical column of inner diameter **{{fix(d1,1)}} cm** handles **{{fix(m1,0)}} mg** of sample at **{{fix(F1,1)}} mL min⁻¹**. You want to purify **{{fix(m2,0)}} mg** per run on a column of the same length and packing, at the same linear velocity. What inner diameter and what volume flow do you need?',
      hint: 'Sample capacity scales with the cross-sectional area (∝ d²). At the same linear velocity the volume flow scales with the same factor.',
      explanation: 'The mass ratio is {{fix(q,1)}}, and capacity ∝ area ∝ d², so d₂ = d₁ √{{fix(q,1)}} = {{fix(d2,2)}} cm. The same linear velocity through {{fix(q,1)}} times the area needs {{fix(q,1)}} times the volume flow: {{fix(F2,2)}} mL min⁻¹. Length and linear velocity are unchanged, so the separation is unchanged.',
      sampled: { d1: choice([0.4, 0.46, 1.0]), m1: choice([1, 2, 5]), F1: choice([0.3, 0.5, 1.0]), qq: choice([4, 5, 9, 10, 16, 20]) },
      derived: { m2: 'm1 * qq', q: 'm2 / m1', d2: 'd1 * sqrt(q)', F2: 'F1 * q' },
      fields: [
        num('d2', 'New inner diameter', 'cm', 'd2', { relTol: 0.015, sig: 3, paths: [{ label: 'Capacity goes as the cross-sectional area, so the diameter scales as the square root of the mass ratio.', expr: 'd1 * q' }] }),
        num('F2', 'New volume flow', 'mL min⁻¹', 'F2', { relTol: 0.015, sig: 3, paths: [{ label: 'Keep the same linear velocity: the volume flow scales with the area, which is the mass ratio.', expr: 'F1 * sqrt(q)' }] }),
      ],
    }),
  ],
})), { id: 'm11.c.flow', name: 'Linear velocity versus volume flow; scale-up', chunk: 'c-calc', marks: 2, tags: ['flow'] });

/* ---------- van Deemter and band spreading (concepts) ---------- */
add(node(mk({
  id: 'bk-m11-c-vd', title: 'Band spreading and the van Deemter equation', tags: ['van-deemter', 'band-spreading'], family: 'chrom-vd', exam: 'short_2to3', mins: 3, tier: 'atomic',
  variants: [
    pick({
      id: 'vd-A', label: 'Which term is multiple flow paths', marks: 1,
      stem: 'In H = A + B/u + C u, which term describes **multiple flow paths** (eddy diffusion) through a packed column?',
      options: [['A', 'The A term'], ['B', 'The B/u term'], ['C', 'The C u term'], ['none', 'None: it is part of all three']], correct: 'A',
      explanation: 'A is the multiple-paths term, independent of flow rate; B/u is longitudinal diffusion and C u is the finite time to equilibrate between phases (mass transfer).',
    }),
    pick({
      id: 'vd-low', label: 'What dominates at low flow', marks: 1,
      stem: 'At a flow velocity **below the optimum**, which term dominates the plate height?',
      options: [['B', 'B/u, longitudinal diffusion'], ['C', 'C u, mass transfer'], ['A', 'A, multiple paths'], ['none', 'None: H is flat below the optimum']], correct: 'B',
      explanation: 'At low velocity the solute spends longer in the column and diffuses along it, so B/u dominates. Above the optimum, the time to equilibrate matters more and C u dominates; at the optimum B/u and C u contribute equally and H is smallest.',
    }),
    pick({
      id: 'vd-high', label: 'What dominates at high flow', marks: 1,
      stem: 'At a flow velocity **above the optimum**, which term dominates?',
      options: [['C', 'C u: the solute cannot equilibrate between the phases fast enough'], ['B', 'B/u: longitudinal diffusion'], ['A', 'A: multiple paths'], ['none', 'None: the terms cancel']], correct: 'C',
      explanation: 'Fast flow leaves too little time for the solute to equilibrate between mobile and stationary phases, so the C u (mass-transfer) term grows and H rises.',
    }),
    pick({
      id: 'vd-gc-lc', label: 'Longitudinal diffusion in GC and LC', marks: 1,
      stem: 'Which statement about longitudinal diffusion is correct?',
      options: [['gc', 'It is larger in GC than in LC because diffusion in a gas is much faster than in a liquid'], ['same', 'It contributes equally in GC and LC'], ['lc', 'It is larger in LC because liquids are denser'], ['none', 'It is absent in GC']], correct: 'gc',
      explanation: 'The B/u term contains the diffusion coefficient of the solute in the mobile phase. Diffusion is far faster in a gas, so B/u is larger in GC (worst at low flow).',
    }),
    pick({
      id: 'vd-open', label: 'The A term in an open tubular column', marks: 1,
      stem: 'Why can the A term be taken as zero for an open tubular GC column?',
      options: [['one', 'There is a single open flow path, so there are no multiple paths around packing particles'], ['thin', 'The stationary phase film is thin'], ['gas', 'Gases diffuse quickly'], ['pressure', 'The pressure drop is small']], correct: 'one',
      explanation: 'Multiple flow paths come from the packing particles. An open tube has one path down the middle, so A ≈ 0.',
    }),
    pick({
      id: 'vd-opt', label: 'The optimum velocity', marks: 1,
      stem: 'At the optimum flow velocity of the van Deemter curve:',
      options: [['min', 'H is a minimum, so N is a maximum, and B/u and C u are equal'], ['max', 'H is a maximum and N a minimum'], ['A', 'The A term is zero'], ['cancel', 'B/u and C u are both zero']], correct: 'min',
      explanation: 'dH/du = 0 gives u_opt = √(B/C). There B/u = C u, plate height is lowest and the column is most efficient.',
    }),
    written({
      id: 'vd-three', label: 'Three causes of band broadening and how to reduce each (6 marks)',
      stem: 'Name the **three** main causes of band broadening in a column and give one way of reducing **each**.',
      explanation: 'Multiple flow paths (A): different molecules take paths of different length through the packing; use small, uniform particles and pack well. Longitudinal diffusion (B/u): the band spreads along the column by diffusion, worst at low flow and in gases; run near or above the optimum velocity. Finite equilibration time, or mass transfer (C u): molecules cannot equilibrate between the phases instantly, worst at high flow; use a slower flow, smaller particles or a thinner stationary-phase film.',
      items: [['Multiple flow paths (eddy diffusion), the A term', 1], ['Reduce it with small particles of a narrow size range packed uniformly', 1], ['Longitudinal diffusion along the column, the B/u term', 1], ['Reduce it by using a faster flow (less time to diffuse)', 1], ['Finite time to equilibrate between phases (mass transfer), the C u term', 1], ['Reduce it with a slower flow, smaller particles or a thinner film', 1]],
    }),
  ],
})), { id: 'm11.c.vd', name: 'Band spreading: A, B/u and Cu terms and the optimum', chunk: 'c-concepts', marks: 3, tags: ['van-deemter'] });

/* ---------- peak shape, types and general rules ---------- */
add(node(mk({
  id: 'bk-m11-c-shape', title: 'Peak shape and what it tells you', tags: ['peak-shape'], family: 'chrom-shape', exam: 'short_2to3', mins: 3, tier: 'atomic',
  variants: [
    pick({
      id: 'sh-front', label: 'The usual cause of fronting', marks: 1,
      stem: 'Which is the most common cause of a **fronting** peak?',
      options: [['over', 'Overloading the column: too much analyte, so part of the band is retained less strongly and comes out early'], ['sil', 'Residual silanol groups holding some molecules more strongly'], ['flow', 'A mobile phase velocity that is too high'], ['two', 'Two analytes overlapping']], correct: 'over',
      explanation: 'Fronting is classically an overload effect. Tailing, by contrast, usually comes from some molecules being held too strongly (for example by silanol groups or active sites). Neither is caused by mobile-phase velocity alone.',
    }),
    pick({
      id: 'sh-tail', label: 'The usual cause of tailing', marks: 1,
      stem: 'Which is a common cause of a **tailing** peak in HPLC on a silica-based column?',
      options: [['sil', 'Some molecules interact strongly with residual silanol groups and are released late'], ['over', 'Overloading by too little sample'], ['flow', 'A flow velocity that is exactly optimum'], ['len', 'A column that is too long']], correct: 'sil',
      explanation: 'Secondary interactions with residual Si–OH groups hold some molecules more strongly, so they come out late. End-capping (trimethylsilyl groups), a different pH or mobile phase, or a smaller injection reduce tailing.',
    }),
    pick({
      id: 'sh-asym', label: 'Reading the asymmetry factor', marks: 1,
      stem: 'The asymmetry factor A/B is measured at 10% of the peak height. A peak has **A/B > 1**. What does that show?',
      options: [['tail', 'Tailing'], ['front', 'Fronting'], ['sym', 'A symmetric peak'], ['res', 'Good resolution']], correct: 'tail',
      explanation: 'In the lecture convention A/B > 1 is tailing and A/B < 1 is fronting; a symmetric peak has A/B = 1. The 10%-height measurement also enters the plate-count formula N ≈ 41.7 (t_R/w₀.₁)²/(A/B + 1.25).',
    }),
    pick({
      id: 'sh-fix', label: 'Reducing a fronting peak', marks: 1,
      stem: 'A peak shows fronting on a non-polar (reversed-phase) column. Assume the usual cause. Which change is most likely to help?',
      options: [['less', 'Inject a smaller amount or a more dilute sample'], ['more', 'Inject more sample'], ['len', 'Use a longer column of the same kind'], ['oh', 'Add more free silanol groups to the packing']], correct: 'less',
      explanation: 'On a non-polar column the usual cause of fronting is overload: too much analyte saturates the retention sites, so part of the band is retained less strongly and comes out early. The fix is to inject less or dilute the sample. Silanol groups are the cause of tailing (some molecules held too strongly), so adding them would not cure fronting. A longer column only adds plates; it does not change the overload.',
    }),
  ],
})), { id: 'm11.c.shape', name: 'Peak asymmetry: tailing and fronting', chunk: 'c-concepts', marks: 1, tags: ['peak-shape'] });

add(node(mk({
  id: 'bk-m11-c-types', title: 'Retention basics: elution order and void time', tags: ['types'], family: 'chrom-types', exam: 'short_2to3', mins: 3, tier: 'atomic',
  variants: [
    pick({
      id: 'ty-first', label: 'Which solute leaves first', marks: 1,
      stem: 'In any chromatographic separation, which solute is detected **first**?',
      options: [['mob', 'The one with more affinity for the mobile phase (less retained)'], ['stat', 'The one with more affinity for the stationary phase'], ['big', 'The heaviest'], ['none', 'It cannot be predicted']], correct: 'mob',
      explanation: 'The separation exploits different rates of movement. The solute that spends more of its time in the mobile phase moves faster and elutes first.',
    }),
    pick({
      id: 'ty-tm', label: 'The void time', marks: 1,
      stem: 'A more hydrophobic solute is retained longer on a reversed-phase column. Is the hold-up (void) time t_M longer for it?',
      options: [['no', 'No: t_M is a property of the column and conditions, the same for every solute'], ['yes', 'Yes: t_M grows with retention'], ['half', 'Only for the first peak'], ['k', 'Yes, because k grows']], correct: 'no',
      explanation: 't_R = t_M + t_S. The retention of a solute lengthens t_S, not t_M, which is the time of an unretained compound.',
    }),
  ],
})), { id: 'm11.c.types', name: 'Which solute leaves first; the void time', chunk: 'c-concepts', marks: 1, tags: ['types'] });

export default out;
