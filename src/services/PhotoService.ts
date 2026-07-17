// src/services/PhotoService.ts
//
// Handles persistent local storage of inspection photos.
//
// expo-image-picker returns a TEMPORARY cache URI that is cleared
// by the OS between app sessions. This service copies every photo
// into <documentDirectory>/photos/ so it survives restarts and backups.
//
// Naming convention:  photos/insp-<itemId>-<timestamp>.jpg

import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIR = `${FileSystem.documentDirectory}photos/`;

/** Ensure the photos directory exists (idempotent). */
async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

/**
 * Copy a temporary URI (from ImagePicker) into permanent app storage.
 * Returns the new permanent URI, or null on failure.
 *
 * @param tempUri   - The URI returned by expo-image-picker
 * @param itemId    - InspectionItem.id — used to name the file
 */
export async function copyToAppStorage(
  tempUri: string,
  itemId: string
): Promise<string | null> {
  try {
    await ensureDir();
    // istanbul ignore next -- Array.pop() never returns undefined for a non-empty split result
    const ext = tempUri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const filename = `insp-${itemId}-${Date.now()}.${ext}`;
    const destUri = `${PHOTOS_DIR}${filename}`;
    await FileSystem.copyAsync({ from: tempUri, to: destUri });
    return destUri;
  } catch (error) {
    console.warn('[PhotoService] copyToAppStorage error:', error);
    return null;
  }
}

/**
 * Delete a photo file from app storage.
 * Safe to call even if the file does not exist.
 *
 * @param uri - The permanent URI previously returned by copyToAppStorage
 */
export async function deletePhoto(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.warn('[PhotoService] deletePhoto error:', error);
  }
}

/**
 * Check whether a stored photo URI still points to an existing file.
 * Useful to validate saved inspections after an OS cache clear.
 *
 * @param uri - The permanent URI to check
 */
export async function photoExists(uri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
}
