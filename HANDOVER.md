# SafeInspect-APP — Session Handover

> Last updated: 2026-07-14  
> Repo: `belabedmohamedins-tech/SafeInspect-APP`  
> Stack: React Native + Expo, Jest + --experimental-vm-modules, TypeScript, WatermelonDB/AsyncStorage, EAS Build

---

## 🚫 CURRENT FOCUS — Checklist Rework (NOT Coverage)

> **The checklist rework is in progress. Do NOT work on tests or coverage until it is complete.**  
> Criteria files (`src/criteria/*.ts`) are actively being modified — tests written now will break on every rework commit.

**Authoritative spec:** [`Perplexity_Implementation_Spec.md`](./Perplexity_Implementation_Spec.md) — follow it for all checklist changes.

---

## 🏗️ Architecture in 30 seconds

```
src/
├── __mocks__/          L2 mocks — native modules → mock implementations
├── __tests__/          All test files (flat + components/ + repositories/ + utils/ subdirs)
├── components/         React Native UI components (5 files, historically 0% coverage)
├── criteria/           Inspection criteria data files (one per facility type, pure data)
├── db/                 WatermelonDB schema + models
├── hooks/              React hooks (useChecklistData, useHomeData, useInspectionList…)
├── repositories/       DB repository layer (InspectionRepository, CorrectiveActionRepository…)
├── services/           Business logic (pdfService, serverAuth, CapNotificationService…)
├── stores/             Zustand/MobX stores
├── utils/              Pure utility functions
├── criteriaData.ts     Maps facility type → criteria array
├── facilitiesData.ts   Static facility list
├── facilitiesService.ts Facility lookup helpers
└── types.ts            All shared TypeScript types
```

### 4-Layer Mock System
| Layer | File | Purpose |
|---|---|---|
| L1 | `jest.polyfill.js` | Global polyfills |
| L2 | `moduleNameMapper` in jest.config.js | Native modules → `__mocks__/` |
| L3 | `jest.setup.ts` | Behavioral overrides + console suppression |
| L4 | Individual test files | Domain-specific mocks only |

**Critical mapper order**: `expo-secure-store` and `expo-local-authentication` MUST appear before `expo-modules-core` in `moduleNameMapper` — changing this order silently breaks `getItemAsync` across all auth tests.

---

## 📋 Checklist Rework — Session Log

### Phases from `Perplexity_Implementation_Spec.md`

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Remove legacy duplicate blocks (abattoir, uab, couvrir, upd) | ✅ Done |
| Phase 2 | Correct 3 confirmed legal citations | ✅ Done |
| Phase 3 | Merge duplicated shared-module content (license dedup, pest control consolidation, food-safety near-duplicates) | ✅ Done |
| Phase 4 | Add new criteria for confirmed gaps | 🔴 In progress |
| Phase 5 | Typing/evidence-standard fixes | ⬜ Not started |

### Phase 3 — Completed work
- Removed duplicate operating-license criteria from 12 facility files — `BGN-01-01` is now the single authoritative check
- Upgraded `BGN-07-02` with trap-map/intervention-log detail (absorbed from `COU-AX8-02`)
- Removed pest duplicates from: `abattoirCriteria`, `couvoirCriteria`, `updCriteria`, `bakeryCriteria`, `produceStorageCriteria`, `slaughterhouseSmallCriteria`
- Kept `UPD-AX8-03` (wild-bird exclusion) and `ABT-AX10-01` (abattoir biosecurity) — genuine content, not duplicates
- Removed food-safety near-duplicates: `CLD-17-02–05`, `BAK-10-07`, modified `BAK-10-08`

---

## 📊 Coverage Status (PARKED — start only after checklist rework is done)

> ⚠️ Do NOT work on coverage until all phases of the checklist rework are complete.

Coverage was at ~95%+ in June 2026. Regression occurred after new features were shipped July 2026 without tests.

| Metric | Target | Last Known | Status |
|---|---|---|---|
| Statements | 95% | ~74% | ❌ Failing |
| Branches | 83% | unknown | ❌ Failing |
| Functions | 97% | unknown | ❌ Failing |
| Lines | 96% | unknown | ❌ Failing |

> Do not lower thresholds — raising tests to meet them is the correct path.

### Priority Order (resume after checklist rework)

1. **`CapNotificationService`** — broken mock, easy fix, big coverage gain  
   Fix: add `CorrectiveActionRepository.getStats = jest.fn().mockResolvedValue({...})` in test `beforeEach`

2. **`serverAuth.ts`** — ~12% statements, highest risk file  
   Lines 23–205 uncovered. Complex auth flow — read fully before writing tests.

3. **`CorrectiveActionRepository.ts` lines 135–210** — unblocks CapNotificationService too  
   Bulk ops / stats methods uncovered. `getStats` originates here.

4. **`pdfService.ts` lines 751–1143** — large print/render section, `expo-print` already mocked at L2

5. **`decisionSupport.ts`** — 55% statements, 60% branches, lines 104–164 uncovered. Read fully first.

6. **`src/components/`** — 0% coverage, needs React Testing Library. Check `package.json` before installing.

---

## ⚠️ Known Traps — Read Before Touching Anything

### `.env` is committed to git
`.env` is tracked — any secrets in there are exposed. Do NOT add new secrets to it.

### jest.config.js threshold trap
Thresholds set at ~95% are now failing (~74% statements). Do NOT lower thresholds without user confirmation — lowering = regression admission, not a fix.

### Module ordering in moduleNameMapper
`expo-secure-store` and `expo-local-authentication` MUST appear before `expo-modules-core`. Changing this order silently breaks `getItemAsync` across all auth tests.

### AsyncStorage timing bug
Never call `AsyncStorage.__resetStore()` in `beforeEach` when storage is seeded in `beforeAll` — it clears the seed before the test runs.

### Timezone-safe date tests
Never hardcode expected date strings. Always compute expected output dynamically from the same `Date` object the function uses.

### Console suppression
`console.warn` noise from error-path tests is intentional. Known prefixes suppressed in `jest.setup.ts`. Never suppress silently without a comment.

### TESTING.md is stale
Claims "zero uncovered files" — that's wrong. The actual coverage report is the truth.

---

## 🗂️ Test File Inventory

### Exists and has content
| Test File | Source File | Notes |
|---|---|---|
| `CapNotificationService.test.ts` | `services/CapNotificationService.ts` | Mock bug on `getStats` |
| `CorrectiveActionRepository.test.ts` | `repositories/CorrectiveActionRepository.ts` | Lines 135–210 uncovered |
| `serverAuth.test.ts` | `services/serverAuth.ts` | Shallow — most of file uncovered |
| `pdfService.test.ts` | `services/pdfService.ts` | Lines 751–1143 missing |
| `decisionSupport.test.ts` | `utils/decisionSupport.ts` | 55% stmts, needs edge cases |
| `useChecklistData.test.ts` | `hooks/useChecklistData.ts` | 39KB — large, status unclear |
| `loadHomeData.test.ts` | loadHomeData util | 13KB |
| `utils.test.ts` | multiple utils | 24KB |
| `BackupService.test.ts` | `services/BackupService.ts` | 18KB |
| `SyncService.test.ts` | `services/SyncService.ts` | 13KB |

### Subdirectories in `__tests__/`
- `components/` — exists but may be empty
- `repositories/` — exists
- `utils/` — exists

---

## 📁 Criteria Files (src/criteria/)

All pure data — arrays of `InspectionItem[]`. Each file = one facility type.

> ⚠️ These files are actively being reworked. Do NOT write tests for them until all phases of the checklist rework are complete.

| File | Has test? |
|---|---|
| `abattoirCriteria.ts` | ✅ |
| `bakeryCriteria.ts` | ❌ |
| `baseFoodCriteria.ts` | ❌ |
| `baseGeneralCriteria.ts` | ✅ |
| `blacksmithCriteria.ts` | ✅ |
| `carWashCriteria.ts` | ✅ (minimal) |
| `carpenteryCriteria.ts` | ✅ |
| `coldRoomCriteria.ts` | ✅ |
| `couvoirCriteria.ts` | ❌ |
| `gplCriteria.ts` | ✅ |
| `marbleCriteria.ts` | ✅ (minimal) |
| `mechanicCriteria.ts` | ✅ |
| `paintShopCriteria.ts` | ✅ |
| `printingCriteria.ts` | ✅ (minimal) |
| `produceStorageCriteria.ts` | ✅ |
| `semiPharmaCriteria.ts` | ❌ |
| `slaughterhouseSmallCriteria.ts` | ❌ |
| `uabCriteria.ts` | ❌ |

`InspectionItem` type shape:
```ts
{
  id: string;            // e.g. 'BLS-04-01'
  axis: string;          // Arabic section name
  category: string;      // 'تنظيمية' | 'بيئية' | 'نظافة' | 'سلامة'
  criteria: string;      // Arabic description
  legalReference: string;
  severity: 'high' | 'medium' | 'low';
  controlType: 'doc' | 'visual' | 'measurement';
  complianceStatus: 'not-evaluated';
  numericField?: {       // only for measurement type
    label: string;
    unit: string;
    threshold: number;
    comparisonOperator: 'lte' | 'gte';
  };
}
```

---

## 🚀 Working Method

1. User gives short instruction
2. AI reads actual source file first — never assumes structure
3. AI pushes changes directly to repo via MCP tools
4. User runs `npm run test:coverage` locally to verify delta
5. Confirm improvement before moving on
6. Always confirm branch before pushing (default: `main`)

---

## 🔑 Key Commands

```bash
# Full coverage run
npm run test:coverage

# Targeted run (one file)
npm run test:coverage -- --testPathPattern=CapNotificationService

# Run all tests
npm test
```
