// src/criteria/__tests__/abattoirCriteria.test.ts
import { abattoirCriteria } from '../abattoirCriteria';

describe('abattoirCriteria', () => {
  it('has at least one criterion', () => {
    expect(abattoirCriteria.length).toBeGreaterThan(0);
  });

  it('every item has a non-empty id', () => {
    abattoirCriteria.forEach(item => {
      expect(item.id.trim().length).toBeGreaterThan(0);
    });
  });

  it('numericField min < max when both are defined', () => {
    abattoirCriteria
      .filter(item => item.numericField?.min !== undefined && item.numericField?.max !== undefined)
      .forEach(item => {
        expect(item.numericField!.min!).toBeLessThan(item.numericField!.max!);
      });
  });
});
