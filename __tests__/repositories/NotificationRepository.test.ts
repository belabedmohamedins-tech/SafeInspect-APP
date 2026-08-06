/**
 * __tests__/repositories/NotificationRepository.test.ts
 * Contract tests for NotificationRepository — SQLite contract (rewritten).
 */
import { NotificationRepository } from '../../src/repositories/NotificationRepository';
import type { AppNotification } from '../../src/types';

const SQLite = require('expo-sqlite');

const baseItem = {
  title: 'Test Notification',
  body: 'Body text',
  type: 'info' as const,
};

beforeEach(() => {
  SQLite.__resetAll();
});

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
    for (let i = 0; i < 201; i++) {
      await NotificationRepository.append(baseItem);
    }
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    expect(all.length).toBe(200);
  }, 30_000);
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

  it('does not overwrite already-read readAt timestamp', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    const target = all.find((n: AppNotification) => n.title === 'Test Notification')!;
    await NotificationRepository.markRead(target.id);
    const firstReadAt = (await NotificationRepository.getAll())[0].readAt;
    await NotificationRepository.markAllRead();
    const secondReadAt = (await NotificationRepository.getAll())[0].readAt;
    expect(secondReadAt).toBe(firstReadAt);
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
