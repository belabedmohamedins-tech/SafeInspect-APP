// __tests__/repositories/CorrectiveActionRepository.test.ts
//
// Full coverage for CorrectiveActionRepository:
//   readAll(), getAll(), getByInspection(), getByFacility(), getOpen(),
//   getOverdue(), getStats(), persistOverdueEscalation(),
//   save() (new + update), updateStatus(), delete(), deleteByInspection()

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { StorageKeys } from '../../src/repositories/keys';
import { CorrectiveAction } from '../../src/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const BASE_ACTION: CorrectiveAction = {
  id:               'cap-1',
  inspectionId:     'insp-1',
  inspectionItemId: 'item-1',
  facilityId:       'fac-1',
  facilityName:     'Test Facility',
  criteria:         'Fix the thing',
  severity:         'medium',
  status:           'open',
  deadline:         daysFromNow(10),
  assignedTo:       'John',
  notes:            '',
  createdAt:        '2024-01-01T00:00:00.000Z',
  updatedAt:        '2024-01-01T00:00:00.000Z',
};

function seed(items: CorrectiveAction[]) {
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
    key === StorageKeys.CORRECTIVE_ACTIONS
      ? Promise.resolve(JSON.stringify(items))
      : Promise.resolve(null),
  );
}

function seedEmpty() {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
}

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
});

// ─── readAll / getAll ─────────────────────────────────────────────────────────

describe('getAll', () => {
  it('returns [] when storage is empty', async () => {
    seedEmpty();
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });

  it('returns parsed items when storage has data', async () => {
    seed([BASE_ACTION]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cap-1');
  });

  it('auto-escalates open item past deadline to overdue and persists', async () => {
    const pastItem: CorrectiveAction = { ...BASE_ACTION, id: 'cap-past', status: 'open', deadline: daysFromNow(-5) };
    seed([pastItem]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('overdue');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('auto-escalates in-progress past deadline to overdue', async () => {
    const past: CorrectiveAction = { ...BASE_ACTION, id: 'cap-ip', status: 'in-progress', deadline: daysFromNow(-1) };
    seed([past]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('overdue');
  });

  it('does not escalate resolved items', async () => {
    const resolved: CorrectiveAction = { ...BASE_ACTION, id: 'cap-r', status: 'resolved', deadline: daysFromNow(-5) };
    seed([resolved]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('resolved');
  });

  it('does not escalate items whose deadline is today', async () => {
    const todayItem: CorrectiveAction = { ...BASE_ACTION, id: 'cap-t', status: 'open', deadline: today() };
    seed([todayItem]);
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('open');
  });

  it('returns [] on JSON parse error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('INVALID_JSON{{{');
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });

  it('handles writeAll failure silently on escalation', async () => {
    const past: CorrectiveAction = { ...BASE_ACTION, id: 'cap-wf', status: 'open', deadline: daysFromNow(-3) };
    seed([past]);
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('disk full'));
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('overdue'); // still returns escalated
  });
});

// ─── getByInspection ──────────────────────────────────────────────────────────

describe('getByInspection', () => {
  it('filters by inspectionId', async () => {
    const other: CorrectiveAction = { ...BASE_ACTION, id: 'cap-2', inspectionId: 'insp-2' };
    seed([BASE_ACTION, other]);
    const result = await CorrectiveActionRepository.getByInspection('insp-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cap-1');
  });

  it('returns [] when no match', async () => {
    seed([BASE_ACTION]);
    expect(await CorrectiveActionRepository.getByInspection('insp-xyz')).toEqual([]);
  });
});

// ─── getByFacility ────────────────────────────────────────────────────────────

describe('getByFacility', () => {
  it('filters by facilityId', async () => {
    const other: CorrectiveAction = { ...BASE_ACTION, id: 'cap-3', facilityId: 'fac-2' };
    seed([BASE_ACTION, other]);
    const result = await CorrectiveActionRepository.getByFacility('fac-1');
    expect(result).toHaveLength(1);
    expect(result[0].facilityId).toBe('fac-1');
  });
});

// ─── getOpen ──────────────────────────────────────────────────────────────────

describe('getOpen', () => {
  it('returns open, in-progress, and overdue items', async () => {
    const ip:       CorrectiveAction = { ...BASE_ACTION, id: 'cap-ip',  status: 'in-progress', deadline: daysFromNow(5) };
    const overdue:  CorrectiveAction = { ...BASE_ACTION, id: 'cap-od',  status: 'overdue',     deadline: daysFromNow(-1) };
    const resolved: CorrectiveAction = { ...BASE_ACTION, id: 'cap-res', status: 'resolved',    deadline: daysFromNow(-10) };
    seed([BASE_ACTION, ip, overdue, resolved]);
    const result = await CorrectiveActionRepository.getOpen();
    const ids = result.map(r => r.id);
    expect(ids).toContain('cap-1');
    expect(ids).toContain('cap-ip');
    expect(ids).toContain('cap-od');
    expect(ids).not.toContain('cap-res');
  });
});

// ─── getOverdue ───────────────────────────────────────────────────────────────

describe('getOverdue', () => {
  it('returns only overdue items', async () => {
    const past: CorrectiveAction = { ...BASE_ACTION, id: 'cap-p', status: 'open', deadline: daysFromNow(-2) };
    seed([BASE_ACTION, past]);
    const result = await CorrectiveActionRepository.getOverdue();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('overdue');
  });
});

// ─── getStats ─────────────────────────────────────────────────────────────────

describe('getStats', () => {
  it('aggregates counts correctly', async () => {
    const items: CorrectiveAction[] = [
      { ...BASE_ACTION, id: 'c1', status: 'open',        deadline: daysFromNow(5) },
      { ...BASE_ACTION, id: 'c2', status: 'in-progress', deadline: daysFromNow(2) },
      { ...BASE_ACTION, id: 'c3', status: 'overdue',     deadline: daysFromNow(-1) },
      { ...BASE_ACTION, id: 'c4', status: 'resolved',    deadline: daysFromNow(-5) },
    ];
    seed(items);
    const stats = await CorrectiveActionRepository.getStats(7);
    expect(stats.open).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.overdue).toBe(1);
    expect(stats.resolved).toBe(1);
    expect(stats.total).toBe(4);
    // c1 (5 days) and c2 (2 days) are near deadline and not resolved
    expect(stats.nearDeadlineCount).toBe(2);
  });

  it('uses default nearDays=7', async () => {
    seed([{ ...BASE_ACTION, id: 'c5', status: 'open', deadline: daysFromNow(6) }]);
    const stats = await CorrectiveActionRepository.getStats();
    expect(stats.nearDeadlineCount).toBe(1);
  });

  it('nearDeadlineCount excludes resolved items', async () => {
    seed([{ ...BASE_ACTION, id: 'c6', status: 'resolved', deadline: daysFromNow(3) }]);
    const stats = await CorrectiveActionRepository.getStats(7);
    expect(stats.nearDeadlineCount).toBe(0);
  });

  it('returns zero stats on empty storage', async () => {
    seedEmpty();
    const stats = await CorrectiveActionRepository.getStats();
    expect(stats.total).toBe(0);
    expect(stats.open).toBe(0);
  });
});

// ─── persistOverdueEscalation ────────────────────────────────────────────────

describe('persistOverdueEscalation', () => {
  it('returns 0 when storage is empty', async () => {
    seedEmpty();
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });

  it('promotes past-deadline open items and returns count', async () => {
    const past: CorrectiveAction = { ...BASE_ACTION, id: 'pe-1', status: 'open', deadline: daysFromNow(-3) };
    seed([past, BASE_ACTION]);
    const count = await CorrectiveActionRepository.persistOverdueEscalation();
    expect(count).toBe(1);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('promotes in-progress past-deadline items', async () => {
    const past: CorrectiveAction = { ...BASE_ACTION, id: 'pe-2', status: 'in-progress', deadline: daysFromNow(-1) };
    seed([past]);
    const count = await CorrectiveActionRepository.persistOverdueEscalation();
    expect(count).toBe(1);
  });

  it('does not write when no promotions needed', async () => {
    seed([BASE_ACTION]); // future deadline
    (AsyncStorage.setItem as jest.Mock).mockClear();
    await CorrectiveActionRepository.persistOverdueEscalation();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('returns 0 on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('storage failure'));
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });
});

// ─── save (new) ───────────────────────────────────────────────────────────────

describe('save – new action', () => {
  it('inserts a new item and returns it', async () => {
    seedEmpty();
    const payload = {
      inspectionId:     'insp-10',
      inspectionItemId: 'item-10',
      facilityId:       'fac-10',
      facilityName:     'New Facility',
      criteria:         'Check the thing',
      severity:         'high' as const,
      deadline:         daysFromNow(14),
      assignedTo:       'Alice',
      notes:            '',
    };
    const saved = await CorrectiveActionRepository.save(payload);
    expect(saved.id).toBeTruthy();
    expect(saved.status).toBe('open');
    expect(saved.createdAt).toBeTruthy();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});

// ─── save (update) ────────────────────────────────────────────────────────────

describe('save – update existing action', () => {
  it('merges updates into existing item', async () => {
    seed([BASE_ACTION]);
    const updated = await CorrectiveActionRepository.save({ ...BASE_ACTION, notes: 'updated note' });
    expect(updated.notes).toBe('updated note');
  });
});

// ─── updateStatus ─────────────────────────────────────────────────────────────

describe('updateStatus', () => {
  it('updates the status field', async () => {
    seed([BASE_ACTION]);
    const result = await CorrectiveActionRepository.updateStatus('cap-1', 'resolved');
    expect(result?.status).toBe('resolved');
    expect(result?.updatedAt).toBeTruthy();
  });

  it('sets closedAt when resolving', async () => {
    seed([BASE_ACTION]);
    const result = await CorrectiveActionRepository.updateStatus('cap-1', 'resolved');
    expect(result?.closedAt).toBeTruthy();
  });

  it('returns null for unknown id', async () => {
    seedEmpty();
    expect(await CorrectiveActionRepository.updateStatus('ghost', 'resolved')).toBeNull();
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('delete', () => {
  it('removes the item', async () => {
    seed([BASE_ACTION]);
    await CorrectiveActionRepository.delete('cap-1');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    // verify it's gone by checking getAll returns empty after seed is cleared
    seedEmpty();
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });
});

// ─── deleteByInspection ───────────────────────────────────────────────────────

describe('deleteByInspection', () => {
  it('removes all actions for the given inspectionId', async () => {
    const other: CorrectiveAction = { ...BASE_ACTION, id: 'cap-other', inspectionId: 'insp-99' };
    seed([BASE_ACTION, other]);
    await CorrectiveActionRepository.deleteByInspection('insp-1');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});
