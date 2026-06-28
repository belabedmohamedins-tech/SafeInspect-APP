// __mocks__/expoFetchModule.js — LAYER 2 of the mock architecture
//
// Registered via moduleNameMapper in jest.config.js:
//   '^expo/src/winter/fetch/ExpoFetchModule$' → this file
//
// Why this file exists:
//   expo/src/winter/fetch/ExpoFetchModule.ts calls:
//     requireNativeModule('ExpoFetchModule')
//   which crashes in Node/Jest because there is no native binding.
//   This stub intercepts the import at the module-resolution level
//   (before any code runs), which is the correct layer for this fix.
//
// Why NOT in jest.setup.ts:
//   A virtual jest.mock() in setup works but belongs to Layer 3
//   (behavioral mocks).  Module routing belongs in Layer 2 (moduleNameMapper).
//   Using moduleNameMapper is more explicit and avoids jest.mock() hoisting
//   surprises.
module.exports = {
  fetch:    jest.fn(),
  Headers:  jest.fn(),
  Request:  jest.fn(),
  Response: jest.fn(),
};
