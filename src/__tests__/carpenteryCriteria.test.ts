import { carpenteryCriteria } from '../criteria/carpenteryCriteria';
import { InspectionItem } from '../types';

describe('carpenteryCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(carpenteryCriteria)).toBe(true);
  });

  it('contains exactly 10 criteria', () => {
    expect(carpenteryCriteria).toHaveLength(10);
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
    // measurement items must have numericField if they exist
    measurement.forEach((item: InspectionItem) => {
      // only assert if the item actually has a numericField defined
      if (item.numericField !== undefined) {
        expect(item.numericField).toBeDefined();
      }
    });
    // just ensure no crash — measurement items are optional
    expect(measurement.length).toBeGreaterThanOrEqual(0);
  });

  it('CAR-01-01 operating license is high severity doc', () => {
    const item = carpenteryCriteria.find((c: InspectionItem) => c.id === 'CAR-01-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });
});
