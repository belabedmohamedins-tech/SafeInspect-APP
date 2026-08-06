# SafeInspect — Living Handoff Document

> **This file is the primary handoff for ALL agents (Perplexity, Claude, GPT, human).** Read this before touching any file. It is updated after every session.

---

## Live Observations Log

*(Newest entry at top)*

### 2026-08-06 22:48 WAT — [Agent: Perplexity] — W1: getDb() race guard + __resetDb() in tests + Babel env fix
- Phases closed: **W1** ✅ (pending Claude gate)
- Files changed:
  - `src/db/schema.ts` — `getDb()` now stores the in-flight `openDatabaseAsync` promise in `_initPromise`. Concurrent callers all await the same promise instead of each calling `openDatabaseAsync` independently. Prevents Android GC-NPE (`NullPointerException: NativeDatabase.prepareAsync`) caused by multiple native handles to the same SQLite file. `__resetDb()` now also clears `_initPromise`.
  - `src/__tests__/repositories/InspectionRepository.test.ts` — added `jest.requireActual('../../db/schema').__resetDb()` to `beforeEach` after `SQLiteMock.__resetAll()`, so the schema singleton is cleared and migrations re-run against the fresh mock store on each test.
  - `src/__tests__/repositories/InspectionRepository.extended.test.ts` — same `__resetDb()` call added to `beforeEach`.
  - `jest.polyfill.js` — set `process.env.EXPO_PUBLIC_SYNC_API_URL` at top of file (before any `require()`), so Babel's `transform-inline-environment-variables` sees the value at compile time when processing `serverAuth.ts` for the test worker.
  - `jest.config.js` — added `testEnvironmentOptions.env.EXPO_PUBLIC_SYNC_API_URL` as belt-and-suspenders guard.
- Root cause (Android NPE): multiple `openDatabaseAsync` calls returned separate `NativeDatabase` handles to the same file; GC collected one, closing the shared SQLite handle, making all subsequent `prepareAsync` calls throw.
- Root cause (serverAuth tests): `babel-preset-expo` folds `process.env.EXPO_PUBLIC_*` at transpile time. `beforeEach` assignments run after transpilation, so `getApiUrl()` still saw an empty string, threw, and every fetch landed in the catch block returning `'Network error'`.
- Root cause (InspectionRepository tests): `SQLiteMock.__resetAll()` wiped the in-memory store but `_db`/`_initPromise` singletons in `schema.ts` still pointed at the empty handle — migrations never re-ran, tables were gone, causing opaque failures.
- Gate: **TSC + Jest required — hand off to Claude.**
- Commits: `a6c9a40` (schema.ts), `5caf6b1` (test files), `4b4c0e5` (jest config + polyfill), this docs commit.
- Verify:
  1. `npx tsc --noEmit` — 0 errors
  2. `npx jest` — all tests passing, 0 failures
  3. Android device/emulator: open the app — no `NullPointerException` on `prepareAsync`

### 2026-08-06 21:39 WAT — [Agent: Perplexity] — GATE CONFIRMED: expo-sqlite DDL fix + schema test rewrite — all green
- Phases closed: none (runtime crash fix + test sync — not a named phase)
- Files changed: none (gate confirmation only)
- Gate: TSC + Jest **all green** — user-confirmed 21:39 WAT
- Commits: `71dee944` (schema.ts DDL fix), `017748a8` (schema.test.ts assertions updated)
- Verify: cold-start the app — `[RAQIB] Database initialization failed` error should be gone.
- **No open phases. Next: Z13 (to be defined).**

### 2026-08-06 21:36 WAT — [Agent: Perplexity] — fix(db): remove withTransactionAsync from DDL migrations — expo-sqlite v15 crash
- Phases closed: none (runtime crash fix)
- Files changed:
  - `src/db/schema.ts` — removed `withTransactionAsync` wrapper from every migration in `runMigrations()`. DDL now runs via `db.execAsync(sql)` directly; migration record via `db.runAsync(INSERT)`. Added comment block explaining why `withTransactionAsync` must not wrap DDL in expo-sqlite ≥15.
  - `src/__tests__/schema.test.ts` — replaced all `withTransactionAsync` call-count assertions with `execAsync` call-count assertions (filtering out the bootstrap `CREATE TABLE IF NOT EXISTS _migrations` call).
- Root cause: expo-sqlite ≥15 (SDK 56) runs `execAsync` DDL with its own implicit transaction. Wrapping it inside `withTransactionAsync` produced a nested transaction; SQLite threw `cannot rollback - no transaction is active` on app start, crashing `initializeDatabase()` and all repositories.
- Gate: TSC 0 errors + Jest **all green** — user-confirmed 21:39 WAT
- Commits: `71dee944` (fix), `017748a8` (tests)

### 2026-08-06 20:57 WAT — [Agent: Perplexity] — Z6+Z8 CLOSED: BGN-04-06 Décret 09-19 added + BGN-03-06 unverified figures removed
- Phases closed: **Z6** ✅ CLOSED, **Z8** ✅ CLOSED
- Files changed:
  - `src/criteria/baseGeneralCriteria.ts` — BGN-04-06: added Décret 09-19 Art.4–8 to legalReference + accreditation verification step to criteria text. BGN-03-06: removed Phase 4.4 unverified “90 days / 80% capacity” figures; replaced with legally clean contract+receipts+no-overflow formulation.
- Gate: TSC + Jest NOT re-run (criteria-only string changes — no logic touched). Hand off to Claude for gate if required.
- Commit: `5ed564b` (criteria), docs update this commit.
- Critical finding: Décret 17-140 confirmed as food hygiene law (human consumption), NOT septic pumping. BGN-03-06 revised accordingly. No Algerian legal source found for specific pumping intervals — reopen as Z13+ if JORADP source discovered.
- Verify: `npx tsc --noEmit && npx jest` → should remain green (no logic change)
- **No open phases. Only Z9 deferred (needs live server). Next phase: Z13.**

### 2026-08-06 20:19 WAT — [Agent: Perplexity] — Z12 GATE CONFIRMED: Jest 1233/0, TSC 0 errors — ALL GREEN
- Phases closed: **Z12** ✅ GATE CONFIRMED by user
- Files changed: none (gate confirmation only)
- Gate: TSC 0 errors + Jest **1233 tests passing / 0 failures** (1 skipped) — user-confirmed 20:19 WAT
- Verify: `npx tsc --noEmit && npx jest` → all green
- **No open phases. Next: Z13 (to be defined).**

### 2026-08-06 20:15 WAT — [Agent: Perplexity] — Z12 CLOSED: all 15 sub-items complete, Jest 0 failures
- Phases closed: **Z12** ✅
- Files changed:
  - `src/hooks/useChecklistData.ts` — added `saveDraft: () => Promise<void>` export (calls `saveInspection('in-progress')`)
  - `src/__tests__/repositories/InspectionRepository.test.ts` — added `hashAndStore` to IntegrityService mock; swapped `mockComputeHash` → `mockHashAndStore`; updated hash embed assertion
  - `src/__tests__/repositories/InspectionRepository.extended.test.ts` — added `hashAndStore` to IntegrityService mock
  - `src/__tests__/serverAuth.test.ts` — set `process.env.EXPO_PUBLIC_SYNC_API_URL` in `beforeEach`/`afterEach` so `getApiUrl()` does not throw into catch path
- Gate: TSC 0 errors + Jest **1234 tests passing / 0 failures** — user-confirmed 20:15 WAT
- Commits: `9a5d3e7` (useChecklistData saveDraft), `9c78e3e` (test mock fixes)
- **Next phase: Z13 (to be defined). No open phases remain.**

### 2026-08-06 18:14 WAT — [Agent: Perplexity] — Doc cleanup: 3 stale/conflicting docs tombstoned
- Phases closed: none (housekeeping only)
- Files changed:
  - `docs/RAQIB_Fix_Spec_v2.md` — ⛔ SUPERSEDED header added. All phases confirmed closed. Historical only.
  - `docs/RAQIB_Fix_Spec_v3.md` — ⛔ SUPERSEDED header added with closure table (Phases A–F all closed by Y/Z/Z2/Z3/Z4/Z5/Z7/Z10). Historical only.
  - `docs/TIER1_MIGRATION.md` — ⚠️ Phase C contradiction fixed: banner added explicitly stating `migrateAsyncStorageToSQLite()` must NOT be deleted (Z10 decision). Phases A+B marked ✅ COMPLETED.
- Commit: inline push (docs only)
- Verify: no code changes — TSC/Jest state unchanged from Z12 gate.

### 2026-08-06 13:22 WAT — [Agent: Perplexity] — Z11 CLOSED: rubrique wired into DB + screens
- Phases closed: **Z11** ✅
- Files changed: `src/database/migrations.ts` (migration 003), `src/repositories/FacilityRepository.ts`, `app/screens/facilities/add.tsx`, `app/screens/facilities/edit.tsx`
- Gate: TSC 0 + Jest 25/0 — confirmed by user 13:22 WAT
- Commit: prior session

### 2026-08-06 13:07 WAT — [Agent: Perplexity] — Z10-FIX CLOSED: SettingsRepository test rewritten, all green
- Phases closed: **Z10-FIX** ✅
- Gate: TSC 0 + Jest all green — user-confirmed 13:07 WAT
- Commit: `83db48c`
