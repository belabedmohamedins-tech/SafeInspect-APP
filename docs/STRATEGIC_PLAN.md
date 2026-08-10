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
| W11 | BGN-02-06 ventilation: Décret 93-120 removed, Décret 91-05 Art.11 confirmed correct | 2026-08-09 | Confirmed clean by direct read. Comment `// W11/L-04 fix` present. No change needed. |
| W12 | semiPharmaCriteria: Décret 17-140 scope correct; Loi 18-11 Arts.104/105/107 confirmed | 2026-08-09 | Confirmed clean. No wrong Décret 17-140 citations found. No change needed. |
| W16 | BFD-08-01: Loi 09-03 Art.12+6 confirmed correct; Art.19 already removed | 2026-08-09 | Confirmed clean. Comment `// W16: Art.19 WRONG` present. No change needed. |
| W17 | BFD-02-02: 15cm/5cm tagged [حكم مهني] confirmed | 2026-08-09 | Confirmed clean. Comment `// W17` present. No change needed. |
| W20 | Close 3 open legal unverifieds + delete `allCriteria` dead-code | 2026-08-09 | `allCriteria` already removed. 0 [À VÉRIFIER] in codebase. |
| W13 | L-06: UPD-AX2-01 "500m buffer" clarification | 2026-08-09 | Confirmed clean. Correct legal chain. `warningMin: 700` in place. No change needed. |
| W14 | L-08: Verify Décret 24-196 citation scope | 2026-08-09 | Confirmed clean. Always cited as amending decree to 06-198. No change needed. |
| W10 | L-01: Abattoir wastewater Annex II — Option C | 2026-08-09 | User decision: keep Annex I mg/L as interim. ABT-AX6-02 tagged [À VÉRIFIER]. No code change. |
| W15 | criteriaByRubriqueCategory rubrique-based fallback lookup | 2026-08-09 | `criteriaByRubriqueCategory` 31-key map + `getCriteriaByRubriqueCategory()` confirmed present. Wiring completed in W38. |
| **W32** | **⚠️ RETRACTED** | **2026-08-09** | **Commit `1c49fb43` destructive. Reverted `cbe46ba8`. Superseded by W34-FIX.** |
| W33 | Prevention protocol analysis + improved space instructions | 2026-08-09 | No code change. |
| W34 | ⚠️ FAILED — loi-09-03 truncated (-249 lines) | 2026-08-09 | Commit `4e994e86` DESTRUCTIVE. Superseded by W34-FIX. |
| W34-FIX | loi-09-03 Art.1–95 fully restored + Art.80–95 verbatim | 2026-08-09 | Commit `566a5e28`. Size 34,321 bytes. Diff +169/-76 ✅. |
| W35-DOCS | STRATEGIC_PLAN sync — close W33/W34/W34-FIX | 2026-08-09 | Commit `980f8f4b`. |
| **W36** | **decret-06-141 fully converted — Art.1–14 + Annexe I + Annexe II** | **2026-08-10** | **CONFIRMED CLOSED by Perplexity direct read 2026-08-10. File 14.7 KB, complete. W42 blocker lifted.** |
| W37 | Full instrument cross-reference audit report | 2026-08-09 | `docs/AUDIT_COVERAGE_REPORT.md` pushed. 13 missing instruments catalogued. Commit `d0da8c0e`. |
| **W38** | **F1: Wire rubrique fallback into inspection flow** | **2026-08-09** | **Confirmed clean by direct code read.** |
| **W39** | **F3: Décret 91-05 citation cluster — 6 articles corrected** | **2026-08-09** | **Code in `baseGeneralCriteria.ts` with W39 comments. TSC 0 + Jest 0 failures — user-confirmed.** |
| **W40** | **F4: Loi 01-19 citation cluster — BGN-04-06 + BGN-04-07** | **2026-08-09** | **Confirmed by direct read. No code change needed.** |
| **W44** | **audit.js: remove stale gapNote exceptions** | **2026-08-10** | **Commit `a8ea0d2a`. gapNote() always returns ''. 4 stale per-file exception clauses removed.** |
| **W41** | **F5+F6: Loi 03-10 range fixes + SLH-08-01 deletion + SLH-05-05 + GPL-05-01** | **2026-08-10** | **Commit `287aaf3b`. BGN-10-01 Art.14–21 ✅; BGN-08-06 Art.63+77 ✅; SLH-08-01 deleted ✅; SLH-05-05 Art.15/16 ✅; GPL-05-01 Art.14–21 ✅. TSC+Jest gate pending — hand off to Claude.** |
| **W45** | **BGN-02-01: Loi 90-29 Art.37 → Art.4 + [حكم مهني]** | **2026-08-10** | **Commit `287aaf3b`. Art.37 confirmed unrelated to siting (atmospheric emissions). Replaced Art.4 (constructibility/ecological balance) + [حكم مهني]. TSC+Jest gate pending — hand off to Claude.** |
| **W50** | **CLEANUP_LOG.md: add 12 missing files, remove stale À-créer section, add Issue #1-4 history** | **2026-08-10** | **Commit `f8ed975`. 27-row state table now complete. HANDOFF.md deleted. Next identifier: W51.** |
| **W42** | **F7: SLH-08-01 Loi 03-10 EIE range + Décret 04-82 Arts.6+9 confirmed** | **2026-08-10** | **Commit `60c58df6`. SLH-08-01 المواد 15–22 → المواد 14–21 ✅. SLH-05-02 (Art.6) + SLH-05-03 (Art.9) confirmed clean by direct read ✅.** |
| **W47** | **BGN-07-04 pest sealing — confirmed resolved by W46** | **2026-08-10** | **No code change needed. Direct read confirmed: Décret 91-05 Art.2+Art.3+[حكم مهني] already applied in W46. No dedicated Algerian article mandates crack-sealing for pest ingress. [حكم مهني] protocol applied.** |
| **W48** | **BGN-02-02: add Loi 90-29 Art.8 test assertion** | **2026-08-10** | **Commit `0eb33bf`. Test 20/20 green — user-confirmed. Source already had correct Art.8 citation. Test was the only gap.** |

---

### 🟠 OPEN Phases

| Phase | Priority | Title | Files | Blocker / Source | Agent |
|---|---|---|---|---|---|
| **W19** | 🟠 P0 — IN PROGRESS (parallel) | `legal_refs/` maintenance: replace fabricated stubs | `legal_refs/` | ⚠️ Do NOT touch — user working separately | Other conversation |
| **W49** | 🟠 P3 | Audit 16 unaudited criteria files | `src/criteria/bakeryCriteria.ts`, `blacksmithCriteria.ts`, `carWashCriteria.ts`, `carpenteryCriteria.ts`, `coldRoomCriteria.ts`, `couvoirCriteria.ts`, `marbleCriteria.ts`, `mechanicCriteria.ts`, `paintShopCriteria.ts`, `printingCriteria.ts`, `produceStorageCriteria.ts`, `semiPharmaCriteria.ts`, `uabCriteria.ts`, `updCriteria.ts`, `baseCompressedGasCriteria.ts` | 16 files with zero direct audit attention. | Claude (reads) + Perplexity (fixes) |

---

### 🔵 DEFERRED Phases

| ID | Title | Blocker |
|---|---|---|
| Z9 | Server E2E integration test | Needs a running server. |

---

## Execution Order

```
W49 (Claude + Perplexity: audit 16 unaudited criteria files) ← NEXT
→ W19 (ongoing parallel)
```

---

## Phase Numbering Convention

- Closed: A–Z, Z2–Z5, Z7, Z10–Z11–Z12, Z6, Z8, W1–W50 (all sub-items), W42, W47, W48.
- **Open: W19, W49.**
- **Next new phase identifier: W51.**
- Never reuse a closed phase letter.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Rubrique nomenclature (1000–1242 only) | Décret 07-144 | Partial annex | ⚠️ PARTIEL — W31-3 tagged |
| Wastewater discharge | Décret 06-141 | Art. 1–14 + Annexe I + Annexe II | ✅ CLOSED — W36. File fully converted 14.7 KB. |
| Abattoir wastewater annex | Décret 06-141 Annex II | Annex II g/tonne | ⚠️ [À VÉRIFIER] — W10 closed Option C. |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 2 (scope/definition) + Art. 6 (conditions for granting approval) | ✅ CLOSED — W40 |
| Healthcare waste | Décret 03-478 | Art. 3 | ⚠️ NO FILE — W37 |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED |
| Fire safety — equipment | Loi 19-02 | Art. 5 | ✅ VERIFIED — W18 |
| Fire safety — evacuation | Loi 19-02 | Art. 13 | ✅ VERIFIED — W18 |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ⚠️ NO FILE — W37 |
| LPG/C accreditation | Décret 83-496 (via 21-430 Art.2) | Art. 7 of base decree | ✅ W43 CLOSED |
| LPG vehicle-fuel conversion scope | Décret 21-430 / Décret 83-496 | Art. 1–3 (21-430); Art. 1–21 (83-496) | ✅ W43 CLOSED |
| LPG cylinder storage | AIM GPL2 | Art. 4, 5, 7, 8, 9 | ✅ VERIFIED — W43 CLOSED |
| Air emissions point source | Décret 06-138 | Annex I + II | ⚠️ NO FILE — W37 |
| Food safety / HACCP | Décret 17-140 | Art. 5 | ✅ Verified |
| Décret 17-140 JO date | 11 avril 2017 | — | ✅ VERIFIED — W21 |
| Cold-chain temps | Arrêté 07/05/2025 | Full text | ✅ VERIFIED — W7 |
| Cold storage temps | Arrêté 21/11/1999 | Temp. table | ⚠️ STUB — W19 |
| Microbiological criteria | Arrêté 04/10/2016 | — | ⚠️ STUB — W19 |
| Consumer protection | Loi 09-03 | Art. 1–95 | ✅ W34-FIX — 34,321 bytes. NON VÉRIFIÉ against JO PDF |
| Occupational health — medical exam | Décret 93-120 | Art. périodicité | ✅ VERIFIED |
| Occupational health general | Loi 88-07 | Art. 12–14 | ⚠️ NO FILE — W37 (P3) |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
| Décret 91-05 ventilation | Art. 6 (general) + Art. 11 (high-risk cabins) | ✅ VERIFIED — W11 |
| Décret 91-05 floors/walls (BGN-02-05) | Art. 3+4 | ✅ CLOSED — W39 | |
| Décret 91-05 lighting (BGN-02-07) | Art. 13 (lux table) | ✅ CLOSED — W39 | |
| Décret 91-05 drainage design (BGN-03-04/05) | Art. 9 | ✅ CLOSED — W39 | |
| Décret 91-05 cleaning program (BGN-04-03) | Art. 2+3 | ✅ CLOSED — W39 | |
| Décret 91-05 noise limit (BGN-09-01) | Art. 15 | ✅ CLOSED — W39 | |
| Décret 91-05 pest sealing (BGN-07-04) | Art. 2+3 + [حكم مهني] | ✅ CLOSED — W46/W47. No dedicated crack-sealing article exists. [حكم مهني] protocol applied. |
| Loi 03-10 EIE range (BGN-10-01) | Art. 14–21 | ✅ CLOSED — W41. Commit `287aaf3b`. |
| Loi 03-10 EIE range (GPL-05-01) | Art. 14–21 | ✅ CLOSED — W41 (W46 merged). Commit `287aaf3b`. |
| Loi 03-10 EIE range (SLH-08-01) | Art. 14–21 | ✅ CLOSED — W42. Commit `60c58df6`. |
| Loi 03-10 Class-1 auth (BGN-08-06) | Art. 63 + Art. 77 | ✅ CLOSED — W41. Commit `287aaf3b`. |
| Loi 01-19 hazardous waste producer (BGN-04-06) | Art. 19 | ✅ CLOSED — W40 |
| Loi 01-19 self-incineration ban (BGN-04-07) | Art. 11 + [À VÉRIFIER] | ✅ CLOSED — W40 |
| Décret 09-19 accreditation (BGN-04-06) | Art. 2 + Art. 6 | ✅ CLOSED — W40 |
| Loi 01-19 SLH-05-05 container (slaughter) | Art. 15/16 | ✅ CLOSED — W41. Commit `287aaf3b`. |
| SLH-08-01 duplicate EIE criterion | DELETED | ✅ CLOSED — W41 (F6). Commit `287aaf3b`. |
| Loi 90-29 siting (BGN-02-01) | Art. 4 + [حكم مهني] | ✅ CLOSED — W45. Commit `287aaf3b`. |
| Loi 90-29 nuisance prevention (BGN-02-02) | Art. 8 explicit citation | ✅ CLOSED — W48. Commit `0eb33bf`. Test 20/20. |
| Décret 04-82 ante mortem (SLH-05-02) | Art. 6 | ✅ CONFIRMED CLEAN — W42 direct read |
| Décret 04-82 post mortem (SLH-05-03) | Art. 9 | ✅ CONFIRMED CLEAN — W42 direct read |
| BGN-02-06 ventilation | Décret 91-05 Art.11 correct (narrow) | ✅ VERIFIED — W11 |
| BFD-08-01 traceability | Loi 09-03 Art.12+6 correct | ✅ VERIFIED — W16 |
| semiPharmaCriteria Loi 18-11 | Arts.104/105/107 | ⚠️ NO FILE — W37 |
| Approved inspection immutability | INSPECTION_LOCKED | ✅ VERIFIED — W22 |
| Décret 24-196 citation scope | Amending decree to 06-198 only | ✅ VERIFIED — W14 |
| UPD-AX2-01 500m buffer | Loi 90-29 + Loi 03-10 + Décret 06-198 | ✅ VERIFIED — W13 |
| criteriaByActivity rubrique wiring | facilities.tsx → checklist param chain | ✅ CLOSED — W38 |
| Drinking water standards | Décret 11-125 | ⚠️ NO FILE — W37 |
| Hazardous waste bordereau | Décret 05-315 | ⚠️ NO FILE — W37 |
| EIA procedures | Décret 07-145 | ⚠️ NO FILE — W37 |
| Worker OHS training | Décret 02-427 | ⚠️ Selective extract (Arts 1-24) — W37 (P3) |
| Electrical safety | Décret 76-35 | ⚠️ FILE EXISTS — not yet read for BGN-08-03. W49 scope. |
| Loi 04-08 commercial conditions | Cited in paintShopCriteria.ts | ⚠️ NOT AUDITED — W49 scope |
