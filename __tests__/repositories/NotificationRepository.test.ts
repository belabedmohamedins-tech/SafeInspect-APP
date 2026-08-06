/**
 * __tests__/repositories/NotificationRepository.test.ts
 * Z6-TSC:
 *   - AppNotification does not exist in src/types; use NotificationItem.
 *   - type:'info' not in NotificationType; use 'SYSTEM'.
 */
import { NotificationRepository } from '../../src/repositories/NotificationRepository';
import type { NotificationItem } from '../../src/types';

type NewItem = Omit<NotificationItem, 'id' | 'createdAt'>;

const baseItem: NewItem = {
  title: 'Test Notification',
  body: 'Test body',
  type: 'SYSTEM',
};

beforeEach(async () => {
  await NotificationRepository.clear();
});

describe('NotificationRepository', () => {
  it('appends and retrieves items', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it('getAll returns most-recent first', async () => {
    await NotificationRepository.append({ ...baseItem, title: 'First' });
    await NotificationRepository.append({ ...baseItem, title: 'Second' });
    const all = await NotificationRepository.getAll();
    expect(all[0].title).toBe('Second');
  });

  it('getUnread returns only unread items', async () => {
    await NotificationRepository.append(baseItem);
    const item = (await NotificationRepository.getAll())[0];
    await NotificationRepository.markRead(item.id);
    await NotificationRepository.append(baseItem); // new unread
    const unread = await NotificationRepository.getUnread();
    expect(unread.every((n: NotificationItem) => !n.readAt)).toBe(true);
  });

  it('markRead sets readAt', async () => {
    await NotificationRepository.append(baseItem);
    const item = (await NotificationRepository.getAll())[0];
    await NotificationRepository.markRead(item.id);
    const updated = (await NotificationRepository.getAll()).find(n => n.id === item.id);
    expect(updated?.readAt).toBeTruthy();
  });

  it('markAllRead marks all items', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.append(baseItem);
    await NotificationRepository.markAllRead();
    const unread = await NotificationRepository.getUnread();
    expect(unread).toHaveLength(0);
  });

  it('delete removes an item', async () => {
    await NotificationRepository.append(baseItem);
    const item = (await NotificationRepository.getAll())[0];
    await NotificationRepository.delete(item.id);
    const all = await NotificationRepository.getAll();
    expect(all.every(n => n.id !== item.id)).toBe(true);
  });

  it('clear empties all notifications', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.clear();
    expect(await NotificationRepository.getAll()).toHaveLength(0);
  });
});
