/**
 * jest.polyfill.js  — runs via jest > setupFiles (before jest-expo preset)
 *
 * jest-expo's setup.js (SDK 52+) bootstraps expo/src/winter/fetch at startup.
 * That module contains:
 *
 *   class FetchResponse extends Response { … }
 *
 * The preset installs LAZY GETTERS for fetch/Request/Response/Headers/FormData
 * on `global` via installGlobal.ts.  When those getters fire they execute:
 *   runtime.native.ts → fetch/index.ts → FetchResponse.ts
 * which does `class FetchResponse extends Response`.  If Response is
 * undefined at that moment Babel's _inherits() throws:
 *   TypeError: Super expression must either be null or a function
 *
 * This affects pdfService.test.ts and useHomeData.test.ts specifically
 * because their import graphs trigger the lazy getter before jest.setup.ts
 * (Layer 3) has a chance to freeze anything.
 *
 * THE FIX: define all five fetch globals with Object.defineProperty using
 * configurable:false BEFORE the preset runs.  A non-configurable own
 * property cannot be redefined with Object.defineProperty — the preset's
 * attempt to install a lazy getter on top will throw and be silently ignored
 * (jest-expo wraps the install in a try/catch), so our concrete values
 * survive for the lifetime of the test suite.
 *
 * We use `writable: true` so individual test files can still do
 * jest.spyOn(global, 'fetch') without hitting "Cannot assign to read only".
 */

'use strict';

function defineFetchGlobal(name, value) {
  if (value === undefined) return;
  try {
    // If the property doesn't exist yet, define it non-configurable so the
    // preset cannot replace it with a lazy getter.
    if (!Object.getOwnPropertyDescriptor(globalThis, name)) {
      Object.defineProperty(globalThis, name, {
        value,
        writable:     true,   // jest.spyOn must still work
        enumerable:   true,
        configurable: false,  // <─ key: preset cannot redefine with a getter
      });
    } else {
      // Already defined (e.g. Node 18 built-in) — just assign to keep it a
      // data descriptor (not a getter) without touching configurability.
      globalThis[name] = value;
    }
  } catch (_) {
    // Last resort: plain assignment.
    globalThis[name] = value;
  }
}

// ── 1. Try undici (ships with Node 18+) ──────────────────────────────────────
try {
  const { fetch, Request, Response, Headers, FormData } = require('undici');
  defineFetchGlobal('fetch',    fetch);
  defineFetchGlobal('Request',  Request);
  defineFetchGlobal('Response', Response);
  defineFetchGlobal('Headers',  Headers);
  defineFetchGlobal('FormData', FormData);
} catch (_) {
  // ── 2. Fall back to node-fetch v2 ─────────────────────────────────────────
  try {
    const nodeFetch = require('node-fetch');
    const fetch     = nodeFetch.default ?? nodeFetch;
    defineFetchGlobal('fetch',    fetch);
    defineFetchGlobal('Request',  nodeFetch.Request);
    defineFetchGlobal('Response', nodeFetch.Response);
    defineFetchGlobal('Headers',  nodeFetch.Headers);
  } catch (__) {
    // ── 3. Minimal stub so the winter chain never crashes ──────────────────
    //    FetchResponse extends Response — the stub must be a real class.
    class Response {
      constructor(body, init) {
        this.body    = body ?? null;
        this.status  = (init && init.status)  ?? 200;
        this.ok      = this.status >= 200 && this.status < 300;
        this.headers = new Map(Object.entries((init && init.headers) ?? {}));
      }
      async text()        { return String(this.body ?? ''); }
      async json()        { return JSON.parse(String(this.body ?? 'null')); }
      async arrayBuffer() { return new ArrayBuffer(0); }
      clone() { return Object.assign(Object.create(Object.getPrototypeOf(this)), this); }
    }
    class Headers extends Map {}
    class Request {
      constructor(url, init) { this.url = url; this.method = (init && init.method) ?? 'GET'; }
    }
    const fetch = () => Promise.reject(new Error('fetch not available in test environment'));

    defineFetchGlobal('fetch',    fetch);
    defineFetchGlobal('Request',  Request);
    defineFetchGlobal('Response', Response);
    defineFetchGlobal('Headers',  Headers);
  }
}
