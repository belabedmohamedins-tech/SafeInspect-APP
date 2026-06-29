// src/__tests__/NotificationService.test.ts
//
// expo-constants must be mocked BEFORE the service is imported so that
// IS_EXPO_GO = Constants.appOwnership === 'expo' evaluates to false,
// allowing the lazy `require('expo-notifications')` branch to execute
// and populate the module-level `Notifications` variable.

jest.mock('expo-constants', () => ({
  default: { appOwnership: 'standalone' },
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync:            jest.fn(),
  cancelScheduledNotificationAsync:     jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationChannelAsync:          jest.fn(),
  getPermissionsAsync:                  jest.fn(),
  requestPermissionsAsync:              jest.fn(),
  setNotificationHandler:               jest.fn(),
  AndroidImportance: { HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1, NONE: 0 },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
}));

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// ─── Typed stubs ─────────────────────────────────────────────────────────────────
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
      expect(mockSetChannel).toHaveBeenCalledWith('agenda', expect.objectContaining({ name: expect.any(String) }));
      (Platform as any).OS = 'ios';
    });

    it('returns false when Notifications throws', async () => {
      mockGetPerms.mockRejectedValueOnce(new Error('hw error'));
      expect(await requestPermission()).toBe(false);
    });
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
  });

  describe('cancelForAgendaItem', () => {
    it('cancels both pre and day-of notifications', async () => {
      await cancelForAgendaItem('abc');
      expect(mockCancelOne).toHaveBeenCalledWith('agenda-abc-pre');
      expect(mockCancelOne).toHaveBeenCalledWith('agenda-abc-day');
    });
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
  });
});
