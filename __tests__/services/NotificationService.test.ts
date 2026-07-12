// __tests__/services/NotificationService.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockSchedule = jest.fn().mockResolvedValue('id');
const mockCancel   = jest.fn().mockResolvedValue(undefined);
const mockCancelAll= jest.fn().mockResolvedValue(undefined);
const mockGetPerms = jest.fn().mockResolvedValue({ status: 'granted' });
const mockReqPerms = jest.fn().mockResolvedValue({ status: 'granted' });
const mockSetChan  = jest.fn().mockResolvedValue(undefined);
const mockSetHandler = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync:                   () => mockGetPerms(),
  requestPermissionsAsync:               () => mockReqPerms(),
  scheduleNotificationAsync:             (...a: any[]) => mockSchedule(...a),
  cancelScheduledNotificationAsync:      (...a: any[]) => mockCancel(...a),
  cancelAllScheduledNotificationsAsync:  () => mockCancelAll(),
  setNotificationChannelAsync:           (...a: any[]) => mockSetChan(...a),
  setNotificationHandler:                (...a: any[]) => mockSetHandler(...a),
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

jest.mock('expo-constants', () => ({ default: { appOwnership: 'standalone' } }));

import {
  requestPermission, isEnabled, setEnabled,
  scheduleForAgendaItem, cancelForAgendaItem, rescheduleAll,
} from '../../src/services/NotificationService';

const futureItem = {
  id: 'a1',
  facilityName: 'FAC',
  date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2h ahead
  notes: '',
};

beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
  mockGetPerms.mockResolvedValue({ status: 'granted' });
  mockReqPerms.mockResolvedValue({ status: 'granted' });
});

describe('requestPermission', () => {
  it('returns true when already granted', async () => {
    mockGetPerms.mockResolvedValue({ status: 'granted' });
    expect(await requestPermission()).toBe(true);
  });

  it('requests permission when not granted and returns true', async () => {
    mockGetPerms.mockResolvedValue({ status: 'undetermined' });
    mockReqPerms.mockResolvedValue({ status: 'granted' });
    expect(await requestPermission()).toBe(true);
  });

  it('returns false when denied', async () => {
    mockGetPerms.mockResolvedValue({ status: 'undetermined' });
    mockReqPerms.mockResolvedValue({ status: 'denied' });
    expect(await requestPermission()).toBe(false);
  });

  it('returns false on exception', async () => {
    mockGetPerms.mockRejectedValueOnce(new Error('HW'));
    expect(await requestPermission()).toBe(false);
  });
});

describe('isEnabled / setEnabled', () => {
  it('returns true by default (null key)', async () => {
    expect(await isEnabled()).toBe(true);
  });

  it('returns false when explicitly disabled', async () => {
    await setEnabled(false);
    expect(await isEnabled()).toBe(false);
  });

  it('setEnabled(false) cancels all scheduled notifications', async () => {
    await setEnabled(false);
    expect(mockCancelAll).toHaveBeenCalled();
  });

  it('setEnabled(true) does not call cancelAll', async () => {
    await setEnabled(true);
    expect(mockCancelAll).not.toHaveBeenCalled();
  });

  it('returns false on AsyncStorage failure', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    expect(await isEnabled()).toBe(false);
  });
});

describe('scheduleForAgendaItem', () => {
  it('schedules up to 2 notifications for future item', async () => {
    await AsyncStorage.setItem('NOTIFICATIONS_ENABLED', 'true');
    await scheduleForAgendaItem(futureItem);
    expect(mockSchedule).toHaveBeenCalled();
  });

  it('skips scheduling when notifications disabled', async () => {
    await setEnabled(false);
    await scheduleForAgendaItem(futureItem);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('skips scheduling when permission denied', async () => {
    await AsyncStorage.setItem('NOTIFICATIONS_ENABLED', 'true');
    mockGetPerms.mockResolvedValue({ status: 'denied' });
    mockReqPerms.mockResolvedValue({ status: 'denied' });
    await scheduleForAgendaItem(futureItem);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('does not schedule past items', async () => {
    await AsyncStorage.setItem('NOTIFICATIONS_ENABLED', 'true');
    const pastItem = { ...futureItem, date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() };
    await scheduleForAgendaItem(pastItem);
    // morningDate and preDate both in the past → no calls
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('swallows errors silently', async () => {
    mockSchedule.mockRejectedValueOnce(new Error('HW'));
    await AsyncStorage.setItem('NOTIFICATIONS_ENABLED', 'true');
    await expect(scheduleForAgendaItem(futureItem)).resolves.not.toThrow();
  });
});

describe('cancelForAgendaItem', () => {
  it('cancels pre and day identifiers', async () => {
    await cancelForAgendaItem('a1');
    expect(mockCancel).toHaveBeenCalledWith('agenda-a1-pre');
    expect(mockCancel).toHaveBeenCalledWith('agenda-a1-day');
  });

  it('swallows errors silently', async () => {
    mockCancel.mockRejectedValueOnce(new Error('HW'));
    await expect(cancelForAgendaItem('a1')).resolves.not.toThrow();
  });
});

describe('rescheduleAll', () => {
  it('cancels all then reschedules enabled items', async () => {
    await AsyncStorage.setItem('NOTIFICATIONS_ENABLED', 'true');
    await rescheduleAll([futureItem]);
    expect(mockCancelAll).toHaveBeenCalled();
  });

  it('cancels all but skips scheduling when disabled', async () => {
    await setEnabled(false);
    mockCancelAll.mockClear();
    await rescheduleAll([futureItem]);
    expect(mockCancelAll).toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('swallows errors silently', async () => {
    mockCancelAll.mockRejectedValueOnce(new Error('HW'));
    await expect(rescheduleAll([futureItem])).resolves.not.toThrow();
  });
});
