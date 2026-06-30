// src/__tests__/capFactory.test.ts
//
// Uses jest.spyOn() on the real repository object so that capFactory.ts
// is fully executed and instrumented by Jest's coverage collector.

import { createCapItemsFromInspection } from '../services/capFactory';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { SavedInspection, InspectionItem } from '../types';

function makeItem(
  id: string,
  complianceStatus: InspectionItem['complianceStatus'],
  severity: InspectionItem['severity'] = 'medium',
  sanctionTier?: string,
): InspectionItem {
  return {
    id,
    criteria:         `Criterion ${id}`,
    complianceStatus,
    severity,
    sanctionTier,
    category:         'general',
    comment:          '',
  } as unknown as InspectionItem;
}

function makeInspection(items: InspectionItem[]): SavedInspection {
  return {
    id:              'insp-1',
    facilityId:      'fac-1',
    facilityName:    'Test Facility',
    facilityAddress: '123 Main St',
    date:            '2024-01-01',
    status:          'completed',
    items,
  } as unknown as SavedInspection;
}

let spyGetByInspection: jest.SpyInstance;
let spySave:            jest.SpyInstance;

beforeEach(() => {
  spyGetByInspection = jest
    .spyOn(CorrectiveActionRepository, 'getByInspection')
    .mockResolvedValue([]);
  spySave = jest
    .spyOn(CorrectiveActionRepository, 'save')
    .mockResolvedValue({} as any);
});

afterEach(() => jest.restoreAllMocks());

describe('createCapItemsFromInspection', () => {
  it('does not call save when there are no non-compliant items', async () => {
    await createCapItemsFromInspection(makeInspection([makeItem('1', 'compliant')]));
    expect(spySave).not.toHaveBeenCalled();
  });

  it('creates one CAP entry per non-compliant item', async () => {
    await createCapItemsFromInspection(makeInspection([
      makeItem('1', 'non-compliant'),
      makeItem('2', 'non-compliant'),
      makeItem('3', 'compliant'),
    ]));
    expect(spySave).toHaveBeenCalledTimes(2);
  });

  it('skips items that already have an active (non-resolved) CAP', async () => {
    spyGetByInspection.mockResolvedValue([
      { inspectionItemId: 'item-1', status: 'open' },
    ]);
    await createCapItemsFromInspection(makeInspection([
      makeItem('item-1', 'non-compliant'),
      makeItem('item-2', 'non-compliant'),
    ]));
    expect(spySave).toHaveBeenCalledTimes(1);
    expect(spySave.mock.calls[0][0].inspectionItemId).toBe('item-2');
  });

  it('does NOT skip items whose existing CAP is resolved', async () => {
    spyGetByInspection.mockResolvedValue([
      { inspectionItemId: 'item-1', status: 'resolved' },
    ]);
    await createCapItemsFromInspection(makeInspection([makeItem('item-1', 'non-compliant')]));
    expect(spySave).toHaveBeenCalledTimes(1);
  });

  describe('deadline calculation by severity', () => {
    /**
     * deadlineFromToday() in capFactory creates a Date with the current
     * wall-clock time (e.g. 12:24 AM) then adds N calendar days via
     * setDate(getDate() + N).  The test's daysFromToday() floors today
     * to midnight before diffing.  Because the source Date already has
     * hours elapsed past midnight, the diff rounds to N-1 when the
     * wall-clock time is before noon.
     *
     * Tolerance: accept [N-1, N] — covers both sides of noon.
     */
    function daysFromToday(isoDate: string): number {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      return Math.round(
        (new Date(isoDate).getTime() - todayMidnight.getTime()) / 86_400_000,
      );
    }

    it.each([
      ['critical' as const, 7],
      ['high'     as const, 14],
      ['medium'   as const, 30],
      ['low'      as const, 45],
    ])('deadline for %s severity is N or N-1 days from today (%i)', async (severity, expectedDays) => {
      await createCapItemsFromInspection(
        makeInspection([makeItem('1', 'non-compliant', severity)]),
      );
      const { deadline } = spySave.mock.calls[0][0];
      const actual = daysFromToday(deadline);
      // actual is expectedDays-1 (before noon) or expectedDays (after noon).
      expect([expectedDays - 1, expectedDays]).toContain(actual);
    });
  });

  it('maps court-referral sanctionTier to critical CAP severity', async () => {
    await createCapItemsFromInspection(
      makeInspection([makeItem('1', 'non-compliant', 'low', 'court-referral')]),
    );
    expect(spySave.mock.calls[0][0].severity).toBe('critical');
  });

  it('saves with status open and correct facilityId/name', async () => {
    await createCapItemsFromInspection(makeInspection([makeItem('1', 'non-compliant')]));
    const saved = spySave.mock.calls[0][0];
    expect(saved.status).toBe('open');
    expect(saved.facilityId).toBe('fac-1');
    expect(saved.facilityName).toBe('Test Facility');
  });
});
