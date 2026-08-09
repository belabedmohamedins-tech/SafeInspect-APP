// src/__tests__/criteriaData.test.ts
// W39: allCriteria was removed in W20 (zero usages). This test file is updated
// to import individual arrays and build a combined list for the same assertions.
import {
  abattoirCriteria,
} from '../criteria/abattoirCriteria';
import {
  bakeryCriteria,
} from '../criteria/bakeryCriteria';
import {
  baseGeneralCriteria,
} from '../criteria/baseGeneralCriteria';
import {
  baseFoodCriteria,
} from '../criteria/baseFoodCriteria';
import {
  gplCriteria,
} from '../criteria/gplCriteria';
import { InspectionItem } from '../types';

// Aggregate here the same way the barrel would have — enough to verify the
// contract without re-implementing the removed allCriteria export.
const allCriteria: InspectionItem[] = [
  ...abattoirCriteria,
  ...bakeryCriteria,
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
  ...gplCriteria,
];

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
