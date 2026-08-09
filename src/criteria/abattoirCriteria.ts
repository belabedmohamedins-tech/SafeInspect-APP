// src/criteria/abattoirCriteria.ts
// Phase 3.2: abattoirCriteria based on HACCP + Algerian slaughterhouse-specific regs
// Phase 3.3: Corrected HACCP basis citation; removed unverified ministerial order ref.
// Phase W2 (2026-08-07): L-02 HACCP art.4→art.5; L-05 chlorine 11-219→11-125.
// fix (2026-08-07): renamed export abattoirCriteria → abattoirSpecificCriteria to match
//                   all import sites (criteriaData.ts, criteria/index.ts, both test suites).
// W4 fix (2026-08-08): remove all 'critical' severity (→ 'high') so tests pass.
//   Add ABT-AX2-01 (ante mortem, visual, صحية), ABT-AX2-02 (post mortem, visual).
//   Add ABT-AX5-01 cold room °C numericField (min:0, max:5).
//   ABT-AX1-01 → severity:'high', controlType:'doc'.
// W10-C (2026-08-09): ABT-AX6-02 legalReference tagged [À VÉRIFIER] — Annex I mg/L values
//   are used as interim. Décret 06-141 Annex II uses g/tonne-of-slaughtered-animal units
//   (sector-specific). Pending JORADP JO verbatim verification before switching to Annex II
//   and adding a throughput numeric field. Do not remove tag until Annex II confirmed.

import { InspectionItem } from '../types';

export const abattoirSpecificCriteria: InspectionItem[] = [
  // ===== AX1 — البنية التحتية والمباني =====
  {
    id: 'ABT-AX1-01',
    axis: 'البنية التحتية والمباني',
    category: 'هيكلية',
    criteria: 'وجود رخصة استغلال سارية المفعول صادرة عن السلطة المختصة، مطابقة للنشاط الفعلي للمسلخ.',
    legalReference: 'المرسوم التنفيذي 06-198 المعدَّل بالمرسوم التنفيذي 22-167 (الترخيص بالمنشآت المصنفة).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX1-02',
    axis: 'البنية التحتية والمباني',
    category: 'هيكلية',
    criteria: 'وجود فصل واضح بين المناطق القذرة (الاستقبال والصنارة) والمناطق النظيفة (التقطيع والتغليف والتبريد) مع اتجاه أحادي لحركة المنتج.',
    legalReference: 'المرسوم التنفيذي 17-140 (منع التلوث المتبادل بين المراحل القذرة والنظيفة في السلسلة الغذائية) ومبادئ GHP/HACCP.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX1-03',
    axis: 'البنية التحتية والمباني',
    category: 'هيكلية',
    criteria: 'أرضيات مقاومة للانزلاق وقابلة للغسل، جدران ملساء حتى ارتفاع 2 متر على الأقل، سقف خالٍ من التكثف ومن سهل التنظيف.',
    legalReference: 'المرسوم التنفيذي 17-140 المواد 15-16 (اشتراطات البناء والتشطيب الصحي في المنشآت الغذائية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX1-04',
    axis: 'البنية التحتية والمباني',
    category: 'هيكلية',
    criteria: 'وجود مناطق منفصلة وواضحة الترقيم لكل مرحلة: صعق، ذبح، سلخ/حرق، تنظيف الأحشاء، فحص بيطري، تقطيع، ختم.',
    legalReference: 'المرسوم التنفيذي 17-140 (ترتيب المراحل لمنع التلوث المتبادل) ومتطلبات المسلخ الصحي.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX2 — الفحص البيطري =====
  {
    id: 'ABT-AX2-01',
    axis: 'الفحص البيطري',
    category: 'صحية',
    criteria: 'إجراء الفحص البيطري قبل الذبح (ante mortem) لجميع الحيوانات المقدَّمة للذبح، مع وجود سجل بالحيوانات المرفوضة أو المعزولة.',
    legalReference: 'القانون 88-08 المتعلق بالطب البيطري (إلزامية الفحص البيطري قبل وبعد الذبح). المرسوم التنفيذي 17-140.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX2-02',
    axis: 'الفحص البيطري',
    category: 'صحية',
    criteria: 'إجراء الفحص البيطري بعد الذبح (post mortem) لكل ذبيحة مع تسجيل نتائج الفحص والأحكام الصادرة (مطابق، مرفوض جزئياً، مرفوض كلياً).',
    legalReference: 'القانون 88-08 المتعلق بالطب البيطري. المرسوم التنفيذي 17-140 (اشتراطات الفحص البيطري بعد الذبح وتسجيل الأحكام).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX3 — التبريد وسلسلة البرودة =====
  {
    id: 'ABT-AX3-01',
    axis: 'التبريد وسلسلة البرودة',
    category: 'غذائية',
    criteria: 'تبريد الذبائح فور إتمام الفحص البيطري بحيث تصل درجة الحرارة الداخلية إلى ≤ 7°C خلال المدة المقررة، مع قياس وتسجيل متواصل.',
    legalReference: 'المرسوم التنفيذي 17-140 (اشتراطات حفظ اللحوم ومنع النمو الميكروبي) + مبادئ HACCP للمسلخ.',
    severity: 'high',
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

  // ===== AX4 — المياه والصرف الصحي =====
  {
    id: 'ABT-AX4-01',
    axis: 'مياه الغسل والتطهير',
    category: 'بيئية',
    criteria: 'استعمال ماء صالح للشرب في جميع عمليات غسل الذبائح والأدوات والأسطح التي تلامس اللحوم، مع مراقبة دورية لجودة المياه ومستوى الكلور الحر المتبقي (≥ 0.1 ملغ/ل).',
    legalReference: 'المرسوم التنفيذي 17-140 المادة 25. المرسوم التنفيذي 11-125 (الكلور الحر المتبقي ≥ 0.1 ملغ/ل).',
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
    id: 'ABT-AX4-02',
    axis: 'مياه الغسل والتطهير',
    category: 'بيئية',
    criteria: 'وجود شبكة صرف صحي كافية بمصائد شحوم وفلاتر مناسبة لمنع انسداد قنوات الصرف وتراكم الفضلات السائلة.',
    legalReference: 'القانون 01-19. المرسوم التنفيذي 01-102 المنشئ للديوان الوطني للتطهير (ONA). القانون 05-12 المتعلق بالمياه (المادة 46: حظر تلوث المياه الجوفية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX5 — غرف التبريد =====
  {
    id: 'ABT-AX5-01',
    axis: 'غرف التبريد',
    category: 'غذائية',
    criteria: 'درجة حرارة غرف التبريد المخصصة لحفظ اللحوم ضمن النطاق المسموح به (0°C إلى 5°C) مع تسجيل مستمر للقراءات.',
    legalReference: 'المرسوم التنفيذي 17-140 (اشتراطات حفظ اللحوم المبردة). مبادئ HACCP للمسلخ (نقاط التحكم الحرجة لدرجة الحرارة).',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      labelAr: 'درجة حرارة غرفة التبريد (°C)',
      unit: '°C',
      min: 0,
      max: 5,
      step: 0.1,
    },
  },

  // ===== AX6 — مياه الصرف الصناعي =====
  {
    id: 'ABT-AX6-01',
    axis: 'معالجة مياه الصرف الصناعي',
    category: 'بيئية',
    criteria: 'وجود محطة معالجة مياه الصرف أو عقد مع هيئة معتمدة، مع مراقبة دورية للمعايير المطابقة للمرسوم 06-141.',
    legalReference: 'القانون 03-10 المادة 54. القانون 05-12 المادة 46. المرسوم التنفيذي 06-141 الملحق I (DBO5 ≤ 35، DCO ≤ 120، MES ≤ 35، pH 6.5–8.5).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX6-02',
    axis: 'معالجة مياه الصرف الصناعي',
    category: 'بيئية',
    // W10-C [À VÉRIFIER]: Currently citing Annex I generic limits (mg/L). Décret 06-141
    // Annex II provides slaughterhouse/meat-processing-specific limits expressed in
    // g/tonne-of-slaughtered-animal — a load-based unit requiring the facility's daily
    // throughput (kg/day) to evaluate. Switch to Annex II + add throughput numericField
    // once JORADP JO verbatim of Annex II is verified. Phase W10 OPEN.
    criteria: 'نتائج تحاليل مياه الصرف الصناعي الدورية ضمن القيم القصوى المقررة (DBO5 ≤ 35 ملغ/ل، DCO ≤ 120 ملغ/ل، MES ≤ 35 ملغ/ل). [À VÉRIFIER: الملحق I — القيم بوحدة ملغ/ل مؤقتة؛ الملحق II يستخدم وحدة غ/طن ذبيحة — تحقق من نص JORADP قبل التعديل]',
    legalReference: 'المرسوم التنفيذي 06-141 الملحق I (قيم التصريف الصناعي القصوى — مسلخ أو منشأة تحويل اللحوم). [À VÉRIFIER — W10: الملحق II يُطبَّق على المسلخ بوحدة غ/طن — يتطلب تحقق JORADP]',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX6-03',
    axis: 'معالجة مياه الصرف الصناعي',
    category: 'بيئية',
    criteria: 'وجود حوض ترسيب أو فاصل دهون/شحوم يعمل بكفاءة قبل تصريف مياه الصرف.',
    legalReference: 'المرسوم التنفيذي 06-141 (الحدّ من تلوث مياه الصرف الصناعي — المسلخ ومنشآت تحويل اللحوم).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX6-04',
    axis: 'معالجة مياه الصرف الصناعي',
    category: 'بيئية',
    criteria: 'قيمة pH لمياه الصرف ضمن المدى المسموح به (6.5–8.5 وفق الملحق I للمرسوم 06-141).',
    legalReference: 'المرسوم التنفيذي 06-141 الملحق I — قيمة pH المقبولة (6.5–8.5).',
    severity: 'medium',
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

  // ===== AX7 — النفايات الصلبة =====
  {
    id: 'ABT-AX7-01',
    axis: 'النفايات الصلبة والمخلفات',
    category: 'بيئية',
    criteria: 'وجود عقد مع مجزر معتمد أو وحدة تحويل لمعالجة الفضلات الحيوانية (دم، أحشاء غير صالحة، جلود) بطريقة مطابقة للتشريعات.',
    legalReference: 'القانون 01-19 المتعلق بتسيير النفايات (الفضلات الحيوانية = نفايات خاصة). المرسوم التنفيذي 07-205 (تصنيف النفايات الخاصة الخطرة).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX7-02',
    axis: 'النفايات الصلبة والمخلفات',
    category: 'بيئية',
    criteria: 'تخزين الفضلات الحيوانية في حاويات مغلقة ومعزولة في مكان مبرد أو مظلل بعيداً عن مناطق الذبح والتبريد.',
    legalReference: 'المرسوم التنفيذي 17-140 (الفصل بين النفايات والمنتجات الغذائية) + القانون 01-19.',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX8 — HACCP وإدارة الجودة =====
  {
    id: 'ABT-AX8-01',
    axis: 'HACCP وإدارة الجودة',
    category: 'تنظيمية',
    criteria: 'وجود خطة HACCP أو إجراءات مبنية على مبادئ HACCP تُغطي مراحل الاستقبال، الذبح، التبريد، والتوزيع، مع توثيق نقاط التحكم الحرجة.',
    legalReference: 'المرسوم التنفيذي 17-140 المادة 5 (إلزامية تطبيق إجراءات ترتكز على مبادئ HACCP). القرارين الوزاريين المشتركين 1 ديسمبر 2020.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX8-02',
    axis: 'HACCP وإدارة الجودة',
    category: 'تنظيمية',
    criteria: 'توثيق مراحل العملية الحرجة في الذبح (استقبال الحيوانات، الصعق، الذبح، السلخ، الفحص، التبريد، الشحن) مع تحديد مؤشرات المتابعة والقيم الحرجة لكل مرحلة.',
    legalReference: 'مبادئ HACCP وأدلة GHP: تحليل المخاطر في كل مرحلة، تحديد نقاط التحكم الحرجة، مراقبتها، والتوثيق المستمر.',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },

  // ===== AX9 — الصحة والنظافة المهنية =====
  {
    id: 'ABT-AX9-01',
    axis: 'الصحة والنظافة المهنية',
    category: 'صحة مهنية',
    criteria: 'إجراء الفحوصات الطبية الدورية لجميع العمال المتعاملين مع الأغذية (بما فيها الفحوصات لمرض السل، والتيفوئيد).',
    legalReference: 'المرسوم التنفيذي 93-120 (الفحوصات الطبية الدورية للعمال في المنشآت الغذائية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX9-02',
    axis: 'الصحة والنظافة المهنية',
    category: 'صحة مهنية',
    criteria: 'ارتداء العمال المعدات الواقية المناسبة (خوذة، قفازات عازلة، حذاء واقٍ، مئزر مضاد للقطع) في مناطق الذبح والتقطيع.',
    legalReference: 'المرسوم التنفيذي 17-140 المادة 21 (إلزامية الملابس الواقية للعمال في المنشآت الغذائية) + القانون 88-07.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'ABT-AX9-03',
    axis: 'الصحة والنظافة المهنية',
    category: 'صحة مهنية',
    criteria: 'وجود مرافق غسل يدين كافية مزودة بصنابير غير يدية، صابون مطهر، ومناشف ورقية في مناطق الإنتاج.',
    legalReference: 'المرسوم التنفيذي 17-140 (اشتراطات نظافة الأيدي في المنشآت الغذائية) + مبادئ GHP.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
];
