import { InspectionItem } from '../types';

export const marbleCriteria: InspectionItem[] = [
  // MRB-01-01 removed — pure restate of BGN-01-01 (operating license, generic). No unique content added.
  {
    id: 'MRB-02-01',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'توفر سجل تجاري أو وثيقة نشاط سارية.',
    legalReference: 'القانون 04-08 (الشروط العامة لممارسة الأنشطة التجارية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // G6 fix: citation corrected 06-141 → 06-138 (06-141 = wastewater, 06-138 = air emissions)
    id: 'MRB-02-02',
    axis: 'الموقع والتهيئة',
    category: 'بيئية',
    criteria: 'عدم تسبب الورشة في انتشار غبار الرخام خارج المنشأة وعدم إزعاج الجوار أو تلوث الطريق العام.',
    legalReference: 'القانون 03-10 + المرسوم 06-138.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // W82: FIXED — replaced wrong Loi 90-11 (unrelated general labour law)
    // with Décret 91-05 Arts.16-17 (collective/individual protection obligation, ventilation priority).
    // Décret 93-120 retained ONLY for the occupational disease (silicosis) monitoring obligation —
    // it is the correct reference for that specific aspect (Art.2 lists silicosis as occupational disease).
    id: 'MRB-03-01',
    axis: 'المياه المستعملة والغبار',
    category: 'بيئية',
    criteria: 'توفر تهوية فعالة ونظام سحب غبار (شفاط سير + منخل مرشح) للحد من التعرض لغبار السيليكا المسبب للسحار.',
    legalReference: 'المرسوم 91-05 المواد 16-17 (أولوية الحماية الجماعية والتهوية قبل اللجوء لوسائل الوقاية الفردية) + المرسوم 93-120 المادة 2 (السحار السيليكاوي ضمن قائمة الأمراض المهنية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Phase 4.1 — added numericField for MES (suspended solids) threshold in cutting/shaping wastewater
    id: 'MRB-03-02',
    axis: 'المياه المستعملة والغبار',
    category: 'بيئية',
    criteria: 'تصريف مياه القطع والتشكيل إلى شبكة الصرف الصحي عبر حوض ترسيب، وعدم تصريفها مباشرة في الطريق. عند التصريف في الشبكة العمومية أو الوسط الطبيعي: قياس المواد العالقة (MES) عند نقطة التصريف والتحقق من عدم تجاوز القيمة القصوى (35 ملغ/ل في الوسط الطبيعي).',
    legalReference: 'القانون 03-10 + المرسوم 06-141 (القيم القصوى للمصبات الصناعية — MES ≤ 35 ملغ/ل في الوسط الطبيعي).',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'mg/L',
      labelAr: 'MES (المواد العالقة) عند نقطة التصريف',
      max: 35,
      warningMax: 30,
      step: 1,
      upperLimit: true,
    },
  },
  {
    id: 'MRB-04-01',
    axis: 'المياه المستعملة والغبار',
    category: 'بيئية',
    criteria: 'جمع الحمأة والمخلفات الصلبة من قطع الرخام في حاويات مخصصة وتسليمها لمتعامل معتمد.',
    legalReference: 'القانون 01-19 + المرسوم 09-19.',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // Phase 4.3 — discharge permit for marble workshop (new criterion)
    id: 'MRB-04-02',
    axis: 'المياه المستعملة والغبار',
    category: 'تنظيمية',
    criteria: 'الحصول على رخصة تصريف صناعي من مديرية الموارد المائية (أو ما يعادلها) قبل التصريف في الشبكة العمومية أو الوسط الطبيعي، واحترام شروطها.',
    legalReference: 'القانون 05-12 المتعلق بالمياه (المادة 46: حظر التلوث) + المرسوم 06-141 (القيم القصوى للمصبات الصناعية) + التنظيم المتعلق برخص التفريغ الصادرة عن مصالح الموارد المائية.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // W82: FIXED — replaced wrong Loi 90-11 (unrelated) with Décret 91-05 Arts.16-17 (PPE obligation).
    // Décret 93-120 removed from this criterion: it governs occupational disease surveillance,
    // not PPE supply. PPE obligation for silica dust = Décret 91-05 Arts.16-17.
    id: 'MRB-05-01',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'توفر وسائل وقاية شخصية: كمامات بخارية FFP2 أو جهاز تنفس خارجي، نظارات، قفازات، واقٍ سمعي عند القطع بالفلينسة.',
    legalReference: 'المرسوم 91-05 المواد 16-17 (توفير وسائل الوقاية الشخصية عند استحالة الحماية الجماعية وتجهيز العمال المعرّضين للغبار والأعمال الصوتية الشديدة).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MRB-05-02',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'توفر مطفأة حريق واحدة على الأقل بحالة صالحة مع التحقق من بطاقة الصيانة السنوية، ومخارج طوارئ واضحة التسمية خالية من العوائق.',
    legalReference: 'القانون 19-02 (الوقاية من الحريق).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MRB-05-03',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'إجراء فحوصات طبية دورية للعمال المعرضين لغبار السيليكا.',
    legalReference: 'المرسوم 93-120 (الفحص الطبي الدوري للأنشطة ذات المخاطر المهنية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // W82: FIXED — replaced wrong Loi 90-11 + Décret 93-120 (médecine du travail, unrelated to guards)
    // with correct Décret 91-05 Arts.39-41 (machine guards and emergency stop requirements).
    // Décret 91-05 Art.39: commandes à portée du conducteur.
    // Décret 91-05 Art.40: disposition des machines pour protéger les travailleurs des parties mobiles.
    // Décret 91-05 Art.41: organes dangereux inaccessibles — gardes, grilles, barrières.
    id: 'MRB-05-04',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'توفر حمايات ميكانيكية (واقيات) على أجهزة القطع الدوارة (فلينسة، منشار رخام) مع وجود أزرار إيقاف طارئ في متناول المشغّل.',
    legalReference: 'المرسوم 91-05 المواد 39-41 (اشتراطات حماية الآلات الدوارة وأجهزة الوقاية وأزرار الإيقاف الطارئ في متناول المشغّل).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Phase 7.1: periodic silica dust air quality measurement.
    id: 'MRB-05-05',
    axis: 'الانبعاثات الهوائية',
    category: 'بيئية',
    criteria: 'إجراء قياس دوري لتركيز غبار السيليكا (الكوارتز الحر) في هواء بيئة العمل (مرة في السنة على الأقل) بواسطة مختبر معتمد، والتحقق من عدم تجاوز القيم الحدية (0.1 ملغ/م³ للسيليكا الحرة القابلة للاستنشاق)؛ وتوثيق نتائج القياسات والإجراءات التصحيحية عند الاقتضاء.',
    legalReference: 'القانون 03-10 المادة 52 (التزام المنشآت المصنّفة بمراقبة انبعاثاتها الهوائية) + المرسوم 06-138 (القيم القصوى للانبعاثات الهوائية الصناعية) + المرسوم 93-120 (حماية العمال من السحار السيليكاوي).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'mg/m³',
      labelAr: 'تركيز غبار السيليكا الحرة القابل للاستنشاق',
      max: 0.1,
      warningMax: 0.08,
      step: 0.01,
      upperLimit: true,
    },
  },
  {
    // Phase A: total dust stack-emission measurement — Décret 06-138 Annex I general limit 50 mg/Nm³.
    id: 'MRB-07-01',
    axis: 'الانبعاثات الهوائية',
    category: 'بيئية',
    criteria: 'إجراء قياس دوري لتركيز الغبار الكلي (poussières totales) في الانبعاثات الهوائية عند نقطة المصب (مرة في السنة على الأقل) بواسطة مختبر معتمد، والتحقق من عدم تجاوز القيمة الحدية (50 ملغ/م³ن للحد العام)؛ وتوثيق نتائج القياسات والإجراءات التصحيحية عند الاقتضاء.',
    legalReference: 'القانون 03-10 المادة 52 + المرسوم 06-138 الملحق I (الغبار الكلي ≤ 50 ملغ/م³ن — الحد العام للمنشآت الصناعية).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'mg/Nm³',
      labelAr: 'تركيز الغبار الكلي عند نقطة المصب',
      max: 50,
      warningMax: 40,
      step: 1,
      upperLimit: true,
    },
  },
  {
    // Phase 11b: measurement report retention ≥ 3 years — Décret 06-138 Art. 11
    id: 'MRB-07-02',
    axis: 'الانبعاثات الهوائية',
    category: 'تنظيمية',
    criteria: 'الاحتفاظ بسجلات نتائج القياسات الدورية للانبعاثات الهوائية (غبار السيليكا والغبار الكلي) مدة لا تقل عن 3 سنوات وإتاحتها للمفتش عند الطلب.',
    legalReference: 'المرسوم 06-138 المادة 11 (إلزامية الاحتفاظ بسجلات القياسات الدورية للانبعاثات الهوائية لمدة ثلاث سنوات على الأقل).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
