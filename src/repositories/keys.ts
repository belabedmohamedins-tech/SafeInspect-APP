// src/repositories/keys.ts
export const StorageKeys = {
  INSPECTIONS:        '@safeinspect/inspections',
  USER_FACILITIES:    '@safeinspect/user_facilities',
  AGENDA:             '@safeinspect/agenda',
  SETTINGS:           '@safeinspect/settings',
  AUDIT_LOG:          '@safeinspect/audit_log',
  INSPECTION_HASHES:  '@safeinspect/inspection_hashes',
  CORRECTIVE_ACTIONS: '@safeinspect/corrective_actions',
  APPROVAL_QUEUE:     '@safeinspect/approval_queue',
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
