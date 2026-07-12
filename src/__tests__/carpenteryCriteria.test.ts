import { carpenteryCriteria } from '../criteria/carpenteryCriteria';
import { InspectionItem } from '../types';

describe('carpenteryCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(carpenteryCriteria)).toBe(true);
  });

  it('contains exactly 8 criteria', () => {
    expect(carpenteryCriteria).toHaveLength(8);
  });

  it('has no duplicate IDs', () => {
    const ids = carpenteryCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the CAR-XX-XX pattern', () => {
    carpenteryCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^CAR-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    carpenteryCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    carpenteryCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    carpenteryCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    carpenteryCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    carpenteryCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high severity (sawdust fire + machine guards)', () => {
    const highCount = carpenteryCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(6);
  });

  it('covers expected axes', () => {
    const axes = new Set(carpenteryCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('الموقع والتهيئة');
    expect(axes).toContain('نفايات الخشب والألمنيوم');
    expect(axes).toContain('السلامة المهنية');
  });

  it('machine guard criterion exists (CAR-04-02)', () => {
    const guardItem = carpenteryCriteria.find((c: InspectionItem) => c.id === 'CAR-04-02');
    expect(guardItem).toBeDefined();
    expect(guardItem!.severity).toBe('high');
  });

  it('open burning ban criterion exists (CAR-03-02)', () => {
    const burnItem = carpenteryCriteria.find((c: InspectionItem) => c.id === 'CAR-03-02');
    expect(burnItem).toBeDefined();
    expect(burnItem!.severity).toBe('high');
  });
});
