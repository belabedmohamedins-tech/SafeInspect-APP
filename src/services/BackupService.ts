// src/services/BackupService.ts
//
// Handles full application data export (JSON) and import (restore).
//
// Backup file format (v2):
// {
//   version: 2,
//   exportedAt: ISO string,
//   inspections: SavedInspection[],         // items_json embedded
//   agenda: AgendaItem[],
//   userFacilities: Facility[],
//   settings: { officeName, inspectorName, inspectionCause, … },
//   photoUriMap: Record<inspectionItemId, uri>  // NEW in v2 (1C)
// }
//
// Photos (1C)
// ───────────
// Binary photo files are NOT embedded — they remain too large for a JSON
// backup.  Instead, we collect every photoUri / photos[] entry across all
// inspection items into a flat map keyed by item id:
//
//   photoUriMap: { "<itemId>": "file:///…/photo.jpg", … }
//
// On import the map is used to re-link URIs back into items, so that:
//   • Photos that still exist on the device are reconnected automatically.
//   • Photos that are gone (new device / deleted) gracefully produce
//     undefined photoUri — the app already handles this via the
//     "missing photo" fallback in the checklist card.
//
// v1 backup files are still accepted on import (no photoUriMap field).

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AgendaItem, Facility, InspectionItem, SavedInspection } from '../types';
import { rescheduleAll } from './NotificationService';

export const BACKUP_VERSION = 2;

// ─── Photo URI map helpers ────────────────────────────────────────────────────

/** Flattens all photo URIs from all items into a map keyed by item id. */
function buildPhotoUriMap(
  inspections: SavedInspection[],
): Record<string, string | string[]> {
  const map: Record<string, string | string[]> = {};
  for (const inspection of inspections) {
    for (const item of inspection.items) {
      if (item.photoUri) {
        map[item.id] = item.photoUri;
      }
      if (item.photos && item.photos.length > 0) {
        // Store array alongside single URI when both are present
        map[`${item.id}__photos`] = item.photos;
      }
    }
  }
  return map;
}

/**
 * Re-links photo URIs from the map back into inspection items.
 * Items whose ids are not in the map are left unchanged (photoUri stays
 * as-is from the JSON payload — may be a stale URI, which is acceptable).
 */
function applyPhotoUriMap(
  inspections: SavedInspection[],
  map: Record<string, string | string[]>,
): SavedInspection[] {
  if (!map || Object.keys(map).length === 0) return inspections;

  return inspections.map(inspection => ({
    ...inspection,
    items: inspection.items.map((item: InspectionItem) => {
      const single = map[item.id];
      const multi  = map[`${item.id}__photos`];
      return {
        ...item,
        ...(single !== undefined && typeof single === 'string'
          ? { photoUri: single }
          : {}),
        ...(Array.isArray(multi) ? { photos: multi as string[] } : {}),
      };
    }),
  }));
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
  /** v2+: flat map of item photo URIs, keyed by item id (and itemId__photos for arrays). */
  photoUriMap?: Record<string, string | string[]>;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  inspections:   'inspections',
  agenda:        'agenda',
  userFacilities:'userFacilities',
  officeName:    'officeName',
  inspectorName: 'inspectorName',
  inspectionCause: 'inspectionCause',
  organisation:  '@settings/organisation',
  department:    '@settings/department',
  showGrade:     '@settings/showGrade',
  lastBackupAt:  '@backup/lastExportedAt',
} as const;

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Collect all app data, write to a JSON file in documentDirectory,
 * and open the system share sheet so the user can email / save it.
 *
 * Returns the BackupPayload so the caller can display item counts.
 */
export async function exportBackup(): Promise<BackupPayload> {
  // 1. Read all collections from AsyncStorage in one call
  const keys = [
    KEYS.inspections,
    KEYS.agenda,
    KEYS.userFacilities,
    KEYS.officeName,
    KEYS.inspectorName,
    KEYS.inspectionCause,
    KEYS.organisation,
    KEYS.department,
    KEYS.showGrade,
  ];
  const pairs = await AsyncStorage.multiGet(keys);
  const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));

  const inspections: SavedInspection[] = map[KEYS.inspections]
    ? JSON.parse(map[KEYS.inspections]!)
    : [];

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    inspections,
    agenda:         map[KEYS.agenda]         ? JSON.parse(map[KEYS.agenda]!)         : [],
    userFacilities: map[KEYS.userFacilities] ? JSON.parse(map[KEYS.userFacilities]!) : [],
    settings: {
      officeName:      map[KEYS.officeName]      ?? '',
      inspectorName:   map[KEYS.inspectorName]   ?? '',
      inspectionCause: map[KEYS.inspectionCause] ?? '',
      organisation:    map[KEYS.organisation]    ?? '',
      department:      map[KEYS.department]      ?? '',
      showGrade:       map[KEYS.showGrade]       ?? 'true',
    },
    // 1C: build photo URI map from all inspection items
    photoUriMap: buildPhotoUriMap(inspections),
  };

  // 2. Write to file
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `safeinspect-backup-${dateStr}.json`;
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // 3. Share
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'حفظ النسخة الاحتياطية',
      UTI: 'public.json',
    });
  }

  // 4. Record timestamp
  await AsyncStorage.setItem(KEYS.lastBackupAt, payload.exportedAt);

  return payload;
}

// ─── Import ───────────────────────────────────────────────────────────────────

export interface ImportResult {
  inspections: number;
  agenda: number;
  userFacilities: number;
}

/**
 * Let the user pick a .json backup file, validate it, and restore all data.
 * Accepts both v1 (no photoUriMap) and v2 backups.
 * Returns item counts on success, or null if the user cancelled.
 * Throws on validation or write error.
 */
export async function importBackup(): Promise<ImportResult | null> {
  // 1. Open document picker
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset?.uri) throw new Error('لم يتم اختيار أي ملف');

  // 2. Read file content
  const raw = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let payload: BackupPayload;
  try {
    payload = JSON.parse(raw) as BackupPayload;
  } catch {
    throw new Error('ملف غير صالح — تأكد من أنه ملف JSON من SafeInspect');
  }

  // 3. Validate schema (accept v1 and v2)
  if (payload.version !== 1 && payload.version !== BACKUP_VERSION) {
    throw new Error(
      `إصدار غير متوافق (${payload.version}). الإصدارات المدعومة: 1, ${BACKUP_VERSION}`,
    );
  }
  if (!Array.isArray(payload.inspections) || !Array.isArray(payload.agenda)) {
    throw new Error('ملف النسخة الاحتياطية تالف');
  }

  // 4. Re-link photo URIs (v2 only; v1 files have no photoUriMap so items
  //    keep whatever URIs were serialised into the JSON)
  const restoredInspections = payload.photoUriMap
    ? applyPhotoUriMap(payload.inspections, payload.photoUriMap)
    : payload.inspections;

  // 5. Write all collections back to AsyncStorage
  await AsyncStorage.multiSet([
    [KEYS.inspections,    JSON.stringify(restoredInspections)],
    [KEYS.agenda,         JSON.stringify(payload.agenda)],
    [KEYS.userFacilities, JSON.stringify(payload.userFacilities ?? [])],
    [KEYS.officeName,      payload.settings?.officeName      ?? ''],
    [KEYS.inspectorName,   payload.settings?.inspectorName   ?? ''],
    [KEYS.inspectionCause, payload.settings?.inspectionCause ?? ''],
    [KEYS.organisation,    payload.settings?.organisation    ?? ''],
    [KEYS.department,      payload.settings?.department      ?? ''],
    [KEYS.showGrade,       payload.settings?.showGrade       ?? 'true'],
  ]);

  // 6. Reschedule notifications for restored pending agenda items
  const pendingAgenda = payload.agenda
    .filter(a => a.status === 'pending')
    .map(a => ({ id: a.id, facilityName: a.facilityName, date: a.date, notes: a.notes }));
  await rescheduleAll(pendingAgenda);

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
