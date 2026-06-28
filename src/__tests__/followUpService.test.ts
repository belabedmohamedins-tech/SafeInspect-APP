// src/__tests__/followUpService.test.ts
//
// ROOT CAUSE REMINDER (see TESTING.md §Layer-4):
// jest.mock() is hoisted ABOVE every `const` by Babel.
// Fix: inline jest.fn() directly in the factory, then use jest.mocked()
// to get a typed reference after module resolution.

import { createFollowUpIfNeeded } from '../services/followUpService';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import type { SavedInspection } from '../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────
jest.mock('../repositories/AgendaRepository', () => ({
  AgendaRepository: {
    save:   jest.fn(),
    getAll: jest.fn(),
  },
}));

jest.mock('../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: jest.fn(),
  },
}));

const mockAgendaSave   = jest.mocked(AgendaRepository.save);
const mockAgendaGetAll = jest.mocked(AgendaRepository.getAll);
const mockCapGet       = jest.mocked(CorrectiveActionRepository.getByInspection);

beforeEach(() => {
  jest.clearAllMocks();
  mockAgendaSave.mockResolvedValue(undefined);
  mockAgendaGetAll.mockResolvedValue([]);
  mockCapGet.mockResolvedValue([]);
});

// ─── Fixtures ───────────────────────────────────────────────────────────────
const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id: 'ins-1', facilityId: 'fac-1', facilityName: 'Facility',
  facilityAddress: 'Address', inspectorName: 'Inspector',
  date: '2024-01-15', status: 'completed', items: [], grade: 'A', score: 90,
  ...overrides,
});

// ─── Tests ──────────────────────────────────────────────────────────────────
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
        id: 'existing-1',
        facilityId: 'fac-1',
        facilityName: 'Facility',
        facilityAddress: 'Address',
        date: '2024-02-14',
        status: 'pending',
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
      mockCapGet.mockResolvedValue([{ id: 'cap-1' } as any]);
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
