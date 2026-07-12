// __tests__/services/capFactory.test.ts
const mockGetByInspection = jest.fn();
const mockSave            = jest.fn();

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: (...a: any[]) => mockGetByInspection(...a),
    save:            (...a: any[]) => mockSave(...a),
  },
}));

import { createCapItemsFromInspection } from '../../src/services/capFactory';

const BASE_INSP = {
  id: 'insp-1',
  facilityId: 'f1',
  facilityName: 'Factory A',
  facilityAddress: 'Addr',
  date: '2026-07-12',
  items: [] as any[],
};

/** Compute expected YYYY-MM-DD by adding `days` to today (local time, same logic as capFactory). */
function expectedDeadline(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

describe('createCapItemsFromInspection', () => {
  it('creates no CAPs when all items are compliant', async () => {
    mockGetByInspection.mockResolvedValue([]);
    const insp = { ...BASE_INSP, items: [
      { id: 'c1', complianceStatus: 'compliant', severity: 'medium', criteria: 'C1', comment: '' },
    ]};
    await createCapItemsFromInspection(insp as any);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('creates a CAP for each non-compliant item', async () => {
    mockGetByInspection.mockResolvedValue([]);
    const insp = { ...BASE_INSP, items: [
      { id: 'c1', complianceStatus: 'non-compliant', severity: 'high',   criteria: 'H', comment: '' },
      { id: 'c2', complianceStatus: 'non-compliant', severity: 'medium', criteria: 'M', comment: '' },
    ]};
    await createCapItemsFromInspection(insp as any);
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it('skips items that already have an active (non-resolved) CAP', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'c1', status: 'open' },
    ]);
    const insp = { ...BASE_INSP, items: [
      { id: 'c1', complianceStatus: 'non-compliant', severity: 'high', criteria: 'H', comment: '' },
      { id: 'c2', complianceStatus: 'non-compliant', severity: 'low',  criteria: 'L', comment: '' },
    ]};
    await createCapItemsFromInspection(insp as any);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ inspectionItemId: 'c2' }));
  });

  it('does NOT skip resolved CAPs — resolved items get a new CAP', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'c1', status: 'resolved' },
    ]);
    const insp = { ...BASE_INSP, items: [
      { id: 'c1', complianceStatus: 'non-compliant', severity: 'medium', criteria: 'M', comment: '' },
    ]};
    await createCapItemsFromInspection(insp as any);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('maps sanctionTier=court-referral to severity=critical', async () => {
    mockGetByInspection.mockResolvedValue([]);
    const insp = { ...BASE_INSP, items: [
      { id: 'c1', complianceStatus: 'non-compliant', severity: 'high', sanctionTier: 'court-referral', criteria: 'H', comment: '' },
    ]};
    await createCapItemsFromInspection(insp as any);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ severity: 'critical' }));
  });

  it('sets correct deadline days: critical=7, high=14, medium=30, low=45', async () => {
    mockGetByInspection.mockResolvedValue([]);
    const insp = { ...BASE_INSP, items: [
      { id: 'c1', complianceStatus: 'non-compliant', severity: 'high',   criteria: 'H', comment: '' },
      { id: 'c2', complianceStatus: 'non-compliant', severity: 'medium', criteria: 'M', comment: '' },
      { id: 'c3', complianceStatus: 'non-compliant', severity: 'low',    criteria: 'L', comment: '' },
    ]};
    await createCapItemsFromInspection(insp as any);
    const calls = mockSave.mock.calls.map((c: any) => c[0]);
    expect(calls[0].deadline).toBe(expectedDeadline(14));
    expect(calls[1].deadline).toBe(expectedDeadline(30));
    expect(calls[2].deadline).toBe(expectedDeadline(45));
  });

  it('sets critical deadline to 7 days', async () => {
    mockGetByInspection.mockResolvedValue([]);
    const insp = { ...BASE_INSP, items: [
      { id: 'c1', complianceStatus: 'non-compliant', severity: 'high', sanctionTier: 'court-referral', criteria: 'H', comment: '' },
    ]};
    await createCapItemsFromInspection(insp as any);
    expect(mockSave.mock.calls[0][0].deadline).toBe(expectedDeadline(7));
  });
});
