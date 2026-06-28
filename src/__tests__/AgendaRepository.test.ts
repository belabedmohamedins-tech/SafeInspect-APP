// src/__tests__/AgendaRepository.test.ts

// ─── Mocks ───────────────────────────────────────────────────────────────────

// NOTE: @react-native-async-storage/async-storage is intentionally NOT mocked
// inline here. jest.config.js moduleNameMapper (Layer 2) routes every import
// to __mocks__/@react-native-async-storage/async-storage.js — a stateful
// in-memory store with .getItem → null, .setItem, .clear, and .__resetStore.
// Adding an inline factory would override that stub and remove .__resetStore,
// breaking the beforeEach store-wipe below.

const mockSchedule = jest.fn();
const mockCancel   = jest.fn();

jest.mock('../services/NotificationService', () => ({
  scheduleForAgendaItem: mockSchedule,
  cancelForAgendaItem:   mockCancel,
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { AgendaItem } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<AgendaItem> = {}): AgendaItem {
  return {
    id:           'agenda-1',
    facilityName: 'مخبزة الصدى',
    facilityId:   'fac-1',
    date:         '2026-07-15T09:00:00.000Z',
    notes:        '',
    status:       'pending',
    completed:    false,
    ...overrides,
  };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(async () => {
  jest.clearAllMocks();
  mockSchedule.mockResolvedValue(undefined);
  mockCancel.mockResolvedValue(undefined);
  // Use __resetStore (not .clear()) to wipe the in-memory store without
  // incrementing the jest.fn() call counter on AsyncStorage.clear.
  (AsyncStorage as any).__resetStore();
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('AgendaRepository.getAll', () => {
  it('returns empty array when storage is empty', async () => {
    const items = await AgendaRepository.getAll();
    expect(items).toEqual([]);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('AgendaRepository.getById', () => {
  it('returns null when item does not exist', async () => {
    const item = await AgendaRepository.getById('missing-id');
    expect(item).toBeNull();
  });

  it('returns the item when it exists', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1' }));
    const found = await AgendaRepository.getById('a1');
    expect(found?.id).toBe('a1');
  });
});

// ─── save (insert) ────────────────────────────────────────────────────────────

describe('AgendaRepository.save — insert', () => {
  it('persists a new item', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('a1');
  });

  it('calls scheduleForAgendaItem for a pending item', async () => {
    const item = makeItem({ id: 'a1', status: 'pending' });
    await AgendaRepository.save(item);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith({
      id:           item.id,
      facilityName: item.facilityName,
      date:         item.date,
      notes:        item.notes,
    });
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
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});

// ─── save (update) ────────────────────────────────────────────────────────────

describe('AgendaRepository.save — update', () => {
  it('updates an existing item in place', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1', notes: 'original' }));
    await AgendaRepository.save(makeItem({ id: 'a1', notes: 'updated' }));
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
  it('removes the item from storage', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1' }));
    await AgendaRepository.delete('a1');
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(0);
  });

  it('calls cancelForAgendaItem with the deleted id', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1' }));
    jest.clearAllMocks();
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
  it('marks item as completed and links the inspection id', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1', status: 'pending' }));
    await AgendaRepository.updateInspectionLink('a1', 'insp-99');
    const item = await AgendaRepository.getById('a1');
    expect(item?.status).toBe('completed');
    expect(item?.completed).toBe(true);
    expect(item?.inspectionId).toBe('insp-99');
  });

  it('cancels the notification after linking', async () => {
    await AgendaRepository.save(makeItem({ id: 'a1', status: 'pending' }));
    jest.clearAllMocks();
    await AgendaRepository.updateInspectionLink('a1', 'insp-99');
    expect(mockCancel).toHaveBeenCalledWith('a1');
  });

  it('is a no-op when the id does not exist', async () => {
    await expect(
      AgendaRepository.updateInspectionLink('ghost-id', 'insp-99'),
    ).resolves.not.toThrow();
  });
});
