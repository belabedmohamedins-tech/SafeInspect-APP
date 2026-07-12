import { mechanicWorkshopCriteria } from '../../src/criteria/mechanicCriteria';

describe('mechanicWorkshopCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(mechanicWorkshopCriteria)).toBe(true);
  });

  it('should contain exactly 6 items', () => {
    expect(mechanicWorkshopCriteria).toHaveLength(6);
  });

  it('should have no duplicate IDs', () => {
    const ids = mechanicWorkshopCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match MCH-29-XX pattern', () => {
    mechanicWorkshopCriteria.forEach(item => {
      expect(item.id).toMatch(/^MCH-29-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    mechanicWorkshopCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    mechanicWorkshopCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    mechanicWorkshopCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('MCH-29-01 should be doc controlType for operating licence', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('هوية المنشأة والوثائق');
  });

  it('MCH-29-02 nuisance to neighbours should be medium severity', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  it('MCH-29-03 should require sealed containers for used oil (visual)', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('النفايات الخطرة');
  });

  it('MCH-29-04 should require authorised operator contract (doc)', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-04');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('MCH-29-05 should require oil separator for wastewater', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-05');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('المياه والصرف');
    expect(item!.severity).toBe('high');
  });

  it('MCH-29-06 fire extinguisher should be safety category', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-06');
    expect(item).toBeDefined();
    expect(item!.category).toBe('سلامة');
    expect(item!.severity).toBe('high');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(mechanicWorkshopCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('النفايات الخطرة')).toBe(true);
    expect(axes.has('المياه والصرف')).toBe(true);
    expect(axes.has('النظافة والسلامة')).toBe(true);
  });
});
