import { carWashCriteria } from '../../src/criteria/carWashCriteria';

describe('carWashCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(carWashCriteria)).toBe(true);
  });

  it('should contain exactly 11 items', () => {
    expect(carWashCriteria).toHaveLength(11);
  });

  it('should have no duplicate IDs', () => {
    const ids = carWashCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match CWS-XX-XX pattern', () => {
    carWashCriteria.forEach(item => {
      expect(item.id).toMatch(/^CWS-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    carWashCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    carWashCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('CWS-01-01 should require operating license (high severity)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('هوية المنشأة والوثائق');
  });

  it('CWS-02-01 should require oil separator (visual)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('تسيير مياه الغسل');
  });

  it('CWS-03-01 should require biodegradable chemicals (visual)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('المواد الكيميائية');
  });

  it('CWS-03-02 should prohibit discharge to public road (high severity)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-03-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('المواد الكيميائية');
  });

  it('CWS-03-03 should track chemical usage (low severity)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-03-03');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('low');
    expect(item!.controlType).toBe('doc');
  });

  it('CWS-04-01 should require PPE and fire extinguisher (high severity)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-04-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('النظافة والسلامة');
  });

  it('CWS-04-02 should require certified waste contractor (high severity)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-04-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('النظافة والسلامة');
  });
});
