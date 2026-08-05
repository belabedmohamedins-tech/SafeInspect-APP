// src/__tests__/numericUtils.test.ts
import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
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
  it('flags values below warningMin as out-of-range', () => {
    expect(deriveNumericCompliance(3, spec)).toBe('out-of-range');
  });
  it('flags values above warningMax as out-of-range', () => {
    expect(deriveNumericCompliance(40, spec)).toBe('out-of-range');
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
  it('maps out-of-range to non-compliant', () => {
    expect(numericStateToComplianceStatus('out-of-range')).toBe('non-compliant');
  });
  it('maps warning to observation', () => {
    expect(numericStateToComplianceStatus('warning')).toBe('observation');
  });
  it('maps compliant to compliant', () => {
    expect(numericStateToComplianceStatus('compliant')).toBe('compliant');
  });
});
