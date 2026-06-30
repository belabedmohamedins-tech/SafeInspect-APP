// src/__tests__/schema.test.ts
//
// KEY DESIGN DECISIONS
// ─────────────────────
// 1. expo-sqlite is mocked (jest.mock hoisted before imports) because the real
//    native module resolves its DB directory from FileSystem.documentDirectory,
//    which is null in Jest → "Both provided directory and defaultDatabaseDirectory
//    are null."
//
// 2. jest.mock() factory variables must be 'mock'-prefixed (Jest hoisting rule).
//
// 3. schema.ts has a module-level `let _db` singleton. Once the first
//    initializeDatabase() call succeeds, every further call returns early without
//    touching SQLite. We therefore use jest.isolateModulesAsync() inside every
//    describe block so each group starts with a fresh module (_db = null) and
//    a fresh set of mock call counts.

let mockAppliedMigrations: Set<string> = new Set();
let mockCurrentDbStub: ReturnType<typeof mockMakeDbStub>;

function mockMakeDbStub() {
  const stub = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync:  jest.fn().mockResolvedValue(undefined),
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
  // Track INSERT INTO _migrations calls so getFirstAsync stays consistent.
  stub.runAsync.mockImplementation((sql: string, params: [string]) => {
    if (sql.includes('_migrations') && sql.includes('INSERT') && params?.[0]) {
      mockAppliedMigrations.add(params[0]);
    }
    return Promise.resolve(undefined);
  });
  return stub;
}

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockImplementation(() => {
    mockCurrentDbStub = mockMakeDbStub();
    return Promise.resolve(mockCurrentDbStub);
  }),
}));

import * as SQLite from 'expo-sqlite';

// Helper: returns a fresh {schema, mockOpen} pair inside an isolated module
// registry so each describe block starts with _db = null.
async function freshSchema() {
  let schema: typeof import('../db/schema');
  await jest.isolateModulesAsync(async () => {
    schema = require('../db/schema');
  });
  // Re-acquire the mock reference from the (possibly re-registered) module.
  const mockOpen = SQLite.openDatabaseAsync as jest.Mock;
  return { schema: schema!, mockOpen };
}

beforeEach(() => {
  mockAppliedMigrations = new Set();
  jest.clearAllMocks();
  // Restore default resolved behaviour after any per-test override.
  (SQLite.openDatabaseAsync as jest.Mock).mockImplementation(() => {
    mockCurrentDbStub = mockMakeDbStub();
    return Promise.resolve(mockCurrentDbStub);
  });
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('initializeDatabase — happy path', () => {
  it('resolves without throwing', async () => {
    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase } = require('../db/schema');
      await expect(initializeDatabase()).resolves.toBeUndefined();
    });
  });

  it('calls openDatabaseAsync with the correct filename', async () => {
    const mockOpen = SQLite.openDatabaseAsync as jest.Mock;
    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase } = require('../db/schema');
      await initializeDatabase();
    });
    expect(mockOpen).toHaveBeenCalledWith('safeinspect.db');
  });

  it('creates the _migrations tracking table', async () => {
    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase } = require('../db/schema');
      await initializeDatabase();
    });
    expect(mockCurrentDbStub.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS _migrations'),
    );
  });

  it('runs all 9 MIGRATIONS (withTransactionAsync called 9 times)', async () => {
    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase } = require('../db/schema');
      await initializeDatabase();
    });
    expect(mockCurrentDbStub.withTransactionAsync).toHaveBeenCalledTimes(9);
  });

  it('records each migration name via INSERT INTO _migrations', async () => {
    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase } = require('../db/schema');
      await initializeDatabase();
    });
    const insertCalls = (mockCurrentDbStub.runAsync as jest.Mock).mock.calls.filter(
      ([sql]: [string]) => sql.includes('INSERT INTO _migrations'),
    );
    expect(insertCalls).toHaveLength(9);
  });
});

// ─── Idempotency ──────────────────────────────────────────────────────────────

describe('initializeDatabase — idempotency', () => {
  it('opens the database only once when called twice (singleton reused)', async () => {
    const mockOpen = SQLite.openDatabaseAsync as jest.Mock;
    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase } = require('../db/schema');
      await initializeDatabase();
      await initializeDatabase(); // second call — must reuse _db
    });
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('does not re-apply migrations on the second call', async () => {
    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase } = require('../db/schema');
      await initializeDatabase();
      const countAfterFirst =
        (mockCurrentDbStub.withTransactionAsync as jest.Mock).mock.calls.length;
      await initializeDatabase();
      // No new transactions should have been started.
      expect(mockCurrentDbStub.withTransactionAsync).toHaveBeenCalledTimes(
        countAfterFirst,
      );
    });
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

    await jest.isolateModulesAsync(async () => {
      const { runMigrations } = require('../db/schema');
      const db = await (SQLite.openDatabaseAsync as jest.Mock)('safeinspect.db');
      await runMigrations(db);
    });

    expect(mockCurrentDbStub.withTransactionAsync).not.toHaveBeenCalled();
  });
});

// ─── Failure paths ────────────────────────────────────────────────────────────

describe('initializeDatabase — failure paths', () => {
  it('rejects when openDatabaseAsync throws', async () => {
    (SQLite.openDatabaseAsync as jest.Mock).mockRejectedValueOnce(
      new Error('disk full'),
    );
    await jest.isolateModulesAsync(async () => {
      const { initializeDatabase } = require('../db/schema');
      await expect(initializeDatabase()).rejects.toThrow('disk full');
    });
  });
});
