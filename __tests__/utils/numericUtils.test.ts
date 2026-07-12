// __tests__/utils/numericUtils.test.ts
import { deriveNumericCompliance, numericStateToComplianceStatus } from '../../src/utils/numericUtils';
import { NumericFieldSpec } from '../../src/types';

const spec = (overrides: Partial<NumericFieldSpec> = {}): NumericFieldSpec => ({
  unit: 'mg/L',
  ...overrides,
});

describe('deriveNumericCompliance', () => {
  it('undefined → not-measured', () => {
    expect(deriveNumericCompliance(undefined, spec())).toBe('not-measured');
  });

  it('null → not-measured', () => {
    expect(deriveNumericCompliance(null as any, spec())).toBe('not-measured');
  });

  it('NaN → not-measured', () => {
    expect(deriveNumericCompliance(NaN, spec())).toBe('not-measured');
  });

  it('value in [min, max] → compliant', () => {
    expect(deriveNumericCompliance(5, spec({ min: 1, max: 10 }))).toBe('compliant');
  });

  it('value exactly at min → compliant', () => {
    expect(deriveNumericCompliance(1, spec({ min: 1, max: 10 }))).toBe('compliant');
  });

  it('value exactly at max → compliant', () => {
    expect(deriveNumericCompliance(10, spec({ min: 1, max: 10 }))).toBe('compliant');
  });

  it('no min/max defined → always compliant', () => {
    expect(deriveNumericCompliance(9999, spec())).toBe('compliant');
  });

  it('value below min, in warning zone → warning', () => {
    expect(deriveNumericCompliance(0, spec({ min: 1, max: 10, warningMin: -1, warningMax: 12 }))).toBe('warning');
  });

  it('value above max, in warning zone → warning', () => {
    expect(deriveNumericCompliance(11, spec({ min: 1, max: 10, warningMin: -1, warningMax: 12 }))).toBe('warning');
  });

  it('value outside all zones → non-compliant', () => {
    expect(deriveNumericCompliance(100, spec({ min: 1, max: 10, warningMin: 0, warningMax: 15 }))).toBe('non-compliant');
  });

  it('only max defined, value above max but in warning → warning', () => {
    expect(deriveNumericCompliance(12, spec({ max: 10, warningMax: 15 }))).toBe('warning');
  });

  it('only max defined, value way above warningMax → non-compliant', () => {
    expect(deriveNumericCompliance(99, spec({ max: 10, warningMax: 15 }))).toBe('non-compliant');
  });
});

describe('numericStateToComplianceStatus', () => {
  it('compliant → compliant', () => {
    expect(numericStateToComplianceStatus('compliant')).toBe('compliant');
  });

  it('warning → observation-only', () => {
    expect(numericStateToComplianceStatus('warning')).toBe('observation-only');
  });

  it('non-compliant → non-compliant', () => {
    expect(numericStateToComplianceStatus('non-compliant')).toBe('non-compliant');
  });

  it('not-measured → undefined', () => {
    expect(numericStateToComplianceStatus('not-measured')).toBeUndefined();
  });
});
