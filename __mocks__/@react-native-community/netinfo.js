// __mocks__/@react-native-community/netinfo.js
// Layer 2 stub for @react-native-community/netinfo.
// Wired via moduleNameMapper in jest.config.js.
//
// Default state: online wi-fi.
//
// ── Per-test spy injection ────────────────────────────────────────────────────
// jest.mock() factory overrides do NOT win over moduleNameMapper after
// jest.resetModules() — the mapper-provided file always loads.  Instead, tests
// that need to intercept addEventListener (e.g. syncEngine.test.ts) should
// call NetInfo.__setAddEventListener(spyFn) in beforeEach and reset it in
// afterEach via NetInfo.__resetAddEventListener().
//
// Example:
//   import NetInfo from '@react-native-community/netinfo';
//   beforeEach(() => NetInfo.__setAddEventListener((cb) => {
//     capturedListener = cb;
//     return unsubscribeSpy;
//   }));
//   afterEach(() => NetInfo.__resetAddEventListener());
//
// ── Simulating offline ────────────────────────────────────────────────────────
//   NetInfo.__setConnected(false);   // in beforeEach
//   NetInfo.__setConnected(true);    // restore in afterEach
//
// ── Simulating a specific state object ───────────────────────────────────────
//   NetInfo.__setState({ type: 'cellular', isConnected: true, ... });

const makeState = (connected) => ({
  type:                connected ? 'wifi' : 'none',
  isConnected:         connected,
  isInternetReachable: connected,
  details:             connected ? { isConnectionExpensive: false } : null,
});

let _state = makeState(true);

// Injectable addEventListener implementation — replaced per-test when needed.
let _addEventListenerImpl = null;

const defaultAddEventListener = jest.fn(() => jest.fn());

const NetInfo = {
  fetch: jest.fn(() => Promise.resolve(_state)),

  addEventListener: jest.fn((cb) => {
    if (_addEventListenerImpl) return _addEventListenerImpl(cb);
    return defaultAddEventListener(cb);
  }),

  useNetInfo: jest.fn(() => _state),
  configure:  jest.fn(),

  // ── Test helpers ──────────────────────────────────────────────────────────

  /** Replace addEventListener implementation for this test. */
  __setAddEventListener: (impl) => {
    _addEventListenerImpl = impl;
  },

  /** Restore default addEventListener behaviour. */
  __resetAddEventListener: () => {
    _addEventListenerImpl = null;
  },

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
    _addEventListenerImpl = null;
    NetInfo.fetch.mockResolvedValue(_state);
    NetInfo.useNetInfo.mockReturnValue(_state);
  },
};

module.exports = {
  __esModule: true,
  default:              NetInfo,
  fetch:                NetInfo.fetch,
  addEventListener:     NetInfo.addEventListener,
  useNetInfo:           NetInfo.useNetInfo,
  configure:            NetInfo.configure,
  __setAddEventListener:   NetInfo.__setAddEventListener,
  __resetAddEventListener: NetInfo.__resetAddEventListener,
  __setConnected:       NetInfo.__setConnected,
  __setState:           NetInfo.__setState,
  __reset:              NetInfo.__reset,
};
