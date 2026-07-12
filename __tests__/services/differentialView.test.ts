// __tests__/services/differentialView.test.ts
const mockGetById = jest.fn();
const mockGetAll  = jest.fn();

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: (...a: any[]) => mockGetById(...a),
    getAll:  (...a: any[]) => mockGetAll(...a),
  },
}));

import {
  buildDifferentialView,
  buildDifferentialViewSync,
} from '../../src/services/differentialView';

const ITEM = (id: string, status: 'compliant' | 'non-compliant') => ({
  id, complianceStatus: status, criteria: id, severity: 'medium',
});

const INSP = (id: string, facilityId: string, date: string, items: any[], extra: any = {}) => ({
  id, facilityId, date, status: 'completed', items, ...extra,
});

beforeEach(() => jest.clearAllMocks());

describe('buildDifferentialViewSync', () => {
  it('marks all items not-in-prior when prior is null', () => {
    const cur = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    const r = buildDifferentialViewSync(cur as any, null);
    expect(r.all[0].diffStatus).toBe('not-in-prior');
    expect(r.priorInspection).toBeNull();
    expect(r.hasUnresolvedPriorViolations).toBe(false);
  });

  it('classifies resolved items', () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'non-compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'compliant')]);
    const r = buildDifferentialViewSync(cur as any, prior as any);
    expect(r.resolved).toHaveLength(1);
    expect(r.resolved[0].diffStatus).toBe('resolved');
    expect(r.hasUnresolvedPriorViolations).toBe(false);
  });

  it('classifies still-failing items', () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'non-compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    const r = buildDifferentialViewSync(cur as any, prior as any);
    expect(r.stillFailing).toHaveLength(1);
    expect(r.hasUnresolvedPriorViolations).toBe(true);
  });

  it('classifies new-violation items', () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    const r = buildDifferentialViewSync(cur as any, prior as any);
    expect(r.newViolations).toHaveLength(1);
    expect(r.newViolations[0].diffStatus).toBe('new-violation');
  });

  it('classifies unchanged (compliant→compliant) items', () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'compliant')]);
    const r = buildDifferentialViewSync(cur as any, prior as any);
    expect(r.all[0].diffStatus).toBe('unchanged');
  });

  it('marks item not-in-prior when criterion missing from prior', () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('other', 'compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    const r = buildDifferentialViewSync(cur as any, prior as any);
    expect(r.all[0].diffStatus).toBe('not-in-prior');
  });

  it('populates priorInspection on the result', () => {
    const prior = INSP('p', 'f1', '2026-01-01', []);
    const cur   = INSP('c', 'f1', '2026-07-01', []);
    const r = buildDifferentialViewSync(cur as any, prior as any);
    expect(r.priorInspection?.id).toBe('p');
  });
});

describe('buildDifferentialView (async)', () => {
  it('uses priorInspectionId when set and valid', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'non-compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'compliant')], { priorInspectionId: 'p' });
    mockGetById.mockResolvedValue(prior);
    const r = await buildDifferentialView(cur as any);
    expect(r.priorInspection?.id).toBe('p');
    expect(r.resolved).toHaveLength(1);
  });

  it('falls back to getAll when priorInspectionId not set', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'non-compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    mockGetAll.mockResolvedValue([prior]);
    const r = await buildDifferentialView(cur as any);
    expect(r.stillFailing).toHaveLength(1);
  });

  it('falls back to getAll when specific prior has wrong status', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'non-compliant')]);
    const priorInProgress = { ...prior, status: 'in-progress' };
    const cur = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'compliant')], { priorInspectionId: 'p' });
    mockGetById.mockResolvedValue(priorInProgress);
    mockGetAll.mockResolvedValue([prior]);
    const r = await buildDifferentialView(cur as any);
    // prior returned by getAll IS completed — resolved
    expect(r.resolved).toHaveLength(1);
  });

  it('returns all not-in-prior when no prior exists', async () => {
    const cur = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    mockGetAll.mockResolvedValue([]);
    const r = await buildDifferentialView(cur as any);
    expect(r.all[0].diffStatus).toBe('not-in-prior');
  });

  it('excludes current inspection from candidates', async () => {
    const cur = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    mockGetAll.mockResolvedValue([cur]); // only the current one exists
    const r = await buildDifferentialView(cur as any);
    expect(r.priorInspection).toBeNull();
  });
});
