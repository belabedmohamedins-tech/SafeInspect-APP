/**
 * __tests__/repositories/NotificationRepository.test.ts
 * Contract tests for NotificationRepository — SQLite contract.
 * Fixture aligned with NotificationItem / NotificationType in src/types.ts.
 * Valid NotificationType values: CAP_DEADLINE | AGENDA_REMINDER | APPROVAL_ACTION
 *   | FOLLOW_UP | SYSTEM | inspection_completed
 */
import { NotificationRepository } from '../../src/repositories/NotificationRepository';
import type { NotificationItem } from '../../src/types';

const SQLite = require('expo-sqlite');

const baseItem: Omit<NotificationItem, 'id' | 'createdAt'> = {
  title: 'Test notification',
  body: 'Test body',
  type: 'SYSTEM',
};

beforeEach(() => {
  SQLite.__resetAll();
});

describe('NotificationRepository.getAll', () => {
  it('returns empty array when no items', async () => {
    expect(await NotificationRepository.getAll()).toEqual([]);
  });

  it('returns all stored notifications', async () => {
    await NotificationRepository.append({ ...baseItem, title: 'First' });
    await NotificationRepository.append({ ...baseItem, title: 'Second' });
    expect(await NotificationRepository.getAll()).toHaveLength(2);
  });
});

describe('NotificationRepository.append', () => {
  it('creates a notification with generated id and createdAt', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBeDefined();
    expect(all[0].createdAt).toBeDefined();
  });
});

describe('NotificationRepository.markRead', () => {
  it('marks a notification as read', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    const id = all[0].id;
    await NotificationRepository.markRead(id);
    const updated = await NotificationRepository.getAll();
    expect(updated[0].readAt).toBeDefined();
  });

  it('is a no-op for unknown id', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.markRead('no-such'); // new unread
    expect(await NotificationRepository.getAll()).toHaveLength(1);
  });
});

describe('NotificationRepository.getUnread', () => {
  it('returns only unread notifications', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    await NotificationRepository.markRead(all[0].id);
    const unread = await NotificationRepository.getUnread();
    expect(unread).toHaveLength(1);
  });
});

describe('NotificationRepository.clear', () => {
  it('removes all notifications', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.clear();
    expect(await NotificationRepository.getAll()).toHaveLength(0);
  });
});
