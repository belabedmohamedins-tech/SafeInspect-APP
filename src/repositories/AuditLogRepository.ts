// src/repositories/AuditLogRepository.ts
//
// Z5: migrated from AsyncStorage to expo-sqlite.
// Ring-buffer of MAX_ENTRIES preserved. Append-only contract preserved.
// Audit failures must never crash the app — all writes are wrapped in try/catch.

import { getDb } from '../db/schema';

const MAX_ENTRIES = 500;

export type AuditAction =
  | 'INSPECTION_SAVED'
  | 'INSPECTION_DELETED'
  | 'INSPECTION_BULK_DELETED'
  | 'AGENDA_ITEM_SAVED'
  | 'AGENDA_ITEM_DELETED'
  | 'SETTINGS_CHANGED'
  | 'BACKUP_RESTORED';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  inspectorName: string;
  inspectionId?: string;
  facilityName?: string;
  detail?: string;
}

type AuditRow = {
  id: number;
  action: string;
  inspection_id: string | null;
  facility_name: string | null;
  inspector_name: string;
  detail: string | null;
  created_at: string;
};

function rowToEntry(row: AuditRow): AuditEntry {
  return {
    id: String(row.id),
    timestamp: row.created_at,
    action: row.action as AuditAction,
    inspectorName: row.inspector_name,
    inspectionId: row.inspection_id ?? undefined,
    facilityName: row.facility_name ?? undefined,
    detail: row.detail ?? undefined,
  };
}

export const AuditLogRepository = {
  async append(
    action: AuditAction,
    inspectorName: string,
    opts?: {
      inspectionId?: string;
      facilityName?: string;
      detail?: string;
    },
  ): Promise<void> {
    try {
      const db = await getDb();
      await db.runAsync(
        `INSERT INTO audit_log (action, inspection_id, facility_name, inspector_name, detail)
         VALUES (?,?,?,?,?)`,
        [
          action,
          opts?.inspectionId ?? null,
          opts?.facilityName ?? null,
          inspectorName,
          opts?.detail ?? null,
        ],
      );
      // Ring-buffer: delete oldest rows beyond MAX_ENTRIES
      await db.runAsync(
        `DELETE FROM audit_log WHERE id NOT IN
         (SELECT id FROM audit_log ORDER BY id DESC LIMIT ?)`,
        [MAX_ENTRIES],
      );
    } catch {
      // Audit failures must never crash the app
    }
  },

  async getAll(): Promise<AuditEntry[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<AuditRow>(
      'SELECT * FROM audit_log ORDER BY id DESC',
    );
    return rows.map(rowToEntry);
  },

  async getByAction(action: AuditAction): Promise<AuditEntry[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<AuditRow>(
      'SELECT * FROM audit_log WHERE action = ? ORDER BY id DESC',
      [action],
    );
    return rows.map(rowToEntry);
  },

  async getByInspection(inspectionId: string): Promise<AuditEntry[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<AuditRow>(
      'SELECT * FROM audit_log WHERE inspection_id = ? ORDER BY id DESC',
      [inspectionId],
    );
    return rows.map(rowToEntry);
  },

  async clear(): Promise<void> {
    await (await getDb()).runAsync('DELETE FROM audit_log');
  },
};
