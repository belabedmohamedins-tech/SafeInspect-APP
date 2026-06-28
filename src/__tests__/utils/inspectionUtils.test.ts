// src/__tests__/utils/inspectionUtils.test.ts
import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxis,
  groupByAxisRaw,
  getAxisProgress,
} from '../../utils/inspectionUtils';
import type { InspectionItem } from '../../types';

// ─── Fixtures ──────────────────────────────────────────────────────────────────────
const makeItem = (overrides: Partial<InspectionItem> = {}): InspectionItem => ({
  id: 'item-1',
  title: 'Test item',
  axis: 'Hygiene',
  complianceStatus: 'not-evaluated',
  severity: 'low',
  weight: 1,
  ...overrides,
});

const compliant    = makeItem({ complianceStatus: 'compliant',     axis: 'Hygiene' });
const nonCompliant = makeItem({ complianceStatus: 'non-compliant', axis: 'Hygiene' });
const notEvaluated = makeItem({ complianceStatus: 'not-evaluated', axis: 'Safety'  });
const noAxis       = makeItem({ complianceStatus: 'compliant',     axis: undefined });

describe('getEvaluatedCount', () => {
  it('returns 0 for empty array', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });

  it('counts only items that are not not-evaluated', () => {
    expect(getEvaluatedCount([compliant, nonCompliant, notEvaluated])).toBe(2);
  });

  it('returns 0 when all items are not-evaluated', () => {
    expect(getEvaluatedCount([notEvaluated, notEvaluated])).toBe(0);
  });
});

describe('getProgressPercent', () => {
  it('returns 0 for empty array', () => {
    expect(getProgressPercent([])).toBe(0);
  });

  it('returns 100 when all items are evaluated', () => {
    expect(getProgressPercent([compliant, nonCompliant])).toBe(100);
  });

  it('returns 0 when no items are evaluated', () => {
    expect(getProgressPercent([notEvaluated, notEvaluated])).toBe(0);
  });

  it('returns correct percentage for partial evaluation', () => {
    const items = [compliant, notEvaluated, notEvaluated, notEvaluated];
    expect(getProgressPercent(items)).toBe(25);
  });
});

describe('groupByAxisRaw', () => {
  it('returns empty array for empty input', () => {
    expect(groupByAxisRaw([])).toEqual([]);
  });

  it('groups items by their axis', () => {
    const result = groupByAxisRaw([compliant, nonCompliant, notEvaluated]);
    const axes = result.map(([axis]) => axis);
    expect(axes).toContain('Hygiene');
    expect(axes).toContain('Safety');
    const hygieneGroup = result.find(([axis]) => axis === 'Hygiene')!;
    expect(hygieneGroup[1]).toHaveLength(2);
  });

  it('falls back to "أخرى" when axis is undefined', () => {
    const result = groupByAxisRaw([noAxis]);
    const axes = result.map(([axis]) => axis);
    expect(axes).toContain('أخرى');
  });
});

describe('groupByAxis', () => {
  it('returns array of { title, data } objects', () => {
    const result = groupByAxis([compliant, notEvaluated]);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('data');
  });
});

describe('getAxisProgress', () => {
  it('returns progress per axis with correct totals', () => {
    const items = [compliant, nonCompliant, notEvaluated];
    const result = getAxisProgress(items);
    const hygiene = result.find(r => r.title === 'Hygiene')!;
    expect(hygiene.total).toBe(2);
    expect(hygiene.evaluated).toBe(2);
    const safety = result.find(r => r.title === 'Safety')!;
    expect(safety.total).toBe(1);
    expect(safety.evaluated).toBe(0);
  });
});
