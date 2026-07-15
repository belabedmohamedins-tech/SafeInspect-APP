import { printingCriteria } from '../../src/criteria/printingCriteria';
import { InspectionItem } from '../../src/types';

describe('printingCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(printingCriteria)).toBe(true);
  });

  // PRT-02-03 added in Phase 7.1 (periodic VOC measurement) → 11 items
  it('should contain exactly 11 items', () => {
    expect(printingCriteria).toHaveLength(11);
  });

  it('should have no duplicate IDs', () => {
    const ids = printingCriteria.map((c: InspectionItem) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all IDs match PRT-XX-XX pattern', () => {
    printingCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^PRT-\d{2}-\d{2}$/);
    });
  });

  it('all items have required fields', () => {
    printingCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all severity values are valid', () => {
    printingCriteria.forEach((item: InspectionItem) => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  // PRT-01-01 removed Phase 2.2 — pure restate of BGN-01-01
  it('PRT-01-01 is not present (removed Phase 2.2)', () => {
    const item = printingCriteria.find((c: InspectionItem) => c.id === 'PRT-01-01');
    expect(item).toBeUndefined();
  });

  it('PRT-02-03 VOC measurement criterion exists (Phase 7.1)', () => {
    const item = printingCriteria.find((c: InspectionItem) => c.id === 'PRT-02-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('medium');
  });

  it('PRT-05-01 PPE criterion cites Loi 90-11 not Décret 93-120 alone', () => {
    const item = printingCriteria.find((c: InspectionItem) => c.id === 'PRT-05-01');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('90-11');
  });

  it('PRT-05-02 machine guard criterion cites Loi 90-11', () => {
    const item = printingCriteria.find((c: InspectionItem) => c.id === 'PRT-05-02');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('90-11');
  });
});
