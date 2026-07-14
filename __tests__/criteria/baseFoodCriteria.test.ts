import { baseFoodCriteria } from '../../src/criteria/baseFoodCriteria';

describe('baseFoodCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(baseFoodCriteria)).toBe(true);
    expect(baseFoodCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 15 items', () => {
    expect(baseFoodCriteria).toHaveLength(15);
  });

  it('all IDs are unique', () => {
    const ids = baseFoodCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow BFD- prefix', () => {
    baseFoodCriteria.forEach(item => expect(item.id).toMatch(/^BFD-/));
  });

  it('all items have required fields', () => {
    baseFoodCriteria.forEach(item => {
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
    baseFoodCriteria.forEach(item => expect(valid).toContain(item.severity));
  });

  it('controlType values are valid', () => {
    const valid = ['visual', 'doc', 'measurement', 'interview'];
    baseFoodCriteria.forEach(item => expect(valid).toContain(item.controlType));
  });

  it('measurement items with numericField have valid unit and bounds', () => {
    baseFoodCriteria
      .filter(i => i.controlType === 'measurement' && i.numericField)
      .forEach(item => {
        expect(item.numericField!.unit).toBeDefined();
        expect(typeof item.numericField!.min).toBe('number');
        expect(typeof item.numericField!.max).toBe('number');
      });
  });

  it('contains temperature measurement items (BFD-05-02 and BFD-05-03)', () => {
    const bfd0502 = baseFoodCriteria.find(i => i.id === 'BFD-05-02');
    const bfd0503 = baseFoodCriteria.find(i => i.id === 'BFD-05-03');
    expect(bfd0502).toBeDefined();
    expect(bfd0502!.controlType).toBe('measurement');
    expect(bfd0503).toBeDefined();
    expect(bfd0503!.controlType).toBe('measurement');
  });

  it('contains traceability item BFD-08-01', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-08-01');
    expect(item).toBeDefined();
    expect(item!.axis).toContain('التتبع');
  });

  it('contains HACCP item BFD-09-01', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-09-01');
    expect(item).toBeDefined();
    expect(item!.axis).toContain('HACCP');
  });
});
