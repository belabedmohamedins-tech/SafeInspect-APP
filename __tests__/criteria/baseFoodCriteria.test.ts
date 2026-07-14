import { baseFoodCriteria } from '../../src/criteria/baseFoodCriteria';

describe('baseFoodCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(baseFoodCriteria)).toBe(true);
    expect(baseFoodCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 15 items', () => {
    expect(baseFoodCriteria).toHaveLength(15);
  });

  it('should have no duplicate IDs', () => {
    const ids = baseFoodCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all items have required fields', () => {
    baseFoodCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.legalReference).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity values are valid', () => {
    baseFoodCriteria.forEach(item =>
      expect(['low', 'medium', 'high']).toContain(item.severity)
    );
  });

  it('controlType values are valid', () => {
    baseFoodCriteria.forEach(item =>
      expect(['doc', 'visual', 'measurement', 'test']).toContain(item.controlType)
    );
  });

  it('all items start with BFD- prefix', () => {
    baseFoodCriteria.forEach(item => expect(item.id).toMatch(/^BFD-/));
  });

  it('measurement items that have numericField have valid unit', () => {
    baseFoodCriteria
      .filter(i => i.controlType === 'measurement' && i.numericField)
      .forEach(item => expect(item.numericField!.unit).toBeTruthy());
  });

  it('BFD-01-01 is health accreditation doc high', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('BFD-05-02 is cold storage measurement with numericField', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('°C');
  });

  it('BFD-05-03 is frozen storage measurement with numericField', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-05-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
  });

  it('all items have complianceStatus not-evaluated', () => {
    baseFoodCriteria.forEach(item => expect(item.complianceStatus).toBe('not-evaluated'));
  });
});
