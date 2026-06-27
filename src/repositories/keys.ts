// src/repositories/keys.ts
// Single source of truth for all AsyncStorage key strings.
//
// Ownership rules:
//   INSPECTIONS      → InspectionRepository (sole writer)
//   AGENDA           → AgendaRepository (sole writer)
//   STATS_CACHE      → InspectionRepository.writeAll(); read by SettingsRepository & StatsScreen
//   OFFICE_NAME      → SettingsRepository
//   INSPECTOR_NAME   → SettingsRepository
//   INSPECTION_CAUSE → SettingsRepository
//   USER_FACILITIES  → FacilityRepository
//   APP_PIN          → AuthRepository (sole writer)
//   PIN_FAILED_ATTEMPTS → AuthRepository (sole writer)

export const StorageKeys = {
  INSPECTIONS:          'inspections',
  AGENDA:               'agenda',
  STATS_CACHE:          'statsCache',
  OFFICE_NAME:          'officeName',
  INSPECTOR_NAME:       'inspectorName',
  INSPECTION_CAUSE:     'inspectionCause',
  USER_FACILITIES:      'userFacilities',
  APP_PIN:              'auth:pin',
  PIN_FAILED_ATTEMPTS:  'auth:failedAttempts',
} as const;
