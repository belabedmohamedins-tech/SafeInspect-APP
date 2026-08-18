// __tests__/repositories/CorrectiveActionRepository.test.ts
//
// Integration-style tests for CorrectiveActionRepository (expo-sqlite backend).
// The SQLite module is mocked via __mocks__/expo-sqlite.ts (automatic mock).

import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { CorrectiveAction } from '../../src/types';

const BASE: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> = {
  inspectionId:     'insp-1',
  inspectionItemId: 'item-1',
  facilityId:       'fac-1',
  facilityName:     'Test Facility',
  criteria:         'Criterion A',
  severity:         'high',
  deadline:         '2026-12-31',
  assignedTo:       'Inspector Ali',
  status:           'open',
};

beforeEach(async () => {
  await CorrectiveActionRepository.clear();
});

describe('CorrectiveActionRepository', () => {
  it('saves and retrieves a corrective action', async () => {
    const saved = await CorrectiveActionRepository.save(BASE);
    expect(saved.id).toBeTruthy();
    const all = await CorrectiveActionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].criteria).toBe('Criterion A');
  });

  it('filters by inspectionId', async () => {
    await CorrectiveActionRepository.save(BASE);
    await CorrectiveActionRepository.save({ ...BASE, inspectionId: 'insp-2' });
    const result = await CorrectiveActionRepository.getByInspection('insp-1');
    expect(result).toHaveLength(1);
    expect(result[0].inspectionId).toBe('insp-1');
  });

  it('updates status', async () => {
    const saved = await CorrectiveActionRepository.save(BASE);
    await CorrectiveActionRepository.updateStatus(saved.id, 'in-progress');
    const updated = await CorrectiveActionRepository.getById(saved.id);
    expect(updated?.status).toBe('in-progress');
  });

  it('deletes a corrective action', async () => {
    const saved = await CorrectiveActionRepository.save(BASE);
    await CorrectiveActionRepository.deleteById(saved.id);
    const all = await CorrectiveActionRepository.getAll();
    expect(all).toHaveLength(0);
  });

  it('clear empties all records', async () => {
    await CorrectiveActionRepository.save(BASE);
    await CorrectiveActionRepository.save(BASE);
    await CorrectiveActionRepository.clear();
    const all = await CorrectiveActionRepository.getAll();
    expect(all).toHaveLength(0);
  });
});
