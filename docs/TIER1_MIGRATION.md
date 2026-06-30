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

## Phase A — Install (do this now)

```bash
# 1. Add expo-sqlite
npx expo install expo-sqlite

# 2. Verify it appears in package.json dependencies
grep expo-sqlite package.json
```

`expo-sqlite` ships with Expo 50+ and works on Android, iOS, and web
(web uses an Origin-Private FileSystem OPFS backend).

---

## Phase B — Initialise DB at app startup

Call `getDb()` once at startup (e.g. in `app/_layout.tsx`) so that migrations
run before any screen renders:

```tsx
// app/_layout.tsx
import { getDb } from '../src/db/schema';

useEffect(() => {
  getDb().catch(console.error);
}, []);
```

This is **additive only** — no existing AsyncStorage reads are broken.

---

## Phase B — One-time data migration

Run `migrateAsyncStorageToSQLite()` from a dedicated migration screen shown
once to the user on first launch after the upgrade:

```tsx
import { migrateAsyncStorageToSQLite } from '../src/db/schema';

await migrateAsyncStorageToSQLite(step => {
  setProgress(step); // update a progress bar
});
```

The function uses `INSERT OR IGNORE` so running it twice is safe.
Old AsyncStorage data is **not deleted** — it remains as a fallback until
Phase C.

---

## Phase B — Repository swap order (recommended)

Swap repositories one at a time, test each before moving to the next:

1. `FacilityRepository` — simplest shape, no linked tables
2. `AgendaRepository` — no FK constraints yet
3. `CorrectiveActionRepository` — references `inspections.id`
4. `InspectionRepository` — most complex; swap last
5. `AuditLogRepository` + `NotificationRepository` — append-only, low risk

The `_migrations` table ensures that adding new columns via `ALTER TABLE`
in future migrations will not affect rows written today.

---

## Phase C — Cleanup (after SQLite is stable)

Once all repositories have been verified on SQLite for at least one release cycle:

```bash
# Remove AsyncStorage from dependencies if nothing else uses it
npm uninstall @react-native-async-storage/async-storage
```

Also remove the `migrateAsyncStorageToSQLite` function from `schema.ts` and
the one-time migration screen.

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
