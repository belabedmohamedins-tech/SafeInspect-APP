import { semiPharmaCriteria } from '../criteria/semiPharmaCriteria';
import { InspectionItem } from '../types';

describe('semiPharmaCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(semiPharmaCriteria)).toBe(true);
  });

  it('contains exactly 10 criteria', () => {
    expect(semiPharmaCriteria).toHaveLength(10);
  });

  it('has no duplicate IDs', () => {
    const ids = semiPharmaCriteria.map((i: InspectionItem) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow the SPH-XX-XX pattern', () => {
    semiPharmaCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^SPH-\d{2}-\d{2}$/);
    });
  });

  it('all items have required fields', () => {
    semiPharmaCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeTruthy();
      expect(item.criteria).toBeTruthy();
      expect(item.legalReference).toBeTruthy();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBeDefined();
    });
  });

  it('all items default to not-evaluated', () => {
    semiPharmaCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    semiPharmaCriteria.forEach((c: InspectionItem) => {
      expect(['high', 'medium', 'low']).toContain(c.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    semiPharmaCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.controlType);
    });
  });

  it('covers expected axes', () => {
    const axes = new Set(semiPharmaCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('نظافة فضاءات التعبئة');
    expect(axes).toContain('المواد الأولية والتخزين');
    expect(axes).toContain('التوسيم والتتبعية');
    expect(axes).toContain('صحة العمال');
  });

  it('SPH-01-01 operating license is high severity doc', () => {
    const item = semiPharmaCriteria.find((c: InspectionItem) => c.id === 'SPH-01-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('SPH-04-02 traceability is medium severity', () => {
    const item = semiPharmaCriteria.find((c: InspectionItem) => c.id === 'SPH-04-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('doc');
  });

  it('SPH-06-01 EIA criterion exists as high severity doc', () => {
    const item = semiPharmaCriteria.find((c: InspectionItem) => c.id === 'SPH-06-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
    expect(item!.axis).toBe('دراسة التأثير البيئي');
  });
});
