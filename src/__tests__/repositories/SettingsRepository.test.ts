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
//
// WHY the empty-object test installs the spy BEFORE the pre-set write
// ─────────────────────────────────────────────────────────────────────
// jest.spyOn wraps the method in-place on the AsyncStorage object. The L2
// mock stores all calls on the same underlying jest.fn() reference. If the
// spy is attached AFTER a write, jest.clearAllMocks() in beforeEach already
// ran, but the spy did not exist yet — so the first write's call is logged
// against the NEW spy (not the old mock fn). Result: spy shows 1 call even
// though it was created after the write.
//
// Fix: install the spy BEFORE the pre-set write, then call mockClear() on the
// spy immediately before the empty-object call. This way:
//   • The pre-set write is tracked by the spy (call count = 1).
//   • mockClear() resets the spy's call log to 0.
//   • set({}) hits the early-return guard → multiSet is NOT called (count stays 0).

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
    await AsyncStorage.setItem(StorageKeys.OFFICE_NAME, 'My Office');
    await AsyncStorage.setItem(StorageKeys.INSPECTOR_NAME, 'John');
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('My Office');
    expect(settings.inspectorName).toBe('John');
  });

  it('returns DEFAULTS when AsyncStorage.multiGet throws', async () => {
    const original = AsyncStorage.multiGet;
    (AsyncStorage as any).multiGet = jest.fn().mockRejectedValue(new Error('storage unavailable'));
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('');
    expect(settings.inspectorName).toBe('');
    (AsyncStorage as any).multiGet = original;
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
    expect(settings.inspectorName).toBe('Inspector B');
  });

  // ── line 54: early-return guard — set() called with empty object ──────────
  it('is a no-op when called with an empty object', async () => {
    // Spy BEFORE the pre-set write so it owns the function reference from the start.
    const multiSetSpy = jest.spyOn(AsyncStorage, 'multiSet');

    await SettingsRepository.set({ officeName: 'Pre-set' });

    // Clear the spy's call log (resets count to 0) without removing the spy itself.
    multiSetSpy.mockClear();

    // This call must hit the early-return guard (entries.length === 0) — no multiSet.
    await SettingsRepository.set({});
    expect(multiSetSpy).not.toHaveBeenCalled();

    // Verify storage was not touched.
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('Pre-set');

    multiSetSpy.mockRestore();
  });
});
