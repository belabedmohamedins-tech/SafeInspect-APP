// src/criteria/abattoirCriteria.ts
// Phase 3.2: abattoirCriteria based on HACCP + Algerian slaughterhouse-specific regs
// Phase 3.3: Corrected HACCP basis citation; removed unverified ministerial order ref.
// Phase W2 (2026-08-07): L-02 HACCP art.4→art.5; L-05 chlorine 11-219→11-125.

import { InspectionItem } from '../types';

export const abattoirCriteria: InspectionItem[] = [
  // ===== AX1 — البنية التحتية والمباني =====
  {
    id: 'ABT-AX1-01',
    axis: 'البنية التحتية والمباني',
    category: 'هيكلية',
    criteria: 'وجود فصل واضح بين المناطق القذرة (الاستقبال والصنارة) والمناطق النظيفة (التقطيع والتغليف والتبريد) مع اتجاه أحادي لحركة المنتج.',
    legalReference: 'المرسوم التنفيذي 17-140 (منع التلوث المتبادل بين المراحل القذرة والنظيفة في السلسلة الغذائية) ومبادئ GHP/HACCP.',
    severity: 'critical',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX1-02',
    axis: 'البنية التحتية والمباني',
    category: 'هيكلية',
    criteria: 'أرضيات مقاومة للانزلاق وقابلة للغسل، جدران ملساء حتى ارتفاع 2 متر على الأقل، سقف خالٍ من التكثف ومن سهل التنظيف.',
    legalReference: 'المرسوم التنفيذي 17-140 المواد 15-16 (اشتراطات البناء والتشطيب الصحي في المنشآت الغذائية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX1-03',
    axis: 'البنية التحتية والمباني',
    category: 'هيكلية',
    criteria: 'وجود مناطق منفصلة وواضحة الترقيم لكل مرحلة: صعق، ذبح، سلخ/حرق، تنظيف الأحشاء، فحص بيطري، تقطيع، ختم.',
    legalReference: 'المرسوم التنفيذي 17-140 (ترتيب المراحل لمنع التلوث المتبادل) ومتطلبات المسلخ الصحي.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX2 — التبريد وسلسلة البرودة =====
  {
    id: 'ABT-AX2-01',
    axis: 'التبريد وسلسلة البرودة',
    category: 'غذائية',
    criteria: 'تبريد الذبائح فور إتمام الفحص البيطري بحيث تصل درجة الحرارة الداخلية إلى ≤ 7°C خلال المدة المقررة، مع قياس وتسجيل متواصل.',
    legalReference: 'المرسوم التنفيذي 17-140 (اشتراطات حفظ اللحوم ومنع النمو الميكروبي) + مبادئ HACCP للمسلخ.',
    severity: 'critical',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      labelAr: 'درجة حرارة الذبيحة المقاسة (°C)',
      unit: '°C',
      warningMax: 7,
      step: 0.1,
      upperLimit: true,
    },
  },

  // ===== AX3 — المياه والصرف الصحي =====
  {
    id: 'ABT-AX3-01',
    axis: 'مياه الغسل والتطهير',
    category: 'بيئية',
    criteria: 'استعمال ماء صالح للشرب في جميع عمليات غسل الذبائح والأدوات والأسطح التي تلامس اللحوم، مع مراقبة دورية لجودة المياه ومستوى الكلور الحر المتبقي (≥ 0.1 ملغ/ل) وتمييز أي شبكة مياه غير صالحة للشرب عند وجودها.',
    legalReference: 'المرسوم التنفيذي 17-140 المادة 25 (جودة المياه في المؤسسات الغذائية). المرسوم التنفيذي 11-125 المتعلق بجودة مياه الاستهلاك البشري (الكلور الحر المتبقي ≥ 0.1 ملغ/ل).',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'mg/L',
      labelAr: 'تركيز الكلور الحر المتبقي',
      min: 0.1,
      max: 0.5,
      step: 0.01,
    },
  },
  {
    id: 'ABT-AX3-02',
    axis: 'مياه الغسل والتطهير',
    category: 'بيئية',
    criteria: 'وجود شبكة صرف صحي كافية بمصائد شحوم وفلاتر مناسبة لمنع انسداد قنوات الصرف وتراكم الفضلات السائلة.',
    legalReference: 'القانون 01-19. المرسوم التنفيذي 01-102 المنشئ للديوان الوطني للتطهير (ONA). القانون 05-12 المتعلق بالمياه (المادة 46: حظر تلويث المياه الجوفية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX4 — مياه الصرف الصناعي =====
  {
    id: 'ABT-AX4-01',
    axis: 'معالجة مياه الصرف الصناعي',
    category: 'بيئية',
    criteria: 'وجود محطة معالجة مياه الصرف أو عقد مع هيئة معتمدة، مع مراقبة دورية للمعايير المطابقة للمرسوم 06-141 (DBO5، DCO، MES، pH).',
    legalReference: 'القانون 03-10 المادة 54 (حظر تلويث المياه). القانون 05-12 المادة 46. المرسوم التنفيذي 06-141 الملحق I (القيم القصوى للتصريف الصناعي: DBO5 ≤ 35، DCO ≤ 120، MES ≤ 35، الزيوت ≤ 20 ملغ/ل، pH 6.5–8.5).',
    severity: 'critical',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX4-02',
    axis: 'معالجة مياه الصرف الصناعي',
    category: 'بيئية',
    criteria: 'نتائج تحاليل مياه الصرف الصناعي الدورية ضمن القيم القصوى المقررة (DBO5 ≤ 35 ملغ/ل، DCO ≤ 120 ملغ/ل، MES ≤ 35 ملغ/ل) أو إثبات تصريف في شبكة البلدية.',
    legalReference: 'المرسوم التنفيذي 06-141 الملحق I (قيم التصريف الصناعي القصوى — مسلخ أو منشأة تحويل اللحوم).',
    severity: 'critical',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX4-03',
    axis: 'معالجة مياه الصرف الصناعي',
    category: 'بيئية',
    criteria: 'وجود حوض ترسيب أو فاصل دهون/شحوم يعمل بكفاءة قبل تصريف مياه الصرف.',
    legalReference: 'المرسوم التنفيذي 06-141 (الحدّ من تلوث مياه الصرف الصناعي — المسلخ ومنشآت تحويل اللحوم).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX4-04B',
    axis: 'معالجة مياه الصرف الصناعي',
    category: 'بيئية',
    criteria: 'قيمة pH لمياه الصرف ضمن المدى المسموح به (6.5–8.5 وفق الملحق I للمرسوم 06-141 للمنشآت العامة).',
    legalReference: 'المرسوم التنفيذي 06-141 الملحق I — قيمة pH المقبولة (6.5–8.5).',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      labelAr: 'قيمة pH لمياه الصرف المقاسة',
      unit: 'pH',
      min: 6.5,
      max: 8.5,
      step: 0.1,
    },
  },

  // ===== AX5 — النفايات الصلبة والمخلفات =====
  {
    id: 'ABT-AX5-01',
    axis: 'النفايات الصلبة والمخلفات',
    category: 'بيئية',
    criteria: 'وجود عقد مع مجزر معتمد أو وحدة تحويل لمعالجة الفضلات الحيوانية (دم، أحشاء غير صالحة، جلود) بطريقة مطابقة للتشريعات.',
    legalReference: 'القانون 01-19 المتعلق بتسيير النفايات (الفضلات الحيوانية = نفايات خاصة). المرسوم التنفيذي 07-205 (تصنيف النفايات الخاصة الخطرة).',
    severity: 'critical',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX5-02',
    axis: 'النفايات الصلبة والمخلفات',
    category: 'بيئية',
    criteria: 'تخزين الفضلات الحيوانية في حاويات مغلقة ومعزولة في مكان مبرد أو مظلل بعيداً عن مناطق الذبح والتبريد.',
    legalReference: 'المرسوم التنفيذي 17-140 (الفصل بين النفايات والمنتجات الغذائية) + القانون 01-19.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX6 — الرخص والتصاريح =====
  {
    id: 'ABT-AX6-01',
    axis: 'الرخص والتصاريح',
    category: 'تنظيمية',
    criteria: 'وجود رخصة استغلال سارية المفعول صادرة عن السلطة المختصة، مطابقة للنشاط الفعلي للمسلخ.',
    legalReference: 'المرسوم التنفيذي 06-198 المعدَّل بالمرسوم التنفيذي 22-167 (الترخيص بالمنشآت المصنفة).',
    severity: 'critical',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX6-02',
    axis: 'الرخص والتصاريح',
    category: 'تنظيمية',
    criteria: 'وجود شهادة مطابقة بيطرية سارية صادرة عن المديرية الولائية للخدمات الفلاحية.',
    legalReference: 'القانون 88-08 المتعلق بالطب البيطري + المرسوم التنفيذي 17-140.',
    severity: 'critical',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX7 — الصحة والنظافة المهنية =====
  {
    id: 'ABT-AX7-01',
    axis: 'الصحة والنظافة المهنية',
    category: 'صحة مهنية',
    criteria: 'إجراء الفحوصات الطبية الدورية لجميع العمال المتعاملين مع الأغذية (بما فيها الفحوصات لمرض السل، والتيفوئيد).',
    legalReference: 'المرسوم التنفيذي 93-120 (الفحوصات الطبية الدورية للعمال في المنشآت الغذائية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX7-02',
    axis: 'الصحة والنظافة المهنية',
    category: 'صحة مهنية',
    criteria: 'ارتداء العمال المعدات الواقية المناسبة (خوذة، قفازات عازلة، حذاء واقٍ، مئزر مضاد للقطع) في مناطق الذبح والتقطيع.',
    legalReference: 'المرسوم التنفيذي 17-140 المادة 21 (إلزامية الملابس الواقية للعمال في المنشآت الغذائية) + القانون 88-07 (الوقاية الصحية والأمن في العمل).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX7-03',
    axis: 'الصحة والنظافة المهنية',
    category: 'صحة مهنية',
    criteria: 'وجود مرافق غسل يدين كافية مزودة بصنابير غير يدية، صابون مطهر، ومناشف ورقية في مناطق الإنتاج.',
    legalReference: 'المرسوم التنفيذي 17-140 (اشتراطات نظافة الأيدي في المنشآت الغذائية) + مبادئ GHP.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX8 — HACCP وإدارة الجودة =====
  {
    // Phase 3.2 + 3.3: corrected citation — removed unverified "2020" ministerial order;
    // Décret 17-140 art.5 is the mandatory HACCP basis — W2 fix 2026-08-07
    // L-02: Art. 4 → Art. 5 confirmed as HACCP obligation article (JORADP primary-source,
    //        audit doc SafeInspect_Legal_Checklist_Audit_2026-08-06.md, finding L-02).
    id: 'ABT-AX8-01',
    axis: 'HACCP في المذبح',
    category: 'تنظيمية',
    criteria: 'وجود خطة HACCP مُعدّة ومطبقة خصيصًا لخط الذبح والتقطيع والتبريد، تشمل على الأقل نقاط التحكم الحرجة مثل درجة حرارة التبريد، زمن التبريد، ونظافة المعدات.',
    legalReference: 'المرسوم التنفيذي 17-140 (المادة 5: إلزامية تطبيق إجراءات HACCP في المنشآت الغذائية) + مبادئ CODEX ALIMENTARIUS بشأن HACCP — ملاحظة: رقم القرار الوزاري المحلي المحدد بحاجة تحقق قبل النشر (OQ-7).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX8-02',
    axis: 'الامتثال للقرارات الإدارية',
    category: 'تنظيمية',
    criteria: 'الامتثال للقرارات الإدارية والتوجيهات الصادرة عن مصالح البيطرة والرقابة الغذائية.',
    legalReference: 'المرسوم التنفيذي 17-140 + القانون 88-08 (الطب البيطري).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX9 — الفحص البيطري والصحة الحيوانية =====
  {
    id: 'ABT-AX9-01',
    axis: 'الفحص البيطري',
    category: 'تنظيمية',
    criteria: 'وجود طبيب بيطري حكومي أو معتمد يجري فحص ما قبل الذبح وما بعده، مع ختم رسمي على الذبائح المقبولة.',
    legalReference: 'القانون 88-08 المتعلق بالطب البيطري + المرسوم التنفيذي 17-140.',
    severity: 'critical',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX9-02',
    axis: 'الفحص البيطري',
    category: 'تنظيمية',
    criteria: 'وجود سجل يومي للحيوانات المذبوحة يتضمن: الكمية، النوع، المصدر، نتيجة الفحص البيطري، وعدد الذبائح المرفوضة.',
    legalReference: 'القانون 88-08 + المرسوم التنفيذي 17-140 (اشتراطات التتبعية والتوثيق في المنشآت الغذائية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX10 — الرقابة والتوثيق =====
  // NOTE: ABT-AX10-01 was a duplicate of ABT-AX8-01 (same HACCP criterion, same axis).
  // Removed in Phase 3.3 to eliminate redundancy.
  {
    id: 'ABT-AX10-02',
    axis: 'الرقابة والتوثيق',
    category: 'تنظيمية',
    criteria: 'وجود سجلات درجات الحرارة الدورية (يومية على الأقل) لجميع غرف التبريد والتجميد، مع توقيع المسؤول.',
    legalReference: 'المرسوم 17-140 وأدلة الممارسات الصحية الجيدة (GHP) — توثيق درجات الحرارة كنقطة مراقبة حرجة في إطار HACCP.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX10-03',
    axis: 'الرقابة والتوثيق',
    category: 'تنظيمية',
    criteria: 'وجود برنامج مكتوب للتنظيف والتطهير يحدد المنتجات المستعملة وجداول التنفيذ والأشخاص المسؤولين.',
    legalReference: 'المرسوم التنفيذي 17-140 (برامج التنظيف والتطهير في المؤسسات الغذائية) وأدلة GHP/HACCP.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
