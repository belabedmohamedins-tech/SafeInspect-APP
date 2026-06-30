// src/__tests__/numericUtils.test.ts
import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
} from '../utils/numericUtils';
import { NumericFieldSpec } from '../types';

const spec: NumericFieldSpec = {
  min: 10,
  max: 20,
  warningMin: 8,
  warningMax: 22,
  unit: 'ppm',
};

describe('deriveNumericCompliance', () => {
  describe('not-measured cases', () => {
    it('returns not-measured for undefined', () => {
      expect(deriveNumericCompliance(undefined, spec)).toBe('not-measured');
    });
    it('returns not-measured for NaN', () => {
      expect(deriveNumericCompliance(NaN, spec)).toBe('not-measured');
    });
    it('returns not-measured for null (cast)', () => {
      expect(deriveNumericCompliance(null as unknown as undefined, spec)).toBe('not-measured');
    });
  });

  describe('compliant zone', () => {
    it('returns compliant for value at min boundary', () => {
      expect(deriveNumericCompliance(10, spec)).toBe('compliant');
    });
    it('returns compliant for value at max boundary', () => {
      expect(deriveNumericCompliance(20, spec)).toBe('compliant');
    });
    it('returns compliant for value inside range', () => {
      expect(deriveNumericCompliance(15, spec)).toBe('compliant');
    });
  });

  describe('warning zone', () => {
    it('returns warning for value below min but above warningMin', () => {
      expect(deriveNumericCompliance(9, spec)).toBe('warning');
    });
    it('returns warning for value above max but below warningMax', () => {
      expect(deriveNumericCompliance(21, spec)).toBe('warning');
    });
    it('returns warning at warningMin boundary', () => {
      expect(deriveNumericCompliance(8, spec)).toBe('warning');
    });
    it('returns warning at warningMax boundary', () => {
      expect(deriveNumericCompliance(22, spec)).toBe('warning');
    });
  });

  describe('non-compliant zone', () => {
    it('returns non-compliant for value below warningMin', () => {
      expect(deriveNumericCompliance(5, spec)).toBe('non-compliant');
    });
    it('returns non-compliant for value above warningMax', () => {
      expect(deriveNumericCompliance(30, spec)).toBe('non-compliant');
    });
  });

  describe('open-ended specs', () => {
    it('returns compliant when min is undefined and value is 0', () => {
      expect(deriveNumericCompliance(0, { max: 10 } as NumericFieldSpec)).toBe('compliant');
    });
    it('returns compliant when max is undefined', () => {
      expect(deriveNumericCompliance(9999, { min: 0 } as NumericFieldSpec)).toBe('compliant');
    });
    it('returns non-compliant when all warning bounds are undefined and value is out of min/max', () => {
      expect(deriveNumericCompliance(100, { min: 0, max: 50 } as NumericFieldSpec)).toBe('non-compliant');
    });
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
