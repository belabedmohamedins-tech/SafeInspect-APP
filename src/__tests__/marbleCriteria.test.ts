import { marbleCriteria } from '../criteria/marbleCriteria';

describe('marbleCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
  });

  it('contains exactly 9 criteria', () => {
    expect(marbleCriteria).toHaveLength(9);
  });

  it('has no duplicate IDs', () => {
    const ids = marbleCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match MRB-XX-XX pattern', () => {
    marbleCriteria.forEach(item => {
      expect(item.id).toMatch(/^MRB-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    marbleCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    marbleCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });
});
