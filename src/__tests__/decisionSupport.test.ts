// src/__tests__/decisionSupport.test.ts
// L4 — domain-specific mocks only
// Covers all branches of suggestDecision:
//   • Grade A/B/C/D + immediate-closure + escalate-authority
//   • criticalOverride flag
//   • incomplete flag
//   • diff reasons (hasUnresolved, hasNewOnTop, resolved count)
//   • fallback reasons.push('لا توجد ملاحظات إضافية') when no reasons

import { suggestDecision, DecisionSuggestion } from '../../src/services/decisionSupport';
import { ScoringResult } from '../../src/utils/scoringUtils';
import { DifferentialView, DiffEntry } from '../../src/services/differentialView';

// ─── Factories ────────────────────────────────────────────────────────────────

function makeScoring(overrides: Partial<ScoringResult> = {}): ScoringResult {
  return {
    grade: 'B',
    score: 80,
    violations: { high: 0, medium: 0, low: 0 },
    criticalOverride: false,
    nextInspectionDays: 180,
    incomplete: false,
    riskLevel: 'low',
    ...overrides,
  };
}

function makeDiff(overrides: Partial<DifferentialView> = {}): DifferentialView {
  return {
    all: [],
    resolved: [],
    stillFailing: [],
    newViolations: [],
    hasUnresolvedPriorViolations: false,
    priorInspection: null,
    ...overrides,
  };
}

const fakeDiffEntry = {} as DiffEntry;

// ─── Grade A ──────────────────────────────────────────────────────────────────

describe('suggestDecision — Grade A', () => {
  it('returns close-file action with low urgency', () => {
    const result = suggestDecision(makeScoring({ grade: 'A', score: 96 }));
    expect(result.action).toBe('close-file');
    expect(result.urgency).toBe('low');
    expect(result.criticalOverride).toBe(false);
    expect(result.additionalRefs).toEqual([]);
  });

  it('includes default reason when no special conditions', () => {
    const result = suggestDecision(makeScoring({ grade: 'A' }));
    expect(result.reasons).toContain('لا توجد ملاحظات إضافية');
  });

  it('uses المادة 44 as legalBasis', () => {
    const result = suggestDecision(makeScoring({ grade: 'A' }));
    expect(result.legalBasis).toBe('المادة 44 من القانون 03-10');
  });
});

// ─── Grade B ──────────────────────────────────────────────────────────────────

describe('suggestDecision — Grade B', () => {
  it('returns schedule-routine with low urgency', () => {
    const result = suggestDecision(makeScoring({ grade: 'B' }));
    expect(result.action).toBe('schedule-routine');
    expect(result.urgency).toBe('low');
  });

  it('carries nextVisitDays from scoring', () => {
    const result = suggestDecision(makeScoring({ grade: 'B', nextInspectionDays: 270 }));
    expect(result.nextVisitDays).toBe(270);
  });
});

// ─── Grade C ──────────────────────────────────────────────────────────────────

describe('suggestDecision — Grade C', () => {
  it('returns notice with medium urgency when no unresolved', () => {
    const result = suggestDecision(makeScoring({ grade: 'C', violations: { high: 0, medium: 1, low: 0 } }));
    expect(result.action).toBe('notice');
    expect(result.urgency).toBe('medium');
  });

  it('escalates to formal-warning with high urgency when unresolved prior', () => {
    const diff = makeDiff({
      hasUnresolvedPriorViolations: true,
      stillFailing: [fakeDiffEntry],
    });
    const result = suggestDecision(
      makeScoring({ grade: 'C', violations: { high: 0, medium: 2, low: 0 } }),
      diff,
    );
    expect(result.action).toBe('formal-warning');
    expect(result.urgency).toBe('high');
    expect(result.reasons).toContain('مخالفات من الزيارة السابقة لم تُعالج');
  });
});

// ─── Grade D ──────────────────────────────────────────────────────────────────

describe('suggestDecision — Grade D', () => {
  it('returns formal-warning when no unresolved', () => {
    const result = suggestDecision(
      makeScoring({ grade: 'D', violations: { high: 1, medium: 0, low: 0 } }),
    );
    expect(result.action).toBe('formal-warning');
    expect(result.urgency).toBe('high');
  });

  it('returns partial-closure when hasUnresolved and grade D', () => {
    const diff = makeDiff({
      hasUnresolvedPriorViolations: true,
      stillFailing: [fakeDiffEntry],
    });
    const result = suggestDecision(
      makeScoring({ grade: 'D', violations: { high: 2, medium: 0, low: 0 } }),
      diff,
    );
    expect(result.action).toBe('partial-closure');
    expect(result.legalBasis).toBe('المادة 54 من القانون 03-10');
  });

  it('returns immediate-closure when grade D + >=3 high violations', () => {
    const result = suggestDecision(
      makeScoring({ grade: 'D', violations: { high: 3, medium: 0, low: 0 } }),
    );
    expect(result.action).toBe('immediate-closure');
    expect(result.urgency).toBe('critical');
    expect(result.legalBasis).toBe('المادة 56 من القانون 03-10');
    expect(result.additionalRefs).toContain('المرسوم التنفيذي 06-198 المادة 22');
  });

  it('immediate-closure takes priority even over escalation (D + 3 high + unresolved + new)', () => {
    const diff = makeDiff({
      hasUnresolvedPriorViolations: true,
      stillFailing: [fakeDiffEntry],
      newViolations: [fakeDiffEntry],
    });
    const result = suggestDecision(
      makeScoring({ grade: 'D', violations: { high: 4, medium: 0, low: 0 } }),
      diff,
    );
    expect(result.action).toBe('immediate-closure');
  });
});

// ─── Escalate authority ───────────────────────────────────────────────────────

describe('suggestDecision — escalate-authority', () => {
  it('escalates when hasUnresolved AND new violations on top', () => {
    const diff = makeDiff({
      hasUnresolvedPriorViolations: true,
      stillFailing: [fakeDiffEntry],
      newViolations: [fakeDiffEntry, fakeDiffEntry],
    });
    const result = suggestDecision(
      makeScoring({ grade: 'C', violations: { high: 1, medium: 1, low: 0 } }),
      diff,
    );
    expect(result.action).toBe('escalate-authority');
    expect(result.urgency).toBe('critical');
    expect(result.legalBasis).toBe('المادة 60 من القانون 03-10');
    expect(result.additionalRefs).toContain('المرسوم التنفيذي 06-198 المادة 30');
    expect(result.reasons).toContain('2 مخالفة جديدة ظهرت منذ الزيارة السابقة');
    expect(result.reasons).toContain('مخالفات من الزيارة السابقة لم تُعالج');
  });
});

// ─── Reason accumulation ──────────────────────────────────────────────────────

describe('suggestDecision — reasons accumulation', () => {
  it('adds incomplete reason', () => {
    const result = suggestDecision(makeScoring({ grade: 'B', incomplete: true }));
    expect(result.reasons).toContain('لم تكتمل نسبة التقييم المطلوبة (أقل من 60 ٪ من البنود المُقيَّمة)');
  });

  it('adds high violation reason', () => {
    const result = suggestDecision(makeScoring({ grade: 'C', violations: { high: 2, medium: 0, low: 0 } }));
    expect(result.reasons).toContain('2 مخالفة عالية الخطورة مسجّلة');
  });

  it('adds medium violation reason', () => {
    const result = suggestDecision(makeScoring({ grade: 'C', violations: { high: 0, medium: 3, low: 0 } }));
    expect(result.reasons).toContain('3 مخالفة متوسطة الخطورة');
  });

  it('adds criticalOverride reason', () => {
    const result = suggestDecision(makeScoring({ grade: 'C', criticalOverride: true }));
    expect(result.reasons).toContain('تم تطبيق قاعدة التجاوز الحرج — التصنيف أسوأ من الدرجة الخام');
  });

  it('adds resolved count reason', () => {
    const diff = makeDiff({ resolved: [fakeDiffEntry, fakeDiffEntry] });
    const result = suggestDecision(makeScoring({ grade: 'B' }), diff);
    expect(result.reasons).toContain('2 مخالفة تم تصحيحها منذ الزيارة السابقة');
  });

  it('includes actionLabel from ACTION_LABELS map', () => {
    const result = suggestDecision(makeScoring({ grade: 'A' }));
    expect(result.actionLabel).toBe('إغلاق الملف — مطابقة كاملة');
  });
});
