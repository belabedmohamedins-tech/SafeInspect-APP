/**
 * jest.polyfill.js  — runs via jest > setupFiles (before jest-expo preset)
 *
 * jest-expo's setup.js (SDK 52+) bootstraps expo/src/winter/fetch at startup.
 * That module contains:
 *
 *   class FetchResponse extends Response { … }
 *
 * Node ≥ 18 has a built-in fetch/Response, but jest-expo overrides the
 * testEnvironment with a jsdom-like shim that strips those globals out.
 * The result: `Response is not defined` → `requireNativeModule('ExpoFetchModule')`
 * blows up every test suite before a single test runs.
 *
 * Fix: install the WHATWG Fetch globals into globalThis here, before the
 * preset touches anything.  We use the same undici-based globals that
 * Node 18+ ships, falling back to `node-fetch` v2 if undici isn't present.
 */

'use strict';

// ── Prefer undici (ships with Node 18+) ─────────────────────────────────────
try {
  const { fetch, Request, Response, Headers, FormData } = require('undici');
  if (!globalThis.fetch)    globalThis.fetch    = fetch;
  if (!globalThis.Request)  globalThis.Request  = Request;
  if (!globalThis.Response) globalThis.Response = Response;
  if (!globalThis.Headers)  globalThis.Headers  = Headers;
  if (!globalThis.FormData) globalThis.FormData = FormData;
} catch (_) {
  // undici not available — fall back to node-fetch v2
  try {
    const nodeFetch = require('node-fetch');
    const fetch    = nodeFetch.default ?? nodeFetch;
    const Request  = nodeFetch.Request;
    const Response = nodeFetch.Response;
    const Headers  = nodeFetch.Headers;
    if (!globalThis.fetch)    globalThis.fetch    = fetch;
    if (!globalThis.Request)  globalThis.Request  = Request;
    if (!globalThis.Response) globalThis.Response = Response;
    if (!globalThis.Headers)  globalThis.Headers  = Headers;
  } catch (__) {
    // Neither undici nor node-fetch is installed.
    // Provide a minimal Response stub so the Expo winter chain doesn't crash.
    if (!globalThis.Response) {
      globalThis.Response = class Response {
        constructor(body, init) {
          this.body    = body ?? null;
          this.status  = (init && init.status)  ?? 200;
          this.ok      = this.status >= 200 && this.status < 300;
          this.headers = new Map(Object.entries((init && init.headers) ?? {}));
        }
        async text()   { return String(this.body ?? ''); }
        async json()   { return JSON.parse(String(this.body ?? 'null')); }
        async arrayBuffer() { return new ArrayBuffer(0); }
        clone()        { return Object.assign(Object.create(Object.getPrototypeOf(this)), this); }
      };
    }
    if (!globalThis.Headers) {
      globalThis.Headers = class Headers extends Map {};
    }
    if (!globalThis.Request) {
      globalThis.Request = class Request {
        constructor(url, init) { this.url = url; this.method = (init && init.method) ?? 'GET'; }
      };
    }
    if (!globalThis.fetch) {
      globalThis.fetch = () => Promise.reject(new Error('fetch not available in test environment'));
    }
  }
}
