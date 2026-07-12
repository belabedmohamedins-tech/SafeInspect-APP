import { marbleCriteria } from '../criteria/marbleCriteria';
import { InspectionItem } from '../types';

describe('marbleCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(marbleCriteria)).toBe(true);
  });

  it('contains exactly 8 criteria', () => {
    expect(marbleCriteria).toHaveLength(8);
  });

  it('has no duplicate IDs', () => {
    const ids = marbleCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the MRB-XX-XX pattern', () => {
    marbleCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^MRB-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    marbleCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    marbleCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    marbleCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    marbleCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    marbleCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('has exactly one medium-severity item (stone waste)', () => {
    const mediumItems = marbleCriteria.filter((c: InspectionItem) => c.severity === 'medium');
    expect(mediumItems).toHaveLength(1);
    expect(mediumItems[0].id).toBe('MRB-04-01');
  });

  it('covers expected axes', () => {
    const axes = new Set(marbleCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('المياه المستعملة والغبار');
    expect(axes).toContain('السلامة المهنية');
  });

  it('silica dust (PPE) criterion exists (MRB-05-01)', () => {
    const ppeItem = marbleCriteria.find((c: InspectionItem) => c.id === 'MRB-05-01');
    expect(ppeItem).toBeDefined();
    expect(ppeItem!.severity).toBe('high');
  });

  it('marble slurry discharge ban exists (MRB-03-02)', () => {
    const slurryItem = marbleCriteria.find((c: InspectionItem) => c.id === 'MRB-03-02');
    expect(slurryItem).toBeDefined();
    expect(slurryItem!.severity).toBe('high');
  });
});
