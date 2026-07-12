// __tests__/services/NotificationService.test.ts
// Simulates a dev-build environment (not Expo Go) so getNotifications() returns the module.
jest.mock('expo-constants', () => ({ default: { appOwnership: 'standalone' } }), { virtual: true });

const mockSetNotificationHandler               = jest.fn();
const mockGetPermissionsAsync                  = jest.fn();
const mockRequestPermissionsAsync              = jest.fn();
const mockSetNotificationChannelAsync          = jest.fn();
const mockScheduleNotificationAsync            = jest.fn();
const mockCancelScheduledNotificationAsync     = jest.fn();
const mockCancelAllScheduledNotificationsAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  setNotificationHandler: mockSetNotificationHandler,
  getPermissionsAsync: mockGetPermissionsAsync,
  requestPermissionsAsync: mockRequestPermissionsAsync,
  setNotificationChannelAsync: mockSetNotificationChannelAsync,
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  cancelScheduledNotificationAsync: mockCancelScheduledNotificationAsync,
  cancelAllScheduledNotificationsAsync: mockCancelAllScheduledNotificationsAsync,
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}), { virtual: true });

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestPermission,
  isEnabled,
  setEnabled,
  scheduleForAgendaItem,
  cancelForAgendaItem,
  rescheduleAll,
  AgendaNotificationPayload,
} from '../../src/services/NotificationService';

// StorageKeys.NOTIFICATIONS_ENABLED = 'NOTIFICATIONS_ENABLED'
const NOTIF_KEY = 'NOTIFICATIONS_ENABLED';

const future = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours from now

const item: AgendaNotificationPayload = {
  id: 'a1',
  facilityName: 'Facility A',
  date: future,
};

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
  mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
  mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
  mockScheduleNotificationAsync.mockResolvedValue('notif-id');
  mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
  mockCancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
});

describe('requestPermission', () => {
  it('returns true when already granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    expect(await requestPermission()).toBe(true);
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests and returns true when granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    expect(await requestPermission()).toBe(true);
  });

  it('returns false when denied', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    expect(await requestPermission()).toBe(false);
  });

  it('returns false on error', async () => {
    mockGetPermissionsAsync.mockRejectedValue(new Error('perm error'));
    expect(await requestPermission()).toBe(false);
  });
});

describe('isEnabled', () => {
  it('returns true by default (no stored value)', async () => {
    expect(await isEnabled()).toBe(true);
  });

  it('returns stored value', async () => {
    await AsyncStorage.setItem(NOTIF_KEY, 'false');
    expect(await isEnabled()).toBe(false);
  });

  it('returns false on storage error', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('err'));
    expect(await isEnabled()).toBe(false);
  });
});

describe('setEnabled', () => {
  it('persists true', async () => {
    await setEnabled(true);
    expect(await AsyncStorage.getItem(NOTIF_KEY)).toBe('true');
    expect(mockCancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });

  it('persists false and cancels all', async () => {
    await setEnabled(false);
    expect(await AsyncStorage.getItem(NOTIF_KEY)).toBe('false');
    expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });
});

describe('scheduleForAgendaItem', () => {
  it('schedules both pre and day notifications for future item', async () => {
    await scheduleForAgendaItem(item);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(2);
    const ids = mockScheduleNotificationAsync.mock.calls.map((c: any) => c[0].identifier);
    expect(ids).toContain('agenda-a1-pre');
    expect(ids).toContain('agenda-a1-day');
  });

  it('skips scheduling when notifications disabled', async () => {
    await AsyncStorage.setItem(NOTIF_KEY, 'false');
    await scheduleForAgendaItem(item);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('skips scheduling when permission denied', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await scheduleForAgendaItem(item);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('does not schedule pre-notification for past time', async () => {
    const soonItem: AgendaNotificationPayload = {
      id: 'a2',
      facilityName: 'Facility B',
      date: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min from now — pre is in past
    };
    await scheduleForAgendaItem(soonItem);
    const ids = mockScheduleNotificationAsync.mock.calls.map((c: any) => c[0].identifier);
    expect(ids).not.toContain('agenda-a2-pre');
  });

  it('swallows errors silently', async () => {
    mockCancelScheduledNotificationAsync.mockRejectedValue(new Error('cancel err'));
    await expect(scheduleForAgendaItem(item)).resolves.toBeUndefined();
  });
});

describe('cancelForAgendaItem', () => {
  it('cancels both identifiers', async () => {
    await cancelForAgendaItem('a1');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('agenda-a1-pre');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('agenda-a1-day');
  });

  it('swallows errors silently', async () => {
    mockCancelScheduledNotificationAsync.mockRejectedValue(new Error('err'));
    await expect(cancelForAgendaItem('a1')).resolves.toBeUndefined();
  });
});

describe('rescheduleAll', () => {
  it('cancels all then reschedules each item', async () => {
    const items = [item, { ...item, id: 'a2', facilityName: 'Facility B' }];
    await rescheduleAll(items);
    expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(mockScheduleNotificationAsync.mock.calls.length).toBeGreaterThan(0);
  });

  it('does not reschedule when disabled', async () => {
    await AsyncStorage.setItem(NOTIF_KEY, 'false');
    await rescheduleAll([item]);
    expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('swallows errors silently', async () => {
    mockCancelAllScheduledNotificationsAsync.mockRejectedValue(new Error('err'));
    await expect(rescheduleAll([item])).resolves.toBeUndefined();
  });
});
