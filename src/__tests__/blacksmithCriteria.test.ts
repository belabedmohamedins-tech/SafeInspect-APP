// src/__tests__/blacksmithCriteria.test.ts
import { blacksmithCriteria } from '../criteria/blacksmithCriteria';
import { InspectionItem } from '../types';

describe('blacksmithCriteria', () => {
  it('has at least 1 criterion', () => {
    expect(blacksmithCriteria.length).toBeGreaterThanOrEqual(1);
  });

  it('has no duplicate IDs', () => {
    const ids = blacksmithCriteria.map((item: InspectionItem) => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs match BSM- prefix pattern', () => {
    blacksmithCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^BSM-/);
    });
  });

  it('all items have required fields', () => {
    blacksmithCriteria.forEach((item: InspectionItem) => {
      expect(item.axis).toBeTruthy();
      expect(item.criteria).toBeTruthy();
      expect(item.legalReference).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('covers occupational safety axis', () => {
    const axes = new Set(blacksmithCriteria.map(i => i.axis));
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});
