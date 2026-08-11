/**
 * src/__tests__/decisionSupport.test.ts
 * W56: test coverage for decisionSupport.ts
 *   — all 7 DecisionAction paths
 *   — grade boundary conditions (A/B/C/D)
 *   — critical override (forced-D, ceiling-C)
 *   — escalation via DifferentialView (unresolved + new)
 *   — incomplete inspection flag
 */
import { suggestDecision } from '../services/decisionSupport';
import type { ScoringResult } from '../utils/scoringUtils';
import type { DifferentialView } from '../services/differentialView';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeScoring(overrides: Partial<ScoringResult> = {}): ScoringResult {
  return {
    score: 90,
    grade: 'A',
    riskLevel: 1,
    violations: { high: 0, medium: 0, low: 0, total: 0 },
    criticalOverride: false,
    rawGrade: 'A',
    evaluatedCount: 10,
    applicableCount: 10,
    completionRate: 1,
    incomplete: false,
    nextInspectionDays: 730,
    disclaimer: '',
    ...overrides,
  };
}

function makeDiff(overrides: Partial<DifferentialView> = {}): DifferentialView {
  return {
    hasUnresolvedPriorViolations: false,
    resolved: [],
    newViolations: [],
    persisting: [],
    ...overrides,
  } as DifferentialView;
}

// ── Grade A — close-file ──────────────────────────────────────────────────────

describe('decisionSupport — Grade A', () => {
  it('returns close-file with urgency low', () => {
    const s = suggestDecision(makeScoring({ grade: 'A', score: 92 }));
    expect(s.action).toBe('close-file');
    expect(s.urgency).toBe('low');
    expect(s.legalBasis).toContain('44');
  });

  it('returns close-file even without diff', () => {
    const s = suggestDecision(makeScoring({ grade: 'A' }), null);
    expect(s.action).toBe('close-file');
  });
});

// ── Grade B — schedule-routine ───────────────────────────────────────────────

describe('decisionSupport — Grade B', () => {
  it('returns schedule-routine with urgency low', () => {
    const s = suggestDecision(makeScoring({ grade: 'B', score: 75 }));
    expect(s.action).toBe('schedule-routine');
    expect(s.urgency).toBe('low');
  });
});

// ── Grade C — notice / formal-warning ────────────────────────────────────────

describe('decisionSupport — Grade C', () => {
  it('returns notice when no unresolved prior violations', () => {
    const s = suggestDecision(
      makeScoring({ grade: 'C', score: 55 }),
      makeDiff({ hasUnresolvedPriorViolations: false }),
    );
    expect(s.action).toBe('notice');
    expect(s.urgency).toBe('medium');
  });

  it('returns formal-warning when there are unresolved prior violations', () => {
    const s = suggestDecision(
      makeScoring({ grade: 'C', score: 55 }),
      makeDiff({ hasUnresolvedPriorViolations: true, newViolations: [] }),
    );
    expect(s.action).toBe('formal-warning');
    expect(s.urgency).toBe('high');
    expect(s.legalBasis).toContain('48');
  });
});

// ── Grade D — formal-warning / partial-closure / immediate-closure ───────────

describe('decisionSupport — Grade D', () => {
  it('returns formal-warning for D with no prior unresolved', () => {
    const s = suggestDecision(
      makeScoring({ grade: 'D', score: 40, violations: { high: 1, medium: 0, low: 0, total: 1 } }),
      makeDiff({ hasUnresolvedPriorViolations: false }),
    );
    expect(s.action).toBe('formal-warning');
    expect(s.urgency).toBe('high');
    expect(s.legalBasis).toContain('54');
  });

  it('returns partial-closure for D with unresolved prior violations', () => {
    const s = suggestDecision(
      makeScoring({ grade: 'D', score: 38, violations: { high: 2, medium: 1, low: 0, total: 3 } }),
      makeDiff({ hasUnresolvedPriorViolations: true, newViolations: [] }),
    );
    expect(s.action).toBe('partial-closure');
    expect(s.urgency).toBe('high');
  });

  it('returns immediate-closure for D with ≥3 high violations', () => {
    const s = suggestDecision(
      makeScoring({
        grade: 'D',
        score: 20,
        violations: { high: 3, medium: 2, low: 0, total: 5 },
      }),
    );
    expect(s.action).toBe('immediate-closure');
    expect(s.urgency).toBe('critical');
    expect(s.legalBasis).toContain('56');
    expect(s.additionalRefs.some(r => r.includes('06-198'))).toBe(true);
  });

  it('returns immediate-closure for D with exactly 3 high violations (boundary)', () => {
    const s = suggestDecision(
      makeScoring({
        grade: 'D',
        score: 25,
        violations: { high: 3, medium: 0, low: 0, total: 3 },
      }),
    );
    expect(s.action).toBe('immediate-closure');
  });

  it('does NOT return immediate-closure for D with only 2 high violations', () => {
    const s = suggestDecision(
      makeScoring({
        grade: 'D',
        score: 30,
        violations: { high: 2, medium: 0, low: 0, total: 2 },
      }),
    );
    expect(s.action).not.toBe('immediate-closure');
  });
});

// ── Escalation path ───────────────────────────────────────────────────────────

describe('decisionSupport — escalation', () => {
  it('escalates when unresolved prior + new violations regardless of grade', () => {
    // Grade C but unresolved + new → escalate-authority takes priority
    const fakeItem = { id: 'x', complianceStatus: 'non-compliant' } as any;
    const s = suggestDecision(
      makeScoring({ grade: 'C', score: 55, violations: { high: 1, medium: 0, low: 0, total: 1 } }),
      makeDiff({
        hasUnresolvedPriorViolations: true,
        newViolations: [fakeItem],
      }),
    );
    expect(s.action).toBe('escalate-authority');
    expect(s.urgency).toBe('critical');
    expect(s.legalBasis).toContain('60');
    expect(s.additionalRefs.some(r => r.includes('06-198'))).toBe(true);
  });

  it('does NOT escalate when unresolved prior but no new violations', () => {
    const s = suggestDecision(
      makeScoring({ grade: 'C', score: 55 }),
      makeDiff({ hasUnresolvedPriorViolations: true, newViolations: [] }),
    );
    expect(s.action).not.toBe('escalate-authority');
  });
});

// ── Critical override flag ────────────────────────────────────────────────────

describe('decisionSupport — criticalOverride', () => {
  it('surfaces criticalOverride flag in the result', () => {
    const s = suggestDecision(
      makeScoring({ grade: 'D', criticalOverride: true, rawGrade: 'B' }),
    );
    expect(s.criticalOverride).toBe(true);
    expect(s.reasons.some(r => r.includes('تجاوز الحرج') || r.includes('override') || r.includes('قاعدة'))).toBe(true);
  });
});

// ── Incomplete inspection ─────────────────────────────────────────────────────

describe('decisionSupport — incomplete', () => {
  it('includes incomplete warning in reasons', () => {
    const s = suggestDecision(
      makeScoring({ incomplete: true, grade: 'B', completionRate: 0.4 }),
    );
    expect(s.reasons.some(r => r.includes('60') || r.includes('اكتمل') || r.includes('نسبة'))).toBe(true);
  });
});

// ── nextVisitDays mirrors riskLevel ───────────────────────────────────────────

describe('decisionSupport — nextVisitDays', () => {
  it('propagates nextInspectionDays from scoring result', () => {
    const s = suggestDecision(makeScoring({ grade: 'D', nextInspectionDays: 30 }));
    expect(s.nextVisitDays).toBe(30);
  });

  it('propagates 730 days for grade A', () => {
    const s = suggestDecision(makeScoring({ grade: 'A', nextInspectionDays: 730 }));
    expect(s.nextVisitDays).toBe(730);
  });
});

// ── reasons always non-empty ──────────────────────────────────────────────────

describe('decisionSupport — reasons always non-empty', () => {
  it('returns at least one reason even for a perfect inspection', () => {
    const s = suggestDecision(makeScoring());
    expect(s.reasons.length).toBeGreaterThanOrEqual(1);
  });
});
