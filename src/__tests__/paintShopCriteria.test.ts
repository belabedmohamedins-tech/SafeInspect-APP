import { paintShopCriteria } from '../criteria/paintShopCriteria';
import { InspectionItem } from '../types';

describe('paintShopCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(paintShopCriteria)).toBe(true);
  });

  it('contains exactly 9 criteria', () => {
    expect(paintShopCriteria).toHaveLength(9);
  });

  it('has no duplicate IDs', () => {
    const ids = paintShopCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the PNT-XX-XX pattern', () => {
    paintShopCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^PNT-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    paintShopCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    paintShopCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    paintShopCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    paintShopCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    paintShopCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items are high severity (VOC + fire risk)', () => {
    const highCount = paintShopCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBe(9);
  });

  it('covers expected axes', () => {
    const axes = new Set(paintShopCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('التهوية ومنع التلوث الهوائي');
    expect(axes).toContain('تسيير النفايات الخطرة');
    expect(axes).toContain('السلامة المهنية');
  });

  it('open flame ban criterion exists (PNT-04-02)', () => {
    const flameItem = paintShopCriteria.find((c: InspectionItem) => c.id === 'PNT-04-02');
    expect(flameItem).toBeDefined();
    expect(flameItem!.severity).toBe('high');
  });

  it('hazardous waste contractor criterion exists (PNT-03-02)', () => {
    const contractItem = paintShopCriteria.find((c: InspectionItem) => c.id === 'PNT-03-02');
    expect(contractItem).toBeDefined();
    expect(contractItem!.controlType).toBe('doc');
  });
});
