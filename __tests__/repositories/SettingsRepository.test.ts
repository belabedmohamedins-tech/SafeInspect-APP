// __tests__/repositories/SettingsRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';

beforeEach(() => {
  AsyncStorage.clear();
});

describe('SettingsRepository.get', () => {
  it('returns defaults when nothing stored', async () => {
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('');
    expect(s.inspectorName).toBe('');
    expect(s.inspectionCause).toBe('');
  });

  it('returns stored core fields', async () => {
    await SettingsRepository.set({ inspectorName: 'Ahmed', officeName: 'HQ' });
    const s = await SettingsRepository.get();
    expect(s.inspectorName).toBe('Ahmed');
    expect(s.officeName).toBe('HQ');
  });

  it('returns defaults on AsyncStorage failure', async () => {
    (AsyncStorage.multiGet as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('');
  });
});

describe('SettingsRepository.getAll', () => {
  it('returns empty object when nothing stored', async () => {
    const all = await SettingsRepository.getAll();
    expect(all).toEqual({});
  });

  it('returns all keys including arbitrary ones', async () => {
    await SettingsRepository.set('pinEnabled', 'true');
    const all = await SettingsRepository.getAll();
    expect(all['pinEnabled']).toBe('true');
  });

  it('returns empty object on AsyncStorage failure', async () => {
    (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const all = await SettingsRepository.getAll();
    expect(all).toEqual({});
  });

  it('returns empty object when getAllKeys returns null', async () => {
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce(null);
    const all = await SettingsRepository.getAll();
    expect(all).toEqual({});
  });
});

describe('SettingsRepository.set — single key form', () => {
  it('stores a single arbitrary key', async () => {
    await SettingsRepository.set('pinEnabled', true);
    const all = await SettingsRepository.getAll();
    expect(all['pinEnabled']).toBe('true');
  });

  it('coerces value to string', async () => {
    await SettingsRepository.set('someNum', 42);
    const all = await SettingsRepository.getAll();
    expect(all['someNum']).toBe('42');
  });

  it('defaults value to empty string when undefined', async () => {
    await SettingsRepository.set('emptyKey', undefined);
    const all = await SettingsRepository.getAll();
    expect(all['emptyKey']).toBe('');
  });
});

describe('SettingsRepository.set — object form', () => {
  it('writes multiple core fields at once', async () => {
    await SettingsRepository.set({ inspectorName: 'Karim', inspectionCause: 'routine' });
    const s = await SettingsRepository.get();
    expect(s.inspectorName).toBe('Karim');
    expect(s.inspectionCause).toBe('routine');
  });

  it('handles empty object gracefully', async () => {
    await expect(SettingsRepository.set({})).resolves.not.toThrow();
  });

  it('silently catches set errors', async () => {
    (AsyncStorage.multiSet as jest.Mock).mockRejectedValueOnce(new Error('disk error'));
    await expect(SettingsRepository.set({ inspectorName: 'X' })).resolves.not.toThrow();
  });
});
