// src/__tests__/repositories/CorrectiveActionRepository.extended.test.ts
//
// W85 regression tests:
//   1. updateStatus() stamps closedAt ONLY when status === 'closed'
//   2. updateStatus() does NOT stamp closedAt when status === 'resolved'
//   3. deleteByInspection() removes rows for the given inspectionId
//
// W89 FIX: corrected all relative import paths.
// W89 FIX 2 (definitive): jest.mock() hoisting means outer const variables are
//   undefined inside the factory. Pattern used here:
//     - jest.fn() calls are made INSIDE the factory (always safe).
//     - jest.requireMock() is called SYNCHRONOUSLY after jest.mock() to capture
//       the concrete mock functions into module-level variables.
//     - beforeEach re-wires getDb() so the repository always gets the same
//       stable db object with the (now non-cleared) mock functions.

import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';

// Step 1: register the mock. All jest.fn() calls are inside the factory — safe.
jest.mock('../../db/schema', () => ({
  getDb: jest.fn().mockResolvedValue({
    runAsync:      jest.fn().mockResolvedValue({ changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync:    jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('../../services/NotificationService', () => ({
  pushInApp: jest.fn().mockResolvedValue(undefined),
}));

// Step 2: capture mock functions synchronously via requireMock.
const schemaMock = jest.requireMock('../../db/schema') as {
  getDb: jest.Mock;
};

let mockRunAsync: jest.Mock;
let mockGetFirstAsync: jest.Mock;
let mockGetAllAsync: jest.Mock;

beforeAll(async () => {
  const db = await schemaMock.getDb();
  mockRunAsync      = db.runAsync      as jest.Mock;
  mockGetFirstAsync = db.getFirstAsync as jest.Mock;
  mockGetAllAsync   = db.getAllAsync   as jest.Mock;
});

describe('CorrectiveActionRepository W85', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore defaults after clearAllMocks.
    mockRunAsync.mockResolvedValue({ changes: 1 });
    mockGetFirstAsync.mockResolvedValue(null);
    mockGetAllAsync.mockResolvedValue([]);
    // Re-wire getDb so the repository gets the same db object in every test.
    schemaMock.getDb.mockResolvedValue({
      runAsync:      mockRunAsync,
      getFirstAsync: mockGetFirstAsync,
      getAllAsync:    mockGetAllAsync,
    });
  });

  describe('updateStatus — closedAt lifecycle (SPEC 03)', () => {
    it('stamps closedAt when status becomes closed (inspector-verified)', async () => {
      mockGetFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion A',
      });

      await CorrectiveActionRepository.updateStatus('cap-1', 'closed');

      const call = mockRunAsync.mock.calls[0];
      const sql: string = call[0];
      const params: (string | null)[] = call[1];
      expect(sql).toContain('closed_at');
      const closedAt = params[2];
      expect(closedAt).not.toBeNull();
      expect(typeof closedAt).toBe('string');
      expect(closedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('does NOT stamp closedAt when status is resolved (self-reported only)', async () => {
      mockGetFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion B',
      });

      await CorrectiveActionRepository.updateStatus('cap-2', 'resolved');

      const call = mockRunAsync.mock.calls[0];
      const params: (string | null)[] = call[1];
      expect(params[2]).toBeNull();
    });

    it('does NOT stamp closedAt when status is in-progress', async () => {
      mockGetFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion C',
      });

      await CorrectiveActionRepository.updateStatus('cap-3', 'in-progress');

      const call = mockRunAsync.mock.calls[0];
      const params: (string | null)[] = call[1];
      expect(params[2]).toBeNull();
    });
  });

  describe('deleteByInspection', () => {
    it('deletes all CAPs for a given inspectionId', async () => {
      await CorrectiveActionRepository.deleteByInspection('insp-abc');

      expect(mockRunAsync).toHaveBeenCalledWith(
        'DELETE FROM corrective_actions WHERE inspection_id = ?',
        ['insp-abc'],
      );
    });
  });
});
