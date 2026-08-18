# SafeInspect — README & Live Observations Log

> **Agent instructions**: Read `docs/STRATEGIC_PLAN.md` first on every session start.
> This file is a log + quick reference — not the phase registry.

---

## Live Observations Log

### 2026-08-18 02:43 WAT — Perplexity — W85 ✅ CLOSED — TSC 0 + Jest 1245/0 all green
- **Phases closed**: W85 (SPEC 10 fix — StorageKeys + settings.tsx)
- **Gate**: TSC 0 + Jest 1245 passed / 0 failed — user-confirmed 02:43 WAT
- **Code commit**: [`33e5cbf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/33e5cbfea01e98b01e582945cb5c6349f7ae2822) — `keys.ts` +7, `settings.tsx` +5 (StorageKeys constants)
- **Test fix**: [`14b055c`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/14b055c733fc8163618063739505888cd5f17cec) — stale PRT-05-01 assertion updated (`90-11` → `91-05`, W82 drift)
- **Impact**: All 3 settings toggles (notifications, autoSync, darkMode) now correctly persist + read across app restarts. SyncService.AUTO_SYNC key resolved correctly.
- **Sprint status**: P1 + P2 fully closed. Only W51 (AIM GPL2 JORADP surveillance) open.

### 2026-08-18 02:35 WAT — Perplexity — W85 code pushed — gate pending
- Commit `33e5cbf` — +12/-12 diff verified. Test fix needed for stale PRT-05-01 assertion.

### 2026-08-17 23:23 WAT — Perplexity — W84 CLOSED + W85 OPEN
- 3 mismatched keys: `'notifications'`, `'autoSync'`, `'darkMode'` used as raw strings in settings.tsx but absent from StorageKeys.

### 2026-08-17 22:10 WAT — Perplexity — W82 CLOSED — Finding 3 PPE/machine-guard fully verified
### 2026-08-17 20:48 WAT — Perplexity — W80+W81 CLOSED — legal_refs false flags corrected
### 2026-08-17 20:04 WAT — Perplexity — W74 CLOSED — TSC 0 + Jest 10/10
### 2026-08-17 19:38 WAT — Perplexity — W73 PHANTOM + W74 code pushed
### 2026-08-17 19:21 WAT — Perplexity — W72 CLOSED — TSC 0 + Jest all green
### 2026-08-17 19:14 WAT — Perplexity — W78 CLOSED — MCH-29-06 PPE legal ref
### 2026-08-17 18:58–18:08 WAT — Perplexity — W75+W76+W77+W79 CLOSED — all clean
### 2026-08-17 17:45 WAT — Perplexity — W72 code pushed
### 2026-08-17 13:08 WAT — Perplexity — W71 CLOSED
### 2026-08-17 10:59 WAT — Perplexity — W65+W68 fixed
### 2026-08-16 22:44 WAT — Perplexity — W61+W62+W63 CLOSED
### 2026-08-16 21:00 WAT — Perplexity — W60 CLOSED — loi-18-11-sante split
### 2026-08-11 14:27 WAT — Perplexity — W57-TSC CLOSED
### 2026-08-11 00:30 WAT — Perplexity — W49+W57+W58+W19+F-01 CLOSED
### 2026-08-10 — W41–W50 CLOSED
### 2026-08-09 — W22–W40 CLOSED
### 2026-08-08 — W4–W31
### 2026-08-07 — W1+W2+G18 CLOSED
### 2026-08-06 — Z–Z12 CLOSED
### 2026-08-05 — V CLOSED
### 2026-08-04 — L,M,N,O,P,Q,S,T,U CLOSED
### 2026-07-30 — A–I CLOSED

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
│   └── __tests__/              # Jest test suite (1245+ tests)
├── server/
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts (Expo push)
│   │   └── __tests__/         # approvals.test.ts (10 tests)
│   └── package.json
├── docs/
│   ├── README.md
│   ├── STRATEGIC_PLAN.md
│   ├── criteria-audit/
│   └── decisions/DECISIONS.md
└── legal_refs/
    ├── loi-18-11-sante-partie1-arts1-164.md
    ├── loi-18-11-sante-partie2-arts165-264.md
    └── loi-18-11-sante-partie3-arts265-450.md
```

---

## Current Sprint Status

| Phase | Title | Status |
|---|---|---|
| **W51** | AIM GPL2 JORADP watch | 🟠 ONGOING SURVEILLANCE |

**All sprints (P1 + P2) fully closed as of 2026-08-18.**

---

## Stack Quick-Reference

- **Mobile**: React Native + Expo + TypeScript
- **DB (mobile)**: expo-sqlite (NOT WatermelonDB)
- **Server**: Express + Prisma + PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Tests (mobile)**: Jest + ts-jest (1245+ tests)
- **Tests (server)**: Jest + ts-jest + supertest (10 tests)
- **Build**: EAS Build
- **Push**: expo-server-sdk
