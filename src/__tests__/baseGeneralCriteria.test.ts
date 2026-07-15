import { baseGeneralCriteria } from '../criteria/baseGeneralCriteria';
import { InspectionItem } from '../types';

describe('baseGeneralCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(baseGeneralCriteria)).toBe(true);
  });

  it('contains exactly 37 criteria', () => {
    expect(baseGeneralCriteria).toHaveLength(37);
  });

  it('has no duplicate IDs', () => {
    const ids = baseGeneralCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs match BGN-XX-XX pattern', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^BGN-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty criteria text', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
    });
  });

  it('all items have a non-empty legalReference', () => {
    baseGeneralCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
    });
  });

  it('measurement items have numericField defined', () => {
    const measurements = baseGeneralCriteria.filter(
      (c: InspectionItem) => c.controlType === 'measurement'
    );
    measurements.forEach((item: InspectionItem) => {
      expect(item.numericField).toBeDefined();
    });
  });

  it('BGN-01-01 is high severity doc for operating license', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-01-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('BGN-01-03 inspector obstruction item is high severity', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-01-03');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
    expect(item!.legalReference).toContain('71');
    expect(item!.legalReference).toContain('73');
  });

  it('BGN-02-01 legalReference contains art.37 of 90-29', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-02-01');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('90-29');
    expect(item!.legalReference).toContain('37');
  });

  it('BGN-03-01 legalReference references art.3 and art.7 of 88-164', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-01');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('88-164');
    expect(item!.legalReference).toContain('3');
    expect(item!.legalReference).toContain('7');
  });

  it('BGN-03-02 legalReference cites 01-19 art.14 and 03-10 art.45', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-02');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('01-19');
    expect(item!.legalReference).toContain('14');
    expect(item!.legalReference).toContain('03-10');
    expect(item!.legalReference).toContain('45');
  });

  it('BGN-03-03 legalReference cites 01-19 art.14', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-03');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('01-19');
    expect(item!.legalReference).toContain('14');
  });

  it('BGN-03-04 legalReference cites 91-05 art.14', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-04');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('91-05');
    expect(item!.legalReference).toContain('14');
  });

  it('BGN-03-05 legalReference cites 91-05 art.14', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-05');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('91-05');
    expect(item!.legalReference).toContain('14');
  });

  it('noise measurement criterion BGN-09-01 exists with numericField', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-09-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('dB');
    expect(item!.numericField!.warningMax).toBe(70);
  });

  it('BGN-10-01 EIA criterion is high severity doc', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-10-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
    expect(item!.legalReference).toContain('07-145');
  });
});
