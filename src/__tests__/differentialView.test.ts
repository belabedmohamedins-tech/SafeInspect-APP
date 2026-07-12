// src/__tests__/differentialView.test.ts
// L4 — domain-specific mocks only
// Covers:
//   buildDifferentialViewSync — all 5 DiffStatus values
//   buildDifferentialView     — async, using mocked InspectionRepository
//     • priorInspectionId path (specific record found + not found/not completed)
//     • fallback getAll path (facility match + exclusion)
//     • no prior -> all 'not-in-prior'

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    getAll: jest.fn(),
  },
}));

import {
  buildDifferentialView,
  buildDifferentialViewSync,
  DifferentialView,
} from '../../src/services/differentialView';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SavedInspection, InspectionItem } from '../../src/types';

const mockGetById = InspectionRepository.getById as jest.Mock;
const mockGetAll  = InspectionRepository.getAll as jest.Mock;

// ─── Factories ────────────────────────────────────────────────────────────────

function makeItem(id: string, status: 'compliant' | 'non-compliant' | 'not-applicable'): InspectionItem {
  return { id, complianceStatus: status } as InspectionItem;
}

function makeInspection(
  id: string,
  facilityId: string,
  items: InspectionItem[],
  status: 'completed' | 'in-progress' = 'completed',
  date = '2025-01-01',
  priorInspectionId?: string,
): SavedInspection {
  return { id, facilityId, items, status, date, priorInspectionId } as SavedInspection;
}

// ─── buildDifferentialViewSync ────────────────────────────────────────────────

describe('buildDifferentialViewSync', () => {
  const prior = makeInspection('prior1', 'F1', [
    makeItem('c1', 'non-compliant'),
    makeItem('c2', 'non-compliant'),
    makeItem('c3', 'compliant'),
    makeItem('c4', 'compliant'),
  ]);

  const current = makeInspection('cur1', 'F1', [
    makeItem('c1', 'compliant'),      // resolved
    makeItem('c2', 'non-compliant'),  // still-failing
    makeItem('c3', 'non-compliant'),  // new-violation
    makeItem('c4', 'compliant'),      // unchanged
    makeItem('c5', 'non-compliant'),  // not-in-prior (new criterion)
  ]);

  let view: DifferentialView;

  beforeAll(() => {
    view = buildDifferentialViewSync(current, prior);
  });

  it('resolved: c1 was non-compliant, now compliant', () => {
    expect(view.resolved).toHaveLength(1);
    expect(view.resolved[0].item.id).toBe('c1');
    expect(view.resolved[0].diffStatus).toBe('resolved');
    expect(view.resolved[0].priorStatus).toBe('non-compliant');
  });

  it('stillFailing: c2 still non-compliant', () => {
    expect(view.stillFailing).toHaveLength(1);
    expect(view.stillFailing[0].item.id).toBe('c2');
    expect(view.stillFailing[0].diffStatus).toBe('still-failing');
  });

  it('newViolations: c3 was compliant, now non-compliant', () => {
    expect(view.newViolations).toHaveLength(1);
    expect(view.newViolations[0].item.id).toBe('c3');
    expect(view.newViolations[0].diffStatus).toBe('new-violation');
  });

  it('unchanged: c4', () => {
    const c4 = view.all.find(e => e.item.id === 'c4');
    expect(c4?.diffStatus).toBe('unchanged');
  });

  it('not-in-prior: c5 (new criterion)', () => {
    const c5 = view.all.find(e => e.item.id === 'c5');
    expect(c5?.diffStatus).toBe('not-in-prior');
    expect(c5?.priorStatus).toBeUndefined();
  });

  it('hasUnresolvedPriorViolations is true', () => {
    expect(view.hasUnresolvedPriorViolations).toBe(true);
  });

  it('priorInspection set correctly', () => {
    expect(view.priorInspection).toBe(prior);
  });

  it('all contains 5 entries in order', () => {
    expect(view.all).toHaveLength(5);
    expect(view.all.map(e => e.item.id)).toEqual(['c1', 'c2', 'c3', 'c4', 'c5']);
  });

  it('null prior -> all entries not-in-prior', () => {
    const v = buildDifferentialViewSync(current, null);
    expect(v.all.every(e => e.diffStatus === 'not-in-prior')).toBe(true);
    expect(v.hasUnresolvedPriorViolations).toBe(false);
    expect(v.priorInspection).toBeNull();
  });
});

// ─── buildDifferentialView (async) ────────────────────────────────────────────

describe('buildDifferentialView — async', () => {
  beforeEach(() => {
    mockGetById.mockReset();
    mockGetAll.mockReset();
  });

  const currentItems = [
    makeItem('c1', 'compliant'),
    makeItem('c2', 'non-compliant'),
  ];

  const priorItems = [
    makeItem('c1', 'non-compliant'),
    makeItem('c2', 'non-compliant'),
  ];

  it('uses priorInspectionId when set and completed', async () => {
    const current = makeInspection('cur', 'F1', currentItems, 'completed', '2025-06-01', 'prior1');
    const prior   = makeInspection('prior1', 'F1', priorItems, 'completed', '2025-01-01');
    mockGetById.mockResolvedValue(prior);

    const view = await buildDifferentialView(current);

    expect(mockGetById).toHaveBeenCalledWith('prior1');
    expect(view.priorInspection).toBe(prior);
    expect(view.resolved).toHaveLength(1);
    expect(view.stillFailing).toHaveLength(1);
  });

  it('falls back to getAll when priorInspectionId not completed', async () => {
    const current  = makeInspection('cur', 'F1', currentItems, 'completed', '2025-06-01', 'prior1');
    const prior    = makeInspection('prior1', 'F1', priorItems, 'in-progress');
    const fallback = makeInspection('prior2', 'F1', priorItems, 'completed', '2025-02-01');
    mockGetById.mockResolvedValue(prior);
    mockGetAll.mockResolvedValue([fallback, current]);

    const view = await buildDifferentialView(current);
    expect(view.priorInspection?.id).toBe('prior2');
  });

  it('falls back to getAll when no priorInspectionId', async () => {
    const current = makeInspection('cur', 'F1', currentItems, 'completed', '2025-06-01');
    const prior   = makeInspection('old', 'F1', priorItems, 'completed', '2025-01-01');
    mockGetAll.mockResolvedValue([prior, current]);

    const view = await buildDifferentialView(current);
    expect(mockGetById).not.toHaveBeenCalled();
    expect(view.priorInspection?.id).toBe('old');
  });

  it('returns all not-in-prior when no prior found', async () => {
    const current = makeInspection('cur', 'F1', currentItems, 'completed', '2025-06-01');
    mockGetAll.mockResolvedValue([current]);

    const view = await buildDifferentialView(current);
    expect(view.priorInspection).toBeNull();
    expect(view.all.every(e => e.diffStatus === 'not-in-prior')).toBe(true);
    expect(view.hasUnresolvedPriorViolations).toBe(false);
  });

  it('excludes current inspection from getAll candidates', async () => {
    const current = makeInspection('cur', 'F1', currentItems, 'completed', '2025-06-01');
    mockGetAll.mockResolvedValue([current]);

    const view = await buildDifferentialView(current);
    expect(view.priorInspection).toBeNull();
  });

  it('picks most-recent by date from multiple candidates', async () => {
    const current = makeInspection('cur', 'F1', currentItems, 'completed', '2025-06-01');
    const older   = makeInspection('old1', 'F1', priorItems, 'completed', '2024-01-01');
    const newer   = makeInspection('old2', 'F1', priorItems, 'completed', '2025-03-01');
    mockGetAll.mockResolvedValue([older, newer, current]);

    const view = await buildDifferentialView(current);
    expect(view.priorInspection?.id).toBe('old2');
  });

  it('ignores inspections from a different facility', async () => {
    const current      = makeInspection('cur', 'F1', currentItems, 'completed', '2025-06-01');
    const otherFacility = makeInspection('other', 'F2', priorItems, 'completed', '2025-04-01');
    mockGetAll.mockResolvedValue([otherFacility, current]);

    const view = await buildDifferentialView(current);
    expect(view.priorInspection).toBeNull();
  });
});
