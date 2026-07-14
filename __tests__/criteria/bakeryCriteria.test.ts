import { bakerySpecificCriteria } from '../../src/criteria/bakeryCriteria';

describe('bakerySpecificCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(bakerySpecificCriteria)).toBe(true);
  });

  it('should contain exactly 13 items', () => {
    expect(bakerySpecificCriteria).toHaveLength(13);
  });

  it('should have no duplicate IDs', () => {
    const ids = bakerySpecificCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match BAK-XX-XX pattern', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(item.id).toMatch(/^BAK-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('BAK-10-01 should be operating licence doc', () => {
    const item = bakerySpecificCriteria.find(i => i.id === 'BAK-10-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('BAK-10-05 water quality should have test controlType', () => {
    const item = bakerySpecificCriteria.find(i => i.id === 'BAK-10-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('test');
  });

  it('BAK-10-10 HACCP should be doc and high', () => {
    const item = bakerySpecificCriteria.find(i => i.id === 'BAK-10-10');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('should cover key axes', () => {
    const axes = new Set(bakerySpecificCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('المياه والصرف')).toBe(true);
    expect(axes.has('صحة وسلوك العمال')).toBe(true);
  });
});
