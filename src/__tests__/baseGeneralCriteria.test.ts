// src/__tests__/baseGeneralCriteria.test.ts
// W29 (2026-08-09): fixed 3 stale article expectations to match W19 corrections
//   already committed in baseGeneralCriteria.ts:
//   - BGN-01-03: Art.71+73 → Art.82+84 (right of entry + suspension power)
//   - BGN-03-02: Art.14+45 → Art.8+11 (generator obligations, not national plan)
//   - BGN-03-03: Art.14 → Art.8 (same law 01-19, correct article)
// W39 (2026-08-09): updated BGN-03-04 and BGN-03-05 expectations from art.14 → art.9
//   Décret 91-05 Art.9 governs drainage channel design and P-trap requirements.
//   Art.14 was the wrong article (covers a different topic). Code corrected in W39;
//   these test assertions now match the correct legal source.
// W45 (2026-08-10): BGN-02-01 legalReference updated — no explicit article in 90-29
//   governs separation distances; W45 replaced Art.37 with:
//   القانون 90-29 المادة 4 (buildability conditions) + القانون 03-10 المادة 6
//   (prevention principle). Test updated accordingly.
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

  // W29 (2026-08-09): CORRECTED — W19 updated BGN-01-03 to Art.82 (entry) + Art.84 (suspension).
  it('BGN-01-03 inspector obstruction item is high severity', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-01-03');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
    expect(item!.legalReference).toContain('82');
    expect(item!.legalReference).toContain('84');
  });

  // W45 (2026-08-10): CORRECTED — no explicit article in 90-29 governs separation distances.
  //   W45 replaced Art.37 with Art.4 (buildability/environmental balance) of 90-29
  //   + Art.6 (prevention principle) of 03-10 + professional judgment note.
  it('BGN-02-01 legalReference references 90-29 art.4 and 03-10 art.6', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-02-01');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('90-29');
    expect(item!.legalReference).toContain('4');
    expect(item!.legalReference).toContain('03-10');
    expect(item!.legalReference).toContain('6');
  });

  // W8 (2026-08-08): BGN-03-01 legalReference updated from Décret 88-164 (superseded/unfindable
  // in JORADP) to Décret exécutif 11-125 du 22/03/2011 (potable water quality norms,
  // JORADP-confirmed). Test updated accordingly — no specific articles cited in the new ref.
  it('BGN-03-01 legalReference references Décret 11-125 (potable water norms)', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-01');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('11-125');
    expect(item!.legalReference).toContain('2011');
  });

  // W29 (2026-08-09): CORRECTED — W19 updated BGN-03-02 from Art.14+45 → Art.8+11 of Loi 01-19.
  //   Art.14 was the national waste plan (wrong domain).
  //   Art.8 = generator obligation + Art.11 = disposal conditions.
  it('BGN-03-02 legalReference cites 01-19 art.8 and 03-10 art.30', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-02');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('01-19');
    expect(item!.legalReference).toContain('8');
    expect(item!.legalReference).toContain('03-10');
    expect(item!.legalReference).toContain('30');
  });

  // W29 (2026-08-09): CORRECTED — W19 updated BGN-03-03 from Art.14 → Art.8 of Loi 01-19.
  it('BGN-03-03 legalReference cites 01-19 art.8', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-03');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('01-19');
    expect(item!.legalReference).toContain('8');
  });

  // W39 (2026-08-09): CORRECTED — Art.9 governs drainage channel design (pipe diameter,
  // slope, flow requirements). Art.14 was wrong. Both BGN-03-04 and BGN-03-05 updated.
  it('BGN-03-04 legalReference cites 91-05 art.9', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-04');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('91-05');
    expect(item!.legalReference).toContain('9');
  });

  it('BGN-03-05 legalReference cites 91-05 art.9', () => {
    const item = baseGeneralCriteria.find((c: InspectionItem) => c.id === 'BGN-03-05');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('91-05');
    expect(item!.legalReference).toContain('9');
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
