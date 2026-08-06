// src/repositories/AgendaRepository.ts
//
// Z5: migrated from AsyncStorage to expo-sqlite.
// Notification sync (scheduleForAgendaItem / cancelForAgendaItem) preserved.

import { getDb } from '../db/schema';
import {
  cancelForAgendaItem,
  scheduleForAgendaItem,
} from '../services/NotificationService';
import { AgendaItem } from '../types';

// ─── Row mapper ───────────────────────────────────────────────────────────────

type AgendaRow = {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_address: string | null;
  activity: string | null;
  date: string;
  notes: string;
  status: string;
  inspection_id: string | null;
  created_at: string;
  updated_at: string;
};

function rowToItem(row: AgendaRow): AgendaItem {
  return {
    id: row.id,
    facilityId: row.facility_id,
    facilityName: row.facility_name,
    facilityAddress: row.facility_address ?? undefined,
    activity: row.activity ?? undefined,
    date: row.date,
    notes: row.notes,
    status: row.status as AgendaItem['status'],
    inspectionId: row.inspection_id ?? undefined,
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const AgendaRepository = {
  async getAll(): Promise<AgendaItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<AgendaRow>(
      'SELECT * FROM agenda ORDER BY date ASC',
    );
    return rows.map(rowToItem);
  },

  async getById(id: string): Promise<AgendaItem | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<AgendaRow>(
      'SELECT * FROM agenda WHERE id = ?',
      [id],
    );
    return row ? rowToItem(row) : null;
  },

  async save(item: AgendaItem): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO agenda
         (id, facility_id, facility_name, facility_address, activity,
          date, notes, status, inspection_id, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         facility_id = excluded.facility_id,
         facility_name = excluded.facility_name,
         facility_address = excluded.facility_address,
         activity = excluded.activity,
         date = excluded.date,
         notes = excluded.notes,
         status = excluded.status,
         inspection_id = excluded.inspection_id,
         updated_at = excluded.updated_at`,
      [
        item.id,
        item.facilityId,
        item.facilityName,
        item.facilityAddress ?? null,
        item.activity ?? null,
        item.date,
        item.notes,
        item.status,
        item.inspectionId ?? null,
        now,
        now,
      ],
    );

    if (item.status === 'pending') {
      await scheduleForAgendaItem({
        id: item.id,
        facilityName: item.facilityName,
        date: item.date,
        notes: item.notes,
      });
    } else {
      await cancelForAgendaItem(item.id);
    }
  },

  async delete(id: string): Promise<void> {
    await (await getDb()).runAsync('DELETE FROM agenda WHERE id = ?', [id]);
    await cancelForAgendaItem(id);
  },

  async updateInspectionLink(agendaId: string, inspectionId: string): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE agenda SET inspection_id = ?, status = 'completed', updated_at = ? WHERE id = ?`,
      [inspectionId, now, agendaId],
    );
    await cancelForAgendaItem(agendaId);
  },
};
