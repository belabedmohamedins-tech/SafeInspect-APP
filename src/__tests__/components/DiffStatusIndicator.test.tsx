// src/__tests__/components/DiffStatusIndicator.test.tsx
//
// RTL tests for DiffStatusIndicator.
// Covers every visible diffStatus branch and the null-render paths.

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { DiffStatusIndicator } from '../../components/DiffStatusIndicator';

describe('DiffStatusIndicator', () => {
  it('renders nothing when diffStatus is undefined', () => {
    const { toJSON } = render(<DiffStatusIndicator />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when diffStatus is "unchanged"', () => {
    const { toJSON } = render(<DiffStatusIndicator diffStatus="unchanged" />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when diffStatus is "not-in-prior"', () => {
    const { toJSON } = render(<DiffStatusIndicator diffStatus="not-in-prior" />);
    expect(toJSON()).toBeNull();
  });

  it('renders resolved label for diffStatus "resolved"', () => {
    render(<DiffStatusIndicator diffStatus="resolved" />);
    expect(screen.getByText('تم التصحيح')).toBeTruthy();
    expect(screen.getByText('✓')).toBeTruthy();
  });

  it('renders still-failing label for diffStatus "still-failing"', () => {
    render(<DiffStatusIndicator diffStatus="still-failing" />);
    expect(screen.getByText('لا يزال غير مطابق')).toBeTruthy();
    expect(screen.getByText('⚠')).toBeTruthy();
  });

  it('renders new-violation label for diffStatus "new-violation"', () => {
    render(<DiffStatusIndicator diffStatus="new-violation" />);
    expect(screen.getByText('مخالفة جديدة')).toBeTruthy();
    expect(screen.getByText('🆕')).toBeTruthy();
  });

  it('applies correct background colour for resolved status', () => {
    const { toJSON } = render(<DiffStatusIndicator diffStatus="resolved" />);
    const tree = toJSON() as any;
    expect(tree.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#d4edda' }),
      ])
    );
  });

  it('applies correct background colour for still-failing status', () => {
    const { toJSON } = render(<DiffStatusIndicator diffStatus="still-failing" />);
    const tree = toJSON() as any;
    expect(tree.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#f8d7da' }),
      ])
    );
  });

  it('applies correct background colour for new-violation status', () => {
    const { toJSON } = render(<DiffStatusIndicator diffStatus="new-violation" />);
    const tree = toJSON() as any;
    expect(tree.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#fff3cd' }),
      ])
    );
  });
});
