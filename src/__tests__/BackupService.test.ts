// src/__tests__/BackupService.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  exportBackup,
  getLastBackupDate,
  importBackup,
  BACKUP_VERSION,
} from '../services/BackupService';

// ─── Mock expo-file-system ───────────────────────────────────────────────────
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///docs/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn(),
  EncodingType: { UTF8: 'utf8' },
}));

// ─── Mock expo-sharing ────────────────────────────────────────────────────────
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// ─── Mock expo-document-picker ────────────────────────────────────────────────
// The mock factory must be self-contained — variables declared outside
// jest.mock() are not in scope when Jest hoists the factory.
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// ─── Mock NotificationService ────────────────────────────────────────────────
jest.mock('../services/NotificationService', () => ({
  rescheduleAll: jest.fn().mockResolvedValue(undefined),
}));

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { rescheduleAll } from '../services/NotificationService';

const mockGetDocumentAsync = DocumentPicker.getDocumentAsync as jest.Mock;

beforeEach(async () => {
  // Order matters — same rule as SyncService.test.ts:
  //   1. clearAllMocks() first: resets call counts without destroying implementations
  //   2. AsyncStorage.clear() second: implementation must still be intact
  jest.clearAllMocks();
  await AsyncStorage.clear();
  // Restore default sharing behaviour
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
});

// ─── Seed AsyncStorage with realistic data ────────────────────────────────────

async function seedStorage() {
  await AsyncStorage.multiSet([
    // items:[] is required — BackupService.buildPhotoUriMap() iterates
    // inspection.items and throws TypeError if the field is missing.
    ['inspections', JSON.stringify([{ id: 'i1', facilityName: 'منشأة أ', items: [] }])],
    ['agenda',      JSON.stringify([{ id: 'a1', status: 'pending', facilityName: 'منشأة ب', date: '2026-07-01', notes: '' }])],
    ['userFacilities', JSON.stringify([{ id: 'f1', name: 'منشأة ب' }])],
    ['officeName',  'مكتب الصحة'],
    ['inspectorName', 'أحمد'],
    ['inspectionCause', 'routine'],
    ['@settings/organisation', 'وزارة الصحة'],
    ['@settings/department', 'قسم التفتيش'],
    ['@settings/showGrade', 'true'],
  ]);
}

// ─── exportBackup ─────────────────────────────────────────────────────────────

describe('exportBackup', () => {
  beforeEach(seedStorage);

  it('returns a payload with version = BACKUP_VERSION', async () => {
    const payload = await exportBackup();
    expect(payload.version).toBe(BACKUP_VERSION);
  });

  it('payload contains inspections array', async () => {
    const payload = await exportBackup();
    expect(Array.isArray(payload.inspections)).toBe(true);
    expect(payload.inspections).toHaveLength(1);
  });

  it('payload contains agenda array', async () => {
    const payload = await exportBackup();
    expect(Array.isArray(payload.agenda)).toBe(true);
    expect(payload.agenda).toHaveLength(1);
  });

  it('exportedAt is a valid ISO date string', async () => {
    const payload = await exportBackup();
    expect(new Date(payload.exportedAt).toISOString()).toBe(payload.exportedAt);
  });

  it('writes file to documentDirectory', async () => {
    await exportBackup();
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('file:///docs/'),
      expect.any(String),
      expect.any(Object),
    );
  });

  it('records lastBackupAt in AsyncStorage', async () => {
    await exportBackup();
    const raw = await AsyncStorage.getItem('@backup/lastExportedAt');
    expect(raw).not.toBeNull();
    expect(new Date(raw!).toISOString()).toBe(raw);
  });

  it('settings block contains officeName and inspectorName', async () => {
    const payload = await exportBackup();
    expect(payload.settings.officeName).toBe('مكتب الصحة');
    expect(payload.settings.inspectorName).toBe('أحمد');
  });

  // ── Branch: canShare = false (line 50-55) ──────────────────────────────────
  it('skips shareAsync when sharing is not available', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
    const payload = await exportBackup();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
    // Should still return a valid payload and write the file
    expect(payload.version).toBe(BACKUP_VERSION);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
  });

  // ── Branch: inspections/agenda/userFacilities keys missing from storage ───
  it('defaults to empty arrays when storage keys are absent', async () => {
    // Clear storage so none of the collection keys exist
    await AsyncStorage.clear();
    const payload = await exportBackup();
    expect(payload.inspections).toEqual([]);
    expect(payload.agenda).toEqual([]);
    expect(payload.userFacilities).toEqual([]);
  });

  // ── Branch: photoUriMap built from items with photos ─────────────────────
  it('builds photoUriMap from items that have photoUri', async () => {
    await AsyncStorage.clear();
    const itemWithPhoto = { id: 'item-photo', title: 'T', photoUri: 'file:///photo.jpg', photos: [] };
    const itemWithPhotos = { id: 'item-photos', title: 'T2', photos: ['file:///a.jpg', 'file:///b.jpg'] };
    await AsyncStorage.setItem('inspections', JSON.stringify([
      { id: 'i1', facilityName: 'F', items: [itemWithPhoto, itemWithPhotos] },
    ]));
    const payload = await exportBackup();
    expect(payload.photoUriMap!['item-photo']).toBe('file:///photo.jpg');
    expect(payload.photoUriMap!['item-photos__photos']).toEqual(['file:///a.jpg', 'file:///b.jpg']);
  });
});

// ─── importBackup ─────────────────────────────────────────────────────────────

describe('importBackup', () => {
  const validPayload = {
    version: BACKUP_VERSION,
    exportedAt: '2026-06-27T10:00:00.000Z',
    inspections:    [{ id: 'i1', items: [] }],
    agenda:         [{ id: 'a1', status: 'pending', facilityName: 'F', date: '2026-07-01', notes: '' }],
    userFacilities: [{ id: 'f1' }],
    settings: {
      officeName: 'مكتب', inspectorName: 'علي',
      inspectionCause: 'routine', organisation: 'وزارة',
      department: 'قسم', showGrade: 'true',
    },
  };

  it('returns null when user cancels the picker', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: true });
    const result = await importBackup();
    expect(result).toBeNull();
  });

  it('throws when the file contains invalid JSON', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///bad.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce('NOT JSON');
    await expect(importBackup()).rejects.toThrow();
  });

  it('throws when version does not match BACKUP_VERSION', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///v99.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ ...validPayload, version: 99 }),
    );
    await expect(importBackup()).rejects.toThrow(/إصدار غير متوافق/);
  });

  it('throws when inspections field is not an array', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///bad.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ ...validPayload, inspections: null }),
    );
    await expect(importBackup()).rejects.toThrow(/تالف/);
  });

  it('returns correct item counts on valid payload', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///ok.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(validPayload),
    );
    const result = await importBackup();
    expect(result).toEqual({ inspections: 1, agenda: 1, userFacilities: 1 });
  });

  it('writes inspections back to AsyncStorage', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///ok.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(validPayload),
    );
    await importBackup();
    const raw = await AsyncStorage.getItem('inspections');
    expect(JSON.parse(raw!)).toHaveLength(1);
  });

  it('calls rescheduleAll for pending agenda items', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///ok.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(validPayload),
    );
    await importBackup();
    expect(rescheduleAll).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'a1' }),
      ]),
    );
  });

  // ── Branch: asset uri missing (lines 71-78) ───────────────────────────────
  it('throws when asset uri is missing', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: '' }],
    });
    await expect(importBackup()).rejects.toThrow(/لم يتم اختيار/);
  });

  // ── Branch: v1 backup accepted (version === 1) ────────────────────────────
  it('accepts v1 backup (no photoUriMap)', async () => {
    const v1Payload = { ...validPayload, version: 1 };
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///v1.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(v1Payload),
    );
    const result = await importBackup();
    expect(result).toEqual({ inspections: 1, agenda: 1, userFacilities: 1 });
  });

  // ── Branch: photoUriMap present — applyPhotoUriMap is called ──────────────
  it('re-links photoUriMap back into inspection items on v2 restore', async () => {
    const payloadWithMap = {
      ...validPayload,
      inspections: [{ id: 'i1', items: [{ id: 'item-1', title: 'T' }] }],
      photoUriMap: { 'item-1': 'file:///photo.jpg' },
    };
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///v2.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(payloadWithMap),
    );
    await importBackup();
    const raw = await AsyncStorage.getItem('inspections');
    const restored = JSON.parse(raw!);
    expect(restored[0].items[0].photoUri).toBe('file:///photo.jpg');
  });

  // ── Branch: userFacilities missing from payload (defaults to []) ──────────
  it('handles missing userFacilities field gracefully', async () => {
    const { userFacilities: _omit, ...payloadNoFacilities } = validPayload;
    mockGetDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///nofac.json' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(payloadNoFacilities),
    );
    const result = await importBackup();
    expect(result!.userFacilities).toBe(0);
  });
});

// ─── getLastBackupDate ────────────────────────────────────────────────────────

describe('getLastBackupDate', () => {
  it('returns null when no key is stored', async () => {
    const result = await getLastBackupDate();
    expect(result).toBeNull();
  });

  it('returns a Date object when key exists', async () => {
    const ts = '2026-06-27T10:00:00.000Z';
    await AsyncStorage.setItem('@backup/lastExportedAt', ts);
    const result = await getLastBackupDate();
    expect(result).toEqual(new Date(ts));
  });

  // ── Branch: catch block (line 281) ───────────────────────────────────────
  it('returns null when AsyncStorage.getItem throws', async () => {
    const original = AsyncStorage.getItem;
    (AsyncStorage as any).getItem = jest.fn().mockRejectedValueOnce(new Error('storage error'));
    const result = await getLastBackupDate();
    expect(result).toBeNull();
    (AsyncStorage as any).getItem = original;
  });
});
