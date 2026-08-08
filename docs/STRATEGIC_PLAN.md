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
| Z10 | AsyncStorage fallback removal — InspectionRepository + SettingsRepository | 2026-08-06 | Commit `4ff351c`. `_migrated`/`ensureMigrated()` removed. SettingsRepository rewritten to SQLite. |
| Z10-FIX | Test drift — SettingsRepository test + schema migration count | 2026-08-06 | Commit `83db48c`. `__tests__/repositories/SettingsRepository.test.ts` rewritten. **All green — user-confirmed 13:07 WAT.** |
| Z11 | Wire `facilityCategoriesFull.json` rubrique into DB + screens | 2026-08-06 | Migration `003_facilities_add_rubrique` added. FacilityRepository + add.tsx + edit.tsx updated. Gate closed 13:22 WAT — 25/25 Jest, TSC 0. |
| Z12 | Audit Findings Closure (F-01 to F-18, 15 sub-items) | 2026-08-06 | TSC 0 + Jest 1234/0 — user-confirmed 20:15 WAT. Commits: `9a5d3e7`, `9c78e3e`. |
| Z6 | Décret 09-19 rollout — BGN-04-06 legalRef + accreditation check | 2026-08-06 | BGN-04-06 criteria + legalReference updated. Commit `5ed564b`. Confirmed by direct code read. |
| Z8 | BGN-03-06 septic pumping — remove unverified 90d/80% figures | 2026-08-06 | Replaced with contract+receipts+no-overflow formulation. Commit `5ed564b`. Décret 17-140 confirmed unrelated (food hygiene). No Algerian legal source found for specific intervals. |
| W1 | getDb() race guard + SyncService test env fix + serverAuth Babel env fix | 2026-08-07 | Commits: `a6c9a40`, `5caf6b1`, `4b4c0e5`, `bee6b60`. Jest 1234/0 + TSC 0 + Android runtime — all confirmed by user 17:54 WAT. |
| W2 | Checklist section chevron direction bug fix | 2026-08-07 | `app/(tabs)/inspection/checklist.tsx` — chevron-down/up convention. Commit `906647f`. |
| G18 | Severity + Category types widened ('critical', 'هيكلية', 'صحة مهنية') | 2026-08-07 | `src/types.ts`. Commit `2de9ad8`. 17 TSC errors resolved. |
| W4 | Checklist sections start collapsed — 1-tap-to-open UX fixed | 2026-08-08 | `src/hooks/useCollapsibleSections.ts` — initial state `true`. Commit `b191c7f`. |
| W5 | TSC fix — 'critical' added to SEVERITY_COLOR, SEVERITY_LABEL, SEVERITY_WEIGHTS | 2026-08-08 | `app/screens/corrective-actions.tsx` + `src/utils/scoringUtils.ts`. Commit `2b5a7a3`. TSC 0 pending Claude gate. |
| W6 | L-02: HACCP Art.5 citation — baseFoodCriteria + abattoirCriteria + bakeryCriteria + couvoirCriteria | 2026-08-08 | Confirmed clean by direct code read — Art.5 already correct in all 4 files (prior commit). No code change needed. |
| W7 | L-02b: Cold-chain legal ref — Arrêté interminist. 07/05/2025 | 2026-08-08 | Confirmed clean by direct code read — BFD-04-01/02 already cite the 07/05/2025 arrêté. No code change needed. |
| W8 | L-03: BGN-03-01 legal ref — Décret 11-125 | 2026-08-08 | Confirmed clean by direct code read — BGN-03-01 already cites Décret 11-125. No code change needed. |
| W9 | L-05: Abattoir chlorine citation — Décret 11-125 (treated water) | 2026-08-08 | Confirmed clean by direct code read — ABT-AX4-01 already cites Décret 11-125. No code change needed. |

---

### 🟡 OPEN Phases

> Execution order: **W18** → **W21** → **W19** → **W15** → **W22** → **W23** → **W24** → **W25** → **W26** → **W27** → **W28** → **W16** → **W17** → **W11** → **W12** → **W29** → **W30** → **W13** → **W14** → **W20** → **W10** (user sign-off required).

| Phase | Priority | Title | Files | Blocker / Source |
|---|---|---|---|---|
| **W10** | 🔴 P0 | L-01: Fix wastewater annex — Annex I general → Annex II abattoir-specific (g/t units) | `abattoirCriteria.ts`, `slaughterhouseSmallCriteria.ts` | ⚠️ Needs user expert sign-off on correct Annex II values before editing |
| **W11** | 🟠 P1 | L-04: Fix ventilation citation — Décret 93-120 (medical exams) → correct Algerian ventilation decree | `baseGeneralCriteria.ts` (BGN-02-06) | ⚠️ JORADP research required — Perplexity to search and propose correct decree before Claude edits |
| **W12** | 🟠 P1 | L-09: Fix semiPharma citations — Décret 17-140 (food-only scope) → Loi 18-11 | `semiPharmaCriteria.ts` (SPH-02-01, 02-02, 05-01) | ⚠️ Need Loi 18-11 article number confirmed |
| **W13** | 🟡 P2 | L-06: Clarify UPD-AX2-01 "500m buffer" — rayon d'affichage vs. setback | `updCriteria.ts` (UPD-AX2-01) | ⚠️ Needs product decision from user |
| **W14** | 🟡 P2 | L-08: Verify Décret 24-196 citation across all criteria files | Various | ⚠️ No source document supplied yet — upload to docs/legal_sources/ first |
| **W15** | 🔴 P0 | F1 fix: re-key `criteriaByActivity` by `rubrique` + fallback warning in checklist UI | `src/criteriaData.ts`, `src/hooks/useChecklistData.ts`, checklist UI | Perplexity designs + implements → Claude TSC + Jest gate. Source: AUDIT_STATE.md F1. |
| **W16** | 🟠 P1 | BFD-08-01: replace wrong Loi 09-03 Art.19 citation (right of withdrawal ≠ traceability) | `src/criteria/baseFoodCriteria.ts` | ⚠️ JORADP research required — find correct traceability article (likely Décret 17-140) or tag `[حكم مهني]`. Source: AUDIT_STATE.md F3. |
| **W17** | 🟠 P1 | BFD-02-02: source or tag 15cm/5cm storage clearances (figures not found in Décret 17-140 Art.12–24) | `src/criteria/baseFoodCriteria.ts` | ⚠️ Source verification — find real Algerian legal source or retag `[حكم مهني]`. Source: AUDIT_STATE.md F3. |
| **W18** | 🟢 P2 — **READY NOW** | BGN-08-01 + BGN-08-02: add specific article numbers to Loi 19-02 citation (Art.5 and Art.13 confirmed correct) | `src/criteria/baseGeneralCriteria.ts` | No blocker — articles already confirmed. Quick fix. Source: AUDIT_STATE.md F3. |
| **W19** | 🟠 P1 — **BLOCKS AUDIT SESSIONS 8+** | `legal_refs/` maintenance: replace fabricated stubs, consolidate duplicate pairs, flag incomplete articles, spot-check ≥3 files vs official JO text | `legal_refs/` (24 files) | Perplexity-only (document conversion + verification, no code). Blocks all future citation audit sessions. Source: AUDIT_STATE.md Section 4. |
| **W20** | 🟡 P2 | Close 3 open legal unverifieds (BGN-01-01 grace-period date, Décret 06-198 Art.20, BFD-02-02 figures) + delete `allCriteria` dead-code export from `src/criteria/index.ts` | `src/criteria/index.ts`, `docs/audit/AUDIT_STATE.md` | Depends on W19. Source: AUDIT_STATE.md Section 5 + F2. |
| **W21** | 🟢 P3 — **READY NOW** | L-10: Fix bakery decree date typo — "27 mars 2017" → "11 avril 2017" in BAK-10-10 legalReference | `src/criteria/bakeryCriteria.ts` (BAK-10-10) | No blocker — correct date confirmed from primary document. Source: Legal Audit L-10. |
| **W22** | 🔴 P0 | F-11: Approved inspection immutability — add `approvalStatus` guard in `InspectionRepository.save()` + `.delete()` + supervisor-override path | `src/repositories/InspectionRepository.ts`, `app/screens/reports.tsx`, `src/hooks/useChecklistData.ts` | ⚠️ Needs product sign-off: should a legitimate reopen-for-correction workflow exist? Resolve together with W23. Source: Consolidated Audit F-11. |
| **W23** | 🔴 P0 | F-18: Wire local approval to server — `ApprovalRepository.approve()/returnForRevision()/escalate()` must call `serverAuth.ts` approve/reject endpoints, OR remove dead server endpoints | `src/repositories/ApprovalRepository.ts`, `src/services/serverAuth.ts` | ⚠️ Needs product decision: (a) wire it up or (b) delete server endpoints. Resolve together with W22. Source: Consolidated Audit F-18. |
| **W24** | 🔴 P0 | F-19: Audit log self-tamper protection — log the clear action itself before deleting; add `AUDIT_LOG_CLEARED` action type; restrict who can clear | `src/repositories/AuditLogRepository.ts`, `src/types.ts`, `app/screens/audit-log.tsx` | ⚠️ Needs product decision on whether clearing is allowed at all given legal-defensibility purpose. Resolve alongside W22/W23. Source: Consolidated Audit F-19. |
| **W25** | 🔴 P0 | F-13: Reinspection facility-match guard in `differentialView.ts` — copy the existing guard pattern from `violationHistory.ts` (facilityId match check before trusting priorInspectionId) | `src/utils/differentialView.ts` | Fix pattern already exists in sibling file `violationHistory.ts` — copy, don't re-derive. Add test: mock `getById` with mismatched facilityId, assert fallback. Source: Consolidated Audit F-13. |
| **W26** | 🟠 P1 | F-10: `categories.tsx` data source swap — replace static `facilitiesData` import with `facilitiesService.getAllFacilities()` so user-added facilities appear in start-inspection flow | `app/screens/categories.tsx` | Re-confirm still needed before implementing (Claude: read file first). Source: Consolidated Audit F-10. |
| **W27** | 🟠 P1 | F-14: Reconcile evaluated-status definitions + fix `statusUtils.ts` missing cases for `observation-only` and `unable-to-verify` (currently both show "لم يقيم" on printed report) | `src/utils/statusUtils.ts`, `src/utils/scoringUtils.ts`, `app/preview/index.tsx` | Add explicit label + color for both statuses; reconcile the 3 completion-rate formulas (progress bar / finish-gate / scoringUtils). Source: Consolidated Audit F-14. |
| **W28** | 🟠 P1 | F-09: AppState autosave — add `AppState` change listener to `useChecklistData.ts` so OS-killed app saves in-progress work (distinct from cancel-button fix already in Z12-05) | `src/hooks/useChecklistData.ts` | Implement with `AppState.addEventListener('change', state => { if state !== 'active' → saveDraft() })`. Source: Consolidated Audit F-09. |
| **W29** | 🟡 P2 | F-17: Server↔mobile schema mapping functions — write explicit mappers for all confirmed mismatches (status casing, violation counts, committeeMembers, inspectorId FK) before enabling real sync | `server/prisma/schema.prisma`, new `src/services/syncMapper.ts` | Pre-emptive — sync not live yet. Implement before enabling sync. Source: Consolidated Audit F-17. |
| **W30** | 🟡 P2 | F-20: `decisionSupport.ts` test coverage — add real tests covering each decision branch, grade boundaries, and legal-citation-driven escalation thresholds | `src/__tests__/decisionSupport.test.ts` | Currently has exactly 1 test (`typeof suggestDecision === 'function'`). No code changes — tests only. Source: Consolidated Audit F-20. |

---

### 🔵 DEFERRED Phases

| ID | Title | Blocker |
|---|---|---|
| Z9 | Server E2E integration test — `/sync` path against live instance | Needs a running server. |

---

## Phase Numbering Convention

- Letters A–Z + Z2–Z5, Z7, Z10, Z10-FIX, Z11, Z12, Z6, Z8, W1, W2, G18, W4, W5, W6, W7, W8, W9 are closed.
- Z9 is deferred.
- **Open phases: W10–W30. Next new phase identifier: W31.**
- Never reuse a closed phase letter.
- Both agents must read this file before opening any new phase.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Rubrique nomenclature (622 entries) | Décret 07-144 | Full annex | ✅ VERIFIED — `facilityCategoriesFull.json` confirmed correct |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified — added to BGN-04-06 legalReference (Z6) |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED |
| Fire safety — ERP type/category list | Loi 19-02 | Art. 14 | ✅ CLOSED — Ord. 76-04 = operational base. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage (point de vente) | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED — 16 params mg/Nm³ + 7 sectors. |
| Food safety / HACCP | Décret 17-140 | Art. 5 | ✅ Verified — W6 confirmed correct in all food criteria files |
| Cold-chain temps (restaurants) | Arrêté interminist. 07/05/2025 | Full text | ✅ VERIFIED — W7 confirmed correct in BFD-04-01/02 |
| Cold storage temps by product type | Arrêté interminist. 21/11/1999 | Temperature table | ✅ VERIFIED |
| Occupational health — medical exam | Décret 93-120 du 15/05/1993 | Art. périodicité | ✅ VERIFIED |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
| Décret 17-140 | Food hygiene / human consumption conditions | N/A for BGN-03-06 | ✅ CONFIRMED — NOT septic pumping. BGN-03-06 revised without this source. |
| BGN-03-06 septic pumping frequency | No Algerian legal source found for 90d/80% rule | — | ⚠️ Z8 CLOSED — figures removed. Reopen as W31+ if JORADP source is found. |
| Water supply (drinking water quality) | Décret 11-125 | Art. relevant | ✅ VERIFIED — W8 + W9 confirmed BGN-03-01 + ABT-AX4-01 already correct |
| BGN-02-06 ventilation citation | Décret 93-120 is medical exams — WRONG decree | ? | ⚠️ W11 OPEN — correct Algerian ventilation decree to be identified |
| Abattoir wastewater annex | Décret 06-141 Annex II abattoir-specific (not Annex I general) | Annex II — g/t units | ⚠️ W10 OPEN — needs user sign-off on values |
| BFD-08-01 traceability citation | Loi 09-03 Art.19 WRONG — Art.19 = droit de rétractation (Loi 18-09 amendment) | ? | ⚠️ W16 OPEN — correct article to be found |
| BFD-02-02 storage clearances | 15cm floor / 5cm wall — not found in Décret 17-140 Art.12–24 | ? | ⚠️ W17 OPEN — source verification required |
| BGN-08-01 / BGN-08-02 | Loi 19-02 cited generically — missing Art.5 and Art.13 | Art.5, Art.13 | ⚠️ W18 OPEN — ready to fix now |
| BAK-10-10 bakery decree date | "27 mars 2017" in code vs. actual "11 avril 2017" | Décret 17-140 date | ⚠️ W21 OPEN — ready to fix now |
| Décret 06-198 Art.20 | Cited in types.ts for 'warning' sanction tier | Art.20 | ⚠️ W20 OPEN — independent verification pending |
| Décret 24-196 grace period | 3-year clock start date unconfirmed | Art. relevant | ⚠️ W20 OPEN — exact date to be found |
| Approved inspection immutability | No guard in InspectionRepository.save()/.delete() | — | ⚠️ W22 OPEN — product sign-off required |
| Local/server approval disconnect | ApprovalRepository never calls serverAuth endpoints | — | ⚠️ W23 OPEN — product decision required |
| Audit log self-tamper gap | AuditLogRepository.clear() leaves no trace | — | ⚠️ W24 OPEN — product decision required |
| differentialView.ts facility mismatch | No facilityId guard on priorInspectionId path | — | ⚠️ W25 OPEN — fix pattern in violationHistory.ts |
| categories.tsx static data source | Uses facilitiesData not getAllFacilities() | — | ⚠️ W26 OPEN — re-confirm before implementing |
| statusUtils.ts missing status cases | observation-only/unable-to-verify show "لم يقيم" | — | ⚠️ W27 OPEN |
| AppState autosave on app-kill | No AppState listener in useChecklistData.ts | — | ⚠️ W28 OPEN |
| Server↔mobile schema mismatches | No mapping functions for status/violations/etc. | — | ⚠️ W29 OPEN — pre-emptive, sync not live |
| decisionSupport.ts test coverage | 1 trivial test, no branch coverage | — | ⚠️ W30 OPEN |
