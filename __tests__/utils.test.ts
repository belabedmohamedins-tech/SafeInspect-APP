// __tests__/utils.test.ts
//
// Full coverage pass for src/utils/*
// Files covered:
//   dateUtils | fileUtils | groupViolations | inspectionUtils |
//   numericUtils | scoringUtils | statsUtils | statusUtils
//
// Architecture: L4 test — no L2 mocks needed (all files are pure functions).

import {
  formatDateLong,
  formatDateTimeShort,
  formatDateOnly,
  formatDateForAgenda,
  formatDateForCard,
} from '../src/utils/dateUtils';

import { generateFileName } from '../src/utils/fileUtils';

import {
  groupViolationsByRepeat,
  formatViolationGroupSummary,
} from '../src/utils/groupViolations';

import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../src/utils/inspectionUtils';

import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
} from '../src/utils/numericUtils';

import {
  computeScoreAndGrade,
  SEVERITY_WEIGHTS,
  GRADE_A_MIN,
  GRADE_B_MIN,
  GRADE_C_MIN,
  CEILING_C_THRESHOLD,
  FORCED_D_THRESHOLD,
  MIN_COMPLETION_RATE,
} from '../src/utils/scoringUtils';

import { computeStats } from '../src/utils/statsUtils';

import {
  getStatusText,
  getStatusColor,
  getComplianceSummary,
} from '../src/utils/statusUtils';

import type { InspectionItem } from '../src/types';
import type { NumericFieldSpec } from '../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeItem(
  overrides: Partial<InspectionItem> = {},
): InspectionItem {
  return {
    id: 'item-1',
    criterionId: 'c-1',
    criterionText: 'Test criterion',
    axis: 'محور 1',
    severity: 'medium',
    complianceStatus: 'not-evaluated',
    isRepeatViolation: false,
    photoUris: [],
    notes: '',
    ...overrides,
  } as InspectionItem;
}

// ─────────────────────────────────────────────────────────────────────────────
// dateUtils
// ─────────────────────────────────────────────────────────────────────────────

describe('dateUtils', () => {
  // Use a fixed ISO string so the test is timezone-aware but deterministic.
  // formatDateTimeShort is computed from the same Date object, so no hardcoding.
  const iso = '2026-03-15T14:30:00.000Z';
  const d   = new Date(iso);

  test('formatDateTimeShort returns YYYY-MM-DD HH:MM based on local time', () => {
    const year    = d.getFullYear();
    const month   = (d.getMonth() + 1).toString().padStart(2, '0');
    const day     = d.getDate().toString().padStart(2, '0');
    const hours   = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    expect(formatDateTimeShort(iso)).toBe(`${year}-${month}-${day} ${hours}:${minutes}`);
  });

  test('formatDateForCard delegates to formatDateTimeShort', () => {
    expect(formatDateForCard(iso)).toBe(formatDateTimeShort(iso));
  });

  test('formatDateOnly returns a non-empty Arabic locale string', () => {
    const result = formatDateOnly(iso);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('formatDateLong returns a non-empty Arabic locale string with weekday', () => {
    const result = formatDateLong(iso);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('formatDateForAgenda returns a non-empty string', () => {
    const result = formatDateForAgenda(iso);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fileUtils
// ─────────────────────────────────────────────────────────────────────────────

describe('generateFileName', () => {
  test('returns a string with the given extension', () => {
    const name = generateFileName('مطعم الكوكب', 'pdf');
    expect(name).toMatch(/\.pdf$/);
  });

  test('contains YYYY-MM-DD date segment', () => {
    const name = generateFileName('test', 'csv');
    expect(name).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('contains HH-MM time segment', () => {
    const name = generateFileName('test', 'csv');
    expect(name).toMatch(/\d{2}-\d{2}/);
  });

  test('removes special characters outside Arabic+word chars', () => {
    const name = generateFileName('test!@#$%', 'pdf');
    expect(name).not.toMatch(/[!@#$%]/);
  });

  test('replaces spaces with underscores in the base name', () => {
    const name = generateFileName('hello world', 'pdf');
    expect(name).toMatch(/hello_world/);
  });

  test('preserves Arabic characters', () => {
    const name = generateFileName('مطعم', 'pdf');
    expect(name).toMatch(/مطعم/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// groupViolations
// ─────────────────────────────────────────────────────────────────────────────

describe('groupViolationsByRepeat', () => {
  test('returns empty arrays when no items', () => {
    expect(groupViolationsByRepeat([])).toEqual({ firstTime: [], repeat: [] });
  });

  test('excludes compliant and not-evaluated items', () => {
    const items = [
      makeItem({ complianceStatus: 'compliant' }),
      makeItem({ complianceStatus: 'not-evaluated' }),
      makeItem({ complianceStatus: 'na' }),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(0);
  });

  test('puts non-repeat violations in firstTime', () => {
    const items = [
      makeItem({ complianceStatus: 'non-compliant', isRepeatViolation: false }),
      makeItem({ complianceStatus: 'non-compliant', isRepeatViolation: undefined as any }),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.firstTime).toHaveLength(2);
    expect(result.repeat).toHaveLength(0);
  });

  test('puts repeat violations in repeat', () => {
    const items = [
      makeItem({ complianceStatus: 'non-compliant', isRepeatViolation: true }),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.repeat).toHaveLength(1);
    expect(result.firstTime).toHaveLength(0);
  });

  test('correctly separates mixed items', () => {
    const items = [
      makeItem({ id: 'a', complianceStatus: 'non-compliant', isRepeatViolation: false }),
      makeItem({ id: 'b', complianceStatus: 'non-compliant', isRepeatViolation: true }),
      makeItem({ id: 'c', complianceStatus: 'compliant' }),
    ];
    const { firstTime, repeat } = groupViolationsByRepeat(items);
    expect(firstTime).toHaveLength(1);
    expect(repeat).toHaveLength(1);
  });
});

describe('formatViolationGroupSummary', () => {
  test('returns Arabic no-violation message when both arrays empty', () => {
    expect(formatViolationGroupSummary({ firstTime: [], repeat: [] }))
      .toBe('لا توجد مخالفات');
  });

  test('only firstTime violations', () => {
    const summary = formatViolationGroupSummary({
      firstTime: [makeItem(), makeItem()],
      repeat: [],
    });
    expect(summary).toContain('2');
    expect(summary).toContain('لأول مرة');
    expect(summary).not.toContain('متكرر');
  });

  test('only repeat violations, singular', () => {
    const summary = formatViolationGroupSummary({
      firstTime: [],
      repeat: [makeItem()],
    });
    expect(summary).toContain('1');
    expect(summary).toContain('متكرر');
  });

  test('plural repeat suffix for > 1', () => {
    const summary = formatViolationGroupSummary({
      firstTime: [],
      repeat: [makeItem(), makeItem()],
    });
    expect(summary).toContain('متكررة');
  });

  test('mixed: firstTime + repeat, total is sum', () => {
    const summary = formatViolationGroupSummary({
      firstTime: [makeItem()],
      repeat: [makeItem(), makeItem()],
    });
    expect(summary).toMatch(/^3/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// inspectionUtils
// ─────────────────────────────────────────────────────────────────────────────

describe('inspectionUtils', () => {
  describe('getEvaluatedCount', () => {
    test('returns 0 for empty array', () => {
      expect(getEvaluatedCount([])).toBe(0);
    });

    test('excludes not-evaluated items', () => {
      const items = [
        makeItem({ complianceStatus: 'compliant' }),
        makeItem({ complianceStatus: 'not-evaluated' }),
        makeItem({ complianceStatus: 'non-compliant' }),
      ];
      expect(getEvaluatedCount(items)).toBe(2);
    });

    test('counts all when none are not-evaluated', () => {
      const items = [
        makeItem({ complianceStatus: 'compliant' }),
        makeItem({ complianceStatus: 'na' }),
      ];
      expect(getEvaluatedCount(items)).toBe(2);
    });
  });

  describe('getProgressPercent', () => {
    test('returns 0 when items array is empty', () => {
      expect(getProgressPercent([])).toBe(0);
    });

    test('returns 100 when all items evaluated', () => {
      const items = [
        makeItem({ complianceStatus: 'compliant' }),
        makeItem({ complianceStatus: 'non-compliant' }),
      ];
      expect(getProgressPercent(items)).toBe(100);
    });

    test('returns 50 when half evaluated', () => {
      const items = [
        makeItem({ complianceStatus: 'compliant' }),
        makeItem({ complianceStatus: 'not-evaluated' }),
      ];
      expect(getProgressPercent(items)).toBe(50);
    });
  });

  describe('groupByAxisRaw', () => {
    test('groups items by axis', () => {
      const items = [
        makeItem({ id: '1', axis: 'محور أ' }),
        makeItem({ id: '2', axis: 'محور أ' }),
        makeItem({ id: '3', axis: 'محور ب' }),
      ];
      const groups = groupByAxisRaw(items);
      expect(groups).toHaveLength(2);
      const groupA = groups.find(([title]) => title === 'محور أ');
      expect(groupA?.[1]).toHaveLength(2);
    });

    test('uses "أخرى" when axis is missing', () => {
      const item = makeItem({ axis: undefined as any });
      const groups = groupByAxisRaw([item]);
      expect(groups[0][0]).toBe('أخرى');
    });
  });

  describe('groupByAxis', () => {
    test('returns objects with title and data', () => {
      const items = [
        makeItem({ id: '1', axis: 'محور ج' }),
      ];
      const result = groupByAxis(items);
      expect(result[0]).toHaveProperty('title', 'محور ج');
      expect(result[0]).toHaveProperty('data');
    });
  });

  describe('getAxisProgress', () => {
    test('computes evaluated count per axis', () => {
      const items = [
        makeItem({ id: '1', axis: 'X', complianceStatus: 'compliant' }),
        makeItem({ id: '2', axis: 'X', complianceStatus: 'not-evaluated' }),
      ];
      const progress = getAxisProgress(items);
      expect(progress[0].total).toBe(2);
      expect(progress[0].evaluated).toBe(1);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// numericUtils
// ─────────────────────────────────────────────────────────────────────────────

describe('deriveNumericCompliance', () => {
  const spec: NumericFieldSpec = {
    min: 10,
    max: 20,
    warningMin: 8,
    warningMax: 25,
    unit: '°C',
    label: 'Temp',
  };

  test('returns not-measured for undefined', () => {
    expect(deriveNumericCompliance(undefined, spec)).toBe('not-measured');
  });

  test('returns not-measured for NaN', () => {
    expect(deriveNumericCompliance(NaN, spec)).toBe('not-measured');
  });

  test('returns not-measured for null', () => {
    expect(deriveNumericCompliance(null as any, spec)).toBe('not-measured');
  });

  test('returns compliant when value in [min, max]', () => {
    expect(deriveNumericCompliance(15, spec)).toBe('compliant');
  });

  test('returns compliant at min boundary', () => {
    expect(deriveNumericCompliance(10, spec)).toBe('compliant');
  });

  test('returns compliant at max boundary', () => {
    expect(deriveNumericCompliance(20, spec)).toBe('compliant');
  });

  test('returns warning when value in warning zone (below min)', () => {
    expect(deriveNumericCompliance(9, spec)).toBe('warning');
  });

  test('returns warning when value in warning zone (above max)', () => {
    expect(deriveNumericCompliance(23, spec)).toBe('warning');
  });

  test('returns non-compliant below warningMin', () => {
    expect(deriveNumericCompliance(5, spec)).toBe('non-compliant');
  });

  test('returns non-compliant above warningMax', () => {
    expect(deriveNumericCompliance(30, spec)).toBe('non-compliant');
  });

  test('returns compliant when no min/max defined and value present', () => {
    const openSpec: NumericFieldSpec = { unit: '°C', label: 'T' };
    expect(deriveNumericCompliance(100, openSpec)).toBe('compliant');
  });
});

describe('numericStateToComplianceStatus', () => {
  test('compliant → compliant', () => {
    expect(numericStateToComplianceStatus('compliant')).toBe('compliant');
  });

  test('warning → observation-only', () => {
    expect(numericStateToComplianceStatus('warning')).toBe('observation-only');
  });

  test('non-compliant → non-compliant', () => {
    expect(numericStateToComplianceStatus('non-compliant')).toBe('non-compliant');
  });

  test('not-measured → undefined', () => {
    expect(numericStateToComplianceStatus('not-measured')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// scoringUtils
// ─────────────────────────────────────────────────────────────────────────────

describe('scoringUtils — constants', () => {
  test('SEVERITY_WEIGHTS has correct values', () => {
    expect(SEVERITY_WEIGHTS.high).toBe(3);
    expect(SEVERITY_WEIGHTS.medium).toBe(2);
    expect(SEVERITY_WEIGHTS.low).toBe(1);
  });

  test('grade thresholds are ordered correctly', () => {
    expect(GRADE_A_MIN).toBeGreaterThan(GRADE_B_MIN);
    expect(GRADE_B_MIN).toBeGreaterThan(GRADE_C_MIN);
    expect(GRADE_C_MIN).toBeGreaterThan(0);
  });

  test('override thresholds: FORCED_D > CEILING_C', () => {
    expect(FORCED_D_THRESHOLD).toBeGreaterThan(CEILING_C_THRESHOLD);
  });

  test('MIN_COMPLETION_RATE is between 0 and 1', () => {
    expect(MIN_COMPLETION_RATE).toBeGreaterThan(0);
    expect(MIN_COMPLETION_RATE).toBeLessThan(1);
  });
});

describe('computeScoreAndGrade', () => {
  // Build a batch of compliant items for grade A
  function allCompliant(n: number, severity: 'high' | 'medium' | 'low' = 'medium'): InspectionItem[] {
    return Array.from({ length: n }, (_, i) =>
      makeItem({ id: `c-${i}`, complianceStatus: 'compliant', severity }),
    );
  }

  function allNonCompliant(n: number, severity: 'high' | 'medium' | 'low' = 'medium'): InspectionItem[] {
    return Array.from({ length: n }, (_, i) =>
      makeItem({ id: `nc-${i}`, complianceStatus: 'non-compliant', severity }),
    );
  }

  test('empty items → score 0, grade D, completionRate 0, incomplete true', () => {
    const r = computeScoreAndGrade([]);
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.incomplete).toBe(true);
    expect(r.completionRate).toBe(0);
  });

  test('all compliant → score 100, grade A', () => {
    const r = computeScoreAndGrade(allCompliant(10));
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.rawGrade).toBe('A');
    expect(r.criticalOverride).toBe(false);
  });

  test('all non-compliant → score 0, grade D', () => {
    const r = computeScoreAndGrade(allNonCompliant(5, 'low'));
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
  });

  test('grade B path — score ~75', () => {
    // 3 compliant medium (weight 6) + 1 non-compliant medium (weight 2) = 6/8 = 75%
    const items = [
      ...allCompliant(3, 'medium'),
      makeItem({ id: 'nc-1', complianceStatus: 'non-compliant', severity: 'medium' }),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(75);
    expect(r.grade).toBe('B');
  });

  test('grade C path — score ~55', () => {
    // 11 compliant + 9 non-compliant medium → 22/40 = 55%
    const items = [
      ...allCompliant(11, 'medium'),
      ...allNonCompliant(9, 'medium'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBeGreaterThanOrEqual(GRADE_C_MIN);
    expect(r.score).toBeLessThan(GRADE_B_MIN);
    expect(r.grade).toBe('C');
  });

  test('ceiling-C override: 1 high violation caps grade from A→C', () => {
    // All compliant except 1 high non-compliant → score=85.7 → rawGrade A → capped to C
    const items = [
      ...allCompliant(6, 'medium'),
      makeItem({ id: 'high-nc', complianceStatus: 'non-compliant', severity: 'high' }),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
    expect(r.violations.high).toBe(1);
  });

  test('forced-D override: 3+ high violations → grade D', () => {
    const items = [
      ...allCompliant(10, 'low'),
      makeItem({ id: 'h1', complianceStatus: 'non-compliant', severity: 'high' }),
      makeItem({ id: 'h2', complianceStatus: 'non-compliant', severity: 'high' }),
      makeItem({ id: 'h3', complianceStatus: 'non-compliant', severity: 'high' }),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.violations.high).toBe(3);
    expect(r.violations.total).toBe(3);
  });

  test('forced-D: criticalOverride false when rawGrade already D', () => {
    // Many high violations → rawGrade would also be D → no override needed
    const items = allNonCompliant(5, 'high');
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });

  test('NA items are excluded from applicableCount', () => {
    const items = [
      makeItem({ id: 'na-1', complianceStatus: 'na' }),
      makeItem({ id: 'na-2', complianceStatus: 'na' }),
      ...allCompliant(5),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.applicableCount).toBe(5);
  });

  test('incomplete flag set when < 60% evaluated', () => {
    const items = [
      makeItem({ id: 'ev-1', complianceStatus: 'compliant' }),
      makeItem({ id: 'ne-1', complianceStatus: 'not-evaluated' }),
      makeItem({ id: 'ne-2', complianceStatus: 'not-evaluated' }),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.incomplete).toBe(true);
  });

  test('riskLevel maps correctly: A→1, B→2, C→3, D→4', () => {
    expect(computeScoreAndGrade(allCompliant(10)).riskLevel).toBe(1);
    expect(computeScoreAndGrade(allNonCompliant(5, 'low')).riskLevel).toBe(4);
  });

  test('nextInspectionDays: grade A → 730 days', () => {
    const r = computeScoreAndGrade(allCompliant(10));
    expect(r.nextInspectionDays).toBe(730);
  });

  test('nextInspectionDays: grade D → 30 days', () => {
    const r = computeScoreAndGrade(allNonCompliant(5, 'low'));
    expect(r.nextInspectionDays).toBe(30);
  });

  test('disclaimer is a non-empty Arabic string', () => {
    const r = computeScoreAndGrade(allCompliant(5));
    expect(typeof r.disclaimer).toBe('string');
    expect(r.disclaimer.length).toBeGreaterThan(20);
  });

  test('violation profile counts by severity', () => {
    const items = [
      makeItem({ id: 'h', complianceStatus: 'non-compliant', severity: 'high' }),
      makeItem({ id: 'm', complianceStatus: 'non-compliant', severity: 'medium' }),
      makeItem({ id: 'l', complianceStatus: 'non-compliant', severity: 'low' }),
      makeItem({ id: 'ok', complianceStatus: 'compliant', severity: 'high' }),
    ];
    const { violations } = computeScoreAndGrade(items);
    expect(violations.high).toBe(1);
    expect(violations.medium).toBe(1);
    expect(violations.low).toBe(1);
    expect(violations.total).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// statsUtils
// ─────────────────────────────────────────────────────────────────────────────

describe('computeStats', () => {
  test('empty array returns zero totals and N/A average', () => {
    const s = computeStats([]);
    expect(s.total).toBe(0);
    expect(s.averageScore).toBe('N/A');
    expect(s.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
    expect(s.totalHighViolations).toBe(0);
    expect(s.criticalOverrideCount).toBe(0);
  });

  test('grade counts are accurate', () => {
    const inspections: any[] = [
      { grade: 'A', score: 90, violations: {}, criticalOverride: false },
      { grade: 'A', score: 88, violations: {}, criticalOverride: false },
      { grade: 'B', score: 75, violations: {}, criticalOverride: false },
      { grade: 'C', score: 55, violations: {}, criticalOverride: false },
      { grade: 'D', score: 30, violations: {}, criticalOverride: false },
    ];
    const s = computeStats(inspections);
    expect(s.total).toBe(5);
    expect(s.gradeCounts.A).toBe(2);
    expect(s.gradeCounts.B).toBe(1);
    expect(s.gradeCounts.C).toBe(1);
    expect(s.gradeCounts.D).toBe(1);
  });

  test('averageScore is computed correctly to 1 decimal', () => {
    const inspections: any[] = [
      { grade: 'A', score: 90, violations: {}, criticalOverride: false },
      { grade: 'B', score: 70, violations: {}, criticalOverride: false },
    ];
    const s = computeStats(inspections);
    expect(s.averageScore).toBe('80.0');
  });

  test('averageScore is "0.0" when all scores are 0 (not N/A)', () => {
    const inspections: any[] = [
      { grade: 'D', score: 0, violations: {}, criticalOverride: false },
    ];
    const s = computeStats(inspections);
    expect(s.averageScore).toBe('0.0');
  });

  test('averageScore is N/A when no numeric scores', () => {
    const inspections: any[] = [
      { grade: 'D', score: undefined, violations: {}, criticalOverride: false },
    ];
    const s = computeStats(inspections);
    expect(s.averageScore).toBe('N/A');
  });

  test('totalHighViolations sums correctly', () => {
    const inspections: any[] = [
      { grade: 'C', score: 60, violations: { high: 2 }, criticalOverride: false },
      { grade: 'D', score: 40, violations: { high: 1 }, criticalOverride: false },
      { grade: 'A', score: 95, violations: {}, criticalOverride: false },
    ];
    const s = computeStats(inspections);
    expect(s.totalHighViolations).toBe(3);
  });

  test('criticalOverrideCount counts truthy flags only', () => {
    const inspections: any[] = [
      { grade: 'C', score: 88, violations: {}, criticalOverride: true },
      { grade: 'B', score: 75, violations: {}, criticalOverride: false },
      { grade: 'C', score: 82, violations: {}, criticalOverride: true },
    ];
    const s = computeStats(inspections);
    expect(s.criticalOverrideCount).toBe(2);
  });

  test('lastUpdated is a recent timestamp', () => {
    const before = Date.now();
    const s = computeStats([]);
    const after = Date.now();
    expect(s.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(s.lastUpdated).toBeLessThanOrEqual(after);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// statusUtils
// ─────────────────────────────────────────────────────────────────────────────

describe('getStatusText', () => {
  test('compliant → مطابق', () => {
    expect(getStatusText('compliant')).toBe('مطابق');
  });

  test('non-compliant → غير مطابق', () => {
    expect(getStatusText('non-compliant')).toBe('غير مطابق');
  });

  test('na → غير معني', () => {
    expect(getStatusText('na')).toBe('غير معني');
  });

  test('partial → جزئي', () => {
    expect(getStatusText('partial')).toBe('جزئي');
  });

  test('unknown → لم يقيم', () => {
    expect(getStatusText('not-evaluated' as any)).toBe('لم يقيم');
  });
});

describe('getStatusColor', () => {
  test('returns a non-empty string for each status', () => {
    const statuses: Array<'compliant' | 'non-compliant' | 'na' | 'partial'> =
      ['compliant', 'non-compliant', 'na', 'partial'];
    statuses.forEach(s => {
      const color = getStatusColor(s);
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });

  test('na → #9e9e9e', () => {
    expect(getStatusColor('na')).toBe('#9e9e9e');
  });
});

describe('getComplianceSummary', () => {
  test('returns all zeros for empty array', () => {
    const s = getComplianceSummary([]);
    expect(s).toEqual({ total: 0, compliant: 0, nonCompliant: 0, na: 0, notEvaluated: 0 });
  });

  test('correctly categorises mixed items', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
      { complianceStatus: 'non-compliant' },
      { complianceStatus: 'na' },
      { complianceStatus: 'not-evaluated' },
    ];
    const s = getComplianceSummary(items);
    expect(s.total).toBe(5);
    expect(s.compliant).toBe(2);
    expect(s.nonCompliant).toBe(1);
    expect(s.na).toBe(1);
    expect(s.notEvaluated).toBe(1);
  });

  test('notEvaluated is derived (total - others)', () => {
    const items = Array.from({ length: 4 }, () => ({ complianceStatus: 'compliant' }));
    const s = getComplianceSummary(items);
    expect(s.notEvaluated).toBe(0);
    expect(s.total).toBe(4);
  });
});
