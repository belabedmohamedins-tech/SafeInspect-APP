/**
 * __tests__/repositories/AuditLogRepository.test.ts
 * Contract tests for AuditLogRepository — SQLite contract (rewritten).
 */
import AuditLogRepository from '../../src/repositories/AuditLogRepository';

const SQLite = require('expo-sqlite');

beforeEach(() => {
  SQLite.__resetAll();
});

describe('AuditLogRepository.append', () => {
  it('appends a new entry', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'Ahmed', { inspectionId: 'i1', facilityName: 'FAC' });
    const all = await AuditLogRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].action).toBe('INSPECTION_SAVED');
    expect(all[0].inspectorName).toBe('Ahmed');
    expect(all[0].inspectionId).toBe('i1');
  });

  it('appends multiple entries — newest first', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'A');
    await AuditLogRepository.append('AGENDA_ITEM_SAVED', 'B');
    const all = await AuditLogRepository.getAll();
    expect(all[0].action).toBe('AGENDA_ITEM_SAVED');
    expect(all[1].action).toBe('INSPECTION_SAVED');
  });

  it('trims to MAX_ENTRIES (500)', async () => {
    for (let i = 0; i < 501; i++) {
      await AuditLogRepository.append('INSPECTION_SAVED', 'Inspector');
    }
    await AuditLogRepository.append('BACKUP_RESTORED', 'Y');
    const all = await AuditLogRepository.getAll();
    expect(all.length).toBe(500);
  }, 30_000);
});

describe('AuditLogRepository.getByAction', () => {
  it('filters by action', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'A');
    await AuditLogRepository.append('SETTINGS_CHANGED', 'B');
    const saved = await AuditLogRepository.getByAction('INSPECTION_SAVED');
    expect(saved).toHaveLength(1);
    expect(saved[0].action).toBe('INSPECTION_SAVED');
  });
});

describe('AuditLogRepository.getByInspection', () => {
  it('returns entries matching inspectionId', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'A', { inspectionId: 'i1' });
    await AuditLogRepository.append('INSPECTION_DELETED', 'B', { inspectionId: 'i2' });
    const result = await AuditLogRepository.getByInspection('i1');
    expect(result).toHaveLength(1);
    expect(result[0].inspectionId).toBe('i1');
  });
});
