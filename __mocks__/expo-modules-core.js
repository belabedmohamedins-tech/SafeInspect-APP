/**
 * Manual mock for expo-modules-core.
 *
 * jest-expo's own setup.js (line 234) eagerly requires
 * expo/src/winter/fetch/ExpoFetchModule, which chains into
 * expo-modules-core/src/index.ts → expo-modules-core/src/Platform.ts
 * before any jest.setup.ts mock can run.
 *
 * By placing a manual mock here and mapping it in moduleNameMapper,
 * Jest resolves this stub instead of the real package for every test
 * suite, preventing the "Cannot read properties of undefined (reading
 * 'select')" crash that blocked all 26 suites.
 */

const Platform = {
  OS: 'android',
  select: (obj) => obj['android'] ?? obj['default'] ?? Object.values(obj)[0],
  Version: 0,
  isTesting: true,
  isTV: false,
};

module.exports = {
  // Platform shim
  Platform,

  // NativeModulesProxy — many expo packages call this at module level
  NativeModulesProxy: new Proxy({}, { get: () => jest.fn() }),

  // EventEmitter used by several expo hooks
  EventEmitter: class EventEmitter {
    addListener() { return { remove: jest.fn() }; }
    removeAllListeners() {}
    emit() {}
  },

  // requireNativeModule / requireOptionalNativeModule — used by expo-file-system etc.
  requireNativeModule: () => ({}),
  requireOptionalNativeModule: () => null,

  // uuid helper used by some expo packages
  uuidv4: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
  uuidv5: () => 'xxxxxxxx-xxxx-5xxx-yxxx-xxxxxxxxxxxx',

  // Permissions
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },

  // Bare minimal stubs so deep expo module trees don't throw
  CodedError: class CodedError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },

  // Suppress any fetch polyfill attempt
  installGlobal: jest.fn(),
};
