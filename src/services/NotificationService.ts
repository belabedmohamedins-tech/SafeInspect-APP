// src/services/NotificationService.ts
//
// Agenda / general notification service.
//
// Exports:
//   scheduleLocalNotification   — low-level one-shot schedule
//   cancelNotification          — cancel by id
//   cancelAllNotifications      — cancel all
//   isEnabled                   — read persisted toggle (AsyncStorage)
//   setEnabled                  — persist toggle
//   requestPermission           — request OS permission, returns granted boolean
//   scheduleForAgendaItem       — schedule a reminder for an AgendaItem
//   cancelForAgendaItem         — cancel the reminder for an AgendaItem
//   rescheduleAll               — reschedule all agenda items (used by BackupService)
//
// ⚠️  expo-notifications Android remote push was removed from Expo Go in
//     SDK 53. The import is therefore LAZY (require at runtime, not top-level)
//     so that the module loads safely inside Expo Go without crashing.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { StorageKeys } from '../repositories/keys';

// ─── Expo Go guard ───────────────────────────────────────────────────────────
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Lazy reference — populated only when NOT running in Expo Go.
let Notifications: typeof import('expo-notifications') | null = null;
try {
  if (!IS_EXPO_GO) {
    Notifications = require('expo-notifications');
    // Set the handler only after we know the module is available.
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert:  true,
        shouldPlaySound:  true,
        shouldSetBadge:   false,
        shouldShowBanner: true,
        shouldShowList:   true,
      }),
    });
  }
} catch (e) {
  console.warn('[NotificationService] expo-notifications unavailable:', e);
}

// ─── Low-level helpers ────────────────────────────────────────────────────────
export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: import('expo-notifications').NotificationTriggerInput = null,
): Promise<string> {
  if (!Notifications) return '';
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });
}

export async function cancelNotification(id: string): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Enabled toggle (AsyncStorage) ────────────────────────────────────────────
export async function isEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(StorageKeys.AGENDA_NOTIF_ENABLED);
    // Default to true if not yet set
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export async function setEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(StorageKeys.AGENDA_NOTIF_ENABLED, String(enabled));
  } catch { /* ignore */ }
}

// ─── OS permission request ────────────────────────────────────────────────────
export async function requestPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ─── Agenda item notification helpers ────────────────────────────────────────
// Identifier convention: `agenda-${agendaItemId}`
const agendaNotifId = (id: string) => `agenda-${id}`;

/**
 * Schedule a push notification for an agenda item.
 * Fires at 08:00 on item.date (local time). No-ops if already past or if
 * notifications are disabled / unavailable in Expo Go.
 */
export async function scheduleForAgendaItem(
  item: { id: string; date: string; facilityName: string; notes: string },
): Promise<void> {
  if (!Notifications) return;
  if (!(await isEnabled())) return;
  try {
    // Cancel existing first so we don't duplicate
    await Notifications.cancelScheduledNotificationAsync(agendaNotifId(item.id)).catch(() => {});

    const fireAt = new Date(item.date);
    fireAt.setHours(8, 0, 0, 0);
    if (fireAt <= new Date()) return; // already past

    await Notifications.scheduleNotificationAsync({
      identifier: agendaNotifId(item.id),
      content: {
        title: `📅 تفتيش مجدول — ${item.facilityName}`,
        body:  item.notes || item.facilityName,
        data:  { agendaId: item.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });
  } catch (e) {
    console.warn('[NotificationService] scheduleForAgendaItem error:', e);
  }
}

/**
 * Cancel the scheduled notification for a given agenda item id.
 */
export async function cancelForAgendaItem(id: string): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(agendaNotifId(id));
  } catch (e) {
    console.warn('[NotificationService] cancelForAgendaItem error:', e);
  }
}

/**
 * Reschedule all agenda items. Called by BackupService after a restore so
 * notifications reflect the restored data.
 *
 * Lazy-imports AgendaRepository to avoid a circular dependency at module
 * load time (AgendaRepository → NotificationService → AgendaRepository).
 */
export async function rescheduleAll(): Promise<void> {
  if (!Notifications) return;
  if (!(await isEnabled())) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const { AgendaRepository } = await import('../repositories/AgendaRepository');
    const items = await AgendaRepository.getAll();
    for (const item of items) {
      await scheduleForAgendaItem(item);
    }
  } catch (e) {
    console.warn('[NotificationService] rescheduleAll error:', e);
  }
}
