import { printingCriteria } from '../criteria/printingCriteria';
import { InspectionItem } from '../types';

describe('printingCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(printingCriteria)).toBe(true);
  });

  it('contains exactly 9 criteria', () => {
    expect(printingCriteria).toHaveLength(9);
  });

  it('has no duplicate IDs', () => {
    const ids = printingCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the PRT-XX-XX pattern', () => {
    printingCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^PRT-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    printingCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    printingCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    printingCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    printingCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    printingCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high severity (chemical/fire hazards)', () => {
    const highCount = printingCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(6);
  });

  it('covers expected axes', () => {
    const axes = new Set(printingCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('التهوية ومنع التلوث الهوائي');
    expect(axes).toContain('تسيير النفايات الكيميائية');
    expect(axes).toContain('السلامة المهنية');
  });

  it('paper recycling criterion PRT-04-01 is low severity', () => {
    const item = printingCriteria.find((c: InspectionItem) => c.id === 'PRT-04-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('low');
    expect(item!.category).toBe('بيئية');
  });

  it('PPE criterion PRT-05-01 is visual controlType', () => {
    const item = printingCriteria.find((c: InspectionItem) => c.id === 'PRT-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('chemical storage criterion PRT-03-03 is visual controlType', () => {
    const item = printingCriteria.find((c: InspectionItem) => c.id === 'PRT-03-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
  });
});
