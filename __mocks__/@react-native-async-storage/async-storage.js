// CommonJS mock — Jest resolves this file via moduleNameMapper.
// Must use module.exports (not ES6 export default) so that
//   import AsyncStorage from '...'  →  _asyncStorage.default  resolves correctly
// with Babel's interopRequireDefault helper.
//
// KEY DESIGN: all jest.fn() stubs use .mockImplementation() (not the
// jest.fn(impl) shorthand). jest.clearAllMocks() resets call counts and
// removes implementations set via the jest.fn(impl) shorthand, but it
// does NOT remove implementations set via .mockImplementation(). This
// guarantees the store read/write logic survives a clearAllMocks() call
// in beforeEach without needing mockReset or manual re-wiring.

let store = {};

const AsyncStorage = {
  getItem:     jest.fn().mockImplementation((key)        => Promise.resolve(store[key] ?? null)),
  setItem:     jest.fn().mockImplementation((key, value) => { store[key] = String(value); return Promise.resolve(); }),
  removeItem:  jest.fn().mockImplementation((key)        => { delete store[key]; return Promise.resolve(); }),
  clear:       jest.fn().mockImplementation(()           => { store = {}; return Promise.resolve(); }),
  getAllKeys:   jest.fn().mockImplementation(()          => Promise.resolve(Object.keys(store))),
  multiGet:    jest.fn().mockImplementation((keys)       => Promise.resolve(keys.map((k) => [k, store[k] ?? null]))),
  multiSet:    jest.fn().mockImplementation((pairs)      => { pairs.forEach(([k, v]) => { store[k] = String(v); }); return Promise.resolve(); }),
  multiRemove: jest.fn().mockImplementation((keys)       => { keys.forEach((k) => delete store[k]); return Promise.resolve(); }),
  // Helper for tests to reset state between cases
  __resetStore: () => { store = {}; },
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
