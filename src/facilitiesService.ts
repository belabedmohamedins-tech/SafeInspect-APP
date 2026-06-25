// src/facilitiesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { facilities as hardcodedFacilities } from './facilitiesData';
import { Facility } from './types';
import { StorageKeys } from './repositories/keys';

// ─── Private helper ──────────────────────────────────────────────────────────

/** Read user-added facilities from storage. Returns [] on any error. */
async function readUserFacilities(): Promise<Facility[]> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.USER_FACILITIES);
    return raw ? (JSON.parse(raw) as Facility[]) : [];
  } catch {
    return [];
  }
}

/** Persist user-added facilities to storage. */
async function writeUserFacilities(facilities: Facility[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.USER_FACILITIES, JSON.stringify(facilities));
}

// ─── Read ────────────────────────────────────────────────────────────────────

/** Returns all facilities: hardcoded first, then user-added. */
export const getAllFacilities = async (): Promise<Facility[]> => {
  const userFacilities = await readUserFacilities();
  return [...hardcodedFacilities, ...userFacilities];
};

/** Returns only the user-added facilities. */
export const getUserFacilities = async (): Promise<Facility[]> => {
  return readUserFacilities();
};

/** Finds a facility by id, searching hardcoded list first then user-added. */
export const getFacilityById = async (id: string): Promise<Facility | null> => {
  const hardcoded = hardcodedFacilities.find(f => f.id === id);
  if (hardcoded) return hardcoded;

  const userFacilities = await readUserFacilities();
  return userFacilities.find(f => f.id === id) ?? null;
};

// ─── Search & Filter ─────────────────────────────────────────────────────────

/**
 * Case-insensitive, diacritic-aware full-text search across all facilities.
 * Matches against: projectName, ownerName, activity, address, category.
 * Returns [] for blank/whitespace-only queries.
 */
export const searchFacilities = async (query: string): Promise<Facility[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const all = await getAllFacilities();
  const normalized = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return all.filter(f => {
    const haystack = [
      f.projectName,
      f.ownerName,
      f.activity,
      f.address,
      f.category,
    ]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return haystack.includes(normalized);
  });
};

/**
 * Filters all facilities by category field.
 * Passing an empty string returns the full list.
 */
export const filterFacilitiesByCategory = async (category: string): Promise<Facility[]> => {
  const all = await getAllFacilities();
  if (!category) return all;
  return all.filter(f => f.category === category);
};

// ─── Write ───────────────────────────────────────────────────────────────────

/**
 * Adds a new user facility.
 * Generates a unique id and returns the saved facility (does NOT mutate
 * the caller's object).
 */
export const addUserFacility = async (facility: Omit<Facility, 'id'> & Partial<Pick<Facility, 'id'>>): Promise<Facility> => {
  const newId = 'U' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7);
  const saved: Facility = { ...facility, id: newId } as Facility;

  const existing = await readUserFacilities();
  await writeUserFacilities([...existing, saved]);
  return saved;
};

/**
 * Updates fields on a user-added facility. Returns true on success,
 * false if the id is not found in the user list (hardcoded cannot be edited).
 */
export const updateUserFacility = async (id: string, updatedData: Partial<Facility>): Promise<boolean> => {
  const userFacilities = await readUserFacilities();
  const index = userFacilities.findIndex(f => f.id === id);
  if (index === -1) return false;

  userFacilities[index] = { ...userFacilities[index], ...updatedData };
  await writeUserFacilities(userFacilities);
  return true;
};

/**
 * Deletes a user-added facility by id.
 * Returns true on success, false if not found.
 */
export const deleteUserFacility = async (id: string): Promise<boolean> => {
  const userFacilities = await readUserFacilities();
  const updated = userFacilities.filter(f => f.id !== id);
  if (updated.length === userFacilities.length) return false;

  await writeUserFacilities(updated);
  return true;
};

/** Removes all user-added facilities. */
export const clearAllUserFacilities = async (): Promise<void> => {
  await AsyncStorage.removeItem(StorageKeys.USER_FACILITIES);
};
