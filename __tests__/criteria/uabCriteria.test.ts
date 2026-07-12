// __tests__/criteria/uabCriteria.test.ts
import { uabSpecificCriteria } from '../../src/criteria/uabCriteria';
import { InspectionItem } from '../../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const VALID_SEVERITIES: InspectionItem['severity'][] = ['high', 'medium', 'low'];
const VALID_CONTROL_TYPES: InspectionItem['controlType'][] = ['doc', 'visual', 'measurement', 'interview'];
const VALID_COMPLIANCE: InspectionItem['complianceStatus'][] = [
  'compliant', 'non-compliant', 'partial', 'not-evaluated', 'not-applicable',
];

// ---------------------------------------------------------------------------
// UAB Block IDs (axes AX1→AX8)
// ---------------------------------------------------------------------------
const UAB_BLOCK_IDS = [
  'UAB-AX1-01', 'UAB-AX1-02', 'UAB-AX1-03', 'UAB-AX1-04',
  'UAB-AX2-01', 'UAB-AX2-02',
  'UAB-AX3-01', 'UAB-AX3-02', 'UAB-AX3-03', 'UAB-AX3-04',
  'UAB-AX4-01', 'UAB-AX4-02', 'UAB-AX4-03', 'UAB-AX4-04',
  'UAB-AX5-01', 'UAB-AX5-02', 'UAB-AX5-03',
  'UAB-AX6-01', 'UAB-AX6-02', 'UAB-AX6-03',
  'UAB-AX7-01', 'UAB-AX7-02', 'UAB-AX7-03', 'UAB-AX7-04', 'UAB-AX7-05',
  'UAB-AX8-01', 'UAB-AX8-02',
];

// ---------------------------------------------------------------------------
// New-block IDs (01-01 → 01-12)
// ---------------------------------------------------------------------------
const NEW_BLOCK_IDS = [
  '01-01', '01-02', '01-03', '01-04', '01-05', '01-06',
  '01-07', '01-08', '01-09', '01-10', '01-11', '01-12',
];

const ALL_EXPECTED_IDS = [...UAB_BLOCK_IDS, ...NEW_BLOCK_IDS];

// ---------------------------------------------------------------------------
// Suite 1 – Array-level structural contract
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – array-level contract', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(uabSpecificCriteria)).toBe(true);
    expect(uabSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 43 items (27 UAB + 12 new + 4 extra UAB-AX7)', () => {
    expect(uabSpecificCriteria).toHaveLength(43);
  });

  it('contains all expected IDs (UAB block + new block)', () => {
    const ids = uabSpecificCriteria.map((i) => i.id);
    ALL_EXPECTED_IDS.forEach((expectedId) => {
      expect(ids).toContain(expectedId);
    });
  });

  it('has no duplicate IDs', () => {
    const ids = uabSpecificCriteria.map((i) => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// Suite 2 – Per-item field integrity
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – per-item field integrity', () => {
  uabSpecificCriteria.forEach((item) => {
    describe(`item [${item.id}]`, () => {
      it('has a non-empty string id', () => {
        expect(typeof item.id).toBe('string');
        expect(item.id.trim().length).toBeGreaterThan(0);
      });

      it('has a non-empty axis string', () => {
        expect(typeof item.axis).toBe('string');
        expect(item.axis.trim().length).toBeGreaterThan(0);
      });

      it('has a non-empty category string', () => {
        expect(typeof item.category).toBe('string');
        expect(item.category.trim().length).toBeGreaterThan(0);
      });

      it('has a non-empty criteria string', () => {
        expect(typeof item.criteria).toBe('string');
        expect(item.criteria.trim().length).toBeGreaterThan(0);
      });

      it('has a non-empty legalReference string', () => {
        expect(typeof item.legalReference).toBe('string');
        expect(item.legalReference.trim().length).toBeGreaterThan(0);
      });

      it('has a valid severity value', () => {
        expect(VALID_SEVERITIES).toContain(item.severity);
      });

      it('has a valid controlType value', () => {
        expect(VALID_CONTROL_TYPES).toContain(item.controlType);
      });

      it('has a valid complianceStatus value', () => {
        expect(VALID_COMPLIANCE).toContain(item.complianceStatus);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Suite 3 – UAB block axis coverage
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – UAB block axes', () => {
  const getById = (id: string) => uabSpecificCriteria.find((i) => i.id === id)!;

  // AX1 – التصنيف والترخيص البيئي
  describe('AX1 – environmental licensing', () => {
    it('UAB-AX1-01: facility classification, high severity, doc', () => {
      const item = getById('UAB-AX1-01');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
      expect(item.axis).toBe('التصنيف والترخيص البيئي');
      expect(item.category).toBe('تنظيمية');
    });

    it('UAB-AX1-02: exploitation licence, high severity, doc', () => {
      const item = getById('UAB-AX1-02');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
    });

    it('UAB-AX1-03: environmental impact study, high severity, doc', () => {
      const item = getById('UAB-AX1-03');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
    });

    it('UAB-AX1-04: industrial hazard study, high severity, doc', () => {
      const item = getById('UAB-AX1-04');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
    });
  });

  // AX2 – الموقع والتهيئة والتعمير
  describe('AX2 – location & urbanism', () => {
    it('UAB-AX2-01: industrial zone location, high severity, visual', () => {
      const item = getById('UAB-AX2-01');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
      expect(item.category).toBe('بيئية');
    });

    it('UAB-AX2-02: building permit & conformity, medium severity, doc', () => {
      const item = getById('UAB-AX2-02');
      expect(item.severity).toBe('medium');
      expect(item.controlType).toBe('doc');
    });
  });

  // AX3 – المياه المستعملة والتفريغ
  describe('AX3 – wastewater & discharge', () => {
    it('UAB-AX3-01: wastewater treatment system, high severity, visual', () => {
      const item = getById('UAB-AX3-01');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
    });

    it('UAB-AX3-02: discharge permit, high severity, doc', () => {
      const item = getById('UAB-AX3-02');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
    });

    it('UAB-AX3-03: periodic water analyses, high severity, doc', () => {
      const item = getById('UAB-AX3-03');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
      expect(item.legalReference).toContain('ONEDD');
    });

    it('UAB-AX3-04: septic tank ONA contract, medium severity, doc', () => {
      const item = getById('UAB-AX3-04');
      expect(item.severity).toBe('medium');
      expect(item.controlType).toBe('doc');
      expect(item.legalReference).toContain('ONA');
    });
  });

  // AX4 – النفايات الصلبة والخطرة
  describe('AX4 – solid & hazardous waste', () => {
    it('UAB-AX4-01: waste inventory & classification, high severity, doc', () => {
      const item = getById('UAB-AX4-01');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
      expect(item.category).toBe('بيئية');
    });

    it('UAB-AX4-02: waste sorting at source, high severity, visual', () => {
      const item = getById('UAB-AX4-02');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
    });

    it('UAB-AX4-03: hazardous waste storage containers, high severity, visual', () => {
      const item = getById('UAB-AX4-03');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
    });

    it('UAB-AX4-04: certified waste contractors, high severity, doc', () => {
      const item = getById('UAB-AX4-04');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
    });
  });

  // AX5 – الانبعاثات الهوائية
  describe('AX5 – air emissions', () => {
    it('UAB-AX5-01: dust control equipment, high severity, visual', () => {
      const item = getById('UAB-AX5-01');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
    });

    it('UAB-AX5-02: periodic emission measurements, high severity, doc', () => {
      const item = getById('UAB-AX5-02');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
    });

    it('UAB-AX5-03: odour & neighbour protection, medium severity, visual', () => {
      const item = getById('UAB-AX5-03');
      expect(item.severity).toBe('medium');
      expect(item.controlType).toBe('visual');
    });
  });

  // AX6 – نظام التسيير البيئي والمتابعة
  describe('AX6 – environmental management system', () => {
    it('UAB-AX6-01: internal environmental management plan, medium severity, doc', () => {
      const item = getById('UAB-AX6-01');
      expect(item.severity).toBe('medium');
      expect(item.controlType).toBe('doc');
    });

    it('UAB-AX6-02: environmental audit by certified bureau, high severity, doc', () => {
      const item = getById('UAB-AX6-02');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
      expect(item.legalReference).toContain('23-324');
    });

    it('UAB-AX6-03: documented monitoring results, medium severity, doc', () => {
      const item = getById('UAB-AX6-03');
      expect(item.severity).toBe('medium');
      expect(item.controlType).toBe('doc');
    });
  });

  // AX7 – الصحة والسلامة المهنية + السلامة من الحريق
  describe('AX7 – occupational health & fire safety', () => {
    it('UAB-AX7-01: PPE availability and use, high severity, visual', () => {
      const item = getById('UAB-AX7-01');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
      expect(item.category).toBe('صحية');
    });

    it('UAB-AX7-02: periodic medical monitoring, medium severity, doc', () => {
      const item = getById('UAB-AX7-02');
      expect(item.severity).toBe('medium');
      expect(item.controlType).toBe('doc');
    });

    it('UAB-AX7-03: fire evacuation plan, high severity, visual', () => {
      const item = getById('UAB-AX7-03');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
      expect(item.category).toBe('سلامة');
      expect(item.legalReference).toContain('19-02');
    });

    it('UAB-AX7-04: fire extinguishers & periodic checks, high severity, visual', () => {
      const item = getById('UAB-AX7-04');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
    });

    it('UAB-AX7-05: evacuation routes clear & marked, high severity, visual', () => {
      const item = getById('UAB-AX7-05');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('visual');
      expect(item.legalReference).toContain('19-02');
    });
  });

  // AX8 – الإجراءات والعقوبات
  describe('AX8 – procedures & sanctions', () => {
    it('UAB-AX8-01: prior notice compliance check, high severity, doc', () => {
      const item = getById('UAB-AX8-01');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
      expect(item.legalReference).toContain('06-198');
    });

    it('UAB-AX8-02: no operation without licence or despite closure, high severity, doc', () => {
      const item = getById('UAB-AX8-02');
      expect(item.severity).toBe('high');
      expect(item.controlType).toBe('doc');
      expect(item.legalReference).toContain('03-10');
    });
  });
});

// ---------------------------------------------------------------------------
// Suite 4 – New block (01-01 → 01-12) spot checks
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – new merged block (01-xx)', () => {
  const getById = (id: string) => uabSpecificCriteria.find((i) => i.id === id)!;

  it('01-01: exploitation licence, high severity, doc', () => {
    const item = getById('01-01');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('doc');
    expect(item.legalReference).toContain('06-198');
  });

  it('01-02: environmental impact study, high severity, doc', () => {
    const item = getById('01-02');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('doc');
    expect(item.legalReference).toContain('03-10');
  });

  it('01-03: industrial zone location, high severity, visual', () => {
    const item = getById('01-03');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('visual');
    expect(item.category).toBe('بيئية');
  });

  it('01-04: wastewater treatment system, high severity, visual', () => {
    const item = getById('01-04');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('visual');
    expect(item.legalReference).toContain('06-141');
  });

  it('01-05: discharge permit, high severity, doc', () => {
    const item = getById('01-05');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('doc');
  });

  it('01-06: waste inventory & sorting, high severity, doc', () => {
    const item = getById('01-06');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('doc');
    expect(item.legalReference).toContain('01-19');
  });

  it('01-07: hazardous waste storage, high severity, visual', () => {
    const item = getById('01-07');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('visual');
    expect(item.legalReference).toContain('05-315');
  });

  it('01-08: dust control equipment, high severity, visual', () => {
    const item = getById('01-08');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('visual');
    expect(item.legalReference).toContain('06-138');
  });

  it('01-09: periodic emission measurements, high severity, doc', () => {
    const item = getById('01-09');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('doc');
    expect(item.legalReference).toContain('06-02');
  });

  it('01-10: internal environmental management programme, medium severity, doc', () => {
    const item = getById('01-10');
    expect(item.severity).toBe('medium');
    expect(item.controlType).toBe('doc');
  });

  it('01-11: PPE for dust/chemical workers, high severity, visual', () => {
    const item = getById('01-11');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('visual');
    expect(item.category).toBe('سلامة');
    expect(item.legalReference).toContain('18-11');
  });

  it('01-12: fire equipment & periodic maintenance, high severity, visual', () => {
    const item = getById('01-12');
    expect(item.severity).toBe('high');
    expect(item.controlType).toBe('visual');
    expect(item.legalReference).toContain('19-02');
  });
});

// ---------------------------------------------------------------------------
// Suite 5 – Severity distribution
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – severity distribution', () => {
  it('has at least 30 high-severity items', () => {
    const highCount = uabSpecificCriteria.filter((i) => i.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(30);
  });

  it('has at least 5 medium-severity items', () => {
    const medCount = uabSpecificCriteria.filter((i) => i.severity === 'medium').length;
    expect(medCount).toBeGreaterThanOrEqual(5);
  });

  it('has no low-severity items (none declared in source)', () => {
    const lowCount = uabSpecificCriteria.filter((i) => i.severity === 'low').length;
    expect(lowCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Suite 6 – controlType distribution
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – controlType distribution', () => {
  it('contains both doc and visual control types', () => {
    const types = new Set(uabSpecificCriteria.map((i) => i.controlType));
    expect(types.has('doc')).toBe(true);
    expect(types.has('visual')).toBe(true);
  });

  it('has more doc items than visual items', () => {
    const docCount = uabSpecificCriteria.filter((i) => i.controlType === 'doc').length;
    const visualCount = uabSpecificCriteria.filter((i) => i.controlType === 'visual').length;
    expect(docCount).toBeGreaterThan(visualCount);
  });
});

// ---------------------------------------------------------------------------
// Suite 7 – complianceStatus default
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – complianceStatus defaults', () => {
  it('all items default to not-evaluated', () => {
    uabSpecificCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });
});

// ---------------------------------------------------------------------------
// Suite 8 – category values
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – category values', () => {
  const VALID_CATEGORIES = ['تنظيمية', 'بيئية', 'صحية', 'سلامة'];

  it('all items have a category from the expected set', () => {
    uabSpecificCriteria.forEach((item) => {
      expect(VALID_CATEGORIES).toContain(item.category);
    });
  });

  it('contains items from all four category types', () => {
    const cats = new Set(uabSpecificCriteria.map((i) => i.category));
    expect(cats.has('تنظيمية')).toBe(true);
    expect(cats.has('بيئية')).toBe(true);
    expect(cats.has('صحية')).toBe(true);
    expect(cats.has('سلامة')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Suite 9 – legalReference mentions key Algerian decrees
// ---------------------------------------------------------------------------
describe('uabSpecificCriteria – legal references cover key Algerian decrees', () => {
  const refs = uabSpecificCriteria.map((i) => i.legalReference).join(' ');

  it('mentions decree 06-198 (classified facilities)', () => {
    expect(refs).toContain('06-198');
  });

  it('mentions law 03-10 (environmental protection)', () => {
    expect(refs).toContain('03-10');
  });

  it('mentions law 01-19 (waste management)', () => {
    expect(refs).toContain('01-19');
  });

  it('mentions decree 06-141 (industrial liquid discharge limits)', () => {
    expect(refs).toContain('06-141');
  });

  it('mentions decree 06-138 (atmospheric emissions)', () => {
    expect(refs).toContain('06-138');
  });

  it('mentions law 19-02 (fire safety)', () => {
    expect(refs).toContain('19-02');
  });

  it('mentions law 18-11 (health)', () => {
    expect(refs).toContain('18-11');
  });

  it('mentions law 90-29 (urbanism)', () => {
    expect(refs).toContain('90-29');
  });
});
