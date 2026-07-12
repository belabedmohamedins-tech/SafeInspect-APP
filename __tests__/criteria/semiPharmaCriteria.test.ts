import { semiPharmaCriteria } from '../../src/criteria/semiPharmaCriteria';

describe('semiPharmaCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(semiPharmaCriteria)).toBe(true);
  });

  it('should contain exactly 9 items', () => {
    expect(semiPharmaCriteria).toHaveLength(9);
  });

  it('should have no duplicate IDs', () => {
    const ids = semiPharmaCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match SPH-XX-XX pattern', () => {
    semiPharmaCriteria.forEach(item => {
      expect(item.id).toMatch(/^SPH-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    semiPharmaCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    semiPharmaCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    semiPharmaCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('should have majority high severity items', () => {
    const high = semiPharmaCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBeGreaterThanOrEqual(7);
  });

  it('SPH-01-01 should be doc controlType for operating licence', () => {
    const item = semiPharmaCriteria.find(i => i.id === 'SPH-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('SPH-04-01 should cover labelling axis', () => {
    const item = semiPharmaCriteria.find(i => i.id === 'SPH-04-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('التوسيم والتتبعية');
    expect(item!.severity).toBe('high');
  });

  it('SPH-04-02 traceability should be medium severity', () => {
    const item = semiPharmaCriteria.find(i => i.id === 'SPH-04-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('doc');
  });

  it('SPH-03-02 should require quality control documentation', () => {
    const item = semiPharmaCriteria.find(i => i.id === 'SPH-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(semiPharmaCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('نظافة فضاءات التعبئة')).toBe(true);
    expect(axes.has('التوسيم والتتبعية')).toBe(true);
    expect(axes.has('صحة العمال')).toBe(true);
  });
});
