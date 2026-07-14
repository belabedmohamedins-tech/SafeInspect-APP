import { carWashCriteria } from '../criteria/carWashCriteria';

describe('carWashCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(carWashCriteria)).toBe(true);
  });

  it('contains exactly 11 criteria', () => {
    expect(carWashCriteria).toHaveLength(11);
  });

  it('has no duplicate IDs', () => {
    const ids = carWashCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match CWS-XX-XX pattern', () => {
    carWashCriteria.forEach(item => {
      expect(item.id).toMatch(/^CWS-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    carWashCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    carWashCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });
});
