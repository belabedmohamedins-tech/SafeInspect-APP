/**
 * src/__tests__/repositories/AuditLogRepository.test.ts
 * Z6-TSC: AuditEntry comes from AuditLogRepository, not types.
 *         append() is (action, inspectorName, opts?).
 */
import { AuditLogRepository } from '../../repositories/AuditLogRepository';
import type { AuditEntry } from '../../repositories/AuditLogRepository';

beforeEach(async () => {
  await AuditLogRepository.clear();
});

describe('AuditLogRepository (src)', () => {
  it('appends and retrieves entries', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'Alice', { inspectionId: 'i1' });
    const all = await AuditLogRepository.getAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it('getByAction filters correctly', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED',   'Alice', { inspectionId: 'insp-X' });
    await AuditLogRepository.append('INSPECTION_SAVED',   'Alice', { inspectionId: 'insp-X' });
    await AuditLogRepository.append('INSPECTION_DELETED', 'Alice', { inspectionId: 'insp-Y' });
    const saved = await AuditLogRepository.getByAction('INSPECTION_SAVED');
    expect(saved.every((e: AuditEntry) => e.action === 'INSPECTION_SAVED')).toBe(true);
  });

  it('clear empties the log', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'Alice', { inspectionId: 'i' });
    await AuditLogRepository.clear();
    expect(await AuditLogRepository.getAll()).toHaveLength(0);
  });
});
