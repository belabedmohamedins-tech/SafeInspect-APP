import { marbleCriteria } from '../../src/criteria/marbleCriteria';

describe('marbleCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
  });

  it('should contain exactly 10 items', () => {
    expect(marbleCriteria).toHaveLength(10);
  });

  it('should have no duplicate IDs', () => {
    const ids = marbleCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow MRB- prefix', () => {
    marbleCriteria.forEach(item => expect(item.id).toMatch(/^MRB-/));
  });

  it('all items have required fields', () => {
    marbleCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('MRB-01-01 is licence doc high', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('MRB-03-01 is dust extraction visual high', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('MRB-05-03 is medical exams doc high', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('axes cover expected domains', () => {
    const axes = new Set(marbleCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('المياه المستعملة والغبار')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});
