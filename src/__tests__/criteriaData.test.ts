// src/__tests__/criteriaData.test.ts
import { allCriteria } from '../criteria';
import { InspectionItem } from '../types';

describe('allCriteria', () => {
  it('has entries', () => {
    expect(allCriteria.length).toBeGreaterThan(0);
  });

  it('every item has a non-empty id', () => {
    allCriteria.forEach((item: InspectionItem) => {
      expect(item.id.trim()).not.toBe('');
    });
  });

  it('every item axis, when present, is non-empty', () => {
    allCriteria.forEach((item: InspectionItem) => {
      if (item.axis !== undefined) {
        expect(item.axis.trim()).not.toBe('');
      }
    });
  });

  it('every item category, when present, is non-empty', () => {
    allCriteria.forEach((item: InspectionItem) => {
      if (item.category !== undefined) {
        expect(item.category.trim()).not.toBe('');
      }
    });
  });
});
