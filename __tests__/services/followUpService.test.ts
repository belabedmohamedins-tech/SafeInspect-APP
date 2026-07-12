// __tests__/services/followUpService.test.ts
import { createFollowUpIfNeeded } from '../../src/services/followUpService';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { SavedInspection } from '../../src/types';

jest.mock('../../src/repositories/AgendaRepository');
jest.mock('../../src/repositories/CorrectiveActionRepository');

const mockGetAll = AgendaRepository.getAll as jest.Mock;
const mockAgendaSave = AgendaRepository.save as jest.Mock;
const mockGetByInspection = CorrectiveActionRepository.getByInspection as jest.Mock;

function ins(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'i1', facilityId: 'f1', facilityName: 'F', facilityAddress: 'A',
    date: '2026-01-01', grade: 'B', status: 'completed', items: [],
    ...overrides,
  } as SavedInspection;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue([]);
  mockAgendaSave.mockResolvedValue(undefined);
  mockGetByInspection.mockResolvedValue([]);
});

describe('createFollowUpIfNeeded', () => {
  it('skips non-completed inspections', async () => {
    await createFollowUpIfNeeded(ins({ status: 'draft' as any }));
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });

  it('skips when grade is not D and no open CAPs', async () => {
    await createFollowUpIfNeeded(ins({ grade: 'B' }));
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });

  it('creates follow-up when grade is D', async () => {
    await createFollowUpIfNeeded(ins({ grade: 'D' }));
    expect(mockAgendaSave).toHaveBeenCalledTimes(1);
    const saved = mockAgendaSave.mock.calls[0][0];
    expect(saved.notes).toContain('[follow-up:i1]');
    expect(saved.notes).toContain('درجة D');
    expect(saved.date).toBe('2026-01-31'); // +30 days
  });

  it('creates follow-up when open CAPs exist', async () => {
    mockGetByInspection.mockResolvedValue([{ id: 'cap1' }]);
    await createFollowUpIfNeeded(ins({ grade: 'B' }));
    expect(mockAgendaSave).toHaveBeenCalledTimes(1);
    const saved = mockAgendaSave.mock.calls[0][0];
    expect(saved.notes).toContain('إجراءات تصحيحية مفتوحة');
  });

  it('does not create duplicate follow-up', async () => {
    mockGetAll.mockResolvedValue([{
      facilityId: 'f1',
      notes: 'some text [follow-up:i1]',
    }]);
    await createFollowUpIfNeeded(ins({ grade: 'D' }));
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });
});
