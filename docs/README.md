# SafeInspect — README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-08-19 17:15 WAT — Perplexity — W95 🟡 PUSHED / PENDING USER VERIFICATION — SPEC12-C server-login skip persistence
- **Bug confirmed:** `handleSkip()` in `app/screens/server-login.tsx` navigates to home but writes no flag. `_layout.tsx` guard (step 2c) has no skip exception → user re-prompted on every app launch forever, contradicting the screen's own documented offline-first intent.
- **Fix applied (2 files):**
  - `app/screens/server-login.tsx` — `handleSkip()` now calls `SettingsRepository.set('serverLoginSkipped', 'true')` before navigating.
  - `app/_layout.tsx` — step 2c guard now also reads `serverLoginSkipped` and skips redirect if it is `'true'`.
- **SPEC12-E confirmed clean (same session, no code change needed):** `src/db/syncEngine.ts` already had the raw `'autoSync'` string replaced and `isAutoSyncEnabled()` removed — the file header comment documents this explicitly as "SPEC12-E". Confirmed by direct read (SHA `35605c9`). Closed with no code action.
- **Test file pushed:** `src/__tests__/screens/serverLoginSkip.test.tsx` — 3 tests:
  1. Skip sets `serverLoginSkipped = 'true'` in SettingsRepository.
  2. `_layout.tsx` guard does NOT redirect when `serverLoginSkipped === 'true'` and `isLoggedIn() === false`.
  3. `_layout.tsx` guard DOES redirect when neither condition is met (regression guard).
- **Verify:** `npx jest src/__tests__/screens/serverLoginSkip.test.tsx`
- **W96 OPENED** — see STRATEGIC_PLAN for full SPEC12-B push receipt two-phase spec.

### 2026-08-19 15:08 WAT — Perplexity — W94 ✅ CLOSED — E2E integration test all green
- **User-confirmed:** `npx jest src/__tests__/e2e/inspectorLifecycle.e2e.test.ts` all green.
- **Phase result:** W94 closed.
- **Coverage delivered:** end-to-end inspector lifecycle — save draft, complete, approve, delete-blocked on approved, cascade delete on non-approved, W22 immutability guard, deleteMany partial-lock guard, W52 clear() block.
- **Files changed this phase:** `src/__tests__/e2e/inspectorLifecycle.e2e.test.ts`, `docs/README.md`, `docs/STRATEGIC_PLAN.md`
- **Test commit:** [`1a9360d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/1a9360d0ae70929315546ed322e3c5661b644b43)

### 2026-08-19 15:00 WAT — Perplexity — W94 ✅ OPEN → PENDING USER VERIFICATION — E2E integration test
- **File added:** `src/__tests__/e2e/inspectorLifecycle.e2e.test.ts`
- **Commit:** [`1a9360d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/1a9360d0ae70929315546ed322e3c5661b644b43)
- **8 tests covering full inspector lifecycle.**

### 2026-08-19 14:50 WAT — Perplexity — W92 ✅ CLOSED — PriorityWidget navigation test green after RN query fix
- **Fix commit:** [`c1040f2`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/c1040f22911318e44806eb2b3c842ee5b54e5310)

### 2026-08-19 12:07 WAT — Perplexity — audit-log.tsx duplicate key fix ✅ — TSC 0 + Jest 1232/0
- Commit [`259f64b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/259f64b122ce7ab366a80e74087d224468c2ba66)

### 2026-08-18 22:41 WAT — Perplexity — TSC 0 + Jest 1233/0 ALL GREEN (user confirmed)
- Commit [`2c78a16`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2c78a16a61331c4aff693880dba347afc603feed)

> **Older entries archived** — see git log or STRATEGIC_PLAN.md `<details>` block for full history.

---

## DEFINITIVE REMAINING WORK (as of 2026-08-19 17:15 WAT)

### 🟡 OPEN / PENDING (need user action)

| ID | Severity | Item | Action |
|---|---|---|---|
| **W95** | P2 | SPEC12-C: server-login skip persistence | Run `npx jest src/__tests__/screens/serverLoginSkip.test.tsx` → expect 3/3 PASS. Report result. |
| **F-05** | LOW | Set production API URL | Set `EXPO_PUBLIC_SYNC_API_URL=https://your-prod-host` in `.env.production` / EAS secrets when server is deployed. |

### 🔵 OPEN PHASE — Spec documented, not yet implemented

| ID | Severity | Item | Notes |
|---|---|---|---|
| **W96** | P2 | SPEC12-B: push receipt two-phase stale-token cleanup | Full spec in STRATEGIC_PLAN.md under W96. Moderate change — implement when ready. |

### ✅ CONFIRMED CLOSED

| Finding | Closed by | Verified |
|---|---|---|
| SPEC12-A — login rate-limit | W74 | Commit `33dc3b8` |
| SPEC12-B — push receipt two-phase (stale token cleanup) | W96 OPEN | Spec documented; code not yet written |
| SPEC12-C — server-login skip persistence | W95 | Pending user Jest confirm |
| SPEC12-D server-side — notifications.ts route | W91 | SHA `ce797c2` |
| SPEC12-D client-side — registerPushToken res.ok | SPEC12-D commit | Commit `2fbd14b` |
| SPEC12-E — syncEngine.ts raw 'autoSync' string | Already clean | Direct read SHA `35605c9` — `isAutoSyncEnabled()` removed, header documents SPEC12-E |
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
│       ├── screens/            # serverLoginSkip.test.tsx 🟡 (W95)
│       └── repositories/       # Jest test suite (1232+ tests)
├── server/
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts, notifications.ts ✅
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts (W96 OPEN — stale-token cleanup needs two-phase receipt flow)
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
| **W94** | E2E integration test — full inspector lifecycle | ✅ CLOSED |
| **W95** | SPEC12-C: server-login skip persistence | 🟡 PUSHED — awaiting `npx jest` |
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
| Tests (mobile) | Jest + ts-jest (1232+ tests) |
| Tests (server) | Jest + ts-jest + supertest (10 tests) |
| Build | EAS Build |
| Push | expo-server-sdk |
