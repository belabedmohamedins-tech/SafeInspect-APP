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
| S | Legal verify — Loi 19-02 fire safety scope | 2026-08-04 | JORADP primary source, both editions. ERP scope fully confirmed. |
| T | Legal verify — Décret 06-138 air quality Annex I | 2026-08-04 | Ch7 Section 6 — 16 params mg/Nm³ + 7 sectors. Detected by CODE VS DOC check. |
| **U** | **UX polish — end-to-end inspector flow** | **2026-08-04** | **3 RTL/UX bugs fixed: (1) reinspection.tsx back arrow RTL correction + member empty hint; (2) checklist.tsx empty-criteria guard state; (3) categories.tsx RTL icon order + layout. Commit 239811b.** |

---

### 🔴 OPEN Phases (in execution order)

#### Phase V — TypeScript Mass Fix (145 errors, 63 files) — ASSIGN TO CLAUDE
**Type:** Test gate / Code fix  
**Priority:** 🔴 BLOCKER — TypeScript gate is NOT clean. Must be fixed before Phase R can close.  
**Opened:** 2026-08-05  

**Context:** User ran `npx tsc --noEmit` on 2026-08-05 10:55 WAT and found **145 errors in 63 files**. This supersedes the previous claim that commit `eca03d0` was clean — either the codebase moved forward since that commit, or a broader tsconfig is now active.

**Error clusters (in priority order):**

| Cluster | Files | Count | Root cause |
|---|---|---|---|
| `src/db/schema.ts` SQLite bind params | `src/db/schema.ts:281,326,348` | ~25 | `unknown`/`{}` not assignable to `SQLiteBindValue` — needs explicit cast or typed intermediary |
| Test mocks missing required fields | many `src/__tests__/` | ~40 | Types evolved (e.g. `ViolationProfile.total`, `CorrectiveAction.inspectionItemId`, `Facility.projectName`) but test fixtures not updated |
| `NotificationRepository.test.ts` `NotificationType` | `src/__tests__/repositories/NotificationRepository.test.ts` | 19 | `"inspection_completed"` not in `NotificationType` union — add to union or fix test |
| Expo Router pathname strings | `app/_layout.tsx`, `app/screens/*.tsx`, `components/home/*.tsx` | ~15 | Routes not registered in Expo Router typed map — screen files may be missing or not exported |
| `CapNotificationService` export | `app/(tabs)/cap.tsx:25` | 1 | Named export `CapNotificationService` missing from that module |
| `checklist.tsx:325` `decision` prop | `app/(tabs)/inspection/checklist.tsx` | 1 | `DecisionCard` Props type mismatch |
| `reinspection.tsx` type issues | `app/screens/reinspection.tsx:75,117` | 2 | `c.status !== 'closed'` overlap + `SavedInspection.activity` missing |
| `src/i18n/index.ts` `.tsx` import | `src/i18n/index.ts:4` | 1 | Remove `.tsx` extension from re-export |
| `NotificationService.ts` behavior shape | `src/services/NotificationService.ts:43` | 1 | Add `shouldShowBanner`+`shouldShowList` to handler return |
| Expo boilerplate files | `components/external-link.tsx`, `components/haptic-tab.tsx`, `components/parallax-scroll-view.tsx`, `hooks/use-theme-color.ts`, `components/themed-text.tsx`, `components/themed-view.tsx`, `components/ui/*` | ~12 | Stale Expo template components with wrong color/hook types |
| `app/preview/index.tsx` | 10 errors | 10 | `Colors.info`, `xxxl` spacing, `complianceStatus` enum, `Shadow.xs`, `CorrectiveAction.description` |
| `server/src/index.ts` implicit `any` | 1 | 1 | Add explicit `: string` to `.map(s => ...)` |
| `AuditAction`/`AuditLogEntry` missing exports | `app/screens/audit-log.tsx` | 2 | Types not exported from `src/types.ts` |
| `FacilityRepository.delete` | `app/screens/facilities/index.tsx:69` | 1 | Method is `remove` not `delete` |
| `ActionSheet.mode` | `app/screens/approval-queue.tsx:64` | 1 | Property doesn’t exist on that type |
| `ApprovalRepository.returnForRevision` extra arg | `app/screens/approval-detail.tsx:174` | 1 | Function signature mismatch |
| `app/reports/[id].tsx` `extraordinary` missing | 1 | 1 | Add `extraordinary` to `TYPE_META` |
| Criteria test `axis` possibly undefined | 4 criteria tests | 4 | Guard with `item.axis ?? ''` |

**Approach for Claude:**
1. Fix source files first (non-test), then update test fixtures to match current types.
2. Do NOT widen types to accept old values unless intentional. Prefer fixing fixtures.
3. Expo boilerplate components (`haptic-tab`, `parallax-scroll-view`, `themed-*`, `use-theme-color`) — check if actually used; if not, delete them.
4. Expo Router pathnames — ensure screen files exist at the correct `app/screens/` path AND are accessible routes.
5. Run `npx tsc --noEmit` after each cluster fix. Commit per cluster.

**Close condition:** `npx tsc --noEmit` exits with 0 errors.

---

#### Phase R — Integration / Validation (BLOCKED on Phase V)
**Type:** Test gate  
**Priority:** 🔴 BLOCKED — cannot run Jest meaningfully until TypeScript is clean (Phase V)  
**Opened:** 2026-08-04  

**Task status:**
1. 🔴 `npx tsc --noEmit` — **OPEN** — New run 2026-08-05 shows 145 errors in 63 files. Previous claim of clean (commit eca03d0) is superseded. Phase V must close first.
2. 🔴 Run Jest for affected files — pending Phase V.
3. 🔴 Manual smoke test: follow-up agenda item → reinspection screen → launch → verify `checklist.tsx` receives `inspectionType=follow-up` and `priorInspectionId`
4. 🔴 Verify notification deep-link: `{ type: 'REINSPECTION', priorInspectionId }` → opens reinspection screen correctly
5. 🔴 Verify empty-criteria guard: select a facility type with no matching criteria → warning + back button

**Close condition:** Phase V closed + Jest passes for affected files + docs updated.

---

## Recommended Execution Order

```
V  → Mass TypeScript fix — 145 errors, 63 files (ASSIGN TO CLAUDE)
       Fix source files first, then test fixtures.
       Commit per cluster.
       Gate: npx tsc --noEmit exits with 0 errors.

R  → Jest + smoke tests (blocked on V)
       Gate: Jest passes for reinspection + checklist + categories + layout.

Next available phase letter: W
```

---

## Phase Numbering Convention

- Letters A–V are used or reserved as above
- Next available letter for a new phase: **W**
- Never reuse a closed phase letter
- Both agents (Perplexity and Claude) must read this file before opening any new phase

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED 2026-08-04 — ERPs, high-rise, very-high-rise, residential ONLY. Art. 44 deadline expired ~21 July 2024. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED 2026-08-04 — 16 params mg/Nm³ + 7 sectors in Ch7 Section 6. JO N°24, 16 April 2006. |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Occupational health | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
