/**
 * Global Jest setup — runs after the test framework is installed.
 *
 * jest.polyfill.js (setupFiles) already installed Fetch API globals before
 * jest-expo's preset loaded.  This file handles everything else:
 *   - stub out ExpoFetchModule (belt-and-suspenders after the polyfill)
 *   - mock React Native Platform (two paths — Libraries/ and top-level)
 *   - suppress noisy console output
 */

// ─── Expo winter-fetch native module stub ────────────────────────────────────
jest.mock('expo/src/winter/fetch/ExpoFetchModule', () => ({
  fetch:    jest.fn(),
  Headers:  jest.fn(),
  Request:  jest.fn(),
  Response: jest.fn(),
}), { virtual: true });

// ─── React Native Platform mock (Libraries/ path) ────────────────────────────
// Consumed by most RN internals and by jest-expo's preset resolver.
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS:      'android',
  select:  (obj: Record<string, unknown>) =>
    obj['android'] ?? obj['default'] ?? Object.values(obj)[0],
  Version:   0,
  isTesting: true,
  isTV:      false,
}));

// ─── React Native Platform mock (top-level import path) ──────────────────────
// expo-router (fonts.tsx) and any file doing `import { Platform } from
// 'react-native'` hits this path in the Jest module registry.
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    Platform: {
      ...rn.Platform,
      OS: 'android',
      select: (obj: Record<string, unknown>) =>
        obj['android'] ?? obj['default'] ?? Object.values(obj)[0],
      Version:   0,
      isTesting: true,
      isTV:      false,
    },
  };
});

const _consoleError = console.error.bind(console);
const _consoleWarn  = console.warn.bind(console);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    const suppressed = ['Warning:', 'AsyncStorage', 'Reanimated', 'act('];
    if (suppressed.some(s => msg.includes(s))) return;
    _consoleError(...args);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('Warning:') || msg.includes('Reanimated')) return;
    _consoleWarn(...args);
  });
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore?.();
  (console.warn  as jest.Mock).mockRestore?.();
});
