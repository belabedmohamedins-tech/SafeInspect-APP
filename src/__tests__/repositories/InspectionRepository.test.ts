// src/__tests__/repositories/InspectionRepository.test.ts
// W22: verify save() throws INSPECTION_LOCKED for approved inspections.
// W57-FIX: mock IntegrityService.hashAndStore (W5 method name — stamp never existed).

import { InspectionRepository } from '../../repositories/InspectionRepository';
import { SavedInspection } from '../../types';

const mockRun = jest.fn().mockResolvedValue(undefined);
const mockGetFirst = jest.fn();
const mockGetAll = jest.fn().mockResolvedValue([]);

jest.mock('../../db/schema', () => ({
  getDb: jest.fn().mockResolvedValue({
    runAsync: (...args: unknown[]) => mockRun(...args),
    getFirstAsync: (...args: unknown[]) => mockGetFirst(...args),
    getAllAsync: (...args: unknown[]) => mockGetAll(...args),
  }),
}));

jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: {
    // hashAndStore returns the hash string; save() embeds it via { ...inspection, integrityHash: hash }
    hashAndStore: jest.fn().mockResolvedValue('mock-hash-abc'),
  },
}));
jest.mock('../../services/capFactory', () => ({
  createCapItemsFromInspection: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../services/followUpService', () => ({
  createFollowUpIfNeeded: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../repositories/ApprovalRepository', () => ({
  ApprovalRepository: { enqueue: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../../services/violationHistory', () => ({
  annotateRepeatViolations: jest.fn().mockResolvedValue([]),
}));

const baseInspection: SavedInspection = {
  id: 'insp-001',
  facilityId: 'fac-001',
  facilityName: 'مصنع الاختبار',
  facilityAddress: 'الجزائر',
  date: '2026-08-08',
  inspectorName: 'محمد',
  status: 'draft',
  items: [],
  openingMeetingDone: false,
  closingMeetingDone: false,
  criticalOverride: false,
  incomplete: false,
};

beforeEach(() => {
  mockRun.mockClear();
  mockGetFirst.mockClear();
  mockGetAll.mockClear();
});

describe('InspectionRepository.save — W22 immutability guard', () => {
  it('throws INSPECTION_LOCKED when existing row is approved', async () => {
    mockGetFirst.mockResolvedValueOnce({
      approval_status: 'approved',
    });
    await expect(
      InspectionRepository.save({ ...baseInspection, status: 'completed' }),
    ).rejects.toThrow('INSPECTION_LOCKED');
    // upsert must NOT have been called
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('does NOT throw when existing row has approval_status = pending', async () => {
    mockGetFirst.mockResolvedValueOnce({
      approval_status: 'pending',
    });
    await expect(
      InspectionRepository.save({ ...baseInspection, status: 'draft' }),
    ).resolves.toBeUndefined();
  });

  it('does NOT throw for a new inspection (no existing row)', async () => {
    mockGetFirst.mockResolvedValueOnce(null);
    await expect(
      InspectionRepository.save(baseInspection),
    ).resolves.toBeUndefined();
  });
});
