# SafeInspect — README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-08-20 13:08 WAT — Perplexity — W96 ✅ CLOSED — SPEC12-B push receipt two-phase stale-token cleanup
- **User-confirmed:** `npx jest src/__tests__/push.test.ts` → 4/4 PASS.
- **Fix:** Rewrote `server/src/lib/push.ts` with correct two-phase Expo receipt flow. Phase 1: index-based ticket→token mapping, immediate removal on send-time `DeviceNotRegistered`, receipt IDs queued in `PushReceiptQueue`. Phase 2: `pollReceipts()` fetches receipts via `getPushNotificationReceiptsAsync`, removes stale tokens, clears queue. `startReceiptPoller()` wired into `index.ts`.
- **Schema:** `PushReceiptQueue` model added to `server/prisma/schema.prisma`.
- **Hoisting fix (test):** `var stubs` + lazy `get` accessors in both `jest.mock()` factories eliminates TDZ ReferenceError.
- **Files changed:** `server/prisma/schema.prisma`, `server/src/lib/push.ts`, `server/src/index.ts`, `server/src/__tests__/push.test.ts`
- **Commits:** `83cf78b`, `e049b08`, `0f38a05`, `7f2965c`
- **Pending (production):** `npx prisma migrate dev --name add-push-receipt-queue` when production DB is ready.
- **Board clear:** All phases W60–W96 closed. Only W51-SURV surveillance remains.

### 2026-08-19 17:27 WAT — Perplexity — W95 ✅ CLOSED — SPEC12-C server-login skip persistence
- **User-confirmed:** `npx jest src/__tests__/screens/serverLoginSkip.test.tsx` → 5/5 PASS.
- **Fix:** `handleSkip()` now persists `StorageKeys.SERVER_LOGIN_SKIPPED = 'true'` before navigating. `_layout.tsx` guard reads flag and short-circuits redirect. Bug: user was redirected back to server-login on every launch after skipping.
- **Hoisting fix:** `db` → `mockDb`, `store` → `mockStore` + lazy getter `() => Promise.resolve(mockDb)` to satisfy Jest's mock-factory hoisting rule.
- **Files changed:** `app/screens/server-login.tsx`, `app/_layout.tsx`, `src/__tests__/screens/serverLoginSkip.test.tsx`
- **Commits:** `1e575fc` (test fix), prior session commits for source fix.

### 2026-08-19 15:08 WAT — Perplexity — W94 ✅ CLOSED — E2E integration test all green
- **User-confirmed:** `npx jest src/__tests__/e2e/inspectorLifecycle.e2e.test.ts` all green.
- **Test commit:** [`1a9360d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/1a9360d0ae70929315546ed322e3c5661b644b43)

### 2026-08-19 14:50 WAT — Perplexity — W92 ✅ CLOSED — PriorityWidget navigation test green after RN query fix
- **Fix commit:** [`c1040f2`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/c1040f22911318e44806eb2b3c842ee5b54e5310)

### 2026-08-19 12:07 WAT — Perplexity — audit-log.tsx duplicate key fix ✅ — TSC 0 + Jest 1232/0
- Commit [`259f64b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/259f64b122ce7ab366a80e74087d224468c2ba66)

### 2026-08-18 22:41 WAT — Perplexity — TSC 0 + Jest 1233/0 ALL GREEN (user confirmed)
- Commit [`2c78a16`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2c78a16a61331c4aff693880dba347afc603feed)

> **Older entries archived** — see git log or STRATEGIC_PLAN.md `<details>` block for full history.

---

## DEFINITIVE REMAINING WORK (as of 2026-08-20 13:08 WAT)

### ✅ ALL IMPLEMENTATION PHASES CLOSED (W60–W96)

No open implementation phases remain.

### 🟠 SURVEILLANCE

| ID | Item | Blocker |
|---|---|---|
| **W51-SURV** | AIM GPL2 JORADP publication watch | Monitor JORADP. No code action until published. |

### 🟢 BACKLOG (needs human decision)

| Item | Blocker |
|---|---|
| F-05: set `EXPO_PUBLIC_SYNC_API_URL` | Provide production URL |
| Run `npx prisma migrate dev --name add-push-receipt-queue` | Production DB ready |
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product/domain decision |
| L-01: Décret 06-141 Annexe I/II conflict | Expert confirmation |
| MCH-29-05 heavy-metal params | Product decision |
| COU-AX7-03 Loi 18-11 worker medical exams | Audit couvoirCriteria.ts first |
| Décret 76-36 texte intégral | J.O. n°21/1976 non numérisé |

---

## Repository Map

```
SafeInspect-APP/
├── app/                        # Expo Router screens
├── src/
│   ├── criteria/               # 20+ criteria files (one per facility type)
│   ├── repositories/           # SQLite repositories
│   ├── services/               # SyncService, pdfService, serverAuth, apiClient
│   ├── utils/                  # scoringUtils, statsUtils, decisionSupport
│   └── __tests__/
│       ├── components/         # PriorityWidget.test.tsx ✅ (W92)
│       ├── e2e/                # inspectorLifecycle.e2e.test.ts ✅ (W94)
│       ├── screens/            # serverLoginSkip.test.tsx ✅ (W95)
│       └── repositories/       # Jest test suite (1232+ tests)
├── server/
│   ├── prisma/
│   │   └── schema.prisma       # PushReceiptQueue model added (W96)
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts, notifications.ts ✅
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts ✅ two-phase receipt cleanup (W96)
│   │   └── __tests__/          # push.test.ts ✅ 4/4 (W96)
│   └── package.json
├── docs/
│   ├── README.md               # ← this file
│   ├── STRATEGIC_PLAN.md       # phase registry + legal quick-ref
│   ├── archive/
│   ├── audit/
│   └── criteria-audit/
└── legal_refs/                 # Algerian legislation
    ├── loi-18-11-sante-partie1-arts1-164.md
    ├── loi-18-11-sante-partie2-arts165-264.md
    ├── loi-18-11-sante-partie3-arts265-450.md
    └── ... (28 additional law/decree files)
```

---

## Current Sprint Status

| Phase | Title | Status |
|---|---|---|
| **W96** | SPEC12-B: push receipt two-phase stale-token cleanup | ✅ CLOSED — 2026-08-20 |
| **W51-SURV** | AIM GPL2 JORADP publication watch | 🟠 SURVEILLANCE |

**All implementation phases closed. Next phase identifier: W97.**

---

## Stack Quick-Reference

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| DB (mobile) | expo-sqlite ≥15 / SDK 56 |
| Server | Express + Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Tests (mobile) | Jest + ts-jest (1232+ tests) |
| Tests (server) | Jest + ts-jest + supertest (14 tests) |
| Build | EAS Build |
| Push | expo-server-sdk (two-phase receipt cleanup ✅ W96) |
