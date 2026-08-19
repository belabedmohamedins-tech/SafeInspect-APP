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
//     - A single STABLE db object is created once and returned by getDb() in
//       every call — escalateOverdue() and the main method call both hit the
//       same object, so runAsync.mock.calls is never split across two instances.

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

// Step 2: capture the mock module synchronously.
const schemaMock = jest.requireMock('../../db/schema') as {
  getDb: jest.Mock;
};

let mockRunAsync: jest.Mock;
let mockGetFirstAsync: jest.Mock;
let mockGetAllAsync: jest.Mock;

// Stable db object — same reference for every getDb() call in every test.
// escalateOverdue() calls getDb() internally before the main method call;
// both must receive the SAME object or runAsync.mock.calls gets split.
const stableDb = {
  runAsync:      jest.fn().mockResolvedValue({ changes: 1 }),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync:    jest.fn().mockResolvedValue([]),
};

beforeAll(() => {
  mockRunAsync      = stableDb.runAsync;
  mockGetFirstAsync = stableDb.getFirstAsync;
  mockGetAllAsync   = stableDb.getAllAsync;
  schemaMock.getDb.mockResolvedValue(stableDb);
});

describe('CorrectiveActionRepository W85', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore defaults after clearAllMocks wipes all mock state.
    mockRunAsync.mockResolvedValue({ changes: 1 });
    mockGetFirstAsync.mockResolvedValue(null);
    mockGetAllAsync.mockResolvedValue([]);
    // Re-wire getDb after clearAllMocks clears its implementation.
    schemaMock.getDb.mockResolvedValue(stableDb);
  });

  describe('updateStatus — closedAt lifecycle (SPEC 03)', () => {
    it('stamps closedAt when status becomes closed (inspector-verified)', async () => {
      mockGetFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion A',
      });

      await CorrectiveActionRepository.updateStatus('cap-1', 'closed');

      // escalateOverdue() fires runAsync first; the UPDATE call is call[1].
      const updateCall = mockRunAsync.mock.calls.find((c: unknown[]) =>
        (c[0] as string).includes('closed_at'),
      );
      expect(updateCall).toBeDefined();
      const params: (string | null)[] = updateCall![1];
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

      const updateCall = mockRunAsync.mock.calls.find((c: unknown[]) =>
        (c[0] as string).includes('closed_at'),
      );
      expect(updateCall).toBeDefined();
      const params: (string | null)[] = updateCall![1];
      expect(params[2]).toBeNull();
    });

    it('does NOT stamp closedAt when status is in-progress', async () => {
      mockGetFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion C',
      });

      await CorrectiveActionRepository.updateStatus('cap-3', 'in-progress');

      const updateCall = mockRunAsync.mock.calls.find((c: unknown[]) =>
        (c[0] as string).includes('closed_at'),
      );
      expect(updateCall).toBeDefined();
      const params: (string | null)[] = updateCall![1];
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
