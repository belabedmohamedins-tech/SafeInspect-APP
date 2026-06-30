// src/repositories/SettingsRepository.ts
//
// Settings are stored as individual keys in AsyncStorage so that
// partial updates (set a single field) never risk corrupting other fields.
//
// The repository exposes a flexible API:
//   get()              → typed Settings object (core 3 fields)
//   getAll()           → Record<string,string> of known settings keys only
//                         (scoped — never returns auth or inspection keys)
//   set(partial)       → write multiple fields at once
//   set(key, value)    → write a single key (any string key allowed)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './keys';

// ─── Public types ─────────────────────────────────────────────────────

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

// Core keys that map to StorageKeys constants
const FIELD_KEYS: Record<string, string> = {
  officeName:      StorageKeys.OFFICE_NAME      ?? 'OFFICE_NAME',
  inspectorName:   StorageKeys.INSPECTOR_NAME   ?? 'INSPECTOR_NAME',
  inspectionCause: StorageKeys.INSPECTION_CAUSE ?? 'INSPECTION_CAUSE',
};

/**
 * The complete set of keys that getAll() is allowed to return.
 * This prevents auth/security keys (APP_PIN, BIOMETRIC_ENABLED,
 * PIN_FAILED_ATTEMPTS) and data blobs (INSPECTIONS, AGENDA …)
 * from leaking into settings screens.
 */
const SETTINGS_ALLOWED_KEYS: readonly string[] = [
  StorageKeys.OFFICE_NAME,
  StorageKeys.INSPECTOR_NAME,
  StorageKeys.INSPECTION_CAUSE,
  '@settings/organisation',
  '@settings/department',
  '@settings/showGrade',
  'profile_name',
  'profile_title',
  'profile_phone',
  'profile_email',
  'onboardingDone',
];

// ─── Repository ────────────────────────────────────────────────────────

export const SettingsRepository = {
  /**
   * Read the core typed settings (officeName, inspectorName, inspectionCause).
   */
  async get(): Promise<Settings> {
    try {
      const keys  = Object.values(FIELD_KEYS);
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Settings = { ...DEFAULTS };
      for (const [storageKey, value] of pairs) {
        const field = Object.entries(FIELD_KEYS).find(([, k]) => k === storageKey)?.[0];
        if (field && value !== null) result[field] = value;
      }
      return result;
    } catch {
      return { ...DEFAULTS };
    }
  },

  /**
   * Read only the known settings keys and return them as a flat
   * Record<string, string>.  Auth keys (APP_PIN, BIOMETRIC_ENABLED …)
   * and data blobs (INSPECTIONS, AGENDA …) are never included.
   *
   * This is the method used by settings.tsx and inspector-profile.tsx.
   */
  async getAll(): Promise<Record<string, string>> {
    try {
      const pairs = await AsyncStorage.multiGet([...SETTINGS_ALLOWED_KEYS]);
      const result: Record<string, string> = {};
      for (const [key, value] of pairs) {
        result[key] = value ?? '';
      }
      return result;
    } catch {
      return {};
    }
  },

  /**
   * Overloaded set:
   *   set('key', 'value')        — write a single arbitrary key
   *   set({ key: 'value', … })  — write multiple keys at once
   *
   * Values are coerced to strings before storage (booleans become '"true"' /
   * '"false"' so callers can store boolean-looking settings without a separate
   * boolean store).
   */
  async set(
    keyOrPartial: string | Record<string, unknown>,
    value?: unknown
  ): Promise<void> {
    try {
      let pairs: [string, string][];

      if (typeof keyOrPartial === 'string') {
        // Single-key form: set('pinEnabled', true)
        pairs = [[keyOrPartial, String(value ?? '')]];
      } else {
        // Object form: set({ inspectorName: 'Ahmed', officeName: 'Alger' })
        pairs = Object.entries(keyOrPartial).map(([k, v]) => [
          FIELD_KEYS[k] ?? k,   // map core field names to their StorageKeys
          String(v ?? ''),
        ]);
      }

      if (pairs.length === 0) return;
      await AsyncStorage.multiSet(pairs);
    } catch (e) {
      console.warn('[SettingsRepository] set error:', e);
    }
  },
};
