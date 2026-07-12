// __tests__/repositories/ApprovalRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApprovalRepository } from '../../src/repositories/ApprovalRepository';
import { AuditLogRepository } from '../../src/repositories/AuditLogRepository';

jest.mock('../../src/repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: jest.fn().mockResolvedValue(undefined) },
}));

// Mock the lazy circular require inside ApprovalRepository
const mockGetById = jest.fn();
const mockSave = jest.fn();
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: { getById: mockGetById, save: mockSave },
}));

const QUEUE_KEY = 'APPROVAL_QUEUE';

const baseInspection = {
  id: 'i1',
  facilityName: 'Factory A',
  inspectorName: 'Ahmed',
  grade: 'B',
  score: 78,
  date: '2026-07-01T10:00:00.000Z',
  approvalStatus: 'pending' as const,
};

beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
  mockGetById.mockResolvedValue(baseInspection);
  mockSave.mockResolvedValue(undefined);
});

describe('ApprovalRepository.getQueue', () => {
  it('returns empty array when nothing stored', async () => {
    const q = await ApprovalRepository.getQueue();
    expect(q).toEqual([]);
  });

  it('returns records sorted newest first', async () => {
    const records = [
      { inspectionId: 'a', facilityName: 'F', inspectorName: 'X', date: '2026-01-01T00:00:00.000Z', status: 'pending' as const },
      { inspectionId: 'b', facilityName: 'F', inspectorName: 'X', date: '2026-06-01T00:00:00.000Z', status: 'pending' as const },
    ];
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(records));
    const q = await ApprovalRepository.getQueue();
    expect(q[0].inspectionId).toBe('b');
    expect(q[1].inspectionId).toBe('a');
  });
});

describe('ApprovalRepository.getPending', () => {
  it('returns only pending records', async () => {
    const records = [
      { inspectionId: 'a', facilityName: 'F', inspectorName: 'X', date: '2026-01-01T00:00:00.000Z', status: 'pending' as const },
      { inspectionId: 'b', facilityName: 'F', inspectorName: 'X', date: '2026-01-02T00:00:00.000Z', status: 'approved' as const },
    ];
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(records));
    const pending = await ApprovalRepository.getPending();
    expect(pending).toHaveLength(1);
    expect(pending[0].inspectionId).toBe('a');
  });
});

describe('ApprovalRepository.enqueue', () => {
  it('adds a new record as pending', async () => {
    await ApprovalRepository.enqueue(baseInspection as any);
    const q = await ApprovalRepository.getQueue();
    expect(q).toHaveLength(1);
    expect(q[0].status).toBe('pending');
    expect(q[0].inspectionId).toBe('i1');
  });

  it('is idempotent — does not add duplicate', async () => {
    await ApprovalRepository.enqueue(baseInspection as any);
    await ApprovalRepository.enqueue(baseInspection as any);
    const q = await ApprovalRepository.getQueue();
    expect(q).toHaveLength(1);
  });
});

describe('ApprovalRepository.approve', () => {
  beforeEach(async () => {
    await ApprovalRepository.enqueue(baseInspection as any);
  });

  it('sets status to approved', async () => {
    await ApprovalRepository.approve('i1', 'Supervisor S');
    const q = await ApprovalRepository.getQueue();
    expect(q[0].status).toBe('approved');
    expect(q[0].approvedBy).toBe('Supervisor S');
  });

  it('calls InspectionRepository.save with approvalStatus approved', async () => {
    await ApprovalRepository.approve('i1', 'Supervisor S', 'LGTM');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ approvalStatus: 'approved', approvedBy: 'Supervisor S', approvalNote: 'LGTM' })
    );
  });

  it('is a no-op if already approved', async () => {
    await ApprovalRepository.approve('i1', 'Supervisor S');
    mockSave.mockClear();
    await ApprovalRepository.approve('i1', 'Supervisor S');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('throws if record not found', async () => {
    await expect(ApprovalRepository.approve('UNKNOWN', 'X')).rejects.toThrow('Record not found');
  });

  it('appends audit log entry', async () => {
    await ApprovalRepository.approve('i1', 'Supervisor S');
    expect(AuditLogRepository.append).toHaveBeenCalled();
  });
});

describe('ApprovalRepository.returnForRevision', () => {
  beforeEach(async () => {
    await ApprovalRepository.enqueue(baseInspection as any);
  });

  it('sets status to returned with reason', async () => {
    await ApprovalRepository.returnForRevision('i1', 'Supervisor S', 'Missing photos');
    const q = await ApprovalRepository.getQueue();
    expect(q[0].status).toBe('returned');
    expect(q[0].returnedReason).toBe('Missing photos');
  });

  it('throws if already approved', async () => {
    await ApprovalRepository.approve('i1', 'Supervisor S');
    await expect(
      ApprovalRepository.returnForRevision('i1', 'Supervisor S', 'reason')
    ).rejects.toThrow('لا يمكن تعديل تقرير معتمد');
  });

  it('throws if record not found', async () => {
    await expect(
      ApprovalRepository.returnForRevision('UNKNOWN', 'X', 'reason')
    ).rejects.toThrow('Record not found');
  });
});

describe('ApprovalRepository.escalate', () => {
  beforeEach(async () => {
    await ApprovalRepository.enqueue(baseInspection as any);
  });

  it('sets status to escalated', async () => {
    await ApprovalRepository.escalate('i1', 'Supervisor S', 'Needs director');
    const q = await ApprovalRepository.getQueue();
    expect(q[0].status).toBe('escalated');
    expect(q[0].approvalNote).toBe('Needs director');
  });

  it('throws if already approved', async () => {
    await ApprovalRepository.approve('i1', 'Supervisor S');
    await expect(
      ApprovalRepository.escalate('i1', 'Supervisor S')
    ).rejects.toThrow('لا يمكن تعديل تقرير معتمد');
  });

  it('throws if record not found', async () => {
    await expect(ApprovalRepository.escalate('UNKNOWN', 'X')).rejects.toThrow('Record not found');
  });

  it('calls InspectionRepository.save with escalated status', async () => {
    await ApprovalRepository.escalate('i1', 'Supervisor S');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ approvalStatus: 'escalated' })
    );
  });
});
