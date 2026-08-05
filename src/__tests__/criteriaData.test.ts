// src/__tests__/criteriaData.test.ts
import { allCriteria } from '../criteria';

describe('allCriteria', () => {
  it('has entries', () => {
    expect(allCriteria.length).toBeGreaterThan(0);
  });

  it('every item has a non-empty id', () => {
    allCriteria.forEach(item => {
      expect(item.id.trim()).not.toBe('');
    });
  });

  it('every item axis, when present, is non-empty', () => {
    allCriteria.forEach(item => {
      if (item.axis !== undefined) {
        expect(item.axis.trim()).not.toBe('');
      }
    });
  });

  it('every item category, when present, is non-empty', () => {
    allCriteria.forEach(item => {
      if (item.category !== undefined) {
        expect(item.category.trim()).not.toBe('');
      }
    });
  });
});
