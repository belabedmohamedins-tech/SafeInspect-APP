# SafeInspect Master Checklist & Inspection Logic Audit — State Document

**Purpose:** Track progress of the multi-session regulatory audit. This file is the single source of truth for what has been audited, what is pending, and what legal references remain unverified. Every session reads this file first and updates it before ending.

**Status:** IN PROGRESS — Session 7 complete. `/legal_refs/` under maintenance (Perplexity fixing conversion errors — see Section 4).
**Last updated:** 2026-08-08 (Session 7)

---

## 1. Source-of-truth hierarchy

1. GitHub code (this repo, branch `main`) — what the app currently does.
2. `legal_refs/` (24 files) and `docs/legal_sources/` — legal texts. **`legal_refs/` is currently under maintenance** — several files were found to contain fabricated/incorrect article content (see Section 4). Do not trust any file in `legal_refs/` for citation verification until this note is cleared.
3. `docs/Inspection_Manual_Chapter1-8_*.md` — project's own methodology docs.
4. `docs/SafeInspect_Audit_Consolidated_2026-08-06 (1).md`, `docs/STRATEGIC_PLAN.md` — prior AI/human audit work. Historical context only, not trusted as verified law.

## 2. Full scope inventory

### 2a. Criteria files — `src/criteria/` (17 activity-specific + 3 base)
| File | Size | Status |
|---|---|---|
| baseGeneralCriteria.ts | 31.7 KB | PARTIAL — 4/30 criteria audited (BGN-01-01, BGN-08-01, BGN-08-02, BGN-08-05) |
| baseFoodCriteria.ts | 10.7 KB | DONE — 12/12 criteria audited |
| baseCompressedGasCriteria.ts | 2.8 KB | NOT AUDITED |
| abattoirCriteria.ts | 20.4 KB | NOT AUDITED |
| bakeryCriteria.ts | 8.6 KB | NOT AUDITED |
| blacksmithCriteria.ts | 7.3 KB | NOT AUDITED |
| carWashCriteria.ts | 10.1 KB | NOT AUDITED |
| carpenteryCriteria.ts | 6.0 KB | NOT AUDITED |
| coldRoomCriteria.ts | 7.6 KB | NOT AUDITED |
| couvoirCriteria.ts | 16.7 KB | NOT AUDITED |
| gplCriteria.ts | 11.9 KB | NOT AUDITED |
| marbleCriteria.ts | 10.0 KB | NOT AUDITED |
| mechanicCriteria.ts | 6.2 KB | NOT AUDITED |
| paintShopCriteria.ts | 8.7 KB | NOT AUDITED |
| printingCriteria.ts | 8.3 KB | NOT AUDITED |
| produceStorageCriteria.ts | 5.5 KB | NOT AUDITED |
| semiPharmaCriteria.ts | 7.6 KB | NOT AUDITED |
| slaughterhouseSmallCriteria.ts | 12.9 KB | NOT AUDITED |
| uabCriteria.ts | 25.8 KB | NOT AUDITED |
| updCriteria.ts | 15.1 KB | NOT AUDITED |
| src/criteria/index.ts | 3.0 KB (aggregator) | AUDITED — see Finding F2 (dead-code hazard) |
| src/criteriaData.ts | 9.1 KB | AUDITED — applicability engine, see Finding F1 (critical defect) |

### 2b. Classification & facility data
| File | Size | Status |
|---|---|---|
| src/facilityCategoriesFull.json | 88.0 KB | AUDITED — verified high-fidelity transcription of Décret 07-144 nomenclature |
| src/facilityCategories.ts | 0.4 KB | AUDITED (consumed by add.tsx/edit.tsx) |
| src/facilitiesData.ts | 25.3 KB | AUDITED — static seed data, 26 legacy activity strings, no `rubrique` field |
| src/facilitiesService.ts | 5.9 KB | NOT AUDITED |
| src/repositories/FacilityRepository | — | NOT AUDITED directly (referenced by edit.tsx) |

### 2c. Core model / logic
| File | Status |
|---|———|
| src/types.ts (15.3 KB) | READ — see Session 1 notes below |
| src/hooks/useChecklistData.ts | AUDITED — confirmed root cause of Finding F1 |
| app/screens/facilities/add.tsx | AUDITED — confirmed source of Finding F1 |
| app/screens/facilities/edit.tsx | AUDITED — confirmed same defect as add.tsx |
| scoringUtils.ts | NOT LOCATED yet |
| src/db/, src/repositories/, src/services/, src/stores/ | NOT AUDITED (except FacilityRepository indirectly) |

### 2d. Documentation (methodology, not code)
8 Inspection Manual chapters — NOT AUDITED. Should be cross-checked against criteria files.

### 2e. Deferred (lower priority per protocol)
`server/`, `components/`, `hooks/` (non-checklist), `scripts/`, `.github/`.

## 3. CRITICAL FINDINGS

### F1 — Activity/checklist mismatch (CRITICAL, confirmed, Sections 4 & 11)
**Every facility created or edited through the app's real UI silently receives the wrong checklist.**

`add.tsx` and `edit.tsx` both write `activity` as `"{rubrique} - {label} ({regime})"` (e.g.
`"2210 - ذبح الحيوانات (> 2 طن/يوم) (تصريح)"`), sourced from the full 07-144 nomenclature
(`facilityCategories.ts` / `facilityCategoriesFull.json`). `criteriaByActivity` in
`src/criteriaData.ts` does a **strict exact-string match** against 26 hardcoded keys in a
completely different plain-phrase format, inherited from static seed data
(`src/facilitiesData.ts`) that predates the current UI — confirmed by the map's own comment:
*"Keys are EXACT activity strings from src/facilitiesData.ts... Verified 2026-08-05: all 26
distinct facility activity values have a key below."* `useChecklistData.ts` resolves with
`criteriaByActivity[p.activity] ? ... : criteriaByActivity.default` — no normalization, no
rubrique-based lookup, even though both `add.tsx` and `edit.tsx` already capture and persist
`rubrique` as its own field (tagged "Z11" in code comments — a prior partial fix that was never
wired into checklist selection).

**Effect:** any real-world facility (i.e. the overwhelming majority going forward, since the
seed data is static and finite) silently gets `criteriaByActivity.default`
(`baseGeneralCriteria` only) instead of its correct activity-specific checklist — no error, no
warning, no visible sign to the inspector that anything is missing.

**Verdict: MODIFY (implementation, not this audit's scope).**
Recommended fix direction: re-key `criteriaByActivity` (or a new map) by `rubrique` instead of
the free-text `activity` string; build coverage from `facilityCategoriesFull.json` rather than
the 26 legacy seed values; add a visible fallback warning when a facility resolves to `default`.

**Evidence trail:** `app/screens/facilities/add.tsx`, `app/screens/facilities/edit.tsx`,
`src/hooks/useChecklistData.ts`, `src/criteriaData.ts` (Session 7).

### F2 — Dead-code hazard: `allCriteria` (Section 6, low severity, live risk)
`src/criteria/index.ts` exports `allCriteria`, a flat concatenation of every criterion from
every activity file with no activity filtering. Confirmed unused by both real consumers of
checklist data (`checklists.tsx` preview screen and `useChecklistData.ts` live-inspection flow),
both of which correctly use `criteriaByActivity`. Not a live bug today, but a landmine: one
accidental import away from silently bypassing all applicability logic. Recommend deleting or
clearly marking test-only. (Session 3.)

### F3 — Unverified/incorrect legal citations found so far
- `BGN-04-06` (Décret 09-19): cited “Articles 4–8” for the accreditation/verification
  requirement; actual accreditation clause is **Article 2**, validity period is **Article 6**.
  Articles 4–8 are adjacent context (application file, insurance, register). MODIFY. (Session 6.)
- `BFD-08-01` (Loi 09-03 Art. 19): claimed Article 19 establishes food-chain traceability.
  **Confirmed INCORRECT** via official JO amendment text — Article 19 is actually about the
  consumer's right of withdrawal (droit de rétractation), added by Loi 18-09 (2018). No
  traceability provision found elsewhere in the 95-article law either. MODIFY — needs a correct
  citation (likely Décret 17-140) or re-tagging as `[حكم مهني]`. (Session 7.)
- `BFD-02-02`: cites Décret 17-140 generically for specific storage clearances (≥15cm floor,
  ≥5cm wall) — these exact figures not found in the decree's actual storage provisions
  (Art. 12–24). Likely an unsourced industry-standard figure presented as decree-derived.
  MODIFY — needs a real source or `[حكم مهني]` tag. (Session 7.)
- `BGN-08-01` / `BGN-08-02` (Loi 19-02): correct subject matter but cite the law generically
  instead of the specific article (Art. 5 and Art. 13 respectively, both confirmed correct via
  local source). Sibling criterion `BGN-08-05` already does this correctly. Low-severity,
  easy fix — bring 08-01/08-02 up to 08-05's standard. (Session 5.)

### Verified correct (positive findings, not exhaustive)
- `BGN-01-01`: Décret 24-196 (2024) 3-year regularization grace period — confirmed real via
  Ministry of Environment/APS statement. Exact end-date computation still open (press summary
  doesn’t specify which date the 3 years run from).
- `BGN-08-05`: Loi 19-02 Art. 5 citation confirmed correct.
- `BFD-05-01`: Décret 17-140 Art. 5 confirmed as the actual HACCP obligation article, including
  the primary-production exclusion the criterion describes.
- `BFD-04-01`/`BFD-04-02`: a prior in-code correction (tagged “W7”) moving the cold-chain
  temperature citation from Décret 17-140 Art. 7/8 to a separate 2025 arrêté is confirmed
  legally sound — Décret 17-140 Art. 24 itself delegates exact temperatures to that separate
  instrument.
- `facilityCategoriesFull.json`: spot-checked against real Décret 07-144 text — high-fidelity,
  correct rubrique codes, thresholds, and structure.
- Décret 06-198, Décret 07-144, Décret 22-167, Décret 24-196, Décret 09-19: all confirmed real
  and correctly identified (name, date, subject matter).

## 4. `/legal_refs/` — UNDER MAINTENANCE (do not use for verification until cleared)

A second, larger legal-source folder (`legal_refs/`, 24 files) was found in Session 7,
containing texts for several previously-missing instruments (Loi 09-03, Loi 01-19, Loi 03-10,
Loi 04-20, Décret 05-315, Décret 07-145, and more). However:

- **`legal_refs/loi-09-03.md` (short stub) confirmed to contain fabricated article content** —
  both of its two summarized articles (7 and 19) are wrong. It claims Art. 7 = record-retention
  duty and Art. 19 = traceability duty; the real law (confirmed via the full-text file in the
  same folder AND independently via official JO text) has Art. 7 = food-contact material
  inertness and Art. 19 = right of withdrawal. The stub’s own header lists “Articles cited in
  the app: 7, 19” — suggesting it may have been generated to match the app’s existing (also
  wrong) claims rather than independently transcribing the law.
- Apparent duplicate file pairs (short stub vs. full text) exist for at least 4 instruments and
  have NOT all been checked yet for the same fabrication pattern:
  - `loi-01-19.md` vs `loi-01-19-gestion-dechets.md`
  - `loi-03-10.md` vs `loi-03-10-protection-environnement.md`
  - `docs/legal_sources/Decret-06-198.md` vs `legal_refs/decret-06-198-etablissements-classes.md`
- The `loi-09-03-protection-consommateur.md` full-text file itself has incomplete stretches —
  several articles (43–52, 80–92) are placeholder labels like “(Dispositions relatives à…)”
  rather than actual transcribed text.

**Action in progress:** user is having Perplexity re-convert all source PDFs from scratch under
strict verbatim/no-circular-reference instructions, consolidate duplicates, and flag unreadable
passages explicitly. **Do not resume citation verification against `legal_refs/` until this is
confirmed done and spot-checked.**

## 5. Legal references — verification tracker

Confirmed VERIFIED: Décret 06-198, Décret 07-144, Décret 22-167, Décret 24-196, Décret 09-19,
Décret 17-140 (all: existence, identity, subject matter — see Section 3 for article-level
detail). Loi 19-02 Art. 5 and Art. 13. Décret 17-140 Art. 5, Art. 24.

Confirmed INCORRECT: Loi 09-03 Art. 19 (as cited by `BFD-08-01`); `legal_refs/loi-09-03.md`
stub file entirely (Art. 7 and Art. 19 both wrong).

UNVERIFIED — DO NOT IMPLEMENT AS VERIFIED LAW:
- BFD-02-02’s 15cm/5cm storage clearance figures (no source found yet)
- Exact end-date of the Décret 24-196 grace period (3 years from which date?)
- Décret 06-198 Art. 20 (cited in a types.ts comment re: 'warning' sanction tier) — not yet
  independently verified

## 6. Session log

### Session 1 (2026-08-07): Scope inventory, read types.ts. Flagged (later corrected) rubrique claim.
### Session 2: Traced criteriaData.ts/criteriaByActivity wiring. Verified 26-activity coverage claim (true, but only for old seed data — see F1). Found F2 (allCriteria dead code).
### Session 3: Continuation of Session 2 findings; confirmed F2 not live-wired.
### Session 4: Read facilitiesData.ts. Withdrew Session 1 rubrique claim (field didn’t exist in that file). Flagged classification-linkage gap (resolved in Session 7 as F1) and a PII-in-repo concern (out of scope, noted for user).
### Session 5: Began criterion-by-criterion audit of baseGeneralCriteria.ts. Verified BGN-01-01 (Décret 24-196), BGN-08-01/02/05 (Loi 19-02).
### Session 6: Full audit of baseFoodCriteria.ts (12/12). Verified Décret 09-19 full text; found BGN-04-06 citation imprecision.
### Session 7 (2026-08-08): Discovered `/legal_refs/` (24 files); found and confirmed fabricated content in `loi-09-03.md` stub via independent JO verification; found BFD-08-01 incorrect citation and BFD-02-02 unsourced figures. User initiated Perplexity re-conversion of `/legal_refs/` — marked under maintenance (Section 4). Pivoted to non-legal-text thread: confirmed **F1**, the critical activity/checklist mismatch defect, via `add.tsx` + `edit.tsx` + `useChecklistData.ts` + `criteriaData.ts`.

**Recommended next session:** once `/legal_refs/` maintenance is confirmed complete, spot-check
the fixed files against official JO text before resuming citation verification. In parallel,
continue the criterion-by-criterion audit of `baseGeneralCriteria.ts` (26/30 remaining) or move
to the redundancy audit (Section 6 of the protocol) across the 20 criteria files. F1 is the
single highest-priority implementation item to flag to the dev team regardless of audit
progress elsewhere.
