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

## 4. Open

- Slide batches 2 onward (the user uploads five at a time).
- Align explain rubrics to the keys' key-word style.
- Confirm the lecturer's own wording for any slide table that disagrees with a textbook value (none seen in batch 1).
