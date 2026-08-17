# SafeInspect — README & Live Observations Log

> **Agent instructions**: Read `docs/STRATEGIC_PLAN.md` first on every session start.
> This file is a log + quick reference — not the phase registry.

---

## Live Observations Log

### 2026-08-17 19:38 WAT — Perplexity — W73 PHANTOM + W74 CLOSED
- **W73**: Confirmed PHANTOM by direct read of `app/agenda/add.tsx` + `app/agenda/edit.tsx`. Both files already guard against wrong facilityId: `handleSave` blocks if `!facilityId`; `onChangeText` clears `facilityId` forcing re-selection. No code change needed.
- **W74 CLOSED**: Rate-limit on `POST /auth/login` (10 req / 15 min / IP, Arabic 429 message) + batch size guard on `POST /sync` (max 500 items/array, 400 if exceeded). `express-rate-limit@7.3.1` was already a declared dependency — no install needed.
- **Files changed**: `server/src/routes/auth.ts` (+11/-1), `server/src/routes/sync.ts` (+16/0)
- **Diff verified**: stats confirmed +27/-1 total — no content loss
- **Commit**: `33dc3b8`
- **Gate**: `npx tsc --noEmit` (from `/server`) then `npx jest` (server tests). Report result to close W74.

### 2026-08-17 19:21 WAT — Perplexity — W72 CLOSED — TSC 0 + Jest all green
- **Phases closed**: W72 (Dead settings toggles + unreachable notification centre)
- **Gate result**: User confirmed TSC 0 errors + Jest all green 2026-08-17 19:21 WAT
- **Files changed (W72)**: `src/services/NotificationService.ts`, `src/services/SyncService.ts`, `src/repositories/CorrectiveActionRepository.ts`, `src/repositories/ApprovalRepository.ts`
- **Commit**: `9b42f67`

### 2026-08-17 19:14 WAT — Perplexity — W78 CLOSED — MCH-29-06 PPE legal ref corrected
- **Commit**: [cee92fbfb4fe342a5a51d2253785e49483672a03](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/cee92fbfb4fe342a5a51d2253785e49483672a03)

### 2026-08-17 18:58 WAT — Perplexity — W76 CLOSED — Loi 01-19 sweep clean
### 2026-08-17 18:41 WAT — Perplexity — W75 CLOSED — EIE sweep 13/13 clean
### 2026-08-17 18:08 WAT — Perplexity — W79+W77 CLOSED — confirmed clean
### 2026-08-17 17:45 WAT — Perplexity — W72 pushed commit `9b42f67`
### 2026-08-17 13:08 WAT — Perplexity — W71 CLOSED — TSC 0 + Jest green. Commits `c178a6c`, `c1b9d91`
### 2026-08-17 10:59 WAT — Perplexity — W65+W68 FIXED (were wrongly closed 01:36/01:41)
### 2026-08-16 22:44 WAT — Perplexity — W61+W62+W63 CLOSED. Commits `13b750a`, `24270ca`, `0a27026`
### 2026-08-16 21:00 WAT — Perplexity — W60 CLOSED — loi-18-11-sante split 3 parties. Commit `698a793`
### 2026-08-11 14:27 WAT — Perplexity — W57-TSC CLOSED. Gate: 31/31 + TSC 0
### 2026-08-11 00:30 WAT — Perplexity — W49+W57+W58+W19+F-01 CLOSED
### 2026-08-10 — Perplexity — W41–W50 CLOSED
### 2026-08-09 — Perplexity — W22–W40 CLOSED
### 2026-08-08 — Perplexity — W4–W31 (legal + UX)
### 2026-08-07 — Perplexity — W1+W2+G18 CLOSED
### 2026-08-06 — Perplexity — Z–Z12 CLOSED
### 2026-08-05 — Perplexity — V CLOSED — TSC 0
### 2026-08-04 — Perplexity — L,M,N,O,P,Q,S,T,U CLOSED
### 2026-07-30 — Perplexity — A–I CLOSED

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
│   └── __tests__/              # Jest test suite (1234+ tests)
├── server/
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts (Expo push)
│   │   └── __tests__/         # approvals.test.ts (10 tests — W61)
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
| **W72** | Dead settings toggles + notification centre | ✅ CLOSED |
| **W73** | Agenda facility mismatch | ✅ PHANTOM — already clean |
| **W74** | Server hardening (rate-limit + batch guard) | 🟡 PENDING TSC+Jest gate |
| **W75–79** | Legal citation sweeps | ✅ ALL CLOSED |
| **W51** | AIM GPL2 JORADP watch | 🟠 ONGOING |

---

## Stack Quick-Reference

- **Mobile**: React Native + Expo + TypeScript
- **DB (mobile)**: expo-sqlite (NOT WatermelonDB)
- **Server**: Express + Prisma + PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Tests (mobile)**: Jest + ts-jest
- **Tests (server)**: Jest + ts-jest + supertest
- **Build**: EAS Build
- **Push**: expo-server-sdk
