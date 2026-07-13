import { abattoirSpecificCriteria } from '../../src/criteria/abattoirCriteria';
import { InspectionItem } from '../../src/types';

describe('abattoirSpecificCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(abattoirSpecificCriteria)).toBe(true);
    expect(abattoirSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('every item has required InspectionItem fields', () => {
    abattoirSpecificCriteria.forEach((item: InspectionItem) => {
      expect(typeof item.id).toBe('string');
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.axis).toBe('string');
      expect(typeof item.category).toBe('string');
      expect(typeof item.criteria).toBe('string');
      expect(typeof item.legalReference).toBe('string');
      expect(['high', 'medium', 'low']).toContain(item.severity);
      expect(['doc', 'visual', 'test', 'measurement']).toContain(item.controlType);
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all IDs are unique', () => {
    const ids = abattoirSpecificCriteria.map((i) => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  // --- ABT series ---
  describe('ABT-AX1-01 — رخصة الاستغلال', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX1-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
    it('axis matches', () => expect(item.axis).toBe('الهوية والتصنيف'));
  });

  describe('ABT-AX2-01 — ante mortem', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX2-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('category is صحيه', () => expect(item.category).toBe('صحيه'));
  });

  describe('ABT-AX2-02 — post mortem', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX2-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('ABT-AX2-03 — séparation circuits', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX2-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('legalReference contains 17-140', () => expect(item.legalReference).toContain('17-140'));
  });

  describe('ABT-AX3-01 — eau potable (measurement)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX3-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is measurement', () => expect(item.controlType).toBe('measurement'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('ABT-AX3-02 — points de lavage', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX3-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('ABT-AX4-01 — séparation déchets liquides', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('category is بيئية', () => expect(item.category).toBe('بيئية'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('ABT-AX4-02 — déchets solides conteneurs fermés', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is high', () => expect(item.severity).toBe('high'));
    it('legalReference contains 01-19', () => expect(item.legalReference).toContain('01-19'));
  });

  describe('ABT-AX4-03 — contrat opérateur agréé déchets', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX4-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('legalReference contains 05-315', () => expect(item.legalReference).toContain('05-315'));
  });

  describe('ABT-AX5-01 — chambre froide viandes (measurement)', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX5-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is measurement', () => expect(item.controlType).toBe('measurement'));
    it('has numericField', () => expect(item.numericField).toBeDefined());
    it('numericField.unit is °C', () => expect(item.numericField!.unit).toBe('°C'));
    it('numericField.min is 0', () => expect(item.numericField!.min).toBe(0));
    it('numericField.max is 5', () => expect(item.numericField!.max).toBe(5));
    it('numericField.warningMax is 7', () => expect(item.numericField!.warningMax).toBe(7));
    it('numericField.step is 0.1', () => expect(item.numericField!.step).toBe(0.1));
  });

  describe('ABT-AX5-02 — enregistrement températures doc', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX5-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('ABT-AX5-03 — séparation cru/prêt-à-consommer', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX5-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('ABT-AX6-01 — sols inclinés drains', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX6-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('category is نظافة', () => expect(item.category).toBe('نظافة'));
  });

  describe('ABT-AX6-02 — programme nettoyage écrit', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX6-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('legalReference contains 17-140', () => expect(item.legalReference).toContain('17-140'));
  });

  describe('ABT-AX6-03 — marche en avant', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX6-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('ABT-AX7-01 — suivi médical travailleurs', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX7-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('legalReference contains 18-11', () => expect(item.legalReference).toContain('18-11'));
  });

  describe('ABT-AX7-02 — tenues de travail', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX7-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('ABT-AX8-01 — plan HACCP abattoir', () => {
    const item = abattoirSpecificCriteria.find((i) => i.id === 'ABT-AX8-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('category is تنظيمية', () => expect(item.category).toBe('تنظيمية'));
    it('legalReference contains 17-140', () => expect(item.legalReference).toContain('17-140'));
  });

  // --- coverage: numeric shape completeness ---
  it('measurement items have numericField defined', () => {
    const measurements = abattoirSpecificCriteria.filter(
      (i) => i.controlType === 'measurement'
    );
    expect(measurements.length).toBeGreaterThan(0);
    measurements.forEach((i) => {
      expect(i.numericField).toBeDefined();
      expect(typeof i.numericField!.unit).toBe('string');
      expect(typeof i.numericField!.min).toBe('number');
      expect(typeof i.numericField!.max).toBe('number');
    });
  });
});
