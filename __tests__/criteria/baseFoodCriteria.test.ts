import { baseFoodCriteria } from '../../src/criteria/baseFoodCriteria';

describe('baseFoodCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(baseFoodCriteria)).toBe(true);
    expect(baseFoodCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 13 items', () => {
    expect(baseFoodCriteria).toHaveLength(13);
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

  // Phase 13: numericField now uses NumericFieldSpec (labelAr, max/warningMax/min, step)
  // 'threshold' and 'comparisonOperator' were removed — do not reference them
  it('measurement items with numericField have valid labelAr and unit', () => {
    baseFoodCriteria
      .filter(i => i.controlType === 'measurement' && i.numericField)
      .forEach(item => {
        expect(item.numericField!.unit).toBeDefined();
        expect(typeof item.numericField!.labelAr).toBe('string');
        expect(item.numericField!.labelAr!.length).toBeGreaterThan(0);
      });
  });

  it('contains chilled temperature item BFD-04-01', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-04-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    // Phase 13: threshold→max (chilled: ≤5°C)
    expect(item!.numericField!.max).toBe(5);
    expect(item!.numericField!.min).toBe(0);
  });

  it('contains frozen temperature item BFD-04-02', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-04-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    // Phase 13: threshold→warningMax with upperLimit:true (frozen: ≤-18°C)
    expect(item!.numericField!.warningMax).toBe(-18);
    expect(item!.numericField!.upperLimit).toBe(true);
  });

  it('contains traceability item BFD-08-01', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-08-01');
    expect(item).toBeDefined();
    expect(item!.axis).toContain('التتبع');
  });

  it('contains HACCP item BFD-05-01', () => {
    const item = baseFoodCriteria.find(i => i.id === 'BFD-05-01');
    expect(item).toBeDefined();
    expect(item!.axis).toContain('HACCP');
  });
});
