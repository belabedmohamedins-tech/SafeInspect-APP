// __mocks__/expo-modules-core-dangerous-internal.js
//
// Stub for expo-modules-core/src/polyfill/dangerous-internal
//
// jest-expo ~56.0.0 setup.js (line 319) calls:
//   require('expo-modules-core/src/polyfill/dangerous-internal')
//     .installExpoGlobalPolyfill()
//
// SDK 56 expo-modules-core no longer exposes this path, so we stub it.
// The function only needs to set up globalThis.expo polyfills; since
// jest.polyfill.js already handles our globals, this is safely a no-op.

module.exports = {
  installExpoGlobalPolyfill: function installExpoGlobalPolyfill() {
    // Ensure globalThis.expo exists so code that reads it doesn't throw
    if (typeof globalThis.expo === 'undefined') {
      globalThis.expo = { modules: {} };
    }
    if (typeof globalThis.expo.modules === 'undefined') {
      globalThis.expo.modules = {};
    }
  },

  // Legacy alias kept for any other callers
  installGlobals: function installGlobals() {},

  default: {},
};
