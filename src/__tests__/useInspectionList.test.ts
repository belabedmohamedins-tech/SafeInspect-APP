/**
 * Unit tests for src/hooks/useInspectionList.ts
 *
 * The hook uses useFocusEffect (expo-router) and InspectionRepository.
 * Both are mocked at Layer 4.
 *
 * WHY we do NOT use renderHook from @testing-library/react-native:
 *   jest.setup.ts mocks 'react-native' with a Proxy whose fallback get trap
 *   returns jest.fn() for every unknown key, including React internal symbols
 *   ($$typeof, _context, ...) that RNTL's renderHook uses to mount its host
 *   component wrapper tree. This leaves result.current = undefined.
 *
 * FIX: use a minimal renderPureHook shim backed by react-test-renderer.
 * It never touches react-native host components.
 */
import React from 'react';
import { act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useInspectionList } from '../hooks/useInspectionList';
import { SavedInspection } from '../types';
import * as InspectionRepositoryModule from '../repositories/InspectionRepository';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => { cb(); },
  useRouter:            jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link:  'Link',
  Stack: { Screen: 'Stack.Screen' },
  Tabs:  { Screen: 'Tabs.Screen' },
}));

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll:  jest.fn(() => Promise.resolve([])),
    delete:  jest.fn(() => Promise.resolve()),
  },
}));

const mockGetAll = jest.mocked(InspectionRepositoryModule.InspectionRepository.getAll);
const mockAlert  = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// ─── Minimal renderHook shim (pure React, no RN host renderer) ───────────────

function renderPureHook<T>(hook: () => T): { result: React.MutableRefObject<T> } {
  const result = React.createRef() as React.MutableRefObject<T>;
  function Wrapper() {
    result.current = hook();
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { create } = require('react-test-renderer');
  act(() => { create(React.createElement(Wrapper)); });
  return { result };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue([]);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id:              'insp-1',
    facilityName:    'Test Facility',
    facilityAddress: '123 Test St',
    date:            new Date().toISOString(),
    status:          'completed',
    items:           [],
    signature:       '',
    ...overrides,
  } as SavedInspection;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useInspectionList', () => {
  it('starts with an empty filtered list when repository returns []', async () => {
    const { result } = renderPureHook(() => useInspectionList());
    await act(async () => {});
    expect(result.current.filtered).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('populates the filtered list from the repository on mount', async () => {
    mockGetAll.mockResolvedValueOnce([makeInspection()]);
    const { result } = renderPureHook(() => useInspectionList());
    await act(async () => {});
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
  });

  it('setSearchQuery filters by facilityName', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ facilityName: 'مستشفى الرشيد' }),
    ]);
    const { result } = renderPureHook(() => useInspectionList());
    await act(async () => {});
    await act(async () => { result.current.setSearchQuery('رشيد'); });
    expect(result.current.filtered).toHaveLength(1);
    await act(async () => { result.current.setSearchQuery('xyz'); });
    expect(result.current.filtered).toHaveLength(0);
  });

  it('setActiveFilter narrows results to completed only', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
    ]);
    const { result } = renderPureHook(() => useInspectionList());
    await act(async () => {});
    await act(async () => { result.current.setActiveFilter('completed'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].status).toBe('completed');
  });

  it('setActiveFilter narrows results to in-progress only', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
    ]);
    const { result } = renderPureHook(() => useInspectionList());
    await act(async () => {});
    await act(async () => { result.current.setActiveFilter('in-progress'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].status).toBe('in-progress');
  });

  it('deleteInspection triggers an Alert confirmation dialog', async () => {
    const { result } = renderPureHook(() => useInspectionList());
    await act(async () => { result.current.deleteInspection('insp-1'); });
    expect(mockAlert).toHaveBeenCalledTimes(1);
  });
});
