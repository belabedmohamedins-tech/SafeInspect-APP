// __mocks__/expo-modules-core-dangerous-internal.js
//
// Stub for expo-modules-core/src/polyfill/dangerous-internal
//
// jest-expo ~56.0.0 setup.js still requires this internal path but
// expo-modules-core in SDK 56 no longer exposes it at that location.
// This stub satisfies the import so all 38 test suites can run.
//
// The two exports jest-expo's setup.js accesses from this module:
//   1. default export  — object with polyfill helpers (stubbed as {})
//   2. installGlobals  — called to patch global.fetch etc. (no-op here
//      because our jest.polyfill.js already sets up any globals we need)

module.exports = {
  // Named export used by jest-expo setup
  installGlobals: function installGlobals() {},

  // Some versions access .default
  default: {},
};
