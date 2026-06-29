# Testing Guide — SafeInspect-APP

This document explains the testing architecture, how to add new tests correctly, and how to maintain the mock system without breaking anything.

---

## Running Tests

```bash
# Run all tests
npx jest --verbose

# Run with coverage report
npx jest --coverage

# Run a single test file
npx jest src/__tests__/BackupService.test.ts

# Run tests matching a name pattern
npx jest --testNamePattern="returns null"

# Watch mode (re-runs on file save)
npx jest --watch
```

---

## Architecture: The 4-Layer Mock System

Every mock in this project belongs in **exactly one** layer. Adding a mock in the wrong layer causes duplicate resolution, silent false-positives, or test crashes.

```
Layer 1 ─ jest.polyfill.js          (runs first, before the preset)
Layer 2 ─ moduleNameMapper          (jest.config.js, redirects native imports)
Layer 3 ─ jest.setup.ts             (behavioral overrides after framework loads)
Layer 4 ─ src/__tests__/**          (domain-specific, per test file)
```

### Layer 1 — `jest.polyfill.js`

**Purpose**: Global polyfills that must exist before any module is evaluated.

**What lives here**: `globalThis.fetch`, `globalThis.Response`, `TextEncoder`, etc.

**Rule**: Only `globalThis.X = ...` assignments. No `jest.mock()` calls.

---

### Layer 2 — `moduleNameMapper` in `jest.config.js`

**Purpose**: Redirect native/Expo module imports to safe JavaScript stubs before Jest resolves them. These modules crash in Node because they depend on native binaries.

**Current mapped modules:**

| Module | Stub file | Notes |
|---|---|---|
| `expo-modules-core` | `__mocks__/expo-modules-core.js` | Strict Proxy for all native modules |
| `expo-notifications` | `__mocks__/expo-notifications.js` | Includes `AndroidImportance` |
| `expo-print` | `__mocks__/expo-print.js` | |
| `expo-sharing` | `__mocks__/expo-sharing.js` | |
| `expo-secure-store` | `__mocks__/expo-secure-store.js` | Must appear **before** `expo-modules-core` |
| `expo-local-authentication` | `__mocks__/expo-local-authentication.js` | Must appear **before** `expo-modules-core` |
| `expo-constants` | `__mocks__/expo-constants.js` | Overrides jest-expo default; sets `IS_EXPO_GO = false` |
| `expo/src/winter/fetch/ExpoFetchModule` | `__mocks__/expoFetchModule.js` | |
| `expo/src/winter/fetch(.*)` | `__mocks__/expoFetch.js` | |
| `expo-file-system/legacy` | `src/__mocks__/expo-file-system-legacy.ts` | |
| `@react-native-async-storage/async-storage` | `__mocks__/@react-native-async-storage/async-storage.js` | Stateful in-memory store |
| `@react-native-community/netinfo` | `__mocks__/@react-native-community/netinfo.js` | Supports `__setConnected()` |

**Rule**: Every entry must point to a file in `__mocks__/`. Never write an inline factory here.

**How to add a new native module stub**:
1. Create `__mocks__/your-module.js` with safe `jest.fn()` stubs for every exported function.
2. Add an entry to `moduleNameMapper` in `jest.config.js`:
   ```js
   '^your-module$': '<rootDir>/__mocks__/your-module.js',
   ```
3. Run `npx jest` to confirm it resolves correctly.

---

### Layer 3 — `jest.setup.ts`

**Purpose**: Behavioral mocks that need `jest.mock()` hoisting semantics, or that must override something the `jest-expo` preset already loaded.

**What lives here**: `react-native` (strict Proxy), `Platform`, `react-native-safe-area-context`.

**Rule**: Only add here when Layer 2 cannot handle it (i.e., when the module is a virtual module synthesised by Metro/jest-expo that `moduleNameMapper` cannot reliably intercept after the preset runs).

**⚠️ Important — React internal keys**: The `mockReactInternalKeys` set in `jest.setup.ts` lists known React reconciler internal string keys that must return `undefined` silently. If you upgrade the Expo SDK and tests start throwing `[jest.setup.ts] react-native — unstubbed access: "__reactInternalMemoized*"`, add the new key to that set and update the version comment.

**⚠️ Important — console.error suppression**: `jest.setup.ts` suppresses `console.error` output that matches expected error-path patterns (e.g., "AsyncStorage: error", "[repository] save failed"). This is intentional — it keeps the test output clean when deliberately exercising error branches. Do not remove these suppressions; do not add new ones for non-error-path noise.

---

### Layer 4 — Individual Test Files

**Purpose**: Mock only the direct dependencies of the module under test (repositories, services).

**Rules**:
- ✅ Mock repositories and services that the module under test calls
- ✅ Use `jest.fn()` stubs with named `const` variables (prefixed with `mock`)
- ✅ Call `jest.clearAllMocks()` in `beforeEach`
- ✅ Call `__resetStore()` in `beforeEach` for any test that uses AsyncStorage
- ❌ Never mock `react-native`, `Platform`, or `@react-native-async-storage/async-storage` here — they are already handled by Layers 2–3
- ❌ Never use `jest.spyOn` on a module that is already fully mocked

**Variable naming rule**: Variables referenced inside `jest.mock()` factory functions **must** be prefixed with `mock` (Jest hoists `jest.mock()` before `const` declarations — only `mock`-prefixed names are in scope at hoist time).

```ts
// ✅ Correct
const mockSave = jest.fn().mockResolvedValue(undefined);
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: { save: mockSave },
}));

// ❌ Wrong — save is undefined at hoist time
const save = jest.fn();
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: { save }, // ReferenceError at runtime
}));
```

---

## AsyncStorage: `__resetStore()` Pattern

The AsyncStorage mock is a stateful in-memory store. Always reset it between tests:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
const { __resetStore } = AsyncStorage as any;

beforeEach(() => {
  __resetStore(); // wipes all keys
  jest.clearAllMocks();
});
```

**⚠️ Web-platform tests**: When a module under test writes to AsyncStorage in a `beforeAll`/`beforeEach` setup (e.g., `AuthRepository` seeding the web credential store), do **not** call `__resetStore()` inside the web-platform `beforeEach` — it will wipe the store that the module just wrote to. Reset only in `afterAll` or at the very beginning of `beforeAll`.

---

## NetInfo: `__setConnected()` Pattern

The NetInfo mock defaults to **online (wifi)**. Override it in tests that verify offline behaviour:

```ts
import NetInfo from '@react-native-community/netinfo';
const { __setConnected, __reset } = NetInfo as any;

beforeEach(() => __reset());   // restore to online before each test

it('queues action when offline', async () => {
  __setConnected(false);
  // ... test offline logic ...
});
```

---

## Platform OS: `setPlatformOS()` Pattern

Modules that branch on `Platform.OS` (e.g., `AuthRepository` skipping biometrics on web) expose a test-only setter:

```ts
import { setPlatformOS } from '../repositories/AuthRepository';

beforeEach(() => setPlatformOS('ios')); // restore default
afterAll(() => setPlatformOS('ios'));

it('skips biometrics on web', () => {
  setPlatformOS('web');
  // ... test the web branch ...
});
```

**Rule**: Only use `setPlatformOS()` on modules that explicitly export it. Never mutate `Platform.OS` directly on the `react-native` mock — the Layer 3 Proxy will throw.

---

## File Locations

```
project root/
├── jest.config.js         ← Layer 2 config, coverage thresholds
├── jest.setup.ts          ← Layer 3 behavioral mocks
├── jest.polyfill.js       ← Layer 1 global polyfills
├── __mocks__/
│   ├── expo-modules-core.js
│   ├── expo-notifications.js         ← includes AndroidImportance
│   ├── expo-print.js
│   ├── expo-sharing.js
│   ├── expo-secure-store.js
│   ├── expo-local-authentication.js
│   ├── expo-constants.js             ← IS_EXPO_GO = false
│   ├── expoFetch.js
│   ├── expoFetchModule.js
│   ├── @react-native-async-storage/
│   │   └── async-storage.js          ← stateful in-memory store
│   └── @react-native-community/
│       └── netinfo.js                ← stateful, supports __setConnected()
└── src/
    ├── __mocks__/
    │   └── expo-file-system-legacy.ts
    └── __tests__/
        ├── repositories/             ← AgendaRepository, ApprovalRepository,
        │                                AuthRepository, FacilityRepository,
        │                                InspectionRepository, SettingsRepository, …
        ├── utils/                    ← dateUtils, fileUtils, inspectionUtils,
        │                                statsUtils
        ├── BackupService.test.ts
        ├── CapNotificationService.test.ts
        ├── CapReportService.test.ts
        ├── CriteriaPreviewStore.test.ts
        ├── IntegrityService.test.ts
        ├── NotificationService.test.ts
        ├── PhotoService.test.ts
        ├── SyncService.test.ts
        ├── briefService.test.ts
        ├── facilitiesService.test.ts
        ├── followUpService.test.ts
        ├── geofencingService.test.ts
        ├── loadHomeData.test.ts
        ├── pdfService.test.ts
        ├── scoringUtils.test.ts
        ├── statusUtils.test.ts
        ├── useChecklistData.test.ts
        ├── useCollapsibleSections.test.ts
        ├── useHomeData.test.ts
        ├── useInspectionList.test.ts
        └── useSignature.test.ts
```

**Rule**: All tests live under `src/__tests__/`. Do not place test files anywhere else. One test file per source module — never duplicate a test file at the root and inside a subdirectory.

---

## Coverage

Run `npx jest --coverage` to see the full report. The following are **intentionally excluded** from coverage (no logic to test):

- `src/types.ts` — TypeScript type definitions only
- `src/criteria/**` — static inspection criteria data arrays
- `src/criteriaData.ts`, `src/facilitiesData.ts`, `src/facilityCategories.ts` — static data
- `src/i18n/**` — translation string maps
- `src/app/**` — Expo Router UI screens (cover with E2E tests)
- `src/repositories/index.ts`, `src/utils/index.ts`, `src/constants/index.ts` — barrel re-exports only

Current **enforced thresholds** (last measured actuals: branches 79.73 / functions 97.42 / lines 95.21 / stmts 93.66):

| Metric | Threshold | Last measured |
|---|---|---|
| Branches | 79% | 79.73% |
| Functions | 97% | 97.42% |
| Lines | 95% | 95.21% |
| Statements | 93% | 93.66% |

Thresholds are set ~1 point below the last measured actual to block regressions while allowing minor natural fluctuation. **Update both the threshold in `jest.config.js` and the table above whenever you raise them.**

---

## CI

Tests run automatically on every push and pull request via GitHub Actions (`.github/workflows/test.yml`). The workflow:
1. Installs dependencies with `npm ci`
2. Runs `npx jest --coverage --ci`
3. Uploads the coverage report as a build artifact (14-day retention)

A PR cannot be merged if tests fail or coverage drops below the thresholds.
