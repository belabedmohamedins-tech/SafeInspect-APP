// __mocks__/expo-secure-store.js
// Layer-2 global mock for expo-secure-store.
//
// KEY DESIGN: the Map lives at module scope. The jest.fn() stubs are defined
// with mockImplementation so they ALWAYS read/write the same Map instance,
// even after jest.clearAllMocks() (which resets call counts but does NOT
// remove a mockImplementation set via the factory — only mockReset does).
//
// Use __resetStore() in beforeEach to clear stored values between tests.

const _store = new Map();

const getItemAsync = jest.fn().mockImplementation(
  (key) => Promise.resolve(_store.get(key) ?? null)
);

const setItemAsync = jest.fn().mockImplementation(
  (key, value) => { _store.set(key, value); return Promise.resolve(); }
);

const deleteItemAsync = jest.fn().mockImplementation(
  (key) => { _store.delete(key); return Promise.resolve(); }
);

const __resetStore = () => _store.clear();

module.exports = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  WHEN_UNLOCKED:      'WHEN_UNLOCKED',
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
  ALWAYS:             'ALWAYS',
  __resetStore,
};
