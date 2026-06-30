// src/utils/numericUtils.ts
//
// Phase 7 — shared numeric compliance derivation.
// Re-exports the pure function from NumericInputField so both
// useChecklistData (hook) and InspectionItem (component) can import from
// a single non-circular location.
//
// The canonical logic lives here; NumericInputField now imports from here too.

import { NumericFieldSpec, ComplianceStatus } from '../types';

/**
 * Maps a raw numeric measurement to a NumericComplianceState for the
 * live badge in NumericInputField.
 */
export type NumericComplianceState =
  | 'compliant'
  | 'warning'
  | 'non-compliant'
  | 'not-measured';

/**
 * Pure derivation — no side-effects, no state.
 *
 * Rules (mirrors the spec in types.ts):
 *   value in [min, max]                          → 'compliant'
 *   value outside [min, max] but in warning zone  → 'warning'
 *   value outside all zones                       → 'non-compliant'
 *   value undefined / NaN                         → 'not-measured'
 */
export function deriveNumericCompliance(
  value: number | undefined,
  spec: NumericFieldSpec,
): NumericComplianceState {
  if (value === undefined || value === null || isNaN(value)) return 'not-measured';

  const { min, max, warningMin, warningMax } = spec;

  const aboveMin = min === undefined || value >= min;
  const belowMax = max === undefined || value <= max;
  if (aboveMin && belowMax) return 'compliant';

  const aboveWarnMin = warningMin === undefined || value >= warningMin;
  const belowWarnMax = warningMax === undefined || value <= warningMax;
  if (aboveWarnMin && belowWarnMax) return 'warning';

  return 'non-compliant';
}

/**
 * Converts the NumericComplianceState to the ComplianceStatus used on
 * InspectionItem, so the numeric reading drives the item's official status.
 *
 * Mapping:
 *   'compliant'     → 'compliant'
 *   'warning'       → 'observation-only'  (flags the inspector without penalising)
 *   'non-compliant' → 'non-compliant'
 *   'not-measured'  → undefined            (do not overwrite — leave as-is)
 */
export function numericStateToComplianceStatus(
  state: NumericComplianceState,
): ComplianceStatus | undefined {
  switch (state) {
    case 'compliant':     return 'compliant';
    case 'warning':       return 'observation-only';
    case 'non-compliant': return 'non-compliant';
    case 'not-measured':  return undefined;
  }
}
