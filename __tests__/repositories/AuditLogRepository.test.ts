/**
 * __tests__/repositories/AuditLogRepository.test.ts
 * Z6-TSC: AuditEntry lives in AuditLogRepository, not src/types.
 *         append() takes (action, inspectorName, opts?) — not a plain object.
 * W39: clear() requires inspectorName arg (added W24).
 *      'clear empties the log' expects length 1 — the sentinel AUDIT_LOG_CLEARED
 *      row is intentionally kept so the wipe is always traceable (legal requirement).
 */
import { AuditLogRepository } from '../../src/repositories/AuditLogRepository';
import type { AuditEntry } from '../../src/repositories/AuditLogRepository';

beforeEach(async () => {
  await AuditLogRepository.clear('__test__');
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

  it('clear leaves only the sentinel AUDIT_LOG_CLEARED entry', async () => {
    await AuditLogRepository.append('INSPECTION_SAVED', 'Alice', { inspectionId: 'i' });
    await AuditLogRepository.clear('Alice');
    const all = await AuditLogRepository.getAll();
    // W24 contract: clear() keeps exactly 1 sentinel row for legal traceability.
    expect(all).toHaveLength(1);
    expect(all[0].action).toBe('AUDIT_LOG_CLEARED');
    expect(all[0].inspectorName).toBe('Alice');
  });
});
