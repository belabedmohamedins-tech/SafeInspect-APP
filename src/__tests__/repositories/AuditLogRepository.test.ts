// src/__tests__/repositories/AuditLogRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper. Do NOT add an inline jest.mock() factory
// for it here. Use AsyncStorage.clear() in beforeEach.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';

const MAX_ENTRIES = 500;

beforeEach(async () => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

describe('AuditLogRepository', () => {
  it('getAll returns empty array when storage is empty', async () => {
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

  it('multiple appends preserve insertion order (getAll returns newest first)', async () => {
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

  it(`ring-buffer: appending ${MAX_ENTRIES + 5} entries keeps only the last ${MAX_ENTRIES}`, async () => {
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
