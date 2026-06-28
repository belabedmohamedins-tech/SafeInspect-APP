// src/__tests__/followUpService.test.ts
import { createFollowUpIfNeeded } from '../services/followUpService';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import type { SavedInspection } from '../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────────
const mockAgendaSave   = jest.fn().mockResolvedValue(undefined);
const mockAgendaGetAll = jest.fn().mockResolvedValue([]);
const mockCapGet       = jest.fn().mockResolvedValue([]);

jest.mock('../repositories/AgendaRepository', () => ({
  AgendaRepository: {
    save:   mockAgendaSave,
    getAll: mockAgendaGetAll,
  },
}));

jest.mock('../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: mockCapGet,
  },
}));

beforeEach(() => { jest.clearAllMocks(); mockAgendaGetAll.mockResolvedValue([]); mockCapGet.mockResolvedValue([]); });

// ─── Fixtures ──────────────────────────────────────────────────────────────────────
const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id: 'ins-1', facilityId: 'fac-1', facilityName: 'Facility',
  facilityAddress: 'Address', inspectorName: 'Inspector',
  date: '2024-01-15', status: 'completed', items: [], grade: 'A', score: 90,
  ...overrides,
});

describe('createFollowUpIfNeeded', () => {
  describe('skips follow-up creation', () => {
    it('does nothing when inspection is not completed', async () => {
      await createFollowUpIfNeeded(makeInspection({ status: 'pending' as any }));
      expect(mockAgendaSave).not.toHaveBeenCalled();
    });

    it('does nothing when grade is not D and no open CAPs', async () => {
      mockCapGet.mockResolvedValue([]);
      await createFollowUpIfNeeded(makeInspection({ grade: 'A' }));
      expect(mockAgendaSave).not.toHaveBeenCalled();
    });

    it('does not create a duplicate follow-up for the same inspection', async () => {
      const inspection = makeInspection({ grade: 'D' });
      mockAgendaGetAll.mockResolvedValue([{
        facilityId: 'fac-1',
        notes: `[follow-up:${inspection.id}]`,
      }]);
      await createFollowUpIfNeeded(inspection);
      expect(mockAgendaSave).not.toHaveBeenCalled();
    });
  });

  describe('creates follow-up', () => {
    it('creates a follow-up when grade is D', async () => {
      await createFollowUpIfNeeded(makeInspection({ grade: 'D' }));
      expect(mockAgendaSave).toHaveBeenCalledTimes(1);
      const saved = mockAgendaSave.mock.calls[0][0];
      expect(saved.facilityId).toBe('fac-1');
      expect(saved.notes).toContain('[follow-up:ins-1]');
      expect(saved.status).toBe('pending');
    });

    it('schedules follow-up 30 days after inspection date', async () => {
      await createFollowUpIfNeeded(makeInspection({ grade: 'D', date: '2024-01-15' }));
      const saved = mockAgendaSave.mock.calls[0][0];
      expect(saved.date).toBe('2024-02-14');
    });

    it('creates a follow-up when there are open CAP items (grade not D)', async () => {
      mockCapGet.mockResolvedValue([{ id: 'cap-1' }]);
      await createFollowUpIfNeeded(makeInspection({ grade: 'B' }));
      expect(mockAgendaSave).toHaveBeenCalledTimes(1);
      const saved = mockAgendaSave.mock.calls[0][0];
      expect(saved.notes).toContain('إجراءات تصحيحية مفتوحة');
    });

    it('includes grade D reason in Arabic in the note', async () => {
      await createFollowUpIfNeeded(makeInspection({ grade: 'D' }));
      const saved = mockAgendaSave.mock.calls[0][0];
      expect(saved.notes).toContain('درجة D');
    });
  });
});
