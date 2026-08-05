// src/__tests__/numericUtils.test.ts
import { isInWarningRange, isOutOfRange } from '../utils/numericUtils';
import { NumericFieldSpec } from '../types';

const spec: NumericFieldSpec = {
  min: 10,
  max: 30,
  warningMin: 5,
  warningMax: 35,
  unit: '°C',
  labelAr: 'درجة الحرارة',
};

describe('isOutOfRange', () => {
  it('returns true when below min', () => expect(isOutOfRange(5, spec)).toBe(true));
  it('returns true when above max', () => expect(isOutOfRange(35, spec)).toBe(true));
  it('returns false when within range', () => expect(isOutOfRange(20, spec)).toBe(false));
  it('returns false when null', () => expect(isOutOfRange(null, spec)).toBe(false));
});

describe('isInWarningRange', () => {
  it('returns true when in warning low zone', () => expect(isInWarningRange(7, spec)).toBe(true));
  it('returns true when in warning high zone', () => expect(isInWarningRange(33, spec)).toBe(true));
  it('returns false when fully within range', () => expect(isInWarningRange(20, spec)).toBe(false));
  it('returns false when null', () => expect(isInWarningRange(null, spec)).toBe(false));
});
