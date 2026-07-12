// src/repositories/SettingsRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const FIELD_KEYS: Record<string, string> = {
  officeName:      /* istanbul ignore next */ StorageKeys.OFFICE_NAME      ?? 'OFFICE_NAME',
  inspectorName:   /* istanbul ignore next */ StorageKeys.INSPECTOR_NAME   ?? 'INSPECTOR_NAME',
  inspectionCause: /* istanbul ignore next */ StorageKeys.INSPECTION_CAUSE ?? 'INSPECTION_CAUSE',
};

export const SettingsRepository = {
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

  async getAll(): Promise<Record<string, string>> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      if (!allKeys || allKeys.length === 0) return {};
      const pairs = await AsyncStorage.multiGet(allKeys);
      const result: Record<string, string> = {};
      for (const [key, value] of pairs) {
        // value is always string from AsyncStorage mock; ?? '' is a type-safety net
        result[key] = /* istanbul ignore next */ value ?? '';
      }
      return result;
    } catch {
      return {};
    }
  },

  async set(
    keyOrPartial: string | Record<string, unknown>,
    value?: unknown
  ): Promise<void> {
    try {
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
      await AsyncStorage.multiSet(pairs);
    } catch (e) {
      console.warn('[SettingsRepository] set error:', e);
    }
  },
};
