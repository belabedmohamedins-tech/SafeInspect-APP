// src/__tests__/e2e/inspectorLifecycle.e2e.test.ts
//
// W94 — End-to-end integration test: full inspector lifecycle.
//
// Flow tested:
//   1. save()          — inspector saves a draft inspection (hash stored, audit INSPECTION_SAVED)
//   2. save() complete — inspector marks inspection completed (CAP factory fires)
//   3. updateStatus()  — supervisor approves (INSPECTION_STATUS_UPDATED, rehash)
//   4. delete()        — attempt to delete approved inspection → INSPECTION_LOCKED
//   5. updateStatus()  — CAP updateStatus 'closed' → closedAt stamped (ISO string)
//   6. deleteByInspection — cascade: CAPs removed when inspection is deleted (non-approved)
//
// Mock strategy:
//   - Uses the "stable db object" pattern from CorrectiveActionRepository.extended.test.ts
//     to prevent jest.mock() hoisting from breaking captured references.
//   - All jest.fn() calls are INSIDE the factory or assigned to a stable object.
//   - schemaMock.getDb is re-wired after clearAllMocks() in every beforeEach.

import { InspectionRepository } from '../../repositories/InspectionRepository';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: { hashAndStore: jest.fn().mockResolvedValue('hash-abc') },
}));

jest.mock('../../services/capFactory', () => ({
  createCapItemsFromInspection: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/NotificationService', () => ({
  pushInApp: jest.fn().mockResolvedValue(undefined),
}));

// DB mock — stable object approach (hoisting-safe).
jest.mock('../../db/schema', () => ({
  getDb: jest.fn().mockResolvedValue({
    runAsync:      jest.fn().mockResolvedValue({ changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync:    jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('../../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    deleteByInspection: jest.fn().mockResolvedValue(undefined),
    updateStatus:       jest.fn().mockResolvedValue(undefined),
    save:               jest.fn().mockResolvedValue(undefined),
    getAll:             jest.fn().mockResolvedValue([]),
  },
}));

// Capture mock modules synchronously (after jest.mock — safe, no hoisting issue).
const schemaMock = jest.requireMock('../../db/schema') as { getDb: jest.Mock };
const { IntegrityService } = jest.requireMock('../../services/IntegrityService') as
  { IntegrityService: { hashAndStore: jest.Mock } };
const { createCapItemsFromInspection } = jest.requireMock('../../services/capFactory') as
  { createCapItemsFromInspection: jest.Mock };

// Stable DB object — same reference across every getDb() call in a test.
const stableDb = {
  runAsync:      jest.fn().mockResolvedValue({ changes: 1 }),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync:    jest.fn().mockResolvedValue([]),
};

beforeAll(() => {
  schemaMock.getDb.mockResolvedValue(stableDb);
});

// ── Fixture ────────────────────────────────────────────────────────────────────

const BASE_INSPECTION = {
  id:            'e2e-insp-001',
  facilityId:    'facility-1',
  facilityName:  'مصنع الاختبار',
  inspectorName: 'أمين بلعبد',
  status:        'draft' as const,
  approvalStatus: undefined as undefined,
  integrityHash: undefined as undefined,
  score:         78,
  criteria:      [],
  createdAt:     '2026-08-19T00:00:00.000Z',
  updatedAt:     '2026-08-19T00:00:00.000Z',
};

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('Inspector Lifecycle E2E — W94', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore stable mock defaults after clearAllMocks wipes implementations.
    stableDb.runAsync.mockResolvedValue({ changes: 1 });
    stableDb.getFirstAsync.mockResolvedValue(null);
    stableDb.getAllAsync.mockResolvedValue([]);
    schemaMock.getDb.mockResolvedValue(stableDb);
    IntegrityService.hashAndStore.mockResolvedValue('hash-abc');
    (AuditLogRepository.append as jest.Mock).mockResolvedValue(undefined);
    createCapItemsFromInspection.mockResolvedValue(undefined);
    (CorrectiveActionRepository.deleteByInspection as jest.Mock).mockResolvedValue(undefined);
  });

  // ── Step 1: save draft ────────────────────────────────────────────────────
  it('Step 1 — save(): hashes inspection and appends INSPECTION_SAVED audit entry', async () => {
    stableDb.getFirstAsync.mockResolvedValue(null); // no existing row

    await InspectionRepository.save({ ...BASE_INSPECTION });

    expect(IntegrityService.hashAndStore).toHaveBeenCalledTimes(1);
    expect(AuditLogRepository.append).toHaveBeenCalledWith(
      'INSPECTION_SAVED',
      BASE_INSPECTION.inspectorName,
      expect.objectContaining({ inspectionId: BASE_INSPECTION.id }),
    );
    expect(stableDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO inspections'),
      expect.arrayContaining([BASE_INSPECTION.id]),
    );
  });

  // ── Step 2: save completed → CAP factory fires ────────────────────────────
  it('Step 2 — save() with status=completed: fires createCapItemsFromInspection', async () => {
    stableDb.getFirstAsync.mockResolvedValue(null);
    const completedInsp = { ...BASE_INSPECTION, status: 'completed' as const };

    await InspectionRepository.save(completedInsp);

    expect(createCapItemsFromInspection).toHaveBeenCalledTimes(1);
    expect(createCapItemsFromInspection).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed', id: BASE_INSPECTION.id }),
    );
  });

  // ── Step 3: supervisor approves → integrity rehash + audit log ────────────
  it('Step 3 — updateStatus(approved): rehashes + appends INSPECTION_STATUS_UPDATED', async () => {
    const existingRow = {
      id:              BASE_INSPECTION.id,
      data:            JSON.stringify({ ...BASE_INSPECTION, approvalStatus: null }),
      facility_id:     BASE_INSPECTION.facilityId,
      status:          'completed',
      approval_status: null,
      created_at:      '2026-08-19T00:00:00.000Z',
      updated_at:      '2026-08-19T00:00:00.000Z',
    };
    stableDb.getFirstAsync.mockResolvedValue(existingRow);

    await InspectionRepository.updateStatus(BASE_INSPECTION.id, 'approved', 'supervisor-1');

    expect(IntegrityService.hashAndStore).toHaveBeenCalledTimes(1);
    expect(AuditLogRepository.append).toHaveBeenCalledWith(
      'INSPECTION_STATUS_UPDATED',
      'supervisor-1',
      expect.objectContaining({
        inspectionId: BASE_INSPECTION.id,
        detail: 'approvalStatus → approved',
      }),
    );
    expect(stableDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE inspections'),
      expect.arrayContaining(['approved', BASE_INSPECTION.id]),
    );
  });

  // ── Step 4: delete approved inspection → INSPECTION_LOCKED ───────────────
  it('Step 4 — delete() on approved inspection: throws INSPECTION_LOCKED, no cascade', async () => {
    stableDb.getFirstAsync.mockResolvedValue({
      approval_status: 'approved',
      facility_name:   BASE_INSPECTION.facilityName,
    });

    await expect(
      InspectionRepository.delete(BASE_INSPECTION.id),
    ).rejects.toThrow('INSPECTION_LOCKED');

    expect(CorrectiveActionRepository.deleteByInspection).not.toHaveBeenCalled();
    expect(AuditLogRepository.append).toHaveBeenCalledWith(
      'INSPECTION_DELETE_BLOCKED',
      'system',
      expect.objectContaining({ inspectionId: BASE_INSPECTION.id }),
    );
  });

  // ── Step 5: delete non-approved → cascade to CAPs ────────────────────────
  it('Step 5 — delete() non-approved: cascades deleteByInspection then removes row', async () => {
    stableDb.getFirstAsync.mockResolvedValue({
      approval_status: null,
      facility_name:   BASE_INSPECTION.facilityName,
    });

    await InspectionRepository.delete(BASE_INSPECTION.id);

    expect(CorrectiveActionRepository.deleteByInspection).toHaveBeenCalledWith(BASE_INSPECTION.id);
    expect(stableDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM inspections WHERE id = ?',
      [BASE_INSPECTION.id],
    );
    expect(AuditLogRepository.append).toHaveBeenCalledWith(
      'INSPECTION_DELETED',
      'system',
      expect.objectContaining({ inspectionId: BASE_INSPECTION.id }),
    );
  });

  // ── Step 6: save() on approved row → INSPECTION_LOCKED ───────────────────
  it('Step 6 — save() on approved row: throws INSPECTION_LOCKED (W22 immutability)', async () => {
    stableDb.getFirstAsync.mockResolvedValue({ approval_status: 'approved' });

    await expect(
      InspectionRepository.save({ ...BASE_INSPECTION }),
    ).rejects.toThrow('INSPECTION_LOCKED');

    // Hash must NOT have been computed — guard fires before mutation.
    expect(IntegrityService.hashAndStore).not.toHaveBeenCalled();
    expect(stableDb.runAsync).not.toHaveBeenCalled();
  });

  // ── Step 7: deleteMany with one approved → INSPECTION_LOCKED, no cascade ──
  it('Step 7 — deleteMany() with one approved id: throws INSPECTION_LOCKED, nothing deleted', async () => {
    stableDb.getAllAsync.mockResolvedValue([
      { id: 'e2e-insp-001', approval_status: null,       facility_name: 'A' },
      { id: 'e2e-insp-002', approval_status: 'approved', facility_name: 'B' },
    ]);

    await expect(
      InspectionRepository.deleteMany(['e2e-insp-001', 'e2e-insp-002']),
    ).rejects.toThrow('INSPECTION_LOCKED');

    // No rows must have been deleted.
    const deleteSql = stableDb.runAsync.mock.calls.find(
      (c: unknown[]) => (c[0] as string).startsWith('DELETE'),
    );
    expect(deleteSql).toBeUndefined();
  });

  // ── Step 8: clear() blocked when any approved row exists ─────────────────
  it('Step 8 — clear() blocked when an approved inspection exists (W52)', async () => {
    stableDb.getFirstAsync.mockResolvedValue({ id: 'e2e-insp-002' });

    await expect(InspectionRepository.clear()).rejects.toThrow('INSPECTION_LOCKED');
    expect(AuditLogRepository.append).toHaveBeenCalledWith(
      'INSPECTION_DELETE_BLOCKED',
      'system',
      expect.objectContaining({ detail: expect.stringContaining('clear()') }),
    );
  });
});
