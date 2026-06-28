// jest.config.js
//
// Type-safety via JSDoc — no ts-node required.
// VS Code and WebStorm provide full autocomplete on all Jest options
// through the @type annotation below.
//
// ═══════════════════════════════════════════════════════════════════════════
// MOCK ARCHITECTURE CONTRACT — read before adding any mock
// ═══════════════════════════════════════════════════════════════════════════
//
// This project uses a strict 4-layer mock architecture.
// Every mock belongs in exactly ONE layer. Do not add mocks in the wrong layer.
//
//  LAYER 1 — jest.polyfill.js  (setupFiles, runs before preset)
//    Purpose : Install global polyfills that must exist before any module
//              is evaluated (fetch, Response, TextEncoder, …)
//    Rule    : Only global assignments (globalThis.X = …). No jest.mock().
//    Current : undici-based fetch/Response/Headers/Request/FormData
//
//  LAYER 2 — moduleNameMapper  (this file, below)
//    Purpose : Redirect module imports to safe stubs before Jest resolves
//              them.  Used for native/Expo modules that crash in Node.
//    Rule    : Map to __mocks__/ files only. No inline factories here.
//    Current : expo-modules-core, expo-file-system/legacy,
//              async-storage, expo winter-fetch internals,
//              expo-print, expo-sharing, expo-notifications, netinfo
//
//  LAYER 3 — jest.setup.ts  (setupFilesAfterEnv)
//    Purpose : Global behavioral mocks that require jest.mock() semantics
//              and need to run after the test framework is installed.
//    Rule    : Only mocks that CANNOT be handled by moduleNameMapper
//              (e.g. react-native Proxy, Platform, safe-area-context).
//              Never duplicate a mock already in Layer 2.
//    Current : react-native (Proxy), Platform, react-native-safe-area-context
//
//  LAYER 4 — individual test files  (src/__tests__/**)
//    Purpose : Domain-specific mocks for the unit under test.
//    Rule    : Only mock direct dependencies of the module being tested
//              (repositories, services, expo-router per test).
//              NEVER mock infrastructure here — no react-native, Platform,
//              or @react-native-async-storage/async-storage inline factories.
//              The async-storage mock lives exclusively in Layer 2.
//              Use __resetStore() in beforeEach to wipe the in-memory store.
//
// ═══════════════════════════════════════════════════════════════════════════
// CANONICAL TEST LOCATION: src/__tests__/
// ═══════════════════════════════════════════════════════════════════════════
//
// All tests live under src/__tests__/. The root __tests__/ directory at the
// project root is no longer used. testMatch below enforces this.
// Having tests in two locations caused relative-path ambiguity and Layer-2
// contract violations. Do NOT add tests outside src/__tests__/.
//
// ═══════════════════════════════════════════════════════════════════════════
// jest-expo PRESET
// ═══════════════════════════════════════════════════════════════════════════
//
// preset: 'jest-expo' is the authoritative source for:
//   - @testing-library/react-native renderer setup
//   - RN component stubs (FlatList, ScrollView, Modal, Image, …)
//   - Reanimated / GestureHandler jestSetup
//   - babel-jest transform for .tsx/.ts via babel-preset-expo
//
// Do NOT duplicate any of those stubs in jest.setup.ts or moduleNameMapper.
// Only add a Layer 2 entry when the preset does NOT cover a module and
// that module crashes in Node (native binary or ESM-only package).

/** @type {import('jest').Config} */
module.exports = {
  // ✅ jest-expo preset confirmed — provides RN stubs, Reanimated, transforms.
  // Never duplicate its built-in polyfills in jest.setup.ts.
  preset: 'jest-expo',

  // LAYER 1 — runs BEFORE jest-expo's preset setup.js
  setupFiles: ['<rootDir>/jest.polyfill.js'],

  // LAYER 3 — runs AFTER test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // CANONICAL: only src/__tests__/ is the test tree.
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.test.tsx',
  ],

  // LAYER 2 — module routing
  // Rule: never inline a factory here — always point to a __mocks__/ file.
  moduleNameMapper: {
    // ── Core / Fetch ──────────────────────────────────────────────────────
    '^expo-modules-core$':
      '<rootDir>/__mocks__/expo-modules-core.js',
    '^expo/src/winter/fetch/ExpoFetchModule$':
      '<rootDir>/__mocks__/expoFetchModule.js',
    '^expo/src/winter/fetch(.*)$':
      '<rootDir>/__mocks__/expoFetch.js',

    // ── File system ──────────────────────────────────────────────────────
    '^expo-file-system/legacy$':
      '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',

    // ── Storage ───────────────────────────────────────────────────────────
    // ⚠️ THIS IS THE ONLY PLACE async-storage IS MOCKED.
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',

    // ── Print / Share ─────────────────────────────────────────────────────
    '^expo-print$':
      '<rootDir>/__mocks__/expo-print.js',
    '^expo-sharing$':
      '<rootDir>/__mocks__/expo-sharing.js',

    // ── Notifications ─────────────────────────────────────────────────────
    '^expo-notifications$':
      '<rootDir>/__mocks__/expo-notifications.js',

    // ── Network ───────────────────────────────────────────────────────────
    '^@react-native-community/netinfo$':
      '<rootDir>/__mocks__/@react-native-community/netinfo.js',
  },

  // Transform: allow Jest to transpile Expo/RN packages (they ship ESM source).
  // Rule: add a package here ONLY when you see a SyntaxError from that package.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};
