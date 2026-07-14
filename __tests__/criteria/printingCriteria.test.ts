import { printingCriteria } from '../../src/criteria/printingCriteria';

describe('printingCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(printingCriteria)).toBe(true);
  });

  it('should contain exactly 10 items', () => {
    expect(printingCriteria).toHaveLength(10);
  });

  it('should have no duplicate IDs', () => {
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
