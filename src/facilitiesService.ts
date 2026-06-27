// src/facilitiesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { facilities as hardcodedFacilities } from './facilitiesData';
import { StorageKeys } from './repositories/keys';
import { Facility } from './types';

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Strips Arabic tashkeel (diacritics) so that مَطْعَم and مطعم match.
 * The Unicode range \u064B-\u065F covers all standard Arabic diacritics.
 */
const normaliseArabic = (s: string): string =>
  s.normalize('NFC').replace(/[\u064B-\u065F]/g, '').toLowerCase();

// ─── Read ──────────────────────────────────────────────────────

/** Returns all facilities: hardcoded list first, then user-added. */
export const getAllFacilities = async (): Promise<Facility[]> => {
  try {
    const json = await AsyncStorage.getItem(StorageKeys.USER_FACILITIES);
    const userFacilities: Facility[] = json ? JSON.parse(json) : [];
    return [...hardcodedFacilities, ...userFacilities];
  } catch {
    return [...hardcodedFacilities];
  }
};

/**
 * Looks up a single facility by id.
 * Checks hardcoded first (no storage read needed), then user-added.
 * Returns `null` if not found.
 */
export const getFacilityById = async (id: string): Promise<Facility | null> => {
  const hardcoded = hardcodedFacilities.find(f => f.id === id);
  if (hardcoded) return hardcoded;

  const json = await AsyncStorage.getItem(StorageKeys.USER_FACILITIES);
  if (json) {
    const userFacilities: Facility[] = JSON.parse(json);
    return userFacilities.find(f => f.id === id) ?? null;
  }
  return null;
};

/** Returns only the facilities added by the current user. */
export const getUserFacilities = async (): Promise<Facility[]> => {
  try {
    const json = await AsyncStorage.getItem(StorageKeys.USER_FACILITIES);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

// ─── Search & Filter ─────────────────────────────────────────────

/**
 * Full-text search across projectName, ownerName, address, and activity.
 * - Case-insensitive.
 * - Diacritic-insensitive (Arabic tashkeel stripped before comparison).
 * - Empty / whitespace-only query returns an empty array (not the full list).
 */
export const searchFacilities = async (query: string): Promise<Facility[]> => {
  const q = normaliseArabic(query.trim());
  if (!q) return [];

  const all = await getAllFacilities();
  return all.filter(f => {
    const haystack = normaliseArabic(
      [f.projectName, f.ownerName, f.address, f.activity].join(' ')
    );
    return haystack.includes(q);
  });
};

/**
 * Returns all facilities whose `activity` field exactly matches the given
 * value (case-insensitive, diacritic-insensitive).
 */
export const filterByActivity = async (activity: string): Promise<Facility[]> => {
  const all = await getAllFacilities();
  const target = normaliseArabic(activity);
  return all.filter(f => normaliseArabic(f.activity) === target);
};

/**
 * Returns all facilities whose `category` field exactly matches the given
 * value (case-insensitive, diacritic-insensitive).
 * Empty string returns ALL facilities.
 */
export const filterFacilitiesByCategory = async (category: string): Promise<Facility[]> => {
  const all = await getAllFacilities();
  if (!category.trim()) return all;
  const target = normaliseArabic(category.trim());
  return all.filter(f => normaliseArabic(f.category ?? '') === target);
};

/**
 * Convenience: search then optionally filter by activity in a single call.
 * If `activity` is omitted or empty the activity filter is skipped.
 */
export const searchAndFilter = async (
  query: string,
  activity?: string
): Promise<Facility[]> => {
  const searched = await searchFacilities(query);
  if (!activity?.trim()) return searched;
  const target = normaliseArabic(activity.trim());
  return searched.filter(f => normaliseArabic(f.activity) === target);
};

// ─── Write ──────────────────────────────────────────────────────

/**
 * Appends a new user facility. Assigns a unique id prefixed with 'U'.
 * Returns the saved facility (with the generated id).
 */
export const addUserFacility = async (facility: Omit<Facility, 'id'> | Facility): Promise<Facility> => {
  const json = await AsyncStorage.getItem(StorageKeys.USER_FACILITIES);
  const userFacilities: Facility[] = json ? JSON.parse(json) : [];
  const newFacility: Facility = {
    ...facility as Facility,
    id: 'U' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5),
  };
  userFacilities.push(newFacility);
  await AsyncStorage.setItem(StorageKeys.USER_FACILITIES, JSON.stringify(userFacilities));
  return newFacility;
};

/**
 * Merges `updatedData` into an existing user facility.
 * Returns `false` if the id belongs to a hardcoded facility or doesn't exist.
 */
export const updateUserFacility = async (
  id: string,
  updatedData: Partial<Facility>
): Promise<boolean> => {
  // Reject updates to hardcoded facilities
  if (hardcodedFacilities.some(f => f.id === id)) return false;

  const json = await AsyncStorage.getItem(StorageKeys.USER_FACILITIES);
  if (!json) return false;

  const userFacilities: Facility[] = JSON.parse(json);
  const index = userFacilities.findIndex(f => f.id === id);
  if (index === -1) return false;

  userFacilities[index] = { ...userFacilities[index], ...updatedData };
  await AsyncStorage.setItem(StorageKeys.USER_FACILITIES, JSON.stringify(userFacilities));
  return true;
};

/** Removes a user facility by id. Returns `false` if not found or hardcoded. */
export const deleteUserFacility = async (id: string): Promise<boolean> => {
  // Reject deletion of hardcoded facilities
  if (hardcodedFacilities.some(f => f.id === id)) return false;

  const json = await AsyncStorage.getItem(StorageKeys.USER_FACILITIES);
  if (!json) return false;

  const userFacilities: Facility[] = JSON.parse(json);
  const updated = userFacilities.filter(f => f.id !== id);
  if (updated.length === userFacilities.length) return false;

  await AsyncStorage.setItem(StorageKeys.USER_FACILITIES, JSON.stringify(updated));
  return true;
};

/** Wipes all user-added facilities from storage. */
export const clearAllUserFacilities = async (): Promise<void> => {
  await AsyncStorage.removeItem(StorageKeys.USER_FACILITIES);
};
