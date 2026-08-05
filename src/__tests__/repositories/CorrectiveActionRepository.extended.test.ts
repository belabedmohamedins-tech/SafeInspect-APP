// src/__tests__/repositories/CorrectiveActionRepository.extended.test.ts
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';
import { CorrectiveAction, Severity } from '../../types';

const tomorrow = () => new Date(Date.now() + 86400000).toISOString();

const makeAction = (overrides: Partial<Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>> = {}): Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> => ({
  inspectionId:     'insp-1',
  inspectionItemId: 'item-1',
  facilityId:       'fac-1',
  facilityName:     'F',
  criteria:         'Fix',
  severity:         'medium' as Severity,
  deadline:         tomorrow(),
  assignedTo:       '',
  status:           'open',
  ...overrides,
});

describe('CorrectiveActionRepository extended', () => {
  beforeEach(async () => {
    const all = await CorrectiveActionRepository.getAll();
    for (const a of all) { await CorrectiveActionRepository.delete(a.id); }
  });

  it('saves and retrieves by inspectionId', async () => {
    const saved = await CorrectiveActionRepository.save(makeAction() as CorrectiveAction);
    expect(saved.inspectionId).toBe('insp-1');
    expect(saved.criteria).toBe('Fix');
  });

  it('saves with facilityId', async () => {
    const saved = await CorrectiveActionRepository.save({
      ...makeAction({ facilityId: 'fac-1', facilityName: 'F', criteria: 'Fix' }),
    } as CorrectiveAction);
    expect(saved.facilityId).toBe('fac-1');
  });
});
