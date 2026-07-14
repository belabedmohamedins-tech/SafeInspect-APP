import { blacksmithCriteria } from '../criteria/blacksmithCriteria';
import { InspectionItem } from '../types';

describe('blacksmithCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(blacksmithCriteria)).toBe(true);
  });

  it('contains exactly 13 criteria', () => {
    expect(blacksmithCriteria).toHaveLength(13);
  });

  it('has no duplicate IDs', () => {
    const ids = blacksmithCriteria.map((i: InspectionItem) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match BLS-XX-XX or CGS-XX-XX pattern', () => {
    blacksmithCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^(BLS|CGS)-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    blacksmithCriteria.forEach((item: InspectionItem) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    blacksmithCriteria.forEach((item: InspectionItem) => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('BLS-01-01 operating license is high severity doc', () => {
    const item = blacksmithCriteria.find((c: InspectionItem) => c.id === 'BLS-01-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('gas storage cylinder criterion exists (CGS-01-01)', () => {
    const gasItem = blacksmithCriteria.find((c: InspectionItem) => c.id === 'CGS-01-01');
    expect(gasItem).toBeDefined();
    expect(gasItem!.severity).toBe('high');
  });

  it('has items covering السلامة المهنية axis', () => {
    const safetyItems = blacksmithCriteria.filter(
      (c: InspectionItem) => c.axis === 'السلامة المهنية'
    );
    expect(safetyItems.length).toBeGreaterThanOrEqual(2);
  });
});
