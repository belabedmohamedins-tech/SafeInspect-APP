import { InspectionItem } from '../types';

export const baseFoodCriteria: InspectionItem[] = [
  // =====================================================================
  // المحور 1: المواد الأولية والموردون
  // =====================================================================
  {
    id: 'BFD-01-01',
    axis: 'المواد الأولية والموردون',
    category: 'غذائية',
    criteria: 'التحقق من سلامة المواد الأولية عند الاستلام: فحص المظهر، الرائحة، درجة الحرارة (للمبردة/المجمدة)، وتاريخ الصلاحية.',
    legalReference: 'القانون 09-03 (حماية المستهلك وقمع الغش) + المرسوم التنفيذي 17-140 (اشتراطات السلامة الغذائية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BFD-01-02',
    axis: 'المواد الأولية والموردون',
    category: 'غذائية',
    criteria: 'الموردون مسجلون ومعتمدون، وتتوفر فواتير شراء لجميع المواد الأولية الغذائية.',
    legalReference: 'القانون 09-03 + المرسوم التنفيذي 17-140.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // =====================================================================
  // المحور 2: التخزين
  // =====================================================================
  {
    id: 'BFD-02-01',
    axis: 'التخزين',
    category: 'غذائية',
    criteria: 'فصل تخزين المواد الأولية عن المنتجات الجاهزة للاستهلاك والمواد الكيميائية.',
    legalReference: 'المرسوم التنفيذي 17-140 (اشتراطات الفصل في التخزين لمنع التلوث المتقاطع).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BFD-02-02',
    axis: 'التخزين',
    category: 'غذائية',
    criteria: 'رفع المواد المخزنة عن الأرض (≥15 سم) وتباعدها عن الجدران (≥5 سم) لتسهيل التنظيف ومنع الرطوبة.',
    legalReference: 'المرسوم التنفيذي 17-140 (اشتراطات التخزين الصحي).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BFD-02-03',
    axis: 'التخزين',
    category: 'غذائية',
    criteria: 'المواد المخزنة مرتبة ومُعلَّمة بوضوح (اسم المادة، تاريخ الاستلام، تاريخ الصلاحية) وتُطبَّق قاعدة FIFO (أول داخل أول خارج).',
    legalReference: 'القانون 09-03 + المرسوم التنفيذي 17-140.',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  // =====================================================================
  // المحور 3: نظافة الأسطح والتجهيزات
  // =====================================================================
  {
    id: 'BFD-03-01',
    axis: 'نظافة الأسطح والتجهيزات',
    category: 'نظافة',
    criteria: 'أسطح التماس مع الغذاء (طاولات، معدات، أدوات) نظيفة ومطهّرة بانتظام بمواد مرخصة للاستخدام الغذائي.',
    legalReference: 'المرسوم التنفيذي 17-140 + القانون 09-03.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BFD-03-02',
    axis: 'نظافة الأسطح والتجهيزات',
    category: 'نظافة',
    criteria: 'وجود برنامج تنظيف وتطهير مكتوب (جدول، مواد، تركيزات، مسؤوليات) ويُطبَّق فعلياً.',
    legalReference: 'المرسوم التنفيذي 17-140 (إلزامية برنامج النظافة المكتوب).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // =====================================================================
  // المحور 4: سلسلة البرودة
  // W7 (2026-08-08): BFD-04-01 + BFD-04-02 — legalReference corrected.
  //   Previous refs cited Décret 17-140 Art.7 / Art.8 — those articles cover
  //   general food hygiene conditions, NOT cold-chain temperature limits.
  //   Correct instrument: Arrêté interministériel du 07/05/2025 fixant les
  //   conditions de température de conservation des denrées alimentaires
  //   (already verified in docs/legal_sources/ — JORADP primary source).
  //   Temperatures unchanged: chilled 0–5°C, frozen ≤ −18°C.
  // =====================================================================
  {
    id: 'BFD-04-01',
    axis: 'سلسلة البرودة',
    category: 'غذائية',
    criteria: 'الحفاظ على سلسلة البرودة للمنتجات المبردة: درجة حرارة التخزين بين 0°C و5°C مع وجود مقياس حرارة معيَّر داخل كل وحدة تبريد.',
    // W7: corrected from Décret 17-140 Art.7 (general hygiene) to the specific cold-chain arrêté.
    legalReference: 'القرار الوزاري المشترك المؤرخ في 07/05/2025 (اشتراطات درجة حرارة حفظ المواد الغذائية — المبردات: 0–5°C) + المرسوم التنفيذي 17-140 (السلامة الغذائية العامة).',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      labelAr: 'درجة حرارة التبريد المقاسة (°C)',
      unit: '°C',
      min: 0,
      max: 5,
      step: 0.1,
    },
  },
  {
    id: 'BFD-04-02',
    axis: 'سلسلة البرودة',
    category: 'غذائية',
    criteria: 'الحفاظ على سلسلة التجميد للمنتجات المجمدة: درجة حرارة التخزين ≤ −18°C مع وجود مقياس حرارة معيَّر داخل كل وحدة تجميد.',
    // W7: corrected from Décret 17-140 Art.8 (general hygiene) to the specific cold-chain arrêté.
    legalReference: 'القرار الوزاري المشترك المؤرخ في 07/05/2025 (اشتراطات درجة حرارة حفظ المواد الغذائية — المجمدات: ≤ −18°C) + المرسوم التنفيذي 17-140 (السلامة الغذائية العامة).',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      labelAr: 'درجة حرارة التجميد المقاسة (°C)',
      unit: '°C',
      warningMax: -18,
      step: 0.1,
      upperLimit: true,
    },
  },
  // =====================================================================
  // المحور 5: نظام HACCP
  // Z12-13 ✅ (2026-08-06): legalReference corrected from Art. 9 → Art. 5.
  // W6 (2026-08-08): confirmed clean by direct code read — Art.5 already correct.
  // =====================================================================
  {
    id: 'BFD-05-01',
    axis: 'HACCP ونظام السلامة الغذائية',
    category: 'غذائية',
    // Z12-13 ✅: Décret 17-140 Art. 5 confirmed as HACCP obligation article (JORADP, 2026-08-06).
    // W6 ✅: confirmed clean by direct read (2026-08-08).
    criteria: 'وجود نظام HACCP مطبَّق وموثَّق (تحليل المخاطر، نقاط التحكم الحرجة CCP، حدود حرجة، مراقبة، تصحيح، توثيق) في المنشآت التي تُلزَم به قانوناً. ملاحظة: مرافق الإنتاج الأولي (كوفوير، UPD) مستثناة صراحةً من هذا الالتزام.',
    legalReference: 'المرسوم التنفيذي 17-140 المادة 5 (إلزامية نظام HACCP في المنشآت الغذائية المصنفة — لا تشمل الإنتاج الأولي).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // =====================================================================
  // المحور 6: نظافة العمال الصحية
  // =====================================================================
  {
    id: 'BFD-06-01',
    axis: 'نظافة العمال الصحية',
    category: 'نظافة',
    criteria: 'العمال يرتدون ملابس عمل نظيفة (بلوزة أو مئزر)، يغسلون أيديهم بانتظام، لا توجد مجوهرات أو ساعات في منطقة الإنتاج.',
    legalReference: 'المرسوم التنفيذي 17-140 + القانون 09-03.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BFD-06-02',
    axis: 'نظافة العمال الصحية',
    category: 'نظافة',
    criteria: 'توفر شهادات صحة سارية لجميع العمال المتعاملين مع المواد الغذائية.',
    legalReference: 'القانون 09-03 + تشريعات الصحة العمومية.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // =====================================================================
  // المحور 7: مكافحة الآفات
  // Phase 8.4 ✅: BFD-07-01 و BFD-07-02 أُزيلا — المحور مُدمج في BGN-07-01/05
  // =====================================================================
  // =====================================================================
  // المحور 8: التتبعية (Phase 3.4 ✅)
  // =====================================================================
  {
    id: 'BFD-08-01',
    axis: 'التتبعية والسجلات',
    category: 'غذائية',
    criteria: 'وجود نظام تتبعية فعّال يُمكِّن من تحديد مصدر كل مادة غذائية أولية وتتبع مسارها خلال الإنتاج والتوزيع، مع الاحتفاظ بسجلات الاستلام والإنتاج والتسليم لمدة لا تقل عن سنتين.',
    legalReference: 'القانون 09-03 المادة 19 (إلزامية التتبعية في سلسلة الغذاء) + المرسوم التنفيذي 17-140 (توثيق مسار المنتج الغذائي).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
