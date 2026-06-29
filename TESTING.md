# SafeInspect — Test Suite Reference

> **Last updated:** commit `ad94e33` — `schema.test.ts` + `syncEngine.test.ts` added  
> **Total test files:** 26 · **Total tests:** ~280

---

## Coverage Targets

| Metric | Threshold (enforced) | Last measured actual |
|---|---|---|
| Branches | 81 | ~82 |
| Functions | 97 | ~97 |
| Lines | 95 | ~95 |
| Statements | 94 | ~94 |

**Rule:** when you raise a threshold, update both the `coverageThreshold` block in
`jest.config.js` **and** the table above. Keep them in sync.

To check current actuals:
```bash
npx jest --coverage --coverageReporters=text-summary
```

---

## Mock Architecture — 4 Layers

```
L1  jest.polyfill.js          global polyfills (TextEncoder, structuredClone)
L2  moduleNameMapper          redirect native imports → __mocks__/
L3  jest.setup.ts             behavioral overrides (react-native Proxy, console suppression)
L4  test files                domain-specific mocks only
```

### Layer 2 Mock Map

| Module | Mock file | Notes |
|---|---|---|
| `@react-native-async-storage/async-storage` | `__mocks__/@react-native-async-storage/async-storage.js` | In-memory store; `__resetStore()` in `beforeEach` |
| `@react-native-community/netinfo` | `__mocks__/@react-native-community/netinfo.js` | Default: online. Override per-test with `addEventListener` spy |
| `expo-modules-core` | `__mocks__/expo-modules-core.js` | Must come AFTER secure-store + local-auth in mapper |
| `expo-secure-store` | `__mocks__/expo-secure-store.js` | Must be mapped BEFORE expo-modules-core |
| `expo-local-authentication` | `__mocks__/expo-local-authentication.js` | Must be mapped BEFORE expo-modules-core |
| `expo-constants` | `__mocks__/expo-constants.js` | Overrides jest-expo default; sets `IS_EXPO_GO = false` |
| `expo-print` | `__mocks__/expo-print.js` | Stubs `printToFileAsync` |
| `expo-sharing` | `__mocks__/expo-sharing.js` | Stubs `shareAsync` |
| `expo-notifications` | `__mocks__/expo-notifications.js` | Stubs scheduling + permission APIs |
| `expo-file-system/legacy` | `src/__mocks__/expo-file-system-legacy.ts` | Stubs `readAsStringAsync`, `writeAsStringAsync`, `deleteAsync` |
| `expo/src/winter/fetch/ExpoFetchModule` | `__mocks__/expoFetchModule.js` | Winter fetch shim |
| `expo/src/winter/fetch(.*)` | `__mocks__/expoFetch.js` | Winter fetch shim |

**Ordering constraint:** `expo-secure-store` and `expo-local-authentication` must appear
before `expo-modules-core` in `moduleNameMapper`, otherwise `getItemAsync` etc. resolve
to undefined stubs.

`expo-constants` overrides the jest-expo preset default so that `IS_EXPO_GO` is `false`
in all tests (matches production build behaviour).

**`src/db/` modules** (`schema.ts`, `syncEngine.ts`) require no additional Layer 2 mocks.
`AsyncStorage` is already mapped, and `SyncService` is mocked at Layer 4 in
`syncEngine.test.ts` via `jest.mock('../services/SyncService', ...)`.  
NetInfo is already mapped at Layer 2 and additionally captured as a listener spy
within `syncEngine.test.ts` — see the *NetInfo listener pattern* section below.

---

## `console.error` Suppression

`jest.setup.ts` suppresses specific React Native `console.error` calls that are
intentional test noise (e.g. act() warnings, missing prop warnings). These suppressions
are **intentional** and must not be removed. If a new warning appears that is unrelated
to the code under test, add a targeted suppression in `jest.setup.ts` with a comment.

---

## Special Test Patterns

### `AsyncStorage.__resetStore()` — Web Platform Warning

Do **not** call `AsyncStorage.__resetStore()` inside `beforeEach` when the module seeds
storage during `beforeAll`. On the web platform the AsyncStorage mock is initialised
asynchronously; calling `__resetStore()` in `beforeEach` clears the seeded data before
the test body runs, causing false failures.

### `setPlatformOS()` — Platform.OS Injection

`AuthRepository` tests inject the platform via a `setPlatformOS(os)` helper exported
from the module. Do **not** mutate `Platform.OS` directly — Jest does not reset object
property mutations between tests, causing cross-test contamination.

### `jest.useFakeTimers()` — Interval-Based Schedulers (`syncEngine.test.ts`)

`startSyncScheduler()` uses `setInterval`. Tests that verify flush-call counts must:
1. Call `jest.useFakeTimers()` in `beforeEach`.
2. Call `jest.useRealTimers()` in `afterEach`.
3. Advance time with `jest.advanceTimersByTime(ms)`.
4. `await Promise.resolve()` after advancing to drain the microtask queue
   so the async `safeFlush` body has run before the assertion.

### NetInfo Listener Capture (`syncEngine.test.ts`)

`startSyncScheduler()` registers a NetInfo `addEventListener` callback to detect
`offline → online` transitions. Tests capture this callback by storing it in a
closed-over `_netInfoListener` variable inside the `jest.mock` factory, then fire
connectivity events directly:

```ts
// In mock factory:
let _netInfoListener = null;
jest.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: jest.fn((cb) => {
      _netInfoListener = cb;
      return mockUnsubscribe;
    }),
  },
}));

// In test — after awaiting two Promise.resolve() ticks for the dynamic import:
_netInfoListener({ isConnected: false, isInternetReachable: false }); // offline
_netInfoListener({ isConnected: true,  isInternetReachable: true  }); // back online
await Promise.resolve(); // drain safeFlush microtask
expect(mockFlush).toHaveBeenCalledTimes(1);
```

Two `await Promise.resolve()` ticks are needed before asserting the listener is
registered because `startSyncScheduler()` uses a **dynamic `import()`** for NetInfo
(to avoid crashing when the module is absent), which resolves asynchronously.

### `process.env` + `jest.resetModules()` for URL-Toggled Branches

Modules that read `process.env.EXPO_PUBLIC_SYNC_API_URL` lazily (inside function
bodies, not at module load time) can be toggled per-test without
`jest.resetModules()`. Modules that read the env at load time require:

```ts
beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_SYNC_API_URL: 'https://api.test' };
  jest.resetModules();
});
afterEach(() => {
  process.env = ORIGINAL_ENV;
});
const { startSyncScheduler } = require('../db/syncEngine'); // fresh module
```

---

## File Tree

```
src/__tests__/
├── repositories/
│   ├── AgendaRepository.test.ts
│   ├── ApprovalRepository.test.ts
│   ├── AuditLogRepository.test.ts
│   ├── AuthRepository.test.ts
│   ├── CorrectiveActionRepository.test.ts
│   ├── FacilityRepository.test.ts
│   ├── InspectionRepository.test.ts
│   ├── NotificationRepository.test.ts
│   └── SettingsRepository.test.ts
├── utils/
│   └── fileUtils.test.ts
├── BackupService.test.ts
├── CapNotificationService.test.ts
├── CapReportService.test.ts
├── CriteriaPreviewStore.test.ts
├── IntegrityService.test.ts
├── NotificationService.test.ts
├── PhotoService.test.ts
├── SyncService.test.ts
├── briefService.test.ts
├── criteriaData.test.ts
├── facilitiesService.test.ts
├── followUpService.test.ts
├── geofencingService.test.ts
├── loadHomeData.test.ts
├── pdfService.test.ts
├── schema.test.ts          ← NEW: src/db/schema.ts (9 tests)
├── scoringUtils.test.ts
├── statsUtils.test.ts
├── statusUtils.test.ts
├── syncEngine.test.ts      ← NEW: src/db/syncEngine.ts (11 tests)
├── useChecklistData.test.ts
├── useCollapsibleSections.test.ts
├── useHomeData.test.ts
├── useInspectionList.test.ts
└── useSignature.test.ts
```

---

## Layer 1 Checklist (all ✅ complete)

| Item | Status |
|---|---|
| `getDrafts` bug — excluded `completed` from draft filter | ✅ |
| `COMPLETION_GATE = 0.85` — 85% gate enforced | ✅ |
| Mandatory photo for high-severity non-compliant items | ✅ |
| Integrity hash on every first completion (`IntegrityService`) | ✅ |
| Audit log on save / delete / bulk-delete | ✅ |
| CAP auto-created on completion (`CorrectiveActionRepository`) | ✅ |
| Approval queue enqueued on completion (`ApprovalRepository`) | ✅ |
| Follow-up auto-scheduled on completion (`followUpService`) | ✅ |
| PIN lock + biometric gate (`AuthRepository` + `app/index.tsx`) | ✅ |
| Mock architecture — 4-layer contract documented and enforced | ✅ |
| Coverage thresholds locked in `jest.config.js` | ✅ |

## Layer 2 Checklist

| Item | Status |
|---|---|
| `src/db/schema.ts` — `initializeDatabase()` | ✅ |
| `src/db/syncEngine.ts` — `startSyncScheduler()` | ✅ |
| `schema.test.ts` — 9 tests | ✅ |
| `syncEngine.test.ts` — 11 tests | ✅ |
| Coverage thresholds raised to new baseline | ✅ |
