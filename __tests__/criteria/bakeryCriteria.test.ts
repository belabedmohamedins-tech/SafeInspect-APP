import { bakerySpecificCriteria } from '../../src/criteria/bakeryCriteria';

describe('bakerySpecificCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(bakerySpecificCriteria)).toBe(true);
  });

  it('should contain exactly 10 items', () => {
    expect(bakerySpecificCriteria).toHaveLength(10);
  });

  it('should have no duplicate IDs', () => {
    const ids = bakerySpecificCriteria.map(item => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs should match BAK-10-XX pattern', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(item.id).toMatch(/^BAK-10-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria text', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items should have non-empty legalReference', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items should have non-empty axis', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be one of high/medium/low', () => {
    bakerySpecificCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('should have majority high severity items (food safety)', () => {
    const high = bakerySpecificCriteria.filter(i => i.severity === 'high');
    expect(high.length).toBeGreaterThanOrEqual(7);
  });

  it('BAK-10-01 should be doc controlType for licence verification', () => {
    const item = bakerySpecificCriteria.find(i => i.id === 'BAK-10-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('BAK-10-10 should reference HACCP', () => {
    const item = bakerySpecificCriteria.find(i => i.id === 'BAK-10-10');
    expect(item).toBeDefined();
    expect(item!.criteria).toContain('HACCP');
    expect(item!.controlType).toBe('doc');
  });

  it('should cover expected axes', () => {
    const axes = new Set(bakerySpecificCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('المبنى والتهيئة الداخلية')).toBe(true);
    expect(axes.has('صحة وسلوك العمال')).toBe(true);
    expect(axes.has('مكافحة النواقل')).toBe(true);
  });
});
