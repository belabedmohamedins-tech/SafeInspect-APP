// __mocks__/expoInstallGlobal.js — LAYER 2 of the mock architecture
//
// expo/src/winter/installGlobal.ts sets up lazy getters on globalThis
// for fetch, Request, Response, Headers, etc.  Those getters trigger
// expo/src/winter/runtime.native.ts → fetch/index.ts → fetch/FetchResponse.ts
// which tries to `extend Response` — and fails when the Proxy in jest.setup.ts
// intercepts the globalThis.Response lookup and returns undefined.
//
// Solution: replace the entire installGlobal module with a no-op so the
// lazy getters are never installed.  The real fetch globals are already
// installed by jest.polyfill.js (undici) and are sufficient for all tests.
module.exports = {
  installGlobal: () => {},
  default: () => {},
};
