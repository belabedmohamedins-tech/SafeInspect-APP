// src/__tests__/components/RepeatViolationBadge.test.tsx
//
// RTL tests for RepeatViolationBadge.
// Component is a pure display component — no async, no mocks needed.

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { RepeatViolationBadge } from '../../components/RepeatViolationBadge';

describe('RepeatViolationBadge', () => {
  it('renders nothing when visible=false', () => {
    const { toJSON } = render(<RepeatViolationBadge visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('renders the badge when visible=true', () => {
    render(<RepeatViolationBadge visible={true} />);
    expect(screen.getByText('تكرار — كان غير مطابق في الزيارة السابقة')).toBeTruthy();
  });

  it('renders the repeat icon with correct accessibility label', () => {
    render(<RepeatViolationBadge visible={true} />);
    expect(screen.getByLabelText('تكرار مخالفة')).toBeTruthy();
  });

  it('accepts priorStatus prop without crashing', () => {
    const { toJSON } = render(
      <RepeatViolationBadge visible={true} priorStatus="non-compliant" />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders nothing when visible transitions from true to false', () => {
    const { rerender, toJSON } = render(<RepeatViolationBadge visible={true} />);
    rerender(<RepeatViolationBadge visible={false} />);
    expect(toJSON()).toBeNull();
  });
});
