// src/__tests__/scoringUtils.test.ts
//
// Covers the severity-weighted scoring engine introduced in the refactor.
// Each describe block maps to one concern; scenarios mirror test_scoring.txt.

import { InspectionItem } from '../types';
import {
  CEILING_C_THRESHOLD,
  FORCED_D_THRESHOLD,
  GRADE_A_MIN,
  GRADE_B_MIN,
  GRADE_C_MIN,
  MIN_COMPLETION_RATE,
  SEVERITY_WEIGHTS,
  computeScoreAndGrade,
} from '../utils/scoringUtils';

// ── Helpers ──────────────────────────────────────────────────────────────────

function item(
  severity: InspectionItem['severity'],
  status: InspectionItem['complianceStatus']
): InspectionItem {
  return {
    id: Math.random().toString(36).slice(2),
    criteria: 'test criterion',
    legalReference: '',
    severity,
    complianceStatus: status,
  };
}

function items(
  severity: InspectionItem['severity'],
  status: InspectionItem['complianceStatus'],
  count: number
): InspectionItem[] {
  return Array.from({ length: count }, () => item(severity, status));
}

// ── Exported constants ───────────────────────────────────────────────────────

describe('exported threshold constants', () => {
  it('SEVERITY_WEIGHTS are high=3 medium=2 low=1', () => {
    expect(SEVERITY_WEIGHTS.high).toBe(3);
    expect(SEVERITY_WEIGHTS.medium).toBe(2);
    expect(SEVERITY_WEIGHTS.low).toBe(1);
  });

  it('grade thresholds match design spec', () => {
    expect(GRADE_A_MIN).toBe(85);
    expect(GRADE_B_MIN).toBe(70);
    expect(GRADE_C_MIN).toBe(50);
  });

  it('override thresholds match design spec', () => {
    expect(CEILING_C_THRESHOLD).toBe(1);
    expect(FORCED_D_THRESHOLD).toBe(3);
  });

  it('MIN_COMPLETION_RATE is 0.60', () => {
    expect(MIN_COMPLETION_RATE).toBe(0.60);
  });
});

// ── Score formula ─────────────────────────────────────────────────────────────

describe('severity-weighted score formula', () => {
  it('returns 100 when all items are compliant', () => {
    const r = computeScoreAndGrade([
      ...items('high', 'compliant', 5),
      ...items('medium', 'compliant', 5),
      ...items('low', 'compliant', 5),
    ]);
    expect(r.score).toBe(100);
  });

  it('returns 0 when all items are non-compliant', () => {
    const r = computeScoreAndGrade(items('medium', 'non-compliant', 10));
    expect(r.score).toBe(0);
  });

  it('weights high severity 3x more than low', () => {
    // 1 high compliant (w=3) vs 1 high non-compliant (w=3) + 2 low non-compliant (w=1 each)
    // compliantW=3, evaluatedW=3+3+1+1=8 → score = 3/8 * 100 = 37.5
    const r = computeScoreAndGrade([
      item('high', 'compliant'),
      item('high', 'non-compliant'),
      item('low', 'non-compliant'),
      item('low', 'non-compliant'),
    ]);
    expect(r.score).toBe(37.5);
  });

  it('gives score of 0 when no items are evaluated (all not-evaluated)', () => {
    const r = computeScoreAndGrade(items('medium', 'not-evaluated', 5));
    expect(r.score).toBe(0);
  });

  it('excludes NA items from score calculation', () => {
    // 5 compliant medium + 5 NA → same as 5/5 compliant = 100
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 5),
      ...items('medium', 'na', 5),
    ]);
    expect(r.score).toBe(100);
  });

  it('rounds score to 1 decimal place', () => {
    // 1 high compliant (w=3) out of 2 high evaluated (w=6) → 50.0 exact
    const r = computeScoreAndGrade([
      item('high', 'compliant'),
      item('high', 'non-compliant'),
    ]);
    expect(r.score).toBe(50.0);
    expect(Number.isFinite(r.score)).toBe(true);
  });
});

// ── Grade thresholds (no override) ───────────────────────────────────────────

describe('grade thresholds — score-based, no high violations', () => {
  // Use only low-severity items so no critical override can trigger

  it('grade A when score >= 85', () => {
    // 85 compliant / 100 evaluated, all low → score = 85.0
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 85),
      ...items('low', 'non-compliant', 15),
    ]);
    expect(r.grade).toBe('A');
    expect(r.rawGrade).toBe('A');
    expect(r.criticalOverride).toBe(false);
    expect(r.score).toBe(85);
  });

  it('grade B when 70 <= score < 85', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 70),
      ...items('low', 'non-compliant', 30),
    ]);
    expect(r.grade).toBe('B');
    expect(r.score).toBe(70);
  });

  it('grade C when 50 <= score < 70', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 50),
      ...items('low', 'non-compliant', 50),
    ]);
    expect(r.grade).toBe('C');
    expect(r.score).toBe(50);
  });

  it('grade D when score < 50', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 49),
      ...items('low', 'non-compliant', 51),
    ]);
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });
});

// ── Critical override — ceiling C ─────────────────────────────────────────────

describe('ceiling-C override (>= 1 high violation)', () => {
  it('caps grade at C when 1 high violation exists and raw grade would be A', () => {
    // scenario from test_scoring: old system gave A, new gives C
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 49),
      item('high', 'non-compliant'),
    ]);
    // score is high because only 1 non-compliant item out of 50 evaluated
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });

  it('caps grade at C when 1 high violation and raw grade would be B', () => {
    // 75 low compliant (w=75) + 1 high non-compliant (w=3) → score ~96% raw→A
    // but with medium mix: tune to get rawGrade B
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 14),
      ...items('medium', 'non-compliant', 6),
      item('high', 'non-compliant'),
    ]);
    // raw score: compliantW = 14*2=28, evaluatedW = 14*2+6*2+1*3=28+12+3=43
    // score = 28/43*100 ≈ 65.1 → rawGrade C → no override needed here
    // use scenario where raw is B: 14 medium compliant vs 2 medium + 1 high NC
    const r2 = computeScoreAndGrade([
      ...items('medium', 'compliant', 25),
      ...items('medium', 'non-compliant', 5),
      item('high', 'non-compliant'),
    ]);
    // compliantW=50, evaluatedW=50+10+3=63, score=50/63*100≈79.4 → rawGrade B
    expect(r2.rawGrade).toBe('B');
    expect(r2.grade).toBe('C');
    expect(r2.criticalOverride).toBe(true);
  });

  it('does NOT override when raw grade is already C', () => {
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 15),
      ...items('medium', 'non-compliant', 10),
      item('high', 'non-compliant'),
    ]);
    // score: compliantW=30, evaluatedW=30+20+3=53, score≈56.6 → rawGrade C
    expect(r.rawGrade).toBe('C');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(false);
  });

  it('does NOT override when raw grade is D', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 4),
      ...items('low', 'non-compliant', 6),
      item('high', 'non-compliant'),
    ]);
    expect(r.rawGrade).toBe('D');
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });
});

// ── Critical override — forced D ──────────────────────────────────────────────

describe('forced-D override (>= 3 high violations)', () => {
  it('forces grade to D when 3 high violations regardless of high score', () => {
    // scenario C from test_scoring: abattoir
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 16),
      item('high', 'non-compliant'),
      item('high', 'non-compliant'),
      item('high', 'non-compliant'),
    ]);
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(true);
    expect(r.violations.high).toBe(3);
  });

  it('rawGrade reflects the score-only grade before forced D', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 97),
      item('high', 'non-compliant'),
      item('high', 'non-compliant'),
      item('high', 'non-compliant'),
    ]);
    // score is very high so raw would be A
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(true);
  });

  it('forced D takes precedence over ceiling C rule', () => {
    // 3 high violations → forced D, not ceiling C
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 20),
      item('high', 'non-compliant'),
      item('high', 'non-compliant'),
      item('high', 'non-compliant'),
    ]);
    expect(r.grade).toBe('D');
  });

  it('exactly 2 high violations does NOT trigger forced D', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 20),
      item('high', 'non-compliant'),
      item('high', 'non-compliant'),
    ]);
    expect(r.grade).not.toBe('D');
    // ceiling C applies (2 >= CEILING_C_THRESHOLD=1)
    expect(r.grade).toBe('C');
  });
});

// ── Violation profile ─────────────────────────────────────────────────────────

describe('violation profile', () => {
  it('counts violations by severity correctly', () => {
    const r = computeScoreAndGrade([
      item('high', 'non-compliant'),
      item('high', 'non-compliant'),
      item('medium', 'non-compliant'),
      item('low', 'non-compliant'),
      item('low', 'non-compliant'),
      item('low', 'non-compliant'),
      ...items('medium', 'compliant', 5),
    ]);
    expect(r.violations.high).toBe(2);
    expect(r.violations.medium).toBe(1);
    expect(r.violations.low).toBe(3);
    expect(r.violations.total).toBe(6);
  });

  it('returns zero violations for a fully compliant inspection', () => {
    const r = computeScoreAndGrade(items('high', 'compliant', 10));
    expect(r.violations.high).toBe(0);
    expect(r.violations.medium).toBe(0);
    expect(r.violations.low).toBe(0);
    expect(r.violations.total).toBe(0);
  });

  it('does not count NA items as violations', () => {
    const r = computeScoreAndGrade([
      item('high', 'na'),
      item('medium', 'na'),
      ...items('low', 'compliant', 5),
    ]);
    expect(r.violations.high).toBe(0);
    expect(r.violations.total).toBe(0);
  });
});

// ── Completion rate & incomplete flag ─────────────────────────────────────────

describe('completion rate and incomplete flag', () => {
  it('marks incomplete when fewer than 60% of applicable items are evaluated', () => {
    // 3 evaluated, 7 not-evaluated → 3/10 = 30% < 60%
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 3),
      ...items('medium', 'not-evaluated', 7),
    ]);
    expect(r.incomplete).toBe(true);
    expect(r.completionRate).toBeCloseTo(0.3);
  });

  it('marks complete when exactly 60% are evaluated', () => {
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 6),
      ...items('medium', 'not-evaluated', 4),
    ]);
    expect(r.incomplete).toBe(false);
    expect(r.completionRate).toBeCloseTo(0.6);
  });

  it('NA items do not count toward applicableCount', () => {
    // 5 compliant + 5 NA → applicable=5, evaluated=5 → 100%
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 5),
      ...items('medium', 'na', 5),
    ]);
    expect(r.applicableCount).toBe(5);
    expect(r.completionRate).toBe(1);
    expect(r.incomplete).toBe(false);
  });

  it('evaluatedCount equals compliant + non-compliant', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 7),
      ...items('low', 'non-compliant', 3),
      ...items('low', 'not-evaluated', 5),
      ...items('low', 'na', 2),
    ]);
    expect(r.evaluatedCount).toBe(10);
    expect(r.applicableCount).toBe(15); // 10 evaluated + 5 not-evaluated
  });
});

// ── Risk level & next inspection days ─────────────────────────────────────────

describe('riskLevel and nextInspectionDays', () => {
  it('grade A → riskLevel 1 → 730 days', () => {
    const r = computeScoreAndGrade(items('low', 'compliant', 20));
    expect(r.grade).toBe('A');
    expect(r.riskLevel).toBe(1);
    expect(r.nextInspectionDays).toBe(730);
  });

  it('grade B → riskLevel 2 → 365 days', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 70),
      ...items('low', 'non-compliant', 30),
    ]);
    expect(r.grade).toBe('B');
    expect(r.riskLevel).toBe(2);
    expect(r.nextInspectionDays).toBe(365);
  });

  it('grade C → riskLevel 3 → 180 days', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 50),
      ...items('low', 'non-compliant', 50),
    ]);
    expect(r.grade).toBe('C');
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });

  it('grade D → riskLevel 4 → 30 days', () => {
    const r = computeScoreAndGrade(items('low', 'non-compliant', 10));
    expect(r.grade).toBe('D');
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });

  it('riskLevel reflects the final grade after override, not rawGrade', () => {
    // raw A → ceiling C → riskLevel should be 3, not 1
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 49),
      item('high', 'non-compliant'),
    ]);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('C');
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });
});

// ── Real-world scenarios (from test_scoring.txt) ──────────────────────────────

describe('real-world scenarios', () => {
  it('Scenario A — Bakery: high score but rat infestation → ceiling C', () => {
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 38),
      item('low', 'non-compliant'),
      item('high', 'non-compliant'), // rat infestation
    ]);
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
    expect(r.violations.high).toBe(1);
  });

  it('Scenario B — Mechanic: 10 low doc failures, no critical override → B', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'non-compliant', 10),
      ...items('medium', 'compliant', 15),
      ...items('high', 'compliant', 8),
    ]);
    expect(r.grade).toBe('B');
    expect(r.criticalOverride).toBe(false);
    expect(r.violations.high).toBe(0);
  });

  it('Scenario C — Abattoir: 3 critical violations → forced D', () => {
    const r = computeScoreAndGrade([
      ...items('medium', 'compliant', 16),
      item('high', 'non-compliant'), // no ante-mortem inspection
      item('high', 'non-compliant'), // no post-mortem inspection
      item('high', 'non-compliant'), // no cold rooms
    ]);
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(true);
    expect(r.violations.high).toBe(3);
  });

  it('Old system bug: 1 high in 50 items previously gave A, now gives C', () => {
    const r = computeScoreAndGrade([
      ...items('low', 'compliant', 49),
      item('high', 'non-compliant'),
    ]);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });
});

// ── Disclaimer ────────────────────────────────────────────────────────────────

describe('disclaimer field', () => {
  it('is always present and non-empty', () => {
    const r = computeScoreAndGrade(items('low', 'compliant', 5));
    expect(typeof r.disclaimer).toBe('string');
    expect(r.disclaimer.length).toBeGreaterThan(0);
  });

  it('contains the legal reference 03-10', () => {
    const r = computeScoreAndGrade(items('low', 'compliant', 5));
    expect(r.disclaimer).toContain('03-10');
  });
});
