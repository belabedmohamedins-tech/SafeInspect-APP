# SafeInspect Master Checklist & Inspection Logic Audit — State Document

**Purpose:** Track progress of the multi-session regulatory audit. This file is the single source of truth for what has been audited, what is pending, and what legal references remain unverified. Every session reads this file first and updates it before ending.

**Status:** IN PROGRESS — Session 8 complete. W19 ✅ CLOSED. `legal_refs/` cleaned and usable.
**Last updated:** 2026-08-08 (Session 8 — Perplexity)

---

## 1. Source-of-truth hierarchy

1. GitHub code (this repo, branch `main`) — what the app currently does.
2. `legal_refs/` (7 content files — see Section 4 for inventory) and `docs/legal_sources/` — legal texts. **`legal_refs/` is now CLEAN** — all empty stubs deleted 2026-08-08 (W19). See Section 4 for which instruments still lack source files.
3. `docs/Inspection_Manual_Chapter1-8_*.md` — project's own methodology docs.
4. `docs/SafeInspect_Audit_Consolidated_2026-08-06 (1).md`, `docs/STRATEGIC_PLAN.md` — prior AI/human audit work. Historical context only, not trusted as verified law.

---

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
|---|---|
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

---

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
- `BGN-04-06` (Décret 09-19): cited "Articles 4–8" for the accreditation/verification
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
  doesn't specify which date the 3 years run from).
- `BGN-08-05`: Loi 19-02 Art. 5 citation confirmed correct.
- `BFD-05-01`: Décret 17-140 Art. 5 confirmed as the actual HACCP obligation article, including
  the primary-production exclusion the criterion describes.
- `BFD-04-01`/`BFD-04-02`: a prior in-code correction (tagged "W7") moving the cold-chain
  temperature citation from Décret 17-140 Art. 7/8 to a separate 2025 arrêté is confirmed
  legally sound — Décret 17-140 Art. 24 itself delegates exact temperatures to that separate
  instrument.
- `facilityCategoriesFull.json`: spot-checked against real Décret 07-144 text — high-fidelity,
  correct rubrique codes, thresholds, and structure.
- Décret 06-198, Décret 07-144, Décret 22-167, Décret 24-196, Décret 09-19: all confirmed real
  and correctly identified (name, date, subject matter).

---

## 4. `legal_refs/` — ✅ CLEANED 2026-08-08 (W19)

**W19 completed by Perplexity, Session 8, 2026-08-08.**

All 17 zero-byte stub files deleted. Directory now contains 7 real content files + README + .cleanup marker.

### Current inventory (content files only)

| File | Instrument | Content state |
|---|---|---|
| `loi-03-10-protection-environnement.md` | Loi 03-10 (2003) | ✅ Full text (114 articles) |
| `loi-09-03-protection-consommateur.md` | Loi 09-03 (2009) | ⚠️ Partial — Art. 43–52 and 80–92 are placeholders |
| `loi-01-19-gestion-dechets.md` | Loi 01-19 (2001) | ✅ Full text |
| `Decret-07-144.md` | Décret 07-144 | ✅ Full text (nomenclature établissements classés) |
| `Decret-17-140.md` | Décret 17-140 (2017) | ✅ Full text |
| `decret-06-198-etablissements-classes.md` | Décret 06-198 | ✅ Full text |
| `decret-09-19.md` | Décret 09-19 | ✅ Full text |

### Instruments cited in criteria with NO source file yet

These must be sourced (PDF → Markdown, verbatim, no circular reference) before citation verification can proceed for the files that use them.

| Instrument | Used by | Priority |
|---|---|---|
| Loi 19-02 (incendie/panique) | BGN-08-xx | 🔴 P0 — partial stub exists in `docs/legal_sources/` |
| Loi 18-11 (santé publique) | semiPharmaCriteria.ts | 🔴 P0 — blocks W12 |
| Décret 11-125 (abattoirs) | abattoirCriteria.ts | 🟠 P1 |
| Décret 21-430 (GPL/C) | gplCriteria.ts | 🟠 P1 |
| Décret 06-141 (eaux usées) | abattoirCriteria, slaughterhouse | 🟠 P1 |
| Loi 04-20 (risques majeurs) | baseGeneralCriteria.ts | 🟡 P2 |
| Décret 02-427 (hygiène locaux) | baseGeneralCriteria.ts | 🟡 P2 |
| Décret 05-315 (déchets hospitaliers) | baseGeneralCriteria.ts | 🟡 P2 |
| Décret 07-145 (études d'impact) | baseGeneralCriteria.ts | 🟡 P2 |
| Décret 91-05 (prévention risques) | baseGeneralCriteria.ts | 🟡 P2 |
| Loi 05-12 (eau) | baseGeneralCriteria.ts | 🟡 P2 |
| Loi 90-11 (travail) | baseGeneralCriteria.ts | 🟡 P2 |
| Loi 90-29 (urbanisme) | updCriteria.ts | 🟡 P2 |
| Loi 18-09 (amendement conso.) | corrects Loi 09-03 citations | 🟡 P2 |

### Deleted stubs (2026-08-08, W19)
`Decret-06-198.md`, `decret-02-427.md`, `decret-05-315.md`, `decret-07-145.md`,
`decret-11-125.md`, `decret-21-430.md`, `decret-91-05.md`, `loi-01-19.md`, `loi-03-10.md`,
`loi-04-20-prevention-risques-majeurs.md`, `loi-05-12.md`, `loi-09-03.md`,
`loi-18-09-amendement-protection-consommateur.md`, `loi-18-11.md`, `loi-19-02.md`,
`loi-90-11.md`, `loi-90-29.md`

---

## 5. Legal references — verification tracker

Confirmed VERIFIED: Décret 06-198, Décret 07-144, Décret 22-167, Décret 24-196, Décret 09-19,
Décret 17-140 (all: existence, identity, subject matter — see Section 3 for article-level
detail). Loi 19-02 Art. 5 and Art. 13. Décret 17-140 Art. 5, Art. 24.

Confirmed INCORRECT: Loi 09-03 Art. 19 (as cited by `BFD-08-01`); `legal_refs/loi-09-03.md`
stub file entirely — deleted (Art. 7 and Art. 19 both wrong; fabricated to match app claims).

UNVERIFIED — DO NOT IMPLEMENT AS VERIFIED LAW:
- BFD-02-02's 15cm/5cm storage clearance figures (no source found yet)
- Exact end-date of the Décret 24-196 grace period (3 years from which date?)
- Décret 06-198 Art. 20 (cited in a types.ts comment re: 'warning' sanction tier) — not yet
  independently verified

---

## 6. Session log

### Session 1 (2026-08-07): Scope inventory, read types.ts. Flagged (later corrected) rubrique claim.
### Session 2: Traced criteriaData.ts/criteriaByActivity wiring. Verified 26-activity coverage claim (true, but only for old seed data — see F1). Found F2 (allCriteria dead code).
### Session 3: Continuation of Session 2 findings; confirmed F2 not live-wired.
### Session 4: Read facilitiesData.ts. Withdrew Session 1 rubrique claim (field didn't exist in that file). Flagged classification-linkage gap (resolved in Session 7 as F1) and a PII-in-repo concern (out of scope, noted for user).
### Session 5: Began criterion-by-criterion audit of baseGeneralCriteria.ts. Verified BGN-01-01 (Décret 24-196), BGN-08-01/02/05 (Loi 19-02).
### Session 6: Full audit of baseFoodCriteria.ts (12/12). Verified Décret 09-19 full text; found BGN-04-06 citation imprecision.
### Session 7 (2026-08-08): Discovered `/legal_refs/` (24 files); found and confirmed fabricated content in `loi-09-03.md` stub via independent JO verification; found BFD-08-01 incorrect citation and BFD-02-02 unsourced figures. User initiated Perplexity re-conversion of `/legal_refs/` — marked under maintenance (Section 4). Pivoted to non-legal-text thread: confirmed **F1**, the critical activity/checklist mismatch defect, via `add.tsx` + `edit.tsx` + `useChecklistData.ts` + `criteriaData.ts`.
### Session 8 (2026-08-08) — Perplexity — W19 ✅ CLOSED
- Confirmed `legal_refs/` exists at repo root (user correctly challenged phantom-directory claim from prior turn — confirmed by direct GitHub API listing).
- Full inventory: 26 entries total — 17 were zero-byte stubs (SHA `e69de29b`), 7 had real content, 1 README, 1 `.cleanup` marker.
- Deleted all 17 empty stubs. Updated `legal_refs/README.md` with accurate inventory and missing-source table.
- **`legal_refs/` is now safe to use** for the 7 instruments listed in Section 4. Citation verification may resume against those files.
- **Next priority:** supply source PDFs for P0 instruments (Loi 19-02 full text, Loi 18-11) before resuming W12 or BGN-08-xx audit. Then continue baseGeneralCriteria.ts (26/30 remaining).

**Recommended next session:** Resume criterion-by-criterion audit of `baseGeneralCriteria.ts` (26/30 criteria remaining). For any criterion citing a P0/P1 instrument with no source file, tag `[À VÉRIFIER — source manquante]` and continue — do not block the entire audit on missing PDFs.
