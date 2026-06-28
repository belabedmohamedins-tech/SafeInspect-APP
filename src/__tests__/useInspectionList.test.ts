/**
 * Unit tests for src/hooks/useInspectionList.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useInspectionList } from '../hooks/useInspectionList';
import { SavedInspection } from '../types';

// ─── Mock expo-router before any import resolves it ───────────────────────────
// expo-router pulls in react-native-safe-area-context which calls
// TurboModuleRegistry.get synchronously during module load.
// Mocking expo-router directly prevents that entire chain.
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => {
    // Execute the callback once synchronously, mimicking a focused screen.
    const cleanup = cb();
    return cleanup;
  },
  useRouter:      jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link:           'Link',
  Stack:          { Screen: 'Stack.Screen' },
  Tabs:           { Screen: 'Tabs.Screen' },
}));

// Also stub safe-area-context directly as a belt-and-suspenders guard
// in case any other import in the chain requires it.
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaProvider:  'SafeAreaProvider',
  SafeAreaView:      'SafeAreaView',
  SafeAreaConsumer:  'SafeAreaConsumer',
  initialWindowMetrics: { frame: { x: 0, y: 0, width: 375, height: 812 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } },
}));

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll:     jest.fn(() => Promise.resolve([])),
    delete:     jest.fn(() => Promise.resolve()),
    deleteMany: jest.fn(() => Promise.resolve()),
  },
}));

const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

beforeEach(() => { jest.clearAllMocks(); });

describe('useInspectionList', () => {
  it('loads inspections on mount', async () => {
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    expect(result.current.inspections).toEqual([]);
  });
});
