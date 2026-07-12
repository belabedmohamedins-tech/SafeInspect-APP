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
  return { id, complianceStatus: status, axis, criteria: id, severity: 'low' } as InspectionItem;
}

describe('getEvaluatedCount', () => {
  it('counts non not-evaluated items', () => {
    const items = [
      item('a', 'compliant'),
      item('b', 'not-evaluated'),
      item('c', 'non-compliant'),
    ];
    expect(getEvaluatedCount(items)).toBe(2);
  });

  it('empty → 0', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });
});

describe('getProgressPercent', () => {
  it('empty list → 0', () => {
    expect(getProgressPercent([])).toBe(0);
  });

  it('all evaluated → 100', () => {
    expect(getProgressPercent([item('a', 'compliant'), item('b', 'na')])).toBe(100);
  });

  it('half evaluated → 50', () => {
    const items = [item('a', 'compliant'), item('b', 'not-evaluated')];
    expect(getProgressPercent(items)).toBe(50);
  });
});

describe('groupByAxisRaw', () => {
  it('groups by axis field', () => {
    const items = [
      item('a', 'compliant', 'hygiene'),
      item('b', 'compliant', 'hygiene'),
      item('c', 'compliant', 'safety'),
    ];
    const groups = groupByAxisRaw(items);
    expect(groups).toHaveLength(2);
    const hygieneGroup = groups.find(([k]) => k === 'hygiene');
    expect(hygieneGroup?.[1]).toHaveLength(2);
  });

  it('items without axis fall into أخرى group', () => {
    const groups = groupByAxisRaw([item('a', 'compliant')]);
    expect(groups[0][0]).toBe('أخرى');
  });
});

describe('groupByAxis', () => {
  it('returns array of { title, data }', () => {
    const groups = groupByAxis([item('a', 'compliant', 'env')]);
    expect(groups[0].title).toBe('env');
    expect(groups[0].data).toHaveLength(1);
  });
});

describe('getAxisProgress', () => {
  it('returns total and evaluated per axis', () => {
    const items = [
      item('a', 'compliant', 'hygiene'),
      item('b', 'not-evaluated', 'hygiene'),
    ];
    const progress = getAxisProgress(items);
    expect(progress[0].total).toBe(2);
    expect(progress[0].evaluated).toBe(1);
  });
});
