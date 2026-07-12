// __tests__/services/capFactory.test.ts
import { createCapItemsFromInspection } from '../../src/services/capFactory';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { SavedInspection, InspectionItem, CorrectiveAction } from '../../src/types';

jest.mock('../../src/repositories/CorrectiveActionRepository');

const mockGetByInspection = CorrectiveActionRepository.getByInspection as jest.Mock;
const mockSave = CorrectiveActionRepository.save as jest.Mock;

function makeItem(id: string, status: string, severity = 'low', sanctionTier?: string): InspectionItem {
  return { id, complianceStatus: status, severity, sanctionTier, criteria: id } as InspectionItem;
}

function makeInspection(items: InspectionItem[]): SavedInspection {
  return {
    id: 'ins1', facilityId: 'f1', facilityName: 'F', facilityAddress: '',
    date: '2026-01-01', items,
  } as SavedInspection;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

describe('createCapItemsFromInspection', () => {
  it('skips compliant items', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createCapItemsFromInspection(makeInspection([makeItem('a', 'compliant')]));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('creates CAP for non-compliant item', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createCapItemsFromInspection(makeInspection([makeItem('a', 'non-compliant', 'medium')]));
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave.mock.calls[0][0].severity).toBe('medium');
    expect(mockSave.mock.calls[0][0].status).toBe('open');
  });

  it('skips item already tracked with open CAP', async () => {
    mockGetByInspection.mockResolvedValue([{ inspectionItemId: 'a', status: 'open' }]);
    await createCapItemsFromInspection(makeInspection([makeItem('a', 'non-compliant')]));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does NOT skip item whose existing CAP is resolved', async () => {
    mockGetByInspection.mockResolvedValue([{ inspectionItemId: 'a', status: 'resolved' }]);
    await createCapItemsFromInspection(makeInspection([makeItem('a', 'non-compliant')]));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('maps court-referral sanctionTier to critical severity', async () => {
    mockGetByInspection.mockResolvedValue([]);
    await createCapItemsFromInspection(makeInspection([
      makeItem('a', 'non-compliant', 'high', 'court-referral'),
    ]));
    expect(mockSave.mock.calls[0][0].severity).toBe('critical');
  });

  it('deadline for critical = 7 days from today', async () => {
    mockGetByInspection.mockResolvedValue([]);
    const before = new Date(); before.setDate(before.getDate() + 7);
    const expectedDate = before.toISOString().slice(0, 10);
    await createCapItemsFromInspection(makeInspection([
      makeItem('a', 'non-compliant', 'high', 'court-referral'),
    ]));
    expect(mockSave.mock.calls[0][0].deadline).toBe(expectedDate);
  });

  it('default (low) severity deadline = 45 days', async () => {
    mockGetByInspection.mockResolvedValue([]);
    const before = new Date(); before.setDate(before.getDate() + 45);
    const expectedDate = before.toISOString().slice(0, 10);
    await createCapItemsFromInspection(makeInspection([makeItem('a', 'non-compliant', 'low')]));
    expect(mockSave.mock.calls[0][0].deadline).toBe(expectedDate);
  });
});
