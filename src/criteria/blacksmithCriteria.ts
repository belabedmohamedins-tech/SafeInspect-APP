import { InspectionItem } from '../types';
import { baseCompressedGasCriteria } from './baseCompressedGasCriteria';

export const blacksmithCriteria: InspectionItem[] = [
  // BLS-01-01 removed — fully covered by BGN-01-01 (baseGeneralCriteria)
  {
    id: 'BLS-02-01',
    axis: 'الموقع والتهيئة',
    category: 'بيئية',
    criteria: 'عدم تجاوز مستوى الضجيج المرجعي (لا يتجاوز 70 ديسيبل في المحيط الحضري) لتفادي الإضرار بالجوار.',
    legalReference: 'القانون 03-10 المادة 7 (حماية البيئة وراحة الجوار من الضجيج الصناعي) + المرسوم 06-138 (القيم القصوى لمستوى الضجيج في المحيط الخارجي).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BLS-02-02',
    axis: 'الموقع والتهيئة',
    category: 'بيئية',
    criteria: 'عدم إشغال الطريق العام بالمواد أو الآلات أو أجزاء معدنية.',
    legalReference: 'القانون 03-10.',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BLS-03-01',
    axis: 'النفايات المعدنية',
    category: 'بيئية',
    criteria: 'جمع نفايات المعدن والشظايا في حاويات مخصصة، وتسليمها لمتعامل معتمد أو مرفق جمع معتمد.',
    legalReference: 'القانون 01-19 (تسيير النفايات) + المرسوم 09-19 (اعتماد متعاملي النفايات).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BLS-04-01',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'توفر وسائل وقاية شخصية للعمال: نظارات وقاية، قفازات واقية، سماعات واقية للضجيج، وواقية وجه عند اللحام.',
    legalReference: 'القانون 90-11 المادة 8 (إلزامية توفير وسائل الوقاية الشخصية الملائمة للمخاطر المهنية) + المرسوم التنفيذي 91-05 المادة 6 (اشتراطات تجهيز العمال بوسائل الوقاية الفردية في الأنشطة ذات المخاطر).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  // BLS-04-02 removed — replaced by shared baseCompressedGasCriteria (CGS-01-01, CGS-01-02, CGS-01-03)
  ...baseCompressedGasCriteria,
  {
    id: 'BLS-04-03',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'سلامة التركيبات الكهربائية: أسلاك سليمة، تأريض مناسب للجهاز الكهربائي وأجهزة اللحام، لا توجد أسلاك عارية ظاهرة.',
    legalReference: 'المرسوم 76-35 (اشتراطات حماية العمال الكهربائية) + القانون 90-11.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Phase 6.5: split — extinguisher service-tag check only (exits covered by BGN-08-02)
    id: 'BLS-04-04',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'توفر مطفأة حريق واحدة على الأقل (نوع بودرة ABC أو CO2 مناسب لبيئة اللحام والمعادن) بحالة صالحة، مع التحقق من بطاقة الصيانة السنوية لكل مطفأة (تاريخ آخر فحص وتاريخ انتهاء الصلاحية).',
    legalReference: 'القانون 19-02 المادة 7 (تجهيزات الإطفاء الأولية في المنشآت الصناعية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Phase 9.2: machine-guard criterion for rotating cutting/grinding equipment
    id: 'BLS-04-05',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'توفر حمايات ميكانيكية (واقيات) على أجهزة القطع والجلخ الدوارة (جلخة، مقطع معدني) لمنع التماس مع الأجزاء المتحركة، مع وجود أزرار إيقاف طارئ في متناول المشغّل.',
    legalReference: 'القانون 90-11 المادة 10 (إلزامية تجهيز الآلات بواقيات للأجزاء المتحركة) + المرسوم التنفيذي 93-05 (اشتراطات السلامة التقنية للمعدات والآلات الصناعية ذات الأجزاء الدوارة).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Phase 13 ✅: numericField aligned to NumericFieldSpec (labelAr, warningMax, step)
    // Phase 10.6 revert: "Décret 93-120 Art. 9" was unverified precision — no article-level
    // content was ever retrieved. 85 dB is an international reference (WHO/OSHA); the Algerian
    // regulatory instrument has not been confirmed. Research task R1/R6 remains open.
    id: 'BLS-04-06',
    axis: 'السلامة المهنية',
    category: 'بيئية',
    criteria: 'إجراء قياس مستوى الضجيج في بيئة العمل بصفة دورية (جهاز قياس معتمد)، والتحقق من عدم تجاوز الحد الأقصى المسموح به (85 ديسيبل — مرجع دولي WHO/OSHA معتمد في الممارسة المهنية)؛ وفي حال التجاوز، توثيق الإجراءات التصحيحية المتخذة وتوفير وسائل الوقاية السمعية للعمال.',
    legalReference: 'القانون 90-11 المادة 8 (إلزامية حماية العمال من مخاطر الضجيج المهني) + المرسوم التنفيذي 93-120 (الفحص الطبي الدوري — الفحص السمعي للعمال المعرضين للضجيج). ملاحظة: حد 85 ديسيبل مرجع دولي (WHO/OSHA) — النص التنظيمي الجزائري المحدد للقيمة العددية قيد البحث (R1/R6).',
    severity: 'medium',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      labelAr: 'مستوى الضجيج المقاس (ديسيبل)',
      unit: 'dB',
      warningMax: 85,
      step: 1,
      upperLimit: true,
    },
  },
  {
    // Phase 7.1: periodic air quality measurement for welding fumes and VOC
    // Phase 14.7: 06-141 (wastewater decree) → 06-138 (air emissions decree)
    id: 'BLS-04-07',
    axis: 'الانبعاثات الهوائية',
    category: 'بيئية',
    criteria: 'إجراء قياس دوري لتركيز أبخرة اللحام والمركبات العضوية المتطايرة (VOC) في هواء بيئة العمل (مرة في السنة على الأقل أو عند تغيير المواد المستخدمة) بواسطة مختبر معتمد، والتحقق من عدم تجاوز القيم الحدية المحددة؛ وتوثيق نتائج القياسات وإجراءات التصحيح عند الاقتضاء.',
    legalReference: 'القانون 03-10 المادة 52 (التزام المنشآت المصنفة بمراقبة انبعاثاتها الهوائية) + المرسوم 06-138 (القيم القصوى للانبعاثات الهوائية الصناعية).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BLS-05-01',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'إجراء فحوصات طبية دورية للعمال المعرضين للضجيج المفرط والأبخرة المعدنية.',
    legalReference: 'المرسوم 93-120 (الفحص الطبي الدوري للأنشطة ذات المخاطر المهنية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
