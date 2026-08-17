# SafeInspect — README & Live Observations Log

> **Agent instructions**: Read `docs/STRATEGIC_PLAN.md` first on every session start.
> This file is a log + quick reference — not the phase registry.

---

## Live Observations Log

### 2026-08-17 01:41 WAT — Perplexity — W67+W68 CLOSED — confirmed clean by direct code read
- **Phases closed**: W67 (PhotoService — photos copied to documentDirectory/photos/ permanent storage; BackupService photoUriMap confirmed in payload; binary files not embedded = intentional documented decision), W68 (PIN lockout — isLockedOut() + getFailedAttempts() read from SQLite on every mount; keypad fully disabled after MAX; biometric blocked if locked; no bypass vector found)
- **Files read**: `src/services/PhotoService.ts`, `app/pin-lock.tsx`
- **Action taken**: None — both phases were false alarms from stale doc claims. Code already correct.
- **Next**: W69 — CAP evidence + lifecycle

### 2026-08-17 01:36 WAT — Perplexity — W64+W65+W66 CLOSED — confirmed clean by direct code read
- **Phases closed**: W64 (SyncPayload severity/status — payload is full SavedInspection, enums present in Zod schema + mapStatus()), W65 (BackupService — export v2 + photoUriMap + import with v1 compat confirmed complete), W66 (IntegrityService — SHA-256 + canonical sort + hashAndStore + verifyInspection confirmed complete)
- **Files read**: `src/services/SyncService.ts`, `server/src/routes/sync.ts`, `src/services/BackupService.ts`, `src/services/IntegrityService.ts`
- **Action taken**: None — all three phases were false alarms from stale doc claims. Code already correct.
- **Next**: W67 — photo evidence backup+sync payload gap

### 2026-08-16 22:44 WAT — Perplexity — W61+W62+W63 CLOSED — 10/10 Jest PASS
- **Phases closed**: W61 (routes mounted + by-inspectionId routes), W62 (path-prefix confirmed clean), W63 (ID semantics resolved)
- **Files changed**: `server/src/routes/approvals.ts`, `server/src/index.ts`, `server/src/__tests__/approvals.test.ts`, `server/package.json`
- **Jest**: 10/10 PASS — approvals suite (route mounting, by-inspectionId approve/reject, legacy /:id/approve, 404/400 guards)
- **Next**: W64 — sync schema severity+status enums missing from SyncPayload
- **Commits**: `13b750a`, `24270ca`, `0a27026`, `[docs commit]`

### 2026-08-16 21:00 WAT — Perplexity — W60 CLOSED — loi-18-11 split 3 parties
- **Phases closed**: W60
- **Files changed**: `legal_refs/loi-18-11-sante-partie1-arts1-164.md`, `legal_refs/loi-18-11-sante-partie2-arts165-264.md`, `legal_refs/loi-18-11-sante-partie3-arts265-450.md`
- **Critical finding**: loi-18-11-sante.md (189KB) was truncating at ~70% in API. Now split in 3 readable parts. SPLIT FILES REGISTRY updated.
- **Commit**: `698a793` (user PowerShell push)

### 2026-08-11 14:27 WAT — Perplexity — W57-TSC CLOSED — InspectionRepository overhaul
- Phases closed: W57-TSC / Files: `src/repositories/InspectionRepository.ts` + tests
- Gate: 31/31 Jest PASS + TSC 0 — user-confirmed

### 2026-08-11 00:30 WAT — Perplexity — W49+W57+W58+W19+F-01 CLOSED
- 11 criteria files confirmed clean. legal_refs 34/34 VÉRIFIÉ. semiPharma + bakery legal fixes.
- Gate: TSC 0 + Jest all green.

### 2026-08-10 — Perplexity — W41–W50 CLOSED
- Legal citation fixes (BGN, SLH, GPL). CLEANUP_LOG.md added. Jest gates all green.

### 2026-08-09 — Perplexity — W22–W40 CLOSED
- F-11 immutability, F-18 approval workflow, F-14 status labels, F-09 autosave, legal cross-ref fixes.

### 2026-08-08 — Perplexity — W4–W31 phases (legal + UX)
- HACCP citations, BGN/BAK legal fixes, Loi 19-02 incendie scope confirmed.

### 2026-08-07 — Perplexity — W1+W2+G18 CLOSED
- getDb() race guard, chevron bug, severity type widening. Jest 1234/0.

### 2026-08-06 — Perplexity — Z–Z12 CLOSED
- SQLite migration, AsyncStorage removal, rubrique wiring, audit findings F-01→F-18.

### 2026-08-05 — Perplexity — V CLOSED — TSC zero-error pass
- `npx tsc --noEmit` → 0 errors. User-confirmed.

### 2026-08-04 — Perplexity — L,M,N,O,P,Q,S,T,U CLOSED
- Criteria impl, scoring, PDF, CAP, stats, reinspection screen, legal verify, UX polish.

### 2026-07-30 — Perplexity — A–I CLOSED
- Scoring engine + 8 manual chapters pushed to docs.

---

## Repository Map

```
SafeInspect-APP/
├── app/                        # Expo Router screens
├── src/
│   ├── criteria/               # 20+ criteria files (one per facility type)
│   ├── repositories/           # SQLite repositories (InspectionRepository, etc.)
│   ├── services/               # SyncService, pdfService, serverAuth, apiClient
│   ├── utils/                  # scoringUtils, statsUtils, decisionSupport
│   └── __tests__/              # Jest test suite (1234+ tests)
├── server/
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts (Expo push)
│   │   └── __tests__/         # approvals.test.ts (10 tests — W61)
│   └── package.json            # jest + ts-jest + supertest added (W61)
├── docs/
│   ├── README.md               # This file
│   ├── STRATEGIC_PLAN.md       # Phase registry (source of truth)
│   ├── criteria-audit/         # Audit logs per criteria file
│   └── decisions/DECISIONS.md  # Architecture decisions
└── legal_refs/                 # Algerian legal texts (verbatim)
    ├── loi-18-11-sante-partie1-arts1-164.md   # Split W60
    ├── loi-18-11-sante-partie2-arts165-264.md # Split W60
    └── loi-18-11-sante-partie3-arts265-450.md # Split W60
```

---

## Current Sprint Status

| P0 Phase | Title | Status |
|---|---|---|
| W61 | Server routes mounted + by-inspectionId | ✅ CLOSED 2026-08-16 |
| W62 | Path-prefix alignment | ✅ CLOSED 2026-08-16 |
| W63 | Approval ID semantics | ✅ CLOSED 2026-08-16 |
| W64 | Sync schema severity+status | ✅ CLOSED 2026-08-17 — confirmed clean by direct read |
| W65 | Backup/restore storage layer | ✅ CLOSED 2026-08-17 — confirmed clean by direct read |
| W66 | Integrity/audit trail | ✅ CLOSED 2026-08-17 — confirmed clean by direct read |
| W67 | Photo evidence backup+sync | ✅ CLOSED 2026-08-17 — confirmed clean by direct read |
| W68 | PIN lockout bypassable | ✅ CLOSED 2026-08-17 — confirmed clean by direct read |
| **W69** | CAP evidence + lifecycle | 🟠 OPEN — next |

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
