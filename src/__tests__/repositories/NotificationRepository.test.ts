// src/__tests__/repositories/NotificationRepository.test.ts
//
// Layer 4 test. AsyncStorage is mocked globally via Layer 2 (moduleNameMapper).
// Use __resetStore() in beforeEach to guarantee a clean slate.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationRepository } from '../../repositories/NotificationRepository';

// ─── Mocks ──────────────────────────────────────────────────────────────────────
// AsyncStorage is a stateful in-memory mock from __mocks__/@react-native-async-storage/
// __resetStore() wipes all keys between tests.
const { __resetStore } = AsyncStorage as unknown as { __resetStore: () => void };

beforeEach(() => {
  __resetStore();
  jest.clearAllMocks();
});

// ─── Fixtures ──────────────────────────────────────────────────────────────────────
const makePayload = (overrides = {}) => ({
  type: 'inspection_completed' as const,
  title: 'Test Notification',
  body: 'Test body',
  data: {},
  ...overrides,
});

describe('NotificationRepository', () => {
  describe('getAll / append', () => {
    it('returns empty array when store is empty', async () => {
      expect(await NotificationRepository.getAll()).toEqual([]);
    });

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

  describe('getUnread', () => {
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

  describe('getUnreadCount', () => {
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

  describe('markRead', () => {
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
      expect(unreadOne.readAt).toBeUndefined();
    });
  });

  describe('markAllRead', () => {
    it('marks every unread notification as read', async () => {
      await NotificationRepository.append(makePayload());
      await NotificationRepository.append(makePayload());
      await NotificationRepository.markAllRead();
      const all = await NotificationRepository.getAll();
      expect(all.every(n => !!n.readAt)).toBe(true);
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

  describe('dismiss', () => {
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
  });

  describe('clear', () => {
    it('removes all notifications', async () => {
      await NotificationRepository.append(makePayload());
      await NotificationRepository.append(makePayload());
      await NotificationRepository.clear();
      expect(await NotificationRepository.getAll()).toHaveLength(0);
    });
  });
});
