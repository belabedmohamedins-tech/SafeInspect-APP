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
  it('at min boundary → compliant', () => expect(deriveNumericCompliance(10, spec)).toBe('compliant'));
  it('at max boundary → compliant', () => expect(deriveNumericCompliance(30, spec)).toBe('compliant'));
  it('in warning zone below min → warning', () => expect(deriveNumericCompliance(7, spec)).toBe('warning'));
  it('in warning zone above max → warning', () => expect(deriveNumericCompliance(35, spec)).toBe('warning'));
  it('outside all zones below → non-compliant', () => expect(deriveNumericCompliance(1, spec)).toBe('non-compliant'));
  it('outside all zones above → non-compliant', () => expect(deriveNumericCompliance(99, spec)).toBe('non-compliant'));

  it('no min/max → always compliant for any value', () => {
    const open: NumericFieldSpec = { unit: 'ppm' } as NumericFieldSpec;
    expect(deriveNumericCompliance(999, open)).toBe('compliant');
  });

  // When warningMin/warningMax are undefined, the warning-zone check always passes
  // (aboveWarnMin=true, belowWarnMax=true) — so values outside [min,max] land in 'warning'
  it('no warningMin/warningMax: value outside [min,max] → warning (not non-compliant)', () => {
    const noWarn: NumericFieldSpec = { min: 10, max: 30, unit: 'ppm' } as NumericFieldSpec;
    expect(deriveNumericCompliance(5, noWarn)).toBe('warning');
  });
});

describe('numericStateToComplianceStatus', () => {
  it('compliant → compliant', () => expect(numericStateToComplianceStatus('compliant')).toBe('compliant'));
  it('warning → observation-only', () => expect(numericStateToComplianceStatus('warning')).toBe('observation-only'));
  it('non-compliant → non-compliant', () => expect(numericStateToComplianceStatus('non-compliant')).toBe('non-compliant'));
  it('not-measured → undefined', () => expect(numericStateToComplianceStatus('not-measured')).toBeUndefined());
});
