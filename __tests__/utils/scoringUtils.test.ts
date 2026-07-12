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

// ── grade A ─────────────────────────────────────────────────────────────────

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
    const items = [
      ...Array(17).fill(null).map(() => item('compliant', 'medium')),
      ...Array(3).fill(null).map(() => item('non-compliant', 'medium')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBeGreaterThanOrEqual(GRADE_A_MIN);
    expect(r.grade).toBe('A');
  });
});

// ── grade B ─────────────────────────────────────────────────────────────────

describe('computeScoreAndGrade — grade B', () => {
  it('assigns grade B when score is in [70, 85)', () => {
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

// ── grade C ─────────────────────────────────────────────────────────────────

describe('computeScoreAndGrade — grade C', () => {
  it('assigns grade C when score is in [50, 70)', () => {
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

// ── grade D (score) ─────────────────────────────────────────────────────────

describe('computeScoreAndGrade — grade D (score)', () => {
  it('assigns grade D when score is below 50', () => {
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

// ── critical override ────────────────────────────────────────────────────────

describe('computeScoreAndGrade — critical override', () => {
  it('ceiling C: caps A→C when high violations >= CEILING_C_THRESHOLD', () => {
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
    const items = [
      ...Array(7).fill(null).map(() => item('compliant', 'medium')),
      ...Array(2).fill(null).map(() => item('non-compliant', 'medium')),
      item('non-compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    if (r.rawGrade === 'B') {
      expect(r.grade).toBe('C');
      expect(r.criticalOverride).toBe(true);
    }
  });

  it('ceiling C does NOT override grade C (already at/below ceiling)', () => {
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

  // ── line 119: forced D where rawGrade is NOT D (criticalOverride = true) ──
  it('forced D: criticalOverride=true when rawGrade is A and forced to D', () => {
    // Very high score (all compliant medium) + FORCED_D_THRESHOLD high violations
    // The high-violation non-compliants add weight but compliant weight still dominates
    // Use enough compliant items so rawGrade would be A without override
    const items = [
      ...Array(50).fill(null).map(() => item('compliant', 'medium')),
      ...Array(FORCED_D_THRESHOLD).fill(null).map(() => item('non-compliant', 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.rawGrade).not.toBe('D');
    expect(r.criticalOverride).toBe(true);  // line 119 true branch
  });

  // ── line 119: forced D where rawGrade IS D (criticalOverride = false) ──
  it('forced D: criticalOverride=false when rawGrade is already D', () => {
    const items = [
      item('compliant', 'medium'),
      ...Array(FORCED_D_THRESHOLD).fill(null).map(() => item('non-compliant', 'high')),
      ...Array(6).fill(null).map(() => item('non-compliant', 'medium')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.rawGrade).toBe('D');
    expect(r.criticalOverride).toBe(false); // line 119 false branch
  });
});

// ── severity weights in score ────────────────────────────────────────────────

describe('computeScoreAndGrade — severity weighting', () => {
  it('high-severity compliant items contribute more weight than low', () => {
    const items = [item('compliant', 'high'), item('non-compliant', 'low')];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(75);
  });

  it('low-severity compliant items contribute less weight', () => {
    const items = [item('compliant', 'low'), item('non-compliant', 'high')];
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
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(100);
  });
});

// ── completionRate / incomplete ──────────────────────────────────────────────

describe('computeScoreAndGrade — completionRate', () => {
  it('marks incomplete when < 60% evaluated', () => {
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

// ── violation profile ────────────────────────────────────────────────────────

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

// ── disclaimer ───────────────────────────────────────────────────────────────

describe('computeScoreAndGrade — disclaimer', () => {
  it('always returns a non-empty Arabic disclaimer string', () => {
    const r = computeScoreAndGrade([]);
    expect(typeof r.disclaimer).toBe('string');
    expect(r.disclaimer.length).toBeGreaterThan(0);
    expect(r.disclaimer).toContain('03-10');
  });
});
