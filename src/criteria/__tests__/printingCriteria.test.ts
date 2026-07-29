import { printingCriteria } from '../printingCriteria';
import { InspectionItem } from '../../types';

describe('printingCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(printingCriteria)).toBe(true);
    expect(printingCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 12 items', () => {
    expect(printingCriteria).toHaveLength(12);
  });

  it('all items have required InspectionItem fields', () => {
    printingCriteria.forEach((item: InspectionItem) => {
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
    const ids = printingCriteria.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow PRT- prefix pattern', () => {
    printingCriteria.forEach((item) => {
      expect(item.id).toMatch(/^PRT-/);
    });
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    printingCriteria.forEach((item) => {
      expect(valid).toContain(item.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    printingCriteria.forEach((item) => {
      expect(valid).toContain(item.controlType);
    });
  });

  it('all items start with complianceStatus not-evaluated', () => {
    printingCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('does NOT contain removed PRT-01-01 (BGN-01-01 restate)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-01-01');
    expect(item).toBeUndefined();
  });

  it('contains PRT-01-02 (trade register)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-01-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.category).toBe('تنظيمية');
  });

  it('contains PRT-02-01 (mechanical ventilation)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains PRT-02-02 (no untreated air discharge)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-02-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('medium');
  });

  it('contains PRT-02-03 (VOC measurement) with correct numericField', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-02-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.category).toBe('بيئية');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('mg/Nm³');
    expect(item!.numericField!.max).toBe(20);
    expect(item!.numericField!.warningMax).toBe(15);
    expect(item!.numericField!.step).toBe(1);
    expect(item!.numericField!.upperLimit).toBe(true);
    expect(item!.legalReference).toContain('06-138');
    expect(item!.legalReference).not.toContain('06-141');
  });

  it('contains PRT-03-01 (ink/solvent waste collection)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains PRT-03-02 (hazardous waste contractor)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains PRT-03-03 (chemical storage)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-03-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.legalReference).not.toContain('93-120');
  });

  it('contains PRT-04-01 (paper recycling)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-04-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('low');
  });

  it('contains PRT-05-01 (PPE)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-05-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('سلامة');
    expect(item!.controlType).toBe('visual');
    expect(item!.legalReference).not.toContain('93-120');
  });

  it('contains PRT-05-02 (machine guards + interlock)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    expect(item!.legalReference).not.toContain('93-120');
  });

  it('contains PRT-05-03 (fire extinguisher)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-05-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  // Phase 15: retention criterion
  it('contains PRT-07-01 (VOC report retention ≥3 years)', () => {
    const item = printingCriteria.find((i) => i.id === 'PRT-07-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.category).toBe('بيئية');
    expect(item!.severity).toBe('medium');
    expect(item!.legalReference).toContain('03-10');
    expect(item!.criteria).toContain('3 سنوات');
  });

  it('axes cover the expected domains', () => {
    const axes = new Set(printingCriteria.map((i) => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('التهوية ومنع التلوث الهوائي')).toBe(true);
    expect(axes.has('تسيير النفايات الكيميائية')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });

  it('items with numericField have all required schema fields', () => {
    const withNumeric = printingCriteria.filter((i) => i.numericField);
    expect(withNumeric.length).toBeGreaterThan(0);
    withNumeric.forEach((item) => {
      expect(item.numericField!.unit).toBeDefined();
      expect(item.numericField!.labelAr).toBeDefined();
      expect(typeof item.numericField!.warningMax).toBe('number');
      expect(typeof item.numericField!.step).toBe('number');
      expect(item.numericField!.upperLimit).toBe(true);
    });
  });
});
