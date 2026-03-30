// src/utils/scoringUtils.ts
import { InspectionItem } from '../types';

type IndicatorKey = 'doc' | 'clean' | 'waste' | 'health';

const categoryToIndicator: Record<string, IndicatorKey> = {
  'تنظيمية': 'doc',
  'نظافة': 'clean',
  'بيئية': 'waste',
  'صحيه': 'health',
  'سلامة': 'health',
  'عامة': 'clean',
};

const weights: Record<IndicatorKey, number> = {
  doc: 0.15,
  clean: 0.25,
  waste: 0.30,
  health: 0.30,
};

function getIndicatorForItem(item: InspectionItem): IndicatorKey {
  const category = item.category;
  if (category && categoryToIndicator[category]) {
    return categoryToIndicator[category];
  }
  const axis = item.axis || '';
  if (axis.includes('هوية') || axis.includes('وثائق')) return 'doc';
  if (axis.includes('نظافة') || axis.includes('تهيئة')) return 'clean';
  if (axis.includes('مياه') || axis.includes('نفايات')) return 'waste';
  if (axis.includes('صحة') || axis.includes('سلامة')) return 'health';
  return 'clean';
}

function computeIndicatorScore(items: InspectionItem[], indicator: IndicatorKey): number | null {
  const relevant = items.filter(item => getIndicatorForItem(item) === indicator);
  const evaluated = relevant.filter(item => item.complianceStatus === 'compliant' || item.complianceStatus === 'non-compliant');
  if (evaluated.length === 0) return null;
  const compliant = evaluated.filter(item => item.complianceStatus === 'compliant').length;
  return (compliant / evaluated.length) * 100;
}

export function computeScoreAndGrade(items: InspectionItem[]): {
  score: number | undefined;
  grade: string | undefined;
  indicators: {
    doc: number | null;
    clean: number | null;
    waste: number | null;
    health: number | null;
  };
} {
  const indicatorScores: Record<IndicatorKey, number | null> = {
    doc: computeIndicatorScore(items, 'doc'),
    clean: computeIndicatorScore(items, 'clean'),
    waste: computeIndicatorScore(items, 'waste'),
    health: computeIndicatorScore(items, 'health'),
  };

  let totalWeight = 0;
  let weightedSum = 0;
  for (const key of Object.keys(weights) as IndicatorKey[]) {
    const score = indicatorScores[key];
    if (score !== null) {
      weightedSum += score * weights[key];
      totalWeight += weights[key];
    }
  }

  if (totalWeight === 0) {
    return { score: undefined, grade: undefined, indicators: indicatorScores };
  }

  const finalScore = weightedSum / totalWeight;
  let grade: string | undefined;
  if (finalScore >= 85) grade = 'A';
  else if (finalScore >= 70) grade = 'B';
  else if (finalScore >= 50) grade = 'C';
  else grade = 'D';

  return {
    score: Math.round(finalScore * 10) / 10,
    grade,
    indicators: indicatorScores,
  };
}