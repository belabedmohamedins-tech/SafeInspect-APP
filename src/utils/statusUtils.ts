// src/utils/statusUtils.ts
import { ComplianceStatus } from '../types';

/**
 * الحصول على النص العربي لحالة الامتثال
 */
export const getStatusText = (status: ComplianceStatus): string => {
  switch (status) {
    case 'compliant':
      return 'مطابق';
    case 'non-compliant':
      return 'غير مطابق';
    case 'na':
      return 'غير معني';
    default:
      return 'لم يقيم';
  }
};

/**
 * الحصول على اللون المناسب لحالة الامتثال
 */
export const getStatusColor = (status: ComplianceStatus): string => {
  switch (status) {
    case 'compliant':
      return '#27ae60';
    case 'non-compliant':
      return '#e74c3c';
    case 'na':
      return '#9e9e9e';
    default:
      return '#f39c12';
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