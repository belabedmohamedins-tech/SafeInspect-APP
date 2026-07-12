import { baseGeneralCriteria } from '../../src/criteria/baseGeneralCriteria';

describe('baseGeneralCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(baseGeneralCriteria)).toBe(true);
  });

  it('should contain exactly 26 items', () => {
    expect(baseGeneralCriteria).toHaveLength(26);
  });

  it('should have no duplicate IDs', () => {
    const ids = baseGeneralCriteria.map(item => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs should match BGN-XX-XX pattern', () => {
    baseGeneralCriteria.forEach(item => {
      expect(item.id).toMatch(/^BGN-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    baseGeneralCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria and legalReference', () => {
    baseGeneralCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    baseGeneralCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('should have high severity majority (general compliance baseline)', () => {
    const high = baseGeneralCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBeGreaterThanOrEqual(12);
  });

  it('BGN-01-01 should be doc type for operating licence', () => {
    const item = baseGeneralCriteria.find(i => i.id === 'BGN-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('هوية المنشأة والوثائق');
  });

  it('BGN-08-01 should cover fire fighting equipment (safety axis)', () => {
    const item = baseGeneralCriteria.find(i => i.id === 'BGN-08-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('السلامة العامة والوقاية من الحوادث');
    expect(item!.category).toBe('سلامة');
    expect(item!.severity).toBe('high');
  });

  it('BGN-03-06 should require ONA contract for septic tank', () => {
    const item = baseGeneralCriteria.find(i => i.id === 'BGN-03-06');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('BGN-07-05 should require authorized pesticide use', () => {
    const item = baseGeneralCriteria.find(i => i.id === 'BGN-07-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(baseGeneralCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('الموقع والتهيئة العامة')).toBe(true);
    expect(axes.has('المياه والصرف الصحي')).toBe(true);
    expect(axes.has('النظافة العامة وتسيير النفايات')).toBe(true);
    expect(axes.has('مكافحة النواقل')).toBe(true);
    expect(axes.has('السلامة العامة والوقاية من الحوادث')).toBe(true);
  });

  it('should include all expected categories', () => {
    const categories = new Set(baseGeneralCriteria.map(i => i.category));
    expect(categories.has('تنظيمية')).toBe(true);
    expect(categories.has('بيئية')).toBe(true);
    expect(categories.has('نظافة')).toBe(true);
    expect(categories.has('سلامة')).toBe(true);
  });

  it('water and sanitation axis should have 6 items', () => {
    const waterItems = baseGeneralCriteria.filter(i => i.axis === 'المياه والصرف الصحي');
    expect(waterItems).toHaveLength(6);
  });

  it('safety axis should have 3 items', () => {
    const safetyItems = baseGeneralCriteria.filter(i => i.axis === 'السلامة العامة والوقاية من الحوادث');
    expect(safetyItems).toHaveLength(3);
  });
});
