// __tests__/services/followUpService.test.ts
import { createFollowUpIfNeeded } from '../../src/services/followUpService';
import { SavedInspection } from '../../src/types';

jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: {
    getAll: jest.fn(),
    save:   jest.fn(),
  },
}));

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: jest.fn(),
  },
}));

import { AgendaRepository }             from '../../src/repositories/AgendaRepository';
import { CorrectiveActionRepository }   from '../../src/repositories/CorrectiveActionRepository';

const mockGetAll            = AgendaRepository.getAll            as jest.Mock;
const mockSave              = AgendaRepository.save              as jest.Mock;
const mockGetByInspection   = CorrectiveActionRepository.getByInspection as jest.Mock;

function makeInsp(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'insp-1',
    facilityId: 'FAC-1',
    facilityName: 'Test Facility',
    facilityAddress: '123 Street',
    date: '2026-01-01',
    inspectorName: 'Inspector',
    status: 'completed',
    grade: 'B',
    items: [],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue([]);
  mockSave.mockResolvedValue(undefined);
  mockGetByInspection.mockResolvedValue([]);
});

describe('createFollowUpIfNeeded', () => {
  it('does nothing when inspection is not completed', async () => {
    await createFollowUpIfNeeded(makeInsp({ status: 'draft' }));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does nothing when grade is not D and no open CAPs', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createFollowUpIfNeeded(makeInsp({ grade: 'B' }));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('creates follow-up when grade is D', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createFollowUpIfNeeded(makeInsp({ grade: 'D' }));
    expect(mockSave).toHaveBeenCalledTimes(1);
    const saved = mockSave.mock.calls[0][0];
    expect(saved.notes).toContain('[follow-up:insp-1]');
    expect(saved.notes).toContain('درجة D');
  });

  it('creates follow-up when open CAPs exist', async () => {
    mockGetByInspection.mockResolvedValue([{ id: 'cap-1', status: 'open' }]);
    await createFollowUpIfNeeded(makeInsp({ grade: 'A' }));
    expect(mockSave).toHaveBeenCalledTimes(1);
    const saved = mockSave.mock.calls[0][0];
    expect(saved.notes).toContain('إجراءات تصحيحية مفتوحة');
  });

  it('is idempotent: does not create duplicate follow-up', async () => {
    mockGetByInspection.mockResolvedValue([{ id: 'cap-1', status: 'open' }]);
    mockGetAll.mockResolvedValue([{
      facilityId: 'FAC-1',
      notes: 'متابعة [follow-up:insp-1]',
    }]);
    await createFollowUpIfNeeded(makeInsp({ grade: 'D' }));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('sets follow-up date to 30 days after inspection date', async () => {
    mockGetByInspection.mockResolvedValue([{ id: 'cap-1' }]);
    await createFollowUpIfNeeded(makeInsp({ grade: 'D', date: '2026-03-01' }));
    const saved = mockSave.mock.calls[0][0];
    expect(saved.date).toBe('2026-03-31');
  });
});
