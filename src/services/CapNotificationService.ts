// src/services/CapNotificationService.ts
//
// Scans open / in-progress CAP items on app launch and schedules a local
// push notification for each item whose deadline is within the next 7 days.
//
// ⚠️  expo-notifications Android remote push was removed from Expo Go in
//     SDK 53. This module guards every Notifications call so the app
//     works in Expo Go (notifications silently disabled) and works fully
//     in development builds and production.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { StorageKeys } from '../repositories/keys';
import { isEnabled, requestPermission } from './NotificationService';

// Detect Expo Go
const IS_EXPO_GO = Constants.appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;
try {
  if (!IS_EXPO_GO) {
    Notifications = require('expo-notifications');
  }
} catch (e) {
  console.warn('[CapNotificationService] expo-notifications unavailable:', e);
}

const CHANNEL_ID = 'cap-deadlines';
const WARN_DAYS  = 7;

async function ensureChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'مواعيد الإجراءات التصحيحية',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#da7101',
  });
}

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

export async function scheduleCapDeadlineNotifications(): Promise<void> {
  if (!Notifications) return; // Expo Go — silent no-op
  try {
    if (!(await shouldRun())) return;
    if (!(await isEnabled())) return;
    if (!(await requestPermission())) return;

    await ensureChannel();

    const openItems = await CorrectiveActionRepository.getOpen();
    const now      = new Date();
    const today    = new Date(now.toISOString().slice(0, 10));
    const warnCutoff = new Date(today);
    warnCutoff.setDate(warnCutoff.getDate() + WARN_DAYS);

    for (const item of openItems) {
      try {
        await Notifications!.cancelScheduledNotificationAsync(`cap-${item.id}-deadline`);
      } catch { /* might not exist */ }

      const deadline = new Date(item.deadline);
      deadline.setHours(0, 0, 0, 0);

      if (deadline < today || deadline > warnCutoff) continue;

      const fireAt = new Date(deadline);
      fireAt.setHours(9, 0, 0, 0);
      if (fireAt <= now) continue;

      const daysLeft = Math.round(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      const bodyText =
        daysLeft === 0
          ? `الموعد النهائي اليوم — ${item.facilityName}`
          : `${daysLeft} يوم متبقٍ — ${item.facilityName}`;

      await Notifications!.scheduleNotificationAsync({
        identifier: `cap-${item.id}-deadline`,
        content: {
          title: '⚠️ إجراء تصحيحي قادم',
          body: bodyText,
          data: { capId: item.id },
          ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
        },
        trigger: {
          type: Notifications!.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
        },
      });
    }

    await markRan();
  } catch (error) {
    console.warn('[CapNotificationService] scheduleCapDeadlineNotifications error:', error);
  }
}

export async function cancelCapNotification(capId: string): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`cap-${capId}-deadline`);
  } catch (error) {
    console.warn('[CapNotificationService] cancelCapNotification error:', error);
  }
}
