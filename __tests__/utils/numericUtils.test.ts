// __tests__/utils/numericUtils.test.ts
//
// Full coverage for src/utils/numericUtils.ts
// Pure TS — no mocks needed.
// Covers every branch of deriveNumericCompliance and
// all 4 cases of numericStateToComplianceStatus.

import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
} from '../../src/utils/numericUtils';
import { NumericFieldSpec } from '../../src/types';

// ── deriveNumericCompliance ─────────────────────────────────────────────────

describe('deriveNumericCompliance', () => {

  // ── not-measured branch ───────────────────────────────────────────
  it('returns not-measured when value is undefined', () => {
    expect(deriveNumericCompliance(undefined, { unit: '°C', labelAr: '' })).toBe('not-measured');
  });

  it('returns not-measured when value is NaN', () => {
    expect(deriveNumericCompliance(NaN, { unit: '°C', labelAr: '' })).toBe('not-measured');
  });

  it('returns not-measured when value is null (cast)', () => {
    expect(deriveNumericCompliance(null as any, { unit: '°C', labelAr: '' })).toBe('not-measured');
  });

  // ── compliant branch ────────────────────────────────────────────────
  it('returns compliant when value is within [min, max]', () => {
    const spec: NumericFieldSpec = { unit: '°C', labelAr: '', min: 0, max: 10 };
    expect(deriveNumericCompliance(5, spec)).toBe('compliant');
  });

  it('returns compliant when value equals min boundary', () => {
    const spec: NumericFieldSpec = { unit: '°C', labelAr: '', min: 0, max: 10 };
    expect(deriveNumericCompliance(0, spec)).toBe('compliant');
  });

  it('returns compliant when value equals max boundary', () => {
    const spec: NumericFieldSpec = { unit: '°C', labelAr: '', min: 0, max: 10 };
    expect(deriveNumericCompliance(10, spec)).toBe('compliant');
  });

  it('returns compliant when min is undefined (no lower bound)', () => {
    const spec: NumericFieldSpec = { unit: '°C', labelAr: '', max: 10 };
    expect(deriveNumericCompliance(-999, spec)).toBe('compliant');
  });

  it('returns compliant when max is undefined (no upper bound)', () => {
    const spec: NumericFieldSpec = { unit: '°C', labelAr: '', min: 0 };
    expect(deriveNumericCompliance(999, spec)).toBe('compliant');
  });

  it('returns compliant when both min and max are undefined', () => {
    const spec: NumericFieldSpec = { unit: '°C', labelAr: '' };
    expect(deriveNumericCompliance(42, spec)).toBe('compliant');
  });

  // ── warning branch ──────────────────────────────────────────────────
  it('returns warning when value is outside [min,max] but inside warning zone', () => {
    // compliant: 0–10, warning zone: -5 to 15
    const spec: NumericFieldSpec = {
      unit: '°C', labelAr: '',
      min: 0, max: 10,
      warningMin: -5, warningMax: 15,
    };
    expect(deriveNumericCompliance(12, spec)).toBe('warning'); // above max, within warningMax
    expect(deriveNumericCompliance(-3, spec)).toBe('warning'); // below min, within warningMin
  });

  it('returns warning when warningMin is undefined (value below min still in warning zone)', () => {
    const spec: NumericFieldSpec = {
      unit: '°C', labelAr: '',
      min: 5, max: 10,
      warningMax: 20,
    };
    expect(deriveNumericCompliance(15, spec)).toBe('warning');
  });

  it('returns warning when warningMax is undefined (value above max still in warning zone)', () => {
    const spec: NumericFieldSpec = {
      unit: '°C', labelAr: '',
      min: 5, max: 10,
      warningMin: 0,
    };
    expect(deriveNumericCompliance(2, spec)).toBe('warning');
  });

  // ── non-compliant branch ────────────────────────────────────────────
  it('returns non-compliant when value exceeds warningMax', () => {
    const spec: NumericFieldSpec = {
      unit: '°C', labelAr: '',
      min: 0, max: 10,
      warningMin: -5, warningMax: 15,
    };
    expect(deriveNumericCompliance(20, spec)).toBe('non-compliant');
  });

  it('returns non-compliant when value is below warningMin', () => {
    const spec: NumericFieldSpec = {
      unit: '°C', labelAr: '',
      min: 0, max: 10,
      warningMin: -5, warningMax: 15,
    };
    expect(deriveNumericCompliance(-10, spec)).toBe('non-compliant');
  });

  it('returns non-compliant when value is outside [min,max] and no warning zone defined', () => {
    const spec: NumericFieldSpec = { unit: '°C', labelAr: '', min: 0, max: 10 };
    expect(deriveNumericCompliance(50, spec)).toBe('non-compliant');
    expect(deriveNumericCompliance(-1, spec)).toBe('non-compliant');
  });

  // ── real-world scenario: fridge temperature ────────────────────────────
  it('handles real fridge scenario: compliant 0–4°C, warning 4–8°C, non-compliant >8°C', () => {
    const spec: NumericFieldSpec = {
      unit: '°C', labelAr: 'درجة حرارة التبريد',
      min: 0, max: 4,
      warningMin: 0, warningMax: 8,
    };
    expect(deriveNumericCompliance(2, spec)).toBe('compliant');
    expect(deriveNumericCompliance(6, spec)).toBe('warning');
    expect(deriveNumericCompliance(12, spec)).toBe('non-compliant');
    expect(deriveNumericCompliance(undefined, spec)).toBe('not-measured');
  });
});

// ── numericStateToComplianceStatus ──────────────────────────────────────────

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

  it('maps not-measured → undefined (do not overwrite item status)', () => {
    expect(numericStateToComplianceStatus('not-measured')).toBeUndefined();
  });
});
