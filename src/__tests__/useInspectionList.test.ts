/**
 * Unit tests for src/hooks/useInspectionList.ts
 *
 * Same renderPureHook pattern as useSignature.test.ts.
 * See that file for the full explanation of why RNTL renderHook is avoided.
 *
 * Async flush note:
 *   The hook calls an async run() inside useFocusEffect. After mount we need
 *   TWO async ticks:
 *     tick 1 — mockGetAll promise resolves
 *     tick 2 — setInspections triggers re-render and snapshot.current updates
 *   So every test that reads loaded data calls flushAsync() which does
 *   two consecutive await rtrAct(async () => {}) calls.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act: rtrAct, create } = require('react-test-renderer');
import React from 'react';
import { Alert } from 'react-native';
import { useInspectionList } from '../hooks/useInspectionList';
import type { SavedInspection } from '../types';
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

// ─── renderPureHook ───────────────────────────────────────────────────────────

function renderPureHook<T>(hook: () => T) {
  const snapshot: { current: T | null } = { current: null };
  function Wrapper() {
    snapshot.current = hook();
    return null;
  }
  rtrAct(() => { create(React.createElement(Wrapper)); });
  return snapshot;
}

/** Flush two microtask ticks so async state from useFocusEffect settles. */
async function flushAsync() {
  await rtrAct(async () => {});
  await rtrAct(async () => {});
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useInspectionList', () => {
  it('starts with an empty filtered list when repository returns []', async () => {
    const result = renderPureHook(() => useInspectionList());
    await flushAsync();
    expect(result.current!.filtered).toEqual([]);
    expect(result.current!.totalCount).toBe(0);
  });

  it('populates the filtered list from the repository on mount', async () => {
    mockGetAll.mockResolvedValueOnce([makeInspection()]);
    const result = renderPureHook(() => useInspectionList());
    await flushAsync();
    expect(result.current!.filtered).toHaveLength(1);
    expect(result.current!.totalCount).toBe(1);
  });

  it('setSearchQuery filters by facilityName', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ facilityName: 'مستشفى الرشيد' }),
    ]);
    const result = renderPureHook(() => useInspectionList());
    await flushAsync();
    rtrAct(() => { result.current!.setSearchQuery('رشيد'); });
    expect(result.current!.filtered).toHaveLength(1);
    rtrAct(() => { result.current!.setSearchQuery('xyz'); });
    expect(result.current!.filtered).toHaveLength(0);
  });

  it('setActiveFilter narrows results to completed only', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
    ]);
    const result = renderPureHook(() => useInspectionList());
    await flushAsync();
    rtrAct(() => { result.current!.setActiveFilter('completed'); });
    expect(result.current!.filtered).toHaveLength(1);
    expect(result.current!.filtered[0].status).toBe('completed');
  });

  it('setActiveFilter narrows results to in-progress only', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
    ]);
    const result = renderPureHook(() => useInspectionList());
    await flushAsync();
    rtrAct(() => { result.current!.setActiveFilter('in-progress'); });
    expect(result.current!.filtered).toHaveLength(1);
    expect(result.current!.filtered[0].status).toBe('in-progress');
  });

  it('deleteInspection triggers an Alert confirmation dialog', async () => {
    const result = renderPureHook(() => useInspectionList());
    await flushAsync();
    rtrAct(() => { result.current!.deleteInspection('insp-1'); });
    expect(mockAlert).toHaveBeenCalledTimes(1);
  });
});
