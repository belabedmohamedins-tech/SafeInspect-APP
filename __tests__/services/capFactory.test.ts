// __tests__/services/capFactory.test.ts
import { createCapItemsFromInspection } from '../../src/services/capFactory';
import { SavedInspection, InspectionItem, CorrectiveAction } from '../../src/types';

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getByInspection: jest.fn(),
    save: jest.fn(),
  },
}));

import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
const mockGetByInspection = CorrectiveActionRepository.getByInspection as jest.Mock;
const mockSave            = CorrectiveActionRepository.save as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeItem = (
  id: string,
  status: InspectionItem['complianceStatus'],
  severity = 'medium',
  sanctionTier?: string
): InspectionItem =>
  ({ id, complianceStatus: status, severity, sanctionTier, criteria: 'hygiène', comment: '' } as unknown as InspectionItem);

const makeInspection = (items: InspectionItem[]): SavedInspection =>
  ({
    id: 'insp-1',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    items,
  } as unknown as SavedInspection);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetByInspection.mockResolvedValue([]);
  mockSave.mockResolvedValue(undefined);
});

// ── no non-compliant items ─────────────────────────────────────────────────────
describe('createCapItemsFromInspection – no non-compliant items', () => {
  it('does not call save when all items are compliant', async () => {
    await createCapItemsFromInspection(makeInspection([makeItem('i1', 'compliant')]));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does not call save for empty items array', async () => {
    await createCapItemsFromInspection(makeInspection([]));
    expect(mockSave).not.toHaveBeenCalled();
  });
});

// ── creates CAP items ────────────────────────────────────────────────────────────
describe('createCapItemsFromInspection – creates CAP items', () => {
  it('calls save once per non-compliant item', async () => {
    await createCapItemsFromInspection(makeInspection([
      makeItem('i1', 'non-compliant'),
      makeItem('i2', 'non-compliant'),
      makeItem('i3', 'compliant'),
    ]));
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it('saved CAP has correct facilityId, inspectionId, status=open', async () => {
    await createCapItemsFromInspection(makeInspection([makeItem('i1', 'non-compliant', 'high')]));
    const saved = mockSave.mock.calls[0][0];
    expect(saved.facilityId).toBe('fac-1');
    expect(saved.inspectionId).toBe('insp-1');
    expect(saved.status).toBe('open');
    expect(saved.inspectionItemId).toBe('i1');
  });

  it('severity critical for court-referral sanctionTier', async () => {
    await createCapItemsFromInspection(makeInspection([
      makeItem('i1', 'non-compliant', 'low', 'court-referral'),
    ]));
    expect(mockSave.mock.calls[0][0].severity).toBe('critical');
  });

  it('severity passes through from item when not court-referral', async () => {
    await createCapItemsFromInspection(makeInspection([
      makeItem('i1', 'non-compliant', 'high'),
    ]));
    expect(mockSave.mock.calls[0][0].severity).toBe('high');
  });

  it('deadline is a future YYYY-MM-DD date string', async () => {
    await createCapItemsFromInspection(makeInspection([makeItem('i1', 'non-compliant', 'medium')]));
    const { deadline } = mockSave.mock.calls[0][0];
    expect(deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(deadline).getTime()).toBeGreaterThan(Date.now());
  });

  // deadline days: critical=7, high=14, medium=30, default=45
  it.each([
    ['critical', 7],
    ['high',     14],
    ['medium',   30],
    ['low',      45],
  ])('deadline days for severity=%s is %d', async (severity, days) => {
    await createCapItemsFromInspection(makeInspection([makeItem('i1', 'non-compliant', severity)]));
    const { deadline } = mockSave.mock.calls[0][0];
    const expected = new Date();
    expected.setDate(expected.getDate() + days);
    const expectedStr = expected.toISOString().slice(0, 10);
    expect(deadline).toBe(expectedStr);
  });
});

// ── deduplication ───────────────────────────────────────────────────────────────────
describe('createCapItemsFromInspection – deduplication', () => {
  it('skips item when an active (non-resolved) CAP already exists', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'i1', status: 'open' } as unknown as CorrectiveAction,
    ]);
    await createCapItemsFromInspection(makeInspection([makeItem('i1', 'non-compliant')]));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does NOT skip item when existing CAP is resolved', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'i1', status: 'resolved' } as unknown as CorrectiveAction,
    ]);
    await createCapItemsFromInspection(makeInspection([makeItem('i1', 'non-compliant')]));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('skips in-progress CAP as well', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'i1', status: 'in-progress' } as unknown as CorrectiveAction,
    ]);
    await createCapItemsFromInspection(makeInspection([makeItem('i1', 'non-compliant')]));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('saves only non-tracked items when mix of tracked and untracked', async () => {
    mockGetByInspection.mockResolvedValue([
      { inspectionItemId: 'i1', status: 'open' } as unknown as CorrectiveAction,
    ]);
    await createCapItemsFromInspection(makeInspection([
      makeItem('i1', 'non-compliant'),
      makeItem('i2', 'non-compliant'),
    ]));
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave.mock.calls[0][0].inspectionItemId).toBe('i2');
  });
});
