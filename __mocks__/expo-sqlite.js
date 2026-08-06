/**
 * __mocks__/expo-sqlite.js
 *
 * In-memory mock for expo-sqlite used by Jest (Node environment).
 * Implements the subset of the expo-sqlite API used by SafeInspect repositories:
 *   openDatabaseAsync, SQLiteDatabase (runAsync, getFirstAsync, getAllAsync,
 *   withTransactionAsync, execAsync, closeAsync).
 *
 * ISOLATION:
 *   _stores is keyed by db name.  Call __resetAll() in beforeEach to wipe all
 *   tables between tests.  schema.ts must also expose __resetDb() so the
 *   singleton db handle is discarded and re-opened against the fresh store.
 *
 * BUGS FIXED vs previous version:
 *   1. UPDATE WHERE pointer: SET params were counted but `pi` was not reset
 *      before reading the WHERE param, so wrong rows were matched.
 *      Fix: capture `whereParamStart = pi` after SET parsing.
 *   2. UPDATE multi-word column names with backtick aliases: strip via regex
 *      before splitting on '='.
 */

'use strict';

// Per-db in-memory stores: dbName → { tables: Map<string, row[]> }
const _stores = new Map();

function getStore(dbName) {
  if (!_stores.has(dbName)) _stores.set(dbName, { tables: new Map(), _txActive: false });
  return _stores.get(dbName);
}

// ─── Tiny SQL interpreter ─────────────────────────────────────────────────────

function execStatement(store, sql, params) {
  const s = sql.trim().replace(/\s+/g, ' ');
  const p = Array.isArray(params) ? [...params] : [];

  // ── CREATE TABLE
  const createMatch = s.match(/^CREATE TABLE(?:\s+IF NOT EXISTS)?\s+[`"']?(\w+)/i);
  if (createMatch) {
    const tbl = createMatch[1];
    if (!store.tables.has(tbl)) store.tables.set(tbl, []);
    return { rows: [], changes: 0, lastInsertRowId: 0 };
  }

  // ── CREATE INDEX / PRAGMA / BEGIN / COMMIT / ROLLBACK → no-op
  if (/^CREATE(?:\s+UNIQUE)?\s+INDEX/i.test(s)) return { rows: [], changes: 0, lastInsertRowId: 0 };
  if (/^PRAGMA/i.test(s))                        return { rows: [], changes: 0, lastInsertRowId: 0 };
  if (/^(BEGIN|COMMIT|ROLLBACK)/i.test(s))       return { rows: [], changes: 0, lastInsertRowId: 0 };

  // ── INSERT (plain or UPSERT)
  const insertMatch = s.match(/^INSERT\s+(?:OR\s+REPLACE\s+)?INTO\s+[`"']?(\w+)/i);
  if (insertMatch) {
    const tbl = insertMatch[1];
    if (!store.tables.has(tbl)) store.tables.set(tbl, []);
    const rows = store.tables.get(tbl);

    const colMatch = s.match(/\(([^)]+)\)\s*VALUES/i);
    if (!colMatch) return { rows: [], changes: 1, lastInsertRowId: rows.length };

    const cols = colMatch[1].split(',').map(c => c.trim().replace(/[`"']/g, ''));
    const newRow = {};
    cols.forEach((col, i) => { newRow[col] = p[i] !== undefined ? p[i] : null; });

    const isUpsert = /ON CONFLICT\s*\([^)]+\)\s*DO UPDATE/i.test(s);
    const isOrReplace = /^INSERT\s+OR\s+REPLACE/i.test(s);

    if ((isUpsert || isOrReplace) && newRow.id !== undefined) {
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

  // ── UPDATE table SET col=?, … WHERE col=?
  const updateMatch = s.match(/^UPDATE\s+[`"']?(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)$/i);
  if (updateMatch) {
    const tbl          = updateMatch[1];
    const setClause    = updateMatch[2];
    const whereClause  = updateMatch[3];
    if (!store.tables.has(tbl)) return { rows: [], changes: 0, lastInsertRowId: 0 };
    const rows = store.tables.get(tbl);

    // Parse SET: build map col→paramIndex, count how many ? are consumed
    const setPairs = setClause.split(',').map(x => x.trim());
    const setMap   = {}; // col → index into p[]
    let pi = 0;
    for (const pair of setPairs) {
      const eqIdx = pair.indexOf('=');
      const col   = pair.slice(0, eqIdx).trim().replace(/[`"']/g, '');
      setMap[col] = pi++; // store the param index, not the value yet
    }
    // pi now points at the first WHERE param
    const whereParamStart = pi;

    // Parse WHERE — support: col=? and col=? AND col=?
    const wParts = whereClause.split(/\s+AND\s+/i);
    const whereConditions = wParts.map((part, i) => {
      const eqIdx = part.indexOf('=');
      const col   = part.slice(0, eqIdx).trim().replace(/[`"']/g, '');
      return { col, paramIdx: whereParamStart + i };
    });

    let changes = 0;
    for (const row of rows) {
      const matches = whereConditions.every(cond => row[cond.col] === p[cond.paramIdx]);
      if (matches) {
        // Apply SET values
        for (const [col, pidx] of Object.entries(setMap)) {
          row[col] = p[pidx];
        }
        changes++;
      }
    }
    return { rows: [], changes, lastInsertRowId: 0 };
  }

  // ── UPDATE without WHERE (full table update)
  const updateNoWhereMatch = s.match(/^UPDATE\s+[`"']?(\w+)\s+SET\s+(.+)$/i);
  if (updateNoWhereMatch) {
    const tbl       = updateNoWhereMatch[1];
    const setClause = updateNoWhereMatch[2];
    if (!store.tables.has(tbl)) return { rows: [], changes: 0, lastInsertRowId: 0 };
    const rows = store.tables.get(tbl);
    const setPairs = setClause.split(',').map(x => x.trim());
    const setMap   = {};
    let pi = 0;
    for (const pair of setPairs) {
      const eqIdx = pair.indexOf('=');
      const col   = pair.slice(0, eqIdx).trim().replace(/[`"']/g, '');
      setMap[col]  = p[pi++];
    }
    for (const row of rows) Object.assign(row, setMap);
    return { rows: [], changes: rows.length, lastInsertRowId: 0 };
  }

  // ── DELETE
  const deleteMatch = s.match(/^DELETE\s+FROM\s+[`"']?(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if (deleteMatch) {
    const tbl         = deleteMatch[1];
    const whereClause = deleteMatch[2];
    if (!store.tables.has(tbl)) return { rows: [], changes: 0, lastInsertRowId: 0 };
    const rows = store.tables.get(tbl);

    if (!whereClause) {
      const count = rows.length;
      rows.length = 0;
      return { rows: [], changes: count, lastInsertRowId: 0 };
    }

    // WHERE id = ?
    const simpleWhere = whereClause.match(/^([\w.]+)\s*=\s*\?/);
    if (simpleWhere) {
      const col = simpleWhere[1].replace(/[`"']/g, '');
      const val = p[0];
      const before = rows.length;
      const filtered = rows.filter(r => r[col] !== val);
      rows.length = 0;
      rows.push(...filtered);
      return { rows: [], changes: before - rows.length, lastInsertRowId: 0 };
    }

    // DELETE … WHERE id NOT IN (SELECT …) — ring buffer pruning, fire-and-forget
    if (/id\s+NOT\s+IN/i.test(whereClause)) {
      return { rows: [], changes: 0, lastInsertRowId: 0 };
    }

    return { rows: [], changes: 0, lastInsertRowId: 0 };
  }

  // ── SELECT
  const selectMatch = s.match(/^SELECT\s+.+\s+FROM\s+[`"']?(\w+)/i);
  if (selectMatch) {
    const tbl  = selectMatch[1];
    const rows = store.tables.get(tbl) || [];

    // WHERE col = ?
    const simpleWhere = s.match(/WHERE\s+([\w.]+)\s*=\s*\?/i);
    if (simpleWhere) {
      const col = simpleWhere[1].replace(/[`"']/g, '');
      const val = p[0];
      return { rows: rows.filter(r => r[col] === val), changes: 0, lastInsertRowId: 0 };
    }
    // WHERE status IN (...) — return all (simplified, good enough for tests)
    if (/WHERE\s+\w+\s+IN\s*\(/i.test(s)) {
      return { rows: [...rows], changes: 0, lastInsertRowId: 0 };
    }
    // WHERE status = 'literal'
    const litWhere = s.match(/WHERE\s+(\w+)\s*=\s*'([^']+)'/);
    if (litWhere) {
      const col = litWhere[1];
      const val = litWhere[2];
      return { rows: rows.filter(r => r[col] === val), changes: 0, lastInsertRowId: 0 };
    }
    // WHERE col IS NULL
    const isNullWhere = s.match(/WHERE\s+([\w.]+)\s+IS\s+NULL/i);
    if (isNullWhere) {
      const col = isNullWhere[1].replace(/[`"']/g, '');
      return { rows: rows.filter(r => r[col] == null), changes: 0, lastInsertRowId: 0 };
    }
    return { rows: [...rows], changes: 0, lastInsertRowId: 0 };
  }

  return { rows: [], changes: 0, lastInsertRowId: 0 };
}

// ─── DB factory ──────────────────────────────────────────────────────────────

function makeSQLiteDatabase(dbName) {
  const store = getStore(dbName);
  return {
    async runAsync(sql, params = []) {
      return execStatement(store, sql, params);
    },
    async getFirstAsync(sql, params = []) {
      const { rows } = execStatement(store, sql, params);
      return rows.length > 0 ? rows[0] : null;
    },
    async getAllAsync(sql, params = []) {
      return execStatement(store, sql, params).rows;
    },
    async withTransactionAsync(fn) {
      store._txActive = true;
      try { await fn(); } finally { store._txActive = false; }
    },
    async closeAsync() { /* no-op */ },
    async execAsync(sql) {
      for (const stmt of sql.split(';').map(x => x.trim()).filter(Boolean)) {
        execStatement(store, stmt, []);
      }
    },
  };
}

async function openDatabaseAsync(name) {
  return makeSQLiteDatabase(name || ':memory:');
}

function __resetAll() {
  _stores.clear();
}

module.exports = {
  openDatabaseAsync,
  __resetAll,
  SQLiteDatabase: class SQLiteDatabase {},
};
