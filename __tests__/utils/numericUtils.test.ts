// __tests__/utils/numericUtils.test.ts
import {
  deriveNumericCompliance,
  numericStateToComplianceStatus,
  NumericComplianceState,
} from '../../src/utils/numericUtils';
import { NumericFieldSpec } from '../../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────
const spec = (min?: number, max?: number, warningMin?: number, warningMax?: number): NumericFieldSpec =>
  ({ min, max, warningMin, warningMax } as NumericFieldSpec);

// ── deriveNumericCompliance – not-measured ────────────────────────────────────
describe('deriveNumericCompliance – not-measured', () => {
  it('returns not-measured for undefined value', () => {
    expect(deriveNumericCompliance(undefined, spec(0, 100))).toBe('not-measured');
  });

  it('returns not-measured for null value', () => {
    expect(deriveNumericCompliance(null as any, spec(0, 100))).toBe('not-measured');
  });

  it('returns not-measured for NaN', () => {
    expect(deriveNumericCompliance(NaN, spec(0, 100))).toBe('not-measured');
  });
});

// ── deriveNumericCompliance – compliant ───────────────────────────────────────
describe('deriveNumericCompliance – compliant', () => {
  it('value within [min, max] → compliant', () => {
    expect(deriveNumericCompliance(50, spec(0, 100))).toBe('compliant');
  });

  it('value exactly at min → compliant', () => {
    expect(deriveNumericCompliance(0, spec(0, 100))).toBe('compliant');
  });

  it('value exactly at max → compliant', () => {
    expect(deriveNumericCompliance(100, spec(0, 100))).toBe('compliant');
  });

  it('no min/max constraints → always compliant', () => {
    expect(deriveNumericCompliance(999, spec())).toBe('compliant');
  });

  it('only max defined, value below max → compliant', () => {
    expect(deriveNumericCompliance(50, spec(undefined, 100))).toBe('compliant');
  });

  it('only min defined, value above min → compliant', () => {
    expect(deriveNumericCompliance(10, spec(5, undefined))).toBe('compliant');
  });
});

// ── deriveNumericCompliance – warning ─────────────────────────────────────────
describe('deriveNumericCompliance – warning zone', () => {
  it('value outside [min,max] but inside warning zone → warning', () => {
    expect(deriveNumericCompliance(7, spec(10, 90, 5, 95))).toBe('warning');
  });

  it('value at warningMin edge → warning', () => {
    expect(deriveNumericCompliance(5, spec(10, 90, 5, 95))).toBe('warning');
  });

  it('value at warningMax edge → warning', () => {
    expect(deriveNumericCompliance(95, spec(10, 90, 5, 95))).toBe('warning');
  });

  // Source behaviour: when warningMin/warningMax are undefined,
  // aboveWarnMin and belowWarnMax both evaluate to true (undefined → no bound),
  // so any out-of-range value without explicit warning bounds falls through to 'warning'.
  // This is the canonical source behaviour documented here as a contract test.
  it('no warning zone defined, value outside [min,max] → warning (source fallback)', () => {
    expect(deriveNumericCompliance(150, spec(0, 100))).toBe('warning');
    expect(deriveNumericCompliance(-1, spec(0, 100))).toBe('warning');
  });
});

// ── deriveNumericCompliance – non-compliant ───────────────────────────────────
describe('deriveNumericCompliance – non-compliant', () => {
  it('value outside both [min,max] and explicit warning zone → non-compliant', () => {
    expect(deriveNumericCompliance(200, spec(10, 90, 5, 95))).toBe('non-compliant');
  });

  it('value below warningMin → non-compliant', () => {
    expect(deriveNumericCompliance(1, spec(10, 90, 5, 95))).toBe('non-compliant');
  });

  it('value above warningMax → non-compliant', () => {
    expect(deriveNumericCompliance(100, spec(10, 90, 5, 95))).toBe('non-compliant');
  });

  it('value far outside all zones → non-compliant', () => {
    expect(deriveNumericCompliance(-100, spec(10, 90, 5, 95))).toBe('non-compliant');
    expect(deriveNumericCompliance(1000, spec(10, 90, 5, 95))).toBe('non-compliant');
  });
});

// ── numericStateToComplianceStatus ────────────────────────────────────────────
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

  it('not-measured → undefined (do not overwrite)', () => {
    expect(numericStateToComplianceStatus('not-measured')).toBeUndefined();
  });

  it('all states produce a defined output except not-measured', () => {
    const states: NumericComplianceState[] = ['compliant', 'warning', 'non-compliant', 'not-measured'];
    states.forEach(state => {
      const result = numericStateToComplianceStatus(state);
      if (state === 'not-measured') {
        expect(result).toBeUndefined();
      } else {
        expect(result).toBeDefined();
      }
    });
  });
});

// ── Round-trip: deriveNumericCompliance → numericStateToComplianceStatus ──────
describe('numericUtils – round-trip integration', () => {
  it('in-range value → compliant compliance status', () => {
    const state = deriveNumericCompliance(50, spec(0, 100));
    const status = numericStateToComplianceStatus(state);
    expect(status).toBe('compliant');
  });

  it('warning zone value → observation-only compliance status', () => {
    const state = deriveNumericCompliance(7, spec(10, 90, 5, 95));
    const status = numericStateToComplianceStatus(state);
    expect(status).toBe('observation-only');
  });

  it('out-of-explicit-zone value → non-compliant compliance status', () => {
    const state = deriveNumericCompliance(200, spec(10, 90, 5, 95));
    const status = numericStateToComplianceStatus(state);
    expect(status).toBe('non-compliant');
  });

  it('out-of-range no warning zone → observation-only (warning fallback)', () => {
    // No warning zone → source returns 'warning' → maps to 'observation-only'
    const state = deriveNumericCompliance(150, spec(0, 100));
    const status = numericStateToComplianceStatus(state);
    expect(status).toBe('observation-only');
  });

  it('undefined value → undefined compliance status', () => {
    const state = deriveNumericCompliance(undefined, spec(0, 100));
    const status = numericStateToComplianceStatus(state);
    expect(status).toBeUndefined();
  });
});
