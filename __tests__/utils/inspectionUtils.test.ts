// __tests__/utils/inspectionUtils.test.ts
import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../../src/utils/inspectionUtils';
import { InspectionItem } from '../../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────
const item = (
  complianceStatus: InspectionItem['complianceStatus'],
  axis?: string,
  isRepeatViolation?: boolean
): InspectionItem =>
  ({
    id: Math.random().toString(),
    criterionId: 'c1',
    label: 'test',
    complianceStatus,
    axis: axis ?? 'Axe A',
    isRepeatViolation: isRepeatViolation ?? false,
  } as unknown as InspectionItem);

const evaluated = (axis?: string) => item('compliant', axis);
const notEval   = (axis?: string) => item('not-evaluated', axis);
const nonComp   = (axis?: string) => item('non-compliant', axis);

// ── getEvaluatedCount ─────────────────────────────────────────────────────────
describe('getEvaluatedCount', () => {
  it('empty array → 0', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });

  it('all not-evaluated → 0', () => {
    expect(getEvaluatedCount([notEval(), notEval()])).toBe(0);
  });

  it('all evaluated → full count', () => {
    expect(getEvaluatedCount([evaluated(), evaluated(), nonComp()])).toBe(3);
  });

  it('mixed → counts only non-not-evaluated', () => {
    expect(getEvaluatedCount([evaluated(), notEval(), nonComp(), notEval()])).toBe(2);
  });

  it('single evaluated item → 1', () => {
    expect(getEvaluatedCount([evaluated()])).toBe(1);
  });
});

// ── getProgressPercent ────────────────────────────────────────────────────────
describe('getProgressPercent', () => {
  it('empty array → 0', () => {
    expect(getProgressPercent([])).toBe(0);
  });

  it('all not-evaluated → 0%', () => {
    expect(getProgressPercent([notEval(), notEval()])).toBe(0);
  });

  it('all evaluated → 100%', () => {
    expect(getProgressPercent([evaluated(), nonComp()])).toBe(100);
  });

  it('half evaluated → 50%', () => {
    expect(getProgressPercent([evaluated(), notEval()])).toBe(50);
  });

  it('1 of 3 → 33.33…%', () => {
    const pct = getProgressPercent([evaluated(), notEval(), notEval()]);
    expect(pct).toBeCloseTo(33.33, 1);
  });

  it('2 of 4 → 50%', () => {
    expect(getProgressPercent([evaluated(), evaluated(), notEval(), notEval()])).toBe(50);
  });
});

// ── groupByAxisRaw ────────────────────────────────────────────────────────────
describe('groupByAxisRaw', () => {
  it('empty array → empty entries', () => {
    expect(groupByAxisRaw([])).toEqual([]);
  });

  it('all same axis → one group', () => {
    const result = groupByAxisRaw([evaluated('A'), nonComp('A')]);
    expect(result).toHaveLength(1);
    expect(result[0][0]).toBe('A');
    expect(result[0][1]).toHaveLength(2);
  });

  it('two axes → two groups', () => {
    const result = groupByAxisRaw([evaluated('A'), nonComp('B')]);
    expect(result).toHaveLength(2);
    const keys = result.map(([k]) => k);
    expect(keys).toContain('A');
    expect(keys).toContain('B');
  });

  it('undefined axis falls back to "أخرى"', () => {
    const i = { ...evaluated(), axis: undefined } as unknown as InspectionItem;
    const result = groupByAxisRaw([i]);
    expect(result[0][0]).toBe('أخرى');
  });

  it('preserves insertion order of axes', () => {
    const items = [
      evaluated('Z'), evaluated('A'), nonComp('Z'),
    ];
    const keys = groupByAxisRaw(items).map(([k]) => k);
    expect(keys[0]).toBe('Z');
    expect(keys[1]).toBe('A');
  });
});

// ── groupByAxis ───────────────────────────────────────────────────────────────
describe('groupByAxis', () => {
  it('empty array → []', () => {
    expect(groupByAxis([])).toEqual([]);
  });

  it('returns { title, data } shape', () => {
    const result = groupByAxis([evaluated('Hygiène')]);
    expect(result[0]).toHaveProperty('title', 'Hygiène');
    expect(result[0]).toHaveProperty('data');
    expect(Array.isArray(result[0].data)).toBe(true);
  });

  it('data arrays contain the original items', () => {
    const i1 = evaluated('Axe 1');
    const i2 = nonComp('Axe 1');
    const result = groupByAxis([i1, i2]);
    expect(result[0].data).toContain(i1);
    expect(result[0].data).toContain(i2);
  });
});

// ── getAxisProgress ───────────────────────────────────────────────────────────
describe('getAxisProgress', () => {
  it('empty array → []', () => {
    expect(getAxisProgress([])).toEqual([]);
  });

  it('returns { title, total, evaluated } shape', () => {
    const result = getAxisProgress([evaluated('Axe A'), notEval('Axe A')]);
    expect(result[0]).toMatchObject({ title: 'Axe A', total: 2, evaluated: 1 });
  });

  it('all evaluated → evaluated === total', () => {
    const result = getAxisProgress([evaluated('X'), nonComp('X')]);
    expect(result[0].evaluated).toBe(result[0].total);
  });

  it('none evaluated → evaluated === 0', () => {
    const result = getAxisProgress([notEval('X'), notEval('X')]);
    expect(result[0].evaluated).toBe(0);
  });

  it('two axes → two progress entries', () => {
    const result = getAxisProgress([
      evaluated('A'), notEval('A'),
      evaluated('B'), evaluated('B'),
    ]);
    expect(result).toHaveLength(2);
    const a = result.find(r => r.title === 'A')!;
    const b = result.find(r => r.title === 'B')!;
    expect(a).toMatchObject({ total: 2, evaluated: 1 });
    expect(b).toMatchObject({ total: 2, evaluated: 2 });
  });
});
