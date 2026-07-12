// src/__tests__/CapNotificationService.test.ts

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

jest.mock('../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getOpen:                  jest.fn(),
    getStats:                 jest.fn(),
    persistOverdueEscalation: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../services/NotificationService', () => ({
  isEnabled:         jest.fn(),
  requestPermission: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { StorageKeys } from '../repositories/keys';
import { isEnabled, requestPermission } from '../services/NotificationService';
import {
  scheduleCapDeadlineNotifications,
  scheduleCapDigestNotification,
  scheduleCapWeeklyDigest,
  cancelCapNotification,
  cancelCapDigestNotification,
  cancelCapWeeklyDigestNotification,
} from '../services/CapNotificationService';
import { CorrectiveAction } from '../types';
import type { CapStats } from '../repositories/CorrectiveActionRepository';

// ─── Typed stubs ─────────────────────────────────────────────────────────────
const mockSchedule   = jest.mocked(Notifications.scheduleNotificationAsync);
const mockCancelOne  = jest.mocked(Notifications.cancelScheduledNotificationAsync);
const mockSetChannel = jest.mocked(Notifications.setNotificationChannelAsync);
const mockGetOpen    = jest.mocked(CorrectiveActionRepository.getOpen);
const mockGetStats   = jest.mocked(CorrectiveActionRepository.getStats);
const mockIsEnabled  = jest.mocked(isEnabled);
const mockReqPerm    = jest.mocked(requestPermission);
const { __resetStore: resetAsync } = AsyncStorage as any;

function makeCAP(overrides: Partial<CorrectiveAction> = {}): CorrectiveAction {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    id: 'cap-1',
    inspectionId: 'insp-1',
    facilityName: 'Test Facility',
    criteria: 'Safety rule',
    severity: 'high',
    status: 'open',
    deadline: tomorrow.toISOString().slice(0, 10),
    assignedTo: 'Inspector A',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeStats(overrides: Partial<CapStats> = {}): CapStats {
  return {
    open: 0,
    inProgress: 0,
    overdue: 0,
    resolved: 0,
    total: 0,
    nearDeadlineCount: 0,
    ...overrides,
  };
}

beforeEach(() => {
  resetAsync();
  jest.clearAllMocks();
  mockIsEnabled.mockResolvedValue(true);
  mockReqPerm.mockResolvedValue(true);
  mockGetOpen.mockResolvedValue([]);
  mockGetStats.mockResolvedValue(makeStats());
  mockSchedule.mockResolvedValue('notif-id');
  mockCancelOne.mockResolvedValue(undefined);
  mockSetChannel.mockResolvedValue(null as any);
});

describe('CapNotificationService', () => {
  // ─── A) Per-item deadline alerts ────────────────────────────────────────────
  describe('scheduleCapDeadlineNotifications', () => {
    it('does nothing when notifications are disabled', async () => {
      mockIsEnabled.mockResolvedValueOnce(false);
      await scheduleCapDeadlineNotifications();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('does nothing when permission is denied', async () => {
      mockReqPerm.mockResolvedValueOnce(false);
      await scheduleCapDeadlineNotifications();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('does nothing when no open items exist', async () => {
      mockGetOpen.mockResolvedValueOnce([]);
      await scheduleCapDeadlineNotifications();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('schedules a notification for a CAP item due tomorrow', async () => {
      mockGetOpen.mockResolvedValue([makeCAP()]);
      await scheduleCapDeadlineNotifications();
      expect(mockSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: 'cap-cap-1-deadline' }),
      );
    });

    it('skips items whose deadline is already past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      mockGetOpen.mockResolvedValueOnce([
        makeCAP({ deadline: yesterday.toISOString().slice(0, 10) }),
      ]);
      await scheduleCapDeadlineNotifications();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('skips items whose deadline is more than 7 days away', async () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 10);
      mockGetOpen.mockResolvedValueOnce([
        makeCAP({ deadline: farFuture.toISOString().slice(0, 10) }),
      ]);
      await scheduleCapDeadlineNotifications();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('marks the run date so it does not re-run the same day', async () => {
      mockGetOpen.mockResolvedValue([makeCAP()]);
      await scheduleCapDeadlineNotifications();
      jest.clearAllMocks();
      mockIsEnabled.mockResolvedValue(true);
      mockReqPerm.mockResolvedValue(true);
      mockGetOpen.mockResolvedValue([makeCAP()]);
      mockGetStats.mockResolvedValue(makeStats());
      mockSchedule.mockResolvedValue('notif-id');
      mockCancelOne.mockResolvedValue(undefined);
      await scheduleCapDeadlineNotifications();
      expect(mockGetOpen).not.toHaveBeenCalled();
    });

    // ── Branch: ensureDigestChannel on Android (line 122) ───────────────────
    it('calls setNotificationChannelAsync on Android (ensureDigestChannel)', async () => {
      const originalOS = Platform.OS;
      (Platform as any).OS = 'android';
      mockGetOpen.mockResolvedValue([makeCAP()]);
      await scheduleCapDeadlineNotifications();
      expect(mockSetChannel).toHaveBeenCalled();
      (Platform as any).OS = originalOS;
    });
  });

  // ─── B) Daily grouped digest ───────────────────────────────────────────────
  describe('scheduleCapDigestNotification', () => {
    it('does nothing when there are no overdue, due-today, or due-week items', async () => {
      mockGetStats.mockResolvedValueOnce(makeStats({ total: 5, resolved: 5 }));
      mockGetOpen.mockResolvedValueOnce([]);
      await scheduleCapDigestNotification();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('schedules a digest when there are overdue items', async () => {
      mockGetStats.mockResolvedValueOnce(makeStats({ overdue: 2, nearDeadlineCount: 2 }));
      mockGetOpen.mockResolvedValueOnce([]);
      await scheduleCapDigestNotification();
      expect(mockSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: expect.stringContaining('cap-digest-') }),
      );
    });

    it('schedules a digest when there are due-today items', async () => {
      const today = new Date().toISOString().slice(0, 10);
      mockGetStats.mockResolvedValueOnce(makeStats({ nearDeadlineCount: 1 }));
      mockGetOpen.mockResolvedValueOnce([
        makeCAP({ deadline: today, status: 'open' }),
      ]);
      await scheduleCapDigestNotification();
      expect(mockSchedule).toHaveBeenCalled();
    });

    it('schedules a digest when there are due-this-week items (no due-today)', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 3);
      mockGetStats.mockResolvedValueOnce(makeStats({ nearDeadlineCount: 2 }));
      mockGetOpen.mockResolvedValueOnce([
        makeCAP({ deadline: nextWeek.toISOString().slice(0, 10), status: 'open' }),
      ]);
      await scheduleCapDigestNotification();
      expect(mockSchedule).toHaveBeenCalled();
    });

    it('cancels the previous digest before scheduling a new one', async () => {
      await AsyncStorage.setItem(StorageKeys.CAP_DIGEST_NOTIF_ID, 'cap-digest-old');
      mockGetStats.mockResolvedValueOnce(makeStats({ overdue: 1, nearDeadlineCount: 1 }));
      mockGetOpen.mockResolvedValueOnce([]);
      await scheduleCapDigestNotification();
      expect(mockCancelOne).toHaveBeenCalledWith('cap-digest-old');
      expect(mockSchedule).toHaveBeenCalled();
    });

    it('swallows errors gracefully', async () => {
      mockGetStats.mockRejectedValueOnce(new Error('db error'));
      await expect(scheduleCapDigestNotification()).resolves.toBeUndefined();
    });

    // ── Branch: digest title when only due-today (no overdue) (line 257) ────
    it('uses yellow title when only due-today (no overdue)', async () => {
      const today = new Date().toISOString().slice(0, 10);
      mockGetStats.mockResolvedValueOnce(makeStats({ overdue: 0, nearDeadlineCount: 1 }));
      mockGetOpen.mockResolvedValueOnce([
        makeCAP({ deadline: today, status: 'open' }),
      ]);
      await scheduleCapDigestNotification();
      const call = mockSchedule.mock.calls[0][0] as any;
      expect(call.content.title).toContain('🟡');
    });
  });

  // ─── C) Weekly Monday digest ───────────────────────────────────────────────
  describe('scheduleCapWeeklyDigest', () => {
    it('does nothing when stats.total is 0', async () => {
      mockGetStats.mockResolvedValueOnce(makeStats({ total: 0 }));
      await scheduleCapWeeklyDigest();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('schedules the weekly digest when there are open items', async () => {
      mockGetStats.mockResolvedValueOnce(
        makeStats({ total: 3, open: 2, overdue: 1 }),
      );
      await scheduleCapWeeklyDigest();
      expect(mockSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: expect.stringContaining('cap-weekly-') }),
      );
    });

    it('schedules with a green title when no overdue or near-deadline items', async () => {
      mockGetStats.mockResolvedValueOnce(
        makeStats({ total: 2, open: 2, overdue: 0, nearDeadlineCount: 0 }),
      );
      await scheduleCapWeeklyDigest();
      const call = mockSchedule.mock.calls[0][0];
      expect((call as any).content.title).toContain('🟢');
    });

    it('schedules with a yellow title when items are near-deadline but not overdue', async () => {
      mockGetStats.mockResolvedValueOnce(
        makeStats({ total: 2, open: 2, overdue: 0, nearDeadlineCount: 1 }),
      );
      await scheduleCapWeeklyDigest();
      const call = mockSchedule.mock.calls[0][0];
      expect((call as any).content.title).toContain('🟡');
    });

    it('schedules with a red title when items are overdue', async () => {
      mockGetStats.mockResolvedValueOnce(
        makeStats({ total: 2, open: 1, overdue: 1, nearDeadlineCount: 0 }),
      );
      await scheduleCapWeeklyDigest();
      const call = mockSchedule.mock.calls[0][0];
      expect((call as any).content.title).toContain('🔴');
    });

    it('does not re-schedule if already ran this week', async () => {
      mockGetStats.mockResolvedValue(makeStats({ total: 2, open: 2 }));
      await scheduleCapWeeklyDigest();
      mockSchedule.mockClear();
      mockGetStats.mockResolvedValue(makeStats({ total: 2, open: 2 }));
      await scheduleCapWeeklyDigest();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('swallows errors gracefully', async () => {
      mockGetStats.mockRejectedValueOnce(new Error('network error'));
      await expect(scheduleCapWeeklyDigest()).resolves.toBeUndefined();
    });

    // ── Branch: body includes inProgress count (line 346) ───────────────────
    it('includes inProgress count in body when > 0', async () => {
      mockGetStats.mockResolvedValueOnce(
        makeStats({ total: 3, open: 1, inProgress: 2, overdue: 0, nearDeadlineCount: 0 }),
      );
      await scheduleCapWeeklyDigest();
      const call = mockSchedule.mock.calls[0][0] as any;
      expect(call.content.body).toContain('جارٍ: 2');
    });

    // ── Branch: body includes nearDeadlineCount when > 0 (line 360) ─────────
    it('includes nearDeadlineCount in body when > 0', async () => {
      mockGetStats.mockResolvedValueOnce(
        makeStats({ total: 3, open: 2, overdue: 0, nearDeadlineCount: 2 }),
      );
      await scheduleCapWeeklyDigest();
      const call = mockSchedule.mock.calls[0][0] as any;
      expect(call.content.body).toContain('يستحق خلال 3 أيام: 2');
    });
  });

  // ─── Cancel helpers ────────────────────────────────────────────────────────
  describe('cancelCapNotification', () => {
    it('cancels the correct notification identifier', async () => {
      await cancelCapNotification('cap-99');
      expect(mockCancelOne).toHaveBeenCalledWith('cap-cap-99-deadline');
    });

    it('does not throw when cancelScheduledNotificationAsync throws', async () => {
      mockCancelOne.mockRejectedValueOnce(new Error('not found'));
      await expect(cancelCapNotification('cap-99')).resolves.toBeUndefined();
    });
  });

  describe('cancelCapDigestNotification', () => {
    it('cancels stored digest notification id and removes it from storage', async () => {
      await AsyncStorage.setItem(StorageKeys.CAP_DIGEST_NOTIF_ID, 'cap-digest-2026-07-01');
      await cancelCapDigestNotification();
      expect(mockCancelOne).toHaveBeenCalledWith('cap-digest-2026-07-01');
    });

    it('does nothing when no digest id is stored', async () => {
      await cancelCapDigestNotification();
      expect(mockCancelOne).not.toHaveBeenCalled();
    });

    it('swallows errors gracefully', async () => {
      await AsyncStorage.setItem(StorageKeys.CAP_DIGEST_NOTIF_ID, 'cap-digest-old');
      mockCancelOne.mockRejectedValueOnce(new Error('gone'));
      await expect(cancelCapDigestNotification()).resolves.toBeUndefined();
    });
  });

  describe('cancelCapWeeklyDigestNotification', () => {
    it('cancels stored weekly notification id and removes it from storage', async () => {
      await AsyncStorage.setItem(StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID, 'cap-weekly-2026-07-07');
      await cancelCapWeeklyDigestNotification();
      expect(mockCancelOne).toHaveBeenCalledWith('cap-weekly-2026-07-07');
    });

    it('does nothing when no weekly id is stored', async () => {
      await cancelCapWeeklyDigestNotification();
      expect(mockCancelOne).not.toHaveBeenCalled();
    });

    it('swallows errors gracefully', async () => {
      await AsyncStorage.setItem(StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID, 'cap-weekly-old');
      mockCancelOne.mockRejectedValueOnce(new Error('gone'));
      await expect(cancelCapWeeklyDigestNotification()).resolves.toBeUndefined();
    });

    // ── Branch: also removes CAP_WEEKLY_DIGEST_LAST_RUN on cancel (line 360) ─
    it('removes CAP_WEEKLY_DIGEST_LAST_RUN from storage when cancelling', async () => {
      await AsyncStorage.setItem(StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID, 'cap-weekly-2026-07-07');
      await AsyncStorage.setItem(StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN, '2026-07-07');
      await cancelCapWeeklyDigestNotification();
      const lastRun = await AsyncStorage.getItem(StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN);
      expect(lastRun).toBeNull();
    });
  });
});
