# SafeInspect — README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-08-18 12:53 WAT — Perplexity — W64 ✅ + W66 ✅ CLOSED (real diffs) | W65 + W68 re-confirmed clean

**W64 — CLOSED.** [`a7f805d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/a7f805dd7ce4d255b66518538fcaa29389afa654)
`server/src/routes/sync.ts` — two enums fixed:
- `InspectionItemSchema.severity`: `z.enum(['low','medium','high'])` → `z.enum(['low','medium','high','critical'])`
- `InspectionSchema.status`: added `'submitted'`, `'pending-review'`, `'approved'`, `'rejected'`
- `mapStatus()` helper extended to map all 6 values; `APPROVED`/`REJECTED` now round-trip to Prisma.

**W66 — CLOSED.** [`4ed0db5`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/4ed0db5facafc2b1e038d8f8e5be860dd3bca76a)
`src/repositories/InspectionRepository.ts` — `updateStatus()` now:
1. Re-hashes the full updated blob: `const hash = await IntegrityService.hashAndStore(updated);`
2. Appends audit entry: `await AuditLogRepository.append('INSPECTION_STATUS_UPDATED', 'supervisor', { inspectionId: id, approvalStatus: status })`
3. Embeds new hash into `data` JSON before writing to SQLite.
Previously the method mutated both `data` and `approval_status` with no hash update and no audit trail.

**W65 — re-confirmed CLEAN (was correctly closed). Exact line proof:**
`src/services/BackupService.ts`, `exportBackup()`, line 106:
```ts
const inspections = await InspectionRepository.getAll(); // SQLite, not AsyncStorage
```
`importBackup()` restores via `InspectionRepository.save(inspection)`. No `AsyncStorage.setItem('inspections', …)` anywhere in production code. Claude's read was stale.

**W68 — re-confirmed CLEAN (was correctly closed). Exact line proof:**
`src/repositories/AuthRepository.ts` — all three counter methods:
```ts
getFailedAttempts:       secureGet(StorageKeys.PIN_FAILED_ATTEMPTS)    // SecureStore on native
incrementFailedAttempts: secureSet(StorageKeys.PIN_FAILED_ATTEMPTS, …)  // SecureStore on native
resetFailedAttempts:     secureDelete(StorageKeys.PIN_FAILED_ATTEMPTS)  // SecureStore on native
```
Where `secureGet/secureSet/secureDelete` route to `SecureStore.*Async()` when `isNative()` is true. AsyncStorage is the web-only fallback only.

**Gate pending:** user must run `npx tsc --noEmit && npx jest` locally and confirm green before W64/W66 close formally.

---

### 2026-08-18 12:04 WAT — Perplexity — Repo cleanup: 10 stale docs removed + STRATEGIC_PLAN collapsed
- **Deleted:** `SafeInspect_Audit_Consolidated_2026-08-06 (1).md`, `AUDIT_COVERAGE_REPORT.md`, `Inspection_Manual_Chapter1–8_*.md` (8 files) — all superseded by `legal_refs/` and STRATEGIC_PLAN
- **Updated:** `STRATEGIC_PLAN.md` — phases A–W59 collapsed into `<details>` archive block; W60–W85 remain visible
- **No code changes — TSC + Jest state unchanged:** TSC 0 + Jest 1245/0

### 2026-08-18 02:43 WAT — Perplexity — W85 ✅ CLOSED — TSC 0 + Jest 1245/0 all green
- Phases closed: W85 (SPEC 10 fix — StorageKeys + settings.tsx)
- Code commit: [`33e5cbf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/33e5cbfea01e98b01e582945cb5c6349f7ae2822) — `keys.ts` +7, `settings.tsx` +5
- Test fix: [`14b055c`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/14b055c733fc8163618063739505888cd5f17cec) — stale PRT-05-01 assertion updated (90-11 → 91-05)

### 2026-08-17 22:10 WAT — Perplexity — W82 CLOSED — Finding 3 PPE/machine-guard verified
- 6 criteria files audited. MCH-29-06 corrected (Commit `cee92fb`). PRT-05-01 corrected (Commit `8433bea`).

### 2026-08-17 19:21 WAT — Perplexity — W72 CLOSED — Dead settings toggles + notification centre
- TSC 0 + Jest all green. Commit `9b42f67`.

> **Older entries archived** — see git log or STRATEGIC_PLAN.md `<details>` block for full history.

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
│   └── __tests__/              # Jest test suite (1245 tests)
├── server/
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts
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
| **W64** | Sync schema severity+status (SPEC 08) | 🟡 GATE — awaiting user TSC+Jest confirm |
| **W66** | `updateStatus()` integrity+audit trail (SPEC 02) | 🟡 GATE — awaiting user TSC+Jest confirm |
| **W51** | AIM GPL2 JORADP publication watch | 🟠 SURVEILLANCE — no code action until published |

---

## Stack Quick-Reference

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| DB (mobile) | expo-sqlite (NOT WatermelonDB) |
| Server | Express + Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Tests (mobile) | Jest + ts-jest (1245 tests) |
| Tests (server) | Jest + ts-jest + supertest (10 tests) |
| Build | EAS Build |
| Push | expo-server-sdk |
