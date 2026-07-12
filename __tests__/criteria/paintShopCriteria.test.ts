import { paintShopCriteria } from '../../src/criteria/paintShopCriteria';

describe('paintShopCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(paintShopCriteria)).toBe(true);
  });

  it('should contain exactly 9 items', () => {
    expect(paintShopCriteria).toHaveLength(9);
  });

  it('should have no duplicate IDs', () => {
    const ids = paintShopCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match PNT-XX-XX pattern', () => {
    paintShopCriteria.forEach(item => {
      expect(item.id).toMatch(/^PNT-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    paintShopCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    paintShopCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    paintShopCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('all items should be high severity (hazardous activity)', () => {
    const high = paintShopCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBe(9);
  });

  it('PNT-02-01 should require spray booth ventilation (visual)', () => {
    const item = paintShopCriteria.find(i => i.id === 'PNT-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.axis).toBe('التهوية ومنع التلوث الهوائي');
  });

  it('PNT-03-02 should require hazardous waste contract (doc)', () => {
    const item = paintShopCriteria.find(i => i.id === 'PNT-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.axis).toBe('تسيير النفايات الخطرة');
  });

  it('PNT-04-02 should prohibit open flame (fire prevention)', () => {
    const item = paintShopCriteria.find(i => i.id === 'PNT-04-02');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('السلامة المهنية');
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
