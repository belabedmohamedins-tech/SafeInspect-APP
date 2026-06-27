// src/repositories/SettingsRepository.ts
//
// Settings are stored as individual keys in AsyncStorage so that
// partial updates (set a single field) never risk corrupting other fields.
// The test suite mocks multiGet/multiSet — this implementation matches
// that contract exactly.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './keys';

// ─── Public types ─────────────────────────────────────────────────────────────

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

// Keys stored individually in AsyncStorage
const FIELD_KEYS: Record<keyof Settings, string> = {
  officeName:      StorageKeys.OFFICE_NAME      ?? 'OFFICE_NAME',
  inspectorName:   StorageKeys.INSPECTOR_NAME   ?? 'INSPECTOR_NAME',
  inspectionCause: StorageKeys.INSPECTION_CAUSE ?? 'INSPECTION_CAUSE',
};

// ─── Repository ───────────────────────────────────────────────────────────────

export const SettingsRepository = {
  /**
   * Read all settings from AsyncStorage.
   * Falls back to DEFAULTS if storage is empty or throws.
   */
  async get(): Promise<Settings> {
    try {
      const keys   = Object.values(FIELD_KEYS) as string[];
      const pairs  = await AsyncStorage.multiGet(keys);
      const result: Settings = { ...DEFAULTS };
      for (const [storageKey, value] of pairs) {
        const field = (Object.entries(FIELD_KEYS) as [keyof Settings, string][])
          .find(([, k]) => k === storageKey)?.[0];
        if (field && value !== null) {
          result[field] = value;
        }
      }
      return result;
    } catch {
      return { ...DEFAULTS };
    }
  },

  /**
   * Persist a partial or full settings update.
   * Only the provided keys are written — other keys are left untouched.
   */
  async set(partial: Partial<Settings>): Promise<void> {
    const entries = Object.entries(partial) as [keyof Settings, string][];
    if (entries.length === 0) return;
    const pairs: [string, string][] = entries.map(([field, value]) => [
      FIELD_KEYS[field] ?? field,
      String(value),
    ]);
    await AsyncStorage.multiSet(pairs);
  },
};
