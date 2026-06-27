// src/repositories/AgendaRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cancelForAgendaItem,
  scheduleForAgendaItem,
} from '../services/NotificationService';
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

  /**
   * Persist an agenda item (insert or update).
   * Automatically schedules (or reschedules) a local notification
   * for pending items, and cancels it for completed/cancelled items.
   */
  async save(item: AgendaItem): Promise<void> {
    const all = await readAll();
    const index = all.findIndex(i => i.id === item.id);
    if (index >= 0) {
      all[index] = item;
    } else {
      all.push(item);
    }
    await writeAll(all);

    // Sync notification state with item status
    if (item.status === 'pending') {
      await scheduleForAgendaItem({
        id: item.id,
        facilityName: item.facilityName,
        date: item.date,
        notes: item.notes,
      });
    } else {
      // completed / cancelled → no upcoming notification needed
      await cancelForAgendaItem(item.id);
    }
  },

  /**
   * Delete an agenda item and cancel its scheduled notifications.
   */
  async delete(id: string): Promise<void> {
    const all = await readAll();
    await writeAll(all.filter(i => i.id !== id));
    await cancelForAgendaItem(id);
  },

  /**
   * Links a completed inspection to an agenda item and marks it as completed.
   * Sets both `status: 'completed'` and `completed: true` for full compatibility.
   * Also cancels pending notifications since the visit is done.
   */
  async updateInspectionLink(agendaId: string, inspectionId: string): Promise<void> {
    const all = await readAll();
    const index = all.findIndex(i => i.id === agendaId);
    if (index >= 0) {
      all[index] = {
        ...all[index],
        inspectionId,
        completed: true,
        status: 'completed',
      };
      await writeAll(all);
      await cancelForAgendaItem(agendaId);
    }
  },
};
