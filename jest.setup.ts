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
 *   ✅ OK here : react-native (Proxy), Platform, safe-area-context,
 *                renderHook defaultWrapper
 *   ❌ NOT here : native module stubs → use moduleNameMapper + __mocks__/
 *
 * Load order:
 *   1. jest.polyfill.js          — global polyfills before preset
 *   2. jest-expo preset          — @react-native/jest-preset component stubs
 *   3. THIS FILE (Layer 3)       — behavioral overrides
 *   4. each test file (Layer 4)  — domain-specific mocks
 */

import React from 'react';
import { configure } from '@testing-library/react-native';

// ─── renderHook global wrapper ────────────────────────────────────────────────
//
// @testing-library/react-native's renderHook renders the hook inside a real
// React component tree.  Without a root, result.current is undefined because
// the reconciler has no host to attach to.
//
// React.Fragment is the minimal valid root: it satisfies the reconciler without
// requiring any native context.  useFocusEffect is mocked at Layer 4 in every
// hook test file, so no real navigator context is needed here.
//
// Effect: every renderHook() call in every test file inherits this wrapper
// automatically — no per-call boilerplate required.
configure({
  defaultWrapper: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
});

// ─── react-native-safe-area-context — global stub ────────────────────────────
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

// ─── React Native — synthetic Platform mock ───────────────────────────────────
const PLATFORM = {
  OS:      'android' as const,
  select:  <T extends Record<string, unknown>>(spec: T): T[keyof T] =>
    (spec['android'] ?? spec['default'] ?? Object.values(spec)[0]) as T[keyof T],
  Version:   0,
  isTesting: true,
  isTV:      false,
};

jest.mock('react-native/Libraries/Utilities/Platform', () => PLATFORM);

// ─── React reconciler internal keys ──────────────────────────────────────────
//
// These are accessed on every object during React tree traversal.
// They must return undefined/falsy silently — they are NOT RN API calls.
//
// ⚠️  VERSIONING NOTE: last audited against React Native 0.76 / React 18.
// If tests start throwing "[jest.setup.ts] react-native — unstubbed access"
// for keys that look like React internals (e.g. __reactInternalMemoized*),
// add them here AND update the version note above.
const mockSafeFalsySymbols = new Set([
  Symbol.iterator,
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.hasInstance,
  Symbol.isConcatSpreadable,
]);

const mockReactInternalKeys = new Set([
  '$$typeof', '_context', '_owner', '_store', '_self', '_source',
  '__esModule', 'default', 'displayName', 'propTypes', 'defaultProps',
  'contextTypes', 'childContextTypes', 'getDerivedStateFromProps',
  'getDerivedStateFromError', 'contextType', 'prototype',
  'render', 'name', 'length', 'caller', 'arguments', 'toString',
  'valueOf', 'toJSON', '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED',
  'unstable_batchedUpdates', '__reactFiber', '__reactProps',
  'then', 'catch', 'finally', // Promise-like checks
]);

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
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
  };

  return new Proxy(rnStubs, {
    get(target, prop) {
      if (typeof prop === 'string' && prop in target) return target[prop];
      if (typeof prop === 'symbol' && mockSafeFalsySymbols.has(prop)) return undefined;
      if (typeof prop === 'string' && mockReactInternalKeys.has(prop))  return undefined;
      throw new Error(
        `[jest.setup.ts] react-native — unstubbed access: "${String(prop)}"\n` +
        `Add an explicit stub for this key in the rnStubs object in jest.setup.ts.\n` +
        `Do NOT restore the catch-all jest.fn() fallback.`
      );
    },
  });
});

// ─── Console suppression ──────────────────────────────────────────────────────
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
