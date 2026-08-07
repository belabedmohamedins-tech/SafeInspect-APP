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
| Z10-FIX | Test drift — SettingsRepository test + schema migration count | 2026-08-06 | Commit `83db48c`. `__tests__/repositories/SettingsRepository.test.ts` rewritten. **All green — user-confirmed 13:07 WAT.** |
| Z11 | Wire `facilityCategoriesFull.json` rubrique into DB + screens | 2026-08-06 | Migration `003_facilities_add_rubrique` added. FacilityRepository + add.tsx + edit.tsx updated. Gate closed 13:22 WAT — 25/25 Jest, TSC 0. |
| Z12 | Audit Findings Closure (F-01 to F-18, 15 sub-items) | 2026-08-06 | TSC 0 + Jest 1234/0 — user-confirmed 20:15 WAT. Commits: `9a5d3e7`, `9c78e3e`. |
| Z6 | Décret 09-19 rollout — BGN-04-06 legalRef + accreditation check | 2026-08-06 | BGN-04-06 criteria + legalReference updated. Commit `5ed564b`. Confirmed by direct code read. |
| Z8 | BGN-03-06 septic pumping — remove unverified 90d/80% figures | 2026-08-06 | Replaced with contract+receipts+no-overflow formulation. Commit `5ed564b`. Décret 17-140 confirmed unrelated (food hygiene). No Algerian legal source found for specific intervals. |
| **W1** | **getDb() race guard + SyncService test env fix + serverAuth Babel env fix** | **2026-08-07** | **Commits: `a6c9a40`, `5caf6b1`, `4b4c0e5`, `bee6b60`. Jest 1234/0 + TSC 0 + Android runtime — all confirmed by user 17:54 WAT.** |
| **W2** | **Checklist section chevron direction bug fix** | **2026-08-07** | **`app/(tabs)/inspection/checklist.tsx` — `isCollapsed ? 'chevron-right' : 'chevron-down'`. Commit `906647f`. No logic change.** |

---

### 🟡 OPEN Phases

*None. Repo is clean.*

---

### 🔵 DEFERRED Phases

| ID | Title | Blocker |
|---|---|---|
| Z9 | Server E2E integration test — `/sync` path against live instance | Needs a running server. |

---

## Phase Numbering Convention

- Letters A–Z + Z2–Z5, Z7, Z10, Z10-FIX, Z11, Z12, Z6, Z8, W1, **W2** are closed.
- Z9 is deferred.
- **No open phases. Next new phase identifier: W3.**
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
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified — added to BGN-04-06 legalReference (Z6) |
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
| Décret 17-140 | Food hygiene / human consumption conditions | N/A for BGN-03-06 | ✅ CONFIRMED — NOT septic pumping. BGN-03-06 revised without this source. |
| BGN-03-06 septic pumping frequency | No Algerian legal source found for 90d/80% rule | — | ⚠️ Z8 CLOSED — figures removed. Reopen as Z13+ if JORADP source is found. |
