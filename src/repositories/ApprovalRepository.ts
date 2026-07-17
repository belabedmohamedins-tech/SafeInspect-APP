// src/repositories/ApprovalRepository.ts
// Supervisor approval workflow (FR-069→075)
//
// NOTE: InspectionRepository is required lazily (inside methods) to break the
// circular dependency:
//   InspectionRepository → ApprovalRepository → InspectionRepository
// Using a top-level import would cause one module to see an uninitialised
// value during startup.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './keys';
import { ApprovalStatus, SavedInspection } from '../types';
import { AuditLogRepository } from './AuditLogRepository';

export interface ApprovalRecord {
  inspectionId: string;
  facilityName: string;
  inspectorName: string;
  grade?: string;
  score?: number;
  date: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  returnedReason?: string;
  approvalNote?: string;
}

async function loadQueue(): Promise<ApprovalRecord[]> {
  const raw = await AsyncStorage.getItem(StorageKeys.APPROVAL_QUEUE);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue: ApprovalRecord[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.APPROVAL_QUEUE, JSON.stringify(queue));
}

/**
 * Lazily resolves InspectionRepository to avoid circular import.
 * Safe because this is only called at runtime, never at module-load time.
 */
function getInspectionRepository() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('./InspectionRepository').InspectionRepository as typeof import('./InspectionRepository').InspectionRepository;
}

export const ApprovalRepository = {
  /** Returns all approval records (newest first). */
  async getQueue(): Promise<ApprovalRecord[]> {
    const q = await loadQueue();
    return q.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  /** Returns only records with status 'pending'. */
  async getPending(): Promise<ApprovalRecord[]> {
    const q = await loadQueue();
    return q.filter(r => r.status === 'pending');
  },

  /** Upserts a record for a completed inspection (idempotent — skips if exists). */
  async enqueue(inspection: SavedInspection): Promise<void> {
    const q = await loadQueue();
    const exists = q.some(r => r.inspectionId === inspection.id);
    if (exists) return;
    q.push({
      inspectionId: inspection.id,
      facilityName: inspection.facilityName,
      inspectorName: inspection.inspectorName,
      grade: inspection.grade,
      score: inspection.score,
      date: inspection.date,
      status: 'pending',
    });
    await saveQueue(q);
  },

  /** Supervisor approves the inspection. Inspection becomes immutable. */
  async approve(
    inspectionId: string,
    supervisorName: string,
    note?: string
  ): Promise<void> {
    const q = await loadQueue();
    const idx = q.findIndex(r => r.inspectionId === inspectionId);
    if (idx === -1) throw new Error('Record not found');
    if (q[idx].status === 'approved') return;
    const now = new Date().toISOString();
    q[idx] = { ...q[idx], status: 'approved', approvedBy: supervisorName, approvedAt: now, approvalNote: note };
    await saveQueue(q);
    const InspectionRepository = getInspectionRepository();
    const inspection = await InspectionRepository.getById(inspectionId);
    if (inspection) {
      await InspectionRepository.save({
        ...inspection,
        approvalStatus: 'approved',
        approvedBy: supervisorName,
        approvedAt: now,
        approvalNote: note,
      });
    }
    // FIX (G17a): positional-args form matching AuditLogRepository.append signature
    await AuditLogRepository.append(
      'INSPECTION_SAVED',
      supervisorName,
      { inspectionId, facilityName: q[idx].facilityName, detail: `اعتمد المشرف ${supervisorName}` },
    );
  },

  /** Supervisor returns inspection for revision. */
  async returnForRevision(
    inspectionId: string,
    supervisorName: string,
    reason: string
  ): Promise<void> {
    const q = await loadQueue();
    const idx = q.findIndex(r => r.inspectionId === inspectionId);
    if (idx === -1) throw new Error('Record not found');
    if (q[idx].status === 'approved') throw new Error('لا يمكن تعديل تقرير معتمد');
    const now = new Date().toISOString();
    q[idx] = { ...q[idx], status: 'returned', approvedBy: supervisorName, approvedAt: now, returnedReason: reason };
    await saveQueue(q);
    const InspectionRepository = getInspectionRepository();
    const inspection = await InspectionRepository.getById(inspectionId);
    if (inspection) {
      await InspectionRepository.save({
        ...inspection,
        approvalStatus: 'returned',
        approvedBy: supervisorName,
        approvedAt: now,
        returnedReason: reason,
      });
    }
    // FIX (G17a): positional-args form
    await AuditLogRepository.append(
      'INSPECTION_SAVED',
      supervisorName,
      { inspectionId, facilityName: q[idx].facilityName, detail: `أعيد المشرف: ${reason}` },
    );
  },

  /** Supervisor escalates to higher authority. */
  async escalate(
    inspectionId: string,
    supervisorName: string,
    note?: string
  ): Promise<void> {
    const q = await loadQueue();
    const idx = q.findIndex(r => r.inspectionId === inspectionId);
    if (idx === -1) throw new Error('Record not found');
    if (q[idx].status === 'approved') throw new Error('لا يمكن تعديل تقرير معتمد');
    const now = new Date().toISOString();
    q[idx] = { ...q[idx], status: 'escalated', approvedBy: supervisorName, approvedAt: now, approvalNote: note };
    await saveQueue(q);
    const InspectionRepository = getInspectionRepository();
    const inspection = await InspectionRepository.getById(inspectionId);
    if (inspection) {
      await InspectionRepository.save({
        ...inspection,
        approvalStatus: 'escalated',
        approvedBy: supervisorName,
        approvedAt: now,
        approvalNote: note,
      });
    }
    // FIX (G17a): positional-args form
    await AuditLogRepository.append(
      'INSPECTION_SAVED',
      supervisorName,
      { inspectionId, facilityName: q[idx].facilityName, detail: `رفع المشرف للجهة الأعلى` },
    );
  },
};
