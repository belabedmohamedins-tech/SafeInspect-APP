// src/__tests__/violationHistory.test.ts
//
// violationHistory.ts accepts injected ViolationHistoryAccessors — no
// repository import or jest.mock() needed. The source file is executed
// directly so all branches are instrumented.

import {
  getPriorCompletedInspection,
  getPriorItemStatus,
  annotateRepeatViolations,
  ViolationHistoryAccessors,
} from '../services/violationHistory';
import { InspectionItem, SavedInspection } from '../types';

function makeInspection(
  id: string,
  facilityId: string,
  status: SavedInspection['status'],
  date: string,
  items: Partial<InspectionItem>[] = [],
): SavedInspection {
  return {
    id, facilityId, status, date,
    facilityName: 'Test', facilityAddress: '',
    items: items as InspectionItem[],
  } as unknown as SavedInspection;
}

function makeAccessors(list: SavedInspection[]): ViolationHistoryAccessors {
  return {
    getAll:  jest.fn().mockResolvedValue(list),
    getById: jest.fn().mockImplementation((id: string) =>
      Promise.resolve(list.find(i => i.id === id) ?? null),
    ),
  };
}

// ─── getPriorCompletedInspection ─────────────────────────────────────────────

describe('getPriorCompletedInspection', () => {
  it('returns null when no inspections exist', async () => {
    expect(await getPriorCompletedInspection(makeAccessors([]), 'fac-1')).toBeNull();
  });

  it('returns null when facility has only draft inspections', async () => {
    const insp = makeInspection('i1', 'fac-1', 'draft', '2024-01-01');
    expect(await getPriorCompletedInspection(makeAccessors([insp]), 'fac-1')).toBeNull();
  });

  it('ignores inspections for a different facility', async () => {
    const insp = makeInspection('i1', 'fac-2', 'completed', '2024-01-01');
    expect(await getPriorCompletedInspection(makeAccessors([insp]), 'fac-1')).toBeNull();
  });

  it('returns the most recent completed inspection', async () => {
    const older = makeInspection('i1', 'fac-1', 'completed', '2024-01-01');
    const newer = makeInspection('i2', 'fac-1', 'completed', '2024-06-01');
    const result = await getPriorCompletedInspection(makeAccessors([older, newer]), 'fac-1');
    expect(result?.id).toBe('i2');
  });

  it('excludes the inspection with excludeId', async () => {
    const insp = makeInspection('i1', 'fac-1', 'completed', '2024-01-01');
    expect(
      await getPriorCompletedInspection(makeAccessors([insp]), 'fac-1', 'i1'),
    ).toBeNull();
  });

  it('uses priorInspectionId when the specific inspection exists', async () => {
    const specific = makeInspection('p1', 'fac-1', 'completed', '2023-01-01');
    const latest   = makeInspection('p2', 'fac-1', 'completed', '2024-06-01');
    const result = await getPriorCompletedInspection(
      makeAccessors([specific, latest]), 'fac-1', undefined, 'p1',
    );
    expect(result?.id).toBe('p1');
  });

  it('falls back to most-recent when priorInspectionId is not found', async () => {
    const insp = makeInspection('i1', 'fac-1', 'completed', '2024-01-01');
    const accessors = makeAccessors([insp]);
    (accessors.getById as jest.Mock).mockResolvedValue(null);
    const result = await getPriorCompletedInspection(
      accessors, 'fac-1', undefined, 'ghost',
    );
    expect(result?.id).toBe('i1');
  });
});

// ─── getPriorItemStatus ────────────────────────────────────────────────────

describe('getPriorItemStatus', () => {
  it('returns undefined when no prior inspection exists', async () => {
    expect(
      await getPriorItemStatus(makeAccessors([]), 'fac-1', 'item-1'),
    ).toBeUndefined();
  });

  it('returns undefined when criterion is absent from prior inspection', async () => {
    const prior = makeInspection('p1', 'fac-1', 'completed', '2024-01-01', [
      { id: 'item-2', complianceStatus: 'compliant' },
    ]);
    expect(
      await getPriorItemStatus(makeAccessors([prior]), 'fac-1', 'item-1'),
    ).toBeUndefined();
  });

  it('returns the correct ComplianceStatus from prior', async () => {
    const prior = makeInspection('p1', 'fac-1', 'completed', '2024-01-01', [
      { id: 'item-1', complianceStatus: 'non-compliant' },
    ]);
    expect(
      await getPriorItemStatus(makeAccessors([prior]), 'fac-1', 'item-1'),
    ).toBe('non-compliant');
  });
});

// ─── annotateRepeatViolations ──────────────────────────────────────────────

describe('annotateRepeatViolations', () => {
  it('marks all items non-repeat when no prior inspection exists', async () => {
    const items = [{ id: 'i1', complianceStatus: 'non-compliant' }] as InspectionItem[];
    const result = await annotateRepeatViolations(
      makeAccessors([]), items, 'fac-1', 'curr-1',
    );
    expect(result[0].isRepeatViolation).toBe(false);
    expect(result[0].priorInspectionStatus).toBeUndefined();
  });

  it('stamps isRepeatViolation true when prior item was also non-compliant', async () => {
    const prior = makeInspection('p1', 'fac-1', 'completed', '2024-01-01', [
      { id: 'i1', complianceStatus: 'non-compliant' },
    ]);
    const items = [{ id: 'i1', complianceStatus: 'non-compliant' }] as InspectionItem[];
    const result = await annotateRepeatViolations(
      makeAccessors([prior]), items, 'fac-1', 'curr-1',
    );
    expect(result[0].isRepeatViolation).toBe(true);
    expect(result[0].priorInspectionStatus).toBe('non-compliant');
  });

  it('stamps isRepeatViolation false when prior item was compliant', async () => {
    const prior = makeInspection('p1', 'fac-1', 'completed', '2024-01-01', [
      { id: 'i1', complianceStatus: 'compliant' },
    ]);
    const items = [{ id: 'i1', complianceStatus: 'non-compliant' }] as InspectionItem[];
    const result = await annotateRepeatViolations(
      makeAccessors([prior]), items, 'fac-1', 'curr-1',
    );
    expect(result[0].isRepeatViolation).toBe(false);
    expect(result[0].priorInspectionStatus).toBe('compliant');
  });

  it('stamps false for a compliant item even when prior was non-compliant', async () => {
    const prior = makeInspection('p1', 'fac-1', 'completed', '2024-01-01', [
      { id: 'i1', complianceStatus: 'non-compliant' },
    ]);
    const items = [{ id: 'i1', complianceStatus: 'compliant' }] as InspectionItem[];
    const result = await annotateRepeatViolations(
      makeAccessors([prior]), items, 'fac-1', 'curr-1',
    );
    expect(result[0].isRepeatViolation).toBe(false);
  });

  it('handles a mixed item list correctly', async () => {
    const prior = makeInspection('p1', 'fac-1', 'completed', '2024-01-01', [
      { id: 'i1', complianceStatus: 'non-compliant' },
      { id: 'i2', complianceStatus: 'compliant' },
    ]);
    const items = [
      { id: 'i1', complianceStatus: 'non-compliant' },
      { id: 'i2', complianceStatus: 'non-compliant' },
      { id: 'i3', complianceStatus: 'non-compliant' }, // new criterion
    ] as InspectionItem[];
    const result = await annotateRepeatViolations(
      makeAccessors([prior]), items, 'fac-1', 'curr-1',
    );
    expect(result.find(r => r.id === 'i1')?.isRepeatViolation).toBe(true);
    expect(result.find(r => r.id === 'i2')?.isRepeatViolation).toBe(false);
    expect(result.find(r => r.id === 'i3')?.isRepeatViolation).toBe(false);
  });

  it('excludes the current inspection from the prior search', async () => {
    // The only completed inspection in storage IS the current one.
    // It must NOT be used as its own prior.
    const curr = makeInspection('curr-1', 'fac-1', 'completed', '2024-06-01', [
      { id: 'i1', complianceStatus: 'non-compliant' },
    ]);
    const items = [{ id: 'i1', complianceStatus: 'non-compliant' }] as InspectionItem[];
    const result = await annotateRepeatViolations(
      makeAccessors([curr]), items, 'fac-1', 'curr-1',
    );
    expect(result[0].isRepeatViolation).toBe(false);
  });
});
