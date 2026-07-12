// src/__tests__/repositories/InspectionRepository.extended.test.ts
//
// Targets uncovered lines in InspectionRepository.ts:
//   line 64 — catch block in a secondary path

import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionRepository } from '../../repositories/InspectionRepository';

const { __resetStore } = AsyncStorage as any;
beforeEach(() => { __resetStore(); jest.clearAllMocks(); });

describe('InspectionRepository — error paths', () => {
  it('getAll returns [] when AsyncStorage.getItem throws', async () => {
    const spy = jest.spyOn(AsyncStorage, 'getItem').mockRejectedValue(new Error('fail'));
    const result = await InspectionRepository.getAll();
    spy.mockRestore();
    expect(result).toEqual([]);
  });

  it('getAll returns [] on corrupt JSON', async () => {
    await AsyncStorage.setItem('INSPECTIONS', 'NOT_JSON');
    expect(await InspectionRepository.getAll()).toEqual([]);
  });
});
