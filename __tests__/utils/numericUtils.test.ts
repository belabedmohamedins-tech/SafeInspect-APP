// __tests__/utils/numericUtils.test.ts
import { deriveNumericCompliance, numericStateToComplianceStatus } from '../../src/utils/numericUtils';
import { NumericFieldSpec } from '../../src/types';

const spec = (overrides: Partial<NumericFieldSpec> = {}): NumericFieldSpec =>
  ({ min: 10, max: 50, warningMin: 5, warningMax: 60, ...overrides } as NumericFieldSpec);

describe('deriveNumericCompliance', () => {
  it('returns not-measured for undefined', () => {
    expect(deriveNumericCompliance(undefined, spec())).toBe('not-measured');
  });
  it('returns not-measured for null', () => {
    expect(deriveNumericCompliance(null as any, spec())).toBe('not-measured');
  });
  it('returns not-measured for NaN', () => {
    expect(deriveNumericCompliance(NaN, spec())).toBe('not-measured');
  });

  it('returns compliant when value is within [min, max]', () => {
    expect(deriveNumericCompliance(30, spec())).toBe('compliant');
  });
  it('returns compliant at exactly min boundary', () => {
    expect(deriveNumericCompliance(10, spec())).toBe('compliant');
  });
  it('returns compliant at exactly max boundary', () => {
    expect(deriveNumericCompliance(50, spec())).toBe('compliant');
  });

  it('returns warning when value is in warning zone but outside [min, max]', () => {
    expect(deriveNumericCompliance(7, spec())).toBe('warning');  // below min, above warningMin
  });
  it('returns warning when value is above max but within warningMax', () => {
    expect(deriveNumericCompliance(55, spec())).toBe('warning');
  });

  it('returns non-compliant when value is outside all zones', () => {
    expect(deriveNumericCompliance(1, spec())).toBe('non-compliant');   // below warningMin
    expect(deriveNumericCompliance(100, spec())).toBe('non-compliant'); // above warningMax
  });

  it('treats undefined min as no lower bound', () => {
    expect(deriveNumericCompliance(-999, spec({ min: undefined, warningMin: undefined }))).toBe('compliant');
  });
  it('treats undefined max as no upper bound', () => {
    expect(deriveNumericCompliance(9999, spec({ max: undefined, warningMax: undefined }))).toBe('compliant');
  });
});

describe('numericStateToComplianceStatus', () => {
  it('maps compliant -> compliant', () => {
    expect(numericStateToComplianceStatus('compliant')).toBe('compliant');
  });
  it('maps warning -> observation-only', () => {
    expect(numericStateToComplianceStatus('warning')).toBe('observation-only');
  });
  it('maps non-compliant -> non-compliant', () => {
    expect(numericStateToComplianceStatus('non-compliant')).toBe('non-compliant');
  });
  it('maps not-measured -> undefined', () => {
    expect(numericStateToComplianceStatus('not-measured')).toBeUndefined();
  });
});
