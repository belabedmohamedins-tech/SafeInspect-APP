import { carWashCriteria } from '../../src/criteria/carWashCriteria';

describe('carWashCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(carWashCriteria)).toBe(true);
  });

  it('should contain exactly 12 items', () => {
    expect(carWashCriteria).toHaveLength(12);
  });

  it('should have no duplicate IDs', () => {
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
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity values are valid', () => {
    carWashCriteria.forEach(item =>
      expect(['low', 'medium', 'high']).toContain(item.severity)
    );
  });

  it('CWS-01-01 is licence doc high', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('CWS-02-01 is oil separator visual high', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('has at least one low severity item', () => {
    expect(carWashCriteria.some(i => i.severity === 'low')).toBe(true);
  });

  it('axes cover expected domains', () => {
    const axes = new Set(carWashCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('تسيير مياه الغسل')).toBe(true);
    expect(axes.has('النظافة والسلامة')).toBe(true);
  });
});
