import { marbleCriteria } from '../../src/criteria/marbleCriteria';

describe('marbleCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
  });

  it('should contain exactly 9 items', () => {
    expect(marbleCriteria).toHaveLength(9);
  });

  it('should have no duplicate IDs', () => {
    const ids = marbleCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match MRB-XX-XX pattern', () => {
    marbleCriteria.forEach(item => {
      expect(item.id).toMatch(/^MRB-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    marbleCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    marbleCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('MRB-01-01 should require operating license (high severity)', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('هوية المنشأة والوثائق');
  });

  it('MRB-02-02 should cover site environment (visual, high)', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-02-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('الموقع والتهيئة');
  });

  it('MRB-05-01 should require PPE (high severity)', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('السلامة المهنية');
  });
});
