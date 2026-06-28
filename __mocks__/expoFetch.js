// __mocks__/expoFetch.js — LAYER 2 of the mock architecture
//
// Registered via moduleNameMapper in jest.config.js:
//   '^expo/src/winter/fetch(.*)$' → this file
//
// Why this file exists:
//   expo/src/winter/fetch/* modules (FetchResponse.ts, FetchRequest.ts, etc.)
//   extend native globals (Response, Request, Headers) and call
//   requireNativeModule internally.  Even with polyfills in jest.polyfill.js,
//   the class extension chain can fail if the native module stub is not
//   intercepted at import resolution time.
//
//   Returning an empty object here prevents any of those modules from
//   executing in the Jest environment.  The real fetch behaviour is provided
//   by jest.polyfill.js (undici globals) for tests that need it.
module.exports = {};
