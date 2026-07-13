// src/__tests__/CorrectiveActionRepository.test.ts
// Full coverage for CorrectiveActionRepository (lines 7–212).
// Uses AsyncStorage in-memory mock (L2). No external dependencies.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { StorageKeys } from '../repositories/keys';
import { CorrectiveAction } from '../types';

const { __resetStore: resetStore } = AsyncStorage as any;

// ─── helpers ─────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function makeCA(overrides: Partial<CorrectiveAction> = {}): CorrectiveAction {
  return {
    id:           'cap-1',
    inspectionId: 'insp-1',
    facilityName: 'Facility A',
    criteria:     'Rule 1',
    severity:     'high',
    status:       'open',
    deadline:     daysFromNow(5),
    assignedTo:   'Inspector',
    notes:        '',
    createdAt:    new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
    ...overrides,
  };
}

async function seed(items: CorrectiveAction[]): Promise<void> {
  await AsyncStorage.setItem(
    StorageKeys.CORRECTIVE_ACTIONS,
    JSON.stringify(items),
  );
}

beforeEach(() => resetStore());

// ─── getAll ──────────────────────────────────────────────────────────────────

describe('getAll', () => {
  it('returns [] when storage is empty', async () => {
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });

  it('returns stored items', async () => {
    await seed([makeCA()]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result).toHaveLength(1);
  });

  it('auto-escalates open past-deadline items to overdue', async () => {
    await seed([makeCA({ status: 'open', deadline: daysFromNow(-1) })]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('overdue');
  });

  it('auto-escalates in-progress past-deadline items to overdue', async () => {
    await seed([makeCA({ status: 'in-progress', deadline: daysFromNow(-2) })]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('overdue');
  });

  it('does NOT escalate already-overdue items', async () => {
    const item = makeCA({ status: 'overdue', deadline: daysFromNow(-1) });
    await seed([item]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('overdue');
  });

  it('does NOT escalate resolved items', async () => {
    await seed([makeCA({ status: 'resolved', deadline: daysFromNow(-3) })]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('resolved');
  });

  it('returns [] when AsyncStorage throws', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('io'));
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });

  it('returns [] when stored value is not valid JSON', async () => {
    await AsyncStorage.setItem(StorageKeys.CORRECTIVE_ACTIONS, 'not-json');
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });
});

// ─── getByInspection ─────────────────────────────────────────────────────────

describe('getByInspection', () => {
  it('returns only items matching inspectionId', async () => {
    await seed([
      makeCA({ id: 'cap-1', inspectionId: 'insp-A' }),
      makeCA({ id: 'cap-2', inspectionId: 'insp-B' }),
    ]);
    const result = await CorrectiveActionRepository.getByInspection('insp-A');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cap-1');
  });

  it('returns [] when no match', async () => {
    await seed([makeCA({ inspectionId: 'insp-A' })]);
    expect(await CorrectiveActionRepository.getByInspection('insp-Z')).toEqual([]);
  });
});

// ─── getByFacility ───────────────────────────────────────────────────────────

describe('getByFacility', () => {
  it('returns only items matching facilityId', async () => {
    await seed([
      makeCA({ id: 'cap-1', facilityId: 'fac-1' } as any),
      makeCA({ id: 'cap-2', facilityId: 'fac-2' } as any),
    ]);
    const result = await CorrectiveActionRepository.getByFacility('fac-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cap-1');
  });

  it('returns [] when no match', async () => {
    await seed([makeCA({ facilityId: 'fac-1' } as any)]);
    expect(await CorrectiveActionRepository.getByFacility('fac-X')).toEqual([]);
  });
});

// ─── getOpen ─────────────────────────────────────────────────────────────────

describe('getOpen', () => {
  it('returns open, in-progress, and overdue items', async () => {
    await seed([
      makeCA({ id: '1', status: 'open' }),
      makeCA({ id: '2', status: 'in-progress' }),
      makeCA({ id: '3', status: 'overdue', deadline: today() }),
      makeCA({ id: '4', status: 'resolved' }),
    ]);
    const result = await CorrectiveActionRepository.getOpen();
    expect(result.map(r => r.id).sort()).toEqual(['1', '2', '3'].sort());
  });

  it('returns [] when all items are resolved', async () => {
    await seed([makeCA({ status: 'resolved' })]);
    expect(await CorrectiveActionRepository.getOpen()).toEqual([]);
  });
});

// ─── getOverdue ──────────────────────────────────────────────────────────────

describe('getOverdue', () => {
  it('returns only overdue items', async () => {
    await seed([
      makeCA({ id: '1', status: 'overdue', deadline: today() }),
      makeCA({ id: '2', status: 'open' }),
    ]);
    const result = await CorrectiveActionRepository.getOverdue();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns [] when no overdue items', async () => {
    await seed([makeCA({ status: 'open' })]);
    expect(await CorrectiveActionRepository.getOverdue()).toEqual([]);
  });
});

// ─── getStats ────────────────────────────────────────────────────────────────

describe('getStats', () => {
  it('returns zeroed stats when storage is empty', async () => {
    const s = await CorrectiveActionRepository.getStats();
    expect(s).toEqual({ open: 0, inProgress: 0, overdue: 0, resolved: 0, total: 0, nearDeadlineCount: 0 });
  });

  it('counts each status correctly', async () => {
    await seed([
      makeCA({ id: '1', status: 'open',        deadline: daysFromNow(10) }),
      makeCA({ id: '2', status: 'in-progress', deadline: daysFromNow(10) }),
      makeCA({ id: '3', status: 'overdue',     deadline: today() }),
      makeCA({ id: '4', status: 'resolved',    deadline: daysFromNow(10) }),
    ]);
    const s = await CorrectiveActionRepository.getStats();
    expect(s.open).toBe(1);
    expect(s.inProgress).toBe(1);
    expect(s.overdue).toBe(1);
    expect(s.resolved).toBe(1);
    expect(s.total).toBe(4);
  });

  it('counts nearDeadlineCount for items due within nearDays', async () => {
    await seed([
      makeCA({ id: '1', status: 'open', deadline: daysFromNow(3) }),
      makeCA({ id: '2', status: 'open', deadline: daysFromNow(10) }),
    ]);
    const s = await CorrectiveActionRepository.getStats(7);
    expect(s.nearDeadlineCount).toBe(1);
  });

  it('does NOT count resolved items in nearDeadlineCount', async () => {
    await seed([makeCA({ status: 'resolved', deadline: daysFromNow(2) })]);
    const s = await CorrectiveActionRepository.getStats(7);
    expect(s.nearDeadlineCount).toBe(0);
  });

  it('does NOT count past-deadline items in nearDeadlineCount', async () => {
    await seed([makeCA({ status: 'overdue', deadline: daysFromNow(-1) })]);
    const s = await CorrectiveActionRepository.getStats(7);
    expect(s.nearDeadlineCount).toBe(0);
  });

  it('respects custom nearDays parameter', async () => {
    await seed([
      makeCA({ id: '1', status: 'open', deadline: daysFromNow(2) }),
      makeCA({ id: '2', status: 'open', deadline: daysFromNow(5) }),
    ]);
    expect((await CorrectiveActionRepository.getStats(3)).nearDeadlineCount).toBe(1);
    expect((await CorrectiveActionRepository.getStats(10)).nearDeadlineCount).toBe(2);
  });
});

// ─── persistOverdueEscalation ────────────────────────────────────────────────

describe('persistOverdueEscalation', () => {
  it('returns 0 when storage is empty', async () => {
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });

  it('returns 0 when no items need escalation', async () => {
    await seed([makeCA({ status: 'open', deadline: daysFromNow(5) })]);
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });

  it('escalates open past-deadline items and returns count', async () => {
    await seed([
      makeCA({ id: '1', status: 'open',        deadline: daysFromNow(-1) }),
      makeCA({ id: '2', status: 'in-progress', deadline: daysFromNow(-2) }),
      makeCA({ id: '3', status: 'open',        deadline: daysFromNow(5) }),
    ]);
    const count = await CorrectiveActionRepository.persistOverdueEscalation();
    expect(count).toBe(2);

    const stored = await CorrectiveActionRepository.getAll();
    expect(stored.find(a => a.id === '1')!.status).toBe('overdue');
    expect(stored.find(a => a.id === '2')!.status).toBe('overdue');
    expect(stored.find(a => a.id === '3')!.status).toBe('open');
  });

  it('does not escalate already-overdue or resolved items', async () => {
    await seed([
      makeCA({ id: '1', status: 'overdue',  deadline: daysFromNow(-1) }),
      makeCA({ id: '2', status: 'resolved', deadline: daysFromNow(-1) }),
    ]);
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });
});

// ─── save ────────────────────────────────────────────────────────────────────

describe('save', () => {
  it('inserts a new item when id does not exist', async () => {
    const saved = await CorrectiveActionRepository.save(makeCA({ id: 'cap-new' }));
    expect(saved.id).toBe('cap-new');
    const all = await CorrectiveActionRepository.getAll();
    expect(all).toHaveLength(1);
  });

  it('updates an existing item when id already exists', async () => {
    await seed([makeCA({ id: 'cap-1', notes: 'old' })]);
    await CorrectiveActionRepository.save(makeCA({ id: 'cap-1', notes: 'updated' }));
    const all = await CorrectiveActionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].notes).toBe('updated');
  });

  it('preserves provided createdAt', async () => {
    const createdAt = '2025-01-01T00:00:00.000Z';
    const saved = await CorrectiveActionRepository.save(makeCA({ id: 'cap-x', createdAt }));
    expect(saved.createdAt).toBe(createdAt);
  });

  it('sets updatedAt to current time', async () => {
    const before = new Date().toISOString();
    const saved  = await CorrectiveActionRepository.save(makeCA({ id: 'cap-y' }));
    expect(saved.updatedAt >= before).toBe(true);
  });
});

// ─── updateStatus ────────────────────────────────────────────────────────────

describe('updateStatus', () => {
  it('updates status of an existing item', async () => {
    await seed([makeCA({ id: 'cap-1', status: 'open' })]);
    await CorrectiveActionRepository.updateStatus('cap-1', 'resolved');
    const all = await CorrectiveActionRepository.getAll();
    expect(all[0].status).toBe('resolved');
  });

  it('sets closedAt when status becomes resolved', async () => {
    await seed([makeCA({ id: 'cap-1', status: 'open' })]);
    const before = new Date().toISOString();
    await CorrectiveActionRepository.updateStatus('cap-1', 'resolved');
    const all = await CorrectiveActionRepository.getAll();
    expect(all[0].closedAt).toBeDefined();
    expect(all[0].closedAt! >= before).toBe(true);
  });

  it('does not set closedAt when status is not resolved', async () => {
    await seed([makeCA({ id: 'cap-1', status: 'open' })]);
    await CorrectiveActionRepository.updateStatus('cap-1', 'in-progress');
    const all = await CorrectiveActionRepository.getAll();
    expect(all[0].closedAt).toBeUndefined();
  });

  it('does nothing when id is not found', async () => {
    await seed([makeCA({ id: 'cap-1' })]);
    await CorrectiveActionRepository.updateStatus('cap-xxx', 'resolved');
    const all = await CorrectiveActionRepository.getAll();
    expect(all[0].status).toBe('open');
  });

  it('updates notes when provided', async () => {
    await seed([makeCA({ id: 'cap-1', notes: '' })]);
    await CorrectiveActionRepository.updateStatus('cap-1', 'in-progress', 'new note');
    const all = await CorrectiveActionRepository.getAll();
    expect(all[0].notes).toBe('new note');
  });
});

// ─── delete ──────────────────────────────────────────────────────────────────

describe('delete', () => {
  it('removes the item with the given id', async () => {
    await seed([makeCA({ id: 'cap-1' }), makeCA({ id: 'cap-2' })]);
    await CorrectiveActionRepository.delete('cap-1');
    const all = await CorrectiveActionRepository.getAll();
    expect(all.map(a => a.id)).toEqual(['cap-2']);
  });

  it('does nothing when id is not found', async () => {
    await seed([makeCA({ id: 'cap-1' })]);
    await CorrectiveActionRepository.delete('cap-xxx');
    expect(await CorrectiveActionRepository.getAll()).toHaveLength(1);
  });
});

// ─── deleteByInspection ──────────────────────────────────────────────────────

describe('deleteByInspection', () => {
  it('removes all items for the given inspectionId', async () => {
    await seed([
      makeCA({ id: 'cap-1', inspectionId: 'insp-A' }),
      makeCA({ id: 'cap-2', inspectionId: 'insp-B' }),
    ]);
    await CorrectiveActionRepository.deleteByInspection('insp-A');
    const all = await CorrectiveActionRepository.getAll();
    expect(all.map(a => a.id)).toEqual(['cap-2']);
  });

  it('does nothing when inspectionId has no matching items', async () => {
    await seed([makeCA({ inspectionId: 'insp-A' })]);
    await CorrectiveActionRepository.deleteByInspection('insp-Z');
    expect(await CorrectiveActionRepository.getAll()).toHaveLength(1);
  });
});
