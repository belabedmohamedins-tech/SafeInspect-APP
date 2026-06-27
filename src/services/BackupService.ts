// src/services/BackupService.ts
//
// Handles full application data export (JSON) and import (restore).
//
// Backup file format:
// {
//   version: 1,
//   exportedAt: ISO string,
//   inspections: SavedInspection[],
//   agenda: AgendaItem[],
//   userFacilities: Facility[],
//   settings: { officeName, inspectorName, inspectionCause }
// }
//
// Photos are NOT included in the JSON backup (they are binary files).
// Photo URIs in inspection items are preserved as-is; if the user moves
// to a new device the URIs will 404 gracefully (the app already handles
// missing photoUri by simply not rendering the thumbnail).

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AgendaItem, Facility, SavedInspection } from '../types';
import { rescheduleAll } from './NotificationService';

export const BACKUP_VERSION = 1;

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
    // settings.tsx keys
    organisation: string;
    department: string;
    showGrade: string;
  };
}

// Storage keys used across the app
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

// ─── Export ─────────────────────────────────────────────────────────────────

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

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    inspections:    map[KEYS.inspections]    ? JSON.parse(map[KEYS.inspections]!)    : [],
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

// ─── Import ─────────────────────────────────────────────────────────────────

export interface ImportResult {
  inspections: number;
  agenda: number;
  userFacilities: number;
}

/**
 * Let the user pick a .json backup file, validate it, and restore all data.
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

  // 3. Validate schema
  if (payload.version !== BACKUP_VERSION) {
    throw new Error(`إصدار غير متوافق (${payload.version}). الإصدار المدعوم: ${BACKUP_VERSION}`);
  }
  if (!Array.isArray(payload.inspections) || !Array.isArray(payload.agenda)) {
    throw new Error('ملف النسخة الاحتياطية تالف');
  }

  // 4. Write all collections back to AsyncStorage
  await AsyncStorage.multiSet([
    [KEYS.inspections,    JSON.stringify(payload.inspections)],
    [KEYS.agenda,         JSON.stringify(payload.agenda)],
    [KEYS.userFacilities, JSON.stringify(payload.userFacilities ?? [])],
    [KEYS.officeName,      payload.settings?.officeName      ?? ''],
    [KEYS.inspectorName,   payload.settings?.inspectorName   ?? ''],
    [KEYS.inspectionCause, payload.settings?.inspectionCause ?? ''],
    [KEYS.organisation,    payload.settings?.organisation    ?? ''],
    [KEYS.department,      payload.settings?.department      ?? ''],
    [KEYS.showGrade,       payload.settings?.showGrade       ?? 'true'],
  ]);

  // 5. Reschedule notifications for restored pending agenda items
  const pendingAgenda = payload.agenda
    .filter(a => a.status === 'pending')
    .map(a => ({ id: a.id, facilityName: a.facilityName, date: a.date, notes: a.notes }));
  await rescheduleAll(pendingAgenda);

  return {
    inspections:    payload.inspections.length,
    agenda:         payload.agenda.length,
    userFacilities: (payload.userFacilities ?? []).length,
  };
}

// ─── Last backup timestamp ───────────────────────────────────────────────────

export async function getLastBackupDate(): Promise<Date | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.lastBackupAt);
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}
