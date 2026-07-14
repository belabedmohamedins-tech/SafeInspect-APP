import { slaughterhouseSmallCriteria } from '../../src/criteria/slaughterhouseSmallCriteria';

describe('slaughterhouseSmallCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(slaughterhouseSmallCriteria)).toBe(true);
  });

  it('should contain exactly 10 items', () => {
    expect(slaughterhouseSmallCriteria).toHaveLength(10);
  });

  it('should have no duplicate IDs', () => {
    const ids = slaughterhouseSmallCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match SLH-XX-XX pattern', () => {
    slaughterhouseSmallCriteria.forEach(item => {
      expect(item.id).toMatch(/^SLH-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    slaughterhouseSmallCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    slaughterhouseSmallCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    slaughterhouseSmallCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('all items should be high severity (critical activity)', () => {
    const high = slaughterhouseSmallCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBe(10);
  });

  it('SLH-05-01 should be doc controlType for exploitation licence', () => {
    const item = slaughterhouseSmallCriteria.find(i => i.id === 'SLH-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.axis).toBe('هوية المنشأة والوثائق');
  });

  it('SLH-05-02 should cover ante-mortem visual inspection', () => {
    const item = slaughterhouseSmallCriteria.find(i => i.id === 'SLH-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.axis).toBe('الذبح والفحص الصحي');
  });

  it('SLH-05-03 should cover post-mortem inspection', () => {
    const item = slaughterhouseSmallCriteria.find(i => i.id === 'SLH-05-03');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('الذبح والفحص الصحي');
  });

  it('SLH-05-07 should cover cold room with test controlType', () => {
    const item = slaughterhouseSmallCriteria.find(i => i.id === 'SLH-05-07');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('test');
    expect(item!.axis).toBe('غرف التبريد');
  });

  it('SLH-05-10 removed — pest control deduped to BGN', () => {
    expect(slaughterhouseSmallCriteria.find(i => i.id === 'SLH-05-10')).toBeUndefined();
  });

  it('SLH-06-01 should be HACCP doc high', () => {
    const item = slaughterhouseSmallCriteria.find(i => i.id === 'SLH-06-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('نظام HACCP وسلامة الغذاء');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(slaughterhouseSmallCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('الذبح والفحص الصحي')).toBe(true);
    expect(axes.has('مخلفات الذبح')).toBe(true);
    expect(axes.has('مياه الغسل والتطهير')).toBe(true);
    expect(axes.has('غرف التبريد')).toBe(true);
    expect(axes.has('نظافة قاعة الذبح')).toBe(true);
    expect(axes.has('صحة وسلوك العمال')).toBe(true);
    expect(axes.has('نظام HACCP وسلامة الغذاء')).toBe(true);
  });
});
