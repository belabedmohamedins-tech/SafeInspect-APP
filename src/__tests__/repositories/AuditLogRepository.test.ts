// src/__tests__/repositories/AuditLogRepository.test.ts
// W24: verify clear() logs AUDIT_LOG_CLEARED before wiping rows.

import { AuditLogRepository } from '../../repositories/AuditLogRepository';

const mockRun = jest.fn().mockResolvedValue(undefined);
const mockGetAll = jest.fn();
const mockGetFirst = jest.fn();

jest.mock('../../db/schema', () => ({
  getDb: jest.fn().mockResolvedValue({
    runAsync: (...args: unknown[]) => mockRun(...args),
    getAllAsync: (...args: unknown[]) => mockGetAll(...args),
    getFirstAsync: (...args: unknown[]) => mockGetFirst(...args),
  }),
}));

beforeEach(() => {
  mockRun.mockClear();
  mockGetAll.mockClear();
});

describe('AuditLogRepository.clear', () => {
  it('inserts AUDIT_LOG_CLEARED before deleting rows', async () => {
    await AuditLogRepository.clear('inspector_test');

    expect(mockRun).toHaveBeenCalledTimes(2);

    // First call: INSERT the sentinel row
    const [insertSql, insertParams] = mockRun.mock.calls[0] as [string, unknown[]];
    expect(insertSql).toContain('INSERT INTO audit_log');
    expect(insertParams).toContain('AUDIT_LOG_CLEARED');
    expect(insertParams).toContain('inspector_test');

    // Second call: DELETE all except sentinel
    const [deleteSql] = mockRun.mock.calls[1] as [string];
    expect(deleteSql).toContain('DELETE FROM audit_log');
  });

  it('attributes the clear event to the provided inspectorName', async () => {
    await AuditLogRepository.clear('محمد المفتش');
    const [, params] = mockRun.mock.calls[0] as [string, unknown[]];
    expect(params).toContain('محمد المفتش');
  });
});

describe('AuditLogRepository.append', () => {
  it('does not throw on db error (append-only contract)', async () => {
    mockRun.mockRejectedValueOnce(new Error('db locked'));
    await expect(
      AuditLogRepository.append('INSPECTION_SAVED', 'inspector'),
    ).resolves.toBeUndefined();
  });
});
