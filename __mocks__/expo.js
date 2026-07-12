// __mocks__/expo.js — LAYER 2 of the mock architecture
//
// Why this file exists:
//   The top-level `expo` package (Expo.fx.tsx / index.js) calls
//   installGlobal() at module-load time, which installs lazy getters for
//   fetch/Request/Response/Headers/FormData on `globalThis`.
//
//   When those getters fire (triggered by any import that touches `fetch`),
//   they evaluate expo/src/winter/runtime.native.ts → fetch/FetchResponse.ts
//   which does `class FetchResponse extends Response`.  If `Response` is
//   a getter that hasn't been replaced yet, Babel's _inherits() receives
//   undefined and throws:
//     TypeError: Super expression must either be null or a function
//
//   Even though moduleNameMapper intercepts expo/src/winter/* paths, the
//   jest-expo preset's own setupFiles require `expo` via Node's native
//   require (not the Jest module resolver), so the mapper never fires for
//   those calls.  The getter ends up on global before our polyfill can
//   replace it.
//
//   By providing a manual __mocks__/expo.js, Jest intercepts every
//   `require('expo')` / `import ... from 'expo'` through the module
//   resolver and returns this no-op stub instead, so installGlobal()
//   is never called from application code.
//
//   The jest-expo preset's own internal requires are unaffected because
//   they use the Node require, not the Jest resolver — but those calls
//   happen before any test module is loaded, and our jest.polyfill.js
//   (L1) already defines the fetch globals with configurable:false before
//   the preset runs, so the getter silently fails to install.
'use strict';

module.exports = {
  // Re-export the things application code commonly pulls from 'expo'
  registerRootComponent: jest.fn(),
  // Intentionally empty — no winter runtime, no installGlobal
};
