// src/__tests__/repositories/SettingsRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper. Do NOT add an inline jest.mock() factory
// for it here. Use AsyncStorage.__resetStore() in beforeEach.
//
// SettingsRepository uses multiGet / multiSet. The Layer-2 stub at
// __mocks__/@react-native-async-storage/async-storage.js must support both.
// If multiGet/multiSet are missing from the stub, add them there — NOT here.

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
    await AsyncStorage.setItem(StorageKeys.SETTINGS_OFFICE_NAME, 'My Office');
    await AsyncStorage.setItem(StorageKeys.SETTINGS_INSPECTOR_NAME, 'John');
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('My Office');
    expect(settings.inspectorName).toBe('John');
  });
});

// ─── save ─────────────────────────────────────────────────────────────────────

describe('SettingsRepository.save', () => {
  it('persists all provided fields', async () => {
    await SettingsRepository.save({ officeName: 'HQ', inspectorName: 'Jane' });
    const officeName = await AsyncStorage.getItem(StorageKeys.SETTINGS_OFFICE_NAME);
    const inspectorName = await AsyncStorage.getItem(StorageKeys.SETTINGS_INSPECTOR_NAME);
    expect(officeName).toBe('HQ');
    expect(inspectorName).toBe('Jane');
  });

  it('round-trips: save then get returns same values', async () => {
    await SettingsRepository.save({ officeName: 'Test Office', inspectorName: 'Test Inspector' });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('Test Office');
    expect(settings.inspectorName).toBe('Test Inspector');
  });
});
