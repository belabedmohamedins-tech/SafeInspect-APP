// __mocks__/expo-secure-store.js
// Layer-2 global mock for expo-secure-store.
// Behaves like an in-memory key-value store so tests that read back
// values they wrote get consistent results without touching the keychain.

const store = new Map();

const getItemAsync    = jest.fn((key) => Promise.resolve(store.get(key) ?? null));
const setItemAsync    = jest.fn((key, value) => { store.set(key, value); return Promise.resolve(); });
const deleteItemAsync = jest.fn((key) => { store.delete(key); return Promise.resolve(); });

// Exposed so test files can reset between tests
const __resetStore = () => store.clear();

module.exports = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  WHEN_UNLOCKED: 'WHEN_UNLOCKED',
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
  ALWAYS: 'ALWAYS',
  __resetStore,
};
