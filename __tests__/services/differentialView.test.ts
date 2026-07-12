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

  // Covers lines 117-120: prior exists but item ID is not in prior map → not-in-prior
  it('marks item not-in-prior when criterion missing from prior (prior is non-null)', () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('other', 'compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    const r = buildDifferentialViewSync(cur as any, prior as any);
    expect(r.all[0].diffStatus).toBe('not-in-prior');
    expect(r.all[0].priorStatus).toBeUndefined();
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

  // Covers line 95: priorInspectionId set, getById returns record with wrong status → falls back to getAll
  it('falls back to getAll when getById returns non-completed record', async () => {
    const priorInProgress = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'non-compliant')]);
    priorInProgress.status = 'in-progress';
    const priorCompleted  = INSP('p2', 'f1', '2025-12-01', [ITEM('i1', 'non-compliant')]);
    const cur = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'compliant')], { priorInspectionId: 'p' });
    mockGetById.mockResolvedValue(priorInProgress);
    mockGetAll.mockResolvedValue([priorCompleted]);
    const r = await buildDifferentialView(cur as any);
    expect(r.priorInspection?.id).toBe('p2');
    expect(r.resolved).toHaveLength(1);
  });

  // Covers line 95: priorInspectionId set but getById returns null → falls back to getAll
  it('falls back to getAll when getById returns null', async () => {
    const prior = INSP('p', 'f1', '2026-01-01', [ITEM('i1', 'non-compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')], { priorInspectionId: 'missing' });
    mockGetById.mockResolvedValue(null);
    mockGetAll.mockResolvedValue([prior]);
    const r = await buildDifferentialView(cur as any);
    expect(r.priorInspection?.id).toBe('p');
    expect(r.stillFailing).toHaveLength(1);
  });

  it('returns all not-in-prior when no prior exists', async () => {
    const cur = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    mockGetAll.mockResolvedValue([]);
    const r = await buildDifferentialView(cur as any);
    expect(r.all[0].diffStatus).toBe('not-in-prior');
  });

  it('excludes current inspection from candidates', async () => {
    const cur = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    mockGetAll.mockResolvedValue([cur]);
    const r = await buildDifferentialView(cur as any);
    expect(r.priorInspection).toBeNull();
  });

  it('ignores candidates from other facilities', async () => {
    const other = INSP('o', 'f2', '2026-01-01', [ITEM('i1', 'non-compliant')]);
    const cur   = INSP('c', 'f1', '2026-07-01', [ITEM('i1', 'non-compliant')]);
    mockGetAll.mockResolvedValue([other]);
    const r = await buildDifferentialView(cur as any);
    expect(r.priorInspection).toBeNull();
  });

  it('picks the most recent candidate by date', async () => {
    const old    = INSP('old',    'f1', '2025-01-01', [ITEM('i1', 'non-compliant')]);
    const recent = INSP('recent', 'f1', '2026-06-01', [ITEM('i1', 'compliant')]);
    const cur    = INSP('c',      'f1', '2026-07-01', [ITEM('i1', 'compliant')]);
    mockGetAll.mockResolvedValue([old, recent]);
    const r = await buildDifferentialView(cur as any);
    expect(r.priorInspection?.id).toBe('recent');
  });
});
