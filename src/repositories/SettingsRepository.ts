// src/repositories/SettingsRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from './keys';

type SettingsMap = Record<string, string | boolean | number>;

async function load(): Promise<SettingsMap> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  return raw ? (JSON.parse(raw) as SettingsMap) : {};
}

async function persist(data: SettingsMap): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(data));
}

export const SettingsRepository = {
  async getAll(): Promise<SettingsMap> {
    return load();
  },

  async get<T = string>(key: string, defaultValue?: T): Promise<T | undefined> {
    const all = await load();
    return (all[key] as unknown as T) ?? defaultValue;
  },

  async set(key: string, value: string | boolean | number): Promise<void> {
    const all = await load();
    all[key] = value;
    await persist(all);
  },

  async remove(key: string): Promise<void> {
    const all = await load();
    delete all[key];
    await persist(all);
  },

  async clear(): Promise<void> {
    await persist({});
  },
};
