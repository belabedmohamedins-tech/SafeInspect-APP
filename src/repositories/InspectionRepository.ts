// src/repositories/InspectionRepository.ts
//
// SQLite-backed implementation.
//
// W5:  SHA-256 integrity hashing on save (IntegrityService.hashAndStore).
// W22: save() throws INSPECTION_LOCKED if the existing row has approval_status
//      = 'approved'. Approved reports are legally immutable.
// W52: INSPECTION_LOCKED guard — delete(), deleteMany(), clear() all throw
//      'INSPECTION_LOCKED' and log INSPECTION_DELETE_BLOCKED before any
//      mutation if an affected inspection has approvalStatus = 'approved'.
// W57: added getCompleted(), getDrafts(), updateStatus() — used by screens
//      and services (approval-detail, stats, map, briefService, loadHomeData).

import { getDb } from '../db/schema';
import { SavedInspection } from '../types';
import { IntegrityService } from '../services/IntegrityService';
import { AuditLogRepository } from './AuditLogRepository';
import { createCapItemsFromInspection } from '../services/capFactory';

// ── Row shape returned by SQLite ──────────────────────────────────────────────
interface InspectionRow {
  id: string;
  data: string;
  facility_id: string;
  status: string;
  approval_status: string | null;
  created_at: string;
  updated_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function rowToInspection(row: InspectionRow): SavedInspection {
  return JSON.parse(row.data) as SavedInspection;
}

// Returns a plain mutable tuple — avoids TS2769 with runAsync overloads.
function inspectionToParams(
  insp: SavedInspection,
): [string, string, string, string, string | null] {
  return [
    insp.id,
    JSON.stringify(insp),
    insp.facilityId,
    insp.status,
    insp.approvalStatus ?? null,
  ];
}

// ── Repository ────────────────────────────────────────────────────────────────
export const InspectionRepository = {

  // ── getAll ────────────────────────────────────────────────────────────────
  async getAll(): Promise<SavedInspection[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<InspectionRow>(
      'SELECT * FROM inspections ORDER BY created_at DESC',
    );
    return rows.map(rowToInspection);
  },

  // ── getCompleted ──────────────────────────────────────────────────────────
  // W57: returns all inspections with status = 'completed' | 'approved'.
  async getCompleted(): Promise<SavedInspection[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<InspectionRow>(
      `SELECT * FROM inspections
       WHERE status IN ('completed','submitted','approved','pending-review')
       ORDER BY created_at DESC`,
    );
    return rows.map(rowToInspection);
  },

  // ── getDrafts ─────────────────────────────────────────────────────────────
  // W57: returns all inspections with status = 'draft' | 'in-progress'.
  async getDrafts(): Promise<SavedInspection[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<InspectionRow>(
      `SELECT * FROM inspections
       WHERE status IN ('draft','in-progress')
       ORDER BY created_at DESC`,
    );
    return rows.map(rowToInspection);
  },

  // ── getById ───────────────────────────────────────────────────────────────
  async getById(id: string): Promise<SavedInspection | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<InspectionRow>(
      'SELECT * FROM inspections WHERE id = ?',
      [id],
    );
    return row ? rowToInspection(row) : null;
  },

  // ── getByFacility ─────────────────────────────────────────────────────────
  async getByFacility(facilityId: string): Promise<SavedInspection[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<InspectionRow>(
      'SELECT * FROM inspections WHERE facility_id = ? ORDER BY created_at DESC',
      [facilityId],
    );
    return rows.map(rowToInspection);
  },

  // ── save ──────────────────────────────────────────────────────────────────
  // W22: approved inspections are legally immutable — any attempt to overwrite
  //      an approved row throws INSPECTION_LOCKED before any mutation occurs.
  async save(inspection: SavedInspection): Promise<void> {
    const db = await getDb();

    // W22 guard: check existing row approval status before any mutation.
    const existing = await db.getFirstAsync<{ approval_status: string | null }>(
      'SELECT approval_status FROM inspections WHERE id = ?',
      [inspection.id],
    );
    if (existing?.approval_status === 'approved') {
      throw new Error('INSPECTION_LOCKED');
    }

    // W5: compute + persist SHA-256 hash; embed in the inspection blob.
    const hash = await IntegrityService.hashAndStore(inspection);
    const withHash: SavedInspection = { ...inspection, integrityHash: hash };

    await db.runAsync(
      `INSERT INTO inspections (id, data, facility_id, status, approval_status)
       VALUES (?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         data            = excluded.data,
         facility_id     = excluded.facility_id,
         status          = excluded.status,
         approval_status = excluded.approval_status,
         updated_at      = CURRENT_TIMESTAMP`,
      inspectionToParams(withHash),
    );
    await AuditLogRepository.append(
      'INSPECTION_SAVED',
      withHash.inspectorName,
      { inspectionId: withHash.id, facilityName: withHash.facilityName },
    );
    // W53 / Phase 4.2: auto-create CAP items on completion
    if (withHash.status === 'completed') {
      try { await createCapItemsFromInspection(withHash); } catch { /* non-fatal */ }
    }
  },

  // ── updateStatus ──────────────────────────────────────────────────────────
  // W57: supervisor workflow — approves or rejects an inspection by updating
  //      both the approval_status column and the data JSON blob.
  //      Does NOT throw INSPECTION_LOCKED — status transitions are always
  //      allowed for supervisor actions (approval overwrites are intentional).
  async updateStatus(
    id: string,
    status: SavedInspection['approvalStatus'],
  ): Promise<void> {
    const db = await getDb();
    const row = await db.getFirstAsync<InspectionRow>(
      'SELECT * FROM inspections WHERE id = ?',
      [id],
    );
    if (!row) return;
    const inspection = rowToInspection(row);
    const updated: SavedInspection = { ...inspection, approvalStatus: status };
    await db.runAsync(
      `UPDATE inspections
       SET data = ?, approval_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [JSON.stringify(updated), status ?? null, id],
    );
  },

  // ── delete ────────────────────────────────────────────────────────────────
  // W52: throws INSPECTION_LOCKED if the inspection is approved.
  async delete(id: string): Promise<void> {
    const db = await getDb();
    const existingRow = await db.getFirstAsync<{ approval_status: string | null; facility_name: string | null }>(
      `SELECT approval_status, json_extract(data, '$.facilityName') AS facility_name
       FROM inspections WHERE id = ?`,
      [id],
    );
    if (existingRow?.approval_status === 'approved') {
      await AuditLogRepository.append(
        'INSPECTION_DELETE_BLOCKED',
        'system',
        { inspectionId: id, facilityName: existingRow.facility_name ?? undefined, detail: 'INSPECTION_LOCKED' },
      );
      throw new Error('INSPECTION_LOCKED');
    }
    await db.runAsync('DELETE FROM inspections WHERE id = ?', [id]);
    await AuditLogRepository.append(
      'INSPECTION_DELETED',
      'system',
      { inspectionId: id },
    );
  },

  // ── deleteMany ────────────────────────────────────────────────────────────
  // W52: throws INSPECTION_LOCKED (atomically — nothing deleted) if any id is approved.
  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDb();
    const placeholders = ids.map(() => '?').join(',');
    const rows = await db.getAllAsync<{ id: string; approval_status: string | null; facility_name: string | null }>(
      `SELECT id, approval_status, json_extract(data, '$.facilityName') AS facility_name
       FROM inspections WHERE id IN (${placeholders})`,
      ids,
    );
    for (const row of rows) {
      if (row.approval_status === 'approved') {
        await AuditLogRepository.append(
          'INSPECTION_DELETE_BLOCKED',
          'system',
          { inspectionId: row.id, facilityName: row.facility_name ?? undefined, detail: 'INSPECTION_LOCKED' },
        );
        throw new Error('INSPECTION_LOCKED');
      }
    }
    await db.runAsync(
      `DELETE FROM inspections WHERE id IN (${placeholders})`,
      ids,
    );
    await AuditLogRepository.append(
      'INSPECTION_BULK_DELETED',
      'system',
      { detail: `حذف ${ids.length} تقارير` },
    );
  },

  // ── clear ─────────────────────────────────────────────────────────────────
  // W52: throws INSPECTION_LOCKED if any approved inspection exists.
  async clear(): Promise<void> {
    const db = await getDb();
    const approvedRow = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM inspections WHERE approval_status = 'approved' LIMIT 1`,
    );
    if (approvedRow) {
      await AuditLogRepository.append(
        'INSPECTION_DELETE_BLOCKED',
        'system',
        { inspectionId: approvedRow.id, detail: 'INSPECTION_LOCKED — clear() blocked: approved record exists' },
      );
      throw new Error('INSPECTION_LOCKED');
    }
    await db.runAsync('DELETE FROM inspections');
  },
};
