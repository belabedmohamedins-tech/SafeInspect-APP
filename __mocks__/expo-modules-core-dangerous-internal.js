// __mocks__/expo-modules-core-dangerous-internal.js
//
// Stub for expo-modules-core/src/polyfill/dangerous-internal
//
// jest-expo SDK 56 setup.js does, in order:
//   Line 319: require(...).installExpoGlobalPolyfill()
//   Line 325: class NativeRequest extends globalThis.expo.SharedObject {}
//   Line 330: class NativeResponse extends globalThis.expo.SharedObject {}
//
// The real dangerous-internal.ts sets globalThis.expo = {
//   EventEmitter, NativeModule, SharedObject, SharedRef, modules, ...
// }.
// We must do the same so lines 325/330 can extend a real class.

// ─── Minimal base classes (mirrors CoreModule.ts) ───────────────────────────

class EventEmitter {
  addListener() { return { remove: () => {} }; }
  removeListener() {}
  removeAllListeners() {}
  emit() {}
  listenerCount() { return 0; }
  startObserving() {}
  stopObserving() {}
}

class SharedObject {
  addListener() { return { remove: () => {} }; }
  removeAllListeners() {}
  release() {}
}

class NativeModule extends EventEmitter {}

class SharedRef extends SharedObject {}

// ─── installExpoGlobalPolyfill ───────────────────────────────────────────────

function installExpoGlobalPolyfill() {
  // Guard: if already installed (e.g. by a previous test file), skip.
  if (globalThis.expo) return;

  globalThis.expo = {
    EventEmitter,
    NativeModule,
    SharedObject,
    SharedRef,
    modules: (globalThis.ExpoDomWebView && globalThis.ExpoDomWebView.expoModulesProxy) || {},
    uuidv4: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    }),
    uuidv5: () => '00000000-0000-5000-0000-000000000000',
    getViewConfig: () => { throw new Error('Method not implemented.'); },
    reloadAppAsync: async () => {},
    expoModulesCoreVersion: undefined,
    cacheDir: undefined,
    documentsDir: undefined,
    installOnUIRuntime: () => { throw new Error('Method not implemented.'); },
  };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  installExpoGlobalPolyfill,
  // Legacy alias kept for safety
  installGlobals: function installGlobals() {},
  EventEmitter,
  NativeModule,
  SharedObject,
  SharedRef,
  default: {},
};
