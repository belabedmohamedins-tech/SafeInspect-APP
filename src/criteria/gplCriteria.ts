import { InspectionItem } from '../types';

// Covers: "تركيب GPL/C" â€” Liquefied Petroleum Gas installation & service
export const gplCriteria: InspectionItem[] = ([
  {
    id: 'GPL-01-01',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    // Phase 10.3: grace-period logic â€” DÃ©cret 24-196 creates ~3-year window until June 2027.
    // Phase 10.4: non-substitution â€” 06-198 art. 4: operating license does NOT replace GPL/energy-sector accreditation or fire-safety authorization. Both required simultaneously.
    criteria: 'توفر رخصة استغلال سارية لنشاط تركيب وصيانة أجهزة الغاز البترولي المميع (GPL/C)، صادرة عن الجهة الإدارية المختصة. في حال غياب الرخصة: (أ) المنشأة ضمن فترة التسوية (المرسوم 24-196، حتى يونيو 2027) â†’ مخالفة جسيمة + إعذار فوري؛ (ب) خارج فترة التسوية â†’ مخالفة بالغة الخطورة. تنبيه: رخصة الاستغلال لا تُغني عن الاعتماد المهني ولا عن ترخيص الوقاية من الحريق â€” كل رخصة مستقلة ومتزامنة.',
    // W43 FIX: 21-430 is a 3-article modifier decree (Art.1 purpose, Art.2 amends 83-496, Art.3 publication).
    // "21-430 المادة 3" was phantom. Operative rule: 83-496 Art.7 as amended by 21-430 Art.2 (agrÃ©ment minister des mines) + 83-496 Art.16 (licence distribution).
    legalReference: 'المرسوم التنفيذي 06-198 المتعلق بالتنظيم المطبق على المؤسسات المصنفة لحماية البيئة، كما عُدِّل بالمرسومَيْن 22-167 و24-196 المادة 20 (رخصة الاستغلال للمؤسسات المصنفة) + المادة 5 (دراسات أولية وإجراءات ما قبل الترخيص، ليست رخصة الاستغلال) + المرسوم 83-496 المادة 7 (معدَّلة بالمرسوم التنفيذي 21-430 المادة 2: اشتراط الاعتماد المسبق من الوزير المكلف بالمناجم لمزاولة نشاط تركيب GPL/C) + المرسوم 83-496 المادة 16 (رخصة استغلال منشآت توزيع GPL/C تُسلَّم من الوزير المكلف بالوقود بناءً على شهادة مطابقة من الوزير المكلف بالحماية المدنية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-01-02',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'توفر اعتماد مهني لنشاط تركيب وصيانة تجهيزات الغاز، وتوفر شهادات تكوين مهني في غاز الأكواني لمستخدمي الورشة.',
    // W43 FIX: 21-430 المادة 4 and المادة 5 are phantom (21-430 has only 3 articles).
    // Operative rule: 83-496 Art.7 as amended by 21-430 Art.2 contains the full agrÃ©ment conditions:
    //   â€” attestation de qualification dÃ©livrÃ©e par un organisme agrÃ©Ã© (= شهادة التأهيل المهني)
    //   â€” certificat de scolaritÃ© niveau 4Ã¨me annÃ©e moyenne minimum
    //   â€” local d'au moins 60 mÂ²
    //   â€” liste de matÃ©riel
    legalReference: 'المرسوم 83-496 المادة 7 (معدَّلة بالمرسوم التنفيذي 21-430 المادة 2: اشتراط شهادة التأهيل المهني الصادرة عن هيئة معتمدة، وشهادة مستوى تعليمي لا يقل عن السنة الرابعة متوسط، ووجود محل بمساحة لا تقل عن 60Ù…Â²ØŒ وقائمة بالمعدات اللازمة، كشروط لاعتماد مركب GPL/C) + المرسوم 83-496 المادة 8 (معدَّلة بالمرسوم التنفيذي 21-430 المادة 2: اشتراط الموافقة المسبقة للتجهيزات وشهادة التركيب قبل تسليم ترخيص الاستغلال).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-02-01',
    axis: 'تخزين قوارير الغاز',
    category: 'سلامة',
    // W51 [Ã€ VÃ‰RIFIER]: AIM GPL2 (v14.03.2022) has NO JORADP publication trace as of 2026-08-10.
    // DÃ©cret 21-319 Art.92 delegates rule-making but the arrÃªtÃ© has not been published.
    // Source is an unpublished draft circulating on Scribd â€” not binding law.
    // Technical values retained as professional judgment pending publication.
    // Phase W â€” cited from AIM GPL2 (ArrÃªtÃ© interministÃ©riel, version 14/03/2022)
    // Ventilation: 2 openings â‰¥ 1600 cmÂ² each at floor and ceiling level, unobstructed.
    // Max propane bottle storage (outdoors): 1400 kg. Indoors: per building permit.
    // Separation distances: â‰¤525 kg â†’ 3 m from openings/ignition sources; >525 kg â†’ 5 m.
    criteria: 'تخزين قوارير الغاز البترولي المميع في وضع عمودي في مستودع أو قفص مهوّى طبيعياً بفتحتَي تهوية (واحدة عند الأرض وأخرى عند السقف) لا تقل مساحة كل منهما عن 1600 Ø³Ù…Â² وغير مسدودتين، مع تثبيت القوارير بحوامل أو سلاسل لمنع سقوطها، وعلى بُعد لا يقل عن 3 أمتار من أي مصدر اشتعال أو فتحات بناء (>525 كغ â†’ 5 أمتار)، مع عدم تجاوز الحد الأقصى للتخزين خارج المبنى (1400 كغ من البروبان).',
    legalReference: '[Ã€ VÃ‰RIFIER â€” W51] القرار الوزاري المشترك المتعلق بالقواعد التقنية وشروط السلامة المطبقة على نقاط توزيع وتخزين الغاز البترولي المميع (AIM GPL2، الإصدار 14/03/2022): المادة 5 (التهوية: فتحتان â‰¥1600 Ø³Ù…Â²) + المادة 7 (مسافات الفصل: 3م â‰¤525كغ، 5م >525كغ) + المادة 4 (الحد الأقصى للتخزين الخارجي: 1400 كغ). [تحذير: هذا القرار غير منشور في الجريدة الرسمية (JORADP) حتى تاريخ 2026-08-10 â€” المصدر مسودة متداولة، لا قيمة قانونية ملزمة. الأرقام التقنية محتفظ بها بصفة حكم مهني ريثما يُنشر القرار].',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-02-02',
    axis: 'تخزين قوارير الغاز',
    category: 'سلامة',
    criteria: 'الفصل الواضح بين قوارير الغاز الممتلئة والقوارير الفارغة في مناطق تخزين محددة وموسومة.',
    // W43 FIX: 21-430 المادة 6 is phantom (21-430 has only 3 articles).
    // W51 [Ã€ VÃ‰RIFIER]: AIM GPL2 unpublished â€” see GPL-02-01 note.
    // Operative rule: 83-496 Art.16 (licence exploitation imposed by minister + conformity cert from civil protection)
    // + AIM GPL2 (arrÃªtÃ© conjoint issued per 83-496 Art.19) governs technical organisation of storage areas.
    legalReference: 'المرسوم 83-496 المادة 16 (رخصة استغلال منشآت توزيع GPL/C تشترط المطابقة مع اشتراطات الحماية المدنية، بما فيها تنظيم مناطق التخزين) + [Ã€ VÃ‰RIFIER â€” W51] القرار الوزاري المشترك (AIM GPL2، الإصدار 14/03/2022، الصادر تطبيقاً للمادة 19 من المرسوم 83-496) (تنظيم مخزون قوارير GPL/C: الفصل بين الممتلئة والفارغة وتحديد مناطق التخزين لكل صنف). [تحذير: AIM GPL2 غير منشور في JORADP â€” مسودة غير ملزمة].',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-02-03',
    axis: 'تخزين قوارير الغاز',
    category: 'سلامة',
    // W51 [Ã€ VÃ‰RIFIER]: AIM GPL2 unpublished â€” see GPL-02-01 note.
    // Phase W â€” AIM GPL2: max outdoor storage 1400 kg propane; licence dossier specifies activity-level limit.
    criteria: 'عدم تجاوز الحد الأقصى لكمية الغاز البترولي المميع المخزنة في العراء (1400 كغ من البروبان كحد أقصى مطلق للتخزين خارج المبنى)، وعدم تجاوز الكمية المحددة في رخصة الاستغلال أو دفتر الشروط للنشاط.',
    legalReference: '[Ã€ VÃ‰RIFIER â€” W51] القرار الوزاري المشترك (AIM GPL2، الإصدار 14/03/2022) المادة 4 (الحد الأقصى للتخزين الخارجي 1400 كغ) [تحذير: AIM GPL2 غير منشور في JORADP â€” مسودة غير ملزمة] + المرسوم التنفيذي 06-198 كما عُدِّل بالمرسومَيْن 22-167 و24-196 المادة 14 (دفتر الشروط يحدد الكميات القصوى المرخصة للتخزين).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-03-01',
    axis: 'الوقاية من الحريق والانفجار',
    category: 'سلامة',
    criteria: 'حظر وجود أي مصدر لهب مكشوف (مشعل، دافئة، سيجارة) داخل مستودع الغاز ومناطق العمل المجاورة له، مع لوحات تحذير واضحة.',
    // W43 FIX: 21-430 المادة 10 is phantom. Operative rules:
    //   â€” 83-496 Art.20 (infractions constatÃ©es et rÃ©primÃ©es per legislation in force)
    //   â€” loi 19-02 Art.6 (interdiction sources d'ignition in fire-risk zones)
    //   â€” AIM GPL2 (technical rules per 83-496 Art.19) specifies the ban on naked flames in storage zones.
    // W51 [Ã€ VÃ‰RIFIER]: AIM GPL2 unpublished â€” see GPL-02-01 note.
    legalReference: 'القانون 19-02 المادة 6 (حظر مصادر الاشتعال في مناطق تخزين المواد القابلة للاشتعال واشتراط لافتات التحذير) + [Ã€ VÃ‰RIFIER â€” W51] القرار الوزاري المشترك (AIM GPL2، الإصدار 14/03/2022، الصادر تطبيقاً للمادة 19 من المرسوم 83-496) (الحظر الصريح لأي مصدر حرارة أو اشتعال في محيط تخزين وعمل GPL/C) [تحذير: AIM GPL2 غير منشور في JORADP â€” مسودة غير ملزمة] + المرسوم 83-496 المادة 20 (المخالفات تُعاين وتُلاحق وتُعاقب طبقاً للأحكام التشريعية والتنظيمية النافذة).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-03-02',
    axis: 'الوقاية من الحريق والانفجار',
    category: 'سلامة',
    // W51 [Ã€ VÃ‰RIFIER]: AIM GPL2 unpublished â€” see GPL-02-01 note.
    // Phase W â€” AIM GPL2: extinguishers per storage capacity:
    //   â‰¤ 3500 kg total â†’ 1 Ã— 9 kg dry powder extinguisher minimum
    //   > 3500 kg total â†’ 2 Ã— 9 kg dry powder extinguishers minimum
    // GPL installer workshops: minimum 2 CO2 or dry-powder extinguishers (AIM GPL2 + loi 19-02).
    criteria: 'توفر طفايات حريق من نوع CO2 أو مسحوق جاف، بحالة صالحة للعمل مع بطاقة الصيانة والفحص السنوي. الحد الأدنى لنقاط التوزيع/التخزين (AIM GPL2): طفاية واحدة بوزن 9 كغ على الأقل إذا كانت الكمية المخزنة â‰¤3500 كغ، وطفايتان (9 كغ لكل منهما) إذا تجاوزت 3500 كغ. الحد الأدنى لورشة تركيب GPL/C: طفايتان على الأقل عند مستودع الغاز ومنطقة الاستقبال.',
    // W43 FIX: 21-430 المادة 13 is phantom. Operative rules:
    //   â€” AIM GPL2 (per 83-496 Art.19) specifies extinguisher count per storage capacity
    //   â€” loi 19-02 Art.7 covers first-response fire equipment generally
    legalReference: '[Ã€ VÃ‰RIFIER â€” W51] القرار الوزاري المشترك (AIM GPL2، الإصدار 14/03/2022، الصادر تطبيقاً للمادة 19 من المرسوم 83-496) المادة 9 (مواصفات وعدد طفايات الحريق حسب الكمية المخزنة: 1Ã—9كغ â‰¤3500كغ، 2Ã—9كغ >3500كغ) [تحذير: AIM GPL2 غير منشور في JORADP â€” مسودة غير ملزمة] + القانون 19-02 المادة 7 (تجهيزات الإطفاء الأولية في المنشآت ذات الأخطار).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-03-03',
    axis: 'الوقاية من الحريق والانفجار',
    category: 'سلامة',
    criteria: 'وجود إجراءات مكتوبة للتدخل في حالة تسرب الغاز (إجراءات الإخلاء، قطع التيار الكهربائي، التهوية، الاتصال بالحماية المدنية).',
    legalReference: 'القانون 19-02 المادة 12 (الخطة الداخلية للتدخل والإخلاء في المنشآت ذات الأخطار) + المرسوم التنفيذي 09-335 المادة 5 (إلزامية وضع مخطط التدخل الداخلي في المنشآت الصناعية ذات الأخطار).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-04-01',
    axis: 'أدوات العمل والمعدات',
    category: 'سلامة',
    criteria: 'استعمال أدوات غير مولدة للشرر (مفاتيح ومطارق من مواد غير فلزية أو مطلية) عند العمل في محيط الغاز.',
    // W43 FIX: 21-430 المادة 15 is phantom. Operative rules:
    //   â€” 88-07 Art.10 (general workplace safety tool requirement)
    //   â€” 83-496 Art.8 as amended by 21-430 Art.2 (approbation des Ã©quipements before use â€” implies conformity of tools)
    //   â€” AIM GPL2 (technical rules per 83-496 Art.19) specifies non-spark tool requirement in GPL environments
    // W51 [Ã€ VÃ‰RIFIER]: AIM GPL2 unpublished â€” see GPL-02-01 note.
    legalReference: 'القانون 88-07 المادة 10 (استعمال أدوات العمل المناسبة للبيئة الخطرة) + [Ã€ VÃ‰RIFIER â€” W51] القرار الوزاري المشترك (AIM GPL2، الإصدار 14/03/2022، الصادر تطبيقاً للمادة 19 من المرسوم 83-496) (الاشتراطات التقنية لأدوات العمل في محيط الغاز البترولي المميع: حظر الأدوات المولدة للشرر) [تحذير: AIM GPL2 غير منشور في JORADP â€” مسودة غير ملزمة] + المرسوم 83-496 المادة 8 (معدَّلة: اشتراط مطابقة التجهيزات المستخدمة في نشاط GPL/C للمتطلبات التقنية النافذة).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'GPL-04-02',
    axis: 'أدوات العمل والمعدات',
    category: 'تنظيمية',
    criteria: 'وجود سجل صيانة لأجهزة خفض الضغط والمنظمات وأدوات الكشف، مع إجراء اختبارات تسرب دورية بعد كل عملية تركيب.',
    // W43 FIX: 21-430 المادة 16 is phantom. Operative rules:
    //   â€” 83-496 Art.8 as amended (contrÃ´le et supervision des Ã©preuves rÃ©glementaires)
    //   â€” 83-496 Art.10 (Ã©quipements GPL soumis au contrÃ´le technique du ministre des mines)
    //   â€” 83-496 Art.11 (toute modification doit faire l'objet d'une approbation selon Art.8)
    legalReference: 'المرسوم 83-496 المادة 8 (معدَّلة بالمرسوم التنفيذي 21-430 المادة 2: اشتراط الرقابة والإشراف على الاختبارات التنظيمية لتجهيزات GPL/C قبل تسليم ترخيص الاستغلال) + المرسوم 83-496 المادة 10 (إخضاع تجهيزات GPL المستعملة كوقود للمراقبة التقنية من قِبل الوزير المكلف بالمناجم) + المرسوم 83-496 المادة 11 (كل تعديل أو إصلاح على التجهيزات يجب أن يكون موضوع اعتماد وفق شروط المادة 8).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    // W60 FIX (2026-08-17): Loi 03-10 correct EIE range = Art.15-21.
    // Art.14 = dÃ©finition EIE (not the obligation). Art.15 = root EIE obligation article.
    // Art.16 = contenu EIE. Art.17-20 = enquÃªte publique. Art.21 = condition prÃ©alable au permis.
    // W42 comment was wrong: claimed Art.14 = root obligation â€” corrected by direct read W60.
    id: 'GPL-05-01',
    axis: 'دراسة التأثير البيئي',
    category: 'بيئية',
    criteria: 'توفر دراسة تأثير على البيئة (EIE) أو موجز بيئي معتمد من الوالي المختص للمنشآت المصنفة من الفئة الأولى والثانية، وعدم تجاوز حدود الأخطار المحددة فيها (تسرب الغاز، الانفجار، الحريق)، مع التجديد الدوري لهذه الدراسة عند إجراء توسعات أو تغييرات جوهرية في طاقة التخزين أو نوع النشاط.',
    legalReference: 'القانون 03-10 المواد 15â€“21 (المادة 15: الالتزام الجذري بدراسة EIE للمشاريع ذات التأثير على البيئة؛ المادة 16: محتوى الدراسة؛ المواد 17â€“20: إجراءات التحقيق العام؛ المادة 21: دراسة EIE شرط مسبق للحصول على رخصة البناء أو الاستغلال). المرسوم التنفيذي 07-145 (كيفيات تطبيق دراسة التأثير على البيئة). المرسوم التنفيذي 06-198 كما عُدِّل بالمرسومَيْن 22-167 و24-196 (إدراج نشاط تخزين وتركيب GPL/C في قائمة المنشآت المصنفة ذات التأثير البيئي).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
] as InspectionItem[]).map((item): InspectionItem => {
  const requiresVerification =
    item.legalReference.includes('83-496') ||
    item.legalReference.includes('AIM GPL2') ||
    item.legalReference.includes('القرار الوزاري المشترك');

  return requiresVerification
    ? {
        ...item,
        legalVerificationRequired: true,
        legalVerificationReason:
          'مصدر قانوني غير قابل للتحقق الكامل أو مسودة غير منشورة؛ لا يُستعمل كأساس إلزامي دون الرجوع إلى ملف PDF الرسمي.',
      }
    : item;
});
