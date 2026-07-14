import { couvoirSpecificCriteria } from '../../src/criteria/couvoirCriteria';

describe('couvoirSpecificCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(couvoirSpecificCriteria)).toBe(true);
  });

  it('has exactly 21 items', () => {
    expect(couvoirSpecificCriteria).toHaveLength(21);
  });

  it('all IDs are unique', () => {
    const ids = couvoirSpecificCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow COU-AX prefix', () => {
    couvoirSpecificCriteria.forEach(item => expect(item.id).toMatch(/^COU-AX/));
  });

  it('all items have required fields', () => {
    couvoirSpecificCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity values are valid', () => {
    couvoirSpecificCriteria.forEach(item =>
      expect(['low', 'medium', 'high']).toContain(item.severity)
    );
  });

  it('controlType values are valid', () => {
    couvoirSpecificCriteria.forEach(item =>
      expect(['doc', 'visual', 'measurement', 'test']).toContain(item.controlType)
    );
  });

  it('COU-AX1-01 is identity classification doc high', () => {
    const item = couvoirSpecificCriteria.find(i => i.id === 'COU-AX1-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('COU-AX2-01 is floors visual high', () => {
    const item = couvoirSpecificCriteria.find(i => i.id === 'COU-AX2-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('COU-AX2-02 is walls visual medium', () => {
    const item = couvoirSpecificCriteria.find(i => i.id === 'COU-AX2-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  it('COU-AX3-01 is thermal control test high', () => {
    const item = couvoirSpecificCriteria.find(i => i.id === 'COU-AX3-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('test');
    expect(item!.severity).toBe('high');
  });

  it('COU-AX5-01 is hygiene programme doc high', () => {
    const item = couvoirSpecificCriteria.find(i => i.id === 'COU-AX5-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('COU-AX6-01 is water test high', () => {
    const item = couvoirSpecificCriteria.find(i => i.id === 'COU-AX6-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('test');
    expect(item!.severity).toBe('high');
  });

  it('COU-AX9-01 is HACCP plan doc high', () => {
    const item = couvoirSpecificCriteria.find(i => i.id === 'COU-AX9-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  // Verify S9 removals
  it('COU-AX8-01 was removed (merged into BGN)', () => {
    expect(couvoirSpecificCriteria.find(i => i.id === 'COU-AX8-01')).toBeUndefined();
  });

  it('COU-AX8-02 was removed (merged into BGN)', () => {
    expect(couvoirSpecificCriteria.find(i => i.id === 'COU-AX8-02')).toBeUndefined();
  });

  it('axes cover expected domains', () => {
    const axes = new Set(couvoirSpecificCriteria.map(i => i.axis));
    expect(axes.has('الهوية والتصنيف')).toBe(true);
    expect(axes.has('تهيئة قاعات التفريخ')).toBe(true);
    expect(axes.has('التحكم الحراري والرطوبة')).toBe(true);
    expect(axes.has('HACCP في التفريخ')).toBe(true);
  });
});
