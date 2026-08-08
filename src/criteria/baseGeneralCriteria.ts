// src/baseGeneralCriteria.ts
// W8 (2026-08-08): BGN-03-01 legalReference corrected.
//   Previous ref: Décret 88-164 — unfindable in JORADP, likely superseded.
//   Correct instrument: Décret exécutif 11-125 du 22/03/2011 fixant les
//   caractéristiques et les normes techniques auxquelles doivent répondre
//   les eaux destinées à la consommation humaine (JORADP-confirmed).
// W18 (2026-08-08): BGN-08-01 + BGN-08-02 legalReference updated.
//   BGN-08-01: added Art. 5 (fire-fighting equipment technical requirements).
//   BGN-08-02: added Art. 13 (evacuation routes and emergency exits).
//   Both article numbers confirmed correct from AUDIT_STATE.md Session 5.
// W19 (2026-08-08): 8 wrong article citations corrected after direct source-read
//   of legal_refs/loi-03-10-protection-environnement.md and loi-01-19-gestion-dechets.md.
//   BGN-01-02: Art.65→Art.62 + [À VÉRIFIER]
//   BGN-01-03: Art.71+73→[À VÉRIFIER] (Art.82/84 candidates, unconfirmed)
//   BGN-02-03: Art.45(biodiversity)→Art.41+44(soil)
//   BGN-03-02/03, BGN-04-01/02/04: Art.14(national plan)→Art.8+11(generator obligations)
//   BGN-04-05: Art.29(municipal plan)→[À VÉRIFIER] (open-air burning source not found in 01-19)
//   BGN-04-08: Art.28(export return)→Art.21(declaration obligation)
//   BGN-07-05: Art.51(coastal)→Art.56+58(chemical/pesticide control)
//   BGN-09-01: Art.27(public info access)→Art.54(noise prohibition)
import { InspectionItem } from '../types';

export const baseGeneralCriteria: InspectionItem[] = [
  // المحور 1: هوية المنشأة والوثائق (عام)
  {
    id: 'BGN-01-01',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    // Phase 10.3: grace-period logic — Décret 24-196 (juin 2024) creates a 3-year regularization
    //   window ≈ until June 2027. "No license but within grace period" → major finding, severity high.
    //   "No license, grace period expired or inapplicable" → critical finding, note accordingly.
    // Phase 10.4: non-substitution note — Décret 06-198 art. 4 confirms operating license does NOT
    //   replace fire-safety authorization, discharge permit, or any other sectoral license.
    criteria: 'التحقق من توفر رخصة أو تصريح استغلال ساري المفعول ومطابق لنوع النشاط ضمن المؤسسات المصنفة. في حال غياب الرخصة، على المفتش التمييز بين حالتين: (أ) المنشأة داخل فترة التسوية القانونية المحددة بالمرسوم 24-196 (ثلاث سنوات من يونيو 2024، أي حتى يونيو 2027 تقريباً) → مخالفة جسيمة مع توجيه إعذار فوري لإتمام إجراءات التسوية في الآجال المقررة؛ (ب) المنشأة خارج فترة التسوية أو غير مؤهلة لها → مخالفة بالغة الخطورة تستوجب التوقيف الفوري للنشاط والإحالة للجهات المختصة. ملاحظة هامة: رخصة الاستغلال البيئي لا تُغني عن الحصول على التراخيص القطاعية الأخرى (ترخيص الوقاية من الحريق، رخصة التفريغ، إلخ) — كل ترخيص مستقل ومتزامن وواجب التحقق منه على حدة.',
    legalReference: 'المرسوم التنفيذي 06-198 المتعلق بالمؤسسات المصنفة (شروط وكيفيات الاستغلال) المعدَّل بالمرسومين 22-167 و24-196 (المادة 4: عدم الإحلال بين الرخص القطاعية + المادة المتعلقة بفترة التسوية الممنوحة بموجب الإصلاح 2024) + القانون 03-10 الذي يُجرِّم استغلال منشأة مصنفة دون ترخيص (المواد الجزائية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-01-02',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'وجود سجلات للتطهير، مراقبة درجات الحرارة (عند الاقتضاء)، نتائج التحاليل، والإعذارات السابقة محفوظة ومتاحة للمراقبة.',
    // W19 (2026-08-08): CORRECTED — previous ref Art.65 (obligation to notify accidents) ≠ record-keeping.
    // Art.62 (surveillance/control obligations for classified installations) is the closest match.
    // [À VÉRIFIER]: no explicit "record-keeping register" article found in Loi 03-10 by direct read.
    // Cross-check Décret 06-198 for specific register obligations before closing.
    legalReference: 'القانون 03-10 (حماية البيئة) المادة 62 (إلزامية الرقابة والمراقبة على المنشآت المصنفة) [À VÉRIFIER: تحديد المادة الصريحة في مسك السجلات — مراجعة المرسوم 06-198 المعدَّل] + القانون 09-03 (حماية المستهلك وقمع الغش) المادة 7 (إلزامية تتبع المنتج وحفظ الوثائق).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-01-03',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'عدم عرقلة المفتش أو منعه من أداء مهامه أو التدخل في مسار الرقابة، وتوفير جميع الوثائق والسجلات المطلوبة فوراً عند الطلب.',
    // W19 (2026-08-08): CORRECTED — previous refs were WRONG:
    //   Art.71 = prohibition on importing waste (Loi 03-10) — unrelated.
    //   Art.73 = fine for unauthorized water discharge — unrelated.
    // Candidates: Art.82 (habilitation of inspectors to search/record infringements),
    //   Art.84 (suspension/enforcement powers). [À VÉRIFIER]: confirm exact articles
    //   for right-of-entry and obstruction offence by reading Loi 03-10 Arts.81-87.
    legalReference: '[À VÉRIFIER — W19]: المادتان 71 و73 من القانون 03-10 المذكورتان سابقاً خاطئتان (71: حظر استيراد النفايات؛ 73: غرامة التفريغ في المياه). المرشحان الصحيحان هما المادة 82 (صلاحيات المفتشين في الدخول والتفتيش) والمادة 84 (تجريم العرقلة وسلطة التوقيف) — يجب التحقق بقراءة المواد 81–87 من القانون 03-10 مباشرةً من JORADP قبل إغلاق هذا البند.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // المحور 2: الموقع والتهيئة العامة (عام)
  {
    id: 'BGN-02-01',
    axis: 'الموقع والتهيئة العامة',
    category: 'بيئية',
    criteria: 'موقع المنشأة بعيد عن مصادر التلوث الظاهر (مفرغة، مياه راكدة، دخان صناعي).',
    legalReference: 'القانون 90-29 المادة 37 (احترام قواعد التهيئة وعدم إقامة منشآت مضرة بمحيطها العمراني) + القانون 03-10 المادة 6 (مبدأ الوقاية ومنع الإضرار بالبيئة والجوار).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-02',
    axis: 'الموقع والتهيئة العامة',
    category: 'بيئية',
    criteria: 'نشاط المنشأة لا يسبب ضرراً للساكنة المجاورة (ضجيج، روائح، انبعاثات، اهتزازات).',
    legalReference: 'القانون 03-10 (حماية البيئة) المادة 6 (مبدأ الحيطة ومنع الضرر على الجوار) + القانون 90-29 (التهيئة والتعمير).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-03',
    axis: 'الموقع والتهيئة العامة',
    category: 'بيئية',
    criteria: 'نشاط المنشأة لا يسبب ضرراً للتربة الفلاحية أو المياه الجوفية.',
    // W19 (2026-08-08): CORRECTED — previous ref Art.45 (biodiversity/nature protection) ≠ soil pollution.
    // Correct articles: Art.41 (prohibition on soil degradation) + Art.44 (remediation for soil pollution).
    legalReference: 'القانون 03-10 المادة 41 (حظر كل نشاط يُدهور التربة أو يُعدِّل خصائصها سلباً) + المادة 44 (إلزامية معالجة التربة الملوثة وإعادة تأهيل الموقع) + القانون 05-12 المادة 46 (حظر تلويث المياه الجوفية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-04',
    axis: 'الموقع والتهيئة العامة',
    category: 'تنظيمية',
    criteria: 'المبنى مشيَّد بمواد صلبة ومطابق لرخصة البناء وشهادة المطابقة عند الاقتضاء.',
    legalReference: 'القانون 90-29 (رخصة البناء وشهادة المطابقة) + المرسوم 06-198 المعدَّل بالمرسومين 22-167 و24-196 (مطابقة الواقع للملف التقني).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-05',
    axis: 'الموقع والتهيئة العامة',
    category: 'نظافة',
    criteria: 'أرضيات وجدران قابلة للتنظيف (حسب طبيعة النشاط)، ويُفضَّل أن تكون ملساء وغير منفذة في الأنشطة التي تتطلب ذلك.',
    legalReference: 'المرسوم التنفيذي 91-05 المادة 14 (اشتراطات تصميم وتشطيب أماكن العمل: أرضيات وجدران مستوية وقابلة للتنظيف).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-06',
    axis: 'الموقع والتهيئة العامة',
    category: 'بيئية',
    criteria: 'تهوية طبيعية أو ميكانيكية كافية حسب طبيعة النشاط.',
    legalReference: 'المرسوم التنفيذي 91-05 المادة 11 (إلزامية التهوية الكافية في أماكن العمل) + المرسوم التنفيذي 93-120 المادة 11 (متطلبات التهوية في المنشآت الصناعية).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-07',
    axis: 'الموقع والتهيئة العامة',
    category: 'نظافة',
    criteria: 'إضاءة طبيعية أو اصطناعية كافية في أماكن العمل.',
    legalReference: 'المرسوم التنفيذي 91-05 المادة 16 (الحدود الدنيا للإضاءة في أماكن العمل) + القانون 90-11 المتعلق بعلاقات العمل المادة 6 (الصحة والسلامة المهنية).',
    severity: 'low',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  // المحور 3: المياه والصرف الصحي (عام)
  {
    id: 'BGN-03-01',
    axis: 'المياه والصرف الصحي',
    category: 'بيئية',
    criteria: 'توفر ماء صالح للشرب من شبكة عمومية أو خزان مراقَب في كل الأوقات وبضغط كافٍ.',
    // W8 (2026-08-08): corrected from Décret 88-164 (unfindable/superseded) to Décret 11-125
    //   (Décret exécutif 11-125 du 22/03/2011 — potable water quality norms, JORADP-confirmed).
    legalReference: 'المرسوم التنفيذي 11-125 المؤرخ في 22/03/2011 المتعلق بالخصائص والمعايير التقنية لمياه الاستهلاك البشري (مطابقة مياه الشرب للمعايير الصحية ومراقبتها الدورية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-03-02',
    axis: 'المياه والصرف الصحي',
    category: 'بيئية',
    criteria: 'وجود شبكة صرف صحي فعالة، دون تسربات أو ركود مياه مستعملة.',
    // W19 (2026-08-08): CORRECTED — previous ref Art.14 (national plan for special waste) ≠ generator obligations.
    // Correct articles: Art.8 (obligation to eliminate waste without harming health/environment)
    //   + Art.11 (conditions for valorisation/elimination — no danger to persons/water/soil/air).
    legalReference: 'القانون 01-19 المادة 8 (إلزامية التخلص من المخلفات السائلة على نفقة المُنشئ وبطريقة لا تضر بالصحة والوسط) + المادة 11 (شروط التخلص: عدم تعريض الأشخاص والمياه والتربة والهواء للخطر) + القانون 03-10 المادة 30 (حظر التفريغ في المياه دون معالجة).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-03-03',
    axis: 'المياه والصرف الصحي',
    category: 'بيئية',
    criteria: 'صرف مياه الغسل إلى شبكة الصرف الصحي أو محطة معالجة، وعدم طرحها مباشرة في الساحة أو التربة.',
    // W19 (2026-08-08): CORRECTED — previous ref Art.14 (national plan) ≠ wastewater discharge obligation.
    // Correct: Art.8 (elimination duty) + Art.11 (conditions) + discharge permit reference retained.
    legalReference: 'القانون 01-19 المادة 8 (وجوب التخلص من المخلفات السائلة بطريقة مراقَبة) + المادة 11 (شروط التخلص: عدم التسبب في أضرار للمياه والتربة والهواء) + رخصة التفريغ عند الاقتضاء وفق نظام التصريف المعتمد.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-03-04',
    axis: 'المياه والصرف الصحي',
    category: 'بيئية',
    criteria: 'تصميم قنوات الصرف غير متكسِّرة، ذات أقطار كافية، ومنحدرات ملائمة لتفادي الركود والانسداد.',
    legalReference: 'المرسوم التنفيذي 91-05 المادة 14 (اشتراطات التهيئة الصحية للمحلات وتجهيزاتها بما يضمن سهولة التنظيف والتصريف السليم).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-03-05',
    axis: 'المياه والصرف الصحي',
    category: 'بيئية',
    criteria: 'وجود حواجز مائية (سيفونات) في نقاط الصرف لمنع رجوع الروائح والغازات والحشرات.',
    legalReference: 'المرسوم التنفيذي 91-05 المادة 14 (التهيئة الصحية للمحلات ومنع مصادر التلوث والروائح والآفات عبر تجهيزات صرف ملائمة).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Z8: removed unverified "90 days / 80% capacity" figures (no Algerian legal source found).
    // Z13-PENDING [حكم مهني]: 12-month threshold as professional judgment only.
    // If JORADP source found later, open Z13 and replace [حكم مهني] with legal citation.
    id: 'BGN-03-06',
    axis: 'المياه والصرف الصحي',
    category: 'بيئية',
    criteria: 'في حالة وجود حفرة متعفنة (fosse septique): تسييرها وفق عقد ساري المفعول مع الديوان الوطني للتطهير ONA أو متعامل معتمد لعمليات الشفط الدوري، مع الاحتفاظ بآخر وصل شفط كدليل على التنفيذ الفعلي. يتحقق المفتش ميدانياً من غياب أي فيضان أو تسرب نحو الباطن الأرضي أو المحيط المجاور. [حكم مهني]: إذا كان تاريخ آخر وصل شفط يتجاوز 12 شهراً من تاريخ التفتيش، يُسجَّل ذلك كملاحظة ويُوصى بعملية شفط وقائية — هذا الأجل حكم مهني لا مرجع قانوني محدداً له في التشريع الجزائري حتى الآن.',
    legalReference: 'القانون 01-19 المادة 8 (وجوب التخلص من المخلفات السائلة دون الإضرار بالصحة والوسط) + المرسوم التنفيذي 01-102 المتعلق بإنشاء الديوان الوطني للتطهير ONA وصلاحياته (إلزامية التعاقد مع ONA أو متعامل معتمد لعمليات الشفط) + القانون 05-12 المادة 46 (حظر تلويث المياه الجوفية). [حكم مهني — لا مصدر قانوني جزائري محدد لأجل الشفط حتى الآن: يُراجع JORADP لتحديد أي مرسوم أو قرار يُحدد الترددية — إن وُجد يُفتح Z13 لتحديث المرجع القانوني].',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // المحور 4: النظافة العامة وتسيير النفايات (عام)
  {
    id: 'BGN-04-01',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'نظافة',
    criteria: 'وضع النفايات في حاويات مغلقة أو أكياس بلاستيكية مخصصة وعدم تركها مكشوفة.',
    // W19 (2026-08-08): CORRECTED — Art.14 (national plan coordination) ≠ generator containment obligation.
    // Correct: Art.8 (elimination duty on generator) + Art.11 (conditions: no danger, no odours).
    legalReference: 'القانون 01-19 المادة 8 (إلزامية التخلص من النفايات على نفقة مُنشئها بطريقة لا تضر بالصحة والوسط) + المادة 11 (شروط التخلص: عدم تعريض الأشخاص للخطر، عدم إحداث روائح أو إضرار بالمناظر الطبيعية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-02',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'نظافة',
    criteria: 'تنظيف وتعقيم حاويات النفايات بعد التفريغ بانتظام.',
    // W19 (2026-08-08): CORRECTED — Art.14 ≠ container hygiene. Correct: Art.8 + Art.11.
    legalReference: 'القانون 01-19 المادة 8 (التخلص من النفايات بطريقة لا تضر بالصحة) + المادة 11 (شروط التخلص: عدم التسبب في أضرار، عدم إحداث روائح أو تلوث).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-03',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'نظافة',
    criteria: 'وجود برنامج تنظيف يومي للأرضيات والجدران والتجهيزات مع وسائل ومواد تنظيف ملائمة.',
    legalReference: 'المرسوم التنفيذي 91-05 المادة 7 (إلزامية برامج النظافة الدورية وصيانة النظافة في أماكن العمل).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-04',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'نظافة',
    criteria: 'عدم وجود تراكم للنفايات في محيط المبنى أو في الساحة المجاورة.',
    // W19 (2026-08-08): CORRECTED — Art.14 ≠ prohibition on accumulation outside premises.
    // Correct: Art.8 + Art.11 (Loi 01-19) + Art.6 (Loi 03-10, precautionary principle).
    legalReference: 'القانون 01-19 المادة 8 (إلزامية التخلص من النفايات دون تركها في المحيط الخارجي) + المادة 11 (شروط التخلص: عدم الإضرار بالمناظر والمواقع) + القانون 03-10 المادة 6 (مبدأ الوقاية).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-05',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'بيئية',
    criteria: 'حظر حرق النفايات غير الخطرة في الهواء الطلق داخل أو خارج المنشأة، ووجوب تحويل المخلفات إلى جهات جمع معتمدة أو مرافق عمومية.',
    // W19 (2026-08-08): CORRECTED — previous ref Art.29 (schéma communal = municipal plan) ≠ open-air burning ban.
    // No explicit open-air burning prohibition article found in Loi 01-19 by direct read.
    // Art.11 (conditions for elimination: no danger, no smoke/odour) is closest.
    // [À VÉRIFIER]: check Loi 03-10 Art.36 (atmospheric emissions ban) and any specific
    //   arrêté on open-air burning. If found, replace [À VÉRIFIER] with confirmed citation.
    legalReference: 'القانون 01-19 المادة 11 (شروط التخلص من النفايات: دون إحداث دخان أو روائح أو تعريض الهواء للخطر) + القانون 03-10 المادة 36 (حظر انبعاث الملوثات الجوية فوق القيم الحدية المقررة). [À VÉRIFIER — W19]: لم يُعثر على مادة صريحة تحظر الحرق في الهواء الطلق في القانون 01-19 — يراجع JORADP بحثاً عن قرار وزاري أو مرسوم تطبيقي خاص قبل إغلاق هذا البند.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    // Z6: added Décret 09-19 Art. 4–8 — mandatory accreditation check for waste collection operator.
    id: 'BGN-04-06',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'بيئية',
    criteria: 'وجود بورديرو (وثيقة نقل النفايات الخاصة الخطرة) عند كل عملية تسليم لنفايات خاصة خطرة لمتعامل معتمد، مع الاحتفاظ بنسخة منها لمدة لا تقل عن خمس سنوات. يتحقق المفتش إضافةً من أن المتعامل الجامع والناقل يحمل وثيقة اعتماد سارية المفعول صادرة عن السلطة المختصة وتُغطي نوع النفايات المنقولة فعلياً، وأن اسمه مطابق لما ورد في البورديرو.',
    legalReference: 'القانون 01-19 المادة 32 + المرسوم التنفيذي 05-315 (بورديرو نقل النفايات الخاصة الخطرة — إلزامي لكل شحنة) + المرسوم التنفيذي 09-19 المواد 4–8 (اشتراط حصول المتعامل الجامع والناقل للنفايات الخاصة الخطرة على اعتماد من السلطة المختصة، وإلزامية التحقق من صحة هذا الاعتماد عند كل تعاقد).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-07',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'بيئية',
    criteria: 'حظر الحرق الذاتي للنفايات الخطرة أو الطبية داخل المنشأة (محارق غير مرخصة)؛ وتُحوَّل هذه النفايات حصراً إلى مرافق الإحراق المعتمدة.',
    legalReference: 'القانون 01-19 المادة 30 (حظر الحرق غير المرخص للنفايات الخطرة) + المرسوم التنفيذي 07-205 (اشتراطات محارق النفايات الخطرة المعتمدة).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-08',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'بيئية',
    criteria: 'وجود سجل تصنيف وجرد النفايات المنتجة (عادية / خاصة / خطرة) مع تحديده دورياً، بما يُمكِّن من تقدير الكميات المنتجة وتتبع مسار كل صنف.',
    // W19 (2026-08-08): CORRECTED — previous ref Art.28 (export return obligation) ≠ inventory register.
    // Correct: Art.21 (declaration obligation: generators of hazardous waste must declare
    //   nature, quantity and characteristics to minister + periodic reporting on treatment).
    legalReference: 'القانون 01-19 المادة 21 (إلزامية تصريح مُنشئي النفايات الخاصة الخطرة بالطبيعة والكميات والخصائص للوزير المختص، مع التقارير الدورية عن طرق المعالجة والتدابير المتخذة) + المرسوم التنفيذي 05-315 (إلزامية مسك سجل النفايات الخاصة الخطرة).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // المحور 7: مكافحة النواقل (عام)
  {
    id: 'BGN-07-01',
    axis: 'مكافحة النواقل',
    category: 'نظافة',
    criteria: 'عدم ظهور دلائل إصابة بقوارض أو حشرات (فضلات، أثر قرض، مسارات، روائح، حشرات حية أو ميتة) داخل أو خارج المؤسسة.',
    legalReference: 'القانون 03-10 المادة 6 (حماية البيئة والصحة العمومية — منع الأضرار الناجمة عن تكاثر الناقلات).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-07-02',
    axis: 'مكافحة النواقل',
    category: 'نظافة',
    criteria: 'وجود برنامج دوري مكتوب لمكافحة القوارض والحشرات (تحقيق أولي، اختيار المواد، خرائط الطعوم والمصائد، تسجيل التدخلات) — سواء بتعاقد مع مؤسسة مختصة أو تدخل ذاتي موثق، مع التمييز بين المكافحة الوقائية والهجومية.',
    legalReference: 'القانون 03-10 + محور مكافحة النواقل في معايير الرقابة (الصراصير والقوارض، إلزامية التوثيق والخرائط).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-07-03',
    axis: 'مكافحة النواقل',
    category: 'نظافة',
    criteria: 'حاويات النفايات مغلقة ومحفوظة في مكان مناسب.',
    legalReference: 'القانون 01-19 المادة 8.',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-07-04',
    axis: 'مكافحة النواقل',
    category: 'نظافة',
    criteria: 'سدّ الشقوق والفراغات في الجدران وحول الأنابيب ونقاط عبور الأسلاك لمنع دخول الآفات.',
    legalReference: 'المرسوم التنفيذي 91-05 المادة 14 (صيانة الجدران وإغلاق الفتحات لضمان سلامة أماكن العمل).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-07-05',
    axis: 'مكافحة النواقل',
    category: 'نظافة',
    criteria: 'استعمال مبيدات حشرية مرخَّصة من طرف مؤسسات مؤهلة، واحترام فترات الغلق والتهوية.',
    // W19 (2026-08-08): CORRECTED — previous ref Art.51 (coastal ecosystem protection) ≠ pesticide licensing.
    // Correct: Art.56 (dangerous chemicals subject to specific regulations)
    //   + Art.58 (import/manufacture/sale/use of dangerous chemicals requires authorisation).
    legalReference: 'القانون 03-10 المادة 56 (إخضاع إنتاج وتسويق واستعمال وتسيير المواد الكيميائية الخطرة لأنظمة خاصة لحماية البيئة والصحة) + المادة 58 (اشتراط الحصول على ترخيص من السلطة المختصة لاستيراد وتصنيع وبيع واستعمال المواد الكيميائية الخطرة).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // المحور 8: السلامة العامة والوقاية من الحوادث (عام)
  {
    id: 'BGN-08-01',
    axis: 'السلامة العامة والوقاية من الحوادث',
    category: 'سلامة',
    criteria: 'توفر تجهيزات مكافحة الحريق (مطفآت، صنابير حريق...) في حالة عمل، بعدد ومواقع مناسبة لطبيعة المنشأة، مع التحقق من بطاقة الصيانة السنوية لكل مطفأة (تاريخ آخر فحص وتاريخ انتهاء الصلاحية).',
    // W18 (2026-08-08): added Art. 5 — confirmed correct per AUDIT_STATE.md Session 5 (Loi 19-02 Art.5
    //   sets the technical requirements for fire-fighting equipment in classified establishments).
    legalReference: 'القانون 19-02 المتعلق بالقواعد العامة للوقاية من أخطار الحريق والفزع (المادة 5 — الاشتراطات التقنية لتجهيزات الإطفاء وصيانتها) + النصوص التطبيقية.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-08-02',
    axis: 'السلامة العامة والوقاية من الحوادث',
    category: 'سلامة',
    criteria: 'مسارات الإخلاء خالية من العوائق ومخارج الطوارئ تفتح نحو الخارج ومشار إليها بوضوح.',
    // W18 (2026-08-08): added Art. 13 — confirmed correct per AUDIT_STATE.md Session 5 (Loi 19-02 Art.13
    //   specifies requirements for evacuation routes and emergency exit signage).
    legalReference: 'القانون 19-02 المتعلق بالقواعد العامة للوقاية من أخطار الحريق والفزع (المادة 13 — مسارات الإخلاء ومخارج الطوارئ).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-08-03',
    axis: 'السلامة العامة والوقاية من الحوادث',
    category: 'سلامة',
    criteria: 'سلامة التركيبات الكهربائية: أسلاك سليمة، لوحات توزيع مغلقة، لا توجد أسلاك عارية أو تركيبات خطرة ظاهرة، وتأريض مناسب للأجهزة الحساسة.',
    legalReference: 'المرسوم التنفيذي 76-35 (اشتراطات حماية العمال الكهربائية) + القانون 90-11 المتعلق بعلاقات العمل (السلامة المهنية).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-08-05',
    axis: 'السلامة العامة والوقاية من الحوادث',
    category: 'سلامة',
    criteria: 'وجود نظام إنذار من الحريق أو أجهزة كشف الدخان في حالة عمل في المناطق ذات الخطورة المرتفعة (مخازن المواد القابلة للاشتعال، قاعات الإنتاج الكبيرة)، وفق درجة خطورة المنشأة.',
    legalReference: 'القانون 19-02 المتعلق بالقواعد العامة للوقاية من أخطار الحريق والفزع (المادة 5 — الاشتراطات التقنية للإنذار والكشف).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-08-06',
    axis: 'السلامة العامة والوقاية من الحوادث',
    category: 'تنظيمية',
    criteria: 'بالنسبة للمنشآت المصنفة من الدرجة الأولى (التي تستلزم قرار الوالي): التحقق من وجود قرار الاستغلال الصادر عن الوالي (رخصة استغلال المؤسسات المصنفة D1) ساري المفعول، وأن النشاط المُمارَس فعلياً مطابق للنشاط المُرخَّص به، وأن التعديلات الجوهرية أُخضِعت لإجراءات الترخيص المسبق. تنبيه: هذا القرار لا يُغني عن الحصول المستقل على رخصة الوقاية من الحريق ورخصة التفريغ وسائر التراخيص القطاعية الأخرى — كل ترخيص يُفحص على حدة.',
    legalReference: 'المرسوم التنفيذي 06-198 المادة 7 المعدَّل بالمرسومين 22-167 و24-196 (قرار الوالي لمنشآت الدرجة الأولى) + القانون 03-10 المادة 18 (إلزامية الترخيص المسبق للمنشآت المصنفة D1 وتجريم مخالفته).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // المحور 9: الضجيج والانبعاثات البيئية (عام)
  {
    id: 'BGN-09-01',
    axis: 'الضجيج والانبعاثات البيئية',
    category: 'بيئية',
    criteria: 'قياس مستوى الضجيج الصادر عن المنشأة عند الحدود مع الجوار أو داخل أماكن العمل، والتحقق من عدم تجاوز الحد المقرر (70 ديسيبل في المحيط الحضري نهاراً) مع توثيق النتائج.',
    // W19 (2026-08-08): CORRECTED — previous ref Art.27 (public access to environmental information) ≠ noise ban.
    // Correct: Art.54 ("Il est interdit de produire des bruits ou des sons de nature à nuire à la santé
    //   ou à troubler de façon excessive les conditions normales de vie.")
    legalReference: 'القانون 03-10 المادة 54 (حظر إصدار ضوضاء أو أصوات من شأنها الإضرار بالصحة أو الإخلال بظروف الحياة الطبيعية) + المرسوم التنفيذي 91-05 المادة 9 (الحدود القصوى لمستويات الضجيج في أماكن العمل).',
    severity: 'medium',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'dB',
      labelAr: 'مستوى الضجيج المقاس عند حدود المنشأة',
      min: 0,
      max: 140,
      warningMax: 70,
      step: 1,
      upperLimit: true,
    },
  },
  {
    id: 'BGN-09-02',
    axis: 'الضجيج والانبعاثات البيئية',
    category: 'سلامة',
    criteria: 'التحقق من أن العمال المعرضين لمخاطر مهنية (مواد كيميائية، ضجيج، أتربة، إلخ) تلقَّوا تعليمات وتدريباً موثقاً على الاستخدام الصحيح لوسائل الحماية الفردية (EPI) المخصصة لهم، وذلك بموجب سجل تدريب موقَّع أو محضر تكوين.',
    legalReference: 'المرسوم التنفيذي 02-427 المؤرخ في 7 ديسمبر 2002 (شروط تنظيم تعليم وإعلام وتكوين العمال في مجال الوقاية من أخطار المهنة) — يُلزم صاحب العمل بتوفير التكوين العملي والتعليمات الكافية لكل عامل معرض لخطر مهني.',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  // ===== المحور 10: دراسة التأثير البيئي (عام) =====
  {
    id: 'BGN-10-01',
    axis: 'دراسة التأثير البيئي',
    category: 'بيئية',
    criteria: 'توفر دراسة تأثير على البيئة (EIE) أو موجز بيئي معتمد من السلطة المختصة، وذلك للمنشآت المصنفة من الفئة الأولى والثانية وفق قائمة التصنيف المحددة بالمرسوم 07-144. تشمل المراجعة: (أ) وجود وثيقة الدراسة المعتمدة في الملف؛ (ب) عدم تجاوز الحدود البيئية المحددة فيها (ضجيج، روائح، غازات، مياه)؛ (ج) إعادة إجراء الدراسة عند إجراء توسعات أو تغييرات جوهرية في طبيعة النشاط أو طاقته.',
    legalReference: 'القانون 03-10 المواد 15–22 (إلزامية دراسة التأثير على البيئة للمنشآت المصنفة وفئاتها). المرسوم التنفيذي 07-145 (كيفيات تطبيق دراسة التأثير على البيئة وإجراءاتها). المرسوم التنفيذي 07-144 (قائمة المنشآت المصنفة وتصنيفها إلى فئات). المرسوم التنفيذي 06-198 كما عُدِّل بالمرسومَيْن 22-167 و24-196 (ربط رخصة الاستغلال بنتائج دراسة التأثير أو الموجز البيئي).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
