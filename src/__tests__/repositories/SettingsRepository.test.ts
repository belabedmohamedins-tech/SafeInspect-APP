// src/__tests__/repositories/SettingsRepository.test.ts
//
// SettingsRepository was migrated from AsyncStorage to SQLite in Z10.
// Tests must NOT use AsyncStorage.setItem/getItem directly — the repository
// reads from and writes to the SQLite mock (via __mocks__/expo-sqlite.js).
// All interactions go through SettingsRepository.get() / .set() only.
//
// The expo-sqlite mock is registered in jest.config.js moduleNameMapper.
// Each test resets the in-memory DB via the mock's __resetAll() helper so
// tests are fully isolated.

import { SettingsRepository } from '../../repositories/SettingsRepository';

// Reset the SQLite in-memory store before every test.
beforeEach(() => {
  jest.clearAllMocks();
  const SQLite = require('expo-sqlite');
  if (typeof SQLite.__resetAll === 'function') SQLite.__resetAll();
  // Also reset the schema singleton so getDb() opens a fresh connection.
  jest.resetModules();
});

// ─── get ──────────────────────────────────────────────────────────────────────

describe('SettingsRepository.get', () => {
  it('returns DEFAULTS when storage is empty', async () => {
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('');
    expect(settings.inspectorName).toBe('');
  });

  it('returns merged settings when values are stored', async () => {
    await SettingsRepository.set({ officeName: 'My Office', inspectorName: 'John' });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('My Office');
    expect(settings.inspectorName).toBe('John');
  });

  it('returns DEFAULTS when getDb throws', async () => {
    // Temporarily make getDb fail by breaking the sqlite mock.
    const SQLite = require('expo-sqlite');
    const orig = SQLite.openDatabaseAsync;
    SQLite.openDatabaseAsync = jest.fn().mockRejectedValueOnce(new Error('fail'));
    // Also reset module singleton so the next getDb() re-opens.
    const schema = require('../../db/schema');
    schema.__resetDb?.();
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('');
    expect(settings.inspectorName).toBe('');
    SQLite.openDatabaseAsync = orig;
  });
});

// ─── set ──────────────────────────────────────────────────────────────────────

describe('SettingsRepository.set', () => {
  it('persists all provided fields', async () => {
    await SettingsRepository.set({ officeName: 'HQ', inspectorName: 'Jane' });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('HQ');
    expect(settings.inspectorName).toBe('Jane');
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

  it('is a no-op when called with an empty object', async () => {
    await SettingsRepository.set({ officeName: 'Pre-set' });
    await SettingsRepository.set({});
    // Storage must be untouched — Pre-set value must remain.
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('Pre-set');
  });
});
