// jest.earlySetup.js
// Runs in the "setupFiles" phase — BEFORE jest-expo's preset setup and before
// the test framework (no jest.mock() here, but global mutations are fine).
//
// Purpose: intercept the ExpoFetchModule native-module lookup that
// jest-expo/src/preset/setup.js triggers via requireNativeModule().
// Because this file runs before that setup script, installing a no-op
// global.fetch and stubbing the module registry entry here prevents
// "Cannot find native module 'ExpoFetchModule'" from ever being thrown.

// 1. Ensure global.fetch exists (Node 18+ has it, but older envs don't).
if (typeof global.fetch === 'undefined') {
  global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
}

// 2. Patch the Expo module registry so requireNativeModule('ExpoFetchModule')
//    returns a safe stub instead of throwing.
try {
  // expo-modules-core may already be mocked via moduleNameMapper, but
  // during the setupFiles phase the mapper may not yet be active for
  // transitive requires.  We defensively reach into the real module and
  // replace the registry entry if the API is available.
  const registry = require('@unimodules/core') || {};
  if (registry && typeof registry.__moduleRegistry === 'object') {
    registry.__moduleRegistry['ExpoFetchModule'] = {};
  }
} catch (_) {
  // @unimodules/core not present — that's fine, the Proxy mock handles it.
}
