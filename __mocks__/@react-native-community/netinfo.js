// __mocks__/@react-native-community/netinfo.js
// Layer 2 stub for @react-native-community/netinfo.
// Wired via moduleNameMapper in jest.config.js.
//
// Default state: online wi-fi.
//
// To simulate offline in a test:
//   import NetInfo from '@react-native-community/netinfo';
//   beforeEach(() => NetInfo.__setConnected(false));
//   afterEach(() =>  NetInfo.__setConnected(true));  // restore
//
// To simulate a specific state object:
//   NetInfo.__setState({ type: 'cellular', isConnected: true, ... });

const makeState = (connected) => ({
  type:                connected ? 'wifi' : 'none',
  isConnected:         connected,
  isInternetReachable: connected,
  details:             connected ? { isConnectionExpensive: false } : null,
});

let _state = makeState(true);

const NetInfo = {
  fetch:          jest.fn(() => Promise.resolve(_state)),
  addEventListener: jest.fn(() => jest.fn()),   // returns unsubscribe fn
  useNetInfo:     jest.fn(() => _state),
  configure:      jest.fn(),

  // ── Test helpers ──────────────────────────────────────────────────────
  // Use these in beforeEach/afterEach instead of re-implementing the mock.
  __setConnected: (connected) => {
    _state = makeState(connected);
    NetInfo.fetch.mockResolvedValue(_state);
    NetInfo.useNetInfo.mockReturnValue(_state);
  },
  __setState: (state) => {
    _state = state;
    NetInfo.fetch.mockResolvedValue(_state);
    NetInfo.useNetInfo.mockReturnValue(_state);
  },
  __reset: () => {
    _state = makeState(true);
    NetInfo.fetch.mockResolvedValue(_state);
    NetInfo.useNetInfo.mockReturnValue(_state);
  },
};

module.exports = {
  __esModule: true,
  default:          NetInfo,
  fetch:            NetInfo.fetch,
  addEventListener: NetInfo.addEventListener,
  useNetInfo:       NetInfo.useNetInfo,
  configure:        NetInfo.configure,
  __setConnected:   NetInfo.__setConnected,
  __setState:       NetInfo.__setState,
  __reset:          NetInfo.__reset,
};
