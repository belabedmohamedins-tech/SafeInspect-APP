# SPEC 01 — Backup/Restore reads and writes the wrong storage layer
Priority: P0. Dependencies: none.

## Problem
Inspections, facilities, agenda, corrective actions, and the audit log all
live in SQLite (`src/db/schema.ts`, migrations `001_*`). But
`src/services/BackupService.ts` (`exportBackup` / `importBackup`) reads and
writes ONLY the legacy AsyncStorage keys (`inspections`, `agenda`,
`userFacilities`, plus settings keys). The one-time migration function
`migrateAsyncStorageToSQLite()` in `src/db/schema.ts` exists but is called
nowhere in the live app (confirmed via repo-wide grep — only referenced in
its own file and a code comment).

## Current behavior
1. Inspector taps "Export Backup" (`app/screens/backup.tsx` → `exportBackup()`).
2. `exportBackup()` calls `AsyncStorage.multiGet([...])` for keys that are no
   longer the source of truth.
3. Resulting JSON backup contains empty or stale arrays for `inspections`,
   `agenda`, `userFacilities` — the real records are in SQLite and are never
   read.
4. `corrective_actions` and `audit_log` SQLite tables are not represented in
   the backup payload AT ALL (no corresponding AsyncStorage key ever existed
   for them).
5. `importBackup()` writes restored data back into the same AsyncStorage
   keys — even a correct backup file would not repopulate the SQLite tables
   the rest of the app actually queries.

## Desired behavior
- `exportBackup()` reads from SQLite via the existing repositories
  (`InspectionRepository.getAll()`, `FacilityRepository.getAll()`,
  `AgendaRepository.getAll()`, `CorrectiveActionRepository.getAll()`,
  `AuditLogRepository.getAll()`) and settings from `SettingsRepository`.
- `importBackup()` writes restored records back through the same
  repositories' `save()`/upsert methods, not raw AsyncStorage keys.
- Backup payload version bumped (e.g. `BACKUP_VERSION = 2`); `importBackup()`
  keeps a compatibility path for `version === 1` files that still reads the
  old AsyncStorage shape, so existing user backups aren't orphaned.
- `corrective_actions` and `audit_log` become first-class sections of the
  backup payload.

## Reason
This is the disaster-recovery mechanism for an offline-first field app on
inspector-owned devices. As implemented, it currently protects nothing —
confirmed by tracing both `exportBackup()` and `importBackup()` against the
actual SQLite schema.

## Affected files
- `src/services/BackupService.ts` (primary rewrite)
- `app/screens/backup.tsx` (update `ImportResult` display if payload shape
  changes — check current usage of `result.inspections` etc.)
- `src/db/schema.ts` (`migrateAsyncStorageToSQLite` can likely be deleted
  once export/import are fixed, or kept only as a one-time upgrade path for
  pre-SQLite installs — confirm with maintainer before deleting)

## Not in scope for this spec
Photo binary data in backups — see `04_SPEC_photo_evidence_sync.md`.
Integrity-hash inclusion in backups — see `02_SPEC_integrity_and_audit_trail.md`.

## Existing test coverage is miscalibrated — read before writing new tests
`src/__tests__/BackupService.test.ts` (25+ tests) is thorough but every
single test seeds and asserts directly against `AsyncStorage`
(`AsyncStorage.multiSet([['inspections', ...]])`, then
`AsyncStorage.getItem('inspections')` after import). None seed data via
`InspectionRepository`/SQLite and check whether `exportBackup()` picks it
up. The suite is internally consistent with the *current, broken*
implementation, so it passes today and gives false confidence. Once this
spec's fix lands (export/import reading through the repositories), most of
these existing tests will start failing because they assert against a
storage layer the fixed code no longer touches — **that's expected and
correct, not a regression to chase.** Rewrite the seed/assert calls to go
through repositories rather than patching the fix to keep the old
AsyncStorage-based tests green.

## Tests required
- Round-trip test: seed SQLite via repositories → `exportBackup()` →
  `clear()` all tables → `importBackup()` → assert all records restored
  (inspections, facilities, agenda, corrective actions, audit log count).
- Legacy-format test: construct a `version: 1` payload matching the OLD
  AsyncStorage shape, confirm `importBackup()` still restores it correctly
  into SQLite (backward compatibility for existing user backup files).
- Negative test: `approval_status = 'approved'` inspection round-trips
  without violating `INSPECTION_LOCKED` on re-import (import should be
  treated as a restore, not a normal `save()` — confirm it doesn't throw).
