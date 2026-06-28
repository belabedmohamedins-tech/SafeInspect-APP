// src/__tests__/repositories/AuditLogRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper. Do NOT add an inline jest.mock() factory
// for it here. Use AsyncStorage.__resetStore() in beforeEach.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';

const MAX_ENTRIES = 500;

beforeEach(async () => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

describe('AuditLogRepository — getAll', () => {
  it('returns empty array when storage is empty', async () => {
    const log = await AuditLogRepository.getAll();
    expect(log).toEqual([]);
  });

  it('append + getAll round-trip stores the entry', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'مفتش', { facilityName: 'منشأة 1' });
    const log = await AuditLogRepository.getAll();
    expect(log).toHaveLength(1);
    expect(log[0].action).toBe('INSPECTION_SAVED');
    expect(log[0].inspectorName).toBe('مفتش');
    expect(log[0].facilityName).toBe('منشأة 1');
  });

  it('multiple appends: getAll returns newest first', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED',  'مفتش', { facilityName: 'منشأة 1' });
    await AuditLogRepository.append('AGENDA_ITEM_SAVED', 'مفتش', { facilityName: 'منشأة 2' });
    await AuditLogRepository.append('SETTINGS_CHANGED',  'مفتش');
    const log = await AuditLogRepository.getAll();
    expect(log[0].action).toBe('SETTINGS_CHANGED');
    expect(log[1].action).toBe('AGENDA_ITEM_SAVED');
    expect(log[2].action).toBe('INSPECTION_SAVED');
  });

  it('clear empties the log', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'مفتش');
    await AuditLogRepository.clear();
    const log = await AuditLogRepository.getAll();
    expect(log).toHaveLength(0);
  });

  it(`ring-buffer: keeps only the last ${MAX_ENTRIES} entries`, async () => {
    const totalEntries = MAX_ENTRIES + 5;
    for (let i = 0; i < totalEntries; i++) {
      await AuditLogRepository.append('INSPECTION_SAVED', 'مفتش', { facilityName: `منشأة ${i}` });
    }
    const log = await AuditLogRepository.getAll();
    expect(log).toHaveLength(MAX_ENTRIES);
    expect(log[0].facilityName).toBe(`منشأة ${totalEntries - 1}`);
    expect(log[log.length - 1].facilityName).toBe(`منشأة 5`);
  }, 20_000);
});

describe('AuditLogRepository — getByAction', () => {
  it('returns only entries matching the requested action', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED',   'مفتش', { inspectionId: 'i1' });
    await AuditLogRepository.append('INSPECTION_DELETED', 'مفتش', { inspectionId: 'i2' });
    await AuditLogRepository.append('INSPECTION_SAVED',   'مفتش', { inspectionId: 'i3' });
    const saved = await AuditLogRepository.getByAction('INSPECTION_SAVED');
    expect(saved).toHaveLength(2);
    expect(saved.every(e => e.action === 'INSPECTION_SAVED')).toBe(true);
  });

  it('returns [] when no entries match the action', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'مفتش');
    const result = await AuditLogRepository.getByAction('BACKUP_RESTORED');
    expect(result).toEqual([]);
  });

  it('returns newest-first within the filtered set', async () => {
    await AuditLogRepository.append('SETTINGS_CHANGED', 'مفتش أول');
    await AuditLogRepository.append('INSPECTION_SAVED', 'مفتش ب');
    await AuditLogRepository.append('SETTINGS_CHANGED', 'مفتش ج');
    const settings = await AuditLogRepository.getByAction('SETTINGS_CHANGED');
    expect(settings[0].inspectorName).toBe('مفتش ج');
    expect(settings[1].inspectorName).toBe('مفتش أول');
  });
});

describe('AuditLogRepository — getByInspection', () => {
  it('returns entries matching the given inspectionId', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED',   'مفتش', { inspectionId: 'insp-X' });
    await AuditLogRepository.append('INSPECTION_DELETED', 'مفتش', { inspectionId: 'insp-Y' });
    await AuditLogRepository.append('INSPECTION_SAVED',   'مفتش', { inspectionId: 'insp-X' });
    const result = await AuditLogRepository.getByInspection('insp-X');
    expect(result).toHaveLength(2);
    expect(result.every(e => e.inspectionId === 'insp-X')).toBe(true);
  });

  it('returns [] when no entries reference the inspectionId', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'مفتش', { inspectionId: 'insp-A' });
    const result = await AuditLogRepository.getByInspection('insp-GHOST');
    expect(result).toEqual([]);
  });

  it('returns newest-first for a given inspection', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED',   'مفتش1', { inspectionId: 'insp-Z' });
    await AuditLogRepository.append('INSPECTION_DELETED', 'مفتش2', { inspectionId: 'insp-Z' });
    const result = await AuditLogRepository.getByInspection('insp-Z');
    expect(result[0].action).toBe('INSPECTION_DELETED');
    expect(result[1].action).toBe('INSPECTION_SAVED');
  });
});
