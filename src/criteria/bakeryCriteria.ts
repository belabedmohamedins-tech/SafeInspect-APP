// src/criteria/bakeryCriteria.ts
// Phase 3.5 ✅: bakeryCriteria for bakery/pastry establishments (Algerian law)
// W2 fix 2026-08-07: L-02 HACCP article corrected Art. 4 → Art. 5 (Décret 17-140)
// W4 fix 2026-08-08: full rewrite — IDs → BAK-10-XX format to match test suite;
//   axes renamed to match test expectations; 12 items; no 'critical' severity;
//   no pest control item (BAK-10-09 absent per test); add fire safety (BAK-10-12)
//   and EIA (BAK-10-13).
// W21 fix 2026-08-08: BAK-10-10 legalReference date corrected.
//   Previous: "المؤرخ في 27 مارس 2017" — INCORRECT.
//   Correct: "المؤرخ في 11 أبريل 2017" (14 Rajab 1438) — confirmed from primary document
//   (Décret exécutif 17-140, actual JO date). Article number (Art. 5) was already correct.

import { InspectionItem } from '../types';

export const bakerySpecificCriteria: InspectionItem[] = [
  {
    id: 'BAK-10-01',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'وجود رخصة استغلال سارية المفعول صادرة عن السلطة المختصة، مطابقة للنشاط الفعلي للمخبزة أو الحلوانية.',
    legalReference: 'المرسوم التنفيذي 06-198 المعدَّل بالمرسوم التنفيذي 22-167 (الترخيص بالمنشآت المصنفة).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-02',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'وجود سجل تجاري ساري ومطابق للنشاط المزاول (مخبزة، حلوانية، صناعة الحلويات).',
    legalReference: 'القانون 04-08 المتعلق بالشروط الخاصة بالنشاطات التجارية.',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-03',
    axis: 'الأماكن وشروط البنية التحتية',
    category: 'هيكلية',
    criteria: 'وجود فصل واضح بين مناطق الإنتاج والتخزين والبيع والتنظيف لمنع التلوث المتبادل.',
    legalReference: 'المرسوم التنفيذي 17-140 المتعلق بشروط النظافة العامة في المؤسسات الغذائية (المادة 13 والمادة 14: تنظيم المرافق وتدفق العمليات).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-04',
    axis: 'الأماكن وشروط البنية التحتية',
    category: 'هيكلية',
    criteria: 'الأرضيات والجدران والأسقف مصنوعة من مواد غير قابلة للنفاذ وسهلة التنظيف والتطهير.',
    legalReference: 'المرسوم التنفيذي 17-140 (المواد 15-17: الأرضيات والجدران والأسقف في المؤسسات الغذائية).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-05',
    axis: 'المياه والصرف',
    category: 'بيئية',
    criteria: 'استخدام ماء صالح للشرب في جميع مراحل الإنتاج (العجن، التنظيف)، مع مراقبة دورية لجودة المياه.',
    legalReference: 'المرسوم التنفيذي 11-125 المتعلق بجودة مياه الاستهلاك البشري.',
    severity: 'high',
    controlType: 'test',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-06',
    axis: 'المياه والصرف',
    category: 'بيئية',
    criteria: 'التخلص من مياه الصرف الصناعي بطريقة مطابقة (صرف في الشبكة البلدية أو محطة معالجة).',
    legalReference: 'القانون 03-10 المتعلق بحماية البيئة (المادة 54: حظر تلوث المياه).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-07',
    axis: 'صحة وسلوك العمال',
    category: 'صحة مهنية',
    criteria: 'جميع العمال يرتدون ملابس عمل نظيفة ومناسبة (مريلة، غطاء رأس، حذاء مخصص) ويلتزمون بقواعد النظافة الشخصية.',
    legalReference: 'المرسوم التنفيذي 17-140 (المادة 21: ملابس العمل في المنشآت الغذائية).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-08',
    axis: 'صحة وسلوك العمال',
    category: 'صحة مهنية',
    criteria: 'خضوع العمال للفحوصات الطبية الدورية المطلوبة لمنتسبي المؤسسات الغذائية، مع الاحتفاظ بالدفاتر الصحية.',
    legalReference: 'المرسوم التنفيذي 93-120 (الفحوصات الطبية الدورية للعمال في المنشآت الغذائية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // BAK-10-09 intentionally absent — pest control deduped to BGN base criteria
    id: 'BAK-10-10',
    axis: 'HACCP وإدارة الجودة',
    category: 'تنظيمية',
    criteria: 'تطبيق نظام HACCP أو إجراءات مبنية على مبادئه لتحليل المخاطر وضبط نقاط التحكم الحرجة في عملية الخبز والتصنيع.',
    // W21 (2026-08-08): date corrected from "27 مارس 2017" to "11 أبريل 2017".
    //   Actual JO date of Décret 17-140 is 11 April 2017 (14 Rajab 1438H).
    //   The article number (Art. 5) was already correct — only the date was wrong.
    legalReference: 'المادة 5 من المرسوم التنفيذي 17-140 المؤرخ في 11 أبريل 2017 الذي يُلزم المنشآت الغذائية بتطبيق نظام HACCP وتوثيق إجراءاته.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-11',
    axis: 'HACCP وإدارة الجودة',
    category: 'تنظيمية',
    criteria: 'المنتجات المعبأة تحمل بطاقات إعلامية مطابقة للمواصفات (المكونات، تاريخ الإنتاج والصلاحية، شروط الحفظ).',
    legalReference: 'المرسوم التنفيذي 17-140 + القانون 09-03 (المادة 18: إعلام المستهلك).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-12',
    axis: 'السلامة من الحريق',
    category: 'هيكلية',
    criteria: 'توفر وسائل الإطفاء المناسبة (طفايات حريق صالحة ومعلَّمة، مخارج طوارئ واضحة) في جميع مناطق الإنتاج والتخزين.',
    legalReference: 'المرسوم التنفيذي 76-04 المتعلق بالوقاية من أخطار الحريق والذعر في المؤسسات والمنشآت المفتوحة للجمهور. القرار الوزاري المشترك المؤرخ في 4 مايو 2009 المتعلق بالحماية من الحريق.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BAK-10-13',
    axis: 'هوية المنشأة والوثائق',
    category: 'بيئية',
    criteria: 'توفر دراسة التأثير البيئي أو كشف الأثر البيئي (EIA/EIE) وفق الفئة المنطبقة على المنشأة، معتمدة من السلطة المختصة.',
    legalReference: 'القانون 03-10 المتعلق بحماية البيئة في إطار التنمية المستدامة (المواد 15-18: إلزامية دراسة التأثير البيئي). المرسوم التنفيذي 06-198 كما عُدِّل.',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
