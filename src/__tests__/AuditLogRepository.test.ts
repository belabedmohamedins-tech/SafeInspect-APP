// src/__tests__/AuditLogRepository.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditLogRepository } from '../repositories/AuditLogRepository';

const MAX_ENTRIES = 500;

beforeEach(async () => {
  await AsyncStorage.clear();
});

function makeEntry(i: number) {
  return {
    id: `entry-${i}`,
    timestamp: new Date(2026, 5, 27, i % 24).toISOString(),
    action: 'INSPECTION_SAVED' as const,
    inspectorName: 'مفتش',
    facilityName: `منشأة ${i}`,
  };
}

describe('AuditLogRepository', () => {
  it('getAll returns empty array when storage is empty', async () => {
    const log = await AuditLogRepository.getAll();
    expect(log).toEqual([]);
  });

  it('append + getAll round-trip stores the entry', async () => {
    await AuditLogRepository.append(makeEntry(1));
    const log = await AuditLogRepository.getAll();
    expect(log).toHaveLength(1);
    expect(log[0].id).toBe('entry-1');
  });

  it('multiple appends preserve insertion order', async () => {
    await AuditLogRepository.append(makeEntry(1));
    await AuditLogRepository.append(makeEntry(2));
    await AuditLogRepository.append(makeEntry(3));
    const log = await AuditLogRepository.getAll();
    expect(log.map(e => e.id)).toEqual(['entry-1', 'entry-2', 'entry-3']);
  });

  it('clear empties the log', async () => {
    await AuditLogRepository.append(makeEntry(1));
    await AuditLogRepository.clear();
    const log = await AuditLogRepository.getAll();
    expect(log).toHaveLength(0);
  });

  it(`ring-buffer: appending ${MAX_ENTRIES + 5} entries keeps only the last ${MAX_ENTRIES}`, async () => {
    const totalEntries = MAX_ENTRIES + 5;
    for (let i = 0; i < totalEntries; i++) {
      await AuditLogRepository.append(makeEntry(i));
    }
    const log = await AuditLogRepository.getAll();
    expect(log).toHaveLength(MAX_ENTRIES);
    // Should keep the LAST 500, so the first entry should be index 5
    expect(log[0].id).toBe(`entry-5`);
    expect(log[log.length - 1].id).toBe(`entry-${totalEntries - 1}`);
  }, 20_000); // ring-buffer test is intentionally slow — allow 20s
});
