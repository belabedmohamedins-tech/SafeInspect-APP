// src/services/BackupService.ts
//
// Handles full application data export (JSON) and import (restore).
//
// Backup file format (v3):
// {
//   version: 3,
//   exportedAt: ISO string,
//   inspections: SavedInspection[],
//   agenda: AgendaItem[],
//   userFacilities: Facility[],
//   settings: { officeName, inspectorName, inspectionCause, … },
//   photoUriMap: Record<string, PhotoEntry>   // v3: base64-embedded bytes
// }
//
// Photos (W86 fix — was v2 URI-only, now v3 base64)
// ──────────────────────────────────────────────────
// v2 stored only the URI string.  On a new device / after reinstall that
// URI no longer exists, so photos were silently lost on restore.
//
// v3 reads each photo file as base64 via FileSystem.readAsStringAsync and
// embeds the bytes directly in the JSON under a { __b64, ext } entry.
// On import the bytes are written back to documentDirectory and the item
// is re-linked to the new local URI.
//
// Size guard: files > MAX_PHOTO_BYTES (2 MB) are skipped with a
// { __skip: true } marker so the backup never causes OOM on large sets.
// Skipped photos fall back to the original URI (still missing on new
// device, but no worse than v2 behaviour).
//
// v1 and v2 backup files are still accepted on import.
//
// W65 FIX: exportBackup() reads inspections from InspectionRepository
// (SQLite) instead of AsyncStorage.
// importBackup() restores inspections via InspectionRepository.save().

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { AgendaItem, Facility, InspectionItem, SavedInspection } from '../types';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { rescheduleAll } from './NotificationService';

export const BACKUP_VERSION = 3;

/** 2 MB — photos larger than this are skipped to avoid OOM. */
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

// ─── Photo entry types ────────────────────────────────────────────────────────

export type PhotoEntry =
  | string                              // v1/v2 legacy URI
  | string[]                            // v1/v2 legacy photos[]
  | { __b64: string; ext: string }      // v3 embedded single photo
  | { __b64: string; ext: string }[]    // v3 embedded photos[]
  | { __skip: true }                    // v3 oversized — not embedded
  | { __skip: true }[];                 // v3 oversized photos[]

// ─── Photo URI map helpers ────────────────────────────────────────────────────

/** Reads a file URI and returns base64, or null if unreadable / too large. */
async function readPhotoAsB64(
  uri: string,
): Promise<{ __b64: string; ext: string } | { __skip: true } | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    // FileSystem.FileInfo has `size` when exists=true on some Expo versions.
    const size = (info as { size?: number }).size;
    if (size !== undefined && size > MAX_PHOTO_BYTES) {
      return { __skip: true };
    }
    const b64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    return { __b64: b64, ext };
  } catch {
    return null;
  }
}

/** Writes base64 bytes back to documentDirectory, returns the new local URI. */
async function writeB64ToLocal(
  entry: { __b64: string; ext: string },
  itemId: string,
  suffix: string,
): Promise<string> {
  const filename = `photo_${itemId}_${suffix}_${Date.now()}.${entry.ext}`;
  const dest = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(dest, entry.__b64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return dest;
}

/**
 * Flattens all photo URIs from all items into a map keyed by item id.
 * v3: reads bytes and embeds as base64.
 */
async function buildPhotoUriMap(
  inspections: SavedInspection[],
): Promise<Record<string, PhotoEntry>> {
  const map: Record<string, PhotoEntry> = {};

  for (const inspection of inspections) {
    for (const item of inspection.items) {

      if (item.photoUri) {
        const entry = await readPhotoAsB64(item.photoUri);
        if (entry !== null) {
          map[item.id] = entry;
        } else {
          // File missing — keep URI string as v2 fallback
          map[item.id] = item.photoUri;
        }
      }

      if (item.photos && item.photos.length > 0) {
        const entries: PhotoEntry[] = [];
        for (const uri of item.photos) {
          const entry = await readPhotoAsB64(uri);
          entries.push(entry !== null ? entry : uri);
        }
        map[`${item.id}__photos`] = entries as PhotoEntry;
      }
    }
  }

  return map;
}

/**
 * Re-links photo URIs from the map back into inspection items.
 * v3: writes base64 bytes back to documentDirectory and re-links.
 */
async function applyPhotoUriMap(
  inspections: SavedInspection[],
  map: Record<string, PhotoEntry>,
): Promise<SavedInspection[]> {
  if (!map || Object.keys(map).length === 0) return inspections;

  const result: SavedInspection[] = [];
  for (const inspection of inspections) {
    const items: InspectionItem[] = [];
    for (const item of inspection.items) {
      const updated = { ...item };

      const single = map[item.id];
      if (single !== undefined) {
        if (typeof single === 'string') {
          // v2 legacy URI
          updated.photoUri = single;
        } else if (
          typeof single === 'object' &&
          !Array.isArray(single) &&
          '__b64' in single
        ) {
          // v3 embedded
          try {
            updated.photoUri = await writeB64ToLocal(single, item.id, 'main');
          } catch {
            // write failed — leave photoUri as-is
          }
        }
        // { __skip: true } → leave photoUri unchanged
      }

      const multi = map[`${item.id}__photos`];
      if (Array.isArray(multi) && multi.length > 0) {
        const restored: string[] = [];
        for (let i = 0; i < multi.length; i++) {
          const entry = multi[i];
          if (typeof entry === 'string') {
            restored.push(entry);
          } else if (
            typeof entry === 'object' &&
            !Array.isArray(entry) &&
            '__b64' in entry
          ) {
            try {
              const newUri = await writeB64ToLocal(
                entry as { __b64: string; ext: string },
                item.id,
                String(i),
              );
              restored.push(newUri);
            } catch {
              // write failed — skip this photo
            }
          }
          // { __skip: true } entries are dropped gracefully
        }
        if (restored.length > 0) updated.photos = restored;
      }

      items.push(updated);
    }
    result.push({ ...inspection, items });
  }
  return result;
}

// ─── Payload type ─────────────────────────────────────────────────────────────

export interface BackupPayload {
  version: number;
  exportedAt: string;
  inspections: SavedInspection[];
  agenda: AgendaItem[];
  userFacilities: Facility[];
  settings: {
    officeName: string;
    inspectorName: string;
    inspectionCause: string;
    organisation: string;
    department: string;
    showGrade: string;
  };
  /** v2+: flat map of item photo entries, keyed by item id. */
  photoUriMap?: Record<string, PhotoEntry>;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  agenda:          'agenda',
  userFacilities:  'userFacilities',
  officeName:      'officeName',
  inspectorName:   'inspectorName',
  inspectionCause: 'inspectionCause',
  organisation:    '@settings/organisation',
  department:      '@settings/department',
  showGrade:       '@settings/showGrade',
  lastBackupAt:    '@backup/lastExportedAt',
} as const;

// ─── Export ───────────────────────────────────────────────────────────────────

export async function exportBackup(): Promise<BackupPayload> {
  // W65: read inspections from SQLite via InspectionRepository, not AsyncStorage.
  const inspections = await InspectionRepository.getAll();

  const settingKeys = [
    KEYS.agenda,
    KEYS.userFacilities,
    KEYS.officeName,
    KEYS.inspectorName,
    KEYS.inspectionCause,
    KEYS.organisation,
    KEYS.department,
    KEYS.showGrade,
  ];
  const pairs = await AsyncStorage.multiGet(settingKeys);
  const settingsMap = Object.fromEntries(pairs.map(([k, v]) => [k, v]));

  // W86: buildPhotoUriMap is now async (reads base64 bytes)
  const photoUriMap = await buildPhotoUriMap(inspections);

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    inspections,
    agenda:         settingsMap[KEYS.agenda]         ? JSON.parse(settingsMap[KEYS.agenda]!)         : [],
    userFacilities: settingsMap[KEYS.userFacilities] ? JSON.parse(settingsMap[KEYS.userFacilities]!) : [],
    settings: {
      officeName:      settingsMap[KEYS.officeName]      ?? '',
      inspectorName:   settingsMap[KEYS.inspectorName]   ?? '',
      inspectionCause: settingsMap[KEYS.inspectionCause] ?? '',
      organisation:    settingsMap[KEYS.organisation]    ?? '',
      department:      settingsMap[KEYS.department]      ?? '',
      showGrade:       settingsMap[KEYS.showGrade]       ?? 'true',
    },
    photoUriMap,
  };

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `safeinspect-backup-${dateStr}.json`;
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'حفظ النسخة الاحتياطية',
      UTI: 'public.json',
    });
  }

  await AsyncStorage.setItem(KEYS.lastBackupAt, payload.exportedAt);

  return payload;
}

// ─── Import ───────────────────────────────────────────────────────────────────

export interface ImportResult {
  inspections: number;
  agenda: number;
  userFacilities: number;
}

export async function importBackup(): Promise<ImportResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset?.uri) throw new Error('لم يتم اختيار أي ملف');

  const raw = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let payload: BackupPayload;
  try {
    payload = JSON.parse(raw) as BackupPayload;
  } catch {
    throw new Error('ملف غير صالح — تأكد من أنه ملف JSON من SafeInspect');
  }

  if (![1, 2, BACKUP_VERSION].includes(payload.version)) {
    throw new Error(
      `إصدار غير متوافق (${payload.version}). الإصدارات المدعومة: 1, 2, ${BACKUP_VERSION}`,
    );
  }
  if (!Array.isArray(payload.inspections) || !Array.isArray(payload.agenda)) {
    throw new Error('ملف النسخة الاحتياطية تالف');
  }

  // W86: applyPhotoUriMap is now async (writes base64 bytes back to disk)
  const restoredInspections = payload.photoUriMap
    ? await applyPhotoUriMap(payload.inspections, payload.photoUriMap)
    : payload.inspections;

  // W65: restore inspections into SQLite via InspectionRepository.save().
  for (const inspection of restoredInspections) {
    try {
      await InspectionRepository.save(inspection);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'INSPECTION_LOCKED') continue;
      throw err;
    }
  }

  await AsyncStorage.multiSet([
    [KEYS.agenda,         JSON.stringify(payload.agenda)],
    [KEYS.userFacilities, JSON.stringify(payload.userFacilities ?? [])],
    [KEYS.officeName,      payload.settings?.officeName      ?? ''],
    [KEYS.inspectorName,   payload.settings?.inspectorName   ?? ''],
    [KEYS.inspectionCause, payload.settings?.inspectionCause ?? ''],
    [KEYS.organisation,    payload.settings?.organisation    ?? ''],
    [KEYS.department,      payload.settings?.department      ?? ''],
    [KEYS.showGrade,       payload.settings?.showGrade       ?? 'true'],
  ]);

  await rescheduleAll();

  return {
    inspections:    restoredInspections.length,
    agenda:         payload.agenda.length,
    userFacilities: (payload.userFacilities ?? []).length,
  };
}

// ─── Last backup timestamp ────────────────────────────────────────────────────

export async function getLastBackupDate(): Promise<Date | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.lastBackupAt);
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}
