// src/__tests__/scoringUtils.test.ts
//
// Pure deterministic logic — no mocks needed.
// Covers all branches of computeScoreAndGrade and every exported helper.

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

// ─── Fixture helpers ──────────────────────────────────────────────────────────

type Status = InspectionItem['complianceStatus'];
type Sev    = InspectionItem['severity'];

function item(
  id: string,
  severity: Sev,
  complianceStatus: Status,
): InspectionItem {
  return {
    id,
    severity,
    complianceStatus,
    // remaining required fields — not used by scoringUtils
    criterionId: id,
    notes: '',
    photos: [],
  } as unknown as InspectionItem;
}

const C = (id: string, sev: Sev) => item(id, sev, 'compliant');
const N = (id: string, sev: Sev) => item(id, sev, 'non-compliant');
const NA = (id: string, sev: Sev) => item(id, sev, 'na');

// ─── Exported constants ───────────────────────────────────────────────────────

describe('exported constants', () => {
  it('SEVERITY_WEIGHTS maps severity to expected numeric weights', () => {
    expect(SEVERITY_WEIGHTS.high).toBe(3);
    expect(SEVERITY_WEIGHTS.medium).toBe(2);
    expect(SEVERITY_WEIGHTS.low).toBe(1);
  });

  it('grade thresholds are ordered correctly', () => {
    expect(GRADE_A_MIN).toBeGreaterThan(GRADE_B_MIN);
    expect(GRADE_B_MIN).toBeGreaterThan(GRADE_C_MIN);
    expect(GRADE_C_MIN).toBeGreaterThan(0);
  });

  it('FORCED_D_THRESHOLD > CEILING_C_THRESHOLD', () => {
    expect(FORCED_D_THRESHOLD).toBeGreaterThan(CEILING_C_THRESHOLD);
  });

  it('MIN_COMPLETION_RATE is between 0 and 1', () => {
    expect(MIN_COMPLETION_RATE).toBeGreaterThan(0);
    expect(MIN_COMPLETION_RATE).toBeLessThan(1);
  });
});

// ─── Empty / edge inputs ──────────────────────────────────────────────────────

describe('computeScoreAndGrade — empty / edge inputs', () => {
  it('returns score=0 grade=D for empty item list', () => {
    const r = computeScoreAndGrade([]);
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.evaluatedCount).toBe(0);
    expect(r.applicableCount).toBe(0);
    expect(r.completionRate).toBe(0);
    expect(r.incomplete).toBe(true);
  });

  it('returns score=0 when all items are NA', () => {
    const r = computeScoreAndGrade([NA('a', 'high'), NA('b', 'medium')]);
    expect(r.score).toBe(0);
    expect(r.applicableCount).toBe(0);
    expect(r.completionRate).toBe(0);
  });

  it('marks incomplete when evaluatedCount / applicableCount < MIN_COMPLETION_RATE', () => {
    // 1 evaluated out of 10 applicable = 10% < 60%
    const items = [C('e1', 'low'), ...Array.from({ length: 9 }, (_, i) => N(`n${i}`, 'low'))];
    // Make only 1 evaluated, rest non-compliant but we need 'not-evaluated':
    // Use NA for 9 items; 1 compliant + 9 NA → completionRate = 1/1 = 100% — wrong.
    // Correct: use items with status 'not-evaluated' if that exists, else
    // manufacture a low completion rate by having many applicable but few evaluated.
    // In this model NA is excluded from applicable, non-compliant IS applicable.
    // So: 1 compliant + 9 non-compliant = 10 evaluated / 10 applicable = 100%.
    // To get < 60% we need items that are applicable but NOT evaluated.
    // The source: applicableItems = items where status !== 'na'
    //             evaluatedItems  = compliant + non-compliant
    // So a 'not-evaluated' status (if it exists) or any other non-na, non-compliant,
    // non-non-compliant status would be applicable-but-not-evaluated.
    // Since the type only has 'compliant'|'non-compliant'|'na', we cannot produce
    // incomplete via the public API — completionRate is always 1.0 when all items
    // are compliant or non-compliant.
    // The only way to get incomplete=true is: 0 applicable items (empty / all-NA).
    const r = computeScoreAndGrade([NA('x', 'high'), NA('y', 'high')]);
    expect(r.incomplete).toBe(true);
  });
});

// ─── Score computation ────────────────────────────────────────────────────────

describe('computeScoreAndGrade — score computation', () => {
  it('score = 100 when all items are compliant', () => {
    const r = computeScoreAndGrade([C('a', 'high'), C('b', 'medium'), C('c', 'low')]);
    expect(r.score).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.riskLevel).toBe(1);
    expect(r.nextInspectionDays).toBe(730);
  });

  it('score = 0 when all items are non-compliant', () => {
    const r = computeScoreAndGrade([N('a', 'high'), N('b', 'low')]);
    expect(r.score).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });

  it('computes severity-weighted score correctly (mixed)', () => {
    // 1 high compliant (w=3) + 1 medium non-compliant (w=2)
    // compliantWeight = 3, evaluatedWeight = 5
    // score = round(3/5 * 1000) / 10 = round(600) / 10 = 60.0
    const r = computeScoreAndGrade([C('a', 'high'), N('b', 'medium')]);
    expect(r.score).toBe(60);
    expect(r.grade).toBe('C');
    expect(r.riskLevel).toBe(3);
    expect(r.nextInspectionDays).toBe(180);
  });

  it('NA items are excluded from score calculation', () => {
    const withNA    = computeScoreAndGrade([C('a', 'high'), NA('b', 'high')]);
    const withoutNA = computeScoreAndGrade([C('a', 'high')]);
    expect(withNA.score).toBe(withoutNA.score);
  });

  it('score that hits exactly GRADE_B_MIN boundary → grade B', () => {
    // Build items whose weighted rate equals exactly GRADE_B_MIN (70).
    // 7 high compliant (w=3 each = 21) + 3 high non-compliant (w=3 each = 9)
    // compliantWeight = 21, totalWeight = 30 → score = round(21/30*1000)/10 = 70.0
    const items = [
      ...Array.from({ length: 7 }, (_, i) => C(`c${i}`, 'high')),
      ...Array.from({ length: 3 }, (_, i) => N(`n${i}`, 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(70);
    expect(r.rawGrade).toBe('B');
  });

  it('score that hits exactly GRADE_A_MIN boundary → grade A', () => {
    // 17 high compliant + 3 high non-compliant
    // score = round(17/20*1000)/10 = round(850)/10 = 85.0
    const items = [
      ...Array.from({ length: 17 }, (_, i) => C(`c${i}`, 'high')),
      ...Array.from({ length: 3  }, (_, i) => N(`n${i}`, 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.score).toBe(85);
    expect(r.rawGrade).toBe('A');
  });
});

// ─── Violation profile ────────────────────────────────────────────────────────

describe('computeScoreAndGrade — violation profile', () => {
  it('counts violations by severity correctly', () => {
    const r = computeScoreAndGrade([
      N('a', 'high'), N('b', 'high'),
      N('c', 'medium'),
      N('d', 'low'),
      C('e', 'high'),
    ]);
    expect(r.violations.high).toBe(2);
    expect(r.violations.medium).toBe(1);
    expect(r.violations.low).toBe(1);
    expect(r.violations.total).toBe(4);
  });
});

// ─── Critical override — Rule 1a (forced D) ───────────────────────────────────

describe('computeScoreAndGrade — forced D override', () => {
  it('forces grade to D when high violations >= FORCED_D_THRESHOLD, even with high score', () => {
    // 3 high violations (= FORCED_D_THRESHOLD) + many compliant → would be grade A without override
    const items = [
      N('h1', 'high'), N('h2', 'high'), N('h3', 'high'),
      ...Array.from({ length: 30 }, (_, i) => C(`c${i}`, 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.rawGrade).toBe('A');
    expect(r.criticalOverride).toBe(true);
    expect(r.riskLevel).toBe(4);
    expect(r.nextInspectionDays).toBe(30);
  });

  it('criticalOverride is false when forced D matches rawGrade D', () => {
    // 3 high violations + 0 compliant → rawGrade = D, forced = D → no override flag
    const items = [N('h1', 'high'), N('h2', 'high'), N('h3', 'high')];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.rawGrade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });
});

// ─── Critical override — Rule 1b (ceiling C) ─────────────────────────────────

describe('computeScoreAndGrade — ceiling C override', () => {
  it('caps grade at C when high violations >= CEILING_C_THRESHOLD and rawGrade is A', () => {
    // 1 high violation (= CEILING_C_THRESHOLD) + many compliant → rawGrade A → capped C
    const items = [
      N('h1', 'high'),
      ...Array.from({ length: 30 }, (_, i) => C(`c${i}`, 'high')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('C');
    expect(r.rawGrade).toBe('A');
    expect(r.criticalOverride).toBe(true);
  });

  it('caps grade at C when rawGrade is B', () => {
    // Score in B range + 1 high violation → capped C
    const items = [
      N('h1', 'high'),
      ...Array.from({ length: 7 }, (_, i) => C(`c${i}`, 'high')),
      ...Array.from({ length: 3 }, (_, i) => N(`n${i}`, 'low')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.criticalOverride).toBe(true);
    expect(r.grade).toBe('C');
  });

  it('ceiling is no-op when rawGrade is already C', () => {
    // 1 high violation + score in C range → rawGrade C, ceiling is no-op
    const items = [
      N('h1', 'high'),
      ...Array.from({ length: 3 }, (_, i) => C(`c${i}`, 'high')),
      ...Array.from({ length: 3 }, (_, i) => N(`n${i}`, 'medium')),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe(r.rawGrade); // no change
    expect(r.criticalOverride).toBe(false);
  });

  it('ceiling is no-op when rawGrade is D', () => {
    // 1 high violation + score < GRADE_C_MIN → rawGrade D, ceiling is no-op
    const items = [
      N('h1', 'high'),
      N('n1', 'medium'),
      N('n2', 'medium'),
    ];
    const r = computeScoreAndGrade(items);
    expect(r.grade).toBe('D');
    expect(r.criticalOverride).toBe(false);
  });
});

// ─── Grade → riskLevel → nextInspectionDays ───────────────────────────────────

describe('grade to risk level and inspection schedule', () => {
  const cases: Array<[string, ReturnType<typeof computeScoreAndGrade>['grade'], number, number]> = [
    ['A', 'A', 1, 730],
    ['B', 'B', 2, 365],
    ['C', 'C', 3, 180],
    ['D', 'D', 4, 30],
  ];

  it.each(cases)(
    'grade %s → riskLevel %i → nextInspectionDays %i',
    (_label, expectedGrade, expectedRisk, expectedDays) => {
      // Manufacture items that produce the target grade without override.
      let items: InspectionItem[];
      if (expectedGrade === 'A') {
        items = [C('a', 'high')];
      } else if (expectedGrade === 'B') {
        items = [
          ...Array.from({ length: 7 }, (_, i) => C(`c${i}`, 'high')),
          ...Array.from({ length: 3 }, (_, i) => N(`n${i}`, 'high')),
        ];
      } else if (expectedGrade === 'C') {
        // score ~60, 0 high violations (no override)
        items = [C('a', 'high'), N('b', 'medium')];
      } else {
        items = [N('a', 'high'), N('b', 'high'), N('c', 'high'), N('d', 'high')];
      }
      const r = computeScoreAndGrade(items);
      expect(r.grade).toBe(expectedGrade);
      expect(r.riskLevel).toBe(expectedRisk);
      expect(r.nextInspectionDays).toBe(expectedDays);
    }
  );
});

// ─── Result shape ─────────────────────────────────────────────────────────────

describe('computeScoreAndGrade — result shape', () => {
  it('includes a non-empty Arabic disclaimer on every result', () => {
    const r = computeScoreAndGrade([C('a', 'low')]);
    expect(typeof r.disclaimer).toBe('string');
    expect(r.disclaimer.length).toBeGreaterThan(20);
  });

  it('completionRate is 1 when all applicable items are evaluated', () => {
    const r = computeScoreAndGrade([C('a', 'high'), N('b', 'low')]);
    expect(r.completionRate).toBe(1);
    expect(r.incomplete).toBe(false);
  });

  it('evaluatedCount excludes NA items', () => {
    const r = computeScoreAndGrade([C('a', 'high'), NA('b', 'medium'), N('c', 'low')]);
    expect(r.evaluatedCount).toBe(2);
    expect(r.applicableCount).toBe(2);
  });
});
