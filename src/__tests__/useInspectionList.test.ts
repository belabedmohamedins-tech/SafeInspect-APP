/**
 * Unit tests for src/hooks/useInspectionList.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useInspectionList } from '../hooks/useInspectionList';
import { SavedInspection } from '../types';

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
