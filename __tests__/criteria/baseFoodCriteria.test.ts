import { baseFoodCriteria } from '../../src/criteria/baseFoodCriteria';

describe('baseFoodCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(baseFoodCriteria)).toBe(true);
  });

  it('should contain exactly 14 items', () => {
    expect(baseFoodCriteria).toHaveLength(14);
  });

  it('should have no duplicate IDs', () => {
    const ids = baseFoodCriteria.map(item => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
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

  it('all items should have non-empty criteria and legalReference', () => {
    baseFoodCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    baseFoodCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('BFD-05-02 should have numericField for refrigeration temperature 0-5°C', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-05-02');
    expect(item).toBeDefined();
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('°C');
    expect(item!.numericField!.min).toBe(0);
    expect(item!.numericField!.max).toBe(5);
    expect(item!.numericField!.warningMax).toBe(7);
    expect(item!.controlType).toBe('measurement');
  });

  it('BFD-05-03 should have numericField for freezer temperature <= -18°C', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-05-03');
    expect(item).toBeDefined();
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('°C');
    expect(item!.numericField!.max).toBe(-18);
    expect(item!.numericField!.warningMax).toBe(-15);
    expect(item!.numericField!.upperLimit).toBe(true);
  });

  it('BFD-01-01 should be doc controlType for health accreditation', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('BFD-06-03 should require periodic medical checks', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-06-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('should cover axes: تجهيزات الحفظ، صحة العمال، مكافحة النواقل', () => {
    const axes = new Set(baseFoodCriteria.map(i => i.axis));
    expect(axes.has('تجهيزات الحفظ والتحضير')).toBe(true);
    expect(axes.has('صحة وسلوك العمال')).toBe(true);
    expect(axes.has('مكافحة النواقل')).toBe(true);
  });

  it('items with measurement controlType should have numericField defined', () => {
    const measurementItems = baseFoodCriteria.filter(i => i.controlType === 'measurement');
    expect(measurementItems.length).toBeGreaterThanOrEqual(2);
    measurementItems.forEach(item => {
      expect(item.numericField).toBeDefined();
    });
  });
});
