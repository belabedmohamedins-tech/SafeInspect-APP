// __mocks__/expo-print.js
// Layer 2 stub for expo-print.
// Wired via moduleNameMapper in jest.config.ts.
// All functions return safe resolved values so tests never hit the native binary.

module.exports = {
  printAsync:     jest.fn().mockResolvedValue(undefined),
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///tmp/mock.pdf' }),
  selectPrinterAsync: jest.fn().mockResolvedValue(null),
  Orientation: {
    portrait:  'portrait',
    landscape: 'landscape',
  },
};
