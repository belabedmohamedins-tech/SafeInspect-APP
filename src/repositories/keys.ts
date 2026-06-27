// src/repositories/keys.ts
// Single source of truth for all AsyncStorage key strings.
//
// Ownership rules:
//   INSPECTIONS          → InspectionRepository (sole writer)
//   AGENDA               → AgendaRepository (sole writer)
//   STATS_CACHE          → InspectionRepository.writeAll() (sole writer); read by SettingsRepository & StatsScreen
//   OFFICE_NAME          → SettingsRepository
//   INSPECTOR_NAME       → SettingsRepository
//   INSPECTION_CAUSE     → SettingsRepository
//   USER_FACILITIES      → facilitiesService
//   BIOMETRIC_ENABLED    → AuthRepository
//   NOTIFICATIONS_ENABLED → NotificationService

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
} as const;
