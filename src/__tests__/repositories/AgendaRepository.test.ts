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

jest.mock('../../services/NotificationService', () => ({
  scheduleForAgendaItem: jest.fn(),
  cancelForAgendaItem:   jest.fn(),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaRepository } from '../../repositories/AgendaRepository';
import { StorageKeys }      from '../../repositories/keys';
import * as NotificationService from '../../services/NotificationService';
import { AgendaItem } from '../../types';

const mockSchedule = jest.mocked(NotificationService.scheduleForAgendaItem);
const mockCancel   = jest.mocked(NotificationService.cancelForAgendaItem);

// ─── Helpers ──────────────────────────────────────────────────────────────────

// status: 'pending' is required so save() calls scheduleForAgendaItem.
// The source checks `item.status === 'pending'` — without this field
// the condition is false and the mock is never called.
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

// ─── Setup ────────────────────────────────────────────────────────────────────

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
});

// ─── save ─────────────────────────────────────────────────────────────────────

describe('AgendaRepository.save', () => {
  it('persists a new item and schedules a notification', async () => {
    const item = makeItem({ status: 'pending' });
    await AgendaRepository.save(item);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.AGENDA))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('item-1');
    // save() calls scheduleForAgendaItem with a subset object, not the full item
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
// NOTE: AgendaRepository does NOT expose a markComplete() method.
// The equivalent is updateInspectionLink() which sets completed=true
// and status='completed' as a side-effect of linking an inspection.

describe('AgendaRepository.updateInspectionLink', () => {
  it('sets completed to true and links the inspectionId', async () => {
    await AgendaRepository.save(makeItem({ completed: false }));
    jest.clearAllMocks();
    await AgendaRepository.updateInspectionLink('item-1', 'insp-99');
    const stored: AgendaItem[] = JSON.parse((await AsyncStorage.getItem(StorageKeys.AGENDA))!);
    expect(stored[0].completed).toBe(true);
    expect((stored[0] as any).inspectionId).toBe('insp-99');
    expect(mockCancel).toHaveBeenCalledWith('item-1');
  });

  it('is a no-op when the agendaId does not exist', async () => {
    await AgendaRepository.updateInspectionLink('ghost-id', 'insp-99');
    expect(mockCancel).not.toHaveBeenCalled();
  });
});
