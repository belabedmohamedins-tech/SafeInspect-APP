// __tests__/criteria/marbleCriteria.test.ts
import { marbleCriteria } from '../../src/criteria/marbleCriteria';
import { InspectionItem } from '../../src/types';

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

  it('contains silica air quality item MRB-05-05', () => {
    const item = marbleCriteria.find(i => i.id === 'MRB-05-05');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.axis).toBe('الانبعاثات الهوائية');
  });
});
