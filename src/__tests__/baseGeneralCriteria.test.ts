import { baseGeneralCriteria } from '../criteria/baseGeneralCriteria';
import { InspectionItem } from '../types';

describe('baseGeneralCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(baseGeneralCriteria)).toBe(true);
  });

  it('contains exactly 28 criteria', () => {
    expect(baseGeneralCriteria).toHaveLength(28);
  });

  it('has no duplicate IDs', () => {
    const ids = baseGeneralCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the BGN-NN-NN pattern', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^BGN-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('covers all expected axes', () => {
    const axes = new Set(baseGeneralCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('الموقع والتهيئة العامة');
    expect(axes).toContain('المياه والصرف الصحي');
    expect(axes).toContain('النظافة العامة وتسيير النفايات');
    expect(axes).toContain('مكافحة النواقل');
    expect(axes).toContain('السلامة العامة والوقاية من الحوادث');
  });

  it('majority of items are high severity', () => {
    const highCount = baseGeneralCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(16);
  });

  it('all valid controlTypes used', () => {
    const validTypes = ['visual', 'doc', 'measurement'];
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(validTypes).toContain(c.controlType);
    });
  });

  it('no measurement items (base criteria are visual/doc only)', () => {
    const measurements = baseGeneralCriteria.filter((c: InspectionItem) => c.controlType === 'measurement');
    expect(measurements).toHaveLength(0);
  });

  it('BGN-01-01 is high severity doc for operating license', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-01-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
    expect(item!.category).toBe('تنظيمية');
  });

  it('BGN-08-04 inspector obstruction item is high severity', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-08-04');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('BGN-04-05 open burning prohibition item is high severity', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-04-05');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.category).toBe('بيئية');
  });

  it('BGN-02-07 lighting item is low severity', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-02-07');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('low');
  });

  it('water and sanitation axis has at least 6 items', () => {
    const waterItems = baseGeneralCriteria.filter((c: InspectionItem) => c.axis === 'المياه والصرف الصحي');
    expect(waterItems.length).toBeGreaterThanOrEqual(6);
  });

  it('pest control axis has at least 5 items', () => {
    const pestItems = baseGeneralCriteria.filter((c: InspectionItem) => c.axis === 'مكافحة النواقل');
    expect(pestItems.length).toBeGreaterThanOrEqual(5);
  });
});
