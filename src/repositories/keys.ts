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
  /** Stores the identifier of the last scheduled grouped CAP daily digest notification */
  CAP_DIGEST_NOTIF_ID:     'CAP_DIGEST_NOTIF_ID',
  /** Stores the identifier of the last scheduled weekly Monday CAP digest notification */
  CAP_WEEKLY_DIGEST_NOTIF_ID:  'CAP_WEEKLY_DIGEST_NOTIF_ID',
  /** ISO date (YYYY-MM-DD) of the Monday the weekly digest was last scheduled */
  CAP_WEEKLY_DIGEST_LAST_RUN:  'CAP_WEEKLY_DIGEST_LAST_RUN',
  SYNC_QUEUE:              'SYNC_QUEUE',
  SYNC_LAST_RUN:           'SYNC_LAST_RUN',
  STATS_CACHE:             'STATS_CACHE',
  BACKUP_LAST_AT:          'BACKUP_LAST_AT',
  // Auth keys (local PIN / biometric)
  APP_PIN:                 'APP_PIN',
  BIOMETRIC_ENABLED:       'BIOMETRIC_ENABLED',
  PIN_FAILED_ATTEMPTS:     'PIN_FAILED_ATTEMPTS',
  // Settings field keys
  OFFICE_NAME:             'OFFICE_NAME',
  INSPECTOR_NAME:          'INSPECTOR_NAME',
  INSPECTION_CAUSE:        'INSPECTION_CAUSE',
  // Phase-1 additions
  // NOTE: @ prefix replaced with _ prefix — SecureStore only allows alphanumeric, ".", "-", "_"
  SCHEMA_VERSION:          '_schema_version',
  REPORT_SEQUENCE:         '_report_sequence',
  // Tier-2: server JWT tokens (stored in SecureStore on native)
  JWT_ACCESS_TOKEN:        'jwt_access_token',
  JWT_REFRESH_TOKEN:       'jwt_refresh_token',
  SERVER_USER_ID:          'server_user_id',
} as const;

/** @deprecated use StorageKeys */
export const KEYS = StorageKeys;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
