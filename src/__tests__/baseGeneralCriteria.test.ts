import { baseGeneralCriteria } from '../criteria/baseGeneralCriteria';
import { InspectionItem } from '../types';

describe('baseGeneralCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(baseGeneralCriteria)).toBe(true);
  });

  it('contains exactly 31 criteria', () => {
    expect(baseGeneralCriteria).toHaveLength(31);
  });

  it('has no duplicate IDs', () => {
    const ids = baseGeneralCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs match BGN-XX-XX pattern', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^BGN-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty criteria text', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
    });
  });

  it('measurement items have numericField defined', () => {
    const measurements = baseGeneralCriteria.filter(
      (c: InspectionItem) => c.controlType === 'measurement'
    );
    measurements.forEach((item: InspectionItem) => {
      expect(item.numericField).toBeDefined();
    });
  });

  it('BGN-01-01 is high severity doc for operating license', () => {
    const item = baseGeneralCriteria.find(
      (c: InspectionItem) => c.id === 'BGN-01-01'
    );
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('BGN-01-03 inspector obstruction item is high severity', () => {
    const item = baseGeneralCriteria.find(
      (c: InspectionItem) => c.id === 'BGN-01-03'
    );
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('noise measurement criterion BGN-09-01 exists with numericField', () => {
    const item = baseGeneralCriteria.find(
      (c: InspectionItem) => c.id === 'BGN-09-01'
    );
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('dB');
  });
});
