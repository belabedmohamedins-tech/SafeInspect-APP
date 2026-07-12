// __tests__/services/violationHistory.test.ts
import {
  getPriorCompletedInspection,
  getPriorItemStatus,
  annotateRepeatViolations,
} from '../../src/services/violationHistory';
import { SavedInspection, InspectionItem } from '../../src/types';

function makeInsp(overrides: Partial<SavedInspection> & { id: string }): SavedInspection {
  return {
    facilityId: 'FAC-1',
    facilityName: 'Test',
    facilityAddress: 'Addr',
    date: '2026-01-01T10:00:00.000Z',
    inspectorName: 'Inspector',
    status: 'completed',
    items: [],
    ...overrides,
  };
}

function makeItem(id: string, complianceStatus: InspectionItem['complianceStatus'] = 'non-compliant'): InspectionItem {
  return {
    id,
    criteria: `Criterion ${id}`,
    complianceStatus,
    severity: 'medium',
    weight: 1,
  } as InspectionItem;
}

const accessors = (inspections: SavedInspection[]) => ({
  getAll: async () => inspections,
  getById: async (id: string) => inspections.find(i => i.id === id) ?? null,
});

// ─── getPriorCompletedInspection ─────────────────────────────────────────────

describe('getPriorCompletedInspection', () => {
  it('returns null when no inspections exist', async () => {
    const result = await getPriorCompletedInspection(accessors([]), 'FAC-1');
    expect(result).toBeNull();
  });

  it('returns the most recent completed inspection for the facility', async () => {
    const inspections = [
      makeInsp({ id: 'old', date: '2025-01-01T00:00:00.000Z', facilityId: 'FAC-1' }),
      makeInsp({ id: 'new', date: '2026-01-01T00:00:00.000Z', facilityId: 'FAC-1' }),
    ];
    const result = await getPriorCompletedInspection(accessors(inspections), 'FAC-1');
    expect(result?.id).toBe('new');
  });

  it('excludes the current inspection id', async () => {
    const inspections = [
      makeInsp({ id: 'prior', date: '2025-06-01T00:00:00.000Z', facilityId: 'FAC-1' }),
      makeInsp({ id: 'current', date: '2026-01-01T00:00:00.000Z', facilityId: 'FAC-1' }),
    ];
    const result = await getPriorCompletedInspection(accessors(inspections), 'FAC-1', 'current');
    expect(result?.id).toBe('prior');
  });

  it('ignores inspections from other facilities', async () => {
    const inspections = [
      makeInsp({ id: 'other', facilityId: 'FAC-2' }),
    ];
    const result = await getPriorCompletedInspection(accessors(inspections), 'FAC-1');
    expect(result).toBeNull();
  });

  it('ignores non-completed inspections', async () => {
    const inspections = [
      makeInsp({ id: 'draft', facilityId: 'FAC-1', status: 'draft' }),
    ];
    const result = await getPriorCompletedInspection(accessors(inspections), 'FAC-1');
    expect(result).toBeNull();
  });

  it('uses priorInspectionId when provided and valid', async () => {
    const inspections = [
      makeInsp({ id: 'specific', facilityId: 'FAC-1', date: '2025-01-01T00:00:00.000Z' }),
      makeInsp({ id: 'latest',   facilityId: 'FAC-1', date: '2026-01-01T00:00:00.000Z' }),
    ];
    const result = await getPriorCompletedInspection(accessors(inspections), 'FAC-1', 'current', 'specific');
    expect(result?.id).toBe('specific');
  });

  it('falls back to latest when priorInspectionId is not found', async () => {
    const inspections = [
      makeInsp({ id: 'latest', facilityId: 'FAC-1' }),
    ];
    const result = await getPriorCompletedInspection(accessors(inspections), 'FAC-1', undefined, 'missing-id');
    expect(result?.id).toBe('latest');
  });

  it('falls back to latest when priorInspectionId points to a non-completed inspection', async () => {
    const inspections = [
      makeInsp({ id: 'draft-prior', facilityId: 'FAC-1', status: 'draft' }),
      makeInsp({ id: 'completed',   facilityId: 'FAC-1', date: '2025-01-01T00:00:00.000Z' }),
    ];
    const result = await getPriorCompletedInspection(accessors(inspections), 'FAC-1', undefined, 'draft-prior');
    expect(result?.id).toBe('completed');
  });
});

// ─── getPriorItemStatus ───────────────────────────────────────────────────────

describe('getPriorItemStatus', () => {
  it('returns undefined when no prior inspection exists', async () => {
    const result = await getPriorItemStatus(accessors([]), 'FAC-1', 'item-1');
    expect(result).toBeUndefined();
  });

  it('returns the prior compliance status for a criterion', async () => {
    const insp = makeInsp({ id: 'prior', facilityId: 'FAC-1', items: [makeItem('item-1', 'compliant')] });
    const result = await getPriorItemStatus(accessors([insp]), 'FAC-1', 'item-1');
    expect(result).toBe('compliant');
  });

  it('returns undefined when criterion is not found in prior inspection', async () => {
    const insp = makeInsp({ id: 'prior', facilityId: 'FAC-1', items: [makeItem('other-item')] });
    const result = await getPriorItemStatus(accessors([insp]), 'FAC-1', 'item-1');
    expect(result).toBeUndefined();
  });
});

// ─── annotateRepeatViolations ─────────────────────────────────────────────────

describe('annotateRepeatViolations', () => {
  it('marks items as non-repeat when no prior inspection exists', async () => {
    const items = [makeItem('i1', 'non-compliant'), makeItem('i2', 'compliant')];
    const result = await annotateRepeatViolations(accessors([]), items, 'FAC-1', 'current');
    expect(result.every(i => i.isRepeatViolation === false)).toBe(true);
    expect(result.every(i => i.priorInspectionStatus === undefined)).toBe(true);
  });

  it('marks item as repeat when both current and prior are non-compliant', async () => {
    const prior = makeInsp({ id: 'prior', facilityId: 'FAC-1', items: [makeItem('i1', 'non-compliant')] });
    const items = [makeItem('i1', 'non-compliant')];
    const result = await annotateRepeatViolations(accessors([prior]), items, 'FAC-1', 'current');
    expect(result[0].isRepeatViolation).toBe(true);
    expect(result[0].priorInspectionStatus).toBe('non-compliant');
  });

  it('does not mark as repeat when prior was compliant', async () => {
    const prior = makeInsp({ id: 'prior', facilityId: 'FAC-1', items: [makeItem('i1', 'compliant')] });
    const items = [makeItem('i1', 'non-compliant')];
    const result = await annotateRepeatViolations(accessors([prior]), items, 'FAC-1', 'current');
    expect(result[0].isRepeatViolation).toBe(false);
    expect(result[0].priorInspectionStatus).toBe('compliant');
  });

  it('does not mark as repeat when current is compliant even if prior was non-compliant', async () => {
    const prior = makeInsp({ id: 'prior', facilityId: 'FAC-1', items: [makeItem('i1', 'non-compliant')] });
    const items = [makeItem('i1', 'compliant')];
    const result = await annotateRepeatViolations(accessors([prior]), items, 'FAC-1', 'current');
    expect(result[0].isRepeatViolation).toBe(false);
  });

  it('sets priorInspectionStatus to undefined when criterion not found in prior', async () => {
    const prior = makeInsp({ id: 'prior', facilityId: 'FAC-1', items: [makeItem('other')] });
    const items = [makeItem('i1', 'non-compliant')];
    const result = await annotateRepeatViolations(accessors([prior]), items, 'FAC-1', 'current');
    expect(result[0].priorInspectionStatus).toBeUndefined();
    expect(result[0].isRepeatViolation).toBe(false);
  });

  it('handles empty items list', async () => {
    const prior = makeInsp({ id: 'prior', facilityId: 'FAC-1' });
    const result = await annotateRepeatViolations(accessors([prior]), [], 'FAC-1', 'current');
    expect(result).toEqual([]);
  });
});
