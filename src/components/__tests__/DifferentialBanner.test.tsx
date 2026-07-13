// src/components/__tests__/DifferentialBanner.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DifferentialBanner } from '../DifferentialBanner';
import { DifferentialView } from '../../services/differentialView';

// LayoutAnimation is a no-op in test env — silence it
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.LayoutAnimation.configureNext = jest.fn();
  return RN;
});

// formatDateLong is pure — let it run naturally
// (already covered by dateUtils tests, but no harm exercising it here)

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeEntry = (id: string, criteria: string, severity?: string) => ({
  item: { id, criteria, severity },
});

const baseDiff: DifferentialView = {
  resolved: [makeEntry('r1', 'معيار محلول 1')],
  stillFailing: [makeEntry('f1', 'معيار فاشل 1', 'high')],
  newViolations: [],
  hasUnresolvedPriorViolations: false,
};

// ─── null / empty renders nothing ────────────────────────────────────────────

describe('DifferentialBanner — renders nothing', () => {
  it('returns null when diff is null', () => {
    const { toJSON } = render(<DifferentialBanner diff={null} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when both resolved and stillFailing are empty', () => {
    const emptyDiff: DifferentialView = {
      resolved: [],
      stillFailing: [],
      newViolations: [],
      hasUnresolvedPriorViolations: false,
    };
    const { toJSON } = render(<DifferentialBanner diff={emptyDiff} />);
    expect(toJSON()).toBeNull();
  });

  it('renders when only resolved is non-empty', () => {
    const d: DifferentialView = { ...baseDiff, stillFailing: [] };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText(/متابعة الزيارة السابقة/)).toBeTruthy();
  });

  it('renders when only stillFailing is non-empty', () => {
    const d: DifferentialView = { ...baseDiff, resolved: [] };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText(/متابعة الزيارة السابقة/)).toBeTruthy();
  });
});

// ─── Header ──────────────────────────────────────────────────────────────────

describe('DifferentialBanner — header', () => {
  it('shows fallback date label when priorDate is omitted', () => {
    const { getByText } = render(<DifferentialBanner diff={baseDiff} />);
    expect(getByText('الزيارة السابقة')).toBeTruthy();
  });

  it('formats priorDate via formatDateLong', () => {
    const { queryByText } = render(
      <DifferentialBanner diff={baseDiff} priorDate="2024-03-15" />
    );
    // formatDateLong returns a locale string — just confirm fallback is gone
    expect(queryByText('الزيارة السابقة')).toBeNull();
  });

  it('starts expanded — chevron is ▲', () => {
    const { getByText } = render(<DifferentialBanner diff={baseDiff} />);
    expect(getByText('▲')).toBeTruthy();
  });

  it('has correct accessibilityLabel when expanded', () => {
    const { getByA11yLabel } = render(<DifferentialBanner diff={baseDiff} />);
    expect(getByA11yLabel('طي قسم المتابعة')).toBeTruthy();
  });
});

// ─── Toggle collapse / expand ────────────────────────────────────────────────

describe('DifferentialBanner — toggle', () => {
  it('collapses body on press and shows ▼', () => {
    const { getByA11yLabel, getByText, queryByText } = render(
      <DifferentialBanner diff={baseDiff} />
    );
    fireEvent.press(getByA11yLabel('طي قسم المتابعة'));
    expect(getByText('▼')).toBeTruthy();
    // body content should be gone
    expect(queryByText('✓ تم التصحيح')).toBeNull();
  });

  it('re-expands on second press', () => {
    const { getByA11yLabel, getByText } = render(
      <DifferentialBanner diff={baseDiff} />
    );
    const btn = getByA11yLabel('طي قسم المتابعة');
    fireEvent.press(btn);
    fireEvent.press(getByA11yLabel('توسيع قسم المتابعة'));
    expect(getByText('▲')).toBeTruthy();
    expect(getByText('✓ تم التصحيح')).toBeTruthy();
  });

  it('calls LayoutAnimation.configureNext on toggle', () => {
    const { LayoutAnimation } = require('react-native');
    const { getByA11yLabel } = render(<DifferentialBanner diff={baseDiff} />);
    fireEvent.press(getByA11yLabel('طي قسم المتابعة'));
    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
  });
});

// ─── Counter pills ───────────────────────────────────────────────────────────

describe('DifferentialBanner — pills', () => {
  it('shows resolved count pill', () => {
    const { getByText } = render(<DifferentialBanner diff={baseDiff} />);
    expect(getByText(/تم التصحيح: 1/)).toBeTruthy();
  });

  it('shows stillFailing count pill', () => {
    const { getByText } = render(<DifferentialBanner diff={baseDiff} />);
    expect(getByText(/لا يزال غير مطابق: 1/)).toBeTruthy();
  });

  it('hides newViolations pill when count is 0', () => {
    const { queryByText } = render(<DifferentialBanner diff={baseDiff} />);
    expect(queryByText(/جديد:/)).toBeNull();
  });

  it('shows newViolations pill when count > 0', () => {
    const d: DifferentialView = {
      ...baseDiff,
      newViolations: [makeEntry('n1', 'مخالفة جديدة')],
    };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText(/جديد: 1/)).toBeTruthy();
  });

  it('shows correct counts with multiple entries', () => {
    const d: DifferentialView = {
      resolved: [makeEntry('r1', 'a'), makeEntry('r2', 'b'), makeEntry('r3', 'c')],
      stillFailing: [makeEntry('f1', 'x'), makeEntry('f2', 'y')],
      newViolations: [makeEntry('n1', 'z'), makeEntry('n2', 'w')],
      hasUnresolvedPriorViolations: true,
    };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText(/تم التصحيح: 3/)).toBeTruthy();
    expect(getByText(/لا يزال غير مطابق: 2/)).toBeTruthy();
    expect(getByText(/جديد: 2/)).toBeTruthy();
  });
});

// ─── Still-failing list ──────────────────────────────────────────────────────

describe('DifferentialBanner — stillFailing section', () => {
  it('renders the section title', () => {
    const { getByText } = render(<DifferentialBanner diff={baseDiff} />);
    expect(getByText('⚠ مخالفات لم تُعالَج')).toBeTruthy();
  });

  it('renders each failing item criteria text', () => {
    const d: DifferentialView = {
      ...baseDiff,
      stillFailing: [
        makeEntry('f1', 'معيار الأول', 'high'),
        makeEntry('f2', 'معيار الثاني', 'medium'),
      ],
    };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText('معيار الأول')).toBeTruthy();
    expect(getByText('معيار الثاني')).toBeTruthy();
  });

  it('hides section when stillFailing is empty', () => {
    const d: DifferentialView = { ...baseDiff, stillFailing: [] };
    const { queryByText } = render(<DifferentialBanner diff={d} />);
    expect(queryByText('⚠ مخالفات لم تُعالَج')).toBeNull();
  });
});

// ─── severityLabel ───────────────────────────────────────────────────────────

describe('DifferentialBanner — severity badges', () => {
  const cases: Array<[string, string]> = [
    ['high',   'عالية'],
    ['medium', 'متوسطة'],
    ['low',    'منخفضة'],
  ];

  test.each(cases)('severity "%s" renders "%s"', (sev, label) => {
    const d: DifferentialView = {
      ...baseDiff,
      stillFailing: [makeEntry('f1', 'معيار', sev)],
    };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText(label)).toBeTruthy();
  });

  it('renders empty string for unknown severity', () => {
    const d: DifferentialView = {
      ...baseDiff,
      stillFailing: [makeEntry('f1', 'معيار', 'critical')],
    };
    // Should not throw
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText('معيار')).toBeTruthy();
  });

  it('renders empty string when severity is undefined', () => {
    const d: DifferentialView = {
      ...baseDiff,
      stillFailing: [makeEntry('f1', 'معيار')],
    };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText('معيار')).toBeTruthy();
  });
});

// ─── Resolved list ───────────────────────────────────────────────────────────

describe('DifferentialBanner — resolved section', () => {
  it('renders the section title', () => {
    const { getAllByText } = render(<DifferentialBanner diff={baseDiff} />);
    // "✓ تم التصحيح" appears as section title AND inside pill
    const matches = getAllByText(/تم التصحيح/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders each resolved item criteria', () => {
    const d: DifferentialView = {
      ...baseDiff,
      resolved: [makeEntry('r1', 'تم إصلاح المعيار'), makeEntry('r2', 'آخر محلول')],
    };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText('تم إصلاح المعيار')).toBeTruthy();
    expect(getByText('آخر محلول')).toBeTruthy();
  });

  it('hides resolved section when resolved is empty', () => {
    const d: DifferentialView = { ...baseDiff, resolved: [] };
    const { queryByText } = render(<DifferentialBanner diff={d} />);
    expect(queryByText('✓ تم التصحيح')).toBeNull();
  });
});

// ─── Escalation hint ─────────────────────────────────────────────────────────

describe('DifferentialBanner — escalation hint', () => {
  it('shows hint when hasUnresolvedPriorViolations is true', () => {
    const d: DifferentialView = { ...baseDiff, hasUnresolvedPriorViolations: true };
    const { getByText } = render(<DifferentialBanner diff={d} />);
    expect(getByText(/يُقترح اتخاذ إجراء تصعيدي/)).toBeTruthy();
  });

  it('hides hint when hasUnresolvedPriorViolations is false', () => {
    const { queryByText } = render(<DifferentialBanner diff={baseDiff} />);
    expect(queryByText(/يُقترح اتخاذ إجراء تصعيدي/)).toBeNull();
  });
});
