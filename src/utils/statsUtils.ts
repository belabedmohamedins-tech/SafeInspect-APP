// src/utils/statsUtils.ts
import { SavedInspection } from '../types';

export interface StatsCache {
  total:        number;
  gradeCounts:  { A: number; B: number; C: number; D: number };
  /** Severity-weighted average score across all completed inspections. */
  averageScore: number | string;
  /** Total high-severity violations found across all inspections. */
  totalHighViolations: number;
  /** Count of inspections where a critical override was applied. */
  criticalOverrideCount: number;
  lastUpdated:  number;
}

export const computeStats = (inspections: SavedInspection[]): StatsCache => {
  const total       = inspections.length;
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
  let totalScore    = 0;
  let validScoreCount = 0;
  let totalHighViolations   = 0;
  let criticalOverrideCount = 0;

  inspections.forEach(ins => {
    if      (ins.grade === 'A') gradeCounts.A++;
    else if (ins.grade === 'B') gradeCounts.B++;
    else if (ins.grade === 'C') gradeCounts.C++;
    else if (ins.grade === 'D') gradeCounts.D++;

    if (typeof ins.score === 'number') {
      totalScore += ins.score;
      validScoreCount++;
    }

    if (ins.violations?.high) {
      totalHighViolations += ins.violations.high;
    }

    if (ins.criticalOverride) {
      criticalOverrideCount++;
    }
  });

  // Guard on validScoreCount — not on the computed value — so a genuine
  // average of 0% is displayed as '0.0' rather than 'N/A'.
  const avg = validScoreCount > 0 ? totalScore / validScoreCount : 0;

  return {
    total,
    gradeCounts,
    averageScore:         validScoreCount === 0 ? 'N/A' : avg.toFixed(1),
    totalHighViolations,
    criticalOverrideCount,
    lastUpdated:          Date.now(),
  };
};
