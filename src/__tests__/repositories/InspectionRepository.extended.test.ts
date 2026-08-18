// src/__tests__/repositories/InspectionRepository.extended.test.ts
//
// W85 regression tests:
//   1. delete() cascades to CorrectiveActionRepository.deleteByInspection()
//   2. deleteMany() cascades to CorrectiveActionRepository.deleteByInspection()

import { InspectionRepository } from '../../repositories/InspectionRepository';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';

jest.mock('../../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    deleteByInspection: jest.fn().mockResolvedValue(undefined),
    save: jest.fn(),
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../db/schema', () => ({
  getDb: jest.fn().mockResolvedValue({
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
    runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
  }),
}));

jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: { hashAndStore: jest.fn().mockResolvedValue('hash') },
}));

jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../../services/capFactory', () => ({
  createCapItemsFromInspection: jest.fn().mockResolvedValue(undefined),
}));

describe('InspectionRepository W85 cascade delete', () => {
  const { getDb } = require('../../db/schema');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delete() calls deleteByInspection before removing the row', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({ approval_status: null, facility_name: 'Test' }),
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
      getAllAsync: jest.fn().mockResolvedValue([]),
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);

    await InspectionRepository.delete('insp-1');

    expect(CorrectiveActionRepository.deleteByInspection).toHaveBeenCalledWith('insp-1');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM inspections WHERE id = ?',
      ['insp-1'],
    );
  });

  it('delete() does NOT cascade if inspection is approved (throws INSPECTION_LOCKED)', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({ approval_status: 'approved', facility_name: 'Test' }),
      runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
      getAllAsync: jest.fn().mockResolvedValue([]),
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);

    await expect(InspectionRepository.delete('insp-locked')).rejects.toThrow('INSPECTION_LOCKED');
    expect(CorrectiveActionRepository.deleteByInspection).not.toHaveBeenCalled();
  });

  it('deleteMany() cascades deleteByInspection for each id', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue(null),
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 'insp-a', approval_status: null, facility_name: 'A' },
        { id: 'insp-b', approval_status: null, facility_name: 'B' },
      ]),
      runAsync: jest.fn().mockResolvedValue({ changes: 2 }),
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);

    await InspectionRepository.deleteMany(['insp-a', 'insp-b']);

    expect(CorrectiveActionRepository.deleteByInspection).toHaveBeenCalledWith('insp-a');
    expect(CorrectiveActionRepository.deleteByInspection).toHaveBeenCalledWith('insp-b');
    expect(CorrectiveActionRepository.deleteByInspection).toHaveBeenCalledTimes(2);
  });
});
