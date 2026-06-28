/**
 * Global Jest setup — runs after the test framework is installed.
 *
 * Load order:
 *   1. jest.polyfill.js  (setupFiles)   — installs global fetch / TextEncoder
 *   2. jest-expo preset                 — loads @react-native/jest-preset,
 *      which mocks most RN components via mockComponent.js
 *   3. THIS FILE        (setupFilesAfterFramework) — runs last, can override
 *
 * Problem solved here:
 *   jest.mock('react-native', factory) where the factory calls
 *   jest.requireActual('react-native') triggers RN's full module graph
 *   synchronously, including Modal.js which reads Platform.OS before any
 *   Platform mock is in place → "Cannot read properties of undefined (reading 'OS')"
 *
 * Solution: return a purely synthetic object so requireActual is never called
 * inside the factory.  jest-expo's @react-native/jest-preset already provides
 * all the component stubs (FlatList, ScrollView, Modal, …) that tests need.
 */

// ─── Expo winter-fetch native module stub ────────────────────────────────────
jest.mock('expo/src/winter/fetch/ExpoFetchModule', () => ({
  fetch:    jest.fn(),
  Headers:  jest.fn(),
  Request:  jest.fn(),
  Response: jest.fn(),
}), { virtual: true });

// ─── React Native — synthetic Platform mock (BOTH known import paths) ────────
//
// We mock the bare 'react-native' module WITHOUT calling requireActual to avoid
// the circular crash.  We provide only what our source + test files import.
// Anything else (FlatList, ScrollView, etc.) comes from jest-expo's preset.

const PLATFORM = {
  OS:      'android' as const,
  select:  <T extends Record<string, unknown>>(spec: T): T[keyof T] =>
    (spec['android'] ?? spec['default'] ?? Object.values(spec)[0]) as T[keyof T],
  Version:   0,
  isTesting: true,
  isTV:      false,
};

// Path used by RN internals and jest-expo's resolver
jest.mock('react-native/Libraries/Utilities/Platform', () => PLATFORM);

// Path used by application code: `import { Platform } from 'react-native'`
// We extend jest-expo's auto-mock with a safe Platform override.
// Using jest.mock with a manual factory but WITHOUT requireActual stops
// the circular crash.  The factory returns a proxy-like object: everything
// maps to jest.fn() except Platform which we control.
jest.mock('react-native', () => {
  // jest-expo has already registered @react-native/jest-preset mocks;
  // we only need to surface Platform and a handful of primitives.
  // Other exports (View, Text, StyleSheet, etc.) are provided by
  // jest-expo's automocking layer automatically.
  return new Proxy(
    {
      Platform:   PLATFORM,
      StyleSheet: { create: (s: object) => s, flatten: (s: object) => s, hairlineWidth: 1 },
      I18nManager: { isRTL: false, forceRTL: jest.fn(), allowRTL: jest.fn() },
      Dimensions:  { get: jest.fn(() => ({ width: 375, height: 812 })), addEventListener: jest.fn(), removeEventListener: jest.fn() },
      Animated: {
        Value: jest.fn(() => ({ setValue: jest.fn(), interpolate: jest.fn(() => ({})) })),
        timing: jest.fn(() => ({ start: jest.fn() })),
        spring: jest.fn(() => ({ start: jest.fn() })),
        sequence: jest.fn(() => ({ start: jest.fn() })),
        parallel: jest.fn(() => ({ start: jest.fn() })),
        View: 'Animated.View',
        Text: 'Animated.Text',
        Image: 'Animated.Image',
        createAnimatedComponent: jest.fn((c: unknown) => c),
        event: jest.fn(),
        add: jest.fn(),
      },
      NativeModules: {},
      NativeEventEmitter: jest.fn(() => ({ addListener: jest.fn(), removeAllListeners: jest.fn() })),
      AppState: { addEventListener: jest.fn(), removeEventListener: jest.fn(), currentState: 'active' },
      Linking:  { openURL: jest.fn(), canOpenURL: jest.fn(), getInitialURL: jest.fn(), addEventListener: jest.fn() },
      Keyboard: { addListener: jest.fn(), removeAllListeners: jest.fn(), dismiss: jest.fn() },
      Alert:    { alert: jest.fn() },
      Share:    { share: jest.fn() },
      Vibration: { vibrate: jest.fn(), cancel: jest.fn() },
      PixelRatio: { get: jest.fn(() => 2), getFontScale: jest.fn(() => 1), getPixelSizeForLayoutSize: jest.fn((n: number) => n * 2), roundToNearestPixel: jest.fn((n: number) => n) },
      AccessibilityInfo: { isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)), addEventListener: jest.fn(), removeEventListener: jest.fn(), announceForAccessibility: jest.fn() },
      Appearance: { getColorScheme: jest.fn(() => 'light'), addChangeListener: jest.fn() },
      InteractionManager: { runAfterInteractions: jest.fn((cb: () => void) => { cb(); return { cancel: jest.fn() }; }) },
      // Components — returned as simple string tags (jest-expo's preset handles
      // the real mocked components; these cover direct imports in non-component tests)
      View:           'View',
      Text:           'Text',
      Image:          'Image',
      ScrollView:     'ScrollView',
      FlatList:       'FlatList',
      SectionList:    'SectionList',
      TouchableOpacity:     'TouchableOpacity',
      TouchableHighlight:   'TouchableHighlight',
      TouchableWithoutFeedback: 'TouchableWithoutFeedback',
      Pressable:      'Pressable',
      TextInput:      'TextInput',
      Modal:          'Modal',
      ActivityIndicator: 'ActivityIndicator',
      Switch:         'Switch',
      SafeAreaView:   'SafeAreaView',
      KeyboardAvoidingView: 'KeyboardAvoidingView',
      StatusBar:      { setBarStyle: jest.fn(), setBackgroundColor: jest.fn(), currentHeight: 24 },
    },
    {
      get(target: Record<string, unknown>, prop: string) {
        // Return known properties; for anything else return a jest.fn()
        // so imports don't crash even if we didn't list them explicitly.
        return prop in target ? target[prop] : jest.fn();
      },
    }
  );
});

// ─── Console suppression ─────────────────────────────────────────────────────
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
