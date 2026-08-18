// src/repositories/CorrectiveActionRepository.ts
//
// Z5: migrated from AsyncStorage to expo-sqlite.
// All business logic preserved: overdue escalation, ring-sort, stats, CAP lifecycle.
//
// W72: save() fires a CAP_DEADLINE in-app notification when a new CAP is
//      created with a deadline within the next 7 days.
//      updateStatus() fires a FOLLOW_UP notification when status becomes
//      'in-progress'.
//      Both calls are fire-and-forget via pushInApp() and never throw.
//
// W85 FIX (SPEC 03): updateStatus() now stamps closedAt ONLY when status
//      becomes 'closed' (inspector-verified), not 'resolved' (self-reported).
//      The resolved→closed distinction is legally significant:
//        'resolved' = facility self-reports fix (no evidence yet)
//        'closed'   = inspector verified and signed off
//
// W89: added `delete` as public alias for `deleteById` — tests written before
//      the rename called .delete(id); both names now work identically.
//      Added photo_uri, verified_by, verification_note, verification_photo_uri
//      columns to CapRow, rowToCap, save(), and updateStatus().
//      Added clear() — test-only helper that deletes all rows (used in beforeEach).

import { getDb } from '../db/schema';
import { CorrectiveAction } from '../types';
import { pushInApp } from '../services/NotificationService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  return `cap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

type CapRow = {
  id: string;
  inspection_id: string;
  inspection_item_id: string;
  facility_id: string;
  facility_name: string;
  criteria: string;
  severity: string;
  deadline: string;
  assigned_to: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  // W89: verification columns (nullable — pre-existing rows return NULL)
  photo_uri: string | null;
  verified_by: string | null;
  verification_note: string | null;
  verification_photo_uri: string | null;
};

function rowToCap(row: CapRow): CorrectiveAction {
  return {
    id: row.id,
    inspectionId: row.inspection_id,
    inspectionItemId: row.inspection_item_id,
    facilityId: row.facility_id,
    facilityName: row.facility_name,
    criteria: row.criteria,
    severity: row.severity as CorrectiveAction['severity'],
    deadline: row.deadline,
    assignedTo: row.assigned_to,
    status: row.status as CorrectiveAction['status'],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at ?? undefined,
    // W89
    photoUri: row.photo_uri ?? undefined,
    verifiedBy: row.verified_by ?? undefined,
    verificationNote: row.verification_note ?? undefined,
    verificationPhotoUri: row.verification_photo_uri ?? undefined,
  };
}

// ─── Overdue escalation (same logic as AsyncStorage version) ─────────────────

async function escalateOverdue(): Promise<void> {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE corrective_actions
     SET status = 'overdue', updated_at = ?
     WHERE status IN ('open', 'in-progress') AND deadline < ?`,
    [now, today],
  );
}

async function readAll(): Promise<CorrectiveAction[]> {
  await escalateOverdue();
  const db = await getDb();
  const rows = await db.getAllAsync<CapRow>(
    'SELECT * FROM corrective_actions ORDER BY created_at DESC',
  );
  return rows.map(rowToCap);
}

// ─── Public stats type ────────────────────────────────────────────────────────

export interface CapStats {
  open:              number;
  inProgress:        number;
  overdue:           number;
  resolved:          number;
  total:             number;
  nearDeadlineCount: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const CorrectiveActionRepository = {
  async getAll(): Promise<CorrectiveAction[]> {
    return readAll();
  },

  async getById(id: string): Promise<CorrectiveAction | undefined> {
    await escalateOverdue();
    const db = await getDb();
    const row = await db.getFirstAsync<CapRow>(
      'SELECT * FROM corrective_actions WHERE id = ?',
      [id],
    );
    return row ? rowToCap(row) : undefined;
  },

  async getByInspection(inspectionId: string): Promise<CorrectiveAction[]> {
    await escalateOverdue();
    const db = await getDb();
    const rows = await db.getAllAsync<CapRow>(
      'SELECT * FROM corrective_actions WHERE inspection_id = ? ORDER BY created_at DESC',
      [inspectionId],
    );
    return rows.map(rowToCap);
  },

  async getByFacility(facilityId: string): Promise<CorrectiveAction[]> {
    await escalateOverdue();
    const db = await getDb();
    const rows = await db.getAllAsync<CapRow>(
      'SELECT * FROM corrective_actions WHERE facility_id = ? ORDER BY created_at DESC',
      [facilityId],
    );
    return rows.map(rowToCap);
  },

  async getOpen(): Promise<CorrectiveAction[]> {
    await escalateOverdue();
    const db = await getDb();
    const rows = await db.getAllAsync<CapRow>(
      `SELECT * FROM corrective_actions
       WHERE status IN ('open','in-progress','overdue')
       ORDER BY created_at DESC`,
    );
    return rows.map(rowToCap);
  },

  async getOverdue(): Promise<CorrectiveAction[]> {
    await escalateOverdue();
    const db = await getDb();
    const rows = await db.getAllAsync<CapRow>(
      `SELECT * FROM corrective_actions WHERE status = 'overdue' ORDER BY deadline ASC`,
    );
    return rows.map(rowToCap);
  },

  async getStats(nearDays = 7): Promise<CapStats> {
    const all = await readAll();
    const today = new Date().toISOString().slice(0, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + nearDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const stats: CapStats = {
      open: 0, inProgress: 0, overdue: 0, resolved: 0,
      total: all.length, nearDeadlineCount: 0,
    };
    for (const a of all) {
      if      (a.status === 'open')        stats.open++;
      else if (a.status === 'in-progress') stats.inProgress++;
      else if (a.status === 'overdue')     stats.overdue++;
      else                                 stats.resolved++;
      if (
        a.status !== 'resolved' &&
        a.deadline >= today &&
        a.deadline <= cutoffStr
      ) stats.nearDeadlineCount++;
    }
    return stats;
  },

  async persistOverdueEscalation(): Promise<number> {
    try {
      const db = await getDb();
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date().toISOString();
      const result = await db.runAsync(
        `UPDATE corrective_actions
         SET status = 'overdue', updated_at = ?
         WHERE status IN ('open', 'in-progress') AND deadline < ?`,
        [now, today],
      );
      return result.changes;
    } catch /* istanbul ignore next */ {
      return 0;
    }
  },

  /**
   * Upserts a corrective action and returns the full persisted record.
   * W72: fires CAP_DEADLINE notification when a new CAP has a deadline
   * within the next 7 days.
   * W89: persists photoUri from InspectionItem (copied by capFactory).
   */
  async save(
    action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> &
            Partial<Pick<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<CorrectiveAction> {
    const db = await getDb();
    const now = new Date().toISOString();
    const id  = /* istanbul ignore next */ action.id ?? makeId();
    const isNew = !action.id;
    const record: CorrectiveAction = {
      ...action,
      id,
      deadline:   /* istanbul ignore next */ action.deadline   || defaultDeadline(),
      assignedTo: /* istanbul ignore next */ action.assignedTo || '',
      createdAt:  /* istanbul ignore next */ action.createdAt  ?? now,
      updatedAt:  now,
    };
    await db.runAsync(
      `INSERT INTO corrective_actions
         (id, inspection_id, inspection_item_id, facility_id, facility_name,
          criteria, severity, deadline, assigned_to, status, notes,
          created_at, updated_at, closed_at,
          photo_uri, verified_by, verification_note, verification_photo_uri)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         status = excluded.status,
         notes = excluded.notes,
         deadline = excluded.deadline,
         assigned_to = excluded.assigned_to,
         updated_at = excluded.updated_at,
         closed_at = excluded.closed_at,
         photo_uri = excluded.photo_uri,
         verified_by = excluded.verified_by,
         verification_note = excluded.verification_note,
         verification_photo_uri = excluded.verification_photo_uri`,
      [
        record.id, record.inspectionId, record.inspectionItemId,
        record.facilityId, record.facilityName, record.criteria,
        record.severity, record.deadline, record.assignedTo,
        record.status, record.notes ?? null,
        record.createdAt, record.updatedAt, record.closedAt ?? null,
        record.photoUri ?? null,
        record.verifiedBy ?? null,
        record.verificationNote ?? null,
        record.verificationPhotoUri ?? null,
      ],
    );

    // W72: fire CAP_DEADLINE notification for new CAPs with near deadline.
    if (isNew) {
      const daysUntil = Math.ceil(
        (new Date(record.deadline).getTime() - Date.now()) / 86_400_000,
      );
      if (daysUntil >= 0 && daysUntil <= 7) {
        void pushInApp({
          type: 'CAP_DEADLINE',
          title: `⚠️ موعد إجراء تصحيحي — ${record.facilityName}`,
          body: `${record.criteria} — الموعد النهائي: ${record.deadline}`,
          link: { screen: '/screens/cap' },
        });
      }
    }

    return record;
  },

  /**
   * Update status of a corrective action.
   * W72: fires FOLLOW_UP notification when status becomes 'in-progress'.
   * W85 FIX: closedAt is stamped ONLY when status === 'closed' (inspector-verified).
   *   'resolved' means the facility self-reported; 'closed' means the inspector
   *   confirmed closure. Setting closedAt on 'resolved' collapsed both states into one.
   * W89: accepts optional verifiedBy, verificationNote, verificationPhotoUri
   *   and persists them when status === 'closed'.
   */
  async updateStatus(
    id: string,
    status: CorrectiveAction['status'],
    notes?: string,
    verificationFields?: {
      verifiedBy?: string;
      verificationNote?: string;
      verificationPhotoUri?: string;
    },
  ): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    // W85: only stamp closedAt when transitioning to 'closed' (inspector-verified).
    const closedAt = status === 'closed' ? now : null;

    let sql = `UPDATE corrective_actions SET status = ?, updated_at = ?, closed_at = COALESCE(?, closed_at)`;
    const params: (string | null)[] = [status, now, closedAt];

    if (notes !== undefined) {
      sql += ', notes = ?';
      params.push(notes);
    }

    // W89: persist verification evidence when closing.
    if (status === 'closed' && verificationFields) {
      if (verificationFields.verifiedBy !== undefined) {
        sql += ', verified_by = ?';
        params.push(verificationFields.verifiedBy);
      }
      if (verificationFields.verificationNote !== undefined) {
        sql += ', verification_note = ?';
        params.push(verificationFields.verificationNote);
      }
      if (verificationFields.verificationPhotoUri !== undefined) {
        sql += ', verification_photo_uri = ?';
        params.push(verificationFields.verificationPhotoUri);
      }
    }

    sql += ' WHERE id = ?';
    params.push(id);
    await db.runAsync(sql, params);

    // W72: fire FOLLOW_UP notification when CAP moves to in-progress.
    if (status === 'in-progress') {
      const row = await db.getFirstAsync<{ facility_name: string; criteria: string }>(
        'SELECT facility_name, criteria FROM corrective_actions WHERE id = ?',
        [id],
      );
      if (row) {
        void pushInApp({
          type: 'FOLLOW_UP',
          title: `📌 متابعة إجراء تصحيحي — ${row.facility_name}`,
          body: `تم تفعيل الإجراء التصحيحي: ${row.criteria}`,
          link: { screen: '/screens/cap' },
        });
      }
    }
  },

  async deleteById(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM corrective_actions WHERE id = ?', [id]);
  },

  // W89: alias so tests written before rename still work.
  async delete(id: string): Promise<void> {
    return CorrectiveActionRepository.deleteById(id);
  },

  async deleteByInspection(inspectionId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'DELETE FROM corrective_actions WHERE inspection_id = ?',
      [inspectionId],
    );
  },

  /**
   * clear — TEST HELPER ONLY
   * Deletes every row from corrective_actions. Used in beforeEach() to
   * reset state between tests without tearing down the DB connection.
   */
  async clear(): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM corrective_actions', []);
  },
};
