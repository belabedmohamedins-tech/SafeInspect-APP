// __tests__/services/followUpService.test.ts
import { createFollowUpIfNeeded } from '../../src/services/followUpService';
import { SavedInspection, AgendaItem } from '../../src/types';

jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: jest.fn(), save: jest.fn() },
}));

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { getByInspection: jest.fn() },
}));

import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';

const mockAgendaGetAll  = AgendaRepository.getAll as jest.Mock;
const mockAgendaSave    = AgendaRepository.save as jest.Mock;
const mockCapGetByInsp  = CorrectiveActionRepository.getByInspection as jest.Mock;

const baseInspection: SavedInspection = {
  id: 'insp-1',
  facilityId: 'fac-1',
  facilityName: 'Test',
  facilityAddress: 'Addr',
  date: '2026-01-01',
  status: 'completed',
  grade: 'B',
  items: [],
} as unknown as SavedInspection;

beforeEach(() => {
  jest.clearAllMocks();
  mockAgendaGetAll.mockResolvedValue([]);
  mockAgendaSave.mockResolvedValue(undefined);
  mockCapGetByInsp.mockResolvedValue([]);
});

// ── early-exit conditions ─────────────────────────────────────────────────────────
describe('createFollowUpIfNeeded – early-exit conditions', () => {
  it('does nothing when status is not completed', async () => {
    await createFollowUpIfNeeded({ ...baseInspection, status: 'draft' } as any);
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });

  it('does nothing when grade is not D and no open CAPs', async () => {
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'A' });
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });

  it('does nothing when grade is B and no CAPs', async () => {
    await createFollowUpIfNeeded(baseInspection); // grade B, no CAPs
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });
});

// ── follow-up creation triggers ───────────────────────────────────────────────────
describe('createFollowUpIfNeeded – follow-up creation triggers', () => {
  it('creates follow-up when grade is D', async () => {
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'D' });
    expect(mockAgendaSave).toHaveBeenCalledTimes(1);
  });

  it('creates follow-up when there are open CAPs (any grade)', async () => {
    mockCapGetByInsp.mockResolvedValue([{ id: 'cap-1' }]);
    await createFollowUpIfNeeded(baseInspection);
    expect(mockAgendaSave).toHaveBeenCalledTimes(1);
  });

  it('saved agenda item has correct facilityId', async () => {
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'D' });
    expect(mockAgendaSave.mock.calls[0][0].facilityId).toBe('fac-1');
  });

  it('saved agenda item status is pending', async () => {
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'D' });
    expect(mockAgendaSave.mock.calls[0][0].status).toBe('pending');
  });

  it('follow-up date is 30 days after inspection date', async () => {
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'D', date: '2026-01-01' });
    expect(mockAgendaSave.mock.calls[0][0].date).toBe('2026-01-31');
  });

  it('notes contain [follow-up:insp-1] tag', async () => {
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'D' });
    expect(mockAgendaSave.mock.calls[0][0].notes).toContain('[follow-up:insp-1]');
  });

  it('notes mention درجة D reason when grade D', async () => {
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'D' });
    expect(mockAgendaSave.mock.calls[0][0].notes).toContain('درجة D');
  });

  it('notes mention CAP reason when not grade D but has CAPs', async () => {
    mockCapGetByInsp.mockResolvedValue([{ id: 'cap-1' }]);
    await createFollowUpIfNeeded(baseInspection); // grade B
    expect(mockAgendaSave.mock.calls[0][0].notes).toContain('إجراءات تصحيحية مفتوحة');
  });
});

// ── idempotency ───────────────────────────────────────────────────────────────────────
describe('createFollowUpIfNeeded – idempotency', () => {
  const existingFollowUp: AgendaItem = {
    id: 'followup-insp-1-123',
    facilityId: 'fac-1',
    notes: 'متابعة [follow-up:insp-1]',
    status: 'pending',
  } as unknown as AgendaItem;

  it('does not create duplicate when follow-up already exists for this inspection', async () => {
    mockAgendaGetAll.mockResolvedValue([existingFollowUp]);
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'D' });
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });

  it('creates new follow-up when existing one is for a different inspection', async () => {
    const otherFollowUp: AgendaItem = {
      ...existingFollowUp,
      notes: 'متابعة [follow-up:insp-99]',
    } as unknown as AgendaItem;
    mockAgendaGetAll.mockResolvedValue([otherFollowUp]);
    await createFollowUpIfNeeded({ ...baseInspection, grade: 'D' });
    expect(mockAgendaSave).toHaveBeenCalledTimes(1);
  });
});
