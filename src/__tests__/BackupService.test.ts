// src/__tests__/BackupService.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  exportBackup,
  getLastBackupDate,
  importBackup,
  BACKUP_VERSION,
} from '../services/BackupService';

// ─── Mock InspectionRepository (SQLite) ──────────────────────────────────────
const mockGetAll = jest.fn();
const mockSave   = jest.fn();
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
    save:   (...args: unknown[]) => mockSave(...args),
  },
}));

// ─── Mock expo-file-system/legacy ────────────────────────────────────────────
// W86: buildPhotoUriMap now calls getInfoAsync + readAsStringAsync (base64).
// writeAsStringAsync is used for both backup file write and photo restore write.
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync:  jest.fn().mockResolvedValue(''),
  getInfoAsync:       jest.fn().mockResolvedValue({ exists: false }),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
}));

// ─── Mock expo-sharing ────────────────────────────────────────────────────────
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// ─── Mock expo-document-picker ────────────────────────────────────────────────
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// ─── Mock NotificationService ────────────────────────────────────────────────
jest.mock('../services/NotificationService', () => ({
  rescheduleAll: jest.fn().mockResolvedValue(undefined),
}));

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { rescheduleAll } from '../services/NotificationService';

const mockGetDocumentAsync = DocumentPicker.getDocumentAsync as jest.Mock;
const mockGetInfoAsync     = FileSystem.getInfoAsync as jest.Mock;
const mockReadAsString     = FileSystem.readAsStringAsync as jest.Mock;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockGetAll.mockResolvedValue([]);
  mockSave.mockResolvedValue(undefined);
  // Default: photo files do not exist (safe baseline — no base64 read attempted)
  mockGetInfoAsync.mockResolvedValue({ exists: false });
  mockReadAsString.mockResolvedValue('');
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
});

async function seedStorage() {
  await AsyncStorage.multiSet([
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
    mockGetAll.mockResolvedValueOnce([{ id: 'i1', facilityName: 'منشأة أ', items: [] }]);
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

  it('skips shareAsync when sharing is not available', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
    const payload = await exportBackup();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
    expect(payload.version).toBe(BACKUP_VERSION);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
  });

  it('defaults to empty arrays when storage keys are absent', async () => {
    await AsyncStorage.clear();
    const payload = await exportBackup();
    expect(payload.inspections).toEqual([]);
    expect(payload.agenda).toEqual([]);
    expect(payload.userFacilities).toEqual([]);
  });

  it('W86: embeds photo as base64 when file exists and is within size limit', async () => {
    const itemWithPhoto = { id: 'item-photo', title: 'T', photoUri: 'file:///photo.jpg', photos: [] };
    mockGetAll.mockResolvedValueOnce([
      { id: 'i1', facilityName: 'F', items: [itemWithPhoto] },
    ]);
    // Simulate file exists and is small
    mockGetInfoAsync.mockResolvedValueOnce({ exists: true, size: 1024 });
    mockReadAsString.mockResolvedValueOnce('base64data==');
    const payload = await exportBackup();
    const entry = payload.photoUriMap!['item-photo'];
    expect(entry).toMatchObject({ __b64: 'base64data==', ext: 'jpg' });
  });

  it('W86: falls back to URI string when photo file does not exist', async () => {
    const itemWithPhoto = { id: 'item-missing', title: 'T', photoUri: 'file:///missing.jpg', photos: [] };
    mockGetAll.mockResolvedValueOnce([
      { id: 'i1', facilityName: 'F', items: [itemWithPhoto] },
    ]);
    // Default mock: exists: false
    const payload = await exportBackup();
    expect(payload.photoUriMap!['item-missing']).toBe('file:///missing.jpg');
  });

  it('W86: stores __skip marker for oversized photos', async () => {
    const itemLarge = { id: 'item-large', title: 'T', photoUri: 'file:///huge.jpg', photos: [] };
    mockGetAll.mockResolvedValueOnce([
      { id: 'i1', facilityName: 'F', items: [itemLarge] },
    ]);
    mockGetInfoAsync.mockResolvedValueOnce({ exists: true, size: 3 * 1024 * 1024 }); // 3 MB > 2 MB limit
    const payload = await exportBackup();
    expect(payload.photoUriMap!['item-large']).toEqual({ __skip: true });
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
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///bad.json' }] });
    mockReadAsString.mockResolvedValueOnce('NOT JSON');
    await expect(importBackup()).rejects.toThrow();
  });

  it('throws when version does not match any supported version', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///v99.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify({ ...validPayload, version: 99 }));
    await expect(importBackup()).rejects.toThrow(/إصدار غير متوافق/);
  });

  it('throws when inspections field is not an array', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///bad.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify({ ...validPayload, inspections: null }));
    await expect(importBackup()).rejects.toThrow(/تالف/);
  });

  it('returns correct item counts on valid payload', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///ok.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(validPayload));
    const result = await importBackup();
    expect(result).toEqual({ inspections: 1, agenda: 1, userFacilities: 1 });
  });

  it('saves inspections via InspectionRepository.save()', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///ok.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(validPayload));
    await importBackup();
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'i1' }));
  });

  it('calls rescheduleAll with no arguments after restore', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///ok.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(validPayload));
    await importBackup();
    expect(rescheduleAll).toHaveBeenCalledWith();
  });

  it('throws when asset uri is missing', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: '' }] });
    await expect(importBackup()).rejects.toThrow(/لم يتم اختيار/);
  });

  it('throws when assets array is empty', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [] });
    await expect(importBackup()).rejects.toThrow();
  });

  it('throws when assets field is undefined', async () => {
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: undefined });
    await expect(importBackup()).rejects.toThrow();
  });

  it('accepts v1 backup (no photoUriMap)', async () => {
    const v1Payload = { ...validPayload, version: 1 };
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///v1.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(v1Payload));
    const result = await importBackup();
    expect(result).toEqual({ inspections: 1, agenda: 1, userFacilities: 1 });
  });

  it('accepts v2 backup (URI-only photoUriMap)', async () => {
    const v2Payload = { ...validPayload, version: 2 };
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///v2.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(v2Payload));
    const result = await importBackup();
    expect(result).toEqual({ inspections: 1, agenda: 1, userFacilities: 1 });
  });

  it('re-links legacy URI string from photoUriMap into item.photoUri', async () => {
    const payloadWithMap = {
      ...validPayload,
      inspections: [{ id: 'i1', items: [{ id: 'item-1', title: 'T' }] }],
      photoUriMap: { 'item-1': 'file:///photo.jpg' },
    };
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///v2.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(payloadWithMap));
    await importBackup();
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ id: 'item-1', photoUri: 'file:///photo.jpg' }),
        ]),
      }),
    );
  });

  it('W86: writes base64 entry back to disk and re-links new URI', async () => {
    const payloadV3 = {
      ...validPayload,
      version: BACKUP_VERSION,
      inspections: [{ id: 'i1', items: [{ id: 'item-b64', title: 'T' }] }],
      photoUriMap: { 'item-b64': { __b64: 'abc123==', ext: 'jpg' } },
    };
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///v3.json' }] });
    // First readAsStringAsync call is for the backup file (UTF8)
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(payloadV3));
    await importBackup();
    // FileSystem.writeAsStringAsync should have been called for photo restore
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('file:///docs/photo_item-b64_main_'),
      'abc123==',
      expect.objectContaining({ encoding: 'base64' }),
    );
    // save() receives item with updated photoUri pointing to documentDirectory
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: 'item-b64',
            photoUri: expect.stringContaining('file:///docs/photo_item-b64_main_'),
          }),
        ]),
      }),
    );
  });

  it('W86: __skip entry leaves photoUri unchanged', async () => {
    const payloadSkip = {
      ...validPayload,
      version: BACKUP_VERSION,
      inspections: [{ id: 'i1', items: [{ id: 'item-skip', title: 'T', photoUri: 'file:///old.jpg' }] }],
      photoUriMap: { 'item-skip': { __skip: true } },
    };
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///v3skip.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(payloadSkip));
    await importBackup();
    // photoUri should remain as original (not overwritten)
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ id: 'item-skip', photoUri: 'file:///old.jpg' }),
        ]),
      }),
    );
  });

  it('re-links multi-photo string array from photoUriMap', async () => {
    const payloadWithMulti = {
      ...validPayload,
      inspections: [{ id: 'i1', items: [{ id: 'item-1', title: 'T' }] }],
      photoUriMap: {
        'item-1': 'file:///single.jpg',
        'item-1__photos': ['file:///a.jpg', 'file:///b.jpg'],
      },
    };
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///v2multi.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(payloadWithMulti));
    await importBackup();
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: 'item-1',
            photoUri: 'file:///single.jpg',
            photos: ['file:///a.jpg', 'file:///b.jpg'],
          }),
        ]),
      }),
    );
  });

  it('returns inspections unchanged when photoUriMap is empty', async () => {
    const payloadEmptyMap = {
      ...validPayload,
      inspections: [{ id: 'i1', items: [{ id: 'item-1', title: 'T' }] }],
      photoUriMap: {},
    };
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///v2empty.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(payloadEmptyMap));
    const result = await importBackup();
    expect(result!.inspections).toBe(1);
  });

  it('handles missing userFacilities field gracefully', async () => {
    const { userFacilities: _omit, ...payloadNoFacilities } = validPayload;
    mockGetDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///nofac.json' }] });
    mockReadAsString.mockResolvedValueOnce(JSON.stringify(payloadNoFacilities));
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

  it('returns null when AsyncStorage.getItem throws', async () => {
    const original = AsyncStorage.getItem;
    (AsyncStorage as any).getItem = jest.fn().mockRejectedValueOnce(new Error('storage error'));
    const result = await getLastBackupDate();
    expect(result).toBeNull();
    (AsyncStorage as any).getItem = original;
  });
});
