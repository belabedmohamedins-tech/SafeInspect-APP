// src/__tests__/repositories/CorrectiveActionRepository.extended.test.ts
//
// W85 regression tests:
//   1. updateStatus() stamps closedAt ONLY when status === 'closed'
//   2. updateStatus() does NOT stamp closedAt when status === 'resolved'
//   3. deleteByInspection() removes rows for the given inspectionId
//
// W89: fixed import path — was '../../repositories/...' (missing src/ prefix
//      relative to src/__tests__/), corrected to '../repositories/...'.

import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';

const mockRunAsync = jest.fn().mockResolvedValue({ changes: 1 });
const mockGetFirstAsync = jest.fn();
const mockGetAllAsync = jest.fn().mockResolvedValue([]);

jest.mock('../db/schema', () => ({
  getDb: jest.fn().mockResolvedValue({
    runAsync: mockRunAsync,
    getFirstAsync: mockGetFirstAsync,
    getAllAsync: mockGetAllAsync,
  }),
}));

jest.mock('../services/NotificationService', () => ({
  pushInApp: jest.fn().mockResolvedValue(undefined),
}));

describe('CorrectiveActionRepository W85', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFirstAsync.mockResolvedValue(null);
  });

  describe('updateStatus — closedAt lifecycle (SPEC 03)', () => {
    it('stamps closedAt when status becomes closed (inspector-verified)', async () => {
      mockGetFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion A',
      });

      await CorrectiveActionRepository.updateStatus('cap-1', 'closed');

      // The SQL must include SET closed_at = ? with a non-null timestamp.
      const call = mockRunAsync.mock.calls[0];
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
      mockGetFirstAsync.mockResolvedValue({
        facility_name: 'Test Facility',
        criteria: 'Criterion B',
      });

      await CorrectiveActionRepository.updateStatus('cap-2', 'resolved');

      const call = mockRunAsync.mock.calls[0];
      const params: (string | null)[] = call[1];
      // Third param (closedAt) must be null for 'resolved' status.
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
