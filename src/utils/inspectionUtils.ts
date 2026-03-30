// src/utils/inspectionUtils.ts
import { InspectionItem } from '../types';

/**
 * حساب عدد العناصر التي تم تقييمها
 */
export const getEvaluatedCount = (items: InspectionItem[]): number => {
  return items.filter(item => item.complianceStatus !== 'not-evaluated').length;
};

/**
 * حساب نسبة التقدم
 */
export const getProgressPercent = (items: InspectionItem[]): number => {
  const total = items.length;
  if (total === 0) return 0;
  const evaluated = getEvaluatedCount(items);
  return (evaluated / total) * 100;
};

/**
 * تجميع العناصر حسب المحور
 */
export const groupByAxis = (items: InspectionItem[]) => {
  const groups: { [key: string]: InspectionItem[] } = {};
  items.forEach(item => {
    const axis = item.axis || 'أخرى';
    if (!groups[axis]) groups[axis] = [];
    groups[axis].push(item);
  });
  return Object.entries(groups).map(([title, data]) => ({
    title,
    data,
  }));
};

/**
 * حساب تقدم كل محور
 */
export const getAxisProgress = (items: InspectionItem[]) => {
  const groups = groupByAxis(items);
  return groups.map(group => ({
    title: group.title,
    total: group.data.length,
    evaluated: group.data.filter(item => item.complianceStatus !== 'not-evaluated').length,
  }));
};