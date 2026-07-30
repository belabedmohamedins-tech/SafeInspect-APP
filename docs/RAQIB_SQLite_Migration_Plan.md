# RAQIB — SQLite Migration Plan (G12, Phase B)
## Grounded in the actual state of `src/db/schema.ts`, verified live

**This is better-positioned than the manuscript's earlier framing suggested.** Phase A
isn't dormant, unused code — `app/_layout.tsx` calls `initializeDatabase()` on every app
launch, gating the splash screen until it completes. The SQLite database is being created
and migrated in production right now. It's just empty: no repository reads or writes to
it yet, so it exists in parallel with AsyncStorage, doing nothing.

## What Phase A already has (confirmed live, `src/db/schema.ts`)

- A real, idempotent migration runner (`_migrations` tracking table, `runMigrations()`)
- 6 tables: `inspections`, `facilities`, `agenda`, `corrective_actions`, `audit_log`,
  `notifications` — with 3 indexes already in place (`inspections.facility_id`,
  `inspections.status`, `corrective_actions.inspection_id`)
- A working data-migration helper, `migrateAsyncStorageToSQLite()`, that already handles
  **3 of the 6 tables**: inspections, facilities, agenda
- `inspections`' schema embeds approval fields directly (`approval_status`, `approved_by`,
  `approved_at`, `returned_reason`, `approval_note`) rather than a separate `approvals`
  table — a reasonable 1:1 design choice, not a gap

## What's missing before Phase B can start safely

1. **`migrateAsyncStorageToSQLite()` doesn't yet cover `corrective_actions`, `audit_log`,
   or `notifications`** — the tables exist, the migration function doesn't populate them.
2. **No `settings` table.** `SettingsRepository` (used for onboarding status, office
   name, inspector name, etc. — confirmed load-bearing, `app/_layout.tsx` itself calls
   `SettingsRepository.getAll()` in the onboarding-guard logic) has nowhere to go yet.
3. **No `users`/auth table**, but this is very likely intentional, not a gap — PIN/session
   data belongs in `expo-secure-store`, not a plain SQLite file, for the same reason
   `AuthRepository` presumably already avoids AsyncStorage for this. Confirm this
   assumption before excluding it, but don't migrate PIN data into SQLite by default.

## Phased plan

### B.0 — Close the data-migration gaps (prerequisite, do first)

Extend `migrateAsyncStorageToSQLite()` with 3 more blocks, following the exact pattern
already used for inspections/facilities/agenda (read AsyncStorage key → `INSERT OR
IGNORE` per row → `onProgress?.()` callback):

- `corrective_actions` — from whatever AsyncStorage key `CorrectiveActionRepository`
  currently uses.
- `audit_log` — note this table has an `INTEGER PRIMARY KEY AUTOINCREMENT` id, unlike
  the others' `TEXT PRIMARY KEY`; the migration needs to omit `id` from the insert and
  let SQLite assign it, rather than reusing AsyncStorage's original ids.
- `notifications` — from `NotificationRepository`'s AsyncStorage key.

Add a `settings` table (simple key-value, matching `SettingsRepository`'s existing shape)
and a matching migration block:

```sql
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
```

### B.1 — Migrate repositories in dependency order, one at a time

Recommended order, easiest/lowest-risk first, so any problems surface on a low-stakes
repository before touching the ones handling legal-record data:

1. **`SettingsRepository`** — simplest shape (key-value), no foreign keys, low risk if
   something goes wrong (worst case: onboarding re-triggers).
2. **`NotificationRepository`** — no cross-references to other tables, append-mostly.
3. **`AuditLogRepository`** — append-only, `AUTOINCREMENT` id already suits this well.
4. **`FacilityRepository`** — referenced by inspections/agenda but not the reverse; safe
   to migrate before those.
5. **`AgendaRepository`** — references `facility_id`; migrate after Facility.
6. **`CorrectiveActionRepository`** — references `inspection_id`; migrate after
   Inspection (next).
7. **`InspectionRepository`** — highest risk, most complex (the `items_json` blob, the
   integrity hash, the approval-embedded fields). Migrate last, after every dependency
   is proven stable.
8. **`ApprovalRepository`** — doesn't need its own table migration (approval fields live
   on `inspections`); just needs its read/write methods repointed once
   `InspectionRepository` is migrated.

**For each repository, in order:**
- Add a feature flag or explicit `USE_SQLITE_<NAME>` constant (even a simple hardcoded
  boolean per repository during development) so repositories can be switched
  independently rather than all-or-nothing.
- Rewrite the repository's methods to read/write SQLite instead of AsyncStorage,
  preserving the exact same public method signatures — every call site elsewhere in the
  app should need zero changes.
- Run the existing Jest suite for that repository (confirmed ~98.7% coverage exists per
  the live roadmap — use it) against the new implementation.
- Manually smoke-test the corresponding screens.
- Only move to the next repository once this one is confirmed stable for a few real days
  of use, not just passing tests.

### B.2 — One-time migration trigger

`migrateAsyncStorageToSQLite()` needs to actually be called somewhere — confirmed live
this session that it currently isn't referenced from `app/_layout.tsx` or anywhere else
checked. Recommend:
- A version-gated one-time trigger (e.g. a `migration_v1_done` key in the new `settings`
  table, checked once at startup, similar to the existing onboarding-check pattern in
  `_layout.tsx`).
- Should run *after* `initializeDatabase()` succeeds and *before* any repository starts
  reading from SQLite in Phase B's per-repository switch.
- Should not delete AsyncStorage data — this is already correctly designed into the
  function's doc comment ("does NOT delete AsyncStorage data — remains as a safety net
  until Phase C cleanup"). Keep that property.
- Consider a visible migration screen/progress indicator for the one-time run, given
  `onProgress` callback support already exists in the function signature — it's designed
  to support this, just not wired to any UI yet.

### B.3 — Phase C (only after B is fully done and stable)

Remove AsyncStorage imports and the migration helper itself. Not worth planning in detail
now — this is straightforward cleanup once B is proven, not a design decision.

## Risk notes specific to this codebase

- **`items_json` and `violations_json` are serialized blobs**, not normalized columns.
  This means SQL queries can't filter/sort by individual `InspectionItem` fields without
  deserializing in application code first — acceptable for now (mirrors AsyncStorage's
  existing behavior exactly), but worth flagging as a future normalization opportunity if
  query performance ever becomes a concern at scale.
- **The integrity hash (`integrity_hash` column) is a legal-evidence feature** — the
  SQLite migration must not touch a record's hash-relevant fields in a way that would
  invalidate a previously-computed SHA-256 hash. Since the migration is a straight
  JSON→row copy of existing data (not a re-serialization with different field ordering
  or formatting), this should be safe, but it's worth an explicit test: migrate a signed,
  approved inspection, recompute its hash from the SQLite-stored data, and confirm it
  still matches the original.
- **The server/SQLite schema comparison — now done, both fetched fresh and compared
  field by field.** Confirmed real, concrete mismatches, not just a theoretical risk.
  See the new §"Server ↔ SQLite Schema Comparison" below for the full findings — this
  is now much more specific than "worth checking."

## Server ↔ SQLite Schema Comparison (completed this revision)

Both `server/prisma/schema.prisma` and `src/db/schema.ts` were fetched fresh and compared
field by field. Facility, CorrectiveAction, and AgendaItem all match cleanly (naming
convention differs — camelCase vs snake_case — but every field has a direct 1:1
counterpart, and the design choice of embedding approval fields on `Inspection` rather
than a separate table is consistent on both sides). **`Inspection` has several real
mismatches that need explicit handling in the sync layer — not naming-only, some are
structural:**

| Field | Prisma (server) | SQLite (mobile) | Risk |
|---|---|---|---|
| Status values | Enum: `COMPLETED`, `IN_PROGRESS`, `DRAFT` (uppercase, underscore) | `TEXT`, actual app values (per `types.ts`'s `SavedInspection.status`) are `'completed'`, `'in-progress'`, `'draft'` (lowercase, hyphenated) | **High** — a naive string pass-through in the sync layer would silently fail every status comparison/filter server-side. Needs an explicit case/format mapping function, not an assumption that the strings match. |
| Approval status values | Enum: `PENDING`, `APPROVED`, `RETURNED`, `ESCALATED` | `TEXT`, mobile's actual casing/format not independently re-confirmed this pass — check `ApprovalRepository.ts`'s literal status strings before assuming they match the server's uppercase enum | **High, same shape as above** — flag, not yet confirmed either way. |
| Violation counts | 4 separate denormalized columns: `violationsHigh`, `violationsMedium`, `violationsLow`, `violationsTotal` | 1 column, `violations_json` (a serialized `ViolationSummary` blob) | **Medium-high** — the sync layer must parse the JSON blob and split it into 4 columns when pushing to the server (or vice versa when pulling), not just copy a field. This is exactly the kind of change a straightforward "copy row to server" implementation would silently get wrong. |
| Coordinates | `latitude`, `longitude` (top-level fields) | `coordinates_lat`, `coordinates_lng` | **Low** — different names, same shape, trivial to map, but still needs an explicit mapping rather than an assumed pass-through. |
| Committee members | `String[]` (native Postgres array) | `TEXT` (JSON-serialized array, per `committee_members`'s comment) | **Medium** — needs explicit `JSON.parse`/`JSON.stringify` at the sync boundary, not a direct assignment. |
| `inspectorId` | Required foreign key to `Inspector` | **No equivalent column at all** in SQLite | **Medium** — expected, given the mobile app is single-device/single-inspector locally, but the sync layer must inject the authenticated inspector's server-side ID when pushing, since the server's schema requires it and the mobile row has nothing to supply it from directly. Confirm `SyncService.ts` already does this (it should, since sync requires auth) rather than assuming. |
| `syncedAt` | Present (`DateTime @default(now())`) | **No equivalent column** in the `inspections` table | **Low** — a "last synced" timestamp exists server-side but not locally; not necessarily a problem (the server can just use its own receipt time), but worth deciding deliberately rather than by omission. |

**A separate, more structural finding:** the server's Prisma schema has **no model at all**
for audit-log entries or notifications — `src/db/schema.ts`'s `audit_log` and
`notifications` tables have no server-side counterpart whatsoever. For notifications this
is probably fine (a local, device-specific concept). **For the audit log, this is worth a
deliberate decision, not a silent gap** — if audit-log entries are ever meant to be a
centralized, tamper-evident legal record (which is exactly what `AuditLogRepository` is
for, per its role in this project's legal-defensibility design), they currently have
nowhere to sync to. Recommend either adding an `AuditLog` model to the Prisma schema
before Phase B reaches `AuditLogRepository`, or making an explicit, documented decision
that audit logs stay device-local only (which would itself be worth reconsidering, given
the legal-defensibility purpose of the feature).

**Practical recommendation:** before Phase B reaches `InspectionRepository` (step 7 in
the migration order above — deliberately last, for exactly this reason), write the
explicit mapping/transformation functions for status casing, approval-status casing,
violations JSON↔columns, and coordinates naming, and unit-test them directly, rather than
discovering these mismatches live during the first real sync attempt.

## What this plan deliberately doesn't cover

Exact SQL diffs for every repository method — that's a large amount of code, is
mechanical once the pattern is set (repository 1 in the order above establishes the
pattern; the rest largely repeat it with different table/column names), and is better
done incrementally by whoever implements it than drafted speculatively here. This
document is the sequencing and risk plan; the per-repository rewrites should follow
`SettingsRepository`'s completed version as the template once B.1 step 1 is done.
