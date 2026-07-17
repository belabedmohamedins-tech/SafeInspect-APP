// src/__tests__/marbleCriteria.test.ts
import { marbleCriteria } from '../criteria/marbleCriteria';
import { InspectionItem } from '../types';

describe('marbleCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
    expect(marbleCriteria.length).toBeGreaterThan(0);
  });

  it('every item has required fields', () => {
    for (const item of marbleCriteria as InspectionItem[]) {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toMatch(/^(low|medium|high)$/);
      expect(item.controlType).toMatch(/^(visual|doc|measurement)$/);
    }
  });

  it('MRB-05-05 silica dust measurement is measurement type', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
  });
});
