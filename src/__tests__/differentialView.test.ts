// src/__tests__/differentialView.test.ts
//
// buildDifferentialViewSync is pure (no I/O) — test directly.
// buildDifferentialView is async and calls InspectionRepository.getById —
// spy on the real object so differentialView.ts is fully instrumented.

import {
  buildDifferentialViewSync,
  buildDifferentialView,
} from '../services/differentialView';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { InspectionItem, SavedInspection } from '../types';

function makeItem(
  id: string,
  complianceStatus: InspectionItem['complianceStatus'],
): InspectionItem {
  return {
    id,
    criteria:         `Criterion ${id}`,
    complianceStatus,
    severity:         'medium',
    category:         'general',
  } as unknown as InspectionItem;
}

function makeInspection(
  id: string,
  items: InspectionItem[],
  priorInspectionId?: string,
): SavedInspection {
  return {
    id,
    facilityId:      'fac-1',
    facilityName:    'Test',
    facilityAddress: '',
    date:            '2024-01-01',
    status:          'completed',
    items,
    priorInspectionId,
  } as unknown as SavedInspection;
}

let spyGetById: jest.SpyInstance;

beforeEach(() => {
  spyGetById = jest
    .spyOn(InspectionRepository, 'getById')
    .mockResolvedValue(null);
});

afterEach(() => jest.restoreAllMocks());

// ─── buildDifferentialViewSync (pure) ─────────────────────────────────────────

describe('buildDifferentialViewSync', () => {
  it('marks all entries as not-in-prior when prior is null', () => {
    const current = makeInspection('c1', [
      makeItem('i1', 'non-compliant'),
      makeItem('i2', 'compliant'),
    ]);
    const view = buildDifferentialViewSync(current, null);
    expect(view.all.every(e => e.diffStatus === 'not-in-prior')).toBe(true);
    expect(view.priorInspection).toBeNull();
  });

  it('marks a fixed item as resolved', () => {
    const prior   = makeInspection('p1', [makeItem('i1', 'non-compliant')]);
    const current = makeInspection('c1', [makeItem('i1', 'compliant')]);
    const view = buildDifferentialViewSync(current, prior);
    expect(view.resolved).toHaveLength(1);
    expect(view.resolved[0].diffStatus).toBe('resolved');
    expect(view.hasUnresolvedPriorViolations).toBe(false);
  });

  it('marks a persisting violation as still-failing', () => {
    const prior   = makeInspection('p1', [makeItem('i1', 'non-compliant')]);
    const current = makeInspection('c1', [makeItem('i1', 'non-compliant')]);
    const view = buildDifferentialViewSync(current, prior);
    expect(view.stillFailing).toHaveLength(1);
    expect(view.hasUnresolvedPriorViolations).toBe(true);
  });

  it('marks a newly non-compliant item as new-violation', () => {
    const prior   = makeInspection('p1', [makeItem('i1', 'compliant')]);
    const current = makeInspection('c1', [makeItem('i1', 'non-compliant')]);
    const view = buildDifferentialViewSync(current, prior);
    expect(view.newViolations).toHaveLength(1);
    expect(view.newViolations[0].diffStatus).toBe('new-violation');
  });

  it('marks a compliant-then-compliant item as unchanged', () => {
    const prior   = makeInspection('p1', [makeItem('i1', 'compliant')]);
    const current = makeInspection('c1', [makeItem('i1', 'compliant')]);
    const view = buildDifferentialViewSync(current, prior);
    expect(view.all[0].diffStatus).toBe('unchanged');
  });

  it('marks a new criterion not in prior as not-in-prior', () => {
    const prior   = makeInspection('p1', [makeItem('i1', 'compliant')]);
    const current = makeInspection('c1', [
      makeItem('i1', 'compliant'),
      makeItem('i2', 'non-compliant'),
    ]);
    const view = buildDifferentialViewSync(current, prior);
    expect(view.all.find(e => e.item.id === 'i2')!.diffStatus).toBe('not-in-prior');
  });

  it('handles a mixed scenario correctly', () => {
    const prior = makeInspection('p1', [
      makeItem('r1', 'non-compliant'),
      makeItem('s1', 'non-compliant'),
      makeItem('u1', 'compliant'),
    ]);
    const current = makeInspection('c1', [
      makeItem('r1', 'compliant'),
      makeItem('s1', 'non-compliant'),
      makeItem('u1', 'compliant'),
      makeItem('n1', 'non-compliant'),
    ]);
    const view = buildDifferentialViewSync(current, prior);
    expect(view.resolved).toHaveLength(1);
    expect(view.stillFailing).toHaveLength(1);
    expect(view.newViolations).toHaveLength(1);
    expect(view.hasUnresolvedPriorViolations).toBe(true);
  });

  it('attaches the prior inspection to the returned view', () => {
    const prior   = makeInspection('p1', []);
    const current = makeInspection('c1', []);
    const view = buildDifferentialViewSync(current, prior);
    expect(view.priorInspection).toBe(prior);
  });
});

// ─── buildDifferentialView (async) ───────────────────────────────────────────

describe('buildDifferentialView', () => {
  it('returns a no-op diff when priorInspectionId is absent', async () => {
    const current = makeInspection('c1', [makeItem('i1', 'non-compliant')]);
    const view = await buildDifferentialView(current);
    expect(view.priorInspection).toBeNull();
    expect(view.all[0].diffStatus).toBe('not-in-prior');
  });

  it('returns a no-op diff when getById returns null', async () => {
    const current = makeInspection('c1', [makeItem('i1', 'non-compliant')], 'p1');
    const view = await buildDifferentialView(current);
    expect(view.priorInspection).toBeNull();
  });

  it('builds correct diff when prior is found via getById', async () => {
    const prior = makeInspection('p1', [makeItem('i1', 'non-compliant')]);
    spyGetById.mockResolvedValue(prior);
    const current = makeInspection('c1', [makeItem('i1', 'compliant')], 'p1');
    const view = await buildDifferentialView(current);
    expect(view.resolved).toHaveLength(1);
    expect(view.priorInspection).toBe(prior);
  });
});
