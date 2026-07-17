// src/__tests__/carpenteryCriteria.test.ts
import { carpenteryCriteria } from '../criteria/carpenteryCriteria';
import { InspectionItem } from '../types';

describe('carpenteryCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(carpenteryCriteria)).toBe(true);
    expect(carpenteryCriteria.length).toBeGreaterThan(0);
  });

  it('every item has required fields', () => {
    for (const item of carpenteryCriteria as InspectionItem[]) {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toMatch(/^(low|medium|high)$/);
      expect(item.controlType).toMatch(/^(visual|doc|measurement)$/);
    }
  });

  it('CAR-05-02 dust measurement controlType is measurement', () => {
    const item = carpenteryCriteria.find((c: InspectionItem) => c.id === 'CAR-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
  });
});
