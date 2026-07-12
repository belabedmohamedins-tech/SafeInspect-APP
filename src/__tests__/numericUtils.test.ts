// src/__tests__/numericUtils.test.ts
import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
} from '../../src/utils/numericUtils';
import { NumericFieldSpec } from '../../src/types';

const spec: NumericFieldSpec = {
  min: 10, max: 30,
  warningMin: 5, warningMax: 35,
  unit: 'ppm',
};

describe('deriveNumericCompliance', () => {
  it('returns not-measured for undefined', () => {
    expect(deriveNumericCompliance(undefined, spec)).toBe('not-measured');
  });
  it('returns not-measured for null', () => {
    expect(deriveNumericCompliance(null as any, spec)).toBe('not-measured');
  });
  it('returns not-measured for NaN', () => {
    expect(deriveNumericCompliance(NaN, spec)).toBe('not-measured');
  });
  it('returns compliant when value is within [min, max]', () => {
    expect(deriveNumericCompliance(20, spec)).toBe('compliant');
  });
  it('returns compliant at exact min', () => {
    expect(deriveNumericCompliance(10, spec)).toBe('compliant');
  });
  it('returns compliant at exact max', () => {
    expect(deriveNumericCompliance(30, spec)).toBe('compliant');
  });
  it('returns warning when value is in warning zone below min', () => {
    expect(deriveNumericCompliance(7, spec)).toBe('warning');
  });
  it('returns warning when value is in warning zone above max', () => {
    expect(deriveNumericCompliance(33, spec)).toBe('warning');
  });
  it('returns non-compliant when value is below warningMin', () => {
    expect(deriveNumericCompliance(1, spec)).toBe('non-compliant');
  });
  it('returns non-compliant when value is above warningMax', () => {
    expect(deriveNumericCompliance(99, spec)).toBe('non-compliant');
  });
  it('returns compliant when min is undefined (no lower bound)', () => {
    expect(deriveNumericCompliance(0, { ...spec, min: undefined })).toBe('compliant');
  });
  it('returns compliant when max is undefined (no upper bound)', () => {
    expect(deriveNumericCompliance(999, { ...spec, max: undefined })).toBe('compliant');
  });
});

describe('numericStateToComplianceStatus', () => {
  it('maps compliant → compliant', () => {
    expect(numericStateToComplianceStatus('compliant')).toBe('compliant');
  });
  it('maps warning → observation-only', () => {
    expect(numericStateToComplianceStatus('warning')).toBe('observation-only');
  });
  it('maps non-compliant → non-compliant', () => {
    expect(numericStateToComplianceStatus('non-compliant')).toBe('non-compliant');
  });
  it('maps not-measured → undefined', () => {
    expect(numericStateToComplianceStatus('not-measured')).toBeUndefined();
  });
});
