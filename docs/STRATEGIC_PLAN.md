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
| U | UX polish — end-to-end inspector flow | 2026-08-04 | 3 RTL/UX bugs fixed: (1) reinspection.tsx back arrow RTL correction + member empty hint; (2) checklist.tsx empty-criteria guard state; (3) categories.tsx RTL icon order + layout. Commit 239811b. |
| **V** | **TypeScript zero-error pass** | **2026-08-05** | **`npx tsc --noEmit` → 0 errors confirmed by user. Final fix: commit e005d01 — Expo Router pathname type escaped via `router.push as (href: any) => void` in 4 files.** |
| **R** | **Jest + smoke tests** | **2026-08-06** | **119 suites / 1317 tests — 0 failures. Commits 13e80e0 + 66008a5. 6 root causes fixed: CRP- prefix, CRP-07-01 item lookup, static AsyncStorage import, deterministic createdAt sort seeds, stale duplicate stub, empty useHomeData file.** |

---

### 🔴 OPEN Phases (in execution order)

#### Phase W — Legal Document Verification (5 source gaps)
**Type:** Legal research / doc ingestion
**Priority:** 🔴 NEXT — R and V are now closed. This is the highest priority.
**Opened:** 2026-08-05

**Context:** 5 legal source documents were located and committed to `docs/legal_sources/` by Perplexity on 2026-08-05. Claude must read them and apply the verified numeric values to criteria files.

**The 5 gaps:**

| # | Document | What it resolves |
|---|---|---|
| W-1 | Arrêté interministériel du 7 mai 2025 — cold-chain temperatures | Specific temps: cooling to ≤+10°C in ≤2h, storage 0–4°C, hot service ≥+63°C |
| W-2 | Arrêté interministériel du 21 novembre 1999 — cold storage by product type | Full table: max conservation temps by product category |
| W-3 | Loi n° 19-02 — art. 14 ERP type/category list | Exact ERP types/categories (implementing decree not located — use Ord. 76-04) |
| W-4 | Décret exécutif n° 93-120 — organisation de la médecine du travail | Medical exam intervals: ≥1/an standard, ≥2/an exposed workers |
| W-5 | AIM GPL2 — règles techniques et sécurité installations GPL (≤6 tonnes) | LPG storage: max 1400 kg propane; 3m/5m distances; ventilation 2×≥1600 cm² |

**Steps:**
1. Read all 5 files in `docs/legal_sources/`
2. Update relevant criteria in `src/criteria/` — remove `[À VÉRIFIER]`, add verified value + citation
3. Run `npx tsc --noEmit`
4. Mark W ✅ CLOSED in this file
5. Add log entry to `docs/README.md`
6. Commit + push

**Close condition:** All 5 sources applied to criteria, [À VÉRIFIER] removed, TSC clean, docs updated.

---

## Recommended Execution Order

```
W  → Legal document verification (NEXT — assign to Claude)
       Read docs/legal_sources/* → update src/criteria/* → TSC → docs → commit

Smoke tests (Claude local, after W):
       registry → inspection → checklist → reinspection flow
       notification deep-link: REINSPECTION type → reinspection screen
       empty-criteria guard: no matching criteria → warning + back button

Next available phase letter: X
```

---

## Phase Numbering Convention

- Letters A–W are used or reserved as above
- Next available letter for a new phase: **X**
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
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED 2026-08-04 |
| Fire safety — ERP type/category list | Loi 19-02 | Art. 14 | 🟡 [À VÉRIFIER] — Phase W-3 |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage (point de vente / dépôt) | AIM GPL2 | Storage distances, quantities, ventilation | 🟡 [À VÉRIFIER] — Phase W-5 |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED 2026-08-04 |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Cold-chain temperatures (restaurants) | Arrêté interministériel 07/05/2025 | Full text | 🟡 [À VÉRIFIER] — Phase W-1 |
| Cold storage temps by product type | Arrêté interministériel 21/11/1999 | Temperature table | 🟡 [À VÉRIFIER] — Phase W-2 |
| Occupational health — medical exam | Décret 93-120 du 15/05/1993 | Medical exam intervals | 🟡 [À VÉRIFIER] — Phase W-4 |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
