// src/repositories/NotificationRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationItem } from '../types';
import { KEYS } from './keys';

const MAX_NOTIFICATIONS = 200;

async function load(): Promise<NotificationItem[]> {
  const raw = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
  return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
}

async function save(items: NotificationItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(items));
}

export const NotificationRepository = {
  /** Prepend a new notification. Ring-buffer: keeps latest MAX_NOTIFICATIONS. */
  async append(item: Omit<NotificationItem, 'id' | 'createdAt'>): Promise<void> {
    const all = await load();
    const next: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const trimmed = [next, ...all].slice(0, MAX_NOTIFICATIONS);
    await save(trimmed);
  },

  async getAll(): Promise<NotificationItem[]> {
    return load();
  },

  async getUnread(): Promise<NotificationItem[]> {
    const all = await load();
    return all.filter(n => !n.readAt && !n.dismissed);
  },

  async getUnreadCount(): Promise<number> {
    const all = await load();
    return all.filter(n => !n.readAt && !n.dismissed).length;
  },

  async markRead(id: string): Promise<void> {
    const all = await load();
    const updated = all.map(n =>
      n.id === id ? { ...n, readAt: new Date().toISOString() } : n
    );
    await save(updated);
  },

  async markAllRead(): Promise<void> {
    const all = await load();
    const now = new Date().toISOString();
    const updated = all.map(n =>
      n.readAt ? n : { ...n, readAt: now }
    );
    await save(updated);
  },

  async dismiss(id: string): Promise<void> {
    const all = await load();
    const updated = all.map(n =>
      n.id === id ? { ...n, dismissed: true } : n
    );
    await save(updated);
  },

  async clear(): Promise<void> {
    await save([]);
  },
};
