// src/__tests__/uabCriteria.test.ts
import { uabCriteria } from '../criteria/uabCriteria';
import { InspectionItem } from '../types';

describe('uabCriteria', () => {
  it('has at least 1 criterion', () => {
    expect(uabCriteria.length).toBeGreaterThanOrEqual(1);
  });

  it('has no duplicate IDs', () => {
    const ids = uabCriteria.map((item: InspectionItem) => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs match UAB-XX-XX pattern', () => {
    uabCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^UAB-\d{2}-\d{2}$/);
    });
  });

  it('all items have required fields', () => {
    uabCriteria.forEach((item: InspectionItem) => {
      expect(item.axis).toBeTruthy();
      expect(item.criteria).toBeTruthy();
      expect(item.legalReference).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });
});
