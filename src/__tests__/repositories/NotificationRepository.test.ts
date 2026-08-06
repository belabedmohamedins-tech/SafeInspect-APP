/**
 * src/__tests__/repositories/NotificationRepository.test.ts
 * Extended contract tests for NotificationRepository — SQLite contract (rewritten).
 */
import NotificationRepository from '../../repositories/NotificationRepository';

const SQLite = require('expo-sqlite');

const makePayload = (overrides: Record<string, unknown> = {}) => ({
  title: 'Test Notification',
  body: 'Body text',
  type: 'info' as const,
  ...overrides,
});

beforeEach(() => {
  SQLite.__resetAll();
});

describe('NotificationRepository › getAll / append', () => {
  it('appends a notification with generated id and createdAt', async () => {
    await NotificationRepository.append(makePayload());
    const all = await NotificationRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toMatch(/^notif_/);
    expect(all[0].createdAt).toBeTruthy();
    expect(all[0].title).toBe('Test Notification');
  });

  it('prepends newest notification first', async () => {
    await NotificationRepository.append(makePayload({ title: 'First' }));
    await NotificationRepository.append(makePayload({ title: 'Second' }));
    const all = await NotificationRepository.getAll();
    expect(all[0].title).toBe('Second');
    expect(all[1].title).toBe('First');
  });
});

describe('NotificationRepository › getUnread', () => {
  it('returns only notifications without readAt or dismissed', async () => {
    await NotificationRepository.append(makePayload({ title: 'Unread' }));
    const all = await NotificationRepository.getAll();
    await NotificationRepository.markRead(all[0].id);
    await NotificationRepository.append(makePayload({ title: 'Still unread' }));
    const unread = await NotificationRepository.getUnread();
    expect(unread).toHaveLength(1);
    expect(unread[0].title).toBe('Still unread');
  });
});

describe('NotificationRepository › getUnreadCount', () => {
  it('returns 0 when all notifications are read', async () => {
    await NotificationRepository.append(makePayload());
    const [notif] = await NotificationRepository.getAll();
    await NotificationRepository.markRead(notif.id);
    expect(await NotificationRepository.getUnreadCount()).toBe(0);
  });

  it('returns correct count of unread notifications', async () => {
    await NotificationRepository.append(makePayload());
    await NotificationRepository.append(makePayload());
    expect(await NotificationRepository.getUnreadCount()).toBe(2);
  });
});

describe('NotificationRepository › markRead', () => {
  it('sets readAt on the target notification only', async () => {
    await NotificationRepository.append(makePayload({ title: 'A' }));
    await NotificationRepository.append(makePayload({ title: 'B' }));
    const all = await NotificationRepository.getAll();
    const target = all.find(n => n.title === 'A')!;
    await NotificationRepository.markRead(target.id);
    const updated = await NotificationRepository.getAll();
    const readOne = updated.find(n => n.id === target.id)!;
    const unreadOne = updated.find(n => n.title === 'B')!;
    expect(readOne.readAt).toBeTruthy();
    expect(unreadOne.readAt).toBeFalsy();
  });

  it('does not overwrite readAt for already-read notifications', async () => {
    await NotificationRepository.append(makePayload());
    const [notif] = await NotificationRepository.getAll();
    await NotificationRepository.markRead(notif.id);
    const firstReadAt = (await NotificationRepository.getAll())[0].readAt;
    await NotificationRepository.markAllRead();
    const secondReadAt = (await NotificationRepository.getAll())[0].readAt;
    expect(secondReadAt).toBe(firstReadAt);
  });
});

describe('NotificationRepository › dismiss', () => {
  it('sets dismissed=true on the target notification', async () => {
    await NotificationRepository.append(makePayload());
    const [notif] = await NotificationRepository.getAll();
    await NotificationRepository.dismiss(notif.id);
    const all = await NotificationRepository.getAll();
    expect(all[0].dismissed).toBe(true);
  });

  it('excludes dismissed notifications from getUnread', async () => {
    await NotificationRepository.append(makePayload());
    const [notif] = await NotificationRepository.getAll();
    await NotificationRepository.dismiss(notif.id);
    expect(await NotificationRepository.getUnread()).toHaveLength(0);
  });

  it('does not affect other notifications when dismissing by id', async () => {
    await NotificationRepository.append(makePayload({ title: 'A' }));
    await NotificationRepository.append(makePayload({ title: 'B' }));
    const all = await NotificationRepository.getAll();
    const target = all.find(n => n.title === 'A')!;
    await NotificationRepository.dismiss(target.id);
    const updated = await NotificationRepository.getAll();
    expect(updated.find(n => n.id === target.id)?.dismissed).toBe(true);
    expect(updated.find(n => n.title === 'B')?.dismissed).toBeFalsy();
  });
});
