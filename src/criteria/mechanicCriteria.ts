import { InspectionItem } from '../types';

export const mechanicWorkshopCriteria: InspectionItem[] = [
  // MCH-29-01 removed — fully covered by BGN-01-01 (baseGeneralCriteria)
  {
    id: 'MCH-29-02',
    axis: 'الموقع والتهيئة',
    category: 'بيئية',
    criteria: 'عدم تسبب الورشة في إزعاج مفرط للجوار (ضجيج، تراكم سيارات في الطريق العام، انسكاب زيوت على الرصيف أو الطريق).',
    legalReference: 'القانون 03-10 الخاص بحماية البيئة والإطار المعيشي، الذي يلزم بتفادي الإضرار براحة الجوار والتلوث المرئي والضجيج.',
    severity: 'medium',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MCH-29-03',
    axis: 'النفايات الخطرة',
    category: 'بيئية',
    criteria: 'جمع الزيوت المستعملة وزيوت المحركات في حاويات محكمة ومانعة للتسرب وعدم طرحها في شبكة الصرف أو التربة أو المجرى العمومي.',
    // W51 (2026-08-18): added Décret 09-19 Art.2+Art.6 — same pattern as MCH-29-09
    // (tyre waste). Oil collection must go to an approved operator; the approval
    // framework is Décret 09-19. Previously missing — closes G9 (Claude audit 2026-08-08).
    legalReference: 'القانون 01-19 المتعلق بتسيير النفايات + المرسوم التنفيذي 93-162 المتعلق باسترجاع الزيوت المستعملة ومعالجتها + المرسوم التنفيذي 09-19 المادة 2 (تعريف نطاق اعتماد متعاملي جمع ونقل النفايات الخاصة الخطرة) + المادة 6 (شروط منح الاعتماد للمتعامل الجامع والناقل — وجوب التعاقد مع متعامل حامل لاعتماد ساري المفعول).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MCH-29-04',
    axis: 'النفايات الخطرة',
    category: 'بيئية',
    criteria: 'التعاقد مع مؤسسة معتمدة لجمع ونقل ومعالجة الزيوت المستعملة والفلاتر الملوثة وبقايا السوائل التقنية (فرامل، تبريد...).',
    // W51 (2026-08-18): added Décret 09-19 Art.2+Art.6 — same pattern as MCH-29-09.
    // MCH-29-04 is the "contract" criterion; the approval framework (Décret 09-19)
    // is the legal basis that makes the approval requirement mandatory.
    // Previously only Loi 01-19 + Décret 05-315 — closes G9 (Claude audit 2026-08-08).
    legalReference: 'القانون 01-19 + المرسوم 05-315 الذي يحدد كيفيات التصريح بالنفايات الخاصة الخطرة ووجوب التعامل مع متعاملين معتمدين + المرسوم التنفيذي 09-19 المادة 2 (نطاق الاعتماد المطلوب لمتعاملي الجمع والنقل والمعالجة) + المادة 6 (شروط الحصول على الاعتماد — يُلزم صاحب النشاط بالتحقق من سريان اعتماد المتعامل المتعاقد معه).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MCH-29-05',
    axis: 'المياه والصرف',
    category: 'بيئية',
    criteria: 'عدم طرح المياه الملوثة بالزيوت والشحوم مباشرة في شبكة الصرف الصحي أو الأمطار دون وجود فاصل زيوت أو نظام تجميع ومعالجة.',
    legalReference: 'القانون 03-10 بخصوص حماية المياه من التلوث والمرسوم 06-141 المتعلق بالقيم القصوى للتصريف في شبكات الصرف الصحي.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MCH-29-06',
    axis: 'النظافة والسلامة',
    category: 'سلامة',
    criteria: 'توفر وسائل وقاية شخصية للعمال (قفازات، نظارات، ملابس واقية).',
    legalReference: 'القانون 88-07 المادة 6 (إلزامية توفير الملابس الخاصة وأجهزة الحماية الفردية الفعّالة بحسب طبيعة النشاط والمخاطر) + المرسوم التنفيذي 91-05 المادة 62 بند 2 (الفحص الدوري لوسائل الحماية الجماعية والفردية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MCH-29-07',
    axis: 'النظافة والسلامة',
    category: 'سلامة',
    criteria: 'توفر مطفأة حريق بحالة صالحة مع التحقق من بطاقة الصيانة السنوية (تاريخ آخر فحص وتاريخ انتهاء الصلاحية)، ومخارج طوارئ خالية من العوائق وواضحة التسمية.',
    legalReference: 'القانون 19-02 (الوقاية من الحريق).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // T0.8: brake fluid and hydraulic fluid handling
    // W88 (2026-08-18): Art.28 (illegal export/repatriation) was WRONG for this criterion.
    // Correct: Art.18 = generators of hazardous waste must declare nature, quantity,
    // and characteristics to the minister + provide periodic treatment reports.
    // Art.28 = repatriation of illegally exported waste — completely unrelated to on-site
    // brake/hydraulic fluid collection and handover to an approved operator.
    id: 'MCH-29-08',
    axis: 'النفايات الخطرة',
    category: 'بيئية',
    criteria: 'جمع سوائل الفرامل والسائل الهيدروليكية المستبدلة في حاويات محكمة وموسومة (مواد خطرة)، وعدم خلطها مع الزيوت المستعملة، مع التسليم لمتعامل معتمد وحفظ وثيقة التسليم.',
    legalReference: 'القانون 01-19 المادة 18 (إلزام منتج النفايات الخاصة الخطرة بالإفصاح عن طبيعتها وكميتها وخصائصها وإجراءات معالجتها) + المرسوم 05-315 (بورديرو نقل النفايات الخطرة).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // T0.8: end-of-life tyre disposal
    id: 'MCH-29-09',
    axis: 'النفايات الخطرة',
    category: 'بيئية',
    criteria: 'عدم تراكم الإطارات المستهلكة (منتهية الصلاحية) داخل أو خارج الورشة، وتسليمها لمتعامل معتمد أو نقطة تجميع معتمدة مع حفظ وثيقة التسليم، وحظر حرقها في الهواء الطلق بكل الأحوال.',
    legalReference: 'القانون 01-19 المادة 29 (حظر حرق النفايات غير الخطرة في الهواء الطلق) + المرسوم 09-19 (اعتماد متعاملي جمع النفايات).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // T0.8: lead-acid battery disposal (car batteries)
    id: 'MCH-29-10',
    axis: 'النفايات الخطرة',
    category: 'بيئية',
    criteria: 'تخزين بطاريات السيارات المستبدلة (رصاص-حمض) على أرضية محمية ضد التسرب داخل المستودع، وعدم إفراغ حمض البطارية في شبكة الصرف، مع التسليم لمتعامل معتمد وحفظ بورديرو النقل.',
    legalReference: 'القانون 01-19 + المرسوم 05-315 (بورديرو نقل النفايات الخطرة لبطاريات الرصاص-حمض).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
