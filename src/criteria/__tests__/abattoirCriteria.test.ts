// src/criteria/__tests__/abattoirCriteria.test.ts
import { abattoirSpecificCriteria } from '../abattoirCriteria';
import { InspectionItem } from '../../types';

describe('abattoirSpecificCriteria', () => {
  it('has at least one criterion', () => {
    expect(abattoirSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('every item has a non-empty id', () => {
    abattoirSpecificCriteria.forEach((item: InspectionItem) => {
      expect(item.id.trim().length).toBeGreaterThan(0);
    });
  });

  it('numericField min < max when both are defined', () => {
    abattoirSpecificCriteria
      .filter((item: InspectionItem) => item.numericField?.min !== undefined && item.numericField?.max !== undefined)
      .forEach((item: InspectionItem) => {
        expect(item.numericField!.min!).toBeLessThan(item.numericField!.max!);
      });
  });
});
