import { marbleCriteria } from '../../src/criteria/marbleCriteria';

describe('marbleCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
  });

  it('should contain exactly 8 items', () => {
    expect(marbleCriteria).toHaveLength(8);
  });

  it('should have no duplicate IDs', () => {
    const ids = marbleCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match MRB-XX-XX pattern', () => {
    marbleCriteria.forEach(item => {
      expect(item.id).toMatch(/^MRB-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    marbleCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    marbleCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    marbleCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('MRB-02-02 should cover dust dispersion prevention', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-02-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('الموقع والتهيئة');
  });

  it('MRB-03-01 should require settling tank for cutting water (visual)', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('المياه المستعملة والغبار');
  });

  it('MRB-04-01 marble waste valorisation should be medium severity', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-04-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
  });

  it('MRB-05-01 should require P2 dust masks PPE', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('السلامة المهنية');
    expect(item!.category).toBe('سلامة');
    expect(item!.severity).toBe('high');
  });

  it('MRB-05-02 should require machine guards', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-02');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('السلامة المهنية');
    expect(item!.severity).toBe('high');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(marbleCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('الموقع والتهيئة')).toBe(true);
    expect(axes.has('المياه المستعملة والغبار')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});
