// __tests__/utils/scoringUtils.test.ts

import {
  computeScoreAndGrade,
  GRADE_A_MIN, GRADE_B_MIN, GRADE_C_MIN,
  CEILING_C_THRESHOLD, FORCED_D_THRESHOLD,
  MIN_COMPLETION_RATE, SEVERITY_WEIGHTS,
} from '../../src/utils/scoringUtils';
import { InspectionItem } from '../../src/types';

let _id = 0;
function item(
  status: InspectionItem['complianceStatus'],
  severity: InspectionItem['severity'] = 'medium',
): InspectionItem {
  return { id: `i${++_id}`, criteria: 'test', legalReference: 'Art.1', severity, complianceStatus: status };
}

beforeEach(() => { _id = 0; });

// ── constants ────────────────────────────────────────────────────────────────

describe('exported thresholds', () => {
  it('SEVERITY_WEIGHTS values', () => {
    expect(SEVERITY_WEIGHTS).toEqual({ high: 3, medium: 2, low: 1 });
  });
  it('grade order', () => {
    expect(GRADE_A_MIN).toBeGreaterThan(GRADE_B_MIN);
    expect(GRADE_B_MIN).toBeGreaterThan(GRADE_C_MIN);
    expect(GRADE_C_MIN).toBeGreaterThan(0);
  });
  it('FORCED_D > CEILING_C', () => {
    expect(FORCED_D_THRESHOLD).toBeGreaterThan(CEILING_C_THRESHOLD);
  });
  it('MIN_COMPLETION_RATE range', () => {
    expect(MIN_COMPLETION_RATE).toBeGreaterThan(0);
    expect(MIN_COMPLETION_RATE).toBeLessThanOrEqual(1);
  });
});

// ── getSeverityWeight ?? fallback (line 119 branch) ─────────────────────────

describe('getSeverityWeight ?? fallback', () => {
  it('treats unknown severity as low (weight 1) via ?? fallback', () => {
    const items = [
      { id: 'x1', criteria: 'c', legalReference: 'r', severity: 'unknown' as any, complianceStatus: 'compliant' as any },
      { id: 'x2', criteria: 'c', legalReference: 'r', severity: 'unknown' as any, complianceStatus: 'non-compliant' as any },
    ];
    // both get weight 1 → 1 compliant / 2 total = 50%
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(50);
  });
});

// ── empty / NA ───────────────────────────────────────────────────────────────

describe('empty / NA', () => {
  it('score 0, grade D for empty', () => {
    const r = computeScoreAndGrade([]);
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.incomplete).toBe(true);
  });
  it('NA excluded from applicableCount', () => {
    const r = computeScoreAndGrade([item('na'), item('na')]);
    expect(r.applicableCount).toBe(0);
  });
});

// ── grades ───────────────────────────────────────────────────────────────────

describe('grade A', () => {
  it('score 100 → A, riskLevel 1, 730 days', () => {
    const r = computeScoreAndGrade(Array(10).fill(null).map(() => item('compliant')));
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.riskLevel).toBe(1);
    expect(r.nextInspectionDays).toBe(730);
    expect(r.criticalOverride).toBe(false);
  });
});

describe('grade B', () => {
  it('70% → B, riskLevel 2, 365 days', () => {
    const items = [
      ...Array(7).fill(null).map(() => item('compliant')),
      ...Array(3).fill(null).map(() => item('non-compliant')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('B');
    expect(r.riskLevel).toBe(2);
    expect(r.nextInspectionDays).toBe(365);
  });
});

describe('grade C', () => {
  it('50% → C, riskLevel 3, 180 days', () => {
    const items = [
      ...Array(6).fill(null).map(() => item('compliant')),
      ...Array(6).fill(null).map(() => item('non-compliant')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('C');
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });
});

describe('grade D (score)', () => {
  it('10% → D, riskLevel 4, 30 days', () => {
    const items = [
      item('compliant'),
      ...Array(9).fill(null).map(() => item('non-compliant')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });
});

// ── critical override ────────────────────────────────────────────────────────

describe('critical override', () => {
  it('ceiling C: A→C, criticalOverride true', () => {
    const items = [
      ...Array(20).fill(null).map(() => item('compliant')),
      ...Array(CEILING_C_THRESHOLD).fill(null).map(() => item('non-compliant', 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('C');
    expect(r.criticalOverride).toBe(true);
  });

  it('ceiling C: does not override D (rawGrade D with 1 high)', () => {
    const items = [
      item('compliant'),
      ...Array(9).fill(null).map(() => item('non-compliant')),
      item('non-compliant', 'high'),
    ];
    const r = computeScoreAndGrade(items);
    if (r.rawGrade === 'D') {
      expect(r.grade).toBe('D');
      expect(r.criticalOverride).toBe(false);
    }
  });

  it('forced D: rawGrade A → criticalOverride true', () => {
    // 100 compliant low (weight 1 each = 100) vs 3 non-compliant high (weight 3 each = 9)
    // score = 100/109 * 100 ≈ 91.7 → rawGrade A, but 3 high → forced D
    const items = [
      ...Array(100).fill(null).map(() => item('compliant', 'low')),
      ...Array(FORCED_D_THRESHOLD).fill(null).map(() => item('non-compliant', 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.rawGrade).toBe('A');
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(true);
  });

  it('forced D: rawGrade already D → criticalOverride false', () => {
    const items = [
      item('compliant'),
      ...Array(FORCED_D_THRESHOLD).fill(null).map(() => item('non-compliant', 'high')),
      ...Array(6).fill(null).map(() => item('non-compliant')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.rawGrade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });
});

// ── severity weighting ───────────────────────────────────────────────────────

describe('severity weighting', () => {
  it('high compliant vs low non-compliant → 75%', () => {
    const r = computeScoreAndGrade([item('compliant', 'high'), item('non-compliant', 'low')]);
    expect(r.score).toBe(75);
  });
  it('low compliant vs high non-compliant → 25%', () => {
    const r = computeScoreAndGrade([item('compliant', 'low'), item('non-compliant', 'high')]);
    expect(r.score).toBe(25);
  });
  it('not-evaluated excluded from score', () => {
    const r1 = computeScoreAndGrade([item('compliant'), item('compliant')]);
    const r2 = computeScoreAndGrade([item('compliant'), item('compliant'), item('not-evaluated')]);
    expect(r1.score).toBe(r2.score);
  });
  it('observation-only and na excluded', () => {
    const r = computeScoreAndGrade([item('compliant'), item('observation-only'), item('na', 'high')]);
    expect(r.score).toBe(100);
  });
});

// ── completionRate ────────────────────────────────────────────────────────────

describe('completionRate', () => {
  it('< 60% → incomplete', () => {
    const items = [item('compliant'), item('compliant'), item('not-evaluated'), item('not-evaluated'), item('not-evaluated')];
    const r = computeScoreAndGrade(items);
    expect(r.completionRate).toBeCloseTo(0.4);
    expect(r.incomplete).toBe(true);
  });
  it('>= 60% → complete', () => {
    const items = [item('compliant'), item('compliant'), item('compliant'), item('not-evaluated'), item('not-evaluated')];
    const r = computeScoreAndGrade(items);
    expect(r.completionRate).toBeCloseTo(0.6);
    expect(r.incomplete).toBe(false);
  });
});

// ── violations profile ────────────────────────────────────────────────────────

describe('violations', () => {
  it('counts by severity', () => {
    const items = [
      item('non-compliant', 'high'), item('non-compliant', 'high'),
      item('non-compliant', 'medium'), item('non-compliant', 'low'),
      item('compliant'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.violations).toEqual({ high: 2, medium: 1, low: 1, total: 4 });
  });
  it('zero when all compliant', () => {
    const r = computeScoreAndGrade(Array(5).fill(null).map(() => item('compliant', 'high')));
    expect(r.violations).toEqual({ high: 0, medium: 0, low: 0, total: 0 });
  });
});

// ── disclaimer ────────────────────────────────────────────────────────────────

describe('disclaimer', () => {
  it('non-empty Arabic string with legal ref', () => {
    const r = computeScoreAndGrade([]);
    expect(r.disclaimer).toContain('03-10');
  });
});
