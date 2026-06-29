// src/repositories/keys.ts

export const StorageKeys = {
  FACILITIES:              'FACILITIES',
  USER_FACILITIES:         'FACILITIES',
  INSPECTIONS:             'INSPECTIONS',
  AGENDA:                  'AGENDA',
  SETTINGS:                'SETTINGS',
  AUDIT_LOG:               'AUDIT_LOG',
  INSPECTION_HASHES:       'INSPECTION_HASHES',
  CORRECTIVE_ACTIONS:      'CORRECTIVE_ACTIONS',
  APPROVAL_QUEUE:          'APPROVAL_QUEUE',
  NOTIFICATIONS:           'NOTIFICATIONS',
  NOTIFICATIONS_ENABLED:   'NOTIFICATIONS_ENABLED',
  CAP_NOTIF_LAST_RUN:      'CAP_NOTIF_LAST_RUN',
  SYNC_QUEUE:              'SYNC_QUEUE',
  SYNC_LAST_RUN:           'SYNC_LAST_RUN',
  STATS_CACHE:             'STATS_CACHE',
  BACKUP_LAST_AT:          'BACKUP_LAST_AT',
  // Auth keys
  APP_PIN:                 'APP_PIN',
  BIOMETRIC_ENABLED:       'BIOMETRIC_ENABLED',
  PIN_FAILED_ATTEMPTS:     'PIN_FAILED_ATTEMPTS',
  // Settings field keys — used by SettingsRepository to store individual fields
  OFFICE_NAME:             'OFFICE_NAME',
  INSPECTOR_NAME:          'INSPECTOR_NAME',
  INSPECTION_CAUSE:        'INSPECTION_CAUSE',
} as const;

/** @deprecated use StorageKeys */
export const KEYS = StorageKeys;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
