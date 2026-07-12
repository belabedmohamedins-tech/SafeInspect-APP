// __tests__/utils/scoringUtils.test.ts
import {
  computeScoreAndGrade,
  GRADE_A_MIN,
  GRADE_B_MIN,
  GRADE_C_MIN,
  CEILING_C_THRESHOLD,
  FORCED_D_THRESHOLD,
  MIN_COMPLETION_RATE,
  SEVERITY_WEIGHTS,
} from '../../src/utils/scoringUtils';
import { InspectionItem } from '../../src/types';

function item(
  id: string,
  severity: 'high' | 'medium' | 'low',
  status: 'compliant' | 'non-compliant' | 'na',
): InspectionItem {
  return { id, severity, complianceStatus: status, criteria: id } as InspectionItem;
}

describe('exported constants', () => {
  it('SEVERITY_WEIGHTS are correct', () => {
    expect(SEVERITY_WEIGHTS.high).toBe(3);
    expect(SEVERITY_WEIGHTS.medium).toBe(2);
    expect(SEVERITY_WEIGHTS.low).toBe(1);
  });

  it('grade thresholds', () => {
    expect(GRADE_A_MIN).toBe(85);
    expect(GRADE_B_MIN).toBe(70);
    expect(GRADE_C_MIN).toBe(50);
  });

  it('override thresholds', () => {
    expect(CEILING_C_THRESHOLD).toBe(1);
    expect(FORCED_D_THRESHOLD).toBe(3);
  });

  it('MIN_COMPLETION_RATE', () => {
    expect(MIN_COMPLETION_RATE).toBe(0.60);
  });
});

describe('computeScoreAndGrade — basic scoring', () => {
  it('all compliant → score 100, grade A', () => {
    const items = [
      item('a', 'high', 'compliant'),
      item('b', 'medium', 'compliant'),
      item('c', 'low', 'compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.rawGrade).toBe('A');
    expect(r.criticalOverride).toBe(false);
    expect(r.riskLevel).toBe(1);
    expect(r.nextInspectionDays).toBe(730);
    expect(r.incomplete).toBe(false);
    expect(r.violations.total).toBe(0);
  });

  it('all non-compliant → score 0, grade D', () => {
    const items = [
      item('a', 'low', 'non-compliant'),
      item('b', 'low', 'non-compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });

  it('empty items → score 0, grade D', () => {
    const r = computeScoreAndGrade([]);
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.evaluatedCount).toBe(0);
    expect(r.applicableCount).toBe(0);
    expect(r.completionRate).toBe(0);
    expect(r.incomplete).toBe(true);
  });

  it('severity-weighted score — high non-compliant lowers score more', () => {
    // 1 high(3) compliant, 1 high(3) non-compliant, 1 low(1) compliant
    // compliantWeight=4, evaluatedWeight=7 → 4/7 = 0.5714 → 57.1
    const items = [
      item('a', 'high', 'compliant'),
      item('b', 'high', 'non-compliant'),
      item('c', 'low', 'compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(57.1);
    expect(r.grade).toBe('C');
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });

  it('grade B boundary — score exactly at GRADE_B_MIN (no high violations)', () => {
    // 7 low compliant, 3 low non-compliant → 7/10 = 70 → B (no high violations → no override)
    const items = [
      ...Array.from({ length: 7 }, (_, i) => item(`c${i}`, 'low', 'compliant')),
      ...Array.from({ length: 3 }, (_, i) => item(`n${i}`, 'low', 'non-compliant')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(70);
    expect(r.grade).toBe('B');
    expect(r.riskLevel).toBe(2);
    expect(r.nextInspectionDays).toBe(365);
  });

  it('grade C boundary — score exactly at GRADE_C_MIN', () => {
    // 5 low compliant, 5 low non-compliant → 50
    const items = [
      ...Array.from({ length: 5 }, (_, i) => item(`c${i}`, 'low', 'compliant')),
      ...Array.from({ length: 5 }, (_, i) => item(`n${i}`, 'low', 'non-compliant')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(50);
    expect(r.grade).toBe('C');
  });

  it('score just below GRADE_C_MIN → grade D', () => {
    // 4 low compliant, 6 low non-compliant → 40
    const items = [
      ...Array.from({ length: 4 }, (_, i) => item(`c${i}`, 'low', 'compliant')),
      ...Array.from({ length: 6 }, (_, i) => item(`n${i}`, 'low', 'non-compliant')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(40);
    expect(r.grade).toBe('D');
  });
});

describe('computeScoreAndGrade — NA items', () => {
  it('NA items excluded from score and completion', () => {
    const items = [
      item('a', 'high', 'compliant'),
      item('b', 'medium', 'na'),
      item('c', 'low', 'na'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.applicableCount).toBe(1);
    expect(r.evaluatedCount).toBe(1);
    expect(r.completionRate).toBe(1);
    expect(r.score).toBe(100);
  });

  it('all NA → score 0, completionRate 0, incomplete', () => {
    const items = [item('a', 'high', 'na'), item('b', 'low', 'na')];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(0);
    expect(r.completionRate).toBe(0);
    expect(r.incomplete).toBe(true);
  });
});

describe('computeScoreAndGrade — completion rate', () => {
  it('all items NA → completionRate 0 → incomplete', () => {
    const r = computeScoreAndGrade([item('a', 'high', 'na')]);
    expect(r.incomplete).toBe(true);
    expect(r.completionRate).toBe(0);
  });
});

describe('computeScoreAndGrade — critical override', () => {
  // For ceiling tests we need rawGrade A or B without any high violations already
  // changing the score. Use only high-severity compliant items + 1 high non-compliant
  // so the weight ratio is still high.
  //
  // Caps A→C: 19 high(3) compliant + 1 high(3) non-compliant
  //   compliantWeight=57, evaluatedWeight=60 → 95% → rawGrade A → override to C
  it('1 high violation (CEILING_C_THRESHOLD) caps A→C', () => {
    const items = [
      ...Array.from({ length: 19 }, (_, i) => item(`c${i}`, 'high', 'compliant')),
      item('h1', 'high', 'non-compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(1);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });

  // Caps B→C: score in B range (70-84) + 1 high violation
  // 7 medium(2) compliant + 3 medium(2) non-compliant → score=70 → rawGrade B
  // + 1 high non-compliant makes it CEILING: rawGrade recalc with high included:
  // compliantWeight=14, evaluatedWeight=14+2+3*2=22 → 63.6 → C anyway
  // Better approach: keep it simple — score without high items in B range, verify ceiling fires
  // 23 low compliant + 7 low non-compliant → 76.7 → B; then add 1 high non-compliant
  // score: compliantWeight=23, evaluatedWeight=23+7+3=33 → 23/33=69.7 → C by score alone
  // That's C without override. We need rawGrade=B then ceiling kicks in.
  // Trick: use medium items for score stability.
  // 8 medium(2) compliant + 2 medium(2) non-compliant = 16/20 = 80 → B (no high)
  // Now add 1 high non-compliant: compliantWeight=16, evaluatedWeight=20+3=23 → 69.6 → C
  // rawGrade=C → ceiling doesn't fire (only A/B). Let's try differently:
  // rawGrade must be B AFTER including the high violation in the score.
  // 19 medium(2) compliant + 1 medium(2) non-compliant + 1 high(3) non-compliant
  // compliantWeight=38, evaluatedWeight=38+2+3=43 → 88.4% → rawGrade A → ceiling fires
  // That gives A→C. For B→C we need rawGrade exactly B after including high:
  // X medium compliant + Y medium non-compliant + 1 high non-compliant where score ∈ [70,85)
  // Try 7 medium(2) compliant + 1 medium(2) non-compliant + 1 high(3) non-compliant:
  // compliantWeight=14, evaluatedWeight=14+2+3=19 → 73.7 → B → ceiling fires → C
  it('1 high violation caps B→C', () => {
    const items = [
      ...Array.from({ length: 7 }, (_, i) => item(`c${i}`, 'medium', 'compliant')),
      item('nm', 'medium', 'non-compliant'),
      item('h1', 'high', 'non-compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('B');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });

  // Covers line 119: rawGrade already C + 1 high violation → ceiling no-op (criticalOverride stays false)
  // 5 low compliant + 4 low non-compliant + 1 high non-compliant
  // compliantWeight=5, evaluatedWeight=5+4+3=12 → 41.7 → rawGrade D
  // Need rawGrade C: score ∈ [50,70). Use medium items:
  // 5 medium(2) compliant + 3 medium(2) non-compliant + 1 high(3) non-compliant
  // compliantWeight=10, evaluatedWeight=10+6+3=19 → 52.6 → rawGrade C → no override
  it('1 high violation does NOT override C (ceiling no-op, line 119)', () => {
    const items = [
      ...Array.from({ length: 5 }, (_, i) => item(`c${i}`, 'medium', 'compliant')),
      ...Array.from({ length: 3 }, (_, i) => item(`n${i}`, 'medium', 'non-compliant')),
      item('h1', 'high', 'non-compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('C');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(false);
  });

  // Forced D from A: 20 low(1) compliant + 3 high(3) non-compliant
  // compliantWeight=20, evaluatedWeight=20+9=29 → 69% → rawGrade B
  // Need rawGrade A: use more compliant items.
  // 50 low compliant + 3 high non-compliant:
  // compliantWeight=50, evaluatedWeight=50+9=59 → 84.7 → B (just under 85)
  // Use 100 low compliant + 3 high non-compliant:
  // compliantWeight=100, evaluatedWeight=109 → 91.7 → A → forced D
  it('3 high violations (FORCED_D_THRESHOLD) forces D from A', () => {
    const items = [
      ...Array.from({ length: 100 }, (_, i) => item(`c${i}`, 'low', 'compliant')),
      item('h1', 'high', 'non-compliant'),
      item('h2', 'high', 'non-compliant'),
      item('h3', 'high', 'non-compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(3);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(true);
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });

  it('3 high violations forced D — criticalOverride false when raw is already D', () => {
    const items = [
      item('h1', 'high', 'non-compliant'),
      item('h2', 'high', 'non-compliant'),
      item('h3', 'high', 'non-compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.rawGrade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });
});

describe('computeScoreAndGrade — violation profile', () => {
  it('counts violations by severity', () => {
    const items = [
      item('h1', 'high', 'non-compliant'),
      item('h2', 'high', 'non-compliant'),
      item('m1', 'medium', 'non-compliant'),
      item('l1', 'low', 'non-compliant'),
      item('ok', 'low', 'compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(2);
    expect(r.violations.medium).toBe(1);
    expect(r.violations.low).toBe(1);
    expect(r.violations.total).toBe(4);
  });
});

describe('computeScoreAndGrade — disclaimer', () => {
  it('includes Arabic disclaimer', () => {
    const r = computeScoreAndGrade([item('a', 'low', 'compliant')]);
    expect(r.disclaimer).toContain('03-10');
    expect(r.disclaimer).toContain('06-198');
  });
});
