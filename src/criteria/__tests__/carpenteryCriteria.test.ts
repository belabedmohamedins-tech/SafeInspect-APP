import { carpenteryCriteria } from '../carpenteryCriteria';
import { InspectionItem } from '../../types';

describe('carpenteryCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(carpenteryCriteria)).toBe(true);
    expect(carpenteryCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 11 items', () => {
    expect(carpenteryCriteria).toHaveLength(11);
  });

  it('all items have required InspectionItem fields', () => {
    carpenteryCriteria.forEach((item: InspectionItem) => {
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
    const ids = carpenteryCriteria.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow CAR- prefix pattern', () => {
    carpenteryCriteria.forEach((item) => {
      expect(item.id).toMatch(/^CAR-/);
    });
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    carpenteryCriteria.forEach((item) => {
      expect(valid).toContain(item.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    carpenteryCriteria.forEach((item) => {
      expect(valid).toContain(item.controlType);
    });
  });

  it('all items start with complianceStatus not-evaluated', () => {
    carpenteryCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('does NOT contain removed CAR-01-01 (BGN-01-01 restate)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-01-01');
    expect(item).toBeUndefined();
  });

  it('contains CAR-02-01 (ventilation / dust extraction)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-02-01');
    expect(item).toBeDefined();
    expect(item!.axis).toBe('الموقع والتهيئة');
    expect(item!.category).toBe('بيئية');
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  // G6 — numericField: 85 dB(A) noise ceiling
  it('contains CAR-02-02 (noise measurement) with correct numericField', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-02-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.severity).toBe('medium');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('dB(A)');
    expect(item!.numericField!.max).toBe(85);
    expect(item!.numericField!.warningMax).toBe(80);
    expect(item!.numericField!.upperLimit).toBe(true);
    expect(item!.legalReference).not.toContain('06-141');
  });

  it('contains CAR-03-01 (wood waste collection)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-03-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains CAR-03-02 (open burning ban)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains CAR-03-03 (aluminium waste)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-03-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });

  it('contains CAR-04-01 (PPE)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-04-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('سلامة');
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains CAR-04-02 (machine guards + interlock)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-04-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains CAR-04-03 (fire extinguisher service tag)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-04-03');
    expect(item).toBeDefined();
    expect(item!.category).toBe('سلامة');
    expect(item!.controlType).toBe('visual');
  });

  it('contains CAR-04-04 (no smoking / open flame ban)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-04-04');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('contains CAR-05-01 (emergency exits)', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  // G6 — numericField: 5 mg/m³ inhalable wood dust ceiling
  it('contains CAR-05-02 (air quality measurement) with correct numericField', () => {
    const item = carpenteryCriteria.find((i) => i.id === 'CAR-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.category).toBe('بيئية');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('mg/m³');
    expect(item!.numericField!.max).toBe(5);
    expect(item!.numericField!.warningMax).toBe(4);
    expect(item!.numericField!.step).toBe(0.1);
    expect(item!.numericField!.upperLimit).toBe(true);
    // G6 citation fix
    expect(item!.legalReference).toContain('06-138');
    expect(item!.legalReference).not.toContain('06-141');
  });

  it('axes cover the expected domains', () => {
    const axes = new Set(carpenteryCriteria.map((i) => i.axis));
    expect(axes.has('الموقع والتهيئة')).toBe(true);
    expect(axes.has('نفايات الخشب والألمنيوم')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
    expect(axes.has('الانبعاثات الهوائية')).toBe(true);
  });

  it('measurement items with numericField have all required schema fields', () => {
    const measurementItems = carpenteryCriteria.filter(
      (i) => i.controlType === 'measurement' && i.numericField,
    );
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
