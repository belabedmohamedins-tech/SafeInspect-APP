// __tests__/services/capFactory.test.ts
const mockGetByInspection = jest.fn().mockResolvedValue([]);
const mockSave            = jest.fn().mockResolvedValue(undefined);

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: (...a: any[]) => mockGetByInspection(...a),
    save:            (...a: any[]) => mockSave(...a),
  },
}));

import { createCapItemsFromInspection } from '../../src/services/capFactory';

const makeInspection = (items: any[]) => ({
  id: 'i1', facilityId: 'f1', facilityName: 'FAC',
  inspectorName: 'Ahmed', date: '2026-01-01', status: 'completed' as const,
  items,
});

const nc = (overrides = {}) => ({
  id: 'item1', criteria: 'C1', severity: 'high', complianceStatus: 'non-compliant',
  sanctionTier: 'warning', comment: 'Fix this', ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('createCapItemsFromInspection', () => {
  it('creates CAP entry for each non-compliant item', async () => {
    await createCapItemsFromInspection(makeInspection([nc(), nc({ id: 'item2' })]) as any);
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it('skips compliant items', async () => {
    const compliant = { id: 'c1', criteria: 'C1', severity: 'low', complianceStatus: 'compliant', sanctionTier: 'warning' };
    await createCapItemsFromInspection(makeInspection([compliant]) as any);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('skips items already tracked as open/overdue', async () => {
    mockGetByInspection.mockResolvedValue([{ inspectionItemId: 'item1', status: 'open' }]);
    await createCapItemsFromInspection(makeInspection([nc()]) as any);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does NOT skip resolved items — allows re-tracking', async () => {
    mockGetByInspection.mockResolvedValue([{ inspectionItemId: 'item1', status: 'resolved' }]);
    await createCapItemsFromInspection(makeInspection([nc()]) as any);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('maps court-referral tier to critical severity', async () => {
    await createCapItemsFromInspection(makeInspection([nc({ sanctionTier: 'court-referral' })]) as any);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ severity: 'critical' }));
  });

  it('uses correct deadline days per severity', async () => {
    const cases = [
      { sev: 'critical', sanctionTier: 'court-referral', days: 7 },
      { sev: 'high', days: 14 },
      { sev: 'medium', days: 30 },
      { sev: 'low', days: 45 },
    ];
    for (const c of cases) {
      mockSave.mockClear();
      mockGetByInspection.mockResolvedValue([]);
      const item = nc({ id: `item_${c.sev}`, severity: c.sev, sanctionTier: c.sanctionTier ?? 'warning' });
      await createCapItemsFromInspection(makeInspection([item]) as any);
      const call = mockSave.mock.calls[0][0];
      const deadline = new Date(call.deadline);
      const today = new Date();
      const diff = Math.round((deadline.getTime() - today.setHours(0,0,0,0)) / 86400000);
      expect(diff).toBe(c.days);
    }
  });

  it('handles empty inspection gracefully', async () => {
    await createCapItemsFromInspection(makeInspection([]) as any);
    expect(mockSave).not.toHaveBeenCalled();
  });
});
