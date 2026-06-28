/**
 * Unit tests for src/hooks/useInspectionList.ts
 *
 * The hook uses useFocusEffect (expo-router) and InspectionRepository.
 * Both are mocked at Layer 4. expo-router is mocked first so its
 * synchronous module-load side-effects (safe-area-context, TurboModuleRegistry)
 * never run.
 *
 * renderHook receives a React.Fragment wrapper to give RNTL v14 a valid
 * host component tree (same fix as useSignature / useCollapsibleSections).
 */
import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
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

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

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
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await act(async () => {});
    expect(result.current.filtered).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('populates the filtered list from the repository on mount', async () => {
    mockGetAll.mockResolvedValueOnce([makeInspection()]);
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await act(async () => {});
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
  });

  it('setSearchQuery filters by facilityName', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ facilityName: 'مستشفى الرشيد' }),
    ]);
    const { result } = renderHook(() => useInspectionList(), { wrapper });
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
    const { result } = renderHook(() => useInspectionList(), { wrapper });
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
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await act(async () => {});
    await act(async () => { result.current.setActiveFilter('in-progress'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].status).toBe('in-progress');
  });

  it('deleteInspection triggers an Alert confirmation dialog', async () => {
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await act(async () => { result.current.deleteInspection('insp-1'); });
    expect(mockAlert).toHaveBeenCalledTimes(1);
  });
});
