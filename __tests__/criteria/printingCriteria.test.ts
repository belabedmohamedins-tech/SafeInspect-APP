import { printingCriteria } from '../../src/criteria/printingCriteria';

describe('printingCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(printingCriteria)).toBe(true);
  });

  it('should contain exactly 9 items', () => {
    expect(printingCriteria).toHaveLength(9);
  });

  it('should have no duplicate IDs', () => {
    const ids = printingCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match PRT-XX-XX pattern', () => {
    printingCriteria.forEach(item => {
      expect(item.id).toMatch(/^PRT-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    printingCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    printingCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    printingCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('PRT-01-01 operating licence should be doc and high', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('PRT-02-01 COV ventilation should be visual and high', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('التهوية ومنع التلوث الهوائي');
  });

  it('PRT-02-02 noise nuisance should be medium severity', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-02-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
  });

  it('PRT-03-01 ink/solvent waste sealed containers should be visual high', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('تسيير النفايات الكيميائية');
  });

  it('PRT-03-02 authorised operator contract should be doc', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('PRT-04-01 paper waste recycling should be low severity', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-04-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('low');
    expect(item!.axis).toBe('نفايات الورق والكرتون');
  });

  it('PRT-05-01 PPE for solvent cleaning should be visual high', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.category).toBe('سلامة');
  });

  it('PRT-05-02 machine guards and fire extinguisher should be visual', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.axis).toBe('السلامة المهنية');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(printingCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('التهوية ومنع التلوث الهوائي')).toBe(true);
    expect(axes.has('تسيير النفايات الكيميائية')).toBe(true);
    expect(axes.has('نفايات الورق والكرتون')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});
