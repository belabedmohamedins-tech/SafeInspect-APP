/**
 * src/__tests__/repositories/NotificationRepository.test.ts
 * Named import fix + explicit callback types.
 */
import { NotificationRepository } from '../../repositories/NotificationRepository';
import type { AppNotification } from '../../types';

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
    const target = all.find((n: AppNotification) => n.title === 'Test Notification')!;
    await NotificationRepository.markRead(target.id);
    const updated = await NotificationRepository.getAll();
    const readOne = updated.find((n: AppNotification) => n.id === target.id)!;
    const unreadOne = updated.find((n: AppNotification) => n.title === 'Test Notification');
    expect(readOne.readAt).toBeTruthy();
    expect(unreadOne).toBeTruthy();
  });

  it('does not modify non-matching items', async () => {
    await NotificationRepository.append(baseItem);
    await NotificationRepository.markRead('NOPE');
    const all = await NotificationRepository.getAll();
    expect(all[0].readAt).toBeFalsy();
  });
});

describe('NotificationRepository.dismiss', () => {
  it('sets dismissed flag', async () => {
    await NotificationRepository.append(baseItem);
    const all = await NotificationRepository.getAll();
    const target = all.find((n: AppNotification) => n.title === 'Test Notification')!;
    await NotificationRepository.dismiss(target.id);
    const updated = await NotificationRepository.getAll();
    expect(updated.find((n: AppNotification) => n.id === target.id)?.dismissed).toBe(true);
    expect(updated.find((n: AppNotification) => n.title === 'Test Notification')?.dismissed).toBe(true);
  });
});
