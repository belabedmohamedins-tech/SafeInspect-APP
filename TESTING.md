# SafeInspect — Test Suite Reference

> **Last updated:** July 2026 — coverage raised to 97.98% stmts, RTL component tests added  
> **Total test files:** 114 · **Total tests:** ~2468

---

## Coverage Targets

| Metric | Threshold (enforced) | Last measured actual |
|---|---|---|
| Statements | 97 | 97.98 |
| Branches | 90 | 91.55 |
| Functions | 99 | 99.5 |
| Lines | 98 | 99.05 |

**Rule:** when you raise a threshold, update both the `coverageThreshold` block in
`jest.config.js` **and** the table above. Keep them in sync.

To check current actuals:
```bash
npx jest --coverage --coverageReporters=text-summary
```

---

## Coverage Audit — All Gaps Closed (July 2026)

Full cross-check of `collectCoverageFrom` sources vs test inventory:

| Directory | Source files measured | Test files | Status |
|---|---|---|---|
| `src/services/` | 14 | 14 | ✅ |
| `src/repositories/` | 9 | 9 | ✅ |
| `src/hooks/` | 5 | 5 | ✅ |
| `src/utils/` | 6 (index.ts excluded) | 6 | ✅ |
| `src/stores/` | 1 | 1 | ✅ |
| `src/db/` | 2 | 2 | ✅ |
| `src/` root | 1 (`facilitiesService.ts`) | 1 | ✅ |

**Excluded from coverage** (intentional, set in `jest.config.js`):
`types.ts`, `criteria/**`, `criteriaData.ts`, `facilitiesData.ts`,
`facilityCategories.ts`, `i18n/**`, barrel `index.ts` files, `app/**`,
`__tests__/**`, `__mocks__/**`, `components/**`, `services/pdfService.ts`.

> `components/**` is excluded from the *coverage threshold* but is tested via RTL
> (see Component Tests section below). `pdfService.ts` is excluded due to expo-print
> rendering complexity — it has a standalone smoke-test file.

---

## Component Tests (RTL)

`src/components/` is excluded from the coverage threshold but every component
should have an RTL test.

| Component | Test file | Tests | Status |
|---|---|---|---|
| `RepeatViolationBadge.tsx` | `src/__tests__/components/RepeatViolationBadge.test.tsx` | 5 | ✅ |
| `DiffStatusIndicator.tsx` | `src/__tests__/components/DiffStatusIndicator.test.tsx` | 9 | ✅ |
| `DifferentialBanner.tsx` | — | — | ⏸ deferred — write after checklist rework |
| `NumericInputField.tsx` | — | — | ⏸ deferred — write after checklist rework |
| `DecisionSupportPanel.tsx` | — | — | ⏸ deferred — write after checklist rework |

> **Note:** the three deferred components above are being reworked as part of the
> checklist overhaul (`Perplexity_Implementation_Spec.md`). Write their tests only
> after that rework is merged — testing a moving target wastes effort and produces
> brittle specs.

**Pattern for new component tests (use when deferred items are ready):**
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MyComponent } from '../../components/MyComponent';

describe('MyComponent', () => {
  it('renders nothing when not visible', () => {
    const { toJSON } = render(<MyComponent visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('renders content when visible', () => {
    render(<MyComponent visible={true} label="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
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

**`src/utils/dateUtils.ts` and `src/utils/inspectionUtils.ts`** are pure functions with
no native dependencies — no `jest.mock()` is required in their test files.

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
closed-over `_netInfoListener` variable inside the `jest.mock` factory:

```ts
let _netInfoListener = null;
jest.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: jest.fn((cb) => {
      _netInfoListener = cb;
      return mockUnsubscribe;
    }),
  },
}));

// Fire connectivity events directly in tests:
_netInfoListener({ isConnected: false, isInternetReachable: false });
_netInfoListener({ isConnected: true,  isInternetReachable: true  });
await Promise.resolve();
expect(mockFlush).toHaveBeenCalledTimes(1);
```

Two `await Promise.resolve()` ticks are needed before asserting the listener is
registered because `startSyncScheduler()` uses a dynamic `import()` for NetInfo.

### Timezone-Safe Date Assertions (`dateUtils.test.ts`)

`formatDateTimeShort` uses `Date` local-time getters (`getFullYear`, `getMonth`, etc.).
Test assertions must mirror the same local-time math — never hardcode the expected
string, because the UTC ISO input resolves to different local times depending on the
CI runner's timezone. Pattern:

```ts
function expectedShort(iso: string): string {
  const d = new Date(iso);
  const y  = d.getFullYear();
  const mo = (d.getMonth() + 1).toString().padStart(2, '0');
  const dy = d.getDate().toString().padStart(2, '0');
  const h  = d.getHours().toString().padStart(2, '0');
  const mi = d.getMinutes().toString().padStart(2, '0');
  return `${y}-${mo}-${dy} ${h}:${mi}`;
}

it('formats correctly', () => {
  const iso = '2026-03-15T14:30:00.000Z';
  expect(formatDateTimeShort(iso)).toBe(expectedShort(iso)); // ✅ TZ-safe
});
```

For `formatDateLong`, `formatDateOnly`, and `formatDateForAgenda` (which use
`toLocaleDateString`), assert structural properties (non-empty, contains year,
no time colon) rather than exact locale strings — locale rendering differs between
Node.js ICU builds.

### `process.env` + `jest.resetModules()` for URL-Toggled Branches

Modules that read `process.env.EXPO_PUBLIC_SYNC_API_URL` lazily (inside function
bodies) can be toggled per-test without `jest.resetModules()`. Modules that read the
env at load time require:

```ts
beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_SYNC_API_URL: 'https://api.test' };
  jest.resetModules();
});
afterEach(() => { process.env = ORIGINAL_ENV; });
const { startSyncScheduler } = require('../db/syncEngine');
```

---

## File Tree

```
src/__tests__/
├── components/
│   ├── RepeatViolationBadge.test.tsx  ← NEW: 5 RTL tests
│   └── DiffStatusIndicator.test.tsx   ← NEW: 9 RTL tests
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
│   ├── dateUtils.test.ts
│   ├── fileUtils.test.ts
│   └── inspectionUtils.test.ts
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
├── schema.test.ts
├── scoringUtils.test.ts
├── statsUtils.test.ts
├── statusUtils.test.ts
├── syncEngine.test.ts
├── useChecklistData.test.ts
├── useCollapsibleSections.test.ts
├── useHomeData.test.ts
├── useInspectionList.test.ts
└── useSignature.test.ts
```

---

## Historical Milestones

| Date | Event |
|---|---|
| June 2026 | Layer 1 & 2 complete — 785 tests, thresholds locked at stmts 95 |
| July 12 2026 | Coverage regression detected — new service files added without tests |
| July 13 2026 | Regression closed — 2454 tests, thresholds raised to stmts 97 / branches 90 / funcs 99 / lines 98 |

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

## Layer 2 Checklist (all ✅ complete)

| Item | Status |
|---|---|
| `src/db/schema.ts` — `initializeDatabase()` | ✅ |
| `src/db/syncEngine.ts` — `startSyncScheduler()` | ✅ |
| `schema.test.ts` — 9 tests | ✅ |
| `syncEngine.test.ts` — 11 tests | ✅ |
| Coverage thresholds raised to new baseline | ✅ |

## July 2026 Coverage Closure

| Item | Status |
|---|---|
| All service gaps closed | ✅ |
| `serverAuth.ts` — 98.21% stmts | ✅ |
| `decisionSupport.ts` — 100% | ✅ |
| `violationHistory.ts` — 100% | ✅ |
| Thresholds raised to stmts 97 / branches 90 / funcs 99 / lines 98 | ✅ |
| RTL component tests introduced (`RepeatViolationBadge`, `DiffStatusIndicator`) | ✅ |
| TESTING.md fully reflects current file tree and patterns | ✅ |
