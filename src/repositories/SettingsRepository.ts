// src/repositories/SettingsRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './keys';

export interface AppSettings {
  officeName: string;
  inspectorName: string;
  inspectionCause: string;
}

const DEFAULTS: AppSettings = {
  officeName: '',
  inspectorName: '',
  inspectionCause: '',
};

export const SettingsRepository = {

  async get(): Promise<AppSettings> {
    try {
      const [officeName, inspectorName, inspectionCause] = await AsyncStorage.multiGet([
        StorageKeys.OFFICE_NAME,
        StorageKeys.INSPECTOR_NAME,
        StorageKeys.INSPECTION_CAUSE,
      ]);
      return {
        officeName:       officeName[1]       ?? DEFAULTS.officeName,
        inspectorName:    inspectorName[1]    ?? DEFAULTS.inspectorName,
        inspectionCause:  inspectionCause[1]  ?? DEFAULTS.inspectionCause,
      };
    } catch {
      return DEFAULTS;
    }
  },

  async set(settings: Partial<AppSettings>): Promise<void> {
    const pairs: [string, string][] = [];
    if (settings.officeName      !== undefined) pairs.push([StorageKeys.OFFICE_NAME,       settings.officeName]);
    if (settings.inspectorName   !== undefined) pairs.push([StorageKeys.INSPECTOR_NAME,    settings.inspectorName]);
    if (settings.inspectionCause !== undefined) pairs.push([StorageKeys.INSPECTION_CAUSE,  settings.inspectionCause]);
    if (pairs.length > 0) await AsyncStorage.multiSet(pairs);
  },
};