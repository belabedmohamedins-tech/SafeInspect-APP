// src/utils/scoringUtils.ts
//
// SCORING MODEL — Severity-Weighted Compliance with Critical Override
//
// Design rationale
// ─────────────────
// The previous system assigned arbitrary percentage weights to criterion
// *categories* (doc 15 %, clean 25 %, waste 30 %, health 30 %).  Those
// weights had no legal basis and could not be defended before a committee.
//
// This replacement derives weights solely from each criterion's `severity`
// field, which already exists on every criterion and reflects the legal
// gravity of the obligation it enforces:
//
//   high   → 3  (immediate risk to health / safety / environment)
//   medium → 2  (significant operational non-compliance)
//   low    → 1  (administrative / documentary non-compliance)
//
// The score is the severity-weighted compliance rate (0–100 %).
// The grade (A / B / C / D) is a *prioritisation tool only* — it carries no
// automatic legal consequence.  Legal decisions remain with the committee.
//
// Grade assignment — rules evaluated top-down, first match wins
// ──────────────────────────────────────────────────────────────
// Rule 1 (critical override):
//   ≥ FORCED_D_THRESHOLD  high violations → grade = D  (forced)
//   ≥ CEILING_C_THRESHOLD high violations → grade ≤ C  (ceiling)
// Rule 2 (score-based):
//   score ≥ GRADE_A_MIN AND no ceiling     → A
//   score ≥ GRADE_B_MIN AND no ceiling     → B
//   score ≥ GRADE_C_MIN                    → C
//   else                                   → D
//
// Minimum completion:
//   If < MIN_COMPLETION_PCT % of applicable items are evaluated the result
//   is flagged as incomplete and no grade is issued.
//
// All thresholds are exported constants so administrators can tune them
// without editing business logic.

import { InspectionItem, Severity } from '../types';

// ── Configurable thresholds ───────────────────────────────────────────────────
export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  high:   3,
  medium: 2,
  low:    1,
} as const;

export const GRADE_A_MIN = 85;   // score >= this → A (when no ceiling applies)
export const GRADE_B_MIN = 70;   // score >= this → B (when no ceiling applies)
export const GRADE_C_MIN = 50;   // score >= this → C; below → D

// Critical override thresholds — committee can adjust these values
export const CEILING_C_THRESHOLD = 1;   // >= N high violations → grade capped at C
export const FORCED_D_THRESHOLD  = 3;   // >= N high violations → grade forced to D

// Minimum fraction of applicable items that must be evaluated for a grade to
// be issued.  Below this the result is marked 'incomplete'.
export const MIN_COMPLETION_RATE = 0.60; // 60 %

// ── Types ─────────────────────────────────────────────────────────────────────
export type Grade = 'A' | 'B' | 'C' | 'D';

export type RiskLevel = 1 | 2 | 3 | 4;
// 1 → routine     (24-month inspection cycle)
// 2 → standard    (12-month cycle)
// 3 → priority    (6-month cycle)
// 4 → immediate   (30-day mandatory follow-up)

export interface ViolationProfile {
  high:   number;   // count of high-severity non-compliant items
  medium: number;
  low:    number;
  total:  number;
}

export interface ScoringResult {
  /** Severity-weighted compliance rate, 0–100. Always computed even when grade
   *  is overridden, so the inspector can see the underlying score. */
  score: number;

  /** Prioritisation grade A / B / C / D. */
  grade: Grade;

  /** Risk level 1–4 derived from the grade; maps to an inspection frequency. */
  riskLevel: RiskLevel;

  /** Counts of non-compliant items by severity. */
  violations: ViolationProfile;

  /** True when one or more critical override rules changed the raw grade. */
  criticalOverride: boolean;

  /** The grade that would have been issued from score alone (before override). */
  rawGrade: Grade;

  /** Number of items evaluated (compliant + non-compliant). */
  evaluatedCount: number;

  /** Number of applicable items (evaluated + not-evaluated; excludes NA). */
  applicableCount: number;

  /** Fraction of applicable items that were evaluated (0–1). */
  completionRate: number;

  /** True when completionRate < MIN_COMPLETION_RATE.  Grade is not meaningful. */
  incomplete: boolean;

  /** Recommended minimum days until the next inspection. */
  nextInspectionDays: number;

  /** Arabic disclaimer — must be included on every report that shows a grade. */
  disclaimer: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSeverityWeight(item: InspectionItem): number {
  return SEVERITY_WEIGHTS[item.severity] ?? SEVERITY_WEIGHTS.low;
}

function scoreToRawGrade(score: number): Grade {
  if (score >= GRADE_A_MIN) return 'A';
  if (score >= GRADE_B_MIN) return 'B';
  if (score >= GRADE_C_MIN) return 'C';
  return 'D';
}

function gradeToRiskLevel(grade: Grade): RiskLevel {
  switch (grade) {
    case 'A': return 1;
    case 'B': return 2;
    case 'C': return 3;
    case 'D': return 4;
  }
}

function riskLevelToNextInspectionDays(level: RiskLevel): number {
  switch (level) {
    case 1: return 730;   // 24 months
    case 2: return 365;   // 12 months
    case 3: return 180;   //  6 months
    case 4: return 30;    //  30 days (immediate follow-up)
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export function computeScoreAndGrade(items: InspectionItem[]): ScoringResult {
  // Partition items
  const compliantItems    = items.filter(i => i.complianceStatus === 'compliant');
  const nonCompliantItems = items.filter(i => i.complianceStatus === 'non-compliant');
  const evaluatedItems    = [...compliantItems, ...nonCompliantItems];

  // Applicable = everything that isn't NA (not-evaluated counts as applicable
  // because it *should* have been evaluated).
  const applicableItems = items.filter(i => i.complianceStatus !== 'na');

  const evaluatedCount  = evaluatedItems.length;
  const applicableCount = applicableItems.length;
  const completionRate  = applicableCount > 0 ? evaluatedCount / applicableCount : 0;
  const incomplete      = completionRate < MIN_COMPLETION_RATE;

  // Violation profile
  const violations: ViolationProfile = {
    high:   nonCompliantItems.filter(i => i.severity === 'high').length,
    medium: nonCompliantItems.filter(i => i.severity === 'medium').length,
    low:    nonCompliantItems.filter(i => i.severity === 'low').length,
    total:  nonCompliantItems.length,
  };

  // Severity-weighted score
  const compliantWeight = compliantItems.reduce((s, i) => s + getSeverityWeight(i), 0);
  const evaluatedWeight = evaluatedItems.reduce((s, i) => s + getSeverityWeight(i), 0);
  const score = evaluatedWeight > 0
    ? Math.round((compliantWeight / evaluatedWeight) * 1000) / 10  // 1 decimal place
    : 0;

  // Raw grade (score only, no override)
  const rawGrade = scoreToRawGrade(score);

  // Apply critical override rules
  let grade: Grade = rawGrade;
  let criticalOverride = false;

  if (violations.high >= FORCED_D_THRESHOLD) {
    // Rule 1a: forced D
    grade = 'D';
    criticalOverride = grade !== rawGrade;
  } else if (violations.high >= CEILING_C_THRESHOLD) {
    // Rule 1b: ceiling C
    if (rawGrade === 'A' || rawGrade === 'B') {
      grade = 'C';
      criticalOverride = true;
    }
  }

  const riskLevel          = gradeToRiskLevel(grade);
  const nextInspectionDays = riskLevelToNextInspectionDays(riskLevel);

  return {
    score,
    grade,
    riskLevel,
    violations,
    criticalOverride,
    rawGrade,
    evaluatedCount,
    applicableCount,
    completionRate,
    incomplete,
    nextInspectionDays,
    disclaimer:
      'هذا التصنيف (A, B, C, D) هو أداة إدارية لتحديد أولويات التفتيش. ' +
      'لا يُرتّب عليه أي أثر قانوني تلقائي. القرارات القانونية (الإنذار، ' +
      'الغلق، الغرامة) تتخذ من قبل السلطات المختصة وفقاً للقانون 03-10 ' +
      'والمرسوم التنفيذي 06-198.',
  };
}
