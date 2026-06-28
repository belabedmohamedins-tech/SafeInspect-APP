// src/__tests__/repositories/AgendaRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper → __mocks__/@react-native-async-storage/
// async-storage.js. Do NOT add an inline jest.mock() factory for it here.
// Call AsyncStorage.__resetStore() in beforeEach to wipe the in-memory store.

// ─── Mocks ────────────────────────────────────────────────────────────────────
// IMPORTANT: jest.mock() is hoisted by Babel before any const/let declarations.
// Stubs MUST be created with jest.fn() inside the factory.
// Retrieve typed references via jest.mocked() after imports.

jest.mock('../services/NotificationService', () => ({
  scheduleForAgendaItem: jest.fn(),
  cancelForAgendaItem:   jest.fn(),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { StorageKeys }      from '../repositories/keys';
import * as NotificationService from '../services/NotificationService';
import { AgendaItem } from '../types';

const mockSchedule = jest.mocked(NotificationService.scheduleForAgendaItem);
const mockCancel   = jest.mocked(NotificationService.cancelForAgendaItem);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<AgendaItem> & { id: string }): AgendaItem {
  return {
    facilityId:   'FAC-01',
    facilityName: 'Test Facility',
    date:         '2026-03-01T09:00:00.000Z',
    notes:        '',
    completed:    false,
    status:       'pending',
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockSchedule.mockResolvedValue(undefined);
  mockCancel.mockResolvedValue(undefined);
  (AsyncStorage as any).__resetStore();
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('AgendaRepository.getAll', () => {
  it('returns empty array when storage is empty', async () => {
    expect(await AgendaRepository.getAll()).toEqual([]);
  });

  it('returns all stored agenda items', async () => {
    const data = [makeItem({ id: '1' }), makeItem({ id: '2' })];
    await (AsyncStorage as any).setItem(StorageKeys.AGENDA, JSON.stringify(data));
    expect(await AgendaRepository.getAll()).toHaveLength(2);
  });

  it('returns empty array on corrupt JSON (graceful)', async () => {
    await (AsyncStorage as any).setItem(StorageKeys.AGENDA, 'BAD_JSON');
    expect(await AgendaRepository.getAll()).toEqual([]);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('AgendaRepository.getById', () => {
  it('returns the matching item', async () => {
    await (AsyncStorage as any).setItem(StorageKeys.AGENDA, JSON.stringify([makeItem({ id: 'abc' })]));
    expect((await AgendaRepository.getById('abc'))?.id).toBe('abc');
  });

  it('returns null for an unknown id', async () => {
    expect(await AgendaRepository.getById('nope')).toBeNull();
  });
});

// ─── save ─────────────────────────────────────────────────────────────────────

describe('AgendaRepository.save — insert', () => {
  it('persists a new item', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1' }));
    expect(await AgendaRepository.getAll()).toHaveLength(1);
  });

  it('calls scheduleForAgendaItem for a pending item', async () => {
    const item = makeItem({ id: 'a1', status: 'pending' });
    await AgendaRepository.save(item);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('calls cancelForAgendaItem for a completed item', async () => {
    await AgendaRepository.save(makeItem({ id: 'a2', status: 'completed' }));
    expect(mockCancel).toHaveBeenCalledWith('a2');
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('calls cancelForAgendaItem for a cancelled item', async () => {
    await AgendaRepository.save(makeItem({ id: 'a3', status: 'cancelled' }));
    expect(mockCancel).toHaveBeenCalledWith('a3');
  });
});

describe('AgendaRepository.save — update', () => {
  it('updates an existing item in-place', async () => {
    await AgendaRepository.save(makeItem({ id: 'x', notes: 'old' }));
    await AgendaRepository.save(makeItem({ id: 'x', notes: 'updated' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].notes).toBe('updated');
  });

  it('reschedules notification when a pending item is updated', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1', status: 'pending' }));
    await AgendaRepository.save(makeItem({ id: 'a1', status: 'pending', notes: 'زيارة تفتيش' }));
    expect(mockSchedule).toHaveBeenCalledTimes(2);
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('AgendaRepository.delete', () => {
  it('removes the item with the given id', async () => {
    const data = [makeItem({ id: '1' }), makeItem({ id: '2' })];
    await (AsyncStorage as any).setItem(StorageKeys.AGENDA, JSON.stringify(data));
    await AgendaRepository.delete('1');
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('calls cancelForAgendaItem with the deleted id', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1' }));
    jest.clearAllMocks();
    mockCancel.mockResolvedValue(undefined);
    await AgendaRepository.delete('a1');
    expect(mockCancel).toHaveBeenCalledWith('a1');
  });

  it('is a no-op (no error) when item does not exist', async () => {
    await expect(AgendaRepository.delete('ghost-id')).resolves.not.toThrow();
    expect(mockCancel).toHaveBeenCalledWith('ghost-id');
  });
});

// ─── updateInspectionLink ─────────────────────────────────────────────────────

describe('AgendaRepository.updateInspectionLink', () => {
  it('links an inspection id and marks the item completed', async () => {
    await AgendaRepository.save(makeItem({ id: 'agenda-1', completed: false, status: 'pending' }));
    await AgendaRepository.updateInspectionLink('agenda-1', 'inspection-99');
    const updated = await AgendaRepository.getById('agenda-1');
    expect(updated?.inspectionId).toBe('inspection-99');
    expect(updated?.completed).toBe(true);
    expect(updated?.status).toBe('completed');
  });

  it('cancels the notification after linking', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1', status: 'pending' }));
    jest.clearAllMocks();
    mockCancel.mockResolvedValue(undefined);
    await AgendaRepository.updateInspectionLink('a1', 'insp-99');
    expect(mockCancel).toHaveBeenCalledWith('a1');
  });

  it('is a no-op when the id does not exist', async () => {
    await expect(
      AgendaRepository.updateInspectionLink('ghost', 'inspection-1'),
    ).resolves.toBeUndefined();
  });

  it('does not modify other items', async () => {
    const data = [makeItem({ id: 'a' }), makeItem({ id: 'b' })];
    await (AsyncStorage as any).setItem(StorageKeys.AGENDA, JSON.stringify(data));
    await AgendaRepository.updateInspectionLink('a', 'ins-001');
    const b = await AgendaRepository.getById('b');
    expect(b?.inspectionId).toBeUndefined();
    expect(b?.completed).toBe(false);
  });
});
