import { abattoirSpecificCriteria } from '../abattoirCriteria';
import { InspectionItem } from '../../types';

describe('abattoirSpecificCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(abattoirSpecificCriteria)).toBe(true);
    expect(abattoirSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 24 items', () => {
    expect(abattoirSpecificCriteria).toHaveLength(24);
  });

  it('all items have required InspectionItem fields', () => {
    abattoirSpecificCriteria.forEach((item: InspectionItem) => {
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
    const ids = abattoirSpecificCriteria.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow ABT- prefix pattern', () => {
    abattoirSpecificCriteria.forEach((item) => {
      expect(item.id).toMatch(/^ABT-/);
    });
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    abattoirSpecificCriteria.forEach((item) => {
      expect(valid).toContain(item.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    abattoirSpecificCriteria.forEach((item) => {
      expect(valid).toContain(item.controlType);
    });
  });

  it('all items start with complianceStatus not-evaluated', () => {
    abattoirSpecificCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  // AX1
  it('contains ABT-AX1-01 (identity/classification)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX1-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  // AX2
  it('contains ABT-AX2-01 (ante mortem)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX2-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('الذبح والفحص الصحي');
    expect(item!.controlType).toBe('visual');
  });

  it('contains ABT-AX2-02 (post mortem)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX2-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
  });

  it('contains ABT-AX2-03 (live/carcass separation)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX2-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
  });

  // AX3 — numericField
  it('contains ABT-AX3-01 (wash water quality) with numericField', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX3-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('mg/L');
    expect(item!.numericField!.min).toBe(0.1);
    expect(item!.numericField!.max).toBe(0.5);
    expect(item!.numericField!.lowerLimit).toBe(true);
  });

  it('contains ABT-AX3-02 (cleaning equipment)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX3-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('medium');
  });

  // AX4
  it('contains ABT-AX4-01 (waste separation)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('بيئية');
  });

  it('contains ABT-AX4-02 (solid waste containers)', () => {
    expect(abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-02')).toBeDefined();
  });

  it('contains ABT-AX4-03 (approved waste contractor)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });

  it('contains ABT-AX4-04A (septic pit)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-04A');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('doc');
  });

  it('contains ABT-AX4-04B (public sewer discharge)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-04B');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('contains ABT-AX4-05 (animal by-products treatment)', () => {
    expect(abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-05')).toBeDefined();
  });

  // AX5 — numericField
  it('contains ABT-AX5-01 (cold room) with numericField', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX5-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('°C');
    expect(item!.numericField!.min).toBe(0);
    expect(item!.numericField!.max).toBe(5);
  });

  it('contains ABT-AX5-02 (cold room temp recording)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX5-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });

  it('contains ABT-AX5-03 (cold storage separation)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX5-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
  });

  // AX6
  it('contains ABT-AX6-01 (slaughter hall floors)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX6-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('نظافة');
    expect(item!.controlType).toBe('visual');
  });

  it('contains ABT-AX6-02 (cleaning programme)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX6-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });

  it('contains ABT-AX6-03 (no live animals in processing)', () => {
    expect(abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX6-03')).toBeDefined();
  });

  // AX7
  it('contains ABT-AX7-01 (worker medical exams)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX7-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });

  it('contains ABT-AX7-02 (worker PPE)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX7-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  // AX8
  it('contains ABT-AX8-01 (HACCP plan)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX8-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
  });

  it('contains ABT-AX8-02 (admin compliance)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX8-02');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
  });

  // AX9
  it('contains ABT-AX9-01 (fire safety)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX9-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('السلامة من الحريق');
    expect(item!.controlType).toBe('visual');
  });

  // AX10
  it('contains ABT-AX10-01 (pest control)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX10-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('بيئية');
    expect(item!.controlType).toBe('doc');
  });

  // AX11
  it('contains ABT-AX11-01 (EIA)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX11-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('دراسة التأثير البيئي');
    expect(item!.category).toBe('بيئية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('covers all 11 axes', () => {
    const axes = new Set(abattoirSpecificCriteria.map((i) => i.axis));
    expect(axes.has('الهوية والتصنيف')).toBe(true);
    expect(axes.has('الذبح والفحص الصحي')).toBe(true);
    expect(axes.has('مياه الغسل والتطهير')).toBe(true);
    expect(axes.has('مخلفات الذبح')).toBe(true);
    expect(axes.has('سلسلة التبريد')).toBe(true);
    expect(axes.has('نظافة قاعات الذبح')).toBe(true);
    expect(axes.has('صحة العمال في المذابح')).toBe(true);
    expect(axes.has('HACCP في المذبح')).toBe(true);
    expect(axes.has('السلامة من الحريق')).toBe(true);
    expect(axes.has('مكافحة النواقل')).toBe(true);
    expect(axes.has('دراسة التأثير البيئي')).toBe(true);
  });

  it('items with numericField have valid unit and bounds', () => {
    const measured = abattoirSpecificCriteria.filter(
      (i) => i.controlType === 'measurement' && i.numericField
    );
    expect(measured.length).toBeGreaterThan(0);
    measured.forEach((item) => {
      expect(item.numericField!.unit).toBeTruthy();
      expect(typeof item.numericField!.min).toBe('number');
      expect(typeof item.numericField!.max).toBe('number');
      expect(item.numericField!.min).toBeLessThan(item.numericField!.max);
    });
  });
});
