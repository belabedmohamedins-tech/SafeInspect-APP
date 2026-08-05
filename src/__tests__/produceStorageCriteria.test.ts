// src/__tests__/produceStorageCriteria.test.ts
import { produceStorageCriteria } from '../criteria/produceStorageCriteria';
import { InspectionItem } from '../types';

describe('produceStorageCriteria', () => {
  it('has at least 1 criterion', () => {
    expect(produceStorageCriteria.length).toBeGreaterThanOrEqual(1);
  });

  it('has no duplicate IDs', () => {
    const ids = produceStorageCriteria.map((item: InspectionItem) => item.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs match PRD-XX-XX or PRD-XX-XXY pattern', () => {
    produceStorageCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^PRD-\d{2}-\d{2}[a-z]?$/);
    });
  });

  it('all items have required fields', () => {
    produceStorageCriteria.forEach((item: InspectionItem) => {
      expect(item.axis).toBeTruthy();
      expect(item.criteria).toBeTruthy();
      expect(item.legalReference).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('contains temperature-related criteria', () => {
    const hasTemp = produceStorageCriteria.some(
      i => i.id === 'PRD-02-01' || i.id === 'PRD-02-01b'
    );
    expect(hasTemp).toBe(true);
  });
});
