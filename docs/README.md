# SafeInspect — README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-08-19 12:34 WAT — Perplexity — W41 ✅ CLOSED — BGN-10-01 Art.15–22 → Art.14–21 confirmed + committed
- **Fix:** PowerShell replace `المواد 15–22` → `المواد 14–21` in `src/criteria/baseGeneralCriteria.ts` line 539.
- **Verified:** `Select-String` on BGN-10-01 block — line 539 reads `المواد 14–21 (الفصل` ✅
- **Commit:** [`a71438b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/a71438b769f9ca45f23e386493c9ed28f8129b73)
- **BGN-10-01 JORADP-verify backlog item:** Closed — correction already applied. JORADP confirmation is a legal-assurance step; no further code action needed.
- **No TSC/Jest impact** — legalReference is a string field, no type change.
- **Open items remaining:** F-05 (EAS production URL) only.

### 2026-08-19 12:07 WAT — Perplexity — audit-log.tsx duplicate key fix ✅ — TSC 0 + Jest 1232/0
- **Root cause:** W85 commit `2c78a16` had correctly added `INSPECTION_STATUS_UPDATED` to ACTION_LABELS, ACTION_ICONS, ACTION_COLORS. A subsequent write accidentally duplicated each key at the bottom of the same literals → TS1117 "duplicate property" errors.
- **Fix:** Removed the 3 duplicate entries. Each Record now has exactly 11 unique keys. Commit [`259f64b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/259f64b122ce7ab366a80e74087d224468c2ba66)
- **User-confirmed:** TSC 0 errors. Jest 1232 passed, 1 skipped, 0 failed.
- **Docs updated:** README + STRATEGIC_PLAN updated.

### 2026-08-19 11:29 WAT — Perplexity — W89/W91 confirmed PHANTOM (already resolved) | W90 confirmed REAL
- **W89 RE-EXAMINED:** `PriorityWidget.tsx` (SHA `93bd5de`) already navigates to `router.push({ pathname: '/screens/facilities/profile', params: { id: f.facilityId } })`. Route `app/screens/facilities/profile.tsx` exists. **W89 was already fixed before this session — the prior README entry referencing commit `d457a6a` was correct. No further action needed.**
- **W91 RE-EXAMINED:** `server/src/routes/notifications.ts` (SHA `ce797c2`) EXISTS and implements `POST /register` (upsert) + `DELETE /register` (logout). Built with `requireAuth` + `Expo.isExpoPushToken` validation + Prisma upsert on the `PushToken` model. **W91 was already resolved before this session — no missing route.**
- **W90 CONFIRMED REAL:** `src/services/apiClient.ts` (SHA `a7a3886`) reads `process.env['EXPO_PUBLIC_SYNC_API_URL']` and **already throws** `Error('EXPO_PUBLIC_SYNC_API_URL is not set...')` when missing. The env var name is `EXPO_PUBLIC_SYNC_API_URL` (not `EXPO_PUBLIC_API_URL` as the W90 audit entry stated). **F-05 / W90 are already fixed.** The STRATEGIC_PLAN entry was based on a stale snapshot.
- **Net result:** All three W89/W90/W91 bugs are resolved. **No open Claude audit bugs remain.** Only F-05 backlog item (prod URL value, not a code fix) still requires human input.
- **No code changes this session — docs only.**

### 2026-08-18 23:39 WAT — Perplexity — W89 ✅ CLOSED — PriorityWidget facilityId nav fix
- **Bug:** `onPress={() => router.push('/screens/facilities')}` — navigated to the generic facilities list for every row, ignoring `f.facilityId`.
- **Fix:** Changed to `router.push({ pathname: '/screens/facilities/profile', params: { id: f.facilityId } })` — same pattern as `facilities/index.tsx` line 65.
- **Files changed:** `components/home/PriorityWidget.tsx`
- **Commit:** [`d457a6a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/d457a6a4d363ebc4d4164eaa8476b82bb5aeae08)
- **TSC/Jest:** No type change — TSC 0 unchanged. Jest 1233/0 unchanged.

### 2026-08-18 23:31 WAT — Perplexity — 3 new Claude audit bugs registered as W89/W90/W91
- **W89 OPEN:** `PriorityWidget.tsx` — `onPress` navigates to generic facilities list, ignores `f.facilityId`. One-line fix.
- **W90 OPEN:** `apiClient.ts` — missing `EXPO_PUBLIC_API_URL` silently falls back to `http://localhost:3000`. Should throw.
- **W91 OPEN:** `server/src/routes/notifications.ts` does NOT exist. Push token registration silently 404s.
- **TSC/Jest unchanged:** 0 errors / 1233 passed.

### 2026-08-18 22:41 WAT — Perplexity — TSC 0 + Jest 1233/0 ALL GREEN (user confirmed)
- TSC 0. Jest 1233 passed, 0 failed.
- audit-log.tsx `INSPECTION_STATUS_UPDATED` fix confirmed clean.
- CorrectiveActionRepository.extended W85 tests green.
- **Commit:** [`2c78a16`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2c78a16a61331c4aff693880dba347afc603feed)

### 2026-08-18 22:30 WAT — Perplexity — baseGeneralCriteria.ts reconstruction verified ✅
- Root cause: commit `370a964` bad find/replace destroyed BGN-09-01/02, BGN-10-01, `];`.
- **Reconstruction commit:** [`14e82d0`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/14e82d0dbaaaac9e671d127eae0f68e93dff7472) — all 37 criteria confirmed present.

### 2026-08-18 21:10 WAT — Perplexity — W88 ✅ CLOSED — MCH-29-08 Art.28→Art.18 + Jest all green
- MCH-29-08 `Art.28` → `Art.18` (hazardous waste declaration obligation).
- **Commit:** [`769e49a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/769e49a4eedaf6d2d363f53c2b71dc8fd8ef9d4c)

### 2026-08-18 19:09 WAT — Perplexity — R1/R6 confirmed closed (direct read)
- PRT-05-01 cites `Décret 91-05 Arts.16-17` ✅ UAB-AX7-07 `93-120` excluded ✅ Décret 93-184 phantom ✅

### 2026-08-18 18:27 WAT — Perplexity — W87 ✅ — F-01/F-02/F-03 confirmed clean
- F-01 `.gitignore` covers `.env` ✅ F-02 SDK 56 comment accurate ✅ F-03 `001_` naming intentional ✅

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

### 2026-08-18 02:43 WAT — Perplexity — W85 ✅ CLOSED — TSC 0 + Jest 1245/0
- Commits: [`33e5cbf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/33e5cbfea01e98b01e582945cb5c6349f7ae2822), [`14b055c`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/14b055c733fc8163618063739505888cd5f17cec)

### 2026-08-17 22:10 WAT — Perplexity — W82 CLOSED — Finding 3 PPE/machine-guard verified
- Commits `cee92fb`, `8433bea`

### 2026-08-17 19:21 WAT — Perplexity — W72 CLOSED — Dead settings toggles + notification centre
- TSC 0 + Jest all green. Commit `9b42f67`.

> **Older entries archived** — see git log or STRATEGIC_PLAN.md `<details>` block for full history.

---

## DEFINITIVE REMAINING WORK (as of 2026-08-19 12:34 WAT)

All phases closed through W91 + BGN-10-01 legal correction applied. TSC 0 + Jest 1232/0.

### 🟡 OPEN ITEMS (need human action)

| ID | Severity | Item | Blocker / Notes |
|---|---|---|
| **F-05** | LOW | Confirm production API URL value | `apiClient.ts` already throws on missing env — only need to set `EXPO_PUBLIC_SYNC_API_URL=https://your-prod-host` in `.env.production` / EAS secrets. Provide the URL. |

### ✅ CONFIRMED CLOSED (all verified by direct code read)

| Finding | What it was | Closed by | Verified |
|---|---|---|---|
| F-01 | `.env` not in `.gitignore` | W87 | 2026-08-18 direct read |
| F-02 | Stale Node/Expo comment | W87 | 2026-08-18 direct read |
| F-03 | Migration naming `001_` reused | W87 | 2026-08-18 direct read |
| F-04/F-07 | SQLite layer dormant | Z5 | 2026-08-09 |
| F-05/W90 | `apiClient.ts` silent localhost fallback | W61 | 2026-08-19 — already throws on missing `EXPO_PUBLIC_SYNC_API_URL` |
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
| baseGeneralCriteria truncation | BGN-09-01/02 + BGN-10-01 + `];` lost | Claude repair `14e82d0` | 2026-08-18 |
| audit-log.tsx TSC (initial) | `INSPECTION_STATUS_UPDATED` missing from 3 Records | Commit `2c78a16` | 2026-08-18 |
| audit-log.tsx TSC (duplicate) | TS1117 duplicate key in ACTION_LABELS/ICONS/COLORS | Commit [`259f64b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/259f64b122ce7ab366a80e74087d224468c2ba66) | 2026-08-19 user-confirmed |
| CorrectiveActionRepository.extended Jest | `db.runAsync is not a function` hoisting trap | Commit `2c78a16` | 2026-08-18 |
| CAP test fixture severity | `'major'` → `'high'` in BASE fixture | Commit [`33888a5`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/33888a598da761d8e66b839a2c7a3d43af24386f) | 2026-08-18 |
| **W89** | PriorityWidget onPress → facility list instead of specific profile | Commit [`d457a6a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/d457a6a4d363ebc4d4164eaa8476b82bb5aeae08) | 2026-08-18/19 — already correct on HEAD |
| **W91** | notifications.ts missing — push token never registered | Already present SHA `ce797c2` — POST+DELETE /register implemented | 2026-08-19 direct read |
| **BGN-10-01** | legalReference Art range 15–22 → 14–21 | Commit [`a71438b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/a71438b769f9ca45f23e386493c9ed28f8129b73) | 2026-08-19 PowerShell verify |

### 🟢 BACKLOG (needs human decision before opening a phase)

| Item | Blocker |
|---|---|
| F-05: set `EXPO_PUBLIC_SYNC_API_URL` in EAS secrets | Provide production URL value |
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
│   └── __tests__/              # Jest test suite (1232 tests)
├── server/
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts, notifications.ts ✅
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
| **W89** | PriorityWidget facilityId nav bug | ✅ CLOSED (already on HEAD) |
| **W90** | apiClient.ts localhost silent fallback | ✅ CLOSED — already throws on missing env (`EXPO_PUBLIC_SYNC_API_URL`) |
| **W91** | notifications.ts route missing | ✅ CLOSED — route exists, POST+DELETE /register implemented |
| **audit-log duplicate key** | TS1117 ACTION_LABELS/ICONS/COLORS duplicate `INSPECTION_STATUS_UPDATED` | ✅ CLOSED — Commit `259f64b` |
| **W41 BGN-10-01** | legalReference Art.15–22 → Art.14–21 | ✅ CLOSED — Commit `a71438b` |
| **W51-SURV** | AIM GPL2 JORADP publication watch | 🟠 SURVEILLANCE — no code action until published |

**All phases closed through W91 + BGN-10-01. TSC 0 + Jest 1232/0 — 2026-08-19 12:34 WAT.**

**Only remaining human-input item: F-05 (set production URL in EAS secrets).**

**Next phase identifier: W92.**

---

## Stack Quick-Reference

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| DB (mobile) | expo-sqlite ≥15 / SDK 56 |
| Server | Express + Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Tests (mobile) | Jest + ts-jest (1232 tests) |
| Tests (server) | Jest + ts-jest + supertest (10 tests) |
| Build | EAS Build |
| Push | expo-server-sdk |
