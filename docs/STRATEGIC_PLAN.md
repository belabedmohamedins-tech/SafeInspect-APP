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
| **S** | **Legal verify — Loi 19-02 fire safety scope** | **2026-08-04** | **Ch3 cross-verified against JORADP primary source (both language editions). Scope confirmed: ERPs, high-rise (>28m non-residential, >50m residential, >200m very-high-rise), residential. NOT universal. Classified establishments use Décret 06-198 + Décret 09-335 instead. Facility-type ERP analysis complete in Ch3 Section 6.** |
| **T** | **Legal verify — Décret 06-138 air quality Annex I numeric table** | **2026-08-04** | **Confirmed by direct read of Ch7 primary-source content. Full Annex I (16 parameters, mg/Nm³, new vs. pre-2006 tolerances) and Annex II (7 industrial sectors) verified in `docs/Inspection_Manual_Chapter7_Air_Quality.md` Section 6. JO N°24 of 16 April 2006. Resolved: units are mg/Nm³ (concentration), not kg/h. Resolved: Décret 06-02 (ambient) and 06-138 (point-source) are distinct instruments. One cell flagged (Iron industry SO2: 1200/1000 reversal — likely PDF extraction artifact, needs visual check).** |

---

### 🔴 OPEN Phases (in execution order)

#### Phase R — Integration / Validation (REQUIRES LOCAL DEV ENV — assign to Claude)
**Type:** Test gate  
**Priority:** 🔴 IMMEDIATE — must be run by Claude or local agent (requires local dev environment)  
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

**Note for Perplexity:** This phase requires a local dev environment. Cannot be completed remotely. Assign to Claude or human dev.

---

#### Phase U — UX Polish: End-to-End Inspector Flow (CURRENT PERPLEXITY PRIORITY)
**Type:** UX review  
**Priority:** 🟡 HIGH — after Phase T closes  
**Opened:** 2026-08-04  

**Scope:**
- Walk the full lifecycle as an inspector (field perspective): Registry → start.tsx → checklist.tsx → report → CAP → reinspection.tsx
- Check: tap count, cognitive load, RTL consistency, offline behaviour, evidence collection UX, error states
- Fix any friction points identified
- Specifically verify: reinspection.tsx member list UX on small screens, Grade badge legibility, trigger banner clarity
- Confirm no blank/empty states are left undesigned (empty agenda, no CAPs, first-time user)
- Read the relevant screen files before assessing — never assume from filenames

---

## Recommended Execution Order

```
R  → TypeScript + Jest validation gate (REQUIRES LOCAL ENV — assign to Claude)
U  → UX polish end-to-end flow (Perplexity — read source files first)
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
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ **VERIFIED 2026-08-04** — ERPs, high-rise, very-high-rise, residential ONLY. NOT classified establishments universally. Deadline art. 44 expired ~21 July 2024. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified — mines ministry accreditation, ≥60m² premises |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ **VERIFIED 2026-08-04** — Full Annex I (16 params, mg/Nm³) + Annex II (7 sectors) in Ch7 Section 6. JO N°24, 16 April 2006. Units: mg/Nm³ concentration. Décret 06-02 is ambient (distinct). One cell (Iron/SO2) flagged for visual PDF check. |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Occupational health | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
