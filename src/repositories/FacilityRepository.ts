// src/repositories/FacilityRepository.ts
//
// Z5: migrated from AsyncStorage to expo-sqlite.
// Public API is unchanged — all callers continue to work without modification.
// Coord sanitization (1B fix) is preserved.

import { getDb } from '../db/schema';
import { Facility } from '../types';

// ─── Coord guard (preserved from AsyncStorage version) ───────────────────────

function parseCoord(
  raw: number | string | undefined | null,
  axis: 'lat' | 'lng',
): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const n = typeof raw === 'number' ? raw : parseFloat(raw as string);
  if (!isFinite(n)) return undefined;
  if (axis === 'lat' && (n < -90 || n > 90)) return undefined;
  if (axis === 'lng' && (n < -180 || n > 180)) return undefined;
  return n;
}

function sanitizeCoords<T extends Partial<Pick<Facility, 'lat' | 'lng'>>>(data: T): T {
  const out = { ...data };
  if ('lat' in data) out.lat = parseCoord(data.lat as number | string | undefined, 'lat');
  if ('lng' in data) out.lng = parseCoord(data.lng as number | string | undefined, 'lng');
  return out;
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

type FacilityRow = {
  id: string;
  project_name: string;
  owner_name: string;
  activity: string;
  address: string;
  lat: number | null;
  lng: number | null;
  license_type: string | null;
  license_details: string | null;
  year: string | null;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function rowToFacility(row: FacilityRow): Facility {
  return {
    id: row.id,
    projectName: row.project_name,
    ownerName: row.owner_name,
    activity: row.activity,
    address: row.address,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    licenseType: row.license_type ?? undefined,
    licenseDetails: row.license_details ?? undefined,
    year: row.year ?? undefined,
    category: row.category ?? undefined,
    notes: row.notes ?? undefined,
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const FacilityRepository = {
  async getAll(): Promise<Facility[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<FacilityRow>(
      'SELECT * FROM facilities ORDER BY created_at DESC',
    );
    return rows.map(rowToFacility);
  },

  async getById(id: string): Promise<Facility | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<FacilityRow>(
      'SELECT * FROM facilities WHERE id = ?',
      [id],
    );
    return row ? rowToFacility(row) : null;
  },

  async add(facility: Omit<Facility, 'id'>): Promise<Facility> {
    const db = await getDb();
    const safe = sanitizeCoords(facility);
    const id = 'U' + Date.now().toString() + '-' + Math.random().toString(36).slice(2, 7);
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO facilities
         (id, project_name, owner_name, activity, address,
          lat, lng, license_type, license_details, year, category, notes,
          created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        safe.projectName ?? '',
        safe.ownerName ?? '',
        safe.activity ?? '',
        safe.address ?? '',
        safe.lat ?? null,
        safe.lng ?? null,
        safe.licenseType ?? null,
        safe.licenseDetails ?? null,
        safe.year ?? null,
        safe.category ?? null,
        safe.notes ?? null,
        now,
        now,
      ],
    );
    return { ...safe, id } as Facility;
  },

  async update(
    id: string,
    updatedData: Partial<Omit<Facility, 'id'>>,
  ): Promise<Facility | null> {
    const existing = await FacilityRepository.getById(id);
    if (!existing) return null;
    const safe = sanitizeCoords(updatedData);
    const merged: Facility = { ...existing, ...safe, id };
    const now = new Date().toISOString();
    await (await getDb()).runAsync(
      `UPDATE facilities SET
         project_name = ?, owner_name = ?, activity = ?, address = ?,
         lat = ?, lng = ?, license_type = ?, license_details = ?,
         year = ?, category = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [
        merged.projectName ?? '',
        merged.ownerName ?? '',
        merged.activity ?? '',
        merged.address ?? '',
        merged.lat ?? null,
        merged.lng ?? null,
        merged.licenseType ?? null,
        merged.licenseDetails ?? null,
        merged.year ?? null,
        merged.category ?? null,
        merged.notes ?? null,
        now,
        id,
      ],
    );
    return merged;
  },

  async remove(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.runAsync('DELETE FROM facilities WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async clear(): Promise<void> {
    await (await getDb()).runAsync('DELETE FROM facilities');
  },
} as const;
