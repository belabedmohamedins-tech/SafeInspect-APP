// __mocks__/expo-modules-core.js
// Replaces expo-modules-core in Jest (Node environment).
//
// 🔴 AUDIT (roadmap item 1): The previous catch-all `jest.fn()` fallback was
// replaced with an explicit throw for unknown keys.  This mirrors the strict
// Proxy pattern used in jest.setup.ts for react-native.
//
// If a test crashes with "[expo-modules-core] unstubbed access: 'X'", add X
// to the explicit stubs below instead of restoring the catch-all.

const makeStrictProxy = (label) =>
  new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === '__esModule') return false;
        if (prop === 'then')       return undefined; // not a Promise
        if (typeof prop === 'symbol') return undefined; // Symbol internals
        throw new Error(
          `[${label}] unstubbed access: "${String(prop)}"\n` +
          `Add an explicit stub in __mocks__/expo-modules-core.js.`
        );
      },
    },
  );

module.exports = {
  NativeModulesProxy: {},
  EventEmitter: class {
    addListener()        { return { remove: () => {} }; }
    removeAllListeners() {}
  },
  Platform:           { OS: 'android' },
  UnavailabilityError: class extends Error {},
  requireNativeModule:         (name) => makeStrictProxy(`requireNativeModule(${name})`),
  requireOptionalNativeModule: (name) => makeStrictProxy(`requireOptionalNativeModule(${name})`),
  default: {
    NativeModulesProxy:          {},
    requireNativeModule:         (name) => makeStrictProxy(`requireNativeModule(${name})`),
    requireOptionalNativeModule: (name) => makeStrictProxy(`requireOptionalNativeModule(${name})`),
  },
};
