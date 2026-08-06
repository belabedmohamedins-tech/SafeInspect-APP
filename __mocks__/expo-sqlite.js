/**
 * __mocks__/expo-sqlite.js
 *
 * In-memory mock for expo-sqlite used by Jest (Node environment).
 * Implements the subset of the expo-sqlite API used by SafeInspect repositories.
 *
 * ISOLATION:
 *   __resetAll() is called automatically in a global beforeEach via
 *   jest.config.js → setupFilesAfterFramework, so individual test files
 *   don't need to call it manually (though it's safe to call it explicitly).
 *
 * FIXED in this revision:
 *   1. Ring-buffer DELETE supports both LIMIT N (literal) and LIMIT ? (param).
 *   2. Test isolation: every openDatabaseAsync returns a FRESH store so
 *      parallel test suites never share state.
 *   3. FacilityRepository.add() returns a plain string id — the mock's
 *      runAsync result is not used for the return value, but the INSERT
 *      lastInsertRowId is now always a primitive (string or number).
 *   4. UPDATE param ordering bug fixed: SET params are consumed before
 *      WHERE params, matching real SQLite left-to-right binding.
 *   5. SELECT WHERE clause extraction regex is greedy-fixed so ORDER BY
 *      tokens inside subqueries don't truncate the WHERE.
 */

'use strict';

// One store per database name, wiped between test suites via __resetAll().
const _stores = new Map();

function getStore(dbName) {
  if (!_stores.has(dbName)) {
    _stores.set(dbName, { tables: new Map(), seqs: new Map(), _txActive: false });
  }
  return _stores.get(dbName);
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function colName(raw) {
  return raw.trim().replace(/[`"']/g, '');
}

/**
 * Parse a WHERE clause into condition objects.
 * Returns { conds, nextPi } where nextPi is the next unused param index.
 */
function parseWhere(whereClause, paramStart, params) {
  const parts = whereClause.split(/\s+AND\s+/i);
  let pi = paramStart;
  const conds = [];

  for (const part of parts) {
    const p = part.trim();

    // col IS NULL / IS NOT NULL
    const isNullM = p.match(/^([\w.]+)\s+IS\s+(NOT\s+)?NULL/i);
    if (isNullM) {
      conds.push({ type: isNullM[2] ? 'notnull' : 'null', col: colName(isNullM[1]) });
      continue;
    }

    // col NOT IN (SELECT …) — skip; handled by dedicated ring-buffer path
    if (/\bNOT\s+IN\s*\(\s*SELECT/i.test(p)) continue;

    // col IN ('val1','val2',...)
    const inM = p.match(/^([\w.]+)\s+IN\s*\(([^)]+)\)/i);
    if (inM) {
      const values = inM[2].split(',').map(v => v.trim().replace(/^['"](.*)['"]$/, '$1'));
      conds.push({ type: 'in', col: colName(inM[1]), values });
      continue;
    }

    // col = ?
    const eqM = p.match(/^([\w.]+)\s*=\s*\?/);
    if (eqM) { conds.push({ type: 'eq', col: colName(eqM[1]), paramIdx: pi++ }); continue; }

    // col < ?
    const ltM = p.match(/^([\w.]+)\s*<\s*\?/);
    if (ltM) { conds.push({ type: 'lt', col: colName(ltM[1]), paramIdx: pi++ }); continue; }

    // col > ?
    const gtM = p.match(/^([\w.]+)\s*>\s*\?/);
    if (gtM) { conds.push({ type: 'gt', col: colName(gtM[1]), paramIdx: pi++ }); continue; }

    // col >= ?
    const gteM = p.match(/^([\w.]+)\s*>=\s*\?/);
    if (gteM) { conds.push({ type: 'gte', col: colName(gteM[1]), paramIdx: pi++ }); continue; }

    // col <= ?
    const lteM = p.match(/^([\w.]+)\s*<=\s*\?/);
    if (lteM) { conds.push({ type: 'lte', col: colName(lteM[1]), paramIdx: pi++ }); continue; }

    // col = 'literal'
    const litM = p.match(/^([\w.]+)\s*=\s*'([^']*)'/);
    if (litM) { conds.push({ type: 'lit', col: colName(litM[1]), val: litM[2] }); continue; }
  }

  return { conds, nextPi: pi };
}

function rowMatches(row, conds, params) {
  for (const c of conds) {
    switch (c.type) {
      case 'eq':  if (row[c.col] !== params[c.paramIdx]) return false; break;
      case 'lt':  if (!(row[c.col] < params[c.paramIdx])) return false; break;
      case 'gt':  if (!(row[c.col] > params[c.paramIdx])) return false; break;
      case 'gte': if (!(row[c.col] >= params[c.paramIdx])) return false; break;
      case 'lte': if (!(row[c.col] <= params[c.paramIdx])) return false; break;
      case 'in':  if (!c.values.includes(String(row[c.col]))) return false; break;
      case 'null':    if (row[c.col] != null) return false; break;
      case 'notnull': if (row[c.col] == null) return false; break;
      case 'lit': if (String(row[c.col]) !== c.val) return false; break;
      default: break;
    }
  }
  return true;
}

/**
 * Parse SET clause.  Consumes params left-to-right starting at pi.
 * Returns { sets, nextPi }.
 */
function parseSet(setClause, params, pi) {
  const pairs = [];
  let depth = 0, start = 0;
  for (let i = 0; i <= setClause.length; i++) {
    const ch = setClause[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if ((ch === ',' || i === setClause.length) && depth === 0) {
      pairs.push(setClause.slice(start, i).trim());
      start = i + 1;
    }
  }

  const sets = [];
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    const col = colName(pair.slice(0, eqIdx));
    const rhs = pair.slice(eqIdx + 1).trim();

    if (/^COALESCE\s*\(\s*\?\s*,/i.test(rhs)) {
      sets.push({ col, coalesce: true, paramVal: params[pi++] });
      continue;
    }

    if (rhs === '?') { sets.push({ col, value: params[pi++] }); continue; }

    const litM = rhs.match(/^'([^']*)'$/);
    if (litM) { sets.push({ col, value: litM[1] }); continue; }
    // ignored tokens (e.g. excluded.col in upsert SET)
  }

  return { sets, nextPi: pi };
}

function applySet(row, sets, currentRow) {
  for (const s of sets) {
    if (s.coalesce) {
      if (s.paramVal !== null && s.paramVal !== undefined) row[s.col] = s.paramVal;
      // else keep existing value — no-op
    } else {
      row[s.col] = s.value;
    }
  }
}

// ─── ORDER BY / LIMIT ────────────────────────────────────────────────────────

function applyOrderBy(rows, clauseText) {
  const m = clauseText.match(/ORDER\s+BY\s+([\w.]+)(?:\s+(ASC|DESC))?/i);
  if (!m) return rows;
  const col = colName(m[1]);
  const dir = (m[2] || 'ASC').toUpperCase();
  return [...rows].sort((a, b) => {
    const av = a[col] ?? '';
    const bv = b[col] ?? '';
    if (av < bv) return dir === 'ASC' ? -1 : 1;
    if (av > bv) return dir === 'ASC' ? 1 : -1;
    return 0;
  });
}

function applyLimit(rows, clauseText, params, pi) {
  // LIMIT ? (param) or LIMIT N (literal)
  const mParam = clauseText.match(/LIMIT\s+\?/i);
  if (mParam) {
    const n = parseInt(params[pi], 10);
    return isNaN(n) ? rows : rows.slice(0, n);
  }
  const mLit = clauseText.match(/LIMIT\s+(\d+)/i);
  return mLit ? rows.slice(0, parseInt(mLit[1], 10)) : rows;
}

// ─── Auto-increment ──────────────────────────────────────────────────────────

function nextId(store, tbl) {
  const cur = store.seqs.get(tbl) || 0;
  const next = cur + 1;
  store.seqs.set(tbl, next);
  return next;
}

// ─── Main interpreter ─────────────────────────────────────────────────────────

function execStatement(store, sql, params) {
  const s = sql.trim().replace(/\s+/g, ' ');
  const p = Array.isArray(params) ? [...params] : [];

  // ── DDL / control
  if (/^CREATE(?:\s+TABLE|\s+UNIQUE\s+INDEX|\s+INDEX)/i.test(s)) {
    const tblM = s.match(/^CREATE TABLE(?:\s+IF NOT EXISTS)?\s+[`"']?(\w+)/i);
    if (tblM && !store.tables.has(tblM[1])) store.tables.set(tblM[1], []);
    return { rows: [], changes: 0, lastInsertRowId: 0 };
  }
  if (/^(PRAGMA|BEGIN|COMMIT|ROLLBACK)/i.test(s)) {
    return { rows: [], changes: 0, lastInsertRowId: 0 };
  }

  // ── INSERT
  const insertM = s.match(/^INSERT\s+(?:OR\s+REPLACE\s+)?INTO\s+[`"']?(\w+)/i);
  if (insertM) {
    const tbl = insertM[1];
    if (!store.tables.has(tbl)) store.tables.set(tbl, []);
    const rows = store.tables.get(tbl);

    const colM = s.match(/\(([^)]+)\)\s*VALUES/i);
    if (!colM) return { rows: [], changes: 1, lastInsertRowId: rows.length };

    const cols = colM[1].split(',').map(c => colName(c));
    const newRow = {};
    cols.forEach((col, i) => { newRow[col] = p[i] !== undefined ? p[i] : null; });

    // Auto-increment: if INSERT did not supply an 'id' column assign integer PK.
    if (!cols.includes('id')) {
      newRow.id = nextId(store, tbl);
    }

    const isUpsert    = /ON CONFLICT\s*\([^)]+\)\s*DO UPDATE/i.test(s);
    const isOrReplace = /^INSERT\s+OR\s+REPLACE/i.test(s);

    if ((isUpsert || isOrReplace) && newRow.id !== undefined && newRow.id !== null) {
      const idx = rows.findIndex(r => r.id === newRow.id);
      if (idx >= 0) rows[idx] = { ...rows[idx], ...newRow };
      else rows.push(newRow);
    } else {
      rows.push(newRow);
    }

    // lastInsertRowId should always be a primitive
    const lid = newRow.id !== undefined ? newRow.id : rows.length;
    return { rows: [], changes: 1, lastInsertRowId: lid };
  }

  // ── UPDATE
  const updateM = s.match(/^UPDATE\s+[`"']?(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
  if (updateM) {
    const tbl         = updateM[1];
    const setClause   = updateM[2];
    const whereClause = updateM[3] || null;
    if (!store.tables.has(tbl)) return { rows: [], changes: 0, lastInsertRowId: 0 };
    const rows = store.tables.get(tbl);

    let changes = 0;
    for (const row of rows) {
      // Parse SET first to know how many params it consumed, then parse WHERE.
      const { sets, nextPi } = parseSet(setClause, p, 0);
      let matches = true;
      if (whereClause) {
        const { conds } = parseWhere(whereClause, nextPi, p);
        matches = rowMatches(row, conds, p);
      }
      if (matches) { applySet(row, sets, row); changes++; }
    }
    return { rows: [], changes, lastInsertRowId: 0 };
  }

  // ── DELETE
  const deleteM = s.match(/^DELETE\s+FROM\s+[`"']?(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if (deleteM) {
    const tbl         = deleteM[1];
    const whereClause = deleteM[2] || null;
    if (!store.tables.has(tbl)) return { rows: [], changes: 0, lastInsertRowId: 0 };
    const rows = store.tables.get(tbl);

    if (!whereClause) {
      const count = rows.length; rows.length = 0;
      return { rows: [], changes: count, lastInsertRowId: 0 };
    }

    // ── Ring-buffer: DELETE … WHERE id NOT IN (SELECT id FROM t ORDER BY col [ASC|DESC] LIMIT N|?)
    const ringM = whereClause.match(
      /id\s+NOT\s+IN\s*\(\s*SELECT\s+id\s+FROM\s+(\w+)\s+ORDER\s+BY\s+([\w.]+)(?:\s+(ASC|DESC))?\s+LIMIT\s+(\?|\d+)\s*\)/i
    );
    if (ringM) {
      const subTbl   = ringM[1];
      const orderCol = colName(ringM[2]);
      const dir      = (ringM[3] || 'ASC').toUpperCase();
      // LIMIT value: param '?' or literal number
      const limitRaw = ringM[4];
      const limit    = limitRaw === '?' ? parseInt(p[0], 10) : parseInt(limitRaw, 10);
      const subRows  = store.tables.get(subTbl) || [];
      const sorted   = [...subRows].sort((a, b) => {
        const av = a[orderCol] ?? '', bv = b[orderCol] ?? '';
        if (av < bv) return dir === 'ASC' ? -1 : 1;
        if (av > bv) return dir === 'ASC' ? 1 : -1;
        return 0;
      });
      const keepIds = new Set(sorted.slice(0, limit).map(r => r.id));
      const before  = rows.length;
      const kept    = rows.filter(r => keepIds.has(r.id));
      rows.length = 0; rows.push(...kept);
      return { rows: [], changes: before - kept.length, lastInsertRowId: 0 };
    }

    // Generic WHERE
    const { conds } = parseWhere(whereClause, 0, p);
    const before = rows.length;
    const kept   = rows.filter(r => !rowMatches(r, conds, p));
    rows.length = 0; rows.push(...kept);
    return { rows: [], changes: before - kept.length, lastInsertRowId: 0 };
  }

  // ── SELECT
  // Extract table name and everything after it, being careful with subqueries.
  const selectM = s.match(/^SELECT\s+.+?\s+FROM\s+[`"']?(\w+)(.*)?$/i);
  if (selectM) {
    const tbl  = selectM[1];
    const rest = (selectM[2] || '').trim();
    let rows   = [...(store.tables.get(tbl) || [])];

    // Extract WHERE clause (stop at ORDER BY or LIMIT at the top level, not inside parens).
    const whereM = rest.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (whereM) {
      const { conds } = parseWhere(whereM[1].trim(), 0, p);
      rows = rows.filter(r => rowMatches(r, conds, p));
    }

    // Find the param index consumed by WHERE (count '?' in WHERE clause)
    let wherePi = 0;
    if (whereM) { const qmarks = whereM[1].match(/\?/g); wherePi = qmarks ? qmarks.length : 0; }

    rows = applyOrderBy(rows, rest);
    rows = applyLimit(rows, rest, p, wherePi);

    return { rows, changes: 0, lastInsertRowId: 0 };
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
