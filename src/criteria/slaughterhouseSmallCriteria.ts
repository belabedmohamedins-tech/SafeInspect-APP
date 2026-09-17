// src/criteria/slaughterhouseSmallCriteria.ts
    // W90 (2026-08-23): SLH-08-01 EIE citation corrected against Loi 03-10.
    //   Art.14 concerns the five-year national environmental-action plan.
    //   EIE begins at Art.15; Art.16 sets study content; Arts.18â€“23 address
    //   classified installations, authorization, prerequisites, and control.
//   DÃ©cret 04-82 Arts.6 (SLH-05-02) + Arts.9 (SLH-05-03) confirmed correct by direct read.
// F7-fix (2026-08-17): DÃ©cret 06-141 Annexe II Â§1a confirmed â€” switched Annexe I mg/L values
//   to sector-specific Annexe II g/t (abattoirs et transformation de la viande).
//   SLH-05-04: critÃ¨re + legalReference updated to g/t Annexe II values.
//   SLH-05-04B: DCO limit 120 mg/L â†’ 800 g/t, numericField unit corrected.
//   SLH-05-04C: MES 35 mg/L â†’ matiÃ¨re dÃ©cantable 200 g/t, label + numericField corrected.
//   SLH-05-04D: pH min 6.5 â†’ 5.5 per Annexe II abattoirs (5.5â€“8.5).
// W61 (2026-08-17): SLH-05-02 Art.6 â†’ Art.10+11; SLH-05-03 Art.9 â†’ Art.10+11.
//   Direct read of DÃ©cret 04-82 (18 arts, legal_refs/ 2026-08-17):
//   Art.6 = Ã©quipement/matÃ©riaux des Ã©levages (bien-Ãªtre animal) â€” NOT ante mortem inspection.
//   Art.9 = renvoi Ã  arrÃªtÃ© ministÃ©riel pour prÃ©ciser prescriptions physiques â€” NOT post mortem.
//   Art.10 = visite de lâ€™infrastructure par lâ€™autoritÃ© vÃ©tÃ©rinaire + dÃ©livrance agrÃ©ment sanitaire.
//   Art.11 = registre cotÃ©/paraphÃ© + rapports de visite dâ€™inspection (obligation de suivi continu).
import { InspectionItem } from '../types';

export const slaughterhouseSmallCriteria: InspectionItem[] = [
  {
    id: 'SLH-05-01',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'توفر تصريح استغلال أو رخصة سارية لنشاط مذبحة دواجن بسعة أقل من 500 كغ/يوم، مع توافق الطاقة اليومية ونوع الذبائح مع ما هو مصرح به.',
    legalReference: 'المادتان 20 وظ 8 من المرسوم التنفيذي 06-198 المعدَّل بالمرسومين 22-167 و٢٤-196 المتعلق بالتنظيم المطبق على المؤسسات المصنفة (نظام الترخيص والتصريح حسب درجة الخطر وحجم النشاط). المادة 20: رخصة الاستغلال للمؤسسات المصنفة؛ المادة 5: دراسات أولية وإجراءات ما قبل الترخيص (ليست رخصة الاستغلال).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-05-02',
    axis: 'الذبح والفحص الصحي',
    category: 'صحية',
    criteria: 'تنظيم فحص صحي قبل الذبح للدواجن (ante mortem) للتأكد من خلوّها من الأمراض الظاهرة واستبعاد الحالات المشتبه فيها قبل الدخول إلى غرفة الذبح.',
    // W61 (2026-08-17): CORRECTED â€” Art.6 (conception/Ã©quipement Ã©levages) WRONG for ante mortem.
    // Art.10 = visite de lâ€™autoritÃ© vÃ©tÃ©rinaire avant exploitation + dÃ©livrance agrÃ©ment sanitaire.
    // Art.11 = registre cotÃ©/paraphÃ© + rapports de visite dâ€™inspection (suivi continu).
    legalReference: 'المادة 10 من المرسوم التنفيذي 04-82 (تفتيش البنية والتجهيزات من قبل السلطة البيطرية وإصدار الاعتماد الصحي قبل الاستغلال) + المادة 11 (سجل مؤشر ومبصوم من السلطة البيطرية يتضمّن جميع المعلومات الزووتكنية والصحية وتقارير زيارات التفتيش).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-05-03',
    axis: 'الذبح والفحص الصحي',
    category: 'صحية',
    criteria: 'إجراء فحص بعدي للذبائح (post mortem) للتأكد من سلامة الذبائح واستبعاد الأجزاء أو الذبائح غير الصالحة للاستهلاك وتوجيهها لمسار نفايات خاص.',
    // W61 (2026-08-17): CORRECTED â€” Art.9 (renvoi arrÃªtÃ© ministÃ©riel prescriptions physiques) WRONG.
    // Art.10 = agrÃ©ment sanitaire aprÃ¨s visite vÃ©tÃ©rinaire (obligation de contrÃ´le avant exploitation).
    // Art.11 = registre cotÃ©/paraphÃ© + rapports de visite (suivi continu des conditions sanitaires).
    // DÃ©cret 17-140 Art.3 retained â€” covers food-safety requirements for animal-origin products.
    legalReference: 'المادة 10 من المرسوم 04-82 (الاعتماد الصحي وإلزامية تفتيش السلطة البيطرية) + المادة 11 (سجل مؤشر ومبصوم يتضمّن جميع تقارير زيارات التفتيش ونتائجها) + المادة 3 من المرسوم 17-140 المؤرخ في 27 مارس 2017 (اشتراطات سلامة المنتجات الغذائية ذات الأصل الحيواني).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-05-04',
    axis: 'مخلفات الذبح',
    category: 'بيئية',
    // F7-fix (2026-08-17): switched from Annexe I generic mg/L to Annexe II Â§1a g/t.
    // DÃ©cret 06-141 Annexe II Â§1a (Abattoirs et transformation de la viande):
    // DBO5 â‰¤ 250 g/t | DCO â‰¤ 800 g/t | MatiÃ¨re dÃ©cantable â‰¤ 200 g/t
    // Volume â‰¤ 6 mÂ³/t carcasse | pH 5.5â€“8.5
    // numericField measures volume (mÂ³/t) as the primary on-site verifiable indicator.
    criteria: 'فصل الدم والأحشاء والمحتويات الصلبة عن مياه الغسل قبل وصولها إلى الحفرة المتعفنة أو شبكة الصرف. عند التصريف في الشبكة العمومية أو الوسط الطبيعي: قياس المعاملات عند نقطة التصريف والتحقق من عدم تجاوز القيم الخاصة بالمسالخ (الملحق II للمرسوم 06-141): DBO5 â‰¤ 250 غ/ط، DCO â‰¤ 800 غ/ط، مادة قابلة للترسيب â‰¤ 200 غ/ط، حجم الصرف â‰¤ 6 Ù…Â³/طن ذبيحة، pH بين 5.5 و٨.٥.',
    legalReference: 'المرسوم التنفيذي 06-141 الملحق II Â§1أ (قيم خاصة بالمسالخ ومنشآت تحويل اللحوم â€” وحدة: غ/طن ذبيحة). القانون 03-10 المادة 12. القانون 01-19 المادة 12 (منع صرف مخلفات الذبح مباشرة دون معالجة).',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'mÂ³/t',
      labelAr: 'حجم مياه الصرف (Ù…Â³/طن ذبيحة)',
      max: 6,
      warningMax: 5,
      step: 0.1,
      upperLimit: true,
    },
  },
  {
    id: 'SLH-05-04B',
    axis: 'مخلفات الذبح',
    category: 'بيئية',
    // F7-fix (2026-08-17): DCO limit corrected â€” Annexe II Â§1a abattoirs = 800 g/t (not 120 mg/L).
    criteria: 'قياس الطلب الكيميائي للأكسجين (DCO) عند نقطة التصريف النهائي والتحقق من عدم تجاوز 800 غ/طن ذبيحة (وفق الملحق II للمرسوم 06-141 الخاص بالمسالخ).',
    legalReference: 'المرسوم التنفيذي 06-141 الملحق II Â§1أ â€” القيمة القصوى لـ DCO للمسالخ: 800 غ/طن ذبيحة.',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'g/t',
      labelAr: 'DCO عند نقطة التصريف (غ/طن ذبيحة)',
      max: 800,
      warningMax: 650,
      step: 10,
      upperLimit: true,
    },
  },
  {
    id: 'SLH-05-04C',
    axis: 'مخلفات الذبح',
    category: 'بيئية',
    // F7-fix (2026-08-17): parameter corrected â€” Annexe II Â§1a abattoirs has no MES row;
    // the correct parameter is "MatiÃ¨re dÃ©cantable" â‰¤ 200 g/t (not MES â‰¤ 35 mg/L).
    criteria: 'قياس المواد القابلة للترسيب عند نقطة التصريف النهائي والتحقق من عدم تجاوز 200 غ/طن ذبيحة (وفق الملحق II للمرسوم 06-141 الخاص بالمسالخ â€” المعيار: مادة قابلة للترسيب، لا MES).',
    legalReference: 'المرسوم التنفيذي 06-141 الملحق II Â§1أ â€” القيمة القصوى للمادة القابلة للترسيب للمسالخ: 200 غ/طن ذبيحة.',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'g/t',
      labelAr: 'المادة القابلة للترسيب (غ/طن ذبيحة)',
      max: 200,
      warningMax: 160,
      step: 5,
      upperLimit: true,
    },
  },
  {
    id: 'SLH-05-04D',
    axis: 'مخلفات الذبح',
    category: 'بيئية',
    // F7-fix (2026-08-17): pH min corrected 6.5 â†’ 5.5 per Annexe II Â§1a abattoirs.
    criteria: 'قياس درجة الحموضة (pH) لمياه الصرف عند نقطة التصريف النهائي والتحقق من بقائها في النطاق المسموح به للمسالخ (5.5â€“8.5 وفق الملحق II للمرسوم 06-141).',
    legalReference: 'المرسوم التنفيذي 06-141 الملحق II Â§1أ (المسالخ) â€” نطاق pH المسموح: 5.5â€“8.5.',
    severity: 'high',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'pH',
      labelAr: 'درجة الحموضة عند نقطة التصريف',
      min: 5.5,
      max: 8.5,
      warningMin: 6.0,
      warningMax: 8.2,
      step: 0.1,
      upperLimit: false,
    },
  },
  {
    id: 'SLH-05-05',
    axis: 'مخلفات الذبح',
    category: 'بيئية',
    criteria: 'تخزين مخلفات الذبح الصلبة غير الصالحة للاستهلاك (أحشاء مرفوضة، أجزاء مصادرة) في حاويات مغلقة، والتعاقد مع متعامل معتمد لجمعها ونقلها ومعالجتها.',
    legalReference: 'المادة 17 من القانون 01-19 المتعلق بتسيير النفايات، المادة 3 من المرسوم 06-104 المؤرخ في 28 فبراير 2006 (قائمة النفايات الخاصة الخطرة)، والمادة 2 من المرسوم 05-315 المحدد لكيفيات التصريح بالنفايات الخاصة.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-05-06',
    axis: 'مياه الغسل والتطهير',
    category: 'صحية',
    criteria: 'استعمال ماء صالح للشرب في غسل الدواجن والأدوات والأسطح، مع احترام الحد الأدنى للكلور الحر المتبقي عند استعمال ماء الشبكة.',
    legalReference: 'المادة 25 من المرسوم 17-140 المؤرخ في 27 مارس 2017 بخصوص الماء الصالح للشرب في المنشآت الغذائية، والمادة 4 من المرسوم 11-125 المعدل بالمرسوم 14-96 الذي يحدد الحد الأدنى للكلور الحر المتبقي بـ 0.1 ملغ/ل.',
    severity: 'high',
    controlType: 'test',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-05-07',
    axis: 'غرف التبريد',
    category: 'صحية',
    criteria: 'توفر ثلاجات أو غرف تبريد ملائمة لحفظ لحوم الدواجن بدرجة حرارة مناسبة (عادة بين 0 ÙˆÙ¥Â°Ù…) حسب نوع المنتجات، مع ميزان حرارة داخلي.',
    legalReference: 'المادة 20 من المرسوم 17-140 التي تنص على وجوب توفير تجهيزات تبريد كافية مزودة بأجهزة قياس الحرارة في المنشآت الغذائية التي تتعامل مع منتجات حيوانية.',
    severity: 'high',
    controlType: 'test',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-05-08',
    axis: 'نظافة قاعة الذبح',
    category: 'نظافة',
    criteria: 'أرضيات قاعة الذبح مائلة نحو قنوات صرف مزودة بسيفونات، مع عدم وجود برك دائمة من الدم أو المياه، وبرنامج تنظيف وتطهير بعد دورات الذبح.',
    legalReference: 'المادتان 15 و٢٧ من المرسوم 17-140 (منحدرات الأرضيات وقنوات الصرف في المنشآت الغذائية)، والمادة 12 من القانون 03-10 بخصوص منع تلوث المياه والأوساط الداخلية.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-05-09',
    axis: 'صحة وسلوك العمال',
    category: 'صحية',
    criteria: 'ارتداء عمال المذبحة لملابس عمل نظيفة ومناسبة (مآزر، أغطية رأس، أحذية خاصة) مع منع الأكل والشرب والتدخين في منطقة الذبح.',
    legalReference: 'المادتان 35 و٣٦ من المرسوم التنفيذي 17-140 المتعلق بشروط النظافة والنظافة الصحية للمؤسسات الغذائية (ملابس العمل، سلوك المستخدمين، المنع الصريح للتدخين).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  // SLH-05-10 removed â€” pest control covered by BGN-07-01/02/04 (S9 pest dedup)
  {
    id: 'SLH-06-01',
    axis: 'نظام HACCP وسلامة الغذاء',
    category: 'صحية',
    criteria: 'تطبيق مبادئ HACCP أو نظام مكافئ: تحديد نقاط التحكم الحرجة (CCP) في خط الذبح (دم، سلخ، تحرير الأحشاء)، مع سجلات مراقبة موثقة لكل CCP.',
    legalReference: 'المادة 5 من المرسوم التنفيذي 17-140 المؤرخ في 27 مارس 2017 التي تُلزم مشغلي المنشآت الغذائية بتطبيق نظام تحليل الأخطار ونقاط التحكم الحرجة (HACCP) أو إجراءات مكافئة مستندة إلى مبادئه.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-07-01',
    axis: 'النفايات البيطرية والطبية',
    category: 'بيئية',
    criteria: 'الفصل الميداني للنفايات البيطرية الخطرة الناتجة عن فحص الدواجن وعمليات الذبح وفق نظام التدفقات الثلاث: الأخضر (نفايات عادية)، الأصفر (نفايات خاصة غير خطرة)، الأحمر (نفايات معدية/حادة). وجود حاويات مُصنَّفة لكل تدفق، مع عقد مع متعامل معتمد لجمع النفايات الخطرة ومعالجتها، والاحتفاظ ببيانات النقل.',
    legalReference: 'المرسوم التنفيذي 03-478 (9 ديسمبر 2003) المتعلق بتسيير النفايات الطبية والبيطرية الخاصة الخطرة (نظام التدفقات الثلاث، إلزامية الفصل والتوثيق).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'SLH-08-01',
    axis: 'دراسة التأثير البيئي',
    category: 'بيئية',
    criteria: 'توفر دراسة تأثير على البيئة (EIE) أو موجز بيئي معتمد من الوالي المختص للمنشآت المصنفة من الفئة الأولى والثانية، وعدم تجاوز حدود التلوث المحددة فيها (DBO5، روائح، ضجيج، مخلفات ذبح)، مع التجديد الدوري لهذه الدراسة عند إجراء توسعات أو تغييرات جوهرية في الطاقة التذبيحية.',
    // W90 (2026-08-23): corrected from the false Art.14â€“21 range against Loi 03-10.
    // Session 12 (2026-08-17): RETAINED â€” not a duplicate of BGN-10-01.
    // Adds abattoir-specific scope: named pollutant thresholds, renewal-at-extension trigger,
    // DÃ©cret 06-198 ref tying EIE to classified-establishment permit regime.
    legalReference: 'القانون 03-10 المواد 15â€“16 و18â€“23 (المادة 15: الإخضاع المسبق لدراسة التأثير أو موجز التأثير؛ المادة 16: محتوى الدراسة؛ المواد 18â€“23: المنشآت المصنفة وأنظمة الترخيص والدراسة السابقة والرقابة). المرسوم التنفيذي 07-145 (كيفيات تطبيق دراسة التأثير على البيئة). المرسوم التنفيذي 06-198 كما عُدِّل بالمرسومَيْن 22-167 و٢٤-196 (إدراج مذابح الدواجن في قائمة المنشآت المصنفة ذات التأثير البيئي).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
