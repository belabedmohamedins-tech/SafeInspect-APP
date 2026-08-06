/**
 * __mocks__/expo-sqlite.js
 *
 * In-memory mock for expo-sqlite used by Jest (Node environment).
 * Implements the subset of the expo-sqlite API used by SafeInspect repositories:
 *   openDatabaseAsync, SQLiteDatabase (runAsync, getFirstAsync, getAllAsync,
 *   withTransactionAsync, closeAsync).
 *
 * Storage is keyed per database name so tests that call openDatabaseAsync(':memory:')
 * or a named DB get isolated, predictable state within the same test run.
 * Each test file should call jest.clearAllMocks() or reset state via the
 * exported __resetAll helper if needed.
 */

'use strict';

// Per-db in-memory stores: dbName → Map<table, rows[]>
const _stores = new Map();

function getStore(dbName) {
  if (!_stores.has(dbName)) _stores.set(dbName, { tables: new Map(), _txActive: false });
  return _stores.get(dbName);
}

// Very small SQL parser — handles only the patterns our repositories emit.
function execStatement(store, sql, params) {
  const s = sql.trim().replace(/\s+/g, ' ');

  // CREATE TABLE (any variant) — ensure table exists
  const createMatch = s.match(/^CREATE TABLE(?:\s+IF NOT EXISTS)?\s+[`"']?(\w+)/i);
  if (createMatch) {
    const tbl = createMatch[1];
    if (!store.tables.has(tbl)) store.tables.set(tbl, []);
    return { rows: [], changes: 0, lastInsertRowId: 0 };
  }

  // CREATE INDEX — no-op
  if (/^CREATE(?:\s+UNIQUE)?\s+INDEX/i.test(s)) {
    return { rows: [], changes: 0, lastInsertRowId: 0 };
  }

  // PRAGMA — no-op
  if (/^PRAGMA/i.test(s)) {
    return { rows: [], changes: 0, lastInsertRowId: 0 };
  }

  // INSERT ... ON CONFLICT(id) DO UPDATE
  const upsertMatch = s.match(/^INSERT\s+INTO\s+[`"']?(\w+)/i);
  if (upsertMatch) {
    const tbl = upsertMatch[1];
    if (!store.tables.has(tbl)) store.tables.set(tbl, []);
    const rows = store.tables.get(tbl);

    // Extract column list
    const colMatch = s.match(/\(([^)]+)\)\s*VALUES/i);
    if (!colMatch) return { rows: [], changes: 1, lastInsertRowId: rows.length };
    const cols = colMatch[1].split(',').map(c => c.trim().replace(/[`"']/g, ''));
    const p = Array.isArray(params) ? [...params] : [];
    const newRow = {};
    cols.forEach((col, i) => { newRow[col] = p[i] !== undefined ? p[i] : null; });

    const isUpsert = /ON CONFLICT\(id\) DO UPDATE/i.test(s);
    if (isUpsert && newRow.id !== undefined) {
      const idx = rows.findIndex(r => r.id === newRow.id);
      if (idx >= 0) {
        rows[idx] = { ...rows[idx], ...newRow };
      } else {
        rows.push(newRow);
      }
    } else {
      rows.push(newRow);
    }
    return { rows: [], changes: 1, lastInsertRowId: rows.length - 1 };
  }

  // UPDATE
  const updateMatch = s.match(/^UPDATE\s+[`"']?(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
  if (updateMatch) {
    const tbl = updateMatch[1];
    const setClauses = updateMatch[2];
    const whereClause = updateMatch[3];
    if (!store.tables.has(tbl)) return { rows: [], changes: 0, lastInsertRowId: 0 };
    const rows = store.tables.get(tbl);
    const p = Array.isArray(params) ? [...params] : [];

    // Parse SET col = ?, ...
    const setPairs = setClauses.split(',').map(s2 => s2.trim());
    const setMap = {};
    let pi = 0;
    for (const pair of setPairs) {
      const [col] = pair.split('=').map(x => x.trim().replace(/[`"']/g, ''));
      setMap[col] = p[pi++];
    }

    // Parse WHERE col = ?
    let changes = 0;
    for (const row of rows) {
      let match = true;
      if (whereClause) {
        const wParts = whereClause.split(/AND/i);
        for (const part of wParts) {
          const [wCol] = part.split('=').map(x => x.trim().replace(/[`"']/g, ''));
          if (row[wCol] !== p[pi]) { match = false; break; }
          pi++;
        }
      }
      if (match) { Object.assign(row, setMap); changes++; }
    }
    return { rows: [], changes, lastInsertRowId: 0 };
  }

  // DELETE FROM table WHERE id = ?
  const deleteMatch = s.match(/^DELETE\s+FROM\s+[`"']?(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if (deleteMatch) {
    const tbl = deleteMatch[1];
    const whereClause = deleteMatch[2];
    if (!store.tables.has(tbl)) return { rows: [], changes: 0, lastInsertRowId: 0 };
    const rows = store.tables.get(tbl);
    const p = Array.isArray(params) ? [...params] : [];
    if (!whereClause) {
      const count = rows.length;
      rows.length = 0;
      return { rows: [], changes: count, lastInsertRowId: 0 };
    }
    // Simple WHERE col = ?
    const colMatch2 = whereClause.match(/^([\w.]+)\s*=\s*\?/);
    if (colMatch2) {
      const col = colMatch2[1].replace(/[`"']/g, '');
      const val = p[0];
      const before = rows.length;
      const filtered = rows.filter(r => r[col] !== val);
      rows.length = 0;
      rows.push(...filtered);
      return { rows: [], changes: before - rows.length, lastInsertRowId: 0 };
    }
    // DELETE ... NOT IN (SELECT ...) — ring buffer pattern, just clear oldest
    const notInMatch = whereClause.match(/id\s+NOT\s+IN/i);
    if (notInMatch) {
      // no-op in tests — ring buffer pruning is fire-and-forget
      return { rows: [], changes: 0, lastInsertRowId: 0 };
    }
    return { rows: [], changes: 0, lastInsertRowId: 0 };
  }

  // SELECT
  const selectMatch = s.match(/^SELECT\s+.+\s+FROM\s+[`"']?(\w+)/i);
  if (selectMatch) {
    const tbl = selectMatch[1];
    const rows = store.tables.get(tbl) || [];
    const p = Array.isArray(params) ? [...params] : [];

    // WHERE col = ?
    const whereMatch = s.match(/WHERE\s+([\w.]+)\s*=\s*\?/i);
    if (whereMatch) {
      const col = whereMatch[1].replace(/[`"']/g, '');
      const val = p[0];
      return { rows: rows.filter(r => r[col] === val), changes: 0, lastInsertRowId: 0 };
    }
    // WHERE status IN (...) — simplified: return all
    if (/WHERE\s+status\s+IN/i.test(s)) {
      return { rows: [...rows], changes: 0, lastInsertRowId: 0 };
    }
    // WHERE status = 'completed'
    const statusMatch = s.match(/WHERE\s+status\s*=\s*'(\w[^']*)'/);
    if (statusMatch) {
      const val = statusMatch[1];
      return { rows: rows.filter(r => r.status === val), changes: 0, lastInsertRowId: 0 };
    }
    return { rows: [...rows], changes: 0, lastInsertRowId: 0 };
  }

  return { rows: [], changes: 0, lastInsertRowId: 0 };
}

function makeSQLiteDatabase(dbName) {
  const store = getStore(dbName);

  return {
    async runAsync(sql, params = []) {
      const result = execStatement(store, sql, params);
      return result;
    },

    async getFirstAsync(sql, params = []) {
      const result = execStatement(store, sql, params);
      return result.rows.length > 0 ? result.rows[0] : null;
    },

    async getAllAsync(sql, params = []) {
      const result = execStatement(store, sql, params);
      return result.rows;
    },

    async withTransactionAsync(fn) {
      store._txActive = true;
      try {
        await fn();
      } finally {
        store._txActive = false;
      }
    },

    async closeAsync() {
      // no-op in tests
    },

    async execAsync(sql) {
      // Multi-statement exec — split on ;
      const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        execStatement(store, stmt, []);
      }
    },
  };
}

async function openDatabaseAsync(name) {
  return makeSQLiteDatabase(name || ':memory:');
}

// Helper for tests that want a clean slate
function __resetAll() {
  _stores.clear();
}

module.exports = {
  openDatabaseAsync,
  __resetAll,
  // Named export alias used by some Expo SDK versions
  SQLiteDatabase: class SQLiteDatabase {},
};
