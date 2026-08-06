/**
 * __tests__/repositories/AuditLogRepository.test.ts
 * Z6-TSC: AuditEntry lives in AuditLogRepository, not src/types.
 *         append() takes (action, inspectorName, opts?) — not a plain object.
 */
import { AuditLogRepository } from '../../src/repositories/AuditLogRepository';
import type { AuditEntry } from '../../src/repositories/AuditLogRepository';

beforeEach(async () => {
  await AuditLogRepository.clear();
});

describe('AuditLogRepository', () => {
  it('appends and retrieves entries', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'Alice', { inspectionId: 'insp-1' });
    await AuditLogRepository.append('INSPECTION_SAVED', 'Bob',   { inspectionId: 'insp-2' });
    const all = await AuditLogRepository.getAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it('getByAction returns only matching entries', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED',   'Alice', { inspectionId: 'insp-X' });
    await AuditLogRepository.append('INSPECTION_SAVED',   'Alice', { inspectionId: 'insp-X' });
    await AuditLogRepository.append('INSPECTION_DELETED', 'Alice', { inspectionId: 'insp-Y' });
    const saved = await AuditLogRepository.getByAction('INSPECTION_SAVED');
    expect(saved.every((e: AuditEntry) => e.action === 'INSPECTION_SAVED')).toBe(true);
  });

  it('clear empties the log', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'Alice', { inspectionId: 'i' });
    await AuditLogRepository.clear();
    const all = await AuditLogRepository.getAll();
    expect(all).toHaveLength(0);
  });
});
