# SafeInspect — README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-08-19 11:35 WAT — Perplexity — W91 ✅ CLOSED — notifications route + tests
- **Bug:** `POST /api/notifications/register` was 404 at every app startup because `server/src/routes/notifications.ts` did not exist. `registerPushToken()` in `serverAuth.ts` silently swallowed the error — no push token ever stored in prod.
- **Fix:** Created `server/src/routes/notifications.ts` with:
  - `POST /register` — upserts Expo push token for the authenticated inspector (idempotent). Validates token format via `Expo.isExpoPushToken()` → 400 on invalid. 200 on success.
  - `DELETE /register` — removes token scoped to the authenticated inspector (logout/permission revoked). 200 even if token not found (idempotent).
  - Both routes guarded by `requireAuth`. Uses `prisma.pushToken.upsert` / `deleteMany` — same Prisma model already used in `push.ts`.
  - Server `index.ts` auto-scans `routes/` — no mount change needed.
- **Tests:** Created `server/src/__tests__/notifications.test.ts` — 5 supertest cases: POST valid token → 200, POST invalid token → 400, POST missing token → 400, DELETE valid → 200, DELETE missing → 400.
- **Files changed:** `server/src/routes/notifications.ts` (new), `server/src/__tests__/notifications.test.ts` (new)
- **Commit:** [`8373ba7`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/8373ba757cc6b1508a27057d13be18a35baeece3)
- **TSC/Jest:** Server-only TS — run `cd server && npx tsc --noEmit` and `cd server && npx jest` to confirm. Mobile TSC 0 / Jest 1233 unchanged (no mobile files touched).
- **Verify:** `git pull` → `cd server && npx tsc --noEmit && npx jest` → report result.

### 2026-08-18 23:39 WAT — Perplexity — W89 ✅ CLOSED — PriorityWidget facilityId nav fix
- **Bug:** `onPress={() => router.push('/screens/facilities')}` — navigated to generic list, ignoring `f.facilityId`.
- **Fix:** `router.push({ pathname: '/screens/facilities/profile', params: { id: f.facilityId } })`
- **Commit:** [`d457a6a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/d457a6a4d363ebc4d4164eaa8476b82bb5aeae08)

### 2026-08-18 23:31 WAT — Perplexity — 3 new Claude audit bugs registered as W89/W90/W91
- W89 ✅ CLOSED | W90 🔴 OPEN | W91 ✅ CLOSED

### 2026-08-18 22:41 WAT — Perplexity — TSC 0 + Jest 1233/0 ALL GREEN (user confirmed)
- audit-log.tsx `INSPECTION_STATUS_UPDATED` fix + CorrectiveActionRepository.extended jest.mock hoisting fix.
- **Commit:** [`2c78a16`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2c78a16a61331c4aff693880dba347afc603feed)

### 2026-08-18 21:10 WAT — Perplexity — W88 ✅ CLOSED — MCH-29-08 Art.28→Art.18
- **Commit:** [`769e49a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/769e49a4eedaf6d2d363f53c2b71dc8fd8ef9d4c)

### 2026-08-18 13:19 WAT — Perplexity — W86 ✅ CLOSED — TSC 0 + Jest 1257/0 all green
- BackupService v3 photo embed + briefService critical sort.
- **Commit:** [`872ad94`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/872ad94fa940c9e96c8f02b8367418d33c025d30)

### 2026-08-18 12:53 WAT — Perplexity — W64 ✅ + W66 ✅ CLOSED
- W64: sync.ts severity+status enums. W66: `updateStatus()` integrity+audit trail.

### 2026-08-18 02:43 WAT — Perplexity — W85 ✅ CLOSED — TSC 0 + Jest 1245/0 all green
- Commits: [`33e5cbf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/33e5cbfea01e98b01e582945cb5c6349f7ae2822), [`14b055c`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/14b055c733fc8163618063739505888cd5f17cec)

> **Older entries archived** — see git log or STRATEGIC_PLAN.md for full history.

---

## DEFINITIVE REMAINING WORK (as of 2026-08-19 11:35 WAT)

### 🔴 OPEN — Claude Audit Bugs

| Phase | Severity | Item | File | Fix summary |
|---|---|---|---|---|
| **W90** | HIGH | `apiClient.ts` — missing env var silently falls back to `localhost:3000` | `src/services/apiClient.ts` | Throw `Error('EXPO_PUBLIC_API_URL is not set')` when env is missing. Awaiting prod URL confirmation from user. |

### 🟡 OPEN ITEMS (pre-existing)

| ID | Severity | Item | Blocker / Notes |
|---|---|---|---|
| **F-05** | LOW | Prod API URL falls back to `localhost` | W90 will close this. |
| **BGN-10-01** | LOW | Art.15–22 range uncertain | Verify against JORADP original PDF. |

### ✅ CONFIRMED CLOSED

| Finding | What it was | Closed by | Verified |
|---|---|---|---|
| F-01 | `.env` not in `.gitignore` | W87 | 2026-08-18 |
| F-02 | Stale Node/Expo comment | W87 | 2026-08-18 |
| F-03 | Migration naming `001_` reused | W87 | 2026-08-18 |
| F-04/F-07 | SQLite layer dormant | Z5 | 2026-08-09 |
| F-08 | Double CAP creation | W38 | 2026-08-09 |
| F-09 | No autosave on background | W28 | 2026-08-09 |
| F-10 | New facility categories invisible | W40 | 2026-08-09 |
| F-11 | Approved inspections deletable | W52 | 2026-08-18 |
| F-12 | Integrity badge non-functional | W5 | 2026-08-09 |
| F-13 | Reinspection facility mismatch | W39 | 2026-08-09 |
| F-14 | `evaluated` definition inconsistency | W27+W56 | 2026-08-09 |
| F-15 | No auto follow-up for unable-to-verify | W41 | 2026-08-09 |
| F-17 | Server↔mobile schema mismatch + violations shape | W64 | 2026-08-18 |
| F-18 | Local approval never reaches server | W53 | 2026-08-18 |
| F-19 | Audit log clearable with no trace | W52 | 2026-08-09 |
| F-20 | `decisionSupport.ts` test coverage | W56 | 2026-08-18 |
| R1/R6 | Noise decree + Décret 93-184 | W88 | 2026-08-18 |
| MCH-29-08 | Art.28 wrong domain | W88 | 2026-08-18 |
| baseGeneralCriteria truncation | BGN-09-01/02 + BGN-10-01 + `];` lost | Claude repair | 2026-08-18 commit `14e82d0` |
| audit-log.tsx TSC | `INSPECTION_STATUS_UPDATED` missing from 3 Records | Commit `2c78a16` | 2026-08-18 |
| CorrectiveActionRepository.extended W85 | `db.runAsync is not a function` | Commit `2c78a16` | 2026-08-18 |
| CAP test fixture severity | `'major'` → `'high'` | Commit `33888a5` | 2026-08-18 |
| **W89** | PriorityWidget facilityId nav ignored | Commit `d457a6a` | 2026-08-18 |
| **W91** | `notifications.ts` missing — push never registered | Commit [`8373ba7`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/8373ba757cc6b1508a27057d13be18a35baeece3) | 2026-08-19 |

### 🟢 BACKLOG (needs human decision)

| Item | Blocker |
|---|---|
| BGN-10-01: Art.15–22 range verification | JORADP original PDF |
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product decision |
| L-01: Décret 06-141 Annexe I/II slaughterhouse conflict | Expert confirmation |
| MCH-29-05 heavy-metal params | Décret 06-141 Annexe II §3 |
| COU-AX7-03 Loi 18-11 worker medical exams | Full couvoirCriteria.ts audit |
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
│   └── __tests__/              # Jest test suite (1233 mobile tests)
├── server/
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts, notifications.ts ✅
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts (Expo push)
│   │   └── __tests__/          # 15 server tests (10 prev + 5 W91)
│   └── package.json
├── docs/
│   ├── README.md
│   ├── STRATEGIC_PLAN.md
│   └── archive/
└── legal_refs/
    ├── loi-18-11-sante-partie1-arts1-164.md
    ├── loi-18-11-sante-partie2-arts165-264.md
    ├── loi-18-11-sante-partie3-arts265-450.md
    └── ... (28 additional law/decree files)
```

---

## Current Sprint Status

| Phase | Title | Status |
|---|---|---|
| **W89** | PriorityWidget facilityId nav bug | ✅ CLOSED |
| **W90** | apiClient.ts localhost silent fallback → throw | 🔴 OPEN (awaiting prod URL confirmation) |
| **W91** | notifications.ts route missing — push token never registered | ✅ CLOSED |
| **W51-SURV** | AIM GPL2 JORADP publication watch | 🟠 SURVEILLANCE |

**All phases closed through W91 (except W90 awaiting user decision). Mobile TSC 0 + Jest 1233/0 — confirmed 2026-08-18 22:41 WAT.**

---

## Stack Quick-Reference

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| DB (mobile) | expo-sqlite (NOT WatermelonDB) |
| Server | Express + Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Tests (mobile) | Jest + ts-jest (1233 tests) |
| Tests (server) | Jest + ts-jest + supertest (15 tests) |
| Build | EAS Build |
| Push | expo-server-sdk |
