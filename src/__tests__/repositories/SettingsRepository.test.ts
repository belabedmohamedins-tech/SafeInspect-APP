// src/__tests__/repositories/SettingsRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper. Do NOT add an inline jest.mock() factory
// for it here. Use AsyncStorage.__resetStore() in beforeEach.
//
// SettingsRepository uses multiGet / multiSet. The Layer-2 stub at
// __mocks__/@react-native-async-storage/async-storage.js must support both.
// If multiGet/multiSet are missing from the stub, add them there — NOT here.
//
// Key fixes vs. the previous version:
//   1. SettingsRepository exposes .get() and .set() — there is no .save().
//      All write calls use .set().
//   2. StorageKeys does NOT have SETTINGS_OFFICE_NAME / SETTINGS_INSPECTOR_NAME.
//      The real keys are OFFICE_NAME and INSPECTOR_NAME.

// ─── Imports ──────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsRepository } from '../../repositories/SettingsRepository';
import { StorageKeys }        from '../../repositories/keys';

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

// ─── get ──────────────────────────────────────────────────────────────────────

describe('SettingsRepository.get', () => {
  it('returns DEFAULTS when storage is empty', async () => {
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('');
    expect(settings.inspectorName).toBe('');
  });

  it('returns merged settings when values are stored', async () => {
    // Use the actual StorageKeys that SettingsRepository reads via multiGet
    await AsyncStorage.setItem(StorageKeys.OFFICE_NAME, 'My Office');
    await AsyncStorage.setItem(StorageKeys.INSPECTOR_NAME, 'John');
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('My Office');
    expect(settings.inspectorName).toBe('John');
  });
});

// ─── set ──────────────────────────────────────────────────────────────────────

describe('SettingsRepository.set', () => {
  it('persists all provided fields', async () => {
    await SettingsRepository.set({ officeName: 'HQ', inspectorName: 'Jane' });
    const officeName    = await AsyncStorage.getItem(StorageKeys.OFFICE_NAME);
    const inspectorName = await AsyncStorage.getItem(StorageKeys.INSPECTOR_NAME);
    expect(officeName).toBe('HQ');
    expect(inspectorName).toBe('Jane');
  });

  it('round-trips: set then get returns same values', async () => {
    await SettingsRepository.set({ officeName: 'Test Office', inspectorName: 'Test Inspector' });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('Test Office');
    expect(settings.inspectorName).toBe('Test Inspector');
  });

  it('partial set does not overwrite untouched fields', async () => {
    await SettingsRepository.set({ officeName: 'Office A', inspectorName: 'Inspector B' });
    await SettingsRepository.set({ officeName: 'Office C' });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('Office C');
    // inspectorName was not overwritten
    expect(settings.inspectorName).toBe('Inspector B');
  });
});
