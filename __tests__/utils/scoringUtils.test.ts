// __tests__/utils/scoringUtils.test.ts
import {
  computeScoreAndGrade,
  SEVERITY_WEIGHTS,
  GRADE_A_MIN, GRADE_B_MIN, GRADE_C_MIN,
  CEILING_C_THRESHOLD, FORCED_D_THRESHOLD,
  MIN_COMPLETION_RATE,
} from '../../src/utils/scoringUtils';
import { InspectionItem, Severity } from '../../src/types';

function item(
  id: string,
  status: 'compliant' | 'non-compliant' | 'na',
  severity: Severity = 'low',
): InspectionItem {
  return { id, complianceStatus: status, severity } as InspectionItem;
}

describe('constants exported', () => {
  it('SEVERITY_WEIGHTS', () => {
    expect(SEVERITY_WEIGHTS.high).toBe(3);
    expect(SEVERITY_WEIGHTS.medium).toBe(2);
    expect(SEVERITY_WEIGHTS.low).toBe(1);
  });
  it('grade thresholds', () => {
    expect(GRADE_A_MIN).toBe(85);
    expect(GRADE_B_MIN).toBe(70);
    expect(GRADE_C_MIN).toBe(50);
  });
  it('critical thresholds', () => {
    expect(CEILING_C_THRESHOLD).toBe(1);
    expect(FORCED_D_THRESHOLD).toBe(3);
  });
  it('MIN_COMPLETION_RATE', () => expect(MIN_COMPLETION_RATE).toBe(0.6));
});

describe('computeScoreAndGrade — perfect compliance', () => {
  it('all compliant → score 100, grade A', () => {
    const r = computeScoreAndGrade([item('a', 'compliant', 'low'), item('b', 'compliant', 'low')]);
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.riskLevel).toBe(1);
    expect(r.nextInspectionDays).toBe(730);
    expect(r.criticalOverride).toBe(false);
    expect(r.incomplete).toBe(false);
  });
});

describe('computeScoreAndGrade — score-based grades', () => {
  it('75% → grade B, riskLevel 2, 365 days', () => {
    // 3 compliant low (3pts) vs 1 non-compliant low (1pt) → 3/4 = 75%
    const items = [
      item('a', 'compliant', 'low'), item('b', 'compliant', 'low'),
      item('c', 'compliant', 'low'), item('d', 'non-compliant', 'low'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(75);
    expect(r.grade).toBe('B');
    expect(r.riskLevel).toBe(2);
    expect(r.nextInspectionDays).toBe(365);
  });

  it('50% → grade C, riskLevel 3, 180 days', () => {
    // 1 compliant low (1pt) vs 1 non-compliant low (1pt) → 50%
    const items = [item('a', 'compliant', 'low'), item('b', 'non-compliant', 'low')];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(50);
    expect(r.grade).toBe('C');
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });

  it('20% → grade D, riskLevel 4, 30 days', () => {
    // 1 compliant low (1pt) vs 4 non-compliant low (4pts) → 1/5 = 20%
    const items = [
      item('a', 'compliant', 'low'),
      item('b', 'non-compliant', 'low'), item('c', 'non-compliant', 'low'),
      item('d', 'non-compliant', 'low'), item('e', 'non-compliant', 'low'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(20);
    expect(r.grade).toBe('D');
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });
});

describe('computeScoreAndGrade — critical override', () => {
  it('forced D: 3 high violations overrides B raw grade', () => {
    // 10 compliant high (30pts) vs 3 non-compliant high (9pts) → 30/39 = 76.9% = rawGrade B → forced D
    const items = [
      item('1', 'compliant', 'high'), item('2', 'compliant', 'high'),
      item('3', 'compliant', 'high'), item('4', 'compliant', 'high'),
      item('5', 'compliant', 'high'), item('6', 'compliant', 'high'),
      item('7', 'compliant', 'high'), item('8', 'compliant', 'high'),
      item('9', 'compliant', 'high'), item('10', 'compliant', 'high'),
      item('x', 'non-compliant', 'high'),
      item('y', 'non-compliant', 'high'),
      item('z', 'non-compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(3);
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(true);
    expect(r.riskLevel).toBe(4);
  });

  it('ceiling C: 1 high violation caps A raw grade to C', () => {
    // 9 compliant high (27pts) vs 1 non-compliant high (3pts) → 27/30 = 90% = rawGrade A → capped C
    const items = [
      item('1', 'compliant', 'high'), item('2', 'compliant', 'high'),
      item('3', 'compliant', 'high'), item('4', 'compliant', 'high'),
      item('5', 'compliant', 'high'), item('6', 'compliant', 'high'),
      item('7', 'compliant', 'high'), item('8', 'compliant', 'high'),
      item('9', 'compliant', 'high'),
      item('x', 'non-compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(1);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });

  it('ceiling C caps B raw grade to C', () => {
    // 3 compliant high (9pts) vs 1 non-compliant high (3pts) → 9/12 = 75% = rawGrade B → capped C
    const items = [
      item('1', 'compliant', 'high'), item('2', 'compliant', 'high'),
      item('3', 'compliant', 'high'),
      item('x', 'non-compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('B');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });

  it('ceiling C is no-op when raw grade already C', () => {
    // Need: 1 high violation + rawGrade C (50-69%)
    // 1 compliant high (3pts) + 1 non-compliant medium (2pts) + 1 non-compliant high (3pts)
    // total evaluated weight = 3+2+3=8, compliant weight=3 → 3/8=37.5% → rawGrade D, not C
    // Better: use 2 compliant low (2pts) vs 1 non-compliant low (1pt) + 1 non-compliant high (3pts)
    // compliant=2, total=2+1+3=6 → score=33% → D
    // Need 50-69%: 1 compliant high(3) vs 1 non-compliant low(1) + 1 non-compliant high(3)
    // compliant=3, total=3+1+3=7 → score=42.8% → D
    // 3 compliant low (3) vs 1 non-compliant low (1) + 1 non-compliant high (3)
    // compliant=3, total=3+1+3=7 → 42.8% → D
    // 5 compliant low (5) vs 1 non-compliant low + 1 non-compliant high (4pts)
    // compliant=5, total=9 → 55.5% → C ✔ and 1 high violation → ceiling applies but C is already C
    const items = [
      item('1', 'compliant', 'low'), item('2', 'compliant', 'low'),
      item('3', 'compliant', 'low'), item('4', 'compliant', 'low'),
      item('5', 'compliant', 'low'),
      item('x', 'non-compliant', 'low'),
      item('y', 'non-compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('C');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(false);
  });

  it('ceiling C is no-op when raw grade is D', () => {
    // 1 non-compliant high + all others non-compliant low → score 0% → D, 1 high violation, ceiling no-op
    const items = [
      item('a', 'non-compliant', 'low'),
      item('b', 'non-compliant', 'low'),
      item('x', 'non-compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });
});

describe('computeScoreAndGrade — na & empty', () => {
  it('na items excluded from score', () => {
    const items = [item('a', 'compliant', 'low'), item('b', 'na', 'low')];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(100);
    expect(r.evaluatedCount).toBe(1);
  });

  it('empty items → score 0, incomplete true', () => {
    const r = computeScoreAndGrade([]);
    expect(r.score).toBe(0);
    expect(r.incomplete).toBe(true);
  });
});

describe('computeScoreAndGrade — violation profile', () => {
  it('counts by severity', () => {
    const items = [
      item('a', 'non-compliant', 'high'), item('b', 'non-compliant', 'high'),
      item('c', 'non-compliant', 'medium'),
      item('d', 'non-compliant', 'low'),
      item('e', 'compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations).toEqual({ high: 2, medium: 1, low: 1, total: 4 });
  });
});

describe('computeScoreAndGrade — disclaimer', () => {
  it('includes Arabic legal disclaimer with law reference', () => {
    const r = computeScoreAndGrade([item('a', 'compliant', 'low')]);
    expect(r.disclaimer).toContain('03-10');
    expect(r.disclaimer.length).toBeGreaterThan(50);
  });
});
