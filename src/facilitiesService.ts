// src/facilitiesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { facilities as hardcodedFacilities } from './facilitiesData';
import { Facility } from './types';

const USER_FACILITIES_KEY = 'userFacilities';

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
  const json = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  const userFacilities: Facility[] = json ? JSON.parse(json) : [];
  return [...hardcodedFacilities, ...userFacilities];
};

/**
 * Looks up a single facility by id.
 * Checks hardcoded first, then user-added.
 * Returns `undefined` (not null) so callers can use `if (!facility)` safely.
 */
export const getFacilityById = async (id: string): Promise<Facility | undefined> => {
  const hardcoded = hardcodedFacilities.find(f => f.id === id);
  if (hardcoded) return hardcoded;

  const json = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  if (json) {
    const userFacilities: Facility[] = JSON.parse(json);
    return userFacilities.find(f => f.id === id);
  }
  return undefined;
};

/** Returns only the facilities added by the current user. */
export const getUserFacilities = async (): Promise<Facility[]> => {
  const json = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  return json ? JSON.parse(json) : [];
};

// ─── Search & Filter ─────────────────────────────────────────────

/**
 * Full-text search across projectName, ownerName, address, and activity.
 * - Case-insensitive.
 * - Diacritic-insensitive (Arabic tashkeel stripped before comparison).
 * - Empty / whitespace-only query returns the full list unchanged.
 */
export const searchFacilities = async (query: string): Promise<Facility[]> => {
  const all = await getAllFacilities();
  const q = normaliseArabic(query.trim());
  if (!q) return all;

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

/** Appends a new user facility. Assigns a unique id prefixed with 'U'. */
export const addUserFacility = async (facility: Facility): Promise<void> => {
  const json = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  const userFacilities: Facility[] = json ? JSON.parse(json) : [];
  facility.id = 'U' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5);
  userFacilities.push(facility);
  await AsyncStorage.setItem(USER_FACILITIES_KEY, JSON.stringify(userFacilities));
};

/**
 * Merges `updatedData` into an existing user facility.
 * Returns `false` if the id belongs to a hardcoded facility or doesn't exist.
 */
export const updateUserFacility = async (
  id: string,
  updatedData: Partial<Facility>
): Promise<boolean> => {
  const json = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  if (!json) return false;

  const userFacilities: Facility[] = JSON.parse(json);
  const index = userFacilities.findIndex(f => f.id === id);
  if (index === -1) return false;

  userFacilities[index] = { ...userFacilities[index], ...updatedData };
  await AsyncStorage.setItem(USER_FACILITIES_KEY, JSON.stringify(userFacilities));
  return true;
};

/** Removes a user facility by id. Returns `false` if not found. */
export const deleteUserFacility = async (id: string): Promise<boolean> => {
  const json = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  if (!json) return false;

  const userFacilities: Facility[] = JSON.parse(json);
  const updated = userFacilities.filter(f => f.id !== id);
  if (updated.length === userFacilities.length) return false;

  await AsyncStorage.setItem(USER_FACILITIES_KEY, JSON.stringify(updated));
  return true;
};

/** Wipes all user-added facilities from storage. */
export const clearAllUserFacilities = async (): Promise<void> => {
  await AsyncStorage.removeItem(USER_FACILITIES_KEY);
};
