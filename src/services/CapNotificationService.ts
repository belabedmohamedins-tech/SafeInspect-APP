// src/services/CapNotificationService.ts
//
// Three notification strategies:
//
//  A) Per-item alerts — one notification per CAP item whose deadline falls
//     within the next 7 days, fired at 09:00 on deadline day.
//
//  B) Daily grouped digest — a single summary notification fired at 08:00
//     every morning showing overdue + due-today + due-this-week counts.
//     Tapping it deep-links to the Actions tab (filtered to overdue).
//
//  C) Weekly Monday digest (Phase 19) — a richer weekly summary fired at
//     08:00 every Monday. Shows open, overdue, near-deadline counts and a
//     resolution rate. Scheduled once per week; tapping opens the Actions tab.
//
// Phase-16: calls persistOverdueEscalation() before scheduling so stored
// status values are accurate, and uses getStats() for the digest counts.
//
// ⚠️  expo-notifications Android remote push was removed from Expo Go in
//     SDK 53. Every Notifications call is guarded so the app works in Expo Go
//     (notifications silently disabled) and works fully in dev builds / prod.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { StorageKeys } from '../repositories/keys';
import { isEnabled, requestPermission } from './NotificationService';

// ─── Expo Go guard ──────────────────────────────────────────────────
const IS_EXPO_GO = Constants.appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;
try {
  if (!IS_EXPO_GO) {
    Notifications = require('expo-notifications');
  }
} catch (e) {
  console.warn('[CapNotificationService] expo-notifications unavailable:', e);
}

// ─── Constants ────────────────────────────────────────────────────────────
const CHANNEL_ID             = 'cap-deadlines';
const DIGEST_CHANNEL_ID      = 'cap-digest';
const WEEKLY_CHANNEL_ID      = 'cap-weekly-digest';
const WARN_DAYS              = 7;
const DIGEST_HOUR            = 8;   // 08:00 local time
const DIGEST_ID_PREFIX       = 'cap-digest-';
const WEEKLY_DIGEST_ID_PREFIX = 'cap-weekly-';

// ─── Channel helpers ────────────────────────────────────────────────────────
async function ensureChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name:             'مواعيد الإجراءات التصحيحية',
    importance:       Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor:       '#da7101',
  });
}

async function ensureDigestChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(DIGEST_CHANNEL_ID, {
    name:             'ملخص الإجراءات التصحيحية اليومي',
    importance:       Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150],
    lightColor:       '#7b1fa2',
  });
}

async function ensureWeeklyChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(WEEKLY_CHANNEL_ID, {
    name:             'الملخص الأسبوعي للإجراءات التصحيحية',
    importance:       Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 200, 300],
    lightColor:       '#01696f',
  });
}

// ─── Run-once-per-day guard ───────────────────────────────────────────────────
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

// ─── Run-once-per-week guard (Monday key) ─────────────────────────────────────
/**
 * Returns the ISO date string (YYYY-MM-DD) of the coming Monday.
 * If today IS Monday, returns today.
 */
function nextOrTodayMonday(from: Date = new Date()): string {
  const d    = new Date(from);
  const day  = d.getDay(); // 0 = Sun, 1 = Mon … 6 = Sat
  const diff = day === 1 ? 0 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

async function shouldRunWeekly(): Promise<boolean> {
  try {
    const last         = await AsyncStorage.getItem(StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN);
    const nextMonday   = nextOrTodayMonday();
    // Only reschedule if we haven’t already scheduled for this Monday
    return last !== nextMonday;
  } catch {
    return true;
  }
}

async function markWeeklyRan(mondayKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN, mondayKey);
  } catch { /* ignore */ }
}

// ─── Date helpers ───────────────────────────────────────────────────────────────────
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── A) Per-item alerts ─────────────────────────────────────────────────────────────────
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

// ─── B) Grouped daily digest ─────────────────────────────────────────────────────────────
export async function scheduleCapDigestNotification(): Promise<void> {
  if (!Notifications) return;
  try {
    const prevId = await AsyncStorage.getItem(StorageKeys.CAP_DIGEST_NOTIF_ID);
    if (prevId) {
      try { await Notifications.cancelScheduledNotificationAsync(prevId); } catch { /* ok */ }
    }

    const stats        = await CorrectiveActionRepository.getStats(WARN_DAYS);
    const overdueCount = stats.overdue;
    const now          = new Date();
    const today        = startOfDay(now);
    const todayStr     = today.toISOString().slice(0, 10);

    const allOpen       = await CorrectiveActionRepository.getOpen();
    const dueTodayCount = allOpen.filter(
      a => a.status !== 'overdue' && a.deadline === todayStr,
    ).length;
    const dueWeekCount = stats.nearDeadlineCount - dueTodayCount;

    if (overdueCount === 0 && dueTodayCount === 0 && dueWeekCount === 0) return;

    const parts: string[] = [];
    if (overdueCount  > 0) parts.push(`${overdueCount} متأخر`);
    if (dueTodayCount > 0) parts.push(`${dueTodayCount} موعده اليوم`);
    if (dueWeekCount  > 0) parts.push(`${dueWeekCount} خلال هذا الأسبوع`);

    const title = overdueCount > 0
      ? `🔴 ${overdueCount} إجراء${overdueCount > 1 ? 'ات' : ''} تصحيحي متأخر`
      : `🟡 ${dueTodayCount + dueWeekCount} إجراء تصحيحي قادم`;

    const fireAt = new Date(today);
    fireAt.setHours(DIGEST_HOUR, 0, 0, 0);
    if (fireAt <= now) fireAt.setDate(fireAt.getDate() + 1);

    const identifier = `${DIGEST_ID_PREFIX}${fireAt.toISOString().slice(0, 10)}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body: parts.join(' · '),
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

    await AsyncStorage.setItem(StorageKeys.CAP_DIGEST_NOTIF_ID, identifier);
  } catch (error) {
    console.warn('[CapNotificationService] scheduleCapDigestNotification error:', error);
  }
}

// ─── C) Weekly Monday digest (Phase 19) ──────────────────────────────────────────────────
export async function scheduleCapWeeklyDigest(): Promise<void> {
  if (!Notifications) return;
  try {
    if (!(await shouldRunWeekly())) return;

    // Cancel previous weekly notification if any
    const prevId = await AsyncStorage.getItem(StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID);
    if (prevId) {
      try { await Notifications.cancelScheduledNotificationAsync(prevId); } catch { /* ok */ }
    }

    // Single-pass stats
    const stats = await CorrectiveActionRepository.getStats(WARN_DAYS);

    // Skip scheduling if there is nothing to report
    if (stats.total === 0) return;

    // Build resolution rate label
    const resolutionPct = stats.total > 0
      ? Math.round((stats.resolved / stats.total) * 100)
      : 0;

    // Compose notification title based on urgency
    let title: string;
    if (stats.overdue > 0) {
      title = `🔴 ملخص أسبوعي: ${stats.overdue} إجراء${stats.overdue > 1 ? 'ات' : ''} متأخرة`;
    } else if (stats.nearDeadlineCount > 0) {
      title = `🟡 ملخص أسبوعي: ${stats.nearDeadlineCount} إجراء${stats.nearDeadlineCount > 1 ? 'ات' : ''} تستحق قريباً`;
    } else {
      title = `🟢 ملخص أسبوعي: لا توجد إجراءات عاجلة`;
    }

    // Compose body lines
    const bodyParts: string[] = [];
    if (stats.open > 0)            bodyParts.push(`مفتوح: ${stats.open}`);
    if (stats.inProgress > 0)      bodyParts.push(`جارٍ: ${stats.inProgress}`);
    if (stats.overdue > 0)         bodyParts.push(`متأخر: ${stats.overdue}`);
    if (stats.nearDeadlineCount > 0) bodyParts.push(`يستحق خلال 3 أيام: ${stats.nearDeadlineCount}`);
    bodyParts.push(`نسبة الإنجاز: ${resolutionPct}%`);

    // Fire at 08:00 on the next (or current) Monday
    const mondayKey = nextOrTodayMonday();
    const mondayDate = new Date(mondayKey);
    mondayDate.setHours(DIGEST_HOUR, 0, 0, 0);

    // If that Monday at 08:00 is already past, push to next Monday
    const now = new Date();
    if (mondayDate <= now) {
      mondayDate.setDate(mondayDate.getDate() + 7);
    }

    const identifier = `${WEEKLY_DIGEST_ID_PREFIX}${mondayDate.toISOString().slice(0, 10)}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body: bodyParts.join(' · '),
        data: {
          screen: 'actions',
          filter: stats.overdue > 0 ? 'overdue' : 'all',
        },
        ...(Platform.OS === 'android' && { channelId: WEEKLY_CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: mondayDate,
      },
    });

    await AsyncStorage.setItem(StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID, identifier);
    await markWeeklyRan(mondayKey);

    console.log(
      `[CapNotificationService] 📅 Weekly digest scheduled for ${mondayDate.toISOString()}`,
    );
  } catch (error) {
    console.warn('[CapNotificationService] scheduleCapWeeklyDigest error:', error);
  }
}

// ─── Main entry point (called from home.tsx on mount) ─────────────────────────────────
export async function scheduleCapDeadlineNotifications(): Promise<void> {
  if (!Notifications) return;
  try {
    if (!(await shouldRun())) return;
    if (!(await isEnabled())) return;
    if (!(await requestPermission())) return;

    await ensureChannel();
    await ensureDigestChannel();
    await ensureWeeklyChannel();

    // Phase-16: flush overdue promotions to storage FIRST so all subsequent
    // reads (per-item loop + digest stats) see accurate status values.
    const promoted = await CorrectiveActionRepository.persistOverdueEscalation();
    if (promoted > 0) {
      console.log(`[CapNotificationService] ⚠️ Promoted ${promoted} item(s) to overdue.`);
    }

    // A) Per-item alerts
    await schedulePerItemAlerts();

    // B) Grouped daily digest
    await scheduleCapDigestNotification();

    // C) Weekly Monday digest (Phase 19)
    await scheduleCapWeeklyDigest();

    await markRan();
  } catch (error) {
    console.warn('[CapNotificationService] scheduleCapDeadlineNotifications error:', error);
  }
}

// ─── Cancel helpers ─────────────────────────────────────────────────────────────────────
export async function cancelCapNotification(capId: string): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`cap-${capId}-deadline`);
  } catch (error) {
    console.warn('[CapNotificationService] cancelCapNotification error:', error);
  }
}

/** Cancel the pending daily digest (e.g. when all CAPs are resolved). */
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

/** Cancel the pending weekly Monday digest. */
export async function cancelCapWeeklyDigestNotification(): Promise<void> {
  if (!Notifications) return;
  try {
    const id = await AsyncStorage.getItem(StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID);
      await AsyncStorage.removeItem(StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN);
    }
  } catch (error) {
    console.warn('[CapNotificationService] cancelCapWeeklyDigestNotification error:', error);
  }
}
