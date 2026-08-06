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
| ARCH-1 | docs/archive/ cleanup — 8 historical files moved | 2026-08-06 | Perplexity_Implementation_Spec Phase 1–2 confirmed done by code search (0 results for legacy 04-01, 01-01 series and wrong citations). Phase 4 new-criteria proposals logged as future candidates. |

---

### 🔴 OPEN Phases — Execution Order

> Implement in the order listed. Run TSC + Jest gate after every phase. Update this file.
> **Next available letter after Z: Z2, Z3, Z4 …**

---

#### Phase Y — 🔴 HIGH: 5 missing air-emissions criteria
**Source:** `docs/archive/RAQIB_Fix_Spec_v3.md` Phase A
**Owner:** Perplexity (code edit) → Claude (TSC + Jest gate)
**Prerequisite:** Get a third independent confirmation of 50 mg/Nm³ (dust) and 150 mg/Nm³ (VOC) from Décret 06-138 Annex I before writing any code.

**Files to edit:**
| File | New criterion IDs |
|---|---|
| `src/criteria/paintShopCriteria.ts` | `PNT-07-01` (dust ≤50 mg/Nm³), `PNT-07-02` (VOC ≤150 mg/Nm³) |
| `src/criteria/marbleCriteria.ts` | `MRB-07-01` (dust ≤50 mg/Nm³) |
| `src/criteria/carpenteryCriteria.ts` | `CRP-07-01` (dust ≤50 mg/Nm³) |
| `src/criteria/printingCriteria.ts` | `PRT-07-01` (VOC ≤150 mg/Nm³) |
| `src/criteria/blacksmithCriteria.ts` | `BLS-07-01` (dust ≤50 mg/Nm³) |

**Criterion template (adapt id/axis per file's own convention):**
```typescript
{
  id: 'PNT-07-01',
  axis: 'التهوية ومنع التلوث الهوائي',
  category: 'بيئية',
  criteria: 'عدم تجاوز تركيز الغبار الكلي في الانبعاثات الهوائية للحد الأقصى المحدد قانوناً.',
  legalReference: 'المرسوم التنفيذي 06-138 (الملحق 1 — القيم القصوى العامة لتركيز الملوثات في الانبعاثات الجوية للمنشآت الصناعية).',
  severity: 'medium',
  controlType: 'measurement',
  complianceStatus: 'not-evaluated',
  numericField: {
    unit: 'mg/Nm³',
    labelAr: 'تركيز الغبار الكلي المقاس',
    max: 50,
    warningMax: 45,
    step: 1,
    upperLimit: true,
  },
},
```

**Gate:** TSC 0 errors + Jest 119 passed / 0 failed (add tests for the new criteria in their respective test files).

**Close condition:** All 5 files committed + TSC + Jest green.

---

#### Phase Z — 🔴 HIGH: Fix wrong citation in `UAB-AX6-01` (Décret 22-167)
**Source:** `docs/archive/RAQIB_Fix_Spec_v3.md` Phase C
**Owner:** Perplexity

**Problem:** `uabCriteria.ts` → `UAB-AX6-01` cites Décret 22-167 for "equipment maintenance". That decree actually modifies Décret 06-198's establishment categories — it says nothing about maintenance.

**Fix:** Fetch live text of `UAB-AX6-01` first, then replace `legalReference`:
```typescript
// BEFORE (approximate — read live file first):
legalReference: 'المرسوم التنفيذي 22-167 (صيانة التجهيزات الصناعية).',
// AFTER:
legalReference: 'المرسوم التنفيذي 06-198 المادة 13 (التزام المنشأة بمطابقة التجهيزات للملف التقني وصيانتها في حالة جيدة).',
```
⚠️ Verify Décret 06-198 art. 13 content independently before committing.

**Gate:** TSC 0 errors + Jest 119/0.

---

#### Phase Z2 — 🟠 HIGH: Fix wrong 85 dB noise citation in `UAB-AX7-07`
**Source:** `docs/archive/RAQIB_Fix_Spec_v3.md` Phase B
**Owner:** Perplexity

**Problem:** `uabCriteria.ts` → `UAB-AX7-07` cites `المرسوم 93-120` for the 85 dB noise limit. Décret 93-120 covers medical exams — not noise. The 85 dB figure has no confirmed Algerian legislative source.

**Fix:** Apply the same pattern as the already-correct `BLS-04-06` (fetch its live exact wording first):
```typescript
// BEFORE:
legalReference: 'المرسوم 93-120 (الحد الأقصى للضجيج في بيئة العمل: 85 ديسيبل) + القانون 18-11 ...',
// AFTER (match BLS-04-06 exactly — fetch live before writing):
legalReference: 'الحد الأقصى للضجيج المهني (85 ديسيبل) هو مرجع دولي شائع (WHO/OSHA)، وليس قيمة مؤكدة في التشريع الجزائري حالياً — يُستخدم كأفضل ممارسة معتمدة إلى حين تأكيد نص جزائري محدد. + القانون 18-11 (السلامة في أماكن العمل).',
```

**Gate:** `grep -rn "93-120" src/criteria/*.ts` should return only genuine medical-exam criteria after this fix. TSC + Jest green.

---

#### Phase Z3 — 🟡 MEDIUM: Resolve 3 duplicate license criteria
**Source:** `docs/archive/RAQIB_Fix_Spec_v3.md` Phase D
**Owner:** Perplexity (design decision) → implementation

**Problem:** Three criteria are plain duplicates of `BGN-01-01` (base operating-license check):
- `bakeryCriteria.ts` → `BAK-10-01`
- `coldRoomCriteria.ts` → `CLD-17-01`
- `produceStorageCriteria.ts` → `PRD-01-01`

**Decision required before implementing:**
- Option A: Remove all 3 (clean, reduces noise).
- Option B: Enrich each with Décret 17-140 food-safety licensing nuance (like `GPL-01-01` was). Preferred if the establishments genuinely have a separate food-safety licensing step.

Document decision in `docs/decisions/DECISIONS.md` before committing the diff.

**Gate:** TSC + Jest green.

---

#### Phase Z4 — 🟡 MEDIUM: Fix `PRD-02-01` missing `numericField`
**Source:** `docs/archive/RAQIB_Fix_Spec_v3.md` Phase E
**Owner:** Perplexity

**Problem:** `produceStorageCriteria.ts` → `PRD-02-01` is `controlType: 'measurement'` with no `numericField`. It mentions two numeric ranges (vegetables 0–5°C, olives 7–15°C) in prose — one `numericField` can't hold both.

**Decision required:**
- Option A: Split into `PRD-02-01` (vegetables, 0–5°C) and `PRD-02-02` (olives, 7–15°C), each with a proper `numericField`.
- Option B: Change `controlType` to `'visual'` and keep prose (simpler, loses measurement tracking).

Option A is preferred for data quality.

**Gate:** TSC + Jest green (update `produceStorageCriteria.test.ts` for the new criterion if split).

---

### 🔵 DEFERRED Phases — Research / Architecture (no diff-ready spec yet)

| ID | Title | Blocker |
|---|---|---|
| Z5 | SQLite repository swap — 5 repositories (TIER1 Phase B) | Architecture work; `src/db/schema.ts` ready, repo swap not started. Swap order: Facility → Agenda → CorrectiveAction → Inspection → AuditLog + Notification. |
| Z6 | Décret 09-19 rollout across all "approved operator" criteria (G9) | Needs full audit of all criteria files first. |
| Z7 | `facilityCategoriesFull.json` domain review (G10) | File exists but unused — may contain Décret 07-144 mapping; needs domain expert. |
| Z8 | `BGN-03-06` septic pumping frequency legal source (G11) | The ≤90 days/80% capacity figure has no stated legal basis — find or replace. |
| Z9 | Server E2E integration test — `/sync` path against live instance | Can only be done with a running server. |
| Z10 | AsyncStorage cleanup after SQLite stable (TIER1 Phase C) | Depends on Z5 being stable for ≥1 release cycle. |

---

## Phase Numbering Convention

- Letters A–X are closed. ARCH-1 closed.
- **Y** = next open phase (highest priority).
- After Z: use Z2, Z3, Z4 … (already registered above).
- Never reuse a closed phase letter.
- Both agents (Perplexity and Claude) must read this file before opening any new phase.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED — ERPs, IGH (>28m/>50m habitation), ITGH (>200m). |
| Fire safety — ERP type/category list | Loi 19-02 | Art. 14 | ✅ CLOSED — Art.14 is a regulatory delegation. Implementing decree not found in JORADP. Ord. 76-04 = operational base. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage (point de vente) | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED — 1400kg max propane ext.; 3m (≤525kg) / 5m (>525kg); 1×9kg (≤3500kg) / 2×9kg (>3500kg); 2×≥1600cm² ventilation. |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED — 16 params mg/Nm³ + 7 sectors. |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Cold-chain temps (restaurants) | Arrêté interminist. 07/05/2025 | Full text | ✅ VERIFIED — 0–4°C stockage; ≥63°C liaison chaude; refroidir ≤+10°C en ≤2h. JO n°43/2025. |
| Cold storage temps by product type | Arrêté interminist. 21/11/1999 | Temperature table | ✅ VERIFIED — viandes +4°C–+7°C; prod. mer 0–2°C; laitiers +4°C; congelés ≤-12°C; surgelés ≤-18°C. |
| Occupational health — medical exam | Décret 93-120 du 15/05/1993 | Art. periodicité | ✅ VERIFIED — ≥1/an standard; ≥2/an travailleurs exposés. |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
