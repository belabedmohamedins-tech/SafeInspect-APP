// src/__tests__/schema.test.ts
//
// Jest hoists jest.mock() calls before any variable declarations.
// Only variables whose names start with 'mock' (case-insensitive) may be
// referenced inside a jest.mock() factory — all others trigger a
// ReferenceError at build time. That is why every helper here is prefixed
// with 'mock'.

// Applied-migration tracker — reset in beforeEach.
let mockAppliedMigrations: Set<string>;

// Current db stub — set inside the factory so tests can inspect calls.
let mockCurrentDbStub: ReturnType<typeof mockMakeDbStub>;

function mockMakeDbStub() {
  return {
    execAsync:            jest.fn().mockResolvedValue(undefined),
    runAsync:             jest.fn().mockResolvedValue(undefined),
    getFirstAsync:        jest.fn().mockImplementation(
      (_sql: string, params: [string]) => {
        const name = params[0];
        return Promise.resolve(
          mockAppliedMigrations.has(name) ? { name } : null,
        );
      },
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
    // Track INSERT INTO _migrations so getFirstAsync returns the right
    // value when runMigrations is called a second time on the same stub.
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

import * as SQLite from 'expo-sqlite';

const mockOpenDatabase = SQLite.openDatabaseAsync as jest.Mock;

beforeEach(() => {
  mockAppliedMigrations = new Set();
  jest.resetModules();
  jest.clearAllMocks();
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('initializeDatabase — happy path', () => {
  it('resolves without throwing', async () => {
    const { initializeDatabase } = require('../db/schema');
    await expect(initializeDatabase()).resolves.toBeUndefined();
  });

  it('calls openDatabaseAsync with the correct filename', async () => {
    const { initializeDatabase } = require('../db/schema');
    await initializeDatabase();
    expect(mockOpenDatabase).toHaveBeenCalledWith('safeinspect.db');
  });

  it('creates the _migrations tracking table', async () => {
    const { initializeDatabase } = require('../db/schema');
    await initializeDatabase();
    expect(mockCurrentDbStub.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS _migrations'),
    );
  });

  it('runs all 9 MIGRATIONS (withTransactionAsync called 9 times)', async () => {
    const { initializeDatabase } = require('../db/schema');
    await initializeDatabase();
    expect(mockCurrentDbStub.withTransactionAsync).toHaveBeenCalledTimes(9);
  });

  it('records each migration name via runAsync INSERT', async () => {
    const { initializeDatabase } = require('../db/schema');
    await initializeDatabase();
    const insertCalls = (mockCurrentDbStub.runAsync as jest.Mock).mock.calls.filter(
      ([sql]: [string]) => sql.includes('INSERT INTO _migrations'),
    );
    expect(insertCalls).toHaveLength(9);
  });
});

// ─── Idempotency ──────────────────────────────────────────────────────────────

describe('initializeDatabase — idempotency', () => {
  it('opens the database only once when called twice (singleton _db)', async () => {
    const { initializeDatabase } = require('../db/schema');
    await initializeDatabase();
    await initializeDatabase();
    expect(mockOpenDatabase).toHaveBeenCalledTimes(1);
  });

  it('does not re-apply migrations on the second call', async () => {
    const { initializeDatabase } = require('../db/schema');
    await initializeDatabase();
    const countAfterFirst =
      (mockCurrentDbStub.withTransactionAsync as jest.Mock).mock.calls.length;
    await initializeDatabase();
    expect(mockCurrentDbStub.withTransactionAsync).toHaveBeenCalledTimes(
      countAfterFirst,
    );
  });
});

// ─── runMigrations — skips already-applied ────────────────────────────────────

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

    const { runMigrations } = require('../db/schema');
    const db = await mockOpenDatabase('safeinspect.db');
    await runMigrations(db);

    expect(mockCurrentDbStub.withTransactionAsync).not.toHaveBeenCalled();
  });
});

// ─── Failure paths ────────────────────────────────────────────────────────────

describe('initializeDatabase — failure paths', () => {
  it('rejects when openDatabaseAsync throws', async () => {
    mockOpenDatabase.mockRejectedValueOnce(new Error('disk full'));
    const { initializeDatabase } = require('../db/schema');
    await expect(initializeDatabase()).rejects.toThrow('disk full');
  });
});
