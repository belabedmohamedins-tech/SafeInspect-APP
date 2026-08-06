# SafeInspect — Strategic Plan & Phase Registry

> This is the single source of truth for phase numbering and execution order.
> Before opening a new phase, read this file to find the highest existing letter/number.
> Claude and Perplexity coordinate through this file — not through memory.

---

## Phase Registry

### ✅ CLOSED Phases

| Phase | Title | Closed | Evidence |
|---|---|---|---|
| A | Scoring engine + types | 2026-07-30 | `src/utils/scoringUtils.ts`, `src/types/` confirmed present |
| B–I | Manual chapters (Ch1–Ch8) | 2026-07-30 | `docs/Inspection_Manual_Chapter*.md` |
| L | Criteria implementation in app code | 2026-08-04 | 20 files in `src/criteria/` |
| M | Scoring integration | 2026-08-04 | `scoringUtils.ts` severity-weighted A/B/C/D grades |
| N | Report generation | 2026-08-04 | `pdfService.ts` 54 KB Arabic RTL |
| O | Corrective actions tracking | 2026-08-04 | Full CAP pipeline confirmed |
| P | Statistics / dashboard | 2026-08-04 | `statsUtils.ts`, `loadHomeData.ts` |
| Q | UI screens — Reinspection | 2026-08-04 | `app/screens/reinspection.tsx` + `_layout.tsx` |
| R | Jest gate | 2026-08-06 | 119 passed / 0 failed / 1315 tests |
| S | Legal — Loi 19-02 fire safety | 2026-08-04 | JORADP verified |
| T | Legal — Décret 06-138 air quality | 2026-08-04 | 16 params + 7 sectors |
| U | UX polish | 2026-08-04 | 3 RTL bugs fixed. Commit 239811b |
| V | TSC zero-error pass | 2026-08-05 | User-confirmed 23:45 WAT |
| W | Legal verification (5 source gaps) | 2026-08-06 | 0 [À VÉRIFIER] in codebase |
| X | i18n screen wire-up (5 screens) | 2026-08-06 | TSC 0 + Jest 119/0 gate passed |
| Y | Air-emissions criteria (5 factories) | 2026-08-06 | All criteria already present by live read |
| Z | Fix wrong Décret 22-167 citation | 2026-08-06 | Already fixed in prior session. Confirmed clean. |
| Z2 | Fix wrong 85 dB noise citation | 2026-08-06 | Already fixed in prior session. Confirmed clean. |
| Z3 | Resolve 3 duplicate license criteria | 2026-08-06 | Not duplicates. Each facility-specific. No action. |
| Z4 | Fix PRD-02-01 missing numericField | 2026-08-06 | Already split (PRD-02-01 + PRD-02-01b). Confirmed. |

---

### 🔴 OPEN — Phase Z5: SQLite Repository Migration

**Status: ⏳ CODE COMMITTED — GATE PENDING**
**Owner:** Claude runs `npx tsc --noEmit` + `npx jest` gate.
**Commit:** `e835dea4e124fad78607d37d6dba0c6d30034afe`

#### What was implemented (Perplexity, 2026-08-06 02:09 WAT)

All 5 repositories migrated from AsyncStorage → expo-sqlite in one commit:

| Repository | Strategy | Business logic |
|---|---|---|
| `FacilityRepository` | Full SQLite CRUD | Coord sanitization (1B fix) preserved |
| `AgendaRepository` | Full SQLite CRUD | Notification sync preserved |
| `CorrectiveActionRepository` | Full SQLite CRUD | Overdue escalation via SQL UPDATE |
| `AuditLogRepository` | Full SQLite CRUD | Ring-buffer 500 via SQL DELETE |
| `NotificationRepository` | Full SQLite CRUD | Ring-buffer 200 via SQL DELETE |
| `InspectionRepository` | SQLite primary + one-time AsyncStorage migration | All business logic (hash, annotation, CAP, approval) preserved |

#### Key design decisions
- **Dual-write NOT used** — SQLite is the single write source from now.
- **One-time migration**: `InspectionRepository` calls `migrateAsyncStorageToSQLite()` once on first `getAll()`. Guard flag `_migrated` prevents re-runs.
- **`ON CONFLICT(id) DO UPDATE`** used throughout — upsert pattern matches old insert/replace behavior.
- **AsyncStorage imports fully removed** from all 5 repos (except `schema.ts` which still holds the migration function for Z10 cleanup).
- **No public API changes** — all callers work without modification.

#### Gate required from Claude
```bash
npx tsc --noEmit      # must be 0 errors
npx jest              # must be ≥ 119 passed, 0 failed
```

If gate passes: close Z5 in this file + README. If failures: log them as Z5-FIX items.

---

### 🔵 DEFERRED Phases

| ID | Title | Blocker |
|---|---|---|
| Z6 | Décret 09-19 rollout across all "approved operator" criteria | Full criteria audit needed |
| Z7 | `facilityCategoriesFull.json` domain review | Domain expert needed |
| Z8 | `BGN-03-06` septic pumping frequency legal source | Find or remove |
| Z9 | Server E2E integration test (`/sync`) | Needs running server |
| Z10 | AsyncStorage cleanup (remove `schema.ts` migration + `AsyncStorage` import) | After Z5 stable for ≥1 release cycle |

---

## Phase Numbering Convention
- A–Z + Z2–Z5 registered.
- Next available: **Z6** (deferred above) or new letter after Z5 closes.
- Never reuse a closed phase.
- Read this file before opening any new phase.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Cold-chain temps (restaurants) | Arrêté interminist. 07/05/2025 | Full text | ✅ VERIFIED |
| Cold storage temps | Arrêté interminist. 21/11/1999 | Temperature table | ✅ VERIFIED |
| Occupational health — medical exam | Décret 93-120 | Art. periodicité | ✅ VERIFIED |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |
