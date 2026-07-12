import { carWashCriteria } from '../../src/criteria/carWashCriteria';

describe('carWashCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(carWashCriteria)).toBe(true);
  });

  it('should contain exactly 10 items', () => {
    expect(carWashCriteria).toHaveLength(10);
  });

  it('should have no duplicate IDs', () => {
    const ids = carWashCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match CWS-XX-XX pattern', () => {
    carWashCriteria.forEach(item => {
      expect(item.id).toMatch(/^CWS-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    carWashCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    carWashCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    carWashCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('CWS-03-01 should require oil separator (visual)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('تسيير مياه الغسل');
  });

  it('CWS-03-02 should prohibit discharge to public road (high severity)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-03-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
  });

  it('CWS-03-03 water economy should be low severity', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-03-03');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('low');
  });

  it('CWS-04-02 should require authorised operator contract (doc)', () => {
    const item = carWashCriteria.find(i => i.id === 'CWS-04-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(carWashCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('تسيير مياه الغسل')).toBe(true);
    expect(axes.has('المواد الكيميائية')).toBe(true);
    expect(axes.has('النظافة والسلامة')).toBe(true);
  });
});
