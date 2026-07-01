// src/__tests__/repositories/SettingsRepository.extended.test.ts
//
// Targets uncovered lines in SettingsRepository.ts:
//   lines 67-77 — getAll() path
//   line  99    — set(key, value) single-key form
//   line  111   — set error catch / empty pairs guard

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsRepository } from '../../repositories/SettingsRepository';

const { __resetStore } = AsyncStorage as any;
beforeEach(() => { __resetStore(); jest.clearAllMocks(); });

// ─── get ──────────────────────────────────────────────────────────────────────

describe('get', () => {
  it('returns defaults when store is empty', async () => {
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('');
    expect(s.inspectorName).toBe('');
    expect(s.inspectionCause).toBe('');
  });

  it('returns values that were previously set', async () => {
    await SettingsRepository.set({ officeName: 'مكتب بئر خادم', inspectorName: 'أحمد' });
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('مكتب بئر خادم');
    expect(s.inspectorName).toBe('أحمد');
  });

  it('returns defaults on AsyncStorage error', async () => {
    jest.spyOn(AsyncStorage, 'multiGet').mockRejectedValueOnce(new Error('storage error'));
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('');
  });
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('getAll', () => {
  it('returns empty object when store is empty', async () => {
    const all = await SettingsRepository.getAll();
    expect(all).toEqual({});
  });

  it('returns all keys after multiple set calls', async () => {
    await SettingsRepository.set({ officeName: 'Alger', inspectorName: 'Mehdi' });
    await SettingsRepository.set('pinEnabled', 'true');
    const all = await SettingsRepository.getAll();
    expect(Object.keys(all).length).toBeGreaterThanOrEqual(2);
    expect(all['pinEnabled']).toBe('true');
  });

  it('returns empty object on AsyncStorage getAllKeys error', async () => {
    jest.spyOn(AsyncStorage, 'getAllKeys').mockRejectedValueOnce(new Error('fail'));
    expect(await SettingsRepository.getAll()).toEqual({});
  });

  it('returns empty object when getAllKeys returns null', async () => {
    jest.spyOn(AsyncStorage, 'getAllKeys').mockResolvedValueOnce(null as any);
    expect(await SettingsRepository.getAll()).toEqual({});
  });

  it('defaults null values to empty string', async () => {
    jest.spyOn(AsyncStorage, 'getAllKeys').mockResolvedValueOnce(['ghost_key'] as any);
    jest.spyOn(AsyncStorage, 'multiGet').mockResolvedValueOnce([['ghost_key', null]] as any);
    const all = await SettingsRepository.getAll();
    expect(all['ghost_key']).toBe('');
  });
});

// ─── set — single-key form ────────────────────────────────────────────────────

describe('set — single-key string form', () => {
  it('writes a single arbitrary key', async () => {
    await SettingsRepository.set('pinEnabled', 'true');
    const all = await SettingsRepository.getAll();
    expect(all['pinEnabled']).toBe('true');
  });

  it('coerces boolean to string', async () => {
    await SettingsRepository.set('myBool', true);
    const all = await SettingsRepository.getAll();
    expect(all['myBool']).toBe('true');
  });

  it('defaults missing value to empty string', async () => {
    await SettingsRepository.set('emptyKey', undefined);
    const all = await SettingsRepository.getAll();
    expect(all['emptyKey']).toBe('');
  });
});

// ─── set — object form ────────────────────────────────────────────────────────

describe('set — object form', () => {
  it('writes multiple fields at once', async () => {
    await SettingsRepository.set({ officeName: 'Oran', inspectorName: 'Fatima' });
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('Oran');
    expect(s.inspectorName).toBe('Fatima');
  });

  it('maps core field names to their StorageKeys', async () => {
    await SettingsRepository.set({ inspectionCause: 'Routine' });
    const s = await SettingsRepository.get();
    expect(s.inspectionCause).toBe('Routine');
  });

  it('does not throw on empty object', async () => {
    await expect(SettingsRepository.set({})).resolves.not.toThrow();
  });

  it('catches and warns on AsyncStorage error', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(AsyncStorage, 'multiSet').mockRejectedValueOnce(new Error('write fail'));
    await expect(SettingsRepository.set({ officeName: 'X' })).resolves.not.toThrow();
    warnSpy.mockRestore();
  });
});
