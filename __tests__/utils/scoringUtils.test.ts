// __tests__/utils/scoringUtils.test.ts
import {
  computeScoreAndGrade,
  GRADE_A_MIN,
  GRADE_B_MIN,
  GRADE_C_MIN,
  FORCED_D_THRESHOLD,
  CEILING_C_THRESHOLD,
  MIN_COMPLETION_RATE,
  SEVERITY_WEIGHTS,
} from '../../src/utils/scoringUtils';
import { InspectionItem } from '../../src/types';

function makeItem(
  id: string,
  status: 'compliant' | 'non-compliant' | 'na' | 'not-evaluated',
  severity: 'high' | 'medium' | 'low' = 'medium'
): InspectionItem {
  return { id, complianceStatus: status, severity } as unknown as InspectionItem;
}

// Helpers to build batches
const compliant = (n: number, sev: 'high' | 'medium' | 'low' = 'medium') =>
  Array.from({ length: n }, (_, i) => makeItem(`c-${sev}-${i}`, 'compliant', sev));
const nonCompliant = (n: number, sev: 'high' | 'medium' | 'low' = 'medium') =>
  Array.from({ length: n }, (_, i) => makeItem(`nc-${sev}-${i}`, 'non-compliant', sev));
const naItems = (n: number) =>
  Array.from({ length: n }, (_, i) => makeItem(`na-${i}`, 'na'));
const notEval = (n: number) =>
  Array.from({ length: n }, (_, i) => makeItem(`ne-${i}`, 'not-evaluated'));

describe('computeScoreAndGrade', () => {
  describe('empty / edge cases', () => {
    it('returns score=0 and grade=D for empty items', () => {
      const r = computeScoreAndGrade([]);
      expect(r.score).toBe(0);
      expect(r.grade).toBe('D');
      expect(r.incomplete).toBe(true);
    });

    it('returns score=0 when all items are NA', () => {
      const r = computeScoreAndGrade(naItems(5));
      expect(r.score).toBe(0);
      expect(r.applicableCount).toBe(0);
    });

    it('marks incomplete when fewer than 60% of applicable items are evaluated', () => {
      // 1 evaluated out of 10 applicable = 10%
      const items = [...compliant(1), ...notEval(9)];
      const r = computeScoreAndGrade(items);
      expect(r.incomplete).toBe(true);
      expect(r.completionRate).toBeLessThan(MIN_COMPLETION_RATE);
    });

    it('is NOT incomplete when >= 60% evaluated', () => {
      const items = [...compliant(6), ...notEval(4)];
      const r = computeScoreAndGrade(items);
      expect(r.incomplete).toBe(false);
    });
  });

  describe('score calculation', () => {
    it('returns 100 when all items are compliant', () => {
      const r = computeScoreAndGrade([...compliant(5, 'high'), ...compliant(5, 'low')]);
      expect(r.score).toBe(100);
    });

    it('returns 0 when all items are non-compliant', () => {
      const r = computeScoreAndGrade(nonCompliant(5));
      expect(r.score).toBe(0);
    });

    it('weights high severity items more than low', () => {
      // 1 compliant-high (w=3) vs 1 non-compliant-low (w=1) → 3/(3+1)*100 = 75
      const items = [makeItem('c1', 'compliant', 'high'), makeItem('nc1', 'non-compliant', 'low')];
      const r = computeScoreAndGrade(items);
      expect(r.score).toBe(75);
    });

    it('excludes NA items from both numerator and denominator', () => {
      const items = [...compliant(2, 'medium'), ...naItems(10)];
      const r = computeScoreAndGrade(items);
      expect(r.score).toBe(100);
      expect(r.applicableCount).toBe(2);
    });
  });

  describe('grade assignment (no override)', () => {
    it('assigns grade A when score >= GRADE_A_MIN and 0 high violations', () => {
      // All compliant → score 100
      const r = computeScoreAndGrade(compliant(10));
      expect(r.grade).toBe('A');
      expect(r.rawGrade).toBe('A');
      expect(r.criticalOverride).toBe(false);
    });

    it('assigns grade B for score in [70, 85)', () => {
      // 7 compliant-medium (w=14) + 3 non-compliant-medium (w=6) = 14/20 = 70%
      const items = [...compliant(7), ...nonCompliant(3)];
      const r = computeScoreAndGrade(items);
      expect(r.score).toBe(70);
      expect(r.grade).toBe('B');
    });

    it('assigns grade C for score in [50, 70)', () => {
      // 5 compliant + 5 non-compliant same severity = 50%
      const items = [...compliant(5), ...nonCompliant(5)];
      const r = computeScoreAndGrade(items);
      expect(r.score).toBe(50);
      expect(r.grade).toBe('C');
    });

    it('assigns grade D for score < 50', () => {
      const items = [...compliant(1), ...nonCompliant(9)];
      const r = computeScoreAndGrade(items);
      expect(r.grade).toBe('D');
    });
  });

  describe('critical override rules', () => {
    it('caps grade at C when high violations >= CEILING_C_THRESHOLD and raw grade is A', () => {
      // All compliant except 1 high non-compliant → raw grade A, but 1 high → ceiling C
      const items = [...compliant(20), ...nonCompliant(CEILING_C_THRESHOLD, 'high')];
      const r = computeScoreAndGrade(items);
      expect(r.grade).toBe('C');
      expect(r.rawGrade).toBe('A');
      expect(r.criticalOverride).toBe(true);
    });

    it('forces grade D when high violations >= FORCED_D_THRESHOLD', () => {
      const items = [...compliant(20), ...nonCompliant(FORCED_D_THRESHOLD, 'high')];
      const r = computeScoreAndGrade(items);
      expect(r.grade).toBe('D');
      expect(r.violations.high).toBe(FORCED_D_THRESHOLD);
    });

    it('does NOT override when raw grade is already C or D and 1 high violation', () => {
      // Only 1 high violation (= CEILING_C_THRESHOLD), raw grade is D → ceiling is no-op
      const items = [...compliant(1), ...nonCompliant(9), ...nonCompliant(CEILING_C_THRESHOLD, 'high')];
      const r = computeScoreAndGrade(items);
      expect(r.criticalOverride).toBe(false);
      expect(['C', 'D']).toContain(r.grade);
    });
  });

  describe('violations profile', () => {
    it('counts violations by severity', () => {
      const items = [
        ...nonCompliant(2, 'high'),
        ...nonCompliant(3, 'medium'),
        ...nonCompliant(1, 'low'),
      ];
      const r = computeScoreAndGrade(items);
      expect(r.violations.high).toBe(2);
      expect(r.violations.medium).toBe(3);
      expect(r.violations.low).toBe(1);
      expect(r.violations.total).toBe(6);
    });
  });

  describe('riskLevel and nextInspectionDays', () => {
    it('grade A → riskLevel 1 → 730 days', () => {
      const r = computeScoreAndGrade(compliant(10));
      expect(r.riskLevel).toBe(1);
      expect(r.nextInspectionDays).toBe(730);
    });

    it('grade D → riskLevel 4 → 30 days', () => {
      const r = computeScoreAndGrade(nonCompliant(10));
      expect(r.riskLevel).toBe(4);
      expect(r.nextInspectionDays).toBe(30);
    });
  });

  describe('output shape', () => {
    it('includes evaluatedCount, applicableCount, completionRate, disclaimer', () => {
      const items = [...compliant(8), ...naItems(2)];
      const r = computeScoreAndGrade(items);
      expect(r.evaluatedCount).toBe(8);
      expect(r.applicableCount).toBe(8);
      expect(r.completionRate).toBe(1);
      expect(typeof r.disclaimer).toBe('string');
      expect(r.disclaimer.length).toBeGreaterThan(10);
    });
  });

  describe('SEVERITY_WEIGHTS constants', () => {
    it('exports correct weights', () => {
      expect(SEVERITY_WEIGHTS.high).toBe(3);
      expect(SEVERITY_WEIGHTS.medium).toBe(2);
      expect(SEVERITY_WEIGHTS.low).toBe(1);
    });
  });
});
