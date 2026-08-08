# SafeInspect — Legal, Scientific & Checklist Methodology Audit
**Consolidated across 9 sessions, updated after user-supplied primary documents | Compiled 2026-08-06**
**Auditor note:** This audit is analysis only — no repository files were modified. Every finding below was checked against either (a) direct reads of the current criteria files, (b) direct reads of user-supplied primary Algerian legal documents, or (c) web-searched secondary sources — with source type noted per finding. Items I could not verify are explicitly marked UNVERIFIED rather than guessed at, per your instruction that this work is sensitive and uncertainty must be surfaced, not smoothed over.

## Primary documents received and used
Décret exécutif 17-140 (2017, food hygiene — full text, all articles), Décret exécutif 06-141 (2006, industrial liquid effluent limits — full text including Article 3 and both annexes), Décret exécutif 11-125 (2011, drinking water quality), Décret exécutif 11-219 (2011, source water quality objectives), Décret exécutif 07-144 (2007, classified installations nomenclature).

## LIVE STATUS UPDATE — fixes already applied in the repository
The project owner has already applied several of this audit's findings directly to the codebase, visible via fresh re-reads of the affected files (comments dated "W2 2026-08-07," "W4/W8 2026-08-08"):
- **L-02 (HACCP article) — FULLY RESOLVED**, applied across all 6 affected files: `baseFoodCriteria.ts`, `abattoirCriteria.ts`, `couvoirCriteria.ts`, `bakeryCriteria.ts` all now correctly cite Article 5.
- **L-03 (Décret 88-164 → 11-125) — RESOLVED**, applied in `baseGeneralCriteria.ts`.
- **L-05 (chlorine decree 11-219 → 11-125) — RESOLVED**, applied in `abattoirCriteria.ts`.
- **New minor slip introduced during the L-02 fix (L-10, below)** — worth a quick look.

**Still open, confirmed unfixed on re-read:** L-01 (Annexe I/II — expected, needs judgment call not a quick fix), L-02b (temperature citation — now incorrectly marked "verified ✅" in-code while still wrong), L-04 (Décret 93-120 ventilation mis-citation, `baseGeneralCriteria.ts`), L-06, L-07, L-08, L-09 (semi-pharma still cites the food decree, unchanged).

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

### L-02 — HACCP obligation article number — RESOLVED
**Severity:** P1 | **Status: RESOLVED** by direct reading of Articles 4, 5, and 9 of Décret 17-140 (user-supplied primary document)
**Files affected:** `baseFoodCriteria.ts` (cites Art. 9 — **wrong**), `abattoirCriteria.ts` + `couvoirCriteria.ts` + `bakeryCriteria.ts` (cite Art. 4 — **wrong**), `slaughterhouseSmallCriteria.ts` + `coldRoomCriteria.ts` (cite Art. 5 — **correct**)
**Evidence:** Article 5's exact text: *"les établissements... doivent mettre en place des procédures... fondées sur les principes du système HACCP,"* with implementation delegated to a joint arrêté — matching the confirmed-real 1 December 2020 arrêté that cites Article 5 as its own basis. Article 4 is a general hygiene-compliance obligation (not HACCP-specific). Article 9 covers equipment/premises design for primary production (not HACCP at all).
**Action required:** correct `baseFoodCriteria.ts`, `abattoirCriteria.ts`, `couvoirCriteria.ts`, and `bakeryCriteria.ts` to cite Article 5.

### L-02b — NEW: Décret 17-140 does not itself specify cold-chain temperatures (found while resolving L-02)
**Severity:** P1 | **Status: CONFIRMED**
**File affected:** `baseFoodCriteria.ts` (`BFD-04-01`, `BFD-04-02`, citing "Articles 7/8" for 0–5°C chilled / ≤−18°C frozen)
**Evidence:** Article 48 explicitly delegates specific freezing/refrigeration temperatures to a separate joint arrêté — the decree does not state them itself. Articles 7 and 8 (the ones actually cited) cover primary-product contamination protection and general hazard-prevention compliance — neither contains a temperature figure.
**Action required:** find the arrêté that actually sets these temperatures (the confirmed-real 7 May 2025 arrêté, already correctly used for a similar purpose in `coldRoomCriteria.ts`, is the most likely correct source) and re-cite `BFD-04-01`/`04-02` accordingly.

### L-03 — Décret 88-164 (drinking water) — RESOLVED (your own assessment confirmed correct)
**Severity:** P1 (affects every checklist) | **Status: RESOLVED**
**File affected:** `baseGeneralCriteria.ts` (`BGN-03-01`)
**Evidence:** Décret 88-164 could not be located by either of us. Décret 11-125's actual title, read directly — *"relatif à la qualité de l'eau de consommation humaine"* — is an exact subject match for what `BGN-03-01` needs.
**Action required:** replace the citation with Décret 11-125.

### L-04 — Décret 93-120 cited for the wrong subject in the universal base file
**Severity:** P1 (affects every checklist) | **Status: CONFIRMED** (unchanged — this was established from internal codebase evidence, not external sources)
**File affected:** `baseGeneralCriteria.ts` (`BGN-02-06`)
**Evidence:** The codebase's own audit history (in `abattoirCriteria.ts`) already established Décret 93-120 covers periodic occupational medical exams, not workplace physical-environment standards, after catching and removing a wrong citation of it for noise limits. `BGN-02-06` now cites the same decree for **ventilation** — the same class of error, in the file shared by every checklist.
**Recommended action:** find the correct ventilation citation (Décret 91-05, already correctly used elsewhere in this file, is the likely correct source).

### L-05 — Chlorine residual: two different decree numbers — RESOLVED
**Severity:** P2 | **Status: RESOLVED**
**Files affected:** `abattoirCriteria.ts` (cites Décret 11-219 — **wrong**) vs. `slaughterhouseSmallCriteria.ts` (cites Décret 11-125 — **correct**)
**Evidence:** Read both decrees' actual titles directly. Décret 11-125: *"qualité de l'eau de consommation humaine"* (treated/final drinking water). Décret 11-219: *"objectifs de qualité des eaux superficielles et souterraines destinées à l'alimentation en eau des populations"* (raw source water, pre-treatment). A residual-chlorine disinfection standard belongs with treated water, not raw source water.
**Remaining gap:** I could not confidently extract the exact "0.1 mg/L" figure from Décret 11-125's parameter table — the PDF's table-column extraction is too garbled to trust. Someone should verify that specific number directly against the table.
**Action required:** correct `abattoirCriteria.ts` to cite 11-125 instead of 11-219; independently confirm the 0.1 mg/L figure against the table.

### L-06 — UPD buffer distance: real problem, different from what was assumed
**Severity:** P2 | **Status: CONFIRMED as a real citation-concept problem** (upgraded from "unverified number" to "likely wrong regulatory concept")
**File affected:** `updCriteria.ts` (`UPD-AX2-01`)
**Evidence:** Read the actual Décret 07-144 nomenclature entry for poultry farming (rubrique 2121). It specifies a **"rayon d'affichage"** (public-notice display radius for the authorization process) of 0.5–3 km depending on flock size — **not a construction setback/buffer distance from residential areas.** These are different regulatory concepts. I don't see a literal "500m minimum distance from housing" rule in this decree's structure.
**Recommended action:** clarify whether SafeInspect actually needs a notice-radius criterion (different from what's currently framed) or a genuine siting-distance criterion (which, if it exists, is more likely set per-facility at the individual wali-level authorization, not in this nomenclature decree) — this needs a product/domain decision, not just a citation swap.

### L-07 — GPL safety thresholds: still unverified (documents not provided for this one)
**Severity:** P2 | **Status: UNCHANGED — still open**
**File affected:** `gplCriteria.ts`
Specific figures (1600 cm² ventilation openings, 3m/5m separation distances, 1400 kg storage cap, tonnage-tiered extinguisher requirements) attributed to "AIM GPL2" (14/03/2022) — not locatable by that name, and no primary document was supplied for this one. The general regulatory *pattern* (tonnage-tiered joint-ministerial arrêtés governing GPL installations) is confirmed real via Décret 21-319, but the specific numbers remain unverified.

### L-08 — Décret 24-196 (second amendment to Décret 06-198) — still unverified
**Severity:** P2 | **Status: UNCHANGED — still open**
Cited alongside the confirmed-real Décret 22-167 for classified-installation licensing. Not independently located; not contradicted either. No primary document was supplied for this one.

### L-09 — Décret 17-140 (food-specific) cited as legal basis for non-food product hygiene
**Severity:** P1 | **Status: CONFIRMED, still open** (re-verified 2026-08-08, unchanged)
**File affected:** `semiPharmaCriteria.ts` (`SPH-02-01`, `SPH-02-02`, `SPH-05-01`)
**Evidence:** Décret 17-140's own confirmed scope (this audit, session 1) is specifically food products for human consumption ("denrées alimentaires"). `criteriaData.ts` itself correctly excludes `baseFoodCriteria` from the semi-pharmaceutical checklist, recognizing this isn't a food facility — yet `semiPharmaCriteria.ts` then cites Décret 17-140's specific numbered articles (15/16 floors-walls, 13 cross-contamination, 21 worker PPE) as the legal basis for its own hygiene criteria anyway. The underlying practices are plausible good practice, but the citation likely misrepresents their legal source — this is the mirror image of the `[INTL]` pattern in `uabCriteria.ts` (correctly flagging when no Algerian-specific basis exists) rather than citing the wrong real decree.
**Recommended action:** identify the correct framework (likely within Loi 18-11's health-products provisions, already correctly used elsewhere in this file) or apply the same `[INTL]`/best-practice flag pattern already used successfully elsewhere in the codebase.

### L-10 — NEW: incorrect decree date introduced during the L-02 fix
**Severity:** P3 (trivial, but easy to fix while already in the file) | **Status: CONFIRMED, discovered 2026-08-08**
**File affected:** `bakeryCriteria.ts` (`BAK-10-10`)
**Evidence:** After correctly updating the article number to 5, the citation text reads *"المؤرخ في 27 مارس 2017"* (dated 27 March 2017). Décret 17-140's actual date, confirmed directly from the primary document, is **11 April 2017** (14 Rajab 1438). The article number fix is correct; the date attached to it is not.
**Recommended action:** correct the date string in `BAK-10-10`'s `legalReference`.

---

## 3. WHAT'S ALREADY CORRECT (confirmed — no action needed)

- **Loi 09-03** (consumer protection/fraud, 2009) and **Décret 17-140** (food hygiene, 2017) — both real, correctly dated, correctly applied throughout `baseFoodCriteria.ts`.
- **Décret 06-198** (classified installations) and its amendment **Décret 22-167** (2022) — confirmed real via multiple official sources.
- **Décret 06-141 Annexe I** general values (DBO5 ≤35, DCO ≤120, MES ≤35, oils ≤20, pH 6.5–8.5) — verbatim-confirmed against primary text; correctly applied for facility types with no Annexe II override (e.g. `uabCriteria.ts`).
- **The 1 December 2020 HACCP implementing arrêté** — confirmed real, exact date and JO reference match official records.
- **Activity → checklist mapping** (`criteriaData.ts`) — all 26 distinct facility activities have a correctly matching checklist; no silent fallback to generic criteria.
- **UPD/couvoir HACCP exclusion logic** — confirmed well-reasoned, not a bug: only UPD (live poultry farming, no food processing) is excluded from food-hygiene/HACCP criteria; couvoir (hatchery) correctly retains its own HACCP requirements. My own earlier-session note conflating these two was corrected mid-audit.
- **Décret 93-120's correct use** for periodic medical exams (e.g. `bakeryCriteria.ts` `BAK-10-11`, `abattoirCriteria.ts`'s corrected `ABT-AX7-01`) — confirmed consistent with the decree's actual subject.
- **The `[INTL]` self-flagging pattern** (`uabCriteria.ts` `UAB-AX7-07`, 85dB noise limit) — the codebase already distinguishes international best-practice from confirmed Algerian law, unprompted, exactly as this audit brief asked for.
- **Arrêté interministériel du 7 mai 2025** (JO n°43/2025, restaurant/food-distribution hygiene incl. cold-chain temperature control) — confirmed real via Ministère du Commerce Algérie's own regulatory listing; correctly and currently applied in `coldRoomCriteria.ts`.
- **Cold-chain and produce-storage temperature ranges** (`coldRoomCriteria.ts`, `produceStorageCriteria.ts`) — plausible, consistently sourced, no contradictions found.

---

## 4. DO NOT CHANGE
Every citation in section 3, plus any citation not flagged in section 2 — no evidence gathered to justify touching them. **L-06** now needs a product/domain decision (notice-radius vs. siting-distance) before any code change, not a simple citation swap — don't just replace the number.

---

## 5. IMPLEMENTATION ORDER (updated — most items now applied in code)

1. ~~**L-02** (HACCP article → Article 5)~~ — **DONE**, applied across all 6 files.
2. ~~**L-03** (Décret 88-164 → 11-125)~~ — **DONE**, applied.
3. ~~**L-05** (chlorine decree → 11-125)~~ — **DONE** for the decree number; the exact mg/L figure still needs independent confirmation against the table.
4. **L-10** (bakery date typo, 27 March → 11 April 2017) — trivial, do whenever convenient.
5. **L-02b** (cold-chain temperature citation) — CONFIRMED wrong articles cited, and now incorrectly marked "verified" in-code — needs the correct arrêté identified (7 May 2025 arrêté is the leading candidate) before fixing, and the false "✅ verified" comment should be removed regardless.
6. **L-04** (Décret 93-120 ventilation mis-citation, `baseGeneralCriteria.ts`) — still needs the correct source identified (Décret 91-05 is the leading candidate).
7. **L-01** (Annexe I/II conflict) — substantially resolved toward Annexe II being correct; still recommend a final expert/regulator sign-off given the stakes, but ready for implementation planning now.
8. **L-09** (semi-pharma citing food decree) — needs the correct framework identified (Loi 18-11 is the leading candidate).
9. **L-06** (UPD buffer distance) — needs a product decision on what the criterion should actually measure before any citation fix.
10. **L-07, L-08** — still open, no primary documents available yet for these two.

---

## 6. HANDOFF — Remaining open items only (most of the original list is now resolved)

1. **Décret 91-05** (or whatever the correct workplace-ventilation-standard decree is) — needed to fix L-04.
2. **The 7 May 2025 arrêté's full text** — needed to confirm it (not something else) sets the specific 0–5°C/≤−18°C cold-chain figures, closing L-02b.
3. **Décret 11-125's parameter table** — needed to confirm the exact free-residual-chlorine figure (likely 0.1 mg/L, but the supplied document's table formatting couldn't be reliably parsed).
4. **A product/domain decision** on L-06 (notice-radius vs. siting-distance for poultry farming) — not a document request, a decision request.
5. **"AIM GPL2" (14/03/2022)** — still need this document to close L-07.
6. **Décret 24-196** — still need this document to close L-08.

---

## 7. REMAINING AUDIT SCOPE
8 of 19 criteria files deliberately not sampled (listed in Coverage section above) — a considered stopping point, not an oversight. All are lower-stakes workshop/light-industrial types.

---
*This document should be read alongside the earlier technical/architecture audit (`SafeInspect_Audit_Consolidated_2026-08-06.md`) for the complete picture — that document covers code correctness and data integrity; this one covers legal and scientific grounding of the inspection content itself.*
