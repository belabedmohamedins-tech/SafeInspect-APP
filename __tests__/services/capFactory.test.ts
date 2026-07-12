// __tests__/services/capFactory.test.ts
jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: jest.fn(),
    save: jest.fn(),
  },
}));

import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { createCapItemsFromInspection } from '../../src/services/capFactory';
import { SavedInspection, InspectionItem, CorrectiveAction } from '../../src/types';

const mockGetByInspection = CorrectiveActionRepository.getByInspection as jest.Mock;
const mockSave = CorrectiveActionRepository.save as jest.Mock;

function makeItem(id: string, status: 'compliant' | 'non-compliant', severity = 'medium', sanctionTier?: string): InspectionItem {
  return { id, complianceStatus: status, severity, sanctionTier, criteria: `criteria-${id}`, comment: 'note' } as unknown as InspectionItem;
}

function makeInspection(items: InspectionItem[]): SavedInspection {
  return {
    id: 'insp-1',
    facilityId: 'f1',
    facilityName: 'Facility A',
    items,
  } as unknown as SavedInspection;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetByInspection.mockResolvedValue([]);
  mockSave.mockResolvedValue(undefined);
});

describe('createCapItemsFromInspection', () => {
  it('does nothing when all items are compliant', async () => {
    const inspection = makeInspection([makeItem('i1', 'compliant')]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('creates CAP for each non-compliant item', async () => {
    const inspection = makeInspection([
      makeItem('i1', 'non-compliant', 'high'),
      makeItem('i2', 'non-compliant', 'low'),
    ]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it('skips items that already have an open CAP', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'i1', status: 'open' } as CorrectiveAction,
    ]);
    const inspection = makeInspection([
      makeItem('i1', 'non-compliant'),
      makeItem('i2', 'non-compliant'),
    ]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect((mockSave.mock.calls[0][0] as CorrectiveAction).inspectionItemId).toBe('i2');
  });

  it('skips resolved CAPs (creates new one)', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'i1', status: 'resolved' } as CorrectiveAction,
    ]);
    const inspection = makeInspection([makeItem('i1', 'non-compliant')]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('maps court-referral sanctionTier to critical severity', async () => {
    const inspection = makeInspection([makeItem('i1', 'non-compliant', 'high', 'court-referral')]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave.mock.calls[0][0].severity).toBe('critical');
  });

  it('uses item severity for non-court-referral items', async () => {
    const inspection = makeInspection([makeItem('i1', 'non-compliant', 'low')]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave.mock.calls[0][0].severity).toBe('low');
  });

  it('sets deadline further out for lower severity', async () => {
    const insp1 = makeInspection([makeItem('i1', 'non-compliant', 'medium')]);
    await createCapItemsFromInspection(insp1);
    const deadline1 = mockSave.mock.calls[0][0].deadline;

    mockSave.mockClear();
    const insp2 = makeInspection([makeItem('i2', 'non-compliant', 'high')]);
    await createCapItemsFromInspection(insp2);
    const deadline2 = mockSave.mock.calls[0][0].deadline;

    expect(deadline1 > deadline2).toBe(true); // medium = 30d, high = 14d
  });

  it('sets correct CAP fields', async () => {
    const inspection = makeInspection([makeItem('i1', 'non-compliant', 'high')]);
    await createCapItemsFromInspection(inspection);
    const cap = mockSave.mock.calls[0][0];
    expect(cap.inspectionId).toBe('insp-1');
    expect(cap.facilityId).toBe('f1');
    expect(cap.status).toBe('open');
    expect(cap.assignedTo).toBe('');
  });
});
