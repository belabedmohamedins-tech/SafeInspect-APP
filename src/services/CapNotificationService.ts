// src/services/CapNotificationService.ts
//
// Two notification strategies:
//
//  A) Per-item alerts (existing) — one notification per CAP item whose
//     deadline falls within the next 7 days, fired at 09:00 on deadline day.
//
//  B) [Phase-14] Daily grouped digest — a single summary notification fired
//     at 08:00 every morning that shows overdue + due-today + due-this-week
//     counts.  Tapping it deep-links to the Actions tab (filtered to overdue).
//
// ⚠️  expo-notifications Android remote push was removed from Expo Go in
//     SDK 53.  Every Notifications call is guarded so the app works in
//     Expo Go (notifications silently disabled) and works fully in
//     development builds and production.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { StorageKeys } from '../repositories/keys';
import { isEnabled, requestPermission } from './NotificationService';

// ─── Expo Go guard ─────────────────────────────────────────────────────────
const IS_EXPO_GO = Constants.appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;
try {
  if (!IS_EXPO_GO) {
    Notifications = require('expo-notifications');
  }
} catch (e) {
  console.warn('[CapNotificationService] expo-notifications unavailable:', e);
}

// ─── Constants ──────────────────────────────────────────────────────────────
const CHANNEL_ID   = 'cap-deadlines';
const DIGEST_CHANNEL_ID = 'cap-digest';
const WARN_DAYS    = 7;
const DIGEST_HOUR  = 8;  // 08:00 local time
const DIGEST_ID_PREFIX = 'cap-digest-';

// ─── Channel helpers ────────────────────────────────────────────────────────
async function ensureChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'مواعيد الإجراءات التصحيحية',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#da7101',
  });
}

async function ensureDigestChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(DIGEST_CHANNEL_ID, {
    name: 'ملخص الإجراءات التصحيحية اليومي',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150],
    lightColor: '#7b1fa2',
  });
}

// ─── Run-once-per-day guard ──────────────────────────────────────────────────
async function shouldRun(): Promise<boolean> {
  try {
    const last  = await AsyncStorage.getItem(StorageKeys.CAP_NOTIF_LAST_RUN);
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

// ─── Helpers ────────────────────────────────────────────────────────────────
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── A) Per-item alerts (unchanged logic) ───────────────────────────────────
async function schedulePerItemAlerts(): Promise<void> {
  const openItems  = await CorrectiveActionRepository.getOpen();
  const now        = new Date();
  const today      = startOfDay(now);
  const warnCutoff = addDays(today, WARN_DAYS);

  for (const item of openItems) {
    try {
      await Notifications!.cancelScheduledNotificationAsync(`cap-${item.id}-deadline`);
    } catch { /* might not exist */ }

    const deadline = startOfDay(new Date(item.deadline));
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
        body:  bodyText,
        data:  { capId: item.id, screen: 'actions' },
        ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
      },
      trigger: {
        type: Notifications!.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });
  }
}

// ─── B) Grouped daily digest ─────────────────────────────────────────────────
export async function scheduleCapDigestNotification(): Promise<void> {
  if (!Notifications) return;
  try {
    // Cancel previous digest (any day)
    const prevId = await AsyncStorage.getItem(StorageKeys.CAP_DIGEST_NOTIF_ID);
    if (prevId) {
      try { await Notifications.cancelScheduledNotificationAsync(prevId); } catch { /* ok */ }
    }

    const all    = await CorrectiveActionRepository.getAll();
    const now    = new Date();
    const today  = startOfDay(now);
    const week   = addDays(today, 7);

    const overdueCount  = all.filter(a => {
      if (a.status === 'resolved') return false;
      return startOfDay(new Date(a.deadline)) < today;
    }).length;

    const dueTodayCount = all.filter(a => {
      if (a.status === 'resolved') return false;
      const d = startOfDay(new Date(a.deadline));
      return d.getTime() === today.getTime();
    }).length;

    const dueWeekCount  = all.filter(a => {
      if (a.status === 'resolved') return false;
      const d = startOfDay(new Date(a.deadline));
      return d > today && d <= week;
    }).length;

    // Nothing to report
    if (overdueCount === 0 && dueTodayCount === 0 && dueWeekCount === 0) return;

    // Build Arabic summary body
    const parts: string[] = [];
    if (overdueCount  > 0) parts.push(`${overdueCount} متأخر`);
    if (dueTodayCount > 0) parts.push(`${dueTodayCount} موعده اليوم`);
    if (dueWeekCount  > 0) parts.push(`${dueWeekCount} خلال هذا الأسبوع`);

    const title = overdueCount > 0
      ? `🔴 ${overdueCount} إجراء${overdueCount > 1 ? 'ات' : ''} تصحيحي متأخر`
      : `🟡 ${dueTodayCount + dueWeekCount} إجراء تصحيحي قادم`;

    const body = parts.join(' · ');

    // Fire at 08:00 today; if already past, schedule for tomorrow 08:00
    const fireAt = new Date(today);
    fireAt.setHours(DIGEST_HOUR, 0, 0, 0);
    if (fireAt <= now) {
      fireAt.setDate(fireAt.getDate() + 1);
    }

    const identifier = `${DIGEST_ID_PREFIX}${fireAt.toISOString().slice(0, 10)}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        data: {
          screen: 'actions',
          filter: overdueCount > 0 ? 'overdue' : 'all',
        },
        ...(Platform.OS === 'android' && { channelId: DIGEST_CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });

    // Persist identifier so next run can cancel it
    await AsyncStorage.setItem(StorageKeys.CAP_DIGEST_NOTIF_ID, identifier);
  } catch (error) {
    console.warn('[CapNotificationService] scheduleCapDigestNotification error:', error);
  }
}

// ─── Main entry point (called from home.tsx on mount) ───────────────────────
export async function scheduleCapDeadlineNotifications(): Promise<void> {
  if (!Notifications) return;
  try {
    if (!(await shouldRun())) return;
    if (!(await isEnabled())) return;
    if (!(await requestPermission())) return;

    await ensureChannel();
    await ensureDigestChannel();

    // A) Per-item alerts
    await schedulePerItemAlerts();

    // B) Grouped digest
    await scheduleCapDigestNotification();

    await markRan();
  } catch (error) {
    console.warn('[CapNotificationService] scheduleCapDeadlineNotifications error:', error);
  }
}

// ─── Cancel helpers ──────────────────────────────────────────────────────────
export async function cancelCapNotification(capId: string): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`cap-${capId}-deadline`);
  } catch (error) {
    console.warn('[CapNotificationService] cancelCapNotification error:', error);
  }
}

/** Cancel the pending digest (e.g. when all CAPs are resolved) */
export async function cancelCapDigestNotification(): Promise<void> {
  if (!Notifications) return;
  try {
    const id = await AsyncStorage.getItem(StorageKeys.CAP_DIGEST_NOTIF_ID);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(StorageKeys.CAP_DIGEST_NOTIF_ID);
    }
  } catch (error) {
    console.warn('[CapNotificationService] cancelCapDigestNotification error:', error);
  }
}
