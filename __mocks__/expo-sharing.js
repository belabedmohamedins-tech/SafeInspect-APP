// __mocks__/expo-sharing.js
// Layer 2 stub for expo-sharing.
// Wired via moduleNameMapper in jest.config.ts.

module.exports = {
  shareAsync:        jest.fn().mockResolvedValue(undefined),
  isAvailableAsync:  jest.fn().mockResolvedValue(true),
};
