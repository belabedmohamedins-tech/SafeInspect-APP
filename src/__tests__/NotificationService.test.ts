// src/__tests__/NotificationService.test.ts
//
// NotificationService reads IS_EXPO_GO from expo-constants at call time
// (lazy require inside getNotifications()).  Layer 3 (jest.setup.ts) sets
// Constants.appOwnership = 'standalone' globally so IS_EXPO_GO = false.
//
// Tests that need IS_EXPO_GO = true temporarily override appOwnership
// before the call and restore it after.

import AsyncStorage from '@react-native-async-storage/async-storage';

const { __resetStore } = AsyncStorage as unknown as { __resetStore: () => void };

// ─── expo-notifications spy handles ──────────────────────────────────────────
// The L2 mock (expo-notifications) exports jest.fn() stubs.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Notifications = require('expo-notifications');

beforeEach(() => {
  __resetStore();
  jest.clearAllMocks();
  // Default permission responses
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.scheduleNotificationAsync.mockResolvedValue('id');
  Notifications.cancelScheduledNotificationAsync.mockResolvedValue(undefined);
  Notifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
  Notifications.setNotificationHandler.mockReturnValue(undefined);
  Notifications.AndroidImportance = { HIGH: 4 };
  Notifications.SchedulableTriggerInputTypes = { DATE: 'date' };
  Notifications.setNotificationChannelAsync = jest.fn().mockResolvedValue(undefined);
});

function setExpoGo(value: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const C = require('expo-constants');
  const target = C.default ?? C;
  target.appOwnership = value ? 'expo' : 'standalone';
}

import {
  requestPermission,
  isEnabled,
  setEnabled,
  scheduleForAgendaItem,
  cancelForAgendaItem,
  rescheduleAll,
} from '../../src/services/NotificationService';

const futureItem = {
  id: 'item-1',
  facilityName: 'Test Facility',
  // 48 hours from now — both pre and morning triggers will be in the future
  date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
};

// ─── requestPermission ───────────────────────────────────────────────────────

describe('requestPermission', () => {
  it('returns false when running in Expo Go (IS_EXPO_GO = true)', async () => {
    setExpoGo(true);
    const result = await requestPermission();
    expect(result).toBe(false);
    setExpoGo(false);
  });

  it('returns true when permission is already granted', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    const result = await requestPermission();
    expect(result).toBe(true);
  });

  it('requests permission when not yet granted and returns true on grant', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    const result = await requestPermission();
    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('returns false when user denies permission', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const result = await requestPermission();
    expect(result).toBe(false);
  });

  it('returns false and does not throw when Notifications throws (line 34 catch branch)', async () => {
    Notifications.getPermissionsAsync.mockRejectedValueOnce(new Error('hw error'));
    const result = await requestPermission();
    expect(result).toBe(false);
  });
});

// ─── isEnabled / setEnabled ───────────────────────────────────────────────────

describe('isEnabled', () => {
  it('returns true by default (no stored value)', async () => {
    expect(await isEnabled()).toBe(true);
  });

  it('returns stored value when present', async () => {
    await setEnabled(false);
    expect(await isEnabled()).toBe(false);
    await setEnabled(true);
    expect(await isEnabled()).toBe(true);
  });
});

describe('setEnabled', () => {
  it('cancels all notifications when disabled', async () => {
    await setEnabled(false);
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });

  it('does not cancel notifications when enabled', async () => {
    await setEnabled(true);
    expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });

  it('does not call setNotificationHandler a second time (line 44 _handlerInstalled guard)', async () => {
    await requestPermission();
    const firstCallCount = Notifications.setNotificationHandler.mock.calls.length;
    await requestPermission();
    expect(Notifications.setNotificationHandler.mock.calls.length).toBe(firstCallCount);
  });
});

// ─── scheduleForAgendaItem ────────────────────────────────────────────────────

describe('scheduleForAgendaItem', () => {
  it('schedules two notifications for a future item', async () => {
    await scheduleForAgendaItem(futureItem);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('does nothing when IS_EXPO_GO is true', async () => {
    setExpoGo(true);
    await scheduleForAgendaItem(futureItem);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    setExpoGo(false);
  });

  it('does nothing when notifications are disabled', async () => {
    await setEnabled(false);
    await scheduleForAgendaItem(futureItem);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    await setEnabled(true);
  });

  it('does not throw when scheduleNotificationAsync throws', async () => {
    Notifications.scheduleNotificationAsync.mockRejectedValue(new Error('schedule error'));
    await expect(scheduleForAgendaItem(futureItem)).resolves.toBeUndefined();
  });
});

// ─── cancelForAgendaItem ──────────────────────────────────────────────────────

describe('cancelForAgendaItem', () => {
  it('cancels both pre and day notifications', async () => {
    await cancelForAgendaItem('item-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('agenda-item-1-pre');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('agenda-item-1-day');
  });

  it('does nothing when IS_EXPO_GO is true', async () => {
    setExpoGo(true);
    await cancelForAgendaItem('item-1');
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    setExpoGo(false);
  });

  it('does not throw when cancelScheduledNotificationAsync throws', async () => {
    Notifications.cancelScheduledNotificationAsync.mockRejectedValue(new Error('cancel error'));
    await expect(cancelForAgendaItem('item-1')).resolves.toBeUndefined();
  });
});

// ─── rescheduleAll ────────────────────────────────────────────────────────────

describe('rescheduleAll', () => {
  it('cancels all then reschedules each item', async () => {
    await rescheduleAll([futureItem]);
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('cancels all but skips scheduling when notifications are disabled', async () => {
    await setEnabled(false);
    // setEnabled(false) calls cancelAll once; rescheduleAll calls it again
    const callsBefore = Notifications.cancelAllScheduledNotificationsAsync.mock.calls.length;
    await rescheduleAll([futureItem]);
    expect(Notifications.cancelAllScheduledNotificationsAsync.mock.calls.length).toBeGreaterThan(callsBefore);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    await setEnabled(true);
  });

  it('returns early without any Notifications calls when IS_EXPO_GO is true (line 161)', async () => {
    setExpoGo(true);
    await rescheduleAll([futureItem]);
    expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    setExpoGo(false);
  });

  it('does not throw when cancelAllScheduledNotificationsAsync throws', async () => {
    Notifications.cancelAllScheduledNotificationsAsync.mockRejectedValueOnce(new Error('cancel all error'));
    await expect(rescheduleAll([futureItem])).resolves.toBeUndefined();
  });
});
