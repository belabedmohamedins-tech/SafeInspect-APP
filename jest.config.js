// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // Runs BEFORE jest-expo's preset setup.js — installs Fetch API globals so
  // that `class FetchResponse extends Response` (expo/src/winter) never sees
  // missing globals, and ExpoFetchModule never crashes the suite.
  setupFiles: ['<rootDir>/jest.polyfill.js'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testMatch: [
    '**/__tests__/**/*.test.ts?(x)',
    '**/__tests__/**/*.test.tsx',
  ],

  moduleNameMapper: {
    '^expo-modules-core$': '<rootDir>/__mocks__/expo-modules-core.js',
    '^expo-file-system/legacy$': '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router))',
  ],
};
