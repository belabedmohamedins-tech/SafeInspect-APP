// src/repositories/SettingsRepository.ts
//
// Z10: migrated from AsyncStorage to SQLite.
// Stores each setting as a row (key TEXT PK, value TEXT) in the `settings`
// table, which is created by migration `002_create_settings` in schema.ts.
// The public interface (get / set / getAll) is unchanged — all callers are
// unaffected. AuthRepository (SecureStore) is intentionally outside Z10 scope.

import { getDb } from '../db/schema';
import { StorageKeys } from './keys';

export interface Settings {
  officeName:      string;
  inspectorName:   string;
  inspectionCause: string;
  [key: string]:   string;
}

const DEFAULTS: Settings = {
  officeName:      '',
  inspectorName:   '',
  inspectionCause: '',
};

// Maps logical field name → storage key (kept identical to AsyncStorage keys
// so that any future cross-check tooling is straightforward).
const FIELD_KEYS: Record<string, string> = {
  officeName:      /* istanbul ignore next */ StorageKeys.OFFICE_NAME      ?? 'OFFICE_NAME',
  inspectorName:   /* istanbul ignore next */ StorageKeys.INSPECTOR_NAME   ?? 'INSPECTOR_NAME',
  inspectionCause: /* istanbul ignore next */ StorageKeys.INSPECTION_CAUSE ?? 'INSPECTION_CAUSE',
};

export const SettingsRepository = {
  async get(): Promise<Settings> {
    try {
      const db = await getDb();
      const keys = Object.values(FIELD_KEYS);
      const rows = await db.getAllAsync<{ key: string; value: string }>(
        `SELECT key, value FROM settings WHERE key IN (${keys.map(() => '?').join(',')})`,
        keys,
      );
      const result: Settings = { ...DEFAULTS };
      for (const row of rows) {
        const field = Object.entries(FIELD_KEYS).find(([, k]) => k === row.key)?.[0];
        if (field) result[field] = row.value;
      }
      return result;
    } catch {
      return { ...DEFAULTS };
    }
  },

  async getAll(): Promise<Record<string, string>> {
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM settings',
      );
      const result: Record<string, string> = {};
      for (const row of rows) result[row.key] = row.value;
      return result;
    } catch {
      return {};
    }
  },

  async set(
    keyOrPartial: string | Record<string, unknown>,
    value?: unknown,
  ): Promise<void> {
    try {
      const db = await getDb();
      let pairs: [string, string][];

      if (typeof keyOrPartial === 'string') {
        pairs = [[keyOrPartial, String(/* istanbul ignore next */ value ?? '')]];
      } else {
        pairs = Object.entries(keyOrPartial).map(([k, v]) => [
          /* istanbul ignore next */ FIELD_KEYS[k] ?? k,
          String(/* istanbul ignore next */ v ?? ''),
        ]);
      }

      /* istanbul ignore next */
      if (pairs.length === 0) return;

      await db.withTransactionAsync(async () => {
        for (const [k, v] of pairs) {
          await db.runAsync(
            `INSERT INTO settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [k, v],
          );
        }
      });
    } catch (e) {
      console.warn('[SettingsRepository] set error:', e);
    }
  },
};
