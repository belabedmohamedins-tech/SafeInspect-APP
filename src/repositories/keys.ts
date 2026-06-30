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
  /** Stores the identifier of the last scheduled grouped CAP digest notification */
  CAP_DIGEST_NOTIF_ID:     'CAP_DIGEST_NOTIF_ID',
  SYNC_QUEUE:              'SYNC_QUEUE',
  SYNC_LAST_RUN:           'SYNC_LAST_RUN',
  STATS_CACHE:             'STATS_CACHE',
  BACKUP_LAST_AT:          'BACKUP_LAST_AT',
  // Auth keys
  APP_PIN:                 'APP_PIN',
  BIOMETRIC_ENABLED:       'BIOMETRIC_ENABLED',
  PIN_FAILED_ATTEMPTS:     'PIN_FAILED_ATTEMPTS',
  // Settings field keys
  OFFICE_NAME:             'OFFICE_NAME',
  INSPECTOR_NAME:          'INSPECTOR_NAME',
  INSPECTION_CAUSE:        'INSPECTION_CAUSE',
  // Phase-1 additions
  SCHEMA_VERSION:          '@schema_version',
  REPORT_SEQUENCE:         '@report_sequence',
} as const;

/** @deprecated use StorageKeys */
export const KEYS = StorageKeys;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
