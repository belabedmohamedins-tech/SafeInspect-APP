// src/utils/groupViolations.ts
//
// Phase-2: Groups inspection items into first-time violations vs repeat
// violations, for use in the summary and decision screens.
//
// Usage:
//   const { firstTime, repeat } = groupViolationsByRepeat(inspection.items);
//
// Rules:
//   - Only 'non-compliant' items are included in either group.
//   - 'observation-only' and 'unable-to-verify' are excluded (Phase-4 statuses).
//   - An item goes into 'repeat' when isRepeatViolation === true.
//   - All other non-compliant items go into 'firstTime'.

import { InspectionItem } from '../types';

export interface ViolationGroups {
  /** Non-compliant items appearing for the first time (or no prior history). */
  firstTime: InspectionItem[];
  /** Non-compliant items that were also non-compliant in the prior inspection. */
  repeat: InspectionItem[];
}

/**
 * Splits non-compliant items into first-time vs repeat groups.
 *
 * @param items  The full InspectionItem array from a SavedInspection.
 * @returns      { firstTime, repeat } — both arrays may be empty.
 */
export function groupViolationsByRepeat(items: InspectionItem[]): ViolationGroups {
  const violations = items.filter(i => i.complianceStatus === 'non-compliant');

  return {
    firstTime: violations.filter(i => !i.isRepeatViolation),
    repeat:    violations.filter(i => i.isRepeatViolation === true),
  };
}

/**
 * Returns a human-readable Arabic summary string for the violation groups.
 * Useful for inspection summary headers.
 *
 * Example: "3 مخالفات: 2 لأول مرة، 1 متكرر"
 */
export function formatViolationGroupSummary(groups: ViolationGroups): string {
  const total = groups.firstTime.length + groups.repeat.length;
  if (total === 0) return 'لا توجد مخالفات';

  const parts: string[] = [];
  if (groups.firstTime.length > 0) {
    parts.push(`${groups.firstTime.length} لأول مرة`);
  }
  if (groups.repeat.length > 0) {
    parts.push(`${groups.repeat.length} متكرر${groups.repeat.length > 1 ? 'ة' : ''}`);
  }
  return `${total} مخالفات: ${parts.join('، ')}`;
}
