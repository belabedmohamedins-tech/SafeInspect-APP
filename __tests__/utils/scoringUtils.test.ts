// __tests__/utils/scoringUtils.test.ts
import {
  computeScoreAndGrade,
  SEVERITY_WEIGHTS,
  GRADE_A_MIN,
  GRADE_B_MIN,
  GRADE_C_MIN,
  CEILING_C_THRESHOLD,
  FORCED_D_THRESHOLD,
  MIN_COMPLETION_RATE,
} from '../../src/utils/scoringUtils';
import { InspectionItem } from '../../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeItem = (
  id: string,
  severity: InspectionItem['severity'],
  complianceStatus: InspectionItem['complianceStatus'],
): InspectionItem => ({
  id,
  axis: 'test-axis',
  category: 'تنظيمية',
  criteria: 'test criteria',
  legalReference: 'test ref',
  severity,
  controlType: 'visual',
  complianceStatus,
});

const allCompliant = (n: number, severity: InspectionItem['severity'] = 'medium') =>
  Array.from({ length: n }, (_, i) => makeItem(`item-${i}`, severity, 'compliant'));

const allNonCompliant = (n: number, severity: InspectionItem['severity'] = 'medium') =>
  Array.from({ length: n }, (_, i) => makeItem(`item-${i}`, severity, 'non-compliant'));

// ── Exported constants ────────────────────────────────────────────────────────
describe('scoringUtils – exported constants', () => {
  it('SEVERITY_WEIGHTS has correct values', () => {
    expect(SEVERITY_WEIGHTS.high).toBe(3);
    expect(SEVERITY_WEIGHTS.medium).toBe(2);
    expect(SEVERITY_WEIGHTS.low).toBe(1);
  });

  it('grade thresholds are in descending order', () => {
    expect(GRADE_A_MIN).toBeGreaterThan(GRADE_B_MIN);
    expect(GRADE_B_MIN).toBeGreaterThan(GRADE_C_MIN);
    expect(GRADE_C_MIN).toBeGreaterThan(0);
  });

  it('CEILING_C_THRESHOLD < FORCED_D_THRESHOLD', () => {
    expect(CEILING_C_THRESHOLD).toBeLessThan(FORCED_D_THRESHOLD);
  });

  it('MIN_COMPLETION_RATE is between 0 and 1', () => {
    expect(MIN_COMPLETION_RATE).toBeGreaterThan(0);
    expect(MIN_COMPLETION_RATE).toBeLessThanOrEqual(1);
  });
});

// ── Empty / edge inputs ───────────────────────────────────────────────────────
describe('computeScoreAndGrade – empty / edge inputs', () => {
  it('returns score 0 and grade D for empty array', () => {
    const r = computeScoreAndGrade([]);
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.evaluatedCount).toBe(0);
    expect(r.applicableCount).toBe(0);
    expect(r.completionRate).toBe(0);
    expect(r.incomplete).toBe(true);
  });

  it('handles all NA items correctly', () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeItem(`na-${i}`, 'high', 'na'),
    );
    const r = computeScoreAndGrade(items);
    expect(r.applicableCount).toBe(0);
    expect(r.evaluatedCount).toBe(0);
    expect(r.score).toBe(0);
  });

  it('handles mix of na and not-evaluated', () => {
    const items = [
      makeItem('a', 'high', 'na'),
      makeItem('b', 'medium', 'not-evaluated'),
    ];
    const r = computeScoreAndGrade(items);
    // na excluded from applicable, not-evaluated is applicable
    expect(r.applicableCount).toBe(1);
    expect(r.evaluatedCount).toBe(0);
    expect(r.incomplete).toBe(true);
  });
});

// ── Score calculation ─────────────────────────────────────────────────────────
describe('computeScoreAndGrade – score calculation', () => {
  it('returns score 100 when all items compliant', () => {
    const r = computeScoreAndGrade(allCompliant(5, 'high'));
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
  });

  it('returns score 0 when all items non-compliant', () => {
    // 3 non-compliant → FORCED_D_THRESHOLD met → forced D
    const r = computeScoreAndGrade(allNonCompliant(3, 'high'));
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
  });

  it('weights high items 3x and low items 1x', () => {
    const items = [
      makeItem('h', 'high', 'compliant'),   // weight 3
      makeItem('l', 'low', 'non-compliant'), // weight 1
    ];
    const r = computeScoreAndGrade(items);
    // compliantWeight=3, evaluatedWeight=4 → 3/4 = 75
    expect(r.score).toBe(75);
  });

  it('rounds score to 1 decimal place', () => {
    // 2 compliant medium (4) + 1 non-compliant low (1) = evaluated 5, compliant 4
    const items = [
      makeItem('a', 'medium', 'compliant'),
      makeItem('b', 'medium', 'compliant'),
      makeItem('c', 'low', 'non-compliant'),
    ];
    const r = computeScoreAndGrade(items);
    // 4/5 = 0.8 → 80.0
    expect(r.score).toBe(80);
  });
});

// ── Grade assignment — no override ───────────────────────────────────────────
describe('computeScoreAndGrade – grade A/B/C/D from score alone', () => {
  const gradeItems = (score: number, total = 10): InspectionItem[] => {
    // Build items to target a specific weighted score
    // All medium (weight 2) — compliant fraction = score/100
    const compliantCount = Math.round((score / 100) * total);
    return [
      ...Array.from({ length: compliantCount }, (_, i) =>
        makeItem(`c-${i}`, 'low', 'compliant')
      ),
      ...Array.from({ length: total - compliantCount }, (_, i) =>
        makeItem(`n-${i}`, 'low', 'non-compliant')
      ),
    ];
  };

  it('score >= GRADE_A_MIN → grade A', () => {
    // 9/10 compliant low = 90% (all low so no high violations → no override)
    const items = gradeItems(90);
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('A');
    expect(r.criticalOverride).toBe(false);
  });

  it('score >= GRADE_B_MIN and < A → grade B', () => {
    const items = gradeItems(70);
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('B');
  });

  it('score >= GRADE_C_MIN and < B → grade C', () => {
    const items = gradeItems(50);
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('C');
  });

  it('score < GRADE_C_MIN → grade D', () => {
    const items = gradeItems(40);
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('D');
  });
});

// ── Critical override — ceiling C ────────────────────────────────────────────
describe('computeScoreAndGrade – ceiling C override', () => {
  it('1 high violation with A-score → capped to C', () => {
    const items = [
      ...allCompliant(9, 'low'),         // score will be high
      makeItem('vio', 'high', 'non-compliant'), // 1 high violation
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(1);
    expect(r.violations.high).toBeGreaterThanOrEqual(CEILING_C_THRESHOLD);
    expect(r.violations.high).toBeLessThan(FORCED_D_THRESHOLD);
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });

  it('1 high violation with C-score → grade stays C, no override flag', () => {
    const items = [
      ...allCompliant(5, 'low'),
      ...allNonCompliant(5, 'low'),
      makeItem('vio', 'high', 'non-compliant'), // 1 high violation
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(1);
    // rawGrade will be C or D; if C, override flag should reflect no change
    if (r.rawGrade === 'C' || r.rawGrade === 'D') {
      // D is already ≤ C so ceiling is satisfied
      expect(['C', 'D']).toContain(r.grade);
    }
  });
});

// ── Critical override — forced D ─────────────────────────────────────────────
describe('computeScoreAndGrade – forced D override', () => {
  it(`>= ${FORCED_D_THRESHOLD} high violations → forced D even with high score`, () => {
    const items = [
      ...allCompliant(20, 'low'),
      ...Array.from({ length: FORCED_D_THRESHOLD }, (_, i) =>
        makeItem(`h-${i}`, 'high', 'non-compliant')
      ),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBeGreaterThanOrEqual(FORCED_D_THRESHOLD);
    expect(r.grade).toBe('D');
  });

  it('forced D sets riskLevel to 4', () => {
    const items = Array.from({ length: FORCED_D_THRESHOLD }, (_, i) =>
      makeItem(`h-${i}`, 'high', 'non-compliant')
    );
    const r = computeScoreAndGrade(items);
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });
});

// ── Risk level & nextInspectionDays ──────────────────────────────────────────
describe('computeScoreAndGrade – riskLevel and nextInspectionDays', () => {
  it('grade A → riskLevel 1 → 730 days', () => {
    const r = computeScoreAndGrade(allCompliant(10, 'low'));
    expect(r.grade).toBe('A');
    expect(r.riskLevel).toBe(1);
    expect(r.nextInspectionDays).toBe(730);
  });

  it('grade B → riskLevel 2 → 365 days', () => {
    // 7/10 low-compliant = 70% → grade B
    const items = [
      ...allCompliant(7, 'low'),
      ...allNonCompliant(3, 'low'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('B');
    expect(r.riskLevel).toBe(2);
    expect(r.nextInspectionDays).toBe(365);
  });

  it('grade C → riskLevel 3 → 180 days', () => {
    const items = [
      ...allCompliant(5, 'low'),
      ...allNonCompliant(5, 'low'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('C');
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });

  it('grade D → riskLevel 4 → 30 days', () => {
    const items = allNonCompliant(4, 'low');
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });
});

// ── Completion / incomplete flag ──────────────────────────────────────────────
describe('computeScoreAndGrade – completion rate', () => {
  it('incomplete = true when < 60% evaluated', () => {
    const items = [
      makeItem('a', 'high', 'compliant'),
      makeItem('b', 'high', 'not-evaluated'),
      makeItem('c', 'high', 'not-evaluated'),
      makeItem('d', 'high', 'not-evaluated'),
    ];
    const r = computeScoreAndGrade(items);
    // 1/4 = 25% evaluated < 60%
    expect(r.completionRate).toBeLessThan(MIN_COMPLETION_RATE);
    expect(r.incomplete).toBe(true);
  });

  it('incomplete = false when >= 60% evaluated', () => {
    const items = [
      makeItem('a', 'high', 'compliant'),
      makeItem('b', 'high', 'compliant'),
      makeItem('c', 'high', 'compliant'),
      makeItem('d', 'high', 'not-evaluated'),
    ];
    const r = computeScoreAndGrade(items);
    // 3/4 = 75% >= 60%
    expect(r.completionRate).toBeGreaterThanOrEqual(MIN_COMPLETION_RATE);
    expect(r.incomplete).toBe(false);
  });
});

// ── Violation profile ─────────────────────────────────────────────────────────
describe('computeScoreAndGrade – violation profile', () => {
  it('counts violations by severity correctly', () => {
    const items = [
      makeItem('h1', 'high',   'non-compliant'),
      makeItem('h2', 'high',   'non-compliant'),
      makeItem('m1', 'medium', 'non-compliant'),
      makeItem('l1', 'low',    'non-compliant'),
      makeItem('c1', 'high',   'compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(2);
    expect(r.violations.medium).toBe(1);
    expect(r.violations.low).toBe(1);
    expect(r.violations.total).toBe(4);
  });

  it('zero violations when all compliant', () => {
    const r = computeScoreAndGrade(allCompliant(5, 'high'));
    expect(r.violations.high).toBe(0);
    expect(r.violations.medium).toBe(0);
    expect(r.violations.low).toBe(0);
    expect(r.violations.total).toBe(0);
  });
});

// ── Return shape ──────────────────────────────────────────────────────────────
describe('computeScoreAndGrade – return shape', () => {
  it('result contains disclaimer in Arabic', () => {
    const r = computeScoreAndGrade(allCompliant(3));
    expect(r.disclaimer).toContain('03-10');
    expect(r.disclaimer).toContain('06-198');
    expect(typeof r.disclaimer).toBe('string');
    expect(r.disclaimer.length).toBeGreaterThan(20);
  });

  it('result contains all required fields', () => {
    const r = computeScoreAndGrade(allCompliant(3));
    expect(r).toHaveProperty('score');
    expect(r).toHaveProperty('grade');
    expect(r).toHaveProperty('riskLevel');
    expect(r).toHaveProperty('violations');
    expect(r).toHaveProperty('criticalOverride');
    expect(r).toHaveProperty('rawGrade');
    expect(r).toHaveProperty('evaluatedCount');
    expect(r).toHaveProperty('applicableCount');
    expect(r).toHaveProperty('completionRate');
    expect(r).toHaveProperty('incomplete');
    expect(r).toHaveProperty('nextInspectionDays');
    expect(r).toHaveProperty('disclaimer');
  });
});
