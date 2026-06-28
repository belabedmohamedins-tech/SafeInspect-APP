// jest.config.js
//
// ═══════════════════════════════════════════════════════════════════════════
// MOCK ARCHITECTURE CONTRACT — read before adding any mock
// ═══════════════════════════════════════════════════════════════════════════
//
// This project uses a strict 4-layer mock architecture.  Every mock belongs
// in exactly ONE layer.  Do not add mocks in the wrong layer.
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
//              async-storage, expo winter-fetch internals
//
//  LAYER 3 — jest.setup.ts  (setupFilesAfterEnv)
//    Purpose : Global behavioral mocks that require jest.mock() semantics
//              and need to run after the test framework is installed.
//    Rule    : Only mocks that CANNOT be handled by moduleNameMapper
//              (e.g. react-native Proxy, Platform, safe-area-context).
//              Never duplicate a mock already in Layer 2.
//    Current : react-native (Proxy), Platform, react-native-safe-area-context
//
//  LAYER 4 — individual test files
//    Purpose : Domain-specific mocks for the unit under test.
//    Rule    : Only mock direct dependencies of the module being tested
//              (repositories, services, expo-router per test).
//              Never mock infrastructure here (react-native, Platform, etc.)
//
// ═══════════════════════════════════════════════════════════════════════════

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // LAYER 1 — runs BEFORE jest-expo's preset setup.js
  // Installs Fetch API globals so expo/src/winter/FetchResponse.ts never
  // sees a missing Response class.
  setupFiles: ['<rootDir>/jest.polyfill.js'],

  // LAYER 3 — runs AFTER test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testMatch: [
    '**/__tests__/**/*.test.ts?(x)',
    '**/__tests__/**/*.test.tsx',
  ],

  // LAYER 2 — module routing
  // Each entry: <import path> → <stub file>
  // Rule: the stub file must live in __mocks__/ and be documented.
  moduleNameMapper: {
    // expo-modules-core: Proxy-based native module stub.
    // Reason: requireNativeModule() crashes in Node without this.
    '^expo-modules-core$':
      '<rootDir>/__mocks__/expo-modules-core.js',

    // expo winter-fetch internals: stub the ExpoFetchModule native binding.
    // Reason: FetchResponse.ts does `class FetchResponse extends Response`
    // and requireNativeModule('ExpoFetchModule') — both crash without stubs.
    '^expo/src/winter/fetch/ExpoFetchModule$':
      '<rootDir>/__mocks__/expoFetchModule.js',
    '^expo/src/winter/fetch(.*)$':
      '<rootDir>/__mocks__/expoFetch.js',

    // expo-file-system legacy path: used by pdfService.
    '^expo-file-system/legacy$':
      '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',

    // async-storage: official Jest mock provided by the library.
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },

  // Transform: allow Jest to transpile Expo/RN packages (they ship ESM source).
  // Rule: add a package here ONLY when you see a SyntaxError from that package
  //       in test output.  Do not add packages pre-emptively.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};
