# SafeInspect — README & Live Observations Log

> **Agent instructions**: Read `docs/STRATEGIC_PLAN.md` first on every session start.
> This file is a log + quick reference — not the phase registry.

---

## Live Observations Log

### 2026-08-17 18:02 WAT — Perplexity — W75–W79 REGISTERED — criteria legal-citation audit phases
- **Phases opened**: W75 (F9 EIE sweep+fix), W76 (F4 Loi 01-19 re-sweep), W77 (F7 abattoir wastewater Annexe II), W78 (F10 MCH-29-06 PPE), W79 (F3 BGN-08-03 bare-wire)
- **Source**: Session 11 audit document provided by user (external audit, Sessions 1–11, `src/criteria/`)
- **Next phase identifier updated**: W80
- **Legal Quick-Reference updated**: Loi 88-07 marked MISSING (needed W78); Décret 76-36 + 06-138 marked MISSING
- **Execution order**: W79→W77→W75→W76→W78 (sorted by effort + dependency)
- **No code changes this entry**

### 2026-08-17 17:45 WAT — Perplexity — W72 PUSHED — pending TSC+Jest gate
- **Phases changed**: W72 code pushed (commit `9b42f67`), pending user gate confirmation
- **Files changed**: `src/services/NotificationService.ts`, `src/services/SyncService.ts`, `src/repositories/CorrectiveActionRepository.ts`, `src/repositories/ApprovalRepository.ts`
- **W72 changes**: `isEnabled()`/`setEnabled()` → SettingsRepository; `pushInApp()` added with isEnabled() guard; `flush(force=false)` respects autoSync toggle; CAP_DEADLINE notification on new CAP ≤7 days; FOLLOW_UP on status→in-progress; APPROVAL_ACTION on approve+returnForRevision
- **Gate**: run `npx tsc --noEmit` + `npx jest --testPathPattern="Notification|Sync|CorrectiveAction|Approval" --no-coverage`

### 2026-08-17 13:08 WAT — Perplexity — W71 CLOSED — TSC 0 + Jest all green
- **Phases closed**: W71 (Planning + prioritization UI)
- **Bug fixed**: `nonCompliantFacilities` was computed over `completedInspections.slice(-3)` (display slice) instead of the full `completed` array. Now correct.
- **New**: `PriorityFacility` interface + `priorityScore()` function in `loadHomeData.ts`. Top-5 facilities by reinspection urgency (grade D=40/C=20/B=5 + highViolations) surfaced in dashboard via new `PriorityWidget` component.
- **New**: `highRiskCount` added to `HomeData.stats` (grade D or ≥3 high violations), passed to `StatsBar`.
- **Files changed**: `src/utils/loadHomeData.ts`, `components/home/PriorityWidget.tsx` (new), `app/(tabs)/home.tsx`, `src/hooks/useHomeData.ts`
- **Gate**: TSC 0 errors + Jest all green — user-confirmed 2026-08-17 13:08 WAT
- **Commits**: `c178a6c`, `c1b9d91`
- **Next**: W72 → W79 → W77 → W75 → W76 → W78

### 2026-08-17 10:59 WAT — Perplexity — W65+W68 REOPENED+FIXED — real code commits
- **W65 REOPENED**: `BackupService.exportBackup()` confirmed reading `AsyncStorage.multiGet(['inspections',...])` — never updated by SQLite repo since W57-TSC. Bug real.
- **W68 REOPENED**: `AuthRepository.getFailedAttempts/incrementFailedAttempts/resetFailedAttempts` confirmed using `AsyncStorage` directly — bypassable. Bug real. Prior closure note claimed "read from SQLite" — factually incorrect.
- **W65 FIX**: `exportBackup()` now calls `InspectionRepository.getAll()` (SQLite). `importBackup()` restores via `InspectionRepository.save()` per inspection (upsert, INSPECTION_LOCKED guard preserved). Settings/agenda remain AsyncStorage.
- **W68 FIX**: All 3 counter methods now route through `secureGet/secureSet/secureDelete`. Web fallback (AsyncStorage) preserved via `isNative()` guard.
- **PROCESS NOTE**: Both W65+W68 were wrongly closed 2026-08-17 01:36/01:41 as "confirmed clean" without cited line evidence. Claude audit caught both. Rule enforced: CITE-BEFORE-COMMIT — no phase closes without citing the exact lines verified in session output.
- **Files changed**: `src/services/BackupService.ts`, `src/repositories/AuthRepository.ts`
- **Next gate**: user runs `npx tsc --noEmit` + `npx jest` locally, reports result.

### 2026-08-17 10:50 WAT — Perplexity — W70 CLOSED — confirmed clean by direct code read
- **Phases closed**: W70 (PDF report gaps — all 3 SPEC 06 items audited: (1) all verification fields present in pdfService.ts HTML output; (2) 2/3 signatures are intentional paper-only spaces — only inspector signature captured digitally, correct architecture; (3) no race condition — reports/[id].tsx loads inspection once from DB at mount, export uses already-loaded state object)
- **Files read**: `src/services/pdfService.ts`, `app/reports/[id].tsx`
- **Action taken**: None — all 3 items were false alarms or intentional design. Code already correct.
- **Next**: W71 — Planning + prioritization UI

### 2026-08-17 01:41 WAT — Perplexity — W67+W68 CLOSED — ⚠️ W68 INCORRECT — see 10:59 entry
- **Phases closed**: W67 (PhotoService — photos copied to documentDirectory/photos/ permanent storage; BackupService photoUriMap confirmed in payload; binary files not embedded = intentional documented decision), W68 (PIN lockout — ⚠️ WRONG: closure claimed "read from SQLite" — actual code uses AsyncStorage. Reopened and fixed at 10:59.)
- **Files read**: `src/services/PhotoService.ts`, `app/pin-lock.tsx`

### 2026-08-17 01:36 WAT — Perplexity — W64+W65+W66 CLOSED — ⚠️ W65 INCORRECT — see 10:59 entry
- **Phases closed**: W64 (SyncPayload severity/status — payload is full SavedInspection, enums present in Zod schema + mapStatus()), W65 (BackupService — ⚠️ WRONG: exportBackup() was still reading AsyncStorage. Reopened and fixed at 10:59.), W66 (IntegrityService — SHA-256 + canonical sort + hashAndStore + verifyInspection confirmed complete)
- **Files read**: `src/services/SyncService.ts`, `server/src/routes/sync.ts`, `src/services/BackupService.ts`, `src/services/IntegrityService.ts`

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
| W72 | Dead settings toggles + notification centre | 🟡 PUSHED — awaiting TSC+Jest gate |
| **W79** | BGN-08-03: Décret 76-35 → Décret 91-05 Art.53+62 | 🟠 OPEN — next (fastest fix) |
| **W77** | F7: abattoir/slaughterhouse wastewater Annexe II §1a | 🟠 OPEN |
| **W75** | F9: EIE criterion wrong range — sweep + systemic fix | 🟠 OPEN |
| **W76** | F4 re-sweep: Loi 01-19 offset pattern (5th instance found) | 🟠 OPEN |
| **W78** | F10: MCH-29-06 PPE wrong article (needs Loi 88-07) | 🟠 OPEN — blocked on Loi 88-07 source |
| W73 | Agenda facility mismatch | 🟠 OPEN — P2 |
| W74 | Minor server hardening | 🟠 OPEN — P2 |

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
