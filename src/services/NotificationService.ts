// src/services/NotificationService.ts
//
// Handles all local push-notification logic for agenda items.
//
// Two triggers per agenda item:
//   1. 1 hour before the scheduled date/time
//   2. Day-of at 08:00 AM (morning reminder)
//
// Notification identifiers follow the pattern:
//   "agenda-<id>-pre"   → 1-hour-before trigger
//   "agenda-<id>-day"   → morning-of trigger
//
// Both are cancelled together via cancelForAgendaItem().

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { StorageKeys } from '../repositories/keys';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface AgendaNotificationPayload {
  id: string;          // AgendaItem.id
  facilityName: string;
  date: string;        // ISO string
  notes?: string;
}

// ─── Permission ──────────────────────────────────────────────────────────────

/**
 * Request notification permission from the OS.
 * Returns true if granted, false otherwise.
 * Safe to call multiple times — re-uses existing grant.
 */
export async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  // Android: create a default notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('agenda', {
      name: 'مهام الجدول الزمني',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#01696f',
    });
  }

  return true;
}

// ─── User preference ─────────────────────────────────────────────────────────

export async function isEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(StorageKeys.NOTIFICATIONS_ENABLED);
    // Default to true if not yet set — first-run opt-in
    return val === null ? true : val === 'true';
  } catch {
    return false;
  }
}

export async function setEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.NOTIFICATIONS_ENABLED, String(enabled));

  if (!enabled) {
    // Cancel every scheduled notification when the user opts out
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// ─── Schedule / Cancel ───────────────────────────────────────────────────────

/**
 * Schedule (or reschedule) the two notifications for a single agenda item.
 * Silently no-ops if:
 *   - notifications are disabled by the user
 *   - OS permission is not granted
 *   - the scheduled date is in the past
 */
export async function scheduleForAgendaItem(
  item: AgendaNotificationPayload
): Promise<void> {
  try {
    const enabled = await isEnabled();
    if (!enabled) return;

    const granted = await requestPermission();
    if (!granted) return;

    const itemDate = new Date(item.date);
    const now = new Date();

    // Always cancel existing triggers first (handles reschedule on edit)
    await cancelForAgendaItem(item.id);

    // ── Trigger 1: 1 hour before ────────────────────────────────
    const preDate = new Date(itemDate.getTime() - 60 * 60 * 1000);
    if (preDate > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `agenda-${item.id}-pre`,
        content: {
          title: '⏰ تذكير — زيارة تفتيشية',
          body: `${item.facilityName} — بعد ساعة واحدة`,
          data: { agendaId: item.id },
          ...(Platform.OS === 'android' && { channelId: 'agenda' }),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: preDate },
      });
    }

    // ── Trigger 2: Morning of the day at 08:00 ──────────────────
    const morningDate = new Date(itemDate);
    morningDate.setHours(8, 0, 0, 0);
    if (morningDate > now && morningDate < itemDate) {
      await Notifications.scheduleNotificationAsync({
        identifier: `agenda-${item.id}-day`,
        content: {
          title: '📋 زيارة تفتيشية اليوم',
          body: `${item.facilityName} — ${itemDate.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}`,
          data: { agendaId: item.id },
          ...(Platform.OS === 'android' && { channelId: 'agenda' }),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: morningDate },
      });
    }
  } catch (error) {
    // Never crash the save flow due to notification errors
    console.warn('[NotificationService] scheduleForAgendaItem error:', error);
  }
}

/**
 * Cancel both notification triggers for a given agenda item id.
 */
export async function cancelForAgendaItem(id: string): Promise<void> {
  try {
    await Promise.all([
      Notifications.cancelScheduledNotificationAsync(`agenda-${id}-pre`),
      Notifications.cancelScheduledNotificationAsync(`agenda-${id}-day`),
    ]);
  } catch (error) {
    console.warn('[NotificationService] cancelForAgendaItem error:', error);
  }
}

/**
 * Cancel ALL scheduled notifications and re-create them from a fresh
 * list of agenda items. Call after bulk operations or on app startup.
 */
export async function rescheduleAll(
  items: AgendaNotificationPayload[]
): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const enabled = await isEnabled();
    if (!enabled) return;
    await Promise.all(items.map(scheduleForAgendaItem));
  } catch (error) {
    console.warn('[NotificationService] rescheduleAll error:', error);
  }
}
