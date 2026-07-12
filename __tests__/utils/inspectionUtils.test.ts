// __tests__/utils/inspectionUtils.test.ts
import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../../src/utils/inspectionUtils';
import { InspectionItem } from '../../src/types';

function makeItem(id: string, status: string, axis?: string): InspectionItem {
  return { id, complianceStatus: status, axis } as unknown as InspectionItem;
}

describe('getEvaluatedCount', () => {
  it('returns 0 for empty array', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });
  it('excludes not-evaluated items', () => {
    const items = [makeItem('a', 'compliant'), makeItem('b', 'not-evaluated'), makeItem('c', 'na')];
    expect(getEvaluatedCount(items)).toBe(2);
  });
  it('counts all when none are not-evaluated', () => {
    const items = [makeItem('a', 'compliant'), makeItem('b', 'non-compliant')];
    expect(getEvaluatedCount(items)).toBe(2);
  });
});

describe('getProgressPercent', () => {
  it('returns 0 for empty array', () => {
    expect(getProgressPercent([])).toBe(0);
  });
  it('returns 100 when all are evaluated', () => {
    const items = [makeItem('a', 'compliant'), makeItem('b', 'non-compliant')];
    expect(getProgressPercent(items)).toBe(100);
  });
  it('returns correct percent for partial evaluation', () => {
    const items = [makeItem('a', 'compliant'), makeItem('b', 'not-evaluated')];
    expect(getProgressPercent(items)).toBe(50);
  });
});

describe('groupByAxisRaw', () => {
  it('returns empty array for empty input', () => {
    expect(groupByAxisRaw([])).toEqual([]);
  });
  it('groups items by axis', () => {
    const items = [
      makeItem('a', 'compliant', 'Safety'),
      makeItem('b', 'compliant', 'Safety'),
      makeItem('c', 'compliant', 'Hygiene'),
    ];
    const r = groupByAxisRaw(items);
    expect(r).toHaveLength(2);
    const safety = r.find(([k]) => k === 'Safety');
    expect(safety![1]).toHaveLength(2);
  });
  it('uses أخرى as fallback for missing axis', () => {
    const items = [makeItem('a', 'compliant', undefined)];
    const r = groupByAxisRaw(items);
    expect(r[0][0]).toBe('أخرى');
  });
});

describe('groupByAxis', () => {
  it('returns objects with title and data', () => {
    const items = [makeItem('a', 'compliant', 'Safety')];
    const r = groupByAxis(items);
    expect(r[0]).toHaveProperty('title', 'Safety');
    expect(r[0]).toHaveProperty('data');
    expect(Array.isArray(r[0].data)).toBe(true);
  });
});

describe('getAxisProgress', () => {
  it('returns progress per axis', () => {
    const items = [
      makeItem('a', 'compliant', 'Safety'),
      makeItem('b', 'not-evaluated', 'Safety'),
      makeItem('c', 'compliant', 'Hygiene'),
    ];
    const r = getAxisProgress(items);
    const safety = r.find(x => x.title === 'Safety')!;
    expect(safety.total).toBe(2);
    expect(safety.evaluated).toBe(1);
    const hygiene = r.find(x => x.title === 'Hygiene')!;
    expect(hygiene.total).toBe(1);
    expect(hygiene.evaluated).toBe(1);
  });
});
