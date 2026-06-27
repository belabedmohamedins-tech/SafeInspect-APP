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
const mockGetDocumentAsync = jest.fn();
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: mockGetDocumentAsync,
}));

// ─── Mock NotificationService ────────────────────────────────────────────────
jest.mock('../services/NotificationService', () => ({
  rescheduleAll: jest.fn().mockResolvedValue(undefined),
}));

import * as FileSystem from 'expo-file-system';
import { rescheduleAll } from '../services/NotificationService';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

// ─── Seed AsyncStorage with realistic data ────────────────────────────────────

async function seedStorage() {
  await AsyncStorage.multiSet([
    ['inspections', JSON.stringify([{ id: 'i1', facilityName: 'منشأة أ' }])],
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
});

// ─── importBackup ─────────────────────────────────────────────────────────────

describe('importBackup', () => {
  const validPayload = {
    version: BACKUP_VERSION,
    exportedAt: '2026-06-27T10:00:00.000Z',
    inspections:    [{ id: 'i1' }],
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
});
