// src/__tests__/repositories/CorrectiveActionRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';
import type { CorrectiveAction } from '../../types';

const { __resetStore } = AsyncStorage as any;
beforeEach(() => {
  __resetStore();
  jest.clearAllMocks();
});

const tomorrow = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};
const yesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

type NewAction = Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>;

const makeAction = (overrides: Partial<NewAction> = {}): NewAction => ({
  inspectionId: 'ins-1',
  inspectionItemId: 'item-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  criteria: 'Fix Issue',
  severity: 'medium',
  deadline: tomorrow(),
  assignedTo: '',
  status: 'open',
  notes: 'Fix the identified issue',
  ...overrides,
});

describe('CorrectiveActionRepository', () => {
  describe('getAll', () => {
    it('returns empty array when store is empty', async () => {
      expect(await CorrectiveActionRepository.getAll()).toEqual([]);
    });

    it('returns saved actions', async () => {
      await CorrectiveActionRepository.save(makeAction());
      expect(await CorrectiveActionRepository.getAll()).toHaveLength(1);
    });

    it('auto-escalates open actions past deadline to overdue', async () => {
      await CorrectiveActionRepository.save(makeAction({ status: 'open', deadline: yesterday() }));
      const all = await CorrectiveActionRepository.getAll();
      expect(all[0].status).toBe('overdue');
    });

    it('auto-escalates in-progress actions past deadline to overdue', async () => {
      await CorrectiveActionRepository.save(makeAction({ status: 'in-progress', deadline: yesterday() }));
      const all = await CorrectiveActionRepository.getAll();
      expect(all[0].status).toBe('overdue');
    });

    it('does not escalate resolved actions even past deadline', async () => {
      await CorrectiveActionRepository.save(makeAction({ status: 'resolved', deadline: yesterday() }));
      const all = await CorrectiveActionRepository.getAll();
      expect(all[0].status).toBe('resolved');
    });
  });

  describe('save', () => {
    it('creates a new action with generated metadata', async () => {
      const saved = await CorrectiveActionRepository.save(makeAction());
      expect(saved.id).toBeTruthy();
      expect(saved.createdAt).toBeTruthy();
      expect(saved.updatedAt).toBeTruthy();
      expect(saved.criteria).toBe('Fix Issue');
    });

    it('updates an existing action', async () => {
      const first = await CorrectiveActionRepository.save(makeAction());
      const updated = await CorrectiveActionRepository.save({ ...first, criteria: 'Updated' });
      expect(updated.id).toBe(first.id);
      expect(updated.criteria).toBe('Updated');
      expect(updated.updatedAt >= first.updatedAt).toBe(true);
    });
  });

  describe('getById', () => {
    it('returns undefined when not found', async () => {
      expect(await CorrectiveActionRepository.getById('missing')).toBeUndefined();
    });

    it('returns the matching action', async () => {
      const saved = await CorrectiveActionRepository.save(makeAction());
      const found = await CorrectiveActionRepository.getById(saved.id);
      expect(found?.id).toBe(saved.id);
    });
  });

  describe('delete', () => {
    it('removes an action by id', async () => {
      const saved = await CorrectiveActionRepository.save(makeAction());
      await CorrectiveActionRepository.delete(saved.id);
      expect(await CorrectiveActionRepository.getById(saved.id)).toBeUndefined();
    });
  });

  describe('sorting', () => {
    it('returns newest first', async () => {
      await CorrectiveActionRepository.save(makeAction({ criteria: 'A' }));
      await CorrectiveActionRepository.save(makeAction({ inspectionItemId: 'item-2', criteria: 'B' }));
      const all = await CorrectiveActionRepository.getAll();
      expect(all[0].criteria).toBe('B');
    });
  });
});
