// src/__tests__/numericUtils.test.ts
import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
  NumericComplianceState,
} from '../utils/numericUtils';
import { NumericFieldSpec } from '../types';

const spec: NumericFieldSpec = {
  min: 10,
  max: 30,
  warningMin: 5,
  warningMax: 35,
  unit: '°C',
  labelAr: 'درجة الحرارة',
};

describe('deriveNumericCompliance', () => {
  it('flags values below warningMin as non-compliant', () => {
    expect(deriveNumericCompliance(3, spec)).toBe('non-compliant');
  });
  it('flags values above warningMax as non-compliant', () => {
    expect(deriveNumericCompliance(40, spec)).toBe('non-compliant');
  });
  it('flags values in warning band (below min) as warning', () => {
    expect(deriveNumericCompliance(7, spec)).toBe('warning');
  });
  it('flags values in warning band (above max) as warning', () => {
    expect(deriveNumericCompliance(32, spec)).toBe('warning');
  });
  it('flags values within [min, max] as compliant', () => {
    expect(deriveNumericCompliance(20, spec)).toBe('compliant');
  });
});

describe('numericStateToComplianceStatus', () => {
  it('maps non-compliant to non-compliant', () => {
    const state: NumericComplianceState = 'non-compliant';
    expect(numericStateToComplianceStatus(state)).toBe('non-compliant');
  });
  it('maps warning to observation-only', () => {
    const state: NumericComplianceState = 'warning';
    expect(numericStateToComplianceStatus(state)).toBe('observation-only');
  });
  it('maps compliant to compliant', () => {
    const state: NumericComplianceState = 'compliant';
    expect(numericStateToComplianceStatus(state)).toBe('compliant');
  });
  it('maps not-measured to undefined', () => {
    const state: NumericComplianceState = 'not-measured';
    expect(numericStateToComplianceStatus(state)).toBeUndefined();
  });
});
