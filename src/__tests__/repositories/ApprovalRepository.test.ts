// src/__tests__/repositories/ApprovalRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApprovalRepository } from '../../repositories/ApprovalRepository';
import { InspectionRepository } from '../../repositories/InspectionRepository';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';
import type { SavedInspection } from '../../types';

// ─── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    save:    jest.fn(),
  },
}));
jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: {
    append: jest.fn(),
  },
}));

const mockGetById = jest.mocked(InspectionRepository.getById);
const mockSave    = jest.mocked(InspectionRepository.save);
const mockAudit   = jest.mocked(AuditLogRepository.append);

const { __resetStore } = AsyncStorage as any;
beforeEach(() => {
  __resetStore();
  jest.clearAllMocks();
  mockGetById.mockResolvedValue(null);
  mockSave.mockResolvedValue({} as any);
  mockAudit.mockResolvedValue(undefined);
});

// ─── Fixtures ────────────────────────────────────────────────────────────────
const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id: 'ins-1', facilityId: 'fac-1', facilityName: 'Facility',
  facilityAddress: 'Address', inspectorName: 'Inspector',
  date: '2024-06-01', status: 'completed', items: [], grade: 'B', score: 78,
  ...overrides,
});

describe('ApprovalRepository', () => {
  describe('getQueue / enqueue', () => {
    it('returns empty queue initially', async () => {
      expect(await ApprovalRepository.getQueue()).toEqual([]);
    });

    it('enqueues an inspection as pending', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      const q = await ApprovalRepository.getQueue();
      expect(q).toHaveLength(1);
      expect(q[0].status).toBe('pending');
      expect(q[0].inspectionId).toBe('ins-1');
    });

    it('is idempotent — does not duplicate an already-queued inspection', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.enqueue(makeInspection());
      expect(await ApprovalRepository.getQueue()).toHaveLength(1);
    });

    it('returns queue sorted by date descending', async () => {
      await ApprovalRepository.enqueue(makeInspection({ id: 'ins-old', date: '2024-01-01' }));
      await ApprovalRepository.enqueue(makeInspection({ id: 'ins-new', date: '2024-06-01' }));
      const q = await ApprovalRepository.getQueue();
      expect(q[0].inspectionId).toBe('ins-new');
    });
  });

  describe('getPending', () => {
    it('returns only pending records', async () => {
      await ApprovalRepository.enqueue(makeInspection({ id: 'ins-1' }));
      await ApprovalRepository.enqueue(makeInspection({ id: 'ins-2' }));
      await ApprovalRepository.approve('ins-1', 'Supervisor');
      const pending = await ApprovalRepository.getPending();
      expect(pending).toHaveLength(1);
      expect(pending[0].inspectionId).toBe('ins-2');
    });
  });

  describe('approve', () => {
    it('sets status to approved with supervisor name and timestamp', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.approve('ins-1', 'Supervisor Ali');
      const q = await ApprovalRepository.getQueue();
      expect(q[0].status).toBe('approved');
      expect(q[0].approvedBy).toBe('Supervisor Ali');
      expect(q[0].approvedAt).toBeTruthy();
    });

    it('throws when inspectionId is not in the queue', async () => {
      await expect(ApprovalRepository.approve('nonexistent', 'Sup')).rejects.toThrow('Record not found');
    });

    it('is idempotent — does not re-approve an already-approved record', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.approve('ins-1', 'Sup');
      const firstApprovedAt = (await ApprovalRepository.getQueue())[0].approvedAt;
      await new Promise(r => setTimeout(r, 5));
      await ApprovalRepository.approve('ins-1', 'Sup2');
      const secondApprovedAt = (await ApprovalRepository.getQueue())[0].approvedAt;
      expect(secondApprovedAt).toBe(firstApprovedAt);
    });

    it('patches the inspection record via InspectionRepository', async () => {
      const ins = makeInspection();
      mockGetById.mockResolvedValue(ins);
      await ApprovalRepository.enqueue(ins);
      await ApprovalRepository.approve('ins-1', 'Sup');
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ approvalStatus: 'approved' }));
    });

    it('writes an audit log entry', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.approve('ins-1', 'Sup');
      expect(mockAudit).toHaveBeenCalledTimes(1);
    });

    it('stores optional approvalNote', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.approve('ins-1', 'Sup', 'Looks good');
      const q = await ApprovalRepository.getQueue();
      expect(q[0].approvalNote).toBe('Looks good');
    });
  });

  describe('returnForRevision', () => {
    it('sets status to returned with reason', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.returnForRevision('ins-1', 'Sup', 'Missing photos');
      const q = await ApprovalRepository.getQueue();
      expect(q[0].status).toBe('returned');
      expect(q[0].returnedReason).toBe('Missing photos');
    });

    it('throws when trying to return an already-approved record', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.approve('ins-1', 'Sup');
      await expect(
        ApprovalRepository.returnForRevision('ins-1', 'Sup', 'reason')
      ).rejects.toThrow();
    });

    it('throws when inspectionId is not in queue', async () => {
      await expect(
        ApprovalRepository.returnForRevision('nonexistent', 'Sup', 'reason')
      ).rejects.toThrow('Record not found');
    });

    // ── line 110: patches inspection when getById returns a record ────────────
    it('patches the inspection record with returned status', async () => {
      const ins = makeInspection();
      mockGetById.mockResolvedValue(ins);
      await ApprovalRepository.enqueue(ins);
      await ApprovalRepository.returnForRevision('ins-1', 'Sup', 'Need more info');
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ approvalStatus: 'returned', returnedReason: 'Need more info' })
      );
    });

    it('writes an audit log entry on return', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.returnForRevision('ins-1', 'Sup', 'fix it');
      expect(mockAudit).toHaveBeenCalledTimes(1);
    });
  });

  describe('escalate', () => {
    it('sets status to escalated', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.escalate('ins-1', 'Sup', 'Complex case');
      const q = await ApprovalRepository.getQueue();
      expect(q[0].status).toBe('escalated');
    });

    it('throws when inspectionId is not in queue', async () => {
      await expect(
        ApprovalRepository.escalate('nonexistent', 'Sup')
      ).rejects.toThrow('Record not found');
    });

    it('throws when trying to escalate an already-approved record', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.approve('ins-1', 'Sup');
      await expect(
        ApprovalRepository.escalate('ins-1', 'Sup2')
      ).rejects.toThrow();
    });

    // ── line 142: patches inspection when getById returns a record ────────────
    it('patches the inspection record with escalated status', async () => {
      const ins = makeInspection();
      mockGetById.mockResolvedValue(ins);
      await ApprovalRepository.enqueue(ins);
      await ApprovalRepository.escalate('ins-1', 'Sup', 'Needs director review');
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ approvalStatus: 'escalated' })
      );
    });

    it('writes an audit log entry on escalation', async () => {
      await ApprovalRepository.enqueue(makeInspection());
      await ApprovalRepository.escalate('ins-1', 'Sup');
      expect(mockAudit).toHaveBeenCalledTimes(1);
    });
  });
});
