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
| Z10 | AsyncStorage fallback removal — InspectionRepository + SettingsRepository | 2026-08-06 | Commit `4ff351c`. |
| Z10-FIX | Test drift — SettingsRepository test + schema migration count | 2026-08-06 | Commit `83db48c`. All green — user-confirmed 13:07 WAT. |
| Z11 | Wire `facilityCategoriesFull.json` rubrique into DB + screens | 2026-08-06 | Migration `003_facilities_add_rubrique` added. Gate closed 13:22 WAT. |
| Z12 | Audit Findings Closure (F-01 to F-18, 15 sub-items) | 2026-08-06 | TSC 0 + Jest 1234/0 — user-confirmed 20:15 WAT. Commits: `9a5d3e7`, `9c78e3e`. |
| Z6 | Décret 09-19 rollout — BGN-04-06 legalRef + accreditation check | 2026-08-06 | Commit `5ed564b`. |
| Z8 | BGN-03-06 septic pumping — remove unverified 90d/80% figures | 2026-08-06 | Commit `5ed564b`. |
| W1 | getDb() race guard + SyncService test env fix + serverAuth Babel env fix | 2026-08-07 | Commits: `a6c9a40`, `5caf6b1`, `4b4c0e5`, `bee6b60`. Jest 1234/0 + TSC 0. |
| W2 | Checklist section chevron direction bug fix | 2026-08-07 | Commit `906647f`. |
| G18 | Severity + Category types widened ('critical', 'هيكلية', 'صحة مهنية') | 2026-08-07 | Commit `2de9ad8`. 17 TSC errors resolved. |
| W4 | Checklist sections start collapsed — 1-tap-to-open UX fixed | 2026-08-08 | Commit `b191c7f`. |
| W5 | TSC fix — 'critical' added to SEVERITY_COLOR, SEVERITY_LABEL, SEVERITY_WEIGHTS | 2026-08-08 | Commit `2b5a7a3`. |
| W6 | L-02: HACCP Art.5 citation confirmed clean | 2026-08-08 | Direct code read — no change needed. |
| W7 | L-02b: Cold-chain Arrêté 07/05/2025 confirmed clean | 2026-08-08 | Direct code read — no change needed. |
| W8 | L-03: BGN-03-01 Décret 11-125 confirmed clean | 2026-08-08 | Direct code read — no change needed. |
| W9 | L-05: Abattoir chlorine Décret 11-125 confirmed clean | 2026-08-08 | Direct code read — no change needed. |
| W18 | BGN-08-01 + BGN-08-02: add Art.5 + Art.13 to Loi 19-02 citation | 2026-08-08 | Commit `f7c84a7`. TSC + Jest all green — user-confirmed 16:23 WAT. |
| W21 | BAK-10-10: bakery decree date corrected 27 mars → 11 avril 2017 | 2026-08-08 | Commit `f7c84a7`. TSC + Jest all green — user-confirmed 16:23 WAT. |
| W25 | F-13: differentialView.ts facility-match guard | 2026-08-08 | **PHANTOM** — file does not exist in repo. Doc artefact. |
| W26 | F-10: categories.tsx data source swap | 2026-08-08 | **PHANTOM** — file does not exist. Doc artefact. |
| W27 | F-14: statusUtils.ts — observation-only + unable-to-verify labels+colors | 2026-08-08 | Commit `e2791f7`. |
| W28 | F-09: AppState autosave in useChecklistData.ts | 2026-08-08 | Commit `e2791f7`. |
| W19-CODE | baseGeneralCriteria article-citation corrections (8 wrong refs + 2 À VÉRIFIER resolved) | 2026-08-08 | Commits `10b51b0`, `d8cc8b5`. |
| W29-GATE | Jest gate fixes: Colors keys, Arabic vowel, BGN article refs, AppState mock | 2026-08-09 | Commit `efe4127`. User-confirmed all green. |
| W22 | F-11: Approved inspection immutability guard | 2026-08-09 | Confirmed clean by direct read. |
| W23 | F-18: Local approval workflow | 2026-08-09 | Confirmed clean by direct read. |
| W24 | F-19: Audit log self-tamper protection | 2026-08-09 | Confirmed clean by direct read. |
| W30 | F-20: decisionSupport.ts test coverage | 2026-08-09 | Confirmed clean by direct read. |
| W31-2 | loi-09-03: tag Art.44–52 + Art.80–92 as [MANQUANT]; mark Art.4–67 as [RÉSUMÉ] | 2026-08-09 | Commit `bc1eb6d`. |
| W31-3 | Decret-07-144: tag rubrique gap 1243–2922 as [MANQUANT] | 2026-08-09 | Commit `bc1eb6d`. |
| W31-4 | Split bundled arrêté file into 3 separate files + update legal_refs/README.md | 2026-08-09 | Commit `bc1eb6d`. 3 files: 2025 + 2016 + 1999. |
| W31-1 | audit.js cross-ref false-positive fix | 2026-08-09 | Commit `4c79ed3`. File lives at `legal_refs/audit.js` — **DO NOT DELETE OR MOVE**. |
| W31-5 | README broken links confirmed valid | 2026-08-09 | Confirmed by Claude direct read. Both renamed files exist. No change needed. **W31 FULLY CLOSED.** |
| W11 | BGN-02-06 ventilation: Décret 93-120 removed, Décret 91-05 Art.11 confirmed correct | 2026-08-09 | Confirmed clean by direct read of `baseGeneralCriteria.ts`. Comment `// W11/L-04 fix` present. No change needed. |
| W12 | semiPharmaCriteria: Décret 17-140 scope correct; Loi 18-11 Arts.104/105/107 confirmed | 2026-08-09 | Confirmed clean by direct read of `semiPharmaCriteria.ts`. No wrong Décret 17-140 citations found. No change needed. |
| W16 | BFD-08-01: Loi 09-03 Art.12+6 confirmed correct; Art.19 already removed | 2026-08-09 | Confirmed clean by direct read of `baseFoodCriteria.ts`. Comment `// W16: Art.19 WRONG` present. No change needed. |
| W17 | BFD-02-02: 15cm/5cm tagged [حكم مهني] confirmed | 2026-08-09 | Confirmed clean by direct read of `baseFoodCriteria.ts`. Comment `// W17` present. No change needed. |
| W20 | Close 3 open legal unverifieds + delete `allCriteria` dead-code | 2026-08-09 | Direct read of `src/criteria/index.ts`: `allCriteria` already removed. 0 [À VÉRIFIER] in codebase. |
| W13 | L-06: UPD-AX2-01 "500m buffer" clarification | 2026-08-09 | Confirmed clean by direct read of `updCriteria.ts`. 500m min cited against Loi 90-29 + Loi 03-10 + Décret 06-198 (correct legal chain). `warningMin: 700` graduated alert in place. No change needed. |
| W14 | L-08: Verify Décret 24-196 citation scope | 2026-08-09 | Confirmed clean by direct read. Décret 24-196 cited exclusively as amending decree to 06-198 — never standalone. No change needed. |
| W10 | L-01: Abattoir wastewater Annex II — Option C | 2026-08-09 | User decision: keep Annex I mg/L as interim. ABT-AX6-02 tagged [À VÉRIFIER]. No code change this session. |
| W15 | criteriaByActivity rubrique-based fallback lookup | 2026-08-09 | Confirmed clean by direct read. `criteriaByRubriqueCategory` 31-key map + `getCriteriaByRubriqueCategory()` already present. No change needed. |
| **W32** | **⚠️ RETRACTED — loi-09-03 W32 commit DESTRUCTIVE** | **2026-08-09** | **Commit `1c49fb43` deleted 492 lines. Reverted via `cbe46ba8`. Superseded by W34-FIX.** |
| W33 | Prevention protocol analysis + improved space instructions | 2026-08-09 | Analysis delivered in chat. No code change. |
| W34 | ⚠️ FAILED — loi-09-03 Art.80–95 verbatim patch truncated (-249 lines) | 2026-08-09 | Commit `4e994e86` DESTRUCTIVE. Caught by diff gate. Superseded by W34-FIX. |
| W34-FIX | loi-09-03 Art.1–95 fully restored + Art.80–95 verbatim | 2026-08-09 | Commit `566a5e28`. Size 34,321 bytes. Diff +169/-76 ✅. |
| W35-DOCS | STRATEGIC_PLAN sync — close W33/W34/W34-FIX | 2026-08-09 | Commit `980f8f4b`. |

---

### 🟠 OPEN Phases

| Phase | Priority | Title | Files | Blocker / Source |
|---|---|---|---|---|
| **W19** | 🟠 P1 — **IN PROGRESS (parallel session)** | `legal_refs/` maintenance: replace fabricated stubs | `legal_refs/` | ⚠️ Do NOT touch — user working on this separately |
| **W36** | 🟠 P1 | Convert `decret-06-141` verbatim from JORADP JO n°26/2006 | `legal_refs/decret-06-141-rejets-industriels-liquides.md` | STUB exists. Other conversation converts PDF. Most-cited missing instrument. |
| **W37** | 🟠 P2 | Convert 8 missing `legal_refs/` files (see AUDIT_COVERAGE_REPORT.md P1+P2 list) | `legal_refs/decret-06-138, decret-09-335, decret-05-315, decret-07-145, decret-11-125, decret-21-430, loi-18-11, decret-07-205` | Other conversation converts PDFs in priority order from AUDIT_COVERAGE_REPORT.md. |

---

### 🔵 DEFERRED Phases

| ID | Title | Blocker |
|---|---|
| Z9 | Server E2E integration test — `/sync` path against live instance | Needs a running server. |

---

## Phase Numbering Convention

- Closed: A–Z, Z2–Z5, Z7, Z10, Z10-FIX, Z11, Z12, Z6, Z8, W1, W2, G18, W4–W35-DOCS (all sub-items).
- Z9 deferred.
- **Open: W19 (parallel), W36, W37. Next new phase identifier: W38.**
- Never reuse a closed phase letter.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Rubrique nomenclature (1000–1242 only) | Décret 07-144 | Partial annex | ⚠️ PARTIEL — W31-3 tagged, JO n° 31/2007 needed |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ⚠️ STUB — W36 OPEN. File created, verbatim pending. |
| Abattoir wastewater annex | Décret 06-141 Annex II | Annex II | ⚠️ [À VÉRIFIER] — W10 CLOSED Option C. Switch to g/tonne after JORADP JO verified. |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ⚠️ NO FILE — W37. |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED |
| Fire safety — equipment requirements | Loi 19-02 | Art. 5 | ✅ VERIFIED — W18 |
| Fire safety — evacuation routes | Loi 19-02 | Art. 13 | ✅ VERIFIED — W18 |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ⚠️ NO FILE — W37. Quick-Ref previously claimed ✅ in error. |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ⚠️ NO FILE — W37. Quick-Ref previously claimed ✅ in error. |
| LPG cylinder storage | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED |
| Air emissions point source | Décret 06-138 | Annex I + II | ⚠️ NO FILE — W37. Phase T verified content but file was never created. |
| Food safety / HACCP | Décret 17-140 | Art. 5 | ✅ Verified |
| Décret 17-140 actual JO date | 11 avril 2017 | — | ✅ VERIFIED — W21 |
| Cold-chain temps (restaurants) | Arrêté interminst. 07/05/2025 | Full text | ✅ VERIFIED — W7 |
| Cold storage temps by product type | Arrêté interminst. 21/11/1999 | Temp. table | ⚠️ STUB — W19. |
| Microbiological criteria | Arrêté interminst. 04/10/2016 | — | ⚠️ STUB — W19. |
| Consumer protection Art.1–95 | Loi 09-03 | Art. 1–95 | ✅ W34-FIX — 34,321 bytes, commit `566a5e28`. NON VÉRIFIÉ against JO PDF (human review pending). |
| Occupational health — medical exam | Décret 93-120 | Art. périodicité | ✅ VERIFIED |
| Occupational health general | Loi 88-07 | Art. 12–14 | ⚠️ NO FILE — W37 (P3). |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
| BGN-02-06 ventilation | Décret 91-05 Art.11 CORRECT | Art.11 | ✅ VERIFIED — W11 |
| BFD-08-01 traceability citation | Loi 09-03 Art.12+6 CORRECT | Art.12+6 | ✅ VERIFIED — W16 |
| BFD-02-02 storage clearances | 15cm/5cm — [حكم مهني] tagged | — | ✅ VERIFIED — W17 |
| semiPharmaCriteria Loi 18-11 | Arts.104/105/107 correct — NO FILE yet | — | ⚠️ NO FILE — W37. |
| Approved inspection immutability | INSPECTION_LOCKED guard | — | ✅ VERIFIED — W22 |
| Audit log self-tamper protection | AUDIT_LOG_CLEARED sentinel | — | ✅ VERIFIED — W24 |
| Décret 24-196 citation scope | Always cited as amending decree to 06-198 | Various | ✅ VERIFIED — W14 |
| UPD-AX2-01 500m buffer | Loi 90-29 + Loi 03-10 + Décret 06-198 chain | UPD-AX2-01 | ✅ VERIFIED — W13 |
| criteriaByActivity rubrique fallback | `criteriaByRubriqueCategory` 31-key map | `src/criteriaData.ts` | ✅ VERIFIED — W15 |
| Drinking water standards | Décret 11-125 | Standards table | ⚠️ NO FILE — W37. Criteria citation correct (W8), file missing. |
| Hazardous waste bordereau | Décret 05-315 | Art. bordereau | ⚠️ NO FILE — W37. |
| EIA procedures | Décret 07-145 | Art. EIA | ⚠️ NO FILE — W37. |
| Worker OHS training | Décret 02-427 | Art. training | ⚠️ NO FILE — W37 (P3). |
| Electrical safety | Décret 76-35 | Art. electrical | ⚠️ NO FILE — W37 (P3). Very old decree — verify not superseded. |
