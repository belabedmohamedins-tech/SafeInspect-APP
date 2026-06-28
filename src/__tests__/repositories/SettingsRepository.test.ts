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
import { SettingsRepository } from '../repositories/SettingsRepository';
import { StorageKeys }        from '../repositories/keys';

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
    expect(settings.inspectionCause).toBe('');
  });

  it('returns values from storage when present', async () => {
    await (AsyncStorage as any).setItem(StorageKeys.OFFICE_NAME,     'مكتب الصحة');
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTOR_NAME,  'محمد');
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTION_CAUSE,'روتيني');
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('مكتب الصحة');
    expect(settings.inspectorName).toBe('محمد');
    expect(settings.inspectionCause).toBe('روتيني');
  });

  it('returns defaults on AsyncStorage error (graceful fallback)', async () => {
    // Temporarily make multiGet reject once
    const original = (AsyncStorage as any).multiGet;
    (AsyncStorage as any).multiGet = jest.fn().mockRejectedValueOnce(new Error('storage failure'));
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('');
    expect(settings.inspectorName).toBe('');
    (AsyncStorage as any).multiGet = original;
  });
});

// ─── set ──────────────────────────────────────────────────────────────────────

describe('SettingsRepository.set', () => {
  it('persists a partial update', async () => {
    await SettingsRepository.set({ inspectorName: 'عمر' });
    const settings = await SettingsRepository.get();
    expect(settings.inspectorName).toBe('عمر');
    expect(settings.officeName).toBe('');
  });

  it('persists a full settings update', async () => {
    await SettingsRepository.set({
      officeName:      'مكتب',
      inspectorName:   'علي',
      inspectionCause: 'شكوى',
    });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('مكتب');
    expect(settings.inspectorName).toBe('علي');
    expect(settings.inspectionCause).toBe('شكوى');
  });

  it('does not call multiSet for an empty object', async () => {
    const spy = jest.spyOn(AsyncStorage, 'multiSet');
    await SettingsRepository.set({});
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('overwrites a previously set value', async () => {
    await SettingsRepository.set({ officeName: 'قديم' });
    await SettingsRepository.set({ officeName: 'جديد' });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('جديد');
  });
});
