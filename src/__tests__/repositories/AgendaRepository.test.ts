// src/__tests__/repositories/AgendaRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper → __mocks__/@react-native-async-storage/
// async-storage.js. Do NOT add an inline jest.mock() factory for it here.
// Call AsyncStorage.__resetStore() in beforeEach to wipe the in-memory store.

jest.mock('../../services/NotificationService', () => ({
  scheduleForAgendaItem: jest.fn(),
  cancelForAgendaItem:   jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaRepository } from '../../repositories/AgendaRepository';
import { StorageKeys }      from '../../repositories/keys';
import * as NotificationService from '../../services/NotificationService';
import { AgendaItem } from '../../types';

const mockSchedule = jest.mocked(NotificationService.scheduleForAgendaItem);
const mockCancel   = jest.mocked(NotificationService.cancelForAgendaItem);

function makeItem(overrides: Partial<AgendaItem> = {}): AgendaItem {
  return {
    id:           'item-1',
    facilityId:   'fac-1',
    facilityName: 'Test Facility',
    date:         '2025-01-15',
    time:         '09:00',
    notes:        '',
    completed:    false,
    status:       'pending',
    ...overrides,
  } as AgendaItem;
}

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('AgendaRepository.getAll', () => {
  it('returns [] when storage is empty', async () => {
    const items = await AgendaRepository.getAll();
    expect(items).toEqual([]);
  });

  it('returns stored items', async () => {
    const item = makeItem();
    await AsyncStorage.setItem(StorageKeys.AGENDA, JSON.stringify([item]));
    const items = await AgendaRepository.getAll();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('item-1');
  });

  it('returns [] when stored JSON is corrupt (parse-error branch)', async () => {
    // Directly inject malformed JSON to exercise the catch branch in readAll()
    await AsyncStorage.setItem(StorageKeys.AGENDA, 'NOT_VALID_JSON{{{');
    const items = await AgendaRepository.getAll();
    expect(items).toEqual([]);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('AgendaRepository.getById', () => {
  it('returns the matching item', async () => {
    await AgendaRepository.save(makeItem({ id: 'item-found' }));
    const item = await AgendaRepository.getById('item-found');
    expect(item?.id).toBe('item-found');
  });

  it('returns null when the id does not exist', async () => {
    await AgendaRepository.save(makeItem({ id: 'item-1' }));
    const item = await AgendaRepository.getById('ghost-id');
    expect(item).toBeNull();
  });
});

// ─── save ─────────────────────────────────────────────────────────────────────

describe('AgendaRepository.save', () => {
  it('persists a new pending item and schedules a notification', async () => {
    const item = makeItem({ status: 'pending' });
    await AgendaRepository.save(item);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.AGENDA))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('item-1');
    expect(mockSchedule).toHaveBeenCalledWith({
      id:           item.id,
      facilityName: item.facilityName,
      date:         item.date,
      notes:        item.notes,
    });
  });

  it('replaces an existing item with the same id', async () => {
    const original = makeItem({ notes: 'original' });
    await AgendaRepository.save(original);
    const updated = makeItem({ notes: 'updated' });
    await AgendaRepository.save(updated);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.AGENDA))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].notes).toBe('updated');
  });

  it('calls cancelForAgendaItem instead of schedule when status is "completed"', async () => {
    const item = makeItem({ status: 'completed' });
    await AgendaRepository.save(item);
    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockCancel).toHaveBeenCalledWith('item-1');
  });

  it('calls cancelForAgendaItem instead of schedule when status is "cancelled"', async () => {
    const item = makeItem({ status: 'cancelled' as any });
    await AgendaRepository.save(item);
    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockCancel).toHaveBeenCalledWith('item-1');
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('AgendaRepository.delete', () => {
  it('removes the item and cancels its notification', async () => {
    const item = makeItem();
    await AgendaRepository.save(item);
    jest.clearAllMocks();
    await AgendaRepository.delete('item-1');
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.AGENDA)) ?? '[]');
    expect(stored).toHaveLength(0);
    expect(mockCancel).toHaveBeenCalledWith('item-1');
  });

  it('is a no-op when the id does not exist', async () => {
    await AgendaRepository.delete('nonexistent');
    expect(mockCancel).toHaveBeenCalledWith('nonexistent');
  });
});

// ─── updateInspectionLink ─────────────────────────────────────────────────────

describe('AgendaRepository.updateInspectionLink', () => {
  it('sets completed=true, status="completed" and links the inspectionId', async () => {
    await AgendaRepository.save(makeItem({ completed: false }));
    jest.clearAllMocks();
    await AgendaRepository.updateInspectionLink('item-1', 'insp-99');
    const stored: AgendaItem[] = JSON.parse((await AsyncStorage.getItem(StorageKeys.AGENDA))!);
    expect(stored[0].completed).toBe(true);
    expect(stored[0].status).toBe('completed');
    expect((stored[0] as any).inspectionId).toBe('insp-99');
    expect(mockCancel).toHaveBeenCalledWith('item-1');
  });

  it('is a no-op when the agendaId does not exist', async () => {
    await AgendaRepository.updateInspectionLink('ghost-id', 'insp-99');
    expect(mockCancel).not.toHaveBeenCalled();
  });
});
