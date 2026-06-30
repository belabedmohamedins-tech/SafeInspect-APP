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

  // ─── Coverage ─────────────────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',

    // ── EXCLUSIONS ─────────────────────────────────────────────────────────────────────
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

    // ── UI/integration-only files — no unit-testable surface ───────────────────────────
    // These files require a running React Native renderer or a real device
    // (PDF printing engine, OAuth flows, native component trees). They are
    // excluded from coverage so threshold failures reflect logic regressions,
    // not the absence of integration-test infrastructure.
    '!src/components/**',
    '!src/services/pdfService.ts',
    '!src/services/serverAuth.ts',
  ],

  // ─── Thresholds ──────────────────────────────────────────────────────────────────────
  // Measured after:
  //   - fixing getStats mock in CapNotificationService.test.ts
  //   - excluding components/*, pdfService, serverAuth from collection
  // Remaining branch gaps: schema.ts DB migration (3.84%), decisionSupport.ts
  // conditional branches (60.86%), BackupService.ts error paths (47.05%).
  // These are tracked as tech debt; raise thresholds as tests are added.
  //
  // HOW TO RAISE: run `npm run test:coverage`, note actuals, set each threshold
  // to floor(actual) - 1, and update the comment above.
  coverageThreshold: {
    global: {
      branches:   68,
      functions:  90,
      lines:      84,
      statements: 84,
    },
  },

  // LAYER 2 — module routing
  moduleNameMapper: {
    // ── SDK 56 / jest-expo internal path fix ───────────────────────────────────────
    // jest-expo ~56 setup.js still imports this path but SDK 56
    // expo-modules-core no longer exposes it. Stub it out.
    '^expo-modules-core/src/polyfill/dangerous-internal$':
      '<rootDir>/__mocks__/expo-modules-core-dangerous-internal.js',

    // ── existing mappings ────────────────────────────────────────────────────────────
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
    '^expo-secure-store$':                    '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-local-authentication$':            '<rootDir>/__mocks__/expo-local-authentication.js',
    '^expo-constants$':                       '<rootDir>/__mocks__/expo-constants.js',
  },

  // ⚠️ FRAGILE — Last audited: June 2026 (RN 0.85, Expo SDK 56)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};
