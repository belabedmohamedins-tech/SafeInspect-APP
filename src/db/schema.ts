// src/db/schema.ts
//
// Database initialisation shim.
//
// The current storage layer is AsyncStorage-based (no SQLite migration yet).
// This module provides the initializeDatabase() entry-point that _layout.tsx
// calls on startup, keeping the door open for a future SQLite migration
// without touching the layout file.
//
// What it does today:
//   1. Verifies AsyncStorage is reachable by issuing a cheap read.
//   2. Seeds the STATS_CACHE key if it is absent (prevents undefined reads
//      in loadHomeData after a fresh install).
//   3. Resolves with void on success — _layout.tsx sets dbReady = true.
//   4. Rejects with an Error on hard failure so _layout.tsx can log it.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../repositories/keys';

/**
 * Initialise the application data layer.
 *
 * Call once at app startup (inside _layout.tsx useEffect).
 * Resolves when AsyncStorage is confirmed reachable and baseline
 * keys are in place.
 */
export async function initializeDatabase(): Promise<void> {
  // ── 1. Warm-up read — confirms the storage engine is accessible ──────────
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

  // ── 3. Future: run SQLite migrations here ────────────────────────────────
  //    When the SQLite layer is added, replace the AsyncStorage warm-up above
  //    with:
  //      const db = await SQLite.openDatabaseAsync('safeinspect.db');
  //      await runMigrations(db);
  //    and store the db reference in a module-level singleton for repositories.

  console.info('[SafeInspect] Database initialised (AsyncStorage mode).');
}
