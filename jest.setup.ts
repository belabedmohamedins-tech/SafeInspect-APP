/**
 * jest.setup.ts — LAYER 3 of the mock architecture
 *
 * Runs after the test framework is installed (setupFilesAfterEnv).
 * See jest.config.js for the full 4-layer mock architecture contract.
 *
 * RULE FOR THIS FILE:
 *   Only add mocks here when they CANNOT be handled by moduleNameMapper
 *   (Layer 2).  The canonical reason is: the mock needs jest.mock() hoisting
 *   semantics, or it must override something the preset already loaded.
 *
 *   ✅ OK here : react-native (Proxy), Platform, safe-area-context
 *   ❌ NOT here : native module stubs → use moduleNameMapper + __mocks__/
 *
 * Load order:
 *   1. jest.polyfill.js          — global fetch/Response via undici
 *   2. jest-expo preset          — @react-native/jest-preset component stubs
 *   3. THIS FILE (Layer 3)       — behavioral overrides
 *   4. each test file (Layer 4)  — domain-specific mocks
 *
 * Problem solved here:
 *   jest.mock('react-native', factory) where the factory calls
 *   jest.requireActual('react-native') triggers RN's full module graph
 *   synchronously, including Modal.js which reads Platform.OS before any
 *   Platform mock is in place → "Cannot read properties of undefined"
 *
 * Solution: return a purely synthetic object so requireActual is never called
 *   inside the factory.  jest-expo's preset already provides all component
 *   stubs (FlatList, ScrollView, Modal, …) that tests need.
 */

// ─── react-native-safe-area-context — global stub ────────────────────────────
//
// expo-router imports react-native-safe-area-context which calls
// TurboModuleRegistry.get synchronously at module-load time, before any
// per-test jest.mock() factory runs.  A global stub here ensures every
// test file gets a safe version (including useInspectionList.test.ts).
//
// Why Layer 3 and not Layer 2 (moduleNameMapper)?
//   Because jest-expo's preset registers its own transform for this package.
//   A moduleNameMapper entry would be ignored after the preset runs.
//   jest.mock() in setupFilesAfterEnv correctly overrides the preset.
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets:     jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  useSafeAreaFrame:      jest.fn(() => ({ x: 0, y: 0, width: 375, height: 812 })),
  SafeAreaProvider:      'SafeAreaProvider',
  SafeAreaView:          'SafeAreaView',
  SafeAreaConsumer:      'SafeAreaConsumer',
  SafeAreaInsetsContext: { Consumer: 'SafeAreaInsetsContext.Consumer' },
  initialWindowMetrics: {
    frame:  { x: 0, y: 0, width: 375, height: 812 },
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  },
}));

// ─── React Native — synthetic Platform mock (BOTH known import paths) ────────
//
// We mock the bare 'react-native' module WITHOUT calling requireActual to
// avoid the circular crash.  We provide only what our source + test files
// import.  Everything else (FlatList, ScrollView, etc.) comes from
// jest-expo's preset.
//
// Why Layer 3 and not Layer 2?
//   react-native is a virtual module synthesised by Metro/jest-expo.
//   moduleNameMapper cannot reliably intercept it after the preset runs.

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

// ─── React internal symbols that must return undefined/falsy ─────────────────
//
// When react-test-renderer or @testing-library/react-native traverses a
// component tree it reads internal Symbol keys ($$typeof, _context, _owner,
// etc.) on every object it encounters — including our mock exports.
// These must return `undefined` (falsy) so React does not mistake a mock
// object for a React element or context.  They must NOT throw.
//
// Any access to a plain string key that is NOT in the explicit stub list
// below will throw a descriptive error, forcing the developer to add an
// explicit stub rather than silently getting a jest.fn() that hides the gap.
const SAFE_FALSY_SYMBOLS = new Set([
  Symbol.iterator,
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.hasInstance,
  Symbol.isConcatSpreadable,
]);

// React reconciler internal string keys that must return undefined/falsy.
// These are accessed on every object during tree traversal — they are NOT
// RN API calls and must not throw.
const REACT_INTERNAL_KEYS = new Set([
  '$$typeof', '_context', '_owner', '_store', '_self', '_source',
  '__esModule', 'default', 'displayName', 'propTypes', 'defaultProps',
  'contextTypes', 'childContextTypes', 'getDerivedStateFromProps',
  'getDerivedStateFromError', 'contextType', 'prototype',
  'render', 'name', 'length', 'caller', 'arguments', 'toString',
  'valueOf', 'toJSON', '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED',
  'unstable_batchedUpdates', '__reactFiber', '__reactProps',
  'then', 'catch', 'finally', // Promise-like checks
]);

// Path used by application code: `import { Platform } from 'react-native'`
jest.mock('react-native', () => {
  const rnStubs: Record<string, unknown> = {
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
  };

  return new Proxy(rnStubs, {
    get(target, prop) {
      // 1. Known explicit stubs — always return the real value.
      if (typeof prop === 'string' && prop in target) return target[prop];

      // 2. React reconciler internals + JS built-ins — return undefined
      //    silently so React tree traversal never throws.
      if (typeof prop === 'symbol' && SAFE_FALSY_SYMBOLS.has(prop)) return undefined;
      if (typeof prop === 'string' && REACT_INTERNAL_KEYS.has(prop))  return undefined;

      // 3. Everything else — THROW so the missing stub is caught immediately.
      //    This prevents false-positive tests caused by a silent jest.fn()
      //    standing in for a real RN API that was never stubbed.
      throw new Error(
        `[jest.setup.ts] react-native — unstubbed access: "${String(prop)}"\n` +
        `Add an explicit stub for this key in the rnStubs object in jest.setup.ts.\n` +
        `Do NOT restore the catch-all jest.fn() fallback.`
      );
    },
  });
});

// ─── Console suppression ─────────────────────────────────────────────────────
// Suppress known noisy warnings from RN/Expo internals that are not test
// failures.  Real errors still surface.
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
