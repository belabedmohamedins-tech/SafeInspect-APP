// src/utils/inspectionUtils.ts
import { InspectionItem } from '../types';

export const getEvaluatedCount = (items: InspectionItem[]): number => {
  return items.filter(item => item.complianceStatus !== 'not-evaluated').length;
};

export const getProgressPercent = (items: InspectionItem[]): number => {
  const total = items.length;
  if (total === 0) return 0;
  const evaluated = getEvaluatedCount(items);
  return (evaluated / total) * 100;
};

export const groupByAxisRaw = (items: InspectionItem[]): [string, InspectionItem[]][] => {
  const groups: { [key: string]: InspectionItem[] } = {};
  items.forEach(item => {
    const axis = item.axis || 'أخرى';
    if (!groups[axis]) groups[axis] = [];
    groups[axis].push(item);
  });
  return Object.entries(groups);
};

export const groupByAxis = (items: InspectionItem[]) => {
  return groupByAxisRaw(items).map(([title, data]) => ({ title, data }));
};

export const getAxisProgress = (items: InspectionItem[]) => {
  const groups = groupByAxis(items);
  return groups.map(group => ({
    title: group.title,
    total: group.data.length,
    evaluated: group.data.filter(item => item.complianceStatus !== 'not-evaluated').length,
  }));
};