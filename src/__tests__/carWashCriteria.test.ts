import { carWashCriteria } from '../criteria/carWashCriteria';
import { InspectionItem } from '../types';

describe('carWashCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(carWashCriteria)).toBe(true);
  });

  it('contains exactly 12 criteria', () => {
    expect(carWashCriteria).toHaveLength(12);
  });

  it('has no duplicate IDs', () => {
    const ids = carWashCriteria.map((i: InspectionItem) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match CWS-XX-XX pattern', () => {
    carWashCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toMatch(/^CWS-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    carWashCriteria.forEach((item: InspectionItem) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity is valid for all items', () => {
    carWashCriteria.forEach((item: InspectionItem) => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });
});
