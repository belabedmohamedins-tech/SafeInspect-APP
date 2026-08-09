// src/__tests__/decisionSupport.test.ts
// W30: full coverage of suggestDecision() decision tree.
// W39: ViolationProfile requires `total` field — added to all violation objects.
//      DifferentialView has no `persisted` field — renamed to `stillFailing`.
// W39b: scoring() helper was missing rawGrade, evaluatedCount, applicableCount,
//       completionRate — all required by ScoringResult. Added with safe defaults.
import { suggestDecision } from '../services/decisionSupport';
import type { ScoringResult } from '../utils/scoringUtils';
import type { DifferentialView } from '../services/differentialView';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoring(overrides: Partial<ScoringResult> = {}): ScoringResult {
  return {
    score: 85,
    grade: 'B',
    rawGrade: 'B',
    riskLevel: 2,
    violations: { high: 0, medium: 0, low: 0, total: 0 },
    criticalOverride: false,
    evaluatedCount: 10,
    applicableCount: 10,
    completionRate: 1.0,
    nextInspectionDays: 180,
    incomplete: false,
    disclaimer: '',
    ...overrides,
  };
}

function diff(overrides: Partial<DifferentialView> = {}): DifferentialView {
  return {
    all: [],
    hasUnresolvedPriorViolations: false,
    resolved: [],
    newViolations: [],
    stillFailing: [],
    priorInspection: null,
    ...overrides,
  };
}

// ─── Basic sanity ─────────────────────────────────────────────────────────────

describe('suggestDecision', () => {
  it('is a callable function', () => {
    expect(typeof suggestDecision).toBe('function');
  });

  // ─── Grade A — close-file ────────────────────────────────────────────────
  it('Grade A → close-file, urgency low', () => {
    const result = suggestDecision(scoring({ grade: 'A', rawGrade: 'A', score: 95 }));
    expect(result.action).toBe('close-file');
    expect(result.urgency).toBe('low');
    expect(result.criticalOverride).toBe(false);
    expect(result.reasons).toContain('لا توجد ملاحظات إضافية');
  });

  it('Grade A with no diff → legalBasis contains art.44', () => {
    const result = suggestDecision(scoring({ grade: 'A', rawGrade: 'A' }), null);
    expect(result.legalBasis).toContain('44');
  });

  // ─── Grade B — schedule-routine ──────────────────────────────────────────
  it('Grade B → schedule-routine, urgency low', () => {
    const result = suggestDecision(scoring({ grade: 'B', score: 78 }));
    expect(result.action).toBe('schedule-routine');
    expect(result.urgency).toBe('low');
  });

  it('Grade B returns nextVisitDays from scoring', () => {
    const result = suggestDecision(scoring({ grade: 'B', nextInspectionDays: 90 }));
    expect(result.nextVisitDays).toBe(90);
  });

  // ─── Grade C — notice ────────────────────────────────────────────────────
  it('Grade C, no unresolved → notice, urgency medium', () => {
    const result = suggestDecision(
      scoring({ grade: 'C', rawGrade: 'C', score: 62 }),
      diff({ hasUnresolvedPriorViolations: false }),
    );
    expect(result.action).toBe('notice');
    expect(result.urgency).toBe('medium');
  });

  it('Grade C + unresolved prior → formal-warning, urgency high', () => {
    const result = suggestDecision(
      scoring({ grade: 'C', rawGrade: 'C' }),
      diff({ hasUnresolvedPriorViolations: true }),
    );
    expect(result.action).toBe('formal-warning');
    expect(result.urgency).toBe('high');
    expect(result.reasons.some(r => r.includes('سابقة'))).toBe(true);
  });

  // ─── Grade D — formal-warning (no unresolved) ────────────────────────────
  it('Grade D, no unresolved, <3 high → formal-warning', () => {
    const result = suggestDecision(
      scoring({ grade: 'D', rawGrade: 'D', score: 45, violations: { high: 2, medium: 1, low: 0, total: 3 } }),
      diff({ hasUnresolvedPriorViolations: false }),
    );
    expect(result.action).toBe('formal-warning');
    expect(result.urgency).toBe('high');
  });

  // ─── Grade D + unresolved — partial-closure ──────────────────────────────
  it('Grade D + unresolved prior → partial-closure', () => {
    const result = suggestDecision(
      scoring({ grade: 'D', rawGrade: 'D', violations: { high: 1, medium: 0, low: 0, total: 1 } }),
      diff({ hasUnresolvedPriorViolations: true }),
    );
    expect(result.action).toBe('partial-closure');
    expect(result.urgency).toBe('high');
  });

  // ─── Grade D + ≥3 high — immediate-closure ───────────────────────────────
  it('Grade D + 3 high violations → immediate-closure, urgency critical', () => {
    const result = suggestDecision(
      scoring({ grade: 'D', rawGrade: 'D', violations: { high: 3, medium: 2, low: 0, total: 5 } }),
    );
    expect(result.action).toBe('immediate-closure');
    expect(result.urgency).toBe('critical');
    expect(result.legalBasis).toContain('56');
  });

  it('Grade D + 5 high violations → immediate-closure (takes precedence over unresolved)', () => {
    const result = suggestDecision(
      scoring({ grade: 'D', rawGrade: 'D', violations: { high: 5, medium: 0, low: 0, total: 5 } }),
      diff({ hasUnresolvedPriorViolations: true, newViolations: [{ id: 'X', criteria: 'X', severity: 'high', complianceStatus: 'non-compliant' } as any] }),
    );
    expect(result.action).toBe('immediate-closure');
  });

  // ─── Unresolved + new violations — escalate-authority ────────────────────
  it('Unresolved + new violations → escalate-authority, urgency critical', () => {
    const result = suggestDecision(
      scoring({ grade: 'C', rawGrade: 'C' }),
      diff({
        hasUnresolvedPriorViolations: true,
        newViolations: [{ id: 'Y', criteria: 'Y', severity: 'medium', complianceStatus: 'non-compliant' } as any],
      }),
    );
    expect(result.action).toBe('escalate-authority');
    expect(result.urgency).toBe('critical');
    expect(result.legalBasis).toContain('60');
  });

  // ─── Reasons population ───────────────────────────────────────────────────
  it('incomplete flag adds reason about 60%', () => {
    const result = suggestDecision(scoring({ incomplete: true, grade: 'B' }));
    expect(result.reasons.some(r => r.includes('60'))).toBe(true);
  });

  it('criticalOverride flag adds reason and is reflected in result', () => {
    const result = suggestDecision(scoring({ criticalOverride: true, grade: 'C', rawGrade: 'C' }));
    expect(result.criticalOverride).toBe(true);
    expect(result.reasons.some(r => r.includes('حرج'))).toBe(true);
  });

  it('medium violations appear in reasons', () => {
    const result = suggestDecision(scoring({ violations: { high: 0, medium: 3, low: 0, total: 3 }, grade: 'B' }));
    expect(result.reasons.some(r => r.includes('متوسطة'))).toBe(true);
  });

  it('resolved violations appear in reasons', () => {
    const result = suggestDecision(
      scoring({ grade: 'B' }),
      diff({ resolved: [{ id: 'R1', criteria: 'R1', severity: 'low', complianceStatus: 'compliant' } as any] }),
    );
    expect(result.reasons.some(r => r.includes('تم تصحيحها'))).toBe(true);
  });

  // ─── Return shape ─────────────────────────────────────────────────────────
  it('always returns all required fields', () => {
    const result = suggestDecision(scoring());
    expect(result).toHaveProperty('action');
    expect(result).toHaveProperty('actionLabel');
    expect(result).toHaveProperty('urgency');
    expect(result).toHaveProperty('rationale');
    expect(result).toHaveProperty('reasons');
    expect(result).toHaveProperty('legalBasis');
    expect(result).toHaveProperty('additionalRefs');
    expect(result).toHaveProperty('nextVisitDays');
    expect(result).toHaveProperty('criticalOverride');
  });

  it('actionLabel is always a non-empty string', () => {
    const result = suggestDecision(scoring({ grade: 'D', rawGrade: 'D', violations: { high: 4, medium: 0, low: 0, total: 4 } }));
    expect(typeof result.actionLabel).toBe('string');
    expect(result.actionLabel.length).toBeGreaterThan(0);
  });

  it('additionalRefs is an array', () => {
    const result = suggestDecision(scoring({ grade: 'A', rawGrade: 'A' }));
    expect(Array.isArray(result.additionalRefs)).toBe(true);
  });
});
