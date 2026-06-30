// src/services/decisionSupport.ts
//
// DECISION SUPPORT — Phase 6
// ─────────────────────────
// Pure function that derives a structured DecisionSuggestion from a
// ScoringResult and (optionally) a DifferentialView.  It never writes to
// storage; the caller decides what to do with the suggestion.
//
// Legal framework: Algerian law 03-10 (environmental protection) and
// Executive Decree 06-198 (inspection procedures).  All suggested actions
// map to real articles — the inspector must confirm before acting.

import { ScoringResult, Grade } from '../utils/scoringUtils';
import { DifferentialView } from './differentialView';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DecisionAction =
  | 'close-file'          // Grade A — full compliance, file closed
  | 'schedule-routine'   // Grade A/B — routine follow-up
  | 'notice'             // Grade B/C — formal notice
  | 'formal-warning'     // Grade C — formal warning (إنذار رسمي)
  | 'partial-closure'    // Grade D or unresolved repeat violations
  | 'immediate-closure'  // Grade D + ≥3 high violations (imminent danger)
  | 'escalate-authority';// Unresolved prior + new violations → refer to wilaya

export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export interface DecisionSuggestion {
  /** Main recommended administrative action. */
  action: DecisionAction;

  /** Human-readable Arabic label for the action. */
  actionLabel: string;

  /** Urgency level — drives badge colour in the UI. */
  urgency: Urgency;

  /** Short Arabic rationale (1–2 sentences). */
  rationale: string;

  /** Ordered list of supporting reasons (Arabic). */
  reasons: string[];

  /** Primary legal basis (article citation). */
  legalBasis: string;

  /** Secondary legal references if applicable. */
  additionalRefs: string[];

  /** Recommended days until next visit (mirrors riskLevel). */
  nextVisitDays: number;

  /** True when a critical override was applied (grade worse than raw score). */
  criticalOverride: boolean;
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<DecisionAction, string> = {
  'close-file':        'إغلاق الملف — مطابقة كاملة',
  'schedule-routine':  'جدولة زيارة متابعة دورية',
  'notice':            'توجيه ملاحظة رسمية',
  'formal-warning':    'إصدار إنذار رسمي',
  'partial-closure':   'إغلاق جزئي أو وقف نشاط',
  'immediate-closure': 'إغلاق فوري (خطر داهم)',
  'escalate-authority':'إحالة إلى السلطة الولائية',
};

// ─── Core logic ───────────────────────────────────────────────────────────────

export function suggestDecision(
  scoring: ScoringResult,
  diff?: DifferentialView | null,
): DecisionSuggestion {
  const { grade, violations, criticalOverride, nextInspectionDays, incomplete } = scoring;

  const reasons: string[] = [];
  const additionalRefs: string[] = [];
  let action: DecisionAction;
  let urgency: Urgency;
  let legalBasis: string;
  let rationale: string;

  // ── Collect contextual reasons ─────────────────────────────────────────────
  if (incomplete) {
    reasons.push('لم تكتمل نسبة التقييم المطلوبة (أقل من 60 ٪ من البنود المُقيَّمة)');
  }
  if (violations.high > 0) {
    reasons.push(`${violations.high} مخالفة عالية الخطورة مسجّلة`);
  }
  if (violations.medium > 0) {
    reasons.push(`${violations.medium} مخالفة متوسطة الخطورة`);
  }
  if (criticalOverride) {
    reasons.push('تم تطبيق قاعدة التجاوز الحرج — التصنيف أسوأ من الدرجة الخام');
  }

  const hasUnresolved = diff?.hasUnresolvedPriorViolations ?? false;
  const hasNewOnTop   = diff ? diff.newViolations.length > 0 : false;
  const resolvedCount = diff?.resolved.length ?? 0;

  if (hasUnresolved) {
    reasons.push('مخالفات من الزيارة السابقة لم تُعالج');
  }
  if (hasNewOnTop) {
    reasons.push(`${diff!.newViolations.length} مخالفة جديدة ظهرت منذ الزيارة السابقة`);
  }
  if (resolvedCount > 0) {
    reasons.push(`${resolvedCount} مخالفة تم تصحيحها منذ الزيارة السابقة`);
  }

  // ── Decision tree ──────────────────────────────────────────────────────────
  // Priority: imminent danger → escalation → grade-based

  if (grade === 'D' && violations.high >= 3) {
    // Imminent danger — immediate closure
    action    = 'immediate-closure';
    urgency   = 'critical';
    legalBasis = 'المادة 56 من القانون 03-10';
    additionalRefs.push('المرسوم التنفيذي 06-198 المادة 22');
    rationale = 'وجود 3 مخالفات أو أكثر عالية الخطورة يُشكّل خطراً داهماً يستوجب الإغلاق الفوري وفق المادة 56.';

  } else if (hasUnresolved && hasNewOnTop) {
    // Unresolved + new violations → escalate
    action    = 'escalate-authority';
    urgency   = 'critical';
    legalBasis = 'المادة 60 من القانون 03-10';
    additionalRefs.push('المرسوم التنفيذي 06-198 المادة 30');
    rationale = 'مخالفات متكررة غير مُصحَّحة مع ظهور مخالفات جديدة — يُوجب الإحالة إلى السلطة الولائية.';

  } else if (grade === 'D') {
    action    = hasUnresolved ? 'partial-closure' : 'formal-warning';
    urgency   = 'high';
    legalBasis = 'المادة 54 من القانون 03-10';
    additionalRefs.push('المرسوم التنفيذي 06-198 المادة 18');
    rationale = hasUnresolved
      ? 'درجة D مع مخالفات سابقة غير مُعالجة — يُقترح الإغلاق الجزئي أو وقف النشاط.'
      : 'درجة D تستلزم إصدار إنذار رسمي وتحديد مهلة للتصحيح.';

  } else if (grade === 'C') {
    action    = hasUnresolved ? 'formal-warning' : 'notice';
    urgency   = hasUnresolved ? 'high' : 'medium';
    legalBasis = 'المادة 48 من القانون 03-10';
    rationale = hasUnresolved
      ? 'درجة C مع مخالفات سابقة غير مُعالجة — الإنذار الرسمي هو الإجراء المناسب.'
      : 'درجة C — توجيه ملاحظة رسمية مع تحديد إجراءات تصحيحية.';

  } else if (grade === 'B') {
    action    = 'schedule-routine';
    urgency   = 'low';
    legalBasis = 'المادة 44 من القانون 03-10';
    rationale = 'درجة B — مستوى امتثال مقبول. يُكتفى بجدولة زيارة متابعة دورية.';

  } else {
    // Grade A
    action    = 'close-file';
    urgency   = 'low';
    legalBasis = 'المادة 44 من القانون 03-10';
    rationale = 'درجة A — مطابقة كاملة. يمكن إغلاق الملف أو جدولة زيارة روتينية بعد 24 شهراً.';
  }

  if (reasons.length === 0) {
    reasons.push('لا توجد ملاحظات إضافية');
  }

  return {
    action,
    actionLabel: ACTION_LABELS[action],
    urgency,
    rationale,
    reasons,
    legalBasis,
    additionalRefs,
    nextVisitDays: nextInspectionDays,
    criticalOverride,
  };
}
