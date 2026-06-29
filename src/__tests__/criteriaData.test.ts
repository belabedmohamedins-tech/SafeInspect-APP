// src/__tests__/criteriaData.test.ts
//
// Validates the structure and integrity of every checklist assembled in
// criteriaByActivity, with focused coverage on the 9 new activity types
// added in the latest batch.
//
// WHAT IS TESTED
// ──────────────
// 1. Each new activity key exists in criteriaByActivity.
// 2. Every checklist has at least one item.
// 3. No duplicate `id` values within a checklist.
// 4. Every item carries all required fields (non-empty strings).
// 5. `severity`       ∈ { 'high', 'medium', 'low' }
// 6. `controlType`    ∈ { 'doc', 'visual', 'interview', 'measurement' }
// 7. `complianceStatus` === 'not-evaluated'  (factory default).
// 8. Every checklist includes the baseGeneralCriteria items (id prefix BGN-).
// 9. Food-related checklists also include baseFoodCriteria items (id prefix BFD-).
//
// ARCHITECTURE NOTE
// ─────────────────
// criteriaData.ts is pure data — no side-effects, no async, no React.
// We import it directly without mocking anything.

import { criteriaByActivity } from '../criteriaData';
import { InspectionItem } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────

const VALID_SEVERITIES   = new Set(['high', 'medium', 'low']);
const VALID_CONTROL_TYPES = new Set(['doc', 'visual', 'interview', 'measurement']);

// Activity keys for the 9 new checklists
const NEW_ACTIVITY_KEYS = [
  'ورشة حدادة',
  'صناعة سياج',
  'ورشة نجارة',
  'ورشة ألمنيوم',
  'غسل وتشحيم السيارات',
  'تركيب GPL',
  'تركيب GPL/C',
  'صناعة الرخام',
  'ورشة طلاء السيارات',
  'مطبعة',
  'لوازم مدرسية ومكاتب',
  'وحدة تخزين الزيتون والخضر',
  'تعبئة مواد شبه صيدلانية',
];

// Food-related new activities that must include baseFoodCriteria
const FOOD_ACTIVITY_KEYS = [
  'وحدة تخزين الزيتون والخضر',
];

// ─── Shared helper ────────────────────────────────────────────────────────

function auditChecklist(key: string, items: InspectionItem[]) {
  describe(`criteriaByActivity['${key}']`, () => {
    it('exists in the map', () => {
      expect(criteriaByActivity[key]).toBeDefined();
    });

    it('has at least one item', () => {
      expect(items.length).toBeGreaterThan(0);
    });

    it('has no duplicate item IDs', () => {
      const ids = items.map(i => i.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('every item has all required fields as non-empty strings', () => {
      items.forEach(item => {
        expect(typeof item.id).toBe('string');
        expect(item.id.trim()).not.toBe('');

        expect(typeof item.axis).toBe('string');
        expect(item.axis.trim()).not.toBe('');

        expect(typeof item.criteria).toBe('string');
        expect(item.criteria.trim()).not.toBe('');

        expect(typeof item.legalReference).toBe('string');
        expect(item.legalReference.trim()).not.toBe('');

        expect(typeof item.category).toBe('string');
        expect(item.category.trim()).not.toBe('');
      });
    });

    it('every item has a valid severity', () => {
      items.forEach(item => {
        expect(VALID_SEVERITIES.has(item.severity as string)).toBe(true);
      });
    });

    it('every item has a valid controlType', () => {
      items.forEach(item => {
        expect(VALID_CONTROL_TYPES.has(item.controlType as string)).toBe(true);
      });
    });

    it('every item has complianceStatus === "not-evaluated"', () => {
      items.forEach(item => {
        expect(item.complianceStatus).toBe('not-evaluated');
      });
    });

    it('includes baseGeneralCriteria items (BGN- prefix)', () => {
      const hasBase = items.some(i => i.id.startsWith('BGN-'));
      expect(hasBase).toBe(true);
    });
  });
}

// ─── New activity checklists ──────────────────────────────────────────────

describe('criteriaData — new activity checklists', () => {
  NEW_ACTIVITY_KEYS.forEach(key => {
    const items = criteriaByActivity[key];
    if (items) {
      auditChecklist(key, items);
    } else {
      it(`'${key}' is registered in criteriaByActivity`, () => {
        expect(criteriaByActivity[key]).toBeDefined();
      });
    }
  });
});

// ─── Food checklist must include baseFoodCriteria ─────────────────────────

describe('criteriaData — food criteria inclusion', () => {
  FOOD_ACTIVITY_KEYS.forEach(key => {
    it(`'${key}' includes baseFoodCriteria items (BFD- prefix)`, () => {
      const items = criteriaByActivity[key];
      expect(items).toBeDefined();
      const hasFood = items!.some(i => i.id.startsWith('BFD-'));
      expect(hasFood).toBe(true);
    });
  });
});

// ─── Non-food new activities must NOT include baseFoodCriteria ────────────

describe('criteriaData — non-food activities exclude baseFoodCriteria', () => {
  const nonFoodKeys = [
    'ورشة حدادة',
    'ورشة نجارة',
    'غسل وتشحيم السيارات',
    'تركيب GPL/C',
    'صناعة الرخام',
    'ورشة طلاء السيارات',
    'مطبعة',
    'تعبئة مواد شبه صيدلانية',
  ];

  nonFoodKeys.forEach(key => {
    it(`'${key}' does NOT include baseFoodCriteria items (BFD- prefix)`, () => {
      const items = criteriaByActivity[key];
      expect(items).toBeDefined();
      const hasFood = items!.some(i => i.id.startsWith('BFD-'));
      expect(hasFood).toBe(false);
    });
  });
});

// ─── Alias keys resolve to the same checklist ─────────────────────────────

describe('criteriaData — alias keys resolve identically', () => {
  it('"ورشة حدادة" and "صناعة سياج" share the same checklist reference', () => {
    expect(criteriaByActivity['ورشة حدادة']).toBe(
      criteriaByActivity['صناعة سياج']
    );
  });

  it('"ورشة نجارة" and "ورشة ألمنيوم" share the same checklist reference', () => {
    expect(criteriaByActivity['ورشة نجارة']).toBe(
      criteriaByActivity['ورشة ألمنيوم']
    );
  });

  it('"تركيب GPL" and "تركيب GPL/C" share the same checklist reference', () => {
    expect(criteriaByActivity['تركيب GPL']).toBe(
      criteriaByActivity['تركيب GPL/C']
    );
  });

  it('"مطبعة" and "لوازم مدرسية ومكاتب" share the same checklist reference', () => {
    expect(criteriaByActivity['مطبعة']).toBe(
      criteriaByActivity['لوازم مدرسية ومكاتب']
    );
  });
});

// ─── Specific item counts per new criteria file ───────────────────────────

describe('criteriaData — specific item counts (new criteria files only)', () => {
  // These counts = items from the specific criteria file only (not base layers)
  // Verified against the actual files during the audit step.
  const specificCounts: Record<string, { prefix: string; expected: number }> = {
    'ورشة حدادة':                    { prefix: 'BLS-', expected: 9  },
    'ورشة نجارة':                    { prefix: 'CAR-', expected: 8  },
    'غسل وتشحيم السيارات':           { prefix: 'CWS-', expected: 10 },
    'تركيب GPL/C':                   { prefix: 'GPL-', expected: 10 },
    'صناعة الرخام':                  { prefix: 'MRB-', expected: 8  },
    'ورشة طلاء السيارات':            { prefix: 'PNT-', expected: 9  },
    'مطبعة':                         { prefix: 'PRT-', expected: 9  },
    'وحدة تخزين الزيتون والخضر':    { prefix: 'PRD-', expected: 10 },
    'تعبئة مواد شبه صيدلانية':       { prefix: 'SPH-', expected: 9  },
  };

  Object.entries(specificCounts).forEach(([key, { prefix, expected }]) => {
    it(`'${key}' contains ${expected} activity-specific items (${prefix} prefix)`, () => {
      const items = criteriaByActivity[key];
      expect(items).toBeDefined();
      const specific = items!.filter(i => i.id.startsWith(prefix));
      expect(specific).toHaveLength(expected);
    });
  });
});
