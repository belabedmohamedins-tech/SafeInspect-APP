import { InspectionItem } from '../types';

export const printingCriteria: InspectionItem[] = [
  // PRT-01-01 removed — pure restate of BGN-01-01 (operating license, generic). No unique content added.
  {
    id: 'PRT-01-02',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'توفر سجل تجاري أو وثيقة نشاط سارية المفعول.',
    legalReference: 'القانون 04-08 (الشروط العامة لممارسة الأنشطة التجارية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'PRT-02-01',
    axis: 'التهوية ومنع التلوث الهوائي',
    category: 'بيئية',
    criteria: 'توفر تهوية ميكانيكية فعالة في منطقة الطباعة والتجفيف للحد من تراكم بخار الأحبار والمذيبات.',
    legalReference: 'القانون 03-10 + المرسوم 06-138 (ينظّم انبعاث الغاز والدخان والبخار والجزيئات في الجو من المنشآت الصناعية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'PRT-02-02',
    axis: 'التهوية ومنع التلوث الهوائي',
    category: 'بيئية',
    criteria: 'عدم إطلاق بخار المذيبات والأحبار مباشرة في الهواء الخارجي دون معالجة، والتحقق من وجود أنظمة تنقية أو امتصاص حسب نوع المذيب.',
    legalReference: 'المرسوم 06-138 (التزامات الحد من الانبعاثات الهوائية الصناعية عند المصدر).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Phase 7.1: periodic ambient VOC measurement inside the printing workshop.
    // W82 note: Loi 90-11 Art.7 (general right to health protection) removed — too generic for this
    // criterion. Replaced with Décret 91-05 Art.9 (employer obligation to maintain safe working
    // atmosphere) + Décret 06-138 Art.4 (monitoring obligation for industrial air emissions).
    id: 'PRT-02-03',
    axis: 'التهوية ومنع التلوث الهوائي',
    category: 'بيئية',
    criteria: 'إجراء قياس دوري لتركيز المركبات العضوية المتطايرة (VOC) في هواء بيئة العمل داخل ورشة الطباعة (مرة في السنة على الأقل) للتحقق من عدم تجاوز الحدود المهنية المسموح بها، وتوثيق النتائج.',
    legalReference: 'المرسوم 91-05 المادة 9 (التزام صاحب العمل بضمان سلامة جو العمل) + المرسوم 06-138 المادة 4 (رصد جودة الهواء في بيئة العمل الصناعية).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // Phase A: VOC stack-emission measurement — Décret 06-138 Annex I general limit 150 mg/Nm³.
    id: 'PRT-07-01',
    axis: 'الانبعاثات الهوائية',
    category: 'بيئية',
    criteria: 'إجراء قياس دوري لتركيز المركبات العضوية المتطايرة (VOC) في الانبعاثات الهوائية عند نقطة المصب (مرة في السنة على الأقل أو عند تغيير نوع الحبر أو المذيب) بواسطة مختبر معتمد، والتحقق من عدم تجاوز القيمة الحدية؛ وتوثيق نتائج القياسات والإجراءات التصحيحية عند الاقتضاء.',
    legalReference: 'القانون 03-10 المادة 52 + المرسوم 06-138 الملحق I (VOC ≤ 150 ملغ/م³ن — الحد العام للمنشآت الصناعية).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'mg/Nm³',
      labelAr: 'تركيز VOC عند نقطة المصب',
      max: 150,
      warningMax: 130,
      step: 1,
      upperLimit: true,
    },
  },
  {
    // Phase A: total dust stack-emission measurement — Décret 06-138 Annex I general limit 50 mg/Nm³.
    id: 'PRT-07-02',
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
    // Phase A: records retention ≥ 3 years — Décret 06-138 Art. 11
    id: 'PRT-07-03',
    axis: 'الانبعاثات الهوائية',
    category: 'تنظيمية',
    criteria: 'الاحتفاظ بسجلات نتائج القياسات الدورية للانبعاثات الهوائية (VOC والغبار الكلي) مدة لا تقل عن 3 سنوات وإتاحتها للمفتش عند الطلب.',
    legalReference: 'المرسوم 06-138 المادة 11 (إلزامية الاحتفاظ بسجلات القياسات الدورية للانبعاثات الهوائية لمدة ثلاث سنوات على الأقل).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'PRT-03-01',
    axis: 'تسيير النفايات الخطرة',
    category: 'بيئية',
    criteria: 'جمع بقايا الأحبار والمذيبات المستعملة في حاويات مغلقة وموسومة وتسليمها لمتعامل معتمد.',
    legalReference: 'القانون 01-19 + المرسوم 09-19.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'PRT-03-02',
    axis: 'تسيير النفايات الخطرة',
    category: 'بيئية',
    criteria: 'التعاقد مع مؤسسة معتمدة لجمع ونقل النفايات الخطرة الناتجة عن نشاط الطباعة.',
    legalReference: 'المرسوم 05-315 + المرسوم 09-19.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // W82: FIXED — replaced wrong Loi 90-11 Art.8 + Décret 91-05 Art.6 (general provisions,
    // unrelated to PPE obligation) with correct Décret 91-05 Arts.16-17.
    // Décret 91-05 Art.16: PPE must be provided when collective protection is impossible.
    // Décret 91-05 Art.17: special PPE for workers exposed to chemical/solvent hazards.
    id: 'PRT-05-01',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'توفر وسائل وقاية شخصية ملائمة: كمامات، نظارات وقاية، قفازات مقاومة للمذيبات لعمال الطباعة.',
    legalReference: 'المرسوم 91-05 المواد 16-17 (توفير وسائل الوقاية الشخصية عند استحالة الحماية الجماعية وتجهيز العمال المعرّضين للمذيبات الكيميائية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Renamed PRT-04-02 → PRT-05-02; Loi 90-11 Art.6 retained — general fire safety obligation,
    // not targeted by Finding 3 (which concerns PPE/machine-guard misuse of Loi 90-11).
    id: 'PRT-05-02',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'توفر مطفأة حريق واحدة على الأقل بحالة صالحة مع التحقق من بطاقة الصيانة السنوية (تاريخ آخر فحص وتاريخ انتهاء الصلاحية)، ومخارج طوارئ واضحة التسمية خالية من العوائق.',
    legalReference: 'القانون 90-11 المادة 6 (الالتزام العام بالوقاية من الحوادث) + القانون 19-02 (الوقاية من الحريق في المحال التي تحتوي على مواد كيميائية قابلة للاشتعال).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
];
