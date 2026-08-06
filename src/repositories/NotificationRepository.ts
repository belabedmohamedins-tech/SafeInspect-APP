// src/repositories/NotificationRepository.ts
//
// Z5: migrated from AsyncStorage to expo-sqlite.
// Ring-buffer of MAX_NOTIFICATIONS preserved.

import { getDb } from '../db/schema';
import { NotificationItem } from '../types';

const MAX_NOTIFICATIONS = 200;

type NotifRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
  dismissed: number;
  link_json: string | null;
};

function rowToItem(row: NotifRow): NotificationItem {
  return {
    id: row.id,
    type: row.type as NotificationItem['type'],
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at ?? undefined,
    dismissed: row.dismissed === 1,
    link: row.link_json ? JSON.parse(row.link_json) : undefined,
  };
}

export const NotificationRepository = {
  async append(item: Omit<NotificationItem, 'id' | 'createdAt'>): Promise<void> {
    const db = await getDb();
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO notifications (id, type, title, body, created_at, link_json)
       VALUES (?,?,?,?,?,?)`,
      [
        id,
        item.type,
        item.title,
        item.body,
        now,
        item.link ? JSON.stringify(item.link) : null,
      ],
    );
    // Ring-buffer: keep latest MAX_NOTIFICATIONS
    await db.runAsync(
      `DELETE FROM notifications WHERE id NOT IN
       (SELECT id FROM notifications ORDER BY created_at DESC LIMIT ?)`,
      [MAX_NOTIFICATIONS],
    );
  },

  async getAll(): Promise<NotificationItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<NotifRow>(
      'SELECT * FROM notifications ORDER BY created_at DESC',
    );
    return rows.map(rowToItem);
  },

  async getUnread(): Promise<NotificationItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<NotifRow>(
      `SELECT * FROM notifications WHERE read_at IS NULL AND dismissed = 0
       ORDER BY created_at DESC`,
    );
    return rows.map(rowToItem);
  },

  async getUnreadCount(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM notifications WHERE read_at IS NULL AND dismissed = 0',
    );
    return row?.cnt ?? 0;
  },

  async markRead(id: string): Promise<void> {
    await (await getDb()).runAsync(
      'UPDATE notifications SET read_at = ? WHERE id = ?',
      [new Date().toISOString(), id],
    );
  },

  async markAllRead(): Promise<void> {
    await (await getDb()).runAsync(
      'UPDATE notifications SET read_at = ? WHERE read_at IS NULL',
      [new Date().toISOString()],
    );
  },

  async dismiss(id: string): Promise<void> {
    await (await getDb()).runAsync(
      'UPDATE notifications SET dismissed = 1 WHERE id = ?',
      [id],
    );
  },

  async delete(id: string): Promise<void> {
    await (await getDb()).runAsync(
      'DELETE FROM notifications WHERE id = ?',
      [id],
    );
  },

  async clear(): Promise<void> {
    await (await getDb()).runAsync('DELETE FROM notifications');
  },
};
