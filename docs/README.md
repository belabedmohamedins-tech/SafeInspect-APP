# SafeInspect — README & Live Observations Log

> **Agent instructions**: Read `docs/STRATEGIC_PLAN.md` first on every session start.
> This file is a log + quick reference — not the phase registry.

---

## Live Observations Log

### 2026-08-18 02:35 WAT — Perplexity — W85 CODE PUSHED — TSC/Jest gate pending
- **Phase**: W85 — SPEC 10 fix (StorageKeys + settings.tsx patch)
- **Commit**: [`33e5cbf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/33e5cbfea01e98b01e582945cb5c6349f7ae2822) — +12/-12, 2 files
- **keys.ts**: Added `AUTO_SYNC: 'autoSync'`, `DARK_MODE: 'darkMode'`, `NOTIFICATIONS_UI: 'notifications'`
- **settings.tsx**: Replaced 3 raw string literals with `StorageKeys.AUTO_SYNC`, `StorageKeys.DARK_MODE`, `StorageKeys.NOTIFICATIONS_UI`; added `StorageKeys` import
- **SyncService.ts**: Already used `StorageKeys.AUTO_SYNC` correctly — now resolves to `'autoSync'` (was `undefined` before this fix)
- **Impact fixed**: All 3 toggles (notifications, autoSync, darkMode) now correctly persist + read across app restarts
- **Gate**: ⏳ PENDING — run `npx tsc --noEmit` + `npx jest` and report result

### 2026-08-17 23:23 WAT — Perplexity — W84 CLOSED + W85 OPEN — SPEC 10 settings key audit
- **Phase closed**: W84 (SPEC 10 — settings key writer/reader symmetry audit)
- **Phase opened**: W85 (fix — add missing StorageKeys + patch settings.tsx)
- **3 mismatches found**: `'notifications'`, `'autoSync'`, `'darkMode'` used as raw strings in settings.tsx but absent from StorageKeys
- **Impact**: All 3 toggles silently broken across app restarts

### 2026-08-17 22:10 WAT — Perplexity — W82 CLOSED — Finding 3 PPE/machine-guard legal refs fully verified
- **Phases closed**: W82 (Finding 3 — Loi 90-11 / Décret 93-120 misuse in PPE + machine-guard criteria)
- **Audit result**: All 6 criteria files inspected by direct live read:
  - `blacksmithCriteria.ts` BSM-04-01 + BSM-04-03: patched commit `8433bea` (+13/-2)
  - `paintingCriteria.ts` PNT-04-01: patched previous session
  - `uabCriteria.ts` UAB-AX7-07: confirmed clean (Phase B/Z2 — [INTL] flag already present)
  - `carpenteryCriteria.ts` CRP-04-01 + CRP-04-02: confirmed clean (W82 comment already applied)
  - `marbleCriteria.ts` MRB-05-01: confirmed clean (W82 comment already applied)
  - `printingCriteria.ts` PRT-05-01: confirmed clean (W82 comment already applied)
- **Finding 3**: FULLY CLOSED — 0 incorrect Loi 90-11 / Décret 93-120 PPE/machine-guard citations remain

### 2026-08-17 20:48 WAT — Perplexity — W80+W81 CLOSED — legal_refs false flags corrected
- **Phases closed**: W80 (3 false MISSING/UNVERIFIE flags), W81 (Décret 76-36 MISSING → Present)
- **W80 findings**: Décret 06-138 was ❌ MISSING in docs but ✅ present. loi-09-03 VÉRIFIÉ confirmed. decret-83-496 Art.4/7/8 amendment notices already inline.
- **W81 findings**: `decret-76-36-incendie-panique.md` confirmed present. Texte intégral J.O. n°21/1976 non numérisé.
- **Files changed**: `docs/STRATEGIC_PLAN.md` (commits `1f9688d`, `aa7b4df`)

### 2026-08-17 20:04 WAT — Perplexity — W74 CLOSED — TSC 0 + Jest 10/10
- **Gate result**: User confirmed TSC 0 + Jest 10/10 PASS 2026-08-17 20:04 WAT
- **Phase closed**: W74 (server hardening: rate-limit login 10/15min + sync batch guard max 500)
- **Files changed**: `server/src/routes/auth.ts` (+11/-1), `server/src/routes/sync.ts` (+16/0)
- **Commit**: `33dc3b8`
- **Sprint status**: P1 + P2 fully exhausted. Only W51 (AIM GPL2 JORADP surveillance) remains open.

### 2026-08-17 19:38 WAT — Perplexity — W73 PHANTOM + W74 code pushed
- **W73**: PHANTOM — `add.tsx` + `edit.tsx` already guard `!facilityId`. No code change.
- **W74 code**: Commit `33dc3b8` — +27/-1 diff verified.

### 2026-08-17 19:21 WAT — Perplexity — W72 CLOSED — TSC 0 + Jest all green
- Commit `9b42f67`. Gate user-confirmed 19:21 WAT.

### 2026-08-17 19:14 WAT — Perplexity — W78 CLOSED — MCH-29-06 PPE legal ref
- Commit [cee92fb](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/cee92fbfb4fe342a5a51d2253785e49483672a03). +1/-1.

### 2026-08-17 18:58–18:08 WAT — Perplexity — W75+W76+W77+W79 CLOSED — all confirmed clean
### 2026-08-17 17:45 WAT — Perplexity — W72 code pushed. Commit `9b42f67`
### 2026-08-17 13:08 WAT — Perplexity — W71 CLOSED. Commits `c178a6c`, `c1b9d91`
### 2026-08-17 10:59 WAT — Perplexity — W65+W68 FIXED (were wrongly closed at 01:36/01:41)
### 2026-08-16 22:44 WAT — Perplexity — W61+W62+W63 CLOSED. Commits `13b750a`, `24270ca`, `0a27026`
### 2026-08-16 21:00 WAT — Perplexity — W60 CLOSED — loi-18-11-sante split 3 parties. Commit `698a793`
### 2026-08-11 14:27 WAT — Perplexity — W57-TSC CLOSED. 31/31 + TSC 0
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
│   └── __tests__/              # Jest test suite (1234+ tests)
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
| **W85** | SPEC 10 fix — StorageKeys + settings.tsx patch | ⏳ GATE PENDING — TSC + Jest |
| **W51** | AIM GPL2 JORADP watch | 🟠 ONGOING SURVEILLANCE |

---

## Stack Quick-Reference

- **Mobile**: React Native + Expo + TypeScript
- **DB (mobile)**: expo-sqlite (NOT WatermelonDB)
- **Server**: Express + Prisma + PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Tests (mobile)**: Jest + ts-jest (1234+ tests)
- **Tests (server)**: Jest + ts-jest + supertest (10 tests)
- **Build**: EAS Build
- **Push**: expo-server-sdk
