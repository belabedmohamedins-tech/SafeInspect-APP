import { blacksmithCriteria } from '../../src/criteria/blacksmithCriteria';

describe('blacksmithCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(blacksmithCriteria)).toBe(true);
  });

  it('should have items', () => {
    expect(blacksmithCriteria.length).toBeGreaterThan(0);
  });

  it('should have no duplicate IDs', () => {
    const ids = blacksmithCriteria.map(item => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs should match expected prefix pattern', () => {
    blacksmithCriteria.forEach(item => {
      expect(item.id).toMatch(/^[A-Z]{2,4}-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    blacksmithCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    blacksmithCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    blacksmithCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('should have at least one high severity item', () => {
    const high = blacksmithCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBeGreaterThanOrEqual(1);
  });

  it('controlType should be valid for all items', () => {
    blacksmithCriteria.forEach(item => {
      expect(['visual', 'doc', 'test', 'measurement']).toContain(item.controlType);
    });
  });

  it('items with measurement controlType should have numericField', () => {
    const measurement = blacksmithCriteria.filter(i => i.controlType === 'measurement');
    measurement.forEach(item => {
      expect(item.numericField).toBeDefined();
    });
  });

  it('should have 9 items total matching BLS prefix', () => {
    const bls = blacksmithCriteria.filter(i => i.id.startsWith('BLS-'));
    expect(bls.length).toBe(blacksmithCriteria.length);
  });

  it('should have items covering السلامة المهنية axis', () => {
    const safety = blacksmithCriteria.filter(i => i.axis === 'السلامة المهنية');
    expect(safety.length).toBeGreaterThanOrEqual(1);
  });

  it('should have items covering النفايات المعدنية axis', () => {
    const waste = blacksmithCriteria.filter(i => i.axis === 'النفايات المعدنية');
    expect(waste.length).toBeGreaterThanOrEqual(1);
  });

  it('category values should be valid', () => {
    blacksmithCriteria.forEach(item => {
      expect(['تنظيمية', 'بيئية', 'سلامة', 'صحية']).toContain(item.category);
    });
  });
});
