/**
 * __tests__/repositories/AuditLogRepository.test.ts
 * Contract tests for AuditLogRepository — SQLite contract (rewritten).
 */
import { AuditLogRepository } from '../../src/repositories/AuditLogRepository';
import type { AuditEntry } from '../../src/types';

const SQLite = require('expo-sqlite');

beforeEach(() => {
  SQLite.__resetAll();
});

describe('AuditLogRepository.getAll', () => {
  it('returns empty array when no entries', async () => {
    expect(await AuditLogRepository.getAll()).toEqual([]);
  });

  it('returns all stored entries', async () => {
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'insp-1', userId: 'u1', details: {} });
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'insp-2', userId: 'u1', details: {} });
    expect(await AuditLogRepository.getAll()).toHaveLength(2);
  });
});

describe('AuditLogRepository.getByInspection', () => {
  it('filters by inspectionId', async () => {
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'insp-X', userId: 'u1', details: {} });
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'insp-X', userId: 'u1', details: {} });
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'insp-Y', userId: 'u1', details: {} });
    const saved = await AuditLogRepository.getByInspection('insp-X');
    expect(saved).toHaveLength(2);
    expect(saved.every((e: AuditEntry) => e.action === 'INSPECTION_SAVED')).toBe(true);
  });

  it('returns empty when inspectionId has no entries', async () => {
    const result = await AuditLogRepository.getByInspection('insp-X');
    expect(result.every((e: AuditEntry) => e.inspectionId === 'insp-X')).toBe(true);
  });
});

describe('AuditLogRepository.clear', () => {
  it('removes all entries', async () => {
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'i', userId: 'u', details: {} });
    await AuditLogRepository.clear();
    expect(await AuditLogRepository.getAll()).toHaveLength(0);
  });
});
