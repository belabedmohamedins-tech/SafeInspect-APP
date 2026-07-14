import { printingCriteria } from '../criteria/printingCriteria';
import { InspectionItem } from '../types';

describe('printingCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(printingCriteria)).toBe(true);
  });

  it('contains exactly 11 criteria', () => {
    expect(printingCriteria).toHaveLength(11);
  });

  it('has no duplicate IDs', () => {
    const ids = printingCriteria.map((i: InspectionItem) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match PRT-XX-XX pattern', () => {
    printingCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^PRT-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    printingCriteria.forEach((item: InspectionItem) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    printingCriteria.forEach((item: InspectionItem) => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });
});
