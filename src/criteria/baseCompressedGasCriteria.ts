import { InspectionItem } from '../types';

/**
 * Shared compressed-gas storage criteria.
 * Covers any facility that stores pressurised gas cylinders on-site
 * (welding gases: acetylene, oxygen — and by extension LPG bottles).
 *
 * Usage:
 *   - blacksmithCriteria.ts  → imports CGS-01, CGS-02, CGS-03 (welding-gas context)
 *   - gplCriteria.ts already has equivalent GPL-02-01/02/03; align wording on next GPL rework.
 */
export const baseCompressedGasCriteria: InspectionItem[] = [
  {
    id: 'CGS-01-01',
    axis: 'تخزين الغازات المضغوطة',
    category: 'سلامة',
    criteria:
      'تخزين أسطوانات الغاز المضغوط (أسيتيلين، أكسجين، أو أي غاز مضغوط آخر) في وضع عمودي في موضع مهوّى طبيعياً أو بتهوية ميكانيكية، مثبّتة بحوامل أو سلاسل تمنع سقوطها، بعيداً عن مصادر الحرارة والاشتعال وعن أي مصدر لهب مكشوف.',
    legalReference:
      'القانون 19-02 المادة 4 (الوقاية من الحريق في مناطق تخزين المواد القابلة للاشتعال) + المرسوم التنفيذي 76-35 (اشتراطات السلامة في مناطق تخزين الغازات المضغوطة).',
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
