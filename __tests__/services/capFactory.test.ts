// __tests__/services/capFactory.test.ts
import { createCapItemsFromInspection } from '../../src/services/capFactory';
import { SavedInspection, InspectionItem } from '../../src/types';

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: jest.fn(),
    save: jest.fn(),
  },
}));

import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
const mockGetByInspection = CorrectiveActionRepository.getByInspection as jest.Mock;
const mockSave            = CorrectiveActionRepository.save            as jest.Mock;

function makeItem(
  id: string,
  complianceStatus: InspectionItem['complianceStatus'],
  severity: InspectionItem['severity'] = 'medium',
  sanctionTier?: string,
): InspectionItem {
  return { id, criteria: `C-${id}`, complianceStatus, severity, weight: 1, sanctionTier } as InspectionItem;
}

function makeInsp(items: InspectionItem[]): SavedInspection {
  return {
    id: 'insp-1',
    facilityId: 'FAC-1',
    facilityName: 'Facility',
    facilityAddress: 'Addr',
    date: '2026-01-01',
    inspectorName: 'Inspector',
    status: 'completed',
    items,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetByInspection.mockResolvedValue([]);
  mockSave.mockResolvedValue({ id: 'cap-new' });
});

describe('createCapItemsFromInspection', () => {
  it('creates CAP items for non-compliant items', async () => {
    const items = [makeItem('i1', 'non-compliant'), makeItem('i2', 'compliant')];
    await createCapItemsFromInspection(makeInsp(items));
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave.mock.calls[0][0].inspectionItemId).toBe('i1');
  });

  it('skips items that already have an active CAP', async () => {
    mockGetByInspection.mockResolvedValue([{ inspectionItemId: 'i1', status: 'open' }]);
    const items = [makeItem('i1', 'non-compliant')];
    await createCapItemsFromInspection(makeInsp(items));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does NOT skip items whose only CAP is resolved', async () => {
    mockGetByInspection.mockResolvedValue([{ inspectionItemId: 'i1', status: 'resolved' }]);
    const items = [makeItem('i1', 'non-compliant')];
    await createCapItemsFromInspection(makeInsp(items));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('maps court-referral sanctionTier to critical severity', async () => {
    const items = [makeItem('i1', 'non-compliant', 'low', 'court-referral')];
    await createCapItemsFromInspection(makeInsp(items));
    expect(mockSave.mock.calls[0][0].severity).toBe('critical');
  });

  it('uses item severity when sanctionTier is not court-referral', async () => {
    const items = [makeItem('i1', 'non-compliant', 'high', 'warning')];
    await createCapItemsFromInspection(makeInsp(items));
    expect(mockSave.mock.calls[0][0].severity).toBe('high');
  });

  it('sets deadline based on severity: critical=7d, high=14d, medium=30d, low=45d', async () => {
    const items = [
      makeItem('c', 'non-compliant', 'low', 'court-referral'), // critical
      makeItem('h', 'non-compliant', 'high'),
      makeItem('m', 'non-compliant', 'medium'),
      makeItem('l', 'non-compliant', 'low'),
    ];
    await createCapItemsFromInspection(makeInsp(items));
    const calls = mockSave.mock.calls.map((c: any[]) => c[0]);
    const deadlines = calls.map((c: any) => {
      const today = new Date();
      const d = new Date(c.deadline);
      return Math.round((d.getTime() - today.setHours(0,0,0,0)) / 86400000);
    });
    expect(deadlines[0]).toBe(7);
    expect(deadlines[1]).toBe(14);
    expect(deadlines[2]).toBe(30);
    expect(deadlines[3]).toBe(45);
  });

  it('does nothing when all items are compliant', async () => {
    const items = [makeItem('i1', 'compliant'), makeItem('i2', 'not-applicable')];
    await createCapItemsFromInspection(makeInsp(items));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does nothing when items list is empty', async () => {
    await createCapItemsFromInspection(makeInsp([]));
    expect(mockSave).not.toHaveBeenCalled();
  });
});
