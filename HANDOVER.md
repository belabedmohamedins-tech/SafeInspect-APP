# SafeInspect-APP — Session Handover

> Last updated: 2026-07-14  
> Repo: `belabedmohamedins-tech/SafeInspect-APP`  
> Stack: React Native + Expo, Jest + --experimental-vm-modules, TypeScript, WatermelonDB/AsyncStorage, EAS Build

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

## 📊 Coverage Status (last known: 2026-07-12 run)

| Metric | Target | Last Known | Status |
|---|---|---|---|
| Statements | 95% | ~74% | ❌ Failing |
| Branches | 83% | unknown | ❌ Failing |
| Functions | 97% | unknown | ❌ Failing |
| Lines | 96% | unknown | ❌ Failing |

Regression cause: new features shipped July 2026 without tests.

---

## 🚫 CURRENT FOCUS — Checklist Rework (NOT Coverage)

> **The checklist rework is in progress. Do NOT work on tests until it is complete.**  
> Source of truth: [`CHECKLIST_REWORK_ROADMAP.md`](./CHECKLIST_REWORK_ROADMAP.md)  
> Criteria files (`src/criteria/*.ts`) are actively being modified — any tests written now will break on every rework commit.

**Current next action** (from `CHECKLIST_REWORK_ROADMAP.md`):  
Session 9 pest control consolidation — affects 8 criteria files. See that file for the full task list.

**Coverage priorities below are PARKED until all phases of `CHECKLIST_REWORK_ROADMAP.md` are complete.**

---

## 🎯 Coverage Priority Order (PARKED — start only after checklist rework is done)

### 1. `CapNotificationService` — broken mock, easy fix, big coverage gain
- File: `src/services/CapNotificationService.ts`
- Test: `src/__tests__/CapNotificationService.test.ts` (exists, 23KB — has content but mock is broken)
- **Known bug**: `CorrectiveActionRepository.getStats` is NOT mocked as a function in the test setup
- **Fix**: Add `CorrectiveActionRepository.getStats = jest.fn().mockResolvedValue({...})` in test `beforeEach`/`beforeAll`

### 2. `serverAuth.ts` — nearly 0%, highest risk
- File: `src/services/serverAuth.ts` (lines 23–205 uncovered)
- Test: `src/__tests__/serverAuth.test.ts` (12KB — exists but shallow)
- Only 12.5% statements, 6.66% branches covered
- Complex auth flow with many branches — read file fully before writing

### 3. `CorrectiveActionRepository.ts` — lines 135–210 uncovered
- File: `src/repositories/CorrectiveActionRepository.ts`
- Test: `src/__tests__/CorrectiveActionRepository.test.ts` (15KB — exists)
- 60% coverage, uncovered block is bulk ops / stats methods
- `getStats` originates here — fixing this unblocks CapNotificationService too

### 4. `pdfService.ts` — lines 751–1143 untouched
- File: `src/services/pdfService.ts`
- Test: `src/__tests__/pdfService.test.ts` (13KB — exists)
- Large print/render section; `expo-print` already mocked at L2
- Focus on export entry points

### 5. `decisionSupport.ts` — complex logic, 55% statements
- File: `src/utils/decisionSupport.ts` (lines 104–164 uncovered)
- Test: `src/__tests__/decisionSupport.test.ts` (9KB — exists)
- 60% branches — requires deliberate edge-case inputs
- Read fully before writing; conditional logic is intricate

### 6. `src/components/` — 0% coverage, needs RTL
- 5 component files, never tested
- Requires React Testing Library (RTL) — check `package.json` before installing
- Use `src/__tests__/components/` directory (already exists)

---

## ⚠️ Known Traps — Read Before Touching Anything

### `.env` is committed to git
`.env` is tracked — any secrets in there are exposed. Do NOT add new secrets to it.

### jest.config.js threshold trap
Thresholds set at ~95% are now failing (~74% statements). Do NOT lower thresholds without user confirmation — lowering = regression admission, not a fix.

### AsyncStorage timing bug
Never call `AsyncStorage.__resetStore()` in `beforeEach` when storage is seeded in `beforeAll` — it clears the seed before the test runs.

### Timezone-safe date tests
Never hardcode expected date strings. Always compute expected output dynamically from the same `Date` object the function uses.

### Console suppression
`console.warn` noise from error-path tests is intentional. Known prefixes suppressed in `jest.setup.ts`. Never suppress silently without a comment.

### TESTING.md is stale
Last updated at commit `4591f1c`, claims "zero uncovered files" — that's wrong. The actual coverage report is the truth.

---

## 🗂️ Test File Inventory

### Exists and has content (select important ones)
| Test File | Source File | Notes |
|---|---|---|
| `CapNotificationService.test.ts` | `services/CapNotificationService.ts` | Mock bug on `getStats` |
| `CorrectiveActionRepository.test.ts` | `repositories/CorrectiveActionRepository.ts` | Lines 135–210 uncovered |
| `serverAuth.test.ts` | `services/serverAuth.ts` | Shallow — most of file uncovered |
| `pdfService.test.ts` | `services/pdfService.ts` | Lines 751–1143 missing |
| `decisionSupport.test.ts` | `utils/decisionSupport.ts` | 55% stmts, needs edge cases |
| `useChecklistData.test.ts` | `hooks/useChecklistData.ts` | 39KB — large, status unclear |
| `loadHomeData.test.ts` | (loadHomeData util) | 13KB |
| `utils.test.ts` | multiple utils | 24KB |
| `BackupService.test.ts` | `services/BackupService.ts` | 18KB |
| `SyncService.test.ts` | `services/SyncService.ts` | 13KB |

### Subdirectories in `__tests__/`
- `components/` — exists but may be empty (check before creating)
- `repositories/` — exists
- `utils/` — exists

---

## 📁 Criteria Files (src/criteria/)

All pure data — arrays of `InspectionItem[]`. Each file = one facility type.

> ⚠️ These files are actively being reworked. Do NOT write tests for them until `CHECKLIST_REWORK_ROADMAP.md` is fully complete.

| File | Items (approx) | Has test? |
|---|---|---|
| `abattoirCriteria.ts` | ~30 | ✅ `abattoirCriteria.test.ts` |
| `bakeryCriteria.ts` | ~20 | ❌ |
| `baseFoodCriteria.ts` | ~20 | ❌ |
| `baseGeneralCriteria.ts` | ~28 | ✅ `baseGeneralCriteria.test.ts` |
| `blacksmithCriteria.ts` | 11 | ✅ `blacksmithCriteria.test.ts` |
| `carWashCriteria.ts` | ~12 | ✅ (minimal) |
| `carpenteryCriteria.ts` | ~12 | ✅ |
| `coldRoomCriteria.ts` | ~12 | ✅ |
| `couvoirCriteria.ts` | ~35 | ❌ |
| `gplCriteria.ts` | ~18 | ✅ |
| `marbleCriteria.ts` | ~10 | ✅ (minimal) |
| `mechanicCriteria.ts` | ~10 | ✅ |
| `paintShopCriteria.ts` | ~10 | ✅ |
| `printingCriteria.ts` | ~12 | ✅ (minimal) |
| `produceStorageCriteria.ts` | ~14 | ✅ |
| `semiPharmaCriteria.ts` | ~15 | ❌ |
| `slaughterhouseSmallCriteria.ts` | ~18 | ❌ |
| `uabCriteria.ts` | ~40 | ❌ |

`InspectionItem` shape (from `src/types.ts`):
```ts
{
  id: string;           // e.g. 'BLS-04-01'
  axis: string;         // Arabic section name
  category: string;     // 'تنظيمية' | 'بيئية' | 'نظافة' | 'سلامة'
  criteria: string;     // Arabic description
  legalReference: string;
  severity: 'high' | 'medium' | 'low';
  controlType: 'doc' | 'visual' | 'measurement';
  complianceStatus: 'not-evaluated';
  numericField?: {      // only for measurement type
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
2. AI reads actual source file first (never assumes structure)
3. AI pushes changes directly to repo via MCP tools
4. User runs `npm run test:coverage` locally to verify delta
5. Repeat file by file — confirm improvement before moving on
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
