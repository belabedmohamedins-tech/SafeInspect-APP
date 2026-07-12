// __tests__/services/decisionSupport.test.ts
import { suggestDecision } from '../../src/services/decisionSupport';
import { ScoringResult } from '../../src/utils/scoringUtils';
import { DifferentialView } from '../../src/services/differentialView';

function makeScoring(overrides: Partial<ScoringResult> = {}): ScoringResult {
  return {
    score: 80,
    grade: 'B',
    rawGrade: 'B',
    criticalOverride: false,
    violations: { high: 0, medium: 0, low: 0 },
    nextInspectionDays: 180,
    incomplete: false,
    riskLevel: 'medium',
    ...overrides,
  };
}

function makeDiff(overrides: Partial<DifferentialView> = {}): DifferentialView {
  return {
    hasUnresolvedPriorViolations: false,
    newViolations: [],
    resolved: [],
    persisted: [],
    improved: [],
    regressed: [],
    ...overrides,
  };
}

describe('suggestDecision', () => {
  it('grade A → close-file, urgency low', () => {
    const r = suggestDecision(makeScoring({ grade: 'A', rawGrade: 'A' }));
    expect(r.action).toBe('close-file');
    expect(r.urgency).toBe('low');
    expect(r.legalBasis).toContain('44');
  });

  it('grade B → schedule-routine, urgency low', () => {
    const r = suggestDecision(makeScoring({ grade: 'B' }));
    expect(r.action).toBe('schedule-routine');
    expect(r.urgency).toBe('low');
  });

  it('grade C, no prior → notice, urgency medium', () => {
    const r = suggestDecision(makeScoring({ grade: 'C', rawGrade: 'C' }));
    expect(r.action).toBe('notice');
    expect(r.urgency).toBe('medium');
  });

  it('grade C + unresolved prior → formal-warning, urgency high', () => {
    const r = suggestDecision(
      makeScoring({ grade: 'C' }),
      makeDiff({ hasUnresolvedPriorViolations: true }),
    );
    expect(r.action).toBe('formal-warning');
    expect(r.urgency).toBe('high');
  });

  it('grade D, no prior → formal-warning, urgency high', () => {
    const r = suggestDecision(makeScoring({ grade: 'D', rawGrade: 'D' }));
    expect(r.action).toBe('formal-warning');
    expect(r.urgency).toBe('high');
  });

  it('grade D + unresolved prior → partial-closure', () => {
    const r = suggestDecision(
      makeScoring({ grade: 'D' }),
      makeDiff({ hasUnresolvedPriorViolations: true }),
    );
    expect(r.action).toBe('partial-closure');
  });

  it('grade D + ≥3 high violations → immediate-closure, urgency critical', () => {
    const r = suggestDecision(
      makeScoring({ grade: 'D', violations: { high: 3, medium: 0, low: 0 } }),
    );
    expect(r.action).toBe('immediate-closure');
    expect(r.urgency).toBe('critical');
    expect(r.legalBasis).toContain('56');
  });

  it('unresolved + new violations → escalate-authority, urgency critical', () => {
    const r = suggestDecision(
      makeScoring({ grade: 'C' }),
      makeDiff({
        hasUnresolvedPriorViolations: true,
        newViolations: [{ id: 'v1' } as any],
      }),
    );
    expect(r.action).toBe('escalate-authority');
    expect(r.urgency).toBe('critical');
  });

  it('includes high violations in reasons', () => {
    const r = suggestDecision(makeScoring({ violations: { high: 2, medium: 0, low: 0 } }));
    expect(r.reasons.some(rs => rs.includes('2'))).toBe(true);
  });

  it('includes medium violations in reasons', () => {
    const r = suggestDecision(makeScoring({ violations: { high: 0, medium: 3, low: 0 } }));
    expect(r.reasons.some(rs => rs.includes('3'))).toBe(true);
  });

  it('includes criticalOverride in reasons', () => {
    const r = suggestDecision(makeScoring({ criticalOverride: true }));
    expect(r.reasons.some(rs => rs.includes('التجاوز الحرج'))).toBe(true);
  });

  it('includes incomplete in reasons', () => {
    const r = suggestDecision(makeScoring({ incomplete: true }));
    expect(r.reasons.some(rs => rs.includes('60'))).toBe(true);
  });

  it('adds resolved count to reasons when diff has resolved items', () => {
    const r = suggestDecision(
      makeScoring({ grade: 'B' }),
      makeDiff({ resolved: [{ id: 'v1' } as any, { id: 'v2' } as any] }),
    );
    expect(r.reasons.some(rs => rs.includes('2'))).toBe(true);
  });

  it('adds default reason when no contextual reasons', () => {
    const r = suggestDecision(makeScoring({ grade: 'A' }));
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it('works without diff argument (undefined)', () => {
    const r = suggestDecision(makeScoring({ grade: 'B' }));
    expect(r.action).toBe('schedule-routine');
    expect(r.additionalRefs).toBeDefined();
  });

  it('works with null diff', () => {
    const r = suggestDecision(makeScoring({ grade: 'B' }), null);
    expect(r.action).toBe('schedule-routine');
  });

  it('returns correct nextVisitDays from scoring', () => {
    const r = suggestDecision(makeScoring({ nextInspectionDays: 90 }));
    expect(r.nextVisitDays).toBe(90);
  });

  it('actionLabel matches action', () => {
    const r = suggestDecision(makeScoring({ grade: 'D', violations: { high: 3, medium: 0, low: 0 } }));
    expect(r.actionLabel).toBe('إغلاق فوري (خطر داهم)');
  });
});
