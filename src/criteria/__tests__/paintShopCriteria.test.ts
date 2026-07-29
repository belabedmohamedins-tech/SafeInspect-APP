import { paintShopCriteria } from '../paintShopCriteria';
import { InspectionItem } from '../../types';

describe('paintShopCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(paintShopCriteria)).toBe(true);
    expect(paintShopCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 11 items', () => {
    expect(paintShopCriteria).toHaveLength(11);
  });

  it('all items have required InspectionItem fields', () => {
    paintShopCriteria.forEach((item: InspectionItem) => {
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
    const ids = paintShopCriteria.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow PNT- prefix pattern', () => {
    paintShopCriteria.forEach((item) => {
      expect(item.id).toMatch(/^PNT-/);
    });
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    paintShopCriteria.forEach((item) => {
      expect(valid).toContain(item.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    paintShopCriteria.forEach((item) => {
      expect(valid).toContain(item.controlType);
    });
  });

  it('all items start with complianceStatus not-evaluated', () => {
    paintShopCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('does NOT contain removed PNT-01-01 (BGN-01-01 restate)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-01-01');
    expect(item).toBeUndefined();
  });

  it('contains PNT-01-02 (trade register)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-01-02');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains PNT-02-01 (mechanical ventilation) with corrected 06-138 citation', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-02-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('بيئية');
    expect(item!.controlType).toBe('visual');
    expect(item!.legalReference).toContain('06-138');
    expect(item!.legalReference).not.toContain('06-141');
  });

  it('contains PNT-02-02 (air filters) with corrected 06-138 citation', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-02-02');
    expect(item).toBeDefined();
    expect(item!.category).toBe('بيئية');
    expect(item!.controlType).toBe('visual');
    expect(item!.legalReference).toContain('06-138');
    expect(item!.legalReference).not.toContain('06-141');
  });

  // Phase 7.1 + Phase 11b — periodic VOC measurement numericField
  it('contains PNT-02-03 (VOC measurement) with correct numericField', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-02-03');
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

  // Phase 11b — retention criterion
  it('contains PNT-07-02 (VOC measurement report retention ≥ 3 years)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-07-02');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('medium');
    expect(item!.legalReference).toContain('06-138');
  });

  it('contains PNT-03-01 (hazardous waste containers)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains PNT-03-02 (certified waste collector contract)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains PNT-03-03 (solvent storage — closed ventilated room)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-03-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    // Confirms 93-120 has been replaced by correct citations
    expect(item!.legalReference).not.toContain('93-120');
  });

  it('contains PNT-04-01 (PPE for painters)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-04-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('سلامة');
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
    // Confirms 93-120 is NOT used for PPE
    expect(item!.legalReference).not.toContain('93-120');
  });

  it('contains PNT-04-02 (no open flame / no smoking in paint zone)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-04-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains PNT-04-03 (CO2/dry-powder fire extinguishers)', () => {
    const item = paintShopCriteria.find((i) => i.id === 'PNT-04-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('axes cover the expected domains', () => {
    const axes = new Set(paintShopCriteria.map((i) => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('التهوية ومنع التلوث الهوائي')).toBe(true);
    expect(axes.has('تسيير النفايات الخطرة')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });

  it('numericField items have valid schema', () => {
    const withNumeric = paintShopCriteria.filter((i) => i.numericField !== undefined);
    expect(withNumeric.length).toBeGreaterThanOrEqual(1);
    withNumeric.forEach((item) => {
      expect(item.numericField!.unit).toBeDefined();
      expect(item.numericField!.labelAr).toBeDefined();
      expect(typeof item.numericField!.max).toBe('number');
      expect(typeof item.numericField!.warningMax).toBe('number');
      expect(typeof item.numericField!.step).toBe('number');
      expect(item.numericField!.upperLimit).toBe(true);
    });
  });

  it('no criteria cite 06-141 for air emissions (all corrected to 06-138)', () => {
    const voc = paintShopCriteria.filter(
      (i) => i.axis === 'التهوية ومنع التلوث الهوائي',
    );
    voc.forEach((item) => {
      expect(item.legalReference).not.toContain('06-141');
    });
  });
});
