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

---

### 🟡 OPEN Phases

> Execution order: **W31** (remaining) → **W16** → **W17** → **W11** → **W12** → **W15** → **W20** → **W13** → **W14** → **W10** (user sign-off required). W19 parallel.

| Phase | Priority | Title | Files | Blocker / Source |
|---|---|---|---|---|
| **W31** | 🟠 P1 | legal_refs cleanup: 2 sub-items remaining | See sub-items below | W31-2/3/4 CLOSED. W31-1 + W31-5 still open. |
| **W10** | 🔴 P0 | L-01: Fix wastewater annex — Annex I general → Annex II abattoir-specific (g/t units) | `abattoirCriteria.ts`, `slaughterhouseSmallCriteria.ts` | ⚠️ Needs user expert sign-off |
| **W11** | 🟠 P1 | L-04: Fix ventilation citation — Décret 93-120 (medical exams) → correct ventilation decree | `baseGeneralCriteria.ts` (BGN-02-06) | ⚠️ JORADP research required |
| **W12** | 🟠 P1 | L-09: Fix semiPharma citations — Décret 17-140 → Loi 18-11 | `semiPharmaCriteria.ts` | ⚠️ Loi 18-11 article number required |
| **W13** | 🟡 P2 | L-06: Clarify UPD-AX2-01 "500m buffer" | `updCriteria.ts` | ⚠️ Product decision from user |
| **W14** | 🟡 P2 | L-08: Verify Décret 24-196 citation | Various | ⚠️ No source document supplied |
| **W15** | 🟠 P1 | criteriaByActivity rubrique-based fallback lookup | `src/criteriaData.ts`, `src/hooks/useChecklistData.ts` | Enhancement only — not a bug |
| **W16** | 🟠 P1 | BFD-08-01: replace wrong Loi 09-03 Art.19 citation | `src/criteria/baseFoodCriteria.ts` | ⚠️ JORADP research required |
| **W17** | 🟠 P1 | BFD-02-02: source or tag 15cm/5cm storage clearances | `src/criteria/baseFoodCriteria.ts` | ⚠️ Source verification required |
| **W19** | 🟠 P1 — **IN PROGRESS (parallel session)** | `legal_refs/` maintenance: replace fabricated stubs | `legal_refs/` | ⚠️ Do NOT touch — user working on this separately |
| **W20** | 🟡 P2 | Close 3 open legal unverifieds + delete `allCriteria` dead-code export | `src/criteria/index.ts` | Depends on W19. |

### W31 Remaining Sub-items

| Sub | Status | Description | Blocker |
|---|---|---|---|
| W31-1 | ❌ BLOCKED | `audit.js` regex bug | File not found in repo — Claude must push it or confirm path |
| W31-2 | ✅ CLOSED 2026-08-09 | loi-09-03 placeholders tagged [MANQUANT] | Commit `bc1eb6d` |
| W31-3 | ✅ CLOSED 2026-08-09 | Decret-07-144 rubrique gap tagged [MANQUANT] | Commit `bc1eb6d` |
| W31-4 | ✅ CLOSED 2026-08-09 | arrêté bundling split into 3 files | Commit `bc1eb6d` |
| W31-5 | ⏳ PENDING | README broken links / false rename claim | Claude must confirm exact file + line |

---

### 🔵 DEFERRED Phases

| ID | Title | Blocker |
|---|---|---|
| Z9 | Server E2E integration test — `/sync` path against live instance | Needs a running server. |

---

## Phase Numbering Convention

- Closed: A–Z, Z2–Z5, Z7, Z10, Z10-FIX, Z11, Z12, Z6, Z8, W1, W2, G18, W4–W9, W18–W19-CODE, W21–W30, W31-2, W31-3, W31-4.
- Z9 deferred.
- **Open: W10–W17, W19 (parallel), W20, W31 (partial). Next new phase identifier: W32.**
- Never reuse a closed phase letter.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Rubrique nomenclature (1000–1242 only) | Décret 07-144 | Partial annex | ⚠️ PARTIEL — W31-3 tagged, JO n° 31/2007 needed |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED |
| Fire safety — equipment requirements | Loi 19-02 | Art. 5 | ✅ VERIFIED — W18 |
| Fire safety — evacuation routes | Loi 19-02 | Art. 13 | ✅ VERIFIED — W18 |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED |
| Food safety / HACCP | Décret 17-140 | Art. 5 | ✅ Verified |
| Décret 17-140 actual JO date | 11 avril 2017 (14 Rajab 1438H) | — | ✅ VERIFIED — W21 |
| Cold-chain temps (restaurants) | Arrêté interminist. 07/05/2025 | Full text | ✅ VERIFIED — W7 |
| Cold storage temps by product type | Arrêté interminist. 21/11/1999 | Temp. table (réf.) | ⚠️ Valeurs de référence — texte verbatim non extrait |
| Microbiological criteria | Arrêté interminist. 04/10/2016 | — | ⚠️ Stub — texte verbatim non extrait |
| Consumer protection — Art.1–43 + 53–79 + 93–95 | Loi 09-03 | Partiel | ⚠️ Art.44–52 + 80–92 MANQUANTS — JO n° 15/2009 requis |
| Occupational health — medical exam | Décret 93-120 | Art. périodicité | ✅ VERIFIED |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
| Approved inspection immutability | INSPECTION_LOCKED guard | — | ✅ VERIFIED — W22 |
| Audit log self-tamper protection | AUDIT_LOG_CLEARED sentinel | — | ✅ VERIFIED — W24 |
| BGN-02-06 ventilation citation | Décret 93-120 is medical exams — WRONG | ? | ⚠️ W11 OPEN |
| Abattoir wastewater annex | Décret 06-141 Annex II — g/t units | Annex II | ⚠️ W10 OPEN — needs user sign-off |
| BFD-08-01 traceability citation | Loi 09-03 Art.19 WRONG | ? | ⚠️ W16 OPEN |
| BFD-02-02 storage clearances | 15cm/5cm — unverified | ? | ⚠️ W17 OPEN |
| Décret 06-198 Art.20 | 'warning' sanction tier | Art.20 | ⚠️ W20 OPEN |
| Décret 24-196 grace period | 3-year clock start unconfirmed | — | ⚠️ W20 OPEN |
