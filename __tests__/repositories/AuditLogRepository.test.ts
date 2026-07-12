// __tests__/repositories/AuditLogRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditLogRepository, AuditAction } from '../../src/repositories/AuditLogRepository';

beforeEach(() => {
  AsyncStorage.clear();
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
    await AuditLogRepository.append('INSPECTION_SAVED', 'A', { inspectionId: 'i1' });
    await AuditLogRepository.append('AGENDA_ITEM_SAVED', 'B');
    const all = await AuditLogRepository.getAll();
    expect(all[0].action).toBe('AGENDA_ITEM_SAVED');
    expect(all[1].action).toBe('INSPECTION_SAVED');
  });

  it('silently survives AsyncStorage failure', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    await expect(AuditLogRepository.append('SETTINGS_CHANGED', 'X')).resolves.not.toThrow();
  });

  it('trims to MAX_ENTRIES (500)', async () => {
    // Write 501 entries directly
    const big = Array.from({ length: 501 }, (_, i) => ({
      id: `${i}`,
      timestamp: new Date().toISOString(),
      action: 'INSPECTION_SAVED' as AuditAction,
      inspectorName: 'X',
    }));
    await AsyncStorage.setItem('AUDIT_LOG', JSON.stringify(big));
    // append one more — should trigger trim
    await AuditLogRepository.append('BACKUP_RESTORED', 'Y');
    const all = await AuditLogRepository.getAll();
    expect(all.length).toBe(500);
  });
});

describe('AuditLogRepository.getAll', () => {
  it('returns empty array when nothing stored', async () => {
    const all = await AuditLogRepository.getAll();
    expect(all).toEqual([]);
  });
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

  it('returns empty array when no match', async () => {
    const result = await AuditLogRepository.getByInspection('NOPE');
    expect(result).toEqual([]);
  });
});

describe('AuditLogRepository.clear', () => {
  it('removes all entries', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'A');
    await AuditLogRepository.clear();
    const all = await AuditLogRepository.getAll();
    expect(all).toEqual([]);
  });
});
