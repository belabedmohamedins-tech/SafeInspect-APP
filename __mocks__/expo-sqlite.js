/**
 * __mocks__/expo-sqlite.js
 *
 * In-memory mock for expo-sqlite used by Jest (Node environment).
 *
 * CRITICAL DESIGN CONSTRAINT — jest.resetModules() survival
 * ──────────────────────────────────────────────────────────
 * InspectionRepository.test.ts calls jest.resetModules() in its beforeEach.
 * This causes Node/Jest to re-evaluate this file, producing a NEW module
 * instance with a NEW `_stores` Map.  The statically-imported
 * InspectionRepository (top-level import) holds a DB handle whose store
 * reference points to the OLD Map — rows written before resetModules() are
 * invisible to queries that use the NEW Map, and vice-versa.  The result is
 * cross-test data leakage that makes getCompleted/getDrafts return wrong
 * row counts.
 *
 * FIX: anchor _stores and _insertionCounters on `global` (which Jest never
 * re-creates across resetModules()).  The first evaluation seeds the Map;
 * every subsequent evaluation (after resetModules()) re-uses the same object.
 * __resetAll() mutates the existing store objects IN PLACE so all DB handles
 * — old and new module instances alike — see the cleared state.
 *
 * OTHER BEHAVIOUR:
 *   • ORDER BY … DESC tiebreaker: rows with equal sort-key are returned in
 *     reverse insertion order (DESC) so "most recent insert" wins in ties.
 *   • IN (?) with ?-placeholders: expanded against the params array.
 *   • COALESCE(?, existing) partial-update pattern supported in SET.
 */

'use strict';

// ─── Global-pinned store (survives jest.resetModules()) ───────────────────────

if (!global.__sqliteMockStores) {
  global.__sqliteMockStores = new Map();
}
const _stores = global.__sqliteMockStores;

// Per-table insertion counter — used as tiebreaker in ORDER BY sorts.
// Also pinned globally so it survives resetModules().
if (!global.__sqliteMockInsertSeq) {
  global.__sqliteMockInsertSeq = { n: 0 };
}
const _insertSeq = global.__sqliteMockInsertSeq;

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

function parseWhere(whereClause, paramStart, params) {
  const parts = whereClause.split(/\s+AND\s+/i);
  let pi = paramStart;
  const conds = [];

  for (const part of parts) {
    const p = part.trim();

    const isNullM = p.match(/^([\w.]+)\s+IS\s+(NOT\s+)?NULL/i);
    if (isNullM) {
      conds.push({ type: isNullM[2] ? 'notnull' : 'null', col: colName(isNullM[1]) });
      continue;
    }

    if (/\bNOT\s+IN\s*\(\s*SELECT/i.test(p)) continue;

    // IN (?, ?, …) — consume one param per ?
    const inParamM = p.match(/^([\w.]+)\s+IN\s*\((\s*\?\s*(?:,\s*\?\s*)*)\)/i);
    if (inParamM) {
      const col = colName(inParamM[1]);
      const count = (inParamM[2].match(/\?/g) || []).length;
      const values = params.slice(pi, pi + count).map(v => String(v));
      pi += count;
      conds.push({ type: 'in', col, values });
      continue;
    }

    // IN ('lit', 'lit', …) — literal strings
    const inLitM = p.match(/^([\w.]+)\s+IN\s*\(([^)]+)\)/i);
    if (inLitM) {
      const values = inLitM[2].split(',').map(v => v.trim().replace(/^['"](.*)['"]$/, '$1'));
      conds.push({ type: 'in', col: colName(inLitM[1]), values });
      continue;
    }

    const eqM = p.match(/^([\w.]+)\s*=\s*\?/);
    if (eqM) { conds.push({ type: 'eq', col: colName(eqM[1]), paramIdx: pi++ }); continue; }

    const neqM = p.match(/^([\w.]+)\s*(?:!=|<>)\s*\?/);
    if (neqM) { conds.push({ type: 'neq', col: colName(neqM[1]), paramIdx: pi++ }); continue; }

    const ltM = p.match(/^([\w.]+)\s*<\s*\?/);
    if (ltM) { conds.push({ type: 'lt', col: colName(ltM[1]), paramIdx: pi++ }); continue; }

    const gtM = p.match(/^([\w.]+)\s*>\s*\?/);
    if (gtM) { conds.push({ type: 'gt', col: colName(gtM[1]), paramIdx: pi++ }); continue; }

    const gteM = p.match(/^([\w.]+)\s*>=\s*\?/);
    if (gteM) { conds.push({ type: 'gte', col: colName(gteM[1]), paramIdx: pi++ }); continue; }

    const lteM = p.match(/^([\w.]+)\s*<=\s*\?/);
    if (lteM) { conds.push({ type: 'lte', col: colName(lteM[1]), paramIdx: pi++ }); continue; }

    const litM = p.match(/^([\w.]+)\s*=\s*'([^']*)'/);
    if (litM) { conds.push({ type: 'lit', col: colName(litM[1]), val: litM[2] }); continue; }
  }

  return { conds, nextPi: pi };
}

function rowMatches(row, conds, params) {
  for (const c of conds) {
    switch (c.type) {
      case 'eq':      if (row[c.col] != params[c.paramIdx]) return false; break;
      case 'neq':     if (row[c.col] == params[c.paramIdx]) return false; break;
      case 'lt':      if (!(row[c.col] <  params[c.paramIdx])) return false; break;
      case 'gt':      if (!(row[c.col] >  params[c.paramIdx])) return false; break;
      case 'gte':     if (!(row[c.col] >= params[c.paramIdx])) return false; break;
      case 'lte':     if (!(row[c.col] <= params[c.paramIdx])) return false; break;
      case 'in':      if (!c.values.includes(String(row[c.col]))) return false; break;
      case 'null':    if (row[c.col] != null) return false; break;
      case 'notnull': if (row[c.col] == null) return false; break;
      case 'lit':     if (String(row[c.col]) !== c.val) return false; break;
      default: break;
    }
  }
  return true;
}

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
  }

  return { sets, nextPi: pi };
}

function applySet(row, sets) {
  for (const s of sets) {
    if (s.coalesce) {
      if (s.paramVal !== null && s.paramVal !== undefined) row[s.col] = s.paramVal;
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
    let cmp;
    if (typeof av === 'string' && typeof bv === 'string') {
      cmp = av.localeCompare(bv);
    } else {
      cmp = av < bv ? -1 : av > bv ? 1 : 0;
    }
    if (cmp !== 0) return dir === 'ASC' ? cmp : -cmp;
    // Tiebreaker: for DESC use reverse insertion order so the most-recently
    // inserted row wins (matches "ORDER BY created_at DESC" semantics when
    // two rows share the same timestamp in fast tests).
    const ai = a.__insertSeq ?? 0;
    const bi = b.__insertSeq ?? 0;
    return dir === 'ASC' ? ai - bi : bi - ai;
  });
}

function applyLimit(rows, clauseText, params, pi) {
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
  const insertM = s.match(/^INSERT\s+(?:OR\s+(?:REPLACE|IGNORE)\s+)?INTO\s+[`"']?(\w+)/i);
  if (insertM) {
    const tbl = insertM[1];
    if (!store.tables.has(tbl)) store.tables.set(tbl, []);
    const rows = store.tables.get(tbl);

    const isIgnore = /^INSERT\s+OR\s+IGNORE/i.test(s);

    const colM = s.match(/\(([^)]+)\)\s*VALUES/i);
    if (!colM) return { rows: [], changes: 1, lastInsertRowId: rows.length };

    const cols = colM[1].split(',').map(c => colName(c));
    const newRow = {};
    cols.forEach((col, i) => { newRow[col] = p[i] !== undefined ? p[i] : null; });

    if (!cols.includes('id')) {
      newRow.id = nextId(store, tbl);
    }

    // Stamp insertion order for ORDER BY tiebreaking (hidden field).
    newRow.__insertSeq = ++_insertSeq.n;

    const isUpsert    = /ON CONFLICT\s*\([^)]+\)\s*DO UPDATE/i.test(s);
    const isOrReplace = /^INSERT\s+OR\s+REPLACE/i.test(s);

    if ((isUpsert || isOrReplace) && newRow.id !== undefined && newRow.id !== null) {
      const idx = rows.findIndex(r => r.id == newRow.id);
      if (idx >= 0) {
        // Preserve original __insertSeq on upsert so ORDER BY is stable.
        newRow.__insertSeq = rows[idx].__insertSeq ?? newRow.__insertSeq;
        Object.assign(rows[idx], newRow);
      } else {
        rows.push(newRow);
      }
    } else if (isIgnore && newRow.id !== undefined && newRow.id !== null) {
      const exists = rows.some(r => r.id == newRow.id);
      if (!exists) rows.push(newRow);
    } else {
      rows.push(newRow);
    }

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
      const { sets, nextPi } = parseSet(setClause, p, 0);
      let matches = true;
      if (whereClause) {
        const { conds } = parseWhere(whereClause, nextPi, p);
        matches = rowMatches(row, conds, p);
      }
      if (matches) { applySet(row, sets); changes++; }
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

    // Ring-buffer: DELETE … WHERE id NOT IN (SELECT id FROM t ORDER BY col LIMIT N|?)
    const ringM = whereClause.match(
      /id\s+NOT\s+IN\s*\(\s*SELECT\s+id\s+FROM\s+(\w+)\s+ORDER\s+BY\s+([\w.]+)(?:\s+(ASC|DESC))?\s+LIMIT\s+(\?|\d+)\s*\)/i
    );
    if (ringM) {
      const subTbl   = ringM[1];
      const orderCol = colName(ringM[2]);
      const dir      = (ringM[3] || 'ASC').toUpperCase();
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

    const { conds } = parseWhere(whereClause, 0, p);
    const before = rows.length;
    const kept   = rows.filter(r => !rowMatches(r, conds, p));
    rows.length = 0; rows.push(...kept);
    return { rows: [], changes: before - kept.length, lastInsertRowId: 0 };
  }

  // ── SELECT
  const selectM = s.match(/^SELECT\s+.+?\s+FROM\s+[`"']?(\w+)(.*)?$/i);
  if (selectM) {
    const tbl  = selectM[1];
    const rest = (selectM[2] || '').trim();
    let rows   = [...(store.tables.get(tbl) || [])];

    const whereM = rest.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (whereM) {
      const { conds } = parseWhere(whereM[1].trim(), 0, p);
      rows = rows.filter(r => rowMatches(r, conds, p));
    }

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

/**
 * __resetAll — wipes every store IN PLACE and resets the insertion counter.
 *
 * Must clear tables and seqs on the SAME objects (not replace them) so that
 * DB handles cached in modules that were loaded before resetModules() still
 * see an empty database after the reset.  The global _stores Map and each
 * store object survive jest.resetModules() because they live on `global`.
 */
function __resetAll() {
  for (const store of _stores.values()) {
    store.tables.clear();
    store.seqs.clear();
    store._txActive = false;
  }
  // Reset insertion counter so ORDER BY tiebreaker restarts from 0.
  _insertSeq.n = 0;
}

const __resetStore = __resetAll;

module.exports = {
  openDatabaseAsync,
  __resetAll,
  __resetStore,
  SQLiteDatabase: class SQLiteDatabase {},
};
