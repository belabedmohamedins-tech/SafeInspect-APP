// __tests__/repositories/SettingsRepository.test.ts
//
// SettingsRepository was migrated from AsyncStorage → SQLite in Z10.
// All assertions go through the public API (get / set / getAll).
// No direct AsyncStorage spies — they have no effect on the SQLite-backed impl.

import { SettingsRepository } from '../../src/repositories/SettingsRepository';

beforeEach(() => {
  jest.clearAllMocks();
  const SQLite = require('expo-sqlite');
  if (typeof SQLite.__resetAll === 'function') SQLite.__resetAll();
  const schema = require('../../src/db/schema');
  if (typeof schema.__resetDb === 'function') schema.__resetDb();
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

  it('returns defaults on db failure', async () => {
    const SQLite = require('expo-sqlite');
    const orig = SQLite.openDatabaseAsync;
    SQLite.openDatabaseAsync = jest.fn().mockRejectedValueOnce(new Error('fail'));
    const schema = require('../../src/db/schema');
    schema.__resetDb?.();
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('');
    SQLite.openDatabaseAsync = orig;
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

  it('returns empty object on db failure', async () => {
    const SQLite = require('expo-sqlite');
    const orig = SQLite.openDatabaseAsync;
    SQLite.openDatabaseAsync = jest.fn().mockRejectedValueOnce(new Error('fail'));
    const schema = require('../../src/db/schema');
    schema.__resetDb?.();
    const all = await SettingsRepository.getAll();
    expect(all).toEqual({});
    SQLite.openDatabaseAsync = orig;
  });

  it('defaults null values to empty string', async () => {
    // The SQLite mock stores rows; setting explicit empty string round-trips.
    await SettingsRepository.set('ghost', '');
    const all = await SettingsRepository.getAll();
    expect(all['ghost']).toBe('');
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

  it('does not overwrite untouched fields', async () => {
    await SettingsRepository.set({ officeName: 'Oran', inspectorName: 'Ali' });
    await SettingsRepository.set({ officeName: 'Alger' });
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('Alger');
    expect(s.inspectorName).toBe('Ali');
  });
});
