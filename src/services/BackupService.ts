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
import { StorageKeys } from '../repositories/keys';
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
    organisation: string;
    department: string;
    showGrade: string;
  };
}

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
    StorageKeys.INSPECTIONS,
    StorageKeys.AGENDA,
    StorageKeys.USER_FACILITIES,
    StorageKeys.OFFICE_NAME,
    StorageKeys.INSPECTOR_NAME,
    StorageKeys.INSPECTION_CAUSE,
    '@settings/organisation',
    '@settings/department',
    '@settings/showGrade',
  ];
  const pairs = await AsyncStorage.multiGet(keys);
  const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    inspections:    map[StorageKeys.INSPECTIONS]    ? JSON.parse(map[StorageKeys.INSPECTIONS]!)    : [],
    agenda:         map[StorageKeys.AGENDA]         ? JSON.parse(map[StorageKeys.AGENDA]!)         : [],
    userFacilities: map[StorageKeys.USER_FACILITIES] ? JSON.parse(map[StorageKeys.USER_FACILITIES]!) : [],
    settings: {
      officeName:      map[StorageKeys.OFFICE_NAME]      ?? '',
      inspectorName:   map[StorageKeys.INSPECTOR_NAME]   ?? '',
      inspectionCause: map[StorageKeys.INSPECTION_CAUSE] ?? '',
      organisation:    map['@settings/organisation']     ?? '',
      department:      map['@settings/department']       ?? '',
      showGrade:       map['@settings/showGrade']        ?? 'true',
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
  await AsyncStorage.setItem(StorageKeys.BACKUP_LAST_AT, payload.exportedAt);

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

  // 4. Write all collections back to AsyncStorage using canonical StorageKeys
  await AsyncStorage.multiSet([
    [StorageKeys.INSPECTIONS,    JSON.stringify(payload.inspections)],
    [StorageKeys.AGENDA,         JSON.stringify(payload.agenda)],
    [StorageKeys.USER_FACILITIES, JSON.stringify(payload.userFacilities ?? [])],
    [StorageKeys.OFFICE_NAME,     payload.settings?.officeName      ?? ''],
    [StorageKeys.INSPECTOR_NAME,  payload.settings?.inspectorName   ?? ''],
    [StorageKeys.INSPECTION_CAUSE, payload.settings?.inspectionCause ?? ''],
    ['@settings/organisation',    payload.settings?.organisation    ?? ''],
    ['@settings/department',      payload.settings?.department      ?? ''],
    ['@settings/showGrade',       payload.settings?.showGrade       ?? 'true'],
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
    const raw = await AsyncStorage.getItem(StorageKeys.BACKUP_LAST_AT);
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}
