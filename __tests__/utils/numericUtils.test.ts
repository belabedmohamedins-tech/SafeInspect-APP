// __tests__/utils/numericUtils.test.ts
import { deriveNumericCompliance, numericStateToComplianceStatus } from '../../src/utils/numericUtils';
import { NumericFieldSpec } from '../../src/types';

const spec: NumericFieldSpec = {
  min: 10, max: 30,
  warningMin: 5, warningMax: 40,
  unit: 'ppm',
} as NumericFieldSpec;

describe('deriveNumericCompliance', () => {
  it('undefined → not-measured', () => expect(deriveNumericCompliance(undefined, spec)).toBe('not-measured'));
  it('null → not-measured', () => expect(deriveNumericCompliance(null as any, spec)).toBe('not-measured'));
  it('NaN → not-measured', () => expect(deriveNumericCompliance(NaN, spec)).toBe('not-measured'));
  it('within [min,max] → compliant', () => expect(deriveNumericCompliance(20, spec)).toBe('compliant'));
  it('at min → compliant', () => expect(deriveNumericCompliance(10, spec)).toBe('compliant'));
  it('at max → compliant', () => expect(deriveNumericCompliance(30, spec)).toBe('compliant'));
  it('in warning zone below min → warning', () => expect(deriveNumericCompliance(7, spec)).toBe('warning'));
  it('in warning zone above max → warning', () => expect(deriveNumericCompliance(35, spec)).toBe('warning'));
  it('outside all zones below → non-compliant', () => expect(deriveNumericCompliance(1, spec)).toBe('non-compliant'));
  it('outside all zones above → non-compliant', () => expect(deriveNumericCompliance(99, spec)).toBe('non-compliant'));

  it('no min/max bounds → always compliant when in range', () => {
    const open: NumericFieldSpec = { unit: 'ppm' } as NumericFieldSpec;
    expect(deriveNumericCompliance(999, open)).toBe('compliant');
  });

  it('no warningMin/warningMax → goes straight to non-compliant', () => {
    const noWarn: NumericFieldSpec = { min: 10, max: 30, unit: 'ppm' } as NumericFieldSpec;
    expect(deriveNumericCompliance(5, noWarn)).toBe('non-compliant');
  });
});

describe('numericStateToComplianceStatus', () => {
  it('compliant → compliant', () => expect(numericStateToComplianceStatus('compliant')).toBe('compliant'));
  it('warning → observation-only', () => expect(numericStateToComplianceStatus('warning')).toBe('observation-only'));
  it('non-compliant → non-compliant', () => expect(numericStateToComplianceStatus('non-compliant')).toBe('non-compliant'));
  it('not-measured → undefined', () => expect(numericStateToComplianceStatus('not-measured')).toBeUndefined());
});
