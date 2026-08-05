// src/__tests__/carpenteryCriteria.test.ts
import { carpenteryCriteria } from '../criteria/carpenteryCriteria';
import { InspectionItem } from '../types';

describe('carpenteryCriteria', () => {
  it('has at least 1 criterion', () => {
    expect(carpenteryCriteria.length).toBeGreaterThanOrEqual(1);
  });

  it('has no duplicate IDs', () => {
    const ids = carpenteryCriteria.map((item: InspectionItem) => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs match CAR-XX-XX pattern', () => {
    carpenteryCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^CAR-\d{2}-\d{2}$/);
    });
  });

  it('all items have required fields', () => {
    carpenteryCriteria.forEach((item: InspectionItem) => {
      expect(item.axis).toBeTruthy();
      expect(item.criteria).toBeTruthy();
      expect(item.legalReference).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });
});
