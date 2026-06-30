// src/services/decisionSupport.ts
// Phase 6 — Decision Support / Suggested Next Step
//
// Pure logic: no React, no AsyncStorage, no side effects.
// Input:  the finalised InspectionItem[] from a completed checklist session.
// Output: a SuggestedDecision that the UI renders and the inspector may override.

import { InspectionItem } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escalation tier derived from Décret Exécutif 06-198 (art. 20-24).
 *
 * | Tier | Arabic label            | Legal basis         |
 * |------|-------------------------|---------------------|
 * | 0    | لا إجراء                | —                   |
 * | 1    | ملاحظات كتابية          | art. 20 para. 1     |
 * | 2    | إنذار رسمي (إعذار)      | art. 20 para. 2     |
 * | 3    | إحالة على الوالي        | art. 22             |
 * | 4    | إحالة على النيابة العامة | art. 24             |
 */
export type EscalationTier = 0 | 1 | 2 | 3 | 4;

export interface SuggestedDecision {
  /** Computed escalation tier (0 = no action). */
  tier: EscalationTier;
  /** Short Arabic label for this tier. */
  tierLabel: string;
  /** Colour to represent the tier in the UI (hex). */
  tierColour: string;
  /** Article reference(s) from Décret 06-198 to surface in the UI. */
  articleRef: string;
  /** Count of non-compliant items. */
  nonCompliantCount: number;
  /** Count of non-compliant items flagged as repeat violations. */
  repeatViolationCount: number;
  /** True when at least one high-severity repeat violation was found. */
  hasHighSeverityRepeat: boolean;
  /** True when the inspector should be forced to enter an override reason
   *  before they can deviate from this suggestion. */
  overrideRequired: boolean;
  /** Total evaluated items (excludes 'not-evaluated' and 'na'). */
  evaluatedCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier meta
// ─────────────────────────────────────────────────────────────────────────────

const TIER_META: Record<
  EscalationTier,
  { label: string; colour: string; article: string }
> = {
  0: {
    label: 'لا إجراء',
    colour: '#437a22',   // success green
    article: '—',
  },
  1: {
    label: 'ملاحظات كتابية',
    colour: '#d19900',   // gold
    article: 'المادة 20 الفقرة 1 من المرسوم 06-198',
  },
  2: {
    label: 'إنذار رسمي (إعذار)',
    colour: '#da7101',   // orange
    article: 'المادة 20 الفقرة 2 من المرسوم 06-198',
  },
  3: {
    label: 'إحالة على الوالي',
    colour: '#a12c7b',   // error pink
    article: 'المادة 22 من المرسوم 06-198',
  },
  4: {
    label: 'إحالة على النيابة العامة',
    colour: '#a13544',   // notification red
    article: 'المادة 24 من المرسوم 06-198',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Core logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives the suggested escalation decision from a set of inspection items.
 *
 * Rules (in order of priority — first match wins):
 *
 * Tier 4 — court referral
 *   • ≥ 2 high-severity repeat violations
 *
 * Tier 3 — Wali referral
 *   • 1 high-severity repeat violation
 *   OR
 *   • non-compliant items ≥ 40 % of evaluated items AND ≥ 1 repeat violation
 *
 * Tier 2 — formal notice (mise en demeure)
 *   • non-compliant items ≥ 30 % of evaluated items
 *   OR
 *   • ≥ 3 high-severity non-compliant items (no repeat required)
 *
 * Tier 1 — written observations
 *   • any non-compliant items (medium or low only, or < 30 %)
 *
 * Tier 0 — no action
 *   • zero non-compliant items among evaluated items
 */
export function suggestDecision(items: InspectionItem[]): SuggestedDecision {
  // --- count relevant items ---
  const evaluated = items.filter(
    (i) => i.complianceStatus !== 'not-evaluated' && i.complianceStatus !== 'na',
  );
  const nonCompliant = evaluated.filter(
    (i) => i.complianceStatus === 'non-compliant',
  );
  const repeatViolations = nonCompliant.filter((i) => i.isRepeatViolation);
  const highSeverityRepeats = repeatViolations.filter(
    (i) => i.severity === 'high',
  );
  const highSeverityNonCompliant = nonCompliant.filter(
    (i) => i.severity === 'high',
  );

  const evaluatedCount = evaluated.length;
  const nonCompliantCount = nonCompliant.length;
  const repeatViolationCount = repeatViolations.length;
  const hasHighSeverityRepeat = highSeverityRepeats.length > 0;

  const nonCompliantRatio =
    evaluatedCount > 0 ? nonCompliantCount / evaluatedCount : 0;

  // --- tier decision ---
  let tier: EscalationTier;

  if (highSeverityRepeats.length >= 2) {
    tier = 4;
  } else if (
    highSeverityRepeats.length >= 1 ||
    (nonCompliantRatio >= 0.4 && repeatViolationCount > 0)
  ) {
    tier = 3;
  } else if (
    nonCompliantRatio >= 0.3 ||
    highSeverityNonCompliant.length >= 3
  ) {
    tier = 2;
  } else if (nonCompliantCount > 0) {
    tier = 1;
  } else {
    tier = 0;
  }

  const meta = TIER_META[tier];

  return {
    tier,
    tierLabel: meta.label,
    tierColour: meta.colour,
    articleRef: meta.article,
    nonCompliantCount,
    repeatViolationCount,
    hasHighSeverityRepeat,
    // Override is required (must enter reason) for tier ≥ 3
    overrideRequired: tier >= 3,
    evaluatedCount,
  };
}
