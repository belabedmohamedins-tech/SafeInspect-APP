import { blacksmithCriteria } from '../blacksmithCriteria';
import { baseCompressedGasCriteria } from '../baseCompressedGasCriteria';
import { InspectionItem } from '../../types';

describe('blacksmithCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(blacksmithCriteria)).toBe(true);
    expect(blacksmithCriteria.length).toBeGreaterThan(0);
  });

  it('includes spread baseCompressedGasCriteria items', () => {
    const cgsIds = baseCompressedGasCriteria.map((i) => i.id);
    cgsIds.forEach((id) => {
      const found = blacksmithCriteria.find((i) => i.id === id);
      expect(found).toBeDefined();
    });
  });

  it('has exactly 9 own BLS- items (excluding CGS spread)', () => {
    const blsItems = blacksmithCriteria.filter((i) => i.id.startsWith('BLS-'));
    expect(blsItems).toHaveLength(9);
  });

  it('all items have required InspectionItem fields', () => {
    blacksmithCriteria.forEach((item: InspectionItem) => {
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
    const ids = blacksmithCriteria.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    blacksmithCriteria.forEach((item) => {
      expect(valid).toContain(item.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    blacksmithCriteria.forEach((item) => {
      expect(valid).toContain(item.controlType);
    });
  });

  it('all items start with complianceStatus not-evaluated', () => {
    blacksmithCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('does NOT contain removed BLS-01-01 (BGN-01-01 restate)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-01-01');
    expect(item).toBeUndefined();
  });

  it('does NOT contain removed BLS-04-02 (replaced by baseCompressedGasCriteria)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-04-02');
    expect(item).toBeUndefined();
  });

  it('contains BLS-02-01 (neighbourhood noise limit)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('medium');
  });

  it('contains BLS-02-02 (no public road occupation)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-02-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
  });

  it('contains BLS-03-01 (metal waste collection)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('medium');
  });

  it('contains BLS-04-01 (PPE)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-04-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('سلامة');
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains BLS-04-03 (electrical safety)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-04-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains BLS-04-04 (fire extinguisher service tag)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-04-04');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains BLS-04-05 (machine guards for grinding/cutting)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-04-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains BLS-04-06 (noise measurement) with correct numericField', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-04-06');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('dB');
    expect(item!.numericField!.warningMax).toBe(85);
    expect(item!.numericField!.step).toBe(1);
    expect(item!.numericField!.upperLimit).toBe(true);
  });

  it('contains BLS-04-07 (welding fumes VOC measurement) with correct numericField', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-04-07');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.category).toBe('بيئية');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('mg/Nm³');
    expect(item!.numericField!.max).toBe(30);
    expect(item!.numericField!.warningMax).toBe(25);
    expect(item!.legalReference).toContain('06-138');
    expect(item!.legalReference).not.toContain('06-141');
  });

  it('contains BLS-05-01 (periodic medical exams)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  // Phase 15: retention criteria
  it('contains BLS-07-01 (welding fumes + noise report retention ≥3 years)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-07-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.category).toBe('بيئية');
    expect(item!.severity).toBe('medium');
    expect(item!.legalReference).toContain('03-10');
    expect(item!.criteria).toContain('3 سنوات');
  });

  it('contains BLS-07-02 (monitoring programme document)', () => {
    const item = blacksmithCriteria.find((i) => i.id === 'BLS-07-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.category).toBe('بيئية');
    expect(item!.severity).toBe('medium');
  });

  it('axes cover the expected domains', () => {
    const axes = new Set(blacksmithCriteria.map((i) => i.axis));
    expect(axes.has('الموقع والتهيئة')).toBe(true);
    expect(axes.has('النفايات المعدنية')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
    expect(axes.has('الانبعاثات الهوائية')).toBe(true);
  });

  it('items with numericField have all required schema fields', () => {
    const withNumeric = blacksmithCriteria.filter((i) => i.numericField);
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
