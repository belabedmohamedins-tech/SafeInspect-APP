// src/__tests__/repositories/CorrectiveActionRepository.extended.test.ts
//
// W85 regression tests:
//   1. updateStatus() stamps closedAt ONLY when status === 'closed'
//   2. updateStatus() does NOT stamp closedAt when status === 'resolved'
//   3. deleteByInspection() removes rows for the given inspectionId
//
// W89 FIX: corrected all relative import paths.
// W89 FIX 2: jest.mock() is hoisted by Babel before const declarations run,
//   so the factory cannot reference outer const variables (they are undefined
//   at hoist time). Fix: use a module-scoped 'dbMocks' object initialised
//   inside the factory with fresh jest.fn() calls. Tests access it via the
//   object reference which is stable across hoisting.

import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';

// Shared mock container — populated inside the jest.mock factory below.
// This object is created before hoisting runs, so its reference is stable.
const dbMocks = {
  runAsync:      null as unknown as jest.Mock,
  getFirstAsync: null as unknown as jest.Mock,
  getAllAsync:    null as unknown as jest.Mock,
};

jest.mock('../../db/schema', () => ({
  getDb: jest.fn().mockResolvedValue({
    // jest.fn() calls here are safe: they execute inside the factory at hoist
    // time and are stored on the module export. We then capture them below.
    runAsync:      jest.fn().mockResolvedValue({ changes: 1 }),
    getFirstAsync: jest.fn(),
    getAllAsync:    jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('../../services/NotificationService', () => ({
  pushInApp: jest.fn().mockResolvedValue(undefined),
}));

// After jest.mock() hoisting is done, capture the concrete mock functions
// from the already-registered module so tests can call .mockResolvedValue etc.
beforeAll(async () => {
  const schema = await import('../../db/schema');
  const db = await (schema.getDb as jest.Mock)();
  dbMocks.runAsync      = db.runAsync      as jest.Mock;
  dbMocks.getFirstAsync = db.getFirstAsync as jest.Mock;
  dbMocks.getAllAsync    = db.getAllAsync    as jest.Mock;
});

describe('CorrectiveActionRepository W85', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dbMocks.getFirstAsync.mockResolvedValue(null);
  });

  describe('updateStatus — closedAt lifecycle (SPEC 03)', () => {
    it('stamps closedAt when status becomes closed (inspector-verified)', async () => {
      dbMocks.getFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion A',
      });

      await CorrectiveActionRepository.updateStatus('cap-1', 'closed');

      // The SQL must include SET closed_at = ? with a non-null timestamp.
      const call = dbMocks.runAsync.mock.calls[0];
      const sql: string = call[0];
      const params: (string | null)[] = call[1];
      expect(sql).toContain('closed_at');
      // Third param is closedAt — must be a non-null ISO string.
      const closedAt = params[2];
      expect(closedAt).not.toBeNull();
      expect(typeof closedAt).toBe('string');
      expect(closedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('does NOT stamp closedAt when status is resolved (self-reported only)', async () => {
      dbMocks.getFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion B',
      });

      await CorrectiveActionRepository.updateStatus('cap-2', 'resolved');

      const call = dbMocks.runAsync.mock.calls[0];
      const params: (string | null)[] = call[1];
      // Third param (closedAt) must be null for 'resolved' status.
      expect(params[2]).toBeNull();
    });

    it('does NOT stamp closedAt when status is in-progress', async () => {
      dbMocks.getFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion C',
      });

      await CorrectiveActionRepository.updateStatus('cap-3', 'in-progress');

      const call = dbMocks.runAsync.mock.calls[0];
      const params: (string | null)[] = call[1];
      expect(params[2]).toBeNull();
    });
  });

  describe('deleteByInspection', () => {
    it('deletes all CAPs for a given inspectionId', async () => {
      await CorrectiveActionRepository.deleteByInspection('insp-abc');

      expect(dbMocks.runAsync).toHaveBeenCalledWith(
        'DELETE FROM corrective_actions WHERE inspection_id = ?',
        ['insp-abc'],
      );
    });
  });
});
