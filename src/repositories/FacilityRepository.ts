// src/repositories/FacilityRepository.ts
//
// Thin AsyncStorage wrapper for the user-added facilities list.
// Mirrors the pattern used by InspectionRepository and AgendaRepository.
// The hardcoded facilities in facilitiesData.ts are read-only and are NOT
// managed here — see facilitiesService.ts for the merged read helpers.
//
// 1B fix: lat/lng values are coerced to numbers (or undefined) before every
// write so that string coordinates from map-picker callbacks (e.g. from
// expo-location or a text input) can never corrupt the stored geometry.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Facility } from '../types';
import { StorageKeys } from './keys';

const KEY = StorageKeys.USER_FACILITIES;

// ─── Guard: coerce lat/lng to valid floats ────────────────────────────────────

/**
 * Parses a lat or lng value that may arrive as a string (e.g. from a
 * TextInput or expo-location string coercion) and returns a valid float,
 * or undefined when the value is missing / NaN / out-of-range.
 *
 * Valid ranges:
 *  latitude  : –90 … 90
 *  longitude : –180 … 180
 */
function parseCoord(
  raw: number | string | undefined | null,
  axis: 'lat' | 'lng',
): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const n = typeof raw === 'number' ? raw : parseFloat(raw as string);
  if (!isFinite(n)) return undefined;
  if (axis === 'lat'  && (n < -90  || n > 90))  return undefined;
  if (axis === 'lng'  && (n < -180 || n > 180)) return undefined;
  return n;
}

/**
 * Applies the lat/lng guard to a partial Facility before it is stored.
 * All other fields are passed through unchanged.
 */
function sanitizeCoords<T extends Partial<Pick<Facility, 'lat' | 'lng'>>>(data: T): T {
  const out = { ...data };
  if ('lat' in data) out.lat = parseCoord(data.lat as number | string | undefined, 'lat');
  if ('lng' in data) out.lng = parseCoord(data.lng as number | string | undefined, 'lng');
  return out;
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

async function readAll(): Promise<Facility[]> {
  const json = await AsyncStorage.getItem(KEY);
  return json ? (JSON.parse(json) as Facility[]) : [];
}

async function writeAll(facilities: Facility[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(facilities));
}

// ─── Repository ──────────────────────────────────────────────────────────────

export const FacilityRepository = {
  /** Returns all user-created facilities (does NOT include hardcoded ones). */
  getAll: readAll,

  /** Looks up a single user-created facility by id. Returns null if not found. */
  getById: async (id: string): Promise<Facility | null> => {
    const all = await readAll();
    return all.find(f => f.id === id) ?? null;
  },

  /**
   * Adds a new facility. Generates a unique id prefixed with 'U'.
   * lat/lng are validated and coerced to numbers before storage (1B fix).
   */
  add: async (facility: Omit<Facility, 'id'>): Promise<Facility> => {
    const all = await readAll();
    const newFacility: Facility = {
      ...sanitizeCoords(facility),
      id: 'U' + Date.now().toString() + '-' + Math.random().toString(36).slice(2, 7),
    };
    await writeAll([...all, newFacility]);
    return newFacility;
  },

  /**
   * Merges updatedData into an existing user facility.
   * lat/lng are validated and coerced to numbers before storage (1B fix).
   * Returns the updated facility, or null if the id was not found.
   */
  update: async (
    id: string,
    updatedData: Partial<Omit<Facility, 'id'>>
  ): Promise<Facility | null> => {
    const all = await readAll();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return null;
    const updated: Facility = { ...all[idx], ...sanitizeCoords(updatedData) };
    all[idx] = updated;
    await writeAll(all);
    return updated;
  },

  /**
   * Removes a user facility by id.
   * Returns true on success, false if not found.
   */
  remove: async (id: string): Promise<boolean> => {
    const all = await readAll();
    const filtered = all.filter(f => f.id !== id);
    if (filtered.length === all.length) return false;
    await writeAll(filtered);
    return true;
  },

  /** Wipes all user-added facilities. */
  clear: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEY);
  },
} as const;
