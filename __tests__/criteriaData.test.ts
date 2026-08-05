/**
 * __tests__/criteriaData.test.ts
 *
 * Smoke-tests for the legacy criteriaData module (src/criteriaData.ts).
 * Verifies that criteriaByActivity is exported and structurally sound.
 * getChecklistForActivity was removed from criteriaData — new code uses
 * the modular src/criteria/ files directly.
 */

import { criteriaByActivity } from '../src/criteriaData';
import type { InspectionItem } from '../src/types';

describe('criteriaByActivity', () => {
  it('is a non-empty object', () => {
    expect(typeof criteriaByActivity).toBe('object');
    expect(criteriaByActivity).not.toBeNull();
    const keys = Object.keys(criteriaByActivity);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('every activity key maps to a non-empty array', () => {
    for (const [activity, items] of Object.entries(criteriaByActivity)) {
      expect(Array.isArray(items)).toBe(true);
      expect((items as InspectionItem[]).length).toBeGreaterThan(0);
      // sanity label
      expect(activity.length).toBeGreaterThan(0);
    }
  });

  it('every item has required InspectionItem fields', () => {
    for (const items of Object.values(criteriaByActivity)) {
      for (const item of items as InspectionItem[]) {
        expect(typeof item.id).toBe('string');
        expect(item.id.trim().length).toBeGreaterThan(0);
        expect(typeof item.criteria).toBe('string');
        expect(item.criteria.trim().length).toBeGreaterThan(0);
        expect(typeof item.complianceStatus).toBe('string');
      }
    }
  });

  it('every item axis (when present) is a non-empty string', () => {
    for (const items of Object.values(criteriaByActivity)) {
      for (const item of items as InspectionItem[]) {
        if (item.axis !== undefined) {
          expect(item.axis.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
});
