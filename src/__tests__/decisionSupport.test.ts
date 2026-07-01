// src/__tests__/decisionSupport.test.ts
//
// Full branch coverage for suggestDecision() in src/services/decisionSupport.ts.
// Lines targeted: 96-164 (all decision tree branches + reason collection).

import { suggestDecision } from '../services/decisionSupport';
import type { ScoringResult } from '../utils/scoringUtils';
import type { DifferentialView } from '../services/differentialView';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoring = (overrides: Partial<ScoringResult> = {}): ScoringResult => ({
  grade: 'B',
  score: 80,
  maxScore: 100,
  percentage: 80,
  violations: { high: 0, medium: 0, low: 0 },
  criticalOverride: false,
  nextInspectionDays: 365,
  incomplete: false,
  riskLevel: 'low',
  ...overrides,
});

const diff = (overrides: Partial<DifferentialView> = {}): DifferentialView => ({
  hasUnresolvedPriorViolations: false,
  newViolations: [],
  resolved: [],
  persisting: [],
  improved: false,
  worsened: false,
  ...overrides,
} as DifferentialView);

// ─── Grade A ──────────────────────────────────────────────────────────────────

describe('Grade A', () => {
  it('returns close-file action with low urgency', () => {
    const s = suggestDecision(scoring({ grade: 'A' }));
    expect(s.action).toBe('close-file');
    expect(s.urgency).toBe('low');
  });

  it('includes no-notes reason when nothing is wrong', () => {
    const s = suggestDecision(scoring({ grade: 'A' }));
    expect(s.reasons).toContain('لا توجد ملاحظات إضافية');
  });

  it('sets nextVisitDays from scoring result', () => {
    const s = suggestDecision(scoring({ grade: 'A', nextInspectionDays: 730 }));
    expect(s.nextVisitDays).toBe(730);
  });
});

// ─── Grade B ──────────────────────────────────────────────────────────────────

describe('Grade B', () => {
  it('returns schedule-routine action', () => {
    const s = suggestDecision(scoring({ grade: 'B' }));
    expect(s.action).toBe('schedule-routine');
    expect(s.urgency).toBe('low');
  });
});

// ─── Grade C — no prior violations ───────────────────────────────────────────

describe('Grade C — no prior violations', () => {
  it('returns notice action with medium urgency', () => {
    const s = suggestDecision(scoring({ grade: 'C', violations: { high: 0, medium: 2, low: 0 } }));
    expect(s.action).toBe('notice');
    expect(s.urgency).toBe('medium');
  });

  it('includes medium-violation reason', () => {
    const s = suggestDecision(scoring({ grade: 'C', violations: { high: 0, medium: 2, low: 0 } }));
    expect(s.reasons.some(r => r.includes('متوسطة'))).toBe(true);
  });
});

// ─── Grade C — with unresolved prior violations ───────────────────────────────

describe('Grade C — with unresolved prior violations', () => {
  it('escalates to formal-warning with high urgency', () => {
    const d = diff({ hasUnresolvedPriorViolations: true });
    const s = suggestDecision(scoring({ grade: 'C' }), d);
    expect(s.action).toBe('formal-warning');
    expect(s.urgency).toBe('high');
  });

  it('adds unresolved prior reason', () => {
    const d = diff({ hasUnresolvedPriorViolations: true });
    const s = suggestDecision(scoring({ grade: 'C' }), d);
    expect(s.reasons.some(r => r.includes('سابقة'))).toBe(true);
  });
});

// ─── Grade D — no prior violations ───────────────────────────────────────────

describe('Grade D — no prior violations', () => {
  it('returns formal-warning action', () => {
    const s = suggestDecision(scoring({ grade: 'D', violations: { high: 1, medium: 0, low: 0 } }));
    expect(s.action).toBe('formal-warning');
    expect(s.urgency).toBe('high');
  });
});

// ─── Grade D — with unresolved prior violations (no new) ─────────────────────

describe('Grade D — with unresolved prior violations (no new)', () => {
  it('returns partial-closure action', () => {
    const d = diff({ hasUnresolvedPriorViolations: true, newViolations: [] });
    const s = suggestDecision(scoring({ grade: 'D' }), d);
    expect(s.action).toBe('partial-closure');
    expect(s.urgency).toBe('high');
  });
});

// ─── Grade D + ≥3 high violations → immediate-closure ────────────────────────

describe('Grade D + 3 high violations', () => {
  it('returns immediate-closure with critical urgency', () => {
    const s = suggestDecision(scoring({ grade: 'D', violations: { high: 3, medium: 0, low: 0 } }));
    expect(s.action).toBe('immediate-closure');
    expect(s.urgency).toBe('critical');
  });

  it('includes high-violation reason', () => {
    const s = suggestDecision(scoring({ grade: 'D', violations: { high: 3, medium: 0, low: 0 } }));
    expect(s.reasons.some(r => r.includes('عالية الخطورة'))).toBe(true);
  });

  it('cites Article 56', () => {
    const s = suggestDecision(scoring({ grade: 'D', violations: { high: 3, medium: 0, low: 0 } }));
    expect(s.legalBasis).toContain('56');
  });
});

// ─── Unresolved + new violations → escalate-authority ────────────────────────

describe('escalate-authority when unresolved + new violations', () => {
  it('returns escalate-authority with critical urgency', () => {
    const d = diff({
      hasUnresolvedPriorViolations: true,
      newViolations: [{ id: 'v1' } as any],
    });
    const s = suggestDecision(scoring({ grade: 'C' }), d);
    expect(s.action).toBe('escalate-authority');
    expect(s.urgency).toBe('critical');
  });

  it('includes new-violation reason', () => {
    const d = diff({
      hasUnresolvedPriorViolations: true,
      newViolations: [{ id: 'v1' } as any],
    });
    const s = suggestDecision(scoring({ grade: 'C' }), d);
    expect(s.reasons.some(r => r.includes('جديدة'))).toBe(true);
  });

  it('cites Article 60', () => {
    const d = diff({
      hasUnresolvedPriorViolations: true,
      newViolations: [{ id: 'v1' } as any],
    });
    const s = suggestDecision(scoring({ grade: 'C' }), d);
    expect(s.legalBasis).toContain('60');
  });
});

// ─── criticalOverride reason ──────────────────────────────────────────────────

describe('criticalOverride flag', () => {
  it('adds critical-override reason when flag is set', () => {
    const s = suggestDecision(scoring({ grade: 'C', criticalOverride: true }));
    expect(s.reasons.some(r => r.includes('التجاوز الحرج'))).toBe(true);
    expect(s.criticalOverride).toBe(true);
  });
});

// ─── incomplete flag ─────────────────────────────────────────────────────────

describe('incomplete flag', () => {
  it('adds incomplete reason when less than 60% items evaluated', () => {
    const s = suggestDecision(scoring({ grade: 'B', incomplete: true }));
    expect(s.reasons.some(r => r.includes('60'))).toBe(true);
  });
});

// ─── resolved prior violations reason ────────────────────────────────────────

describe('resolved prior violations', () => {
  it('adds resolved-count reason when diff has resolved items', () => {
    const d = diff({ resolved: [{ id: 'v1' } as any, { id: 'v2' } as any] });
    const s = suggestDecision(scoring({ grade: 'B' }), d);
    expect(s.reasons.some(r => r.includes('تصحيحها'))).toBe(true);
  });
});

// ─── no diff (null / undefined) ──────────────────────────────────────────────

describe('no differential view', () => {
  it('works correctly with null diff', () => {
    expect(() => suggestDecision(scoring({ grade: 'A' }), null)).not.toThrow();
  });

  it('works correctly with undefined diff', () => {
    expect(() => suggestDecision(scoring({ grade: 'A' }))).not.toThrow();
  });
});

// ─── actionLabel is populated ─────────────────────────────────────────────────

describe('actionLabel', () => {
  it('is a non-empty string for every grade', () => {
    const grades = ['A', 'B', 'C', 'D'] as const;
    for (const grade of grades) {
      const s = suggestDecision(scoring({ grade }));
      expect(s.actionLabel).toBeTruthy();
    }
  });
});
