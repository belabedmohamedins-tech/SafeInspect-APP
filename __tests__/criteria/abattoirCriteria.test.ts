import { abattoirSpecificCriteria } from '../../src/criteria/abattoirCriteria';
import { InspectionItem } from '../../src/types';

describe('abattoirSpecificCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(abattoirSpecificCriteria)).toBe(true);
    expect(abattoirSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('all IDs are unique', () => {
    const ids = abattoirSpecificCriteria.map((c: InspectionItem) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow ABT- prefix', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^ABT-/);
    });
  });

  it('all items have required fields', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toBeTruthy();
      expect(c.axis).toBeTruthy();
      expect(c.criteria).toBeTruthy();
      expect(c.severity).toBeTruthy();
      expect(c.controlType).toBeTruthy();
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items have valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items default to not-evaluated', () => {
    abattoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  describe('ABT-AX2-01 — ante mortem', () => {
    const item = abattoirSpecificCriteria.find((c: InspectionItem) => c.id === 'ABT-AX2-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    // source uses صحية (with ة) — test matches source
    it('category is صحية', () => expect(item.category).toBe('صحية'));
  });

  describe('ABT-AX2-02 — post mortem', () => {
    const item = abattoirSpecificCriteria.find((c: InspectionItem) => c.id === 'ABT-AX2-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });
});
