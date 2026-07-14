import { printingCriteria } from '../criteria/printingCriteria';

describe('printingCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(printingCriteria)).toBe(true);
  });

  it('contains exactly 10 criteria', () => {
    expect(printingCriteria).toHaveLength(10);
  });

  it('has no duplicate IDs', () => {
    const ids = printingCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match PRT-XX-XX pattern', () => {
    printingCriteria.forEach(item => {
      expect(item.id).toMatch(/^PRT-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    printingCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    printingCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });
});
