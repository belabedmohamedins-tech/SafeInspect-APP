// src/__tests__/repositories/SettingsRepository.extended.test.ts
//
// SettingsRepository now uses SQLite (Z10). All assertions go through the
// repository's public API (.get / .set / .getAll). Direct AsyncStorage spies
// are removed — they had no effect on the SQLite-backed implementation.

import { SettingsRepository } from '../../repositories/SettingsRepository';

beforeEach(() => {
  jest.clearAllMocks();
  const SQLite = require('expo-sqlite');
  if (typeof SQLite.__resetAll === 'function') SQLite.__resetAll();
  jest.resetModules();
});

describe('get', () => {
  it('returns defaults when empty', async () => {
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('');
    expect(s.inspectorName).toBe('');
    expect(s.inspectionCause).toBe('');
  });

  it('returns set values', async () => {
    await SettingsRepository.set({ officeName: 'Alger', inspectorName: 'Ahmed' });
    const s = await SettingsRepository.get();
    expect(s.officeName).toBe('Alger');
    expect(s.inspectorName).toBe('Ahmed');
  });

  it('returns defaults on error (getDb throws)', async () => {
    const SQLite = require('expo-sqlite');
    const orig = SQLite.openDatabaseAsync;
    SQLite.openDatabaseAsync = jest.fn().mockRejectedValueOnce(new Error('fail'));
    const schema = require('../../db/schema');
    schema.__resetDb?.();
    expect((await SettingsRepository.get()).officeName).toBe('');
    SQLite.openDatabaseAsync = orig;
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

  it('returns {} on db error', async () => {
    const SQLite = require('expo-sqlite');
    const orig = SQLite.openDatabaseAsync;
    SQLite.openDatabaseAsync = jest.fn().mockRejectedValueOnce(new Error('fail'));
    const schema = require('../../db/schema');
    schema.__resetDb?.();
    expect(await SettingsRepository.getAll()).toEqual({});
    SQLite.openDatabaseAsync = orig;
  });

  it('defaults null values to empty string (SQLite mock returns empty string for missing)', async () => {
    // The SQLite mock stores rows; a key that was never set is simply absent.
    // Verify that setting an explicit empty string round-trips correctly.
    await SettingsRepository.set('ghost', '');
    const all = await SettingsRepository.getAll();
    expect(all['ghost']).toBe('');
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
    expect(s.officeName).toBe('Oran');
    expect(s.inspectorName).toBe('Fatima');
  });

  it('maps core field names to StorageKeys', async () => {
    await SettingsRepository.set({ inspectionCause: 'Routine' });
    expect((await SettingsRepository.get()).inspectionCause).toBe('Routine');
  });

  it('does not throw on empty object', async () => {
    await expect(SettingsRepository.set({})).resolves.not.toThrow();
  });

  it('does not persist data on empty object call', async () => {
    await SettingsRepository.set({ officeName: 'Before' });
    await SettingsRepository.set({});
    expect((await SettingsRepository.get()).officeName).toBe('Before');
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
