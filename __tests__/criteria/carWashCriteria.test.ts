import { carWashCriteria } from '../../src/criteria/carWashCriteria';

describe('carWashCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(carWashCriteria)).toBe(true);
    expect(carWashCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 12 items', () => {
    expect(carWashCriteria).toHaveLength(12);
  });

  it('all IDs are unique', () => {
    const ids = carWashCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow CWS- prefix', () => {
    carWashCriteria.forEach(item => expect(item.id).toMatch(/^CWS-/));
  });

  it('all items have required fields', () => {
    carWashCriteria.forEach(item => {
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
    carWashCriteria.forEach(item => expect(valid).toContain(item.severity));
  });

  it('controlType values are valid', () => {
    const valid = ['visual', 'doc', 'measurement', 'interview'];
    carWashCriteria.forEach(item => expect(valid).toContain(item.controlType));
  });

  it('contains water management axis items', () => {
    const waterItems = carWashCriteria.filter(i => i.axis === 'تسيير مياه الغسل');
    expect(waterItems.length).toBeGreaterThanOrEqual(3);
  });

  it('contains oil separator item CWS-02-01', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains fire safety item CWS-05-01', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-05-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
  });
});
