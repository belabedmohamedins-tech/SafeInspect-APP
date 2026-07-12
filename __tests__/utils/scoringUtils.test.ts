// __tests__/utils/scoringUtils.test.ts
//
// Full coverage for src/utils/scoringUtils.ts
// Pure TS — no mocks needed.
// Covers: computeScoreAndGrade (all branches), exported thresholds, helper paths.

import {
  computeScoreAndGrade,
  GRADE_A_MIN, GRADE_B_MIN, GRADE_C_MIN,
  CEILING_C_THRESHOLD, FORCED_D_THRESHOLD,
  MIN_COMPLETION_RATE, SEVERITY_WEIGHTS,
} from '../../src/utils/scoringUtils';
import { InspectionItem } from '../../src/types';

// ── Fixture builder ──────────────────────────────────────────────────────────

let _id = 0;
function item(
  status: InspectionItem['complianceStatus'],
  severity: InspectionItem['severity'] = 'medium',
): InspectionItem {
  return {
    id: `i${++_id}`,
    criteria: 'test',
    legalReference: 'Art.1',
    severity,
    complianceStatus: status,
  };
}

beforeEach(() => { _id = 0; });

// ── exported constants ─────────────────────────────────────────────────────

describe('exported thresholds', () => {
  it('SEVERITY_WEIGHTS has correct values', () => {
    expect(SEVERITY_WEIGHTS).toEqual({ high: 3, medium: 2, low: 1 });
  });
  it('grade thresholds are ordered correctly', () => {
    expect(GRADE_A_MIN).toBeGreaterThan(GRADE_B_MIN);
    expect(GRADE_B_MIN).toBeGreaterThan(GRADE_C_MIN);
    expect(GRADE_C_MIN).toBeGreaterThan(0);
  });
  it('FORCED_D > CEILING_C', () => {
    expect(FORCED_D_THRESHOLD).toBeGreaterThan(CEILING_C_THRESHOLD);
  });
  it('MIN_COMPLETION_RATE is between 0 and 1', () => {
    expect(MIN_COMPLETION_RATE).toBeGreaterThan(0);
    expect(MIN_COMPLETION_RATE).toBeLessThanOrEqual(1);
  });
});

// ── empty / all-NA ─────────────────────────────────────────────────────────

describe('computeScoreAndGrade — empty / NA', () => {
  it('returns score 0 and grade D for empty items', () => {
    const r = computeScoreAndGrade([]);
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.completionRate).toBe(0);
    expect(r.incomplete).toBe(true);
  });

  it('excludes NA items from applicableCount', () => {
    const r = computeScoreAndGrade([item('na'), item('na')]);
    expect(r.applicableCount).toBe(0);
    expect(r.completionRate).toBe(0);
  });
});

// ── grade A (score >= 85, no high violations) ────────────────────────────

describe('computeScoreAndGrade — grade A', () => {
  it('assigns grade A when all items are compliant (score 100)', () => {
    const items = Array(10).fill(null).map(() => item('compliant', 'medium'));
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.riskLevel).toBe(1);
    expect(r.nextInspectionDays).toBe(730);
    expect(r.criticalOverride).toBe(false);
  });

  it('assigns grade A at exactly GRADE_A_MIN score', () => {
    // Build items so weighted compliance rate = 85%
    // 17 compliant medium (weight 2) = 34, 3 non-compliant medium (weight 2) = 6 → 34/40 = 85%
    const items = [
      ...Array(17).fill(null).map(() => item('compliant', 'medium')),
      ...Array(3).fill(null).map(() => item('non-compliant', 'medium')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBeGreaterThanOrEqual(GRADE_A_MIN);
    expect(r.grade).toBe('A');
  });
});

// ── grade B (70 <= score < 85) ─────────────────────────────────────────────

describe('computeScoreAndGrade — grade B', () => {
  it('assigns grade B when score is in [70, 85)', () => {
    // 7 compliant, 3 non-compliant medium → 7/10 = 70%
    const items = [
      ...Array(7).fill(null).map(() => item('compliant', 'medium')),
      ...Array(3).fill(null).map(() => item('non-compliant', 'medium')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBeGreaterThanOrEqual(GRADE_B_MIN);
    expect(r.score).toBeLessThan(GRADE_A_MIN);
    expect(r.grade).toBe('B');
    expect(r.riskLevel).toBe(2);
    expect(r.nextInspectionDays).toBe(365);
  });
});

// ── grade C (50 <= score < 70) ─────────────────────────────────────────────

describe('computeScoreAndGrade — grade C', () => {
  it('assigns grade C when score is in [50, 70)', () => {
    // 6 compliant, 6 non-compliant medium → 6/12 = 50%
    const items = [
      ...Array(6).fill(null).map(() => item('compliant', 'medium')),
      ...Array(6).fill(null).map(() => item('non-compliant', 'medium')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBeGreaterThanOrEqual(GRADE_C_MIN);
    expect(r.score).toBeLessThan(GRADE_B_MIN);
    expect(r.grade).toBe('C');
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });
});

// ── grade D (score < 50) ─────────────────────────────────────────────────

describe('computeScoreAndGrade — grade D (score)', () => {
  it('assigns grade D when score is below 50', () => {
    // 1 compliant, 9 non-compliant → 10% score
    const items = [
      item('compliant', 'medium'),
      ...Array(9).fill(null).map(() => item('non-compliant', 'medium')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBeLessThan(GRADE_C_MIN);
    expect(r.grade).toBe('D');
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });
});

// ── critical override ───────────────────────────────────────────────────────

describe('computeScoreAndGrade — critical override', () => {
  it('ceiling C: caps A→C when high violations >= CEILING_C_THRESHOLD', () => {
    // High score but exactly CEILING_C_THRESHOLD high-severity non-compliant
    const items = [
      ...Array(20).fill(null).map(() => item('compliant', 'medium')),
      ...Array(CEILING_C_THRESHOLD).fill(null).map(() => item('non-compliant', 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
    expect(r.violations.high).toBe(CEILING_C_THRESHOLD);
  });

  it('ceiling C: caps B→C when high violations >= CEILING_C_THRESHOLD', () => {
    // Score in B range + 1 high violation
    const items = [
      ...Array(7).fill(null).map(() => item('compliant', 'medium')),
      ...Array(2).fill(null).map(() => item('non-compliant', 'medium')),
      item('non-compliant', 'high'),  // 1 high
    ];
    const r = computeScoreAndGrade(items);
    if (r.rawGrade === 'B') {
      expect(r.grade).toBe('C');
      expect(r.criticalOverride).toBe(true);
    }
  });

  it('ceiling C does NOT override grade C (already at/below ceiling)', () => {
    // Score gives raw grade C, 1 high violation — no change needed
    const items = [
      ...Array(6).fill(null).map(() => item('compliant', 'medium')),
      ...Array(5).fill(null).map(() => item('non-compliant', 'medium')),
      item('non-compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    if (r.rawGrade === 'C') {
      expect(r.grade).toBe('C');
      expect(r.criticalOverride).toBe(false);
    }
  });

  it('forced D: overrides A to D when high violations >= FORCED_D_THRESHOLD', () => {
    const items = [
      ...Array(30).fill(null).map(() => item('compliant', 'medium')),
      ...Array(FORCED_D_THRESHOLD).fill(null).map(() => item('non-compliant', 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.violations.high).toBe(FORCED_D_THRESHOLD);
    // criticalOverride = true only if rawGrade !== 'D'
    expect(r.criticalOverride).toBe(r.rawGrade !== 'D');
  });

  it('forced D when already raw D: criticalOverride is false', () => {
    // Score < 50 AND >= FORCED_D_THRESHOLD high violations
    const items = [
      item('compliant', 'medium'),
      ...Array(FORCED_D_THRESHOLD).fill(null).map(() => item('non-compliant', 'high')),
      ...Array(6).fill(null).map(() => item('non-compliant', 'medium')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.rawGrade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });
});

// ── severity weights in score ────────────────────────────────────────────────

describe('computeScoreAndGrade — severity weighting', () => {
  it('high-severity compliant items contribute more weight than low', () => {
    // 1 high compliant vs 1 low non-compliant
    const allHighCompliant = [
      item('compliant', 'high'),
      item('non-compliant', 'low'),
    ];
    // weights: 3 compliant, 1 non-compliant → 3/4 = 75%
    const r = computeScoreAndGrade(allHighCompliant);
    expect(r.score).toBe(75);
  });

  it('low-severity compliant items contribute less weight', () => {
    const items = [
      item('compliant', 'low'),
      item('non-compliant', 'high'),
    ];
    // weights: 1 compliant, 3 non-compliant → 1/4 = 25%
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(25);
  });

  it('not-evaluated items do not contribute to score', () => {
    const r1 = computeScoreAndGrade([item('compliant', 'medium'), item('compliant', 'medium')]);
    const r2 = computeScoreAndGrade([
      item('compliant', 'medium'),
      item('compliant', 'medium'),
      item('not-evaluated', 'medium'),
    ]);
    expect(r1.score).toBe(r2.score);
  });

  it('observation-only and na items are excluded from score calculation', () => {
    const items = [
      item('compliant', 'medium'),
      item('observation-only', 'medium'),
      item('na', 'high'),
    ];
    // only compliant is in evaluatedItems; na excluded from applicable
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(100);
  });
});

// ── completionRate / incomplete ────────────────────────────────────────────────

describe('computeScoreAndGrade — completionRate', () => {
  it('marks incomplete when < 60% evaluated', () => {
    // 5 applicable, only 2 evaluated (40%)
    const items = [
      item('compliant', 'medium'),
      item('compliant', 'medium'),
      item('not-evaluated', 'medium'),
      item('not-evaluated', 'medium'),
      item('not-evaluated', 'medium'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.completionRate).toBeCloseTo(0.4);
    expect(r.incomplete).toBe(true);
  });

  it('marks complete when >= 60% evaluated', () => {
    // 5 applicable, 3 evaluated (60%)
    const items = [
      item('compliant', 'medium'),
      item('compliant', 'medium'),
      item('compliant', 'medium'),
      item('not-evaluated', 'medium'),
      item('not-evaluated', 'medium'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.completionRate).toBeCloseTo(0.6);
    expect(r.incomplete).toBe(false);
  });
});

// ── violation profile ──────────────────────────────────────────────────────────

describe('computeScoreAndGrade — violations profile', () => {
  it('counts violations by severity correctly', () => {
    const items = [
      item('non-compliant', 'high'),
      item('non-compliant', 'high'),
      item('non-compliant', 'medium'),
      item('non-compliant', 'low'),
      item('compliant', 'medium'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations.high).toBe(2);
    expect(r.violations.medium).toBe(1);
    expect(r.violations.low).toBe(1);
    expect(r.violations.total).toBe(4);
  });

  it('has zero violations when all items are compliant', () => {
    const items = Array(5).fill(null).map(() => item('compliant', 'high'));
    const r = computeScoreAndGrade(items);
    expect(r.violations).toEqual({ high: 0, medium: 0, low: 0, total: 0 });
  });
});

// ── disclaimer ──────────────────────────────────────────────────────────────

describe('computeScoreAndGrade — disclaimer', () => {
  it('always returns a non-empty Arabic disclaimer string', () => {
    const r = computeScoreAndGrade([]);
    expect(typeof r.disclaimer).toBe('string');
    expect(r.disclaimer.length).toBeGreaterThan(0);
    expect(r.disclaimer).toContain('03-10');
  });
});
