import { InspectionItem } from '../types';

/**
 * Shared compressed-gas storage criteria.
 * Covers any facility that stores pressurised gas cylinders on-site
 * (welding gases: acetylene, oxygen — and by extension LPG bottles).
 *
 * Usage:
 *   - blacksmithCriteria.ts  → imports CGS-01, CGS-02, CGS-03 (welding-gas context)
 *   - gplCriteria.ts already has equivalent GPL-02-01/02/03; align wording on next GPL rework.
 *
 * W50 (2026-08-18): CGS-01-01 legalReference corrected.
 *   Previous ref: Décret 76-35 — wrong domain. Décret 76-35 is an IGH fire-safety
 *   decree (immeubles de grande hauteur) and does not govern compressed-gas cylinder
 *   storage in industrial/workshop premises. Same finding as W49 (BGN-08-03).
 *   Replaced with:
 *     - Arrêté interministériel du 16/07/1992 relatif aux bouteilles de gaz
 *       pressurisé (stockage vertical, fixation, séparation pleines/vides,
 *       ventilation, distances de sécurité — instrument spécifique bouteilles)
 *     - Décret exécutif 06-198 Art.14 (le cahier des charges fixe les quantités
 *       maximales et les conditions de stockage autorisées par l'exploitant)
 *     - Loi 19-02 Art.4 (prévention incendie dans les zones de stockage de
 *       matières inflammables/comburantes — oxygène, acétylène)
 */
export const baseCompressedGasCriteria: InspectionItem[] = [
  {
    id: 'CGS-01-01',
    axis: 'تخزين الغازات المضغوطة',
    category: 'سلامة',
    criteria:
      'تخزين أسطوانات الغاز المضغوط (أسيتيلين، أكسجين، أو أي غاز مضغوط آخر) في وضع عمودي في موضع مهوّى طبيعياً أو بتهوية ميكانيكية، مثبّتة بحوامل أو سلاسل تمنع سقوطها، بعيداً عن مصادر الحرارة والاشتعال وعن أي مصدر لهب مكشوف.',
    legalReference:
      'القرار الوزاري المشترك المؤرخ في 16/07/1992 المتعلق بأسطوانات الغاز المضغوط (اشتراطات التخزين العمودي، التثبيت، الفصل بين الممتلئة والفارغة، التهوية ومسافات السلامة — الأداة القانونية الخاصة بأسطوانات الغاز في المنشآت الصناعية) + المرسوم التنفيذي 06-198 المادة 14 (دفتر الشروط يحدد الكميات القصوى وشروط التخزين المرخصة) + القانون 19-02 المادة 4 (الوقاية من الحريق في مناطق تخزين المواد القابلة للاشتعال والمؤكسدة — الأكسجين والأسيتيلين). [ملاحظة W50]: المرسوم 76-35 محذوف — يُطبَّق على المباني الشاهقة فقط (IGH) ولا يُنظِّم تخزين الأسطوانات في المنشآت الصناعية العامة.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'CGS-01-02',
    axis: 'تخزين الغازات المضغوطة',
    category: 'سلامة',
    criteria:
      'الفصل الواضح بين أسطوانات الغاز الممتلئة والفارغة في مناطق تخزين محددة وموسومة، لتفادي الخلط عند الاستخدام أو التسليم.',
    legalReference:
      'القانون 19-02 المادة 4 (تنظيم مخزون الغازات المضغوطة وتحديد مناطق التخزين لكل صنف).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'CGS-01-03',
    axis: 'تخزين الغازات المضغوطة',
    category: 'سلامة',
    criteria:
      'عدم تجاوز الحد الأقصى المعقول من عدد الأسطوانات المخزنة في الوقت ذاته (الكمية الضرورية للنشاط فقط)؛ والتحقق من أن الكميات الموجودة لا تتجاوز ما هو مرخص أو مذكور في دفتر الشروط المرفق برخصة الاستغلال عند الاقتضاء.',
    legalReference:
      'المرسوم التنفيذي 06-198 المادة 14 (دفتر الشروط يحدد الكميات القصوى المسموح بتخزينها).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
];
