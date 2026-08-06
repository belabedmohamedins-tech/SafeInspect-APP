/**
 * src/__tests__/repositories/AuditLogRepository.test.ts
 * Named import fix + explicit callback types.
 */
import { AuditLogRepository } from '../../repositories/AuditLogRepository';
import type { AuditEntry } from '../../types';

const SQLite = require('expo-sqlite');

beforeEach(() => {
  SQLite.__resetAll();
});

describe('AuditLogRepository.getAll', () => {
  it('returns empty array initially', async () => {
    expect(await AuditLogRepository.getAll()).toEqual([]);
  });

  it('stores and retrieves entries', async () => {
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'i1', userId: 'u1', details: {} });
    expect(await AuditLogRepository.getAll()).toHaveLength(1);
  });
});

describe('AuditLogRepository.getByInspection', () => {
  it('filters correctly', async () => {
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'insp-X', userId: 'u1', details: {} });
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'insp-X', userId: 'u1', details: {} });
    await AuditLogRepository.append({ action: 'INSPECTION_SAVED', inspectionId: 'insp-Y', userId: 'u1', details: {} });
    const saved = await AuditLogRepository.getByInspection('insp-X');
    expect(saved).toHaveLength(2);
    expect(saved.every((e: AuditEntry) => e.action === 'INSPECTION_SAVED')).toBe(true);
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
