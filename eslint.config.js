// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
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
]);
