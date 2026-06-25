// __tests__/utils/inspectionUtils.test.ts
import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../../src/utils/inspectionUtils';
import { InspectionItem } from '../../src/types';

function makeItem(
  id: string,
  axis: string,
  status: InspectionItem['complianceStatus'] = 'not-evaluated'
): InspectionItem {
  return {
    id,
    axis,
    category: 'بيئية',
    criteria: '',
    legalReference: '',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: status,
  };
}

// ─── getEvaluatedCount ────────────────────────────────────────────────────────

describe('getEvaluatedCount', () => {
  it('returns 0 for empty array', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });

  it('counts compliant, non-compliant, and na as evaluated', () => {
    const items = [
      makeItem('1', 'A', 'compliant'),
      makeItem('2', 'A', 'non-compliant'),
      makeItem('3', 'A', 'na'),
      makeItem('4', 'A', 'not-evaluated'),
    ];
    expect(getEvaluatedCount(items)).toBe(3);
  });

  it('does not count not-evaluated', () => {
    const items = [makeItem('1', 'A', 'not-evaluated'), makeItem('2', 'A', 'not-evaluated')];
    expect(getEvaluatedCount(items)).toBe(0);
  });

  it('returns total when all items are evaluated', () => {
    const items = [
      makeItem('1', 'A', 'compliant'),
      makeItem('2', 'A', 'compliant'),
    ];
    expect(getEvaluatedCount(items)).toBe(2);
  });
});

// ─── getProgressPercent ───────────────────────────────────────────────────────

describe('getProgressPercent', () => {
  it('returns 0 for empty array', () => {
    expect(getProgressPercent([])).toBe(0);
  });

  it('returns 0 when nothing is evaluated', () => {
    const items = [makeItem('1', 'A', 'not-evaluated'), makeItem('2', 'A', 'not-evaluated')];
    expect(getProgressPercent(items)).toBe(0);
  });

  it('returns 100 when all items are evaluated', () => {
    const items = [makeItem('1', 'A', 'compliant'), makeItem('2', 'A', 'non-compliant')];
    expect(getProgressPercent(items)).toBe(100);
  });

  it('returns 50 when half are evaluated', () => {
    const items = [
      makeItem('1', 'A', 'compliant'),
      makeItem('2', 'A', 'not-evaluated'),
    ];
    expect(getProgressPercent(items)).toBe(50);
  });

  it('returns 75 for 3 out of 4 evaluated', () => {
    const items = [
      makeItem('1', 'A', 'compliant'),
      makeItem('2', 'A', 'non-compliant'),
      makeItem('3', 'A', 'na'),
      makeItem('4', 'A', 'not-evaluated'),
    ];
    expect(getProgressPercent(items)).toBe(75);
  });
});

// ─── groupByAxisRaw ───────────────────────────────────────────────────────────

describe('groupByAxisRaw', () => {
  it('returns empty array for empty input', () => {
    expect(groupByAxisRaw([])).toEqual([]);
  });

  it('groups items by axis correctly', () => {
    const items = [
      makeItem('1', 'النظافة'),
      makeItem('2', 'النظافة'),
      makeItem('3', 'السلامة'),
    ];
    const result = groupByAxisRaw(items);
    const axisMap = Object.fromEntries(result);
    expect(axisMap['النظافة']).toHaveLength(2);
    expect(axisMap['السلامة']).toHaveLength(1);
  });

  it('uses "أخرى" for items with no axis', () => {
    const item: InspectionItem = {
      id: 'X', axis: undefined as any, category: 'بيئية',
      criteria: '', legalReference: '', severity: 'low',
      controlType: 'visual', complianceStatus: 'not-evaluated',
    };
    const result = groupByAxisRaw([item]);
    expect(result[0][0]).toBe('أخرى');
  });

  it('preserves insertion order of axes', () => {
    const items = [
      makeItem('1', 'المحور أ'),
      makeItem('2', 'المحور ب'),
      makeItem('3', 'المحور أ'),
    ];
    const axes = groupByAxisRaw(items).map(([title]) => title);
    expect(axes[0]).toBe('المحور أ');
    expect(axes[1]).toBe('المحور ب');
  });
});

// ─── groupByAxis ─────────────────────────────────────────────────────────────

describe('groupByAxis', () => {
  it('returns objects with title and data properties', () => {
    const items = [makeItem('1', 'النظافة', 'compliant')];
    const result = groupByAxis(items);
    expect(result[0]).toHaveProperty('title', 'النظافة');
    expect(result[0]).toHaveProperty('data');
    expect(result[0].data).toHaveLength(1);
  });

  it('returns empty array for empty input', () => {
    expect(groupByAxis([])).toEqual([]);
  });
});

// ─── getAxisProgress ─────────────────────────────────────────────────────────

describe('getAxisProgress', () => {
  it('returns correct total and evaluated counts per axis', () => {
    const items = [
      makeItem('1', 'النظافة', 'compliant'),
      makeItem('2', 'النظافة', 'not-evaluated'),
      makeItem('3', 'السلامة', 'non-compliant'),
    ];
    const result = getAxisProgress(items);
    const cleanGroup = result.find(g => g.title === 'النظافة')!;
    const safeGroup = result.find(g => g.title === 'السلامة')!;
    expect(cleanGroup.total).toBe(2);
    expect(cleanGroup.evaluated).toBe(1);
    expect(safeGroup.total).toBe(1);
    expect(safeGroup.evaluated).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(getAxisProgress([])).toEqual([]);
  });
});
