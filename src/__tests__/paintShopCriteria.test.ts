// src/__tests__/paintShopCriteria.test.ts
import { paintShopCriteria } from '../criteria/paintShopCriteria';
import { InspectionItem } from '../types';

describe('paintShopCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(paintShopCriteria)).toBe(true);
    expect(paintShopCriteria.length).toBeGreaterThan(0);
  });

  it('every item has required fields', () => {
    for (const item of paintShopCriteria as InspectionItem[]) {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toMatch(/^(low|medium|high)$/);
      expect(item.controlType).toMatch(/^(visual|doc|measurement)$/);
    }
  });

  it('majority of items are high severity (VOC + fire risk)', () => {
    const highCount = paintShopCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBe(8);
  });

  it('covers expected axes', () => {
    const axes = new Set(paintShopCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('التهوية ومنع التلوث الهوائي');
    expect(axes).toContain('تسيير النفايات الخطرة');
    expect(axes).toContain('السلامة المهنية');
  });

  it('PNT-03-02 requires hazardous waste contract (doc)', () => {
    const item = paintShopCriteria.find((c: InspectionItem) => c.id === 'PNT-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.axis).toBe('تسيير النفايات الخطرة');
  });

  it('PNT-04-03 requires CO2/dry powder extinguisher (visual, high)', () => {
    const item = paintShopCriteria.find((c: InspectionItem) => c.id === 'PNT-04-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });
});
