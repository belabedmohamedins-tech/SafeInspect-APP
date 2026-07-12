import { carpenteryCriteria } from '../../src/criteria/carpenteryCriteria';

describe('carpenteryCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(carpenteryCriteria)).toBe(true);
  });

  it('should have items', () => {
    expect(carpenteryCriteria.length).toBeGreaterThan(0);
  });

  it('should have no duplicate IDs', () => {
    const ids = carpenteryCriteria.map(item => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs should match expected prefix pattern', () => {
    carpenteryCriteria.forEach(item => {
      expect(item.id).toMatch(/^[A-Z]{2,4}-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    carpenteryCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    carpenteryCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    carpenteryCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('should have at least one high severity item', () => {
    const high = carpenteryCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBeGreaterThanOrEqual(1);
  });

  it('controlType should be valid for all items', () => {
    carpenteryCriteria.forEach(item => {
      expect(['visual', 'doc', 'test', 'measurement']).toContain(item.controlType);
    });
  });

  it('items with measurement controlType should have numericField', () => {
    const measurement = carpenteryCriteria.filter(i => i.controlType === 'measurement');
    measurement.forEach(item => {
      expect(item.numericField).toBeDefined();
    });
  });

  it('should have all items with CAR prefix', () => {
    const car = carpenteryCriteria.filter(i => i.id.startsWith('CAR-'));
    expect(car.length).toBe(carpenteryCriteria.length);
  });

  it('should have items covering السلامة المهنية axis', () => {
    const safety = carpenteryCriteria.filter(i => i.axis === 'السلامة المهنية');
    expect(safety.length).toBeGreaterThanOrEqual(1);
  });

  it('should have items covering نفايات الخشب والألمنيوم axis', () => {
    const waste = carpenteryCriteria.filter(i => i.axis === 'نفايات الخشب والألمنيوم');
    expect(waste.length).toBeGreaterThanOrEqual(1);
  });

  it('category values should be valid', () => {
    carpenteryCriteria.forEach(item => {
      expect(['تنظيمية', 'بيئية', 'سلامة', 'صحية']).toContain(item.category);
    });
  });
});
