/**
 * __tests__/repositories/CorrectiveActionRepository.test.ts
 * Z6-TSC: inspectorId → inspectionId (typo fix).
 * Z5-TSC2: save() returns CorrectiveAction — use saved.id throughout.
 */
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import type { CorrectiveAction } from '../../src/types';

type NewCA = Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>;

function makeCA(overrides: Partial<NewCA> = {}): NewCA {
  return {
    inspectionId: 'insp-1',
    inspectionItemId: 'item-1',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    criteria: 'Test criterion',
    severity: 'high',
    deadline: '2026-12-31',
    assignedTo: 'Inspector A',
    status: 'open',
    ...overrides,
  };
}

beforeEach(async () => {
  await CorrectiveActionRepository.clear();
});

describe('CorrectiveActionRepository', () => {
  it('saves and retrieves a corrective action', async () => {
    const saved = await CorrectiveActionRepository.save(makeCA());
    expect(typeof saved.id).toBe('string');
    const all = await CorrectiveActionRepository.getAll();
    expect(all.some(c => c.id === saved.id)).toBe(true);
  });

  it('filters by inspectionId', async () => {
    await CorrectiveActionRepository.save(makeCA({ inspectionId: 'A' }));
    await CorrectiveActionRepository.save(makeCA({ inspectionId: 'B' }));
    const result = await CorrectiveActionRepository.getByInspection('A');
    expect(result.every(c => c.inspectionId === 'A')).toBe(true);
  });

  it('updates status', async () => {
    const saved = await CorrectiveActionRepository.save(makeCA());
    await CorrectiveActionRepository.updateStatus(saved.id, 'resolved');
    const all = await CorrectiveActionRepository.getAll();
    const updated = all.find(c => c.id === saved.id);
    expect(updated?.status).toBe('resolved');
  });

  it('deletes a corrective action', async () => {
    const saved = await CorrectiveActionRepository.save(makeCA());
    await CorrectiveActionRepository.delete(saved.id);
    const all = await CorrectiveActionRepository.getAll();
    expect(all.every(c => c.id !== saved.id)).toBe(true);
  });

  it('clear empties all records', async () => {
    await CorrectiveActionRepository.save(makeCA());
    await CorrectiveActionRepository.clear();
    expect(await CorrectiveActionRepository.getAll()).toHaveLength(0);
  });
});
