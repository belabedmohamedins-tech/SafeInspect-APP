import { blacksmithCriteria } from '../criteria/blacksmithCriteria';
import { InspectionItem } from '../types';

describe('blacksmithCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(blacksmithCriteria)).toBe(true);
  });

  it('contains exactly 9 criteria', () => {
    expect(blacksmithCriteria).toHaveLength(9);
  });

  it('has no duplicate IDs', () => {
    const ids = blacksmithCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the BLS-XX-XX pattern', () => {
    blacksmithCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^BLS-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    blacksmithCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    blacksmithCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    blacksmithCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    blacksmithCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    blacksmithCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high severity (welding/fire/gas hazards)', () => {
    const highCount = blacksmithCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(5);
  });

  it('covers expected axes', () => {
    const axes = new Set(blacksmithCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('الموقع والتهيئة');
    expect(axes).toContain('النفايات المعدنية');
    expect(axes).toContain('السلامة المهنية');
  });

  it('gas storage criterion exists (BLS-04-02)', () => {
    const gasItem = blacksmithCriteria.find((c: InspectionItem) => c.id === 'BLS-04-02');
    expect(gasItem).toBeDefined();
    expect(gasItem!.severity).toBe('high');
  });
});
