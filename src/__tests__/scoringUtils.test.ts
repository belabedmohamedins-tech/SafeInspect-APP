import { Category, InspectionItem } from '../types';
import { computeScoreAndGrade } from '../utils/scoringUtils';

function makeItem(
  overrides: Partial<InspectionItem> & { complianceStatus: InspectionItem['complianceStatus'] }
): InspectionItem {
  return {
    id: Math.random().toString(),
    criteria: 'c1',
    legalReference: '',
    severity: 'low',
    axis: '',
    category: undefined,
    ...overrides,
  };
}

describe('computeScoreAndGrade — empty input', () => {
  it('returns undefined score and grade for empty array', () => {
    const result = computeScoreAndGrade([]);
    expect(result.score).toBeUndefined();
    expect(result.grade).toBeUndefined();
  });

  it('returns null for every indicator when array is empty', () => {
    const result = computeScoreAndGrade([]);
    expect(result.indicators.doc).toBeNull();
    expect(result.indicators.clean).toBeNull();
    expect(result.indicators.waste).toBeNull();
    expect(result.indicators.health).toBeNull();
  });

  it('returns undefined score when all items are not-evaluated', () => {
    const items = [
      makeItem({ complianceStatus: 'not-evaluated', category: 'نظافة' }),
      makeItem({ complianceStatus: 'not-evaluated', category: 'بيئية' }),
    ];
    const result = computeScoreAndGrade(items);
    expect(result.score).toBeUndefined();
    expect(result.grade).toBeUndefined();
  });
});

describe('computeScoreAndGrade — grade thresholds', () => {
  function buildCategoryItems(
    category: Category,
    compliantCount: number,
    totalCount: number
  ): InspectionItem[] {
    return Array.from({ length: totalCount }, (_, i) =>
      makeItem({
        category,
        complianceStatus: i < compliantCount ? 'compliant' : 'non-compliant',
      })
    );
  }

  it('grades A when score >= 85', () => {
    const items = buildCategoryItems('نظافة', 17, 20);
    const result = computeScoreAndGrade(items);
    expect(result.grade).toBe('A');
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  it('grades B when score is between 70 and 84', () => {
    const items = buildCategoryItems('نظافة', 14, 20);
    const result = computeScoreAndGrade(items);
    expect(result.grade).toBe('B');
  });

  it('grades C when score is between 50 and 69', () => {
    const items = buildCategoryItems('نظافة', 10, 20);
    const result = computeScoreAndGrade(items);
    expect(result.grade).toBe('C');
  });

  it('grades D when score is below 50', () => {
    const items = buildCategoryItems('نظافة', 4, 20);
    const result = computeScoreAndGrade(items);
    expect(result.grade).toBe('D');
  });

  it('grades A at exactly 85', () => {
    const items = buildCategoryItems('نظافة', 85, 100);
    const result = computeScoreAndGrade(items);
    expect(result.grade).toBe('A');
    expect(result.score).toBe(85);
  });

  it('grades B at exactly 70', () => {
    const items = buildCategoryItems('نظافة', 70, 100);
    const result = computeScoreAndGrade(items);
    expect(result.grade).toBe('B');
    expect(result.score).toBe(70);
  });
});

describe('computeScoreAndGrade — category to indicator mapping', () => {
  it('maps تنظيمية to doc indicator', () => {
    const items = [makeItem({ category: 'تنظيمية', complianceStatus: 'compliant' })];
    const result = computeScoreAndGrade(items);
    expect(result.indicators.doc).toBe(100);
    expect(result.indicators.clean).toBeNull();
  });

  it('maps نظافة to clean indicator', () => {
    const items = [makeItem({ category: 'نظافة', complianceStatus: 'compliant' })];
    const result = computeScoreAndGrade(items);
    expect(result.indicators.clean).toBe(100);
  });

  it('maps بيئية to waste indicator', () => {
    const items = [makeItem({ category: 'بيئية', complianceStatus: 'compliant' })];
    const result = computeScoreAndGrade(items);
    expect(result.indicators.waste).toBe(100);
  });

  it('maps صحيه to health indicator', () => {
    const items = [makeItem({ category: 'صحيه', complianceStatus: 'compliant' })];
    const result = computeScoreAndGrade(items);
    expect(result.indicators.health).toBe(100);
  });

  it('maps سلامة to health indicator', () => {
    const items = [makeItem({ category: 'سلامة', complianceStatus: 'compliant' })];
    const result = computeScoreAndGrade(items);
    expect(result.indicators.health).toBe(100);
  });

  it('maps عامة to clean indicator', () => {
    const items = [makeItem({ category: 'عامة', complianceStatus: 'compliant' })];
    const result = computeScoreAndGrade(items);
    expect(result.indicators.clean).toBe(100);
  });
});

describe('computeScoreAndGrade — na items excluded', () => {
  it('ignores na items when computing score', () => {
    const items = [
      makeItem({ category: 'نظافة', complianceStatus: 'compliant' }),
      makeItem({ category: 'نظافة', complianceStatus: 'compliant' }),
      makeItem({ category: 'نظافة', complianceStatus: 'na' }),
      makeItem({ category: 'نظافة', complianceStatus: 'na' }),
    ];
    const result = computeScoreAndGrade(items);
    expect(result.indicators.clean).toBe(100);
  });
});

describe('computeScoreAndGrade — weighted average', () => {
  it('weights indicators correctly when all four are present', () => {
    const items = [
      makeItem({ category: 'تنظيمية', complianceStatus: 'compliant' }),
      makeItem({ category: 'نظافة', complianceStatus: 'compliant' }),
      makeItem({ category: 'بيئية', complianceStatus: 'compliant' }),
      makeItem({ category: 'صحيه', complianceStatus: 'compliant' }),
    ];
    const result = computeScoreAndGrade(items);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A');
  });

  it('excludes missing indicators from weight denominator', () => {
    const items = [makeItem({ category: 'نظافة', complianceStatus: 'compliant' })];
    const result = computeScoreAndGrade(items);
    expect(result.score).toBe(100);
  });
});