// __tests__/criteria/updCriteria.test.ts
import { updSpecificCriteria } from '../../src/criteria/updCriteria';
import { InspectionItem } from '../../src/types';

// ─── Constants derived from the source ───────────────────────────────────────
const UPD_PREFIX = 'UPD-';
const NEW_PREFIX = '03-';
const TOTAL_COUNT = 32; // 22 UPD-AX* + 10 03-*

const VALID_SEVERITIES: InspectionItem['severity'][] = ['high', 'medium', 'low'];
const VALID_CONTROL_TYPES: InspectionItem['controlType'][] = ['doc', 'visual', 'test', 'interview'];
const VALID_COMPLIANCE_STATUSES: InspectionItem['complianceStatus'][] = [
  'compliant',
  'non-compliant',
  'partial',
  'not-evaluated',
  'not-applicable',
];

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('updSpecificCriteria', () => {
  // ── 1. Export ──────────────────────────────────────────────────────────────
  describe('export', () => {
    it('is exported as a non-empty array', () => {
      expect(Array.isArray(updSpecificCriteria)).toBe(true);
      expect(updSpecificCriteria.length).toBeGreaterThan(0);
    });

    it(`contains exactly ${TOTAL_COUNT} items`, () => {
      expect(updSpecificCriteria).toHaveLength(TOTAL_COUNT);
    });
  });

  // ── 2. Schema ──────────────────────────────────────────────────────────────
  describe('schema — every item', () => {
    it('has all required string fields (id, axis, category, criteria, legalReference)', () => {
      updSpecificCriteria.forEach((item) => {
        expect(typeof item.id).toBe('string');
        expect(item.id.trim().length).toBeGreaterThan(0);

        expect(typeof item.axis).toBe('string');
        expect(item.axis.trim().length).toBeGreaterThan(0);

        expect(typeof item.category).toBe('string');
        expect(item.category.trim().length).toBeGreaterThan(0);

        expect(typeof item.criteria).toBe('string');
        expect(item.criteria.trim().length).toBeGreaterThan(0);

        expect(typeof item.legalReference).toBe('string');
        expect(item.legalReference.trim().length).toBeGreaterThan(0);
      });
    });

    it('has a valid severity', () => {
      updSpecificCriteria.forEach((item) => {
        expect(VALID_SEVERITIES).toContain(item.severity);
      });
    });

    it('has a valid controlType', () => {
      updSpecificCriteria.forEach((item) => {
        expect(VALID_CONTROL_TYPES).toContain(item.controlType);
      });
    });

    it('has a valid complianceStatus', () => {
      updSpecificCriteria.forEach((item) => {
        expect(VALID_COMPLIANCE_STATUSES).toContain(item.complianceStatus);
      });
    });

    it('defaults complianceStatus to "not-evaluated"', () => {
      updSpecificCriteria.forEach((item) => {
        expect(item.complianceStatus).toBe('not-evaluated');
      });
    });
  });

  // ── 3. ID uniqueness & prefixes ────────────────────────────────────────────
  describe('IDs', () => {
    it('are all unique', () => {
      const ids = updSpecificCriteria.map((item) => item.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('each starts with either "UPD-" or "03-"', () => {
      updSpecificCriteria.forEach((item) => {
        const valid = item.id.startsWith(UPD_PREFIX) || item.id.startsWith(NEW_PREFIX);
        expect(valid).toBe(true);
      });
    });

    it('contains 22 legacy UPD-AX* items', () => {
      const updItems = updSpecificCriteria.filter((item) => item.id.startsWith(UPD_PREFIX));
      expect(updItems).toHaveLength(22);
    });

    it('contains 10 new 03-* items', () => {
      const newItems = updSpecificCriteria.filter((item) => item.id.startsWith(NEW_PREFIX));
      expect(newItems).toHaveLength(10);
    });

    it('UPD IDs follow the pattern UPD-AXn-nn', () => {
      const updItems = updSpecificCriteria.filter((item) => item.id.startsWith(UPD_PREFIX));
      const pattern = /^UPD-AX\d+-\d+$/;
      updItems.forEach((item) => {
        expect(item.id).toMatch(pattern);
      });
    });

    it('new IDs follow the pattern 03-nn', () => {
      const newItems = updSpecificCriteria.filter((item) => item.id.startsWith(NEW_PREFIX));
      const pattern = /^03-\d+$/;
      newItems.forEach((item) => {
        expect(item.id).toMatch(pattern);
      });
    });
  });

  // ── 4. Axis coverage ──────────────────────────────────────────────────────
  describe('axis coverage', () => {
    const axes = () => new Set(updSpecificCriteria.map((i) => i.axis));

    it('covers at least 8 distinct axes across all items', () => {
      expect(axes().size).toBeGreaterThanOrEqual(8);
    });

    const EXPECTED_UPD_AXES = [
      'الهوية والتصنيف',
      'الموقع والعزل',
      'تهيئة الحظائر',
      'التهوية والإنارة',
      'المياه',
      'الأعلاف',
      'الروث والمخلفات',
      'صحة القطيع',
      'صحة وسلوك العمال',
      'مكافحة النواقل',
      'البعد البيئي',
    ];

    EXPECTED_UPD_AXES.forEach((axis) => {
      it(`includes UPD axis: "${axis}"`, () => {
        const found = updSpecificCriteria.some((i) => i.axis === axis && i.id.startsWith(UPD_PREFIX));
        expect(found).toBe(true);
      });
    });

    const EXPECTED_NEW_AXES = [
      'هوية المنشأة والوثائق',
      'الموقع والعزل',
      'تهيئة الحظائر',
      'التهوية والإنارة',
      'المياه والأعلاف',
      'الروث والمخلفات',
      'صحة القطيع',
      'صحة وسلوك العمال',
      'مكافحة النواقل',
    ];

    EXPECTED_NEW_AXES.forEach((axis) => {
      it(`includes new-group axis: "${axis}"`, () => {
        const found = updSpecificCriteria.some((i) => i.axis === axis && i.id.startsWith(NEW_PREFIX));
        expect(found).toBe(true);
      });
    });
  });

  // ── 5. Category values ────────────────────────────────────────────────────
  describe('categories', () => {
    const VALID_CATEGORIES = ['تنظيمية', 'بيئية', 'نظافة', 'صحية'];

    it('only uses allowed category values', () => {
      updSpecificCriteria.forEach((item) => {
        expect(VALID_CATEGORIES).toContain(item.category);
      });
    });

    it('contains items from all four category types', () => {
      const cats = new Set(updSpecificCriteria.map((i) => i.category));
      VALID_CATEGORIES.forEach((cat) => {
        expect(cats).toContain(cat);
      });
    });
  });

  // ── 6. Severity distribution ──────────────────────────────────────────────
  describe('severity distribution', () => {
    it('has at least one high severity item', () => {
      expect(updSpecificCriteria.some((i) => i.severity === 'high')).toBe(true);
    });

    it('has at least one medium severity item', () => {
      expect(updSpecificCriteria.some((i) => i.severity === 'medium')).toBe(true);
    });

    it('has at least one low severity item', () => {
      expect(updSpecificCriteria.some((i) => i.severity === 'low')).toBe(true);
    });

    it('majority of items are high severity', () => {
      const highCount = updSpecificCriteria.filter((i) => i.severity === 'high').length;
      expect(highCount).toBeGreaterThan(updSpecificCriteria.length / 2);
    });
  });

  // ── 7. ControlType distribution ──────────────────────────────────────────
  describe('controlType distribution', () => {
    it('uses visual controlType', () => {
      expect(updSpecificCriteria.some((i) => i.controlType === 'visual')).toBe(true);
    });

    it('uses doc controlType', () => {
      expect(updSpecificCriteria.some((i) => i.controlType === 'doc')).toBe(true);
    });

    it('uses test controlType', () => {
      expect(updSpecificCriteria.some((i) => i.controlType === 'test')).toBe(true);
    });
  });

  // ── 8. Spot-check specific items ─────────────────────────────────────────
  describe('spot-check: key items', () => {
    it('UPD-AX1-01: identity/classification axis, high severity, doc control', () => {
      const item = updSpecificCriteria.find((i) => i.id === 'UPD-AX1-01');
      expect(item).toBeDefined();
      expect(item!.axis).toBe('الهوية والتصنيف');
      expect(item!.severity).toBe('high');
      expect(item!.controlType).toBe('doc');
      expect(item!.category).toBe('تنظيمية');
    });

    it('UPD-AX3-04: lighting axis, low severity', () => {
      const item = updSpecificCriteria.find((i) => i.id === 'UPD-AX3-04');
      expect(item).toBeDefined();
      expect(item!.severity).toBe('low');
      expect(item!.controlType).toBe('visual');
    });

    it('UPD-AX4-01: water axis, test controlType', () => {
      const item = updSpecificCriteria.find((i) => i.id === 'UPD-AX4-01');
      expect(item).toBeDefined();
      expect(item!.controlType).toBe('test');
      expect(item!.axis).toBe('المياه');
    });

    it('UPD-AX6-01: herd health, doc control, صحية category', () => {
      const item = updSpecificCriteria.find((i) => i.id === 'UPD-AX6-01');
      expect(item).toBeDefined();
      expect(item!.category).toBe('صحية');
      expect(item!.controlType).toBe('doc');
    });

    it('UPD-AX8-02: vector control, doc control, high severity', () => {
      const item = updSpecificCriteria.find((i) => i.id === 'UPD-AX8-02');
      expect(item).toBeDefined();
      expect(item!.severity).toBe('high');
      expect(item!.controlType).toBe('doc');
    });

    it('03-01: new group, identity axis, high severity, doc control', () => {
      const item = updSpecificCriteria.find((i) => i.id === '03-01');
      expect(item).toBeDefined();
      expect(item!.axis).toBe('هوية المنشأة والوثائق');
      expect(item!.severity).toBe('high');
      expect(item!.controlType).toBe('doc');
      expect(item!.category).toBe('تنظيمية');
    });

    it('03-05: water axis, test controlType, high severity', () => {
      const item = updSpecificCriteria.find((i) => i.id === '03-05');
      expect(item).toBeDefined();
      expect(item!.controlType).toBe('test');
      expect(item!.severity).toBe('high');
    });

    it('03-09: worker hygiene, medium severity, visual control', () => {
      const item = updSpecificCriteria.find((i) => i.id === '03-09');
      expect(item).toBeDefined();
      expect(item!.severity).toBe('medium');
      expect(item!.controlType).toBe('visual');
    });

    it('03-10: vector control, doc control, high severity', () => {
      const item = updSpecificCriteria.find((i) => i.id === '03-10');
      expect(item).toBeDefined();
      expect(item!.severity).toBe('high');
      expect(item!.controlType).toBe('doc');
    });
  });

  // ── 9. Legal references ──────────────────────────────────────────────────
  describe('legalReference content', () => {
    it('every item references at least one Algerian legal instrument', () => {
      const algerianPatterns = [
        /مرسوم/,
        /قانون/,
        /معيار/,
        /مبدأ/,
        /إطار/,
        /HACCP/i,
        /GHP/i,
      ];
      updSpecificCriteria.forEach((item) => {
        const hasRef = algerianPatterns.some((pattern) => pattern.test(item.legalReference));
        expect(hasRef).toBe(true);
      });
    });

    it('UPD items reference Decree 06-198 for classification items', () => {
      const classificationItems = updSpecificCriteria.filter(
        (i) => i.id.startsWith(UPD_PREFIX) && i.axis === 'الهوية والتصنيف',
      );
      classificationItems.forEach((item) => {
        expect(item.legalReference).toMatch(/06-198/);
      });
    });

    it('environmental items reference Law 03-10', () => {
      const envItems = updSpecificCriteria.filter((i) => i.category === 'بيئية');
      const withLaw0310 = envItems.filter((i) => i.legalReference.includes('03-10'));
      expect(withLaw0310.length).toBeGreaterThan(0);
    });

    it('waste items reference Law 01-19', () => {
      const wasteItems = updSpecificCriteria.filter(
        (i) =>
          i.axis === 'الروث والمخلفات' ||
          (i.axis === 'الروث والمخلفات' && i.id.startsWith(NEW_PREFIX)),
      );
      wasteItems.forEach((item) => {
        expect(item.legalReference).toMatch(/01-19/);
      });
    });

    it('water items reference Decree 17-140', () => {
      const waterItems = updSpecificCriteria.filter(
        (i) => i.axis === 'المياه' || i.axis === 'المياه والأعلاف',
      );
      const withDecree = waterItems.filter((i) => i.legalReference.includes('17-140'));
      expect(withDecree.length).toBeGreaterThan(0);
    });
  });

  // ── 10. Immutability guard ────────────────────────────────────────────────
  describe('array integrity', () => {
    it('does not mutate between accesses', () => {
      const first = updSpecificCriteria[0];
      const again = updSpecificCriteria[0];
      expect(first).toBe(again);
    });

    it('items are plain objects (not class instances)', () => {
      updSpecificCriteria.forEach((item) => {
        expect(Object.getPrototypeOf(item)).toBe(Object.prototype);
      });
    });
  });
});
