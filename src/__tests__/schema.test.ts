// src/__tests__/schema.test.ts
//
// WHY expo-sqlite IS MOCKED
// In Jest there is no native filesystem. expo-sqlite's pathUtils reads
// FileSystem.documentDirectory (a native constant = null in Jest) and throws
// "Both provided directory and defaultDatabaseDirectory are null."
// before any test logic runs. The mock replaces the entire module with a
// lightweight in-memory stub.
//
// JEST HOISTING RULE
// jest.mock() factories are hoisted before variable declarations, so only
// variables whose names begin with 'mock' (case-insensitive) may be referenced
// inside the factory.
//
// MODULE SINGLETON NOTE
// schema.ts keeps a module-level `let _db` singleton. We must NOT call
// jest.resetModules() in beforeEach because that would create a new module
// instance in every test, disconnecting `mockOpenDatabase` (which points at
// the original jest.fn()) from the version the fresh module calls.
// Instead we share one module import for the whole file and only use
// jest.isolateModules() in the one test that specifically needs a clean
// singleton (the failure-path test).

let mockAppliedMigrations: Set<string>;
let mockCurrentDbStub: ReturnType<typeof mockMakeDbStub>;

function mockMakeDbStub() {
  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockImplementation(
      (_sql: string, params: [string]) =>
        Promise.resolve(
          mockAppliedMigrations.has(params[0]) ? { name: params[0] } : null,
        ),
    ),
    withTransactionAsync: jest.fn().mockImplementation(
      async (fn: () => Promise<void>) => fn(),
    ),
    closeAsync: jest.fn().mockResolvedValue(undefined),
  };
}

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockImplementation(() => {
    mockCurrentDbStub = mockMakeDbStub();
    mockCurrentDbStub.runAsync.mockImplementation(
      (sql: string, params: [string]) => {
        if (sql.includes('_migrations') && sql.includes('INSERT') && params?.[0]) {
          mockAppliedMigrations.add(params[0]);
        }
        return Promise.resolve(undefined);
      },
    );
    return Promise.resolve(mockCurrentDbStub);
  }),
}));

// ── Single shared import (keeps the _db singleton intact across tests) ────────
import { initializeDatabase, runMigrations } from '../db/schema';
import * as SQLite from 'expo-sqlite';

// Captured once; stays in sync because jest.mock replaced the module object.
const mockOpenDatabase = SQLite.openDatabaseAsync as jest.Mock;

beforeEach(() => {
  mockAppliedMigrations = new Set();
  jest.clearAllMocks();
  // Restore the default resolved behaviour after any per-test override.
  mockOpenDatabase.mockImplementation(() => {
    mockCurrentDbStub = mockMakeDbStub();
    mockCurrentDbStub.runAsync.mockImplementation(
      (sql: string, params: [string]) => {
        if (sql.includes('_migrations') && sql.includes('INSERT') && params?.[0]) {
          mockAppliedMigrations.add(params[0]);
        }
        return Promise.resolve(undefined);
      },
    );
    return Promise.resolve(mockCurrentDbStub);
  });
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('initializeDatabase — happy path', () => {
  it('resolves without throwing', async () => {
    await expect(initializeDatabase()).resolves.toBeUndefined();
  });

  it('calls openDatabaseAsync with the correct filename', async () => {
    await initializeDatabase();
    expect(mockOpenDatabase).toHaveBeenCalledWith('safeinspect.db');
  });

  it('creates the _migrations tracking table', async () => {
    await initializeDatabase();
    expect(mockCurrentDbStub.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS _migrations'),
    );
  });

  it('runs all 9 MIGRATIONS (withTransactionAsync called 9 times)', async () => {
    await initializeDatabase();
    expect(mockCurrentDbStub.withTransactionAsync).toHaveBeenCalledTimes(9);
  });

  it('records each migration name via INSERT INTO _migrations', async () => {
    await initializeDatabase();
    const insertCalls = (mockCurrentDbStub.runAsync as jest.Mock).mock.calls.filter(
      ([sql]: [string]) => sql.includes('INSERT INTO _migrations'),
    );
    expect(insertCalls).toHaveLength(9);
  });
});

// ─── Idempotency ──────────────────────────────────────────────────────────────
// These tests rely on the _db singleton being populated from the happy-path
// tests that ran first in this file. Because we share one import, _db is
// already set and openDatabaseAsync should NOT be called again.

describe('initializeDatabase — idempotency', () => {
  it('opens the database only once when called twice (singleton reused)', async () => {
    // Call twice more; _db is already set from earlier tests.
    await initializeDatabase();
    await initializeDatabase();
    // mockOpenDatabase must have 0 NEW calls (singleton prevents re-open).
    expect(mockOpenDatabase).toHaveBeenCalledTimes(0);
  });

  it('does not re-apply migrations on repeated calls', async () => {
    await initializeDatabase();
    await initializeDatabase();
    // withTransactionAsync must not be called (no new migrations to apply).
    expect(mockCurrentDbStub.withTransactionAsync).toHaveBeenCalledTimes(0);
  });
});

// ─── runMigrations — skips already-applied ───────────────────────────────────

describe('runMigrations — skips already-applied migrations', () => {
  it('does not call withTransactionAsync when all migrations are present', async () => {
    const allNames = [
      '001_create_inspections',
      '001_create_facilities',
      '001_create_agenda',
      '001_create_corrective_actions',
      '001_create_audit_log',
      '001_create_notifications',
      '002_inspections_add_index_facility',
      '002_inspections_add_index_status',
      '002_corrective_actions_add_index_inspection',
    ];
    allNames.forEach(n => mockAppliedMigrations.add(n));

    const db = await mockOpenDatabase('safeinspect.db');
    await runMigrations(db);

    expect(mockCurrentDbStub.withTransactionAsync).not.toHaveBeenCalled();
  });
});

// ─── Failure paths ────────────────────────────────────────────────────────────
// Uses jest.isolateModules to get a FRESH schema module with _db = null,
// so openDatabaseAsync is actually invoked and the rejection propagates.

describe('initializeDatabase — failure paths', () => {
  it('rejects when openDatabaseAsync throws', async () => {
    mockOpenDatabase.mockRejectedValueOnce(new Error('disk full'));

    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase: freshInit } = require('../db/schema');
      await expect(freshInit()).rejects.toThrow('disk full');
    });
  });
});
