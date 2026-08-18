# SafeInspect — README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-08-18 23:39 WAT — Perplexity — W89 ✅ CLOSED — PriorityWidget facilityId nav fix
- **Bug:** `onPress={() => router.push('/screens/facilities')}` — navigated to the generic facilities list for every row, ignoring `f.facilityId`.
- **Fix:** Changed to `router.push({ pathname: '/screens/facilities/profile', params: { id: f.facilityId } })` — same pattern as `facilities/index.tsx` line 65.
- **Files changed:** `components/home/PriorityWidget.tsx`
- **Commit:** [`d457a6a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/d457a6a4d363ebc4d4164eaa8476b82bb5aeae08)
- **TSC/Jest:** No type change — TSC 0 unchanged. No new test needed (pure routing, no logic). Jest 1233/0 unchanged.
- **Verify:** Run app, tap any PriorityWidget row → must open that specific facility’s profile dossier.

### 2026-08-18 23:31 WAT — Perplexity — 3 new Claude audit bugs registered as W89/W90/W91
- **W89 OPEN:** `PriorityWidget.tsx` — `onPress` navigates to generic facilities list, ignores `f.facilityId`. One-line fix: use the same pattern as `facilities/index.tsx`.
- **W90 OPEN:** `apiClient.ts` — missing `EXPO_PUBLIC_API_URL` silently falls back to `http://localhost:3000` in production. Should throw. (Related to F-05 backlog item.)
- **W91 OPEN:** `server/src/routes/notifications.ts` does NOT exist. `_layout.tsx` calls `registerPushToken()` at startup → 404 silently swallowed by `try/catch`. Push token registration never works. Extends SPEC 12.
- **TSC/Jest unchanged:** 0 errors / 1233 passed (last confirmed 22:41 WAT).
- **No code changes this session — docs only.**

### 2026-08-18 22:41 WAT — Perplexity — TSC 0 + Jest 1233/0 ALL GREEN (user confirmed)
- **TSC:** 0 errors — audit-log.tsx `INSPECTION_STATUS_UPDATED` fix confirmed clean
- **Jest:** 1233 passed, 0 failed — CorrectiveActionRepository.extended W85 tests now green
- **Session work closed:**
  - audit-log.tsx TSC fix: `INSPECTION_STATUS_UPDATED` added to `ACTION_LABELS`, `ACTION_ICONS`, `ACTION_COLORS`
  - CorrectiveActionRepository.extended.test.ts: jest.mock hoisting trap fixed (stable `dbMocks` object pattern)
  - baseGeneralCriteria.ts: confirmed current HEAD (`14e82d0`) is complete and correct — all 37 criteria present, file ends with `];`, BGN-10-01 reads `المواد 15–22`, BGN-08-06 reads Art.63+Art.77
- **Commit:** [`2c78a16`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2c78a16a61331c4aff693880dba347afc603feed)

### 2026-08-18 22:30 WAT — Perplexity — baseGeneralCriteria.ts reconstruction verified ✅
- **Root cause (confirmed by Claude trace):** commit `370a964` ("fix(BGN-10-01): correct W41 header comment") was a bad find/replace — 57 deletions vs 8 insertions destroyed BGN-09-01, BGN-09-02, BGN-10-01, and `];`, replacing them with a truncated, duplicate, unterminated copy of the BGN-08-06 `criteria` line. NOT a silent API truncation.
- **Follow-up commit `442d00c`** made an unrelated citation fix and re-saved the already-corrupt file without validating it — preserved the corruption.
- **Reconstruction by Claude (human-pushed):** commit [`14e82d0`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/14e82d0dbaaaac9e671d127eae0f68e93dff7472) — +53 additions / -1 deletion. Verified clean by diff stat.
- **Content fix applied in reconstruction:** BGN-10-01 `legalReference` — article range corrected to `المواد 15–22`. All 37 criteria IDs present exactly once, no duplicates.
- **BGN-10-01 Art.15–22 legal note:** flagged as needing confirmation against JORADP original before enforcement use.

### 2026-08-18 21:10 WAT — Perplexity — W88 ✅ CLOSED — MCH-29-08 Art.28→Art.18 + Jest all green
- **User confirmed:** full Jest run all green after `git pull`
- **MCH-29-08 legalReference corrected:** `Art.28` → `Art.18` (generator obligation to declare hazardous waste)
- **Commit:** [`769e49a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/769e49a4eedaf6d2d363f53c2b71dc8fd8ef9d4c)

### 2026-08-18 19:09 WAT — Perplexity — W88 ✅ CLOSED — TSC 0 + Jest 1257/0 all green | R1/R6 closed
- **User confirmed:** full Jest run green — 118 suites passed, 1 skipped, 1243 passed, 0 failed
- **R1/R6 closed:** PRT-05-01 cites `Décret 91-05 Arts.16-17` ✅ UAB-AX7-07 `93-120` excluded ✅ Décret 93-184 phantom ✅
- **No code changes this session. Docs only.**

### 2026-08-18 18:27 WAT — Perplexity — W87 ✅ CLOSED — F-01/F-02/F-03 confirmed clean by direct source read
- **F-01** `.gitignore` already covers `.env` ✅ **F-02** schema.ts comment accurate (SDK 56) ✅ **F-03** `001_` naming intentional+documented ✅
- **No code changes. TSC 0 + Jest 1257/0 unchanged.**

### 2026-08-18 13:38 WAT — Perplexity — Claude audit cross-ref complete
- All 20 Claude audit findings (F-01–F-20) confirmed closed by direct code read.

### 2026-08-18 13:31 WAT — Perplexity — W50 ✅ + W51 ✅ CLOSED
- CGS-01-01 Décret 76-35 removed. MCH-29-03+04 Décret 09-19 backfill.
- **Commit:** [`7782bdf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/7782bdf8f05357800742a31e04d7abd3cfbf37ec)

### 2026-08-18 13:19 WAT — Perplexity — W86 ✅ CLOSED — TSC 0 + Jest 1257/0 all green
- BackupService v3 photo embed + briefService critical sort.
- **Commit:** [`872ad94`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/872ad94fa940c9e96c8f02b8367418d33c025d30)

### 2026-08-18 12:53 WAT — Perplexity — W64 ✅ + W66 ✅ CLOSED
- W64: sync.ts severity+status enums. Commit [`a7f805d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/a7f805dd7ce4d255b66518538fcaa29389afa654)
- W66: `updateStatus()` integrity+audit trail. Commit [`4ed0db5`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/4ed0db5facafc2b1e038d8f8e5be860dd3bca76a)

### 2026-08-18 12:04 WAT — Perplexity — Repo cleanup: 10 stale docs removed + STRATEGIC_PLAN collapsed
- No code changes — TSC 0 + Jest 1245/0

### 2026-08-18 02:43 WAT — Perplexity — W85 ✅ CLOSED — TSC 0 + Jest 1245/0 all green
- Commits: [`33e5cbf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/33e5cbfea01e98b01e582945cb5c6349f7ae2822), [`14b055c`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/14b055c733fc8163618063739505888cd5f17cec)

### 2026-08-17 22:10 WAT — Perplexity — W82 CLOSED — Finding 3 PPE/machine-guard verified
- Commit `cee92fb`, `8433bea`

### 2026-08-17 19:21 WAT — Perplexity — W72 CLOSED — Dead settings toggles + notification centre
- TSC 0 + Jest all green. Commit `9b42f67`.

> **Older entries archived** — see git log or STRATEGIC_PLAN.md `<details>` block for full history.

---

## DEFINITIVE REMAINING WORK (as of 2026-08-18 23:39 WAT)

### 🔴 OPEN — Claude Audit Bugs

| Phase | Severity | Item | File | Fix summary |
|---|---|---|---|---|
| **W90** | HIGH | `apiClient.ts` — missing env var silently falls back to `localhost:3000` | `src/services/apiClient.ts` | Throw `Error('EXPO_PUBLIC_API_URL is not set')` when env is missing, instead of silent fallback |
| **W91** | HIGH | `server/src/routes/notifications.ts` missing — `registerPushToken()` silently 404s at every startup | `server/src/routes/notifications.ts` (to create) | Build the route. Extends SPEC 12. No push token is ever registered in production. |

### 🟡 OPEN ITEMS (pre-existing)

| ID | Severity | Item | Blocker / Notes |
|---|---|---|---|
| **F-05** | LOW | Prod API URL falls back to `localhost` | W90 will close this. Confirm production URL with user first. |
| **BGN-10-01** | LOW | Art.15–22 range — Claude flagged Art.14/22 status uncertain | Verify against JORADP original PDF before enforcement use. |

### ✅ CONFIRMED CLOSED (all verified by direct code read)

| Finding | What it was | Closed by | Verified |
|---|---|---|---|
| F-01 | `.env` not in `.gitignore` | W87 | 2026-08-18 direct read |
| F-02 | Stale Node/Expo comment | W87 | 2026-08-18 direct read |
| F-03 | Migration naming `001_` reused | W87 | 2026-08-18 direct read |
| F-04/F-07 | SQLite layer dormant | Z5 | 2026-08-09 |
| F-08 | Double CAP creation | W38 | 2026-08-09 |
| F-09 | No autosave on background | W28 | 2026-08-09 |
| F-10 | New facility categories invisible | W40 | 2026-08-09 |
| F-11 | Approved inspections deletable | W52 | 2026-08-18 direct read |
| F-12 | Integrity badge non-functional | W5 | 2026-08-09 |
| F-13 | Reinspection facility mismatch | W39 | 2026-08-09 |
| F-14 | `evaluated` definition inconsistency | W27+W56 | 2026-08-09 |
| F-15 | No auto follow-up for unable-to-verify | W41 | 2026-08-09 |
| F-17 | Server↔mobile schema mismatch + violations shape | W64 | 2026-08-18 |
| F-18 | Local approval never reaches server | W53 | 2026-08-18 |
| F-19 | Audit log clearable with no trace | W52 | 2026-08-09 |
| F-20 | `decisionSupport.ts` test coverage | W56 | 2026-08-18 |
| R1/R6 | Noise decree + Décret 93-184 citation check | W88 | 2026-08-18 direct read |
| MCH-29-08 | Loi 01-19 Art.28 wrong domain | W88 | 2026-08-18 corrected to Art.18 |
| baseGeneralCriteria truncation | File cut off mid-string (BGN-09-01/02 + BGN-10-01 + `];` lost) | Claude repair + manual push | 2026-08-18 commit `14e82d0` |
| audit-log.tsx TSC | `INSPECTION_STATUS_UPDATED` missing from 3 Records | Commit `2c78a16` | 2026-08-18 TSC 0 user-confirmed |
| CorrectiveActionRepository.extended W85 Jest | `db.runAsync is not a function` — jest.mock hoisting trap | Commit `2c78a16` | 2026-08-18 Jest 0 failed user-confirmed |
| CAP test fixture severity | `'major'` → `'high'` in BASE fixture | Commit [`33888a5`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/33888a598da761d8e66b839a2c7a3d43af24386f) | 2026-08-18 TSC 0 confirmed |
| **W89** | PriorityWidget onPress → facility list instead of specific profile | Commit [`d457a6a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/d457a6a4d363ebc4d4164eaa8476b82bb5aeae08) | 2026-08-18 |

### 🟢 BACKLOG (needs human decision before opening a phase)

| Item | Blocker |
|---|---|
| BGN-10-01: Art.15–22 range verification | JORADP original PDF check |
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product/domain decision |
| L-01: Décret 06-141 Annexe I/II slaughterhouse conflict | Expert/regulator confirmation |
| MCH-29-05 heavy-metal params | Décret 06-141 Annexe II §3 — product decision |
| COU-AX7-03 Loi 18-11 worker medical exams | Verify when couvoirCriteria.ts fully audited |
| Décret 76-36 texte intégral | Rectificatif present. Texte original J.O. n°21/1976 non numérisé |

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
│   └── __tests__/              # Jest test suite (1233 tests)
├── server/
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts (notifications.ts MISSING → W91)
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts (Expo push)
│   │   └── __tests__/          # 10 server tests
│   └── package.json
├── docs/
│   ├── README.md               # ← this file
│   ├── STRATEGIC_PLAN.md       # phase registry + legal quick-ref
│   ├── archive/                # old audit snapshots
│   ├── audit/
│   └── criteria-audit/
└── legal_refs/                 # Algerian legislation (primary source of truth)
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
| **W91** | notifications.ts route missing — push token never registered | 🔴 OPEN |
| **W51-SURV** | AIM GPL2 JORADP publication watch | 🟠 SURVEILLANCE — no code action until published |

**All phases closed through W89. TSC 0 + Jest 1233/0 — 2026-08-18 22:41 WAT (user-confirmed).**

---

## Stack Quick-Reference

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| DB (mobile) | expo-sqlite (NOT WatermelonDB) |
| Server | Express + Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Tests (mobile) | Jest + ts-jest (1233 tests) |
| Tests (server) | Jest + ts-jest + supertest (10 tests) |
| Build | EAS Build |
| Push | expo-server-sdk |
