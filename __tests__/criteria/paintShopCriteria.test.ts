// __tests__/criteria/paintShopCriteria.test.ts
import { paintShopCriteria } from '../../src/criteria/paintShopCriteria';
import { InspectionItem } from '../../src/types';

describe('paintShopCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(paintShopCriteria)).toBe(true);
    expect(paintShopCriteria.length).toBeGreaterThan(0);
  });

  it('majority items are high severity (8 of 10)', () => {
    const high = paintShopCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBe(8);
  });

  it('PNT-02-01 should require spray booth ventilation (visual)', () => {
    const item = paintShopCriteria.find(i => i.id === 'PNT-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('PNT-03-02 should require hazardous waste contract (doc)', () => {
    const item = paintShopCriteria.find(i => i.id === 'PNT-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    // Axis is 'تسيير النفايات الخطرة' in source
    expect(item!.axis).toBe('تسيير النفايات الخطرة');
  });

  it('PNT-04-02 should prohibit open flame (fire prevention)', () => {
    const item = paintShopCriteria.find(i => i.id === 'PNT-04-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('PNT-04-03 should require CO2/dry powder extinguisher', () => {
    const item = paintShopCriteria.find(i => i.id === 'PNT-04-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(paintShopCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('التهوية ومنع التلوث الهوائي')).toBe(true);
    expect(axes.has('تسيير النفايات الخطرة')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});
