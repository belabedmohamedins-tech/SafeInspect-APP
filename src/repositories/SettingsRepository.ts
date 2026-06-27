// src/repositories/SettingsRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatsCache } from '../utils/statsUtils';
import { StorageKeys } from './keys';

export interface AppSettings {
  officeName: string;
  inspectorName: string;
  inspectionCause: string;
  /** Cached stats written by InspectionRepository.writeAll() or stats.tsx. */
  statsCache?: StatsCache;
}

const DEFAULTS: Omit<AppSettings, 'statsCache'> = {
  officeName: '',
  inspectorName: '',
  inspectionCause: '',
};

export const SettingsRepository = {

  async get(): Promise<AppSettings> {
    try {
      const [[, officeName], [, inspectorName], [, inspectionCause], [, statsCacheRaw]] =
        await AsyncStorage.multiGet([
          StorageKeys.OFFICE_NAME,
          StorageKeys.INSPECTOR_NAME,
          StorageKeys.INSPECTION_CAUSE,
          StorageKeys.STATS_CACHE,
        ]);
      return {
        officeName:      officeName      ?? DEFAULTS.officeName,
        inspectorName:   inspectorName   ?? DEFAULTS.inspectorName,
        inspectionCause: inspectionCause ?? DEFAULTS.inspectionCause,
        statsCache:      statsCacheRaw ? (JSON.parse(statsCacheRaw) as StatsCache) : undefined,
      };
    } catch {
      return DEFAULTS;
    }
  },

  // FIX #3: statsCache is now an accepted field so stats.tsx can persist it
  async set(settings: Partial<AppSettings>): Promise<void> {
    const pairs: [string, string][] = [];
    if (settings.officeName      !== undefined) pairs.push([StorageKeys.OFFICE_NAME,      settings.officeName]);
    if (settings.inspectorName   !== undefined) pairs.push([StorageKeys.INSPECTOR_NAME,   settings.inspectorName]);
    if (settings.inspectionCause !== undefined) pairs.push([StorageKeys.INSPECTION_CAUSE, settings.inspectionCause]);
    if (settings.statsCache      !== undefined) pairs.push([StorageKeys.STATS_CACHE,      JSON.stringify(settings.statsCache)]);
    if (pairs.length > 0) await AsyncStorage.multiSet(pairs);
  },
};
