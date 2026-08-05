// src/__tests__/utils.test.ts
// Tests for utility functions in src/utils/
import { NumericFieldSpec } from '../types';
import { isInWarningRange, isOutOfRange } from '../utils/numericUtils';

const baseSpec: NumericFieldSpec = {
  min: 10,
  max: 30,
  warningMin: 5,
  warningMax: 35,
  unit: '°C',
  labelAr: 'درجة الحرارة',
};

describe('isOutOfRange', () => {
  it('returns true below min', () => expect(isOutOfRange(5, baseSpec)).toBe(true));
  it('returns true above max', () => expect(isOutOfRange(35, baseSpec)).toBe(true));
  it('returns false in range', () => expect(isOutOfRange(20, baseSpec)).toBe(false));
  it('handles null', () => expect(isOutOfRange(null, baseSpec)).toBe(false));

  it('handles open spec (no min/max)', () => {
    const openSpec: NumericFieldSpec = {
      warningMin: undefined,
      warningMax: undefined,
      unit: '',
      labelAr: '',
    };
    expect(isOutOfRange(999, openSpec)).toBe(false);
  });
});

describe('isInWarningRange', () => {
  it('returns true in warning low zone', () => expect(isInWarningRange(7, baseSpec)).toBe(true));
  it('returns true in warning high zone', () => expect(isInWarningRange(33, baseSpec)).toBe(true));
  it('returns false fully within range', () => expect(isInWarningRange(20, baseSpec)).toBe(false));
  it('handles null', () => expect(isInWarningRange(null, baseSpec)).toBe(false));
});
