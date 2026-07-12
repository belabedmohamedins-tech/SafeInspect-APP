// __tests__/services/differentialView.test.ts
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    getAll: jest.fn(),
  },
}));

import { buildDifferentialView, buildDifferentialViewSync } from '../../src/services/differentialView';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SavedInspection, InspectionItem } from '../../src/types';

const mockGetById = InspectionRepository.getById as jest.Mock;
const mockGetAll  = InspectionRepository.getAll  as jest.Mock;

function insp(id: string, facilityId: string, status: 'completed' | 'draft', items: Partial<InspectionItem>[] = [], priorId?: string): SavedInspection {
  return { id, facilityId, status, date: '2024-01-01', items: items as InspectionItem[], title: '', priorInspectionId: priorId } as SavedInspection;
}

beforeEach(() => { mockGetById.mockReset(); mockGetAll.mockReset(); });

describe('buildDifferentialView', () => {
  it('no prior → all not-in-prior', async () => {
    mockGetAll.mockResolvedValue([]);
    const cur = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }]);
    const view = await buildDifferentialView(cur);
    expect(view.all[0].diffStatus).toBe('not-in-prior');
    expect(view.priorInspection).toBeNull();
    expect(view.hasUnresolvedPriorViolations).toBe(false);
  });

  it('resolved: prior non-compliant, current compliant', async () => {
    const prior = insp('p1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    mockGetAll.mockResolvedValue([prior]);
    const cur = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }]);
    const view = await buildDifferentialView(cur);
    expect(view.resolved.length).toBe(1);
    expect(view.all[0].diffStatus).toBe('resolved');
    expect(view.hasUnresolvedPriorViolations).toBe(false);
  });

  it('still-failing: both non-compliant', async () => {
    const prior = insp('p1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    mockGetAll.mockResolvedValue([prior]);
    const cur = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    const view = await buildDifferentialView(cur);
    expect(view.stillFailing.length).toBe(1);
    expect(view.hasUnresolvedPriorViolations).toBe(true);
  });

  it('new-violation: prior compliant, current non-compliant', async () => {
    const prior = insp('p1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }]);
    mockGetAll.mockResolvedValue([prior]);
    const cur = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    const view = await buildDifferentialView(cur);
    expect(view.newViolations.length).toBe(1);
    expect(view.all[0].diffStatus).toBe('new-violation');
  });

  it('unchanged: both compliant', async () => {
    const prior = insp('p1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }]);
    mockGetAll.mockResolvedValue([prior]);
    const cur = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }]);
    const view = await buildDifferentialView(cur);
    expect(view.all[0].diffStatus).toBe('unchanged');
  });

  it('uses priorInspectionId when set and completed', async () => {
    const specific = insp('sp', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    mockGetById.mockResolvedValue(specific);
    mockGetAll.mockResolvedValue([]);
    const cur = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }], 'sp');
    const view = await buildDifferentialView(cur);
    expect(view.priorInspection?.id).toBe('sp');
    expect(view.resolved.length).toBe(1);
  });

  it('falls back to getAll when priorInspectionId is draft', async () => {
    const draftPrior = insp('dp', 'f1', 'draft', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    mockGetById.mockResolvedValue(draftPrior);
    mockGetAll.mockResolvedValue([]);
    const cur = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }], 'dp');
    const view = await buildDifferentialView(cur);
    expect(view.priorInspection).toBeNull();
  });
});

describe('buildDifferentialViewSync', () => {
  it('null prior → all not-in-prior', () => {
    const cur = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    const view = buildDifferentialViewSync(cur, null);
    expect(view.all[0].diffStatus).toBe('not-in-prior');
    expect(view.priorInspection).toBeNull();
  });

  it('resolved', () => {
    const prior = insp('p1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    const cur   = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }]);
    const view  = buildDifferentialViewSync(cur, prior);
    expect(view.resolved.length).toBe(1);
    expect(view.hasUnresolvedPriorViolations).toBe(false);
  });

  it('still-failing', () => {
    const prior = insp('p1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    const cur   = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    const view  = buildDifferentialViewSync(cur, prior);
    expect(view.stillFailing.length).toBe(1);
    expect(view.hasUnresolvedPriorViolations).toBe(true);
  });

  it('new-violation', () => {
    const prior = insp('p1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'compliant' }]);
    const cur   = insp('c1', 'f1', 'completed', [{ id: 'i1', complianceStatus: 'non-compliant' }]);
    const view  = buildDifferentialViewSync(cur, prior);
    expect(view.newViolations.length).toBe(1);
  });

  it('item not in prior → not-in-prior', () => {
    const prior = insp('p1', 'f1', 'completed', []);
    const cur   = insp('c1', 'f1', 'completed', [{ id: 'i99', complianceStatus: 'compliant' }]);
    const view  = buildDifferentialViewSync(cur, prior);
    expect(view.all[0].diffStatus).toBe('not-in-prior');
  });
});
