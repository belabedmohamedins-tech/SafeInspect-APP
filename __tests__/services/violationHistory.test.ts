// __tests__/services/violationHistory.test.ts
import {
  getPriorCompletedInspection,
  getPriorItemStatus,
  annotateRepeatViolations,
  ViolationHistoryAccessors,
} from '../../src/services/violationHistory';
import { SavedInspection, InspectionItem } from '../../src/types';

function makeInsp(id: string, facilityId: string, status: 'completed' | 'draft', date: string, items: Partial<InspectionItem>[] = []): SavedInspection {
  return { id, facilityId, status, date, items: items as InspectionItem[], title: '' } as SavedInspection;
}

function makeAccessors(all: SavedInspection[]): ViolationHistoryAccessors {
  return {
    getAll: jest.fn().mockResolvedValue(all),
    getById: jest.fn().mockImplementation((id: string) =>
      Promise.resolve(all.find(i => i.id === id) ?? null)
    ),
  };
}

describe('getPriorCompletedInspection', () => {
  it('returns null when no inspections', async () => {
    const acc = makeAccessors([]);
    expect(await getPriorCompletedInspection(acc, 'f1')).toBeNull();
  });

  it('returns most recent completed for facility, excluding current', async () => {
    const older = makeInsp('old', 'f1', 'completed', '2024-01-01');
    const newer = makeInsp('new', 'f1', 'completed', '2024-06-01');
    const acc = makeAccessors([older, newer]);
    const result = await getPriorCompletedInspection(acc, 'f1', 'new');
    expect(result?.id).toBe('old');
  });

  it('ignores drafts', async () => {
    const draft = makeInsp('d1', 'f1', 'draft', '2024-01-01');
    const acc = makeAccessors([draft]);
    expect(await getPriorCompletedInspection(acc, 'f1')).toBeNull();
  });

  it('ignores different facility', async () => {
    const other = makeInsp('o1', 'f2', 'completed', '2024-01-01');
    const acc = makeAccessors([other]);
    expect(await getPriorCompletedInspection(acc, 'f1')).toBeNull();
  });

  it('uses priorInspectionId when provided and valid', async () => {
    const specific = makeInsp('sp', 'f1', 'completed', '2024-03-01');
    const newer = makeInsp('nw', 'f1', 'completed', '2024-06-01');
    const acc = makeAccessors([specific, newer]);
    const result = await getPriorCompletedInspection(acc, 'f1', 'nw', 'sp');
    expect(result?.id).toBe('sp');
  });

  it('falls back to most-recent if priorInspectionId is draft', async () => {
    const draftPrior = makeInsp('dp', 'f1', 'draft', '2024-03-01');
    const completed = makeInsp('cp', 'f1', 'completed', '2024-01-01');
    const acc = makeAccessors([draftPrior, completed]);
    const result = await getPriorCompletedInspection(acc, 'f1', undefined, 'dp');
    expect(result?.id).toBe('cp');
  });
});

describe('getPriorItemStatus', () => {
  it('returns undefined when no prior', async () => {
    const acc = makeAccessors([]);
    expect(await getPriorItemStatus(acc, 'f1', 'c1')).toBeUndefined();
  });

  it('returns status from prior inspection', async () => {
    const prior = makeInsp('p1', 'f1', 'completed', '2024-01-01', [
      { id: 'c1', complianceStatus: 'non-compliant' },
    ]);
    const acc = makeAccessors([prior]);
    expect(await getPriorItemStatus(acc, 'f1', 'c1')).toBe('non-compliant');
  });

  it('returns undefined for unknown criterion', async () => {
    const prior = makeInsp('p1', 'f1', 'completed', '2024-01-01', [
      { id: 'c1', complianceStatus: 'compliant' },
    ]);
    const acc = makeAccessors([prior]);
    expect(await getPriorItemStatus(acc, 'f1', 'unknown')).toBeUndefined();
  });
});

describe('annotateRepeatViolations', () => {
  it('all isRepeatViolation=false when no prior', async () => {
    const acc = makeAccessors([]);
    const items = [
      { id: 'c1', complianceStatus: 'non-compliant' } as InspectionItem,
    ];
    const result = await annotateRepeatViolations(acc, items, 'f1', 'cur1');
    expect(result[0].isRepeatViolation).toBe(false);
    expect(result[0].priorInspectionStatus).toBeUndefined();
  });

  it('marks repeat when prior was also non-compliant', async () => {
    const prior = makeInsp('p1', 'f1', 'completed', '2024-01-01', [
      { id: 'c1', complianceStatus: 'non-compliant' },
    ]);
    const acc = makeAccessors([prior]);
    const items = [{ id: 'c1', complianceStatus: 'non-compliant' } as InspectionItem];
    const result = await annotateRepeatViolations(acc, items, 'f1', 'cur1');
    expect(result[0].isRepeatViolation).toBe(true);
    expect(result[0].priorInspectionStatus).toBe('non-compliant');
  });

  it('not repeat when prior was compliant', async () => {
    const prior = makeInsp('p1', 'f1', 'completed', '2024-01-01', [
      { id: 'c1', complianceStatus: 'compliant' },
    ]);
    const acc = makeAccessors([prior]);
    const items = [{ id: 'c1', complianceStatus: 'non-compliant' } as InspectionItem];
    const result = await annotateRepeatViolations(acc, items, 'f1', 'cur1');
    expect(result[0].isRepeatViolation).toBe(false);
  });

  it('item not in prior → isRepeatViolation false, priorStatus undefined', async () => {
    const prior = makeInsp('p1', 'f1', 'completed', '2024-01-01', []);
    const acc = makeAccessors([prior]);
    const items = [{ id: 'c99', complianceStatus: 'non-compliant' } as InspectionItem];
    const result = await annotateRepeatViolations(acc, items, 'f1', 'cur1');
    expect(result[0].isRepeatViolation).toBe(false);
    expect(result[0].priorInspectionStatus).toBeUndefined();
  });
});
