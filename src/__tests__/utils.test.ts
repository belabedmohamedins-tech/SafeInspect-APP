// src/__tests__/utils.test.ts
// L4 — domain-specific mocks only
//
// Covers all pure utility modules in src/utils/:
//   dateUtils       — formatDateLong, formatDateTimeShort, formatDateOnly,
//                      formatDateForAgenda, formatDateForCard
//   fileUtils       — generateFileName
//   groupViolations — groupViolationsByRepeat, formatViolationGroupSummary
//   inspectionUtils — getEvaluatedCount, getProgressPercent,
//                      groupByAxisRaw, groupByAxis, getAxisProgress
//   numericUtils    — deriveNumericCompliance, numericStateToComplianceStatus
//   scoringUtils    — computeScoreAndGrade (all grade/override branches)
//   statsUtils      — computeStats
//   statusUtils     — getStatusText, getStatusColor, getComplianceSummary

// statusUtils imports Colors from constants — mock at L4
jest.mock('../../constants', () => ({
  Colors: {
    compliant:    '#4caf50',
    nonCompliant: '#f44336',
    warning:      '#ff9800',
  },
}));

import {
  formatDateLong,
  formatDateTimeShort,
  formatDateOnly,
  formatDateForAgenda,
  formatDateForCard,
} from '../../src/utils/dateUtils';

import { generateFileName } from '../../src/utils/fileUtils';

import {
  groupViolationsByRepeat,
  formatViolationGroupSummary,
} from '../../src/utils/groupViolations';

import {
  getEvaluatedCount,
  getProgressPercent,
  groupByAxisRaw,
  groupByAxis,
  getAxisProgress,
} from '../../src/utils/inspectionUtils';

import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
} from '../../src/utils/numericUtils';

import {
  computeScoreAndGrade,
  GRADE_A_MIN,
  GRADE_B_MIN,
  GRADE_C_MIN,
  FORCED_D_THRESHOLD,
  CEILING_C_THRESHOLD,
  MIN_COMPLETION_RATE,
} from '../../src/utils/scoringUtils';

import { computeStats } from '../../src/utils/statsUtils';

import {
  getStatusText,
  getStatusColor,
  getComplianceSummary,
} from '../../src/utils/statusUtils';

import { InspectionItem, NumericFieldSpec, SavedInspection } from '../../src/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeItem(
  id: string,
  status: 'compliant' | 'non-compliant' | 'na' | 'not-evaluated',
  severity: 'high' | 'medium' | 'low' = 'low',
  axis?: string,
  isRepeatViolation?: boolean,
): InspectionItem {
  return { id, complianceStatus: status, severity, axis, isRepeatViolation } as InspectionItem;
}

function makeInspection(
  overrides: Partial<SavedInspection> = {},
): SavedInspection {
  return {
    id: 'ins1',
    grade: 'A',
    score: 90,
    violations: { high: 0, medium: 0, low: 0, total: 0 },
    criticalOverride: false,
    items: [],
    ...overrides,
  } as unknown as SavedInspection;
}

// ─── dateUtils ──────────────────────────────────────────────────────────────
// Note: locale-dependent output is not hardcoded — we verify structure/type
// to stay CI-timezone-safe (per TESTING.md advice).

describe('dateUtils', () => {
  const iso = '2026-03-15T14:30:00.000Z';

  it('formatDateLong returns a non-empty string', () => {
    expect(typeof formatDateLong(iso)).toBe('string');
    expect(formatDateLong(iso).length).toBeGreaterThan(0);
  });

  it('formatDateTimeShort returns YYYY-MM-DD HH:MM format', () => {
    // Build expected dynamically from the same Date object
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const expected = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    expect(formatDateTimeShort(iso)).toBe(expected);
  });

  it('formatDateOnly returns a non-empty string', () => {
    expect(typeof formatDateOnly(iso)).toBe('string');
    expect(formatDateOnly(iso).length).toBeGreaterThan(0);
  });

  it('formatDateForAgenda returns a non-empty string', () => {
    expect(typeof formatDateForAgenda(iso)).toBe('string');
    expect(formatDateForAgenda(iso).length).toBeGreaterThan(0);
  });

  it('formatDateForCard delegates to formatDateTimeShort', () => {
    expect(formatDateForCard(iso)).toBe(formatDateTimeShort(iso));
  });
});

// ─── fileUtils ───────────────────────────────────────────────────────────────

describe('fileUtils — generateFileName', () => {
  it('returns string ending with the given extension', () => {
    const name = generateFileName('Facility Name', 'pdf');
    expect(name.endsWith('.pdf')).toBe(true);
  });

  it('strips illegal characters from baseName', () => {
    const name = generateFileName('Test!@#$%^&*()', 'csv');
    // Should not contain any special chars except underscore and hyphen
    expect(name).toMatch(/^[\u0600-\u06FF\w\s_\-\.]+$/);
  });

  it('replaces spaces with underscores in base', () => {
    const name = generateFileName('My Facility', 'pdf');
    expect(name).toContain('My_Facility');
  });

  it('includes date segment YYYY-MM-DD', () => {
    const name = generateFileName('test', 'pdf');
    expect(name).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('includes time segment HH-MM', () => {
    const name = generateFileName('test', 'pdf');
    expect(name).toMatch(/_\d{2}-\d{2}\./);
  });

  it('handles Arabic baseName without stripping', () => {
    const name = generateFileName('\u0645نشأة التصريد', 'pdf');
    expect(name).toContain('\u0645نشأة');
  });
});

// ─── groupViolations ────────────────────────────────────────────────────────

describe('groupViolationsByRepeat', () => {
  it('separates first-time from repeat violations', () => {
    const items = [
      makeItem('c1', 'non-compliant', 'low', undefined, false),
      makeItem('c2', 'non-compliant', 'low', undefined, true),
      makeItem('c3', 'compliant'),
      makeItem('c4', 'non-compliant', 'low', undefined, true),
    ];
    const { firstTime, repeat } = groupViolationsByRepeat(items);
    expect(firstTime).toHaveLength(1);
    expect(firstTime[0].id).toBe('c1');
    expect(repeat).toHaveLength(2);
  });

  it('returns empty arrays when no violations', () => {
    const { firstTime, repeat } = groupViolationsByRepeat([
      makeItem('c1', 'compliant'),
      makeItem('c2', 'na'),
    ]);
    expect(firstTime).toHaveLength(0);
    expect(repeat).toHaveLength(0);
  });

  it('handles undefined isRepeatViolation as first-time', () => {
    const items = [makeItem('c1', 'non-compliant')];
    const { firstTime, repeat } = groupViolationsByRepeat(items);
    expect(firstTime).toHaveLength(1);
    expect(repeat).toHaveLength(0);
  });
});

describe('formatViolationGroupSummary', () => {
  it('returns no-violations message when both empty', () => {
    expect(formatViolationGroupSummary({ firstTime: [], repeat: [] })).toBe('\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062e\u0627\u0644\u0641\u0627\u062a');
  });

  it('shows first-time only when no repeats', () => {
    const result = formatViolationGroupSummary({
      firstTime: [makeItem('c1', 'non-compliant'), makeItem('c2', 'non-compliant')],
      repeat: [],
    });
    expect(result).toContain('2');
    expect(result).toContain('\u0644\u0623\u0648\u0644 \u0645\u0631\u0629');
  });

  it('shows repeat only when no first-time', () => {
    const result = formatViolationGroupSummary({
      firstTime: [],
      repeat: [makeItem('c1', 'non-compliant', 'low', undefined, true)],
    });
    expect(result).toContain('\u0645\u062a\u0643\u0631\u0631');
  });

  it('uses plural متكررة when repeat count > 1', () => {
    const repeat = [
      makeItem('c1', 'non-compliant', 'low', undefined, true),
      makeItem('c2', 'non-compliant', 'low', undefined, true),
    ];
    const result = formatViolationGroupSummary({ firstTime: [], repeat });
    expect(result).toContain('\u0645\u062a\u0643\u0631\u0631\u0629');
  });

  it('shows both parts when both groups have items', () => {
    const result = formatViolationGroupSummary({
      firstTime: [makeItem('c1', 'non-compliant')],
      repeat: [makeItem('c2', 'non-compliant', 'low', undefined, true)],
    });
    expect(result).toContain('\u0644\u0623\u0648\u0644 \u0645\u0631\u0629');
    expect(result).toContain('\u0645\u062a\u0643\u0631\u0631');
  });
});

// ─── inspectionUtils ────────────────────────────────────────────────────────

describe('inspectionUtils', () => {
  const items = [
    makeItem('c1', 'compliant',     'low',  'Axis A'),
    makeItem('c2', 'non-compliant', 'high', 'Axis A'),
    makeItem('c3', 'not-evaluated', 'low',  'Axis B'),
    makeItem('c4', 'na',            'low',  'Axis B'),
    makeItem('c5', 'compliant',     'low'),  // no axis → 'أخرى'
  ];

  it('getEvaluatedCount excludes not-evaluated', () => {
    expect(getEvaluatedCount(items)).toBe(4); // c1,c2,c4,c5
  });

  it('getProgressPercent returns correct percentage', () => {
    expect(getProgressPercent(items)).toBeCloseTo(80);
  });

  it('getProgressPercent returns 0 on empty array', () => {
    expect(getProgressPercent([])).toBe(0);
  });

  it('groupByAxisRaw groups items by axis', () => {
    const groups = groupByAxisRaw(items);
    const axisA = groups.find(([title]) => title === 'Axis A');
    const axisB = groups.find(([title]) => title === 'Axis B');
    expect(axisA?.[1]).toHaveLength(2);
    expect(axisB?.[1]).toHaveLength(2);
  });

  it('groupByAxisRaw uses أخرى when axis is undefined', () => {
    const groups = groupByAxisRaw(items);
    const other = groups.find(([title]) => title === '\u0623\u062e\u0631\u0649');
    expect(other?.[1]).toHaveLength(1);
  });

  it('groupByAxis returns { title, data } shape', () => {
    const groups = groupByAxis(items);
    expect(groups[0]).toHaveProperty('title');
    expect(groups[0]).toHaveProperty('data');
  });

  it('getAxisProgress returns total and evaluated counts', () => {
    const progress = getAxisProgress(items);
    const axisA = progress.find(g => g.title === 'Axis A');
    expect(axisA?.total).toBe(2);
    expect(axisA?.evaluated).toBe(2); // both are compliant/non-compliant
    const axisB = progress.find(g => g.title === 'Axis B');
    expect(axisB?.total).toBe(2);
    expect(axisB?.evaluated).toBe(1); // c3=not-evaluated is excluded
  });
});

// ─── numericUtils ───────────────────────────────────────────────────────────

describe('deriveNumericCompliance', () => {
  const spec: NumericFieldSpec = { min: 10, max: 30, warningMin: 5, warningMax: 35 };

  it('returns not-measured for undefined value', () => {
    expect(deriveNumericCompliance(undefined, spec)).toBe('not-measured');
  });

  it('returns not-measured for null', () => {
    expect(deriveNumericCompliance(null as any, spec)).toBe('not-measured');
  });

  it('returns not-measured for NaN', () => {
    expect(deriveNumericCompliance(NaN, spec)).toBe('not-measured');
  });

  it('returns compliant when value is within [min, max]', () => {
    expect(deriveNumericCompliance(20, spec)).toBe('compliant');
  });

  it('returns compliant at boundary (min)', () => {
    expect(deriveNumericCompliance(10, spec)).toBe('compliant');
  });

  it('returns compliant at boundary (max)', () => {
    expect(deriveNumericCompliance(30, spec)).toBe('compliant');
  });

  it('returns warning when outside [min,max] but inside warning zone', () => {
    expect(deriveNumericCompliance(7, spec)).toBe('warning');
    expect(deriveNumericCompliance(33, spec)).toBe('warning');
  });

  it('returns non-compliant when outside all zones', () => {
    expect(deriveNumericCompliance(1, spec)).toBe('non-compliant');
    expect(deriveNumericCompliance(99, spec)).toBe('non-compliant');
  });

  it('handles spec with no min/max (open bounds)', () => {
    const openSpec: NumericFieldSpec = { warningMin: undefined, warningMax: undefined };
    expect(deriveNumericCompliance(50, openSpec)).toBe('compliant');
  });
});

describe('numericStateToComplianceStatus', () => {
  it('compliant → compliant', () => {
    expect(numericStateToComplianceStatus('compliant')).toBe('compliant');
  });
  it('warning → observation-only', () => {
    expect(numericStateToComplianceStatus('warning')).toBe('observation-only');
  });
  it('non-compliant → non-compliant', () => {
    expect(numericStateToComplianceStatus('non-compliant')).toBe('non-compliant');
  });
  it('not-measured → undefined', () => {
    expect(numericStateToComplianceStatus('not-measured')).toBeUndefined();
  });
});

// ─── scoringUtils ────────────────────────────────────────────────────────────

describe('computeScoreAndGrade', () => {
  // Helper: build N items all of given status+severity
  function items(
    compliantCount: number,
    nonCompliantCount: number,
    severity: 'high' | 'medium' | 'low' = 'low',
  ): InspectionItem[] {
    const arr: InspectionItem[] = [];
    for (let i = 0; i < compliantCount; i++)
      arr.push(makeItem(`c${i}`, 'compliant', severity));
    for (let i = 0; i < nonCompliantCount; i++)
      arr.push(makeItem(`nc${i}`, 'non-compliant', severity));
    return arr;
  }

  it('all compliant low-severity → score=100, grade=A', () => {
    const r = computeScoreAndGrade(items(5, 0));
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.criticalOverride).toBe(false);
  });

  it('all non-compliant → score=0, grade=D', () => {
    const r = computeScoreAndGrade(items(0, 5));
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
  });

  it('grade B range (score in [GRADE_B_MIN, GRADE_A_MIN))', () => {
    // 7 compliant, 3 non-compliant, all low: score = 70
    const r = computeScoreAndGrade(items(7, 3));
    expect(r.score).toBeGreaterThanOrEqual(GRADE_B_MIN);
    expect(r.score).toBeLessThan(GRADE_A_MIN);
    expect(r.grade).toBe('B');
  });

  it('grade C range (score in [GRADE_C_MIN, GRADE_B_MIN))', () => {
    // 5 compliant, 5 non-compliant: score = 50
    const r = computeScoreAndGrade(items(5, 5));
    expect(r.grade).toBe('C');
  });

  it('forced D override when high violations >= FORCED_D_THRESHOLD', () => {
    // 9 compliant low + FORCED_D_THRESHOLD non-compliant high → raw grade A, forced D
    const arr = [
      ...items(9, 0, 'low'),
      ...items(0, FORCED_D_THRESHOLD, 'high'),
    ];
    const r = computeScoreAndGrade(arr);
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(true);
    expect(r.violations.high).toBe(FORCED_D_THRESHOLD);
  });

  it('ceiling C override when high violations in [CEILING_C, FORCED_D) and rawGrade would be A', () => {
    // many compliant low + exactly CEILING_C_THRESHOLD non-compliant high
    const arr = [
      ...items(20, 0, 'low'),
      ...items(0, CEILING_C_THRESHOLD, 'high'),
    ];
    const r = computeScoreAndGrade(arr);
    expect(r.rawGrade === 'A' || r.rawGrade === 'B').toBe(true);
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });

  it('no override when high violations = 0', () => {
    const r = computeScoreAndGrade(items(10, 0));
    expect(r.criticalOverride).toBe(false);
    expect(r.grade).toBe(r.rawGrade);
  });

  it('incomplete flag when evaluatedCount / applicable < MIN_COMPLETION_RATE', () => {
    // 1 evaluated + 10 not-evaluated → rate = 1/11 < 0.60
    const arr = [
      makeItem('c1', 'compliant', 'low'),
      ...Array.from({ length: 10 }, (_, i) => makeItem(`ne${i}`, 'not-evaluated')),
    ];
    const r = computeScoreAndGrade(arr);
    expect(r.incomplete).toBe(true);
    expect(r.completionRate).toBeLessThan(MIN_COMPLETION_RATE);
  });

  it('empty items → score=0, grade=D, incomplete=true', () => {
    const r = computeScoreAndGrade([]);
    expect(r.score).toBe(0);
    expect(r.incomplete).toBe(true);
  });

  it('riskLevel 1 → nextInspectionDays=730 (grade A)', () => {
    const r = computeScoreAndGrade(items(10, 0));
    expect(r.riskLevel).toBe(1);
    expect(r.nextInspectionDays).toBe(730);
  });

  it('riskLevel 2 → nextInspectionDays=365 (grade B)', () => {
    const r = computeScoreAndGrade(items(7, 3));
    expect(r.riskLevel).toBe(2);
    expect(r.nextInspectionDays).toBe(365);
  });

  it('riskLevel 3 → nextInspectionDays=180 (grade C)', () => {
    const r = computeScoreAndGrade(items(5, 5));
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });

  it('riskLevel 4 → nextInspectionDays=30 (grade D)', () => {
    const r = computeScoreAndGrade(items(0, 5));
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });

  it('severity weights affect score — high violations hurt more than low', () => {
    const allHighNc  = computeScoreAndGrade(items(5, 5, 'high'));
    const allLowNc   = computeScoreAndGrade(items(5, 5, 'low'));
    // Same counts but different severity — with all same severity, scores are equal
    // Verify weighting: 5 high compliant vs 5 high nc = 50%, 5 low compliant vs 5 low nc = 50%
    // Mixed: 5 high compliant + 5 low non-compliant < 5 high non-compliant + 5 low compliant
    const mixedA = computeScoreAndGrade([
      ...items(5, 0, 'high'), // 5 compliant high = weight 15
      ...items(0, 5, 'low'),  // 5 nc low = weight 5 (total 20, compliant 15) = 75%
    ]);
    const mixedB = computeScoreAndGrade([
      ...items(0, 5, 'high'), // 5 nc high = weight 15
      ...items(5, 0, 'low'),  // 5 compliant low = weight 5 (total 20, compliant 5) = 25%
    ]);
    expect(mixedA.score).toBeGreaterThan(mixedB.score);
  });

  it('disclaimer is non-empty string', () => {
    const r = computeScoreAndGrade(items(5, 0));
    expect(typeof r.disclaimer).toBe('string');
    expect(r.disclaimer.length).toBeGreaterThan(0);
  });

  it('criticalOverride false when high=FORCED_D but rawGrade already D', () => {
    // All items are high non-compliant → score=0 → rawGrade=D → forced D but no *change*
    const arr = items(0, FORCED_D_THRESHOLD, 'high');
    const r = computeScoreAndGrade(arr);
    expect(r.grade).toBe('D');
    // criticalOverride = (grade !== rawGrade) = false because both are D
    expect(r.criticalOverride).toBe(false);
  });
});

// ─── statsUtils ─────────────────────────────────────────────────────────────

describe('computeStats', () => {
  it('empty array returns zeroed stats with N/A averageScore', () => {
    const s = computeStats([]);
    expect(s.total).toBe(0);
    expect(s.averageScore).toBe('N/A');
    expect(s.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
    expect(s.totalHighViolations).toBe(0);
    expect(s.criticalOverrideCount).toBe(0);
  });

  it('counts grades correctly', () => {
    const s = computeStats([
      makeInspection({ grade: 'A' as any }),
      makeInspection({ grade: 'A' as any }),
      makeInspection({ grade: 'B' as any }),
      makeInspection({ grade: 'C' as any }),
      makeInspection({ grade: 'D' as any }),
    ]);
    expect(s.gradeCounts).toEqual({ A: 2, B: 1, C: 1, D: 1 });
    expect(s.total).toBe(5);
  });

  it('computes averageScore as string with 1 decimal', () => {
    const s = computeStats([
      makeInspection({ score: 80 }),
      makeInspection({ score: 90 }),
    ]);
    expect(s.averageScore).toBe('85.0');
  });

  it('averageScore is 0.0 when all scores are 0', () => {
    const s = computeStats([makeInspection({ score: 0 })]);
    expect(s.averageScore).toBe('0.0');
  });

  it('averageScore is N/A when score is not a number', () => {
    const s = computeStats([makeInspection({ score: undefined as any })]);
    expect(s.averageScore).toBe('N/A');
  });

  it('accumulates totalHighViolations', () => {
    const s = computeStats([
      makeInspection({ violations: { high: 2, medium: 0, low: 0, total: 2 } as any }),
      makeInspection({ violations: { high: 3, medium: 0, low: 0, total: 3 } as any }),
    ]);
    expect(s.totalHighViolations).toBe(5);
  });

  it('counts criticalOverride inspections', () => {
    const s = computeStats([
      makeInspection({ criticalOverride: true }),
      makeInspection({ criticalOverride: false }),
      makeInspection({ criticalOverride: true }),
    ]);
    expect(s.criticalOverrideCount).toBe(2);
  });

  it('lastUpdated is a recent timestamp', () => {
    const before = Date.now();
    const s = computeStats([]);
    const after  = Date.now();
    expect(s.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(s.lastUpdated).toBeLessThanOrEqual(after);
  });
});

// ─── statusUtils ────────────────────────────────────────────────────────────

describe('getStatusText', () => {
  it('compliant → مطابق', () => expect(getStatusText('compliant')).toBe('\u0645\u0637\u0627\u0628\u0642'));
  it('non-compliant → غير مطابق', () => expect(getStatusText('non-compliant')).toBe('\u063a\u064a\u0631 \u0645\u0637\u0627\u0628\u0642'));
  it('na → غير معني', () => expect(getStatusText('na')).toBe('\u063a\u064a\u0631 \u0645\u0639\u0646\u064a'));
  it('partial → جزئي', () => expect(getStatusText('partial')).toBe('\u062c\u0632\u0626\u064a'));
  it('default (not-evaluated) → لم يقيم', () => expect(getStatusText('not-evaluated' as any)).toBe('\u0644\u0645 \u064a\u0642\u064a\u0645'));
});

describe('getStatusColor', () => {
  it('compliant → Colors.compliant', () => expect(getStatusColor('compliant')).toBe('#4caf50'));
  it('non-compliant → Colors.nonCompliant', () => expect(getStatusColor('non-compliant')).toBe('#f44336'));
  it('na → #9e9e9e', () => expect(getStatusColor('na')).toBe('#9e9e9e'));
  it('default → Colors.warning', () => expect(getStatusColor('not-evaluated' as any)).toBe('#ff9800'));
});

describe('getComplianceSummary', () => {
  it('returns correct counts', () => {
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

  it('empty array returns all zeros', () => {
    const s = getComplianceSummary([]);
    expect(s).toEqual({ total: 0, compliant: 0, nonCompliant: 0, na: 0, notEvaluated: 0 });
  });
});
