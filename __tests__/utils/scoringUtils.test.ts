// __tests__/utils/scoringUtils.test.ts
import { computeScoreAndGrade } from '../../src/utils/scoringUtils';
import { InspectionItem } from '../../src/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeItem(
  overrides: Partial<InspectionItem> & { complianceStatus: InspectionItem['complianceStatus'] }
): InspectionItem {
  return {
    id: 'TEST-01',
    axis: 'الموقع والتهيئة العامة',
    category: 'بيئية',
    criteria: 'test criteria',
    legalReference: '',
    severity: 'medium',
    controlType: 'visual',
    ...overrides,
  };
}

// ─── empty / not-evaluated ───────────────────────────────────────────────────

describe('computeScoreAndGrade', () => {
  describe('empty / not-evaluated inputs', () => {
    it('returns undefined score+grade for empty array', () => {
      const result = computeScoreAndGrade([]);
      expect(result.score).toBeUndefined();
      expect(result.grade).toBeUndefined();
    });

    it('returns undefined score+grade when all items are not-evaluated', () => {
      const items = [
        makeItem({ complianceStatus: 'not-evaluated', category: 'بيئية' }),
        makeItem({ complianceStatus: 'not-evaluated', category: 'نظافة' }),
      ];
      const result = computeScoreAndGrade(items);
      expect(result.score).toBeUndefined();
      expect(result.grade).toBeUndefined();
    });

    it('returns null for each indicator when nothing is evaluated', () => {
      const result = computeScoreAndGrade([
        makeItem({ complianceStatus: 'not-evaluated', category: 'بيئية' }),
      ]);
      expect(result.indicators.doc).toBeNull();
      expect(result.indicators.clean).toBeNull();
      expect(result.indicators.waste).toBeNull();
      expect(result.indicators.health).toBeNull();
    });
  });

  // ─── perfect compliance ────────────────────────────────────────────────────

  describe('perfect compliance', () => {
    it('scores 100 and grade A when every item is compliant', () => {
      const items: InspectionItem[] = [
        makeItem({ complianceStatus: 'compliant', category: 'تنظيمية' }),   // → doc
        makeItem({ complianceStatus: 'compliant', category: 'نظافة' }),     // → clean
        makeItem({ complianceStatus: 'compliant', category: 'بيئية' }),     // → waste
        makeItem({ complianceStatus: 'compliant', category: 'صحيه' }),      // → health
      ];
      const { score, grade } = computeScoreAndGrade(items);
      expect(score).toBe(100);
      expect(grade).toBe('A');
    });
  });

  // ─── zero compliance ──────────────────────────────────────────────────────

  describe('zero compliance', () => {
    it('scores 0 and grade D when every item is non-compliant', () => {
      const items: InspectionItem[] = [
        makeItem({ complianceStatus: 'non-compliant', category: 'تنظيمية' }),
        makeItem({ complianceStatus: 'non-compliant', category: 'نظافة' }),
        makeItem({ complianceStatus: 'non-compliant', category: 'بيئية' }),
        makeItem({ complianceStatus: 'non-compliant', category: 'صحيه' }),
      ];
      const { score, grade } = computeScoreAndGrade(items);
      expect(score).toBe(0);
      expect(grade).toBe('D');
    });
  });

  // ─── grade boundaries ─────────────────────────────────────────────────────

  describe('grade boundaries', () => {
    function singleIndicatorScore(pct: number): ReturnType<typeof computeScoreAndGrade> {
      // Use only 'بيئية' (waste) so total weight = waste weight only → renormalised to 100
      const compliant = Math.round(pct);
      const total = 100;
      const items: InspectionItem[] = [
        ...Array.from({ length: compliant }, (_, i) =>
          makeItem({ id: `C-${i}`, complianceStatus: 'compliant', category: 'بيئية' })
        ),
        ...Array.from({ length: total - compliant }, (_, i) =>
          makeItem({ id: `N-${i}`, complianceStatus: 'non-compliant', category: 'بيئية' })
        ),
      ];
      return computeScoreAndGrade(items);
    }

    it('grade A at exactly 85', () => {
      const { grade } = singleIndicatorScore(85);
      expect(grade).toBe('A');
    });

    it('grade B at exactly 70', () => {
      const { grade } = singleIndicatorScore(70);
      expect(grade).toBe('B');
    });

    it('grade B at 84 (just below A)', () => {
      const { grade } = singleIndicatorScore(84);
      expect(grade).toBe('B');
    });

    it('grade C at exactly 50', () => {
      const { grade } = singleIndicatorScore(50);
      expect(grade).toBe('C');
    });

    it('grade C at 69 (just below B)', () => {
      const { grade } = singleIndicatorScore(69);
      expect(grade).toBe('C');
    });

    it('grade D at 49 (just below C)', () => {
      const { grade } = singleIndicatorScore(49);
      expect(grade).toBe('D');
    });
  });

  // ─── category → indicator mapping ─────────────────────────────────────────

  describe('category-to-indicator mapping', () => {
    it('"تنظيمية" maps to doc indicator', () => {
      const items = [makeItem({ complianceStatus: 'compliant', category: 'تنظيمية' })];
      const { indicators } = computeScoreAndGrade(items);
      expect(indicators.doc).toBe(100);
      expect(indicators.clean).toBeNull();
      expect(indicators.waste).toBeNull();
      expect(indicators.health).toBeNull();
    });

    it('"نظافة" maps to clean indicator', () => {
      const items = [makeItem({ complianceStatus: 'compliant', category: 'نظافة' })];
      expect(computeScoreAndGrade(items).indicators.clean).toBe(100);
    });

    it('"بيئية" maps to waste indicator', () => {
      const items = [makeItem({ complianceStatus: 'compliant', category: 'بيئية' })];
      expect(computeScoreAndGrade(items).indicators.waste).toBe(100);
    });

    it('"صحيه" maps to health indicator', () => {
      const items = [makeItem({ complianceStatus: 'compliant', category: 'صحيه' })];
      expect(computeScoreAndGrade(items).indicators.health).toBe(100);
    });

    it('"سلامة" maps to health indicator', () => {
      const items = [makeItem({ complianceStatus: 'compliant', category: 'سلامة' })];
      expect(computeScoreAndGrade(items).indicators.health).toBe(100);
    });

    it('"عامة" maps to clean indicator', () => {
      const items = [makeItem({ complianceStatus: 'compliant', category: 'عامة' })];
      expect(computeScoreAndGrade(items).indicators.clean).toBe(100);
    });
  });

  // ─── axis fallback mapping ─────────────────────────────────────────────────

  describe('axis-based fallback mapping (no category match)', () => {
    it('axis containing "وثائق" falls back to doc', () => {
      const items = [
        makeItem({ complianceStatus: 'compliant', category: 'UNKNOWN', axis: 'هوية المنشأة والوثائق' }),
      ];
      expect(computeScoreAndGrade(items).indicators.doc).toBe(100);
    });

    it('axis containing "مياه" falls back to waste', () => {
      const items = [
        makeItem({ complianceStatus: 'compliant', category: 'UNKNOWN', axis: 'المياه والصرف الصحي' }),
      ];
      expect(computeScoreAndGrade(items).indicators.waste).toBe(100);
    });

    it('axis containing "سلامة" falls back to health', () => {
      const items = [
        makeItem({ complianceStatus: 'compliant', category: 'UNKNOWN', axis: 'السلامة العامة' }),
      ];
      expect(computeScoreAndGrade(items).indicators.health).toBe(100);
    });

    it('completely unknown category AND axis falls back to clean', () => {
      const items = [
        makeItem({ complianceStatus: 'compliant', category: 'UNKNOWN', axis: 'UNKNOWN' }),
      ];
      expect(computeScoreAndGrade(items).indicators.clean).toBe(100);
    });
  });

  // ─── NA items are ignored in scoring ──────────────────────────────────────

  describe('na items excluded from scoring', () => {
    it('na items do not count as compliant or non-compliant', () => {
      const items = [
        makeItem({ id: 'C', complianceStatus: 'compliant', category: 'بيئية' }),
        makeItem({ id: 'NA', complianceStatus: 'na', category: 'بيئية' }),
      ];
      // Only 1 evaluated item (compliant) → waste indicator = 100
      expect(computeScoreAndGrade(items).indicators.waste).toBe(100);
    });

    it('returns undefined score when only na items present', () => {
      const items = [makeItem({ complianceStatus: 'na', category: 'بيئية' })];
      expect(computeScoreAndGrade(items).score).toBeUndefined();
    });
  });

  // ─── weighted average renormalisation ─────────────────────────────────────

  describe('weighted renormalisation', () => {
    it('score rounds to 1 decimal place', () => {
      // 2 compliant, 1 non-compliant in waste → 66.666…% → must round to 66.7
      const items = [
        makeItem({ id: '1', complianceStatus: 'compliant', category: 'بيئية' }),
        makeItem({ id: '2', complianceStatus: 'compliant', category: 'بيئية' }),
        makeItem({ id: '3', complianceStatus: 'non-compliant', category: 'بيئية' }),
      ];
      const { score } = computeScoreAndGrade(items);
      expect(score).toBe(66.7);
    });
  });
});
