// src/services/NotificationService.ts
//
// Handles all local push-notification logic for agenda items.
//
// ⚠️  expo-notifications Android remote push was removed from Expo Go
//     in SDK 53. This module guards every Notifications call so the app
//     works in Expo Go (notifications silently disabled) and works fully
//     in development builds and production.
//
// Two triggers per agenda item:
//   1. 1 hour before the scheduled date/time
//   2. Day-of at 08:00 AM (morning reminder)
//
// Notification identifiers follow the pattern:
//   "agenda-<id>-pre"   → 1-hour-before trigger
//   "agenda-<id>-day"   → morning-of trigger

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { StorageKeys } from '../repositories/keys';

function getNotifications(): typeof import('expo-notifications') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-constants');
    // istanbul ignore next -- .default fallback only needed outside Jest/ESM
    const Constants = mod.default ?? mod;
    if (Constants.appOwnership === 'expo') return null;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-notifications');
  } catch {
    // istanbul ignore next -- require() never throws in Jest (modules are pre-registered)
    return null;
  }
}

let _handlerInstalled = false;
function getNotificationsWithHandler(): typeof import('expo-notifications') | null {
  const N = getNotifications();
  if (N && !_handlerInstalled) {
    _handlerInstalled = true;
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
  return N;
}

export interface AgendaNotificationPayload {
  id: string;
  facilityName: string;
  date: string; // ISO string
  notes?: string;
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestPermission(): Promise<boolean> {
  const Notifications = getNotificationsWithHandler();
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;

    /* istanbul ignore next -- Android-only branch, Jest runs on linux/node without android platform */
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('agenda', {
        name: 'مهام الجدول الزمني',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#01696f',
      });
    }

    return true;
  } catch (e) {
    console.warn('[NotificationService] requestPermission error:', e);
    return false;
  }
}

// ─── User preference ─────────────────────────────────────────────────────────

export async function isEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(StorageKeys.NOTIFICATIONS_ENABLED);
    return val === null ? true : val === 'true';
  } catch {
    return false;
  }
}

export async function setEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.NOTIFICATIONS_ENABLED, String(enabled));
  const Notifications = getNotificationsWithHandler();
  if (!enabled && Notifications) {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// ─── Schedule / Cancel ───────────────────────────────────────────────────────

export async function scheduleForAgendaItem(
  item: AgendaNotificationPayload
): Promise<void> {
  const Notifications = getNotificationsWithHandler();
  if (!Notifications) return;
  try {
    const enabled = await isEnabled();
    if (!enabled) return;

    const granted = await requestPermission();
    if (!granted) return;

    const itemDate = new Date(item.date);
    const now = new Date();

    await cancelForAgendaItem(item.id);

    // Trigger 1: 1 hour before the appointment
    const preDate = new Date(itemDate.getTime() - 60 * 60 * 1000);
    if (preDate > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `agenda-${item.id}-pre`,
        content: {
          title: '⏰ تذكير — زيارة تفتيشية',
          body: `${item.facilityName} — بعد ساعة واحدة`,
          data: { agendaId: item.id },
          /* istanbul ignore next */
          ...(Platform.OS === 'android' && { channelId: 'agenda' }),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: preDate },
      });
    }

    const morningDate = new Date(itemDate);
    morningDate.setHours(8, 0, 0, 0);
    if (morningDate > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `agenda-${item.id}-day`,
        content: {
          title: '📋 زيارة تفتيشية اليوم',
          body: `${item.facilityName} — ${itemDate.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}`,
          data: { agendaId: item.id },
          /* istanbul ignore next */
          ...(Platform.OS === 'android' && { channelId: 'agenda' }),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: morningDate },
      });
    }
  } catch (error) {
    console.warn('[NotificationService] scheduleForAgendaItem error:', error);
  }
}

export async function cancelForAgendaItem(id: string): Promise<void> {
  const Notifications = getNotificationsWithHandler();
  if (!Notifications) return;
  try {
    await Promise.all([
      Notifications.cancelScheduledNotificationAsync(`agenda-${id}-pre`),
      Notifications.cancelScheduledNotificationAsync(`agenda-${id}-day`),
    ]);
  } catch (error) {
    console.warn('[NotificationService] cancelForAgendaItem error:', error);
  }
}

export async function rescheduleAll(
  items: AgendaNotificationPayload[]
): Promise<void> {
  const Notifications = getNotificationsWithHandler();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const enabled = await isEnabled();
    if (!enabled) return;
    await Promise.all(items.map(scheduleForAgendaItem));
  } catch (error) {
    console.warn('[NotificationService] rescheduleAll error:', error);
  }
}
