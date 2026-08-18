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
// W58 fix 2026-08-11: BAK-10-12 — Décret 76-04 + 2009 ministerial order (no JORADP trace)
//   replaced with Loi 19-02 Art.5 + Art.13. Consistent with BGN-08-01/02 (W18, 2026-08-08).
//   Loi 19-02 is the current framework law for fire/panic prevention, superseding 76-04.
// W42-parity fix 2026-08-16: BAK-10-13 EIE range 15–18 → 14–21.
//   Previous range 15–18 was doubly wrong: missed Art.14 (root EIE obligation) and
//   truncated at Art.18, omitting Art.19–21 (EIE procedure and follow-up articles).
//   Correct full EIE range: Art.14–21.
// W62 fix 2026-08-18: BAK-10-13 EIE range 14–21 → 15–22.
//   Art.14 = PNAEDD duration (5 ans, modalités réglementaires) — hors sujet EIE.
//   Art.22 = réalisation EIE par bureaux agréés à la charge du promoteur — pertinent.
//   Confirmed by direct read of loi-03-10-protection-environnement.md this turn.

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
    legalReference: 'القانون 03-10 المتعلق بحماية البيئة (المادة 54: حظر تلويث المياه).',
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
    criteria: 'المنتجات المعبَّأة تحمل بطاقات إعلامية مطابقة للمواصفات (المكونات، تاريخ الإنتاج والصلاحية، شروط الحفظ).',
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
    // W58 (2026-08-11): Décret 76-04 (1976) + 2009 ministerial order (no JORADP trace) replaced
    // with Loi 19-02 Art.5 + Art.13 — current fire/panic prevention framework law.
    // Consistent with BGN-08-01/02 citations (W18, 2026-08-08).
    legalReference: 'القانون 19-02 المادة 5 (إلزام المستغلين باتخاذ تدابير الوقاية من الحريق والذعر) + المادة 13 (وسائل الإطفاء ومخارج الطوارئ الإلزامية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // W42-parity fix 2026-08-16: EIE range corrected 15–18 → 14–21.
    // W62 fix 2026-08-18: EIE range corrected 14–21 → 15–22.
    //   Art.14 = PNAEDD (durée 5 ans, modalités réglementaires) — hors sujet EIE.
    //   Art.15 = obligation EIE/notice d'impact — RACINE de l'obligation.
    //   Art.16 = contenu de l'étude d'impact.
    //   Art.17–21 = établissements classés + EIE condition préalable à l'autorisation.
    //   Art.22 = réalisation EIE par bureaux d'études agréés à la charge du promoteur — pertinent.
    //   Confirmed by direct read of loi-03-10-protection-environnement.md (2026-08-18).
    id: 'BAK-10-13',
    axis: 'هوية المنشأة والوثائق',
    category: 'بيئية',
    criteria: 'توفر دراسة التأثير البيئي أو كشف الأثر البيئي (EIA/EIE) وفق الفئة المنطبقة على المنشأة، معتمدة من السلطة المختصة.',
    legalReference: 'القانون 03-10 المواد 15–22 (المادة 15: إلزامية EIE أو كشف الأثر البيئي؛ المادة 16: محتوى الدراسة؛ المواد 17–21: نظام المنشآت المصنفة وEIE شرط مسبق للترخيص؛ المادة 22: إنجاز الدراسة بمكتب دراسات معتمد على نفقة صاحب المشروع). المرسوم التنفيذي 06-198 كما عُدِّل.',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
