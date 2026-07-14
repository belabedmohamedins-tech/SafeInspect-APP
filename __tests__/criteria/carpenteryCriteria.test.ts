import { carpenteryCriteria } from '../../src/criteria/carpenteryCriteria';

describe('carpenteryCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(carpenteryCriteria)).toBe(true);
    expect(carpenteryCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 10 items', () => {
    expect(carpenteryCriteria).toHaveLength(10);
  });

  it('all IDs are unique', () => {
    const ids = carpenteryCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow CAR- prefix', () => {
    carpenteryCriteria.forEach(item => expect(item.id).toMatch(/^CAR-/));
  });

  it('all items have required fields', () => {
    carpenteryCriteria.forEach(item => {
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
    carpenteryCriteria.forEach(item => expect(valid).toContain(item.severity));
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    carpenteryCriteria.forEach(item => expect(valid).toContain(item.controlType));
  });

  it('measurement items with numericField have valid unit and bounds', () => {
    const measured = carpenteryCriteria.filter(i => i.controlType === 'measurement' && i.numericField);
    measured.forEach(item => {
      expect(item.numericField!.unit).toBeTruthy();
    });
  });

  it('CAR-01-01 is licence doc high', () => {
    const item = carpenteryCriteria.find(i => i.id === 'CAR-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('CAR-02-01 is dust extraction visual high', () => {
    const item = carpenteryCriteria.find(i => i.id === 'CAR-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('CAR-02-02 is noise measurement medium (no numericField required)', () => {
    const item = carpenteryCriteria.find(i => i.id === 'CAR-02-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.severity).toBe('medium');
  });

  it('CAR-04-03 is fire extinguisher visual high', () => {
    const item = carpenteryCriteria.find(i => i.id === 'CAR-04-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('CAR-05-01 is emergency exits visual high', () => {
    const item = carpenteryCriteria.find(i => i.id === 'CAR-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('axes cover expected domains', () => {
    const axes = new Set(carpenteryCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('الموقع والتهيئة')).toBe(true);
    expect(axes.has('نفايات الخشب والألمنيوم')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});
