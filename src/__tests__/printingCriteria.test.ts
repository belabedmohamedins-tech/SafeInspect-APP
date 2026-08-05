// src/__tests__/printingCriteria.test.ts
import { printingCriteria } from '../criteria/printingCriteria';
import { InspectionItem } from '../types';

describe('printingCriteria', () => {
  it('has at least 1 criterion', () => {
    expect(printingCriteria.length).toBeGreaterThanOrEqual(1);
  });

  it('has no duplicate IDs', () => {
    const ids = printingCriteria.map((item: InspectionItem) => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs match PRT-XX-XX pattern', () => {
    printingCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^PRT-\d{2}-\d{2}$/);
    });
  });

  it('all items have required fields', () => {
    printingCriteria.forEach((item: InspectionItem) => {
      expect(item.axis).toBeTruthy();
      expect(item.criteria).toBeTruthy();
      expect(item.legalReference).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });
});
