// Stub for expo/src/winter/fetch/ExpoFetchModule
// Prevents 'Cannot find native module ExpoFetchModule' in Jest (Node env).
module.exports = {
  fetch: jest.fn(),
  Headers: jest.fn(),
  Request: jest.fn(),
  Response: jest.fn(),
};
