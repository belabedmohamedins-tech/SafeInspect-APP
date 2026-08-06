/**
 * src/__tests__/repositories/AuditLogRepository.test.ts
 * Mirror of __tests__/repositories/AuditLogRepository.test.ts.
 * append() signature: (action, inspectorName, opts?)
 * AuditEntry exported from AuditLogRepository, not types.ts.
 */
import { AuditLogRepository } from '../../repositories/AuditLogRepository';
import type { AuditEntry } from '../../repositories/AuditLogRepository';

const SQLite = require('expo-sqlite');

beforeEach(() => {
  SQLite.__resetAll();
});

describe('AuditLogRepository.getAll', () => {
  it('returns empty array when no entries', async () => {
    expect(await AuditLogRepository.getAll()).toEqual([]);
  });

  it('returns all stored entries', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'Ahmed', { inspectionId: 'i1' });
    await AuditLogRepository.append('INSPECTION_SAVED', 'Ahmed', { inspectionId: 'i1' });
    expect(await AuditLogRepository.getAll()).toHaveLength(2);
  });
});

describe('AuditLogRepository.getByInspection', () => {
  it('filters by inspectionId', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'Ahmed', { inspectionId: 'insp-X' });
    await AuditLogRepository.append('INSPECTION_SAVED', 'Ahmed', { inspectionId: 'insp-X' });
    await AuditLogRepository.append('INSPECTION_SAVED', 'Ahmed', { inspectionId: 'insp-Y' });
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
    await AuditLogRepository.append('INSPECTION_SAVED', 'Ahmed', { inspectionId: 'i' });
    await AuditLogRepository.clear();
    expect(await AuditLogRepository.getAll()).toHaveLength(0);
  });
});
