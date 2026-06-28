// Stub for expo/src/winter/* modules.
// These modules require native bindings or extend native globals (Response,
// Request, Headers) that do not exist in Node/Jest. Redirecting them here
// via moduleNameMapper prevents jest-expo's setup script from evaluating
// FetchResponse.ts (which does `class FetchResponse extends Response`) before
// the test environment is ready.
module.exports = {};
