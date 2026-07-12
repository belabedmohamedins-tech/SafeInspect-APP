// __tests__/utils/inspectionUtils.test.ts
import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../../src/utils/inspectionUtils';
import { InspectionItem } from '../../src/types';

function item(id: string, status: string, axis?: string): InspectionItem {
  return { id, complianceStatus: status, axis } as InspectionItem;
}

describe('getEvaluatedCount', () => {
  it('empty → 0', () => expect(getEvaluatedCount([])).toBe(0));
  it('counts non-"not-evaluated" items', () => {
    const items = [
      item('a', 'compliant'),
      item('b', 'non-compliant'),
      item('c', 'not-evaluated'),
      item('d', 'na'),
    ];
    expect(getEvaluatedCount(items)).toBe(3);
  });
});

describe('getProgressPercent', () => {
  it('empty → 0', () => expect(getProgressPercent([])).toBe(0));
  it('all evaluated → 100', () => {
    expect(getProgressPercent([item('a', 'compliant'), item('b', 'non-compliant')])).toBe(100);
  });
  it('half evaluated → 50', () => {
    expect(getProgressPercent([item('a', 'compliant'), item('b', 'not-evaluated')])).toBe(50);
  });
});

describe('groupByAxisRaw', () => {
  it('groups by axis field', () => {
    const items = [
      item('a', 'compliant', 'النظافة'),
      item('b', 'compliant', 'النظافة'),
      item('c', 'non-compliant', 'السلامة'),
    ];
    const r = groupByAxisRaw(items);
    expect(r).toHaveLength(2);
    const axes = Object.fromEntries(r);
    expect(axes['النظافة']).toHaveLength(2);
    expect(axes['السلامة']).toHaveLength(1);
  });

  it('no axis → falls back to أخرى', () => {
    const r = groupByAxisRaw([item('a', 'compliant')]);
    expect(r[0][0]).toBe('أخرى');
  });
});

describe('groupByAxis', () => {
  it('returns {title, data} objects', () => {
    const r = groupByAxis([item('a', 'compliant', 'محور1')]);
    expect(r[0]).toHaveProperty('title', 'محور1');
    expect(r[0]).toHaveProperty('data');
    expect(Array.isArray(r[0].data)).toBe(true);
  });
});

describe('getAxisProgress', () => {
  it('returns title, total, evaluated per axis', () => {
    const items = [
      item('a', 'compliant', 'محور'),
      item('b', 'not-evaluated', 'محور'),
      item('c', 'non-compliant', 'محور'),
    ];
    const r = getAxisProgress(items);
    expect(r).toHaveLength(1);
    expect(r[0].title).toBe('محور');
    expect(r[0].total).toBe(3);
    expect(r[0].evaluated).toBe(2);
  });
});
