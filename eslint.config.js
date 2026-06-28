// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // ─── App source: ban direct AsyncStorage usage ──────────────────────────────
  {
    files: ['app/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: '@react-native-async-storage/async-storage',
          message: 'Do not import AsyncStorage directly in screens. Use a repository from src/repositories/ instead.',
        }],
        patterns: [{
          group: ['@react-native-async-storage/*'],
          message: 'Use src/repositories/ instead of AsyncStorage directly.',
        }],
      }],
    },
  },
  // ─── Test files: enforce 4-layer mock architecture contract ─────────────────
  // Layer 2 (moduleNameMapper in jest.config.js) owns the AsyncStorage mock.
  // No test file may override it with an inline jest.mock() factory.
  // Violating this causes silent mock-registry cache invalidation that makes
  // other mocked modules resolve as `undefined` with no warning.
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='jest'][callee.property.name='mock'] > Literal[value='@react-native-async-storage/async-storage']",
          message:
            "jest.mock('@react-native-async-storage/async-storage') is forbidden in test files. " +
            'This module is handled exclusively by Layer 2 (moduleNameMapper in jest.config.js). ' +
            'Use AsyncStorage.__resetStore() in beforeEach to wipe the in-memory store between tests. ' +
            'See the MOCK ARCHITECTURE CONTRACT in jest.config.js for details.',
        },
      ],
    },
  },
]);
