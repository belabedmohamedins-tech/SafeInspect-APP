// src/repositories/InspectionRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedInspection } from '../types';
import { StorageKeys } from './keys';

async function readAll(): Promise<SavedInspection[]> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.INSPECTIONS);
    return raw ? (JSON.parse(raw) as SavedInspection[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(inspections: SavedInspection[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.INSPECTIONS, JSON.stringify(inspections));
  // Always invalidate stats cache on any write so stats.tsx never serves stale data
  await AsyncStorage.removeItem(StorageKeys.STATS_CACHE);
}

export const InspectionRepository = {

  async getAll(): Promise<SavedInspection[]> {
    return readAll();
  },

  async getCompleted(): Promise<SavedInspection[]> {
    const all = await readAll();
    return all.filter(i => i.status === 'completed');
  },

  async getDrafts(): Promise<SavedInspection[]> {
    const all = await readAll();
    return all.filter(i => i.status === 'in-progress' || i.status === 'draft' || i.status === 'completed');
  },

  async getById(id: string): Promise<SavedInspection | null> {
    const all = await readAll();
    return all.find(i => i.id === id) ?? null;
  },

  async save(inspection: SavedInspection): Promise<void> {
    const all = await readAll();
    const index = all.findIndex(i => i.id === inspection.id);
    if (index >= 0) {
      all[index] = inspection;
    } else {
      all.push(inspection);
    }
    await writeAll(all);
  },

  async delete(id: string): Promise<void> {
    const all = await readAll();
    const updated = all.filter(i => i.id !== id);
    await writeAll(updated);
  },

  async deleteMany(ids: string[]): Promise<void> {
    const set = new Set(ids);
    const all = await readAll();
    const updated = all.filter(i => !set.has(i.id));
    await writeAll(updated);
  },
};