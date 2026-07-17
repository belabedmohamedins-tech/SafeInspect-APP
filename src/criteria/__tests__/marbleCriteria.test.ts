import { marbleCriteria } from '../marbleCriteria';
import { InspectionItem } from '../../types';

describe('marbleCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
    expect(marbleCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 10 items', () => {
    expect(marbleCriteria).toHaveLength(10);
  });

  it('all items have required InspectionItem fields', () => {
    marbleCriteria.forEach((item: InspectionItem) => {
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
    const ids = marbleCriteria.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow MRB- prefix pattern', () => {
    marbleCriteria.forEach((item) => {
      expect(item.id).toMatch(/^MRB-/);
    });
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    marbleCriteria.forEach((item) => {
      expect(valid).toContain(item.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    marbleCriteria.forEach((item) => {
      expect(valid).toContain(item.controlType);
    });
  });

  it('all items start with complianceStatus not-evaluated', () => {
    marbleCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('does NOT contain removed MRB-01-01 (BGN-01-01 restate)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-01-01');
    expect(item).toBeUndefined();
  });

  it('contains MRB-02-01 (trade register)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-02-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  // G6 citation fix: 06-141 → 06-138
  it('contains MRB-02-02 (dust nuisance) with corrected 06-138 citation', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-02-02');
    expect(item).toBeDefined();
    expect(item!.category).toBe('بيئية');
    expect(item!.controlType).toBe('visual');
    expect(item!.legalReference).toContain('06-138');
    expect(item!.legalReference).not.toContain('06-141');
  });

  it('contains MRB-03-01 (ventilation / silica dust extraction)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  // Phase 4.1 — wastewater numericField (pre-existing)
  it('contains MRB-03-02 (wastewater MES) with correct numericField', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('mg/L');
    expect(item!.numericField!.max).toBe(35);
    expect(item!.numericField!.warningMax).toBe(30);
    expect(item!.numericField!.upperLimit).toBe(true);
  });

  it('contains MRB-04-01 (marble sludge disposal)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-04-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('medium');
  });

  it('contains MRB-04-02 (discharge permit)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-04-02');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains MRB-05-01 (PPE)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-05-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('سلامة');
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains MRB-05-02 (fire extinguisher + emergency exits)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains MRB-05-03 (periodic medical exams)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-05-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains MRB-05-04 (machine guards)', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-05-04');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  // G6 — numericField: 0.1 mg/m³ free silica ceiling
  it('contains MRB-05-05 (silica air quality measurement) with correct numericField', () => {
    const item = marbleCriteria.find((i) => i.id === 'MRB-05-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.category).toBe('بيئية');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('mg/m³');
    expect(item!.numericField!.max).toBe(0.1);
    expect(item!.numericField!.warningMax).toBe(0.08);
    expect(item!.numericField!.step).toBe(0.01);
    expect(item!.numericField!.upperLimit).toBe(true);
    // G6 citation fix
    expect(item!.legalReference).toContain('06-138');
    expect(item!.legalReference).not.toContain('06-141');
  });

  it('axes cover the expected domains', () => {
    const axes = new Set(marbleCriteria.map((i) => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('الموقع والتهيئة')).toBe(true);
    expect(axes.has('المياه المستعملة والغبار')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
    expect(axes.has('الانبعاثات الهوائية')).toBe(true);
  });

  it('measurement items with numericField have all required schema fields', () => {
    const measurementItems = marbleCriteria.filter(
      (i) => i.controlType === 'measurement' && i.numericField,
    );
    expect(measurementItems.length).toBe(2);
    measurementItems.forEach((item) => {
      expect(item.numericField!.unit).toBeDefined();
      expect(item.numericField!.labelAr).toBeDefined();
      expect(typeof item.numericField!.max).toBe('number');
      expect(typeof item.numericField!.warningMax).toBe('number');
      expect(typeof item.numericField!.step).toBe('number');
      expect(item.numericField!.upperLimit).toBe(true);
    });
  });
});
