// src/__tests__/NotificationService.test.ts
//
// NotificationService.getNotifications() calls require('expo-constants') lazily
// on each function invocation (not at module-load time), so the moduleNameMapper
// mock for expo-constants is always in effect by the time any test runs.
// Our __mocks__/expo-constants.js sets appOwnership: 'standalone', so
// getNotifications() returns the expo-notifications mock (not null).
//
// The Expo Go (null) path is tested by temporarily replacing the
// expo-constants mock to return appOwnership: 'expo'.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const mockGetPerms   = jest.mocked(Notifications.getPermissionsAsync);
const mockReqPerms   = jest.mocked(Notifications.requestPermissionsAsync);
const mockSetChannel = jest.mocked(Notifications.setNotificationChannelAsync);
const mockSchedule   = jest.mocked(Notifications.scheduleNotificationAsync);
const mockCancelOne  = jest.mocked(Notifications.cancelScheduledNotificationAsync);
const mockCancelAll  = jest.mocked(Notifications.cancelAllScheduledNotificationsAsync);
const { __resetStore: resetAsync } = AsyncStorage as any;

import {
  requestPermission,
  isEnabled,
  setEnabled,
  scheduleForAgendaItem,
  cancelForAgendaItem,
  rescheduleAll,
  AgendaNotificationPayload,
} from '../services/NotificationService';

const FUTURE = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

function makeItem(overrides: Partial<AgendaNotificationPayload> = {}): AgendaNotificationPayload {
  return { id: 'item-1', facilityName: 'Test Facility', date: FUTURE, ...overrides };
}

beforeEach(() => {
  resetAsync();
  jest.clearAllMocks();
  mockGetPerms.mockResolvedValue({ status: 'granted' } as any);
  mockReqPerms.mockResolvedValue({ status: 'granted' } as any);
  mockSetChannel.mockResolvedValue(null as any);
  mockSchedule.mockResolvedValue('notif-id');
  mockCancelOne.mockResolvedValue(undefined);
  mockCancelAll.mockResolvedValue(undefined);
});

// Helper: temporarily make getNotifications() return null (simulate Expo Go)
function withExpoGo(fn: () => Promise<void>) {
  return async () => {
    const constants = require('expo-constants');
    const original = constants.default?.appOwnership ?? constants.appOwnership;
    if (constants.default) constants.default.appOwnership = 'expo';
    else constants.appOwnership = 'expo';
    try {
      await fn();
    } finally {
      if (constants.default) constants.default.appOwnership = original;
      else constants.appOwnership = original;
    }
  };
}

describe('NotificationService', () => {
  describe('requestPermission', () => {
    it('returns true when already granted', async () => {
      mockGetPerms.mockResolvedValueOnce({ status: 'granted' } as any);
      expect(await requestPermission()).toBe(true);
      expect(mockReqPerms).not.toHaveBeenCalled();
    });

    it('requests permission when not yet granted and returns true on grant', async () => {
      mockGetPerms.mockResolvedValueOnce({ status: 'undetermined' } as any);
      mockReqPerms.mockResolvedValueOnce({ status: 'granted' } as any);
      expect(await requestPermission()).toBe(true);
    });

    it('returns false when permission is denied', async () => {
      mockGetPerms.mockResolvedValueOnce({ status: 'undetermined' } as any);
      mockReqPerms.mockResolvedValueOnce({ status: 'denied' } as any);
      expect(await requestPermission()).toBe(false);
    });

    it('creates android notification channel when OS is android', async () => {
      (Platform as any).OS = 'android';
      mockGetPerms.mockResolvedValueOnce({ status: 'undetermined' } as any);
      mockReqPerms.mockResolvedValueOnce({ status: 'granted' } as any);
      await requestPermission();
      expect(mockSetChannel).toHaveBeenCalledWith(
        'agenda',
        expect.objectContaining({ name: expect.any(String) }),
      );
    });

    it('returns false when Notifications throws', async () => {
      mockGetPerms.mockRejectedValueOnce(new Error('hw error'));
      expect(await requestPermission()).toBe(false);
    });

    // Line 34: getNotifications() returns null in Expo Go → return false immediately
    it('returns false in Expo Go environment (getNotifications returns null)', withExpoGo(async () => {
      expect(await requestPermission()).toBe(false);
      expect(mockGetPerms).not.toHaveBeenCalled();
    }));
  });

  describe('isEnabled / setEnabled', () => {
    it('defaults to true when no value is stored', async () => {
      expect(await isEnabled()).toBe(true);
    });
    it('returns false after setEnabled(false)', async () => {
      await setEnabled(false);
      expect(await isEnabled()).toBe(false);
    });
    it('returns true after setEnabled(true)', async () => {
      await setEnabled(false);
      await setEnabled(true);
      expect(await isEnabled()).toBe(true);
    });
    it('cancels all scheduled notifications when disabled', async () => {
      await setEnabled(false);
      expect(mockCancelAll).toHaveBeenCalledTimes(1);
    });
    it('does not cancel notifications when enabled', async () => {
      await setEnabled(true);
      expect(mockCancelAll).not.toHaveBeenCalled();
    });

    // Line 96: isEnabled storage catch → returns false
    it('returns false when AsyncStorage.getItem throws', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('storage error'));
      expect(await isEnabled()).toBe(false);
    });
  });

  describe('scheduleForAgendaItem', () => {
    it('schedules two notifications for a future item', async () => {
      await scheduleForAgendaItem(makeItem());
      expect(mockSchedule).toHaveBeenCalledTimes(2);
    });
    it('does nothing when notifications are disabled', async () => {
      await setEnabled(false);
      jest.clearAllMocks();
      mockCancelOne.mockResolvedValue(undefined);
      await scheduleForAgendaItem(makeItem());
      expect(mockSchedule).not.toHaveBeenCalled();
    });
    it('does nothing when permission is denied', async () => {
      mockGetPerms.mockResolvedValueOnce({ status: 'denied' } as any);
      mockReqPerms.mockResolvedValueOnce({ status: 'denied' } as any);
      await scheduleForAgendaItem(makeItem());
      expect(mockSchedule).not.toHaveBeenCalled();
    });
    it('does not schedule pre-notification for an item less than 1 hour away', async () => {
      const soonDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await scheduleForAgendaItem(makeItem({ date: soonDate }));
      const identifiers = mockSchedule.mock.calls.map(c => (c[0] as any).identifier as string);
      expect(identifiers).not.toContain('agenda-item-1-pre');
    });
    it('cancels existing notifications before rescheduling', async () => {
      await scheduleForAgendaItem(makeItem());
      expect(mockCancelOne).toHaveBeenCalledWith('agenda-item-1-pre');
      expect(mockCancelOne).toHaveBeenCalledWith('agenda-item-1-day');
    });

    // Line 161: Notifications is null (Expo Go) → scheduleForAgendaItem returns early
    it('does nothing in Expo Go environment', withExpoGo(async () => {
      await scheduleForAgendaItem(makeItem());
      expect(mockSchedule).not.toHaveBeenCalled();
    }));
  });

  describe('cancelForAgendaItem', () => {
    it('cancels both pre and day-of notifications', async () => {
      await cancelForAgendaItem('abc');
      expect(mockCancelOne).toHaveBeenCalledWith('agenda-abc-pre');
      expect(mockCancelOne).toHaveBeenCalledWith('agenda-abc-day');
    });

    // Line 174: cancelForAgendaItem error catch
    it('swallows errors when cancelScheduledNotificationAsync throws', async () => {
      mockCancelOne.mockRejectedValueOnce(new Error('cancel failed'));
      await expect(cancelForAgendaItem('abc')).resolves.toBeUndefined();
    });

    // Line 161: Notifications null in Expo Go → cancelForAgendaItem returns early
    it('does nothing in Expo Go environment', withExpoGo(async () => {
      await cancelForAgendaItem('abc');
      expect(mockCancelOne).not.toHaveBeenCalled();
    }));
  });

  describe('rescheduleAll', () => {
    it('cancels all then reschedules each item', async () => {
      const items = [makeItem({ id: '1' }), makeItem({ id: '2' })];
      await rescheduleAll(items);
      expect(mockCancelAll).toHaveBeenCalledTimes(1);
      expect(mockSchedule.mock.calls.length).toBeGreaterThan(0);
    });
    it('cancels all but does not reschedule when disabled', async () => {
      await setEnabled(false);
      jest.clearAllMocks();
      mockCancelAll.mockResolvedValue(undefined);
      await rescheduleAll([makeItem()]);
      expect(mockCancelAll).toHaveBeenCalledTimes(1);
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    // Line 161: rescheduleAll Notifications null guard
    it('does nothing in Expo Go environment', withExpoGo(async () => {
      await rescheduleAll([makeItem()]);
      expect(mockCancelAll).not.toHaveBeenCalled();
    }));

    // Line 189: rescheduleAll error catch
    it('swallows errors when cancelAllScheduledNotificationsAsync throws', async () => {
      mockCancelAll.mockRejectedValueOnce(new Error('bulk cancel failed'));
      await expect(rescheduleAll([makeItem()])).resolves.toBeUndefined();
    });
  });

  // Line 44: handler-already-installed guard — second call to getNotificationsWithHandler
  // must not call setNotificationHandler again (flag is module-level)
  describe('handler installation guard (line 44)', () => {
    it('only installs the notification handler once across multiple calls', async () => {
      const mockSetHandler = jest.mocked(Notifications.setNotificationHandler);
      mockSetHandler.mockClear();
      // Two sequential calls — handler should only be set once per module lifetime
      await requestPermission();
      await requestPermission();
      // The handler is installed at most once (the guard prevents re-installation)
      expect(mockSetHandler.mock.calls.length).toBeLessThanOrEqual(1);
    });
  });
});
