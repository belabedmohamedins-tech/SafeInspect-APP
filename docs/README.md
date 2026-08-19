# SafeInspect — README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-08-19 17:27 WAT — Perplexity — W95 ✅ CLOSED — SPEC12-C server-login skip persistence
- **User-confirmed:** `npx jest src/__tests__/screens/serverLoginSkip.test.tsx` → 5/5 PASS.
- **Fix:** `handleSkip()` now persists `StorageKeys.SERVER_LOGIN_SKIPPED = 'true'` before navigating. `_layout.tsx` guard reads flag and short-circuits redirect. Bug: user was redirected back to server-login on every launch after skipping.
- **Hoisting fix:** `db` → `mockDb`, `store` → `mockStore` + lazy getter `() => Promise.resolve(mockDb)` to satisfy Jest’s mock-factory hoisting rule.
- **Files changed:** `app/screens/server-login.tsx`, `app/_layout.tsx`, `src/__tests__/screens/serverLoginSkip.test.tsx`
- **Commits:** `1e575fc` (test fix), prior session commits for source fix.
- **SPEC12-E** confirmed clean same session — `syncEngine.ts` SHA `35605c9` already correct, no code change.
- **W96 OPEN** — SPEC12-B push receipt two-phase spec documented in STRATEGIC_PLAN.md.

### 2026-08-19 17:15 WAT — Perplexity — W95 🟡 PUSHED / PENDING USER VERIFICATION — SPEC12-C server-login skip persistence
- Fix applied (2 source files + test). Extension bug (`.test.ts` → `.test.tsx`) and jest.mock hoisting trap fixed before green.

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

## DEFINITIVE REMAINING WORK (as of 2026-08-19 17:27 WAT)

### 🔵 OPEN PHASE — Spec documented, not yet implemented

| ID | Severity | Item | Notes |
|---|---|---|---|
| **W96** | P2 | SPEC12-B: push receipt two-phase stale-token cleanup | Full spec in STRATEGIC_PLAN.md under W96. Server-only. Implement when ready. |

### ✅ CONFIRMED CLOSED

| Finding | Closed by | Verified |
|---|---|---|
| SPEC12-A — login rate-limit | W74 | Commit `33dc3b8` |
| SPEC12-B — push receipt two-phase (stale token cleanup) | W96 OPEN | Spec documented; code not yet written |
| SPEC12-C — server-login skip persistence | W95 | **5/5 Jest green — 2026-08-19 user-confirmed** |
| SPEC12-D server-side — notifications.ts route | W91 | SHA `ce797c2` |
| SPEC12-D client-side — registerPushToken res.ok | SPEC12-D commit | Commit `2fbd14b` |
| SPEC12-E — syncEngine.ts raw 'autoSync' string | Already clean | Direct read SHA `35605c9` |
| SPEC13 — PriorityWidget facilityId nav bug | W89 + W92 | Commits `d457a6a`, `a29675a`, `c1040f2` |
| F-01 | W87 | 2026-08-18 |
| F-02 | W87 | 2026-08-18 |
| F-03 | W87 | 2026-08-18 |
| F-04/F-07 | Z5 | 2026-08-09 |
| F-05/W90 | W61 | 2026-08-19 |
| F-08 | W38 | 2026-08-09 |
| F-09 | W28 | 2026-08-09 |
| F-10 | W40 | 2026-08-09 |
| F-11 | W52 | 2026-08-18 |
| F-12 | W5 | 2026-08-09 |
| F-13 | W39 | 2026-08-09 |
| F-14 | W27+W56 | 2026-08-09 |
| F-15 | W41 | 2026-08-09 |
| F-17 | W64 | 2026-08-18 |
| F-18 | W53 | 2026-08-18 |
| F-19 | W52 | 2026-08-09 |
| F-20 | W56 | 2026-08-18 |
| W89 PriorityWidget nav | W89 | 2026-08-18 |
| W91 notifications.ts | W91 | 2026-08-19 |
| BGN-10-01 art range | W41 commit `a71438b` | 2026-08-19 |
| W92 SPEC 13 test | W92 | 2026-08-19 |
| W93 UI gap audit | W93 | 2026-08-19 |
| W94 E2E lifecycle test | W94 | 2026-08-19 user-confirmed |
| W95 SPEC12-C skip persistence | W95 | 2026-08-19 user-confirmed |

### 🟢 BACKLOG (needs human decision)

| Item | Blocker |
|---|---|
| F-05: set `EXPO_PUBLIC_SYNC_API_URL` | Provide production URL |
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
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts, notifications.ts ✅
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts (⚠️ W96 OPEN — stale-token cleanup needs two-phase receipt flow)
│   │   └── __tests__/          # 10 server tests
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
| **W95** | SPEC12-C: server-login skip persistence | ✅ CLOSED — 2026-08-19 |
| **W96** | SPEC12-B: push receipt two-phase stale-token cleanup | 🔵 SPEC DOCUMENTED — not yet implemented |
| **W51-SURV** | AIM GPL2 JORADP publication watch | 🟠 SURVEILLANCE |

**Next phase identifier: W97.**

---

## Stack Quick-Reference

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| DB (mobile) | expo-sqlite ≥15 / SDK 56 |
| Server | Express + Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Tests (mobile) | Jest + ts-jest (1232+ tests + 5 W95 screens tests) |
| Tests (server) | Jest + ts-jest + supertest (10 tests) |
| Build | EAS Build |
| Push | expo-server-sdk |
