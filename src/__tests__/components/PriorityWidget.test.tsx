// src/__tests__/components/PriorityWidget.test.tsx
// W92 — SPEC 13 coverage
// Verifies that each PriorityWidget row navigates to the correct facility
// profile screen using that row's own facilityId, not a shared/generic target.

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import PriorityWidget from '../../../components/home/PriorityWidget';
import { PriorityFacility } from '../../utils/loadHomeData';

// ── router mock ────────────────────────────────────────────────────────────
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

// ── icon mock (avoids native module resolution in Jest) ────────────────────
jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

// ── fixtures ───────────────────────────────────────────────────────────────
const FACILITY_A: PriorityFacility = {
  facilityId:     'fac-001',
  facilityName:   'مصنع الأول',
  grade:          'D',
  highViolations: 4,
  lastDate:       '2026-08-01',
};

const FACILITY_B: PriorityFacility = {
  facilityId:     'fac-002',
  facilityName:   'مصنع الثاني',
  grade:          'C',
  highViolations: 2,
  lastDate:       '2026-08-05',
};

const FACILITY_C: PriorityFacility = {
  facilityId:     'fac-003',
  facilityName:   'مصنع الثالث',
  grade:          'C',
  highViolations: 0,
  lastDate:       '2026-08-10',
};

// ── helpers ────────────────────────────────────────────────────────────────
function expectedNav(facilityId: string) {
  return {
    pathname: '/screens/facilities/profile',
    params: { id: facilityId },
  };
}

// TouchableOpacity does not expose role="button" in RNTL's accessibility
// query layer, so we use UNSAFE_getAllByType which finds elements by their
// React component type — the correct approach for RN pressable components.
function getRows(instance: ReturnType<typeof render>) {
  return instance.UNSAFE_getAllByType(TouchableOpacity);
}

// ── tests ──────────────────────────────────────────────────────────────────
describe('PriorityWidget W92', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders nothing when facilities list is empty', () => {
    const { toJSON } = render(<PriorityWidget facilities={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('tapping the first row navigates to that row\'s facilityId', () => {
    const instance = render(
      <PriorityWidget facilities={[FACILITY_A, FACILITY_B, FACILITY_C]} />
    );
    const rows = getRows(instance);
    fireEvent.press(rows[0]);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expectedNav('fac-001'));
  });

  it('tapping the second row navigates to that row\'s facilityId — not the first row\'s', () => {
    const instance = render(
      <PriorityWidget facilities={[FACILITY_A, FACILITY_B, FACILITY_C]} />
    );
    const rows = getRows(instance);
    fireEvent.press(rows[1]);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expectedNav('fac-002'));
    expect(mockPush).not.toHaveBeenCalledWith(expectedNav('fac-001'));
    expect(mockPush).not.toHaveBeenCalledWith('/screens/facilities');
  });

  it('tapping the third row navigates to that row\'s facilityId', () => {
    const instance = render(
      <PriorityWidget facilities={[FACILITY_A, FACILITY_B, FACILITY_C]} />
    );
    const rows = getRows(instance);
    fireEvent.press(rows[2]);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expectedNav('fac-003'));
  });

  it('each row press calls router.push exactly once (no duplicate fires)', () => {
    const instance = render(
      <PriorityWidget facilities={[FACILITY_A, FACILITY_B]} />
    );
    const rows = getRows(instance);
    fireEvent.press(rows[0]);
    fireEvent.press(rows[1]);
    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenNthCalledWith(1, expectedNav('fac-001'));
    expect(mockPush).toHaveBeenNthCalledWith(2, expectedNav('fac-002'));
  });

  it('never navigates to the generic facilities list', () => {
    const instance = render(
      <PriorityWidget facilities={[FACILITY_A, FACILITY_B, FACILITY_C]} />
    );
    getRows(instance).forEach(row => fireEvent.press(row));
    mockPush.mock.calls.forEach(call => {
      expect(call[0]).not.toBe('/screens/facilities');
      expect(call[0]).not.toEqual({ pathname: '/screens/facilities' });
    });
  });
});
