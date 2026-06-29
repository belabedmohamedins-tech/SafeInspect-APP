// __mocks__/expo-notifications.js
// Layer 2 stub for expo-notifications.
// Wired via moduleNameMapper in jest.config.ts.
// Provides the surface used by agenda / notification-related source files.

module.exports = {
  // Permission
  requestPermissionsAsync:   jest.fn().mockResolvedValue({ status: 'granted' }),
  getPermissionsAsync:       jest.fn().mockResolvedValue({ status: 'granted' }),

  // Scheduling
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),

  // Channels (Android)
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  getNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  deleteNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),

  // Handlers / listeners
  setNotificationHandler:    jest.fn(),
  addNotificationReceivedListener:         jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription:          jest.fn(),

  // Badge
  setBadgeCountAsync: jest.fn().mockResolvedValue(true),
  getBadgeCountAsync: jest.fn().mockResolvedValue(0),

  // Trigger types
  SchedulableTriggerInputTypes: {
    DATE:     'date',
    DAILY:    'daily',
    WEEKLY:   'weekly',
    CALENDAR: 'calendar',
  },

  // Android importance levels — required by setNotificationChannelAsync calls
  // in NotificationService.requestPermission(). Missing this caused an uncaught
  // TypeError (undefined.HIGH) inside the try/catch, making requestPermission
  // silently return false instead of true.
  AndroidImportance: {
    DEFAULT:  3,
    HIGH:     4,
    LOW:      2,
    MAX:      5,
    MIN:      1,
    NONE:     0,
  },
};
