// src/__tests__/violationHistory.test.ts
// L4 — injected accessor pattern (no real repo imports)
// Covers:
//   getPriorCompletedInspection  — priorInspectionId path, fallback getAll, null
//   getPriorItemStatus            — found / not found item
//   annotateRepeatViolations      — with prior, without prior, mixed statuses

import {
  getPriorCompletedInspection,
  getPriorItemStatus,
  annotateRepeatViolations,
  ViolationHistoryAccessors,
} from '../../src/services/violationHistory';
import { SavedInspection, InspectionItem } from '../../src/types';

// ─── Factories ────────────────────────────────────────────────────────────────

function makeItem(
  id: string,
  status: 'compliant' | 'non-compliant' | 'not-applicable',
): InspectionItem {
  return { id, complianceStatus: status } as InspectionItem;
}

function makeInspection(
  id: string,
  facilityId: string,
  status: 'completed' | 'in-progress',
  items: InspectionItem[] = [],
  date = '2025-01-01',
): SavedInspection {
  return { id, facilityId, status, items, date } as SavedInspection;
}

function makeAccessors(
  all: SavedInspection[],
  byId: Record<string, SavedInspection | null> = {},
): ViolationHistoryAccessors {
  return {
    getAll: jest.fn().mockResolvedValue(all),
    getById: jest.fn().mockImplementation((id: string) =>
      Promise.resolve(byId[id] ?? null),
    ),
  };
}

// ─── getPriorCompletedInspection ──────────────────────────────────────────────

describe('getPriorCompletedInspection', () => {
  it('returns null when no completed inspections for facility', async () => {
    const accessors = makeAccessors([]);
    const result = await getPriorCompletedInspection(accessors, 'F1');
    expect(result).toBeNull();
  });

  it('returns most-recent completed for facility', async () => {
    const older = makeInspection('i1', 'F1', 'completed', [], '2024-01-01');
    const newer = makeInspection('i2', 'F1', 'completed', [], '2025-06-01');
    const other = makeInspection('i3', 'F2', 'completed', [], '2025-07-01');
    const accessors = makeAccessors([older, newer, other]);

    const result = await getPriorCompletedInspection(accessors, 'F1');
    expect(result?.id).toBe('i2');
  });

  it('excludes inspections whose id === excludeId', async () => {
    const keep = makeInspection('i1', 'F1', 'completed', [], '2025-01-01');
    const excl = makeInspection('i2', 'F1', 'completed', [], '2025-06-01');
    const accessors = makeAccessors([keep, excl]);

    const result = await getPriorCompletedInspection(accessors, 'F1', 'i2');
    expect(result?.id).toBe('i1');
  });

  it('uses priorInspectionId when provided and valid', async () => {
    const specific  = makeInspection('sp1', 'F1', 'completed', [], '2025-03-01');
    const accessors = makeAccessors(
      [makeInspection('i1', 'F1', 'completed', [], '2025-01-01')],
      { sp1: specific },
    );

    const result = await getPriorCompletedInspection(accessors, 'F1', undefined, 'sp1');
    expect(result?.id).toBe('sp1');
    expect(accessors.getAll).not.toHaveBeenCalled();
  });

  it('falls back to getAll when priorInspectionId resolves to null', async () => {
    const fallback  = makeInspection('i1', 'F1', 'completed', [], '2025-01-01');
    const accessors = makeAccessors([fallback], { sp1: null });

    const result = await getPriorCompletedInspection(accessors, 'F1', undefined, 'sp1');
    expect(result?.id).toBe('i1');
  });

  it('falls back to getAll when priorInspectionId found but not completed', async () => {
    const inProgress = makeInspection('sp1', 'F1', 'in-progress');
    const fallback   = makeInspection('i1', 'F1', 'completed', [], '2025-01-01');
    const accessors  = makeAccessors([fallback], { sp1: inProgress });

    const result = await getPriorCompletedInspection(accessors, 'F1', undefined, 'sp1');
    expect(result?.id).toBe('i1');
  });

  it('falls back when priorInspectionId found but wrong facility', async () => {
    const wrongFacility = makeInspection('sp1', 'F2', 'completed', [], '2025-03-01');
    const fallback      = makeInspection('i1', 'F1', 'completed', [], '2025-01-01');
    const accessors     = makeAccessors([fallback], { sp1: wrongFacility });

    const result = await getPriorCompletedInspection(accessors, 'F1', undefined, 'sp1');
    expect(result?.id).toBe('i1');
  });
});

// ─── getPriorItemStatus ───────────────────────────────────────────────────────

describe('getPriorItemStatus', () => {
  it('returns undefined when no prior inspection', async () => {
    const accessors = makeAccessors([]);
    const result = await getPriorItemStatus(accessors, 'F1', 'c1');
    expect(result).toBeUndefined();
  });

  it('returns the compliance status of the matching item', async () => {
    const prior = makeInspection('i1', 'F1', 'completed', [
      makeItem('c1', 'non-compliant'),
      makeItem('c2', 'compliant'),
    ]);
    const accessors = makeAccessors([prior]);

    expect(await getPriorItemStatus(accessors, 'F1', 'c1')).toBe('non-compliant');
    expect(await getPriorItemStatus(accessors, 'F1', 'c2')).toBe('compliant');
  });

  it('returns undefined when criterionId not in prior items', async () => {
    const prior     = makeInspection('i1', 'F1', 'completed', [makeItem('c1', 'compliant')]);
    const accessors = makeAccessors([prior]);

    const result = await getPriorItemStatus(accessors, 'F1', 'c99');
    expect(result).toBeUndefined();
  });
});

// ─── annotateRepeatViolations ─────────────────────────────────────────────────

describe('annotateRepeatViolations', () => {
  it('marks all items as non-repeat when no prior inspection', async () => {
    const items = [
      makeItem('c1', 'non-compliant'),
      makeItem('c2', 'compliant'),
    ];
    const accessors = makeAccessors([]);

    const annotated = await annotateRepeatViolations(accessors, items, 'F1', 'cur1');
    expect(annotated.every(i => i.isRepeatViolation === false)).toBe(true);
    expect(annotated.every(i => i.priorInspectionStatus === undefined)).toBe(true);
  });

  it('marks isRepeatViolation=true when item was non-compliant in prior', async () => {
    const prior = makeInspection('p1', 'F1', 'completed', [
      makeItem('c1', 'non-compliant'),
      makeItem('c2', 'compliant'),
    ]);
    const currentItems = [
      makeItem('c1', 'non-compliant'), // repeat
      makeItem('c2', 'non-compliant'), // new violation (was compliant)
      makeItem('c3', 'compliant'),     // absent in prior
    ];
    const accessors = makeAccessors([prior]);

    const annotated = await annotateRepeatViolations(accessors, currentItems, 'F1', 'cur1');

    const c1 = annotated.find(i => i.id === 'c1')!;
    const c2 = annotated.find(i => i.id === 'c2')!;
    const c3 = annotated.find(i => i.id === 'c3')!;

    expect(c1.isRepeatViolation).toBe(true);
    expect(c1.priorInspectionStatus).toBe('non-compliant');
    expect(c2.isRepeatViolation).toBe(false);
    expect(c2.priorInspectionStatus).toBe('compliant');
    expect(c3.isRepeatViolation).toBe(false);
    expect(c3.priorInspectionStatus).toBeUndefined();
  });

  it('preserves original item count and order', async () => {
    const items = [
      makeItem('a', 'compliant'),
      makeItem('b', 'non-compliant'),
      makeItem('c', 'not-applicable'),
    ];
    const accessors = makeAccessors([]);
    const annotated = await annotateRepeatViolations(accessors, items, 'F1', 'cur1');
    expect(annotated.map(i => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('uses priorInspectionId when passed', async () => {
    const specific  = makeInspection('sp', 'F1', 'completed', [makeItem('c1', 'non-compliant')]);
    const accessors = makeAccessors([], { sp: specific });
    const items     = [makeItem('c1', 'non-compliant')];

    const annotated = await annotateRepeatViolations(accessors, items, 'F1', 'cur', 'sp');
    expect(annotated[0].isRepeatViolation).toBe(true);
    expect(accessors.getById).toHaveBeenCalledWith('sp');
  });
});
