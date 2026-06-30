// src/__tests__/capFactory.test.ts
import { createCapItemsFromInspection } from '../services/capFactory';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { SavedInspection, InspectionItem } from '../types';

jest.mock('../repositories/CorrectiveActionRepository');

const mockGetByInspection = CorrectiveActionRepository.getByInspection as jest.Mock;
const mockSave           = CorrectiveActionRepository.save as jest.Mock;

function makeItem(
  id: string,
  complianceStatus: InspectionItem['complianceStatus'],
  severity: InspectionItem['severity'] = 'medium',
  sanctionTier?: string,
): InspectionItem {
  return {
    id,
    criteria: `Criterion ${id}`,
    complianceStatus,
    severity,
    sanctionTier,
    category: 'general',
  } as unknown as InspectionItem;
}

function makeInspection(items: InspectionItem[]): SavedInspection {
  return {
    id: 'insp-1',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    facilityAddress: '123 Main St',
    date: '2024-01-01',
    status: 'completed',
    items,
  } as unknown as SavedInspection;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetByInspection.mockResolvedValue([]);
  mockSave.mockResolvedValue(undefined);
});

describe('createCapItemsFromInspection', () => {
  it('does not call save when there are no non-compliant items', async () => {
    const inspection = makeInspection([makeItem('1', 'compliant')]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('creates one CAP entry per non-compliant item', async () => {
    const inspection = makeInspection([
      makeItem('1', 'non-compliant'),
      makeItem('2', 'non-compliant'),
      makeItem('3', 'compliant'),
    ]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it('skips items that already have an active (non-resolved) CAP', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'item-1', status: 'open' },
    ]);
    const inspection = makeInspection([
      makeItem('item-1', 'non-compliant'),
      makeItem('item-2', 'non-compliant'),
    ]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave).toHaveBeenCalledTimes(1);
    const savedArg = mockSave.mock.calls[0][0];
    expect(savedArg.inspectionItemId).toBe('item-2');
  });

  it('does NOT skip items whose existing CAP is resolved', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'item-1', status: 'resolved' },
    ]);
    const inspection = makeInspection([makeItem('item-1', 'non-compliant')]);
    await createCapItemsFromInspection(inspection);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  describe('deadline calculation by severity', () => {
    const today = new Date();
    function daysFromToday(isoDate: string) {
      return Math.round(
        (new Date(isoDate).getTime() - today.setHours(0,0,0,0)) / 86_400_000,
      );
    }

    it('sets 7-day deadline for critical severity', async () => {
      const inspection = makeInspection([makeItem('1', 'non-compliant', 'critical')]);
      await createCapItemsFromInspection(inspection);
      const { deadline } = mockSave.mock.calls[0][0];
      expect(daysFromToday(deadline)).toBe(7);
    });

    it('sets 14-day deadline for high severity', async () => {
      const inspection = makeInspection([makeItem('1', 'non-compliant', 'high')]);
      await createCapItemsFromInspection(inspection);
      const { deadline } = mockSave.mock.calls[0][0];
      expect(daysFromToday(deadline)).toBe(14);
    });

    it('sets 30-day deadline for medium severity', async () => {
      const inspection = makeInspection([makeItem('1', 'non-compliant', 'medium')]);
      await createCapItemsFromInspection(inspection);
      const { deadline } = mockSave.mock.calls[0][0];
      expect(daysFromToday(deadline)).toBe(30);
    });

    it('sets 45-day deadline for low severity', async () => {
      const inspection = makeInspection([makeItem('1', 'non-compliant', 'low')]);
      await createCapItemsFromInspection(inspection);
      const { deadline } = mockSave.mock.calls[0][0];
      expect(daysFromToday(deadline)).toBe(45);
    });
  });

  it('maps court-referral sanctionTier to critical CAP severity', async () => {
    const inspection = makeInspection([
      makeItem('1', 'non-compliant', 'low', 'court-referral'),
    ]);
    await createCapItemsFromInspection(inspection);
    const { severity } = mockSave.mock.calls[0][0];
    expect(severity).toBe('critical');
  });

  it('saves with status open and correct facilityId', async () => {
    const inspection = makeInspection([makeItem('1', 'non-compliant')]);
    await createCapItemsFromInspection(inspection);
    const saved = mockSave.mock.calls[0][0];
    expect(saved.status).toBe('open');
    expect(saved.facilityId).toBe('fac-1');
    expect(saved.facilityName).toBe('Test Facility');
  });
});
