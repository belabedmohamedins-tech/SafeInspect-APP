// src/repositories/keys.ts
// Single source of truth for all AsyncStorage key strings.
//
// Ownership rules:
//   INSPECTIONS          → InspectionRepository (sole writer)
//   AGENDA               → AgendaRepository (sole writer)
//   STATS_CACHE          → InspectionRepository.writeAll(); read by SettingsRepository & StatsScreen
//   OFFICE_NAME          → SettingsRepository
//   INSPECTOR_NAME       → SettingsRepository
//   INSPECTION_CAUSE     → SettingsRepository
//   USER_FACILITIES      → FacilityRepository
//   BIOMETRIC_ENABLED    → AuthRepository
//   NOTIFICATIONS_ENABLED → NotificationService
//   AUDIT_LOG            → AuditLogRepository (append-only)
//   INSPECTION_HASHES    → IntegrityService (tamperproof hashes)
//   CORRECTIVE_ACTIONS   → CorrectiveActionRepository
//   CAP_NOTIF_LAST_RUN   → CapNotificationService (ISO date of last scheduling pass)

export const StorageKeys = {
  INSPECTIONS:           'inspections',
  AGENDA:                'agenda',
  STATS_CACHE:           'statsCache',
  OFFICE_NAME:           'officeName',
  INSPECTOR_NAME:        'inspectorName',
  INSPECTION_CAUSE:      'inspectionCause',
  USER_FACILITIES:       'userFacilities',
  BIOMETRIC_ENABLED:     'biometricEnabled',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  AUDIT_LOG:             'auditLog',
  INSPECTION_HASHES:     'inspectionHashes',
  CORRECTIVE_ACTIONS:    'correctiveActions',
  CAP_NOTIF_LAST_RUN:    'capNotifLastRun',
} as const;
