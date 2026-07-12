import { couvoirSpecificCriteria } from '../../src/criteria/couvoirCriteria';
import { InspectionItem } from '../../src/types';

describe('couvoirSpecificCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(couvoirSpecificCriteria)).toBe(true);
    expect(couvoirSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('every item has required InspectionItem fields', () => {
    couvoirSpecificCriteria.forEach((item: InspectionItem) => {
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
    const ids = couvoirSpecificCriteria.map((i) => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  // --- COU series ---
  describe('COU-AX1-01 — تصنيف التفريخ في الرخصة', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX1-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
    it('legalReference contains 06-198', () => expect(item.legalReference).toContain('06-198'));
  });

  describe('COU-AX1-02 — ملف تقني محدث', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX1-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX2-01 — أرضيات قاعات التفريخ', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX2-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('category is نظافة', () => expect(item.category).toBe('نظافة'));
    it('legalReference contains 17-140', () => expect(item.legalReference).toContain('17-140'));
  });

  describe('COU-AX2-02 — جدران قاعات التفريخ', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX2-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('COU-AX2-03 — أسقف منع التكثف', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX2-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('COU-AX2-04 — نظام التهوية', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX2-04')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is high', () => expect(item.severity).toBe('high'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('COU-AX3-01 — أجهزة قياس حرارة ورطوبة (test)', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX3-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is test', () => expect(item.controlType).toBe('test'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX3-02 — سجلات الحرارة والرطوبة', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX3-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX3-03 — إجراءات تصحيحية مكتوبة', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX3-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
  });

  describe('COU-AX4-01 — بيض من قطعان معتمدة', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX4-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX4-02 — نظام تتبع الدفعات', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX4-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
  });

  describe('COU-AX4-03 — فرز البيض قبل التفريخ', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX4-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX5-01 — برنامج تنظيف وتطهير مكتوب', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX5-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('legalReference contains 17-140', () => expect(item.legalReference).toContain('17-140'));
  });

  describe('COU-AX5-02 — تنظيف الصواني بين الدفعات', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX5-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX5-03 — إزالة قشور البيض من غرف الفقس', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX5-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('COU-AX6-01 — ماء صالح للشرب (test)', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX6-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is test', () => expect(item.controlType).toBe('test'));
    it('category is بيئية', () => expect(item.category).toBe('بيئية'));
  });

  describe('COU-AX6-02 — شبكة صرف صحي', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX6-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('legalReference contains 03-10', () => expect(item.legalReference).toContain('03-10'));
  });

  describe('COU-AX7-01 — ملابس العمل', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX7-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('COU-AX7-02 — أحواض غسل اليدين', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX7-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX7-03 — فحص طبي دوري', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX7-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('legalReference contains 18-11', () => expect(item.legalReference).toContain('18-11'));
  });

  describe('COU-AX8-01 — علامات إصابة بنواقل', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX8-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX8-02 — برنامج مكتوب مكافحة النواقل', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX8-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('COU-AX9-01 — خطة HACCP التفريخ', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX9-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('category is تنظيمية', () => expect(item.category).toBe('تنظيمية'));
    it('legalReference contains 17-140', () => expect(item.legalReference).toContain('17-140'));
  });

  describe('COU-AX9-02 — نقاط التحكم الحرجة CCP', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === 'COU-AX9-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  // --- 02-XX new series ---
  describe('02-01 — رخصة وحدة التفريخ', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-01')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('legalReference contains 06-198', () => expect(item.legalReference).toContain('06-198'));
  });

  describe('02-02 — أرضيات قاعات التفريخ', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-02')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('legalReference contains 17-140', () => expect(item.legalReference).toContain('17-140'));
  });

  describe('02-03 — جدران وأسقف', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-03')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
  });

  describe('02-04 — التهوية والتحكم في الوسط', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-04')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('02-05 — معايرة أجهزة التحكم الحراري', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-05')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('02-06 — ماء صالح للشرب (test)', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-06')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is test', () => expect(item.controlType).toBe('test'));
    it('legalReference contains 17-140', () => expect(item.legalReference).toContain('17-140'));
  });

  describe('02-07 — برنامج نظافة وتطهير', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-07')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('02-08 — تتبع دفعات البيض', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-08')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('02-09 — قشور البيض نفايات مغلقة', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-09')!;
    it('exists', () => expect(item).toBeDefined());
    it('severity is medium', () => expect(item.severity).toBe('medium'));
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('legalReference contains 01-19', () => expect(item.legalReference).toContain('01-19'));
  });

  describe('02-10 — تجهيز العمال وغسل اليدين', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-10')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is visual', () => expect(item.controlType).toBe('visual'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  describe('02-11 — برنامج مكافحة النواقل doc', () => {
    const item = couvoirSpecificCriteria.find((i) => i.id === '02-11')!;
    it('exists', () => expect(item).toBeDefined());
    it('controlType is doc', () => expect(item.controlType).toBe('doc'));
    it('severity is high', () => expect(item.severity).toBe('high'));
  });

  // --- controlType distribution ---
  it('has doc, visual, and test controlType variants', () => {
    const types = new Set(couvoirSpecificCriteria.map((i) => i.controlType));
    expect(types.has('doc')).toBe(true);
    expect(types.has('visual')).toBe(true);
    expect(types.has('test')).toBe(true);
  });
});
