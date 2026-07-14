import { produceStorageCriteria } from '../criteria/produceStorageCriteria';
import { InspectionItem } from '../types';

// Phase 3 dedup: PRD-04-01/02 (pest control) moved to BGN-07-xx, PRD-05-02 (traceability) to BFD-08-01
// Current array has 7 items: PRD-01-01, PRD-02-01/02/03, PRD-03-01/02, PRD-05-01
describe('produceStorageCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(produceStorageCriteria)).toBe(true);
  });

  it('contains exactly 7 criteria (post Phase-3 dedup)', () => {
    expect(produceStorageCriteria).toHaveLength(7);
  });

  it('has no duplicate IDs', () => {
    const ids = produceStorageCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the PRD-XX-XX pattern', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^PRD-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high or medium severity', () => {
    const nonLow = produceStorageCriteria.filter(
      (c: InspectionItem) => c.severity === 'high' || c.severity === 'medium'
    ).length;
    // 7 items total, all are high or medium
    expect(nonLow).toBeGreaterThanOrEqual(6);
  });

  it('covers expected axes', () => {
    const axes = new Set(produceStorageCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('شروط التخزين');
    expect(axes).toContain('نظافة فضاءات التخزين');
    // مكافحة الآفات and التتبعية are now in BGN/BFD shared criteria (Phase 3 dedup)
  });

  it('temperature storage criterion PRD-02-01 is measurement controlType', () => {
    const item = produceStorageCriteria.find((c: InspectionItem) => c.id === 'PRD-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.severity).toBe('high');
  });

  it('waste removal criterion PRD-05-01 exists and is high severity', () => {
    const item = produceStorageCriteria.find((c: InspectionItem) => c.id === 'PRD-05-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
  });
});
