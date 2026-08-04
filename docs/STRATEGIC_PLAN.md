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
| Q | UI screens — Reinspection screen | 2026-08-04 | `app/screens/reinspection.tsx` delivered, `app/_layout.tsx` updated — ⚠️ test gate pending |

---

### 🔴 OPEN Phases (in execution order)

#### Phase R — Integration / Validation (CURRENT PRIORITY)
**Type:** Test gate  
**Priority:** 🔴 IMMEDIATE — must run before any new feature work  
**Opened:** 2026-08-04  

**Tasks:**
1. Run `npx tsc --noEmit` — fix any TypeScript errors in `app/screens/reinspection.tsx` and `app/_layout.tsx`
2. Run Jest for affected files — add unit tests if coverage drops
3. Manual smoke test: navigate from a follow-up agenda item → reinspection screen → launch → verify `checklist.tsx` receives `inspectionType=follow-up` and `priorInspectionId`
4. Verify notification deep-link: `{ type: 'REINSPECTION', priorInspectionId }` → opens reinspection screen correctly

**Files to touch:**  
- `app/screens/reinspection.tsx` (fix TS errors if any)  
- `app/_layout.tsx` (fix TS errors if any)  
- `__tests__/screens/reinspection.test.tsx` (create if missing)  

**Close condition:** `npx tsc --noEmit` passes with 0 errors + Jest passes for affected files + docs updated.

---

#### Phase S — Legal Verify: Fire Safety Loi 19-02 Scope
**Type:** LEGAL-VERIFY  
**Priority:** 🟡 AFTER R  
**Question:** Does Loi 19-02 apply universally to ALL classified establishments, or only to ERPs (Établissements Recevant du Public), high-rise, and residential buildings?

**Research path:**
1. JORADP: search Loi 19-02 Art. 2 full text
2. Look for implementing décrets that specify which establishments are in scope
3. If classified establishments (1st/2nd/3rd category under Décret 06-198) are excluded → update Ch3 criteria with `[INTL]` or `[SILENCE]` tags where Loi 19-02 is cited
4. If scope is confirmed → remove `[À VÉRIFIER]` tags, close phase

**Files to touch:**  
- `docs/Inspection_Manual_Chapter3_Fire_Safety.md`  
- Matching criteria in `src/criteria/` if any cite Loi 19-02 incorrectly  

---

#### Phase T — Legal Verify: Air Quality Décret 06-138 Annex Numeric Table
**Type:** LEGAL-VERIFY  
**Priority:** 🟡 AFTER S  
**Question:** What are the exact numeric emission limits per activity in Annex I of Décret 06-138? Are they applied as point-source concentration limits (mg/m³) or as mass-flow limits (kg/h)?

**Research path:**
1. JORADP: retrieve Décret 06-138 full text including Annex I
2. Extract numeric values per pollutant and activity sector
3. Update `docs/Inspection_Manual_Chapter7_Air_Quality.md` with verified table
4. Update matching criteria in `src/criteria/` if values are wrong

**Files to touch:**  
- `docs/Inspection_Manual_Chapter7_Air_Quality.md`  
- Matching activity criteria files in `src/criteria/`  

---

#### Phase U — UX Polish: End-to-End Inspector Flow
**Type:** UX review  
**Priority:** 🔵 AFTER T  

**Scope:**
- Walk the full lifecycle as an inspector (field perspective): Registry → start.tsx → checklist.tsx → report → CAP → reinspection.tsx
- Check: tap count, cognitive load, RTL consistency, offline behaviour, evidence collection UX, error states
- Fix any friction points identified
- Specifically verify: reinspection.tsx member list UX on small screens, Grade badge legibility, trigger banner clarity

---

## Recommended Execution Order

```
R  → TypeScript + Jest validation gate (IMMEDIATE)
S  → Legal verify: Loi 19-02 fire safety scope
T  → Legal verify: Décret 06-138 air quality annex
U  → UX polish end-to-end flow
```

---

## Phase Numbering Convention

- Letters A–U are used or reserved as above
- Next available letter for a new phase: **V**
- Never reuse a closed phase letter
- Both agents (Perplexity and Claude) must read this file before opening any new phase

---

## Legal Quick-Reference (Duplicate of README for agent convenience)

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 2 | 🟡 SCOPE UNDER VERIFICATION (Phase S) |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| Air emissions point source | Décret 06-138 | Annex I | 🟡 NUMERIC VALUES UNDER VERIFICATION (Phase T) |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Occupational health | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
