// src/__tests__/schema.test.ts
//
// WHAT IS TESTED:
//   initializeDatabase() → getDb() → SQLite.openDatabaseAsync + runMigrations.
//   The function does NOT touch AsyncStorage — those assertions were incorrect
//   and have been removed.
//
// WHY expo-sqlite IS MOCKED:
//   In the Jest environment there is no native filesystem. The real
//   expo-sqlite pathUtils resolves the database directory from
//   FileSystem.documentDirectory (a native constant). Without the mock it
//   throws "Both provided directory and defaultDatabaseDirectory are null."
//   before any test can run.
//
// MOCK DESIGN:
//   The SQLite stub uses a simple in-memory Map as the _migrations table so
//   that runMigrations() behaves correctly (skips already-applied migrations on
//   repeated calls) without any real SQL engine.

// Applied-migration tracker shared across all calls within a test.
let appliedMigrations: Set<string>;

// db stub factory — recreated for each openDatabaseAsync call
function makeDbStub() {
  return {
    execAsync:           jest.fn().mockResolvedValue(undefined),
    runAsync:            jest.fn().mockResolvedValue(undefined),
    getFirstAsync:       jest.fn().mockImplementation(
      (_sql: string, params: [string]) => {
        const name = params[0];
        return Promise.resolve(appliedMigrations.has(name) ? { name } : null);
      }
    ),
    withTransactionAsync: jest.fn().mockImplementation(
      async (fn: () => Promise<void>) => {
        await fn();
      }
    ),
    closeAsync: jest.fn().mockResolvedValue(undefined),
  };
}

let currentDbStub: ReturnType<typeof makeDbStub>;

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockImplementation(() => {
    currentDbStub = makeDbStub();
    // Intercept runAsync to track applied migrations so getFirstAsync
    // returns the right value on subsequent runMigrations() calls.
    currentDbStub.runAsync.mockImplementation(
      (_sql: string, params: [string]) => {
        // INSERT INTO _migrations (name) VALUES (?)
        if (_sql.includes('_migrations') && _sql.includes('INSERT') && params?.[0]) {
          appliedMigrations.add(params[0]);
        }
        return Promise.resolve(undefined);
      }
    );
    return Promise.resolve(currentDbStub);
  }),
}));

import * as SQLite from 'expo-sqlite';
import { initializeDatabase, getDb, runMigrations } from '../db/schema';

const mockOpenDatabase = SQLite.openDatabaseAsync as jest.Mock;

beforeEach(() => {
  // Reset migration state and the db singleton between tests.
  appliedMigrations = new Set();
  jest.resetModules();
  jest.clearAllMocks();
  // Re-import after resetModules to get a fresh singleton (_db = null).
  // This is handled by requiring lazily in each test — see note below.
});

// ─── Happy path ───────────────────────────────────────────────────────────

describe('initializeDatabase — happy path', () => {
  it('resolves without throwing', async () => {
    const { initializeDatabase: init } = require('../db/schema');
    await expect(init()).resolves.toBeUndefined();
  });

  it('calls openDatabaseAsync with the correct filename', async () => {
    const { initializeDatabase: init } = require('../db/schema');
    await init();
    expect(mockOpenDatabase).toHaveBeenCalledWith('safeinspect.db');
  });

  it('creates the _migrations tracking table', async () => {
    const { initializeDatabase: init } = require('../db/schema');
    await init();
    expect(currentDbStub.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS _migrations'),
    );
  });

  it('runs all 9 MIGRATIONS entries (withTransactionAsync called 9 times)', async () => {
    const { initializeDatabase: init } = require('../db/schema');
    await init();
    // 9 migrations defined in MIGRATIONS array.
    expect(currentDbStub.withTransactionAsync).toHaveBeenCalledTimes(9);
  });

  it('records each migration name via runAsync INSERT', async () => {
    const { initializeDatabase: init } = require('../db/schema');
    await init();
    const insertCalls = (currentDbStub.runAsync as jest.Mock).mock.calls.filter(
      ([sql]: [string]) => sql.includes('INSERT INTO _migrations'),
    );
    expect(insertCalls).toHaveLength(9);
  });
});

// ─── Idempotency ──────────────────────────────────────────────────────────

describe('initializeDatabase — idempotency', () => {
  it('opens the database only once when called twice (singleton _db)', async () => {
    const { initializeDatabase: init } = require('../db/schema');
    await init();
    await init();
    // openDatabaseAsync must be called exactly once — the singleton is reused.
    expect(mockOpenDatabase).toHaveBeenCalledTimes(1);
  });

  it('does not re-apply migrations on the second call', async () => {
    const { initializeDatabase: init } = require('../db/schema');
    await init();
    const firstCallCount = (currentDbStub.withTransactionAsync as jest.Mock).mock.calls.length;
    await init();
    // withTransactionAsync call count must not increase on the second call.
    expect(currentDbStub.withTransactionAsync).toHaveBeenCalledTimes(firstCallCount);
  });
});

// ─── runMigrations — skips already-applied ─────────────────────────────────

describe('runMigrations — skips already-applied migrations', () => {
  it('skips migrations that are already in the _migrations table', async () => {
    const { runMigrations: run } = require('../db/schema');
    // Pre-populate all migration names so every getFirstAsync returns a hit.
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
    allNames.forEach(n => appliedMigrations.add(n));

    const db = await (SQLite.openDatabaseAsync as jest.Mock)('safeinspect.db');
    await run(db);

    // All migrations already applied — withTransactionAsync should not be called.
    expect(currentDbStub.withTransactionAsync).not.toHaveBeenCalled();
  });
});

// ─── openDatabaseAsync failure ────────────────────────────────────────────────

describe('initializeDatabase — failure paths', () => {
  it('rejects when openDatabaseAsync throws', async () => {
    mockOpenDatabase.mockRejectedValueOnce(new Error('disk full'));
    const { initializeDatabase: init } = require('../db/schema');
    await expect(init()).rejects.toThrow('disk full');
  });
});
