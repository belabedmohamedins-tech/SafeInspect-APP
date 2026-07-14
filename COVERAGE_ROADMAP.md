# SafeInspect-APP — Coverage Recovery Roadmap

> **Purpose:** Single source of truth for the test-coverage gap-closing effort.  
> Every session starts here. Update the status column when a file is done.  
> Do NOT delete this file until all thresholds pass in CI.

---

## ⚠️ Current Priority

**Checklist rework is in progress (`CHECKLIST_REWORK_ROADMAP.md`).**  
Criteria files (`src/criteria/*.ts`) are actively being modified — adding, removing, and renaming criteria.  
**Do NOT write tests for criteria files until the rework is complete.**  
Priorities 1, 2, and 3 below are intentionally parked. Start at Priority 4.

---

## Coverage Thresholds (locked in `jest.config.js`)

| Metric | Threshold |
|---|---|
| Statements | **95 %** |
| Branches | **83 %** |
| Functions | **97 %** |
| Lines | **96 %** |

---

## Test Architecture (4-Layer Mock System)

| Layer | File | Role |
|---|---|---|
| L1 | `jest.polyfill.js` | Global polyfills (TextEncoder, crypto, etc.) |
| L2 | `moduleNameMapper` in `jest.config.js` | Native modules → `__mocks__/` |
| L3 | `jest.setup.ts` | Behavioural overrides + console suppression |
| L4 | Individual test files | Domain-specific mocks only |

---

## ✅ DONE — Tests Already in Repo

All files below have a test file in `src/__tests__/`. Coverage is assumed for these.

### Services
| Source file | Test file | Status |
|---|---|---|
| `src/services/BackupService.ts` | `src/__tests__/BackupService.test.ts` | ✅ DONE |
| `src/services/CapNotificationService.ts` | `src/__tests__/CapNotificationService.test.ts` | ✅ DONE |
| `src/services/CapReportService.ts` | `src/__tests__/CapReportService.test.ts` | ✅ DONE |
| `src/services/IntegrityService.ts` | `src/__tests__/IntegrityService.test.ts` | ✅ DONE |
| `src/services/NotificationService.ts` | `src/__tests__/NotificationService.test.ts` | ✅ DONE |
| `src/services/PhotoService.ts` | `src/__tests__/PhotoService.test.ts` | ✅ DONE |
| `src/services/SyncService.ts` | `src/__tests__/SyncService.test.ts` | ✅ DONE |
| `src/services/briefService.ts` | `src/__tests__/briefService.test.ts` | ✅ DONE |
| `src/services/followUpService.ts` | `src/__tests__/followUpService.test.ts` | ✅ DONE |
| `src/services/geofencingService.ts` | `src/__tests__/geofencingService.test.ts` | ✅ DONE |
| `src/services/meetingGateService.ts` | `src/__tests__/meetingGateService.test.ts` | ✅ DONE |
| `src/services/pdfService.ts` | `src/__tests__/pdfService.test.ts` | ✅ DONE |

### Utils
| Source file | Test file | Status |
|---|---|---|
| `src/utils/scoringUtils.ts` | `src/__tests__/scoringUtils.test.ts` | ✅ DONE |
| `src/utils/statsUtils.ts` | `src/__tests__/statsUtils.test.ts` | ✅ DONE |
| `src/utils/numericUtils.ts` | `src/__tests__/numericUtils.test.ts` | ✅ DONE |
| `src/utils/statusUtils.ts` | `src/__tests__/statusUtils.test.ts` | ✅ DONE |
| `src/utils/decisionSupport.ts` | `src/__tests__/decisionSupport.test.ts` | ✅ DONE |
| `src/utils/differentialView.ts` | `src/__tests__/differentialView.test.ts` | ✅ DONE |
| `src/utils/groupViolations.ts` | `src/__tests__/groupViolations.test.ts` | ✅ DONE |
| `src/utils/violationHistory.ts` | `src/__tests__/violationHistory.test.ts` | ✅ DONE |

### Hooks
| Source file | Test file | Status |
|---|---|---|
| `src/hooks/useChecklistData.ts` | `src/__tests__/useChecklistData.test.ts` | ✅ DONE |
| `src/hooks/useCollapsibleSections.ts` | `src/__tests__/useCollapsibleSections.test.ts` | ✅ DONE |
| `src/hooks/useHomeData.ts` | `src/__tests__/useHomeData.test.ts` | ✅ DONE |
| `src/hooks/useInspectionList.ts` | `src/__tests__/useInspectionList.test.ts` | ✅ DONE |
| `src/hooks/useSignature.ts` | `src/__tests__/useSignature.test.ts` | ✅ DONE |

### Stores / Data
| Source file | Test file | Status |
|---|---|---|
| `src/stores/CriteriaPreviewStore.ts` | `src/__tests__/CriteriaPreviewStore.test.ts` | ✅ DONE |
| `src/api/apiClient.ts` | `src/__tests__/apiClient.test.ts` | ✅ DONE |
| `src/criteriaData.ts` | `src/__tests__/criteriaData.test.ts` | ✅ DONE |
| `src/services/facilitiesService.ts` | `src/__tests__/facilitiesService.test.ts` | ✅ DONE |
| `src/services/facilitiesService.ts` (extended) | `src/__tests__/facilitiesService.extended.test.ts` | ✅ DONE |

### DB / Schema
| Source file | Test file | Status |
|---|---|---|
| `src/db/schema.ts` | `src/__tests__/schema.test.ts` | ✅ DONE |

### App-Layer Services
| Source file | Test file | Status |
|---|---|---|
| `src/services/loadHomeData.ts` | `src/__tests__/loadHomeData.test.ts` | ✅ DONE |
| `src/services/syncEngine.ts` | `src/__tests__/syncEngine.test.ts` | ✅ DONE |
| `src/services/capFactory.ts` | `src/__tests__/capFactory.test.ts` | ✅ DONE |

---

## 🚫 PARKED — Criteria File Tests (Do Not Start Yet)

> These tests are intentionally deferred. The criteria files below are actively being reworked
> (criteria added, removed, renamed across all phases of `CHECKLIST_REWORK_ROADMAP.md`).
> Writing tests now would mean rewriting them after every rework commit.
> **Unlock this section only after the checklist rework is fully complete.**

### Priority 1 — New Criteria Files (10 files from Checklist Audit)

Each needs: structure export test + criteria count test + no-duplicate-id test + legal-reference format test.

| Source file | Test file to create | Status |
|---|---|---|
| `src/criteria/carWashCriteria.ts` | `src/__tests__/carWashCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/blacksmithCriteria.ts` | `src/__tests__/blacksmithCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/carpenteryCriteria.ts` | `src/__tests__/carpenteryCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/paintShopCriteria.ts` | `src/__tests__/paintShopCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/marbleCriteria.ts` | `src/__tests__/marbleCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/gplCriteria.ts` | `src/__tests__/gplCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/printingCriteria.ts` | `src/__tests__/printingCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/semiPharmaCriteria.ts` | `src/__tests__/semiPharmaCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/produceStorageCriteria.ts` | `src/__tests__/produceStorageCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/mediumSlaughterhouseCriteria.ts` | `src/__tests__/mediumSlaughterhouseCriteria.test.ts` | ⏸ PARKED |

### Priority 2 — Rewritten / Fixed Criteria Files (4 files)

These files are still being modified. Existing test count assertions will break on every rework commit.

| Source file | Test file | Status |
|---|---|---|
| `src/criteria/abattoirCriteria.ts` | `src/__tests__/abattoirCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/couvoirCriteria.ts` | `src/__tests__/couvoirCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/updCriteria.ts` | `src/__tests__/updCriteria.test.ts` | ⏸ PARKED |
| `src/criteria/uabCriteria.ts` | `src/__tests__/uabCriteria.test.ts` | ⏸ PARKED |

### Priority 3 — criteriaData.ts Mapping Gaps

Defer until criteria files are stable — the mapping depends on the final criteria content.

| Concern | Status |
|---|---|
| All 26 activity strings resolve to a non-default checklist | ⏸ PARKED |
| No activity silently falls to `default` unexpectedly | ⏸ PARKED |
| `ميكانيك السيارات` resolves same as `ميكانيك` (mechanicChecklist) | ⏸ PARKED |

---

## 🔴 REMAINING — Active Gap (Start Here)

### Priority 4 — Repositories (sub-folder)

`src/__tests__/repositories/` directory exists but needs verification.

| Source file | Status |
|---|---|
| `src/repositories/AgendaRepository.ts` | 🟡 CHECK if test exists in repositories/ |
| `src/repositories/InspectionRepository.ts` | 🟡 CHECK if test exists in repositories/ |
| `src/repositories/SettingsRepository.ts` | 🟡 CHECK if test exists in repositories/ |

### Priority 5 — Server-side (if in Jest scope)

| Source path | Status |
|---|---|
| `server/` files | 🟡 CHECK if included in Jest `testMatch` |

---

## Session Log

| Date | Session | Files completed | Notes |
|---|---|---|---|
| 2026-07-12 | Handover + Roadmap | 0 new tests | Roadmap created, audit analysed |
| 2026-07-14 | Criteria tests parked | — | Deferred until checklist rework complete |

---

## Rules for the AI Agent (DO NOT SKIP)

1. **Always read the source file first** — `get_file_contents` before writing any test.
2. **One file per commit** — push each test file individually with a descriptive message.
3. **After each push** — update the status column in this file (🔴 → ✅).
4. **Criteria file test pattern** — every criteria test must verify:
   - Default export is an array
   - Array length matches the count in this roadmap
   - All IDs are unique (no duplicates)
   - All items have `severity` in `['low', 'medium', 'high']`
   - All items have a non-empty `legalReference`
5. **Do not add tests for `app/` screen components** — UI layer is out of scope for this effort.
6. **Branch**: push to `main` unless instructed otherwise.
7. **Criteria files are PARKED** — do not write or update any `src/__tests__/*Criteria.test.ts` or `criteriaData.test.ts` while `CHECKLIST_REWORK_ROADMAP.md` has open tasks.
