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
  it('detects non-compliant values (outside warning zone)', () => {
    expect(deriveNumericCompliance(3, baseSpec)).toBe('non-compliant');
    expect(deriveNumericCompliance(40, baseSpec)).toBe('non-compliant');
  });
  it('detects compliant values', () => {
    expect(deriveNumericCompliance(20, baseSpec)).toBe('compliant');
  });
  it('maps warning state to observation-only status', () => {
    expect(numericStateToComplianceStatus('warning')).toBe('observation-only');
  });
});
