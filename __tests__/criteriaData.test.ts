/**
 * __tests__/criteriaData.test.ts
 *
 * Covers:
 *  - criteriaByActivity: all keys resolve to InspectionItem[]
 *  - getChecklistForActivity: null/undefined branch (DEV warn)
 *  - getChecklistForActivity: unknown activity branch (warn + fallback)
 *  - getChecklistForActivity: known activity branch (returns correct list)
 *  - Composition integrity: food checklists contain baseGeneralCriteria items
 *  - Composition integrity: non-food checklists do NOT contain baseFoodCriteria items
 */

import { criteriaByActivity, getChecklistForActivity } from '../src/criteriaData';
import { baseGeneralCriteria } from '../src/criteria/baseGeneralCriteria';
import { baseFoodCriteria } from '../src/criteria/baseFoodCriteria';
import { uabSpecificCriteria } from '../src/criteria/uabCriteria';
import { mechanicWorkshopCriteria } from '../src/criteria/mechanicCriteria';

// ─── Silence expected console.warn calls ─────────────────────────────────────
const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

beforeEach(() => {
  warnSpy.mockClear();
});

afterAll(() => {
  warnSpy.mockRestore();
});

// ─── criteriaByActivity ───────────────────────────────────────────────────────

describe('criteriaByActivity', () => {
  it('has a "default" key that maps to baseGeneralCriteria', () => {
    expect(criteriaByActivity['default']).toBe(baseGeneralCriteria);
  });

  it('every value is a non-empty InspectionItem[]', () => {
    for (const [key, checklist] of Object.entries(criteriaByActivity)) {
      expect(Array.isArray(checklist)).toBe(true);
      expect(checklist.length).toBeGreaterThan(0);
      // Each item must have at minimum an id and category
      checklist.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('category');
      });
      // suppress TS unused-var warning
      void key;
    }
  });

  it('covers all expected Arabic activity keys', () => {
    const expectedKeys = [
      'الديوان الوطني لأغذية الأنعام',
      'وحدة مذابح الغرب',
      'وحدة تفريخ الدواجن',
      'وحدة تربية الدواجن',
      'مذبحة دواجن <500 كغ/يوم',
      'مخبزة صناعية',
      'غرفة تبريد',
      'ميكانيك سيارات',
      'ورشة حدادة',
      'ورشة نجارة',
      'غسل وتشحيم السيارات',
      'تركيب GPL',
      'صناعة الرخام',
      'ورشة طلاء السيارات',
      'مطبعة',
      'وحدة تخزين الزيتون والخضر',
      'تعبئة مواد شبه صيدلانية',
    ];
    for (const key of expectedKeys) {
      expect(criteriaByActivity).toHaveProperty(key);
    }
  });

  it('UAB checklist contains baseGeneralCriteria + baseFoodCriteria + uabSpecific items', () => {
    const uabChecklist = criteriaByActivity['الديوان الوطني لأغذية الأنعام'];
    const baseGeneralIds = new Set(baseGeneralCriteria.map((i) => i.id));
    const baseFoodIds = new Set(baseFoodCriteria.map((i) => i.id));
    const uabSpecificIds = new Set(uabSpecificCriteria.map((i) => i.id));
    const checklistIds = new Set(uabChecklist.map((i) => i.id));

    // All base general items are present
    for (const id of baseGeneralIds) {
      expect(checklistIds.has(id)).toBe(true);
    }
    // All base food items are present
    for (const id of baseFoodIds) {
      expect(checklistIds.has(id)).toBe(true);
    }
    // All uab-specific items are present
    for (const id of uabSpecificIds) {
      expect(checklistIds.has(id)).toBe(true);
    }
  });

  it('mechanic checklist contains baseGeneral but NOT baseFoodCriteria items', () => {
    const mechanicChecklist = criteriaByActivity['ميكانيك سيارات'];
    const baseFoodIds = new Set(baseFoodCriteria.map((i) => i.id));
    const checklistIds = new Set(mechanicChecklist.map((i) => i.id));

    // No food criteria in mechanic checklist
    for (const id of baseFoodIds) {
      expect(checklistIds.has(id)).toBe(false);
    }
    // mechanic-specific items are present
    const mechanicIds = new Set(mechanicWorkshopCriteria.map((i) => i.id));
    for (const id of mechanicIds) {
      expect(checklistIds.has(id)).toBe(true);
    }
  });

  it('alias keys point to the same array reference as their canonical counterpart', () => {
    // GPL aliases
    expect(criteriaByActivity['تركيب GPL']).toBe(criteriaByActivity['تركيب GPL/C']);
    // upd aliases
    expect(criteriaByActivity['وحدة تربية الدواجن']).toBe(
      criteriaByActivity['تربية الدواجن (07 حظائر)'],
    );
    expect(criteriaByActivity['تربية الدواجن (07 حظائر)']).toBe(
      criteriaByActivity['تربية الدواجن (03 حظائر)'],
    );
    // blacksmith aliases
    expect(criteriaByActivity['ورشة حدادة']).toBe(criteriaByActivity['صناعة سياج']);
    // carpentery aliases
    expect(criteriaByActivity['ورشة نجارة']).toBe(criteriaByActivity['ورشة ألمنيوم']);
    // printing aliases
    expect(criteriaByActivity['مطبعة']).toBe(criteriaByActivity['لوازم مدرسية ومكاتب']);
  });
});

// ─── getChecklistForActivity ──────────────────────────────────────────────────

describe('getChecklistForActivity', () => {
  describe('null / undefined / empty input', () => {
    it('returns baseGeneralCriteria when called with null', () => {
      const result = getChecklistForActivity(null);
      expect(result).toBe(baseGeneralCriteria);
    });

    it('returns baseGeneralCriteria when called with undefined', () => {
      const result = getChecklistForActivity(undefined);
      expect(result).toBe(baseGeneralCriteria);
    });

    it('returns baseGeneralCriteria when called with empty string', () => {
      const result = getChecklistForActivity('');
      expect(result).toBe(baseGeneralCriteria);
    });

    it('logs a console.warn (DEV) for null/undefined/empty input', () => {
      // __DEV__ is true in Jest environment
      getChecklistForActivity(null);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('[criteriaData]');
    });
  });

  describe('unknown activity key', () => {
    it('returns baseGeneralCriteria for an unregistered activity', () => {
      const result = getChecklistForActivity('نشاط غير معروف - XYZ');
      expect(result).toBe(baseGeneralCriteria);
    });

    it('logs a console.warn with the unknown key name', () => {
      const unknownKey = 'نشاط_اختبار_مجهول';
      getChecklistForActivity(unknownKey);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain(unknownKey);
      expect(warnSpy.mock.calls[0][0]).toContain('[criteriaData]');
    });

    it('does not throw for any unknown key', () => {
      expect(() => getChecklistForActivity('completely-unknown')).not.toThrow();
    });
  });

  describe('known activity keys', () => {
    it('returns the UAB checklist for the UAB activity key', () => {
      const result = getChecklistForActivity('الديوان الوطني لأغذية الأنعام');
      expect(result).toBe(criteriaByActivity['الديوان الوطني لأغذية الأنعام']);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns the mechanic checklist for the mechanic activity key', () => {
      const result = getChecklistForActivity('ميكانيك سيارات');
      expect(result).toBe(criteriaByActivity['ميكانيك سيارات']);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns the GPL checklist for "تركيب GPL"', () => {
      const result = getChecklistForActivity('تركيب GPL');
      expect(result).toBe(criteriaByActivity['تركيب GPL']);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns the bakery checklist for "مخبزة صناعية"', () => {
      const result = getChecklistForActivity('مخبزة صناعية');
      expect(result).toBe(criteriaByActivity['مخبزة صناعية']);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns a non-empty array for every registered activity', () => {
      for (const key of Object.keys(criteriaByActivity)) {
        if (key === 'default') continue;
        const result = getChecklistForActivity(key);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      }
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('does not warn for the default key', () => {
      getChecklistForActivity('default');
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('result integrity', () => {
    it('returned items all have id, category, and text properties', () => {
      const result = getChecklistForActivity('وحدة مذابح الغرب');
      for (const item of result) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('text');
      }
    });

    it('no duplicate ids in any checklist', () => {
      for (const [key, checklist] of Object.entries(criteriaByActivity)) {
        const ids = checklist.map((i) => i.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
        void key;
      }
    });
  });
});
