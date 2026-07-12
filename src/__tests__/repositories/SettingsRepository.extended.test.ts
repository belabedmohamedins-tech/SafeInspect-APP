// src/__tests__/repositories/SettingsRepository.extended.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsRepository } from '../../repositories/SettingsRepository';

const { __resetStore } = AsyncStorage as any;
beforeEach(() => { __resetStore(); jest.clearAllMocks(); });

describe('get', () => {
  it('returns defaults when empty', async () => {
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe(''); expect(s.inspectorName).toBe(''); expect(s.inspectionCause).toBe('');
  });
  it('returns set values', async () => {
    await SettingsRepository.set({ officeName: 'Alger', inspectorName: 'Ahmed' });
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('Alger'); expect(s.inspectorName).toBe('Ahmed');
  });
  it('returns defaults on error', async () => {
    jest.spyOn(AsyncStorage, 'multiGet').mockRejectedValueOnce(new Error('fail'));
    expect((await SettingsRepository.get()).officeName).toBe('');
  });
});

describe('getAll', () => {
  it('returns {} when empty', async () => {
    expect(await SettingsRepository.getAll()).toEqual({});
  });
  it('returns all keys after sets', async () => {
    await SettingsRepository.set({ officeName: 'Oran' });
    await SettingsRepository.set('pinEnabled', 'true');
    const all = await SettingsRepository.getAll();
    expect(Object.keys(all).length).toBeGreaterThanOrEqual(2);
    expect(all['pinEnabled']).toBe('true');
  });
  it('returns {} on getAllKeys error', async () => {
    jest.spyOn(AsyncStorage, 'getAllKeys').mockRejectedValueOnce(new Error('fail'));
    expect(await SettingsRepository.getAll()).toEqual({});
  });
  it('returns {} when getAllKeys returns null', async () => {
    jest.spyOn(AsyncStorage, 'getAllKeys').mockResolvedValueOnce(null as any);
    expect(await SettingsRepository.getAll()).toEqual({});
  });
  it('defaults null values to empty string', async () => {
    jest.spyOn(AsyncStorage, 'getAllKeys').mockResolvedValueOnce(['ghost'] as any);
    jest.spyOn(AsyncStorage, 'multiGet').mockResolvedValueOnce([['ghost', null]] as any);
    expect((await SettingsRepository.getAll())['ghost']).toBe('');
  });
});

describe('set — single-key form', () => {
  it('writes a single key', async () => {
    await SettingsRepository.set('pinEnabled', 'true');
    expect((await SettingsRepository.getAll())['pinEnabled']).toBe('true');
  });
  it('coerces boolean to string', async () => {
    await SettingsRepository.set('myBool', true);
    expect((await SettingsRepository.getAll())['myBool']).toBe('true');
  });
  it('defaults undefined value to empty string', async () => {
    await SettingsRepository.set('emptyKey', undefined);
    expect((await SettingsRepository.getAll())['emptyKey']).toBe('');
  });
});

describe('set — object form', () => {
  it('writes multiple fields', async () => {
    await SettingsRepository.set({ officeName: 'Oran', inspectorName: 'Fatima' });
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('Oran'); expect(s.inspectorName).toBe('Fatima');
  });
  it('maps core field names to StorageKeys', async () => {
    await SettingsRepository.set({ inspectionCause: 'Routine' });
    expect((await SettingsRepository.get()).inspectionCause).toBe('Routine');
  });
  it('does not throw on empty object', async () => {
    await expect(SettingsRepository.set({})).resolves.not.toThrow();
  });
  it('does not call multiSet on empty object — line 106', async () => {
    const spy = jest.spyOn(AsyncStorage, 'multiSet');
    await SettingsRepository.set({});
    expect(spy).not.toHaveBeenCalled();
  });
  it('catches and warns on multiSet error', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(AsyncStorage, 'multiSet').mockRejectedValueOnce(new Error('write fail'));
    await expect(SettingsRepository.set({ officeName: 'X' })).resolves.not.toThrow();
    warnSpy.mockRestore();
  });
});

describe('FIELD_KEYS round-trip', () => {
  it('round-trips officeName', async () => {
    await SettingsRepository.set({ officeName: 'Tizi' });
    expect((await SettingsRepository.get()).officeName).toBe('Tizi');
  });
  it('round-trips inspectorName', async () => {
    await SettingsRepository.set({ inspectorName: 'Karim' });
    expect((await SettingsRepository.get()).inspectorName).toBe('Karim');
  });
  it('round-trips inspectionCause', async () => {
    await SettingsRepository.set({ inspectionCause: 'Periodic' });
    expect((await SettingsRepository.get()).inspectionCause).toBe('Periodic');
  });
  it('stores arbitrary key under its raw name', async () => {
    await SettingsRepository.set({ unknownKey: 'val' });
    expect((await SettingsRepository.getAll())['unknownKey']).toBe('val');
  });
});
