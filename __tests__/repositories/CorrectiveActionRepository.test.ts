/**
 * __tests__/repositories/CorrectiveActionRepository.test.ts
 * Contract tests for CorrectiveActionRepository — SQLite contract (rewritten).
 */
import CorrectiveActionRepository from '../../src/repositories/CorrectiveActionRepository';
import type { CorrectiveAction } from '../../src/types';

const SQLite = require('expo-sqlite');

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const BASE_ACTION: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> = {
  inspectionId: 'insp-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  inspectorId: 'insp-user',
  inspectorName: 'Ahmed',
  criterionId: 'crit-1',
  criterionLabel: 'Test Criterion',
  description: 'Fix this',
  status: 'open',
  deadline: daysFromNow(30),
  severity: 'major',
};

beforeEach(() => {
  SQLite.__resetAll();
});

describe('getAll', () => {
  it('returns empty array when no data', async () => {
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });

  it('returns parsed items when storage has data', async () => {
    await CorrectiveActionRepository.save(BASE_ACTION);
    const result = await CorrectiveActionRepository.getAll();
    expect(result).toHaveLength(1);
    expect(result[0].inspectionId).toBe('insp-1');
  });

  it('auto-escalates open item past deadline to overdue', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, deadline: daysFromNow(-1), status: 'open' });
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('overdue');
  });

  it('auto-escalates in-progress past deadline to overdue', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, deadline: daysFromNow(-1), status: 'in-progress' });
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('overdue');
  });

  it('does not escalate resolved items', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, deadline: daysFromNow(-1), status: 'resolved' });
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('resolved');
  });

  it('does not escalate items whose deadline is today', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, deadline: daysFromNow(0), status: 'open' });
    const result = await CorrectiveActionRepository.getAll();
    expect(result[0].status).toBe('open');
  });
});

describe('getByInspection', () => {
  it('filters by inspectionId', async () => {
    await CorrectiveActionRepository.save(BASE_ACTION);
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'insp-2' });
    const result = await CorrectiveActionRepository.getByInspection('insp-1');
    expect(result).toHaveLength(1);
    expect(result[0].inspectionId).toBe('insp-1');
  });
});

describe('getByFacility', () => {
  it('filters by facilityId', async () => {
    await CorrectiveActionRepository.save(BASE_ACTION);
    await CorrectiveActionRepository.save({ ...BASE_ACTION, facilityId: 'fac-2' });
    const result = await CorrectiveActionRepository.getByFacility('fac-1');
    expect(result).toHaveLength(1);
    expect(result[0].facilityId).toBe('fac-1');
  });
});

describe('getOpen', () => {
  it('returns open, in-progress, and overdue items', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, status: 'open' });
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'insp-ip', status: 'in-progress' });
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'insp-od', deadline: daysFromNow(-1), status: 'open' });
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'insp-res', status: 'resolved' });
    const result = await CorrectiveActionRepository.getOpen();
    const ids = result.map(r => r.inspectionId);
    expect(ids).toContain('insp-1');
    expect(ids).toContain('insp-ip');
    expect(ids).not.toContain('insp-res');
  });
});

describe('getOverdue', () => {
  it('returns only overdue items', async () => {
    await CorrectiveActionRepository.save(BASE_ACTION);
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'past', deadline: daysFromNow(-1), status: 'open' });
    const result = await CorrectiveActionRepository.getOverdue();
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.every(r => r.status === 'overdue')).toBe(true);
  });
});

describe('getStats', () => {
  it('aggregates counts correctly', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'i1', status: 'open' });
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'i2', status: 'in-progress' });
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'i3', deadline: daysFromNow(-1), status: 'open' });
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'i4', status: 'resolved' });
    const stats = await CorrectiveActionRepository.getStats(7);
    expect(stats.open).toBeGreaterThanOrEqual(1);
    expect(stats.inProgress).toBeGreaterThanOrEqual(1);
    expect(stats.overdue).toBeGreaterThanOrEqual(1);
    expect(stats.resolved).toBeGreaterThanOrEqual(1);
  });

  it('nearDeadlineCount counts items within nearDays', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'nd', deadline: daysFromNow(6), status: 'open' });
    const stats = await CorrectiveActionRepository.getStats(7);
    expect(stats.nearDeadlineCount).toBeGreaterThanOrEqual(1);
  });
});

describe('persistOverdueEscalation', () => {
  it('promotes past-deadline open items and returns count', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'pe1', deadline: daysFromNow(-1), status: 'open' });
    await CorrectiveActionRepository.save(BASE_ACTION);
    const count = await CorrectiveActionRepository.persistOverdueEscalation();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('promotes in-progress past-deadline items', async () => {
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'pe2', deadline: daysFromNow(-1), status: 'in-progress' });
    const count = await CorrectiveActionRepository.persistOverdueEscalation();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('does not write when no promotions needed', async () => {
    await CorrectiveActionRepository.save(BASE_ACTION);
    const count = await CorrectiveActionRepository.persistOverdueEscalation();
    expect(count).toBe(0);
  });
});

describe('save – new action', () => {
  it('inserts a new item and returns it', async () => {
    const saved = await CorrectiveActionRepository.save(BASE_ACTION);
    expect(saved.id).toBeTruthy();
    expect(saved.status).toBe('open');
    expect(saved.createdAt).toBeTruthy();
  });
});

describe('updateStatus', () => {
  it('updates the status field', async () => {
    const saved = await CorrectiveActionRepository.save(BASE_ACTION);
    await CorrectiveActionRepository.updateStatus(saved.id, 'resolved');
    const all = await CorrectiveActionRepository.getAll();
    const item = all.find(a => a.id === saved.id);
    expect(item?.status).toBe('resolved');
    expect(item?.updatedAt).toBeTruthy();
  });

  it('sets closedAt when resolving', async () => {
    const saved = await CorrectiveActionRepository.save(BASE_ACTION);
    await CorrectiveActionRepository.updateStatus(saved.id, 'resolved');
    const all = await CorrectiveActionRepository.getAll();
    const item = all.find(a => a.id === saved.id);
    expect(item?.closedAt).toBeTruthy();
  });
});

describe('delete', () => {
  it('removes the item', async () => {
    const saved = await CorrectiveActionRepository.save(BASE_ACTION);
    await CorrectiveActionRepository.delete(saved.id);
    expect(await CorrectiveActionRepository.getAll()).toHaveLength(0);
  });
});

describe('deleteByInspection', () => {
  it('removes all actions for the given inspectionId', async () => {
    await CorrectiveActionRepository.save(BASE_ACTION);
    await CorrectiveActionRepository.save({ ...BASE_ACTION, inspectionId: 'other' });
    await CorrectiveActionRepository.deleteByInspection('insp-1');
    const all = await CorrectiveActionRepository.getAll();
    expect(all.every(a => a.inspectionId !== 'insp-1')).toBe(true);
  });
});
