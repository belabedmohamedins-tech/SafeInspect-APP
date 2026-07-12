// src/__tests__/inspectionUtils.test.ts
import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../../src/utils/inspectionUtils';
import { InspectionItem } from '../../src/types';

function item(id: string, status: string, axis?: string): InspectionItem {
  return { id, complianceStatus: status, axis } as unknown as InspectionItem;
}

describe('getEvaluatedCount', () => {
  it('returns 0 for empty list', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });
  it('excludes not-evaluated items', () => {
    const items = [
      item('a', 'compliant'),
      item('b', 'not-evaluated'),
      item('c', 'non-compliant'),
    ];
    expect(getEvaluatedCount(items)).toBe(2);
  });
  it('counts all items when none are not-evaluated', () => {
    const items = [item('a', 'compliant'), item('b', 'na')];
    expect(getEvaluatedCount(items)).toBe(2);
  });
});

describe('getProgressPercent', () => {
  it('returns 0 for empty list', () => {
    expect(getProgressPercent([])).toBe(0);
  });
  it('returns 100 when all items are evaluated', () => {
    expect(getProgressPercent([item('a', 'compliant'), item('b', 'na')])).toBe(100);
  });
  it('returns 50 when half are evaluated', () => {
    const items = [item('a', 'compliant'), item('b', 'not-evaluated')];
    expect(getProgressPercent(items)).toBe(50);
  });
});

describe('groupByAxisRaw', () => {
  it('returns empty array for empty input', () => {
    expect(groupByAxisRaw([])).toEqual([]);
  });
  it('groups items by axis', () => {
    const items = [
      item('a', 'compliant', 'النظافة'),
      item('b', 'compliant', 'السلامة'),
      item('c', 'na',        'النظافة'),
    ];
    const r = groupByAxisRaw(items);
    expect(r).toHaveLength(2);
    const hygiene = r.find(([k]) => k === 'النظافة')!;
    expect(hygiene[1]).toHaveLength(2);
  });
  it('uses أخرى for items with no axis', () => {
    const r = groupByAxisRaw([item('a', 'compliant')]);
    expect(r[0][0]).toBe('أخرى');
  });
});

describe('groupByAxis', () => {
  it('returns objects with title and data', () => {
    const items = [item('a', 'compliant', 'محور')];
    const r = groupByAxis(items);
    expect(r[0]).toEqual({ title: 'محور', data: [items[0]] });
  });
});

describe('getAxisProgress', () => {
  it('returns progress per axis', () => {
    const items = [
      item('a', 'compliant',    'محور'),
      item('b', 'not-evaluated','محور'),
    ];
    const r = getAxisProgress(items);
    expect(r).toHaveLength(1);
    expect(r[0].total).toBe(2);
    expect(r[0].evaluated).toBe(1);
    expect(r[0].title).toBe('محور');
  });
});
