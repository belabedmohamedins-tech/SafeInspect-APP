// src/__tests__/components/PriorityWidget.test.tsx
//
// W92 — SPEC 13 navigation regression tests for PriorityWidget.
//
// Verifies that each row navigates to the correct facility profile
// (params.id === f.facilityId) and NOT to the generic facilities list.
//
// Pattern: mock useRouter from expo-router, render with 2+ facilities,
// fire onPress on a specific row, assert the mock was called correctly.

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PriorityWidget from '../../../components/home/PriorityWidget';
import { PriorityFacility } from '../../utils/loadHomeData';

// ── Router mock ────────────────────────────────────────────────────────────
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ── Fixtures ───────────────────────────────────────────────────────────────
const FACILITIES: PriorityFacility[] = [
  {
    facilityId:     'fac-001',
    facilityName:   'مخبزة الأمل',
    grade:          'D',
    highViolations: 4,
    lastDate:       '2026-08-01T10:00:00.000Z',
  },
  {
    facilityId:     'fac-002',
    facilityName:   'مطحنة الوئام',
    grade:          'C',
    highViolations: 2,
    lastDate:       '2026-08-05T10:00:00.000Z',
  },
  {
    facilityId:     'fac-003',
    facilityName:   'ورشة السلامة',
    grade:          'C',
    highViolations: 3,
    lastDate:       '2026-08-10T10:00:00.000Z',
  },
];

// ── Tests ──────────────────────────────────────────────────────────────────
describe('PriorityWidget — SPEC 13 navigation', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('tapping the first row navigates to its facilityId', () => {
    const { getByText } = render(<PriorityWidget facilities={FACILITIES} />);
    fireEvent.press(getByText('مخبزة الأمل'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/screens/facilities/profile',
      params:   { id: 'fac-001' },
    });
  });

  it('tapping the second row navigates to its own facilityId — not the first', () => {
    const { getByText } = render(<PriorityWidget facilities={FACILITIES} />);
    fireEvent.press(getByText('مطحنة الوئام'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/screens/facilities/profile',
      params:   { id: 'fac-002' },
    });
    // Explicitly confirm the first row's id is NOT used
    expect(mockPush).not.toHaveBeenCalledWith({
      pathname: '/screens/facilities/profile',
      params:   { id: 'fac-001' },
    });
  });

  it('tapping the third row navigates to its own facilityId', () => {
    const { getByText } = render(<PriorityWidget facilities={FACILITIES} />);
    fireEvent.press(getByText('ورشة السلامة'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/screens/facilities/profile',
      params:   { id: 'fac-003' },
    });
  });

  it('does NOT navigate to the generic facility list', () => {
    const { getByText } = render(<PriorityWidget facilities={FACILITIES} />);
    fireEvent.press(getByText('مخبزة الأمل'));

    // The old broken behavior: router.push('/screens/facilities')
    expect(mockPush).not.toHaveBeenCalledWith('/screens/facilities');
  });

  it('renders nothing when facilities list is empty', () => {
    const { toJSON } = render(<PriorityWidget facilities={[]} />);
    expect(toJSON()).toBeNull();
  });
});
