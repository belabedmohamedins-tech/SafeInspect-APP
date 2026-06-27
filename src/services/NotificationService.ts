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
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { StorageKeys } from '../repositories/keys';

// Detect Expo Go — notifications are not supported there in SDK 53+
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Lazily import expo-notifications only when not in Expo Go
let Notifications: typeof import('expo-notifications') | null = null;
try {
  if (!IS_EXPO_GO) {
    Notifications = require('expo-notifications');

    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (e) {
  console.warn('[NotificationService] expo-notifications unavailable:', e);
}

export interface AgendaNotificationPayload {
  id: string;
  facilityName: string;
  date: string; // ISO string
  notes?: string;
}

// ─── Permission ──────────────────────────────────────────────────────────────

export async function requestPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;

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
  if (!enabled && Notifications) {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// ─── Schedule / Cancel ───────────────────────────────────────────────────────

export async function scheduleForAgendaItem(
  item: AgendaNotificationPayload
): Promise<void> {
  if (!Notifications) return; // Expo Go — silent no-op
  try {
    const enabled = await isEnabled();
    if (!enabled) return;

    const granted = await requestPermission();
    if (!granted) return;

    const itemDate = new Date(item.date);
    const now = new Date();

    await cancelForAgendaItem(item.id);

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
    console.warn('[NotificationService] scheduleForAgendaItem error:', error);
  }
}

export async function cancelForAgendaItem(id: string): Promise<void> {
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
