# SafeInspect-APP — Session Handover

> Last updated: 2026-07-14
> Repo: `belabedmohamedins-tech/SafeInspect-APP`
> Stack: React Native + Expo, Jest + --experimental-vm-modules, TypeScript, AsyncStorage, EAS Build

---

## ✅ CHECKLIST REWORK COMPLETE — All 5 Phases Done

> **Tests are still deferred.** The criteria files are stable now, but do NOT start Jest coverage until you decide to begin the coverage sprint.
> See the Coverage section below for priority order when ready.

**Full implementation spec:** [`Perplexity_Implementation_Spec.md`](./Perplexity_Implementation_Spec.md)

---

## 🏗️ Architecture in 30 seconds

```
src/
├── __mocks__/          L2 mocks — native modules → mock implementations
├── __tests__/          All test files (flat + components/ + repositories/ + utils/ subdirs)
├── components/         React Native UI components (5 files, historically 0% coverage)
├── criteria/           Inspection criteria data files (one per facility type, pure data)
├── repositories/       DB repository layer
├── services/           Business logic (pdfService, serverAuth, CapNotificationService…)
├── utils/              Pure utility functions
├── criteriaData.ts     Maps facility type → criteria array
├── facilitiesData.ts   Static facility list
└── types.ts            All shared TypeScript types
```

### 4-Layer Mock System
| Layer | File | Purpose |
|---|---|---|
| L1 | `jest.polyfill.js` | Global polyfills |
| L2 | `moduleNameMapper` in jest.config.js | Native modules → `__mocks__/` |
| L3 | `jest.setup.ts` | Behavioral overrides + console suppression |
| L4 | Individual test files | Domain-specific mocks only |

**Critical mapper order**: `expo-secure-store` and `expo-local-authentication` MUST appear before `expo-modules-core` — changing this order silently breaks `getItemAsync` across all auth tests.

---

## 📋 Checklist Rework — Phase Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Remove legacy duplicate blocks (abattoir, uab, couvrir, upd) | ✅ Done |
| Phase 2 | Correct 3 confirmed legal citations | ✅ Done |
| Phase 3 | Merge duplicated shared-module content (license dedup, pest control, food-safety near-duplicates) | ✅ Done |
| Phase 4 | Add new criteria for confirmed gaps | ✅ Done |
| Phase 5 | Typing/evidence-standard fixes | ✅ Done |

### What was done — full summary

**Phase 1** — Removed legacy numeric series from 4 files:
- `abattoirCriteria.ts` — IDs `04-01…04-11`
- `uabCriteria.ts` — IDs `01-01…01-12`
- `couvoirCriteria.ts` — IDs `02-01…02-11`
- `updCriteria.ts` — IDs `03-01, 03-03…03-10` (03-02 kept and renamed → Phase 4)

**Phase 2** — Citation fixes:
- `gplCriteria.ts` — `04-409` → `21-430` (8 criteria), `09-410` → `09-335` (1 criterion)
- `uabCriteria.ts` — `09-410` → `09-335` on `UAB-AX1-04`
- `printingCriteria.ts` — removed `04-409` from `PRT-03-03`

**Phase 3** — Shared-module consolidation:
- Upgraded `BGN-01-01` (operating license) as single authoritative check; removed 12 facility-specific duplicates
- Upgraded `BGN-07-02` with trap-map/intervention-log detail; removed pest duplicates from 6 files; kept `UPD-AX8-03` (biosecurity) and `ABT-AX10-01`
- Removed food-safety near-duplicates: `CLD-17-02–05`, `BAK-10-07`; modified `BAK-10-08`

**Phase 4** — New criteria added:
- `BGN-08-04` — electrical safety (baseGeneralCriteria)
- `BGN-08-05` — fire alarm / smoke detection (baseGeneralCriteria)
- `BGN-09-01` — occupational noise with numericField (baseGeneralCriteria)
- `BGN-01-03` — anti-obstruction / illegal operation (baseGeneralCriteria)
- `BLS-04-05` — machine guard / emergency stop (blacksmithCriteria)
- `UPD-AX2-03` — siting distance from residential clusters (updCriteria) ⚠️ distance placeholder — legal verification needed before using in production
- `BFD-08-01` — traceability register (baseFoodCriteria); `CLD-17-07` and `PRD-05-02` removed
- `ABT-AX9-01` — HACCP plan (abattoirCriteria)
- `SLH-06-01` — HACCP plan (slaughterhouseSmallCriteria)
- `CLD-18-01` — HACCP plan (coldRoomCriteria)
- `BFD-05-01` — citation precision fix (baseFoodCriteria)
- `UAB-AX8-02` — removed (merged into `BGN-01-03`)

**Phase 5** — `UAB-AX7-04` `controlType`: `visual` → `doc`

---

## ✅ Post-Rework Verification Checklist

Run these to confirm everything is clean — grep/TypeScript checks only, NOT Jest tests:

```bash
# TypeScript check (no "build" script in this Expo project — use tsc directly)
npx tsc --noEmit

# Legacy series fully gone
grep -rn "id: '04-\|id: '01-\|id: '02-\|id: '03-'" \
  src/criteria/abattoirCriteria.ts src/criteria/uabCriteria.ts \
  src/criteria/couvoirCriteria.ts src/criteria/updCriteria.ts
# Expected: zero matches (UPD-AX2-03 is fine — different prefix)

# Bad citations fully gone
grep -rn "04-409\|09-410" src/criteria/*.ts
# Expected: zero matches

# No duplicate IDs
node -e "
const d = require('./src/criteriaData').criteriaData;
Object.entries(d).forEach(([k,v]) => {
  const ids = v.map(c => c.id);
  const uniq = [...new Set(ids)];
  if (ids.length !== uniq.length) console.log('DUPLICATE in', k);
});
"
```

---

## 📊 Coverage — Ready to start when you say so

Last known state: ~74% statements (target 95%). Regression from new July 2026 features shipped without tests.

### Priority order

1. **`CapNotificationService`** — broken mock on `getStats`. Fix: add `CorrectiveActionRepository.getStats = jest.fn().mockResolvedValue({...})` in test `beforeEach`
2. **`serverAuth.ts`** — ~12% statements. Lines 23–205 uncovered. Read fully before writing.
3. **`CorrectiveActionRepository.ts` lines 135–210** — bulk ops / stats. Unblocks #1.
4. **`pdfService.ts` lines 751–1143** — `expo-print` already mocked at L2.
5. **`decisionSupport.ts`** — 55% statements, lines 104–164. Complex branches, read first.
6. **`src/components/`** — 0% coverage, needs React Testing Library. Already in `devDependencies` (`@testing-library/react-native`).

### Thresholds (do NOT lower)
| Metric | Target |
|---|---|
| Statements | 95% |
| Branches | 83% |
| Functions | 97% |
| Lines | 96% |

---

## ⚠️ Known Traps

- **`.env` is committed to git** — secrets are exposed. Do NOT add new secrets.
- **jest.config.js mapper order** — `expo-secure-store` and `expo-local-authentication` MUST come before `expo-modules-core`. Reordering silently breaks all auth tests.
- **AsyncStorage timing** — never call `__resetStore()` in `beforeEach` when storage is seeded in `beforeAll`.
- **Timezone-safe dates** — never hardcode expected date strings. Compute dynamically from the same `Date` object.
- **TESTING.md is stale** — claims "zero uncovered files". Ignore it. The coverage report is the truth.
- **Threshold trap** — thresholds are now failing (~74% statements). Do NOT lower them without user confirmation.
- **`UPD-AX2-03` placeholder** — the siting-distance figure is bracketed and needs legal verification before the app goes to production inspectors.

---

## 🗂️ Test File Inventory (for when coverage resumes)

| Test File | Source File | Notes |
|---|---|---|
| `CapNotificationService.test.ts` | `services/CapNotificationService.ts` | Mock bug on `getStats` |
| `CorrectiveActionRepository.test.ts` | `repositories/CorrectiveActionRepository.ts` | Lines 135–210 uncovered |
| `serverAuth.test.ts` | `services/serverAuth.ts` | Shallow — most of file uncovered |
| `pdfService.test.ts` | `services/pdfService.ts` | Lines 751–1143 missing |
| `decisionSupport.test.ts` | `utils/decisionSupport.ts` | 55% stmts, needs edge cases |
| `useChecklistData.test.ts` | `hooks/useChecklistData.ts` | 39KB — large |
| `loadHomeData.test.ts` | loadHomeData util | 13KB |
| `utils.test.ts` | multiple utils | 24KB |
| `BackupService.test.ts` | `services/BackupService.ts` | 18KB |
| `SyncService.test.ts` | `services/SyncService.ts` | 13KB |

---

## 📁 Criteria Files — Status

> ✅ Rework complete. Stable. Safe to write tests for these files now.

`InspectionItem` type shape (current):
```ts
{
  id: string;
  axis: string;
  category: string;
  criteria: string;
  legalReference: string;
  severity: 'high' | 'medium' | 'low';
  controlType: 'doc' | 'visual' | 'measurement';
  complianceStatus: 'not-evaluated';
  numericField?: {
    labelAr: string;
    unit: string;
    min: number;
    max: number;
    warningMax?: number;
    step: number;
  };
}
```

---

## 🚀 Working Method

1. User gives short instruction
2. AI reads actual source file first — never assumes structure
3. AI pushes changes directly to repo via MCP tools
4. User runs verification locally to confirm
5. Confirm before moving to next file
6. Always on branch `main` unless user says otherwise

---

## 🔑 Key Commands

```bash
npx tsc --noEmit                                     # TypeScript check (no build script in this project)
npm run test:coverage                                # Full coverage run
npm run test:coverage -- --testPathPattern=CapNotif  # Single file
npm test                                             # All tests, no coverage
npm run lint                                         # Expo lint
```
