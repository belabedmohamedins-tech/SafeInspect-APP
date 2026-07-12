// __tests__/services/followUpService.test.ts
const mockGetByInspection = jest.fn();
const mockGetAll          = jest.fn();
const mockAgendaSave      = jest.fn();

jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: {
    getAll: (...a: any[]) => mockGetAll(...a),
    save:   (...a: any[]) => mockAgendaSave(...a),
  },
}));

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: (...a: any[]) => mockGetByInspection(...a),
  },
}));

import { createFollowUpIfNeeded } from '../../src/services/followUpService';

const BASE_INSP = {
  id: 'insp-1',
  facilityId: 'f1',
  facilityName: 'Factory A',
  facilityAddress: 'Addr',
  date: '2026-06-01',
  status: 'completed' as const,
  grade: 'B',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockAgendaSave.mockResolvedValue(undefined);
  mockGetAll.mockResolvedValue([]);
});

describe('createFollowUpIfNeeded', () => {
  it('does nothing when status is not completed', async () => {
    await createFollowUpIfNeeded({ ...BASE_INSP, status: 'in-progress' } as any);
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });

  it('does nothing when grade is not D and no open CAPs', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createFollowUpIfNeeded(BASE_INSP as any);
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });

  it('creates a follow-up when grade is D', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createFollowUpIfNeeded({ ...BASE_INSP, grade: 'D' } as any);
    expect(mockAgendaSave).toHaveBeenCalledTimes(1);
    const saved = mockAgendaSave.mock.calls[0][0];
    expect(saved.date).toBe('2026-07-01'); // 30 days after 2026-06-01
    expect(saved.notes).toContain('[follow-up:insp-1]');
  });

  it('creates a follow-up when there are open CAP items', async () => {
    mockGetByInspection.mockResolvedValue([{ id: 'cap-1' }]);
    await createFollowUpIfNeeded(BASE_INSP as any);
    expect(mockAgendaSave).toHaveBeenCalledTimes(1);
    const saved = mockAgendaSave.mock.calls[0][0];
    expect(saved.notes).toContain('\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u062a\u0635\u062d\u064a\u062d\u064a\u0629 \u0645\u0641\u062a\u0648\u062d\u0629');
  });

  it('is idempotent — does not create a second follow-up', async () => {
    mockGetByInspection.mockResolvedValue([]);
    mockGetAll.mockResolvedValue([{
      facilityId: 'f1',
      notes: 'some note [follow-up:insp-1]',
    }]);
    await createFollowUpIfNeeded({ ...BASE_INSP, grade: 'D' } as any);
    expect(mockAgendaSave).not.toHaveBeenCalled();
  });

  it('sets status=pending on the created agenda item', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createFollowUpIfNeeded({ ...BASE_INSP, grade: 'D' } as any);
    expect(mockAgendaSave).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
  });
});
