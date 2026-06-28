// src/__tests__/repositories/CorrectiveActionRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';
import type { CorrectiveAction } from '../../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const { __resetStore } = AsyncStorage as any;
beforeEach(() => { __resetStore(); jest.clearAllMocks(); });

// ─── Fixtures ───────────────────────────────────────────────────────────────
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

const makeAction = (overrides: Partial<CorrectiveAction> = {}): Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> => ({
  inspectionId: 'ins-1',
  inspectionItemId: 'item-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  title: 'Fix Issue',
  description: 'Fix the identified issue',
  status: 'open',
  severity: 'medium',
  deadline: tomorrow(),
  assignedTo: '',
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

    it('auto-escalates open actions past their deadline to overdue', async () => {
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

  describe('getByInspection', () => {
    it('returns only actions for the specified inspection', async () => {
      await CorrectiveActionRepository.save(makeAction({ inspectionId: 'ins-1' }));
      await CorrectiveActionRepository.save(makeAction({ inspectionId: 'ins-2' }));
      const result = await CorrectiveActionRepository.getByInspection('ins-1');
      expect(result).toHaveLength(1);
      expect(result[0].inspectionId).toBe('ins-1');
    });
  });

  describe('getByFacility', () => {
    it('returns only actions for the specified facility', async () => {
      await CorrectiveActionRepository.save(makeAction({ facilityId: 'fac-1' }));
      await CorrectiveActionRepository.save(makeAction({ facilityId: 'fac-2' }));
      const result = await CorrectiveActionRepository.getByFacility('fac-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getOpen', () => {
    it('returns open, in-progress, and overdue actions', async () => {
      await CorrectiveActionRepository.save(makeAction({ status: 'open' }));
      await CorrectiveActionRepository.save(makeAction({ status: 'in-progress' }));
      await CorrectiveActionRepository.save(makeAction({ status: 'resolved' }));
      const result = await CorrectiveActionRepository.getOpen();
      expect(result).toHaveLength(2);
    });
  });

  describe('save', () => {
    it('creates a new action with generated id and timestamps', async () => {
      const saved = await CorrectiveActionRepository.save(makeAction());
      expect(saved.id).toMatch(/^cap-/);
      expect(saved.createdAt).toBeTruthy();
      expect(saved.updatedAt).toBeTruthy();
    });

    it('uses provided id for upsert (updates existing)', async () => {
      const first = await CorrectiveActionRepository.save(makeAction());
      const updated = await CorrectiveActionRepository.save({ ...makeAction({ title: 'Updated' }), id: first.id });
      const all = await CorrectiveActionRepository.getAll();
      expect(all).toHaveLength(1);
      expect(updated.title).toBe('Updated');
    });

    it('sets a default deadline of 30 days when none provided', async () => {
      const { deadline, ...noDeadline } = makeAction() as any;
      const saved = await CorrectiveActionRepository.save(noDeadline);
      expect(saved.deadline).toBeTruthy();
    });
  });

  describe('updateStatus', () => {
    it('changes the status of a specific action', async () => {
      const saved = await CorrectiveActionRepository.save(makeAction());
      await CorrectiveActionRepository.updateStatus(saved.id, 'in-progress');
      const all = await CorrectiveActionRepository.getAll();
      expect(all[0].status).toBe('in-progress');
    });

    it('sets closedAt when status becomes resolved', async () => {
      const saved = await CorrectiveActionRepository.save(makeAction());
      await CorrectiveActionRepository.updateStatus(saved.id, 'resolved');
      const all = await CorrectiveActionRepository.getAll();
      expect(all[0].closedAt).toBeTruthy();
    });

    it('does nothing when id is not found', async () => {
      await expect(CorrectiveActionRepository.updateStatus('nonexistent', 'resolved')).resolves.not.toThrow();
    });

    it('updates notes when provided', async () => {
      const saved = await CorrectiveActionRepository.save(makeAction());
      await CorrectiveActionRepository.updateStatus(saved.id, 'in-progress', 'Work started');
      const all = await CorrectiveActionRepository.getAll();
      expect(all[0].notes).toBe('Work started');
    });
  });

  describe('delete', () => {
    it('removes the action with the given id', async () => {
      const saved = await CorrectiveActionRepository.save(makeAction());
      await CorrectiveActionRepository.delete(saved.id);
      expect(await CorrectiveActionRepository.getAll()).toHaveLength(0);
    });

    it('leaves other actions intact', async () => {
      const a = await CorrectiveActionRepository.save(makeAction({ title: 'A' }));
      await CorrectiveActionRepository.save(makeAction({ title: 'B' }));
      await CorrectiveActionRepository.delete(a.id);
      const all = await CorrectiveActionRepository.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe('B');
    });
  });

  describe('deleteByInspection', () => {
    it('removes all actions for a given inspection', async () => {
      await CorrectiveActionRepository.save(makeAction({ inspectionId: 'ins-1' }));
      await CorrectiveActionRepository.save(makeAction({ inspectionId: 'ins-1' }));
      await CorrectiveActionRepository.save(makeAction({ inspectionId: 'ins-2' }));
      await CorrectiveActionRepository.deleteByInspection('ins-1');
      const all = await CorrectiveActionRepository.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].inspectionId).toBe('ins-2');
    });
  });
});
