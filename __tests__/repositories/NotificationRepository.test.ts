// __tests__/repositories/NotificationRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationRepository } from '../../src/repositories/NotificationRepository';

beforeEach(() => {
  AsyncStorage.clear();
});

const baseItem = { title: 'Test notif', body: 'body text', type: 'info' as const };

describe('NotificationRepository.append', () => {
  it('creates entry with id and createdAt', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toMatch(/^notif_/);
    expect(all[0].createdAt).toBeTruthy();
  });

  it('prepends newest first', async () => {
    await NotificationRepository.append({ ...baseItem, title: 'First' });
    await NotificationRepository.append({ ...baseItem, title: 'Second' });
    const all = await NotificationRepository.getAll();
    expect(all[0].title).toBe('Second');
    expect(all[1].title).toBe('First');
  });

  it('respects MAX_NOTIFICATIONS ring-buffer (200)', async () => {
    // Seed 199 items directly
    const existing = Array.from({ length: 199 }, (_, i) => ({
      id: `notif_old_${i}`,
      title: 'old',
      body: 'b',
      type: 'info' as const,
      createdAt: new Date().toISOString(),
    }));
    await AsyncStorage.setItem('NOTIFICATIONS', JSON.stringify(existing));
    // Append 2 more → should cap at 200
    await NotificationRepository.append(baseItem);
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    expect(all.length).toBe(200);
  });
});

describe('NotificationRepository.getUnread', () => {
  it('returns only non-read, non-dismissed items', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    await NotificationRepository.markRead(all[0].id);
    await NotificationRepository.append(baseItem); // new unread
    const unread = await NotificationRepository.getUnread();
    expect(unread).toHaveLength(1);
  });
});

describe('NotificationRepository.getUnreadCount', () => {
  it('returns correct count', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.append(baseItem);
    expect(await NotificationRepository.getUnreadCount()).toBe(2);
  });
});

describe('NotificationRepository.markRead', () => {
  it('sets readAt on matching item', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    await NotificationRepository.markRead(all[0].id);
    const updated = await NotificationRepository.getAll();
    expect(updated[0].readAt).toBeTruthy();
  });

  it('does not modify items with non-matching id', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.markRead('NOPE');
    const all = await NotificationRepository.getAll();
    expect(all[0].readAt).toBeFalsy();
  });
});

describe('NotificationRepository.markAllRead', () => {
  it('marks all unread items', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.append(baseItem);
    await NotificationRepository.markAllRead();
    const unread = await NotificationRepository.getUnread();
    expect(unread).toHaveLength(0);
  });

  it('does not overwrite already-read readAt timestamp', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    const firstReadAt = new Date(Date.now() - 10000).toISOString();
    // manually set readAt
    const patched = all.map(n => ({ ...n, readAt: firstReadAt }));
    await AsyncStorage.setItem('NOTIFICATIONS', JSON.stringify(patched));
    await NotificationRepository.markAllRead();
    const after = await NotificationRepository.getAll();
    // readAt should remain firstReadAt (not overwritten)
    expect(after[0].readAt).toBe(firstReadAt);
  });
});

describe('NotificationRepository.dismiss', () => {
  it('sets dismissed flag on matching item', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    await NotificationRepository.dismiss(all[0].id);
    const updated = await NotificationRepository.getAll();
    expect(updated[0].dismissed).toBe(true);
  });
});

describe('NotificationRepository.clear', () => {
  it('empties all notifications', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.clear();
    expect(await NotificationRepository.getAll()).toEqual([]);
  });
});
