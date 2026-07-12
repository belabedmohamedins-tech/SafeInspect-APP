// __tests__/services/violationHistory.test.ts
import {
  getPriorCompletedInspection,
  getPriorItemStatus,
  annotateRepeatViolations,
  ViolationHistoryAccessors,
} from '../../src/services/violationHistory';

const ITEM = (id: string, status: 'compliant' | 'non-compliant') => ({
  id,
  complianceStatus: status,
  criteria: id,
  severity: 'medium' as const,
});

const INSP = (id: string, facilityId: string, date: string, status = 'completed', items: any[] = []) => ({
  id, facilityId, date, status, items,
});

const makeAccessors = (inspections: any[]): ViolationHistoryAccessors => ({
  getAll:   async () => inspections,
  getById:  async (id: string) => inspections.find(i => i.id === id) ?? null,
});

describe('getPriorCompletedInspection', () => {
  it('returns null when no completed inspections exist', async () => {
    const a = makeAccessors([]);
    expect(await getPriorCompletedInspection(a, 'f1')).toBeNull();
  });

  it('returns the most recent completed inspection for the facility', async () => {
    const old  = INSP('a', 'f1', '2026-01-01');
    const recent = INSP('b', 'f1', '2026-06-01');
    const a = makeAccessors([old, recent]);
    const r = await getPriorCompletedInspection(a, 'f1');
    expect(r?.id).toBe('b');
  });

  it('excludes the current inspection (excludeId)', async () => {
    const old  = INSP('a', 'f1', '2026-01-01');
    const cur  = INSP('b', 'f1', '2026-06-01');
    const a = makeAccessors([old, cur]);
    const r = await getPriorCompletedInspection(a, 'f1', 'b');
    expect(r?.id).toBe('a');
  });

  it('ignores inspections from other facilities', async () => {
    const other = INSP('a', 'f2', '2026-06-01');
    const a = makeAccessors([other]);
    expect(await getPriorCompletedInspection(a, 'f1')).toBeNull();
  });

  it('ignores non-completed inspections', async () => {
    const inProgress = INSP('a', 'f1', '2026-06-01', 'in-progress');
    const a = makeAccessors([inProgress]);
    expect(await getPriorCompletedInspection(a, 'f1')).toBeNull();
  });

  it('returns specific inspection by priorInspectionId when valid', async () => {
    const specific = INSP('x', 'f1', '2025-01-01');
    const recent   = INSP('y', 'f1', '2026-06-01');
    const a = makeAccessors([specific, recent]);
    const r = await getPriorCompletedInspection(a, 'f1', undefined, 'x');
    expect(r?.id).toBe('x');
  });

  it('falls back to most-recent when priorInspectionId is invalid', async () => {
    const recent = INSP('y', 'f1', '2026-06-01');
    const a = makeAccessors([recent]);
    const r = await getPriorCompletedInspection(a, 'f1', undefined, 'nonexistent');
    expect(r?.id).toBe('y');
  });

  it('rejects specific prior if it belongs to another facility', async () => {
    const wrongFacility = INSP('x', 'f2', '2025-01-01');
    const correct       = INSP('y', 'f1', '2026-06-01');
    const a = makeAccessors([wrongFacility, correct]);
    const r = await getPriorCompletedInspection(a, 'f1', undefined, 'x');
    expect(r?.id).toBe('y');
  });
});

describe('getPriorItemStatus', () => {
  it('returns undefined when no prior inspection exists', async () => {
    const a = makeAccessors([]);
    expect(await getPriorItemStatus(a, 'f1', 'i1')).toBeUndefined();
  });

  it('returns the compliance status of the criterion in the prior inspection', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', 'completed', [
      ITEM('i1', 'non-compliant'),
    ]);
    const a = makeAccessors([prior]);
    expect(await getPriorItemStatus(a, 'f1', 'i1')).toBe('non-compliant');
  });

  it('returns undefined when criterion not found in prior', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', 'completed', [ITEM('i2', 'compliant')]);
    const a = makeAccessors([prior]);
    expect(await getPriorItemStatus(a, 'f1', 'i1')).toBeUndefined();
  });
});

describe('annotateRepeatViolations', () => {
  it('marks all items isRepeatViolation=false when no prior inspection', async () => {
    const a = makeAccessors([]);
    const items = [ITEM('i1', 'non-compliant'), ITEM('i2', 'compliant')];
    const result = await annotateRepeatViolations(a, items, 'f1', 'cur');
    expect(result.every(r => r.isRepeatViolation === false)).toBe(true);
    expect(result.every(r => r.priorInspectionStatus === undefined)).toBe(true);
  });

  it('marks isRepeatViolation=true when item was non-compliant in prior too', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', 'completed', [ITEM('i1', 'non-compliant')]);
    const a = makeAccessors([prior]);
    const items = [ITEM('i1', 'non-compliant')];
    const result = await annotateRepeatViolations(a, items, 'f1', 'cur');
    expect(result[0].isRepeatViolation).toBe(true);
    expect(result[0].priorInspectionStatus).toBe('non-compliant');
  });

  it('marks isRepeatViolation=false for a new violation (not in prior)', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', 'completed', [ITEM('i1', 'compliant')]);
    const a = makeAccessors([prior]);
    const items = [ITEM('i1', 'non-compliant')];
    const result = await annotateRepeatViolations(a, items, 'f1', 'cur');
    expect(result[0].isRepeatViolation).toBe(false);
  });

  it('correctly handles mix of repeat / new / resolved items', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', 'completed', [
      ITEM('repeat', 'non-compliant'),
      ITEM('fixed',  'non-compliant'),
      ITEM('ok',     'compliant'),
    ]);
    const a = makeAccessors([prior]);
    const items = [
      ITEM('repeat', 'non-compliant'),
      ITEM('fixed',  'compliant'),
      ITEM('ok',     'compliant'),
      ITEM('brand-new', 'non-compliant'),
    ];
    const result = await annotateRepeatViolations(a, items, 'f1', 'cur');
    const byId = Object.fromEntries(result.map(r => [r.id, r]));
    expect(byId['repeat'].isRepeatViolation).toBe(true);
    expect(byId['fixed'].isRepeatViolation).toBe(false);
    expect(byId['ok'].isRepeatViolation).toBe(false);
    expect(byId['brand-new'].isRepeatViolation).toBe(false);
  });
});
