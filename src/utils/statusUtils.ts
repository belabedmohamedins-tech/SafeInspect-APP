// src/utils/statusUtils.ts
import { Colors } from '../../constants';
import { ComplianceStatus } from '../types';

/**
 * الحصول على النص العربي لحالة الامتثال
 */
export const getStatusText = (status: ComplianceStatus | 'partial'): string => {
  switch (status) {
    case 'compliant':
      return 'مطابق';
    case 'non-compliant':
      return 'غير مطابق';
    case 'na':
      return 'غير معني';
    case 'partial':
      return 'جزئي';
    // W27: explicit labels so printed report doesn't show "لم يقيم" for both
    case 'observation-only':
      return 'ملاحظة فقط';
    case 'unable-to-verify':
      return 'تعذّر التحقق';
    case 'not-evaluated':
      return 'لم يقيَّم';
    default:
      return 'لم يقيَّم';
  }
};

/**
 * الحصول على اللون المناسب لحالة الامتثال
 */
export const getStatusColor = (status: ComplianceStatus | 'partial'): string => {
  switch (status) {
    case 'compliant':
      return Colors.compliant;
    case 'non-compliant':
      return Colors.nonCompliant;
    case 'na':
      return '#9e9e9e';
    case 'partial':
      return Colors.warning;
    // W27: distinct colours so the two statuses are visually distinguishable
    case 'observation-only':
      return '#1565c0'; // blue — informational, not a violation
    case 'unable-to-verify':
      return '#6a1e99'; // purple — uncertain, requires follow-up
    case 'not-evaluated':
      return Colors.warning;
    default:
      return Colors.warning;
  }
};

/**
 * حساب ملخص الامتثال (عدد العناصر الكلي، المطابق، غير المطابق، غير المقيم)
 */
export const getComplianceSummary = (items: any[]) => {
  const total = items.length;
  const compliant = items.filter(i => i.complianceStatus === 'compliant').length;
  const nonCompliant = items.filter(i => i.complianceStatus === 'non-compliant').length;
  const na = items.filter(i => i.complianceStatus === 'na').length;
  const notEvaluated = total - compliant - nonCompliant - na;
  return { total, compliant, nonCompliant, na, notEvaluated };
};
