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
//   BGN-01-02: Art.65→Art.62 + [À VÉRIFIER — still open, needs Décret 06-198 check]
//   BGN-01-03: Art.71+73→Art.82+84 CONFIRMED by direct read Arts.81-87 Loi 03-10
//   BGN-02-03: Art.45(biodiversity)→Art.41+44(soil)
//   BGN-03-02/03, BGN-04-01/02/04: Art.14(national plan)→Art.8+11(generator obligations)
//   BGN-04-05: Art.29(municipal plan)→Art.11+36 — no dedicated open-air burning article
//              exists in Loi 01-19 (full text read). Burning ban = [حكم مهني] basis.
//   BGN-04-08: Art.28(export return)→Art.21(declaration obligation)
//   BGN-07-05: Art.51(coastal)→Art.56+58(chemical/pesticide control)
//   BGN-09-01: Art.27(public info access)→Art.54(noise prohibition)
// W11/L-04 fix (2026-08-08): BGN-02-06 legalReference — removed incorrect citation
//   of Décret 93-120 (periodic medical exams — wrong domain, unrelated to ventilation).
//   Ventilation obligation is fully covered by Décret exécutif 91-05 Art.11.
//   No separate Algerian ventilation-specific decree exists in JORADP.
//   Numeric thresholds (m³/h, air changes/h) tagged [حكم مهني] — no Algerian
//   decree sets specific ventilation figures for general industrial premises.
// W39 (2026-08-09): 6 wrong Décret 91-05 article citations corrected.
//   BGN-02-05: Art.14 → Art.3+4 (surface/floor/wall sanitary requirements)
//   BGN-02-07: Art.16 → Art.13 (minimum lux levels table)
//   BGN-03-04: Art.14 → Art.9 (drainage pipe design requirements)
//   BGN-03-05: Art.14 → Art.9 (siphon/water-seal requirement)
//   BGN-04-03: Art.7 → Art.2+3 (cleaning program and hygiene obligations)
//   BGN-09-01: secondary Décret 91-05 Art.9 → Art.15 (workplace noise limit)
// W40 (2026-08-09): 2 wrong article citations corrected.
//   BGN-04-06: Loi 01-19 Art.32 (hazardous waste collection register) → Art.19
//              (declaration obligation for hazardous waste producers — correct subject).
//              Décret 09-19 Arts.4-8 (too broad) → Art.2 (approval scope/definition)
//              + Art.6 (conditions for granting approval to collector/transporter).
//   BGN-04-07: Loi 01-19 Art.30 (import/export of hazardous waste — wrong domain)
//              → LEGAL-VERIFY opened 2026-08-09, CLOSED 2026-08-17 after full read
//              of all 72 articles of Loi 01-19 (no gap confirmed).
//              FINDING: "incinération" does not appear anywhere in Loi 01-19.
//              Best available legal basis confirmed: Art.15 (special waste treated ONLY
//              in authorized installations) + Art.19 (prohibition to hand DSD to any
//              non-authorized operator — covers unlicensed on-site incineration) +
//              Art.63 (criminal penalty: 8 months–3 years + 500k–900k DA for operating
//              a waste treatment installation without compliance) + Décret 07-205
//              (technical requirements for authorized hazardous-waste incinerators).
//              [حكم مهني — W40 مغلق]: no explicit "self-incineration ban" article exists
//              in Loi 01-19; the combination of Art.15+19+63 is the strongest available
//              legal foundation after exhaustive reading.
// W41 (2026-08-10): 2 wrong article citations corrected after direct read of
//   legal_refs/loi-03-10-protection-environnement.md (all 89 articles confirmed).
//   BGN-10-01: Loi 03-10 "Art.15–22" → "Art.14–21".
//     Art.14 is the primary EIE obligation article (projects susceptible to harm
//     the environment are subject to a prior EIE). It was excluded from the old
//     range, making the citation miss the root obligation entirely.
//     Art.22 = fiscal/economic instruments (completely unrelated to EIE).
//     Confirmed: Arts.14–21 form the complete EIE chapter (Chapitre II, Titre II).
//   BGN-08-06: Loi 03-10 Art.18 (who may prepare EIE — accredited orgs) → Art.63
//     (installations classées subject to prior authorization OR declaration) +
//     Art.77 (penal article: 50,000–500,000 DA fine + 2 months–2 years prison
//     for operating an installation classée without required authorization).
// W45 (2026-08-10): BGN-02-01 wrong article corrected after direct read of
//   legal_refs/loi-90-29-urbanisme.md (AUDIT_STATE Session 10 / Finding F5).
//   Loi 90-29 Art.37 confirmed = setting atmospheric emission value limits —
//   completely unrelated to facility siting away from pollution sources.
//   Replaced with Art.4 (constructibility conditions including ecological-balance
//   compatibility — closest available match in this law) + [حكم مهني] tag
//   (no dedicated "distance from pollution sources" article exists in Loi 90-29).
// W46 (2026-08-10): BGN-07-04 wrong article corrected.
//   Décret 91-05 Art.14 (general sanitary layout) — same error as W39 pattern.
//   No article in Décret 91-05 or any Algerian decree explicitly mandates sealing
//   wall cracks for pest ingress prevention.
//   Replaced with Art.2 (employer obligation to maintain premises clean/intact) +
//   Art.3 (surface material requirements: impermeability, no cracks) — closest
//   available legal foundation. [حكم مهني] tag added per protocol.
// W48 (2026-08-10): BGN-02-02 legalReference precision enhancement.
//   Previous ref: Loi 90-29 Art.4 (generic constructibility/ecological balance).
//   W48 adds Art.8 which explicitly addresses the obligation to prevent nuisance
//   impacts on neighbouring properties — a near-exact match for this criterion
//   (noise, odours, emissions, vibrations affecting residents/neighbours).
//   Art.4 retained as secondary supporting basis; Art.8 promoted to primary.
// W49 (2026-08-17): BGN-08-03 wrong instrument corrected after direct source-read.
//   Previous ref: Décret 76-35 (IGH fire-safety decree) — wrong domain, applies only
//   to immeubles de grande hauteur, not general workplace electrical safety.
//   Replaced with Décret exécutif 91-05 Art.17 (safe electrical installations in workplaces)
//   + Loi 90-11 as general occupational safety basis.
// W40-CLOSE (2026-08-17): BGN-04-07 legalReference finalized after LEGAL-VERIFY.
//   Full read of Loi 01-19 (72 articles, no gap) confirmed: word "incinération" absent.
//   Previous placeholder (Art.11 + Décret 07-205 + [À VÉRIFIER open]) replaced with
//   Art.15 + Art.19 + Art.63 + Décret 07-205 — strongest available basis confirmed.
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
    // [À VÉRIFIER — still open]: no explicit "record-keeping register" article found in Loi 03-10.
    // Cross-check Décret 06-198 and its implementing arrêtés for specific register obligations.
    legalReference: 'القانون 03-10 (حماية البيئة) المادة 62 (إلزامية الرقابة والمراقبة على المنشآت المصنفة) [À VÉRIFIER: تحديد المادة الصريحة في مسك السجلات — مراجعة المرسوم 06-198 المعدَّل والقرارات التطبيقية] + القانون 09-03 (حماية المستهلك وقمع الغش) المادة 7 (إلزامية تتبع المنتج وحفظ الوثائق).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-01-03',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'عدم عرقلة المفتش أو منعه من أداء مهامه أو التدخل في مسار الرقابة، وتوفير جميع الوثائق والسجلات المطلوبة فوراً عند الطلب.',
    // W19 FINAL (2026-08-08): CONFIRMED by direct read of Loi 03-10 Arts.81-87.
    //   Art.82: right of entry. Art.84: suspension power. [À VÉRIFIER] CLOSED.
    legalReference: 'القانون 03-10 المادة 82 (حق المفتشين المؤهلين في الدخول إلى المنشآت والأماكن لأداء مهام البحث والتحقق من المخالفات) + المادة 84 (صلاحية المفتش في إصدار قرار تعليق النشاط فوراً عند ثبوت المخالفة حتى التسوية). ملاحظة: لا توجد مادة صريحة في القانون 03-10 تُجرِّم العرقلة جزائياً — الحالة تخضع لأحكام القانون العام في قانون العقوبات (عرقلة موظف عمومي في أداء مهامه).',
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
    // W45 (2026-08-10): CORRECTED — Loi 90-29 Art.37 confirmed = atmospheric emission
    // VALUE LIMITS (wrong domain). Art.4 is the constructibility/ecological-balance
    // compatibility article — closest match in this law for siting obligations.
    // [حكم مهني]: no dedicated "distance from pollution sources" article exists
    // in Loi 90-29 (all 81 articles read — AUDIT_STATE Session 10 / Finding F5).
    legalReference: 'القانون 90-29 المادة 4 (شروط قابلية البناء — ضرورة تحقيق التوافق مع متطلبات التوازن البيئي والإيكولوجي للموقع) + القانون 03-10 المادة 6 (مبدأ الوقاية ومنع الإضرار بالبيئة والجوار). [حكم مهني — W45]: لا توجد مادة صريحة في القانون 90-29 تُحدد مسافات فصل بين المنشآت ومصادر التلوث — يعتمد المفتش حكمه المهني وإرشادات التخطيط العمراني المحلية.',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-02',
    axis: 'الموقع والتهيئة العامة',
    category: 'بيئية',
    criteria: 'نشاط المنشأة لا يسبب ضرراً للساكنة المجاورة (ضجيج، روائح، انبعاثات، اهتزازات).',
    // W48 (2026-08-10): ENHANCED — Loi 90-29 Art.4 (generic constructibility) replaced
    // as primary by Art.8 (explicit obligation to avoid nuisance impacts on neighbouring
    // properties — direct match for noise/odours/emissions/vibrations criterion).
    // Art.4 retained as secondary supporting basis for site-compatibility framing.
    legalReference: 'القانون 90-29 المادة 8 (إلزامية مراعاة حقوق الجوار وعدم التسبب في إزعاج أو أضرار للساكنة المجاورة — الأساس المباشر لحظر الضجيج والروائح والانبعاثات والاهتزازات الضارة بالجوار) + المادة 4 (شروط قابلية البناء وتوافق النشاط مع المحيط البيئي والإيكولوجي للموقع) + القانون 03-10 المادة 6 (مبدأ الحيطة ومنع الضرر على الجوار).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-03',
    axis: 'الموقع والتهيئة العامة',
    category: 'بيئية',
    criteria: 'نشاط المنشأة لا يسبب ضرراً للتربة الفلاحية أو المياه الجوفية.',
    // W19 (2026-08-08): CORRECTED — Art.45 (biodiversity) → Art.41+44 (soil). CONFIRMED.
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
    // W39 (2026-08-09): CORRECTED — Art.14 → Art.3+4.
    legalReference: 'المرسوم التنفيذي 91-05 المادة 3 (اشتراطات المواد والسطوح: أرضيات وجدران غير منفذة وقابلة للتنظيف في أماكن العمل) + المادة 4 (إلزامية صيانة الأرضيات والجدران والأسقف وإبقائها في حالة نظافة دائمة).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-06',
    axis: 'الموقع والتهيئة العامة',
    category: 'بيئية',
    criteria: 'تهوية طبيعية أو ميكانيكية كافية حسب طبيعة النشاط.',
    // W11/L-04 fix (2026-08-08): removed Décret 93-120 — wrong domain.
    legalReference: 'المرسوم التنفيذي 91-05 المادة 11 (إلزامية التهوية الكافية في أماكن العمل). [حكم مهني]: لا يحدد التشريع الجزائري قيماً عددية صريحة لمعدلات تجديد الهواء في المنشآت العامة — يرجع المفتش إلى حكمه المهني أو المعايير التقنية الدولية (ISO 7730 / ASHRAE 62.1) كإرشادات مرجعية دون إلزامية قانونية.',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-07',
    axis: 'الموقع والتهيئة العامة',
    category: 'نظافة',
    criteria: 'إضاءة طبيعية أو اصطناعية كافية في أماكن العمل.',
    // W39 (2026-08-09): CORRECTED — Art.16 → Art.13.
    legalReference: 'المرسوم التنفيذي 91-05 المادة 13 (الحدود الدنيا للإضاءة في أماكن العمل — جدول مستويات الإضاءة اللازمة لكل نوع من أنواع المناصب) + القانون 90-11 المتعلق بعلاقات العمل المادة 6 (الصحة والسلامة المهنية).',
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
    // W39 (2026-08-09): CORRECTED — Art.14 → Art.9.
    legalReference: 'المرسوم التنفيذي 91-05 المادة 9 (اشتراطات تصميم قنوات الصرف الصحي في أماكن العمل: القطر الكافي والانحدار الملائم لضمان التدفق السليم وتفادي الركود والانسداد).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-03-05',
    axis: 'المياه والصرف الصحي',
    category: 'بيئية',
    criteria: 'وجود حواجز مائية (سيفونات) في نقاط الصرف لمنع رجوع الروائح والغازات والحشرات.',
    // W39 (2026-08-09): CORRECTED — Art.14 → Art.9.
    legalReference: 'المرسوم التنفيذي 91-05 المادة 9 (إلزامية تركيب حواجز مائية (سيفونات) عند نقاط الصرف في أماكن العمل لمنع عودة الروائح والغازات والحشرات من شبكة الصرف).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-03-06',
    axis: 'المياه والصرف الصحي',
    category: 'بيئية',
    criteria: 'في حالة وجود حفرة متعفنة (fosse septique): تسييرها وفق عقد ساري المفعول مع الديوان الوطني للتطهير ONA أو متعامل معتمد لعمليات الشفط الدوري، مع الاحتفاظ بآخر وصل شفط كدليل على التنفيذ الفعلي. يتحقق المفتش ميدانياً من غياب أي فيضان أو تسرب نحو الباطن الأرضي أو المحيط المجاور. [حكم مهني]: إذا كان تاريخ آخر وصل شفط يتجاوز 12 شهراً من تاريخ التفتيش، يُسجَّل ذلك كملاحظة ويُوصى بعملية شفط وقائية — هذا الأجل حكم مهني لا مرجع قانوني محدد له في التشريع الجزائري حتى الآن.',
    legalReference: 'القانون 01-19 المادة 8 (وجوب التخلص من المخلفات السائلة دون الإضرار بالصحة والوسط) + المرسوم التنفيذي 01-102 المتعلق بإنشاء الديوان الوطني للتطهير ONA وصلاحياته (إلزامية التعاقد مع ONA أو متعامل معتمد لعمليات الشفط) + القانون 05-12 المادة 46 (حظر تلويث المياه الجوفية). [حكم مهني — لا مصدر قانوني جزائري محدد لأجل الشفط حتى الآن].',
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
    // W39 (2026-08-09): CORRECTED — Art.7 → Art.2+3.
    legalReference: 'المرسوم التنفيذي 91-05 المادة 2 (إلزامية المحافظة على نظافة أماكن العمل وصيانتها في حالة نظافة دائمة على عاتق صاحب العمل) + المادة 3 (اشتراطات النظافة الدورية للأرضيات والجدران والأسقف والتجهيزات).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-04',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'نظافة',
    criteria: 'عدم وجود تراكم للنفايات في محيط المبنى أو في الساحة المجاورة.',
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
    // W19 FINAL (2026-08-08): [À VÉRIFIER] CLOSED.
    legalReference: 'القانون 01-19 المادة 11 (شروط التخلص من النفايات: دون إحداث دخان أو روائح أو تعريض الهواء للخطر) + القانون 03-10 المادة 36 (حظر انبعاث الملوثات الجوية فوق القيم الحدية المقررة). [حكم مهني — W19 مغلق]: لا توجد مادة صريحة تحظر الحرق في الهواء الطلق في القانون 01-19 (قُرئ النص كاملاً). المرجعان المذكوران هما أفضل أساس قانوني متاح — المادة 11 تمنع الإضرار بالهواء، والمادة 36 تحظر التجاوز عن القيم الحدية للانبعاثات. إن وُجد قرار وزاري أو مرسوم تطبيقي خاص لاحقاً يُفتح فصل جديد لتحديث المرجع.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-06',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'بيئية',
    criteria: 'وجود بورديرو (وثيقة نقل النفايات الخاصة الخطرة) عند كل عملية تسليم لنفايات خاصة خطرة لمتعامل معتمد، مع الاحتفاظ بنسخة منها لمدة لا تقل عن خمس سنوات. يتحقق المفتش إضافةً من أن المتعامل الجامع والناقل يحمل وثيقة اعتماد سارية المفعول صادرة عن السلطة المختصة وتُغطي نوع النفايات المنقولة فعلياً، وأن اسمه مطابق لما ورد في البورديرو.',
    // W40 (2026-08-09): CORRECTED.
    legalReference: 'القانون 01-19 المادة 19 (إلزامية تصريح مُنشئي النفايات الخاصة الخطرة بطبيعتها وكمياتها وخصائصها وطرق معالجتها للسلطة المختصة، وحفظ الوثائق الثبوتية — الأساس القانوني لإلزامية البورديرو وتتبع الشحنات) + المرسوم التنفيذي 05-315 (نموذج بورديرو نقل النفايات الخاصة الخطرة — إلزامي لكل شحنة) + المرسوم التنفيذي 09-19 المادة 2 (نطاق الاعتماد: فئات المتعاملين الجامعين والناقلين الخاضعين لنظام الترخيص) + المادة 6 (شروط منح الاعتماد: الكفاءة التقنية، التجهيزات، التأهيل البشري — ما يتحقق منه المفتش في وثيقة الاعتماد).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-07',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'بيئية',
    criteria: 'حظر الحرق الذاتي للنفايات الخطرة أو الطبية داخل المنشأة (محارق غير مرخصة)؛ وتُحوَّل هذه النفايات حصراً إلى مرافق الإحراق المعتمدة.',
    // W40-CLOSE (2026-08-17): LEGAL-VERIFY completed — full read of Loi 01-19 (72 arts, no gap).
    // "Incinération" does not appear anywhere in Loi 01-19.
    // Art.15: special waste must be treated ONLY in installations authorized by the minister.
    // Art.19: prohibition to hand DSD to any person operating a non-authorized installation
    //         — this is the closest explicit prohibition covering unlicensed on-site incineration.
    // Art.63: criminal penalty for operating any waste treatment installation without compliance.
    // [حكم مهني — W40 مغلق]: no article explicitly names "self-incineration" as prohibited;
    // Art.15 + Art.19 + Art.63 combination is the strongest available legal foundation confirmed
    // after exhaustive reading of all 72 articles.
    legalReference: 'القانون 01-19 المادة 15 (وجوب معالجة النفايات الخاصة في منشآت مرخصة حصراً من طرف الوزير المكلف بالبيئة — الأساس الصريح لحظر أي معالجة حرارية غير مرخصة) + المادة 19 (حظر تسليم النفايات الخاصة الخطرة لأي شخص يستغل منشأة غير مرخصة للمعالجة — يُغطي المحارق الداخلية غير المعتمدة) + المادة 63 (العقوبة الجزائية: حبس من 8 أشهر إلى 3 سنوات وغرامة من 500.000 إلى 900.000 دج لكل من يستغل منشأة معالجة النفايات دون مطابقة أحكام القانون) + المرسوم التنفيذي 07-205 (الاشتراطات التقنية لمحارق النفايات الخطرة المعتمدة — يُحدد ما يجب توفره للحصول على الترخيص). [حكم مهني — W40 مغلق]: لا توجد مادة صريحة في القانون 01-19 تحظر الحرق الذاتي بهذه الصياغة تحديداً (النص كاملاً مقروء — 72 مادة بلا ثغرة)؛ المواد المذكورة هي أفضل وأقوى أساس قانوني متاح بعد البحث الاستيعابي.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-04-08',
    axis: 'النظافة العامة وتسيير النفايات',
    category: 'بيئية',
    criteria: 'وجود سجل تصنيف وجرد النفايات المنتجة (عادية / خاصة / خطرة) مع تحديده دورياً، بما يُمكِّن من تقدير الكميات المنتجة وتتبع مسار كل صنف.',
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
    // W46 (2026-08-10): CORRECTED — Art.14 → Art.2 + Art.3 + [حكم مهني].
    legalReference: 'المرسوم التنفيذي 91-05 المادة 2 (إلزامية صاحب العمل في المحافظة على نظافة أماكن العمل وسلامة بنيتها) + المادة 3 (اشتراطات مواد السطوح: غير منفذة وخالية من الشقوق — أقرب أساس قانوني متاح). [حكم مهني — W46]: لا توجد مادة صريحة في المرسوم 91-05 أو أي مرسوم جزائري تُلزم صراحةً بسدّ الشقوق لمنع دخول الآفات — يعتمد المفتش حكمه المهني ومعايير مكافحة الآفات المتعارف عليها.',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-07-05',
    axis: 'مكافحة النواقل',
    category: 'نظافة',
    criteria: 'استعمال مبيدات حشرية مرخَّصة من طرف مؤسسات مؤهلة، واحترام فترات الغلق والتهوية.',
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
    legalReference: 'المرسوم التنفيذي 91-05 المادة 17 (سلامة التركيبات الكهربائية في أماكن العمل ووجوب مطابقتها لقواعد الوقاية) + القانون 90-11 المتعلق بعلاقات العمل المادة 6 (إلزامية حماية صحة وسلامة العمال).',
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
    // W41 (2026-08-10): CORRECTED — Loi 03-10 Art.18 → Art.63 + Art.77.
    legalReference: 'المرسوم التنفيذي 06-198 المادة 7 المعدَّل بالمرسومين 22-167 و24-196 (قرار الوالي لمنشآت الدرجة الأولى) + القانون 03-10 المادة 63 (إلزامية الترخيص المسبق أو التصريح للمنشآت المصنفة — يُرسي نظام الترخيص) + المادة 77 (العقوبة الجزائية: غرامة من 50.000 إلى 500.000 دج وحبس من شهرين إلى سنتين لكل من يستغل منشأة مصنفة دون الترخيص المطلوب).',
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
    // W39 (2026-08-09): CORRECTED secondary Décret 91-05 ref — Art.9 → Art.15.
    legalReference: 'القانون 03-10 المادة 54 (حظر إصدار ضوضاء أو أصوات من شأنها الإضرار بالصحة أو الإخلال بظروف الحياة الطبيعية) + المرسوم التنفيذي 91-05 المادة 15 (الحدود القصوى لمستويات الضجيج في أماكن العمل).',
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
    // W41 (2026-08-10): CORRECTED — range "Art.15–22" → "Art.14–21".
    legalReference: 'القانون 03-10 المواد 14–21 (الفصل الثاني — دراسات التأثير على البيئة: المادة 14 تُرسي الالتزام الأساسي بإجراء دراسة تأثير مسبقة للمشاريع والمنشآت المرشحة للإضرار بالبيئة؛ المواد 15–21 تُحدد محتوى الدراسة والمشاريع الخاضعة لها وإجراءات التحقيق العمومي والتنظيم). المرسوم التنفيذي 07-145 (كيفيات تطبيق دراسة التأثير على البيئة وإجراءاتها). المرسوم التنفيذي 07-144 (قائمة المنشآت المصنفة وتصنيفها إلى فئات). المرسوم التنفيذي 06-198 كما عُدِّل بالمرسومَيْن 22-167 و24-196 (ربط رخصة الاستغلال بنتائج دراسة التأثير أو الموجز البيئي).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
];
