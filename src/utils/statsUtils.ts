// src/utils/statsUtils.ts
import { SavedInspection } from '../types';

export interface StatsCache {
  total: number;
  gradeCounts: { A: number; B: number; C: number; D: number };
  averageScore: number | string;
  lastUpdated: number;
}

export const computeStats = (inspections: SavedInspection[]): StatsCache => {
  let total = inspections.length;
  let gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
  let totalScore = 0;
  let validScoreCount = 0;

  inspections.forEach(ins => {
    if (ins.grade === 'A') gradeCounts.A++;
    else if (ins.grade === 'B') gradeCounts.B++;
    else if (ins.grade === 'C') gradeCounts.C++;
    else if (ins.grade === 'D') gradeCounts.D++;

    if (typeof ins.score === 'number') {
      totalScore += ins.score;
      validScoreCount++;
    }
  });

  const averageScore = validScoreCount > 0 ? totalScore / validScoreCount : 0;

  return {
    total,
    gradeCounts,
    averageScore: averageScore === 0 ? 'N/A' : averageScore.toFixed(1),
    lastUpdated: Date.now(),
  };
};