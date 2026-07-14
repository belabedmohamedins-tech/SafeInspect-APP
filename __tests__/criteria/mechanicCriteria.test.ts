import { mechanicWorkshopCriteria } from '../../src/criteria/mechanicCriteria';

describe('mechanicWorkshopCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(mechanicWorkshopCriteria)).toBe(true);
    expect(mechanicWorkshopCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 7 items', () => {
    expect(mechanicWorkshopCriteria).toHaveLength(7);
  });

  it('all IDs are unique', () => {
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
    mechanicWorkshopCriteria.forEach(item => expect(valid).toContain(item.severity));
  });

  it('controlType values are valid', () => {
    const valid = ['visual', 'doc', 'measurement', 'interview'];
    mechanicWorkshopCriteria.forEach(item => expect(valid).toContain(item.controlType));
  });

  it('contains licence/doc item MCH-29-01', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains hazardous waste items', () => {
    const wasteItems = mechanicWorkshopCriteria.filter(i => i.axis === 'النفايات الخطرة');
    expect(wasteItems.length).toBeGreaterThanOrEqual(2);
  });

  it('contains fire safety item MCH-29-07', () => {
    const item = mechanicWorkshopCriteria.find(i => i.id === 'MCH-29-07');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
  });
});
