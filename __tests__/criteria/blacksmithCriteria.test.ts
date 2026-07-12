import { blacksmithSpecificCriteria } from '../../src/criteria/blacksmithCriteria';

describe('blacksmithSpecificCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(blacksmithSpecificCriteria)).toBe(true);
  });

  it('should have items', () => {
    expect(blacksmithSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('should have no duplicate IDs', () => {
    const ids = blacksmithSpecificCriteria.map(item => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs should match expected prefix pattern', () => {
    blacksmithSpecificCriteria.forEach(item => {
      expect(item.id).toMatch(/^[A-Z]{2,4}-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    blacksmithSpecificCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    blacksmithSpecificCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    blacksmithSpecificCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('should have at least one high severity item', () => {
    const high = blacksmithSpecificCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBeGreaterThanOrEqual(1);
  });

  it('controlType should be valid for all items', () => {
    blacksmithSpecificCriteria.forEach(item => {
      expect(['visual', 'doc', 'test', 'measurement']).toContain(item.controlType);
    });
  });

  it('items with measurement controlType should have numericField', () => {
    const measurement = blacksmithSpecificCriteria.filter(i => i.controlType === 'measurement');
    measurement.forEach(item => {
      expect(item.numericField).toBeDefined();
    });
  });
});
