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
    const before = new Date();
    await createCapItemsFromInspection(insp as any);
    const calls = mockSave.mock.calls.map((c: any) => c[0]);

    const highDeadline = new Date(calls[0].deadline);
    const expected14 = new Date(before); expected14.setDate(expected14.getDate() + 14);
    expect(Math.abs(highDeadline.getTime() - expected14.getTime())).toBeLessThan(60_000);

    const medDeadline = new Date(calls[1].deadline);
    const expected30 = new Date(before); expected30.setDate(expected30.getDate() + 30);
    expect(Math.abs(medDeadline.getTime() - expected30.getTime())).toBeLessThan(60_000);

    const lowDeadline = new Date(calls[2].deadline);
    const expected45 = new Date(before); expected45.setDate(expected45.getDate() + 45);
    expect(Math.abs(lowDeadline.getTime() - expected45.getTime())).toBeLessThan(60_000);
  });
});
