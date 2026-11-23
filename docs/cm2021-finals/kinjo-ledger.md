# CM2021 Kinjo half (Q1 + Q2, Ch 1-5): example papers and lecture-slide ledger

Written 2026-11-23. Sources: `Example1_Answer_Prof_Ito.pdf`, `Example2_Answer_Kinjo.pdf`, `ExampleX_Answer_Kinjo.pdf`, `Example3_Answer_Kinjo_updated.pdf`, and lecture batch 1 (`2025-Chapter2_Part8_Group17_and_18.pdf`). Question text is paraphrased. Further slide batches are appended as sections below.

## 1. What the example papers show

- **Coverage.** About 39 of 41 example items already had a bank variant. The two without were drawing 15-crown-5 (now `bk-c4-crown-draw`) and a HOMO count for CH4, which turned out to exist already (`bk-c3-homo-past`).
- **Recurrence across the four papers** (the same rule returns with a changed instance, like the Hiang Kwee half): boiling point, ionisation energy, electron affinity and hydration picks; average oxidation number (N2O3 in two papers); HOMO electron count (CH4 in two); BF3 as the weaker Lewis acid (two); 18-crown-6 / 15-crown-5; the Wislicenus azide route (two); limewater (two); valency tables (O in OH3+, B in BH4-); MeLi tetramer 4c-2e and Me2Be 3c-2e; gauche H2O2; why ice floats; OF4 against SF4; ammonia-borane; FHF- 3c-4e; acetylide; the Haber process and the nitrogen chart (A-F).
- **Marking style.** The keys list "key words" per mark, so a typed answer earns a mark for naming the idea, not for a full sentence. Explain-type rubrics in the bank should be phrased as one key idea per mark. Not yet audited for every explain node.
- **Skipped on purpose.** A valency / oxidation number / formal charge / coordination number generator: the course's definition of "valency" is not clear from the papers, and a wrong convention would teach the wrong answer.

## 2. Group 17 and 18 slides (batch 1, slides 21-33)

| Slides | Content | Used as |
|---|---|---|
| 21-23 | halogen tables: IE, EN, atomic and ionic radius, boiling and melting points, X-X bond energy and length, electron affinity | `TABLES` in `tools/cm2021/kinjo.mjs` |
| 30 | noble gas table: IE, boiling point, density, radius | same |
| 33 | xenon fluorides: melting point and Xe-F bond length | same |

Exceptions the slides stress and the picks now test: F has a lower electron affinity than Cl, and F-F has a lower bond energy than Cl-Cl and Br-Br.

## 3. Built from batch 1 (`node tools/cm2021/kinjo.mjs`, 57 variants)

| Node | Variants | What |
|---|---|---|
| `bk-c2-trend-gen` | 31 | pick the highest or lowest of a subset of the slide table (key recomputed from the table) |
| `bk-c4-avgon-gen` | 13 | average oxidation number: N2O, N2O3, N2O4, N2O5, N2H4, NH2OH, NH4NO3, Fe3O4, Pb3O4, S4O6 2-, S2O3 2-, I3-, NaN3 |
| `bk-c4-nuclear-gen` | 8 | complete a nuclear equation by A and Z conservation, including a beta decay step |
| `bk-c3-homo-gen` | 2 | HOMO electron counts for NH3, H2O, HF, BH3, NO and SiH4, CN-, O2-, NO+, F2 |
| `bk-c4-crown-draw` | 3 | draw 12-crown-4, 15-crown-5, 18-crown-6 on paper, tick the marking points, name the best-fitting ion |

Tests: `tests/kinjo-items.test.mjs` recomputes the key from an independent copy of the tables, the sum rule, A/Z conservation and a simple valence-MO filling.

## 4. Chapter 1 slides, batch 2 (Parts 1-5; 168 pages, read as page images because the text layer is empty)

| Deck | Content | Finals/example-paper weight | Bank state before | Done |
|---|---|---|---|---|
| Part 1 (52 s) | Lewis exceptions, formal charge, VSEPR for 5- and 6-coordinate, VB, hybridisation | 0 marks in 300 (Lewis, VSEPR) | 16 nodes already | not drilled further |
| Part 2 (34 s) | ionic bonding, covalent bonding, **heavier Group 14 (ns/np size gap, promotion energy, double-bond rule, spin multiplicity, E≡E table, trans-bending)**, states of matter | recurring (hybridisation, disilene) | `bk-c2-heavy-hybrid` 3 variants | picks from the E≡E table; solid-property items |
| Part 3 (16 s) | van der Waals, Pauling electronegativity, dipole-dipole, hydride boiling points, H-bond quality and quantity, ice | boiling-point picks every year | `bk-c2-bp-picks`, chalcogen, ice | hydride and gas/alkane tables; H-bond count |
| Part 4 (14 s) | dative bonding (formal against partial charge in NH₃→BF₃), metallic bonding, melting-point trends, solids | BF₃/dative in two papers | `bk-c1-dative`, `bk-c1-formal-charge-bridge` | partial-charge node; metal melting/boiling picks; malleable and brittle |
| Part 5 (52 s) | VB against MO, LCAO, three overlap conditions, bond order, s-p mixing, PES, CH₄ and H₂O with LGOs | MO and HOMO items every year | 26 `bk-c3-*` nodes | AHn MO count; diatomic bond order/unpaired generator |

Built (`node tools/cm2021/kinjo2.mjs`, 50 variants): `bk-c2-trend-gen2` 26 (heavier-G14 length, bend angle and single-bond length; metal mp/bp across a period and down Group 1; 16 hydrides; noble gas and alkane boiling points), `bk-c1-partial-charge` 5, `bk-c3-ahn-count` 5 (CH₄, NH₃, H₂O, BH₃, BeH₂), `bk-c3-diatomic-gen` 6 (18 species), `bk-c2-solid-props` 8. Tests: `tests/kinjo2-items.test.mjs`.

Things to know:
- **Deck contradiction (rank-neutral).** Part 3 slide 39 (Pauling) prints Cl 3.2, Br 3.0, I 2.7; the Group 17 deck table (batch 1) prints Cl 3.0, Br 2.8, I 2.5. The order is the same, so picks are safe, but do not ask for a numeric value.
- **Part 2 spin multiplicity** (2n+1 with n = unpaired/2, singlet/doublet/triplet) and the double-bond rule are in `bk-c2-heavy-hybrid`; no separate generator.
- **Non-bonding MO counts** follow the lecture's H₂O diagram (2 bonding, 2 non-bonding, 2 antibonding); NH₃, BH₃ and BeH₂ extend the same rule (the empty p orbitals count as non-bonding).
- The slide for Part 4 s63 prints three melting points without naming the metals; Na, Mg, Al is the reading used (98, 650, 659 °C).

## 5. Chapter 2 slides, batch 3 (Parts 4-8: Groups 13 to 18; text layer present)

Part 8 (Groups 17 and 18) is the same file as batch 1. For the other four decks I matched every printed equation against `reactions.json` and about 50 slide facts and numbers against the bank and the method pages: nearly all were already there from the Chapter 4 deck ingest (diborane 3c-2e, inert pair, BX3 acidity, silanes, N(SiH3)3, Haber/Raschig/Wislicenus, nitrogen oxides, phosphorus, contact process, SF6, interhalogens, xenon). Genuinely absent: B₂O₃ + 3 C + 3 Cl₂ → 2 BCl₃ + 3 CO, hydrosilylation (not quizzable), the match-head reaction, borax, cryolite, SO₃ polymorph melting points, H₂SO₄ hydration enthalpy, SO₂ → SO₃ ΔG° −71 kJ/mol, talc and asbestos (unlikely to be examined).

What was thin and is examined every year was the oxidation number (one fixed variant plus the average-oxidation-number set), so `node tools/cm2021/kinjo3.mjs` writes 22 variants: `bk-c4-ox-gen` 10 sets of 4 (N oxides and oxoacids, P, S and Cl species, **hydridic H**: Si in SiH₄ and SiHCl₃ is +4 and B in B₂H₆ is +3, against C in CH₄ at −4, because Part 5 stresses that H is more electronegative than Si), `bk-c4-silicate-gen` 4 (charge = 4 per Si − 2 per O, terminal against bridging O), `bk-c4-facts-gen` 8 (E–H bond energy and length, SO₃ polymorphs, interhalogen XX′ₙ rule and conditions). Tests: `tests/kinjo3-items.test.mjs`.

Slide slips seen (do not memorise as printed): Part 5 slide 17 prints [(SiO₃)₈]¹⁸⁻ for an eight-membered ring, which is 16−; Part 6 `Ba(NO)₂` for barium nitrite and `Ca₃N₂`-type equations that do not balance were already logged on the Reactions screen.

## 6. Chapter 2 slides, batch 4 (Parts 1-3: Hydrogen, Group 1, Group 2; text layer present) — the last Kinjo deck

Audit as for batch 3: every printed equation was matched against `reactions.json` and ~60 facts against the bank. The generic forms (`M + O₂`, `MCO₃ → MO + CO₂`, `M + X₂`, `MH₂ + 2 H₂O`) are held as the specific cases (Ca, Mg, Ba), saline hydrides, LiAlH₄ and NaBH₄, Li₃N, Mg₃N₂, KO₂, the Be amphoteric pair, cryptand and alkalide, MeLi tetramer, Be(CH₃)₂ 3c-2e, the W(η²-H₂) Kubas complex and steam reforming are all present. Not present and low priority: H electron affinity (−17.4 kcal/mol) and ionisation enthalpy (313.6 against 122.7 for Li), BeBu₂ → BeH₂ + isobutene, CaCO₃ + 4 C → CaC₂ + 3 CO as a written equation.

Thin and recurring: the **isotope effect** (zero-point energy; two of the three finals; the bank had 1 + 2 fixed variants) and the **H₂ + Cl₂ radical chain** (1 node). `node tools/cm2021/kinjo4.mjs` writes `bk-c4-isotope-gen` 7 (a numeric chain: ν(D₂) = 4401/√2, E₀ of each, and a bond-enthalpy difference of 1.84 kcal/mol that reproduces the slide's 106.0 − 104.2 = 1.8; rubrics for H₂/D₂ + Cl·, O–H against O–D, D₂O melting and boiling points, D₂O ice sinking, CH₄ against CD₄; one multi-select) and `bk-c4-radical-gen` 2 (classify the four steps; ΔH of each step from Cl–Cl 243, H–H 432, H–Cl 427, overall −179 kJ/mol). Tests: `tests/kinjo4-items.test.mjs`.

With this batch every uploaded Kinjo lecture deck (Chapter 1 Parts 1-5, Chapter 2 Parts 1-8) has been read. Remaining Kinjo material not uploaded: Chapter 3 MO lectures beyond the Chapter 1 Part 5 summary, and Chapter 5 (symmetry and group theory).

## 7. Formal charge generator (batch 5, added after the owner flagged formal charge as important)

The example mid-term item (Al₂Cl₆ and I₂Cl₆: Al −1, I −1, bridging Cl +1; I₂Cl₆ planar because each I has two lone pairs, octahedral electron-pair geometry, square-planar ICl₄ units) was already in `bk-c1-formal-charge-bridge`, but formal charge had only fixed variants (5 nodes). `node tools/cm2021/kinjo5.mjs` writes `bk-c1-fc-gen` (11): the two example-paper structures, H₃N→BF₃, H₃O⁺/NH₄⁺/BF₄⁻/BH₄⁻, SCN⁻ structures B and C, O₃ and NO₃⁻, CO and N₂O, BF₃ with a B=F π bond, SO₄²⁻ with all single bonds against two S=O (S +2 against 0), and a pick on which sulfate structure is preferred. Formal charge = V − non-bonding electrons − bonds. The test caught two data slips while building (N in SCN⁻ structure C is −2, not −1; a double-bonded F has two bonds). Tests: `tests/kinjo5-items.test.mjs`.

## 8. Open

- Slide batches 3 onward (the user uploads five at a time).
- Align explain rubrics to the keys' key-word style.
- Confirm the lecturer's own wording for any slide table that disagrees with a textbook value (none seen in batch 1).
