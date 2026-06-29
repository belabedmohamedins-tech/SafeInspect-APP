// __mocks__/@react-native-community/netinfo.js
// Wired via moduleNameMapper in jest.config.js.
//
// Default state: online wi-fi.
//
// IMPORTANT: addEventListener is a plain function, NOT jest.fn().
// If it were a jest.fn(), jest.clearAllMocks() would wipe its inline
// implementation body, breaking any test that calls clearAllMocks() and
// then expects __setAddEventListener() to work.
//
// fetch and useNetInfo remain jest.fn() so tests can assert call counts
// and swap return values — just remember to call __reset() after
// jest.clearAllMocks() to restore their mockResolvedValue.

const makeState = (connected) => ({
  type:                connected ? 'wifi' : 'none',
  isConnected:         connected,
  isInternetReachable: connected,
  details:             connected ? { isConnectionExpensive: false } : null,
});

let _state = makeState(true);

// Injectable addEventListener implementation — replaced per-test via
// __setAddEventListener().  Plain variable, not a mock.
let _addEventListenerImpl = null;

const NetInfo = {
  fetch: jest.fn(() => Promise.resolve(_state)),

  // Plain function — immune to jest.clearAllMocks().
  addEventListener: function addEventListener(cb) {
    if (_addEventListenerImpl) return _addEventListenerImpl(cb);
    // Default: no-op unsubscribe.
    return function unsubscribe() {};
  },

  useNetInfo: jest.fn(() => _state),
  configure:  jest.fn(),

  // ── Test helpers ──────────────────────────────────────────────────────────

  /** Replace addEventListener implementation for this test. */
  __setAddEventListener: function(impl) {
    _addEventListenerImpl = impl;
  },

  /** Restore default addEventListener behaviour. */
  __resetAddEventListener: function() {
    _addEventListenerImpl = null;
  },

  __setConnected: function(connected) {
    _state = makeState(connected);
    NetInfo.fetch.mockResolvedValue(_state);
    NetInfo.useNetInfo.mockReturnValue(_state);
  },
  __setState: function(state) {
    _state = state;
    NetInfo.fetch.mockResolvedValue(_state);
    NetInfo.useNetInfo.mockReturnValue(_state);
  },
  __reset: function() {
    _state = makeState(true);
    _addEventListenerImpl = null;
    NetInfo.fetch.mockResolvedValue(_state);
    NetInfo.useNetInfo.mockReturnValue(_state);
  },
};

module.exports = {
  __esModule: true,
  default:                 NetInfo,
  fetch:                   NetInfo.fetch,
  addEventListener:        NetInfo.addEventListener,
  useNetInfo:              NetInfo.useNetInfo,
  configure:               NetInfo.configure,
  __setAddEventListener:   NetInfo.__setAddEventListener,
  __resetAddEventListener: NetInfo.__resetAddEventListener,
  __setConnected:          NetInfo.__setConnected,
  __setState:              NetInfo.__setState,
  __reset:                 NetInfo.__reset,
};
