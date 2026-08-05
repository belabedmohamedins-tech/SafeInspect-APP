// src/__tests__/CorrectiveActionRepository.test.ts
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { CorrectiveAction, Severity } from '../types';

const tomorrow = () => new Date(Date.now() + 86400000).toISOString();

const makeAction = (overrides: Partial<Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>> = {}): Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> => ({
  inspectionId:     'insp-1',
  inspectionItemId: 'item-1',
  facilityId:       'fac-1',
  facilityName:     'Test Facility',
  criteria:         'Fix Issue',
  severity:         'medium' as Severity,
  deadline:         tomorrow(),
  assignedTo:       '',
  status:           'open',
  ...overrides,
});

describe('CorrectiveActionRepository', () => {
  beforeEach(async () => {
    // Clear storage before each test
    const all = await CorrectiveActionRepository.getAll();
    for (const a of all) {
      await CorrectiveActionRepository.delete(a.id);
    }
  });

  it('saves and retrieves a corrective action', async () => {
    const saved = await CorrectiveActionRepository.save(makeAction());
    expect(saved.criteria).toBe('Fix Issue');
    expect(saved.inspectionItemId).toBe('item-1');
  });

  it('updates a corrective action', async () => {
    const first = await CorrectiveActionRepository.save(makeAction());
    const updated = await CorrectiveActionRepository.save({ ...makeAction({ criteria: 'Updated' }), id: first.id });
    expect(updated.criteria).toBe('Updated');
  });

  it('lists all actions', async () => {
    const a = await CorrectiveActionRepository.save(makeAction({ criteria: 'A' }));
    await CorrectiveActionRepository.save(makeAction({ criteria: 'B' }));
    const all = await CorrectiveActionRepository.getAll();
    expect(all.length).toBe(2);
    // newest first
    expect(all[0].criteria).toBe('B');
  });
});
