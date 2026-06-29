// jest.config.js
//
// ═══════════════════════════════════════════════════════════════════════════════
// MOCK ARCHITECTURE CONTRACT — 4 layers, see TESTING.md
// ═══════════════════════════════════════════════════════════════════════════════
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

  // ─── Coverage ────────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',

    // ── EXCLUSIONS ────────────────────────────────────────────────────────────
    '!src/**/*.d.ts',
    '!src/types.ts',
    '!src/criteria/**',
    '!src/criteriaData.ts',
    '!src/facilitiesData.ts',
    '!src/facilityCategories.ts',
    '!src/i18n/**',
    '!src/repositories/index.ts',
    '!src/utils/index.ts',
    '!src/constants/index.ts',
    '!src/__tests__/**',
    '!src/__mocks__/**',
    '!src/app/**',
  ],

  // ─── Thresholds ──────────────────────────────────────────────────────────────
  // Last passing run (after syncEngine fix, commit after beae141):
  //   statements ~94.32 / branches ~81.5 / lines ~95.36 / functions ~96.97
  // Thresholds = floor(actual) - 1 to block regressions with headroom.
  // HOW TO RAISE: run `npx jest --coverage`, note actuals, set each
  // threshold to floor(actual) - 1, update the comment above.
  coverageThreshold: {
    global: {
      branches:   81,
      functions:  96,
      lines:      95,
      statements: 94,
    },
  },

  // LAYER 2 — module routing
  moduleNameMapper: {
    '^expo-modules-core$':                    '<rootDir>/__mocks__/expo-modules-core.js',
    '^expo/src/winter/fetch/ExpoFetchModule$': '<rootDir>/__mocks__/expoFetchModule.js',
    '^expo/src/winter/fetch(.*)$':            '<rootDir>/__mocks__/expoFetch.js',
    '^expo-file-system/legacy$':              '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^expo-print$':                           '<rootDir>/__mocks__/expo-print.js',
    '^expo-sharing$':                         '<rootDir>/__mocks__/expo-sharing.js',
    '^expo-notifications$':                   '<rootDir>/__mocks__/expo-notifications.js',
    '^@react-native-community/netinfo$':      '<rootDir>/__mocks__/@react-native-community/netinfo.js',
    // Auth-related native modules — must be mapped BEFORE expo-modules-core
    '^expo-secure-store$':                    '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-local-authentication$':            '<rootDir>/__mocks__/expo-local-authentication.js',
    // expo-constants: override jest-expo preset default so IS_EXPO_GO = false
    '^expo-constants$':                       '<rootDir>/__mocks__/expo-constants.js',
  },

  // ⚠️ FRAGILE — Last audited: June 2026 (RN 0.76, Expo SDK 52)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};
