// jest.config.js
//
// ═══════════════════════════════════════════════════════════════════════════
// MOCK ARCHITECTURE CONTRACT — 4 layers, see TESTING.md
// ═══════════════════════════════════════════════════════════════════════════
//  L1  jest.polyfill.js          — global polyfills before preset
//  L2  moduleNameMapper (below)  — redirect native imports to __mocks__/
//  L3  jest.setup.ts             — behavioral overrides (react-native Proxy)
//  L4  test files                — domain-specific mocks only

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // LAYER 1
  setupFiles: ['<rootDir>/jest.polyfill.js'],
  // LAYER 3
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.test.tsx',
  ],

  // ─── Coverage ──────────────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',

    // ── EXCLUSIONS ──────────────────────────────────────────────────────────────────
    // Type definitions: no executable code.
    '!src/**/*.d.ts',
    '!src/types.ts',

    // Static data files: pure data exports, zero logic branches.
    '!src/criteria/**',
    '!src/criteriaData.ts',
    '!src/facilitiesData.ts',
    '!src/facilityCategories.ts',

    // Translation files: static string maps, no logic.
    '!src/i18n/**',

    // Barrel index files: pure re-exports, no logic.
    // Cover these via the modules they re-export.
    '!src/repositories/index.ts',
    '!src/utils/index.ts',
    '!src/constants/index.ts',

    // Test infrastructure.
    '!src/__tests__/**',
    '!src/__mocks__/**',

    // Expo Router screens: cover with Detox/Maestro E2E, not Jest.
    '!src/app/**',
  ],

  // Thresholds enforced in CI to prevent silent regression.
  // Target: branches 75, functions/lines/statements 80 once all services covered.
  coverageThreshold: {
    global: {
      branches:   60,
      functions:  70,
      lines:      70,
      statements: 70,
    },
  },

  // LAYER 2 — module routing
  moduleNameMapper: {
    '^expo-modules-core$':                    '<rootDir>/__mocks__/expo-modules-core.js',
    '^expo/src/winter/fetch/ExpoFetchModule$': '<rootDir>/__mocks__/expoFetchModule.js',
    '^expo/src/winter/fetch(.*)$':            '<rootDir>/__mocks__/expoFetch.js',
    '^expo-file-system/legacy$':              '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^expo-print$':                           '<rootDir>/__mocks__/expo-print.js',
    '^expo-sharing$':                         '<rootDir>/__mocks__/expo-sharing.js',
    '^expo-notifications$':                   '<rootDir>/__mocks__/expo-notifications.js',
    '^@react-native-community/netinfo$':      '<rootDir>/__mocks__/@react-native-community/netinfo.js',
  },

  // ⚠️ FRAGILE — Last audited: June 2026 (RN 0.76, Expo SDK 52)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};
