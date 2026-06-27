// src/repositories/FacilityRepository.ts
//
// Thin AsyncStorage wrapper for the user-added facilities list.
// Mirrors the pattern used by InspectionRepository and AgendaRepository.
// The hardcoded facilities in facilitiesData.ts are read-only and are NOT
// managed here — see facilitiesService.ts for the merged read helpers.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Facility } from '../types';
import { StorageKeys } from './keys';

const KEY = StorageKeys.USER_FACILITIES;

async function readAll(): Promise<Facility[]> {
  const json = await AsyncStorage.getItem(KEY);
  return json ? (JSON.parse(json) as Facility[]) : [];
}

async function writeAll(facilities: Facility[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(facilities));
}

export const FacilityRepository = {
  /** Returns all user-created facilities (does NOT include hardcoded ones). */
  getAll: readAll,

  /** Looks up a single user-created facility by id. Returns null if not found. */
  getById: async (id: string): Promise<Facility | null> => {
    const all = await readAll();
    return all.find(f => f.id === id) ?? null;
  },

  /** Adds a new facility. Generates a unique id prefixed with 'U'. */
  add: async (facility: Omit<Facility, 'id'>): Promise<Facility> => {
    const all = await readAll();
    const newFacility: Facility = {
      ...facility,
      id: 'U' + Date.now().toString() + '-' + Math.random().toString(36).slice(2, 7),
    };
    await writeAll([...all, newFacility]);
    return newFacility;
  },

  /**
   * Merges updatedData into an existing user facility.
   * Returns the updated facility, or null if the id was not found.
   */
  update: async (
    id: string,
    updatedData: Partial<Omit<Facility, 'id'>>
  ): Promise<Facility | null> => {
    const all = await readAll();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return null;
    const updated = { ...all[idx], ...updatedData };
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
