// jest.config.js
// Type-safety via JSDoc — no ts-node required.
// VS Code / WebStorm autocomplete via the @type annotation.
//
// ═══════════════════════════════════════════════════════════════════════════
// MOCK ARCHITECTURE CONTRACT — read before adding any mock
// ═══════════════════════════════════════════════════════════════════════════
//
//  LAYER 1 — jest.polyfill.js  (setupFiles, runs before preset)
//    Purpose : Global polyfills (fetch, Response, TextEncoder, …)
//    Rule    : Only global assignments. No jest.mock().
//
//  LAYER 2 — moduleNameMapper  (this file)
//    Purpose : Redirect native/Expo imports to safe __mocks__/ stubs.
//    Rule    : Map to __mocks__/ files only. No inline factories.
//
//  LAYER 3 — jest.setup.ts  (setupFilesAfterEnv)
//    Purpose : Behavioral mocks that need jest.mock() hoisting semantics.
//    Rule    : Only mocks the preset cannot handle. Never duplicate Layer 2.
//
//  LAYER 4 — individual test files  (src/__tests__/**)
//    Purpose : Domain-specific mocks for the unit under test.
//    Rule    : Only direct dependencies. Never infrastructure (RN, Platform,
//              async-storage). Use __resetStore() in beforeEach.
//
// ═══════════════════════════════════════════════════════════════════════════
// jest-expo PRESET
// ═══════════════════════════════════════════════════════════════════════════
//
// preset: 'jest-expo' provides: @testing-library/react-native setup,
// RN component stubs, Reanimated/GestureHandler setup, babel-jest transform.
// Do NOT duplicate any of those in jest.setup.ts or moduleNameMapper.
//
// ═══════════════════════════════════════════════════════════════════════════
// transformIgnorePatterns — MAINTENANCE NOTE
// ═══════════════════════════════════════════════════════════════════════════
//
// ⚠️  FRAGILE — this regex controls which node_modules are transpiled by
// babel-jest.  If you add an Expo/RN package and see:
//   "SyntaxError: Cannot use import statement outside a module"
// add that package name to the regex below.
//
// Last audited: June 2026 (RN 0.76, Expo SDK 52, jest-expo 52)
// When upgrading Expo SDK, re-run `npx jest` and check for new SyntaxErrors.

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // LAYER 1
  setupFiles: ['<rootDir>/jest.polyfill.js'],

  // LAYER 3
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Only src/__tests__/ — do NOT add tests outside this directory.
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.test.tsx',
  ],

  // Coverage — floors enforced to prevent silent erosion.
  // Raise these thresholds as the test suite grows.
  // Target: branches 80, functions 85, lines 85 by end of project.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',         // barrel files — no logic to cover
    '!src/app/**',              // expo-router screens — UI integration tests
  ],
  coverageThreshold: {
    global: {
      branches:  60,
      functions: 70,
      lines:     70,
      statements: 70,
    },
  },

  // LAYER 2 — module routing
  // Rule: never inline a factory — always point to a __mocks__/ file.
  moduleNameMapper: {
    // ── Core / Fetch ──────────────────────────────────────────────────────
    '^expo-modules-core$':
      '<rootDir>/__mocks__/expo-modules-core.js',
    '^expo/src/winter/fetch/ExpoFetchModule$':
      '<rootDir>/__mocks__/expoFetchModule.js',
    '^expo/src/winter/fetch(.*)$':
      '<rootDir>/__mocks__/expoFetch.js',

    // ── File system ───────────────────────────────────────────────────────
    '^expo-file-system/legacy$':
      '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',

    // ── Storage ───────────────────────────────────────────────────────────
    // ⚠️ THE ONLY PLACE async-storage IS MOCKED — do not add it in test files.
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',

    // ── Print / Share ─────────────────────────────────────────────────────
    '^expo-print$':    '<rootDir>/__mocks__/expo-print.js',
    '^expo-sharing$':  '<rootDir>/__mocks__/expo-sharing.js',

    // ── Notifications ─────────────────────────────────────────────────────
    '^expo-notifications$': '<rootDir>/__mocks__/expo-notifications.js',

    // ── Network ───────────────────────────────────────────────────────────
    '^@react-native-community/netinfo$':
      '<rootDir>/__mocks__/@react-native-community/netinfo.js',
  },

  // ⚠️ FRAGILE — see maintenance note at the top of this file.
  // Last audited: June 2026 (RN 0.76, Expo SDK 52)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};
