// __mocks__/expo-modules-core.js
// Replaces expo-modules-core in Jest (Node environment).
// requireNativeModule returns a Proxy so any property/method access on the
// "native module" silently returns a jest.fn() instead of crashing.

const makeProxy = () =>
  new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === '__esModule') return false;
        if (prop === 'then') return undefined; // not a Promise
        return jest.fn();
      },
    },
  );

module.exports = {
  NativeModulesProxy: {},
  EventEmitter: class {
    addListener() { return { remove: () => {} }; }
    removeAllListeners() {}
  },
  Platform: { OS: 'android' },
  UnavailabilityError: class extends Error {},
  requireNativeModule: () => makeProxy(),
  requireOptionalNativeModule: () => makeProxy(),
  default: {
    NativeModulesProxy: {},
    requireNativeModule: () => makeProxy(),
    requireOptionalNativeModule: () => makeProxy(),
  },
};
