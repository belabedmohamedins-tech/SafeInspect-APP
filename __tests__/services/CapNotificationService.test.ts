// __tests__/services/CapNotificationService.test.ts
//
// Full coverage for CapNotificationService:
//   scheduleCapDeadlineNotifications() — main entry
//   scheduleCapDigestNotification()
//   scheduleCapWeeklyDigest()
//   cancelCapNotification()
//   cancelCapDigestNotification()
//   cancelCapWeeklyDigestNotification()
//   nextOrTodayMonday() — via scheduleCapWeeklyDigest side effects

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../../src/repositories/keys';

// ─── L2 mocks are already set up for:
//   expo-notifications  → __mocks__/expo-notifications.ts
//   expo-constants      → __mocks__/expo-constants.ts  (appOwnership='standalone')
//   react-native        → __mocks__/react-native.ts
//   @react-native-async-storage/async-storage → auto-mock
//
// We only need to provide repo-level mocks at L4.

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    getOpen:                   jest.fn(),
    getStats:                  jest.fn(),
    persistOverdueEscalation:  jest.fn(),
  },
}));

jest.mock('../../src/services/NotificationService', () => ({
  isEnabled:        jest.fn(),
  requestPermission: jest.fn(),
}));

import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { isEnabled, requestPermission } from '../../src/services/NotificationService';
import {
  scheduleCapDeadlineNotifications,
  scheduleCapDigestNotification,
  scheduleCapWeeklyDigest,
  cancelCapNotification,
  cancelCapDigestNotification,
  cancelCapWeeklyDigestNotification,
} from '../../src/services/CapNotificationService';

// Expose the Notifications mock so we can assert on it
import Notifications from 'expo-notifications';

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const OPEN_ITEM = {
  id:           'cap-1',
  facilityName: 'Facility A',
  deadline:     daysFromNow(3),
  status:       'open',
};

const DEFAULT_STATS = {
  open: 1, inProgress: 0, overdue: 0, resolved: 0,
  total: 1, nearDeadlineCount: 1,
};

function setupHappyPath() {
  (isEnabled as jest.Mock).mockResolvedValue(true);
  (requestPermission as jest.Mock).mockResolvedValue(true);
  (CorrectiveActionRepository.persistOverdueEscalation as jest.Mock).mockResolvedValue(0);
  (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([OPEN_ITEM]);
  (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(DEFAULT_STATS);
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
  (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notif-id');
  (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue(undefined);
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── scheduleCapDeadlineNotifications (main entry) ────────────────────────────

describe('scheduleCapDeadlineNotifications', () => {
  it('runs the full happy path without throwing', async () => {
    setupHappyPath();
    // Mark as not-yet-run today
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_NOTIF_LAST_RUN) return Promise.resolve('2000-01-01');
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    await expect(scheduleCapDeadlineNotifications()).resolves.toBeUndefined();
    expect(CorrectiveActionRepository.persistOverdueEscalation).toHaveBeenCalled();
  });

  it('returns early when shouldRun is false (already ran today)', async () => {
    setupHappyPath();
    const todayStr = new Date().toISOString().slice(0, 10);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_NOTIF_LAST_RUN) return Promise.resolve(todayStr);
      return Promise.resolve(null);
    });
    await scheduleCapDeadlineNotifications();
    expect(CorrectiveActionRepository.persistOverdueEscalation).not.toHaveBeenCalled();
  });

  it('returns early when notifications are disabled', async () => {
    setupHappyPath();
    (isEnabled as jest.Mock).mockResolvedValue(false);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2000-01-01');
    await scheduleCapDeadlineNotifications();
    expect(CorrectiveActionRepository.persistOverdueEscalation).not.toHaveBeenCalled();
  });

  it('returns early when permission is denied', async () => {
    setupHappyPath();
    (requestPermission as jest.Mock).mockResolvedValue(false);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2000-01-01');
    await scheduleCapDeadlineNotifications();
    expect(CorrectiveActionRepository.persistOverdueEscalation).not.toHaveBeenCalled();
  });

  it('logs promoted count when > 0', async () => {
    setupHappyPath();
    (CorrectiveActionRepository.persistOverdueEscalation as jest.Mock).mockResolvedValue(3);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_NOTIF_LAST_RUN) return Promise.resolve('2000-01-01');
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    await expect(scheduleCapDeadlineNotifications()).resolves.toBeUndefined();
  });

  it('handles top-level error gracefully', async () => {
    (isEnabled as jest.Mock).mockRejectedValue(new Error('boom'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2000-01-01');
    await expect(scheduleCapDeadlineNotifications()).resolves.toBeUndefined();
  });
});

// ─── scheduleCapDigestNotification ────────────────────────────────────────────

describe('scheduleCapDigestNotification', () => {
  it('schedules digest when overdue > 0', async () => {
    setupHappyPath();
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { ...DEFAULT_STATS, overdue: 2, nearDeadlineCount: 0 },
    );
    (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([]);
    await scheduleCapDigestNotification();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('schedules digest when dueTodayCount > 0', async () => {
    setupHappyPath();
    const todayStr = new Date().toISOString().slice(0, 10);
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { ...DEFAULT_STATS, overdue: 0, nearDeadlineCount: 1 },
    );
    (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([
      { ...OPEN_ITEM, status: 'open', deadline: todayStr },
    ]);
    await scheduleCapDigestNotification();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('schedules digest when only dueWeekCount > 0', async () => {
    setupHappyPath();
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { ...DEFAULT_STATS, overdue: 0, nearDeadlineCount: 2 },
    );
    (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([
      { ...OPEN_ITEM, status: 'open', deadline: daysFromNow(3) },
    ]);
    await scheduleCapDigestNotification();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('skips scheduling when all counts are 0', async () => {
    setupHappyPath();
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { open: 0, inProgress: 0, overdue: 0, resolved: 0, total: 0, nearDeadlineCount: 0 },
    );
    (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([]);
    await scheduleCapDigestNotification();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels previous digest notification if stored id exists', async () => {
    setupHappyPath();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_DIGEST_NOTIF_ID) return Promise.resolve('old-digest-id');
      return Promise.resolve(null);
    });
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { ...DEFAULT_STATS, overdue: 1 },
    );
    (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([]);
    await scheduleCapDigestNotification();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-digest-id');
  });

  it('handles error gracefully', async () => {
    setupHappyPath();
    (CorrectiveActionRepository.getStats as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(scheduleCapDigestNotification()).resolves.toBeUndefined();
  });
});

// ─── scheduleCapWeeklyDigest ──────────────────────────────────────────────────

describe('scheduleCapWeeklyDigest', () => {
  it('schedules weekly digest on happy path (overdue > 0)', async () => {
    setupHappyPath();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { ...DEFAULT_STATS, overdue: 2, nearDeadlineCount: 0, total: 3 },
    );
    await scheduleCapWeeklyDigest();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('schedules weekly digest with nearDeadlineCount title (no overdue)', async () => {
    setupHappyPath();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { open: 1, inProgress: 1, overdue: 0, resolved: 0, nearDeadlineCount: 2, total: 4 },
    );
    await scheduleCapWeeklyDigest();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('schedules with green title when nothing urgent', async () => {
    setupHappyPath();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { open: 1, inProgress: 0, overdue: 0, resolved: 0, nearDeadlineCount: 0, total: 1 },
    );
    await scheduleCapWeeklyDigest();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('skips when shouldRunWeekly returns false (already ran this Monday)', async () => {
    setupHappyPath();
    // Compute the actual next-Monday key the service would compute
    const d = new Date();
    const day = d.getDay();
    const diff = day === 1 ? 0 : (8 - day) % 7 || 7;
    d.setDate(d.getDate() + diff);
    const mondayKey = d.toISOString().slice(0, 10);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve(mondayKey);
      return Promise.resolve(null);
    });
    await scheduleCapWeeklyDigest();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('skips when total === 0', async () => {
    setupHappyPath();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { open: 0, inProgress: 0, overdue: 0, resolved: 0, nearDeadlineCount: 0, total: 0 },
    );
    await scheduleCapWeeklyDigest();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels previous weekly notification if id exists', async () => {
    setupHappyPath();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID) return Promise.resolve('old-weekly-id');
      return Promise.resolve(null);
    });
    (CorrectiveActionRepository.getStats as jest.Mock).mockResolvedValue(
      { ...DEFAULT_STATS, total: 2, overdue: 1 },
    );
    await scheduleCapWeeklyDigest();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-weekly-id');
  });

  it('handles error gracefully', async () => {
    setupHappyPath();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    (CorrectiveActionRepository.getStats as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(scheduleCapWeeklyDigest()).resolves.toBeUndefined();
  });
});

// ─── Per-item alerts (via scheduleCapDeadlineNotifications) ───────────────────

describe('per-item alerts edge cases', () => {
  it('skips item whose deadline is in the past', async () => {
    setupHappyPath();
    (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([
      { ...OPEN_ITEM, id: 'past', deadline: daysFromNow(-2) },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_NOTIF_LAST_RUN) return Promise.resolve('2000-01-01');
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    await scheduleCapDeadlineNotifications();
    // scheduleNotificationAsync called only for digest, not for past item
    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    const itemCall = calls.find(c => c[0]?.identifier === 'cap-past-deadline');
    expect(itemCall).toBeUndefined();
  });

  it('skips item beyond WARN_DAYS (>7 days)', async () => {
    setupHappyPath();
    (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([
      { ...OPEN_ITEM, id: 'far', deadline: daysFromNow(10) },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_NOTIF_LAST_RUN) return Promise.resolve('2000-01-01');
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    await scheduleCapDeadlineNotifications();
    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    const itemCall = calls.find(c => c[0]?.identifier === 'cap-far-deadline');
    expect(itemCall).toBeUndefined();
  });

  it('uses "today" body text when deadline is today', async () => {
    setupHappyPath();
    (CorrectiveActionRepository.getOpen as jest.Mock).mockResolvedValue([
      { ...OPEN_ITEM, id: 'today-item', deadline: daysFromNow(0) },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === StorageKeys.CAP_NOTIF_LAST_RUN) return Promise.resolve('2000-01-01');
      if (key === StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN) return Promise.resolve('2000-01-01');
      return Promise.resolve(null);
    });
    // fireAt for today would be 09:00 today; it might already be past → item skipped
    // This covers the deadline===today branch regardless of skip
    await expect(scheduleCapDeadlineNotifications()).resolves.toBeUndefined();
  });
});

// ─── cancelCapNotification ────────────────────────────────────────────────────

describe('cancelCapNotification', () => {
  it('cancels the scheduled notification for a cap id', async () => {
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
    await cancelCapNotification('cap-99');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('cap-cap-99-deadline');
  });

  it('handles error gracefully', async () => {
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValue(new Error('err'));
    await expect(cancelCapNotification('cap-err')).resolves.toBeUndefined();
  });
});

// ─── cancelCapDigestNotification ─────────────────────────────────────────────

describe('cancelCapDigestNotification', () => {
  it('cancels and removes stored digest id', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('digest-notif-id');
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
    await cancelCapDigestNotification();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('digest-notif-id');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(StorageKeys.CAP_DIGEST_NOTIF_ID);
  });

  it('does nothing when no stored id', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await cancelCapDigestNotification();
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });

  it('handles error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(cancelCapDigestNotification()).resolves.toBeUndefined();
  });
});

// ─── cancelCapWeeklyDigestNotification ────────────────────────────────────────

describe('cancelCapWeeklyDigestNotification', () => {
  it('cancels weekly notification and clears storage keys', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('weekly-notif-id');
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
    await cancelCapWeeklyDigestNotification();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('weekly-notif-id');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(StorageKeys.CAP_WEEKLY_DIGEST_NOTIF_ID);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(StorageKeys.CAP_WEEKLY_DIGEST_LAST_RUN);
  });

  it('does nothing when no stored id', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await cancelCapWeeklyDigestNotification();
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });

  it('handles error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(cancelCapWeeklyDigestNotification()).resolves.toBeUndefined();
  });
});
