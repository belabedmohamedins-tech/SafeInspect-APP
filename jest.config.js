// jest.config.js
// Replaces the "jest" block in package.json for easier multi-line config.

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // setupFiles runs BEFORE the test framework and BEFORE jest-expo's preset
  // setup scripts.  We use it to patch global.fetch and any native stubs that
  // jest-expo tries to bootstrap at that early phase.
  setupFiles: ['<rootDir>/jest.earlySetup.js'],

  // setupFilesAfterEnv runs after the framework — jest.mock() is available.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testMatch: [
    '**/__tests__/**/*.test.ts?(x)',
    '**/__tests__/**/*.test.tsx',
  ],

  moduleNameMapper: {
    '^expo-modules-core$': '<rootDir>/__mocks__/expo-modules-core.js',
    '^expo/src/winter/(.*)$': '<rootDir>/__mocks__/expoFetch.js',
    '^expo-file-system/legacy$': '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};
