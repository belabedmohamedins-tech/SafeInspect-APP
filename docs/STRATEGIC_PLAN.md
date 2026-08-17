# SafeInspect — Strategic Plan & Phase Registry

> This is the single source of truth for phase numbering and execution order.
> Before opening a new phase, read this file to find the highest existing letter/number.
> Perplexity coordinates through this file — not through memory.

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
| W18 | BGN-08-01 + BGN-08-02: add Art.5 + Art.13 to Loi 19-02 citation | 2026-08-08 | Commit `f7c84a7`. TSC + Jest all green. |
| W21 | BAK-10-10: bakery decree date corrected 27 mars → 11 avril 2017 | 2026-08-08 | Commit `f7c84a7`. TSC + Jest all green. |
| W25 | F-13: differentialView.ts facility-match guard | 2026-08-08 | **PHANTOM** — file does not exist in repo. Doc artefact. |
| W26 | F-10: categories.tsx data source swap | 2026-08-08 | **PHANTOM** — file does not exist. Doc artefact. |
| W27 | F-14: statusUtils.ts — observation-only + unable-to-verify labels+colors | 2026-08-08 | Commit `e2791f7`. |
| W28 | F-09: AppState autosave in useChecklistData.ts | 2026-08-08 | Commit `e2791f7`. |
| W19-CODE | baseGeneralCriteria article-citation corrections (8 wrong refs + 2 À VÉRIFIER resolved) | 2026-08-08 | Commits `10b51b0`, `d8cc8b5`. |
| W29-GATE | Jest gate fixes: Colors keys, Arabic vowel, BGN article refs, AppState mock | 2026-08-09 | Commit `efe4127`. User-confirmed all green. |
| W22 | F-11: Approved inspection immutability guard | 2026-08-09 | Confirmed PARTIALLY clean — save() protected. delete/deleteMany/clear NOT protected → W52. |
| W23 | F-18: Local approval workflow | 2026-08-09 | Confirmed PARTIALLY clean — server side ready; ApprovalRepository → serverAuth not wired → W53. |
| W24 | F-19: Audit log self-tamper protection | 2026-08-09 | Confirmed clean by direct read. |
| W30 | F-20: decisionSupport.ts test coverage | 2026-08-09 | Confirmed: only typeof check present. Real coverage → W56. |
| W31-2 | loi-09-03: tag Art.44–52 + Art.80–92 as [MANQUANT] | 2026-08-09 | Commit `bc1eb6d`. |
| W31-3 | Decret-07-144: tag rubrique gap 1243–2922 as [MANQUANT] | 2026-08-09 | Commit `bc1eb6d`. |
| W31-4 | Split bundled arrêté file into 3 separate files | 2026-08-09 | Commit `bc1eb6d`. |
| W31-1 | audit.js cross-ref false-positive fix | 2026-08-09 | Commit `4c79ed3`. |
| W31-5 | README broken links confirmed valid | 2026-08-09 | Confirmed by direct read. W31 FULLY CLOSED. |
| W11 | BGN-02-06 ventilation: Décret 93-120 removed, Décret 91-05 Art.11 confirmed | 2026-08-09 | Confirmed clean. |
| W12 | semiPharmaCriteria: Décret 17-140 scope correct for food; Loi 18-11 confirmed | 2026-08-09 | Confirmed food-scope issue exists → W57. |
| W16 | BFD-08-01: Loi 09-03 Art.12+6 confirmed correct | 2026-08-09 | Confirmed clean. |
| W17 | BFD-02-02: 15cm/5cm tagged [حكم مهني] confirmed | 2026-08-09 | Confirmed clean. |
| W20 | Close 3 open legal unverifieds + delete allCriteria dead-code | 2026-08-09 | 0 [À VÉRIFIER] in codebase. |
| W13 | L-06: UPD-AX2-01 "500m buffer" clarified | 2026-08-09 | Confirmed: product/domain decision needed. No code change until decided. |
| W14 | L-07: GAZ station vapor-recovery tag | 2026-08-09 | Confirmed clean. |
| W15 | criteriaByActivity rubrique fallback confirmed clean | 2026-08-09 | No code change needed. |
| W10 | Abattoir wastewater [À VÉRIFIER] — Option C tag applied | 2026-08-09 | Confirmed clean. |
| W36 | decret-06-141: fully converted | 2026-08-10 | Direct read: 14.7 KB present. |
| W38 | F1: rubrique wired end-to-end | 2026-08-09 | Confirmed clean. |
| W39 | F3: Décret 91-05 — 6 citations corrected | 2026-08-09 | TSC 0 + Jest 0. |
| W40 | F4: Loi 01-19 + Décret 09-19 citations corrected | 2026-08-09 | Direct read SHA `9d11384`. |
| W41 | Loi 03-10 range fixes (BGN-10-01, BGN-08-06, GPL-05-01) + SLH-08-01 deleted + SLH-05-05 fixed | 2026-08-10 | Commit `287aaf3b`. |
| W42 | SLH-08-01 Loi 03-10 range fix + Décret 04-82 Arts.6+9 confirmed | 2026-08-10 | Commit `60c58df6`. |
| W43 | gplCriteria.ts phantom Décret 21-430 citations fixed | 2026-08-10 | Commit `287aaf3b`. |
| W44 | audit.js gapNote stale exceptions removed | 2026-08-10 | Commit `a8ea0d2a`. |
| W45 | BGN-02-01: Loi 90-29 Art.37 → Art.4 + [حكم مهني] | 2026-08-10 | Commit `287aaf3b`. |
| W46 | BGN-07-04: Décret 91-05 Art.2+Art.3+[حكم مهني] (merged into W41) | 2026-08-10 | Commit `287aaf3b`. |
| W47 | BGN-07-04 confirmed resolved by W46 | 2026-08-10 | Direct read confirmed. |
| W48 | BGN-02-02 test added — 20/20 green | 2026-08-10 | Commit `0eb33bf`. |
| W50 | CLEANUP_LOG.md: 12 files added + stale section removed | 2026-08-10 | Commit `f8ed975`. |
| **W52** | F-11 remaining: INSPECTION_LOCKED on delete/deleteMany/clear | 2026-08-10 | Commits `94e3f7c2` + `f439cc8c` + `ef1db661`. Gate: 26/26 Jest PASS 2026-08-11. |
| **W53** | F-18: ApprovalRepository → serverAuth wiring | 2026-08-11 | Confirmed clean by direct read — `ApprovalRepository` already wires via `syncToServer()` fire-and-forget. No code change needed. |
| **W54** | F-14: scoringUtils.ts completion-rate reconciliation | 2026-08-11 | Confirmed clean by direct read. No code change needed. |
| **W55** | F-17: SavedInspection.violations shape vs sync.ts | 2026-08-11 | Confirmed clean by direct read. No code change needed. |
| **W56** | F-20: decisionSupport.ts real test coverage | 2026-08-11 | 18 test cases confirmed by direct read. No code change needed. |
| **W57** | L-09: semiPharmaCriteria.ts SPH-02-01/02/05-01 food-decree misuse fixed | 2026-08-11 | Commit `f31faa33`. Gate: PASS 2026-08-11. |
| **W58** | L-11: bakeryCriteria.ts BAK-10-12 Décret 76-04 → Loi 19-02 Art.5+Art.13 | 2026-08-11 | Gate: PASS 2026-08-11. |
| **W19** | legal_refs corpus 100% VÉRIFIÉ — 34/34 | 2026-08-11 | Patch-27 commit `9cc418bb`. Verified by Belabed Mohamed. |
| **W57-TSC** | InspectionRepository: stamp→hashAndStore, W22 guard, getCompleted/getDrafts/updateStatus, ApprovalStatus+'rejected' | 2026-08-11 | Gate: 31/31 Jest PASS + TSC 0, user-confirmed 14:27 WAT. |
| **W49** | Audit criteria files — 11 files confirmés propres par lecture directe | 2026-08-11 | Direct read: 11 criteria files. 0 erreur de citation, 0 [À VÉRIFIER] non balisé. |
| **F-01** | `.env` gitignore check | 2026-08-11 | Confirmed clean by direct read. No code change needed. |
| **W59** | Large-file read audit — 5 files > 40KB | 2026-08-16 | SUPERSEDED by W60. |
| **W60** | loi-18-11-sante.md (189KB) split en 3 parties lisibles API | 2026-08-16 | partie1+2+3. Commit `698a793`. |
| **W61** | Server routes never mounted + approval by-inspectionId convenience routes | 2026-08-16 | 10/10 PASS. Commits: `13b750a`, `24270ca`, `0a27026`. |
| **W62** | Server route path-prefix mismatch | 2026-08-16 | Confirmed clean by direct read. |
| **W63** | Approval endpoint ID semantics | 2026-08-16 | Resolved as part of W61. |
| **W64** | Sync schema missing real client values | 2026-08-17 | Confirmed clean by direct read — full SavedInspection sent. |
| **W65** | Backup/restore reads wrong storage layer | 2026-08-17 | ✅ FIXED 2026-08-17 10:59 — exportBackup() now calls InspectionRepository.getAll(); importBackup() calls InspectionRepository.save() per inspection. |
| **W66** | Integrity + audit trail | 2026-08-17 | Confirmed clean by direct read. |
| **W67** | Photo evidence backup+sync payload gap | 2026-08-17 | Confirmed clean by direct read. |
| **W68** | PIN lockout bypassable via AsyncStorage clear | 2026-08-17 | ✅ FIXED 2026-08-17 10:59 — getFailedAttempts/incrementFailedAttempts/resetFailedAttempts now use secureGet/secureSet/secureDelete. |
| **W69** | CAP evidence + lifecycle | 2026-08-17 | Confirmed clean by direct read. |
| **W70** | PDF report gaps | 2026-08-17 | Confirmed clean by direct read. |
| **W71** | Planning + prioritization UI — nonCompliantFacilities denominator fix + PriorityWidget | 2026-08-17 | Commits `c178a6c`, `c1b9d91`. TSC 0 + Jest all green — user-confirmed 13:08 WAT. |

---

### 🟠 OPEN Phases

| Phase | Title | Spec source | Priority | Depends on | Notes |
|---|---|---|---|---|---|
| **W51** | LEGAL-VERIFY: AIM GPL2 publication status | — | P1 | — | 6 GPL criteria tagged [À VÉRIFIER — W51]. Monitor JORADP for official publication. |
| **W72** | Dead settings toggles + unreachable notification centre | SPEC 10 | P1 | — | All 3 Settings toggles write keys nothing reads; entire Notification Centre built but never fired. |
| **W73** | Agenda add facility mismatch — form bug can launch inspection for wrong facility | SPEC 11 | P2 | — | One-line form bug in agenda creation; wrong facilityId can be submitted. |
| **W74** | Minor server hardening — input validation, error codes, rate limiting | SPEC 12 | P2 | — | Grouped minor server-side hardening items from SPEC 12. |

---

## Backlog (no phase opened — needs human decision first)

| Item | What's needed |
|---|---|
| F-05: prod API URL falls back to localhost | Confirm correct prod URL, then update fallback. |
| F-02: stale Node/Expo version comment | Cosmetic. |
| F-03: migration naming `001_` reused | Cosmetic. |
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product/domain decision. |
| L-01: Décret 06-141 Annexe I/II slaughterhouse conflict | Expert/regulator confirmation needed. |
| legal_refs Issue #1: decret-83-496 Art.4/7/8 inline amendment notice | Add `> Modification Décret 21-430` inline at each amended article. |
| legal_refs Issue #2: loi-09-03 ✅ VÉRIFIÉ status | Revert to ⚠️ NON VÉRIFIÉ — no named human reviewer. |
| legal_refs Issue #3: loi-03-10 missing header + sequence audit | Add mandatory header block + `## Contrôle de séquence` section. |
| Active inspection screen | No screen for filling in items in real time yet. |
| SPEC 10 — mechanical grep sweep | Before next release: confirm every settings key written / scheduler exported has a reader. |

---

## Next Phase Identifier: **W75**

---

## Legal Quick-Reference

| Decree / Law | Domain | Status in legal_refs/ |
|---|---|---|
| Loi 90-29 | Aménagement + territoire | ✅ Present |
| Loi 03-10 | Environnement | ✅ Present |
| Loi 09-03 | Protection du consommateur | ✅ Present — Art.1–95 verbatim |
| Loi 01-19 | Gestion des déchets | ✅ Present |
| Loi 04-20 | Risques majeurs | ✅ Present |
| Loi 19-02 | Sécurité incendie | ✅ Present |
| Loi 18-11 | Santé | ✅ Present — split 3 parties (W60) |
| Loi 90-11 | Travail | ✅ Present |
| Loi 05-12 | Eau | ✅ Present |
| Décret 91-05 | Hygiène/sécurité travail | ✅ Present |
| Décret 93-120 | Médecine du travail | ✅ Present |
| Décret 06-198 | Établissements classés | ✅ Present |
| Décret 07-144 | Nomenclature classés | ✅ Present — gap rubriques 1243–2922 tagged [MANQUANT] |
| Décret 09-19 | Déchets dangereux import | ✅ Present |
| Décret 02-427 | Prévention risques pro | ✅ Present |
| Décret 06-141 | Rejets effluents liquides | ✅ Present |
| Décret 21-430 | GPL-C modification (3 arts only) | ✅ Present |
| Décret 83-496 | GPL-C (as amended by 21-430) | ✅ Present |
| Décret 22-167 | Établissements classés modif | ✅ Present |
| Décret 24-196 | Établissements classés modif | ✅ Present |
| Décret 21-319 | GPL-C general framework | ✅ Present |
| Décret 04-82 | Abattoirs | ✅ Present |
| Décret 76-35 | IGH incendie | ✅ Present |
| AIM GPL2 v14.03.2022 | GPL station technique rules | ⚠️ UNPUBLISHED — no JORADP trace. W51 OPEN. |

---

## Execution Order (Current Sprint)

### P1 — in order
1. **W72** — Dead settings toggles + notification centre

### P2 — after P1s
2. **W73** — Agenda facility mismatch
3. **W74** — Minor server hardening

### Ongoing surveillance
- **W51** — AIM GPL2 JORADP watch
