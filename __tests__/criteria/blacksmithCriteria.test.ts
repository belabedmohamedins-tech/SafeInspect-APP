// __tests__/criteria/blacksmithCriteria.test.ts
import { blacksmithCriteria } from '../../src/criteria/blacksmithCriteria';
import { InspectionItem } from '../../src/types';

describe('blacksmithCriteria', () => {
  it('has at least 1 criterion', () => {
    expect(blacksmithCriteria.length).toBeGreaterThanOrEqual(1);
  });

  it('has no duplicate IDs', () => {
    const ids = blacksmithCriteria.map((item: InspectionItem) => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs use BSM- prefix', () => {
    blacksmithCriteria.forEach(item =>
      expect(item.id).toMatch(/^BSM-/)
    );
  });

  it('all items have required fields', () => {
    blacksmithCriteria.forEach((item: InspectionItem) => {
      expect(item.axis).toBeTruthy();
      expect(item.criteria).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('axes cover expected domains', () => {
    const axes = new Set(blacksmithCriteria.map(i => i.axis));
    // Actual axes present in source
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});
