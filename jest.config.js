// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testMatch: [
    '**/__tests__/**/*.test.ts?(x)',
    '**/__tests__/**/*.test.tsx',
  ],

  moduleNameMapper: {
    // Redirect the two entry points that jest-expo's preset setup.js
    // touches at startup to empty stubs, breaking the chain before
    // FetchResponse (which extends native Response) is ever evaluated.
    '^expo/src/winter/installGlobal(.*)$': '<rootDir>/__mocks__/expoFetch.js',
    '^expo/src/winter/runtime(.*)$':       '<rootDir>/__mocks__/expoFetch.js',
    '^expo/src/winter/fetch(.*)$':         '<rootDir>/__mocks__/expoFetch.js',

    '^expo-modules-core$': '<rootDir>/__mocks__/expo-modules-core.js',
    '^expo-file-system/legacy$': '<rootDir>/src/__mocks__/expo-file-system-legacy.ts',
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },

  transformIgnorePatterns: [
    // Transpile all expo/* packages including expo/src/winter so Babel
    // can downcompile ES class syntax before Node evaluates it.
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@expo/vector-icons|expo-modules-core|react-native-svg|react-native-reanimated|react-native-worklets|expo-router|expo/src/winter))',
  ],
};
