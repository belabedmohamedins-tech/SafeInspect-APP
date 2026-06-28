/**
 * Global Jest setup — runs after the test framework is installed
 * (referenced by jest > setupFilesAfterFramework in package.json).
 *
 * Keeps the test output clean by silencing noisy console methods
 * that libraries often call internally (e.g. AsyncStorage warnings,
 * Reanimated initialisation messages).
 *
 * Originals are restored after each test file so individual tests
 * that intentionally spy on console still work.
 */

// ─── React Native Platform mock ─────────────────────────────────────────────
// jest-expo's preset mocks most of RN but Platform.select is not always wired.
// pdfService → statusUtils → constants/theme.ts calls Platform.select() at
// module-evaluation time, which crashes the suite if the mock is missing.
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: (obj: Record<string, unknown>) =>
    obj['android'] ?? obj['default'] ?? Object.values(obj)[0],
  Version: 0,
  isTesting: true,
  isTV: false,
}));

const _consoleError = console.error.bind(console);
const _consoleWarn  = console.warn.bind(console);

beforeAll(() => {
  // Suppress expected React Native / Expo warning noise in test output.
  // Remove specific strings here if you want a particular warning visible.
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    const suppressed = [
      'Warning:',
      'AsyncStorage',
      'Reanimated',
      'act(',
    ];
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
