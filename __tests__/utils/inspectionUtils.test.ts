// __tests__/utils/inspectionUtils.test.ts
//
// Full coverage for src/utils/inspectionUtils.ts
// Pure TS — no mocks needed.
// Covers: getEvaluatedCount, getProgressPercent, groupByAxisRaw, groupByAxis, getAxisProgress

import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../../src/utils/inspectionUtils';
import { InspectionItem } from '../../src/types';

// ── Fixture builder ──────────────────────────────────────────────────────────

function makeItem(
  id: string,
  status: InspectionItem['complianceStatus'],
  axis?: string,
): InspectionItem {
  return {
    id,
    criteria: `Criteria ${id}`,
    legalReference: 'Art. 1',
    severity: 'medium',
    complianceStatus: status,
    axis,
  };
}

// ── getEvaluatedCount ────────────────────────────────────────────────────────

describe('getEvaluatedCount', () => {
  it('returns 0 for empty array', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });

  it('excludes not-evaluated items', () => {
    const items = [
      makeItem('1', 'not-evaluated'),
      makeItem('2', 'compliant'),
      makeItem('3', 'not-evaluated'),
    ];
    expect(getEvaluatedCount(items)).toBe(1);
  });

  it('counts all items when all are evaluated', () => {
    const items = [
      makeItem('1', 'compliant'),
      makeItem('2', 'non-compliant'),
      makeItem('3', 'na'),
    ];
    expect(getEvaluatedCount(items)).toBe(3);
  });

  it('returns 0 when all items are not-evaluated', () => {
    const items = [makeItem('1', 'not-evaluated'), makeItem('2', 'not-evaluated')];
    expect(getEvaluatedCount(items)).toBe(0);
  });
});

// ── getProgressPercent ───────────────────────────────────────────────────────

describe('getProgressPercent', () => {
  it('returns 0 for empty array (no division-by-zero)', () => {
    expect(getProgressPercent([])).toBe(0);
  });

  it('returns 0 when all items are not-evaluated', () => {
    const items = [makeItem('1', 'not-evaluated'), makeItem('2', 'not-evaluated')];
    expect(getProgressPercent(items)).toBe(0);
  });

  it('returns 100 when all items are evaluated', () => {
    const items = [makeItem('1', 'compliant'), makeItem('2', 'non-compliant')];
    expect(getProgressPercent(items)).toBe(100);
  });

  it('returns 50 when half are evaluated', () => {
    const items = [
      makeItem('1', 'compliant'),
      makeItem('2', 'not-evaluated'),
    ];
    expect(getProgressPercent(items)).toBe(50);
  });

  it('returns fractional percent for uneven splits', () => {
    // 1 of 3 evaluated = 33.33...
    const items = [
      makeItem('1', 'compliant'),
      makeItem('2', 'not-evaluated'),
      makeItem('3', 'not-evaluated'),
    ];
    expect(getProgressPercent(items)).toBeCloseTo(33.33, 1);
  });
});

// ── groupByAxisRaw ───────────────────────────────────────────────────────────

describe('groupByAxisRaw', () => {
  it('returns empty array for empty input', () => {
    expect(groupByAxisRaw([])).toEqual([]);
  });

  it('groups items by axis', () => {
    const items = [
      makeItem('1', 'compliant', 'hygiene'),
      makeItem('2', 'compliant', 'hygiene'),
      makeItem('3', 'non-compliant', 'storage'),
    ];
    const result = groupByAxisRaw(items);
    const hygieneGroup = result.find(([title]) => title === 'hygiene');
    const storageGroup = result.find(([title]) => title === 'storage');
    expect(hygieneGroup?.[1]).toHaveLength(2);
    expect(storageGroup?.[1]).toHaveLength(1);
  });

  it('uses "أخرى" as fallback axis when axis is undefined', () => {
    const items = [makeItem('1', 'compliant', undefined)];
    const result = groupByAxisRaw(items);
    expect(result[0][0]).toBe('أخرى');
  });

  it('returns an array of [string, InspectionItem[]] tuples', () => {
    const items = [makeItem('1', 'compliant', 'axis-A')];
    const result = groupByAxisRaw(items);
    expect(Array.isArray(result[0])).toBe(true);
    expect(typeof result[0][0]).toBe('string');
    expect(Array.isArray(result[0][1])).toBe(true);
  });
});

// ── groupByAxis ──────────────────────────────────────────────────────────────

describe('groupByAxis', () => {
  it('returns empty array for empty input', () => {
    expect(groupByAxis([])).toEqual([]);
  });

  it('returns objects with title and data properties', () => {
    const items = [makeItem('1', 'compliant', 'hygiene')];
    const result = groupByAxis(items);
    expect(result[0]).toHaveProperty('title', 'hygiene');
    expect(result[0]).toHaveProperty('data');
    expect(Array.isArray(result[0].data)).toBe(true);
  });

  it('groups correctly (same shape as groupByAxisRaw)', () => {
    const items = [
      makeItem('1', 'compliant', 'A'),
      makeItem('2', 'non-compliant', 'B'),
      makeItem('3', 'na', 'A'),
    ];
    const result = groupByAxis(items);
    const groupA = result.find(g => g.title === 'A');
    expect(groupA?.data).toHaveLength(2);
  });
});

// ── getAxisProgress ──────────────────────────────────────────────────────────

describe('getAxisProgress', () => {
  it('returns empty array for empty input', () => {
    expect(getAxisProgress([])).toEqual([]);
  });

  it('returns correct total and evaluated per axis', () => {
    const items = [
      makeItem('1', 'compliant', 'hygiene'),
      makeItem('2', 'not-evaluated', 'hygiene'),
      makeItem('3', 'non-compliant', 'storage'),
    ];
    const result = getAxisProgress(items);
    const hygiene = result.find(g => g.title === 'hygiene');
    const storage = result.find(g => g.title === 'storage');
    expect(hygiene?.total).toBe(2);
    expect(hygiene?.evaluated).toBe(1);
    expect(storage?.total).toBe(1);
    expect(storage?.evaluated).toBe(1);
  });

  it('has evaluated = 0 when all items in an axis are not-evaluated', () => {
    const items = [
      makeItem('1', 'not-evaluated', 'hygiene'),
      makeItem('2', 'not-evaluated', 'hygiene'),
    ];
    const result = getAxisProgress(items);
    expect(result[0].evaluated).toBe(0);
  });
});
