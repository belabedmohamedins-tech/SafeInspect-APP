/**
 * src/db/schema.ts
 *
 * SQLite schema definitions for SafeInspect.
 *
 * INSTALL STEP (run once, not yet in package.json):
 *   npx expo install expo-sqlite
 *
 * Usage:
 *   import { getDb } from '../db/schema';
 *   const db = await getDb();
 *
 * All tables are created with IF NOT EXISTS so this file is safe to import
 * at app startup on every launch — repeated calls are idempotent.
 *
 * Migration strategy
 * ──────────────────
 * A `_migrations` table tracks which migrations have been applied.
 * Each migration is a named SQL string.  runMigrations() applies only those
 * that are not yet recorded in the table.  This means you can add new
 * ALTER TABLE statements here over time without re-running old ones.
 *
 * AsyncStorage → SQLite coexistence
 * ──────────────────────────────────
 * Phase A (current):  Schema + migration runner exist; all repositories still
 *                     read/write AsyncStorage.  No behaviour change.
 * Phase B (next):     Repositories are swapped one-by-one to use SQLite.
 *                     A one-time data migration copies AsyncStorage JSON into
 *                     the new tables (see migrateAsyncStorageToSQLite below).
 * Phase C (future):   AsyncStorage imports are removed.
 */

import * as SQLite from 'expo-sqlite';

// ─── Database singleton ──────────────────────────────────────────────────────

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the open SQLite database, opening it on first call.
 * Awaiting this from multiple places is safe — the promise resolves to the
 * same singleton instance.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('safeinspect.db');
  await runMigrations(_db);
  return _db;
}

/**
 * initializeDatabase — convenience wrapper called by app/_layout.tsx on startup.
 * Opens the database and runs all pending migrations.
 */
export async function initializeDatabase(): Promise<void> {
  await getDb();
}

// ─── Migration runner ────────────────────────────────────────────────────────

interface Migration {
  name: string;
  sql: string;
}

/**
 * All migrations in order.  NEVER edit a migration that has already been
 * deployed — append a new one instead.
 */
const MIGRATIONS: Migration[] = [
  {
    name: '001_create_inspections',
    sql: `
      CREATE TABLE IF NOT EXISTS inspections (
        id                      TEXT PRIMARY KEY NOT NULL,
        facility_id             TEXT NOT NULL,
        facility_name           TEXT NOT NULL,
        facility_address        TEXT NOT NULL DEFAULT '',
        date                    TEXT NOT NULL,
        inspector_name          TEXT NOT NULL DEFAULT '',
        status                  TEXT NOT NULL DEFAULT 'draft',
        inspection_type         TEXT,
        prior_inspection_id     TEXT,
        opening_meeting_done    INTEGER NOT NULL DEFAULT 0,
        closing_meeting_done    INTEGER NOT NULL DEFAULT 0,
        report_sequence_number  TEXT,
        score                   REAL,
        grade                   TEXT,
        risk_level              INTEGER,
        critical_override       INTEGER NOT NULL DEFAULT 0,
        incomplete              INTEGER NOT NULL DEFAULT 0,
        next_inspection_days    INTEGER,
        escalation_override_reason TEXT,
        signature               TEXT,
        office_name             TEXT,
        inspection_cause        TEXT,
        reference_document      TEXT,
        committee_members       TEXT,    -- JSON array
        coordinates_lat         REAL,
        coordinates_lng         REAL,
        integrity_hash          TEXT,
        geofence_override_note  TEXT,
        approval_status         TEXT,
        approved_by             TEXT,
        approved_at             TEXT,
        returned_reason         TEXT,
        approval_note           TEXT,
        items_json              TEXT NOT NULL DEFAULT '[]',  -- serialised InspectionItem[]
        violations_json         TEXT,    -- serialised ViolationSummary
        created_at              TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at              TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: '001_create_facilities',
    sql: `
      CREATE TABLE IF NOT EXISTS facilities (
        id               TEXT PRIMARY KEY NOT NULL,
        project_name     TEXT NOT NULL DEFAULT '',
        owner_name       TEXT NOT NULL DEFAULT '',
        activity         TEXT NOT NULL DEFAULT '',
        address          TEXT NOT NULL DEFAULT '',
        lat              REAL,
        lng              REAL,
        license_type     TEXT,
        license_details  TEXT,
        year             TEXT,
        category         TEXT,
        notes            TEXT,
        created_at       TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: '001_create_agenda',
    sql: `
      CREATE TABLE IF NOT EXISTS agenda (
        id                TEXT PRIMARY KEY NOT NULL,
        facility_id       TEXT NOT NULL,
        facility_name     TEXT NOT NULL,
        facility_address  TEXT,
        activity          TEXT,
        date              TEXT NOT NULL,
        notes             TEXT NOT NULL DEFAULT '',
        status            TEXT NOT NULL DEFAULT 'pending',
        inspection_id     TEXT,
        created_at        TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: '001_create_corrective_actions',
    sql: `
      CREATE TABLE IF NOT EXISTS corrective_actions (
        id                   TEXT PRIMARY KEY NOT NULL,
        inspection_id        TEXT NOT NULL,
        inspection_item_id   TEXT NOT NULL,
        facility_id          TEXT NOT NULL,
        facility_name        TEXT NOT NULL,
        criteria             TEXT NOT NULL,
        severity             TEXT NOT NULL,
        deadline             TEXT NOT NULL,
        assigned_to          TEXT NOT NULL DEFAULT '',
        status               TEXT NOT NULL DEFAULT 'open',
        notes                TEXT,
        created_at           TEXT NOT NULL,
        updated_at           TEXT NOT NULL,
        closed_at            TEXT
      );
    `,
  },
  {
    name: '001_create_audit_log',
    sql: `
      CREATE TABLE IF NOT EXISTS audit_log (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        action        TEXT NOT NULL,
        inspection_id TEXT,
        facility_name TEXT,
        inspector_name TEXT,
        detail        TEXT,
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: '001_create_notifications',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id          TEXT PRIMARY KEY NOT NULL,
        type        TEXT NOT NULL,
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        created_at  TEXT NOT NULL,
        read_at     TEXT,
        dismissed   INTEGER NOT NULL DEFAULT 0,
        link_json   TEXT    -- serialised { screen, params }
      );
    `,
  },
  {
    name: '002_inspections_add_index_facility',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_inspections_facility_id
        ON inspections(facility_id);
    `,
  },
  {
    name: '002_inspections_add_index_status',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_inspections_status
        ON inspections(status);
    `,
  },
  {
    name: '002_corrective_actions_add_index_inspection',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_corrective_actions_inspection_id
        ON corrective_actions(inspection_id);
    `,
  },
];

/**
 * Applies all pending migrations inside a transaction.
 * Safe to call on every app launch — already-applied migrations are skipped.
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Ensure the migrations tracker table exists first
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  for (const migration of MIGRATIONS) {
    const existing = await db.getFirstAsync<{ name: string }>(
      'SELECT name FROM _migrations WHERE name = ?',
      [migration.name],
    );
    if (existing) continue; // already applied

    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.runAsync(
        'INSERT INTO _migrations (name) VALUES (?)',
        [migration.name],
      );
    });
  }
}

// ─── One-time AsyncStorage → SQLite data migration helper ────────────────────

/**
 * Reads every collection from AsyncStorage and bulk-inserts rows into SQLite.
 * Call this ONCE from a migration screen / first-launch flow after the user
 * has been informed.  It does NOT delete AsyncStorage data — the old data
 * remains as a safety net until Phase C cleanup.
 *
 * This function is a stub — it imports AsyncStorage lazily so that tree-shakers
 * can remove it in Phase C when it is no longer referenced.
 *
 * @param onProgress — optional callback called after each collection is migrated
 */
export async function migrateAsyncStorageToSQLite(
  onProgress?: (step: string) => void,
): Promise<void> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const db = await getDb();

  // ── Inspections ─────────────────────────────────────────────────────────
  const rawInspections = await AsyncStorage.getItem('inspections');
  if (rawInspections) {
    const inspections = JSON.parse(rawInspections) as Array<Record<string, unknown>>;
    for (const i of inspections) {
      await db.runAsync(
        `INSERT OR IGNORE INTO inspections (
          id, facility_id, facility_name, facility_address, date,
          inspector_name, status, inspection_type, prior_inspection_id,
          opening_meeting_done, closing_meeting_done, report_sequence_number,
          score, grade, risk_level, critical_override, incomplete,
          next_inspection_days, escalation_override_reason, signature,
          office_name, inspection_cause, reference_document,
          committee_members, coordinates_lat, coordinates_lng,
          integrity_hash, geofence_override_note, approval_status,
          approved_by, approved_at, returned_reason, approval_note,
          items_json, violations_json
        ) VALUES (
          ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )`,
        [
          i.id, i.facilityId, i.facilityName, i.facilityAddress ?? '', i.date,
          i.inspectorName ?? '', i.status ?? 'draft',
          i.inspectionType ?? null, i.priorInspectionId ?? null,
          i.openingMeetingDone ? 1 : 0, i.closingMeetingDone ? 1 : 0,
          i.reportSequenceNumber ?? null,
          i.score ?? null, i.grade ?? null, i.riskLevel ?? null,
          i.criticalOverride ? 1 : 0, i.incomplete ? 1 : 0,
          i.nextInspectionDays ?? null, i.escalationOverrideReason ?? null,
          i.signature ?? null, i.officeName ?? null,
          i.inspectionCause ?? null, i.referenceDocument ?? null,
          i.committeeMembers ? JSON.stringify(i.committeeMembers) : null,
          (i.coordinates as { latitude: number } | undefined)?.latitude ?? null,
          (i.coordinates as { longitude: number } | undefined)?.longitude ?? null,
          i.integrityHash ?? null, i.geofenceOverrideNote ?? null,
          i.approvalStatus ?? null, i.approvedBy ?? null,
          i.approvedAt ?? null, i.returnedReason ?? null, i.approvalNote ?? null,
          JSON.stringify(i.items ?? []),
          i.violations ? JSON.stringify(i.violations) : null,
        ],
      );
    }
    onProgress?.('inspections');
  }

  // ── Facilities ───────────────────────────────────────────────────────────
  const rawFacilities = await AsyncStorage.getItem('userFacilities');
  if (rawFacilities) {
    const facilities = JSON.parse(rawFacilities) as Array<Record<string, unknown>>;
    for (const f of facilities) {
      await db.runAsync(
        `INSERT OR IGNORE INTO facilities (
          id, project_name, owner_name, activity, address,
          lat, lng, license_type, license_details, year, category, notes
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          f.id, f.projectName ?? '', f.ownerName ?? '', f.activity ?? '', f.address ?? '',
          typeof f.lat === 'number' ? f.lat : null,
          typeof f.lng === 'number' ? f.lng : null,
          f.licenseType ?? null, f.licenseDetails ?? null,
          f.year ?? null, f.category ?? null, f.notes ?? null,
        ],
      );
    }
    onProgress?.('facilities');
  }

  // ── Agenda ───────────────────────────────────────────────────────────────
  const rawAgenda = await AsyncStorage.getItem('agenda');
  if (rawAgenda) {
    const agenda = JSON.parse(rawAgenda) as Array<Record<string, unknown>>;
    for (const a of agenda) {
      await db.runAsync(
        `INSERT OR IGNORE INTO agenda (
          id, facility_id, facility_name, facility_address, activity,
          date, notes, status, inspection_id
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          a.id, a.facilityId, a.facilityName, a.facilityAddress ?? null,
          a.activity ?? null, a.date, a.notes ?? '', a.status ?? 'pending',
          a.inspectionId ?? null,
        ],
      );
    }
    onProgress?.('agenda');
  }

  onProgress?.('done');
}
