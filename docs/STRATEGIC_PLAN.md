# SafeInspect — Strategic Plan & Phase Registry

> This is the single source of truth for phase numbering and execution order.
> Before opening a new phase, read this file to find the highest existing letter/number.
> Claude and Perplexity coordinate through this file — not through memory.

---

## Phase Registry

### ✅ CLOSED Phases

| Phase | Title | Closed | Evidence |
|---|---|---|---|
| A | Scoring engine + types | 2026-07-30 | `src/utils/scoringUtils.ts`, `src/types/` confirmed present |
| B | Wastewater chapter (Ch1) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter1_Wastewater.md` |
| C | Solid/Hazardous Waste (Ch2) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter2_Solid_Hazardous_Waste.md` |
| D | Fire Safety (Ch3) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter3_Fire_Safety.md` |
| E | Food Safety (Ch4) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter4_Food_Safety.md` |
| F | Occupational Health (Ch5) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter5_Occupational_Health.md` |
| G | Documentation/Licensing (Ch6) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter6_Documentation_Licensing.md` |
| H | Air Quality (Ch7) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter7_Air_Quality.md` |
| I | Site Hygiene/Pest Control (Ch8) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter8_Site_Hygiene_Pest_Control.md` |
| L | Criteria implementation in app code | 2026-08-04 | Direct code read — 20 files in `src/criteria/` |
| M | Scoring integration with criteria | 2026-08-04 | Direct code read — `scoringUtils.ts` severity-weighted, A/B/C/D grades |
| N | Report generation module | 2026-08-04 | Direct code read — `src/services/pdfService.ts` 54 KB, Arabic RTL |
| O | Corrective actions tracking | 2026-08-04 | Direct code read — full CAP pipeline in `src/` |
| P | Statistics / dashboard module | 2026-08-04 | Direct code read — `statsUtils.ts`, `loadHomeData.ts` |
| Q-1 | Lifecycle audit — read checklist.tsx + start.tsx | 2026-08-04 | Evidence/Evaluation/Decision/Closure all inside checklist.tsx |
| Q | UI screens — Reinspection screen | 2026-08-04 | `app/screens/reinspection.tsx` delivered, `app/_layout.tsx` updated |
| S | Legal verify — Loi 19-02 fire safety scope | 2026-08-04 | JORADP primary source. ERP scope confirmed. |
| T | Legal verify — Décret 06-138 air quality Annex I | 2026-08-04 | Ch7 Section 6 — 16 params + 7 sectors. |
| U | UX polish — end-to-end inspector flow | 2026-08-04 | 3 RTL/UX bugs fixed. Commit 239811b. |
| V | TypeScript zero-error pass | 2026-08-05 | `npx tsc --noEmit` → 0 errors confirmed by user. |
| R | Jest + smoke tests | 2026-08-06 | `npx jest` → 119 passed / 0 failed / 1315 tests. User-confirmed 00:47 WAT. |
| W | Legal document verification (5 source gaps) | 2026-08-06 | All 5 docs/legal_sources/ files read. 0 [À VÉRIFIER] in codebase. |
| X | i18n screen wire-up (5 screens) | 2026-08-06 | TSC 0 errors + Jest 119/0. User-confirmed 01:32 WAT. |
| Y | Air-emissions criteria — 5 factory types | 2026-08-06 | All criteria already present: PNT/MRB/CRP/PRT/BSM -07-xx. No code change needed. |
| Z | Fix wrong Décret 22-167 citation — UAB-AX6-01 | 2026-08-06 | Confirmed by live read: already fixed in prior session. No code change needed. |
| Z2 | Fix wrong 85 dB noise citation — UAB-AX7-07 | 2026-08-06 | Confirmed by live read: already fixed. [INTL] flag applied. No code change needed. |
| Z3 | Resolve 3 duplicate license criteria | 2026-08-06 | Confirmed by live read: BAK-10-01, CLD-17-01, PRD-01-01 NOT duplicates. No change. |
| Z4 | Fix PRD-02-01 missing numericField | 2026-08-06 | Confirmed by live read: already split (PRD-02-01 + PRD-02-01b). No change. |
| Z5 | SQLite repository swap — 5 repositories | 2026-08-06 | All 5 repos confirmed on SQLite. Commits: bbe9c5f + f656e4e (Z5-FIX1/2/3). |
| Z7 | `facilityCategoriesFull.json` domain review | 2026-08-06 | Direct read: 88 KB, 622 entries. Content confirmed correct against Décret 07-144. |
| Z10 | AsyncStorage fallback removal — InspectionRepository + SettingsRepository | 2026-08-06 | Commit `4ff351c`. `_migrated`/`ensureMigrated()` removed. SettingsRepository rewritten to SQLite. |
| Z10-FIX | Test drift — SettingsRepository test + schema migration count | 2026-08-06 | Commit `83db48c`. `__tests__/repositories/SettingsRepository.test.ts` rewritten. `git pull` fixed stale local copies. **All green — user-confirmed 13:07 WAT.** |
| Z11 | Wire `facilityCategoriesFull.json` rubrique into DB + screens | 2026-08-06 | Migration `003_facilities_add_rubrique` added. `Facility.rubrique?: string` in types. FacilityRepository + add.tsx + edit.tsx updated. Gate closed 13:22 WAT — 25/25 Jest, TSC 0. |

---

### 🟡 OPEN Phases

| ID | Title | Priority |
|---|---|---|
| **Z12** | **Audit Findings Closure (F-01 to F-18)** | **#1 — Next** |

---

**Z12 Spec — Audit Findings Closure (F-01 to F-18)**

Source: `docs/SafeInspect_Audit_Consolidated_2026-08-06-1.md` (Claude, independent QA).

### Z12-IMMEDIATE (safe code fixes, no design debate)

| Sub-ID | Finding | Severity | Action |
|---|---|---|---|
| **Z12-01** | **F-12 — Integrity hash not persisted** | CRITICAL | Add `IntegrityService.hashAndStore(toSave)` in `InspectionRepository.save()`'s `isNewCompletion` branch. Add test: complete inspection → `verifyInspection()` returns `ok: true`. |
| **Z12-02** | **F-15 — No follow-up for "unable-to-verify"** | HIGH | In `createFollowUpIfNeeded()`, also trigger follow-up when any item has `complianceStatus === 'unable-to-verify'`. |
| **Z12-03** | **F-10 — New facility categories invisible in start flow** | HIGH | Change `categories.tsx` to derive category list from `facilitiesService.getAllFacilities()` instead of static `src/facilitiesData`. |
| **Z12-04** | **F-08 — Redundant CAP-creation call** | LOW | Remove the second `createCapItemsFromInspection()` call in `checklist.tsx`'s `doFinish()`. |
| **Z12-05** | **F-09 — No autosave on app-kill/background** | MEDIUM | Add `AppState` listener and/or periodic autosave in `useChecklistData.ts`. |
| **Z12-06** | **F-01 — `.env` not gitignored** | MEDIUM | Add `.env` to `.gitignore`. |
| **Z12-07** | **F-05 — Prod API URL falls back to localhost** | LOW | Remove or gate the `localhost` fallback in `getApiUrl()`. |

### Z12-DESIGN-NEEDED (implement after short product/UX decision)

| Sub-ID | Finding | Severity | Decision needed |
|---|---|---|---|
| **Z12-08** | **F-11 — Approved inspections not immutable** | CRITICAL | Decide: hard block on edits/deletes for `approvalStatus === 'approved'`, or allow supervisor override workflow? Implement guard in `save()`/`delete()` accordingly. |
| **Z12-09** | **F-18 — Local/server approval workflows disconnected** | HIGH | Decide: wire `serverAuth.approveInspection()`/`rejectInspection()` into `ApprovalRepository`, or remove server endpoints as dead code? Resolve together with Z12-08. |
| **Z12-10** | **F-13 — Reinspection can link wrong facility** | HIGH | Decide: skip facility re-selection entirely for reinspection, or add facility-match guard in `buildDifferentialView()`? |
| **Z12-11** | **F-14 — Inconsistent "evaluated" definitions + mislabeling** | MEDIUM-HIGH | Confirm intended definition of "evaluated" and desired labels/colors for `observation-only`/`unable-to-verify`. |
| **Z12-12** | **F-17 — Server/mobile schema mismatch** | HIGH (pre-sync) | Confirm current server schema; write explicit mapping functions before enabling real sync. |

### Z12-LEGAL (legal-review only, no code change until verified)

| Sub-ID | Finding | Severity | Action |
|---|---|---|---|
| **Z12-13** | **F-16 — HACCP legal citation (Décret 17-140)** | MEDIUM | Route to legal expert with primary-source access; update comment/citation if needed. |

**Implementation order:**
1. Z12-01 → Z12-07 (IMMEDIATE, in any order; Z12-01 first as CRITICAL).
2. Z12-08 → Z12-12 (after product/UX decisions).
3. Z12-13 (parallel legal review).

**Close condition:** All 13 sub-items marked ✅ in this section, TSC 0 errors, Jest passing.

---

### 🔵 DEFERRED Phases

| ID | Title | Blocker |
|---|---|---|
| Z6 | Décret 09-19 rollout across all "approved operator" criteria (G9) | Full criteria audit needed first. |
| Z8 | `BGN-03-06` septic pumping frequency legal source (G11) | ≤90 days/80% capacity has no stated legal basis — find or remove. |
| Z9 | Server E2E integration test — `/sync` path against live instance | Needs a running server. |

---

## Phase Numbering Convention

- Letters A–Z + Z2–Z5, Z7, Z10, Z10-FIX, Z11 are closed.
- Z6, Z8, Z9 are deferred.
- **Z12 is now OPEN — Audit Findings Closure (F-01 to F-18).**
- **Next new phase identifier after Z12 closes: Z13.**
- Never reuse a closed phase letter.
- Both agents must read this file before opening any new phase.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Rubrique nomenclature (622 entries) | Décret 07-144 | Full annex | ✅ VERIFIED — `facilityCategoriesFull.json` confirmed correct |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED |
| Fire safety — ERP type/category list | Loi 19-02 | Art. 14 | ✅ CLOSED — Ord. 76-04 = operational base. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage (point de vente) | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED — 16 params mg/Nm³ + 7 sectors. |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Cold-chain temps (restaurants) | Arrêté interminist. 07/05/2025 | Full text | ✅ VERIFIED |
| Cold storage temps by product type | Arrêté interminist. 21/11/1999 | Temperature table | ✅ VERIFIED |
| Occupational health — medical exam | Décret 93-120 du 15/05/1993 | Art. périodicité | ✅ VERIFIED |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
