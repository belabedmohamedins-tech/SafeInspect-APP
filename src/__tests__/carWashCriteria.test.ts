// src/__tests__/carWashCriteria.test.ts
import { carWashCriteria } from '../criteria/carWashCriteria';
import { InspectionItem } from '../types';

describe('carWashCriteria', () => {
  it('has no duplicate IDs', () => {
    const ids = carWashCriteria.map((item: InspectionItem) => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs match CWS-XX-XX or CWS-XX-XXY pattern', () => {
    carWashCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^CWS-\d{2}-\d{2}[A-Z]?$/);
    });
  });

  it('all items have required fields', () => {
    carWashCriteria.forEach((item: InspectionItem) => {
      expect(item.axis).toBeTruthy();
      expect(item.criteria).toBeTruthy();
      expect(item.legalReference).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('contains at least 12 criteria', () => {
    expect(carWashCriteria.length).toBeGreaterThanOrEqual(12);
  });
});
