// src/repositories/InspectionRepository.ts
//
// Z5: migrated to SQLite as primary storage.
// Z10: AsyncStorage read-fallback (ensureMigrated / _migrated) removed.
//      SQLite is now the sole storage layer. migrateAsyncStorageToSQLite()
//      still exists in schema.ts for manual one-time migration tooling but
//      is no longer called automatically from this repository.
// Z12-01: replaced computeHash with hashAndStore so the hash is persisted
//         to AsyncStorage and verifyInspection() can find it.
// Z12-02: createFollowUpIfNeeded also triggered for 'unable-to-verify' items
//         (handled inside followUpService — repo change: none needed here).
// W22: save() throws 'INSPECTION_LOCKED' if the existing row already has
//      approval_status = 'approved'. Callers must not silently overwrite
//      approved records; a dedicated reopen flow is required.
// W52: delete(), deleteMany(), and clear() now throw 'INSPECTION_LOCKED'
//      when any targeted inspection has approval_status = 'approved'.
//      delete()     — checks single row before DELETE.
//      deleteMany() — checks every id before the transaction; aborts all
//                     if any one is approved (atomic: nothing is deleted).
//      clear()      — checks whether ANY approved row exists before wiping.
//      All three log an INSPECTION_DELETE_BLOCKED audit entry on rejection
//      so the attempt is traceable.

import { getDb } from '../db/schema';
import { SavedInspection, InspectionItem, InspectionType } from '../types';
import { IntegrityService } from '../services/IntegrityService';
import { AuditLogRepository } from './AuditLogRepository';
import { createCapItemsFromInspection } from '../services/capFactory';
import { createFollowUpIfNeeded } from '../services/followUpService';
import { ApprovalRepository } from './ApprovalRepository';
import { annotateRepeatViolations } from '../services/violationHistory';

// ─── Numeric sanitizer (T0.11 — preserved) ───────────────────────────────────

function sanitizeItems(items: InspectionItem[]): InspectionItem[] {
  return items.map(item => {
    const v = item.numericValue;
    if (v === undefined) return item;
    if (v === null || !isFinite(v) || isNaN(v)) {
      const { numericValue: _drop, ...rest } = item;
      return rest as InspectionItem;
    }
    return item;
  });
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

type InspectionRow = {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_address: string;
  date: string;
  inspector_name: string;
  status: string;
  inspection_type: string | null;
  prior_inspection_id: string | null;
  opening_meeting_done: number;
  closing_meeting_done: number;
  report_sequence_number: string | null;
  score: number | null;
  grade: string | null;
  risk_level: number | null;
  critical_override: number;
  incomplete: number;
  next_inspection_days: number | null;
  escalation_override_reason: string | null;
  signature: string | null;
  office_name: string | null;
  inspection_cause: string | null;
  reference_document: string | null;
  committee_members: string | null;
  coordinates_lat: number | null;
  coordinates_lng: number | null;
  integrity_hash: string | null;
  geofence_override_note: string | null;
  approval_status: string | null;
  approved_by: string | null;
  approved_at: string | null;
  returned_reason: string | null;
  approval_note: string | null;
  items_json: string;
  violations_json: string | null;
  created_at: string;
  updated_at: string;
};

function rowToInspection(row: InspectionRow): SavedInspection {
  return {
    id: row.id,
    facilityId: row.facility_id,
    facilityName: row.facility_name,
    facilityAddress: row.facility_address,
    date: row.date,
    inspectorName: row.inspector_name,
    status: row.status as SavedInspection['status'],
    inspectionType: row.inspection_type != null
      ? (row.inspection_type as InspectionType)
      : undefined,
    priorInspectionId: row.prior_inspection_id ?? undefined,
    openingMeetingDone: row.opening_meeting_done === 1,
    closingMeetingDone: row.closing_meeting_done === 1,
    reportSequenceNumber: row.report_sequence_number ?? undefined,
    score: row.score ?? undefined,
    grade: row.grade ?? undefined,
    riskLevel: row.risk_level != null
      ? (row.risk_level as 1 | 2 | 3 | 4)
      : undefined,
    criticalOverride: row.critical_override === 1,
    incomplete: row.incomplete === 1,
    nextInspectionDays: row.next_inspection_days ?? undefined,
    escalationOverrideReason: row.escalation_override_reason ?? undefined,
    signature: row.signature ?? undefined,
    officeName: row.office_name ?? undefined,
    inspectionCause: row.inspection_cause ?? undefined,
    referenceDocument: row.reference_document ?? undefined,
    committeeMembers: row.committee_members
      ? JSON.parse(row.committee_members)
      : undefined,
    coordinates: row.coordinates_lat != null && row.coordinates_lng != null
      ? { latitude: row.coordinates_lat, longitude: row.coordinates_lng }
      : undefined,
    integrityHash: row.integrity_hash ?? undefined,
    geofenceOverrideNote: row.geofence_override_note ?? undefined,
    approvalStatus: row.approval_status as SavedInspection['approvalStatus'] ?? undefined,
    approvedBy: row.approved_by ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    returnedReason: row.returned_reason ?? undefined,
    approvalNote: row.approval_note ?? undefined,
    items: JSON.parse(row.items_json) as InspectionItem[],
    violations: row.violations_json ? JSON.parse(row.violations_json) : undefined,
  };
}

async function upsert(db: Awaited<ReturnType<typeof getDb>>, i: SavedInspection): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO inspections (
       id, facility_id, facility_name, facility_address, date,
       inspector_name, status, inspection_type, prior_inspection_id,
       opening_meeting_done, closing_meeting_done, report_sequence_number,
       score, grade, risk_level, critical_override, incomplete,
       next_inspection_days, escalation_override_reason, signature,
       office_name, inspection_cause, reference_document,
       committee_members, coordinates_lat, coordinates_lng,
       integrity_hash, geofence_override_note, approval_status,
       approved_by, approved_at, returned_reason, approval_note,
       items_json, violations_json, created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       facility_id = excluded.facility_id,
       facility_name = excluded.facility_name,
       facility_address = excluded.facility_address,
       date = excluded.date,
       inspector_name = excluded.inspector_name,
       status = excluded.status,
       inspection_type = excluded.inspection_type,
       prior_inspection_id = excluded.prior_inspection_id,
       opening_meeting_done = excluded.opening_meeting_done,
       closing_meeting_done = excluded.closing_meeting_done,
       report_sequence_number = excluded.report_sequence_number,
       score = excluded.score,
       grade = excluded.grade,
       risk_level = excluded.risk_level,
       critical_override = excluded.critical_override,
       incomplete = excluded.incomplete,
       next_inspection_days = excluded.next_inspection_days,
       escalation_override_reason = excluded.escalation_override_reason,
       signature = excluded.signature,
       office_name = excluded.office_name,
       inspection_cause = excluded.inspection_cause,
       reference_document = excluded.reference_document,
       committee_members = excluded.committee_members,
       coordinates_lat = excluded.coordinates_lat,
       coordinates_lng = excluded.coordinates_lng,
       integrity_hash = excluded.integrity_hash,
       geofence_override_note = excluded.geofence_override_note,
       approval_status = excluded.approval_status,
       approved_by = excluded.approved_by,
       approved_at = excluded.approved_at,
       returned_reason = excluded.returned_reason,
       approval_note = excluded.approval_note,
       items_json = excluded.items_json,
       violations_json = excluded.violations_json,
       updated_at = excluded.updated_at`,
    [
      i.id, i.facilityId, i.facilityName, i.facilityAddress ?? '', i.date,
      i.inspectorName ?? '', i.status ?? 'draft',
      i.inspectionType ?? null, i.priorInspectionId ?? null,
      i.openingMeetingDone ? 1 : 0, i.closingMeetingDone ? 1 : 0,
      i.reportSequenceNumber ?? null,
      i.score ?? null, i.grade ?? null, i.riskLevel ?? null,
      i.criticalOverride ? 1 : 0, i.incomplete ? 1 : 0,
      i.nextInspectionDays ?? null, i.escalationOverrideReason ?? null,
      i.signature ?? null, i.officeName ?? null,
      i.inspectionCause ?? null, i.referenceDocument ?? null,
      i.committeeMembers ? JSON.stringify(i.committeeMembers) : null,
      i.coordinates?.latitude ?? null, i.coordinates?.longitude ?? null,
      i.integrityHash ?? null, i.geofenceOverrideNote ?? null,
      i.approvalStatus ?? null, i.approvedBy ?? null,
      i.approvedAt ?? null, i.returnedReason ?? null, i.approvalNote ?? null,
      JSON.stringify(i.items ?? []),
      i.violations ? JSON.stringify(i.violations) : null,
      now, now,
    ],
  );
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const InspectionRepository = {
  async getAll(): Promise<SavedInspection[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<InspectionRow>(
      'SELECT * FROM inspections ORDER BY date DESC, created_at DESC',
    );
    return rows.map(rowToInspection);
  },

  async getCompleted(): Promise<SavedInspection[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<InspectionRow>(
      `SELECT * FROM inspections WHERE status = 'completed' ORDER BY date DESC`,
    );
    return rows.map(rowToInspection);
  },

  async getDrafts(): Promise<SavedInspection[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<InspectionRow>(
      `SELECT * FROM inspections WHERE status IN ('in-progress','draft') ORDER BY date DESC`,
    );
    return rows.map(rowToInspection);
  },

  async getById(id: string): Promise<SavedInspection | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<InspectionRow>(
      'SELECT * FROM inspections WHERE id = ?',
      [id],
    );
    return row ? rowToInspection(row) : null;
  },

  async getByFacility(facilityId: string): Promise<SavedInspection[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<InspectionRow>(
      'SELECT * FROM inspections WHERE facility_id = ? ORDER BY date DESC',
      [facilityId],
    );
    return rows.map(rowToInspection);
  },

  async updateStatus(id: string, status: SavedInspection['status']): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE inspections SET status = ?, updated_at = ? WHERE id = ?',
      [status, now, id],
    );
  },

  async save(inspection: SavedInspection): Promise<void> {
    const db = await getDb();

    const existingRow = await db.getFirstAsync<{ status: string; approval_status: string | null }>(
      'SELECT status, approval_status FROM inspections WHERE id = ?',
      [inspection.id],
    );

    // W22: block any save() that would overwrite an approved inspection.
    // Throw before any write so no partial state is possible.
    if (existingRow?.approval_status === 'approved') {
      throw new Error('INSPECTION_LOCKED');
    }

    const isNewCompletion =
      inspection.status === 'completed' &&
      existingRow?.status !== 'completed';

    let toSave: SavedInspection = {
      ...inspection,
      items: sanitizeItems(inspection.items),
    };

    if (isNewCompletion) {
      try {
        const accessors = {
          getAll: () => InspectionRepository.getAll(),
          getById: (id: string) => InspectionRepository.getById(id),
        };
        const annotatedItems = await annotateRepeatViolations(
          accessors,
          toSave.items,
          toSave.facilityId,
          toSave.id,
          toSave.priorInspectionId,
        );
        toSave = { ...toSave, items: annotatedItems };
      } catch {
        // Non-fatal
      }

      // Z12-01: use hashAndStore so the hash is persisted in AsyncStorage
      // and IntegrityService.verifyInspection() can find it.
      const hash = await IntegrityService.hashAndStore(toSave);
      toSave = {
        ...toSave,
        integrityHash: hash,
        approvalStatus: /* istanbul ignore next */ toSave.approvalStatus ?? 'pending',
      };
    }

    await upsert(db, toSave);

    if (isNewCompletion) {
      await AuditLogRepository.append(
        'INSPECTION_SAVED',
        toSave.inspectorName,
        { inspectionId: toSave.id, facilityName: toSave.facilityName },
      );
      await createCapItemsFromInspection(toSave);
      try { await createFollowUpIfNeeded(toSave); } catch { /* non-fatal */ }
      try { await ApprovalRepository.enqueue(toSave); } catch { /* non-fatal */ }
    }
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();

    // W52: block deletion of approved inspections.
    const existingRow = await db.getFirstAsync<{
      approval_status: string | null;
      inspector_name: string;
      facility_name: string;
    }>(
      'SELECT approval_status, inspector_name, facility_name FROM inspections WHERE id = ?',
      [id],
    );
    if (existingRow?.approval_status === 'approved') {
      await AuditLogRepository.append(
        'INSPECTION_DELETE_BLOCKED',
        existingRow.inspector_name,
        { inspectionId: id, facilityName: existingRow.facility_name, reason: 'INSPECTION_LOCKED' },
      );
      throw new Error('INSPECTION_LOCKED');
    }

    await db.runAsync('DELETE FROM inspections WHERE id = ?', [id]);
    if (existingRow) {
      await AuditLogRepository.append(
        'INSPECTION_DELETED',
        existingRow.inspector_name,
        { inspectionId: id, facilityName: existingRow.facility_name },
      );
    }
  },

  async deleteMany(ids: string[]): Promise<void> {
    const db = await getDb();

    // W52: check every id before entering the transaction — fail atomically
    // if any targeted inspection is approved (nothing gets deleted).
    for (const id of ids) {
      const row = await db.getFirstAsync<{
        approval_status: string | null;
        inspector_name: string;
        facility_name: string;
      }>(
        'SELECT approval_status, inspector_name, facility_name FROM inspections WHERE id = ?',
        [id],
      );
      if (row?.approval_status === 'approved') {
        await AuditLogRepository.append(
          'INSPECTION_DELETE_BLOCKED',
          row.inspector_name,
          { inspectionId: id, facilityName: row.facility_name, reason: 'INSPECTION_LOCKED' },
        );
        throw new Error('INSPECTION_LOCKED');
      }
    }

    await db.withTransactionAsync(async () => {
      for (const id of ids) {
        await db.runAsync('DELETE FROM inspections WHERE id = ?', [id]);
      }
    });
    await AuditLogRepository.append(
      'INSPECTION_BULK_DELETED',
      'system',
      { detail: `حذف ${ids.length} تقارير` },
    );
  },

  async clear(): Promise<void> {
    const db = await getDb();

    // W52: refuse to wipe the table if any approved inspection exists.
    const approvedRow = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM inspections WHERE approval_status = 'approved' LIMIT 1`,
    );
    if (approvedRow) {
      await AuditLogRepository.append(
        'INSPECTION_DELETE_BLOCKED',
        'system',
        { inspectionId: approvedRow.id, reason: 'INSPECTION_LOCKED — clear() blocked: approved record exists' },
      );
      throw new Error('INSPECTION_LOCKED');
    }

    await db.runAsync('DELETE FROM inspections');
  },
};
