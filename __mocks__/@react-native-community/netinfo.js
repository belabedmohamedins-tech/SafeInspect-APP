// __mocks__/@react-native-community/netinfo.js
// Layer 2 stub for @react-native-community/netinfo.
// Wired via moduleNameMapper in jest.config.ts.
// Default state: online wi-fi — override in individual tests with
//   (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });

const mockState = {
  type:          'wifi',
  isConnected:   true,
  isInternetReachable: true,
  details:       { isConnectionExpensive: false },
};

module.exports = {
  __esModule: true,
  default: {
    fetch:          jest.fn().mockResolvedValue(mockState),
    addEventListener: jest.fn(() => jest.fn()), // returns unsubscribe fn
    useNetInfo:     jest.fn(() => mockState),
    configure:      jest.fn(),
  },
  // Named re-exports used by some import styles
  fetch:          jest.fn().mockResolvedValue(mockState),
  addEventListener: jest.fn(() => jest.fn()),
  useNetInfo:     jest.fn(() => mockState),
  configure:      jest.fn(),
};
