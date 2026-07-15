import { gplCriteria } from '../../src/criteria/gplCriteria';

describe('gplCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(gplCriteria)).toBe(true);
  });

  it('should contain exactly 11 items', () => {
    expect(gplCriteria).toHaveLength(11);
  });

  it('should have no duplicate IDs', () => {
    const ids = gplCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match GPL-XX-XX pattern', () => {
    gplCriteria.forEach(item => {
      expect(item.id).toMatch(/^GPL-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    gplCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    gplCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    gplCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('GPL-01-01 operating licence should be doc and high severity', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('GPL-01-02 professional accreditation should be doc', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-01-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.axis).toBe('هوية المنشأة والوثائق');
  });

  it('GPL-02-02 separation of full/empty cylinders should be medium severity', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-02-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  it('GPL-03-01 open flame ban should be visual high severity', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('الوقاية من الحريق والانفجار');
  });

  it('GPL-03-02 should require minimum 2 CO2/dry powder extinguishers', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-03-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('visual');
  });

  it('GPL-03-03 emergency gas leak procedures should be doc', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-03-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('GPL-04-01 spark-free tools should be visual safety', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-04-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.category).toBe('سلامة');
  });

  it('GPL-04-02 maintenance logbook should be doc', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-04-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.axis).toBe('أدوات العمل والمعدات');
  });

  it('GPL-05-01 should be EIA doc high', () => {
    const item = gplCriteria.find(i => i.id === 'GPL-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('دراسة التأثير البيئي');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(gplCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('تخزين قوارير الغاز')).toBe(true);
    expect(axes.has('الوقاية من الحريق والانفجار')).toBe(true);
    expect(axes.has('أدوات العمل والمعدات')).toBe(true);
    expect(axes.has('دراسة التأثير البيئي')).toBe(true);
  });
});
