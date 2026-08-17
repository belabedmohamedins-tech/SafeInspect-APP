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
//
// W65 FIX: exportBackup() now reads inspections from InspectionRepository
// (SQLite) instead of AsyncStorage — which was never written by the
// repository since W57-TSC migrated to SQLite.
// importBackup() now restores inspections via InspectionRepository.save()
// instead of AsyncStorage.multiSet for the 'inspections' key.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { AgendaItem, Facility, InspectionItem, SavedInspection } from '../types';
import { InspectionRepository } from '../repositories/InspectionRepository';
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
        map[`${item.id}__photos`] = item.photos;
      }
    }
  }
  return map;
}

/**
 * Re-links photo URIs from the map back into inspection items.
 */
function applyPhotoUriMap(
  inspections: SavedInspection[],
  map: Record<string, string | string[]>,
): SavedInspection[] {
  if (!map || Object.keys(map).length === 0) return inspections;

  return inspections.map(inspection => ({
    ...inspection,
    items: inspection.items.map((item: InspectionItem) => {
      const result = { ...item };
      const single = map[item.id];
      const multi  = map[`${item.id}__photos`];
      if (single !== undefined && typeof single === 'string') {
        result.photoUri = single;
      }
      if (Array.isArray(multi)) {
        result.photos = multi as string[];
      }
      return result;
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
  /** v2+: flat map of item photo URIs, keyed by item id. */
  photoUriMap?: Record<string, string | string[]>;
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
  const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));

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
    photoUriMap: buildPhotoUriMap(inspections),
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

  if (payload.version !== 1 && payload.version !== BACKUP_VERSION) {
    throw new Error(
      `إصدار غير متوافق (${payload.version}). الإصدارات المدعومة: 1, ${BACKUP_VERSION}`,
    );
  }
  if (!Array.isArray(payload.inspections) || !Array.isArray(payload.agenda)) {
    throw new Error('ملف النسخة الاحتياطية تالف');
  }

  const restoredInspections = payload.photoUriMap
    ? applyPhotoUriMap(payload.inspections, payload.photoUriMap)
    : payload.inspections;

  // W65: restore inspections into SQLite via InspectionRepository.save().
  // Each save() upserts atomically and is guarded by the W22 INSPECTION_LOCKED
  // check — approved inspections will throw; non-fatal, we continue.
  for (const inspection of restoredInspections) {
    try {
      await InspectionRepository.save(inspection);
    } catch (err: unknown) {
      // Approved inspections are legally immutable — skip silently.
      if (err instanceof Error && err.message === 'INSPECTION_LOCKED') continue;
      throw err;
    }
  }

  // Restore non-inspection data to AsyncStorage (agenda + settings repos not yet on SQLite).
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

  // rescheduleAll() now lazily loads AgendaRepository internally — no args needed
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
