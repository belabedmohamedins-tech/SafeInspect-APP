import { baseFoodCriteria } from '../../src/criteria/baseFoodCriteria';

describe('baseFoodCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(baseFoodCriteria)).toBe(true);
  });

  it('should contain exactly 16 items', () => {
    expect(baseFoodCriteria).toHaveLength(16);
  });

  it('should have no duplicate IDs', () => {
    const ids = baseFoodCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match BFD-XX-XX pattern', () => {
    baseFoodCriteria.forEach(item => {
      expect(item.id).toMatch(/^BFD-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    baseFoodCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    baseFoodCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    baseFoodCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('BFD-05-02 should have measurement controlType and numericField', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('°C');
  });

  it('BFD-05-03 should have measurement controlType for freezer temp', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-05-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.upperLimit).toBe(true);
  });

  it('BFD-08-01 should have traceability axis', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-08-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('إمكانية التتبع');
  });

  it('BFD-09-01 should have HACCP axis', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-09-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('خطة HACCP');
  });

  it('should cover key axes', () => {
    const axes = new Set(baseFoodCriteria.map(i => i.axis));
    expect(axes.has('تجهيزات الحفظ والتحضير')).toBe(true);
    expect(axes.has('صحة وسلوك العمال')).toBe(true);
    expect(axes.has('مكافحة النواقل')).toBe(true);
    expect(axes.has('إمكانية التتبع')).toBe(true);
    expect(axes.has('خطة HACCP')).toBe(true);
  });
});
