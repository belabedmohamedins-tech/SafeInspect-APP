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
} as const;

/** @deprecated use StorageKeys */
export const KEYS = StorageKeys;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
