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
  CorrectiveActionRepository: { getOpen: jest.fn() },
}));

jest.mock('../services/NotificationService', () => ({
  isEnabled:         jest.fn(),
  requestPermission: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { isEnabled, requestPermission } from '../services/NotificationService';
import {
  scheduleCapDeadlineNotifications,
  cancelCapNotification,
} from '../services/CapNotificationService';
import { CorrectiveAction } from '../types';

// ─── Typed stubs ─────────────────────────────────────────────────────────────
const mockSchedule   = jest.mocked(Notifications.scheduleNotificationAsync);
const mockCancelOne  = jest.mocked(Notifications.cancelScheduledNotificationAsync);
const mockSetChannel = jest.mocked(Notifications.setNotificationChannelAsync);
const mockGetOpen    = jest.mocked(CorrectiveActionRepository.getOpen);
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
    deadline: tomorrow.toISOString(),
    assignedTo: 'Inspector A',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  resetAsync();
  jest.clearAllMocks();
  mockIsEnabled.mockResolvedValue(true);
  mockReqPerm.mockResolvedValue(true);
  mockGetOpen.mockResolvedValue([]);
  mockSchedule.mockResolvedValue('notif-id');
  mockCancelOne.mockResolvedValue(undefined);
  mockSetChannel.mockResolvedValue(null as any);
});

describe('CapNotificationService', () => {
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
      mockGetOpen.mockResolvedValueOnce([makeCAP()]);
      await scheduleCapDeadlineNotifications();
      expect(mockSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: 'cap-cap-1-deadline' }),
      );
    });

    it('skips items whose deadline is already past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      mockGetOpen.mockResolvedValueOnce([makeCAP({ deadline: yesterday.toISOString() })]);
      await scheduleCapDeadlineNotifications();
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('skips items whose deadline is more than 7 days away', async () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 10);
      mockGetOpen.mockResolvedValueOnce([makeCAP({ deadline: farFuture.toISOString() })]);
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
      mockSchedule.mockResolvedValue('notif-id');
      mockCancelOne.mockResolvedValue(undefined);
      await scheduleCapDeadlineNotifications();
      expect(mockGetOpen).not.toHaveBeenCalled();
    });
  });

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
});
