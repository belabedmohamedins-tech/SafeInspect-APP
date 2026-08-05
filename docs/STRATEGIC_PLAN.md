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
| **V** | **TypeScript zero-error pass** | **2026-08-05** | **`npx tsc --noEmit` → 0 errors confirmed by user. Final fix: commit e005d01 — Expo Router pathname type escaped via `router.push as (href: any) => void` in 4 files (app/_layout.tsx, app/screens/signature.tsx, components/home/CapStatsWidget.tsx, components/home/NearDeadlineWidget.tsx).** |

---

### 🔴 OPEN Phases (in execution order)

#### Phase R — Jest + Smoke Tests (NOW UNBLOCKED — ASSIGN TO CLAUDE)
**Type:** Test gate  
**Priority:** 🔴 NEXT — Phase V is now closed. This is the highest priority action.  
**Opened:** 2026-08-04  

**Task status:**
1. ✅ `npx tsc --noEmit` — **CLOSED** — 0 errors confirmed 2026-08-05
2. 🔴 Run Jest for affected files — **NOW UNBLOCKED**
3. 🔴 Manual smoke test: follow-up agenda item → reinspection screen → launch → verify `checklist.tsx` receives `inspectionType=follow-up` and `priorInspectionId`
4. 🔴 Verify notification deep-link: `{ type: 'REINSPECTION', priorInspectionId }` → opens reinspection screen correctly
5. 🔴 Verify empty-criteria guard: select a facility type with no matching criteria → warning + back button

**Close condition:** Jest passes for affected files + smoke tests pass + docs updated.

---

#### Phase W — Legal Document Verification (5 source gaps)
**Type:** Legal research / doc ingestion  
**Priority:** 🟡 NON-BLOCKING — can run in parallel with R  
**Opened:** 2026-08-05  

**Context:** Claude identified 5 legal source gaps that remain unresolved after the main legal-verify sessions. Working copies of these documents were located by Perplexity on 2026-08-05. The user must download them and add to the Claude project so Claude can use them to close criteria marked [À VÉRIFIER].

**The 5 gaps:**

| # | Document | What it resolves | Source located by Perplexity |
|---|---|---|---|
| W-1 | Arrêté interministériel du 7 mai 2025 — cold-chain temperatures (restaurants, liaison chaude/froide) | Specific temps: cooling to ≤+10 °C in ≤2h, storage 0–4 °C, hot service ≥+63 °C | JORADP JO n°43 2025: https://www.joradp.dz/FTP/jo-francais/2025/F2025043.pdf — also at https://www.commerce.gov.dz/fr/reglementation/arrete-interministeriel-du-7-mai-2025 |
| W-2 | Arrêté interministériel du 21 novembre 1999 — cold storage temperatures by product type | Full table: max conservation temps for réfrigération/congélation/surgélation by product category | FAO mirror of older JO text; also cited in JORADP JO academic recueil at https://elearning.univ-bejaia.dz/pluginfile.php/882208/mod_resource/content/0/Cours_BOUDRIES%20Hafid_RECUEIL%20DES%20TEXTES%20RE... |
| W-3 | Loi n° 19-02 du 17 juillet 2019 — full text (art. 14 ERP type/category list) | Exact ERP types and categories list — distinct from scope analysis already done | JORADP JO n°46: https://services.mesrs.dz/DEJA/fichiers_sommaire_des_textes/241%20BIS%203%20fr.pdf |
| W-4 | Décret exécutif n° 93-120 du 15 mai 1993 — organisation de la médecine du travail | Worker periodic medical exam intervals and modalities | ILO NatLex: https://natlex.ilo.org/dyn/natlex2/r/natlex/fe/details?p3_isn=33565 — DOCX copy: https://staff.univ-batna2.dz/sites/default/files/benhassine-wissal/files/decret_executif_ndeg_93-120_du_15_mai_1993_relatif_a_lo... |
| W-5 | AIM GPL2 technical standard — règles techniques et de sécurité applicables aux installations et points de vente GPL (≤6 tonnes) | LPG cylinder storage: max quantities, min separation distances (3/5/6 m), ventilation, cage storage, valve protection — separate from Décret 21-430 which covers vehicle installation only | https://fr.scribd.com/document/609242056/AIM-GPL2-Derniere-Version-V-14-03-2022 |

**Steps:**
1. User downloads each document from the URLs above.
2. User adds them to Claude's project under a `legal_sources/` folder with clear filenames.
3. Claude reads each file and updates the relevant chapter criteria.
4. For each resolved gap: remove any `[À VÉRIFIER]` tag, update the legal basis field, log "confirmed by primary source read."
5. Update Legal Quick-Reference table below with verified values.

**Close condition:** All 5 documents ingested, relevant criteria updated, [À VÉRIFIER] tags resolved, Legal Quick-Reference table updated, docs pushed.

---

## Recommended Execution Order

```
R  → Jest + smoke tests (NOW UNBLOCKED — ASSIGN TO CLAUDE, local)
       1. npx jest
       2. Smoke: registry → inspection → checklist → reinspection flow
       3. Verify notification deep-link and empty-criteria guard
       Gate: Jest passes + smoke tests pass.

W  → Legal document verification — 5 source gaps (PARALLEL — user downloads + Claude ingests)
       Can run at same time as R.
       Gate: 5 documents ingested, criteria updated, [À VÉRIFIER] removed.

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
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED 2026-08-04 — ERPs, high-rise, very-high-rise, residential ONLY. Art. 44 deadline expired ~21 July 2024. |
| Fire safety — ERP type/category list | Loi 19-02 | Art. 14 | 🟡 [À VÉRIFIER] — Phase W-3: full text needed |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage (point de vente / dépôt) | AIM GPL2 technical standard | Storage distances, quantities, ventilation | 🟡 [À VÉRIFIER] — Phase W-5: document located, awaiting ingestion |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED 2026-08-04 — 16 params mg/Nm³ + 7 sectors in Ch7 Section 6. JO N°24, 16 April 2006. |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Cold-chain temperatures (restaurants) | Arrêté interministériel 07/05/2025 | Full text | 🟡 [À VÉRIFIER] — Phase W-1: document located, awaiting ingestion |
| Cold storage temps by product type | Arrêté interministériel 21/11/1999 | Temperature table | 🟡 [À VÉRIFIER] — Phase W-2: document located, awaiting ingestion |
| Occupational health — medical exam | Décret 93-120 du 15/05/1993 | Medical exam intervals | 🟡 [À VÉRIFIER] — Phase W-4: document located, awaiting ingestion |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
