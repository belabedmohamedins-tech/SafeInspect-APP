// __tests__/services/followUpService.test.ts
jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: jest.fn(), save: jest.fn() },
}));
jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { getByInspection: jest.fn() },
}));

import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { createFollowUpIfNeeded } from '../../src/services/followUpService';
import { SavedInspection } from '../../src/types';

const mockGetAll = AgendaRepository.getAll as jest.Mock;
const mockSave = AgendaRepository.save as jest.Mock;
const mockGetByInspection = CorrectiveActionRepository.getByInspection as jest.Mock;

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'insp-1',
    facilityId: 'f1',
    facilityName: 'Facility A',
    facilityAddress: '123 Street',
    date: '2026-01-01',
    grade: 'B',
    status: 'completed',
    ...overrides,
  } as unknown as SavedInspection;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue([]);
  mockSave.mockResolvedValue(undefined);
  mockGetByInspection.mockResolvedValue([]);
});

describe('createFollowUpIfNeeded', () => {
  it('does nothing for non-completed inspections', async () => {
    await createFollowUpIfNeeded(makeInspection({ status: 'draft' }));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does nothing when grade is not D and no open CAPs', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createFollowUpIfNeeded(makeInspection({ grade: 'A' }));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('creates follow-up when grade is D', async () => {
    await createFollowUpIfNeeded(makeInspection({ grade: 'D' }));
    expect(mockSave).toHaveBeenCalledTimes(1);
    const saved = mockSave.mock.calls[0][0];
    expect(saved.facilityId).toBe('f1');
    expect(saved.notes).toContain('[follow-up:insp-1]');
    expect(saved.status).toBe('pending');
  });

  it('creates follow-up when open CAPs exist', async () => {
    mockGetByInspection.mockResolvedValue([{ id: 'cap-1' }]);
    await createFollowUpIfNeeded(makeInspection({ grade: 'B' }));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('sets follow-up date 30 days after inspection date', async () => {
    await createFollowUpIfNeeded(makeInspection({ grade: 'D', date: '2026-01-01' }));
    const saved = mockSave.mock.calls[0][0];
    expect(saved.date).toBe('2026-01-31');
  });

  it('is idempotent — does not create duplicate follow-up', async () => {
    mockGetAll.mockResolvedValue([
      { facilityId: 'f1', notes: 'some note [follow-up:insp-1]' },
    ]);
    await createFollowUpIfNeeded(makeInspection({ grade: 'D' }));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('still creates follow-up when existing entry is for a different inspection', async () => {
    mockGetAll.mockResolvedValue([
      { facilityId: 'f1', notes: '[follow-up:insp-99]' },
    ]);
    await createFollowUpIfNeeded(makeInspection({ grade: 'D' }));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});
