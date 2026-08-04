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
| Q | UI screens — Reinspection screen | 2026-08-04 | `app/screens/reinspection.tsx` delivered, `app/_layout.tsx` updated — ⚠️ test gate pending (Phase R) |
| S | Legal verify — Loi 19-02 fire safety scope | 2026-08-04 | JORADP primary source, both editions. ERP scope fully confirmed. |
| T | Legal verify — Décret 06-138 air quality Annex I | 2026-08-04 | Ch7 Section 6 — 16 params mg/Nm³ + 7 sectors. Detected by CODE VS DOC check. |
| **U** | **UX polish — end-to-end inspector flow** | **2026-08-04** | **3 RTL/UX bugs fixed: (1) reinspection.tsx back arrow RTL correction + member empty hint; (2) checklist.tsx empty-criteria guard state; (3) categories.tsx RTL icon order + layout. Commit 239811b.** |

---

### 🔴 OPEN Phases (in execution order)

#### Phase R — Integration / Validation (REQUIRES LOCAL DEV ENV — assign to Claude)
**Type:** Test gate  
**Priority:** 🔴 IMMEDIATE — must be run by Claude or local agent (requires local dev environment)  
**Opened:** 2026-08-04  

**Tasks:**
1. Run `npx tsc --noEmit` — fix any TypeScript errors in `app/screens/reinspection.tsx`, `app/_layout.tsx`, `app/(tabs)/inspection/checklist.tsx`, `app/(tabs)/inspection/categories.tsx`
2. Run Jest for affected files — add unit tests if coverage drops
3. Manual smoke test: navigate from a follow-up agenda item → reinspection screen → launch → verify `checklist.tsx` receives `inspectionType=follow-up` and `priorInspectionId`
4. Verify notification deep-link: `{ type: 'REINSPECTION', priorInspectionId }` → opens reinspection screen correctly
5. Verify empty-criteria guard: select a facility type with no matching criteria → should show warning + back button, not blank list

**Files to touch:**
- `app/screens/reinspection.tsx`
- `app/_layout.tsx`
- `app/(tabs)/inspection/checklist.tsx`
- `app/(tabs)/inspection/categories.tsx`
- `__tests__/screens/reinspection.test.tsx` (create if missing)

**Close condition:** `npx tsc --noEmit` passes with 0 errors + Jest passes for affected files + docs updated.

**Note for Perplexity:** This phase requires a local dev environment. Cannot be completed remotely. Assign to Claude or human dev.

---

## Recommended Execution Order

```
R  → TypeScript + Jest validation gate (REQUIRES LOCAL ENV — assign to Claude)
     No open Perplexity phases at this time.
     Next available phase letter: V
```

---

## Phase Numbering Convention

- Letters A–U are used or reserved as above
- Next available letter for a new phase: **V**
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
