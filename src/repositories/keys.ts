// src/repositories/keys.ts
export const KEYS = {
  FACILITIES:          'FACILITIES',
  INSPECTIONS:         'INSPECTIONS',
  AGENDA:              'AGENDA',
  SETTINGS:            'SETTINGS',
  AUDIT_LOG:           'AUDIT_LOG',
  INSPECTION_HASHES:   'INSPECTION_HASHES',
  CORRECTIVE_ACTIONS:  'CORRECTIVE_ACTIONS',
  APPROVAL_QUEUE:      'APPROVAL_QUEUE',
  NOTIFICATIONS:       'NOTIFICATIONS',
} as const;

export type StorageKey = typeof KEYS[keyof typeof KEYS];
