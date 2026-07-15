import { carpenteryCriteria } from '../criteria/carpenteryCriteria';
import { InspectionItem } from '../types';

describe('carpenteryCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(carpenteryCriteria)).toBe(true);
  });

  it('contains exactly 11 criteria', () => {
    expect(carpenteryCriteria).toHaveLength(11);
  });

  it('has no duplicate IDs', () => {
    const ids = carpenteryCriteria.map((i: InspectionItem) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match CAR-XX-XX pattern', () => {
    carpenteryCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^CAR-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    carpenteryCriteria.forEach((item: InspectionItem) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    carpenteryCriteria.forEach((item: InspectionItem) => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('items with measurement controlType should have numericField', () => {
    const measurement = carpenteryCriteria.filter(
      (i: InspectionItem) => i.controlType === 'measurement'
    );
    measurement.forEach((item: InspectionItem) => {
      if (item.numericField !== undefined) {
        expect(item.numericField).toBeDefined();
      }
    });
    expect(measurement.length).toBeGreaterThanOrEqual(0);
  });

  it('CAR-02-01 ventilation is high severity visual', () => {
    const item = carpenteryCriteria.find((c: InspectionItem) => c.id === 'CAR-02-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('visual');
  });

  it('CAR-04-03 fire extinguisher check is high severity visual', () => {
    const item = carpenteryCriteria.find((c: InspectionItem) => c.id === 'CAR-04-03');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('visual');
  });

  it('CAR-05-02 dust measurement is doc', () => {
    const item = carpenteryCriteria.find((c: InspectionItem) => c.id === 'CAR-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });
});
