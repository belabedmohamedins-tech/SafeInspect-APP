/**
 * __tests__/facilitiesData.test.ts
 *
 * Covers:
 *  - facilities array is exported and non-empty
 *  - every Facility object has all required fields
 *  - all IDs are unique
 *  - ID prefix segmentation (lic-, unlic-, const-)
 *  - licensed facilities have a non-empty category
 *  - unlicensed/under-construction facilities are identifiable by licenseType
 *  - facilities with coordinates in notes parse as valid floats
 *  - no facility has a null/undefined required field
 */

import { facilities } from '../src/facilitiesData';

// ─── Basic export ─────────────────────────────────────────────────────────────

describe('facilities export', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(facilities)).toBe(true);
    expect(facilities.length).toBeGreaterThan(0);
  });

  it('contains more than 50 entries', () => {
    expect(facilities.length).toBeGreaterThanOrEqual(50);
  });
});

// ─── Required field shape ─────────────────────────────────────────────────────

describe('Facility shape', () => {
  const REQUIRED_FIELDS = [
    'id',
    'projectName',
    'ownerName',
    'activity',
    'address',
    'licenseType',
    'licenseDetails',
    'year',
    'category',
    'notes',
  ] as const;

  it('every facility has all required fields', () => {
    for (const facility of facilities) {
      for (const field of REQUIRED_FIELDS) {
        expect(facility).toHaveProperty(field);
        expect(facility[field]).not.toBeNull();
        expect(facility[field]).not.toBeUndefined();
      }
    }
  });

  it('all field values are strings', () => {
    for (const facility of facilities) {
      for (const field of REQUIRED_FIELDS) {
        expect(typeof facility[field]).toBe('string');
      }
    }
  });

  it('id and projectName are never empty strings', () => {
    for (const facility of facilities) {
      expect(facility.id.trim().length).toBeGreaterThan(0);
      expect(facility.projectName.trim().length).toBeGreaterThan(0);
    }
  });

  it('activity is never empty', () => {
    for (const facility of facilities) {
      expect(facility.activity.trim().length).toBeGreaterThan(0);
    }
  });
});

// ─── ID uniqueness ────────────────────────────────────────────────────────────

describe('ID uniqueness', () => {
  it('all facility IDs are unique', () => {
    const ids = facilities.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ─── ID prefix segmentation ───────────────────────────────────────────────────

describe('ID prefix segmentation', () => {
  it('every ID starts with lic-, unlic-, or const-', () => {
    const validPrefixes = ['lic-', 'unlic-', 'const-'];
    for (const facility of facilities) {
      const hasValidPrefix = validPrefixes.some((prefix) =>
        facility.id.startsWith(prefix),
      );
      expect(hasValidPrefix).toBe(true);
    }
  });

  it('contains at least one licensed facility (lic-)', () => {
    const licensed = facilities.filter((f) => f.id.startsWith('lic-'));
    expect(licensed.length).toBeGreaterThan(0);
  });

  it('contains at least one unlicensed facility (unlic-)', () => {
    const unlicensed = facilities.filter((f) => f.id.startsWith('unlic-'));
    expect(unlicensed.length).toBeGreaterThan(0);
  });

  it('contains at least one under-construction facility (const-)', () => {
    const underConstruction = facilities.filter((f) => f.id.startsWith('const-'));
    expect(underConstruction.length).toBeGreaterThan(0);
  });

  it('lic- IDs are sequential (lic-001, lic-002, ...)', () => {
    const licensed = facilities
      .filter((f) => f.id.startsWith('lic-'))
      .map((f) => parseInt(f.id.replace('lic-', ''), 10))
      .sort((a, b) => a - b);
    for (let i = 0; i < licensed.length; i++) {
      expect(licensed[i]).toBe(i + 1);
    }
  });
});

// ─── Licensed facilities ──────────────────────────────────────────────────────

describe('licensed facilities (lic-)', () => {
  const licensed = facilities.filter((f) => f.id.startsWith('lic-'));

  it('all have a non-empty category', () => {
    for (const f of licensed) {
      expect(f.category.trim().length).toBeGreaterThan(0);
    }
  });

  it('all have licenseType referencing "تصريح"', () => {
    for (const f of licensed) {
      expect(f.licenseType).toContain('تصريح');
    }
  });
});

// ─── Unlicensed facilities ────────────────────────────────────────────────────

describe('unlicensed facilities (unlic-)', () => {
  const unlicensed = facilities.filter((f) => f.id.startsWith('unlic-'));

  it('all have empty category', () => {
    for (const f of unlicensed) {
      expect(f.category).toBe('');
    }
  });

  it('licenseType is either "بدون ترخيص" or "في إطار التسوية"', () => {
    const validStatuses = ['بدون ترخيص', 'في إطار التسوية'];
    for (const f of unlicensed) {
      expect(validStatuses).toContain(f.licenseType);
    }
  });
});

// ─── Under-construction facilities ───────────────────────────────────────────

describe('under-construction facilities (const-)', () => {
  const underConstruction = facilities.filter((f) => f.id.startsWith('const-'));

  it('notes field contains "قيد الإنشاء"', () => {
    for (const f of underConstruction) {
      expect(f.notes).toContain('قيد الإنشاء');
    }
  });

  it('category references "الفئة الثالثة" (class 3 license)', () => {
    for (const f of underConstruction) {
      expect(f.category).toContain('الفئة الثالثة');
    }
  });
});

// ─── Coordinates in notes ──────────────────────────────────────────────────────

describe('coordinates in notes', () => {
  const COORD_PATTERN = /الإحداثيات:\s*(-?[\d.]+),\s*(-?[\d.]+)/;

  it('all facilities with coordinates in notes parse as valid floats', () => {
    const withCoords = facilities.filter((f) => COORD_PATTERN.test(f.notes));
    expect(withCoords.length).toBeGreaterThan(0);

    for (const f of withCoords) {
      const match = f.notes.match(COORD_PATTERN)!;
      const lng = parseFloat(match[1]);
      const lat = parseFloat(match[2]);
      expect(Number.isFinite(lng)).toBe(true);
      expect(Number.isFinite(lat)).toBe(true);
      // Rough bounding box for northwest Algeria (Tlemcen region)
      expect(lng).toBeGreaterThan(-2);
      expect(lng).toBeLessThan(0);
      expect(lat).toBeGreaterThan(34);
      expect(lat).toBeLessThan(37);
    }
  });
});

// ─── Specific known facilities ────────────────────────────────────────────────

describe('known facility lookup', () => {
  it('lic-001 is the Yahiaoui bakery', () => {
    const f = facilities.find((x) => x.id === 'lic-001')!;
    expect(f).toBeDefined();
    expect(f.activity).toBe('مخبزة صناعية');
    expect(f.ownerName).toContain('يحياوي');
  });

  it('lic-008 is the cold room facility', () => {
    const f = facilities.find((x) => x.id === 'lic-008')!;
    expect(f).toBeDefined();
    expect(f.activity).toBe('غرفة تبريد');
  });

  it('const-001 is the large poultry slaughterhouse under construction', () => {
    const f = facilities.find((x) => x.id === 'const-001')!;
    expect(f).toBeDefined();
    expect(f.activity).toContain('ذبح الدواجن');
    expect(f.notes).toContain('قيد الإنشاء');
  });

  it('can find all GPL installations', () => {
    const gpl = facilities.filter((f) => f.activity.includes('GPL'));
    expect(gpl.length).toBeGreaterThanOrEqual(1);
  });

  it('can find all paint shop facilities', () => {
    const paintShops = facilities.filter((f) =>
      f.activity.includes('طلاء السيارات'),
    );
    expect(paintShops.length).toBeGreaterThanOrEqual(3);
  });
});
