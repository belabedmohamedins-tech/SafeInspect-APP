// __tests__/services/BackupService.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── FileSystem mock ─────────────────────────────────────────────────────────
const mockWriteAsString = jest.fn().mockResolvedValue(undefined);
const mockReadAsString = jest.fn();
const mockGetInfo = jest.fn();
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///docs/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: (...a: any[]) => mockWriteAsString(...a),
  readAsStringAsync:  (...a: any[]) => mockReadAsString(...a),
  getInfoAsync:       (...a: any[]) => mockGetInfo(...a),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync:          jest.fn().mockResolvedValue(undefined),
}));

// ─── Sharing mock ─────────────────────────────────────────────────────────────
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync:       jest.fn().mockResolvedValue(undefined),
}));

// ─── DocumentPicker mock ──────────────────────────────────────────────────────
const mockPicker = jest.fn();
jest.mock('expo-document-picker', () => ({ getDocumentAsync: (...a: any[]) => mockPicker(...a) }));

// ─── NotificationService mock ─────────────────────────────────────────────────
jest.mock('../../src/services/NotificationService', () => ({
  rescheduleAll: jest.fn().mockResolvedValue(undefined),
}));

import { exportBackup, importBackup, getLastBackupDate, BACKUP_VERSION } from '../../src/services/BackupService';

const seedStorage = async () => {
  await AsyncStorage.multiSet([
    ['inspections',    JSON.stringify([{ id: 'i1', items: [{ id: 'item1', photoUri: 'file:///tmp/p.jpg', photos: ['file:///tmp/p2.jpg'] }] }])],
    ['agenda',         JSON.stringify([{ id: 'a1', status: 'pending', facilityName: 'FAC', date: new Date(Date.now() + 86400000).toISOString(), notes: '' }])],
    ['userFacilities', JSON.stringify([{ id: 'U1', name: 'FAC' }])],
    ['officeName',     'HQ'],
    ['inspectorName',  'Ahmed'],
    ['inspectionCause','routine'],
  ]);
};

beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
  mockWriteAsString.mockResolvedValue(undefined);
});

describe('exportBackup', () => {
  it('returns payload with correct counts and version', async () => {
    await seedStorage();
    const payload = await exportBackup();
    expect(payload.version).toBe(BACKUP_VERSION);
    expect(payload.inspections).toHaveLength(1);
    expect(payload.agenda).toHaveLength(1);
    expect(payload.settings.officeName).toBe('HQ');
  });

  it('builds photoUriMap from items', async () => {
    await seedStorage();
    const payload = await exportBackup();
    expect(payload.photoUriMap!['item1']).toBe('file:///tmp/p.jpg');
    expect(payload.photoUriMap!['item1__photos']).toEqual(['file:///tmp/p2.jpg']);
  });

  it('handles empty storage (no inspections)', async () => {
    const payload = await exportBackup();
    expect(payload.inspections).toEqual([]);
    expect(payload.agenda).toEqual([]);
  });

  it('stores lastBackupAt timestamp', async () => {
    await exportBackup();
    const raw = await AsyncStorage.getItem('@backup/lastExportedAt');
    expect(raw).toBeTruthy();
  });
});

describe('importBackup', () => {
  const makePayload = (overrides: Record<string, any> = {}) => ({
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    inspections: [{ id: 'i2', items: [], facilityId: 'F1', facilityName: 'FAC' }],
    agenda: [{ id: 'a2', status: 'completed', facilityName: 'FAC', date: '2026-01-01', notes: '' }],
    userFacilities: [{ id: 'U2', name: 'FAC' }],
    settings: { officeName: 'HQ2', inspectorName: 'Karim', inspectionCause: 'follow-up', organisation: 'ORG', department: 'DEPT', showGrade: 'true' },
    ...overrides,
  });

  beforeEach(() => {
    mockPicker.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///docs/backup.json' }] });
  });

  it('returns null when picker is cancelled', async () => {
    mockPicker.mockResolvedValue({ canceled: true });
    expect(await importBackup()).toBeNull();
  });

  it('throws when no asset uri', async () => {
    mockPicker.mockResolvedValue({ canceled: false, assets: [{}] });
    await expect(importBackup()).rejects.toThrow();
  });

  it('imports valid v2 payload and returns counts', async () => {
    mockReadAsString.mockResolvedValue(JSON.stringify(makePayload()));
    const result = await importBackup();
    expect(result?.inspections).toBe(1);
    expect(result?.agenda).toBe(1);
    expect(result?.userFacilities).toBe(1);
  });

  it('imports valid v1 payload (no photoUriMap)', async () => {
    mockReadAsString.mockResolvedValue(JSON.stringify(makePayload({ version: 1 })));
    const result = await importBackup();
    expect(result).not.toBeNull();
  });

  it('applies photoUriMap on v2 import', async () => {
    const payload = makePayload({
      inspections: [{ id: 'i3', items: [{ id: 'itemX', photoUri: undefined }] }],
      photoUriMap: { itemX: 'file:///docs/photo.jpg' },
    });
    mockReadAsString.mockResolvedValue(JSON.stringify(payload));
    const result = await importBackup();
    expect(result).not.toBeNull();
  });

  it('throws on invalid JSON', async () => {
    mockReadAsString.mockResolvedValue('NOT_JSON{{{}');
    await expect(importBackup()).rejects.toThrow();
  });

  it('throws on incompatible version', async () => {
    mockReadAsString.mockResolvedValue(JSON.stringify(makePayload({ version: 99 })));
    await expect(importBackup()).rejects.toThrow();
  });

  it('throws when inspections is not an array', async () => {
    mockReadAsString.mockResolvedValue(JSON.stringify(makePayload({ inspections: null })));
    await expect(importBackup()).rejects.toThrow();
  });
});

describe('getLastBackupDate', () => {
  it('returns null when never backed up', async () => {
    expect(await getLastBackupDate()).toBeNull();
  });

  it('returns Date after export', async () => {
    await exportBackup();
    const d = await getLastBackupDate();
    expect(d).toBeInstanceOf(Date);
  });

  it('returns null on AsyncStorage failure', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    expect(await getLastBackupDate()).toBeNull();
  });
});
