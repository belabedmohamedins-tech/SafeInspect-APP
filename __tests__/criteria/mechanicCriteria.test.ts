import { mechanicWorkshopCriteria } from '../../src/criteria/mechanicCriteria';

describe('mechanicWorkshopCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(mechanicWorkshopCriteria)).toBe(true);
  });

  it('should contain exactly 7 items', () => {
    expect(mechanicWorkshopCriteria).toHaveLength(7);
  });

  it('should have no duplicate IDs', () => {
    const ids = mechanicWorkshopCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow MCH- prefix', () => {
    mechanicWorkshopCriteria.forEach(item => expect(item.id).toMatch(/^MCH-/));
  });

  it('all items have required fields', () => {
    mechanicWorkshopCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity values are valid', () => {
    mechanicWorkshopCriteria.forEach(item =>
      expect(['low', 'medium', 'high']).toContain(item.severity)
    );
  });

  it('MCH-29-01 is licence doc high', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('MCH-29-02 nuisance to neighbours should be medium severity (measurement)', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('measurement');
  });

  it('MCH-29-03 should require sealed containers for used oil (visual)', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('MCH-29-07 is fire safety visual high', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-07');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('axes cover expected domains', () => {
    const axes = new Set(mechanicWorkshopCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('النفايات الخطرة')).toBe(true);
    expect(axes.has('النظافة والسلامة')).toBe(true);
  });
});
