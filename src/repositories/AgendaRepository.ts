// src/repositories/AgendaRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaItem } from '../types';
import { StorageKeys } from './keys';

async function readAll(): Promise<AgendaItem[]> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.AGENDA);
    return raw ? (JSON.parse(raw) as AgendaItem[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(items: AgendaItem[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.AGENDA, JSON.stringify(items));
}

export const AgendaRepository = {

  async getAll(): Promise<AgendaItem[]> {
    return readAll();
  },

  async getById(id: string): Promise<AgendaItem | null> {
    const all = await readAll();
    return all.find(i => i.id === id) ?? null;
  },

  async save(item: AgendaItem): Promise<void> {
    const all = await readAll();
    const index = all.findIndex(i => i.id === item.id);
    if (index >= 0) {
      all[index] = item;
    } else {
      all.push(item);
    }
    await writeAll(all);
  },

  async delete(id: string): Promise<void> {
    const all = await readAll();
    await writeAll(all.filter(i => i.id !== id));
  },

  /**
   * Links a completed inspection to an agenda item and marks it as completed.
   * Uses the single `status` field — no redundant `completed` boolean.
   */
  async updateInspectionLink(agendaId: string, inspectionId: string): Promise<void> {
    const all = await readAll();
    const index = all.findIndex(i => i.id === agendaId);
    if (index >= 0) {
      all[index] = {
        ...all[index],
        inspectionId,
        status: 'completed',
      };
      await writeAll(all);
    }
  },
};
