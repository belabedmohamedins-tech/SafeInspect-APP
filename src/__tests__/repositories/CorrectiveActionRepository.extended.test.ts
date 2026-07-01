// src/__tests__/repositories/CorrectiveActionRepository.extended.test.ts
//
// Targets uncovered lines in CorrectiveActionRepository.ts:
//   line  84  — getOverdue() filter
//   lines 135–180 — getStats() aggregation + nearDeadlineCount
//   lines 181–210 — persistOverdueEscalation()

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';
import type { CorrectiveAction } from '../../types';

const { __resetStore } = AsyncStorage as any;
beforeEach(() => { __resetStore(); jest.clearAllMocks(); });

const tomorrow = (): string => {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10);
};
const yesterday = (): string => {
  const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10);
};
const inDays = (n: number): string => {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10);
};

const base = (overrides: Partial<CorrectiveAction> = {}): Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> => ({
  inspectionId: 'ins-1', inspectionItemId: 'item-1',
  facilityId: 'fac-1', facilityName: 'Test Facility',
  title: 'Fix Issue', description: 'desc',
  status: 'open', severity: 'medium',
  deadline: tomorrow(), assignedTo: '',
  ...overrides,
});

/**
 * Write raw fixture records directly to AsyncStorage using the exact same key
 * that CorrectiveActionRepository uses (StorageKeys.CORRECTIVE_ACTIONS = 'CORRECTIVE_ACTIONS').
 *
 * This bypasses save() and its internal readAll() call, which would
 * auto-escalate past-deadline items before writing them, leaving nothing
 * for persistOverdueEscalation() to promote.
 */
async function seedRaw(items: CorrectiveAction[]): Promise<void> {
  await AsyncStorage.setItem('CORRECTIVE_ACTIONS', JSON.stringify(items));
}

function makeRaw(overrides: Partial<CorrectiveAction> = {}): CorrectiveAction {
  const now = new Date().toISOString();
  return {
    id: `cap-test-${Math.random().toString(36).slice(2, 7)}`,
    inspectionId: 'ins-1', inspectionItemId: 'item-1',
    facilityId: 'fac-1', facilityName: 'Test Facility',
    title: 'Fix Issue', description: 'desc',
    status: 'open', severity: 'medium',
    deadline: tomorrow(), assignedTo: '',
    createdAt: now, updatedAt: now,
    ...overrides,
  };
}

// ─── getOverdue ───────────────────────────────────────────────────────────────

describe('getOverdue', () => {
  it('returns empty array when nothing is overdue', async () => {
    await CorrectiveActionRepository.save(base({ status: 'open' }));
    await CorrectiveActionRepository.save(base({ status: 'resolved' }));
    expect(await CorrectiveActionRepository.getOverdue()).toHaveLength(0);
  });

  it('returns items that were auto-escalated to overdue', async () => {
    await CorrectiveActionRepository.save(base({ status: 'open', deadline: yesterday() }));
    await CorrectiveActionRepository.save(base({ status: 'in-progress', deadline: yesterday() }));
    const result = await CorrectiveActionRepository.getOverdue();
    expect(result).toHaveLength(2);
    expect(result.every(a => a.status === 'overdue')).toBe(true);
  });

  it('does not include resolved items even if past deadline', async () => {
    await CorrectiveActionRepository.save(base({ status: 'resolved', deadline: yesterday() }));
    expect(await CorrectiveActionRepository.getOverdue()).toHaveLength(0);
  });

  it('returns [] when store is empty', async () => {
    expect(await CorrectiveActionRepository.getOverdue()).toEqual([]);
  });
});

// ─── getStats ─────────────────────────────────────────────────────────────────

describe('getStats', () => {
  it('returns all-zero stats on empty store', async () => {
    const stats = await CorrectiveActionRepository.getStats();
    expect(stats).toEqual({ open: 0, inProgress: 0, overdue: 0, resolved: 0, total: 0, nearDeadlineCount: 0 });
  });

  it('counts each status correctly', async () => {
    await CorrectiveActionRepository.save(base({ status: 'open' }));
    await CorrectiveActionRepository.save(base({ status: 'in-progress' }));
    await CorrectiveActionRepository.save(base({ status: 'resolved' }));
    // past-deadline open → auto-escalates to overdue inside getStats
    await CorrectiveActionRepository.save(base({ status: 'open', deadline: yesterday() }));

    const stats = await CorrectiveActionRepository.getStats();
    expect(stats.total).toBe(4);
    expect(stats.open).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.resolved).toBe(1);
    expect(stats.overdue).toBe(1);
  });

  it('counts nearDeadlineCount for items due within 7 days (default)', async () => {
    // deadline in 3 days → within window
    await CorrectiveActionRepository.save(base({ status: 'open', deadline: inDays(3) }));
    // deadline in 10 days → outside window
    await CorrectiveActionRepository.save(base({ status: 'open', deadline: inDays(10) }));
    // resolved item within window → must NOT count
    await CorrectiveActionRepository.save(base({ status: 'resolved', deadline: inDays(2) }));

    const stats = await CorrectiveActionRepository.getStats();
    expect(stats.nearDeadlineCount).toBe(1);
  });

  it('respects a custom nearDays argument', async () => {
    await CorrectiveActionRepository.save(base({ status: 'open', deadline: inDays(3) }));
    await CorrectiveActionRepository.save(base({ status: 'open', deadline: inDays(8) }));

    const narrow = await CorrectiveActionRepository.getStats(5);
    const wide   = await CorrectiveActionRepository.getStats(10);
    expect(narrow.nearDeadlineCount).toBe(1);
    expect(wide.nearDeadlineCount).toBe(2);
  });

  it('does not count overdue items in nearDeadlineCount', async () => {
    // deadline in the past → will be escalated to overdue; not near-deadline
    await CorrectiveActionRepository.save(base({ status: 'open', deadline: yesterday() }));
    const stats = await CorrectiveActionRepository.getStats();
    expect(stats.nearDeadlineCount).toBe(0);
  });
});

// ─── persistOverdueEscalation ─────────────────────────────────────────────────

describe('persistOverdueEscalation', () => {
  it('returns 0 when store is empty', async () => {
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });

  it('promotes overdue items and returns promoted count', async () => {
    // Use seedRaw (writes directly to 'CORRECTIVE_ACTIONS' key) so items reach
    // storage with status 'open'/'in-progress' intact — save() would call
    // readAll() which pre-escalates past-deadline items, leaving count = 0.
    await seedRaw([
      makeRaw({ status: 'open',        deadline: yesterday() }),
      makeRaw({ status: 'in-progress', deadline: yesterday() }),
      makeRaw({ status: 'open',        deadline: tomorrow()  }), // not overdue
    ]);

    const promoted = await CorrectiveActionRepository.persistOverdueEscalation();
    expect(promoted).toBe(2);
  });

  it('persists the promoted status so getAll() reflects it', async () => {
    await seedRaw([makeRaw({ status: 'open', deadline: yesterday() })]);
    await CorrectiveActionRepository.persistOverdueEscalation();
    const all = await CorrectiveActionRepository.getAll();
    expect(all[0].status).toBe('overdue');
  });

  it('does not change already-resolved or already-overdue items', async () => {
    await seedRaw([makeRaw({ status: 'resolved', deadline: yesterday() })]);
    const count = await CorrectiveActionRepository.persistOverdueEscalation();
    expect(count).toBe(0);
    expect((await CorrectiveActionRepository.getAll())[0].status).toBe('resolved');
  });

  it('returns 0 gracefully when AsyncStorage.getItem throws', async () => {
    jest.spyOn(require('@react-native-async-storage/async-storage'), 'getItem')
      .mockRejectedValueOnce(new Error('storage error'));
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });
});

// ─── getAll error path (returns [] on corrupt JSON) ──────────────────────────

describe('getAll — error path', () => {
  it('returns [] when stored JSON is corrupt', async () => {
    await (AsyncStorage as any).setItem('CORRECTIVE_ACTIONS', 'NOT_JSON');
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });
});
