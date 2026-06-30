// src/db/schema.ts
//
// Database initialisation shim.
//
// The current storage layer is AsyncStorage-based (no SQLite migration yet).
// This module provides the initializeDatabase() entry-point that _layout.tsx
// calls on startup, keeping the door open for a future SQLite migration
// without touching the layout file.
//
// Schema version history:
//   v1 — initial (ComplianceStatus: compliant | non-compliant | na | not-evaluated)
//   v2 — Phase-1 checklist roadmap fields added to InspectionItem + SavedInspection:
//          InspectionItem:
//            + complianceStatus: adds 'observation-only' | 'unable-to-verify'
//            + numericValue?: number
//            + numericUnit?: string
//            + isRepeatViolation?: boolean
//            + priorInspectionStatus?: ComplianceStatus
//            + rootCause?: RootCause
//            + sanctionTier?: SanctionTier
//          SavedInspection:
//            + inspectionType?: InspectionType  (default: 'routine')
//            + priorInspectionId?: string
//            + openingMeetingDone?: boolean      (default: false)
//            + closingMeetingDone?: boolean      (default: false)
//            + reportSequenceNumber?: string
//            + escalationOverrideReason?: string
//
//   All new fields are optional — existing stored inspections deserialise
//   without error (missing fields resolve to undefined, treated as defaults).
//   No destructive migration is required for v1 → v2.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../repositories/keys';

/** Increment this when the shape of any stored type changes. */
export const SCHEMA_VERSION = 2;

/**
 * Initialise the application data layer.
 *
 * Call once at app startup (inside _layout.tsx useEffect).
 * Resolves when AsyncStorage is confirmed reachable and baseline
 * keys are in place.
 */
export async function initializeDatabase(): Promise<void> {
  // ── 1. Warm-up read — confirms the storage engine is accessible ────────────
  //    Using INSPECTIONS is intentional: it is the largest key and the one
  //    most likely to expose a corrupted store early.
  try {
    await AsyncStorage.getItem(StorageKeys.INSPECTIONS);
  } catch (err) {
    throw new Error(
      `[SafeInspect] AsyncStorage warm-up failed: ${String(err)}`,
    );
  }

  // ── 2. Seed STATS_CACHE if absent ────────────────────────────────────────
  //    InspectionRepository.saveAll() calls removeItem(STATS_CACHE) on every
  //    write. If the key was never set the remove is a no-op, but having it
  //    present from the start avoids a null-parse edge case in loadHomeData.
  try {
    const existing = await AsyncStorage.getItem(StorageKeys.STATS_CACHE);
    if (existing === null) {
      await AsyncStorage.setItem(StorageKeys.STATS_CACHE, JSON.stringify(null));
    }
  } catch {
    // Non-fatal — the app can run without the stats cache seed.
  }

  // ── 3. Schema version stamp ─────────────────────────────────────────────
  //    Writes the current schema version to storage so future migrations
  //    can detect what version a device is upgrading from.
  try {
    const stored = await AsyncStorage.getItem(StorageKeys.SCHEMA_VERSION ?? '@schema_version');
    if (stored === null || parseInt(stored, 10) < SCHEMA_VERSION) {
      await AsyncStorage.setItem('@schema_version', String(SCHEMA_VERSION));
      console.info(`[SafeInspect] Schema upgraded to v${SCHEMA_VERSION}.`);
    }
  } catch {
    // Non-fatal — version stamp is advisory only.
  }

  // ── 4. Future: run SQLite migrations here ──────────────────────────────
  //    When the SQLite layer is added, replace the AsyncStorage warm-up above
  //    with:
  //      const db = await SQLite.openDatabaseAsync('safeinspect.db');
  //      await runMigrations(db);
  //    and store the db reference in a module-level singleton for repositories.

  console.info('[SafeInspect] Database initialised (AsyncStorage mode, schema v2).');
}
