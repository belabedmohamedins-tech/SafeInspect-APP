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
| Y | Air-emissions criteria — 5 factory types | 2026-08-06 | All criteria already present. No code change needed. |
| Z | Fix wrong Décret 22-167 citation — UAB-AX6-01 | 2026-08-06 | Confirmed by live read. No code change needed. |
| Z2 | Fix wrong 85 dB noise citation — UAB-AX7-07 | 2026-08-06 | [INTL] flag applied. No code change needed. |
| Z3 | Resolve 3 duplicate license criteria | 2026-08-06 | NOT duplicates. No change. |
| Z4 | Fix PRD-02-01 missing numericField | 2026-08-06 | Already split. No change. |
| Z5 | SQLite repository swap — 5 repositories | 2026-08-06 | Commits: bbe9c5f + f656e4e. |
| Z7 | `facilityCategoriesFull.json` domain review | 2026-08-06 | 622 entries. Correct vs Décret 07-144. |
| Z10 | AsyncStorage fallback removal | 2026-08-06 | Commit `4ff351c`. |
| Z10-FIX | Test drift fix | 2026-08-06 | Commit `83db48c`. Green 13:07 WAT. |
| Z11 | Wire rubrique into DB + screens | 2026-08-06 | Migration `003_facilities_add_rubrique`. |
| Z12 | Audit Findings Closure (F-01 to F-18) | 2026-08-06 | TSC 0 + Jest 1234/0. Commits: `9a5d3e7`, `9c78e3e`. |
| Z6 | Décret 09-19 rollout | 2026-08-06 | Commit `5ed564b`. |
| Z8 | BGN-03-06 septic pumping unverified figures removed | 2026-08-06 | Commit `5ed564b`. |
| W1 | getDb() race guard + SyncService + serverAuth Babel fix | 2026-08-07 | Commits: `a6c9a40`, `5caf6b1`, `4b4c0e5`, `bee6b60`. |
| W2 | Checklist chevron direction bug fix | 2026-08-07 | Commit `906647f`. |
| G18 | Severity + Category types widened | 2026-08-07 | Commit `2de9ad8`. 17 TSC errors resolved. |
| W4 | Checklist sections start collapsed | 2026-08-08 | Commit `b191c7f`. |
| W5 | TSC fix — 'critical' in SEVERITY maps | 2026-08-08 | Commit `2b5a7a3`. |
| W6–W9 | HACCP / BGN / abattoir citations confirmed clean | 2026-08-08 | Direct reads. |
| W18 | BGN-08-01+02 Loi 19-02 Art.5+13 | 2026-08-08 | Commit `f7c84a7`. |
| W21 | BAK-10-10 decree date corrected | 2026-08-08 | Commit `f7c84a7`. |
| W25–W26 | PHANTOM — files do not exist | 2026-08-08 | Doc artefacts. |
| W27 | F-14: statusUtils.ts labels+colors | 2026-08-08 | Commit `e2791f7`. |
| W28 | F-09: AppState autosave | 2026-08-08 | Commit `e2791f7`. |
| W19-CODE | baseGeneralCriteria 8 wrong refs | 2026-08-08 | Commits `10b51b0`, `d8cc8b5`. |
| W29-GATE | Jest gate fixes | 2026-08-09 | Commit `efe4127`. Green confirmed. |
| W22 | F-11: immutability (save()) | 2026-08-09 | Partially clean → W52. |
| W23 | F-18: local approval workflow | 2026-08-09 | Partially clean → W53. |
| W24 | F-19: audit log tamper protection | 2026-08-09 | Confirmed clean. |
| W30 | F-20: decisionSupport.ts coverage | 2026-08-09 | Real coverage → W56. |
| W31-1–5 | legal_refs cross-ref, splits, tags | 2026-08-09 | Commits `bc1eb6d`, `4c79ed3`. |
| W11–W17 | BGN/BFD/GAZ citations confirmed | 2026-08-09 | Direct reads. |
| W20 | 0 [À VÉRIFIER] in codebase | 2026-08-09 | Direct read. |
| W36 | decret-06-141 converted | 2026-08-10 | 14.7 KB present. |
| W38–W40 | F1/F3/F4 fixes | 2026-08-09 | Direct reads + commits. |
| W41–W50 | BGN/SLH/GPL legal fixes + CLEANUP_LOG | 2026-08-10 | Commits `287aaf3b`, `60c58df6`, `0eb33bf`, `f8ed975`. |
| **W52** | F-11: INSPECTION_LOCKED on delete/deleteMany/clear | 2026-08-10 | Commits `94e3f7c2`+`f439cc8c`+`ef1db661`. 26/26 PASS. |
| **W53–W56** | F-18/F-14/F-17/F-20 confirmed clean | 2026-08-11 | Direct reads. |
| **W57** | semiPharmaCriteria food-decree fix | 2026-08-11 | Commit `f31faa33`. |
| **W58** | BAK-10-12 Décret 76-04 → Loi 19-02 | 2026-08-11 | Gate PASS. |
| **W19** | legal_refs 34/34 VÉRIFIÉ | 2026-08-11 | Commit `9cc418bb`. |
| **W57-TSC** | InspectionRepository overhaul | 2026-08-11 | 31/31 + TSC 0. |
| **W49** | 11 criteria files confirmed clean | 2026-08-11 | Direct read. |
| **F-01** | .env gitignore clean | 2026-08-11 | Direct read. |
| **W59** | Large-file audit | 2026-08-16 | SUPERSEDED by W60. |
| **W60** | loi-18-11-sante split 3 parties | 2026-08-16 | Commit `698a793`. |
| **W61** | Server routes mounted + approval routes | 2026-08-16 | 10/10 PASS. Commits: `13b750a`, `24270ca`, `0a27026`. |
| **W62–W63** | Route path + approval ID — clean | 2026-08-16 | Direct reads. |
| **W64** | Sync schema clean | 2026-08-17 | Direct read. |
| **W65** | Backup/restore fixed | 2026-08-17 | BackupService + InspectionRepository. |
| **W66–W67** | Integrity + photo — clean | 2026-08-17 | Direct reads. |
| **W68** | PIN lockout secure storage fixed | 2026-08-17 | AuthRepository secureGet/Set/Delete. |
| **W69–W70** | CAP + PDF — clean | 2026-08-17 | Direct reads. |
| **W71** | Planning UI + PriorityWidget | 2026-08-17 | TSC 0 + Jest green. Commits `c178a6c`, `c1b9d91`. |
| **W72** | Dead settings toggles + notification centre | 2026-08-17 | TSC 0 + Jest green 19:21 WAT. Commit `9b42f67`. |
| **W73** | Agenda facility mismatch | 2026-08-17 | PHANTOM — already guarded. |
| **W74** | Server hardening: rate-limit login + batch guard | 2026-08-17 | TSC 0 + Jest 10/10. Commit `33dc3b8`. |
| **W75** | EIE article range sweep (13 files) | 2026-08-17 | All clean. |
| **W76** | Loi 01-19 offset re-sweep | 2026-08-17 | Clean. |
| **W77** | Abattoir/SLH wastewater Décret 06-141 | 2026-08-17 | Clean. |
| **W78** | MCH-29-06 PPE wrong article | 2026-08-17 | Commit `cee92fb`. |
| **W79** | BGN-08-03 bare-wire | 2026-08-17 | Clean. |
| **W80** | 3 false flags corrected | 2026-08-17 | Direct source reads. |
| **W81** | Décret 76-36 MISSING → Present | 2026-08-17 | SHA 2b71182 confirmed. |
| **W82** | Finding 3 — PPE/machine-guard legal refs audit | 2026-08-17 | 6 files. Commit `8433bea`. |
| **W83** | Phantom backlog — active inspection screen | 2026-08-17 | `checklists.tsx` confirmed present. |
| **W84** | SPEC 10 — settings key writer/reader symmetry audit | 2026-08-17 | 3 mismatched keys found → W85. |
| **W85** | SPEC 10 fix — StorageKeys + settings.tsx patch | 2026-08-18 | ✅ CLOSED — TSC 0 + Jest 1245/0. Commits: `33e5cbf` (code), `14b055c` (test fix). All 3 toggles (notifications, autoSync, darkMode) now persist correctly. |

---

### 🟠 OPEN Phases

| Phase | Title | Spec source | Priority | Depends on | Notes |
|---|---|---|---|---|---|
| **W51** | LEGAL-VERIFY: AIM GPL2 publication status | — | surveillance | — | 6 GPL criteria tagged [À VÉRIFIER — W51]. Monitor JORADP for official publication. |

---

## Backlog (no phase opened — needs human decision first)

| Item | What's needed |
|---|---|
| F-05: prod API URL falls back to localhost | Confirm correct prod URL, then update fallback. |
| F-02: stale Node/Expo version comment | Cosmetic. |
| F-03: migration naming `001_` reused | Cosmetic. |
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product/domain decision. |
| L-01: Décret 06-141 Annexe I/II slaughterhouse conflict | Expert/regulator confirmation needed. |
| MCH-29-05 (heavy-metal params) | Décret 06-141 Annexe II §3 — product decision needed. |
| MCH-29-08 Loi 01-19 Art.28 | Verify against full text before acting. |
| COU-AX7-03 Loi 18-11 worker medical exams | Verify when couvoirCriteria.ts fully audited. |
| Décret 76-36 texte intégral | Rectificatif present. Texte original J.O. n°21/1976 non numérisé. |

---

## Next Phase Identifier: **W86**

---

## Legal Quick-Reference

| Decree / Law | Domain | Status in legal_refs/ |
|---|---|---|
| Loi 90-29 | Aménagement + territoire | ✅ Present |
| Loi 03-10 | Environnement | ✅ Present |
| Loi 09-03 | Protection du consommateur | ✅ Present — Art.1–95 verbatim, ✅ VÉRIFIÉ 2026-08-11 |
| Loi 01-19 | Gestion des déchets | ✅ Present |
| Loi 04-20 | Risques majeurs | ✅ Present |
| Loi 19-02 | Sécurité incendie | ✅ Present |
| Loi 18-11 | Santé | ✅ Present — split 3 parties (W60) |
| Loi 90-11 | Travail | ✅ Present |
| Loi 05-12 | Eau | ✅ Present |
| Loi 88-07 | Hygiène/sécurité travail (loi-mère) | ✅ Present |
| Décret 91-05 | Hygiène/sécurité travail | ✅ Present |
| Décret 93-120 | Médecine du travail | ✅ Present |
| Décret 06-198 | Établissements classés | ✅ Present |
| Décret 07-144 | Nomenclature classés | ✅ Present — gap 1243–2922 [MANQUANT] |
| Décret 09-19 | Déchets dangereux import | ✅ Present |
| Décret 02-427 | Prévention risques pro | ✅ Present |
| Décret 06-141 | Rejets effluents liquides | ✅ Present |
| Décret 21-430 | GPL-C modification | ✅ Present |
| Décret 83-496 | GPL-C (as amended by 21-430) | ✅ Present |
| Décret 22-167 | Établissements classés modif | ✅ Present |
| Décret 24-196 | Établissements classés modif | ✅ Present |
| Décret 21-319 | GPL-C general framework | ✅ Present |
| Décret 04-82 | Abattoirs | ✅ Present |
| Décret 76-35 | IGH incendie | ✅ Present — NOT applicable (≥28m only) |
| Décret 76-36 | ERP sécurité incendie/panique | ✅ Present — rectificatif J.O. n°67/1976 |
| Décret 06-138 | Émissions poussières | ✅ Present — ✅ VÉRIFIÉ 2026-08-11 |
| AIM GPL2 v14.03.2022 | GPL station rules | ⚠️ UNPUBLISHED — W51 OPEN |

---

## Execution Order

### ✅ Sprint P1 + P2 FULLY CLOSED — 2026-08-18

All planned phases complete. No gate pending.

### Ongoing surveillance
- **W51** — AIM GPL2 JORADP watch (6 GPL criteria tagged [À VÉRIFIER])
