import { uabSpecificCriteria } from '../../src/criteria/uabCriteria';

describe('uabSpecificCriteria – array-level contract', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(uabSpecificCriteria)).toBe(true);
  });

  it('has exactly 27 items', () => {
    expect(uabSpecificCriteria).toHaveLength(27);
  });

  it('all IDs are unique', () => {
    const ids = uabSpecificCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow UAB-AX prefix', () => {
    uabSpecificCriteria.forEach(item => expect(item.id).toMatch(/^UAB-AX/));
  });

  it('all items have required fields', () => {
    uabSpecificCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity values are valid', () => {
    uabSpecificCriteria.forEach(item =>
      expect(['low', 'medium', 'high']).toContain(item.severity)
    );
  });

  it('has at least 20 high-severity items', () => {
    const highCount = uabSpecificCriteria.filter(i => i.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(20);
  });

  it('has at least 4 medium-severity items', () => {
    const medCount = uabSpecificCriteria.filter(i => i.severity === 'medium').length;
    expect(medCount).toBeGreaterThanOrEqual(4);
  });

  it('UAB-AX1-01 is classification doc high', () => {
    const item = uabSpecificCriteria.find(i => i.id === 'UAB-AX1-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('UAB-AX7-07 is noise measurement with numericField', () => {
    const item = uabSpecificCriteria.find(i => i.id === 'UAB-AX7-07');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('dB');
  });

  it('UAB-AX8-01 is enforcement doc high', () => {
    const item = uabSpecificCriteria.find(i => i.id === 'UAB-AX8-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('UAB-AX8-02 was removed (merged into BGN)', () => {
    expect(uabSpecificCriteria.find(i => i.id === 'UAB-AX8-02')).toBeUndefined();
  });

  it('axes cover expected domains', () => {
    const axes = new Set(uabSpecificCriteria.map(i => i.axis));
    expect(axes.has('التصنيف والترخيص البيئي')).toBe(true);
    expect(axes.has('المياه المستعملة والتفريغ')).toBe(true);
    expect(axes.has('الانبعاثات الهوائية')).toBe(true);
    expect(axes.has('السلامة من الحريق والانفجار')).toBe(true);
  });
});
