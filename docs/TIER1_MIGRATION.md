> ⚠️ **PHASE C WARNING — READ BEFORE ACTING**
> Phase C of this guide recommends removing `@react-native-async-storage/async-storage` and `migrateAsyncStorageToSQLite()`.
> **DO NOT do this.** Per the Z10 decision (2026-08-06, logged in `docs/README.md`):
> `migrateAsyncStorageToSQLite()` is intentionally kept as an explicit field-upgrade tool for existing installs
> that may still have data in AsyncStorage. It is no longer auto-invoked at startup, but must not be deleted.
> Phases A and B of this guide are ✅ fully completed (Z5 + Z10). Phase C is superseded by the Z10 decision.
> **Single source of truth: `docs/STRATEGIC_PLAN.md`**

---

# Tier 1 — SQLite Migration Guide

This document covers everything the team needs to know to move SafeInspect
from AsyncStorage (JSON blobs) to a proper SQLite relational store.

---

## What was delivered

| Task | File(s) changed | Description |
|------|----------------|-------------|
| **1A** – SQLite schema | `src/db/schema.ts` | Full DDL for 6 tables, indexed queries, idempotent migration runner, AsyncStorage→SQLite copy helper |
| **1B** – Lat/lng guard | `src/repositories/FacilityRepository.ts` | `parseCoord()` coerces string coordinates to numbers and rejects out-of-range values before every write |
| **1C** – Photo backup | `src/services/BackupService.ts` | `BACKUP_VERSION` bumped to 2; `photoUriMap` field exports/re-links item photo URIs; v1 files still accepted |
| **1D** – This guide | `docs/TIER1_MIGRATION.md` | Step-by-step install, migration, and rollback instructions |

---

## Phase A — ✅ COMPLETED (Z5, 2026-08-06)

expo-sqlite installed and all 5 repositories confirmed on SQLite.

---

## Phase B — ✅ COMPLETED (Z5 + Z10, 2026-08-06)

All repositories swapped to SQLite. `getDb()` wired into app startup.
One-time migration function retained as explicit upgrade tool (see Phase C warning above).

---

## Phase C — ⛔ SUPERSEDED BY Z10 DECISION

> **Do NOT remove AsyncStorage or `migrateAsyncStorageToSQLite()`.**
> See Z10 decision in `docs/README.md` (2026-08-06 12:30 WAT entry).
> Existing field installs may still have AsyncStorage data; the migration function
> must remain available as an explicit upgrade path.

---

## Phase B — Repository swap order (completed)

All repositories swapped in this order per original plan:

1. `FacilityRepository` ✅
2. `AgendaRepository` ✅
3. `CorrectiveActionRepository` ✅
4. `InspectionRepository` ✅
5. `AuditLogRepository` + `NotificationRepository` ✅

---

## 1B — Lat/lng guard

The `parseCoord()` function in `FacilityRepository.ts` accepts `number | string | undefined`
and returns `number | undefined`.

Valid ranges enforced:
- latitude: −90 … 90
- longitude: −180 … 180

Anything outside these ranges (including `NaN`, `Infinity`, empty string) is
stored as `undefined` so the map marker is simply not rendered rather than
appearing at `(0, 0)` or crashing the MapView.

**Affected screens:** anywhere that calls `FacilityRepository.add()` or
`FacilityRepository.update()` with coordinates from a text input or
`expo-location` result.

---

## 1C — Photo URI backup (v2 format)

The backup file now includes a `photoUriMap` field:

```json
{
  "version": 2,
  "photoUriMap": {
    "<itemId>": "file:///data/…/photo.jpg",
    "<itemId>__photos": ["file:///…/a.jpg", "file:///…/b.jpg"]
  }
}
```

**Import behaviour:**
- v2 file on same device → URIs re-linked, photos display correctly.
- v2 file on new device → URIs point to non-existent paths; the app's
  existing missing-photo fallback handles this gracefully (no crash).
- v1 file → `photoUriMap` is absent; items keep whatever URIs were in the
  JSON; behaviour is identical to the previous release.

---

## Schema reference

| Table | Primary key | Key columns |
|-------|-------------|-------------|
| `inspections` | `id TEXT` | `facility_id`, `status`, `items_json` |
| `facilities` | `id TEXT` | `lat`, `lng` |
| `agenda` | `id TEXT` | `facility_id`, `status`, `date` |
| `corrective_actions` | `id TEXT` | `inspection_id`, `status`, `deadline` |
| `audit_log` | `id INTEGER AUTOINCREMENT` | `action`, `created_at` |
| `notifications` | `id TEXT` | `type`, `read_at`, `dismissed` |
| `_migrations` | `name TEXT` | `applied_at` |

Indexes created:
- `idx_inspections_facility_id`
- `idx_inspections_status`
- `idx_corrective_actions_inspection_id`

---

## Rollback

Because Phase A/B keeps AsyncStorage intact, rollback is trivial:

1. Remove the `getDb()` call from `_layout.tsx`.
2. Revert any repository files that were already swapped to SQLite.
3. Ship the previous build.

No data is lost — AsyncStorage was never cleared.
