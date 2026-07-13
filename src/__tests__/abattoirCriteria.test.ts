import { abattoirSpecificCriteria } from '../criteria/abattoirCriteria';
import { InspectionItem } from '../types';

describe('abattoirSpecificCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(abattoirSpecificCriteria)).toBe(true);
  });

  it('contains exactly 20 criteria', () => {
    expect(abattoirSpecificCriteria).toHaveLength(20);
  });

  it('has no duplicate IDs', () => {
    const ids = abattoirSpecificCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the ABT-AXN-NN pattern', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^ABT-AX\d+-\d+$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high severity', () => {
    const highCount = abattoirSpecificCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(14);
  });

  it('covers expected axes', () => {
    const axes = new Set(abattoirSpecificCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('الهوية والتصنيف');
    expect(axes).toContain('الذبح والفحص الصحي');
    expect(axes).toContain('مخلفات الذبح');
    expect(axes).toContain('سلسلة التبريد');
    expect(axes).toContain('نظافة قاعات الذبح');
    expect(axes).toContain('السلامة من الحريق');
    expect(axes).toContain('مكافحة النواقل');
  });

  it('measurement items have numericField defined', () => {
    const measurements = abattoirSpecificCriteria.filter((c: InspectionItem) => c.controlType === 'measurement');
    expect(measurements.length).toBeGreaterThan(0);
    measurements.forEach((c: InspectionItem) => {
      expect(c.numericField).toBeDefined();
      expect(c.numericField!.unit).toBeTruthy();
    });
  });

  it('chlorine measurement ABT-AX3-01 has correct numericField bounds', () => {
    const item = abattoirSpecificCriteria.find((c: InspectionItem) => c.id === 'ABT-AX3-01');
    expect(item).toBeDefined();
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('mg/L');
    expect(item!.numericField!.min).toBe(0.1);
    expect(item!.numericField!.lowerLimit).toBe(true);
  });

  it('cold room temperature ABT-AX5-01 has correct numericField bounds', () => {
    const item = abattoirSpecificCriteria.find((c: InspectionItem) => c.id === 'ABT-AX5-01');
    expect(item).toBeDefined();
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('°C');
    expect(item!.numericField!.min).toBe(0);
    expect(item!.numericField!.max).toBe(5);
  });

  it('HACCP item ABT-AX8-01 is category تنظيمية and controlType doc', () => {
    const item = abattoirSpecificCriteria.find((c: InspectionItem) => c.id === 'ABT-AX8-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
  });

  it('AX1 identity item ABT-AX1-01 is high severity and doc type', () => {
    const item = abattoirSpecificCriteria.find((c: InspectionItem) => c.id === 'ABT-AX1-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('all valid controlTypes are used', () => {
    const validTypes = ['visual', 'doc', 'measurement'];
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(validTypes).toContain(c.controlType);
    });
  });
});
