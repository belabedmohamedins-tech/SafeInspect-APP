/**
 * src/__tests__/repositories/NotificationRepository.test.ts
 * Mirror of __tests__/repositories/NotificationRepository.test.ts.
 * Uses 'SYSTEM' (valid NotificationType) instead of 'info'.
 * NotificationItem exported from types.ts; AppNotification does not exist.
 */
import { NotificationRepository } from '../../repositories/NotificationRepository';
import type { NotificationItem } from '../../types';

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
    await NotificationRepository.append(baseItem);
    await NotificationRepository.append(baseItem);
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
    await NotificationRepository.markRead(all[0].id);
    const updated = await NotificationRepository.getAll();
    expect(updated[0].readAt).toBeDefined();
  });
});

describe('NotificationRepository.getUnread', () => {
  it('returns only unread notifications', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    await NotificationRepository.markRead(all[0].id);
    expect(await NotificationRepository.getUnread()).toHaveLength(1);
  });
});

describe('NotificationRepository.clear', () => {
  it('removes all notifications', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.clear();
    expect(await NotificationRepository.getAll()).toHaveLength(0);
  });
});
