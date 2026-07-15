import { mechanicWorkshopCriteria } from '../criteria/mechanicCriteria';
import { InspectionItem } from '../types';

describe('mechanicWorkshopCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(mechanicWorkshopCriteria)).toBe(true);
  });

  it('contains exactly 9 criteria', () => {
    expect(mechanicWorkshopCriteria).toHaveLength(9);
  });

  it('has no duplicate IDs', () => {
    const ids = mechanicWorkshopCriteria.map((i: InspectionItem) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match MCH-29-XX pattern', () => {
    mechanicWorkshopCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^MCH-29-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    mechanicWorkshopCriteria.forEach((item: InspectionItem) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    mechanicWorkshopCriteria.forEach((item: InspectionItem) => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('MCH-29-02 nuisance to neighbours should be medium severity', () => {
    const item = mechanicWorkshopCriteria.find((c: InspectionItem) => c.id === 'MCH-29-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('measurement');
  });

  it('MCH-29-03 should require sealed containers for used oil (visual)', () => {
    const item = mechanicWorkshopCriteria.find((c: InspectionItem) => c.id === 'MCH-29-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
  });

  it('MCH-29-08 brake fluid waste — high severity doc', () => {
    const item = mechanicWorkshopCriteria.find((c: InspectionItem) => c.id === 'MCH-29-08');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
    expect(item!.legalReference).toContain('01-19');
  });

  it('MCH-29-09 end-of-life tyres — medium severity visual', () => {
    const item = mechanicWorkshopCriteria.find((c: InspectionItem) => c.id === 'MCH-29-09');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  it('MCH-29-10 lead-acid batteries — high severity doc', () => {
    const item = mechanicWorkshopCriteria.find((c: InspectionItem) => c.id === 'MCH-29-10');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });
});
