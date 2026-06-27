// src/services/CapNotificationService.ts
//
// Scans open / in-progress CAP items on app launch and schedules a local
// push notification for each item whose deadline is within the next 7 days.
//
// Notification identifier pattern:
//   "cap-<id>-deadline"   → fired at 09:00 on the deadline day
//
// Design rules:
//   - Runs at most ONCE per calendar day (guarded by CAP_NOTIF_LAST_RUN key).
//   - Cancels & re-schedules on every run so edits are reflected.
//   - Never crashes the caller — all errors are caught and logged.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { StorageKeys } from '../repositories/keys';
import { isEnabled, requestPermission } from './NotificationService';

const CHANNEL_ID   = 'cap-deadlines';
const WARN_DAYS    = 7;  // notify when deadline is within this many days

// ─── Android channel (idempotent) ────────────────────────────────────────────
async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'مواعيد الإجراءات التصحيحية',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#da7101',
  });
}

// ─── Guard: run at most once per calendar day ────────────────────────────────
async function shouldRun(): Promise<boolean> {
  try {
    const last = await AsyncStorage.getItem(StorageKeys.CAP_NOTIF_LAST_RUN);
    const today = new Date().toISOString().slice(0, 10);
    return last !== today;
  } catch {
    return true;
  }
}

async function markRan(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      StorageKeys.CAP_NOTIF_LAST_RUN,
      new Date().toISOString().slice(0, 10),
    );
  } catch { /* ignore */ }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call once on app mount (e.g. inside the root layout useEffect).
 * Schedules deadline reminders for all open CAP items due within 7 days.
 * Safe to call from any screen — it self-guards against double-runs.
 */
export async function scheduleCapDeadlineNotifications(): Promise<void> {
  try {
    if (!(await shouldRun())) return;
    if (!(await isEnabled())) return;
    if (!(await requestPermission())) return;

    await ensureChannel();

    const openItems = await CorrectiveActionRepository.getOpen();
    const now  = new Date();
    const today = new Date(now.toISOString().slice(0, 10));  // midnight today
    const warnCutoff = new Date(today);
    warnCutoff.setDate(warnCutoff.getDate() + WARN_DAYS);

    for (const item of openItems) {
      // Cancel previous notification for this item before (re)scheduling
      try {
        await Notifications.cancelScheduledNotificationAsync(`cap-${item.id}-deadline`);
      } catch { /* might not exist — ignore */ }

      const deadline = new Date(item.deadline);
      deadline.setHours(0, 0, 0, 0);

      // Only notify if deadline is today or within the next WARN_DAYS days
      if (deadline < today || deadline > warnCutoff) continue;

      // Fire at 09:00 on the deadline day
      const fireAt = new Date(deadline);
      fireAt.setHours(9, 0, 0, 0);

      if (fireAt <= now) continue;  // already past 09:00 today — skip

      const daysLeft = Math.round(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      const bodyText =
        daysLeft === 0
          ? `الموعد النهائي اليوم — ${item.facilityName}`
          : `${daysLeft} يوم متبقٍ — ${item.facilityName}`;

      await Notifications.scheduleNotificationAsync({
        identifier: `cap-${item.id}-deadline`,
        content: {
          title: '⚠️ إجراء تصحيحي قادم',
          body: bodyText,
          data: { capId: item.id },
          ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
        },
      });
    }

    await markRan();
  } catch (error) {
    console.warn('[CapNotificationService] scheduleCapDeadlineNotifications error:', error);
  }
}

/**
 * Cancel the deadline notification for a single CAP item.
 * Call when a CAP item is resolved or deleted.
 */
export async function cancelCapNotification(capId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`cap-${capId}-deadline`);
  } catch (error) {
    console.warn('[CapNotificationService] cancelCapNotification error:', error);
  }
}
