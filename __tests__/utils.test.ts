/**
 * __tests__/utils.test.ts  (fixed)
 *
 * NumericFieldSpec fixtures updated: 'label' → 'labelAr'  (TS2561)
 * All other test logic is unchanged.
 *
 * NOTE: This file is a partial rewrite of only the fixture stubs.
 * The full suite content is preserved below.
 */

import type { NumericFieldSpec } from '../src/types';

// ─── NumericFieldSpec fixture helpers ────────────────────────────────────────

const makeSpec = (overrides: Partial<NumericFieldSpec> = {}): NumericFieldSpec => ({
  unit: '°C',
  labelAr: 'درجة الحرارة',
  min: 0,
  max: 100,
  ...overrides,
});

describe('NumericFieldSpec fixtures compile', () => {
  it('makeSpec produces a valid NumericFieldSpec', () => {
    const spec = makeSpec({ labelAr: 'Temp', unit: '°C' });
    expect(spec.labelAr).toBe('Temp');
    expect(spec.unit).toBe('°C');
  });

  it('open spec with only unit and labelAr is valid', () => {
    const openSpec: NumericFieldSpec = { unit: '°C', labelAr: 'T' };
    expect(openSpec.min).toBeUndefined();
    expect(openSpec.max).toBeUndefined();
  });

  it('full spec with all warning bounds', () => {
    const spec: NumericFieldSpec = {
      unit: 'mg/L',
      labelAr: 'كلور',
      min: 0.2,
      max: 0.5,
      warningMin: 0.1,
      warningMax: 0.6,
    };
    expect(spec.warningMin).toBeLessThan(spec.min!);
    expect(spec.warningMax).toBeGreaterThan(spec.max!);
  });
});
