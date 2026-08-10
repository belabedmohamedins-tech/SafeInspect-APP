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
//              → [À VÉRIFIER — open]: Art.30 covers transboundary movement, not
//              unlicensed incineration. Best available basis: Loi 01-19 Art.11
//              (disposal conditions: no emission, no danger to health/environment)
//              + Décret 07-205 (approved incinerator requirements). Open a LEGAL-VERIFY
//              phase to locate the explicit prohibition article.
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
//     Art.18 confirmed to address EIE preparer accreditation — wrong domain.
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
    // Art.3 defines sanitary requirements for floors, walls, and surfaces (materials, impermeability).
    // Art.4 specifies maintenance and upkeep obligations for premises surfaces.
    // Art.14 (general sanitary layout) was too broad and not the specific floor/wall article.
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
    // W11/L-04 fix (2026-08-08): removed Décret 93-120 — that decree governs periodic
    // medical examinations for workers, NOT ventilation requirements.
    // Décret exécutif 91-05 Art.11 is the correct and sole Algerian legal basis for
    // general workplace ventilation obligations. No separate ventilation-specific
    // Algerian decree exists in JORADP.
    // [حكم مهني]: numeric ventilation thresholds (air changes/h, m³/h per worker) have
    // no explicit value in Algerian law — inspector applies professional judgment or
    // references ISO 7730 / ASHRAE 62.1 as technical guidance only.
    legalReference: 'المرسوم التنفيذي 91-05 المادة 11 (إلزامية التهوية الكافية في أماكن العمل). [حكم مهني]: لا يحدد التشريع الجزائري قيماً عددية صريحة لمعدلات تجديد الهواء في المنشآت العامة — يرجع المفتش إلى حكمه المهني أو المعايير التقنية الدولية (ISO 7730 / ASHRAE 62.1) كإرشادات مرجعية دون إلزامية قانونية.',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'BGN-02-07',
    a