/**
 * jest.config.ts  (🟢 roadmap item 4: migrated from .js for full TypeScript
 * autocomplete and type-safety on all Jest config options)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * MOCK ARCHITECTURE CONTRACT — read before adding any mock
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This project uses a strict 4-layer mock architecture.
 * Every mock belongs in exactly ONE layer.  Do not add mocks in the wrong layer.
 *
 *  LAYER 1 — jest.polyfill.js  (setupFiles, runs before preset)
 *    Purpose : Install global polyfills that must exist before any module
 *              is evaluated (fetch, Response, TextEncoder, …)
 *    Rule    : Only global assignments (globalThis.X = …). No jest.mock().
 *    Current : undici-based fetch/Response/Headers/Request/FormData
 *
 *  LAYER 2 — moduleNameMapper  (this file, below)
 *    Purpose : Redirect module imports to safe stubs before Jest resolves
 *              them.  Used for native/Expo modules that crash in Node.
 *    Rule    : Map to __mocks__/ files only. No inline factories here.
 *    Current : expo-modules-core, expo-file-system/legacy,
 *              async-storage, expo winter-fetch internals,
 *              expo-print, expo-sharing, expo-notifications, netinfo
 *              (🟡 roadmap item 2: all complex mocks now live in __mocks__/)
 *
 *  LAYER 3 — jest.setup.ts  (setupFilesAfterEnv)
 *    Purpose : Global behavioral mocks that require jest.mock() semantics
 *              and need to run after the test framework is installed.
 *    Rule    : Only mocks that CANNOT be handled by moduleNameMapper
 *              (e.g. react-native Proxy, Platform, safe-area-context).
 *              Never duplicate a mock already in Layer 2.
 *    Current : react-native (Proxy), Platform, react-native-safe-area-context
 *
 *  LAYER 4 — individual test files  (src/__tests__/**)
 *    Purpose : Domain-specific mocks for the unit under test.
 *    Rule    : Only mock direct dependencies of the module being tested
 *              (repositories, services, expo-router per test).
 *              NEVER mock infrastructure here — no react-native, Platform,
 *              or @react-native-async-storage/async-storage inline factories.
 *              The async-storage mock lives exclusively in Layer 2.
 *              Use __resetStore() in beforeEach to wipe the in-memory store.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL TEST LOCATION: src/__tests__/
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * All tests live under src/__tests__/. The root __tests__/ directory at the
 * project root is no longer used. testMatch below enforces this.
 * Having tests in two locations caused relative-path ambiguity and Layer-2
 * contract violations. Do NOT add tests outside src/__tests__/.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * jest-expo PRESET (🟡 roadmap item 3: confirmation)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * preset: 'jest-expo' is set below.  The preset already provides:
 *   - @testing-library/react-native renderer setup
 *   - RN component stubs (FlatList, ScrollView, Modal, Image, …)
 *   - Reanimated / GestureHandler jestSetup
 *   - babel-jest transform for .tsx/.ts via babel-preset-expo
 *
 * Do NOT duplicate any of those stubs in jest.setup.ts or moduleNameMapper.
 * Only add a Layer 2 entry when the preset does NOT cover a module and
 * that module crashes in Node (native binary or ESM-only package).
 */

import type { Config } from 'jest';

const config: Config = {
  // 🟡 Confirmed: jest-expo preset is listed here and NOT duplicated anywhere.
  // Its built-in polyfills (RN stubs, Reanimated, GestureHandler) are the
  // authoritative source — jest.setup.ts only OVERRIDES where necessary.
  preset: 'jest-expo',

  // LAYER 1 — runs BEFORE jest-expo's preset setup.js
  // Installs Fetch API globals so expo/src/winter/FetchResponse.ts never
  // sees a missing Response class.
  setupFiles: ['<rootDir>/jest.polyfill.js'],

  // LAYER 3 — runs AFTER test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // CANONICAL: only src/__tests__/ is the test tree.
  // The root __tests__/ directory is excluded intentionally.
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.test.tsx',
  ],

  // LAYER 2 — module routing
  // Each entry: <import path> → <stub file in __mocks__/>
  // Rule: never inline a factory here — always point to a file.
  moduleNameMapper: {
    // ── Core / Fetch ──────────────────────────────────────────────────────
    // expo-modules-core: strict-Proxy native module stub.
    // Reason: requireNativeModule() crashes in Node without this.
    '^expo-modules-core$':
      '<rootDir>/__mocks__/expo-modules-core.js',

    // expo winter-fetch internals: stub the ExpoFetchModule native binding.
    '^expo/src/winter/fetch/ExpoFetchModule$':
      '<rootDir>/__mocks__/expoFetchModule.js',
    '^expo/src/winter/fetch(.*)$':
      '<rootDir>/__mocks__/expoFetch.js',

    // ── File system ───────────────────────────────────────────────────────
    // expo-file-system legacy path: used by pdfService.
    '^expo-file-system/legacy$':
      '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',

    // ── Storage ───────────────────────────────────────────────────────────
    // async-storage: official Jest mock provided by the library.
    // ⚠️  THIS IS THE ONLY PLACE THIS MODULE IS MOCKED.
    // Do NOT add jest.mock('@react-native-async-storage/async-storage', ...)
    // in any test file.
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',

    // ── Print / Share ─────────────────────────────────────────────────────
    // (🟡 roadmap item 2: moved from ad-hoc per-test mocks to __mocks__/)
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
  // Rule: add a package here ONLY when you see a SyntaxError from that package
  //       in test output.  Do not add packages pre-emptively.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};

export default config;
