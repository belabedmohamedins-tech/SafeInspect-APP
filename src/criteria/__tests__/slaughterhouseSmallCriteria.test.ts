import { slaughterhouseSmallCriteria } from '../slaughterhouseSmallCriteria';
import { InspectionItem } from '../../types';

describe('slaughterhouseSmallCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(slaughterhouseSmallCriteria)).toBe(true);
    expect(slaughterhouseSmallCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 11 items', () => {
    expect(slaughterhouseSmallCriteria).toHaveLength(11);
  });

  it('all items have required InspectionItem fields', () => {
    slaughterhouseSmallCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.category).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.legalReference).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBeDefined();
    });
  });

  it('all IDs are unique', () => {
    const ids = slaughterhouseSmallCriteria.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow SLH- prefix pattern', () => {
    slaughterhouseSmallCriteria.forEach((item) => {
      expect(item.id).toMatch(/^SLH-/);
    });
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    slaughterhouseSmallCriteria.forEach((item) => {
      expect(valid).toContain(item.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    slaughterhouseSmallCriteria.forEach((item) => {
      expect(valid).toContain(item.controlType);
    });
  });

  it('all items start with complianceStatus not-evaluated', () => {
    slaughterhouseSmallCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('contains SLH-05-01 (identity/docs)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains SLH-05-02 (ante mortem inspection)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-02');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('الذبح والفحص الصحي');
    expect(item!.controlType).toBe('visual');
  });

  it('contains SLH-05-03 (post mortem inspection)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
  });

  it('contains SLH-05-04 (waste separation)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-04');
    expect(item).toBeDefined();
    expect(item!.category).toBe('بيئية');
    expect(item!.controlType).toBe('visual');
  });

  it('contains SLH-05-05 (solid waste contract)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });

  it('contains SLH-05-06 (water quality)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-06');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('test');
  });

  it('contains SLH-05-07 (cold storage)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-07');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('غرف التبريد');
    expect(item!.controlType).toBe('test');
  });

  it('contains SLH-05-08 (slaughter hall hygiene)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-08');
    expect(item).toBeDefined();
    expect(item!.category).toBe('نظافة');
    expect(item!.controlType).toBe('visual');
  });

  it('contains SLH-05-09 (worker hygiene)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-09');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
  });

  it('contains SLH-06-01 (HACCP system)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-06-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('نظام HACCP وسلامة الغذاء');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains SLH-07-01 (veterinary waste three-stream)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-07-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('النفايات البيطرية والطبية');
    expect(item!.category).toBe('بيئية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.legalReference).toContain('03-478');
  });

  it('does NOT contain removed SLH-05-10 (pest dedup)', () => {
    const item = slaughterhouseSmallCriteria.find((i) => i.id === 'SLH-05-10');
    expect(item).toBeUndefined();
  });

  it('axes cover the expected domains', () => {
    const axes = new Set(slaughterhouseSmallCriteria.map((i) => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('الذبح والفحص الصحي')).toBe(true);
    expect(axes.has('مخلفات الذبح')).toBe(true);
    expect(axes.has('غرف التبريد')).toBe(true);
    expect(axes.has('نظام HACCP وسلامة الغذاء')).toBe(true);
    expect(axes.has('النفايات البيطرية والطبية')).toBe(true);
  });
});
