// src/__tests__/utils.test.ts
import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
} from '../utils/numericUtils';
import { NumericFieldSpec } from '../types';

const baseSpec: NumericFieldSpec = {
  min: 10,
  max: 30,
  warningMin: 5,
  warningMax: 35,
  unit: '°C',
  labelAr: 'درجة الحرارة',
};

describe('numeric utilities', () => {
  it('detects out-of-range values', () => {
    expect(deriveNumericCompliance(3, baseSpec)).toBe('out-of-range');
    expect(deriveNumericCompliance(40, baseSpec)).toBe('out-of-range');
  });
  it('detects compliant values', () => {
    expect(deriveNumericCompliance(20, baseSpec)).toBe('compliant');
  });
  it('maps warning state to observation status', () => {
    expect(numericStateToComplianceStatus('warning')).toBe('observation');
  });
});
