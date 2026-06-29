// src/__tests__/utils/inspectionUtils.test.ts
//
// Pure function tests — no mocks needed.
// Tests every exported function in src/utils/inspectionUtils.ts:
//   getEvaluatedCount, getProgressPercent, groupByAxisRaw, groupByAxis,
//   getAxisProgress

import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../../utils/inspectionUtils';
import type { InspectionItem } from '../../types';

// ─── factory ─────────────────────────────────────────────────────────────────

function makeItem(
  overrides: Partial<InspectionItem> & { complianceStatus: InspectionItem['complianceStatus'] }
): InspectionItem {
  return {
    id:               overrides.id               ?? 'item-1',
    criterionId:      overrides.criterionId      ?? 'c1',
    title:            overrides.title            ?? 'Test criterion',
    axis:             overrides.axis             ?? 'Axis A',
    description:      overrides.description      ?? '',
    complianceStatus: overrides.complianceStatus,
    notes:            overrides.notes            ?? '',
    photos:           overrides.photos           ?? [],
    severity:         overrides.severity         ?? 'low',
    weight:           overrides.weight           ?? 1,
  } as InspectionItem;
}

// ─── getEvaluatedCount ────────────────────────────────────────────────────────

describe('getEvaluatedCount', () => {
  it('returns 0 for an empty array', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });

  it('returns 0 when all items are not-evaluated', () => {
    const items = [
      makeItem({ complianceStatus: 'not-evaluated' }),
      makeItem({ id: '2', complianceStatus: 'not-evaluated' }),
    ];
    expect(getEvaluatedCount(items)).toBe(0);
  });

  it('counts compliant items', () => {
    const items = [
      makeItem({ complianceStatus: 'compliant' }),
      makeItem({ id: '2', complianceStatus: 'not-evaluated' }),
    ];
    expect(getEvaluatedCount(items)).toBe(1);
  });

  it('counts non-compliant items', () => {
    const items = [
      makeItem({ complianceStatus: 'non-compliant' }),
      makeItem({ id: '2', complianceStatus: 'non-compliant' }),
      makeItem({ id: '3', complianceStatus: 'not-evaluated' }),
    ];
    expect(getEvaluatedCount(items)).toBe(2);
  });

  it('counts all when none is not-evaluated', () => {
    const items = [
      makeItem({ complianceStatus: 'compliant' }),
      makeItem({ id: '2', complianceStatus: 'non-compliant' }),
      makeItem({ id: '3', complianceStatus: 'compliant' }),
    ];
    expect(getEvaluatedCount(items)).toBe(3);
  });
});

// ─── getProgressPercent ───────────────────────────────────────────────────────

describe('getProgressPercent', () => {
  it('returns 0 for an empty array', () => {
    expect(getProgressPercent([])).toBe(0);
  });

  it('returns 0 when all items are not-evaluated', () => {
    const items = [
      makeItem({ complianceStatus: 'not-evaluated' }),
      makeItem({ id: '2', complianceStatus: 'not-evaluated' }),
    ];
    expect(getProgressPercent(items)).toBe(0);
  });

  it('returns 100 when all items are evaluated', () => {
    const items = [
      makeItem({ complianceStatus: 'compliant' }),
      makeItem({ id: '2', complianceStatus: 'non-compliant' }),
    ];
    expect(getProgressPercent(items)).toBe(100);
  });

  it('returns 50 when half are evaluated', () => {
    const items = [
      makeItem({ complianceStatus: 'compliant' }),
      makeItem({ id: '2', complianceStatus: 'compliant' }),
      makeItem({ id: '3', complianceStatus: 'not-evaluated' }),
      makeItem({ id: '4', complianceStatus: 'not-evaluated' }),
    ];
    expect(getProgressPercent(items)).toBe(50);
  });

  it('returns fractional percent for 1 of 3', () => {
    const items = [
      makeItem({ complianceStatus: 'compliant' }),
      makeItem({ id: '2', complianceStatus: 'not-evaluated' }),
      makeItem({ id: '3', complianceStatus: 'not-evaluated' }),
    ];
    expect(getProgressPercent(items)).toBeCloseTo(33.33, 1);
  });
});

// ─── groupByAxisRaw ───────────────────────────────────────────────────────────

describe('groupByAxisRaw', () => {
  it('returns [] for an empty array', () => {
    expect(groupByAxisRaw([])).toEqual([]);
  });

  it('groups all items under one axis', () => {
    const items = [
      makeItem({ id: '1', axis: 'Safety', complianceStatus: 'compliant' }),
      makeItem({ id: '2', axis: 'Safety', complianceStatus: 'compliant' }),
    ];
    const result = groupByAxisRaw(items);
    expect(result).toHaveLength(1);
    expect(result[0][0]).toBe('Safety');
    expect(result[0][1]).toHaveLength(2);
  });

  it('creates separate groups for each distinct axis', () => {
    const items = [
      makeItem({ id: '1', axis: 'Safety',   complianceStatus: 'compliant' }),
      makeItem({ id: '2', axis: 'Hygiene',  complianceStatus: 'compliant' }),
      makeItem({ id: '3', axis: 'Safety',   complianceStatus: 'compliant' }),
    ];
    const result = groupByAxisRaw(items);
    expect(result).toHaveLength(2);
    const safetyGroup = result.find(([k]) => k === 'Safety')!;
    expect(safetyGroup[1]).toHaveLength(2);
    const hygieneGroup = result.find(([k]) => k === 'Hygiene')!;
    expect(hygieneGroup[1]).toHaveLength(1);
  });

  it('falls back to "أخرى" when axis is undefined', () => {
    const item = makeItem({ id: '1', complianceStatus: 'not-evaluated' });
    // Override axis to undefined to trigger the fallback
    (item as any).axis = undefined;
    const result = groupByAxisRaw([item]);
    expect(result[0][0]).toBe('أخرى');
  });
});

// ─── groupByAxis ──────────────────────────────────────────────────────────────

describe('groupByAxis', () => {
  it('returns [] for an empty array', () => {
    expect(groupByAxis([])).toEqual([]);
  });

  it('each entry has shape { title, data }', () => {
    const items = [
      makeItem({ id: '1', axis: 'Fire Safety', complianceStatus: 'compliant' }),
    ];
    const result = groupByAxis(items);
    expect(result[0]).toHaveProperty('title', 'Fire Safety');
    expect(result[0]).toHaveProperty('data');
    expect(Array.isArray(result[0].data)).toBe(true);
  });

  it('data array contains the original items', () => {
    const items = [
      makeItem({ id: 'x', axis: 'Z', complianceStatus: 'compliant' }),
      makeItem({ id: 'y', axis: 'Z', complianceStatus: 'non-compliant' }),
    ];
    const result = groupByAxis(items);
    expect(result[0].data).toHaveLength(2);
  });

  it('produces one group per distinct axis', () => {
    const items = [
      makeItem({ id: '1', axis: 'A', complianceStatus: 'compliant' }),
      makeItem({ id: '2', axis: 'B', complianceStatus: 'compliant' }),
      makeItem({ id: '3', axis: 'A', complianceStatus: 'compliant' }),
    ];
    expect(groupByAxis(items)).toHaveLength(2);
  });
});

// ─── getAxisProgress ──────────────────────────────────────────────────────────

describe('getAxisProgress', () => {
  it('returns [] for an empty array', () => {
    expect(getAxisProgress([])).toEqual([]);
  });

  it('each entry has shape { title, total, evaluated }', () => {
    const items = [
      makeItem({ id: '1', axis: 'P', complianceStatus: 'compliant' }),
    ];
    const result = getAxisProgress(items);
    expect(result[0]).toEqual({ title: 'P', total: 1, evaluated: 1 });
  });

  it('evaluated count is 0 when all items are not-evaluated', () => {
    const items = [
      makeItem({ id: '1', axis: 'Q', complianceStatus: 'not-evaluated' }),
      makeItem({ id: '2', axis: 'Q', complianceStatus: 'not-evaluated' }),
    ];
    const result = getAxisProgress(items);
    expect(result[0]).toEqual({ title: 'Q', total: 2, evaluated: 0 });
  });

  it('counts partial evaluation correctly across axes', () => {
    const items = [
      makeItem({ id: '1', axis: 'A', complianceStatus: 'compliant' }),
      makeItem({ id: '2', axis: 'A', complianceStatus: 'not-evaluated' }),
      makeItem({ id: '3', axis: 'B', complianceStatus: 'non-compliant' }),
    ];
    const result = getAxisProgress(items);
    const a = result.find(r => r.title === 'A')!;
    expect(a).toEqual({ title: 'A', total: 2, evaluated: 1 });
    const b = result.find(r => r.title === 'B')!;
    expect(b).toEqual({ title: 'B', total: 1, evaluated: 1 });
  });
});
