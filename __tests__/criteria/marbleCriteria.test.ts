import { marbleCriteria } from '../../src/criteria/marbleCriteria';

describe('marbleCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
    expect(marbleCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 11 items', () => {
    expect(marbleCriteria).toHaveLength(11);
  });

  it('all IDs are unique', () => {
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
      expect(item.category).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.legalReference).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    marbleCriteria.forEach(item => expect(valid).toContain(item.severity));
  });

  it('controlType values are valid', () => {
    const valid = ['visual', 'doc', 'measurement', 'interview'];
    marbleCriteria.forEach(item => expect(valid).toContain(item.controlType));
  });

  it('contains silica dust ventilation item MRB-03-01', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains PPE item MRB-05-01', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-01');
    expect(item).toBeDefined();
    expect(item!.axis).toContain('السلامة');
  });

  it('contains machine guard item MRB-05-04', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-04');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
  });

  it('contains silica air quality item MRB-05-05', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.axis).toBe('الانبعاثات الهوائية');
  });
});
