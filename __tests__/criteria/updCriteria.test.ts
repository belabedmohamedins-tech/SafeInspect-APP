import { updSpecificCriteria } from '../../src/criteria/updCriteria';

describe('updSpecificCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(updSpecificCriteria)).toBe(true);
    expect(updSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 20 items', () => {
    expect(updSpecificCriteria).toHaveLength(20);
  });

  it('all IDs are unique', () => {
    const ids = updSpecificCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow UPD-AX prefix', () => {
    updSpecificCriteria.forEach(item => expect(item.id).toMatch(/^UPD-AX/));
  });

  it('all items have required fields', () => {
    updSpecificCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity values are valid', () => {
    updSpecificCriteria.forEach(item =>
      expect(['low', 'medium', 'high']).toContain(item.severity)
    );
  });

  it('controlType values are valid', () => {
    updSpecificCriteria.forEach(item =>
      expect(['doc', 'visual', 'measurement', 'test']).toContain(item.controlType)
    );
  });

  it('UPD-AX1-01 is identity classification doc high', () => {
    const item = updSpecificCriteria.find(i => i.id === 'UPD-AX1-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('UPD-AX4-01 is water test high', () => {
    const item = updSpecificCriteria.find(i => i.id === 'UPD-AX4-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('test');
    expect(item!.severity).toBe('high');
  });

  it('majority of items are high severity', () => {
    const highCount = updSpecificCriteria.filter(i => i.severity === 'high').length;
    expect(highCount).toBeGreaterThan(updSpecificCriteria.length / 2);
  });

  it('axes cover expected domains', () => {
    const axes = new Set(updSpecificCriteria.map(i => i.axis));
    expect(axes.has('الهوية والتصنيف')).toBe(true);
    expect(axes.has('الموقع والعزل')).toBe(true);
    expect(axes.has('المياه')).toBe(true);
  });
});
