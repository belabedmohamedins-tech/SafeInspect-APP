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
| T | Legal verify — Décret 06-138 air quality Annex I | 2026-08-04 | Ch7 Section 6 — 16 params mg/Nm³ + 7 sectors. |
| U | UX polish — end-to-end inspector flow | 2026-08-04 | 3 RTL/UX bugs fixed. Commit 239811b. |
| V | TypeScript zero-error pass | 2026-08-05 | `npx tsc --noEmit` → 0 errors confirmed by user. |
| R | Jest + smoke tests | 2026-08-06 | `npx jest` → 119 passed / 0 failed / 1315 tests. User-confirmed 00:47 WAT. |
| W | Legal document verification (5 source gaps) | 2026-08-06 | All 5 docs/legal_sources/ files read via MCP. 0 [À VÉRIFIER] in codebase. |
| X | i18n screen wire-up (5 screens) | 2026-08-06 | TSC 0 errors + Jest 119/0. User-confirmed 01:32 WAT. |
| **Y** | **Air-emissions criteria — 5 factory types** | **2026-08-06** | **Confirmed by direct live read of all 5 criteria files. All criteria already present: PNT-07-01/02 (paint), MRB-07-01/02 (marble), CRP-07-01/02 (carpentry), PRT-07-01/02/03 (printing), BSM-07-01/02/03 (blacksmith). Fix Spec v3 Phase A was already implemented before this session. No code change needed.** |

---

### 🔴 OPEN Phases — Execution Order

> Implement in the order listed. Run TSC + Jest gate after every phase. Update this file.

---

#### Phase Z — 🔴 HIGH: Fix wrong citation in `UAB-AX6-01` (Décret 22-167)
**Source:** `docs/RAQIB_Fix_Spec_v3.md` Phase C
**Owner:** Perplexity (code edit) → Claude (TSC + Jest gate)

**Problem:** `uabCriteria.ts` → `UAB-AX6-01` cites Décret 22-167 for "equipment maintenance". That decree actually modifies Décret 06-198's establishment categories — it says nothing about maintenance.

**Fix:** Read the live file first, then replace `legalReference` with:
```typescript
legalReference: 'المرسوم التنفيذي 06-198 المادة 13 (التزام المنشأة بمطابقة التجهيزات للملف التقني وصيانتها في حالة جيدة).',
```
⚠️ Verify Décret 06-198 art. 13 content independently before committing.

**Gate:** TSC 0 errors + Jest baseline passes (no count regression).

---

#### Phase Z2 — 🟠 HIGH: Fix wrong 85 dB noise citation in `UAB-AX7-07`
**Source:** `docs/RAQIB_Fix_Spec_v3.md` Phase B
**Owner:** Perplexity

**Problem:** `uabCriteria.ts` → `UAB-AX7-07` cites `المرسوم 93-120` for the 85 dB noise limit. Décret 93-120 covers medical exams — not noise thresholds.

**Fix:** Read `BLS-04-06` live to copy its exact wording (already-correct international best-practice pattern), then apply to `UAB-AX7-07`.

**Verification check after fix:** `grep -rn "93-120" src/criteria/*.ts` must return only genuine medical-exam criteria.

**Gate:** TSC 0 errors + Jest baseline passes.

---

#### Phase Z3 — 🟡 MEDIUM: Resolve 3 duplicate license criteria
**Source:** `docs/RAQIB_Fix_Spec_v3.md` Phase D
**Owner:** Perplexity (design decision first) → implementation

**Problem:** Three criteria are plain duplicates of `BGN-01-01`:
- `bakeryCriteria.ts` → `BAK-10-01`
- `coldRoomCriteria.ts` → `CLD-17-01`
- `produceStorageCriteria.ts` → `PRD-01-01`

**Decision options:**
- Option A: Remove all 3 (cleaner codebase, fewer false duplicates).
- Option B: Enrich with Décret 17-140 food-safety licensing nuance (like `GPL-01-01`).

Document decision in `docs/decisions/DECISIONS.md` before committing.

**Gate:** TSC 0 errors + Jest baseline passes. Update test files for removed/changed criteria.

---

#### Phase Z4 — 🟡 MEDIUM: Fix `PRD-02-01` missing `numericField`
**Source:** `docs/RAQIB_Fix_Spec_v3.md` Phase E
**Owner:** Perplexity

**Problem:** `produceStorageCriteria.ts` → `PRD-02-01` is `controlType: 'measurement'` with no `numericField`. It covers two temperature ranges (vegetables 0–5°C, olives 7–15°C).

**Decision options:**
- Option A (preferred): Split into `PRD-02-01` (vegetables, 0–5°C) + `PRD-02-02` (olives, 7–15°C), each with proper `numericField`.
- Option B: Change to `controlType: 'visual'` (loses measurement tracking).

**Gate:** TSC 0 errors + Jest baseline passes. Update `produceStorageCriteria.test.ts` if split.

---

### 🔵 DEFERRED Phases — Research / Architecture

| ID | Title | Blocker |
|---|---|---|
| Z5 | SQLite repository swap — 5 repositories (TIER1 Phase B) | Architecture sprint. Swap order: Facility → Agenda → CorrectiveAction → Inspection → AuditLog + Notification. Schema in `src/db/schema.ts` is ready. |
| Z6 | Décret 09-19 rollout across all "approved operator" criteria (G9) | Needs full criteria audit first. |
| Z7 | `facilityCategoriesFull.json` domain review (G10) | File exists but unused — may contain Décret 07-144 mapping; needs domain expert. |
| Z8 | `BGN-03-06` septic pumping frequency legal source (G11) | ≤90 days/80% capacity has no stated legal basis — find or remove. |
| Z9 | Server E2E integration test — `/sync` path against live instance | Needs a running server instance. |
| Z10 | AsyncStorage cleanup after SQLite stable (TIER1 Phase C) | Depends on Z5 stable for ≥1 release cycle. |

---

## Phase Numbering Convention

- Letters A–Y are closed.
- **Z** = next open phase (highest priority).
- After Z: use Z2, Z3, Z4 … (registered above).
- Never reuse a closed phase letter.
- Both agents must read this file before opening any new phase.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED |
| Fire safety — ERP type/category list | Loi 19-02 | Art. 14 | ✅ CLOSED — Art.14 is a regulatory delegation. Ord. 76-04 = operational base. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage (point de vente) | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED — 1400kg max; 3m/5m distances; extincteurs; ventilation 2×≥1600cm². |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED — 16 params mg/Nm³ + 7 sectors. |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Cold-chain temps (restaurants) | Arrêté interminist. 07/05/2025 | Full text | ✅ VERIFIED — 0–4°C; ≥63°C; refroidir ≤+10°C en ≤2h. JO n°43/2025. |
| Cold storage temps by product type | Arrêté interminist. 21/11/1999 | Temperature table | ✅ VERIFIED |
| Occupational health — medical exam | Décret 93-120 du 15/05/1993 | Art. periodicité | ✅ VERIFIED — ≥1/an standard; ≥2/an exposés. |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
