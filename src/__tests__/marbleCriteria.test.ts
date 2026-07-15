import { marbleCriteria } from '../criteria/marbleCriteria';

describe('marbleCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
  });

  it('contains exactly 11 criteria', () => {
    expect(marbleCriteria).toHaveLength(11);
  });

  it('has no duplicate IDs', () => {
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

  it('MRB-03-02 has numericField with MES unit', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-03-02');
    expect(item).toBeDefined();
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('mg/L');
    expect(item!.numericField!.max).toBe(35);
  });

  it('MRB-05-05 silica dust measurement is doc', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });
});
