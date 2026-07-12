import { carpenterySpecificCriteria } from '../../src/criteria/carpenteryCriteria';

describe('carpenterySpecificCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(carpenterySpecificCriteria)).toBe(true);
  });

  it('should have items', () => {
    expect(carpenterySpecificCriteria.length).toBeGreaterThan(0);
  });

  it('should have no duplicate IDs', () => {
    const ids = carpenterySpecificCriteria.map(item => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs should match expected prefix pattern', () => {
    carpenterySpecificCriteria.forEach(item => {
      expect(item.id).toMatch(/^[A-Z]{2,4}-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    carpenterySpecificCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    carpenterySpecificCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    carpenterySpecificCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('should have at least one high severity item', () => {
    const high = carpenterySpecificCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBeGreaterThanOrEqual(1);
  });

  it('controlType should be valid for all items', () => {
    carpenterySpecificCriteria.forEach(item => {
      expect(['visual', 'doc', 'test', 'measurement']).toContain(item.controlType);
    });
  });

  it('items with measurement controlType should have numericField', () => {
    const measurement = carpenterySpecificCriteria.filter(i => i.controlType === 'measurement');
    measurement.forEach(item => {
      expect(item.numericField).toBeDefined();
    });
  });
});
