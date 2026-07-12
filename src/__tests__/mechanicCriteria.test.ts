import { mechanicWorkshopCriteria } from '../criteria/mechanicCriteria';
import { InspectionItem } from '../types';

describe('mechanicWorkshopCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(mechanicWorkshopCriteria)).toBe(true);
  });

  it('contains exactly 6 criteria', () => {
    expect(mechanicWorkshopCriteria).toHaveLength(6);
  });

  it('has no duplicate IDs', () => {
    const ids = mechanicWorkshopCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the MCH-29-XX pattern', () => {
    mechanicWorkshopCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^MCH-29-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    mechanicWorkshopCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    mechanicWorkshopCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    mechanicWorkshopCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    mechanicWorkshopCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    mechanicWorkshopCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high severity (hazardous waste / fire)', () => {
    const highCount = mechanicWorkshopCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(4);
  });

  it('covers expected axes', () => {
    const axes = new Set(mechanicWorkshopCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('النفايات الخطرة');
    expect(axes).toContain('المياه والصرف');
    expect(axes).toContain('النظافة والسلامة');
  });

  it('used oil collection criterion MCH-29-03 is category بيئية', () => {
    const item = mechanicWorkshopCriteria.find((c: InspectionItem) => c.id === 'MCH-29-03');
    expect(item).toBeDefined();
    expect(item!.category).toBe('بيئية');
    expect(item!.severity).toBe('high');
  });

  it('waste contractor criterion MCH-29-04 is doc controlType', () => {
    const item = mechanicWorkshopCriteria.find((c: InspectionItem) => c.id === 'MCH-29-04');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });
});
