# SafeInspect — Legal, Scientific & Checklist Methodology Audit
**Consolidated across 9 sessions, updated after user-supplied primary documents | Compiled 2026-08-06**
**Auditor note:** This audit is analysis only — no repository files were modified. Every finding below was checked against either (a) direct reads of the current criteria files, (b) direct reads of user-supplied primary Algerian legal documents, or (c) web-searched secondary sources — with source type noted per finding. Items I could not verify are explicitly marked UNVERIFIED rather than guessed at, per your instruction that this work is sensitive and uncertainty must be surfaced, not smoothed over.

## Primary documents received and used
Décret exécutif 17-140 (2017, food hygiene — full text, all articles), Décret exécutif 06-141 (2006, industrial liquid effluent limits — full text including Article 3 and both annexes), Décret exécutif 11-125 (2011, drinking water quality), Décret exécutif 11-219 (2011, source water quality objectives), Décret exécutif 07-144 (2007, classified installations nomenclature).

## LIVE STATUS UPDATE — 2026-08-08/09 re-verification pass (all items re-fetched directly, log claims independently verified)
- **L-02 — CONFIRMED fixed**, applied consistently across all 6 files.
- **L-02b — CONFIRMED fixed** (`baseFoodCriteria.ts`, "W7 2026-08-08"): now correctly cites the 7 May 2025 arrêté for the specific temperature figures; the false "verified ✅" comment against the wrong articles is gone.
- **L-03 — CONFIRMED fixed.**
- **L-05 — CONFIRMED fixed.**
- **L-10 — CONFIRMED fixed** (date corrected to 11 April 2017, matching the primary document).
- **L-01 — CONFIRMED still open**, correctly untouched (this is the one item that needs a human decision, not a quick fix — its being unfixed is expected and appropriate, not a gap).
- **L-04 — CONFIRMED still open**, unchanged, despite an extensive citation-cleanup pass ("W19") fixing 8 other citations in this exact file.
- **New finding, L-11:** `bakeryCriteria.ts`'s fire-safety criterion (`BAK-10-12`) cites **Décret 76-04** + a 2009 arrêté, while `baseGeneralCriteria.ts`'s fire-safety criteria (`BGN-08-01/02`, recently verified with confirmed article numbers) cite **Loi 19-02** for the same subject. Worth a quick check on whether 76-04 has been superseded by 19-02 — low urgency, substance (extinguishers, exits) isn't in dispute, just the citation currency.
- **Positive note:** spotted an additional unprompted self-correction not previously tracked — `BFD-08-01` (traceability record-retention) was fixed from a wrong article (19) to the correct ones (12+6), with the 2-year retention period honestly marked `[حكم مهني]` (professional judgment, no explicit Algerian text) rather than misrepresented as legally mandated. The self-auditing discipline noted throughout this document continues.

**Cross-reference note:** the technical audit document (`SafeInspect_Audit_Consolidated_2026-08-06.md`) found that the project's own tracking log contains two confirmed-false "phantom" closures for unrelated technical findings (F-10, F-13) — worth reading that document's equivalent live-update section, since it's a reminder that log entries in this fast-moving project should be spot-checked, not assumed accurate. The legal-citation fixes verified in *this* section were all independently re-confirmed by direct file reads, not taken from the log at face value.

**L-06, L-07, L-08, L-09 remain open** — unchanged from the prior version of this document.

## Coverage
**Sampled in depth (11 of 19 criteria files):** `baseFoodCriteria.ts`, `abattoirCriteria.ts`, `couvoirCriteria.ts`, `uabCriteria.ts`, `slaughterhouseSmallCriteria.ts`, `bakeryCriteria.ts`, `updCriteria.ts`, `baseGeneralCriteria.ts` (shared by **all** checklists — highest leverage), `gplCriteria.ts`, `semiPharmaCriteria.ts`, `coldRoomCriteria.ts`, `produceStorageCriteria.ts`.
**Deliberately not sampled (lower-stakes workshop/light-industrial types):** `mechanicCriteria.ts`, `blacksmithCriteria.ts`, `carpenteryCriteria.ts`, `carWashCriteria.ts`, `marbleCriteria.ts`, `paintShopCriteria.ts`, `printingCriteria.ts`. This is a deliberate stopping point, not an oversight: every food-safety file, the universal base file (used by all 26 checklists), the highest explosion-risk category (GPL), and the health-adjacent category (semi-pharma) are covered. If SafeInspect later expands its facility coverage or these workshop types become a priority, they should get the same treatment.

---

## 1. EXECUTIVE CONCLUSION

**Is the checklist legally defensible?** Mostly yes, and now meaningfully more so than at the previous version of this document. Every legal instrument checked is **real, correctly dated, and topically appropriate** — not fabricated law. But primary-source verification found **concrete, confirmed citation errors** (not just unverified gaps) in several places — most notably the HACCP article number, which is wrong in 4 of 6 files, and the cold-chain temperature citation, which points to articles that don't contain temperature figures at all. The codebase also continues to show genuine self-auditing discipline (documented prior corrections, honest `[INTL]` flags where no Algerian basis exists) — this remains a real strength.

**Are there serious legal/scientific problems?** Yes, one clearly: the **Décret 06-141 Annexe I vs. Annexe II conflict** for slaughterhouse wastewater (L-01) is now substantially resolved toward "the app is very likely citing the wrong table" — the strongest, highest-stakes finding of this whole audit, now with primary-text reasoning behind it rather than just a flagged ambiguity. Several other confirmed citation errors (L-02, L-02b, L-03, L-05) are straightforward corrections once you know the right answer, which we now do.

**Missing/excessive criteria?** No evidence gathered either way — this would require domain expertise I don't have.

---

## 2. FINDINGS — HIGH PRIORITY (P0/P1)

### L-01 — Décret 06-141: Annexe I vs. Annexe II conflict for slaughterhouse discharge
**Severity:** P0 (highest-stakes item in this audit) | **Status: SUBSTANTIALLY RESOLVED (upgraded from ambiguous to high-confidence) after reading Article 3 directly from the user-supplied primary document**
**Files affected:** `abattoirCriteria.ts` (`ABT-AX4-01`, `ABT-AX4-04B`), `slaughterhouseSmallCriteria.ts` (`SLH-05-04` through `04D`)
**Evidence:** Full primary text of Décret 06-141 (JO n°26, 19 avril 2006), including Article 3 in full. **Annexe I** (general) gives DBO5 ≤35, DCO ≤120, MES ≤35, oils ≤20 mg/L, pH 6.5–8.5 — confirmed word-for-word match to both files' citations. **Annexe II** has a dedicated "Abattoirs et transformation de la viande" sub-table with different parameters and units entirely: DBO5 ≤250 g/t carcasse traitée, DCO ≤800 g/t, pH 5.5–8.5.
**Resolution:** Article 3 distinguishes a general old-installation transition tolerance (paragraphs 1–3, a 5-/7-year grace period) from category-specific tolerances "également accordées" (also granted) per industrial category (paragraph 4 — this is Annexe II). Critically, **Annexe II's abattoir values use fundamentally different units (mass-per-production-unit, g/t) than Annexe I (concentration, mg/L)** — it is structurally impossible for Annexe II to function as a simple percentage-leniency layered on Annexe I's numbers, since the measurement basis itself differs. This means Annexe II must be a standalone, category-specific standard.
**Verdict: high confidence that Annexe II's abattoir-specific table is the operative standard for slaughterhouse wastewater discharge, not Annexe I's generic table.** `abattoirCriteria.ts` and `slaughterhouseSmallCriteria.ts` are very likely citing the wrong table. Not marked fully CONFIRMED only because a final regulatory/expert sign-off is still warranted given the stakes — but this is no longer "genuinely ambiguous," it's "strongly indicated, pending final confirmation."
**Contrast — confirmed NOT an issue for other facility types:** `uabCriteria.ts` (animal feed) has no Annexe II category, so Annexe I is correctly its only applicable table.
**Recommended action:** update `ABT-AX4-01`/`04B` and `SLH-05-04` through `04D` to cite Annexe II's abattoir-specific values (DBO5 ≤250 g/t, DCO ≤800 g/t, pH 5.5–8.5, plus volume/quantité and matière décantable parameters not currently tracked at all).

### L-02 — HACCP obligation article number — ✅ DONE (confirmed in code 2026-08-08)
**Severity:** P1 | **Status: RESOLVED**
**Files affected:** `baseFoodCriteria.ts`, `abattoirCriteria.ts`, `couvoirCriteria.ts`, `bakeryCriteria.ts`, `slaughterhouseSmallCriteria.ts`, `coldRoomCriteria.ts`
**Evidence:** Article 5's exact text confirmed as HACCP obligation. All 6 files now cite Art.5. Confirmed by direct file read 2026-08-08.

### L-02b — Décret 17-140 does not itself specify cold-chain temperatures — ✅ DONE (confirmed in code 2026-08-08)
**Severity:** P1 | **Status: RESOLVED**
**File affected:** `baseFoodCriteria.ts` (`BFD-04-01`, `BFD-04-02`)
**Evidence:** Now correctly cites the 7 May 2025 arrêté. Confirmed by direct file read.

### L-03 — Décret 88-164 (drinking water) — ✅ DONE (confirmed in code 2026-08-08)
**Severity:** P1 | **Status: RESOLVED**
**File affected:** `baseGeneralCriteria.ts` (`BGN-03-01`)
**Evidence:** Now cites Décret 11-125. Confirmed.

### L-04 — Décret 93-120 cited for ventilation — ✅ DONE (confirmed in code 2026-08-09)
**Severity:** P1 | **Status: RESOLVED**
**File affected:** `baseGeneralCriteria.ts` (`BGN-02-06`)
**Evidence:** Now correctly cites Décret 91-05 Art.11 with `[حكم مهني]` tag. Comment `// W11/L-04 fix` present. Confirmed by direct file read 2026-08-09.

### L-05 — Chlorine residual decree number — ✅ DONE (confirmed in code 2026-08-08)
**Severity:** P2 | **Status: RESOLVED**
**File affected:** `abattoirCriteria.ts`
**Evidence:** Now correctly cites Décret 11-125. Confirmed 2026-08-08.
**Remaining minor gap:** exact "0.1 mg/L" figure within Décret 11-125's table not yet verified against primary text — decree citation itself is correct.

### L-09 — Décret 17-140 cited for non-food product hygiene — OPEN
**Severity:** P1 | **Status: CONFIRMED still open**, re-verified 2026-08-09
**File affected:** `semiPharmaCriteria.ts` (`SPH-02-01`, `SPH-02-02`, `SPH-05-01`)
**Evidence:** Décret 17-140's scope is food products only. These semi-pharma criteria still cite it. Confirmed unchanged on direct re-read.
**Recommended action:** replace with Loi 18-11 health-products provisions (already correctly used elsewhere in this file), or apply `[INTL]`/best-practice flag.

### L-10 — Incorrect decree date in bakeryCriteria — ✅ DONE (confirmed in code 2026-08-08)
**Severity:** P3 | **Status: RESOLVED**
**File affected:** `bakeryCriteria.ts` (`BAK-10-10`)
**Evidence:** Now reads "11 أبريل 2017". Confirmed 2026-08-08.

---

## 3. FINDINGS — MEDIUM/LOW PRIORITY (P2/P3)

### L-06 — UPD buffer distance: wrong regulatory concept
**Severity:** P2 | **Status: CONFIRMED real problem, OPEN — needs product decision**
**File affected:** `updCriteria.ts` (`UPD-AX2-01`)
**Evidence:** Décret 07-144 rubrique 2121 specifies a **rayon d'affichage** (public-notice display radius) of 0.5–3 km — not a construction setback. These are fundamentally different regulatory concepts.
**Recommended action:** product/domain decision required — notice-radius criterion vs. genuine siting-distance criterion (which would be set per-facility at wali-level authorization, not in this nomenclature decree). Do not replace the number without this decision.

### L-07 — GPL safety thresholds: AIM GPL2 unpublished — OPEN → W51
**Severity:** P2 | **Status: OPEN — now tracked as W51**
**File affected:** `gplCriteria.ts` (GPL-02-01/02/03, GPL-03-01/02, GPL-04-01)
**Update 2026-08-10:** AIM GPL2 (v14.03.2022) confirmed to have no JORADP publication trace. Décret 21-319 Art.92 delegates rule-making but arrêté not published. All 6 criteria now tagged `[À VÉRIFIER — W51]` with Arabic warning. Technical values retained as `[حكم مهني]` pending official publication. **W51 is open — monitor JORADP.**

### L-08 — Décret 24-196: not independently verified
**Severity:** P2 | **Status: UNCHANGED — still open**
Cited alongside confirmed-real Décret 22-167. Not independently located; not contradicted either. No primary document supplied.

### L-11 — Fire-safety decree inconsistency (bakery vs. base file)
**Severity:** P3 | **Status: CONFIRMED, OPEN — low urgency**
**Files affected:** `bakeryCriteria.ts` (`BAK-10-12`, cites Décret 76-04 + 2009 arrêté) vs. `baseGeneralCriteria.ts` (`BGN-08-01/02`, cites Loi 19-02 Arts.5+13)
**Recommended action:** confirm whether Décret 76-04 superseded by Loi 19-02. If yes, standardize BAK-10-12 on Loi 19-02.

---

## 4. WHAT'S ALREADY CORRECT (confirmed — no action needed)

- **Loi 09-03** and **Décret 17-140** — real, correctly dated, correctly applied in `baseFoodCriteria.ts`.
- **Décret 06-198** + amendment **Décret 22-167** — confirmed real.
- **Décret 06-141 Annexe I** general values — verbatim-confirmed; correctly applied for non-abattoir facility types (e.g. `uabCriteria.ts`).
- **1 December 2020 HACCP implementing arrêté** — confirmed real, exact date and JO reference match.
- **Activity → checklist mapping** (`criteriaData.ts`) — all 26 activities correctly mapped.
- **UPD/couvoir HACCP exclusion logic** — confirmed well-reasoned.
- **Décret 93-120** correctly used for periodic medical exams (e.g. `BAK-10-11`, `ABT-AX7-01`).
- **`[INTL]` self-flagging pattern** (`UAB-AX7-07`, 85dB) — correctly distinguishes international best-practice from confirmed Algerian law.
- **Arrêté interministériel du 7 mai 2025** — confirmed real; correctly applied in `coldRoomCriteria.ts` and `baseFoodCriteria.ts` after L-02b fix.
- **`BFD-08-01` traceability citation fix** — Art.19 → Art.12+6, 2-year retention `[حكم مهني]`.

---

## 5. DO NOT CHANGE
Every citation in section 4, plus any citation not flagged in sections 2–3. **L-06** needs a product/domain decision before any code change — not a citation swap.

---

## 6. IMPLEMENTATION ORDER (updated 2026-08-10)

1. ~~L-02, L-02b, L-03, L-04, L-05, L-10~~ — **✅ ALL DONE**, confirmed in code.
2. **L-01** — still needs implementation; Annexe II strongly indicated. Recommend final expert sign-off before committing parameter values (g/t units differ from current mg/L).
3. **L-09** — confirmed still open; Loi 18-11 is leading candidate.
4. **L-07 / W51** — monitor JORADP; 6 criteria tagged `[À VÉRIFIER — W51]`. No code change until publication confirmed.
5. **L-11** — confirm Décret 76-04 supersession status, then standardize if confirmed.
6. **L-06** — product decision required first.
7. **L-08** — supply Décret 24-196 primary document to verify.

---

## 7. HANDOFF — Remaining open items

1. **L-01** — product/regulator sign-off on Annexe II abattoir values (g/t units). Then implement.
2. **L-06** — product decision: notice-radius vs. siting-distance for poultry farming.
3. **L-07/W51** — monitor JORADP for AIM GPL2 publication.
4. **L-08** — supply Décret 24-196 to close.
5. **L-09** — identify correct Loi 18-11 articles for SPH-02-01/02 and SPH-05-01.
6. **L-11** — confirm Décret 76-04 vs. Loi 19-02 supersession.
7. **L-05 minor gap** — verify exact 0.1 mg/L figure in Décret 11-125 table.

---

## 8. REMAINING AUDIT SCOPE
8 of 19 criteria files deliberately not sampled: `mechanicCriteria.ts`, `blacksmithCriteria.ts`, `carpenteryCriteria.ts`, `carWashCriteria.ts`, `marbleCriteria.ts`, `paintShopCriteria.ts`, `printingCriteria.ts`. Considered stopping point — lower-stakes workshop/light-industrial types.

---

## DOCUMENT HISTORY
- **2026-08-06:** Initial compilation across 9 audit sessions.
- **2026-08-08:** Live re-verification pass — L-02, L-02b, L-03, L-05, L-10 confirmed fixed. L-11 discovered.
- **2026-08-09:** Live re-verification pass — L-04 confirmed fixed. L-09 confirmed still open. F-10/F-13 phantom-closure history noted.
- **2026-08-10:** L-07 updated → now tracked as W51 (AIM GPL2 unpublished, 6 criteria tagged). All status markers updated to reflect current code state.

---
*Read alongside `SafeInspect_Audit_Consolidated_2026-08-10.md` for the complete picture — that document covers code correctness and data integrity; this one covers legal and scientific grounding.*