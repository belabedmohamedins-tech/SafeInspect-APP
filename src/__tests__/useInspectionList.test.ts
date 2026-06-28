/**
 * Unit tests for src/hooks/useInspectionList.ts
 *
 * renderPureHook strategy:
 *   We use react-test-renderer (pure JS reconciler) to avoid the two-React-
 *   instance problem described in useSignature.test.ts.
 *
 * Async re-render strategy:
 *   The hook fires an async run() inside useFocusEffect. After the Promise
 *   resolves, React queues a setState update. That update is only flushed
 *   when the reconciler runs inside act(). We therefore:
 *     1. renderPureHook  – mounts Wrapper, writes initial state
 *     2. await flushAsync() – two rtrAct(async) ticks let the Promise resolve
 *        AND the queued setState flush, re-invoking Wrapper each time
 *     3. snapshot.current now holds the post-load values
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
/**
 * Mounts the hook in a pure-JS reconciler and returns:
 *   snapshot  – { current } plain object, updated on every Wrapper render
 *   rerender  – call inside rtrAct to force a fresh render cycle and
 *               re-capture the latest hook return value
 */
function renderPureHook<T>(hook: () => T) {
  const snapshot: { current: T | null } = { current: null };

  function Wrapper() {
    snapshot.current = hook();
    return null;
  }

  let renderer: ReturnType<typeof create>;
  rtrAct(() => {
    renderer = create(React.createElement(Wrapper));
  });

  const rerender = () =>
    rtrAct(() => renderer.update(React.createElement(Wrapper)));

  return { snapshot, rerender };
}

/**
 * Flush two microtask ticks then force a re-render so snapshot.current
 * reflects the state that was set inside the resolved Promise.
 */
async function flushAsync(rerender: () => void) {
  await rtrAct(async () => {});
  await rtrAct(async () => {});
  rerender();
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
    const { snapshot, rerender } = renderPureHook(() => useInspectionList());
    await flushAsync(rerender);
    expect(snapshot.current!.filtered).toEqual([]);
    expect(snapshot.current!.totalCount).toBe(0);
  });

  it('populates the filtered list from the repository on mount', async () => {
    mockGetAll.mockResolvedValueOnce([makeInspection()]);
    const { snapshot, rerender } = renderPureHook(() => useInspectionList());
    await flushAsync(rerender);
    expect(snapshot.current!.filtered).toHaveLength(1);
    expect(snapshot.current!.totalCount).toBe(1);
  });

  it('setSearchQuery filters by facilityName', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ facilityName: 'مستشفى الرشيد' }),
    ]);
    const { snapshot, rerender } = renderPureHook(() => useInspectionList());
    await flushAsync(rerender);
    rtrAct(() => { snapshot.current!.setSearchQuery('رشيد'); });
    expect(snapshot.current!.filtered).toHaveLength(1);
    rtrAct(() => { snapshot.current!.setSearchQuery('xyz'); });
    expect(snapshot.current!.filtered).toHaveLength(0);
  });

  it('setActiveFilter narrows results to completed only', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
    ]);
    const { snapshot, rerender } = renderPureHook(() => useInspectionList());
    await flushAsync(rerender);
    rtrAct(() => { snapshot.current!.setActiveFilter('completed'); });
    expect(snapshot.current!.filtered).toHaveLength(1);
    expect(snapshot.current!.filtered[0].status).toBe('completed');
  });

  it('setActiveFilter narrows results to in-progress only', async () => {
    mockGetAll.mockResolvedValueOnce([
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
    ]);
    const { snapshot, rerender } = renderPureHook(() => useInspectionList());
    await flushAsync(rerender);
    rtrAct(() => { snapshot.current!.setActiveFilter('in-progress'); });
    expect(snapshot.current!.filtered).toHaveLength(1);
    expect(snapshot.current!.filtered[0].status).toBe('in-progress');
  });

  it('deleteInspection triggers an Alert confirmation dialog', async () => {
    const { snapshot, rerender } = renderPureHook(() => useInspectionList());
    await flushAsync(rerender);
    rtrAct(() => { snapshot.current!.deleteInspection('insp-1'); });
    expect(mockAlert).toHaveBeenCalledTimes(1);
  });
});
